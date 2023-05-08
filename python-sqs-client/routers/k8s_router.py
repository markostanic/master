import json

from fastapi import APIRouter, Response, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from kubernetes import config, dynamic, client
from kubernetes.client import ApiClient, CustomObjectsApi, ApiException
from kubernetes.dynamic.exceptions import DynamicApiError

from config.k8s_settings import K8sSettings
from dto.ScaleResource import ScaleResource
from service.sqs_service import get_queue

router = APIRouter(prefix="/api/v1/k8s", tags=["k8s"])

config.load_kube_config(context="minikube")

api_client = ApiClient(configuration=config.load_kube_config(context="minikube"))
dynamic_client = dynamic.DynamicClient(api_client)

k8s_settings = K8sSettings()


@router.get('/namespaces')
def get_namespaces():
    api = client.CoreV1Api()
    namespaces = list(filter(lambda n: n in k8s_settings.namespace_whitelist,
                             [namespace.metadata.name for namespace in api.list_namespace().items]))
    return JSONResponse(content=jsonable_encoder(namespaces))


@router.get('/namespaces/{namespace}/deployments')
def get_deployments(namespace: str):
    api = client.AppsV1Api()
    deployments = [deployment.metadata.name for deployment in api.list_namespaced_deployment(namespace).items]
    return JSONResponse(content=jsonable_encoder(deployments))


@router.get('/scaled-objects/{name}')
def get_scaled_object(name: str):
    custom_objects_api = CustomObjectsApi(api_client)
    try:
        namespace, deployment = [
            (custom_object.get('metadata').get('namespace'), custom_object.get('spec').get('scaleTargetRef').get('name')) for custom_object in
            custom_objects_api.list_cluster_custom_object(group="keda.sh", version="v1alpha1", plural="scaledobjects")
            .get('items') if custom_object.get('metadata').get('name') == name
        ].pop()
        content = {
            "namespace": namespace,
            "deployment": deployment
        }
        return JSONResponse(content=content)
    except IndexError:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=f'ScaledObject: {name} not found')


@router.post('/scaled-objects')
def create_scaled_object(scale_resource: ScaleResource):
    queue = get_queue(scale_resource.queue_name)
    api = dynamic_client.resources.get(api_version="keda.sh/v1alpha1", kind="ScaledObject")
    scaled_object_manifest = {
        "apiVersion": "keda.sh/v1alpha1",
        "kind": "ScaledObject",
        "metadata": {
            "name": f"{scale_resource.queue_name}-scaled-object",
            "namespace": scale_resource.namespace
        },
        "spec": {
            "scaleTargetRef": {
                "kind": "Deployment",
                "name": scale_resource.deployment
            },
            "minReplicaCount": scale_resource.min_replicas,
            "maxReplicaCount": scale_resource.max_replicas,
            "pollingInterval": scale_resource.polling_interval,
            "cooldownPeriod": scale_resource.cooldown_period,
            "triggers": [
                {
                    "type": "aws-sqs-queue",
                    "authenticationRef": {
                        "name": "keda-trigger-auth-aws-credentials"
                    },
                    "metadata": {
                        "queueURL": queue.url,
                        "awsEndpoint": k8s_settings.aws_sqs_endpoint,
                        "awsRegion": k8s_settings.aws_region,
                        "queueLength": str(scale_resource.queue_length),
                        "identityOwner": "pod",
                    }
                }
            ]
        }
    }
    try:
        r = api.create(scaled_object_manifest)
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=jsonable_encoder(r))
    except DynamicApiError as e:
        return Response(status_code=e.status, content=e.body)

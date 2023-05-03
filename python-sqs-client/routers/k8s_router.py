from kubernetes import config, dynamic, client
from kubernetes.client import api_client
from fastapi import APIRouter, Response
from service.sqs_service import get_queue
from dto.ScaleResource import ScaleResource
from config.k8s_settings import K8sSettings
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException

router = APIRouter(prefix="/api/v1/k8s", tags=["k8s"])

config.load_kube_config(context="minikube")

dynamic_client = dynamic.DynamicClient(api_client.ApiClient(configuration=config.load_kube_config(context="minikube")))

k8s_settings = K8sSettings()

@router.get('/namespaces')
def get_namespaces():
    api = client.CoreV1Api()
    namespaces = list(filter(lambda n: n in k8s_settings.namespace_whitelist,[namespace.metadata.name for namespace in api.list_namespace().items]))
    return JSONResponse(content=jsonable_encoder(namespaces))

@router.get('/namespaces/{namespace}/deployments')
def get_deployments(namespace: str):
    api = client.AppsV1Api()
    deployments = [deployment.metadata.name for deployment in api.list_namespaced_deployment(namespace).items]
    return JSONResponse(content=jsonable_encoder(deployments))
    

@router.post('/scaled-objects')
def create_scaled_object(scale_resource: ScaleResource):
    queue = get_queue(scale_resource.queue_name)
    api = dynamic_client.resources.get(api_version="keda.sh/v1alpha1", kind="ScaledObject")
    scaled_object_manifest = {
        "apiVersion": "keda.sh/v1alpha1",
        "kind": "ScaledObject",
        "metadata": {
            "name": f"{scale_resource.queue_name}-scaled-object",
            "namespace": "apps-dev"
        },
        "spec": {
            "scaleTargetRef": {
                "kind": "Deployment",
                "name": scale_resource.deployment
            },
            "minReplicaCount": scale_resource.min_replicas,
            "maxReplicaCount": scale_resource.max_replicas,
            "pollingInterval": scale_resource.polling_interval,
            "cooldownPeriod": scale_resource.cooldownPeriod,
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
        return JSONResponse(content=jsonable_encoder(r))
    except Exception as e:
        return Response(status_code=e.status, content=e.body)
from fastapi import APIRouter, Response, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from kubernetes import config, dynamic, client
from kubernetes.client import ApiClient, CustomObjectsApi, ApiException
from kubernetes.dynamic.exceptions import DynamicApiError

from config.k8s_settings import K8sSettings
from dto.ErrorMesasge import ErrorMessage
from dto.Hpa import Hpa
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
    apps_api = client.AppsV1Api()
    deployments = [deployment.metadata.name for deployment in apps_api.list_namespaced_deployment(namespace).items]
    return JSONResponse(content=jsonable_encoder(deployments))


@router.get('/namespaces/{namespace}/hpa/{hpa_name}')
def get_hpa(namespace: str, hpa_name: str):
    api_instance = client.AutoscalingV1Api()
    try:
        hpa = api_instance.read_namespaced_horizontal_pod_autoscaler(name=hpa_name, namespace=namespace)
        response_data = Hpa(hpa.status.current_replicas, hpa.spec.min_replicas, hpa.spec.max_replicas)
        return JSONResponse(content=jsonable_encoder(response_data))
    except ApiException as e:
        return JSONResponse(status_code=e.status, content=e.body)


@router.get('/scaled-objects/{name}')
def get_scaled_object(name: str):
    custom_objects_api = CustomObjectsApi(api_client)
    try:
        namespace, deployment, min_replica_count, max_replica_count, polling_interval, cooldown_period, queue_length = [
            (
                custom_object.get('metadata').get('namespace'),
                custom_object.get('spec').get('scaleTargetRef').get('name'),
                custom_object.get('spec').get('minReplicaCount'),
                custom_object.get('spec').get('maxReplicaCount'),
                custom_object.get('spec').get('pollingInterval'),
                custom_object.get('spec').get('cooldownPeriod'),
                custom_object.get('spec').get('triggers')[0].get('metadata').get("queueLength"),

            )
            for custom_object in
            custom_objects_api.list_cluster_custom_object(group="keda.sh", version="v1alpha1", plural="scaledobjects")
            .get('items') if custom_object.get('metadata').get('name') == name
        ].pop()
        content = {
            "namespace": namespace,
            "deployment": deployment,
            "minReplicas": min_replica_count,
            "maxReplicas": max_replica_count,
            "pollingInterval": polling_interval,
            "cooldownPeriod": cooldown_period,
            "queueLength": queue_length
        }
        return JSONResponse(content=content)
    except IndexError:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=f'ScaledObject: {name} not found')


@router.patch('/scaled-objects')
def patch_scaled_object(scale_resource: ScaleResource):
    print(scale_resource)
    custom_objects_api = CustomObjectsApi(api_client)
    try:
        custom_objects_api.patch_namespaced_custom_object(
            group='keda.sh',
            version='v1alpha1',
            namespace=scale_resource.namespace,
            plural='scaledobjects',
            name=f"{scale_resource.queue_name}-scaled-object",
            body={"spec": {
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
                            "queueURL": get_queue(scale_resource.queue_name).url,
                            "awsEndpoint": k8s_settings.aws_sqs_endpoint,
                            "awsRegion": k8s_settings.aws_region,
                            "queueLength": str(scale_resource.queue_length),
                            "identityOwner": "pod",
                        }
                    }
                ]
            }
            }
        )
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ApiException as e:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=e.body)


@router.post('/scaled-objects')
def create_scaled_object(scale_resource: ScaleResource):
    apps_api = client.AppsV1Api()

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
        if not scale_resource.deployment:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,
                                content={"message": "Deployment cannot be empty"})
        apps_api.read_namespaced_deployment(namespace=scale_resource.namespace, name=scale_resource.deployment)
        r = api.create(scaled_object_manifest)
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=jsonable_encoder(r))
    except DynamicApiError as e:
        return Response(status_code=e.status, content=e.body)
    except ValueError as e:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=jsonable_encoder(ErrorMessage(str(e))))
    except ApiException as e:
        return JSONResponse(status_code=e.status, content=e.body)
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=e)


@router.delete('/scaled-objects/{name}')
def delete_scaled_object(name: str):
    custom_objects_api = CustomObjectsApi(api_client)
    try:
        namespace = [
            custom_object.get('metadata').get('namespace') for custom_object in
            custom_objects_api.list_cluster_custom_object(group="keda.sh", version="v1alpha1", plural="scaledobjects")
            .get('items') if custom_object.get('metadata').get('name') == name
        ].pop()
        custom_objects_api.delete_namespaced_custom_object(group="keda.sh", version="v1alpha1", namespace=namespace,
                                                           plural="scaledobjects", name=name)
    except IndexError:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=f'ScaledObject: {name} not found')

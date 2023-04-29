from kubernetes import config, dynamic
from kubernetes.client import api_client
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/k8s", tags=["k8s"])

config.load_kube_config(context="minikube")

client = dynamic.DynamicClient(api_client.ApiClient(configuration=config.load_kube_config(context="minikube")))

@router.get('/')
def get_deployment():
  api = client.resources.get(kind="Deployment")
  deployment = api.get(name="node-sqs-client-node-app-chart", namespace="apps-dev")
  print(deployment)

@router.post('/scaled-object')
def create_scaled_object():
  api = client.resources.get(api_version="keda.sh/v1alpha1", kind="ScaledObject")
  scaled_object_manifest = {
    "apiVersion": "keda.sh/v1alpha1",
    "kind": "ScaledObject"
  }
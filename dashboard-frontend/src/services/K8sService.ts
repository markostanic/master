import ApiClient from "./ApiClient";

const getNamespaces = () => {
  return ApiClient.get<string[]>("/k8s/namespaces");
};

const getDeployments = (namespace: string) => {
  return ApiClient.get<string[]>(`/k8s/namespaces/${namespace}/deployments`);
};

const createScaledObject = (payload: ScaledObjectPayload) => {
  return ApiClient.post("/k8s/scaled-objects", payload);
};

const K8sService = {
  getNamespaces,
  getDeployments,
  createScaledObject,
};

export default K8sService;

import { ScaledObjectPayload } from "../models/ScaledObjectPayload";
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

const patchScaledObject = (payload: ScaledObjectPayload) => {
  return ApiClient.patch("/k8s/scaled-objects", payload);
};

const getScaledObject = (name: string) => {
  return ApiClient.get<ScaledObjectPayload>(`/k8s/scaled-objects/${name}`);
};

const removeScaledObject = (name: string) => {
  return ApiClient.delete(`/k8s/scaled-objects/${name}`);
};

const getHpa = (namespace: string, queueName: string) => {
  const hpa = `keda-hpa-${queueName}-scaled-object`;
  return ApiClient.get<Hpa>(`/k8s/namespaces/${namespace}/hpa/${hpa}`);
};

const K8sService = {
  getNamespaces,
  getDeployments,
  createScaledObject,
  patchScaledObject,
  getScaledObject,
  removeScaledObject,
  getHpa,
};

export default K8sService;

export class ScaledObjectPayload {
  queueName: string;
  namespace: string;
  deployment: string;
  minReplicas: number;
  maxReplicas: number;
  pollingInterval: number;
  cooldownPeriod: number;
  queueLength: number;

  constructor(
    queueName: string,
    namespace: string,
    deployment: string,
    minReplicas: number = 0,
    maxReplicas: number,
    pollingInterval: number = 10,
    cooldownPeriod: number = 25,
    queueLength: number
  ) {
    this.queueName = queueName;
    this.namespace = namespace;
    this.deployment = deployment;
    this.minReplicas = minReplicas;
    this.maxReplicas = maxReplicas;
    this.pollingInterval = pollingInterval;
    this.cooldownPeriod = cooldownPeriod;
    this.queueLength = queueLength;
  }
}

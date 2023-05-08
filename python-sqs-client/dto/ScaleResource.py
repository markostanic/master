from pydantic import BaseModel, Field


class ScaleResource(BaseModel):
    queue_name: str = Field(alias="queueName")
    namespace: str
    deployment: str
    min_replicas: int = Field(default=0, alias="minReplicas")
    max_replicas: int = Field(alias="maxReplicas")
    polling_interval: int = Field(default=30, alias="pollingInterval")
    cooldown_period: int = Field(default=25, alias="cooldownPeriod")
    queue_length: int = Field(alias="queueLength")

from pydantic import BaseModel


class ScaleResource(BaseModel):
    queue_name: str
    deployment: str
    min_replicas: int = 0
    max_replicas: int
    polling_interval: int = 10
    cooldownPeriod: int = 25
    queue_length: int

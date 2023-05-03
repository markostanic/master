from pydantic import BaseSettings


class K8sSettings(BaseSettings):
    namespace_whitelist: list
    aws_sqs_endpoint: str
    aws_region: str

    class Config:
        env_file = ".env"

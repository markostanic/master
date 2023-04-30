from pydantic import BaseSettings


class K8sSettings(BaseSettings):
    namespace_whitelist: list

    class Config:
        env_file = ".env"

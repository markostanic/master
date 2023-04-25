from pydantic import BaseSettings


class Settings(BaseSettings):
    sqs_base_url: str
    region_name: str
    aws_secret_access_key: str
    aws_access_key_id: str
    use_ssl: bool
    allow_origins: str

    class Config:
        env_file = ".env"

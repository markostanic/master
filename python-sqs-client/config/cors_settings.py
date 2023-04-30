from pydantic import BaseSettings


class CorsSettings(BaseSettings):
    allow_origins: str

    class Config:
        env_file = ".env"

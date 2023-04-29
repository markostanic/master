from fastapi import FastAPI
from config.settings import Settings
from fastapi.middleware.cors import CORSMiddleware
from routers import sqs_router, k8s_router

app = FastAPI()
settings = Settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sqs_router.router)
app.include_router(k8s_router.router)

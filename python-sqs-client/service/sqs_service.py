import boto3
from fastapi import HTTPException

from config.aws_settings import AwsSettings

settings = AwsSettings()

sqs_resource = boto3.resource('sqs',
                              endpoint_url=settings.sqs_base_url,
                              region_name=settings.region_name,
                              aws_secret_access_key=settings.aws_secret_access_key,
                              aws_access_key_id=settings.aws_access_key_id,
                              use_ssl=settings.use_ssl)


def get_queue(queue_name: str):
    try:
        return sqs_resource.get_queue_by_name(QueueName=queue_name)
    except:
        raise HTTPException(status_code=404, detail=f"Queue {queue_name} does not exist")

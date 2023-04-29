import boto3
from fastapi import HTTPException, Query, status, Response,APIRouter
from model.QueueInfo import QueueInfo
from typing import List
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from config.settings import Settings
from helpers.RandomGenerator import get_random_string

settings = Settings()

router = APIRouter(prefix="/api/v1/queues",tags=["queues"])

sqs_resource = boto3.resource('sqs',
                              endpoint_url=settings.sqs_base_url,
                              region_name=settings.region_name,
                              aws_secret_access_key=settings.aws_secret_access_key,
                              aws_access_key_id=settings.aws_access_key_id,
                              use_ssl=settings.use_ssl)


def get_gueue(queue_name: str):
    try:
        return sqs_resource.get_queue_by_name(QueueName=queue_name)
    except:
        raise HTTPException(status_code=404, detail=f"Queue {queue_name} does not exist")


@router.get('/', response_model=List[QueueInfo])
def get_queues():
    queues = [QueueInfo(q.url, q.attributes) for q in sqs_resource.queues.all()]
    return JSONResponse(content=jsonable_encoder(queues))


@router.get('/{queue_name}')
def get_queue_by_id(queue_name):
    queue = get_gueue(queue_name)
    queue_info = QueueInfo(queue.url, queue.attributes)
    return JSONResponse(content=jsonable_encoder(queue_info))


# TODO: Add queue attributes in request body
@router.post('/{queue_name}')
def create_queue(queue_name):
    response = sqs_resource.create_queue(QueueName=queue_name)
    queue_info = QueueInfo(response.url, response.attributes)
    return JSONResponse(status_code=201, content=jsonable_encoder(queue_info))


@router.delete('/{queue_name}', status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_queue(queue_name):
    queue = get_gueue(queue_name)
    queue.delete()


@router.post('/messages/generate', status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def generate_messages(queue: QueueInfo, number_of_messages: int = Query(alias='number-of-messages', default=0),
                      message_length: int = 10):
    q = sqs_resource.Queue(queue.url)
    for _ in range(number_of_messages):
        q.send_message(MessageBody=get_random_string(message_length))


@router.post('/{queue_name}/messages/generate', status_code=status.HTTP_204_NO_CONTENT,
          response_class=Response)
def generate_messages(queue_name, number_of_messages: int = Query(alias='number-of-messages', default=0),
                      message_length: int = 10):
    queue = get_gueue(queue_name)
    for _ in range(number_of_messages):
        queue.send_message(MessageBody=get_random_string(message_length))


@router.patch('/{queue_name}/purge', status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def purge_queue(queue_name):
    queue = get_gueue(queue_name)
    queue.purge()

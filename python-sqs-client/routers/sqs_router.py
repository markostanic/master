from typing import List

from fastapi import Query, status, Response, APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from dto.ErrorMesasge import ErrorMessage
from service.sqs_service import get_queue, sqs_resource
from helpers.RandomGenerator import get_random_string
from model.QueueInfo import QueueInfo

router = APIRouter(prefix="/api/v1/queues", tags=["queues"])


@router.get('/', response_model=List[QueueInfo])
def get_queues():
    queues = [QueueInfo(q.url, q.attributes) for q in sqs_resource.queues.all()]
    return JSONResponse(content=jsonable_encoder(queues))


@router.get('/{queue_name}')
def get_queue_by_id(queue_name):
    queue = get_queue(queue_name)
    queue_info = QueueInfo(queue.url, queue.attributes)
    return JSONResponse(content=jsonable_encoder(queue_info))


# TODO: Add queue attributes in request body
@router.post('/{queue_name}')
def create_queue(queue_name):
    try:
        sqs_resource.get_queue_by_name(QueueName=queue_name)
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content=jsonable_encoder(ErrorMessage(f"Queue with name {queue_name} already exists")))
    except Exception as e:
        response = sqs_resource.create_queue(QueueName=queue_name)
        print(e)
        queue_info = QueueInfo(response.url, response.attributes)
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=jsonable_encoder(queue_info))


@router.delete('/{queue_name}', status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_queue(queue_name):
    queue = get_queue(queue_name)
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
    queue = get_queue(queue_name)
    for _ in range(number_of_messages):
        queue.send_message(MessageBody=get_random_string(message_length))


@router.patch('/{queue_name}/purge', status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def purge_queue(queue_name):
    queue = get_queue(queue_name)
    queue.purge()

import { AxiosResponse } from "axios";
import ErrorMessage from "../models/ErrorResponse";
import Queue from "../models/Queue";
import ApiClient from "./ApiClient";

const getAllQueues = () => {
  return ApiClient.get<Queue[]>("/queues");
};

const getQueueByName = (queueName: string) => {
  return ApiClient.get<Queue>(`/queues/${queueName}`);
};

const addMessages = (queueName: string, numberOfMessages: number) => {
  const queryParams = {
    "number-of-messages": numberOfMessages,
  };
  return ApiClient.post(
    `/queues/${queueName}/messages/generate`,
    {},
    { params: queryParams }
  );
};

const purgeQueue = (queueName: string) => {
  return ApiClient.patch(`/queues/${queueName}/purge`);
};

const removeQueue = (queueName: string) => {
  return ApiClient.delete(`/queues/${queueName}`);
};

const createQueue = (queueName: string) => {
  return ApiClient.post<Queue>(`/queues/${queueName}`);
};

const QueueService = {
  getAllQueues,
  addMessages,
  purgeQueue,
  getQueueByName,
  removeQueue,
  createQueue,
};

export default QueueService;

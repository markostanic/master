import Queue from "../models/Queue";
import QueueClient from "./QueueClient";

const getAllQueues = () => {
  return QueueClient.get<Queue[]>("/queues");
};

const getQueueByName = (queueName: string) => {
  return QueueClient.get<Queue>(`/queues/${queueName}`);
};

const addMessages = (queueName: string, numberOfMessages: number) => {
  const queryParams = {
    "number-of-messages": numberOfMessages,
  };
  return QueueClient.post(
    `/queues/${queueName}/messages/generate`,
    {},
    { params: queryParams }
  );
};

const purgeQueue = (queueName: string) => {
  return QueueClient.patch(`/queues/${queueName}/purge`);
};

const removeQueue = (queueName: string) => {
  return QueueClient.delete(`/queues/${queueName}`);
};

const QueueService = {
  getAllQueues,
  addMessages,
  purgeQueue,
  getQueueByName,
  removeQueue,
};

export default QueueService;

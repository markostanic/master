import Queue from "../models/Queue";

export interface QueueProps {
  queue: Queue;
}

export interface QueueMenuProps {
  queueName: string | undefined;
  queueUrl: string;
}

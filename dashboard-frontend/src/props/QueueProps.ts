import Queue from "../models/Queue";

export interface QueueProps {
  queue: Queue;
  selected: boolean;
  handleSelect  : (queueUrl: string) => void;
}

export interface QueueMenuProps {
  queueName: string | undefined;
  queueUrl: string;
}

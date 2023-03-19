import { createContext } from "react";
import Queue from "../models/Queue";

export interface IQueueOperations {
  updateQueue: (queueName: string) => void;
  removeQueue: (queueUrl: string) => void;
  addQueue: (queue: Queue) => void;
}

const QueueContext = createContext<IQueueOperations>({
  updateQueue: () => {},
  removeQueue: () => {},
  addQueue: () => {},
});

export default QueueContext;

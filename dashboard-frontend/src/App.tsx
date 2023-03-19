import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./App.css";
import QueuesTable from "./components/QueuesTable";
import Queue from "./models/Queue";
import QueueService from "./services/QueueService";
import QueueContext, { IQueueOperations } from "./contexts/QueueContext";

export const UpdateQueueContext = createContext<(queueName: string) => void>(
  () => {}
);

function App() {
  const [queues, setQueues] = useState<Queue[]>([]);

  useEffect(() => {
    QueueService.getAllQueues().then((response) => {
      setQueues(response.data);
    });
  }, [queues]);

  const updateQueue = useCallback(
    (queueName: string) => {
      QueueService.getQueueByName(queueName).then((response) => {
        const updated = queues.map((queue) =>
          queue.url === response.data.url ? response.data : queue
        );
        setQueues(updated);
      });
    },
    [queues]
  );

  const removeQueue = useCallback(
    (queueUrl: string) => {
      const updated = queues.filter((queue) => queue.url !== queueUrl);
      setQueues(updated);
    },
    [queues]
  );

  const addQueue = useCallback(
    (queue: Queue) => {
      const updated = [...queues, queue];
      setQueues(updated);
    },
    [queues]
  );

  const queueOperations: IQueueOperations = useMemo(() => {
    return {
      updateQueue,
      removeQueue,
      addQueue,
    };
  }, [queues]);

  return (
    <div className="App">
      <QueueContext.Provider value={queueOperations}>
        <QueuesTable queues={queues} />
      </QueueContext.Provider>
    </div>
  );
}

export default App;

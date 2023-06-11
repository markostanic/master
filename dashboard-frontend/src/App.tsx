import {
  SyntheticEvent,
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
import SnackbarContent, {
  SnackbarNotification,
} from "./contexts/SnackbarContext";
import NewQueue from "./components/NewQueue";
import { Alert, AlertColor, Snackbar } from "@mui/material";
import AlertState from "./models/AlertState";

function App() {
  const [queues, setQueues] = useState<Queue[]>([]);

  const [alert, setAlert] = useState<AlertState>({
    shown: false,
    severity: "info",
    message: "",
  });

  useEffect(() => {
    QueueService.getAllQueues().then((response) => {
      setQueues(response.data);
    });
  }, []);

  const closeSnackbar = (
    _event: Event | SyntheticEvent<any, Event>,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setAlert((prevState) => {
      return {
        ...prevState,
        shown: false,
      };
    });
  };

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
      setQueues((prevState) => {
        return prevState.filter((queue) => queue.url !== queueUrl);
      });
    },
    [queues]
  );

  const addQueue = useCallback(
    (queue: Queue) => {
      setQueues((prevState) => {
        return [...prevState, queue];
      });
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

  const snackbarOperations: SnackbarNotification = useMemo(() => {
    return {
      setAlert,
    };
  }, [alert]);

  return (
    <div className="App">
      <QueueContext.Provider value={queueOperations}>
        <SnackbarContent.Provider value={snackbarOperations}>
          <NewQueue />
          <QueuesTable queues={queues} />

          <Snackbar
            open={alert.shown}
            autoHideDuration={3000}
            onClose={closeSnackbar}
          >
            <Alert severity={alert.severity}>{alert.message}</Alert>
          </Snackbar>
        </SnackbarContent.Provider>
      </QueueContext.Provider>
    </div>
  );
}

export default App;

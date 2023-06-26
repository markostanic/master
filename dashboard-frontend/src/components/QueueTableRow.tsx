import {
  IconButton,
  TableCell,
  TableRow,
  Collapse,
  Box,
  Typography,
  Table,
  TableBody,
  TextField,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { QueueProps } from "../props/QueueProps";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import QueueMenu from "./QueueMenu";
import QueueService from "../services/QueueService";
import QueueContext from "../contexts/QueueContext";
import K8sService from "../services/K8sService";
import ScaledObjectContext from "../contexts/ScaledObjectContext";
import { ScaledObjectPayload } from "../models/ScaledObjectPayload";

const QueueTableRow = ({ queue }: QueueProps) => {
  /**
   * TableRow State
   */
  const [open, setOpen] = useState(false);
  const [scaledObject, setScaledObject] = useState<
    ScaledObjectPayload | undefined
  >();
  const [messages, setMessages] = useState<number | undefined>(undefined);
  const [hpa, setHpa] = useState<Hpa | undefined>();

  const queueOperations = useContext(QueueContext);

  /**
   * TableRow Memo
   */

  const queueName: string | undefined = useMemo(() => {
    return queue.url.split("/").pop();
  }, []);

  const progressValue = useMemo(() => {
    if (!hpa) return 0;
    const value = (hpa.replicas / (hpa.maxPods - hpa.minPods + 1)) * 100;
    return value;
  }, [hpa]);

  /**
   * Component Lifecycle
   */

  useEffect(() => {
    if (scaledObject?.namespace && queueName) {
      const fetchHpaData = () => {
        K8sService.getHpa(scaledObject.namespace, queueName)
          .then((response) => setHpa(response.data))
          .catch((_error) => {
            setScaledObject(undefined);
            setHpa(undefined);
          });
      };
      fetchHpaData();
      const intervalId = setInterval(fetchHpaData, 5000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [scaledObject, queueName]);

  useEffect(() => {
    K8sService.getScaledObject(`${queueName}-scaled-object`)
      .then((response) => {
        setScaledObject(response.data);
      })
      .catch((_error) => {
        setScaledObject(undefined);
        setHpa(undefined);
      });
  }, [queueName]);

  const addMessages = useCallback(() => {
    if (queueName && messages)
      QueueService.addMessages(queueName, messages).then((_) => {
        queueOperations.updateQueue(queueName);
        setMessages(0);
      });
  }, [messages]);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      addMessages();
    },
    [messages]
  );

  return (
    <ScaledObjectContext.Provider value={{ scaledObject, setScaledObject }}>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {queueName}
        </TableCell>
        <TableCell align="right">
          {queue.attributes.ApproximateNumberOfMessages}
        </TableCell>
        <TableCell align="right">
          {queue.attributes.ApproximateNumberOfMessagesDelayed}
        </TableCell>
        <TableCell align="right">
          {queue.attributes.ApproximateNumberOfMessagesNotVisible}
        </TableCell>

        <TableCell>
          <form onSubmit={submit}>
            <TextField
              type="number"
              value={messages || ""}
              onChange={(e) => setMessages(+e.target.value)}
            />
          </form>
        </TableCell>

        <TableCell>
          <Tooltip title={`${hpa?.replicas}/${hpa?.maxPods}`}>
            {hpa ? (
              <LinearProgress variant="determinate" value={progressValue} />
            ) : (
              <></>
            )}
          </Tooltip>
        </TableCell>

        <TableCell>
          <QueueMenu queueUrl={queue.url} queueName={queueName} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Attributes
              </Typography>
              <Table size="small">
                <TableBody>
                  {Object.entries(queue.attributes).map((entry) => (
                    <TableRow key={entry[0]}>
                      <TableCell>{entry[0]}</TableCell>
                      <TableCell>{entry[1]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </ScaledObjectContext.Provider>
  );
};

export default QueueTableRow;

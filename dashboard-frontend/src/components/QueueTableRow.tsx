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
} from "@mui/material";
import { FormEvent, useCallback, useContext, useMemo, useState } from "react";
import { QueueProps } from "../props/QueueProps";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import QueueMenu from "./QueueMenu";
import QueueService from "../services/QueueService";
import QueueContext from "../contexts/QueueContext";

const QueueTableRow = ({ queue, selected, handleSelect }: QueueProps) => {
  const [open, setOpen] = useState(false);

  const queueName: string | undefined = useMemo(() => {
    return queue.url.split("/").pop();
  }, []);

  const [messages, setMessages] = useState<number | undefined>(undefined);

  const queueOperations = useContext(QueueContext);

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
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        selected={selected}
        onClick={() => handleSelect(queue.url)}
      >
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
              <Table size="small" aria-label="purchases">
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
    </>
  );
};

export default QueueTableRow;

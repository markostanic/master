import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCallback, useState } from "react";
import QueueService from "../services/QueueService";

const NewQueue = () => {
  const [queueName, setQueueName] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const submit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();

      if (!queueName) {
        setError(true);
        return;
      }
      QueueService.createQueue(queueName).then((_) => setQueueName(""));
    },
    [queueName]
  );

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>New Queue</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <form onSubmit={submit}>
          <TextField
            error={error}
            helperText={error && "Queue name is required"}
            label="Name"
            value={queueName}
            onChange={(e) => {
              setError(!e.target.value);
              setQueueName(e.target.value);
            }}
            variant="standard"
          />
        </form>
      </AccordionDetails>
    </Accordion>
  );
};

export default NewQueue;

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCallback, useContext, useState } from "react";
import QueueService from "../services/QueueService";
import QueueContext from "../contexts/QueueContext";
import SnackbarNotificationContext from "../contexts/SnackbarContext";

const NewQueue = () => {
  const queueOperations = useContext(QueueContext);
  const SnackbarNotification = useContext(SnackbarNotificationContext);

  const [queueName, setQueueName] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const submit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();

      if (!queueName) {
        setError(true);
        return;
      }
      QueueService.createQueue(queueName)
        .then((response) => {
          setQueueName("");
          queueOperations.addQueue(response.data);
          SnackbarNotification.setAlert({
            shown: true,
            severity: "info",
            message: "Queue successfully created",
          });
        })
        .catch((error) => {
          SnackbarNotification.setAlert({
            shown: true,
            severity: "error",
            message: error.response.data.message,
          });
        });
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

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { ScaledObjectPayload } from "../models/ScaledObjectPayload";
import {
  useCallback,
  useState,
  useMemo,
  useEffect,
  SetStateAction,
  SyntheticEvent,
} from "react";
import K8sService from "../services/K8sService";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertColor,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";

interface ScalerDialogProps {
  queueName: string;
  open: boolean;
  closeDialog: () => void;
}

interface AlertState {
  shown: boolean;
  severity: AlertColor;
  message: string;
}

const CreateScalerDialog = ({
  queueName,
  open,
  closeDialog,
}: ScalerDialogProps) => {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [deployments, setDeployments] = useState<string[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<string>("");
  const [minReplicas, setMinReplicas] = useState<number>(0);
  const [maxReplicas, setMaxReplicas] = useState<number>(1);
  const [pollingInterval, setPollingInterval] = useState<number>(10);
  const [cooldownPeriod, setCooldownperiod] = useState<number>(25);
  const [queueLength, setQueueLength] = useState<number>(1);

  const [alert, setAlert] = useState<AlertState>({
    shown: false,
    severity: "info",
    message: "",
  });

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setNamespaces((await K8sService.getNamespaces()).data);
      };
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (selectedNamespace) {
      K8sService.getDeployments(selectedNamespace).then((response) => {
        setDeployments(response.data);
      });
    }
  }, [selectedNamespace]);

  const selectChange = useCallback(
    (
      event: SelectChangeEvent,
      setter: (action: SetStateAction<string>) => void
    ) => setter(event.target.value as string),
    [namespaces, deployments]
  );

  const namespaceItems = useMemo(() => {
    return namespaces.map((namespace) => (
      <MenuItem key={namespace} value={namespace}>
        {namespace}
      </MenuItem>
    ));
  }, [namespaces]);

  const deplymentItems = useMemo(() => {
    return deployments.map((deployment) => (
      <MenuItem key={deployment} value={deployment}>
        {deployment}
      </MenuItem>
    ));
  }, [selectedNamespace, deployments]);

  const submitForm = useCallback(() => {
    const payload = new ScaledObjectPayload(
      queueName,
      selectedNamespace,
      selectedDeployment,
      minReplicas,
      maxReplicas,
      pollingInterval,
      cooldownPeriod,
      queueLength
    );
    K8sService.createScaledObject(payload)
      .then((response) => {
        closeDialog();
        setAlert({
          shown: true,
          severity: "info",
          message: "ScaledObject successfully created",
        });
      })
      .catch((error) => {
        setAlert({
          shown: true,
          severity: "error",
          message: error.response.data.message,
        });
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

  return (
    <>
      <Dialog open={open} onClose={closeDialog}>
        <DialogTitle>Create KEDA ScaledObject</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here.
            We will send updates occasionally.
          </DialogContentText>
          <form onSubmit={submitForm}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Namespace</InputLabel>
              <Select
                value={selectedNamespace}
                label="Namespace"
                onChange={(e) => selectChange(e, setSelectedNamespace)}
              >
                {namespaceItems}
              </Select>
            </FormControl>
            {selectedNamespace && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Deployment</InputLabel>
                <Select
                  value={selectedDeployment}
                  label="Deployment"
                  onChange={(e) => selectChange(e, setSelectedDeployment)}
                >
                  {deplymentItems}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth margin="normal">
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <TextField
                  fullWidth
                  type="number"
                  value={minReplicas}
                  onChange={(e) => setMinReplicas(+e.target.value)}
                  label="Min replicas"
                />
                <TextField
                  fullWidth
                  type="number"
                  value={maxReplicas}
                  onChange={(e) => setMaxReplicas(+e.target.value)}
                  label="Max replicas"
                />
                <Tooltip
                  title="Number of messages one instance can handle"
                  arrow
                >
                  <TextField
                    fullWidth
                    type="number"
                    value={queueLength}
                    onChange={(e) => setQueueLength(+e.target.value)}
                    label="Queue length"
                  />
                </Tooltip>
              </Stack>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <Accordion>
                <AccordionSummary>Additional settings</AccordionSummary>
                <AccordionDetails>
                  <Stack
                    direction="row"
                    justifyContent={"space-between"}
                    spacing={2}
                  >
                    <Tooltip title="Interval to check queue length" arrow>
                      <TextField
                        fullWidth
                        type="number"
                        value={pollingInterval}
                        onChange={(e) => setPollingInterval(+e.target.value)}
                        label="Polling interval"
                      />
                    </Tooltip>
                    <Tooltip
                      title="The period to wait after the last trigger reported active before scaling the resource back to 0"
                      arrow
                    >
                      <TextField
                        fullWidth
                        type="number"
                        value={cooldownPeriod}
                        onChange={(e) => setCooldownperiod(+e.target.value)}
                        label="Cooldown period"
                      />
                    </Tooltip>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={submitForm}>Submit</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={alert.shown}
        autoHideDuration={3000}
        onClose={closeSnackbar}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </>
  );
};

export default CreateScalerDialog;

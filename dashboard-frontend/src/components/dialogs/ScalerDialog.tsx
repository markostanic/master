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
import { ScaledObjectPayload } from "../../models/ScaledObjectPayload";
import {
  useCallback,
  useState,
  useMemo,
  useEffect,
  SetStateAction,
  useContext,
} from "react";
import K8sService from "../../services/K8sService";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Tooltip,
} from "@mui/material";
import SnackbarNotificationContext from "../../contexts/SnackbarContext";
import DialogProps from "../../models/DialogProps";
import ScaledObjectContext from "../../contexts/ScaledObjectContext";

const CreateScalerDialog = ({ queueName, open, closeDialog }: DialogProps) => {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [deployments, setDeployments] = useState<string[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<string>("");
  const [minReplicas, setMinReplicas] = useState<number>(0);
  const [maxReplicas, setMaxReplicas] = useState<number>(1);
  const [pollingInterval, setPollingInterval] = useState<number>(10);
  const [cooldownPeriod, setCooldownperiod] = useState<number>(25);
  const [queueLength, setQueueLength] = useState<number>(1);

  const scaledObjectContext = useContext(ScaledObjectContext);
  const SnackbarNotification = useContext(SnackbarNotificationContext);

  useEffect(() => {
    if (open) {
      if (scaledObjectContext?.scaledObject) {
        const scaledObject = scaledObjectContext.scaledObject;
        setNamespaces([scaledObject.namespace]);
        setDeployments([scaledObject.deployment]);
        setSelectedNamespace(scaledObject.namespace);
        setSelectedDeployment(scaledObject.deployment);
        setMinReplicas(scaledObject.minReplicas);
        setMaxReplicas(scaledObject.maxReplicas);
        setPollingInterval(scaledObject.pollingInterval);
        setCooldownperiod(scaledObject.cooldownPeriod);
        setQueueLength(scaledObject.cooldownPeriod);
      } else {
        K8sService.getNamespaces().then((responseNamespaces) => {
          setNamespaces(responseNamespaces.data);
        });
      }
    }
  }, [open, queueName, scaledObjectContext?.scaledObject]);

  useEffect(() => {
    if (!scaledObjectContext?.scaledObject && open && selectedNamespace) {
      K8sService.getDeployments(selectedNamespace).then(
        (responseDeployments) => {
          setDeployments(responseDeployments.data);
        }
      );
    }
  }, [selectedNamespace, scaledObjectContext, open]);

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

    if (scaledObjectContext?.scaledObject) {
      K8sService.patchScaledObject(payload)
        .then((_response) => {
          closeDialog();
          SnackbarNotification.setAlert({
            shown: true,
            severity: "info",
            message: "ScaledObject successfully patched",
          });
        })
        .catch((error) => {
          SnackbarNotification.setAlert({
            shown: true,
            severity: "error",
            message: error.response.data.message,
          });
        });
    } else {
      K8sService.createScaledObject(payload)
        .then((_createdScaledObjectResponse) => {
          scaledObjectContext?.setScaledObject(payload);
          closeDialog();
          SnackbarNotification.setAlert({
            shown: true,
            severity: "info",
            message: "ScaledObject successfully created",
          });
        })
        .catch((error) => {
          SnackbarNotification.setAlert({
            shown: true,
            severity: "error",
            message: error.response.data.message,
          });
        });
    }
  }, [
    selectedDeployment,
    selectedNamespace,
    scaledObjectContext,
    minReplicas,
    maxReplicas,
    pollingInterval,
    cooldownPeriod,
    queueLength,
  ]);

  return (
    <>
      <Dialog open={open} onClose={closeDialog}>
        <DialogTitle>Create KEDA ScaledObject</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To create this resource, first select namespace and deployment.
            There are base and additional parameters to set
          </DialogContentText>
          <form onSubmit={submitForm}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Namespace</InputLabel>
              <Select
                value={selectedNamespace}
                disabled={!!scaledObjectContext?.scaledObject}
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
                  disabled={!!scaledObjectContext?.scaledObject}
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
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  type="number"
                  value={maxReplicas}
                  onChange={(e) => setMaxReplicas(+e.target.value)}
                  label="Max replicas"
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
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
                    InputProps={{
                      inputProps: {
                        min: 0,
                      },
                    }}
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
    </>
  );
};

export default CreateScalerDialog;

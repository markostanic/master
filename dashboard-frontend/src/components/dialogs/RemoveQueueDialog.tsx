import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import DialogProps from "../../models/DialogProps";
import { useCallback, useState } from "react";
import K8sService from "../../services/K8sService";

interface RemoveQueueProps {
  removeQueue: () => void;
}

const RemoveQueueDialog = ({
  queueName,
  open,
  closeDialog,
  removeQueue,
}: DialogProps & RemoveQueueProps) => {
  const [shouldRemoveScaledObject, setShouldRemoveScaledObject] =
    useState<boolean>(true);
  const submitForm = useCallback(() => {
    if (shouldRemoveScaledObject)
      K8sService.removeScaledObject(`${queueName}-scaled-object`);
    removeQueue();
  }, [queueName, shouldRemoveScaledObject]);

  return (
    <Dialog open={open} onClose={closeDialog}>
      <DialogTitle>
        Are you sure you want to remove '{queueName}' queue?
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          After removing queue, by default, associated ObjectScaler will be
          removed, you can prevent it, if you uncheck following box. When you
          again create queue with the same name ScaledObject will update Ready
          state
        </DialogContentText>
        <form onSubmit={submitForm}>
          <FormControl fullWidth margin="normal">
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldRemoveScaledObject}
                  onChange={(event) =>
                    setShouldRemoveScaledObject(event.target.checked)
                  }
                />
              }
              label="Remove ScaledObject associated with this queue"
            />
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button onClick={submitForm}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveQueueDialog;

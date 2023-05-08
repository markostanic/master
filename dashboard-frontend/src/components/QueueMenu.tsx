import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem } from "@mui/material";
import { useCallback, useMemo, useState, useContext } from "react";
import { QueueMenuProps } from "../props/QueueProps";
import IconButton from "@mui/material/IconButton";
import QueueService from "../services/QueueService";
import QueueContext from "../contexts/QueueContext";
import CreateScalerDialog from "./CreateScalerDialog";

const QueueMenu = ({ queueUrl, queueName }: QueueMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scalerDialogIsOpen, setScalerDialogIsOpen] = useState<boolean>(false);

  const queueOperations = useContext(QueueContext);

  const menuOpen = useMemo(() => {
    return Boolean(anchorEl);
  }, [anchorEl]);

  const menuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const menuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const removeQueue = useCallback(() => {
    queueName &&
      QueueService.removeQueue(queueName).then((_response) => {
        queueOperations.removeQueue(queueUrl);
        setAnchorEl(null);
      });
  }, [queueName, queueUrl]);

  const addMessage = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const purgeQueue = useCallback(() => {
    queueName &&
      QueueService.purgeQueue(queueName).then((_response) => {
        queueOperations.updateQueue(queueName);
      });
    setAnchorEl(null);
  }, [queueName]);

  const openDialog = useCallback(() => {
    setScalerDialogIsOpen(true);
    menuClose();
  }, []);

  return (
    <>
      <IconButton onClick={menuClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={menuClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={addMessage}>Add more messages</MenuItem>
        <MenuItem onClick={purgeQueue}>Purge queue</MenuItem>
        <MenuItem onClick={openDialog}>Create scaler</MenuItem>
        <MenuItem onClick={removeQueue}>Remove</MenuItem>
      </Menu>
      {queueName && (
        <CreateScalerDialog
          queueName={queueName}
          open={scalerDialogIsOpen}
          closeDialog={() => setScalerDialogIsOpen(false)}
        />
      )}
    </>
  );
};

export default QueueMenu;

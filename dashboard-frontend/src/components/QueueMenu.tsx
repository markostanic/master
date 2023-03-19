import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem } from "@mui/material";
import { useCallback, useMemo, useState, useContext } from "react";
import { QueueMenuProps } from "../props/QueueProps";
import IconButton from "@mui/material/IconButton";
import QueueService from "../services/QueueService";
import { UpdateQueueContext } from "../App";
import QueueContext from "../contexts/QueueContext";

const QueueMenu = ({ queueUrl, queueName }: QueueMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const queueOperations = useContext(QueueContext);

  const open = useMemo(() => {
    return Boolean(anchorEl);
  }, [anchorEl]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const removeQueue = useCallback(() => {
    queueName &&
      QueueService.removeQueue(queueName).then((response) => {
        queueOperations.removeQueue(queueUrl);
        setAnchorEl(null);
      });
  }, [queueName, queueUrl]);

  const addMessage = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const purgeQueue = useCallback(() => {
    queueName &&
      QueueService.purgeQueue(queueName).then((response) => {
        queueOperations.updateQueue(queueName);
      });
    setAnchorEl(null);
  }, [queueName]);

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={addMessage}>Add more messages</MenuItem>
        <MenuItem onClick={purgeQueue}>Purge queue</MenuItem>
        <MenuItem onClick={addMessage}>Create scaler</MenuItem>
        <MenuItem onClick={removeQueue}>Remove</MenuItem>
      </Menu>
    </>
  );
};

export default QueueMenu;

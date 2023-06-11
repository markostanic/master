import { AlertColor } from "@mui/material/Alert/Alert";

interface AlertState {
  shown: boolean;
  severity: AlertColor;
  message: string;
}

export default AlertState;

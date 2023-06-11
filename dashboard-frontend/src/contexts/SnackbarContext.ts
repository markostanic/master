import { createContext } from "react";
import AlertState from "../models/AlertState";

export interface SnackbarNotification {
  setAlert: (a: AlertState) => void;
}

const SnackbarNotificationContext = createContext<SnackbarNotification>({
  setAlert: () => {},
});

export default SnackbarNotificationContext;

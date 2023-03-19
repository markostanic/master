import axios from "axios";

const queueClientUrl =
  import.meta.env.VITE_QUEUE_CLIENT_URL || "http://localhost:8000/api/v1";

let queueClient = axios.create({
  baseURL: queueClientUrl,
});

export default queueClient;

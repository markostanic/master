import axios from "axios";

const apiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

let apiClient = axios.create({
  baseURL: apiUrl,
});

export default apiClient;

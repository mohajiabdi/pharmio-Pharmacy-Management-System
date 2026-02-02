import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // backend base
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically (if exists)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pharmly_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

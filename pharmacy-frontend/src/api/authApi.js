import api from "./client";

export const authApi = {
  login: (payload) => api.post("/api/auth/login", payload),
  signup: (payload) => api.post("/api/auth/signup", payload),
};

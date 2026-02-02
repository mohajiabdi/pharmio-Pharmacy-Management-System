import api from "./client";

const salesApi = {
  create: (payload) => api.post("/api/sales", payload),

  // GET /api/sales/recent?days=7
  listRecent: (days = 7) => api.get("/api/sales/recent", { params: { days } }),
};

export default salesApi;

import api from "./client";

const medicinesApi = {
  list: () => api.get("/api/medicines"),
  create: (payload) => api.post("/api/medicines", payload),
  update: (id, payload) => api.put(`/api/medicines/${id}`, payload),
  remove: (id) => api.delete(`/api/medicines/${id}`),

  // Optional restock endpoint (only if your backend has it)
  restock: (id, payload) => api.patch(`/api/medicines/${id}/restock`, payload),
};

export default medicinesApi;

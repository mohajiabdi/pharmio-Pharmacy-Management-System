import api from "./client";

const suppliersApi = {
  // ✅ because client baseURL is http://localhost:5000
  // we must include /api here
  list: () => api.get("/api/suppliers"),
};

export default suppliersApi;

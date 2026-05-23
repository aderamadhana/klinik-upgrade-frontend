import api from "@/services/api";

const auditLogService = {
  async getAll(params = {}) {
    const response = await api.get("/audit-logs", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  },

  async getFilters() {
    const response = await api.get("/audit-logs/filters");
    return response.data;
  },

  async getSummary(params = {}) {
    const response = await api.get("/audit-logs/summary", { params });
    return response.data;
  },
};

export default auditLogService;

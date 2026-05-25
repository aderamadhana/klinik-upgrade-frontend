import api from "@/plugins/axios";

const poinRuleService = {
  async getAll(params = {}) {
    const response = await api.get("/master/poin-rule", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/master/poin-rule/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post("/master/poin-rule", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/master/poin-rule/${id}`, payload);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/master/poin-rule/${id}`);
    return response.data;
  },
};

export default poinRuleService;

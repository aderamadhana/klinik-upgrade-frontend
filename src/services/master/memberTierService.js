import api from "@/plugins/axios";

const memberTierService = {
  async getAll(params = {}) {
    const response = await api.get("/master/member-tier", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/master/member-tier/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post("/master/member-tier", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/master/member-tier/${id}`, payload);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/master/member-tier/${id}`);
    return response.data;
  },
};

export default memberTierService;

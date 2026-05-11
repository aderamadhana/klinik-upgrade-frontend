import api from "@/plugins/axios";

const endpoint = "/master/merchandise";

const merchandiseService = {
  async getAll(params = {}) {
    const response = await api.get(endpoint, { params });
    return response.data.data;
  },

  async getById(id) {
    const response = await api.get(`${endpoint}/${id}`);
    return response.data.data;
  },

  async create(payload) {
    const response = await api.post(endpoint, payload);
    return response.data.data;
  },

  async update(id, payload) {
    const response = await api.put(`${endpoint}/${id}`, payload);
    return response.data.data;
  },

  async delete(id) {
    const response = await api.delete(`${endpoint}/${id}`);
    return response.data.data;
  },
};

export default merchandiseService;

import api from "@/plugins/axios";

const normalizeParams = (params = {}) => {
  if (!params || typeof params !== "object") return {};

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== null && value !== undefined && value !== "";
    }),
  );
};

const masterAntrianCounterService = {
  async getAll(params = {}) {
    const response = await api.get("/master/antrian-counter", {
      params: normalizeParams(params),
    });

    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/master/antrian-counter/${id}`);

    return response.data;
  },

  async create(payload = {}) {
    const response = await api.post("/master/antrian-counter", payload);

    return response.data;
  },

  async update(id, payload = {}) {
    const response = await api.put(`/master/antrian-counter/${id}`, payload);

    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/master/antrian-counter/${id}`);

    return response.data;
  },

  async syncFromBranch(payload = {}) {
    const response = await api.post(
      "/master/antrian-counter/sync-from-branch",
      payload,
    );

    return response.data;
  },
};

export default masterAntrianCounterService;

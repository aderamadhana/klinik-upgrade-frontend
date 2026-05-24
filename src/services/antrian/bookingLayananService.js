import api from "@/plugins/axios";

const normalizeParams = (params = {}) => {
  if (!params || typeof params !== "object") return {};

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== null && value !== undefined && value !== "";
    }),
  );
};

const bookingLayananService = {
  async getAll(params = {}) {
    const response = await api.get("/booking-layanan", {
      params: normalizeParams(params),
    });

    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/booking-layanan/${id}`);

    return response.data;
  },

  async create(payload = {}) {
    const response = await api.post("/booking-layanan", payload);

    return response.data;
  },

  async update(id, payload = {}) {
    const response = await api.put(`/booking-layanan/${id}`, payload);

    return response.data;
  },

  async cancel(id, payload = {}) {
    const response = await api.post(`/booking-layanan/${id}/cancel`, payload);

    return response.data;
  },

  async noShow(id) {
    const response = await api.post(`/booking-layanan/${id}/no-show`);

    return response.data;
  },

  async markLate(id) {
    const response = await api.post(`/booking-layanan/${id}/late`);

    return response.data;
  },
};

export default bookingLayananService;

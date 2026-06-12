import api from "@/services/api";

const accurateSettlementService = {
  async getUmum(params = {}) {
    const response = await api.get("/accurate/settlement-umum", { params });
    return response.data?.data || response.data;
  },

  async uploadUmum(payload) {
    const response = await api.post(
      "/accurate/settlement-umum/upload",
      payload,
    );
    return response.data;
  },

  async getEliteGlowbal(params = {}) {
    const response = await api.get("/accurate/settlement-elite-glowbal", {
      params,
    });
    return response.data?.data || response.data;
  },

  async uploadEliteGlowbal(payload) {
    const response = await api.post(
      "/accurate/settlement-elite-glowbal/upload",
      payload,
    );
    return response.data;
  },

  async getOwner(params = {}) {
    const response = await api.get("/accurate/settlement-owner", { params });
    return response.data?.data || response.data;
  },

  async uploadOwner(payload) {
    const response = await api.post(
      "/accurate/settlement-owner/upload",
      payload,
    );
    return response.data;
  },

  async getDeposit(params = {}) {
    const response = await api.get("/accurate/settlement-deposit", { params });
    return response.data?.data || response.data;
  },

  async uploadDeposit(payload) {
    const response = await api.post(
      "/accurate/settlement-deposit/upload",
      payload,
    );
    return response.data;
  },
};

export default accurateSettlementService;

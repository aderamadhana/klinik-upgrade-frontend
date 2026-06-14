import api from "./api";

export default {
  async getAll(params = {}) {
    const response = await api.get("/administrasi/pasien", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/administrasi/pasien/${id}`);
    return response.data;
  },

  async getRiwayat(id, params = {}) {
    const response = await api.get(`/administrasi/pasien/${id}/riwayat`, {
      params,
    });

    return response.data;
  },

  async riwayatSaldoDeposit(id, params = {}) {
    const response = await api.get(`/administrasi/pasien/${id}/saldo-deposit`, {
      params,
    });

    return response.data;
  },

  async updateSaldoDepositExpiredAt(id, depositId, payload = {}) {
    const response = await api.put(
      `/administrasi/pasien/${id}/saldo-deposit/${depositId}/expired-at`,
      payload,
    );

    return response.data;
  },

  async claimSaldoDeposit(id, depositId, payload = {}) {
    const response = await api.post(
      `/administrasi/pasien/${id}/saldo-deposit/${depositId}/claim`,
      payload,
    );

    return response.data;
  },

  async create(payload) {
    const response = await api.post("/administrasi/pasien", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/administrasi/pasien/${id}`, payload);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/administrasi/pasien/${id}`);
    return response.data;
  },

  async getPengkajianAwal(id) {
    const response = await api.get(
      `/administrasi/pasien/${id}/pengkajian-awal`,
    );
    return response.data;
  },

  async getPengkajianAwalById(id, pengkajianId) {
    const response = await api.get(
      `/administrasi/pasien/${id}/pengkajian-awal/${pengkajianId}`,
    );
    return response.data;
  },

  async createPengkajianAwal(id, payload) {
    const response = await api.post(
      `/administrasi/pasien/${id}/pengkajian-awal`,
      payload,
    );
    return response.data;
  },

  async updatePengkajianAwal(id, pengkajianId, payload) {
    const response = await api.put(
      `/administrasi/pasien/${id}/pengkajian-awal/${pengkajianId}`,
      payload,
    );
    return response.data;
  },
};

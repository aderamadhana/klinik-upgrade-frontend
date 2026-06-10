import api from "@/services/api";

const BASE_URL = "/farmasi/antrian-resep";

export default {
  getAll(params = {}) {
    return api.get(BASE_URL, { params }).then((response) => response.data);
  },

  getById(id, params = {}) {
    return api
      .get(`${BASE_URL}/${id}`, { params })
      .then((response) => response.data);
  },

  getHistory(params = {}) {
    return api
      .get("/farmasi/riwayat-resep", { params })
      .then((response) => response.data);
  },

  getHistoryPetugas(params = {}) {
    return api
      .get("/farmasi/riwayat-resep/petugas", { params })
      .then((response) => response.data);
  },

  print(id, params = {}) {
    return api
      .get(`${BASE_URL}/${id}/print`, {
        params,
        responseType: "blob",
      })
      .then((response) => response.data);
  },

  getPetugas(params = {}) {
    return api
      .get(`${BASE_URL}/petugas`, { params })
      .then((response) => response.data);
  },

  start(id, payload = {}) {
    return api
      .post(`${BASE_URL}/${id}/start`, payload)
      .then((response) => response.data);
  },

  finish(id, payload = {}) {
    return api
      .post(`${BASE_URL}/${id}/finish`, payload)
      .then((response) => response.data);
  },
};

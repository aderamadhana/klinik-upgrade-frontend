import api from "@/services/api";

const BASE_URL = "/pelayanan-medis/antrian-perawat";

export default {
  getAll(params = {}) {
    return api.get(BASE_URL, { params }).then((response) => response.data);
  },

  getById(id) {
    return api.get(`${BASE_URL}/${id}`).then((response) => response.data);
  },

  start(id) {
    return api
      .post(`${BASE_URL}/${id}/start`)
      .then((response) => response.data);
  },

  saveCppt(id, payload) {
    return api
      .post(`${BASE_URL}/${id}/cppt`, payload)
      .then((response) => response.data);
  },

  finish(id) {
    return api
      .post(`${BASE_URL}/${id}/finish`)
      .then((response) => response.data);
  },

  delete(id) {
    return api.delete(`${BASE_URL}/${id}`).then((response) => response.data);
  },
};

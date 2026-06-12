import api from "@/services/api";

const BASE_URL = "/kasir/pembayaran";

export default {
  getAll(params = {}) {
    return api.get(BASE_URL, { params }).then((response) => response.data);
  },

  getHistory(params = {}) {
    return this.getAll({
      status: "lunas",
      ...params,
    });
  },

  getById(id) {
    return api.get(`${BASE_URL}/${id}`).then((response) => response.data);
  },

  start(id) {
    return api
      .post(`${BASE_URL}/${id}/start`)
      .then((response) => response.data);
  },

  finish(id, payload = {}) {
    return api
      .post(`${BASE_URL}/${id}/finish`, payload)
      .then((response) => response.data);
  },

  printInvoice(id) {
    return api
      .get(`${BASE_URL}/${id}/print-invoice`, {
        responseType: "text",
      })
      .then((response) => response.data);
  },
};

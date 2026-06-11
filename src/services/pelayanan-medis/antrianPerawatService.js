import api from "@/services/api";

const BASE_URL = "/pelayanan-medis/antrian-perawat";

export default {
  getAll(params = {}) {
    return api.get(BASE_URL, { params }).then((response) => response.data);
  },

  getById(id) {
    return api.get(`${BASE_URL}/${id}`).then((response) => response.data);
  },

  getBeforeAfter(id) {
    return api
      .get(`${BASE_URL}/${id}/before-after`)
      .then((response) => response.data);
  },

  getBeforeAfterPhoto(id, photoId) {
    return api
      .get(`${BASE_URL}/${id}/before-after/photo/${photoId}`, {
        responseType: "blob",
      })
      .then((response) => response.data);
  },

  saveBeforeAfter(id, formData) {
    if (!(formData instanceof FormData)) {
      return Promise.reject(
        new TypeError("Payload before-after harus berupa FormData."),
      );
    }

    return api
      .post(`${BASE_URL}/${id}/before-after`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  },

  getBahanTreatment(id) {
    return api
      .get(`${BASE_URL}/${id}/bahan-treatment`)
      .then((response) => response.data);
  },

  saveBahanTreatment(id, payload) {
    return api
      .post(`${BASE_URL}/${id}/bahan-treatment`, payload)
      .then((response) => response.data);
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

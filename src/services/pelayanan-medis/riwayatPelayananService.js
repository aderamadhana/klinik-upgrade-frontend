import api from "@/services/api";

const BASE_URL = "/pelayanan-medis/riwayat-pelayanan";

export default {
  getAll(params = {}) {
    return api.get(BASE_URL, { params }).then((response) => response.data);
  },

  getById(id) {
    return api.get(`${BASE_URL}/${id}`).then((response) => response.data);
  },
};

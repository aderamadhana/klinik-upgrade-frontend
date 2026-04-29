import api from "@/plugins/axios";

const referenceService = {
  async roles() {
    const response = await api.get("/reference/roles");
    return response.data.data;
  },

  async jabatan() {
    const response = await api.get("/reference/jabatan");
    return response.data.data;
  },

  async toko() {
    const response = await api.get("/reference/toko");
    return response.data.data;
  },

  async karyawanCode(params = {}) {
    const response = await api.get("/reference/karyawan-code", { params });
    return response.data.data;
  },
};

export default referenceService;

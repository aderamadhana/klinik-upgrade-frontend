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

  async satuan() {
    const response = await api.get("/reference/satuan");
    return response.data.data;
  },

  async golonganProduk() {
    const response = await api.get("/reference/golongan-produk");
    return response.data.data;
  },

  async kategoriProduk() {
    const response = await api.get("/reference/kategori-produk");
    return response.data.data;
  },

  async tempatProduk() {
    const response = await api.get("/reference/tempat-produk");
    return response.data.data;
  },

  async satuan() {
    const response = await api.get("/reference/satuan");
    return response.data.data;
  },
};

export default referenceService;

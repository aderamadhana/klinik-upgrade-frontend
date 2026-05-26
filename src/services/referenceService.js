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

  async unitTreatment() {
    const response = await api.get("/reference/unit-treatment");
    return response.data.data;
  },

  async tipeTreatment() {
    const response = await api.get("/reference/tipe-treatment");
    return response.data.data;
  },

  async produkByToko(params = {}) {
    const response = await api.get("/reference/produk-by-toko", { params });
    return response.data.data;
  },

  async treatmentByToko(params = {}) {
    const response = await api.get("/reference/treatment-by-toko", { params });
    return response.data.data;
  },

  async voucherDiskonJenis(params = {}) {
    const response = await api.get("/reference/voucher-diskon-jenis", {
      params,
    });

    return response.data;
  },

  async voucherDiskonKategori(params = {}) {
    const response = await api.get("/reference/voucher-diskon-kategori", {
      params,
    });

    return response.data;
  },

  async voucherDiskonTemplate(params = {}) {
    const response = await api.get("/reference/voucher-diskon-template", {
      params,
    });

    return response.data;
  },

  async agama() {
    const response = await api.get("/reference/agama");
    return response.data.data;
  },

  async pekerjaan() {
    const response = await api.get("/reference/pekerjaan");
    return response.data.data;
  },

  async provinces() {
    const response = await api.get("/reference/provinces");
    return response.data.data;
  },

  async regencies(provinceCode) {
    const response = await api.get(`/reference/regencies/${provinceCode}`);
    return response.data.data;
  },

  async districts(regencyCode) {
    const response = await api.get(`/reference/districts/${regencyCode}`);
    return response.data.data;
  },

  async villages(districtCode) {
    const response = await api.get(`/reference/villages/${districtCode}`);
    return response.data.data;
  },

  async pasien(params = {}) {
    const response = await api.get("/reference/pasien", { params });
    return response.data.data;
  },

  async metodeBayar() {
    const response = await api.get("/reference/metode-bayar");
    return response.data.data;
  },

  async voucherDiskonEligible(params = {}) {
    const response = await api.get("/reference/voucher-diskon-eligible", {
      params,
    });

    return response.data.data;
  },

  async merchandise(params = {}) {
    const response = await api.get("/reference/merchandise", {
      params,
    });

    return response.data.data;
  },

  async accurateItemMapping(params = {}) {
    const response = await api.get("/reference/accurate-item-mapping", {
      params,
    });
    return response.data.data;
  },
};

export default referenceService;

import api from "@/plugins/axios";

const cleanParams = (params = {}) => {
  const cleaned = {};

  Object.keys(params).forEach((key) => {
    const value = params[key];

    if (value !== null && value !== undefined && value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

const stockService = {
  /*
  |--------------------------------------------------------------------------
  | STOCK PRODUK TOKO / SALDO STOK
  |--------------------------------------------------------------------------
  */

  async getStockProdukToko(params = {}) {
    const response = await api.get("/stock/produk-toko", {
      params: cleanParams(params),
    });

    return response.data;
  },

  async getStockProdukTokoById(id) {
    const response = await api.get(`/stock/produk-toko/${id}`);
    return response.data;
  },

  async getStockHariIni(params = {}) {
    const response = await api.get("/stock/produk-toko/stock-hari-ini", {
      params: cleanParams(params),
    });

    return response.data;
  },

  async getStokTersedia(params = {}) {
    const response = await api.get("/stock/produk-toko/stok-tersedia", {
      params: cleanParams(params),
    });

    return response.data;
  },

  async getKartuStok(params = {}) {
    const response = await api.get("/stock/produk-toko/kartu-stok", {
      params: cleanParams(params),
    });

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | PENERIMAAN STOK
  |--------------------------------------------------------------------------
  */

  async getPenerimaan(params = {}) {
    const response = await api.get("/stock/penerimaan", {
      params: cleanParams(params),
    });

    return response.data;
  },

  async getPenerimaanById(id) {
    const response = await api.get(`/stock/penerimaan/${id}`);
    return response.data;
  },

  async createPenerimaan(payload) {
    const response = await api.post("/stock/penerimaan", payload);
    return response.data;
  },

  async updatePenerimaan(id, payload) {
    const response = await api.put(`/stock/penerimaan/${id}`, payload);
    return response.data;
  },

  async postPenerimaan(id) {
    const response = await api.post(`/stock/penerimaan/${id}/post`);
    return response.data;
  },

  async cancelPenerimaan(id) {
    const response = await api.post(`/stock/penerimaan/${id}/cancel`);
    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | PENYESUAIAN / STOK AWAL / OPNAME
  |--------------------------------------------------------------------------
  */

  async getPenyesuaian(params = {}) {
    const response = await api.get("/stock/penyesuaian", {
      params: cleanParams(params),
    });

    return response.data;
  },

  async getPenyesuaianById(id) {
    const response = await api.get(`/stock/penyesuaian/${id}`);
    return response.data;
  },

  async createPenyesuaian(payload) {
    const response = await api.post("/stock/penyesuaian", payload);
    return response.data;
  },

  async updatePenyesuaian(id, payload) {
    const response = await api.put(`/stock/penyesuaian/${id}`, payload);
    return response.data;
  },

  async postPenyesuaian(id) {
    const response = await api.post(`/stock/penyesuaian/${id}/post`);
    return response.data;
  },

  async cancelPenyesuaian(id) {
    const response = await api.post(`/stock/penyesuaian/${id}/cancel`);
    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | HELPER UNTUK FE
  |--------------------------------------------------------------------------
  */

  getResponseData(response) {
    return response?.data ?? response;
  },

  getResponseMessage(response, fallback = "Berhasil memproses data") {
    return response?.message || fallback;
  },

  getErrorMessage(error, fallback = "Terjadi kesalahan") {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.response?.data?.error) {
      return error.response.data.error;
    }

    if (error?.message) {
      return error.message;
    }

    return fallback;
  },

  normalizeStockItem(row = {}) {
    const stokAkhir = Number(row.stok_akhir || 0);
    const stokReserved = Number(row.stok_reserved || 0);

    return {
      ...row,
      stok_akhir_number: stokAkhir,
      stok_reserved_number: stokReserved,
      stok_tersedia_number: stokAkhir - stokReserved,
      stok_minimum_number: Number(row.stok_minimum || 0),
      is_stok_menipis: stokAkhir <= Number(row.stok_minimum || 0),
    };
  },

  normalizeStockList(rows = []) {
    return rows.map((row) => this.normalizeStockItem(row));
  },
};

export default stockService;

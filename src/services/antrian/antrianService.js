import api from "@/plugins/axios";

const normalizeParams = (params = {}) => {
  if (!params || typeof params !== "object") return {};

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== null && value !== undefined && value !== "";
    }),
  );
};

const antrianService = {
  async kategori(params = {}) {
    const response = await api.get("/antrian/kategori", {
      params: normalizeParams(params),
    });

    return response.data;
  },

  async counter(params = {}) {
    const response = await api.get("/antrian/counter", {
      params: normalizeParams(params),
    });

    return response.data;
  },

  async ambilNomor(payload = {}) {
    const response = await api.post("/antrian/ambil-nomor", payload);

    return response.data;
  },

  async display(params = {}) {
    const response = await api.get("/antrian/display", {
      params: normalizeParams(params),
    });

    return response.data;
  },

  async operator(params = {}) {
    const response = await api.get("/antrian/operator", {
      params: normalizeParams(params),
    });

    return response.data;
  },

  async panggilBerikutnya(payload = {}) {
    const response = await api.post(
      "/antrian/operator/panggil-berikutnya",
      payload,
    );

    return response.data;
  },

  async panggil(id, payload = {}) {
    const response = await api.post(`/antrian/${id}/panggil`, payload);

    return response.data;
  },

  async panggilUlang(id, payload = {}) {
    const response = await api.post(`/antrian/${id}/panggil-ulang`, payload);

    return response.data;
  },

  async mulaiLayanan(id) {
    const response = await api.post(`/antrian/${id}/mulai-layanan`);

    return response.data;
  },

  async lewati(id) {
    const response = await api.post(`/antrian/${id}/lewati`);

    return response.data;
  },

  async selesai(id) {
    const response = await api.post(`/antrian/${id}/selesai`);

    return response.data;
  },

  async batal(id) {
    const response = await api.post(`/antrian/${id}/batal`);

    return response.data;
  },

  async hubungkanRegistrasi(id, payload = {}) {
    const response = await api.post(
      `/antrian/${id}/hubungkan-registrasi`,
      payload,
    );

    return response.data;
  },

  async cariBookingHariIni(params = {}) {
    const response = await api.get("/antrian/booking/cari-hari-ini", {
      params: normalizeParams(params),
    });

    return response.data;
  },

  async checkInBooking(bookingId, payload = {}) {
    const response = await api.post(
      `/antrian/booking/${bookingId}/check-in`,
      payload,
    );

    return response.data;
  },
};

export default antrianService;

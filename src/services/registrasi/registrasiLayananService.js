import api from "@/services/api";

const BASE_URL = "/registrasi-layanan";

const isFile = (value) => {
  return typeof File !== "undefined" && value instanceof File;
};

const isBlob = (value) => {
  return typeof Blob !== "undefined" && value instanceof Blob;
};

const hasFileValue = (value) => {
  if (!value) return false;

  if (isFile(value) || isBlob(value)) return true;

  if (Array.isArray(value)) {
    return value.some((item) => hasFileValue(item));
  }

  if (typeof value === "object") {
    return Object.values(value).some((item) => hasFileValue(item));
  }

  return false;
};

const appendFormData = (formData, data, parentKey = "") => {
  if (data === null || data === undefined) return;

  if (isFile(data) || isBlob(data)) {
    formData.append(parentKey, data);
    return;
  }

  if (data instanceof Date) {
    formData.append(parentKey, data.toISOString());
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      appendFormData(formData, item, `${parentKey}[${index}]`);
    });
    return;
  }

  if (typeof data === "object") {
    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (value === null || value === undefined) return;

      const nextKey = parentKey ? `${parentKey}[${key}]` : key;

      appendFormData(formData, value, nextKey);
    });
    return;
  }

  formData.append(parentKey, data);
};

const toFormData = (payload) => {
  const formData = new FormData();

  appendFormData(formData, payload);

  return formData;
};

const toBoolPayload = (value) => {
  return value ? 1 : 0;
};

const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (value === null || value === undefined || value === "") return 0;

  return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
};

const getSelectedTokoId = () => {
  return localStorage.getItem("selected_toko_id") || null;
};

const getSelectedToko = () => {
  try {
    return JSON.parse(localStorage.getItem("selected_toko") || "null");
  } catch {
    return null;
  }
};

const isOnlineSource = (sourceCode) => {
  return String(sourceCode || "")
    .toUpperCase()
    .includes("ONLINE");
};

const normalizeTreatmentItem = (item = {}) => {
  const treatmentId =
    item.treatment_id ||
    item.tindakan_id ||
    item.master_treatment_id ||
    item.id ||
    null;

  const treatmentTokoId =
    item.treatment_toko_id ||
    item.master_treatment_toko_id ||
    item.tindakan_toko_id ||
    item.toko_treatment_id ||
    null;

  const harga = toNumber(item.harga || item.harga_treatment || 0);
  const jumlah = toNumber(item.jumlah || item.qty || 1);
  const total = toNumber(item.total || harga * jumlah);

  const perawatId =
    item.perawat_id ??
    item.beautician_id ??
    item.nurse_id ??
    item.pelaksana_id ??
    null;

  return {
    treatment_toko_id: treatmentTokoId,
    treatment_id: treatmentId,
    tindakan_id: treatmentId,
    nama_treatment:
      item.nama_treatment ||
      item.treatment_nama ||
      item.nama_tindakan ||
      item.tindakan_nama ||
      item.nama ||
      "",
    treatment_nama:
      item.treatment_nama ||
      item.nama_treatment ||
      item.nama_tindakan ||
      item.tindakan_nama ||
      item.nama ||
      "",
    harga,
    jumlah: jumlah <= 0 ? 1 : jumlah,
    total,

    perawat_id:
      perawatId === null || perawatId === undefined || perawatId === ""
        ? null
        : Number(perawatId),
    perawat_nama:
      item.perawat_nama ||
      item.beautician_nama ||
      item.nurse_nama ||
      item.pelaksana_nama ||
      "",
    perawat_jabatan_kode: item.perawat_jabatan_kode || item.kode_jabatan || "",
    perawat_jabatan_nama: item.perawat_jabatan_nama || item.nama_jabatan || "",

    perlu_tindakan_perawat: toBoolPayload(
      item.perlu_tindakan_perawat ||
        item.is_tindakan_perawat ||
        item.perlu_perawat ||
        item.route_treatment === "nurse_station",
    ),
    route_treatment:
      item.route_treatment ||
      (item.perlu_tindakan_perawat ? "nurse_station" : "dokter"),
    is_deposit_claim: toBoolPayload(item.is_deposit_claim),
    deposit_treatment_id: item.deposit_treatment_id || null,
    deposit_claim_id: item.deposit_claim_id || null,
    catatan: item.catatan || "",
  };
};

const normalizePenjualanItem = (item = {}) => {
  const selectedProduk = item.selected_produk || item.produk || item.obat || {};

  const produkTokoId =
    item.produk_toko_id ||
    item.master_produk_toko_id ||
    item.obat_toko_id ||
    item.toko_produk_id ||
    selectedProduk.produk_toko_id ||
    selectedProduk.master_produk_toko_id ||
    null;

  const produkId =
    item.produk_id ||
    item.obat_id ||
    item.master_produk_id ||
    item.product_id ||
    selectedProduk.produk_id ||
    selectedProduk.obat_id ||
    selectedProduk.id ||
    null;

  const tempatProdukId =
    item.tempat_produk_id ||
    item.tempatProdukId ||
    selectedProduk.tempat_produk_id ||
    selectedProduk.tempatProdukId ||
    null;

  const stockProdukTokoId =
    item.stock_produk_toko_id ||
    item.stockProdukTokoId ||
    item.stock_id ||
    selectedProduk.stock_produk_toko_id ||
    selectedProduk.stockProdukTokoId ||
    selectedProduk.stock_id ||
    null;

  const harga = toNumber(
    item.harga ||
      item.harga_jual ||
      selectedProduk.harga_jual ||
      selectedProduk.harga ||
      0,
  );

  const jumlah = toNumber(item.jumlah || item.qty || 1);
  const subtotal = toNumber(item.subtotal || harga * jumlah);

  const namaProduk =
    item.nama_produk ||
    item.produk_nama ||
    item.nama_obat ||
    item.obat_nama ||
    item.nama ||
    selectedProduk.nama ||
    selectedProduk.nama_produk ||
    "";

  return {
    produk_toko_id: produkTokoId,
    produk_id: produkId,
    obat_id: produkId,

    tempat_produk_id: tempatProdukId,
    stock_produk_toko_id: stockProdukTokoId,

    nama_produk: namaProduk,
    produk_nama: namaProduk,

    harga,
    jumlah: jumlah <= 0 ? 1 : jumlah,

    diskon_tipe: item.diskon_tipe || item.diskon_type || 0,
    diskon_nilai: toNumber(item.diskon_nilai || item.diskon_value || 0),
    diskon_referral: toNumber(item.diskon_referral || 0),

    subtotal,
    source_resep_id: item.source_resep_id || null,

    frekuensi: item.frekuensi || "",
    waktu_pakai: item.waktu_pakai || "",
    penggunaan: item.penggunaan || "",
    unit:
      item.unit ||
      item.satuan ||
      selectedProduk.nama_satuan ||
      selectedProduk.satuan ||
      "",
  };
};

const normalizePayload = (form = {}) => {
  const layanan = form.layanan || {};
  const toko = getSelectedToko();

  const adaKonsultasi = Boolean(layanan.ada_konsultasi);
  const adaTreatment = Boolean(layanan.ada_treatment);
  const adaPenjualan = Boolean(layanan.ada_penjualan);

  let konsultasiSourceCode =
    layanan.konsultasi_source_code || form.konsultasi_source_code || null;

  let channelKonsultasi = layanan.channel_konsultasi || "";

  if (adaKonsultasi && !konsultasiSourceCode) {
    konsultasiSourceCode =
      channelKonsultasi === "online"
        ? "KONSULTASI_ONLINE"
        : "KONSULTASI_OFFLINE";
  }

  if (adaKonsultasi && !channelKonsultasi) {
    channelKonsultasi = isOnlineSource(konsultasiSourceCode)
      ? "online"
      : "offline";
  }

  if (!adaKonsultasi) {
    konsultasiSourceCode = null;
    channelKonsultasi = "";
  }

  const isPembelianOnline =
    adaPenjualan &&
    Boolean(layanan.is_pembelian_online || form.is_pembelian_online);

  const pembelianOnlineSourceCode = isPembelianOnline
    ? layanan.pembelian_online_source_code ||
      form.pembelian_online_source_code ||
      "PEMBELIAN_ONLINE"
    : null;

  const treatmentItems = Array.isArray(form.treatment?.items)
    ? form.treatment.items
        .map((item) => normalizeTreatmentItem(item))
        .filter((item) => item.treatment_id || item.treatment_toko_id)
    : [];

  const penjualanItems = Array.isArray(form.penjualan?.items)
    ? form.penjualan.items
        .map((item) => normalizePenjualanItem(item))
        .filter((item) => item.produk_id || item.produk_toko_id)
    : [];

  return {
    toko_id: form.toko_id || form.tokoId || getSelectedTokoId(),
    toko_nama: form.toko_nama || toko?.nama_toko || toko?.nama || "",
    tanggal: form.tanggal,
    pasien_id: form.pasien_id || null,
    pasien_new_id: form.pasien_new_id || null,
    dokter_id: form.dokter_id || null,
    perawat_id: form.perawat_id || null,
    catatan_registrasi: form.catatan_registrasi || "",

    layanan: {
      ada_konsultasi: toBoolPayload(adaKonsultasi),
      channel_konsultasi: adaKonsultasi ? channelKonsultasi || "offline" : "",

      konsultasi_source_code: konsultasiSourceCode,
      konsultasi_source_name:
        layanan.konsultasi_source_name || form.konsultasi_source_name || null,
      konsultasi_mapping_id:
        layanan.konsultasi_mapping_id || form.konsultasi_mapping_id || null,
      konsultasi_kode_accurate:
        layanan.konsultasi_kode_accurate ||
        form.konsultasi_kode_accurate ||
        null,
      konsultasi_nama_accurate:
        layanan.konsultasi_nama_accurate ||
        form.konsultasi_nama_accurate ||
        null,

      ada_treatment: toBoolPayload(adaTreatment),
      ada_penjualan: toBoolPayload(adaPenjualan),
      route_treatment: layanan.route_treatment || "",

      is_pembelian_online: toBoolPayload(isPembelianOnline),
      pembelian_online_source_code: pembelianOnlineSourceCode,
      pembelian_online_source_name: isPembelianOnline
        ? layanan.pembelian_online_source_name ||
          form.pembelian_online_source_name ||
          "Pembelian Online"
        : null,
      pembelian_online_mapping_id: isPembelianOnline
        ? layanan.pembelian_online_mapping_id ||
          form.pembelian_online_mapping_id ||
          null
        : null,
      pembelian_online_kode_accurate: isPembelianOnline
        ? layanan.pembelian_online_kode_accurate ||
          form.pembelian_online_kode_accurate ||
          null
        : null,
      pembelian_online_nama_accurate: isPembelianOnline
        ? layanan.pembelian_online_nama_accurate ||
          form.pembelian_online_nama_accurate ||
          null
        : null,
    },

    konsultasi_source_code: konsultasiSourceCode,
    konsultasi_source_name:
      layanan.konsultasi_source_name || form.konsultasi_source_name || null,
    konsultasi_mapping_id:
      layanan.konsultasi_mapping_id || form.konsultasi_mapping_id || null,
    konsultasi_kode_accurate:
      layanan.konsultasi_kode_accurate || form.konsultasi_kode_accurate || null,
    konsultasi_nama_accurate:
      layanan.konsultasi_nama_accurate || form.konsultasi_nama_accurate || null,
    total_konsultasi: toNumber(form.total_konsultasi || 0),
    rule_biaya_konsultasi: form.rule_biaya_konsultasi || null,

    is_pembelian_online: toBoolPayload(isPembelianOnline),
    pembelian_online_source_code: pembelianOnlineSourceCode,
    pembelian_online_source_name: isPembelianOnline
      ? layanan.pembelian_online_source_name ||
        form.pembelian_online_source_name ||
        "Pembelian Online"
      : null,
    pembelian_online_mapping_id: isPembelianOnline
      ? layanan.pembelian_online_mapping_id ||
        form.pembelian_online_mapping_id ||
        null
      : null,
    pembelian_online_kode_accurate: isPembelianOnline
      ? layanan.pembelian_online_kode_accurate ||
        form.pembelian_online_kode_accurate ||
        null
      : null,
    pembelian_online_nama_accurate: isPembelianOnline
      ? layanan.pembelian_online_nama_accurate ||
        form.pembelian_online_nama_accurate ||
        null
      : null,

    konsultasi_offline: {
      keluhan_awal: form.konsultasi_offline?.keluhan_awal || "",
      catatan: form.konsultasi_offline?.catatan || "",
    },

    konsultasi_online: {
      request_dokter: form.konsultasi_online?.request_dokter || "",
      alergi: form.konsultasi_online?.alergi || "",
      keluhan: form.konsultasi_online?.keluhan || "",
      produk_sebelumnya: form.konsultasi_online?.produk_sebelumnya || "",
      sedang_hamil: form.konsultasi_online?.sedang_hamil || "",
      sedang_menyusui: form.konsultasi_online?.sedang_menyusui || "",
      bukti_foto_kiri: form.konsultasi_online?.bukti_foto_kiri || "",
      bukti_foto_depan: form.konsultasi_online?.bukti_foto_depan || "",
      bukti_foto_kanan: form.konsultasi_online?.bukti_foto_kanan || "",
      file_name_1: form.konsultasi_online?.file_name_1 || "",
      file_name_2: form.konsultasi_online?.file_name_2 || "",
      file_name_3: form.konsultasi_online?.file_name_3 || "",
    },

    treatment: {
      perlu_tindakan_perawat: toBoolPayload(
        form.treatment?.perlu_tindakan_perawat,
      ),
      route_treatment: form.treatment?.route_treatment || "",
      total: toNumber(form.treatment?.total || 0),
      items: adaTreatment ? treatmentItems : [],
    },

    penjualan: {
      poin: toNumber(form.penjualan?.poin || 0),
      total: toNumber(form.penjualan?.total || 0),
      items: adaPenjualan ? penjualanItems : [],
    },
  };
};

const requestPayload = async (method, url, payload = null, config = {}) => {
  if (!payload) {
    const response = await api[method](url, config);
    return response.data;
  }

  const normalizedPayload = normalizePayload(payload);

  if (hasFileValue(normalizedPayload)) {
    const formData = toFormData(normalizedPayload);

    const response = await api[method](url, formData, {
      ...config,
      headers: {
        ...(config.headers || {}),
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  const response = await api[method](url, normalizedPayload, config);

  return response.data;
};

const registrasiLayananService = {
  getAll(params = {}) {
    return api.get(BASE_URL, { params }).then((response) => response.data);
  },

  getById(id) {
    return api.get(`${BASE_URL}/${id}`).then((response) => response.data);
  },

  create(form) {
    return requestPayload("post", BASE_URL, form);
  },

  store(form) {
    return this.create(form);
  },

  submit(form) {
    return this.create(form);
  },

  cancel(id) {
    return api
      .post(`${BASE_URL}/${id}/cancel`)
      .then((response) => response.data);
  },

  startCurrentTask(id) {
    return api
      .post(`${BASE_URL}/${id}/start-current-task`)
      .then((response) => response.data);
  },

  finishCurrentTask(id) {
    return api
      .post(`${BASE_URL}/${id}/finish-current-task`)
      .then((response) => response.data);
  },

  startTask(taskId) {
    return api
      .post(`${BASE_URL}/task/${taskId}/start`)
      .then((response) => response.data);
  },

  finishTask(taskId) {
    return api
      .post(`${BASE_URL}/task/${taskId}/finish`)
      .then((response) => response.data);
  },

  uploadBuktiChatKonsultasiOnline(id, file) {
    const selectedFile = Array.isArray(file) ? file[0] : file;

    const formData = new FormData();
    formData.append("bukti_chat_konsultasi_online", selectedFile);

    return api
      .post(`${BASE_URL}/${id}/upload-bukti-chat-konsultasi-online`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  },

  normalizePayload(form) {
    return normalizePayload(form);
  },

  toFormData(payload) {
    return toFormData(payload);
  },

  getConsultationHistory(pasienId, params = {}) {
    return api
      .get(`${BASE_URL}/pasien/${pasienId}/riwayat-konsultasi`, { params })
      .then((response) => response.data);
  },
};

export default registrasiLayananService;

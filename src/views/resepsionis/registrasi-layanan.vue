<template>
  <div class="page-wrap">
    <div class="page-header d-flex justify-space-between align-start mb-6">
      <div>
        <h1 class="page-title">Registrasi Layanan Pasien</h1>
        <p class="page-subtitle">
          Satu halaman pendaftaran untuk konsultasi, treatment, dan penjualan
          langsung
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>
    <InformasiRegistrasi
      :form="form"
      :rules="rules"
      :pasien-list="pasienList"
      :dokter-list="dokterList"
      :perawat-list="perawatList"
      :sumber-list="sumberList"
      :jenis-transaksi-list="jenisTransaksiList"
      @update-field="updateFormField"
      @patient-change="onPatientChange"
    />
    <PilihLayanan :form="form" @update-layanan-field="updateLayananField" />
    <KonsultasiOffline
      v-if="
        form.layanan.ada_konsultasi &&
        form.layanan.channel_konsultasi === 'offline'
      "
      :form="form"
      :rules="rules"
      @update-konsultasi-offline="updateKonsultasiOffline"
    />
    <KonsultasiOnline
      v-if="
        form.layanan?.ada_konsultasi &&
        form.layanan?.channel_konsultasi === 'online' &&
        form.konsultasi_online
      "
      :form="form"
      :rules="rules"
      :drag-active="dragActive"
      :consultation-history="consultationHistory"
      :history-headers="historyHeaders"
      :photo-cards="photoCards"
      @update-konsultasi-online="updateKonsultasiOnline"
      @drag-over="onDragOver"
      @drag-leave="onDragLeave"
      @file-drop="onDrop"
      @file-change="onFileChange"
      @remove-image="removeImage"
    />
    <TreatmentSection
      v-if="form.layanan.ada_treatment"
      :form="form"
      :rules="rules"
      :tindakan-list="tindakanList"
      :perawat-list="perawatList"
      :diskon-type-list="diskonTypeList"
      :total-treatment="totalTreatment"
      :format-number="formatNumber"
      :get-treatment-subtotal="getTreatmentSubtotal"
      @update-treatment-meta="updateTreatmentMeta"
      @update-treatment-item="updateTreatmentItem"
      @add-treatment-item="addTreatmentItem"
      @remove-treatment-item="removeTreatmentItem"
    />

    <PenjualanSection
      v-if="form.layanan?.ada_penjualan && form.penjualan"
      :form="form"
      :rules="rules"
      :obat-list="obatList"
      :unit-list="unitList"
      :diskon-type-list="diskonTypeList"
      :frekuensi-list="frekuensiList"
      :waktu-pakai-list="waktuPakaiList"
      @update-penjualan-meta="updatePenjualanMeta"
      @update-penjualan-item="updatePenjualanItem"
      @add-penjualan-item="addPenjualanItem"
      @remove-penjualan-item="removePenjualanItem"
    />

    <RingkasanSection
      :form="form"
      :pasien-list="pasienList"
      :dokter-list="dokterList"
      :perawat-list="perawatList"
      :tindakan-list="tindakanList"
      :obat-list="obatList"
      :total-treatment="totalTreatment"
      :total-penjualan="totalPenjualan"
      :format-number="formatNumber"
      :get-treatment-subtotal="getTreatmentSubtotal"
      :get-penjualan-subtotal="getPenjualanSubtotal"
    />

    <div class="action-bar">
      <div class="action-bar__left"></div>

      <div class="action-bar__right">
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          prepend-icon="mdi-refresh"
          @click="resetForm"
        >
          Reset Form
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-content-save-outline"
          :loading="loading"
          @click="handleSubmit"
        >
          Simpan Registrasi
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import InformasiRegistrasi from "@/components/registrasi-layanan/informasi-registrasi.vue";
import PilihLayanan from "@/components/registrasi-layanan/pilih-layanan.vue";
import KonsultasiOffline from "@/components/registrasi-layanan/konsultasi-offline.vue";
import KonsultasiOnline from "@/components/registrasi-layanan/konsultasi-online.vue";
import TreatmentSection from "@/components/registrasi-layanan/treatment-section.vue";
import PenjualanSection from "@/components/registrasi-layanan/penjualan-section.vue";
import RingkasanSection from "@/components/registrasi-layanan/ringkasan-section.vue";

import sisiKanan from "@/assets/sisi-kanan2.jpg";
import sisiTengah from "@/assets/sisi-tengah2.jpg";
import sisiKiri from "@/assets/sisi-kiri2.jpg";

export default {
  name: "RegistrasiLayananPage",
  components: {
    InformasiRegistrasi,
    PilihLayanan,
    KonsultasiOffline,
    KonsultasiOnline,
    TreatmentSection,
    PenjualanSection,
    RingkasanSection,
  },
  data() {
    return {
      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        {
          title: "Registrasi Layanan",
          disabled: false,
          to: "/resepsionis/registrasi-layanan",
        },
      ],
      form: {
        tanggal: this.getToday(),
        pasien_new_id: null,
        dokter_id: null,
        perawat_id: null,

        layanan: {
          ada_konsultasi: true,
          channel_konsultasi: "online",
          ada_treatment: false,
          ada_penjualan: false,
        },

        konsultasi_offline: {
          keluhan_awal: "",
          catatan: "",
        },

        konsultasi_online: {
          request_dokter: "",
          alergi: "",
          keluhan: "",
          produk_sebelumnya: "",
          sedang_hamil: null,
          sedang_menyusui: null,

          bukti_foto_kiri: "",
          bukti_foto_depan: "",
          bukti_foto_kanan: "",

          preview_before_1: sisiKanan,
          preview_before_2: sisiTengah,
          preview_before_3: sisiKiri,

          file_name_1: "",
          file_name_2: "",
          file_name_3: "",
        },

        treatment: {
          items: [
            {
              tindakan_id: null,
              jumlah: 1,
              beautician_id: null,
              harga: 0,
              diskon_type: "%",
              diskon_value: 0,
              diskon_referral: 0,
            },
          ],
        },

        penjualan: {
          poin: 0,
          items: [
            {
              produk_id: null,
              harga: 0,
              jumlah: 1,
              unit: "PCS",
              diskon_type: "%",
              diskon_value: 0,
              diskon_referral: 0,
              frekuensi: "",
              waktu_pakai: "",
              penggunaan: "",
            },
          ],
        },
      },

      photoCards: [
        {
          key: "before_1",
          title: "Upload Foto Pasien 1",
          previewKey: "preview_before_1",
          fileNameKey: "file_name_1",
        },
        {
          key: "before_2",
          title: "Upload Foto Pasien 2",
          previewKey: "preview_before_2",
          fileNameKey: "file_name_2",
        },
        {
          key: "before_3",
          title: "Upload Foto Pasien 3",
          previewKey: "preview_before_3",
          fileNameKey: "file_name_3",
        },
      ],

      pasienList: [
        { id: "PS001", text: "Budi Santoso - 3276010101010001" },
        { id: "PS002", text: "Siti Aminah - 3276010101010002" },
        { id: "PS003", text: "Rina Lestari - 3276010101010003" },
      ],

      dokterList: [
        { id: "D001", nama: "dr. Andi Saputra" },
        { id: "D002", nama: "dr. Bunga Lestari" },
        { id: "D003", nama: "dr. Candra Wijaya" },
      ],

      perawatList: [
        { id: "P001", nama: "Ns. Rina" },
        { id: "P002", nama: "Ns. Tika" },
        { id: "P003", nama: "Ns. Dita" },
      ],

      consultationHistory: [],

      historyHeaders: [
        { title: "TGL", key: "tgl" },
        { title: "DOKTER", key: "dokter" },
        { title: "TINDAKAN & PERAWAT", key: "tindakan_html", sortable: false },
        { title: "OBAT", key: "obat_html", sortable: false },
        { title: "CATATAN DOKTER", key: "catatan_html", sortable: false },
        { title: "KLINIK", key: "lokasi" },
      ],

      sumberList: [
        "Pelanggan Lama",
        "Pelanggan Baru",
        "Instagram",
        "TikTok",
        "WhatsApp",
        "Referral",
      ],

      jenisTransaksiList: ["Umum", "Member", "Referral", "Owner", "Endorse"],

      rules: {
        required: (v) => !!v || "Field ini wajib diisi",
      },
    };
  },
  methods: {
    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    },

    updateFormField({ field, value }) {
      this.form[field] = value;
    },

    updateLayananField({ field, value }) {
      this.form.layanan[field] = value;
    },

    updateKonsultasiOffline({ field, value }) {
      this.form.konsultasi_offline[field] = value;
    },

    updateKonsultasiOnline({ field, value }) {
      this.form.konsultasi_online[field] = value;
    },

    onPatientChange(value) {
      if (!value) {
        this.consultationHistory = [];
        return;
      }

      this.consultationHistory = [
        {
          id: 1,
          tgl: "2026-04-01",
          dokter: "dr. Andi Saputra",
          tindakan_html: "Facial Acne<br><small>Perawat: Ns. Rina</small>",
          obat_html: "Krim Malam<br>Sabun Wajah",
          catatan_html: "Kulit sensitif, hindari exfoliasi berlebih",
          lokasi: "Klinik Pusat",
        },
      ];
    },

    triggerFileInput(key) {
      const refName = `fileInput_${key}`;
      const input = this.$refs[refName];
      if (Array.isArray(input)) {
        input[0]?.click();
      } else {
        input?.click();
      }
    },

    onDragOver(key) {
      this.dragActive = key;
    },

    onDragLeave() {
      this.dragActive = null;
    },

    onDrop(event, key) {
      this.dragActive = null;
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;
      this.processImageFile(file, key);
    },

    onFileChange(event, key) {
      const file = event.target.files?.[0];
      if (!file) return;
      this.processImageFile(file, key);
      event.target.value = "";
    },

    processImageFile(file, key) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        this.showSnackbar(
          "Format file harus PNG, JPG, JPEG, atau WEBP",
          "error",
        );
        return;
      }

      const previewMap = {
        before_1: "preview_before_1",
        before_2: "preview_before_2",
        before_3: "preview_before_3",
      };

      const hiddenMap = {
        before_1: "bukti_foto_kiri",
        before_2: "bukti_foto_depan",
        before_3: "bukti_foto_kanan",
      };

      const fileNameMap = {
        before_1: "file_name_1",
        before_2: "file_name_2",
        before_3: "file_name_3",
      };

      this.form.konsultasi_online[previewMap[key]] = URL.createObjectURL(file);
      this.form.konsultasi_online[hiddenMap[key]] = file;
      this.form.konsultasi_online[fileNameMap[key]] = file.name;
    },

    removeImage(key) {
      const previewMap = {
        before_1: "preview_before_1",
        before_2: "preview_before_2",
        before_3: "preview_before_3",
      };

      const hiddenMap = {
        before_1: "bukti_foto_kiri",
        before_2: "bukti_foto_depan",
        before_3: "bukti_foto_kanan",
      };

      const fileNameMap = {
        before_1: "file_name_1",
        before_2: "file_name_2",
        before_3: "file_name_3",
      };

      const defaultPreviewMap = {
        before_1: sisiKanan,
        before_2: sisiTengah,
        before_3: sisiKiri,
      };

      this.form.konsultasi_online[previewMap[key]] = defaultPreviewMap[key];
      this.form.konsultasi_online[hiddenMap[key]] = "";
      this.form.konsultasi_online[fileNameMap[key]] = "";
    },
    updateTreatmentMeta({ field, value }) {
      this.form.treatment[field] = value;
    },

    updateTreatmentItem({ index, field, value }) {
      this.form.treatment.items[index][field] = value;

      if (field === "tindakan_id") {
        const tindakan = this.tindakanList.find((x) => x.id === value);
        if (tindakan) {
          this.form.treatment.items[index].harga = tindakan.harga;
        }
      }
    },

    addTreatmentItem() {
      this.form.treatment.items.push({
        tindakan_id: null,
        jumlah: 1,
        beautician_id: null,
        harga: 0,
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
      });
    },

    removeTreatmentItem(index) {
      if (this.form.treatment.items.length === 1) return;
      this.form.treatment.items.splice(index, 1);
    },

    getDiskonAmount(base, type, value) {
      const numericBase = Number(base || 0);
      const numericValue = Number(value || 0);

      if (type === "%") {
        return (numericBase * numericValue) / 100;
      }

      return numericValue;
    },

    getTreatmentSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.jumlah || 0);
      const diskon = this.getDiskonAmount(
        base,
        item.diskon_type,
        item.diskon_value,
      );
      const referral = Number(item.diskon_referral || 0);

      return Math.max(base - diskon - referral, 0);
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    getDiskonAmount(base, type, value) {
      const numericBase = Number(base || 0);
      const numericValue = Number(value || 0);

      if (type === "%") {
        return (numericBase * numericValue) / 100;
      }

      return numericValue;
    },

    getTreatmentSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.jumlah || 0);
      const diskon = this.getDiskonAmount(
        base,
        item.diskon_type,
        item.diskon_value,
      );
      const referral = Number(item.diskon_referral || 0);

      return Math.max(base - diskon - referral, 0);
    },

    updateTreatmentMeta({ field, value }) {
      this.form.treatment[field] = value;
    },

    updateTreatmentItem({ index, field, value }) {
      this.form.treatment.items[index][field] = value;

      if (field === "tindakan_id") {
        const tindakan = this.tindakanList.find((x) => x.id === value);
        if (tindakan) {
          this.form.treatment.items[index].harga = tindakan.harga;
        }
      }
    },

    addTreatmentItem() {
      this.form.treatment.items.push({
        tindakan_id: null,
        jumlah: 1,
        beautician_id: null,
        harga: 0,
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
      });
    },

    removeTreatmentItem(index) {
      if (this.form.treatment.items.length === 1) return;
      this.form.treatment.items.splice(index, 1);
    },

    updatePenjualanMeta({ field, value }) {
      this.form.penjualan[field] = value;
    },

    updatePenjualanItem({ index, field, value }) {
      this.form.penjualan.items[index][field] = value;

      if (field === "produk_id") {
        const produk = this.obatList.find((x) => x.id === value);
        if (produk) {
          this.form.penjualan.items[index].harga = produk.harga;
          this.form.penjualan.items[index].unit = produk.unit || "PCS";
        }
      }
    },

    addPenjualanItem() {
      this.form.penjualan.items.push({
        produk_id: null,
        harga: 0,
        jumlah: 1,
        unit: "PCS",
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
        frekuensi: "",
        waktu_pakai: "",
        penggunaan: "",
      });
    },

    removePenjualanItem(index) {
      if (this.form.penjualan.items.length === 1) return;
      this.form.penjualan.items.splice(index, 1);
    },

    handleSubmit() {
      this.submitForm();
    },

    resetForm() {
      this.form = {
        tanggal: this.getToday(),
        pasien_new_id: null,
        dokter_id: null,
        perawat_id: null,

        layanan: {
          ada_konsultasi: true,
          channel_konsultasi: "offline",
          ada_treatment: false,
          ada_penjualan: false,
        },

        konsultasi_offline: {
          keluhan_awal: "",
          catatan: "",
        },

        konsultasi_online: {
          request_dokter: "",
          alergi: "",
          keluhan: "",
          produk_sebelumnya: "",
          sedang_hamil: null,
          sedang_menyusui: null,

          bukti_foto_kiri: "",
          bukti_foto_depan: "",
          bukti_foto_kanan: "",

          preview_before_1: this.defaultImage1,
          preview_before_2: this.defaultImage2,
          preview_before_3: this.defaultImage3,

          file_name_1: "",
          file_name_2: "",
          file_name_3: "",
        },

        treatment: {
          items: [
            {
              tindakan_id: null,
              harga: 0,
              jumlah: 1,
              diskon_type: "%",
              diskon_value: 0,
              diskon_referral: 0,
            },
          ],
        },

        penjualan: {
          poin: 0,
          items: [
            {
              produk_id: null,
              harga: 0,
              jumlah: 1,
              unit: "PCS",
              diskon_type: "%",
              diskon_value: 0,
              diskon_referral: 0,
              frekuensi: "",
              waktu_pakai: "",
              penggunaan: "",
            },
          ],
        },
      };

      this.consultationHistory = [];
    },
  },
};
</script>
<style scoped>
.action-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.action-bar__title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.action-bar__subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.action-bar__right {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-bar__right {
    width: 100%;
    flex-direction: column;
  }

  .action-bar__right .v-btn {
    width: 100%;
  }
}
</style>

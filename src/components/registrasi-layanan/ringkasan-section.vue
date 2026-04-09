<template>
  <div class="mt-3">
    <div class="section-head mb-4">
      <div>
        <div class="section-title">Ringkasan Registrasi</div>
        <div class="section-subtitle">
          Periksa kembali data sebelum disimpan
        </div>
      </div>
    </div>

    <v-row dense>
      <v-col cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Informasi Registrasi</div>

          <div class="summary-row">
            <span>Tanggal</span>
            <strong>{{ form.tanggal || "-" }}</strong>
          </div>

          <div class="summary-row">
            <span>Pasien</span>
            <strong>{{ selectedPatientName }}</strong>
          </div>

          <div class="summary-row">
            <span>Dokter</span>
            <strong>{{ selectedDokterName }}</strong>
          </div>

          <div class="summary-row">
            <span>Perawat</span>
            <strong>{{ selectedPerawatName }}</strong>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Layanan Dipilih</div>

          <div class="summary-row">
            <span>Konsultasi</span>
            <strong>{{ form.layanan?.ada_konsultasi ? "Ya" : "Tidak" }}</strong>
          </div>

          <div class="summary-row">
            <span>Channel</span>
            <strong>{{
              formatChannel(form.layanan?.channel_konsultasi)
            }}</strong>
          </div>

          <div class="summary-row">
            <span>Treatment</span>
            <strong>{{ form.layanan?.ada_treatment ? "Ya" : "Tidak" }}</strong>
          </div>

          <div class="summary-row">
            <span>Penjualan</span>
            <strong>{{ form.layanan?.ada_penjualan ? "Ya" : "Tidak" }}</strong>
          </div>
        </div>
      </v-col>

      <v-col v-if="form.layanan?.ada_treatment" cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Total Treatment</div>
          <div class="summary-total success">
            Rp {{ formatNumber(totalTreatment || 0) }}
          </div>
        </div>
      </v-col>

      <v-col v-if="form.layanan?.ada_penjualan" cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Total Penjualan</div>
          <div class="summary-total info">
            Rp {{ formatNumber(totalPenjualan || 0) }}
          </div>
        </div>
      </v-col>

      <v-col cols="12">
        <div class="summary-box grand">
          <div class="summary-box__title">Grand Total</div>
          <div class="summary-total grand-text">
            Rp {{ formatNumber(grandTotal) }}
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "RingkasanSection",
  props: {
    form: {
      type: Object,
      required: true,
    },
    pasienList: {
      type: Array,
      default: () => [],
    },
    dokterList: {
      type: Array,
      default: () => [],
    },
    perawatList: {
      type: Array,
      default: () => [],
    },
    tindakanList: {
      type: Array,
      default: () => [],
    },
    obatList: {
      type: Array,
      default: () => [],
    },
    totalTreatment: {
      type: Number,
      default: 0,
    },
    totalPenjualan: {
      type: Number,
      default: 0,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    getTreatmentSubtotal: {
      type: Function,
      required: false,
      default: null,
    },
    getPenjualanSubtotal: {
      type: Function,
      required: false,
      default: null,
    },
  },
  computed: {
    grandTotal() {
      return (
        Number(this.totalTreatment || 0) + Number(this.totalPenjualan || 0)
      );
    },
    selectedPatientName() {
      const item = this.pasienList.find(
        (row) => row.id === this.form?.pasien_new_id,
      );
      return item?.nama || item?.text || "-";
    },
    selectedDokterName() {
      const item = this.dokterList.find(
        (row) => row.id === this.form?.dokter_id,
      );
      return item?.nama || "-";
    },
    selectedPerawatName() {
      const item = this.perawatList.find(
        (row) => row.id === this.form?.perawat_id,
      );
      return item?.nama || "-";
    },
  },
  methods: {
    formatChannel(value) {
      if (!value) return "-";
      if (value === "offline") return "Offline";
      if (value === "online") return "Online";
      return value;
    },
  },
};
</script>

<style scoped>
.section-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.summary-box {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 18px;
  background: #fff;
}

.summary-box.grand {
  background: #f8fafc;
}

.summary-box__title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 14px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-total {
  font-size: 22px;
  font-weight: 800;
}

.summary-total.success {
  color: #16a34a;
}

.summary-total.info {
  color: #0284c7;
}

.summary-total.grand-text {
  color: #0f172a;
}
</style>

<template>
  <div class="mt-3">
    <div class="section-head mb-4">
      <div>
        <div class="section-title">Ringkasan Registrasi</div>
        <div class="section-subtitle">
          Periksa kembali data visit, layanan, treatment, dan preview antriannya
          sebelum disimpan
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
            <span>Dokter Awal</span>
            <strong>{{ selectedDokterName }}</strong>
          </div>

          <div class="summary-row">
            <span>Perawat Awal</span>
            <strong>{{ selectedPerawatName }}</strong>
          </div>

          <div class="summary-row">
            <span>Catatan Registrasi</span>
            <strong>{{ form.catatan_registrasi || "-" }}</strong>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Layanan Dipilih</div>

          <div class="summary-row">
            <span>Konsultasi</span>
            <strong>{{ layananState.ada_konsultasi ? "Ya" : "Tidak" }}</strong>
          </div>

          <div class="summary-row">
            <span>Channel Konsultasi</span>
            <strong>{{
              formatChannel(layananState.channel_konsultasi)
            }}</strong>
          </div>

          <div class="summary-row">
            <span>Treatment</span>
            <strong>{{ layananState.ada_treatment ? "Ya" : "Tidak" }}</strong>
          </div>

          <div class="summary-row">
            <span>Perlu Tindakan Perawat</span>
            <strong>{{
              formatPerawatFlag(treatmentState.perlu_tindakan_perawat)
            }}</strong>
          </div>

          <div class="summary-row">
            <span>Penjualan Produk</span>
            <strong>{{ layananState.ada_penjualan ? "Ya" : "Tidak" }}</strong>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Preview Antrian & Task</div>

          <div class="summary-row">
            <span>Antrian Aktif Awal</span>
            <strong>{{ queueSummary.antrianAwal }}</strong>
          </div>

          <div class="summary-row">
            <span>Task Berikutnya</span>
            <strong>{{ queueSummary.taskBerikutnya }}</strong>
          </div>

          <div class="summary-row">
            <span>Flow Penjualan</span>
            <strong>{{ queueSummary.penjualanFlow }}</strong>
          </div>

          <div class="summary-row">
            <span>Status Simpan</span>
            <strong :class="isReadyToSave ? 'text-success' : 'text-error'">
              {{ isReadyToSave ? "Siap disimpan" : "Belum lengkap" }}
            </strong>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Checklist Validasi</div>

          <template v-if="validationIssues.length">
            <div
              v-for="(issue, index) in validationIssues"
              :key="index"
              class="issue-item"
            >
              {{ issue }}
            </div>
          </template>

          <template v-else>
            <div class="ok-item">
              Semua data minimum untuk registrasi FO sudah lengkap.
            </div>
          </template>
        </div>
      </v-col>

      <v-col v-if="layananState.ada_treatment" cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Ringkasan Treatment</div>

          <div class="summary-row">
            <span>Jumlah Item Treatment</span>
            <strong>{{ treatmentItemCount }} item</strong>
          </div>

          <div class="summary-row">
            <span>Routing Treatment</span>
            <strong>{{ treatmentRoutingLabel }}</strong>
          </div>

          <div class="summary-row">
            <span>Total Treatment</span>
            <strong class="text-success">
              Rp {{ formatNumber(totalTreatment || 0) }}
            </strong>
          </div>
        </div>
      </v-col>

      <v-col v-if="layananState.ada_penjualan" cols="12" md="6">
        <div class="summary-box">
          <div class="summary-box__title">Ringkasan Penjualan</div>

          <div class="summary-row">
            <span>Total Penjualan</span>
            <strong class="text-info">
              Rp {{ formatNumber(totalPenjualan || 0) }}
            </strong>
          </div>
        </div>
      </v-col>

      <v-col
        v-if="
          Number(totalTreatment || 0) > 0 || Number(totalPenjualan || 0) > 0
        "
        cols="12"
      >
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
  },
  computed: {
    layananState() {
      return {
        ada_konsultasi: false,
        channel_konsultasi: "",
        ada_treatment: false,
        ada_penjualan: false,
        ...(this.form?.layanan || {}),
      };
    },

    treatmentState() {
      return {
        perlu_tindakan_perawat: null,
        items: [],
        ...(this.form?.treatment || {}),
      };
    },

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

    treatmentItemCount() {
      return (this.treatmentState.items || []).filter(
        (item) => item?.tindakan_id,
      ).length;
    },

    treatmentRoutingLabel() {
      if (!this.layananState.ada_treatment) {
        return "-";
      }

      if (this.treatmentState.perlu_tindakan_perawat === true) {
        return "Masuk Nurse Station";
      }

      if (this.treatmentState.perlu_tindakan_perawat === false) {
        return "Tetap di Jalur Dokter";
      }

      return "Belum ditentukan";
    },

    validationIssues() {
      const issues = [];

      if (!this.form?.tanggal) {
        issues.push("Tanggal registrasi belum diisi.");
      }

      if (!this.form?.pasien_new_id) {
        issues.push("Pasien belum dipilih.");
      }

      if (
        !this.layananState.ada_konsultasi &&
        !this.layananState.ada_treatment &&
        !this.layananState.ada_penjualan
      ) {
        issues.push("Minimal satu layanan wajib dipilih.");
      }

      if (
        this.layananState.ada_konsultasi &&
        !this.layananState.channel_konsultasi
      ) {
        issues.push("Channel konsultasi belum dipilih.");
      }

      if (this.layananState.ada_treatment) {
        if (!this.treatmentItemCount) {
          issues.push("Minimal satu item treatment harus dipilih.");
        }

        if (this.treatmentState.perlu_tindakan_perawat === null) {
          issues.push("Field 'Perlu Tindakan Perawat' belum dipilih.");
        }
      }

      return issues;
    },

    isReadyToSave() {
      return this.validationIssues.length === 0;
    },

    queueSummary() {
      let antrianAwal = "-";
      let taskBerikutnya = "-";
      let penjualanFlow = "-";

      if (this.layananState.ada_konsultasi) {
        antrianAwal = "Antrian Konsultasi";
      } else if (
        this.layananState.ada_treatment &&
        this.treatmentState.perlu_tindakan_perawat === true
      ) {
        antrianAwal = "Antrian Tindakan";
      } else if (this.layananState.ada_treatment) {
        antrianAwal = "Pelayanan Medis / Dokter";
      } else if (this.layananState.ada_penjualan) {
        antrianAwal = "Pembayaran / Penjualan Produk";
      }

      if (
        this.layananState.ada_konsultasi &&
        this.layananState.ada_treatment &&
        this.treatmentState.perlu_tindakan_perawat === true
      ) {
        taskBerikutnya = "Masuk Antrian Tindakan setelah konsultasi selesai";
      } else if (
        this.layananState.ada_konsultasi &&
        this.layananState.ada_treatment &&
        this.treatmentState.perlu_tindakan_perawat === false
      ) {
        taskBerikutnya =
          "Treatment tetap ditangani dokter dalam encounter yang sama";
      } else if (
        this.layananState.ada_treatment &&
        this.treatmentState.perlu_tindakan_perawat === true
      ) {
        taskBerikutnya = "Masuk Antrian Tindakan";
      } else if (
        this.layananState.ada_konsultasi ||
        this.layananState.ada_treatment
      ) {
        taskBerikutnya = "Lanjut ke pembayaran setelah layanan selesai";
      }

      if (
        this.layananState.ada_penjualan &&
        (this.layananState.ada_konsultasi || this.layananState.ada_treatment)
      ) {
        penjualanFlow = "Produk ikut pada transaksi kunjungan";
      } else if (this.layananState.ada_penjualan) {
        penjualanFlow = "Langsung ke pembayaran";
      }

      return {
        antrianAwal,
        taskBerikutnya,
        penjualanFlow,
      };
    },
  },
  methods: {
    formatChannel(value) {
      if (!value) return "-";
      if (value === "offline") return "Offline";
      if (value === "online") return "Online";
      return value;
    },

    formatPerawatFlag(value) {
      if (value === true) return "Ya";
      if (value === false) return "Tidak";
      return "Belum dipilih";
    },
  },
};
</script>

<style scoped>
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

.summary-total.grand-text {
  color: #0f172a;
}

.issue-item {
  font-size: 13px;
  color: #b91c1c;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.18);
  margin-bottom: 10px;
}

.issue-item:last-child {
  margin-bottom: 0;
}

.ok-item {
  font-size: 13px;
  color: #166534;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.18);
}

.text-success {
  color: #16a34a;
}

.text-error {
  color: #dc2626;
}

.text-info {
  color: #0284c7;
}

@media (max-width: 768px) {
  .summary-row {
    flex-direction: column;
    gap: 6px;
  }
}
</style>

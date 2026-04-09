<template>
  <v-card elevation="2" class="mb-5">
    <v-card-text class="pa-6">
      <div class="section-header mb-5">
        <div>
          <div class="section-title">Ringkasan Registrasi</div>
          <div class="section-subtitle">
            Periksa kembali data registrasi, layanan, dan estimasi total sebelum
            disimpan
          </div>
        </div>

        <v-chip
          color="success"
          variant="tonal"
          prepend-icon="mdi-clipboard-check-outline"
        >
          Step Akhir - Review
        </v-chip>
      </div>

      <v-alert
        type="warning"
        variant="tonal"
        rounded="lg"
        border="start"
        class="mb-5"
      >
        Pastikan semua data sudah benar. Ringkasan ini hanya menampilkan preview
        sebelum proses simpan.
      </v-alert>

      <v-row dense>
        <!-- INFORMASI REGISTRASI -->
        <v-col cols="12" lg="6">
          <div class="group-wrap h-100">
            <div class="group-head mb-4">
              <div class="group-title">
                <v-icon class="mr-2" color="primary"
                  >mdi-account-card-details-outline</v-icon
                >
                Informasi Registrasi
              </div>
              <div class="group-subtitle">
                Data dasar pasien dan penanggung jawab
              </div>
            </div>

            <div class="summary-list">
              <div class="summary-row">
                <div class="summary-label">Tanggal Registrasi</div>
                <div class="summary-value">{{ form.tanggal || "-" }}</div>
              </div>

              <div class="summary-row">
                <div class="summary-label">Pasien</div>
                <div class="summary-value">{{ selectedPatientName }}</div>
              </div>

              <div class="summary-row">
                <div class="summary-label">Dokter</div>
                <div class="summary-value">{{ selectedDokterName }}</div>
              </div>

              <div class="summary-row">
                <div class="summary-label">Perawat / Beautician</div>
                <div class="summary-value">{{ selectedPerawatName }}</div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- PILIHAN LAYANAN -->
        <v-col cols="12" lg="6">
          <div class="group-wrap h-100">
            <div class="group-head mb-4">
              <div class="group-title">
                <v-icon class="mr-2" color="primary"
                  >mdi-format-list-checks</v-icon
                >
                Layanan Dipilih
              </div>
              <div class="group-subtitle">
                Jenis layanan yang aktif pada registrasi ini
              </div>
            </div>

            <div class="service-chip-wrap mb-4">
              <v-chip
                :color="form.layanan.ada_konsultasi ? 'primary' : 'grey'"
                variant="tonal"
                size="small"
              >
                Konsultasi:
                {{ form.layanan.ada_konsultasi ? " Ya" : " Tidak" }}
              </v-chip>

              <v-chip
                :color="form.layanan.ada_treatment ? 'success' : 'grey'"
                variant="tonal"
                size="small"
              >
                Treatment:
                {{ form.layanan.ada_treatment ? " Ya" : " Tidak" }}
              </v-chip>

              <v-chip
                :color="form.layanan.ada_penjualan ? 'info' : 'grey'"
                variant="tonal"
                size="small"
              >
                Penjualan:
                {{ form.layanan.ada_penjualan ? " Ya" : " Tidak" }}
              </v-chip>
            </div>

            <div class="summary-list">
              <div class="summary-row">
                <div class="summary-label">Channel Konsultasi</div>
                <div class="summary-value">
                  {{
                    form.layanan.ada_konsultasi
                      ? formatChannel(form.layanan.channel_konsultasi)
                      : "-"
                  }}
                </div>
              </div>

              <div class="summary-row">
                <div class="summary-label">Jumlah Item Treatment</div>
                <div class="summary-value">
                  {{
                    form.layanan.ada_treatment ? form.treatment.items.length : 0
                  }}
                </div>
              </div>

              <div class="summary-row">
                <div class="summary-label">Jumlah Item Penjualan</div>
                <div class="summary-value">
                  {{
                    form.layanan.ada_penjualan ? form.penjualan.items.length : 0
                  }}
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- KONSULTASI -->
        <v-col v-if="form.layanan.ada_konsultasi" cols="12" lg="6">
          <div class="group-wrap h-100">
            <div class="group-head mb-4">
              <div class="group-title">
                <v-icon class="mr-2" color="primary">mdi-stethoscope</v-icon>
                Ringkasan Konsultasi
              </div>
              <div class="group-subtitle">
                Preview data konsultasi yang sudah diisi
              </div>
            </div>

            <template v-if="form.layanan.channel_konsultasi === 'offline'">
              <div class="summary-list">
                <div class="summary-row summary-row--block">
                  <div class="summary-label">Keluhan Awal</div>
                  <div class="summary-value summary-value--multiline">
                    {{ form.konsultasi_offline?.keluhan_awal || "-" }}
                  </div>
                </div>

                <div class="summary-row summary-row--block">
                  <div class="summary-label">Catatan</div>
                  <div class="summary-value summary-value--multiline">
                    {{ form.konsultasi_offline?.catatan || "-" }}
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="form.layanan.channel_konsultasi === 'online'">
              <div class="summary-list">
                <div class="summary-row">
                  <div class="summary-label">Request Dokter</div>
                  <div class="summary-value">
                    {{ form.konsultasi_online?.request_dokter || "-" }}
                  </div>
                </div>

                <div class="summary-row summary-row--block">
                  <div class="summary-label">Alergi</div>
                  <div class="summary-value summary-value--multiline">
                    {{ form.konsultasi_online?.alergi || "-" }}
                  </div>
                </div>

                <div class="summary-row summary-row--block">
                  <div class="summary-label">Keluhan</div>
                  <div class="summary-value summary-value--multiline">
                    {{ form.konsultasi_online?.keluhan || "-" }}
                  </div>
                </div>

                <div class="summary-row">
                  <div class="summary-label">Sedang Hamil</div>
                  <div class="summary-value">
                    {{ form.konsultasi_online?.sedang_hamil || "-" }}
                  </div>
                </div>

                <div class="summary-row">
                  <div class="summary-label">Sedang Menyusui</div>
                  <div class="summary-value">
                    {{ form.konsultasi_online?.sedang_menyusui || "-" }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </v-col>

        <!-- TOTAL -->
        <v-col cols="12" lg="6">
          <div class="group-wrap h-100">
            <div class="group-head mb-4">
              <div class="group-title">
                <v-icon class="mr-2" color="success">mdi-cash-multiple</v-icon>
                Estimasi Total
              </div>
              <div class="group-subtitle">
                Akumulasi sementara dari treatment dan penjualan
              </div>
            </div>

            <div class="total-summary">
              <div class="total-item">
                <div class="total-item__label">Total Treatment</div>
                <div class="total-item__value">
                  Rp {{ formatNumber(totalTreatment || 0) }}
                </div>
              </div>

              <div class="total-item">
                <div class="total-item__label">Total Penjualan</div>
                <div class="total-item__value">
                  Rp {{ formatNumber(totalPenjualan || 0) }}
                </div>
              </div>

              <div class="grand-total">
                <div class="grand-total__label">Grand Total</div>
                <div class="grand-total__value">
                  Rp {{ formatNumber(grandTotal) }}
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- DETAIL ITEM TREATMENT -->
        <v-col
          v-if="form.layanan.ada_treatment && form.treatment.items.length"
          cols="12"
        >
          <div class="group-wrap">
            <div class="group-head mb-4">
              <div class="group-title">
                <v-icon class="mr-2" color="success">mdi-spa</v-icon>
                Detail Treatment
              </div>
              <div class="group-subtitle">
                Daftar treatment yang akan diproses
              </div>
            </div>

            <v-table density="comfortable" class="summary-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Treatment</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Harga</th>
                  <th class="text-right">Diskon</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in form.treatment.items"
                  :key="'treatment-' + index"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ getTreatmentName(item.tindakan_id) }}</td>
                  <td class="text-right">{{ item.jumlah || 0 }}</td>
                  <td class="text-right">
                    Rp {{ formatNumber(item.harga || 0) }}
                  </td>
                  <td class="text-right">{{ formatDiskon(item) }}</td>
                  <td class="text-right">
                    Rp {{ formatNumber(getTreatmentSubtotal(item)) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-col>

        <!-- DETAIL ITEM PENJUALAN -->
        <v-col
          v-if="form.layanan.ada_penjualan && form.penjualan.items.length"
          cols="12"
        >
          <div class="group-wrap">
            <div class="group-head mb-4">
              <div class="group-title">
                <v-icon class="mr-2" color="info">mdi-pill</v-icon>
                Detail Penjualan
              </div>
              <div class="group-subtitle">
                Daftar produk atau obat yang akan diproses
              </div>
            </div>

            <v-table density="comfortable" class="summary-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Produk</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Harga</th>
                  <th class="text-right">Diskon</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in form.penjualan.items"
                  :key="'penjualan-' + index"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ getProdukName(item.produk_id) }}</td>
                  <td class="text-right">{{ item.jumlah || 0 }}</td>
                  <td class="text-right">
                    Rp {{ formatNumber(item.harga || 0) }}
                  </td>
                  <td class="text-right">{{ formatDiskon(item) }}</td>
                  <td class="text-right">
                    Rp {{ formatNumber(getPenjualanSubtotal(item)) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
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
      required: true,
    },
    getPenjualanSubtotal: {
      type: Function,
      required: true,
    },
  },
  computed: {
    grandTotal() {
      return (
        Number(this.totalTreatment || 0) + Number(this.totalPenjualan || 0)
      );
    },
    selectedPatientName() {
      const patient = this.pasienList.find(
        (item) => item.id === this.form.pasien_new_id,
      );
      return patient?.nama || patient?.text || "-";
    },
    selectedDokterName() {
      const dokter = this.dokterList.find(
        (item) => item.id === this.form.dokter_id,
      );
      return dokter?.nama || "-";
    },
    selectedPerawatName() {
      const perawat = this.perawatList.find(
        (item) => item.id === this.form.perawat_id,
      );
      return perawat?.nama || "-";
    },
  },
  methods: {
    formatChannel(value) {
      if (!value) return "-";
      if (value === "offline") return "Offline";
      if (value === "online") return "Online";
      return value;
    },
    getTreatmentName(id) {
      const item = this.tindakanList.find((row) => row.id === id);
      return item?.nama || "-";
    },
    getProdukName(id) {
      const item = this.obatList.find((row) => row.id === id);
      return item?.nama || "-";
    },
    formatDiskon(item) {
      const type = item?.diskon_type || "%";
      const value = Number(item?.diskon_value || 0);

      if (!value) return "-";

      return type === "Rp"
        ? `Rp ${this.formatNumber(value)}`
        : `${this.formatNumber(value)}%`;
    },
  },
};
</script>

<style scoped>
.ringkasan-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.section-header {
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
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.group-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 20px;
  background: #fff;
}

.group-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.group-subtitle {
  font-size: 13px;
  color: #6b7280;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e5e7eb;
}

.summary-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-row--block {
  display: block;
}

.summary-label {
  min-width: 160px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.summary-value {
  flex: 1;
  text-align: right;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

.summary-value--multiline {
  text-align: left;
  white-space: pre-line;
  line-height: 1.6;
  margin-top: 8px;
  font-weight: 500;
}

.service-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.total-summary {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.total-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #f8fafc;
}

.total-item__label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.total-item__value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.grand-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(var(--v-theme-success), 0.08);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

.grand-total__label {
  font-size: 15px;
  font-weight: 700;
  color: #166534;
}

.grand-total__value {
  font-size: 24px;
  font-weight: 800;
  color: #166534;
}

.summary-table {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
}

.h-100 {
  height: 100%;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .group-wrap {
    padding: 16px;
  }

  .summary-row {
    flex-direction: column;
    gap: 6px;
  }

  .summary-value {
    text-align: left;
  }

  .grand-total {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

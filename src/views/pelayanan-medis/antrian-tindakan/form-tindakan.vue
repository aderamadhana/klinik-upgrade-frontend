<template>
  <div class="tindakan-page">
    <div class="page-header d-flex justify-space-between align-start mb-6">
      <div>
        <h1 class="page-title">Formulir Perawatan</h1>
        <p class="page-subtitle">
          Input tindakan/perawatan pasien dari antrian tindakan
        </p>
      </div>

      <div class="d-flex gap-2">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-arrow-left"
          @click="$router.back()"
        >
          Kembali
        </v-btn>
      </div>
    </div>

    <v-card class="main-card">
      <div class="section-header">Form Tindakan Pasien</div>

      <v-card-text class="pa-5">
        <v-alert type="info" variant="tonal" class="mb-6">
          Lengkapi data tindakan/perawatan pasien sebelum disimpan.
        </v-alert>

        <div class="form-group-title">Data Kunjungan</div>

        <div class="patient-detail-card mb-6">
          <div class="patient-detail-grid">
            <div class="patient-detail-item">
              <div class="patient-detail-label">Tanggal</div>
              <div class="patient-detail-value">{{ form.tanggal }}</div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">Pasien</div>
              <div class="patient-detail-value">{{ form.pasien }}</div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">Kwitansi</div>
              <div class="patient-detail-value">{{ form.kwitansi || "-" }}</div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">Dokter</div>
              <div class="patient-detail-value">{{ form.dokter || "-" }}</div>
            </div>
          </div>
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Informasi Utama</div>

        <v-row class="mb-2">
          <v-col cols="12" md="6">
            <v-select
              v-model="form.perlu_tindakan_perawat"
              :items="opsiPerluTindakan"
              label="Perlu Tindakan Perawat"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
        </v-row>

        <div class="form-divider"></div>
        <div class="form-group-title">Daftar Tindakan</div>

        <div class="simple-table-head">
          <div>Nama Tindakan</div>
          <div>Harga</div>
          <div>Jumlah</div>
          <div>Total</div>
          <div>Aksi</div>
        </div>

        <div
          v-for="(item, index) in tindakanItems"
          :key="`tindakan-${index}`"
          class="item-row"
        >
          <v-row>
            <v-col cols="12" md="5">
              <v-select
                v-model="item.tindakan_id"
                :items="tindakanOptions"
                item-title="label"
                item-value="value"
                label="Nama Tindakan"
                variant="outlined"
                density="comfortable"
                @update:modelValue="handleTindakanChange(item)"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model="item.harga"
                label="Harga"
                variant="outlined"
                density="comfortable"
                readonly
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model.number="item.jumlah"
                label="Jumlah"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                @input="updateTindakanTotal(item)"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model="item.total"
                label="Total"
                variant="outlined"
                density="comfortable"
                readonly
              />
            </v-col>

            <v-col cols="12" md="1">
              <div class="row-actions">
                <v-btn
                  color="warning"
                  icon="mdi-plus"
                  @click="addTindakanRow"
                />
                <v-btn
                  color="error"
                  icon="mdi-minus"
                  :disabled="tindakanItems.length === 1"
                  @click="removeTindakanRow(index)"
                />
              </div>
            </v-col>
          </v-row>
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Selesai</div>

        <div class="payment-summary">
          <div class="payment-summary-label">Total Pembayaran</div>
          <div class="payment-summary-value">
            {{ formatRupiah(grandTotal) }}
          </div>
        </div>

        <div class="footer-actions">
          <v-btn
            variant="outlined"
            color="secondary"
            size="large"
            @click="$router.back()"
          >
            Batal
          </v-btn>

          <v-btn
            color="success"
            size="large"
            prepend-icon="mdi-content-save"
            @click="submitForm"
          >
            Simpan
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "FormTindakan",
  data() {
    return {
      form: {
        tanggal: "2026-04-20",
        pasien: "ADE RAMADHANA PRATAMA (tak buat tes kak)",
        kwitansi: "",
        dokter: "-",
        perlu_tindakan_perawat: "Pilih",
      },

      opsiPerluTindakan: ["Pilih", "Ya", "Tidak"],

      tindakanOptions: [
        { label: "FACIAL BARBIE LIGHT", value: 1, harga: 245000 },
        { label: "FACIAL ACNE", value: 2, harga: 250000 },
        { label: "LASER TONING", value: 3, harga: 450000 },
        { label: "CHEMICAL PEELING", value: 4, harga: 300000 },
        { label: "INFUS WHITENING", value: 5, harga: 350000 },
      ],

      tindakanItems: [
        {
          tindakan_id: 1,
          harga: 245000,
          jumlah: 1,
          total: 245000,
        },
      ],
    };
  },

  computed: {
    grandTotal() {
      return this.tindakanItems.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      );
    },
  },

  methods: {
    createEmptyTindakanRow() {
      return {
        tindakan_id: null,
        harga: 0,
        jumlah: 1,
        total: 0,
      };
    },

    handleTindakanChange(item) {
      const selected = this.tindakanOptions.find(
        (x) => x.value === item.tindakan_id,
      );
      item.harga = selected ? selected.harga : 0;
      this.updateTindakanTotal(item);
    },

    updateTindakanTotal(item) {
      const harga = Number(item.harga || 0);
      const jumlah = Number(item.jumlah || 0);
      item.total = harga * jumlah;
    },

    addTindakanRow() {
      this.tindakanItems.push(this.createEmptyTindakanRow());
    },

    removeTindakanRow(index) {
      if (this.tindakanItems.length > 1) {
        this.tindakanItems.splice(index, 1);
      }
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    submitForm() {
      const payload = {
        ...this.form,
        detail_tindakan: this.tindakanItems,
        total_pembayaran: this.grandTotal,
      };

      console.log("Submit Form Tindakan:", payload);

      this.$router.push("/pelayanan-medis/antrian-tindakan");
    },
  },
};
</script>

<style scoped>
.tindakan-page {
  padding-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.gap-2 {
  gap: 8px;
}

.main-card {
  border-radius: 10px !important;
  border: 1px solid #e5e7eb;
  box-shadow: none !important;
  overflow: hidden;
}

.section-header {
  font-size: 18px;
  font-weight: 700;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.form-group-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

.form-divider {
  border-top: 1px solid #e5e7eb;
  margin: 28px 0 24px;
}

.patient-detail-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.patient-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px 16px;
}

.patient-detail-item {
  border: 1px solid #eef2f7;
  border-radius: 6px;
  padding: 12px 14px;
  background: #f8fafc;
}

.patient-detail-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.patient-detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  word-break: break-word;
}

.simple-table-head {
  display: grid;
  grid-template-columns: 2.4fr 1fr 1fr 1fr 90px;
  gap: 12px;
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  margin-bottom: 10px;
  padding: 0 4px;
}

.item-row {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
}

.row-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.payment-summary {
  display: grid;
  grid-template-columns: 1fr 320px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.payment-summary-label {
  padding: 22px 20px;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: #fff;
}

.payment-summary-value {
  padding: 22px 20px;
  font-size: 28px;
  font-weight: 800;
  text-align: right;
  background: #f59e0b;
  color: #111827;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

:deep(.v-field) {
  border-radius: 6px !important;
}

@media (max-width: 1264px) {
  .patient-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .simple-table-head {
    display: none;
  }

  .payment-summary {
    grid-template-columns: 1fr;
  }

  .payment-summary-label {
    justify-content: flex-start;
  }

  .payment-summary-value {
    font-size: 24px;
  }

  .footer-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .patient-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

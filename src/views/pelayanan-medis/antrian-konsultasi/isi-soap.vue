<template>
  <div class="soap-page">
    <div class="page-header d-flex justify-space-between align-start mb-6">
      <div>
        <h1 class="page-title">Isi SOAP</h1>
        <p class="page-subtitle">
          Input SOAP, resep, dan treatment pasien konsultasi
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
      <div class="section-header">Form SOAP Pasien</div>

      <v-card-text class="pa-5">
        <v-alert type="info" variant="tonal" class="mb-6">
          Lengkapi data SOAP, resep, dan treatment pasien sebelum diselesaikan.
        </v-alert>

        <!-- INFORMASI MEDIS PENDAFTARAN (KHUSUS KONSULTASI ONLINE) -->
        <div v-if="isOnlineConsultation" class="mb-6">
          <div class="form-group-title">Informasi Medis Pendaftaran</div>

          <div class="online-medical-card">
            <div class="online-medical-header">
              <v-icon size="20" class="mr-2">mdi-stethoscope</v-icon>
              <span>Informasi Medis Pendaftaran</span>
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="onlineRegistration.alergi"
                  label="Alergi *"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  auto-grow
                  readonly
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-textarea
                  v-model="onlineRegistration.keluhan_utama"
                  label="Keluhan Utama *"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  auto-grow
                  readonly
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-textarea
                  v-model="onlineRegistration.produk_sebelumnya"
                  label="Produk yang Dipakai Sebelumnya"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  auto-grow
                  readonly
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="onlineRegistration.sedang_hamil"
                  label="Sedang Hamil? *"
                  variant="outlined"
                  density="comfortable"
                  readonly
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="onlineRegistration.sedang_menyusui"
                  label="Sedang Menyusui? *"
                  variant="outlined"
                  density="comfortable"
                  readonly
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="onlineRegistration.catatan_cs"
                  label="Catatan Tambahan Customer Service"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  auto-grow
                  readonly
                />
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- DATA PASIEN -->
        <div class="form-group-title">Data Pasien</div>

        <div class="patient-detail-card mb-6">
          <div class="patient-detail-grid">
            <div class="patient-detail-item">
              <div class="patient-detail-label">Nama Pasien</div>
              <div class="patient-detail-value">{{ patient.nama_pasien }}</div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">No. RM</div>
              <div class="patient-detail-value">{{ patient.no_rm }}</div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">No. Telepon</div>
              <div class="patient-detail-value">{{ patient.no_hp }}</div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">Tanggal Kunjungan</div>
              <div class="patient-detail-value">
                {{ patient.tanggal_kunjungan }}
              </div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">Waktu Kunjungan</div>
              <div class="patient-detail-value">
                {{ patient.waktu_kunjungan }}
              </div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">Dokter</div>
              <div class="patient-detail-value">{{ patient.dokter }}</div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">Klinik</div>
              <div class="patient-detail-value">{{ patient.klinik }}</div>
            </div>

            <div class="patient-detail-item">
              <div class="patient-detail-label">Channel</div>
              <div class="patient-detail-value">{{ patient.channel }}</div>
            </div>
          </div>

          <div class="top-action-row mt-4">
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-clipboard-text-outline"
              @click="goToPengkajianAwal"
            >
              Pengkajian Awal
            </v-btn>

            <v-btn
              color="info"
              variant="flat"
              prepend-icon="mdi-face-recognition"
            >
              Skin Analyzer
            </v-btn>
          </div>
        </div>

        <!-- SOAP -->
        <div class="form-divider"></div>
        <div class="form-group-title">SOAP</div>

        <v-row>
          <v-col cols="12" md="6">
            <div class="block-section">
              <div class="block-title">Subjective (S)</div>

              <v-select
                v-model="form.subjective_selected"
                :items="subjectiveOptions"
                label="Select Subjective"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                closable-chips
                class="mb-4"
              />

              <v-textarea
                v-model="form.subjective_lainnya"
                label="Lainnya Subjective"
                variant="outlined"
                rows="4"
                auto-grow
              />
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="block-section">
              <div class="block-title">Objective (O)</div>

              <v-textarea
                v-model="form.objective"
                label="Objective"
                variant="outlined"
                rows="8"
                auto-grow
              />
            </div>
          </v-col>

          <v-col cols="12">
            <div class="block-section">
              <div class="block-title">Assessment (A)</div>

              <v-select
                v-model="form.assessment_selected"
                :items="diagnosaOptions"
                label="Select Diagnosa"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                closable-chips
                class="mb-4"
              />

              <v-textarea
                v-model="form.assessment_lainnya"
                label="Lainnya Assessment"
                variant="outlined"
                rows="3"
                auto-grow
              />
            </div>
          </v-col>
        </v-row>

        <!-- RIWAYAT -->
        <div class="form-divider"></div>
        <div class="form-group-title">Riwayat Transaksi Pasien</div>

        <v-data-table
          :headers="riwayatHeaders"
          :items="riwayatTransaksi"
          item-value="id"
          class="table-section mb-6"
          density="comfortable"
        >
          <template #item.tindakan_perawat="{ item }">
            <div
              class="text-body-2"
              v-html="formatList(item.tindakan_perawat)"
            ></div>
          </template>

          <template #item.obat="{ item }">
            <div class="text-body-2" v-html="formatList(item.obat)"></div>
          </template>

          <template #item.catatan="{ item }">
            <div style="white-space: pre-line">{{ item.catatan }}</div>
          </template>
        </v-data-table>

        <!-- RESEP -->
        <div class="form-divider"></div>
        <div class="form-group-title">Resep</div>

        <div class="block-section mb-6">
          <div class="block-title">Plan (P)</div>

          <v-textarea
            v-model="form.plan"
            label="Plan"
            variant="outlined"
            rows="3"
            auto-grow
            class="mb-4"
          />

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.next_date_konsultasi"
                label="Next Date Konsultasi"
                variant="outlined"
                type="date"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </div>

        <div class="simple-table-head">
          <div>Obat</div>
          <div>Harga</div>
          <div>Jumlah</div>
          <div>Total</div>
          <div>Aksi</div>
        </div>

        <div
          v-for="(item, index) in obatItems"
          :key="`obat-${index}`"
          class="item-row"
        >
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="item.obat_id"
                :items="obatOptions"
                item-title="label"
                item-value="value"
                label="Obat"
                variant="outlined"
                density="comfortable"
                @update:modelValue="handleObatChange(item)"
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
                min="0"
                variant="outlined"
                density="comfortable"
                @input="updateObatTotal(item)"
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

            <v-col cols="12" md="2">
              <div class="row-actions">
                <v-btn color="warning" icon="mdi-plus" @click="addObatRow" />
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  :disabled="obatItems.length === 1"
                  @click="removeObatRow(index)"
                />
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="item.frekuensi"
                :items="frekuensiOptions"
                label="Frekuensi"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                v-model="item.waktu_pakai"
                :items="waktuPakaiOptions"
                label="Waktu Pakai"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-textarea
                v-model="item.penggunaan"
                label="Penggunaan"
                variant="outlined"
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
        </div>

        <!-- TREATMENT -->
        <div class="form-divider"></div>
        <div class="form-group-title">Treatment</div>

        <div class="simple-table-head">
          <div>Nama Tindakan</div>
          <div>Harga</div>
          <div>Jumlah</div>
          <div>Total</div>
          <div>Aksi</div>
        </div>

        <div
          v-for="(item, index) in treatmentItems"
          :key="`treatment-${index}`"
          class="item-row"
        >
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="item.treatment_id"
                :items="treatmentOptions"
                item-title="label"
                item-value="value"
                label="Nama Tindakan"
                variant="outlined"
                density="comfortable"
                @update:modelValue="handleTreatmentChange(item)"
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
                min="0"
                variant="outlined"
                density="comfortable"
                @input="updateTreatmentTotal(item)"
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

            <v-col cols="12" md="2">
              <div class="row-actions">
                <v-btn
                  color="warning"
                  icon="mdi-plus"
                  @click="addTreatmentRow"
                />
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  :disabled="treatmentItems.length === 1"
                  @click="removeTreatmentRow(index)"
                />
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- FOOTER -->
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
            color="error"
            size="large"
            prepend-icon="mdi-check-circle-outline"
            @click="submitForm"
          >
            Selesai
          </v-btn>

          <v-btn
            variant="outlined"
            color="secondary"
            size="large"
            @click="$router.back()"
          >
            Batal
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "IsiSoap",
  data() {
    return {
      patient: {
        nama_pasien: "ADE RAMADHANA PRATAMA",
        no_rm: "M20260307001",
        no_hp: "6281234567890",
        tanggal_kunjungan: "2026-04-20",
        waktu_kunjungan: "09:00",
        dokter: "Dr. Rayi Vialita Poetri",
        klinik: "MALANG",
        channel: "Online",
      },

      onlineRegistration: {
        alergi: "-",
        keluhan_utama: "Terkadang kering di area sekitar mulut dan hidung",
        produk_sebelumnya:
          "skin barrier nutri cream 2 (pagi & malam)\n?white glow 3 (pagi)",
        sedang_hamil: "tidak",
        sedang_menyusui: "tidak",
        catatan_cs: "",
      },

      form: {
        subjective_selected: [],
        subjective_lainnya: "",
        objective: "",
        assessment_selected: [],
        assessment_lainnya: "",
        plan: "",
        next_date_konsultasi: "",
      },

      subjectiveOptions: [
        "Jerawat meradang",
        "Kulit kusam",
        "Flek wajah",
        "Bruntusan",
        "Kulit berminyak",
        "Bekas jerawat",
      ],

      diagnosaOptions: [
        "Acne Vulgaris",
        "Post Inflammatory Hyperpigmentation",
        "Melasma",
        "Seborrheic Skin",
        "Sensitive Skin",
      ],

      obatOptions: [
        { label: "DUAL CREAM MORNING", value: 1, harga: 100000 },
        { label: "CALM BLEMISH MOISTURIZER", value: 2, harga: 120000 },
        { label: "PAPER BAG WOMEN MEDIUM", value: 3, harga: 5000 },
        { label: "ACNE FIGHT TONER", value: 4, harga: 95000 },
      ],

      treatmentOptions: [
        { label: "KONSUL DOKTER", value: 1, harga: 100000 },
        { label: "FACIAL ACNE", value: 2, harga: 250000 },
        { label: "LASER TONING", value: 3, harga: 450000 },
      ],

      frekuensiOptions: ["1x sehari", "2x sehari", "3x sehari", "Jika perlu"],
      waktuPakaiOptions: ["Pagi", "Siang", "Malam", "Pagi & Malam"],

      obatItems: [
        {
          obat_id: null,
          harga: 0,
          jumlah: 0,
          total: 0,
          frekuensi: null,
          waktu_pakai: null,
          penggunaan: "",
        },
      ],

      treatmentItems: [
        {
          treatment_id: 1,
          harga: 100000,
          jumlah: 1,
          total: 100000,
        },
      ],

      riwayatHeaders: [
        { title: "TGL", key: "tgl", sortable: false },
        { title: "DOKTER", key: "dokter", sortable: false },
        {
          title: "TINDAKAN & PERAWAT",
          key: "tindakan_perawat",
          sortable: false,
        },
        { title: "OBAT", key: "obat", sortable: false },
        { title: "CATATAN", key: "catatan", sortable: false },
        { title: "TRANSAKSI", key: "transaksi", sortable: false },
        { title: "KLINIK", key: "klinik", sortable: false },
      ],

      riwayatTransaksi: [
        {
          id: 1,
          tgl: "2026-03-07",
          dokter: "-",
          tindakan_perawat: [],
          obat: [
            "DUAL CREAM MORNING | x3",
            "CALM BLEMISH MOISTURIZER | x1",
            "PAPER BAG WOMEN MEDIUM | x1",
          ],
          catatan: "Catatan FO :\nPAKAI VC BULAN FEB MAR 300K",
          transaksi: "UMUM",
          klinik: "MALANG",
        },
        {
          id: 2,
          tgl: "2026-01-17",
          dokter: "-",
          tindakan_perawat: [],
          obat: [
            "SYMWHITE 377 MOSTURIZER | x1",
            "ACNE FIGHT TONER | x1",
            "DUAL CREAM MORNING | x1",
            "FACIAL WASH ULTRA BRIGHT | x1",
          ],
          catatan: "Catatan FO :\nPAKAI VC DES JAN 300K",
          transaksi: "UMUM",
          klinik: "MALANG",
        },
      ],
    };
  },

  computed: {
    isOnlineConsultation() {
      return this.patient.channel === "Online";
    },

    grandTotal() {
      const totalObat = this.obatItems.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      );

      const totalTreatment = this.treatmentItems.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      );

      return totalObat + totalTreatment;
    },
  },

  methods: {
    createEmptyObatRow() {
      return {
        obat_id: null,
        harga: 0,
        jumlah: 0,
        total: 0,
        frekuensi: null,
        waktu_pakai: null,
        penggunaan: "",
      };
    },

    createEmptyTreatmentRow() {
      return {
        treatment_id: null,
        harga: 0,
        jumlah: 1,
        total: 0,
      };
    },

    handleObatChange(item) {
      const selected = this.obatOptions.find((x) => x.value === item.obat_id);
      item.harga = selected ? selected.harga : 0;
      this.updateObatTotal(item);
    },

    updateObatTotal(item) {
      item.total = Number(item.harga || 0) * Number(item.jumlah || 0);
    },

    addObatRow() {
      this.obatItems.push(this.createEmptyObatRow());
    },

    removeObatRow(index) {
      if (this.obatItems.length > 1) {
        this.obatItems.splice(index, 1);
      }
    },

    handleTreatmentChange(item) {
      const selected = this.treatmentOptions.find(
        (x) => x.value === item.treatment_id,
      );
      item.harga = selected ? selected.harga : 0;
      this.updateTreatmentTotal(item);
    },

    updateTreatmentTotal(item) {
      item.total = Number(item.harga || 0) * Number(item.jumlah || 0);
    },

    addTreatmentRow() {
      this.treatmentItems.push(this.createEmptyTreatmentRow());
    },

    removeTreatmentRow(index) {
      if (this.treatmentItems.length > 1) {
        this.treatmentItems.splice(index, 1);
      }
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    formatList(items) {
      if (!items || !items.length) return "-";
      return `<ul class="history-list">${items
        .map((x) => `<li>${x}</li>`)
        .join("")}</ul>`;
    },

    goToPengkajianAwal() {
      const id = this.$route.params.id;
      this.$router.push(
        `/pelayanan-medis/antrian-konsultasi/${id}/isi-pengkajian-awal`,
      );
    },

    submitForm() {
      const payload = {
        patient: this.patient,
        online_registration: this.isOnlineConsultation
          ? this.onlineRegistration
          : null,
        soap: this.form,
        resep: this.obatItems,
        treatment: this.treatmentItems,
        total_pembayaran: this.grandTotal,
      };

      console.log("Submit SOAP:", payload);
      this.$router.push("/pelayanan-medis/antrian-konsultasi");
    },
  },
};
</script>

<style scoped>
.soap-page {
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

.top-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
}

.online-medical-card {
  border: 1px solid #f5c2d3;
  border-radius: 8px;
  background: #fff5f8;
  padding: 16px;
}

.online-medical-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

.block-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  height: 100%;
}

.block-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #111827;
}

.table-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: none !important;
}

.simple-table-head {
  display: grid;
  grid-template-columns: 2.2fr 1fr 1fr 1fr 120px;
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

:deep(.online-medical-card .v-field) {
  background: #ffffff;
}

:deep(.v-selection-control) {
  min-height: 32px;
}

:deep(.v-data-table .v-table__wrapper table thead th) {
  font-weight: 700;
  font-size: 13px;
}

:deep(.history-list) {
  margin: 0;
  padding-left: 18px;
}

:deep(.history-list li) {
  margin-bottom: 4px;
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

  .row-actions {
    justify-content: flex-start;
  }
}
</style>

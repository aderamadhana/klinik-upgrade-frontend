<template>
  <div class="bahan-treatment-page">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Input Bahan Treatment</h1>
        <p class="page-subtitle">
          Input pemakaian bahan treatment dengan tampilan yang lebih fokus dan
          mudah dipahami
        </p>
      </div>

      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Kembali
      </v-btn>
    </div>

    <!-- RINGKASAN -->
    <v-card rounded="lg" elevation="0" border class="mb-5">
      <v-card-text class="pa-4 pa-md-5">
        <div class="section-top mb-4">
          <div>
            <div class="section-title">Ringkasan Treatment</div>
            <div class="section-subtitle">
              Pastikan treatment yang dipilih sesuai sebelum menginput bahan
            </div>
          </div>
        </div>

        <v-row>
          <v-col
            v-for="item in treatmentSummary"
            :key="item.label"
            cols="12"
            sm="6"
            md="3"
          >
            <div class="summary-box">
              <div class="summary-label">{{ item.label }}</div>
              <div class="summary-value">{{ item.value }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- FORM -->
    <v-card rounded="lg" elevation="0" border>
      <v-card-title class="form-card-title">
        Form Input Pemakaian Bahan Treatment
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4 pa-md-5">
        <v-alert type="info" variant="tonal" density="comfortable" class="mb-5">
          Isi jumlah bahan yang digunakan pada setiap treatment untuk proses
          pencatatan stok otomatis. Fokus hanya pada treatment yang benar-benar
          dikerjakan.
        </v-alert>

        <div class="section-title mb-2">Daftar Bahan per Treatment</div>
        <div class="section-subtitle mb-4">
          Klik salah satu treatment untuk membuka detail bahan dan mengisi qty
          pemakaian
        </div>

        <v-expansion-panels
          v-model="openedPanels"
          multiple
          variant="accordion"
          class="treatment-panel-list"
        >
          <v-expansion-panel
            v-for="(treatment, tIndex) in treatments"
            :key="treatment.id"
            class="treatment-panel"
          >
            <v-expansion-panel-title class="treatment-panel-title" ripple>
              <div class="treatment-title-wrap">
                <div class="left-info">
                  <div class="soap-title-wrap">
                    <div class="soap-badge treatment-badge">T</div>
                    <div>
                      <div class="soap-title">{{ treatment.nama }}</div>
                      <div class="soap-subtitle">
                        {{ treatment.items.length }} item bahan • Klik untuk
                        lihat detail bahan
                      </div>
                    </div>
                  </div>
                </div>

                <div class="right-info">
                  <v-chip
                    size="small"
                    variant="tonal"
                    :color="
                      getTreatmentFilledCount(treatment) > 0
                        ? 'success'
                        : 'default'
                    "
                    class="status-chip"
                  >
                    {{ getTreatmentFilledCount(treatment) }}/{{
                      treatment.items.length
                    }}
                    terisi
                  </v-chip>
                </div>
              </div>

              <template #actions="{ expanded }">
                <div class="panel-action">
                  <span class="panel-action-text">
                    {{ expanded ? "Tutup" : "Buka" }}
                  </span>
                  <v-icon
                    size="22"
                    class="panel-chevron"
                    :class="{ rotated: expanded }"
                  >
                    mdi-chevron-down
                  </v-icon>
                </div>
              </template>
            </v-expansion-panel-title>

            <v-expansion-panel-text class="panel-text-wrap">
              <div class="treatment-table-wrap">
                <div class="treatment-table-head">
                  <div class="col-bahan">Nama Bahan</div>
                  <div class="col-qty">Qty</div>
                  <div class="col-satuan">Satuan</div>
                </div>

                <div class="treatment-table-body">
                  <div
                    v-for="(item, iIndex) in treatment.items"
                    :key="`${treatment.id}-${item.id}-${iIndex}`"
                    class="treatment-row"
                  >
                    <div class="col-bahan bahan-name">
                      {{ item.nama_bahan }}
                    </div>

                    <div class="col-qty">
                      <v-text-field
                        v-model="item.qty"
                        type="number"
                        min="0"
                        step="0.01"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="qty-input"
                      />
                    </div>

                    <div class="col-satuan satuan-text">
                      {{ item.satuan }}
                    </div>
                  </div>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider />

      <!-- ACTION BAR -->
      <div class="action-bar">
        <div class="action-bar-left">
          <span class="action-hint">
            {{ totalFilledItems }}/{{ totalItems }} item bahan sudah terisi
          </span>
        </div>

        <div class="action-bar-right">
          <v-btn variant="text" color="secondary" @click="resetQty">
            Reset
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            @click="saveChanges"
          >
            Simpan Perubahan
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "InputBahanTreatment",
  data() {
    return {
      openedPanels: [0],

      summary: {
        pasien: "ADE RAMADHANA PRATAMA",
        no_rm: "M20260307001",
        cabang: "MALANG",
        total_treatment: 2,
        total_bahan: 38,
        status: "Draft",
        channel: "Online",
        tanggal_kunjungan: "2026-04-20",
      },

      treatments: [
        {
          id: 1,
          nama: "FACIAL BARBIE LIGHT",
          items: [
            {
              id: 1,
              nama_bahan: "Handscoon Nitrile Non Powder (L)",
              qty: 4,
              satuan: "pcs",
            },
            { id: 2, nama_bahan: "Nurse Cap ONEMED", qty: 1, satuan: "pcs" },
            {
              id: 3,
              nama_bahan: "Alas Bed MS Glow Clinic",
              qty: 1,
              satuan: "pcs",
            },
            { id: 4, nama_bahan: "Spons Stick Kuning", qty: 2, satuan: "pcs" },
            {
              id: 5,
              nama_bahan: "Handsanitizer Aseptic Plus 5 Liter ONEMED",
              qty: 1,
              satuan: "ml",
            },
            { id: 6, nama_bahan: "Facial Wash", qty: 3, satuan: "ml" },
            { id: 7, nama_bahan: "Toner", qty: 2, satuan: "ml" },
            { id: 8, nama_bahan: "Cotton Pad", qty: 4, satuan: "pcs" },
            { id: 9, nama_bahan: "Serum Basic", qty: 1, satuan: "ml" },
            { id: 10, nama_bahan: "Masker Wajah", qty: 1, satuan: "pcs" },
            { id: 11, nama_bahan: "Spatula", qty: 1, satuan: "pcs" },
            { id: 12, nama_bahan: "Tissue", qty: 3, satuan: "pcs" },
            { id: 13, nama_bahan: "Kapas", qty: 2, satuan: "pcs" },
            { id: 14, nama_bahan: "Alcohol Swab", qty: 1, satuan: "pcs" },
            { id: 15, nama_bahan: "Micellar Water", qty: 2, satuan: "ml" },
            { id: 16, nama_bahan: "Gel Treatment", qty: 1, satuan: "ml" },
            { id: 17, nama_bahan: "Face Towel", qty: 1, satuan: "pcs" },
            {
              id: 18,
              nama_bahan: "Disposable Headband",
              qty: 1,
              satuan: "pcs",
            },
            { id: 19, nama_bahan: "Gloves Cadangan", qty: 1, satuan: "pcs" },
          ],
        },
        {
          id: 2,
          nama: "FACIAL ULTIMATE LIGHT",
          items: [
            {
              id: 1,
              nama_bahan: "Handscoon Nitrile Non Powder (L)",
              qty: 2,
              satuan: "pcs",
            },
            { id: 2, nama_bahan: "Nurse Cap ONEMED", qty: 1, satuan: "pcs" },
            {
              id: 3,
              nama_bahan: "Alas Bed MS Glow Clinic",
              qty: 1,
              satuan: "pcs",
            },
            { id: 4, nama_bahan: "Serum Ultimate", qty: 2, satuan: "ml" },
            { id: 5, nama_bahan: "Masker Premium", qty: 1, satuan: "pcs" },
            { id: 6, nama_bahan: "Cotton Pad", qty: 4, satuan: "pcs" },
            { id: 7, nama_bahan: "Tissue", qty: 2, satuan: "pcs" },
            { id: 8, nama_bahan: "Toner", qty: 2, satuan: "ml" },
            { id: 9, nama_bahan: "Handsanitizer", qty: 1, satuan: "ml" },
            { id: 10, nama_bahan: "Face Towel", qty: 1, satuan: "pcs" },
            {
              id: 11,
              nama_bahan: "Disposable Headband",
              qty: 1,
              satuan: "pcs",
            },
            { id: 12, nama_bahan: "Alcohol Swab", qty: 1, satuan: "pcs" },
            { id: 13, nama_bahan: "Gel Treatment", qty: 1, satuan: "ml" },
            { id: 14, nama_bahan: "Kapas", qty: 2, satuan: "pcs" },
            { id: 15, nama_bahan: "Facial Wash", qty: 2, satuan: "ml" },
            { id: 16, nama_bahan: "Spatula", qty: 1, satuan: "pcs" },
            { id: 17, nama_bahan: "Spons Stick Kuning", qty: 2, satuan: "pcs" },
            { id: 18, nama_bahan: "Micellar Water", qty: 1, satuan: "ml" },
            { id: 19, nama_bahan: "Gloves Cadangan", qty: 1, satuan: "pcs" },
          ],
        },
      ],

      initialTreatments: [],
    };
  },

  computed: {
    treatmentSummary() {
      return [
        { label: "Nama Pasien", value: this.summary.pasien },
        { label: "No. RM", value: this.summary.no_rm },
        { label: "Cabang", value: this.summary.cabang },
        { label: "Tanggal Kunjungan", value: this.summary.tanggal_kunjungan },
        {
          label: "Jumlah Treatment",
          value: `${this.summary.total_treatment} treatment`,
        },
        {
          label: "Jumlah Item Bahan",
          value: `${this.summary.total_bahan} item`,
        },
        { label: "Channel", value: this.summary.channel },
        { label: "Status", value: this.summary.status },
      ];
    },

    totalItems() {
      return this.treatments.reduce((acc, treatment) => {
        return acc + treatment.items.length;
      }, 0);
    },

    totalFilledItems() {
      return this.treatments.reduce((acc, treatment) => {
        return (
          acc + treatment.items.filter((item) => Number(item.qty) > 0).length
        );
      }, 0);
    },
  },

  created() {
    this.initialTreatments = JSON.parse(JSON.stringify(this.treatments));
  },

  methods: {
    getTreatmentFilledCount(treatment) {
      return treatment.items.filter((item) => Number(item.qty) > 0).length;
    },

    resetQty() {
      this.treatments = JSON.parse(JSON.stringify(this.initialTreatments));
    },

    goBack() {
      this.$router.back();
    },

    saveChanges() {
      const payload = this.treatments.map((treatment) => ({
        id: treatment.id,
        nama: treatment.nama,
        items: treatment.items.map((item) => ({
          id: item.id,
          nama_bahan: item.nama_bahan,
          qty: Number(item.qty) || 0,
          satuan: item.satuan,
        })),
      }));

      console.log("payload bahan treatment:", payload);
    },
  },
};
</script>

<style scoped>
.bahan-treatment-page {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.page-subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.summary-box {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 14px 12px;
  height: 100%;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  word-break: break-word;
}

.form-card-title {
  padding: 18px 20px;
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
}

.treatment-panel-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.treatment-panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px !important;
  overflow: hidden;
  transition: all 0.2s ease;
}

.treatment-panel:hover {
  border-color: #cfd8e6;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}

.treatment-panel-title {
  padding: 0 16px !important;
  min-height: 84px;
  background: #fff;
  cursor: pointer;
}

.treatment-title-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.left-info {
  flex: 1 1 auto;
  min-width: 0;
}

.right-info {
  display: flex;
  align-items: center;
}

.soap-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.soap-badge {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #fff7e8;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

.treatment-badge {
  background: #fff7e8;
  color: #d97706;
}

.soap-title {
  font-size: 16px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.25;
}

.soap-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.status-chip {
  font-weight: 600;
}

.panel-action {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-weight: 600;
}

.panel-action-text {
  font-size: 13px;
}

.panel-chevron {
  transition: transform 0.2s ease;
}

.panel-chevron.rotated {
  transform: rotate(180deg);
}

.panel-text-wrap {
  background: #fff;
}

:deep(.panel-text-wrap .v-expansion-panel-text__wrapper) {
  padding: 0 16px 16px !important;
}

.treatment-table-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.treatment-table-head {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  padding: 12px 14px;
}

.treatment-table-body {
  max-height: 320px;
  overflow-y: auto;
}

.treatment-row {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #eef2f7;
  gap: 12px;
}

.treatment-row:last-child {
  border-bottom: none;
}

.col-bahan {
  flex: 1 1 70%;
}

.col-qty {
  flex: 0 0 150px;
}

.col-satuan {
  flex: 0 0 90px;
}

.bahan-name {
  font-size: 14px;
  color: #0f172a;
  line-height: 1.4;
}

.satuan-text {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.qty-input {
  width: 100%;
}

:deep(.qty-input .v-field) {
  border-radius: 12px;
  background: #fff;
}

:deep(.qty-input input) {
  font-weight: 700;
}

.action-bar {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  background: #fff;
}

.action-bar-left {
  display: flex;
  align-items: center;
}

.action-bar-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.action-hint {
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 960px) {
  .page-title {
    font-size: 22px;
  }

  .treatment-panel-title {
    min-height: 92px;
  }

  .treatment-table-head {
    display: none;
  }

  .treatment-row {
    flex-direction: column;
    align-items: stretch;
  }

  .col-bahan,
  .col-qty,
  .col-satuan {
    flex: 1 1 100%;
    width: 100%;
  }

  .panel-action-text {
    display: none;
  }

  .action-bar {
    align-items: stretch;
  }

  .action-bar-right {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

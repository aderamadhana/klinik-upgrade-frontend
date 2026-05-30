<template>
  <div>
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Riwayat Pasien</h1>
        <p class="page-subtitle">
          Ringkasan identitas pasien dan riwayat kunjungan klinik
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <!-- PATIENT HERO -->
    <v-card class="mb-4 patient-hero" rounded="lg" variant="outlined">
      <v-card-text class="pa-4 pa-md-5">
        <div class="hero-wrapper">
          <div class="hero-left">
            <div class="patient-meta-top mb-2">
              <v-chip size="small" color="primary">
                {{ patient.noRm }}
              </v-chip>
              <v-chip
                size="small"
                :color="patient.gender === 'Perempuan' ? 'pink' : 'blue'"
              >
                {{ patient.gender }}
              </v-chip>
              <v-chip size="small" color="grey">
                {{ patient.kategori }}
              </v-chip>
            </div>

            <div class="patient-name">
              {{ patient.name }}
            </div>

            <div class="patient-subtitle">
              {{ patient.birthPlace }}, {{ formatDate(patient.birthDate) }} •
              {{ patient.age }} tahun
            </div>

            <div class="hero-alerts mt-3">
              <v-chip
                v-if="patient.nikInvalid"
                size="small"
                color="error"
                class="mr-2 mb-2"
              >
                NIK tidak valid
              </v-chip>

              <v-chip
                v-if="!patient.ihsNumber"
                size="small"
                color="warning"
                class="mr-2 mb-2"
              >
                IHS belum terhubung
              </v-chip>
            </div>
          </div>

          <div class="hero-right">
            <div class="action-group">
              <v-btn
                color="primary"
                prepend-icon="mdi-clipboard-text"
                :to="{ name: 'Pengkajian Pasien', params: { id: patient.id } }"
              >
                Pengkajian Awal
              </v-btn>

              <v-btn
                variant="outlined"
                color="primary"
                prepend-icon="mdi-wallet"
                :to="{ name: 'Saldo Deposit', params: { id: patient.id } }"
              >
                Saldo Deposit
              </v-btn>

              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="text"
                    prepend-icon="mdi-dots-horizontal"
                  >
                    Aksi Lainnya
                  </v-btn>
                </template>

                <v-list density="comfortable" min-width="240">
                  <v-list-item
                    prepend-icon="mdi-card-account-details"
                    title="Cetak Kartu Depan"
                    @click="handlePrintFrontCard"
                  />
                  <v-list-item
                    prepend-icon="mdi-card-account-details-outline"
                    title="Cetak Kartu Belakang"
                    @click="handlePrintBackCard"
                  />
                  <v-list-item
                    prepend-icon="mdi-printer"
                    title="Cetak Label Rekam Medis"
                    @click="handlePrintRmLabel"
                  />
                  <v-list-item
                    prepend-icon="mdi-face-recognition"
                    title="Skin Analyzer"
                    @click="handleSkinAnalyzer"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- ALERT BANNER -->
    <v-alert
      v-if="patient.nikInvalid || !patient.ihsNumber"
      class="mb-4"
      type="warning"
      border="start"
    >
      <div class="font-weight-medium mb-1">Perlu perhatian</div>
      <div class="text-body-2">
        {{
          [
            patient.nikInvalid ? "Format NIK pasien belum valid" : null,
            !patient.ihsNumber ? "Nomor IHS pasien belum tersedia" : null,
          ]
            .filter(Boolean)
            .join(" • ")
        }}
      </div>
    </v-alert>

    <!-- SUMMARY -->
    <v-row class="mb-4" dense>
      <v-col cols="12" md="4">
        <v-card
          rounded="lg"
          variant="outlined"
          class="summary-card fill-height"
        >
          <v-card-title class="summary-title">Data Utama</v-card-title>
          <v-card-text>
            <div class="summary-item">
              <span class="summary-label">NIK</span>
              <span class="summary-value">{{ patient.nik }}</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Nomor IHS</span>
              <span class="summary-value">
                {{ patient.ihsNumber || "-" }}
              </span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Agama</span>
              <span class="summary-value">{{ patient.religion }}</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Pekerjaan</span>
              <span class="summary-value">{{ patient.job }}</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Status Pernikahan</span>
              <span class="summary-value">{{ patient.maritalStatus }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          rounded="lg"
          variant="outlined"
          class="summary-card fill-height"
        >
          <v-card-title class="summary-title">Kontak & Alamat</v-card-title>
          <v-card-text>
            <div class="summary-item">
              <span class="summary-label">No. HP</span>
              <span class="summary-value">{{ patient.phone }}</span>
            </div>

            <div class="summary-item align-start">
              <span class="summary-label">Alamat</span>
              <span class="summary-value">{{ patient.address }}</span>
            </div>

            <div class="pt-2">
              <v-btn
                size="small"
                variant="outlined"
                color="success"
                prepend-icon="mdi-map-marker"
                @click="shippingAddressDialog = true"
              >
                Lihat Alamat Pengiriman
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          rounded="lg"
          variant="outlined"
          class="summary-card fill-height"
        >
          <v-card-title class="summary-title">Benefit Pasien</v-card-title>
          <v-card-text>
            <div class="summary-item">
              <span class="summary-label">Poin</span>
              <span class="summary-value">
                {{ formatNumber(patient.points) }}
              </span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Nilai Poin</span>
              <span class="summary-value">
                {{ formatCurrency(patient.pointsValue) }}
              </span>
            </div>

            <div class="summary-item">
              <span class="summary-label">Saldo Deposit</span>
              <span class="summary-value">
                {{ formatCurrency(patient.depositBalance) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- HISTORY -->
    <v-card rounded="lg" variant="outlined">
      <v-card-text class="pa-4">
        <div class="section-header">
          <div>
            <div class="section-title">Riwayat Kunjungan</div>
            <div class="section-subtitle">
              Riwayat ditampilkan per kunjungan agar lebih mudah dipindai
            </div>
          </div>

          <div class="history-toolbar">
            <v-text-field
              v-model="search"
              label="Cari tindakan, dokter, perawat, catatan"
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
              variant="outlined"
              hide-details
              clearable
              class="search-field"
              @update:model-value="onSearch"
            />
          </div>
        </div>

        <div v-if="paginatedRiwayat.length">
          <v-expansion-panels variant="accordion" class="history-panels">
            <v-expansion-panel
              v-for="item in paginatedRiwayat"
              :key="item.id"
              rounded="lg"
              elevation="0"
              class="mb-3 history-panel"
            >
              <v-expansion-panel-title>
                <div class="history-item-header">
                  <div class="history-main">
                    <div class="history-date">
                      {{ formatDate(item.tgl) }}
                    </div>
                    <div class="history-doctor">
                      {{ item.dokter }}
                    </div>
                    <div class="history-nurse">
                      {{ item.perawat }}
                    </div>
                  </div>

                  <div class="history-meta">
                    <v-chip size="small" color="primary" class="mb-1">
                      {{ item.transaksi }}
                    </v-chip>
                    <div class="history-clinic">{{ item.klinik }}</div>
                  </div>
                </div>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <v-row dense>
                  <v-col cols="12" md="5">
                    <div class="detail-block">
                      <div class="detail-title">Tindakan</div>

                      <div
                        v-for="(t, idx) in item.tindakan"
                        :key="idx"
                        class="detail-row"
                      >
                        <div class="detail-row-main">
                          <div class="detail-row-title">
                            {{ t.nama }}
                          </div>
                          <div class="detail-row-subtitle">
                            Pelaksana: {{ t.perawat }}
                          </div>
                        </div>

                        <v-chip size="x-small" variant="outlined">
                          x{{ t.qty }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12" md="3">
                    <div class="detail-block">
                      <div class="detail-title">Obat / Produk</div>
                      <div class="detail-text">
                        {{ item.obat || "-" }}
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12" md="4">
                    <div class="detail-block">
                      <div class="detail-title">Catatan</div>
                      <div class="detail-text">
                        {{ item.catatan || "-" }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <div class="pagination-wrapper">
            <div class="pagination-info">
              Menampilkan {{ paginationLabel.start }}–{{
                paginationLabel.end
              }}
              dari {{ filteredRiwayat.length }} kunjungan
            </div>

            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="6"
            />
          </div>
        </div>

        <v-empty-state
          v-else
          icon="mdi-file-search-outline"
          title="Riwayat tidak ditemukan"
          text="Coba ubah kata kunci pencarian atau periksa kembali data kunjungan."
        />
      </v-card-text>
    </v-card>

    <!-- SHIPPING ADDRESS DIALOG -->
    <v-dialog v-model="shippingAddressDialog" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Alamat Pengiriman</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="shippingAddressDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4">
          <div class="text-body-1">{{ patient.shippingAddress }}</div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="outlined" @click="shippingAddressDialog = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "PatientHistoryImproved",

  data() {
    return {
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Pasien", disabled: false, to: "/administrasi/pasien" },
        { title: "Riwayat", disabled: true },
      ],

      search: "",
      page: 1,
      itemsPerPage: 5,
      shippingAddressDialog: false,

      patient: {
        noRm: "A-MS1707120043",
        name: "SHANDY PURNAMASARI",
        gender: "Perempuan",
        kategori: "NY II",
        birthPlace: "Surabaya",
        birthDate: "1991-10-10",
        age: 34,
        nik: "17071200430043",
        nikInvalid: true,
        ihsNumber: "",
        religion: "Islam",
        job: "Wiraswasta",
        maritalStatus: "Sudah Menikah",
        phone: "0812-3456-7890",
        address: "ARAYA, MALANG",
        shippingAddress: "Jl. Araya Raya No. 18, Malang, Jawa Timur",
        points: 70645,
        pointsValue: 176612500,
        depositBalance: 2500000,
      },

      riwayat: [],
    };
  },

  computed: {
    filteredRiwayat() {
      if (!this.search) return this.riwayat;

      const keyword = this.search.toLowerCase();

      return this.riwayat.filter((item) => {
        const tindakanText = item.tindakan
          .map((t) => `${t.nama} ${t.perawat} ${t.qty}`)
          .join(" ")
          .toLowerCase();

        const haystack = [
          item.tgl,
          item.dokter,
          item.perawat,
          item.obat,
          item.catatan,
          item.transaksi,
          item.klinik,
          tindakanText,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(keyword);
      });
    },

    pageCount() {
      return Math.max(
        1,
        Math.ceil(this.filteredRiwayat.length / this.itemsPerPage),
      );
    },

    paginatedRiwayat() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRiwayat.slice(start, end);
    },

    paginationLabel() {
      if (!this.filteredRiwayat.length) {
        return { start: 0, end: 0 };
      }

      const start = (this.page - 1) * this.itemsPerPage + 1;
      const end = Math.min(
        this.page * this.itemsPerPage,
        this.filteredRiwayat.length,
      );

      return { start, end };
    },
  },

  watch: {
    page(val) {
      if (val > this.pageCount) {
        this.page = this.pageCount;
      }
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    loadData() {
      this.riwayat = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        tgl: `2026-03-${String((i % 9) + 20).padStart(2, "0")}`,
        dokter: `DR. PAGE ${Math.floor(i / 5) + 1} - ${i + 1}`,
        perawat: `PERAWAT ${i + 1}`,
        tindakan: [
          {
            nama: "BABY NEEDLE",
            qty: (i % 3) + 1,
            perawat: "SUROHMI",
          },
          {
            nama: "MESO SLIM",
            qty: 2,
            perawat: "SUROHMI",
          },
        ],
        obat: i % 2 === 0 ? "-" : "Krim Malam / Serum Brightening",
        catatan:
          i % 2 === 0
            ? "Catatan FO: Treatment owner"
            : "Pasien kontrol, evaluasi hasil tindakan sebelumnya",
        transaksi: i % 3 === 0 ? "Owner" : "Reguler",
        klinik: i % 2 === 0 ? "Malang" : "Surabaya",
      }));
    },

    onSearch() {
      this.page = 1;
    },

    formatDate(value) {
      if (!value) return "-";

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(value));
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(value || 0);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value || 0);
    },

    handlePrintFrontCard() {
      console.log("Cetak kartu depan");
    },

    handlePrintBackCard() {
      console.log("Cetak kartu belakang");
    },

    handlePrintRmLabel() {
      console.log("Cetak label rekam medis");
    },

    handleSkinAnalyzer() {
      console.log("Open skin analyzer");
    },
  },
};
</script>

<style scoped>
.patient-history-page {
  padding: 16px;
}
.patient-hero {
  border: 1px solid #e5e7eb;
}

.hero-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-left {
  flex: 1 1 520px;
  min-width: 280px;
}

.hero-right {
  flex: 0 0 auto;
  min-width: 240px;
}

.patient-meta-top {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.patient-name {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1.25;
}

.patient-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 6px;
}

.hero-alerts {
  display: flex;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.summary-card {
  border: 1px solid #e5e7eb;
}

.summary-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  padding-bottom: 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.align-start {
  align-items: flex-start;
}

.summary-label {
  min-width: 120px;
  font-size: 13px;
  color: #6b7280;
}

.summary-value {
  flex: 1;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.history-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-field {
  width: 360px;
  max-width: 100%;
}

.history-panels {
  background: transparent !important;
}

.history-panel {
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.history-item-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.history-main {
  min-width: 240px;
}

.history-date {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.history-doctor {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.history-nurse {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.history-meta {
  text-align: right;
  min-width: 120px;
}

.history-clinic {
  font-size: 13px;
  color: #6b7280;
}

.detail-block {
  height: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #f8fafc;
}

.detail-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-row-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.detail-row-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.detail-text {
  font-size: 14px;
  color: #111827;
  line-height: 1.6;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 960px) {
  .summary-label {
    min-width: 100px;
  }

  .summary-value {
    text-align: left;
  }

  .summary-item {
    flex-direction: column;
    gap: 6px;
  }

  .history-meta {
    text-align: left;
  }
}

@media (max-width: 600px) {
  .patient-history-page {
    padding: 12px;
  }

  .page-title {
    font-size: 22px;
  }

  .patient-name {
    font-size: 20px;
  }

  .action-group {
    justify-content: flex-start;
  }

  .search-field {
    width: 100%;
  }

  .pagination-wrapper {
    align-items: flex-start;
  }
}
</style>

<template>
  <div>
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="page-title">Antrian Tindakan</h1>
        <p class="page-subtitle">
          Kelola antrian tindakan pasien yang menunggu proses perawatan
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card class="main-card">
      <div class="section-header">Daftar Antrian Tindakan</div>

      <v-card-text class="pa-5">
        <div class="toolbar-wrap mb-5">
          <div class="d-flex flex-wrap gap-2 align-center">
            <v-chip color="success" variant="tonal" prepend-icon="mdi-refresh">
              Auto Refresh 30 detik
            </v-chip>
          </div>

          <div class="toolbar-filter">
            <v-text-field
              v-model="search"
              placeholder="Cari no RM, nama pasien, tindakan, dokter..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="filter-search"
            />

            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="comfortable"
              hide-details
              class="filter-select"
            />

            <v-select
              v-model="filterPetugas"
              :items="petugasOptions"
              label="Petugas"
              variant="outlined"
              density="comfortable"
              hide-details
              class="filter-select"
            />
          </div>
        </div>

        <v-row class="mb-2">
          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Total Antrian</div>
                <div class="summary-value">{{ summary.total }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Menunggu</div>
                <div class="summary-value">{{ summary.menunggu }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Diproses</div>
                <div class="summary-value">{{ summary.diproses }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Selesai</div>
                <div class="summary-value">{{ summary.selesai }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :loading="loading"
          item-value="id"
          class="table-section"
          loading-text="Memuat data antrian tindakan..."
          no-data-text="Data antrian tindakan tidak ditemukan"
        >
          <template #item.nomor_antrian="{ item }">
            <v-chip size="small" color="primary" variant="tonal">
              {{ item.nomor_antrian }}
            </v-chip>
          </template>

          <template #item.pasien="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ item.nama_pasien }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ item.no_rm }} • {{ item.no_hp }}
              </span>
            </div>
          </template>

          <template #item.kunjungan="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{
                formatDate(item.tanggal_kunjungan)
              }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ item.waktu_kunjungan || "-" }}
              </span>
            </div>
          </template>

          <template #item.tindakan="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ item.nama_tindakan }}</span>
              <span class="text-caption text-medium-emphasis">
                Qty {{ item.qty }} • {{ formatRupiah(item.harga) }}
              </span>
            </div>
          </template>

          <template #item.dokter="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ item.dokter }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ item.petugas }}
              </span>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              variant="flat"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.catatan="{ item }">
            <span class="text-body-2">{{ item.catatan || "-" }}</span>
          </template>

          <template #item.aksi="{ item }">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                size="small"
                color="secondary"
                variant="outlined"
                prepend-icon="mdi-file-document-edit-outline"
                @click="goToFormTindakan(item)"
              >
                Update
              </v-btn>

              <v-btn
                v-if="item.status === 'Menunggu'"
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-play-circle-outline"
                @click="updateStatus(item, 'Diproses')"
              >
                Proses
              </v-btn>

              <v-btn
                v-if="item.status !== 'Selesai'"
                size="small"
                color="success"
                variant="tonal"
                prepend-icon="mdi-check-circle-outline"
                @click="updateStatus(item, 'Selesai')"
              >
                Selesai
              </v-btn>

              <v-btn
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete-outline"
                @click="confirmDelete(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDelete" max-width="420">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title"> Konfirmasi Hapus </v-card-title>

        <v-card-text class="pt-2">
          <div class="mb-2">Data antrian tindakan ini akan dihapus.</div>

          <div v-if="selectedItem" class="delete-dialog-info">
            <div><strong>Pasien:</strong> {{ selectedItem.nama_pasien }}</div>
            <div><strong>No. RM:</strong> {{ selectedItem.no_rm }}</div>
            <div>
              <strong>No. Antrian:</strong> {{ selectedItem.nomor_antrian }}
            </div>
            <div>
              <strong>Tindakan:</strong> {{ selectedItem.nama_tindakan }}
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="dialogDelete = false"
          >
            Batal
          </v-btn>

          <v-btn color="error" :loading="deleteLoading" @click="deleteItem">
            Ya, Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "AllAntrianTindakan",
  data() {
    return {
      loading: false,
      isFetching: false,
      autoRefreshInterval: null,
      refreshIntervalMs: 30000,

      search: "",
      filterStatus: "Semua",
      filterPetugas: "Semua",

      dialogDelete: false,
      deleteLoading: false,
      selectedItem: null,

      breadcrumbs: [
        { title: "Home", disabled: false, href: "/" },
        { title: "Pelayanan Medis", disabled: true },
        { title: "Antrian Tindakan", disabled: true },
      ],

      statusOptions: ["Semua", "Menunggu", "Diproses", "Selesai"],
      petugasOptions: ["Semua", "Perawat", "Beautician"],

      headers: [
        { title: "No. Antrian", key: "nomor_antrian", sortable: false },
        { title: "Pasien", key: "pasien", sortable: false },
        { title: "Kunjungan", key: "kunjungan", sortable: false },
        { title: "Tindakan", key: "tindakan", sortable: false },
        { title: "Dokter / Petugas", key: "dokter", sortable: false },
        { title: "Status", key: "status", sortable: false },
        { title: "Catatan", key: "catatan", sortable: false },
        { title: "Aksi", key: "aksi", sortable: false, align: "end" },
      ],

      items: [
        {
          id: 1,
          nomor_antrian: "T-001",
          nama_pasien: "Siti Aisyah",
          no_rm: "B20240101001",
          no_hp: "6281234567890",
          tanggal_kunjungan: "2026-04-20",
          waktu_kunjungan: "09:15",
          nama_tindakan: "Facial Acne",
          qty: 1,
          harga: 250000,
          dokter: "Dr. Rayi Vialita Poetri",
          petugas: "Beautician",
          status: "Menunggu",
          catatan: "Lanjut dari konsultasi dokter",
        },
        {
          id: 2,
          nomor_antrian: "T-002",
          nama_pasien: "Nadia Putri",
          no_rm: "B20240214012",
          no_hp: "6282233344455",
          tanggal_kunjungan: "2026-04-20",
          waktu_kunjungan: "09:40",
          nama_tindakan: "Laser Toning",
          qty: 1,
          harga: 450000,
          dokter: "Dr. Rayi Vialita Poetri",
          petugas: "Perawat",
          status: "Diproses",
          catatan: "Pastikan area wajah sudah dibersihkan",
        },
        {
          id: 3,
          nomor_antrian: "T-003",
          nama_pasien: "Vina Maharani",
          no_rm: "B20231107088",
          no_hp: "6281119998877",
          tanggal_kunjungan: "2026-04-20",
          waktu_kunjungan: "10:05",
          nama_tindakan: "Infus Whitening",
          qty: 1,
          harga: 350000,
          dokter: "Dr. Fajar Nugroho",
          petugas: "Perawat",
          status: "Selesai",
          catatan: "",
        },
        {
          id: 4,
          nomor_antrian: "T-004",
          nama_pasien: "Rina Oktavia",
          no_rm: "B20250112007",
          no_hp: "6285767788990",
          tanggal_kunjungan: "2026-04-20",
          waktu_kunjungan: "10:30",
          nama_tindakan: "Chemical Peeling",
          qty: 1,
          harga: 300000,
          dokter: "Dr. Fajar Nugroho",
          petugas: "Beautician",
          status: "Menunggu",
          catatan: "Perhatikan sensitivitas kulit pasien",
        },
      ],
    };
  },

  computed: {
    filteredItems() {
      return this.items.filter((item) => {
        const keyword = this.search.toLowerCase();

        const matchSearch =
          !keyword ||
          item.nomor_antrian.toLowerCase().includes(keyword) ||
          item.nama_pasien.toLowerCase().includes(keyword) ||
          item.no_rm.toLowerCase().includes(keyword) ||
          item.no_hp.toLowerCase().includes(keyword) ||
          item.nama_tindakan.toLowerCase().includes(keyword) ||
          item.dokter.toLowerCase().includes(keyword) ||
          item.petugas.toLowerCase().includes(keyword);

        const matchStatus =
          this.filterStatus === "Semua" || item.status === this.filterStatus;

        const matchPetugas =
          this.filterPetugas === "Semua" || item.petugas === this.filterPetugas;

        return matchSearch && matchStatus && matchPetugas;
      });
    },

    summary() {
      return {
        total: this.items.length,
        menunggu: this.items.filter((x) => x.status === "Menunggu").length,
        diproses: this.items.filter((x) => x.status === "Diproses").length,
        selesai: this.items.filter((x) => x.status === "Selesai").length,
      };
    },
  },

  methods: {
    async loadData({ silent = false } = {}) {
      if (this.isFetching) return;

      this.isFetching = true;
      if (!silent) this.loading = true;

      try {
        // Ganti dengan API asli
        // const response = await this.$axios.get('/pelayanan-medis/antrian-tindakan');
        // this.items = response.data?.data || [];

        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch (error) {
        console.error("Gagal memuat data antrian tindakan:", error);
      } finally {
        this.loading = false;
        this.isFetching = false;
      }
    },

    startAutoRefresh() {
      this.stopAutoRefresh();
      this.autoRefreshInterval = setInterval(() => {
        this.loadData({ silent: true });
      }, this.refreshIntervalMs);
    },

    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },

    formatDate(date) {
      if (!date) return "-";

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(date));
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    getStatusColor(status) {
      const colors = {
        Menunggu: "grey",
        Diproses: "info",
        Selesai: "success",
      };

      return colors[status] || "secondary";
    },

    goToFormTindakan(item) {
      const target = this.items.find((row) => row.id === item.id);

      if (target && target.status === "Menunggu") {
        target.status = "Diproses";
      }

      this.$router.push(
        `/pelayanan-medis/antrian-tindakan/${item.id}/form-tindakan`,
      );
    },

    updateStatus(item, status) {
      const target = this.items.find((row) => row.id === item.id);
      if (target) {
        target.status = status;
      }
    },

    confirmDelete(item) {
      this.selectedItem = { ...item };
      this.dialogDelete = true;
    },

    async deleteItem() {
      if (!this.selectedItem) return;

      this.deleteLoading = true;

      try {
        // await this.$axios.delete(`/pelayanan-medis/antrian-tindakan/${this.selectedItem.id}`);

        this.items = this.items.filter(
          (row) => row.id !== this.selectedItem.id,
        );

        this.dialogDelete = false;
        this.selectedItem = null;
      } catch (error) {
        console.error("Gagal menghapus data antrian tindakan:", error);
      } finally {
        this.deleteLoading = false;
      }
    },
  },

  mounted() {
    this.loadData();
    this.startAutoRefresh();
  },

  beforeUnmount() {
    this.stopAutoRefresh();
  },

  beforeDestroy() {
    this.stopAutoRefresh();
  },
};
</script>

<style scoped>
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

.toolbar-wrap {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-filter {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-search {
  min-width: 320px;
}

.filter-select {
  min-width: 180px;
}

.summary-card {
  border-radius: 8px !important;
  border: 1px solid #e5e7eb;
  box-shadow: none !important;
}

.summary-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
}

.table-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: none !important;
}

.dialog-card {
  border-radius: 10px !important;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  padding: 16px 20px;
}

.detail-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 14px 16px;
}

.detail-item {
  grid-column: span 3;
  border: 1px solid #eef2f7;
  border-radius: 6px;
  padding: 12px 14px;
  background: #f8fafc;
}

.detail-note {
  border: 1px solid #eef2f7;
  border-radius: 6px;
  padding: 12px 14px;
  background: #f8fafc;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  word-break: break-word;
}

.delete-dialog-info {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.v-field) {
  border-radius: 6px !important;
}

:deep(.v-data-table .v-table__wrapper table thead th) {
  font-weight: 700;
  font-size: 13px;
}

@media (max-width: 1264px) {
  .detail-item {
    grid-column: span 6;
  }
}

@media (max-width: 960px) {
  .filter-search,
  .filter-select {
    min-width: 100%;
  }
}

@media (max-width: 600px) {
  .detail-item {
    grid-column: span 12;
  }
}
</style>

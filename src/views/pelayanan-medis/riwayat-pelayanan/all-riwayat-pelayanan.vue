<template>
  <div>
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="page-title">Riwayat Pelayanan</h1>
        <p class="page-subtitle">
          Lihat riwayat konsultasi dan tindakan pasien yang sudah diproses
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card class="main-card">
      <div class="section-header">Daftar Riwayat Pelayanan</div>

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
              placeholder="Cari no RM, nama pasien, dokter, tindakan..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="filter-search"
            />

            <v-select
              v-model="filterJenis"
              :items="jenisOptions"
              label="Jenis"
              variant="outlined"
              density="comfortable"
              hide-details
              class="filter-select"
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
          </div>
        </div>

        <v-row class="mb-2">
          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Total Riwayat</div>
                <div class="summary-value">{{ summary.total }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Konsultasi</div>
                <div class="summary-value">{{ summary.konsultasi }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Tindakan</div>
                <div class="summary-value">{{ summary.tindakan }}</div>
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
          loading-text="Memuat data riwayat pelayanan..."
          no-data-text="Data riwayat pelayanan tidak ditemukan"
        >
          <template #item.nomor="{ item }">
            <v-chip size="small" color="primary" variant="tonal">
              {{ item.nomor }}
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
              <span class="font-weight-medium">
                {{ formatDate(item.tanggal_kunjungan) }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ item.waktu_kunjungan || "-" }}
              </span>
            </div>
          </template>

          <template #item.jenis="{ item }">
            <div class="d-flex flex-column">
              <v-chip
                size="small"
                :color="getJenisColor(item.jenis)"
                variant="tonal"
                class="mb-1"
              >
                {{ item.jenis }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">
                {{ item.channel }}
              </span>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ item.layanan }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ item.dokter }}
              </span>
            </div>
          </template>

          <template #item.bukti_konsultasi="{ item }">
            <div v-if="showBuktiKonsultasi(item)">
              <v-chip
                v-if="item.bukti_konsultasi_url"
                size="small"
                color="success"
                variant="tonal"
              >
                Sudah upload bukti konsultasi online
              </v-chip>

              <v-chip
                v-else
                size="small"
                color="warning"
                variant="flat"
                class="warning-chip"
              >
                Belum upload bukti konsultasi online!
              </v-chip>
            </div>

            <span v-else class="text-medium-emphasis">-</span>
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

          <template #item.aksi="{ item }">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                size="small"
                color="info"
                variant="tonal"
                prepend-icon="mdi-eye-outline"
                @click="lihatDetail(item)"
              >
                Detail
              </v-btn>

              <v-btn
                v-if="showBuktiKonsultasi(item)"
                size="small"
                color="warning"
                variant="flat"
                prepend-icon="mdi-tray-arrow-up"
                @click="uploadBukti(item)"
              >
                {{
                  item.bukti_konsultasi_url
                    ? "Ganti Bukti Konsultasi Online"
                    : "Upload Bukti Konsultasi Online"
                }}
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

    <input
      ref="fileInput"
      type="file"
      accept="image/*,.pdf"
      class="d-none"
      @change="handleFileUpload"
    />

    <v-dialog v-model="dialogDetail" max-width="760">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Detail Riwayat Pelayanan
        </v-card-title>

        <v-divider />

        <v-card-text v-if="selectedItem" class="pa-5">
          <div class="detail-card">
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Nomor</div>
                <div class="detail-value">{{ selectedItem.nomor }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Nama Pasien</div>
                <div class="detail-value">{{ selectedItem.nama_pasien }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">No. RM</div>
                <div class="detail-value">{{ selectedItem.no_rm }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">No. Telepon</div>
                <div class="detail-value">{{ selectedItem.no_hp }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Tanggal Kunjungan</div>
                <div class="detail-value">
                  {{ formatDate(selectedItem.tanggal_kunjungan) }}
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Waktu Kunjungan</div>
                <div class="detail-value">
                  {{ selectedItem.waktu_kunjungan }}
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Jenis</div>
                <div class="detail-value">
                  {{ selectedItem.jenis }} - {{ selectedItem.channel }}
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Layanan</div>
                <div class="detail-value">{{ selectedItem.layanan }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Dokter</div>
                <div class="detail-value">{{ selectedItem.dokter }}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">{{ selectedItem.status }}</div>
              </div>
            </div>

            <div class="detail-note mt-4">
              <div class="detail-label">Keterangan</div>
              <div class="detail-value">
                {{ selectedItem.keterangan || "-" }}
              </div>
            </div>

            <div
              v-if="
                showBuktiKonsultasi(selectedItem) &&
                selectedItem.bukti_konsultasi_url
              "
              class="detail-note mt-4"
            >
              <div class="detail-label">Bukti Konsultasi Online</div>
              <div class="detail-value">File sudah diupload</div>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="dialogDetail = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="420">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title"> Konfirmasi Hapus </v-card-title>

        <v-card-text class="pt-2">
          <div class="mb-2">Data riwayat pelayanan ini akan dihapus.</div>

          <div v-if="selectedItem" class="delete-dialog-info">
            <div><strong>Pasien:</strong> {{ selectedItem.nama_pasien }}</div>
            <div><strong>No. RM:</strong> {{ selectedItem.no_rm }}</div>
            <div><strong>Nomor:</strong> {{ selectedItem.nomor }}</div>
            <div><strong>Jenis:</strong> {{ selectedItem.jenis }}</div>
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
  name: "AllRiwayatPelayanan",
  data() {
    return {
      loading: false,
      isFetching: false,
      autoRefreshInterval: null,
      refreshIntervalMs: 30000,

      search: "",
      filterJenis: "Semua",
      filterStatus: "Semua",

      dialogDetail: false,
      dialogDelete: false,
      deleteLoading: false,
      selectedItem: null,
      uploadTargetItem: null,

      breadcrumbs: [
        { title: "Home", disabled: false, href: "/" },
        { title: "Pelayanan Medis", disabled: true },
        { title: "Riwayat Pelayanan", disabled: true },
      ],

      jenisOptions: ["Semua", "Konsultasi", "Tindakan"],
      statusOptions: ["Semua", "Selesai"],

      headers: [
        { title: "Nomor", key: "nomor", sortable: false },
        { title: "Pasien", key: "pasien", sortable: false },
        { title: "Kunjungan", key: "kunjungan", sortable: false },
        { title: "Jenis", key: "jenis", sortable: false },
        { title: "Layanan", key: "layanan", sortable: false },
        { title: "Bukti Konsultasi", key: "bukti_konsultasi", sortable: false },
        { title: "Status", key: "status", sortable: false },
        { title: "Aksi", key: "aksi", sortable: false, align: "end" },
      ],

      items: [
        {
          id: 1,
          nomor: "K-003",
          nama_pasien: "Vina Maharani",
          no_rm: "B20231107088",
          no_hp: "6281119998877",
          tanggal_kunjungan: "2026-04-20",
          waktu_kunjungan: "10:00",
          jenis: "Konsultasi",
          channel: "Offline",
          layanan: "Konsultasi Dokter Estetik",
          dokter: "Dr. Fajar Nugroho",
          status: "Selesai",
          bukti_konsultasi_url: "",
          keterangan: "Keluhan flek dan kulit kusam",
        },
        {
          id: 2,
          nomor: "T-003",
          nama_pasien: "Vina Maharani",
          no_rm: "B20231107088",
          no_hp: "6281119998877",
          tanggal_kunjungan: "2026-04-20",
          waktu_kunjungan: "10:20",
          jenis: "Tindakan",
          channel: "Offline",
          layanan: "Infus Whitening",
          dokter: "Dr. Fajar Nugroho",
          status: "Selesai",
          bukti_konsultasi_url: "",
          keterangan: "Pasien telah menyelesaikan tindakan",
        },
        {
          id: 3,
          nomor: "K-010",
          nama_pasien: "Nadia Putri",
          no_rm: "B20240214012",
          no_hp: "6282233344455",
          tanggal_kunjungan: "2026-04-19",
          waktu_kunjungan: "14:00",
          jenis: "Konsultasi",
          channel: "Online",
          layanan: "Konsultasi Online",
          dokter: "Dr. Rayi Vialita Poetri",
          status: "Selesai",
          bukti_konsultasi_url: "",
          keterangan: "Konsultasi online treatment lanjutan",
        },
        {
          id: 4,
          nomor: "T-011",
          nama_pasien: "Siti Aisyah",
          no_rm: "B20240101001",
          no_hp: "6281234567890",
          tanggal_kunjungan: "2026-04-18",
          waktu_kunjungan: "09:30",
          jenis: "Tindakan",
          channel: "Offline",
          layanan: "Facial Acne",
          dokter: "Dr. Rayi Vialita Poetri",
          status: "Selesai",
          bukti_konsultasi_url: "",
          keterangan: "Lanjut dari konsultasi dokter",
        },
        {
          id: 5,
          nomor: "K-015",
          nama_pasien: "Rina Oktavia",
          no_rm: "B20250112007",
          no_hp: "6285767788990",
          tanggal_kunjungan: "2026-04-17",
          waktu_kunjungan: "11:00",
          jenis: "Konsultasi",
          channel: "Online",
          layanan: "Konsultasi Online",
          dokter: "Dr. Fajar Nugroho",
          status: "Selesai",
          bukti_konsultasi_url: "https://example.com/bukti-konsultasi-rina.jpg",
          keterangan: "Follow up kondisi kulit sensitif",
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
          item.nomor.toLowerCase().includes(keyword) ||
          item.nama_pasien.toLowerCase().includes(keyword) ||
          item.no_rm.toLowerCase().includes(keyword) ||
          item.no_hp.toLowerCase().includes(keyword) ||
          item.layanan.toLowerCase().includes(keyword) ||
          item.dokter.toLowerCase().includes(keyword);

        const matchJenis =
          this.filterJenis === "Semua" || item.jenis === this.filterJenis;

        const matchStatus =
          this.filterStatus === "Semua" || item.status === this.filterStatus;

        return matchSearch && matchJenis && matchStatus;
      });
    },

    summary() {
      return {
        total: this.items.length,
        konsultasi: this.items.filter((x) => x.jenis === "Konsultasi").length,
        tindakan: this.items.filter((x) => x.jenis === "Tindakan").length,
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
        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch (error) {
        console.error("Gagal memuat data riwayat pelayanan:", error);
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

    getJenisColor(jenis) {
      const colors = {
        Konsultasi: "primary",
        Tindakan: "deep-purple",
      };

      return colors[jenis] || "secondary";
    },

    getStatusColor(status) {
      const colors = {
        Selesai: "success",
      };

      return colors[status] || "secondary";
    },

    showBuktiKonsultasi(item) {
      return (
        item.jenis === "Konsultasi" &&
        item.channel === "Online" &&
        item.status === "Selesai"
      );
    },

    lihatDetail(item) {
      this.selectedItem = { ...item };
      this.dialogDetail = true;
    },

    uploadBukti(item) {
      this.uploadTargetItem = item;
      this.$refs.fileInput.click();
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file || !this.uploadTargetItem) return;

      const target = this.items.find(
        (row) => row.id === this.uploadTargetItem.id,
      );
      if (target) {
        target.bukti_konsultasi_url = URL.createObjectURL(file);
      }

      console.log("Upload bukti konsultasi:", {
        item: this.uploadTargetItem,
        file,
      });

      this.uploadTargetItem = null;
      event.target.value = "";
    },

    confirmDelete(item) {
      this.selectedItem = { ...item };
      this.dialogDelete = true;
    },

    async deleteItem() {
      if (!this.selectedItem) return;

      this.deleteLoading = true;

      try {
        this.items = this.items.filter(
          (row) => row.id !== this.selectedItem.id,
        );

        this.dialogDelete = false;
        this.selectedItem = null;
      } catch (error) {
        console.error("Gagal menghapus data riwayat pelayanan:", error);
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

.warning-chip {
  font-weight: 700;
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

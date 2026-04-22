<template>
  <div>
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="page-title">Antrian Dokter</h1>
        <p class="page-subtitle">
          Kelola antrian pasien yang masuk ke jalur dokter untuk konsultasi atau
          tindakan dokter
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card class="main-card">
      <div class="section-header">Daftar Antrian Dokter</div>

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
              placeholder="Cari no RM, nama pasien, dokter, nomor antrian..."
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
              v-model="filterChannel"
              :items="channelOptions"
              label="Channel"
              variant="outlined"
              density="comfortable"
              hide-details
              class="filter-select"
            />

            <v-select
              v-model="filterDokter"
              :items="dokterOptions"
              label="Dokter"
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
          loading-text="Memuat data antrian dokter..."
          no-data-text="Data antrian dokter tidak ditemukan"
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
              <span class="font-weight-medium">
                {{ formatDate(item.tanggal_kunjungan) }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ item.waktu_kunjungan || "-" }}
              </span>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ formatLayanan(item) }}</span>
              <span class="text-caption text-medium-emphasis">
                {{
                  item.ada_treatment
                    ? item.perlu_tindakan_perawat
                      ? "Lanjut ke Perawat"
                      : "Dokter Menangani Langsung"
                    : "Tanpa Treatment"
                }}
              </span>
            </div>
          </template>

          <template #item.dokter="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ item.nama_dokter }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ formatChannel(item.channel_konsultasi) }}
              </span>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              variant="flat"
            >
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #item.catatan="{ item }">
            <span class="text-body-2">{{ item.catatan || "-" }}</span>
          </template>

          <template #item.aksi="{ item }">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-if="item.status === 'menunggu'"
                size="small"
                color="warning"
                variant="tonal"
                prepend-icon="mdi-bullhorn-outline"
                @click="updateStatus(item, 'dipanggil')"
              >
                Panggil
              </v-btn>

              <v-btn
                v-if="item.status === 'dipanggil' || item.status === 'proses'"
                size="small"
                color="secondary"
                variant="outlined"
                prepend-icon="mdi-file-document-edit-outline"
                @click="goToFormDokter(item)"
              >
                Layani
              </v-btn>

              <v-btn
                v-if="item.status === 'dipanggil'"
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-play-circle-outline"
                @click="updateStatus(item, 'proses')"
              >
                Proses
              </v-btn>

              <v-btn
                v-if="item.status !== 'selesai'"
                size="small"
                color="success"
                variant="tonal"
                prepend-icon="mdi-check-circle-outline"
                @click="updateStatus(item, 'selesai')"
              >
                Selesai
              </v-btn>

              <v-btn
                v-if="item.status === 'selesai'"
                size="small"
                color="secondary"
                variant="outlined"
                prepend-icon="mdi-eye-outline"
                @click="goToFormDokter(item)"
              >
                Lihat
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
        <v-card-title class="dialog-title">Konfirmasi Hapus</v-card-title>

        <v-card-text class="pt-2">
          <div class="mb-2">Data antrian dokter ini akan dihapus.</div>

          <div v-if="selectedItem" class="delete-dialog-info">
            <div><strong>Pasien:</strong> {{ selectedItem.nama_pasien }}</div>
            <div><strong>No. RM:</strong> {{ selectedItem.no_rm }}</div>
            <div>
              <strong>No. Antrian:</strong> {{ selectedItem.nomor_antrian }}
            </div>
            <div><strong>Dokter:</strong> {{ selectedItem.nama_dokter }}</div>
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
  name: "AllAntrianDokter",
  data() {
    return {
      loading: false,
      isFetching: false,
      autoRefreshInterval: null,
      refreshIntervalMs: 30000,

      search: "",
      filterStatus: "Semua",
      filterChannel: "Semua",
      filterDokter: "Semua",

      dialogDelete: false,
      deleteLoading: false,
      selectedItem: null,

      breadcrumbs: [
        { title: "Home", disabled: false, href: "/" },
        { title: "Pelayanan Medis", disabled: true },
        { title: "Antrian Dokter", disabled: true },
      ],

      statusOptions: ["Semua", "menunggu", "dipanggil", "proses", "selesai"],
      channelOptions: ["Semua", "offline", "online", "tanpa konsultasi"],

      headers: [
        { title: "No. Antrian", key: "nomor_antrian", sortable: false },
        { title: "Pasien", key: "pasien", sortable: false },
        { title: "Kunjungan", key: "kunjungan", sortable: false },
        { title: "Layanan", key: "layanan", sortable: false },
        { title: "Dokter / Channel", key: "dokter", sortable: false },
        { title: "Status", key: "status", sortable: false },
        { title: "Catatan", key: "catatan", sortable: false },
        { title: "Aksi", key: "aksi", sortable: false, align: "end" },
      ],

      items: [
        {
          id: 1,
          nomor_antrian: "D-001",
          nama_pasien: "Nabila Putri",
          no_rm: "B20240102011",
          no_hp: "628123450001",
          tanggal_kunjungan: "2026-04-22",
          waktu_kunjungan: "08:15",
          nama_dokter: "DR. RAYI VIALITA POETRI",
          ada_konsultasi: true,
          ada_treatment: true,
          ada_penjualan: true,
          channel_konsultasi: "offline",
          perlu_tindakan_perawat: true,
          status: "menunggu",
          catatan: "Lanjut observasi dan kemungkinan ke nurse station",
        },
        {
          id: 2,
          nomor_antrian: "D-002",
          nama_pasien: "Sinta Maharani",
          no_rm: "D20231017008",
          no_hp: "628115550002",
          tanggal_kunjungan: "2026-04-22",
          waktu_kunjungan: "08:22",
          nama_dokter: "DR. RAYI VIALITA POETRI",
          ada_konsultasi: true,
          ada_treatment: false,
          ada_penjualan: false,
          channel_konsultasi: "online",
          perlu_tindakan_perawat: null,
          status: "dipanggil",
          catatan: "Konsultasi online follow up acne",
        },
        {
          id: 3,
          nomor_antrian: "D-003",
          nama_pasien: "Putri Ananda",
          no_rm: "E20221011003",
          no_hp: "628177770003",
          tanggal_kunjungan: "2026-04-22",
          waktu_kunjungan: "08:35",
          nama_dokter: "DR. NUR AINI",
          ada_konsultasi: false,
          ada_treatment: true,
          ada_penjualan: false,
          channel_konsultasi: "",
          perlu_tindakan_perawat: false,
          status: "proses",
          catatan: "Treatment dilakukan langsung oleh dokter",
        },
        {
          id: 4,
          nomor_antrian: "D-004",
          nama_pasien: "Dewi Lestari",
          no_rm: "ML20230909014",
          no_hp: "628222220004",
          tanggal_kunjungan: "2026-04-22",
          waktu_kunjungan: "09:02",
          nama_dokter: "DR. NUR AINI",
          ada_konsultasi: true,
          ada_treatment: true,
          ada_penjualan: false,
          channel_konsultasi: "offline",
          perlu_tindakan_perawat: false,
          status: "selesai",
          catatan: "",
        },
      ],
    };
  },

  computed: {
    dokterOptions() {
      const uniqueDokter = [
        ...new Set(this.items.map((item) => item.nama_dokter).filter(Boolean)),
      ];

      return ["Semua", ...uniqueDokter];
    },

    filteredItems() {
      return this.items.filter((item) => {
        const keyword = this.search.toLowerCase();

        const matchSearch =
          !keyword ||
          String(item.nomor_antrian).toLowerCase().includes(keyword) ||
          String(item.nama_pasien).toLowerCase().includes(keyword) ||
          String(item.no_rm).toLowerCase().includes(keyword) ||
          String(item.no_hp).toLowerCase().includes(keyword) ||
          String(item.nama_dokter).toLowerCase().includes(keyword);

        const matchStatus =
          this.filterStatus === "Semua" || item.status === this.filterStatus;

        const matchChannel =
          this.filterChannel === "Semua" ||
          (this.filterChannel === "tanpa konsultasi"
            ? !item.channel_konsultasi
            : item.channel_konsultasi === this.filterChannel);

        const matchDokter =
          this.filterDokter === "Semua" ||
          item.nama_dokter === this.filterDokter;

        return matchSearch && matchStatus && matchChannel && matchDokter;
      });
    },

    summary() {
      return {
        total: this.items.length,
        menunggu: this.items.filter((x) => x.status === "menunggu").length,
        diproses: this.items.filter((x) =>
          ["dipanggil", "proses"].includes(x.status),
        ).length,
        selesai: this.items.filter((x) => x.status === "selesai").length,
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
        // const response = await this.$axios.get('/pelayanan-medis/antrian-dokter');
        // this.items = response.data?.data || [];
        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch (error) {
        console.error("Gagal memuat data antrian dokter:", error);
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

    formatStatus(status) {
      const map = {
        menunggu: "Menunggu",
        dipanggil: "Dipanggil",
        proses: "Diproses",
        selesai: "Selesai",
      };

      return map[status] || status || "-";
    },

    formatChannel(channel) {
      if (channel === "offline") return "Offline";
      if (channel === "online") return "Online";
      return "Tanpa Konsultasi";
    },

    formatLayanan(item) {
      if (item.ada_konsultasi && item.ada_treatment) {
        return "Konsultasi + Treatment";
      }

      if (item.ada_konsultasi) {
        return "Konsultasi";
      }

      if (item.ada_treatment) {
        return "Treatment Dokter";
      }

      return "Pelayanan Dokter";
    },

    getStatusColor(status) {
      const colors = {
        menunggu: "grey",
        dipanggil: "info",
        proses: "primary",
        selesai: "success",
      };

      return colors[status] || "secondary";
    },

    goToFormDokter(item) {
      const target = this.items.find((row) => row.id === item.id);

      if (target && target.status === "menunggu") {
        target.status = "dipanggil";
      }

      this.$router.push(
        `/pelayanan-medis/antrian-dokter/${item.id}/form-dokter`,
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
        // await this.$axios.delete(`/pelayanan-medis/antrian-dokter/${this.selectedItem.id}`);
        this.items = this.items.filter(
          (row) => row.id !== this.selectedItem.id,
        );

        this.dialogDelete = false;
        this.selectedItem = null;
      } catch (error) {
        console.error("Gagal menghapus data antrian dokter:", error);
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

@media (max-width: 960px) {
  .filter-search,
  .filter-select {
    min-width: 100%;
  }
}
</style>

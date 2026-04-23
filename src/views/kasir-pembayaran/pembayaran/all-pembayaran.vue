<template>
  <div>
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="page-title">Pembayaran</h1>
        <p class="page-subtitle">
          Kelola pembayaran pasien dari layanan yang sudah selesai diproses
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card class="main-card">
      <div class="section-header">Daftar Pembayaran</div>

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
              placeholder="Cari no invoice, no RM, nama pasien..."
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
          </div>
        </div>

        <v-row class="mb-2">
          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Total Tagihan</div>
                <div class="summary-value">{{ summary.total }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Menunggu Pembayaran</div>
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
                <div class="summary-label">Lunas</div>
                <div class="summary-value">{{ summary.lunas }}</div>
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
          loading-text="Memuat data pembayaran..."
          no-data-text="Data pembayaran tidak ditemukan"
        >
          <template #item.nomor_invoice="{ item }">
            <div class="d-flex flex-column">
              <v-chip size="small" color="primary" variant="tonal" class="mb-1">
                {{ item.nomor_invoice }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">
                {{ item.nomor_kunjungan }}
              </span>
            </div>
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
                {{ formatChannel(item.channel_konsultasi) }}
              </span>
            </div>
          </template>

          <template #item.total_tagihan="{ item }">
            <div class="font-weight-bold">
              Rp {{ formatRupiah(item.total_tagihan) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Metode: {{ item.metode_pembayaran || "-" }}
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

          <template #item.aksi="{ item }">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-if="item.status !== 'Lunas'"
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-cash-register"
                @click="goToProsesPembayaran(item)"
              >
                Proses
              </v-btn>

              <v-btn
                v-else
                size="small"
                color="info"
                variant="tonal"
                prepend-icon="mdi-eye-outline"
                @click="goToDetailPembayaran(item)"
              >
                Detail
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AllPembayaran",
  data() {
    return {
      loading: false,
      isFetching: false,
      autoRefreshInterval: null,
      refreshIntervalMs: 30000,

      search: "",
      filterStatus: "Semua",
      filterChannel: "Semua",

      breadcrumbs: [
        { title: "Home", disabled: false, href: "/" },
        { title: "Pelayanan Medis", disabled: true },
        { title: "Pembayaran", disabled: true },
      ],

      statusOptions: ["Semua", "Menunggu Pembayaran", "Diproses", "Lunas"],
      channelOptions: ["Semua", "offline", "online", "tanpa konsultasi"],

      headers: [
        { title: "No. Invoice", key: "nomor_invoice", sortable: false },
        { title: "Pasien", key: "pasien", sortable: false },
        { title: "Kunjungan", key: "kunjungan", sortable: false },
        { title: "Layanan", key: "layanan", sortable: false },
        { title: "Total Tagihan", key: "total_tagihan", sortable: false },
        { title: "Status", key: "status", sortable: false },
        { title: "Aksi", key: "aksi", sortable: false, align: "end" },
      ],

      items: [
        {
          id: 1,
          nomor_invoice: "INV-20260423-001",
          nomor_kunjungan: "RJ-20260423-001",
          nama_pasien: "ADE RAMADHANA PRATAMA",
          no_rm: "M20260307001",
          no_hp: "6281234567890",
          tanggal_kunjungan: "2026-04-23",
          waktu_kunjungan: "09:15",
          channel_konsultasi: "online",
          ada_konsultasi: true,
          ada_treatment: true,
          ada_penjualan: true,
          total_tagihan: 475000,
          metode_pembayaran: "",
          status: "Menunggu Pembayaran",
        },
        {
          id: 2,
          nomor_invoice: "INV-20260423-002",
          nomor_kunjungan: "RJ-20260423-002",
          nama_pasien: "TIARA THERESIA",
          no_rm: "B20240214012",
          no_hp: "6282233344455",
          tanggal_kunjungan: "2026-04-23",
          waktu_kunjungan: "10:05",
          channel_konsultasi: "offline",
          ada_konsultasi: true,
          ada_treatment: false,
          ada_penjualan: true,
          total_tagihan: 220000,
          metode_pembayaran: "Cash",
          status: "Diproses",
        },
        {
          id: 3,
          nomor_invoice: "INV-20260422-003",
          nomor_kunjungan: "RJ-20260422-003",
          nama_pasien: "SULISTIANA WATI",
          no_rm: "B20231107088",
          no_hp: "6281119998877",
          tanggal_kunjungan: "2026-04-22",
          waktu_kunjungan: "11:20",
          channel_konsultasi: "",
          ada_konsultasi: false,
          ada_treatment: true,
          ada_penjualan: false,
          total_tagihan: 350000,
          metode_pembayaran: "Transfer",
          status: "Lunas",
        },
        {
          id: 4,
          nomor_invoice: "INV-20260421-004",
          nomor_kunjungan: "RJ-20260421-004",
          nama_pasien: "SILATUL AZIZAH",
          no_rm: "B20250112007",
          no_hp: "6285767788990",
          tanggal_kunjungan: "2026-04-21",
          waktu_kunjungan: "14:10",
          channel_konsultasi: "offline",
          ada_konsultasi: true,
          ada_treatment: true,
          ada_penjualan: false,
          total_tagihan: 550000,
          metode_pembayaran: "QRIS",
          status: "Lunas",
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
          String(item.nomor_invoice).toLowerCase().includes(keyword) ||
          String(item.nomor_kunjungan).toLowerCase().includes(keyword) ||
          String(item.nama_pasien).toLowerCase().includes(keyword) ||
          String(item.no_rm).toLowerCase().includes(keyword) ||
          String(item.no_hp).toLowerCase().includes(keyword);

        const matchStatus =
          this.filterStatus === "Semua" || item.status === this.filterStatus;

        const matchChannel =
          this.filterChannel === "Semua" ||
          (this.filterChannel === "tanpa konsultasi"
            ? !item.channel_konsultasi
            : item.channel_konsultasi === this.filterChannel);

        return matchSearch && matchStatus && matchChannel;
      });
    },

    summary() {
      return {
        total: this.items.length,
        menunggu: this.items.filter((x) => x.status === "Menunggu Pembayaran")
          .length,
        diproses: this.items.filter((x) => x.status === "Diproses").length,
        lunas: this.items.filter((x) => x.status === "Lunas").length,
      };
    },
  },

  methods: {
    async loadData({ silent = false } = {}) {
      if (this.isFetching) return;

      this.isFetching = true;
      if (!silent) this.loading = true;

      try {
        // const response = await this.$axios.get('/pelayanan-medis/pembayaran');
        // this.items = response.data?.data || [];
        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch (error) {
        console.error("Gagal memuat data pembayaran:", error);
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
        return "Treatment";
      }

      if (item.ada_penjualan) {
        return "Penjualan Produk";
      }

      return "-";
    },

    getStatusColor(status) {
      const colors = {
        "Menunggu Pembayaran": "warning",
        Diproses: "info",
        Lunas: "success",
      };

      return colors[status] || "secondary";
    },

    goToProsesPembayaran(item) {
      this.$router.push(
        `/kasir/daftar-pembayaran/${item.id}/proses-pembayaran`,
      );
    },

    goToDetailPembayaran(item) {
      this.$router.push(
        `/kasir/daftar-pembayaran/${item.id}/detail-pembayaran`,
      );
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

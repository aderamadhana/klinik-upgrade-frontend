<template>
  <div>
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="page-title">Riwayat Pelayanan</h1>
        <p class="page-subtitle">
          Daftar kunjungan pasien yang sudah selesai diproses
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card class="main-card">
      <div class="section-header">Daftar Riwayat Pelayanan</div>

      <v-card-text class="pa-5">
        <div class="toolbar-wrap mb-5">
          <div class="d-flex flex-wrap gap-2 align-center">
            <v-chip color="success" variant="tonal" prepend-icon="mdi-history">
              Data Pelayanan Selesai
            </v-chip>
          </div>

          <div class="toolbar-filter">
            <v-text-field
              v-model="search"
              placeholder="Cari no RM, nama pasien, dokter, nomor kunjungan..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="filter-search"
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
              v-model="filterLayanan"
              :items="layananOptions"
              label="Layanan"
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
                <div class="summary-label">Treatment</div>
                <div class="summary-value">{{ summary.treatment }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Dengan Penjualan</div>
                <div class="summary-value">{{ summary.penjualan }}</div>
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
          <template #item.nomor_kunjungan="{ item }">
            <div class="d-flex flex-column">
              <v-chip size="small" color="primary" variant="tonal" class="mb-1">
                {{ item.nomor_kunjungan }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">
                {{ item.nomor_invoice || "-" }}
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

          <template #item.petugas="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{
                item.nama_dokter || "-"
              }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ item.nama_perawat || "-" }}
              </span>
            </div>
          </template>

          <template #item.total="{ item }">
            <div class="font-weight-bold">
              Rp {{ formatRupiah(item.total_pembayaran) }}
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip size="small" color="success" variant="flat">
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.aksi="{ item }">
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-eye-outline"
                @click="goToDetail(item)"
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
  name: "AllRiwayatPelayanan",
  data() {
    return {
      loading: false,
      isFetching: false,

      search: "",
      filterChannel: "Semua",
      filterLayanan: "Semua",
      filterDokter: "Semua",

      breadcrumbs: [
        { title: "Home", disabled: false, href: "/" },
        { title: "Pelayanan Medis", disabled: true },
        { title: "Riwayat Pelayanan", disabled: true },
      ],

      channelOptions: ["Semua", "offline", "online", "tanpa konsultasi"],
      layananOptions: [
        "Semua",
        "Konsultasi",
        "Treatment",
        "Konsultasi + Treatment",
        "Penjualan Produk",
      ],

      headers: [
        { title: "No. Kunjungan", key: "nomor_kunjungan", sortable: false },
        { title: "Pasien", key: "pasien", sortable: false },
        { title: "Kunjungan", key: "kunjungan", sortable: false },
        { title: "Layanan", key: "layanan", sortable: false },
        { title: "Dokter / Perawat", key: "petugas", sortable: false },
        { title: "Total", key: "total", sortable: false },
        { title: "Status", key: "status", sortable: false },
        { title: "Aksi", key: "aksi", sortable: false, align: "end" },
      ],

      items: [
        {
          id: 1,
          nomor_kunjungan: "RJ-20260423-001",
          nomor_invoice: "INV-20260423-001",
          nama_pasien: "ADE RAMADHANA PRATAMA",
          no_rm: "M20260307001",
          no_hp: "6281234567890",
          tanggal_kunjungan: "2026-04-23",
          waktu_kunjungan: "09:15",
          channel_konsultasi: "online",
          ada_konsultasi: true,
          ada_treatment: true,
          ada_penjualan: true,
          nama_dokter: "Dr. Rayi Vialita Poetri",
          nama_perawat: "Beautician Nisa",
          total_pembayaran: 475000,
          status: "Selesai",
        },
        {
          id: 2,
          nomor_kunjungan: "RJ-20260423-002",
          nomor_invoice: "INV-20260423-002",
          nama_pasien: "TIARA THERESIA",
          no_rm: "B20240214012",
          no_hp: "6282233344455",
          tanggal_kunjungan: "2026-04-23",
          waktu_kunjungan: "10:05",
          channel_konsultasi: "offline",
          ada_konsultasi: true,
          ada_treatment: false,
          ada_penjualan: true,
          nama_dokter: "Dr. Rayi Vialita Poetri",
          nama_perawat: "",
          total_pembayaran: 220000,
          status: "Selesai",
        },
        {
          id: 3,
          nomor_kunjungan: "RJ-20260422-003",
          nomor_invoice: "INV-20260422-003",
          nama_pasien: "SULISTIANA WATI",
          no_rm: "B20231107088",
          no_hp: "6281119998877",
          tanggal_kunjungan: "2026-04-22",
          waktu_kunjungan: "11:20",
          channel_konsultasi: "",
          ada_konsultasi: false,
          ada_treatment: true,
          ada_penjualan: false,
          nama_dokter: "Dr. Fajar Nugroho",
          nama_perawat: "Perawat Lala",
          total_pembayaran: 350000,
          status: "Selesai",
        },
        {
          id: 4,
          nomor_kunjungan: "RJ-20260421-004",
          nomor_invoice: "INV-20260421-004",
          nama_pasien: "SILATUL AZIZAH",
          no_rm: "B20250112007",
          no_hp: "6285767788990",
          tanggal_kunjungan: "2026-04-21",
          waktu_kunjungan: "14:10",
          channel_konsultasi: "offline",
          ada_konsultasi: true,
          ada_treatment: true,
          ada_penjualan: false,
          nama_dokter: "Dr. Fajar Nugroho",
          nama_perawat: "",
          total_pembayaran: 550000,
          status: "Selesai",
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
          String(item.nomor_kunjungan).toLowerCase().includes(keyword) ||
          String(item.nomor_invoice).toLowerCase().includes(keyword) ||
          String(item.nama_pasien).toLowerCase().includes(keyword) ||
          String(item.no_rm).toLowerCase().includes(keyword) ||
          String(item.no_hp).toLowerCase().includes(keyword) ||
          String(item.nama_dokter).toLowerCase().includes(keyword) ||
          String(item.nama_perawat).toLowerCase().includes(keyword);

        const matchChannel =
          this.filterChannel === "Semua" ||
          (this.filterChannel === "tanpa konsultasi"
            ? !item.channel_konsultasi
            : item.channel_konsultasi === this.filterChannel);

        const matchLayanan =
          this.filterLayanan === "Semua" ||
          this.formatLayanan(item) === this.filterLayanan;

        const matchDokter =
          this.filterDokter === "Semua" ||
          item.nama_dokter === this.filterDokter;

        return matchSearch && matchChannel && matchLayanan && matchDokter;
      });
    },

    summary() {
      return {
        total: this.items.length,
        konsultasi: this.items.filter((x) => x.ada_konsultasi).length,
        treatment: this.items.filter((x) => x.ada_treatment).length,
        penjualan: this.items.filter((x) => x.ada_penjualan).length,
      };
    },
  },

  methods: {
    async loadData({ silent = false } = {}) {
      if (this.isFetching) return;

      this.isFetching = true;
      if (!silent) this.loading = true;

      try {
        // const response = await this.$axios.get('/pelayanan-medis/riwayat-pelayanan');
        // this.items = response.data?.data || [];
        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch (error) {
        console.error("Gagal memuat data riwayat pelayanan:", error);
      } finally {
        this.loading = false;
        this.isFetching = false;
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

    goToDetail(item) {
      this.$router.push(`/pelayanan-medis/riwayat-pelayanan/${item.id}/detail`);
    },
  },

  mounted() {
    this.loadData();
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

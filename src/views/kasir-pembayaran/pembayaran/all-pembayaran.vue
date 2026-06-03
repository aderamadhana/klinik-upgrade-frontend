<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Pembayaran</h1>
        <p class="page-subtitle">
          Kelola pembayaran pasien dari registrasi layanan
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card variant="flat" class="border mb-4">
      <!-- TOOLBAR -->
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="filters.search"
              placeholder="Cari invoice, registrasi, pasien, no RM..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="onSearch"
              @click:clear="onClearSearch"
            />
          </v-col>

          <v-col cols="12" md="7">
            <v-row dense justify="end" align="center">
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filters.tanggal"
                  label="Tanggal"
                  type="date"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="onFilterChange"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="filters.status"
                  :items="statusOptions"
                  item-title="label"
                  item-value="value"
                  label="Status"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="onFilterChange"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="filters.channel"
                  :items="channelOptions"
                  item-title="label"
                  item-value="value"
                  label="Channel"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="onFilterChange"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-refresh"
                  :loading="loading"
                  block
                  @click="fetchData"
                >
                  Refresh
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-3">
          <v-chip
            color="success"
            size="small"
            prepend-icon="mdi-timer-sync-outline"
          >
            Auto refresh 30 detik
          </v-chip>
        </div>
      </v-card-text>

      <v-divider />

      <!-- ALERT -->
      <v-card-text v-if="errorMessage" class="pa-4 pb-0">
        <v-alert
          type="error"
          density="compact"
          closable
          class="mb-3"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <!-- SUMMARY -->
      <v-card-text class="pa-4 pb-0">
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined">
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Total Tagihan
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.total }}
                    </div>
                  </div>

                  <v-avatar color="primary" size="36">
                    <v-icon icon="mdi-receipt-text-outline" size="20" />
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined">
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Menunggu
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.menunggu }}
                    </div>
                  </div>

                  <v-avatar color="warning" size="36">
                    <v-icon icon="mdi-clock-outline" size="20" />
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined">
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Diproses
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.diproses }}
                    </div>
                  </div>

                  <v-avatar color="info" size="36">
                    <v-icon icon="mdi-progress-clock" size="20" />
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined">
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-medium-emphasis">Lunas</div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.lunas }}
                    </div>
                  </div>

                  <v-avatar color="success" size="36">
                    <v-icon icon="mdi-check-circle-outline" size="20" />
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- TABLE -->
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          item-value="id"
          density="compact"
          class="border"
          :items-per-page="pagination.perPage"
          hide-default-footer
          loading-text="Memuat data pembayaran..."
          no-data-text="Data pembayaran tidak ditemukan"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@8" />
          </template>
          <template #item.invoice="{ item }">
            <div class="py-2">
              <v-btn
                variant="text"
                color="primary"
                size="small"
                class="px-0 font-weight-bold"
                @click="goToDetailPembayaran(item)"
              >
                {{ getNomorInvoice(item) }}
              </v-btn>

              <div class="text-caption text-medium-emphasis">
                {{ getNomorKunjungan(item) }}
              </div>
            </div>
          </template>

          <template #item.pasien="{ item }">
            <div class="py-2">
              <div class="text-body-2 font-weight-bold">
                {{ getPasienName(item) }}
              </div>

              <div class="text-caption text-medium-emphasis mt-1">
                {{ getPasienMeta(item) }}
              </div>
            </div>
          </template>

          <template #item.kunjungan="{ item }">
            <div class="py-2">
              <div class="text-body-2 font-weight-medium">
                {{ formatDate(item.tanggal_kunjungan || item.tanggal) }}
              </div>

              <div class="text-caption text-medium-emphasis mt-1">
                {{ getWaktuKunjungan(item) }}
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="py-2">
              <v-chip size="small" color="primary">
                {{ getLayananLabel(item) }}
              </v-chip>
            </div>
          </template>

          <template #item.total="{ item }">
            <div class="py-2">
              <div class="text-body-2 font-weight-bold">
                Rp {{ formatNumber(getTotalTagihan(item)) }}
              </div>

              <div class="text-caption text-medium-emphasis mt-1">
                {{ item.metode_pembayaran || "Belum ada metode" }}
              </div>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item)"
              :prepend-icon="getStatusIcon(item)"
            >
              {{ getStatusLabel(item) }}
            </v-chip>
          </template>

          <template #item.aksi="{ item }">
            <div class="d-flex justify-end align-center ga-2 flex-wrap py-2">
              <v-btn
                v-if="canProcessPayment(item)"
                size="small"
                color="primary"
                prepend-icon="mdi-cash-register"
                @click="goToProsesPembayaran(item)"
              >
                Proses
              </v-btn>

              <v-btn
                v-else
                size="small"
                color="info"
                prepend-icon="mdi-eye-outline"
                @click="goToDetailPembayaran(item)"
              >
                Detail
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-avatar color="grey-lighten-3" size="56" class="mb-3">
                <v-icon
                  icon="mdi-credit-card-off-outline"
                  size="30"
                  color="grey"
                />
              </v-avatar>

              <div class="text-subtitle-2 font-weight-bold mb-1">
                Belum ada data pembayaran
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Data muncul saat registrasi masuk ke task pembayaran.
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider />

      <!-- FOOTER -->
      <v-card-actions class="pa-4">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 w-100"
        >
          <div class="text-body-2 text-medium-emphasis">
            Total data:
            <strong class="text-high-emphasis">
              {{ pagination.total }}
            </strong>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-select
              v-model="pagination.perPage"
              :items="[10, 15, 25, 50, 100]"
              variant="outlined"
              density="compact"
              hide-details
              width="96"
              @update:model-value="onPerPageChange"
            />

            <v-pagination
              v-model="pagination.page"
              :length="pagination.lastPage"
              density="compact"
              total-visible="5"
              @update:model-value="fetchData"
            />
          </div>
        </div>
      </v-card-actions>
    </v-card>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="2500"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import pembayaranService from "@/services/kasir/pembayaranService";

export default {
  name: "AllPembayaran",

  data() {
    return {
      loading: false,
      isFetching: false,
      errorMessage: "",
      autoRefreshInterval: null,
      refreshIntervalMs: 30000,

      rows: [],
      summaryApi: null,

      filters: {
        search: "",
        tanggal: this.getToday(),
        status: null,
        channel: null,
      },

      pagination: {
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      },

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      breadcrumbs: [
        { title: "Kasir", disabled: true },
        { title: "Pembayaran", disabled: true },
      ],

      statusOptions: [
        { label: "Semua", value: null },
        { label: "Menunggu Pembayaran", value: "menunggu" },
        { label: "Diproses", value: "proses" },
        { label: "Lunas", value: "lunas" },
      ],

      channelOptions: [
        { label: "Semua", value: null },
        { label: "Konsultasi Offline", value: "offline" },
        { label: "Konsultasi Online", value: "online" },
        { label: "Tanpa Konsultasi", value: "tanpa_konsultasi" },
      ],

      headers: [
        {
          title: "Invoice",
          key: "invoice",
          sortable: false,
          width: 210,
        },
        {
          title: "Pasien",
          key: "pasien",
          sortable: false,
          minWidth: 260,
        },
        {
          title: "Kunjungan",
          key: "kunjungan",
          sortable: false,
          width: 170,
        },
        {
          title: "Layanan",
          key: "layanan",
          sortable: false,
          minWidth: 230,
        },
        {
          title: "Total Tagihan",
          key: "total",
          sortable: false,
          align: "end",
          width: 180,
        },
        {
          title: "Status",
          key: "status",
          sortable: false,
          width: 150,
        },
        {
          title: "Aksi",
          key: "aksi",
          sortable: false,
          align: "end",
          width: 120,
        },
      ],
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },

    summary() {
      if (this.summaryApi) {
        return {
          total: Number(this.summaryApi.total || 0),
          menunggu: Number(this.summaryApi.menunggu || 0),
          diproses: Number(this.summaryApi.diproses || 0),
          lunas: Number(this.summaryApi.lunas || 0),
        };
      }

      return {
        total: this.rows.length,
        menunggu: this.rows.filter((x) => this.getStatusKey(x) === "menunggu")
          .length,
        diproses: this.rows.filter((x) => this.getStatusKey(x) === "proses")
          .length,
        lunas: this.rows.filter((x) => this.getStatusKey(x) === "lunas").length,
      };
    },
  },

  mounted() {
    this.fetchData();
    this.startAutoRefresh();
  },

  beforeUnmount() {
    this.stopAutoRefresh();
  },

  beforeDestroy() {
    this.stopAutoRefresh();
  },

  methods: {
    getStatusColor(item) {
      const status = String(item.status || "").toLowerCase();
      const label = String(this.getStatusLabel(item) || "").toLowerCase();

      if (status.includes("lunas") || label.includes("lunas")) return "success";
      if (status.includes("proses") || label.includes("proses")) return "info";
      if (status.includes("batal") || label.includes("batal")) return "error";

      return "warning";
    },

    getStatusIcon(item) {
      const status = String(item.status || "").toLowerCase();
      const label = String(this.getStatusLabel(item) || "").toLowerCase();

      if (status.includes("lunas") || label.includes("lunas")) {
        return "mdi-check-circle-outline";
      }

      if (status.includes("proses") || label.includes("proses")) {
        return "mdi-progress-clock";
      }

      if (status.includes("batal") || label.includes("batal")) {
        return "mdi-close-circle-outline";
      }

      return "mdi-clock-outline";
    },
    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();

      return `${year}-${month}-${day}`;
    },

    async fetchData({ silent = false } = {}) {
      if (this.isFetching) return;

      this.isFetching = true;
      this.errorMessage = "";

      if (!silent) {
        this.loading = true;
      }

      try {
        const params = {
          page: this.pagination.page,
          per_page: this.pagination.perPage,
          search: this.filters.search || undefined,
          tanggal: this.filters.tanggal || undefined,
          status: this.filters.status || undefined,
          channel: this.filters.channel || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await pembayaranService.getAll(params);
        const payload = response?.data || response;

        this.rows = this.extractRows(payload);
        this.applyPagination(payload);
        this.applySummary(payload);
      } catch (error) {
        this.rows = [];
        this.summaryApi = null;
        this.pagination.total = 0;
        this.pagination.lastPage = 1;
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        this.loading = false;
        this.isFetching = false;
      }
    },

    extractRows(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.rows)) return payload.rows;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;

      return [];
    },

    applyPagination(payload) {
      const source = payload?.data || payload || {};
      const meta = payload?.meta || source?.meta || {};

      this.pagination.total = Number(
        source?.total || meta?.total || this.rows.length || 0,
      );

      this.pagination.lastPage = Number(
        source?.last_page ||
          meta?.last_page ||
          Math.ceil(this.pagination.total / this.pagination.perPage) ||
          1,
      );

      this.pagination.page = Number(
        source?.current_page || meta?.current_page || this.pagination.page || 1,
      );
    },

    applySummary(payload) {
      this.summaryApi =
        payload?.summary ||
        payload?.data?.summary ||
        payload?.meta?.summary ||
        null;
    },

    onSearch() {
      this.pagination.page = 1;
      this.fetchData();
    },

    onClearSearch() {
      this.filters.search = "";
      this.pagination.page = 1;
      this.fetchData();
    },

    onFilterChange() {
      this.pagination.page = 1;
      this.fetchData();
    },

    onPerPageChange() {
      this.pagination.page = 1;
      this.fetchData();
    },

    startAutoRefresh() {
      this.stopAutoRefresh();

      this.autoRefreshInterval = setInterval(() => {
        this.fetchData({ silent: true });
      }, this.refreshIntervalMs);
    },

    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },

    getRegistrasiId(item) {
      return item?.registrasi_id || item?.pembayaran_id || item?.id;
    },

    getNomorInvoice(item) {
      return (
        item?.nomor_invoice ||
        item?.invoice_number ||
        `INV-${this.getRegistrasiId(item) || "-"}`
      );
    },

    getNomorKunjungan(item) {
      return item?.nomor_kunjungan || item?.kode_registrasi || "-";
    },

    getPasienName(item) {
      return (
        item?.pasien?.nama ||
        item?.pasien?.nama_pasien ||
        item?.nama_pasien ||
        item?.pasien_nama ||
        "-"
      );
    },

    getPasienMeta(item) {
      const pasien = item?.pasien || {};

      return (
        [pasien.no_rm || item.no_rm, pasien.no_hp || item.no_hp]
          .filter(Boolean)
          .join(" • ") || "-"
      );
    },

    getWaktuKunjungan(item) {
      if (item?.waktu_kunjungan) return `Jam ${item.waktu_kunjungan}`;
      if (item?.jam_kunjungan) return `Jam ${item.jam_kunjungan}`;

      return `Jam ${this.formatTime(item?.registered_at || item?.created_at)}`;
    },

    getTotalTagihan(item) {
      return (
        item?.total_tagihan || item?.grand_total || item?.total_pembayaran || 0
      );
    },

    getStatusKey(item) {
      const raw = String(
        item?.status_pembayaran_key ||
          item?.status ||
          item?.status_pembayaran ||
          "menunggu",
      ).toLowerCase();

      if (["menunggu pembayaran", "menunggu"].includes(raw)) return "menunggu";
      if (["diproses", "proses"].includes(raw)) return "proses";
      if (["lunas", "selesai"].includes(raw)) return "lunas";

      return raw;
    },

    getStatusLabel(item) {
      const key = this.getStatusKey(item);

      const map = {
        menunggu: "Menunggu Pembayaran",
        proses: "Diproses",
        lunas: "Lunas",
      };

      return map[key] || "-";
    },

    getStatusClass(item) {
      const key = this.getStatusKey(item);

      const map = {
        menunggu: "status-waiting",
        proses: "status-process",
        lunas: "status-paid",
      };

      return map[key] || "status-waiting";
    },

    canProcessPayment(item) {
      if (
        item?.can_process_pembayaran === true ||
        item?.can_process_pembayaran === 1
      ) {
        return true;
      }

      return ["menunggu", "proses"].includes(this.getStatusKey(item));
    },

    getLayananLabel(item) {
      if (item?.layanan_label) return item.layanan_label;

      const hasConsultation = this.hasConsultation(item);
      const hasTreatment =
        this.isTrue(item?.ada_treatment) || this.isTrue(item?.is_treatment);
      const hasSales =
        this.isTrue(item?.ada_penjualan) || this.isTrue(item?.is_penjualan);

      if (hasConsultation && hasTreatment && hasSales)
        return "Konsultasi + Treatment + Penjualan";
      if (hasConsultation && hasTreatment) return "Konsultasi + Treatment";
      if (hasConsultation && hasSales) return "Konsultasi + Penjualan";
      if (hasTreatment && hasSales) return "Treatment + Penjualan";
      if (hasConsultation) return "Konsultasi";
      if (hasTreatment) return "Treatment";
      if (hasSales) return "Penjualan Produk";

      return "-";
    },

    hasConsultation(item) {
      return (
        this.isTrue(item?.ada_konsultasi) ||
        Number(item?.channel_konsultasi || 0) > 0 ||
        ["offline", "online"].includes(
          String(item?.channel_konsultasi || "").toLowerCase(),
        )
      );
    },

    formatChannel(channel) {
      const value = String(channel || "").toLowerCase();

      if (value === "1" || value === "offline") return "Konsultasi Offline";
      if (value === "2" || value === "online") return "Konsultasi Online";

      return "Tanpa Konsultasi";
    },

    goToProsesPembayaran(item) {
      this.$router.push(
        `/kasir/daftar-pembayaran/${this.getRegistrasiId(item)}/proses-pembayaran`,
      );
    },

    goToDetailPembayaran(item) {
      this.$router.push(
        `/kasir/daftar-pembayaran/${this.getRegistrasiId(item)}/detail-pembayaran`,
      );
    },

    isTrue(value) {
      return value === true || value === 1 || value === "1";
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    formatDate(value) {
      if (!value) return "-";

      if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        const [year, month, day] = String(value).split("-").map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatTime(value) {
      if (!value) return "-";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return "-";

      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    showSnackbar(text, color = "success") {
      this.snackbar.show = true;
      this.snackbar.text = text;
      this.snackbar.color = color;
    },

    getErrorMessage(error) {
      const response = error?.response?.data;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];

        if (firstKey && Array.isArray(response.errors[firstKey])) {
          return response.errors[firstKey][0];
        }
      }

      return (
        response?.message ||
        response?.error ||
        error?.message ||
        "Gagal mengambil data pembayaran"
      );
    },
  },
};
</script>

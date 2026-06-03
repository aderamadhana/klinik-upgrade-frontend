<template>
  <div>
    <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4">
      <div>
        <div class="text-h6 font-weight-bold">Daftar Pembayaran</div>
        <div class="text-body-2 text-medium-emphasis">
          Monitoring pembayaran pasien dari registrasi layanan.
        </div>

        <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mt-2">
          <template #divider>
            <v-icon size="16">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </div>

      <v-chip
        color="success"
        variant="tonal"
        size="small"
        prepend-icon="mdi-timer-sync-outline"
      >
        Auto refresh 30 detik
      </v-chip>
    </div>

    <v-card variant="outlined" class="mb-4">
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" md="4">
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

          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="filters.tanggal"
              label="Tanggal"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              placeholder="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.channel"
              :items="channelOptions"
              item-title="label"
              item-value="value"
              placeholder="Channel"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="1">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              class="w-100"
              :loading="loading"
              @click="fetchData()"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card variant="outlined">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          :items-per-page="pagination.perPage"
          item-value="id"
          density="compact"
          hide-default-footer
          class="border"
          loading-text="Memuat data pembayaran..."
          no-data-text="Data pembayaran tidak ditemukan"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="40" color="grey">
                mdi-credit-card-off-outline
              </v-icon>

              <div class="text-subtitle-2 mt-3">
                Data pembayaran belum tersedia
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Data muncul saat registrasi masuk ke task pembayaran.
              </div>
            </div>
          </template>

          <template #item.invoice_pasien="{ item }">
            <div class="d-flex align-start ga-3 py-2">
              <div class="flex-grow-1">
                <button
                  type="button"
                  class="text-primary font-weight-bold text-body-2 mb-1 bg-transparent border-0 pa-0 text-left"
                  @click="goToDetailPembayaran(item)"
                >
                  {{ getNomorInvoice(item) }}
                </button>

                <div
                  class="text-body-2 text-medium-emphasis d-flex align-center ga-1 mb-1"
                >
                  <v-icon size="14">mdi-file-document-outline</v-icon>
                  <span>{{ getNomorKunjungan(item) }}</span>
                </div>

                <div
                  class="text-body-2 text-medium-emphasis d-flex align-center ga-1 mb-1"
                >
                  <v-icon size="14">mdi-calendar-month-outline</v-icon>
                  <span>{{ formatDate(getDataDate(item)) }}</span>
                </div>

                <div
                  class="text-body-2 text-medium-emphasis d-flex align-center ga-1"
                >
                  <v-icon size="14">mdi-clock-outline</v-icon>
                  <span>{{ formatTime(getDataTime(item)) }}</span>
                </div>
              </div>

              <v-divider vertical />

              <div class="flex-grow-1">
                <div class="font-weight-bold text-body-2 mb-1">
                  {{ getPasienName(item) }}
                </div>

                <div class="text-body-2 text-medium-emphasis mb-2">
                  {{ getPasienMeta(item) }}
                </div>

                <div class="d-flex flex-wrap ga-1">
                  <v-chip size="x-small" color="primary" variant="tonal">
                    {{ getTokoName(item) }}
                  </v-chip>

                  <v-chip
                    v-if="hasConsultation(item)"
                    size="x-small"
                    color="info"
                    variant="tonal"
                  >
                    {{ getConsultationLabel(item) }}
                  </v-chip>
                </div>
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-if="hasTreatment(item)"
                size="small"
                color="success"
                variant="tonal"
                prepend-icon="mdi-face-woman-shimmer-outline"
              >
                Treatment
              </v-chip>

              <v-chip
                v-if="hasConsultation(item)"
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-stethoscope"
              >
                {{ getConsultationLabel(item) }}
              </v-chip>

              <v-chip
                v-if="hasSales(item)"
                size="small"
                color="info"
                variant="tonal"
                prepend-icon="mdi-cart-outline"
              >
                Penjualan
              </v-chip>

              <v-chip
                v-if="isPembelianOnline(item)"
                size="small"
                color="deep-purple"
                variant="tonal"
                prepend-icon="mdi-web"
              >
                Pembelian Online
              </v-chip>

              <span
                v-if="
                  !hasTreatment(item) &&
                  !hasConsultation(item) &&
                  !hasSales(item) &&
                  !isPembelianOnline(item)
                "
                class="text-body-2 text-medium-emphasis"
              >
                -
              </span>
            </div>
          </template>

          <template #item.total_status="{ item }">
            <div class="py-2">
              <div class="font-weight-bold text-body-2">
                Rp {{ formatNumber(getTotalTagihan(item)) }}
              </div>

              <div class="text-body-2 text-medium-emphasis">
                {{ item.metode_pembayaran || "Belum ada metode" }}
              </div>

              <div class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  size="x-small"
                  :color="getStatusMeta(item).color"
                  variant="tonal"
                  :prepend-icon="getStatusMeta(item).icon"
                >
                  {{ getStatusMeta(item).label }}
                </v-chip>

                <v-chip
                  v-if="canProcessPayment(item)"
                  size="x-small"
                  color="warning"
                  variant="tonal"
                  prepend-icon="mdi-cash-register"
                >
                  Perlu Diproses
                </v-chip>
              </div>
            </div>
          </template>

          <template #item.aksi="{ item }">
            <div class="d-flex justify-end flex-wrap ga-2 py-2">
              <v-btn
                v-if="canProcessPayment(item)"
                color="primary"
                variant="flat"
                size="small"
                prepend-icon="mdi-cash-register"
                @click="goToProsesPembayaran(item)"
              >
                Proses
              </v-btn>

              <v-btn
                v-else
                color="info"
                variant="tonal"
                size="small"
                prepend-icon="mdi-eye-outline"
                @click="goToDetailPembayaran(item)"
              >
                Detail
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider />

      <v-card-text
        class="d-flex align-center justify-space-between flex-wrap ga-3"
      >
        <div class="text-body-2 text-medium-emphasis">
          Total data:
          <span class="font-weight-bold">{{ pagination.total }}</span>
        </div>

        <div class="d-flex align-center flex-wrap ga-3">
          <v-select
            v-model="pagination.perPage"
            :items="[10, 15, 25, 50, 100]"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="onPerPageChange"
          />

          <v-pagination
            v-model="pagination.page"
            :length="pagination.lastPage || 1"
            density="compact"
            total-visible="5"
            @update:model-value="onPageChange"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="2500"
      location="top right"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false"> Tutup </v-btn>
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
        {
          title: "Kasir",
          disabled: true,
        },
        {
          title: "Daftar Pembayaran",
          disabled: true,
        },
      ],

      statusOptions: [
        {
          label: "Semua",
          value: null,
        },
        {
          label: "Menunggu Pembayaran",
          value: "menunggu",
        },
        {
          label: "Diproses",
          value: "proses",
        },
        {
          label: "Lunas",
          value: "lunas",
        },
      ],

      channelOptions: [
        {
          label: "Semua",
          value: null,
        },
        {
          label: "Konsultasi Offline",
          value: "offline",
        },
        {
          label: "Konsultasi Online",
          value: "online",
        },
        {
          label: "Konsultasi SPPG",
          value: "sppg",
        },
        {
          label: "Konsultasi SPKK",
          value: "spkk",
        },
        {
          label: "Tanpa Konsultasi",
          value: "tanpa_konsultasi",
        },
      ],

      headers: [
        {
          title: "Invoice & Pasien",
          key: "invoice_pasien",
          sortable: false,
          minWidth: 440,
        },
        {
          title: "Layanan",
          key: "layanan",
          sortable: false,
          minWidth: 260,
        },
        {
          title: "Total / Status",
          key: "total_status",
          sortable: false,
          minWidth: 220,
        },
        {
          title: "Aksi",
          key: "aksi",
          sortable: false,
          align: "end",
          minWidth: 160,
        },
      ],
    };
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
          toko_id: this.activeTokoId() || undefined,
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

    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
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

    onPageChange() {
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
        item?.no_invoice ||
        `INV-${this.getRegistrasiId(item) || "-"}`
      );
    },

    getNomorKunjungan(item) {
      return item?.nomor_kunjungan || item?.kode_registrasi || "-";
    },

    getDataDate(item) {
      return (
        item?.tanggal_kunjungan ||
        item?.tanggal ||
        item?.tanggal_invoice ||
        item?.created_at ||
        null
      );
    },

    getDataTime(item) {
      return (
        item?.waktu_kunjungan ||
        item?.jam_kunjungan ||
        item?.registered_at ||
        item?.created_at ||
        null
      );
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
        [
          pasien.no_rm || item?.no_rm,
          pasien.no_hp || item?.no_hp || item?.pasien_no_hp,
        ]
          .filter(Boolean)
          .join(" • ") || "-"
      );
    },

    getTokoName(item) {
      return item?.toko_nama || item?.nama_toko || item?.toko?.nama || "Cabang";
    },

    getTotalTagihan(item) {
      return (
        item?.total_tagihan ||
        item?.grand_total ||
        item?.total_pembayaran ||
        item?.total ||
        0
      );
    },

    getStatusKey(item) {
      const raw = String(
        item?.status_pembayaran_key ||
          item?.status ||
          item?.status_pembayaran ||
          "menunggu",
      ).toLowerCase();

      if (["menunggu pembayaran", "menunggu", "waiting"].includes(raw)) {
        return "menunggu";
      }

      if (["diproses", "proses", "process"].includes(raw)) {
        return "proses";
      }

      if (["lunas", "selesai", "paid", "done"].includes(raw)) {
        return "lunas";
      }

      if (["batal", "cancel", "cancelled"].includes(raw)) {
        return "batal";
      }

      return raw;
    },

    getStatusLabel(item) {
      const key = this.getStatusKey(item);

      const map = {
        menunggu: "Menunggu Pembayaran",
        proses: "Diproses",
        lunas: "Lunas",
        batal: "Batal",
      };

      return map[key] || "-";
    },

    getStatusMeta(item) {
      const key = this.getStatusKey(item);

      const map = {
        menunggu: {
          label: "Menunggu Pembayaran",
          color: "warning",
          icon: "mdi-clock-outline",
        },
        proses: {
          label: "Diproses",
          color: "info",
          icon: "mdi-progress-clock",
        },
        lunas: {
          label: "Lunas",
          color: "success",
          icon: "mdi-check-circle-outline",
        },
        batal: {
          label: "Batal",
          color: "error",
          icon: "mdi-close-circle-outline",
        },
      };

      return (
        map[key] || {
          label: "-",
          color: "grey",
          icon: "mdi-help-circle-outline",
        }
      );
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

    hasTreatment(item) {
      return (
        this.isTrue(item?.ada_treatment) || this.isTrue(item?.is_treatment)
      );
    },

    hasSales(item) {
      return (
        this.isTrue(item?.ada_penjualan) ||
        this.isTrue(item?.is_penjualan) ||
        this.isTrue(item?.ada_produk)
      );
    },

    hasConsultation(item) {
      const sourceCode = String(item?.konsultasi_source_code || "").trim();
      const sourceName = String(item?.konsultasi_source_name || "").trim();
      const jenisLabel = String(item?.jenis_konsultasi_label || "").trim();

      return (
        this.isTrue(item?.ada_konsultasi) ||
        sourceCode !== "" ||
        sourceName !== "" ||
        jenisLabel !== "" ||
        Number(item?.channel_konsultasi || 0) > 0 ||
        ["offline", "online"].includes(
          String(item?.channel_konsultasi || "").toLowerCase(),
        )
      );
    },

    isPembelianOnline(item) {
      return (
        this.isTrue(item?.is_pembelian_online) ||
        this.isTrue(item?.ada_pembelian_online)
      );
    },

    getConsultationLabel(item) {
      const apiLabel = String(
        item?.jenis_konsultasi_label ||
          item?.konsultasi_source_name ||
          item?.channel_konsultasi_label ||
          "",
      ).trim();

      if (apiLabel) return apiLabel;

      const sourceCode = String(item?.konsultasi_source_code || "")
        .trim()
        .toUpperCase();

      const sourceMap = {
        KONSULTASI_OFFLINE: "Konsultasi Dokter",
        KONSULTASI_ONLINE: "Konsultasi Online",
        KONSULTASI_SPPG: "Konsultasi SPPG",
        KONSULTASI_SPKK: "Konsultasi SPKK",
        KONSULTASI_SPPK: "Konsultasi SPKK",
      };

      if (sourceMap[sourceCode]) {
        return sourceMap[sourceCode];
      }

      const channel = String(item?.channel_konsultasi || "").toLowerCase();

      if (channel === "1" || channel === "offline") return "Konsultasi Offline";
      if (channel === "2" || channel === "online") return "Konsultasi Online";
      if (channel === "sppg") return "Konsultasi SPPG";
      if (channel === "spkk") return "Konsultasi SPKK";
      if (channel === "sppk") return "Konsultasi SPKK";

      return "Konsultasi";
    },

    formatChannel(itemOrChannel) {
      const isObject =
        itemOrChannel !== null &&
        typeof itemOrChannel === "object" &&
        !Array.isArray(itemOrChannel);

      if (isObject) {
        return this.getConsultationLabel(itemOrChannel);
      }

      const value = String(itemOrChannel || "").toLowerCase();

      if (value === "1" || value === "offline") return "Konsultasi Offline";
      if (value === "2" || value === "online") return "Konsultasi Online";
      if (value === "sppg") return "Konsultasi SPPG";
      if (value === "spkk") return "Konsultasi SPKK";
      if (value === "sppk") return "Konsultasi SPKK";

      return "Tanpa Konsultasi";
    },

    goToProsesPembayaran(item) {
      this.$router.push(
        `/kasir/daftar-pembayaran/${this.getRegistrasiId(
          item,
        )}/proses-pembayaran`,
      );
    },

    goToDetailPembayaran(item) {
      this.$router.push(
        `/kasir/daftar-pembayaran/${this.getRegistrasiId(
          item,
        )}/detail-pembayaran`,
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

      const raw = String(value);

      if (/^\d{2}:\d{2}/.test(raw)) {
        return raw.slice(0, 5);
      }

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

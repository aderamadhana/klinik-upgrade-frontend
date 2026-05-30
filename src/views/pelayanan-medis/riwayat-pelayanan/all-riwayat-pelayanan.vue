<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Riwayat Pelayanan</h1>
        <p class="page-subtitle">
          Daftar kunjungan pasien yang sudah selesai diproses
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card variant="flat" class="border mb-4">
      <!-- TOOLBAR -->
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              placeholder="Cari no registrasi, pasien, no RM, dokter..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="onSearch"
              @click:clear="onClearSearch"
            />
          </v-col>

          <v-col cols="12" md="8">
            <v-row dense justify="end" align="center">
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filters.tanggal_mulai"
                  label="Dari Tanggal"
                  type="date"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="onFilterChange"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filters.tanggal_selesai"
                  label="Sampai Tanggal"
                  type="date"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="onFilterChange"
                />
              </v-col>

              <v-col cols="12" sm="6" md="2">
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

              <v-col cols="12" sm="6" md="2">
                <v-select
                  v-model="filters.layanan"
                  :items="layananOptions"
                  item-title="label"
                  item-value="value"
                  label="Layanan"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="onFilterChange"
                />
              </v-col>

              <v-col cols="12" sm="6" md="2">
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
          <v-chip color="success" size="small" prepend-icon="mdi-history">
            Data Pelayanan Selesai
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
                      Total Riwayat
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.total }}
                    </div>
                  </div>

                  <v-avatar color="primary" size="36">
                    <v-icon icon="mdi-clipboard-text-clock-outline" size="20" />
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
                      Konsultasi
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.konsultasi }}
                    </div>
                  </div>

                  <v-avatar color="info" size="36">
                    <v-icon icon="mdi-stethoscope" size="20" />
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
                      Treatment
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.treatment }}
                    </div>
                  </div>

                  <v-avatar color="success" size="36">
                    <v-icon icon="mdi-face-man-shimmer-outline" size="20" />
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
                      Dengan Penjualan
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.penjualan }}
                    </div>
                  </div>

                  <v-avatar color="warning" size="36">
                    <v-icon icon="mdi-cart-check" size="20" />
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
          loading-text="Memuat data riwayat pelayanan..."
          no-data-text="Data riwayat pelayanan tidak ditemukan"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@8" />
          </template>
          <template #item.registrasi="{ item }">
            <div class="py-2">
              <v-btn
                variant="text"
                color="primary"
                size="small"
                class="px-0 font-weight-bold"
                @click="goToDetail(item)"
              >
                {{ getKodeRegistrasi(item) }}
              </v-btn>

              <div class="text-caption text-medium-emphasis">
                {{ getInvoiceNumber(item) }}
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

              <div class="text-caption text-medium-emphasis mt-1">
                {{ formatChannel(item.channel_konsultasi) }}
              </div>
            </div>
          </template>

          <template #item.petugas="{ item }">
            <div class="py-2">
              <div class="text-body-2 font-weight-medium">
                {{ getDokterName(item) }}
              </div>

              <div class="text-caption text-medium-emphasis mt-1">
                {{ getPerawatName(item) }}
              </div>
            </div>
          </template>

          <template #item.total="{ item }">
            <div class="text-body-2 font-weight-bold">
              Rp {{ formatNumber(getTotalPembayaran(item)) }}
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              color="success"
              prepend-icon="mdi-check-circle-outline"
            >
              {{ getStatusLabel(item.status) }}
            </v-chip>
          </template>

          <template #item.aksi="{ item }">
            <div class="d-flex justify-end align-center ga-2 flex-wrap py-2">
              <v-btn
                size="small"
                color="primary"
                prepend-icon="mdi-eye-outline"
                @click="goToDetail(item)"
              >
                Detail
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-avatar color="grey-lighten-3" size="56" class="mb-3">
                <v-icon
                  icon="mdi-clipboard-text-off-outline"
                  size="30"
                  color="grey"
                />
              </v-avatar>

              <div class="text-subtitle-2 font-weight-bold mb-1">
                Belum ada riwayat pelayanan
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Data akan muncul setelah pelayanan selesai diproses.
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
import riwayatPelayananService from "@/services/pelayanan-medis/riwayatPelayananService";

export default {
  name: "AllRiwayatPelayanan",

  data() {
    return {
      loading: false,
      isFetching: false,
      errorMessage: "",

      rows: [],
      summaryApi: null,

      filters: {
        search: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        channel: null,
        layanan: null,
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
        { title: "Pelayanan Medis", disabled: true },
        { title: "Riwayat Pelayanan", disabled: true },
      ],

      channelOptions: [
        { label: "Semua", value: null },
        { label: "Konsultasi Offline", value: "offline" },
        { label: "Konsultasi Online", value: "online" },
        { label: "Tanpa Konsultasi", value: "tanpa_konsultasi" },
      ],

      layananOptions: [
        { label: "Semua", value: null },
        { label: "Konsultasi", value: "konsultasi" },
        { label: "Treatment", value: "treatment" },
        { label: "Penjualan", value: "penjualan" },
        { label: "Konsultasi + Treatment", value: "konsultasi_treatment" },
        { label: "Treatment + Penjualan", value: "treatment_penjualan" },
        { label: "Konsultasi + Treatment + Penjualan", value: "full" },
      ],

      headers: [
        {
          title: "No Registrasi",
          key: "registrasi",
          sortable: false,
          width: 200,
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
          title: "Dokter / Perawat",
          key: "petugas",
          sortable: false,
          minWidth: 240,
        },
        {
          title: "Total",
          key: "total",
          sortable: false,
          align: "end",
          width: 160,
        },
        {
          title: "Status",
          key: "status",
          sortable: false,
          width: 120,
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
          total: Number(this.summaryApi.total ?? this.pagination.total ?? 0),
          konsultasi: Number(this.summaryApi.konsultasi ?? 0),
          treatment: Number(this.summaryApi.treatment ?? 0),
          penjualan: Number(this.summaryApi.penjualan ?? 0),
        };
      }

      return {
        total: this.pagination.total || this.rows.length,
        konsultasi: this.rows.filter((x) => this.hasConsultation(x)).length,
        treatment: this.rows.filter((x) => this.hasTreatment(x)).length,
        penjualan: this.rows.filter((x) => this.hasSales(x)).length,
      };
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      if (this.isFetching) return;

      this.isFetching = true;
      this.loading = true;
      this.errorMessage = "";

      try {
        const params = {
          page: this.pagination.page,
          per_page: this.pagination.perPage,
          search: this.filters.search || undefined,
          tanggal_mulai: this.filters.tanggal_mulai || undefined,
          tanggal_selesai: this.filters.tanggal_selesai || undefined,
          channel: this.filters.channel || undefined,
          layanan: this.filters.layanan || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await riwayatPelayananService.getAll(params);
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
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.rows)) return payload.rows;

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

    goToDetail(item) {
      const id = this.getRegistrasiId(item);

      if (!id) {
        this.showSnackbar("ID registrasi tidak ditemukan", "error");
        return;
      }

      this.$router.push(`/pelayanan-medis/riwayat-pelayanan/${id}/detail`);
    },

    getRegistrasiId(item) {
      return item?.registrasi_id || item?.registrasi?.id || item?.id;
    },

    getKodeRegistrasi(item) {
      return (
        item?.kode_registrasi ||
        item?.nomor_kunjungan ||
        item?.registrasi?.kode_registrasi ||
        `REG-${this.getRegistrasiId(item) || "-"}`
      );
    },

    getInvoiceNumber(item) {
      return (
        item?.nomor_invoice ||
        item?.invoice_number ||
        item?.pembayaran?.faktur ||
        item?.pembayaran?.nomor_invoice ||
        "-"
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
        [pasien.no_rm || item.no_rm, pasien.no_hp || item.no_hp]
          .filter(Boolean)
          .join(" • ") || "-"
      );
    },

    getDokterName(item) {
      return (
        item?.dokter_awal?.nama ||
        item?.dokterAwal?.nama ||
        item?.dokter?.nama ||
        item?.nama_dokter ||
        item?.dokter_nama ||
        "-"
      );
    },

    getPerawatName(item) {
      return (
        item?.perawat_awal?.nama ||
        item?.perawatAwal?.nama ||
        item?.perawat?.nama ||
        item?.nama_perawat ||
        item?.perawat_nama ||
        "-"
      );
    },

    getWaktuKunjungan(item) {
      if (item?.waktu_kunjungan) return item.waktu_kunjungan;
      if (item?.jam_kunjungan) return item.jam_kunjungan;

      return this.formatTime(item?.registered_at || item?.created_at);
    },

    getTotalPembayaran(item) {
      return (
        item?.total_pembayaran ||
        item?.grand_total ||
        item?.total_bayar ||
        item?.pembayaran?.total_harga ||
        0
      );
    },

    getStatusLabel(value) {
      const status = Number(value || 0);

      const map = {
        0: "Draft",
        1: "Aktif",
        2: "Selesai",
        9: "Batal",
      };

      if (map[status]) return map[status];

      return value || "Selesai";
    },

    getLayananLabel(item) {
      if (item?.layanan_label) return item.layanan_label;

      const hasConsultation = this.hasConsultation(item);
      const hasTreatment = this.hasTreatment(item);
      const hasSales = this.hasSales(item);

      if (hasConsultation && hasTreatment && hasSales) {
        return "Konsultasi + Treatment + Penjualan";
      }

      if (hasConsultation && hasTreatment) {
        return "Konsultasi + Treatment";
      }

      if (hasConsultation && hasSales) {
        return "Konsultasi + Penjualan";
      }

      if (hasTreatment && hasSales) {
        return "Treatment + Penjualan";
      }

      if (hasConsultation) return "Konsultasi";
      if (hasTreatment) return "Treatment";
      if (hasSales) return "Penjualan";

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

    hasTreatment(item) {
      return (
        this.isTrue(item?.ada_treatment) || this.isTrue(item?.is_treatment)
      );
    },

    hasSales(item) {
      return (
        this.isTrue(item?.ada_penjualan) || this.isTrue(item?.is_penjualan)
      );
    },

    formatChannel(channel) {
      const value = String(channel || "").toLowerCase();

      if (value === "1" || value === "offline") return "Konsultasi Offline";
      if (value === "2" || value === "online") return "Konsultasi Online";

      return "Tanpa Konsultasi";
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
        "Gagal mengambil data riwayat pelayanan"
      );
    },
  },
};
</script>

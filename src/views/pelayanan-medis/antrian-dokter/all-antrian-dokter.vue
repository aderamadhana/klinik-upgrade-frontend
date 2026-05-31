<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Antrian Dokter</h1>
        <p class="page-subtitle">
          Kelola antrian pasien yang masuk ke jalur dokter
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
              placeholder="Cari no registrasi, no RM, pasien, dokter..."
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
          <v-col
            v-for="card in summaryCards"
            :key="card.key"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card :color="card.color">
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption font-weight-medium">
                      {{ card.label }}
                    </div>

                    <div class="text-h6 font-weight-bold mt-1">
                      {{ card.value }}
                    </div>
                  </div>

                  <v-icon :icon="card.icon" size="28" />
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
          loading-text="Memuat data antrian dokter..."
          no-data-text="Data antrian dokter tidak ditemukan"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@8" />
          </template>

          <template #item.pasien_kunjungan="{ item }">
            <div class="py-3">
              <div class="d-flex align-center ga-2 flex-wrap mb-2">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  class="px-0 font-weight-bold"
                  prepend-icon="mdi-ticket-confirmation-outline"
                  @click="goToDetailRegistrasi(item)"
                >
                  {{ getKodeRegistrasi(item) }}
                </v-btn>

                <v-chip
                  size="small"
                  color="secondary"
                  prepend-icon="mdi-calendar-clock-outline"
                >
                  {{ formatDate(item.tanggal_kunjungan || item.tanggal) }}
                  {{ getWaktuKunjungan(item) }}
                </v-chip>
              </div>

              <div class="text-body-2 font-weight-bold">
                {{ getPasienName(item) }}
              </div>

              <div class="text-caption text-medium-emphasis mt-1">
                {{ getPasienMeta(item) }}
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="py-3">
              <!-- <div class="text-body-2 font-weight-bold mb-2">
                {{ formatLayanan(item) }}
              </div> -->

              <div class="d-flex align-center ga-1 flex-wrap">
                <v-chip
                  v-for="chip in getLayananChips(item)"
                  :key="chip.label"
                  :color="chip.color"
                  :prepend-icon="chip.icon"
                  size="small"
                >
                  {{ chip.label }}
                </v-chip>
              </div>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="default"
              :color="getStatusColor(item)"
              :prepend-icon="getStatusIcon(item)"
              variant="flat"
              class="font-weight-bold"
            >
              {{ formatStatus(item) }}
            </v-chip>
          </template>

          <template #item.aksi="{ item }">
            <div class="d-flex justify-end align-center ga-2 py-2 flex-wrap">
              <v-btn
                size="small"
                color="primary"
                variant="flat"
                prepend-icon="mdi-play-circle-outline"
                @click.stop="goToProsesAntrianDokter(item)"
              >
                Proses
              </v-btn>

              <v-btn
                size="small"
                color="error"
                prepend-icon="mdi-delete-outline"
                @click.stop="confirmDelete(item)"
              >
                Hapus
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
                Belum ada antrian dokter
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Data akan muncul setelah FO menyimpan registrasi dengan jalur
                dokter.
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

    <!-- DELETE DIALOG -->
    <v-dialog v-model="dialogDelete" max-width="460">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold pa-4">
          Hapus Antrian Dokter?
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-alert type="warning" density="compact" class="mb-4">
            Data antrian dokter ini akan dihapus dari daftar antrian.
          </v-alert>

          <v-card v-if="selectedItem" variant="outlined">
            <v-card-text class="pa-3">
              <div class="d-flex justify-space-between align-center mb-2 ga-3">
                <span class="text-body-2 text-medium-emphasis">
                  No Registrasi
                </span>

                <strong class="text-body-2 text-right">
                  {{ getKodeRegistrasi(selectedItem) }}
                </strong>
              </div>

              <div class="d-flex justify-space-between align-center mb-2 ga-3">
                <span class="text-body-2 text-medium-emphasis"> Pasien </span>

                <strong class="text-body-2 text-right">
                  {{ getPasienName(selectedItem) }}
                </strong>
              </div>

              <div class="d-flex justify-space-between align-center ga-3">
                <span class="text-body-2 text-medium-emphasis"> Dokter </span>

                <strong class="text-body-2 text-right">
                  {{ getDokterName(selectedItem) }}
                </strong>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            :disabled="deleteLoading"
            @click="closeDeleteDialog"
          >
            Batal
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-delete-outline"
            :loading="deleteLoading"
            @click="deleteItem"
          >
            Ya, Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import antrianDokterService from "@/services/pelayanan-medis/antrianDokterService";

export default {
  name: "AllAntrianDokter",

  data() {
    return {
      loading: false,
      isFetching: false,
      errorMessage: "",
      autoRefreshInterval: null,
      refreshIntervalMs: 30000,

      filters: {
        search: "",
        tanggal: this.getToday(),
        status: null,
        channel: null,
      },

      rows: [],

      pagination: {
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      },

      dialogDelete: false,
      deleteLoading: false,
      selectedItem: null,

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      breadcrumbs: [
        { title: "Pelayanan Medis", disabled: true },
        { title: "Antrian Dokter", disabled: true },
      ],

      statusOptions: [
        { label: "Semua", value: null },
        { label: "Menunggu", value: "menunggu" },
        { label: "Dipanggil", value: "dipanggil" },
        { label: "Diproses", value: "proses" },
        { label: "Selesai", value: "selesai" },
      ],

      channelOptions: [
        { label: "Semua", value: null },
        { label: "Offline", value: "offline" },
        { label: "Online", value: "online" },
        { label: "Tanpa Konsultasi", value: "tanpa_konsultasi" },
      ],

      headers: [
        {
          title: "Pasien / Kunjungan",
          key: "pasien_kunjungan",
          sortable: false,
          minWidth: 390,
        },
        {
          title: "Layanan",
          key: "layanan",
          sortable: false,
          minWidth: 150,
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
          width: 350,
        },
      ],
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },

    summary() {
      return {
        total: this.rows.length,
        menunggu: this.rows.filter((x) => this.getStatusValue(x) === "menunggu")
          .length,
        diproses: this.rows.filter((x) =>
          ["dipanggil", "proses"].includes(this.getStatusValue(x)),
        ).length,
        selesai: this.rows.filter((x) => this.getStatusValue(x) === "selesai")
          .length,
      };
    },

    summaryCards() {
      return [
        {
          key: "total",
          label: "Total Antrian",
          value: this.summary.total,
          color: "primary",
          icon: "mdi-format-list-numbered",
        },
        {
          key: "menunggu",
          label: "Menunggu",
          value: this.summary.menunggu,
          color: "warning",
          icon: "mdi-clock-outline",
        },
        {
          key: "diproses",
          label: "Diproses",
          value: this.summary.diproses,
          color: "info",
          icon: "mdi-progress-clock",
        },
        {
          key: "selesai",
          label: "Selesai",
          value: this.summary.selesai,
          color: "success",
          icon: "mdi-check-circle-outline",
        },
      ];
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

        const response = await antrianDokterService.getAll(params);
        const payload = response?.data || response;

        this.rows = this.extractRows(payload);
        this.applyPagination(payload);
      } catch (error) {
        this.rows = [];
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
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.rows)) return payload.rows;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;

      return [];
    },

    applyPagination(payload) {
      const meta = payload?.meta || payload?.data?.meta || {};

      this.pagination.total = Number(
        payload?.total ||
          meta?.total ||
          payload?.data?.total ||
          this.rows.length ||
          0,
      );

      this.pagination.lastPage = Number(
        payload?.last_page ||
          meta?.last_page ||
          payload?.data?.last_page ||
          Math.ceil(this.pagination.total / this.pagination.perPage) ||
          1,
      );

      this.pagination.page = Number(
        payload?.current_page ||
          meta?.current_page ||
          payload?.data?.current_page ||
          this.pagination.page ||
          1,
      );
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

    goToProsesAntrianDokter(item) {
      const id = this.getRegistrasiId(item);

      this.$router.push(
        `/pelayanan-medis/antrian-dokter/${id}/proses-antrian-dokter`,
      );
    },

    goToDetailRegistrasi(item) {
      const id = this.getRegistrasiId(item);

      this.$router.push(`/resepsionis/registrasi-layanan/${id}`);
    },

    confirmDelete(item) {
      this.selectedItem = { ...item };
      this.dialogDelete = true;
    },

    closeDeleteDialog() {
      this.dialogDelete = false;
      this.selectedItem = null;
    },

    async deleteItem() {
      if (!this.selectedItem) return;

      this.deleteLoading = true;

      try {
        const id = this.getAntrianId(this.selectedItem);

        const response = await antrianDokterService.delete(id);

        this.showSnackbar(
          response?.data?.message ||
            response?.message ||
            "Antrian dokter berhasil dihapus",
          "success",
        );

        this.closeDeleteDialog();
        this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.deleteLoading = false;
      }
    },

    getAntrianId(item) {
      return (
        item?.antrian_dokter_id ||
        item?.antrian_id ||
        item?.queue_id ||
        item?.id
      );
    },

    getRegistrasiId(item) {
      return item?.registrasi_id || item?.registrasi?.id || item?.id;
    },

    getKodeRegistrasi(item) {
      return (
        item?.kode_registrasi ||
        item?.registrasi?.kode_registrasi ||
        item?.no_registrasi ||
        `REG-${this.getRegistrasiId(item) || "-"}`
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
      const noRm = pasien.no_rm || item.no_rm;
      const noHp = pasien.no_hp || item.no_hp;

      return [noRm, noHp].filter(Boolean).join(" • ") || "-";
    },

    getDokterName(item) {
      return (
        item?.dokter_awal?.nama ||
        item?.dokterAwal?.nama ||
        item?.dokter?.nama ||
        item?.nama_dokter ||
        item?.dokter_nama ||
        "Belum ditentukan"
      );
    },

    getWaktuKunjungan(item) {
      if (item?.waktu_kunjungan) return item.waktu_kunjungan;
      if (item?.jam_kunjungan) return item.jam_kunjungan;

      return this.formatTime(item?.registered_at || item?.created_at);
    },

    normalizeStatus(raw) {
      if (raw === 0 || raw === "0") return "menunggu";
      if (raw === 1 || raw === "1") return "menunggu";
      if (raw === 2 || raw === "2") return "selesai";
      if (raw === 9 || raw === "9") return "batal";

      const value = String(raw || "menunggu").toLowerCase();

      if (["waiting", "menunggu"].includes(value)) return "menunggu";
      if (["called", "dipanggil"].includes(value)) return "dipanggil";
      if (["process", "processing", "proses", "diproses"].includes(value)) {
        return "proses";
      }
      if (["done", "finish", "finished", "selesai"].includes(value)) {
        return "selesai";
      }
      if (["cancel", "cancelled", "batal"].includes(value)) return "batal";

      return value;
    },

    getStatusValue(item) {
      if (
        typeof item === "string" ||
        typeof item === "number" ||
        item === null ||
        item === undefined
      ) {
        return this.normalizeStatus(item);
      }

      const raw =
        item?.status_antrian ||
        item?.queue_status ||
        item?.status_task ||
        item?.status;

      return this.normalizeStatus(raw);
    },

    formatStatus(item) {
      const status = this.getStatusValue(item);

      const map = {
        menunggu: "Menunggu",
        dipanggil: "Dipanggil",
        proses: "Diproses",
        selesai: "Selesai",
        batal: "Batal",
      };

      return map[status] || status || "-";
    },

    getStatusColor(item) {
      const status = this.getStatusValue(item);

      const map = {
        menunggu: "warning",
        dipanggil: "info",
        proses: "primary",
        selesai: "success",
        batal: "error",
      };

      return map[status] || "grey";
    },

    getStatusIcon(item) {
      const status = this.getStatusValue(item);

      const map = {
        menunggu: "mdi-clock-outline",
        dipanggil: "mdi-bell-ring-outline",
        proses: "mdi-progress-clock",
        selesai: "mdi-check-circle-outline",
        batal: "mdi-close-circle-outline",
      };

      return map[status] || "mdi-help-circle-outline";
    },

    getKonsultasiSourceCode(item) {
      return (
        item?.konsultasi_source_code ||
        item?.registrasi?.konsultasi_source_code ||
        item?.layanan?.konsultasi_source_code ||
        item?.konsultasi?.source_code ||
        ""
      );
    },

    getKonsultasiSourceName(item) {
      return (
        item?.jenis_konsultasi_label ||
        item?.registrasi?.jenis_konsultasi_label ||
        item?.layanan?.jenis_konsultasi_label ||
        item?.konsultasi_source_name ||
        item?.registrasi?.konsultasi_source_name ||
        item?.layanan?.konsultasi_source_name ||
        item?.konsultasi?.source_name ||
        ""
      );
    },

    getKonsultasiChannelValue(item) {
      return String(
        item?.channel_konsultasi ??
          item?.registrasi?.channel_konsultasi ??
          item?.layanan?.channel_konsultasi ??
          "",
      ).toLowerCase();
    },

    formatChannel(item) {
      const sourceName = this.getKonsultasiSourceName(item);

      if (sourceName) {
        return sourceName;
      }

      const sourceCode = String(
        this.getKonsultasiSourceCode(item) || "",
      ).toUpperCase();

      if (sourceCode.includes("ONLINE")) return "Konsultasi Online";
      if (sourceCode.includes("SPPG")) return "Konsultasi SPPG";
      if (sourceCode.includes("SPKK")) return "Konsultasi SPKK";
      if (sourceCode.includes("OFFLINE") || sourceCode.includes("DOKTER")) {
        return "Konsultasi Dokter";
      }

      const value = this.getKonsultasiChannelValue(item);

      if (value === "1" || value === "offline") return "Konsultasi Dokter";
      if (value === "2" || value === "online") return "Konsultasi Online";

      return "Tanpa Konsultasi";
    },

    getChannelColor(item) {
      const sourceCode = String(
        this.getKonsultasiSourceCode(item) || "",
      ).toUpperCase();

      if (sourceCode.includes("ONLINE")) return "info";
      if (sourceCode.includes("SPPG")) return "success";
      if (sourceCode.includes("SPKK")) return "deep-purple";
      if (sourceCode.includes("OFFLINE") || sourceCode.includes("DOKTER")) {
        return "primary";
      }

      const value = this.getKonsultasiChannelValue(item);

      if (value === "1" || value === "offline") return "primary";
      if (value === "2" || value === "online") return "info";

      return "secondary";
    },

    getChannelIcon(item) {
      const sourceCode = String(
        this.getKonsultasiSourceCode(item) || "",
      ).toUpperCase();

      if (sourceCode.includes("ONLINE")) return "mdi-monitor-account";
      if (sourceCode.includes("SPPG")) return "mdi-account-heart-outline";
      if (sourceCode.includes("SPKK")) return "mdi-doctor";
      if (sourceCode.includes("OFFLINE") || sourceCode.includes("DOKTER")) {
        return "mdi-hospital-building";
      }

      const value = this.getKonsultasiChannelValue(item);

      if (value === "1" || value === "offline") {
        return "mdi-hospital-building";
      }

      if (value === "2" || value === "online") {
        return "mdi-monitor-account";
      }

      return "mdi-minus-circle-outline";
    },

    formatLayanan(item) {
      const hasKonsultasi = this.hasKonsultasi(item);
      const hasTreatment = this.hasTreatment(item);
      const hasPenjualan = this.hasPenjualan(item);

      if (hasKonsultasi && hasTreatment && hasPenjualan) {
        return "Konsultasi + Treatment + Penjualan";
      }

      if (hasKonsultasi && hasTreatment) {
        return "Konsultasi + Treatment";
      }

      if (hasKonsultasi && hasPenjualan) {
        return "Konsultasi + Penjualan";
      }

      if (hasKonsultasi) return "Konsultasi";
      if (hasTreatment) return "Treatment Dokter";
      if (hasPenjualan) return "Penjualan";

      return "Pelayanan Dokter";
    },

    getLayananChips(item) {
      const chips = [];

      if (this.hasKonsultasi(item)) {
        chips.push({
          label: this.formatChannel(item),
          color: this.getChannelColor(item),
          icon: this.getChannelIcon(item),
        });
      }

      if (this.hasTreatment(item)) {
        chips.push({
          label: "Treatment",
          color: "secondary",
          icon: "mdi-face-woman-shimmer-outline",
        });
      }

      if (this.hasPenjualan(item)) {
        chips.push({
          label: "Penjualan",
          color: "success",
          icon: "mdi-cart-outline",
        });
      }

      if (!chips.length) {
        chips.push({
          label: "Dokter",
          color: "info",
          icon: "mdi-doctor",
        });
      }

      return chips;
    },

    hasKonsultasi(item) {
      return (
        this.isTrue(item?.ada_konsultasi) ||
        this.isTrue(item?.layanan?.ada_konsultasi) ||
        Boolean(this.getKonsultasiSourceCode(item)) ||
        Number(
          item?.channel_konsultasi ?? item?.layanan?.channel_konsultasi ?? 0,
        ) > 0
      );
    },

    hasTreatment(item) {
      return (
        this.isTrue(item?.ada_treatment) || this.isTrue(item?.is_treatment)
      );
    },

    hasPenjualan(item) {
      return (
        this.isTrue(item?.ada_penjualan) || this.isTrue(item?.is_penjualan)
      );
    },

    isTrue(value) {
      return value === true || value === 1 || value === "1";
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
        "Terjadi kesalahan pada data antrian dokter"
      );
    },
  },
};
</script>

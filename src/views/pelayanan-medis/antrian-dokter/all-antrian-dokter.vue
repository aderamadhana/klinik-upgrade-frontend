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
            variant="tonal"
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
          variant="tonal"
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
                      Total Antrian
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.total }}
                    </div>
                  </div>

                  <v-avatar color="primary" variant="tonal" size="36">
                    <v-icon icon="mdi-format-list-numbered" size="20" />
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

                  <v-avatar color="warning" variant="tonal" size="36">
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

                  <v-avatar color="info" variant="tonal" size="36">
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
                    <div class="text-caption text-medium-emphasis">Selesai</div>
                    <div class="text-h6 font-weight-bold">
                      {{ summary.selesai }}
                    </div>
                  </div>

                  <v-avatar color="success" variant="tonal" size="36">
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
          loading-text="Memuat data antrian dokter..."
          no-data-text="Data antrian dokter tidak ditemukan"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@8" />
          </template>
          <template #item.registrasi="{ item }">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              class="px-0 font-weight-bold"
              @click="goToDetailRegistrasi(item)"
            >
              {{ getKodeRegistrasi(item) }}
            </v-btn>
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
              <div class="text-body-2 font-weight-medium">
                {{ formatLayanan(item) }}
              </div>

              <div class="text-caption text-medium-emphasis mt-1">
                {{ formatNextFlow(item) }}
              </div>
            </div>
          </template>

          <template #item.dokter="{ item }">
            <div class="py-2">
              <div class="text-body-2 font-weight-medium">
                {{ getDokterName(item) }}
              </div>

              <v-chip
                size="x-small"
                color="primary"
                variant="tonal"
                class="mt-1"
              >
                {{ formatChannel(item.channel_konsultasi) }}
              </v-chip>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip size="small" :color="getStatusColor(item)" variant="tonal">
              {{ formatStatus(item) }}
            </v-chip>
          </template>

          <template #item.aksi="{ item }">
            <div class="d-flex justify-end align-center ga-2 flex-wrap py-2">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-play-circle-outline"
                @click="goToProsesAntrianDokter(item)"
              >
                Proses
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
          <div class="text-body-2 mb-3">
            Data antrian dokter ini akan dihapus dari daftar antrian.
          </div>

          <v-card v-if="selectedItem" variant="outlined">
            <v-card-text class="pa-3">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2 text-medium-emphasis">
                  No Registrasi
                </span>
                <strong class="text-body-2">
                  {{ getKodeRegistrasi(selectedItem) }}
                </strong>
              </div>

              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2 text-medium-emphasis"> Pasien </span>
                <strong class="text-body-2">
                  {{ getPasienName(selectedItem) }}
                </strong>
              </div>

              <div class="d-flex justify-space-between align-center">
                <span class="text-body-2 text-medium-emphasis"> Dokter </span>
                <strong class="text-body-2">
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
          title: "No Registrasi",
          key: "registrasi",
          sortable: false,
          width: 190,
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
          minWidth: 220,
        },
        {
          title: "Dokter / Channel",
          key: "dokter",
          sortable: false,
          minWidth: 240,
        },
        {
          title: "Status",
          key: "status",
          sortable: false,
          width: 130,
        },
        {
          title: "Aksi",
          key: "aksi",
          sortable: false,
          align: "end",
          width: 210,
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

    getNomorAntrian(item) {
      return (
        item?.nomor_antrian || item?.no_antrian || item?.kode_antrian || "-"
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

    getWaktuKunjungan(item) {
      if (item?.waktu_kunjungan) return item.waktu_kunjungan;
      if (item?.jam_kunjungan) return item.jam_kunjungan;

      return this.formatTime(item?.registered_at || item?.created_at);
    },

    getStatusValue(item) {
      const raw =
        item?.status_antrian ||
        item?.queue_status ||
        item?.status_task ||
        item?.status;

      if (raw === 0 || raw === "0") return "menunggu";
      if (raw === 1 || raw === "1") return "menunggu";
      if (raw === 2 || raw === "2") return "selesai";
      if (raw === 9 || raw === "9") return "batal";

      return String(raw || "menunggu").toLowerCase();
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

    getStatusClass(item) {
      const status = this.getStatusValue(item);

      const map = {
        menunggu: "status-waiting",
        dipanggil: "status-called",
        proses: "status-process",
        selesai: "status-done",
        batal: "status-cancel",
      };

      return map[status] || "status-waiting";
    },

    formatChannel(channel) {
      const value = String(channel || "").toLowerCase();

      if (value === "1" || value === "offline") return "Konsultasi Offline";
      if (value === "2" || value === "online") return "Konsultasi Online";

      return "Tanpa Konsultasi";
    },

    formatLayanan(item) {
      const hasKonsultasi =
        this.isTrue(item?.ada_konsultasi) ||
        Number(item?.channel_konsultasi || 0) > 0;

      const hasTreatment =
        this.isTrue(item?.ada_treatment) || this.isTrue(item?.is_treatment);

      const hasPenjualan =
        this.isTrue(item?.ada_penjualan) || this.isTrue(item?.is_penjualan);

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

    formatNextFlow(item) {
      const hasTreatment =
        this.isTrue(item?.ada_treatment) || this.isTrue(item?.is_treatment);

      const needNurse =
        this.isTrue(item?.perlu_tindakan_perawat) ||
        this.isTrue(item?.is_tindakan_perawat);

      if (hasTreatment && needNurse) return "Lanjut ke Nurse Station";
      if (hasTreatment) return "Ditangani dokter";
      return "Tanpa treatment";
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

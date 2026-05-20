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

    <v-card class="main-card" flat>
      <div class="toolbar-wrap">
        <div class="toolbar-left">
          <v-chip
            color="success"
            variant="tonal"
            size="small"
            prepend-icon="mdi-refresh"
          >
            Auto Refresh 30 detik
          </v-chip>

          <v-btn
            size="small"
            variant="outlined"
            color="grey-darken-1"
            prepend-icon="mdi-refresh"
            :loading="loading"
            class="toolbar-btn"
            @click="fetchData"
          >
            Refresh
          </v-btn>
        </div>

        <div class="toolbar-filter">
          <v-text-field
            v-model="filters.search"
            placeholder="Cari no registrasi, no RM, pasien, dokter..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="filter-search"
            @keyup.enter="onSearch"
            @click:clear="onClearSearch"
          />

          <v-text-field
            v-model="filters.tanggal"
            label="Tanggal"
            type="date"
            prepend-inner-icon="mdi-calendar"
            variant="outlined"
            density="compact"
            hide-details
            class="filter-date"
            @update:model-value="onFilterChange"
          />

          <v-select
            v-model="filters.status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
            density="compact"
            hide-details
            class="filter-select"
            @update:model-value="onFilterChange"
          />

          <v-select
            v-model="filters.channel"
            :items="channelOptions"
            item-title="label"
            item-value="value"
            label="Channel"
            variant="outlined"
            density="compact"
            hide-details
            class="filter-select"
            @update:model-value="onFilterChange"
          />
        </div>
      </div>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        border="start"
        rounded="lg"
        closable
        class="mx-4 mb-4"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-row class="summary-wrap" dense>
        <v-col cols="12" md="3">
          <v-card class="summary-card" flat>
            <div class="summary-label">Total Antrian</div>
            <div class="summary-value">{{ summary.total }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="summary-card" flat>
            <div class="summary-label">Menunggu</div>
            <div class="summary-value">{{ summary.menunggu }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="summary-card" flat>
            <div class="summary-label">Diproses</div>
            <div class="summary-value">{{ summary.diproses }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="summary-card" flat>
            <div class="summary-label">Selesai</div>
            <div class="summary-value">{{ summary.selesai }}</div>
          </v-card>
        </v-col>
      </v-row>

      <div class="table-wrap">
        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          item-value="id"
          density="compact"
          class="doctor-queue-table"
          :items-per-page="pagination.perPage"
          hide-default-footer
          loading-text="Memuat data antrian dokter..."
          no-data-text="Data antrian dokter tidak ditemukan"
        >
          <template #item.registrasi="{ item }">
            <div class="reg-cell">
              <button
                type="button"
                class="reg-link"
                @click="goToDetailRegistrasi(item)"
              >
                {{ getKodeRegistrasi(item) }}
              </button>
            </div>
          </template>

          <template #item.pasien="{ item }">
            <div class="patient-cell">
              <div class="patient-name">
                {{ getPasienName(item) }}
              </div>

              <div class="patient-meta">
                {{ getPasienMeta(item) }}
              </div>
            </div>
          </template>

          <template #item.kunjungan="{ item }">
            <div class="date-cell">
              <div class="date-main">
                {{ formatDate(item.tanggal_kunjungan || item.tanggal) }}
              </div>

              <div class="date-sub">
                {{ getWaktuKunjungan(item) }}
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="service-cell">
              <div class="service-title">
                {{ formatLayanan(item) }}
              </div>

              <div class="service-sub">
                {{ formatNextFlow(item) }}
              </div>
            </div>
          </template>

          <template #item.dokter="{ item }">
            <div class="doctor-cell">
              <div class="doctor-name">
                {{ getDokterName(item) }}
              </div>

              <div class="doctor-channel">
                {{ formatChannel(item.channel_konsultasi) }}
              </div>
            </div>
          </template>

          <template #item.status="{ item }">
            <span class="status-pill" :class="getStatusClass(item)">
              {{ formatStatus(item) }}
            </span>
          </template>

          <template #item.aksi="{ item }">
            <div class="action-cell">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-play-circle-outline"
                class="text-action-btn"
                @click="goToProsesAntrianDokter(item)"
              >
                Proses
              </v-btn>

              <v-btn
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete-outline"
                class="text-action-btn"
                @click="confirmDelete(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="empty-state">
              <v-icon size="40" color="grey">
                mdi-clipboard-text-off-outline
              </v-icon>

              <div class="empty-title">Belum ada antrian dokter</div>

              <div class="empty-text">
                Data akan muncul setelah FO menyimpan registrasi dengan jalur
                dokter.
              </div>
            </div>
          </template>
        </v-data-table>
      </div>

      <div class="table-footer">
        <div class="footer-count">
          Total data: <strong>{{ pagination.total }}</strong>
        </div>

        <div class="footer-actions">
          <v-select
            v-model="pagination.perPage"
            :items="[10, 15, 25, 50, 100]"
            variant="outlined"
            density="compact"
            hide-details
            class="per-page-field"
            @update:model-value="onPerPageChange"
          />

          <v-pagination
            v-model="pagination.page"
            :length="pagination.lastPage"
            density="comfortable"
            total-visible="5"
            @update:model-value="fetchData"
          />
        </div>
      </div>
    </v-card>

    <v-dialog v-model="dialogDelete" max-width="460">
      <v-card rounded="lg">
        <v-card-title class="font-weight-bold">
          Hapus Antrian Dokter?
        </v-card-title>

        <v-card-text>
          <div class="mb-3">
            Data antrian dokter ini akan dihapus dari daftar antrian.
          </div>

          <div v-if="selectedItem" class="delete-dialog-info">
            <div>
              <span>No Registrasi</span>
              <strong>{{ getKodeRegistrasi(selectedItem) }}</strong>
            </div>

            <div>
              <span>Pasien</span>
              <strong>{{ getPasienName(selectedItem) }}</strong>
            </div>

            <div>
              <span>Dokter</span>
              <strong>{{ getDokterName(selectedItem) }}</strong>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            color="grey-darken-1"
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

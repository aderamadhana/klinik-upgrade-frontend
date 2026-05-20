<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Antrian Perawat</h1>
        <p class="page-subtitle">
          Kelola antrian pasien treatment setelah pembayaran selesai
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
            placeholder="Cari no registrasi, pasien, treatment, dokter..."
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
          class="nurse-queue-table"
          :items-per-page="pagination.perPage"
          hide-default-footer
          loading-text="Memuat data antrian perawat..."
          no-data-text="Data antrian perawat tidak ditemukan"
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

              <div class="reg-sub">
                {{ getWaktuKunjungan(item) }}
              </div>
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

          <template #item.treatment="{ item }">
            <div class="treatment-cell">
              <div class="treatment-title">
                {{ getNamaTreatment(item) }}
              </div>

              <div class="treatment-sub">
                {{ formatDate(item.tanggal_kunjungan || item.tanggal) }}
              </div>
            </div>
          </template>

          <template #item.petugas="{ item }">
            <div class="staff-cell">
              <div class="staff-main">Dokter: {{ getDokterName(item) }}</div>

              <div class="staff-sub">Perawat: {{ getPerawatName(item) }}</div>
            </div>
          </template>

          <template #item.keterangan="{ item }">
            <div class="badge-wrap">
              <span
                class="input-badge"
                :class="isTrue(item.cppt) ? 'badge-done' : 'badge-pending'"
              >
                CPPT {{ isTrue(item.cppt) ? "sudah" : "belum" }}
              </span>

              <span
                class="input-badge"
                :class="
                  isTrue(item.before_after) ? 'badge-done' : 'badge-pending'
                "
              >
                Before/After {{ isTrue(item.before_after) ? "sudah" : "belum" }}
              </span>

              <span
                class="input-badge"
                :class="
                  isTrue(item.bahan_treatment) ? 'badge-done' : 'badge-pending'
                "
              >
                Bahan {{ isTrue(item.bahan_treatment) ? "sudah" : "belum" }}
              </span>
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
                prepend-icon="mdi-stethoscope"
                class="text-action-btn"
                @click="goToInputCppt(item)"
              >
                CPPT
              </v-btn>

              <v-btn
                size="small"
                color="success"
                variant="tonal"
                prepend-icon="mdi-camera"
                class="text-action-btn"
                @click="goToInputBeforeAfter(item)"
              >
                Before/After
              </v-btn>

              <v-btn
                size="small"
                color="warning"
                variant="tonal"
                prepend-icon="mdi-flask"
                class="text-action-btn"
                @click="goToInputBahanTreatment(item)"
              >
                Bahan
              </v-btn>

              <v-btn
                v-if="canDeleteQueue(item)"
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

              <div class="empty-title">Belum ada antrian perawat</div>

              <div class="empty-text">
                Data akan muncul setelah pembayaran selesai dan registrasi
                memiliki treatment.
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
          Hapus Antrian Perawat?
        </v-card-title>

        <v-card-text>
          <div class="mb-3">
            Data hanya akan dihapus dari daftar antrian perawat. Registrasi dan
            pembayaran tidak dihapus.
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
              <span>Treatment</span>
              <strong>{{ getNamaTreatment(selectedItem) }}</strong>
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
import antrianPerawatService from "@/services/pelayanan-medis/antrianPerawatService";

export default {
  name: "AllAntrianPerawat",

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
      },

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
        { title: "Antrian Perawat", disabled: true },
      ],

      statusOptions: [
        { label: "Semua", value: null },
        { label: "Menunggu", value: "menunggu" },
        { label: "Diproses", value: "proses" },
        { label: "Selesai", value: "selesai" },
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
          title: "Treatment",
          key: "treatment",
          sortable: false,
          minWidth: 260,
        },
        {
          title: "Dokter / Perawat",
          key: "petugas",
          sortable: false,
          minWidth: 240,
        },
        {
          title: "Keterangan",
          key: "keterangan",
          sortable: false,
          minWidth: 290,
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
          width: 390,
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
          selesai: Number(this.summaryApi.selesai || 0),
        };
      }

      return {
        total: this.rows.length,
        menunggu: this.rows.filter((x) => this.getStatusValue(x) === "menunggu")
          .length,
        diproses: this.rows.filter((x) => this.getStatusValue(x) === "proses")
          .length,
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
          toko_id: this.activeTokoId || undefined,
        };

        const response = await antrianPerawatService.getAll(params);
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

    async ensureStarted(item) {
      const id = this.getRegistrasiId(item);

      if (!id) return;

      if (this.getStatusValue(item) === "menunggu") {
        try {
          await antrianPerawatService.start(id);
        } catch (error) {
          this.showSnackbar(this.getErrorMessage(error), "error");
        }
      }
    },

    async goToInputCppt(item) {
      await this.ensureStarted(item);
      this.$router.push(
        `/pelayanan-medis/antrian-perawat/${this.getRegistrasiId(item)}/input-cppt`,
      );
    },

    async goToInputBeforeAfter(item) {
      await this.ensureStarted(item);
      this.$router.push(
        `/pelayanan-medis/antrian-perawat/${this.getRegistrasiId(item)}/input-before-after`,
      );
    },

    async goToInputBahanTreatment(item) {
      await this.ensureStarted(item);
      this.$router.push(
        `/pelayanan-medis/antrian-perawat/${this.getRegistrasiId(item)}/input-bahan-treatment`,
      );
    },

    goToDetailRegistrasi(item) {
      this.$router.push(
        `/resepsionis/registrasi-layanan/${this.getRegistrasiId(item)}`,
      );
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

      if (!this.canDeleteQueue(this.selectedItem)) {
        this.showSnackbar(
          "Antrian tidak bisa dihapus karena pasien sudah mulai dilayani",
          "warning",
        );
        this.closeDeleteDialog();
        return;
      }

      this.deleteLoading = true;

      try {
        const response = await antrianPerawatService.delete(
          this.getRegistrasiId(this.selectedItem),
        );

        this.showSnackbar(
          response?.message || "Antrian perawat berhasil dihapus",
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

    canDeleteQueue(item) {
      if (item?.can_delete_antrian === true || item?.can_delete_antrian === 1) {
        return true;
      }

      return (
        this.getStatusValue(item) === "menunggu" &&
        !this.isTrue(item.cppt) &&
        !this.isTrue(item.before_after) &&
        !this.isTrue(item.bahan_treatment)
      );
    },

    getRegistrasiId(item) {
      return item?.registrasi_id || item?.registrasi?.id || item?.id;
    },

    getKodeRegistrasi(item) {
      return (
        item?.kode_registrasi ||
        item?.nomor_antrian ||
        item?.no_antrian ||
        item?.registrasi?.kode_registrasi ||
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

      return (
        [pasien.no_rm || item.no_rm, pasien.no_hp || item.no_hp]
          .filter(Boolean)
          .join(" • ") || "-"
      );
    },

    getNamaTreatment(item) {
      return (
        item?.nama_tindakan ||
        item?.nama_treatment ||
        item?.treatment_label ||
        "-"
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
      if (item?.waktu_kunjungan) return `Jam ${item.waktu_kunjungan}`;
      if (item?.jam_kunjungan) return `Jam ${item.jam_kunjungan}`;

      return `Jam ${this.formatTime(item?.registered_at || item?.created_at)}`;
    },

    getStatusValue(item) {
      return String(
        item?.status_antrian_perawat ||
          item?.status_antrian ||
          item?.queue_status ||
          "menunggu",
      ).toLowerCase();
    },

    formatStatus(item) {
      const status = this.getStatusValue(item);

      const map = {
        menunggu: "Menunggu",
        proses: "Diproses",
        diproses: "Diproses",
        selesai: "Selesai",
        batal: "Batal",
      };

      return map[status] || "-";
    },

    getStatusClass(item) {
      const status = this.getStatusValue(item);

      const map = {
        menunggu: "status-waiting",
        proses: "status-process",
        diproses: "status-process",
        selesai: "status-done",
        batal: "status-cancel",
      };

      return map[status] || "status-waiting";
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
        "Terjadi kesalahan pada data antrian perawat"
      );
    },
  },
};
</script>

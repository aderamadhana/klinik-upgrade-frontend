<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Nurse Station</h1>
        <p class="page-subtitle">
          Pantau pasien yang masuk ke jalur perawat, status pengerjaan, CPPT,
          foto before-after, dan bahan treatment.
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0">
        <template #divider>
          <v-icon size="16">mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>
    </div>

    <v-card variant="flat" class="main-card">
      <div class="section-body">
        <v-row dense align="center">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="filters.search"
              placeholder="Cari no registrasi, no RM, pasien, perawat, treatment..."
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
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.progress"
              :items="progressFilterItems"
              item-title="label"
              item-value="value"
              label="Progress"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="onFilterChange"
            />
          </v-col>

          <v-col cols="12" md="3">
            <div class="d-flex align-center justify-end ga-2 flex-wrap">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-refresh"
                class="toolbar-btn"
                :loading="loading"
                @click="fetchData()"
              >
                Refresh
              </v-btn>

              <v-chip
                color="success"
                variant="tonal"
                size="small"
                class="font-weight-bold"
              >
                <v-icon icon="mdi-timer-sync-outline" start />
                30d
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="mt-4"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
      </div>

      <v-divider />

      <div class="px-4">
        <v-tabs
          v-model="activeTab"
          color="primary"
          align-tabs="start"
          slider-size="2"
          show-arrows
          class="queue-status-tabs"
          @update:model-value="onTabChange"
        >
          <v-tab
            v-for="tab in statusTabs"
            :key="tab.value"
            :value="tab.value"
            class="queue-status-tab text-none"
          >
            <div class="d-flex align-center ga-2">
              <v-icon :icon="tab.icon" size="18" />
              <span>{{ tab.label }}</span>
              <v-chip size="x-small" color="primary" variant="flat">
                {{ tab.count }}
              </v-chip>
            </div>
          </v-tab>
        </v-tabs>
      </div>

      <v-divider />

      <div class="section-body">
        <template v-if="loading">
          <div class="queue-card-list">
            <v-card
              v-for="index in 4"
              :key="`loading-${index}`"
              variant="flat"
              class="queue-item-card"
            >
              <v-card-text class="pa-4">
                <v-skeleton-loader type="article" />
              </v-card-text>
            </v-card>
          </div>
        </template>

        <template v-else-if="rows.length">
          <div class="queue-card-list">
            <v-card
              v-for="item in rows"
              :key="getCardKey(item)"
              variant="flat"
              class="queue-item-card"
            >
              <v-card-text class="pa-4">
                <div class="queue-card-layout">
                  <div class="queue-card-ticket">
                    <div class="ticket-number">
                      {{ getDisplayQueueNumber(item) }}
                    </div>
                    <div class="ticket-label">Antrian</div>
                  </div>

                  <div class="queue-card-main">
                    <div class="queue-card-top">
                      <div class="queue-card-identity">
                        <div class="patient-name">
                          {{ getPasienName(item) }}
                        </div>

                        <div class="queue-meta-line">
                          <span>{{ getPasienCode(item) }}</span>
                          <span>•</span>
                          <span>{{ getKodeRegistrasi(item) }}</span>
                        </div>
                      </div>

                      <div class="queue-card-status-inline">
                        <v-chip
                          size="small"
                          :color="getStatusMeta(item).color"
                          :prepend-icon="getStatusMeta(item).icon"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          {{ getStatusMeta(item).label }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="queue-card-info">
                      <div class="queue-info-row">
                        <div class="queue-info-label">Waktu</div>
                        <div class="queue-info-value">
                          {{ formatDate(getDataDate(item)) }}
                          <span class="text-medium-emphasis">|</span>
                          Masuk {{ formatTime(getDataTime(item)) }}
                          <span class="text-medium-emphasis">|</span>
                          <span :class="getWaitingTextClass(item)">
                            {{ getWaitingLabel(item) }}
                          </span>
                        </div>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Treatment</div>
                        <div class="queue-info-value">
                          {{ getTreatmentSummary(item) }}
                        </div>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Petugas</div>
                        <div class="queue-info-value">
                          Dokter: {{ getDokterName(item) }}
                          <span class="text-medium-emphasis">/</span>
                          Perawat: {{ getPerawatName(item) }}
                        </div>
                      </div>

                      <div class="queue-chip-row">
                        <v-chip
                          size="small"
                          :color="isCpptDone(item) ? 'success' : 'warning'"
                          :prepend-icon="
                            isCpptDone(item)
                              ? 'mdi-check-circle-outline'
                              : 'mdi-clipboard-text-outline'
                          "
                          variant="tonal"
                          class="service-chip"
                        >
                          {{ isCpptDone(item) ? "CPPT selesai" : "CPPT belum" }}
                        </v-chip>

                        <v-chip
                          size="small"
                          :color="
                            isBeforeAfterDone(item) ? 'success' : 'warning'
                          "
                          :prepend-icon="
                            isBeforeAfterDone(item)
                              ? 'mdi-check-circle-outline'
                              : 'mdi-camera-outline'
                          "
                          variant="tonal"
                          class="service-chip"
                        >
                          {{
                            isBeforeAfterDone(item)
                              ? "Foto selesai"
                              : "Foto belum"
                          }}
                        </v-chip>

                        <v-chip
                          size="small"
                          :color="
                            isBahanTreatmentDone(item) ? 'success' : 'warning'
                          "
                          :prepend-icon="
                            isBahanTreatmentDone(item)
                              ? 'mdi-check-circle-outline'
                              : 'mdi-flask-outline'
                          "
                          variant="tonal"
                          class="service-chip"
                        >
                          {{
                            isBahanTreatmentDone(item)
                              ? "Bahan selesai"
                              : "Bahan belum"
                          }}
                        </v-chip>

                        <v-chip
                          size="small"
                          color="secondary"
                          prepend-icon="mdi-account-heart-outline"
                          variant="tonal"
                          class="service-chip"
                        >
                          {{ getPerawatName(item) }}
                        </v-chip>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Catatan</div>
                        <div class="queue-info-value">
                          {{ getCatatan(item) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="queue-card-actions">
                    <v-btn
                      v-if="getPrimaryAction(item)"
                      :color="getPrimaryAction(item).color"
                      variant="flat"
                      :prepend-icon="getPrimaryAction(item).icon"
                      class="text-none font-weight-bold"
                      :loading="
                        isActionLoading(item, getPrimaryAction(item).key)
                      "
                      @click="handlePrimaryAction(item)"
                    >
                      {{ getPrimaryAction(item).label }}
                    </v-btn>

                    <v-btn
                      v-else
                      color="secondary"
                      variant="tonal"
                      prepend-icon="mdi-eye-outline"
                      class="text-none font-weight-bold"
                      @click="goToCppt(item)"
                    >
                      Detail
                    </v-btn>

                    <v-menu location="bottom end">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          variant="outlined"
                          color="secondary"
                          prepend-icon="mdi-dots-horizontal"
                          class="text-none font-weight-bold"
                        >
                          Lainnya
                        </v-btn>
                      </template>

                      <v-list density="compact">
                        <v-list-item
                          prepend-icon="mdi-clipboard-text-outline"
                          title="Input CPPT"
                          @click="goToCppt(item)"
                        />

                        <v-list-item
                          prepend-icon="mdi-camera-outline"
                          title="Input Before After"
                          @click="goToBeforeAfter(item)"
                        />

                        <v-list-item
                          prepend-icon="mdi-flask-outline"
                          title="Input Bahan Treatment"
                          @click="goToBahanTreatment(item)"
                        />

                        <v-divider />

                        <v-list-item
                          v-if="canStart(item)"
                          prepend-icon="mdi-play-circle-outline"
                          title="Mulai Proses"
                          @click="startQueue(item)"
                        />

                        <v-list-item
                          v-if="canFinish(item)"
                          prepend-icon="mdi-check-circle-outline"
                          title="Tandai Selesai"
                          @click="openFinishDialog(item)"
                        />

                        <v-divider v-if="canDelete(item)" />

                        <v-list-item
                          v-if="canDelete(item)"
                          prepend-icon="mdi-delete-outline"
                          title="Hapus Antrian"
                          base-color="error"
                          @click="openDeleteDialog(item)"
                        />
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </template>

        <template v-else>
          <div class="empty-state">
            <v-avatar color="grey-lighten-3" size="64">
              <v-icon
                icon="mdi-clipboard-text-search-outline"
                size="34"
                color="grey"
              />
            </v-avatar>

            <div class="empty-title">Belum ada antrian perawat</div>

            <div class="empty-description">
              Data akan muncul setelah pasien masuk ke jalur perawat.
            </div>

            <div class="empty-description">
              Coba ubah filter pencarian, tanggal, progress, atau tab status.
            </div>
          </div>
        </template>
      </div>

      <v-divider />

      <div class="table-footer">
        <div class="footer-count">
          Total data:
          <strong>{{ pagination.total }}</strong>
        </div>

        <div class="footer-actions">
          <v-select
            v-model="pagination.perPage"
            class="per-page-field"
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
            @update:model-value="fetchData"
          />
        </div>
      </div>
    </v-card>

    <v-dialog v-model="finishDialog.show" max-width="480">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Selesaikan Nurse Station?
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            Pastikan CPPT, foto before-after, dan bahan treatment sudah sesuai
            sebelum antrian diselesaikan.
          </v-alert>

          <div v-if="finishDialog.item" class="delete-dialog-info">
            <div>
              <strong>No Registrasi:</strong>
              {{ getKodeRegistrasi(finishDialog.item) }}
            </div>
            <div>
              <strong>Pasien:</strong>
              {{ getPasienName(finishDialog.item) }}
            </div>
            <div>
              <strong>Treatment:</strong>
              {{ getTreatmentSummary(finishDialog.item) }}
            </div>
            <div>
              <strong>Perawat:</strong>
              {{ getPerawatName(finishDialog.item) }}
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            class="text-none font-weight-bold"
            :disabled="finishDialog.loading"
            @click="closeFinishDialog"
          >
            Batal
          </v-btn>

          <v-btn
            color="success"
            variant="flat"
            prepend-icon="mdi-check-circle-outline"
            class="text-none font-weight-bold"
            :loading="finishDialog.loading"
            @click="finishQueue"
          >
            Selesaikan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog.show" max-width="480">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title"> Hapus Nurse Station? </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            Data antrian akan dihapus dari daftar antrian perawat.
          </v-alert>

          <div v-if="deleteDialog.item" class="delete-dialog-info">
            <div>
              <strong>No Registrasi:</strong>
              {{ getKodeRegistrasi(deleteDialog.item) }}
            </div>
            <div>
              <strong>Pasien:</strong>
              {{ getPasienName(deleteDialog.item) }}
            </div>
            <div>
              <strong>Treatment:</strong>
              {{ getTreatmentSummary(deleteDialog.item) }}
            </div>
            <div>
              <strong>Status:</strong>
              {{ getStatusMeta(deleteDialog.item).label }}
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            class="text-none font-weight-bold"
            :disabled="deleteDialog.loading"
            @click="closeDeleteDialog"
          >
            Batal
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-delete-outline"
            class="text-none font-weight-bold"
            :loading="deleteDialog.loading"
            @click="deleteQueue"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}

      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false"> Tutup </v-btn>
      </template>
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
      activeTab: "all",

      filters: {
        search: "",
        tanggal: this.getToday(),
        status: null,
        progress: null,
      },

      rows: [],
      countRows: [],
      summaryData: {},

      pagination: {
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      },

      actionLoading: {
        id: null,
        key: null,
      },

      finishDialog: {
        show: false,
        loading: false,
        item: null,
      },

      deleteDialog: {
        show: false,
        loading: false,
        item: null,
      },

      snackbar: {
        show: false,
        color: "success",
        message: "",
      },

      breadcrumbs: [
        {
          title: "Pelayanan Medis",
          disabled: true,
        },
        {
          title: "Nurse Station",
          disabled: true,
        },
      ],

      progressFilterItems: [
        {
          label: "CPPT belum",
          value: "cppt",
        },
        {
          label: "Foto belum",
          value: "before_after",
        },
        {
          label: "Bahan belum",
          value: "bahan",
        },
        {
          label: "Semua selesai",
          value: "lengkap",
        },
      ],
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },

    countSourceRows() {
      let result = this.countRows.length ? [...this.countRows] : [...this.rows];

      if (this.filters.progress) {
        result = result.filter((item) =>
          this.matchesProgressFilter(item, this.filters.progress),
        );
      }

      return result;
    },

    summary() {
      const sourceRows = this.countSourceRows;

      return {
        total: sourceRows.length,
        menunggu: sourceRows.filter(
          (item) => this.getStatusValue(item) === "menunggu",
        ).length,
        diproses: sourceRows.filter((item) =>
          ["dipanggil", "proses"].includes(this.getStatusValue(item)),
        ).length,
        selesai: sourceRows.filter(
          (item) => this.getStatusValue(item) === "selesai",
        ).length,
        batal: sourceRows.filter((item) =>
          ["batal", "dilewati"].includes(this.getStatusValue(item)),
        ).length,
      };
    },

    statusTabs() {
      return [
        {
          label: "Semua",
          value: "all",
          icon: "mdi-format-list-bulleted",
          count: this.summary.total,
        },
        {
          label: "Menunggu",
          value: "menunggu",
          icon: "mdi-clock-outline",
          count: this.summary.menunggu,
        },
        {
          label: "Diproses",
          value: "diproses",
          icon: "mdi-progress-clock",
          count: this.summary.diproses,
        },
        {
          label: "Selesai",
          value: "selesai",
          icon: "mdi-check-circle-outline",
          count: this.summary.selesai,
        },
        {
          label: "Batal",
          value: "batal",
          icon: "mdi-close-circle-outline",
          count: this.summary.batal,
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
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

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
        this.summaryData = this.extractSummary(payload);
        this.applyPagination(payload);
        await this.fetchTabCounts();
      } catch (error) {
        this.rows = [];
        this.countRows = [];
        this.summaryData = {};
        this.pagination.total = 0;
        this.pagination.lastPage = 1;
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        this.loading = false;
        this.isFetching = false;
      }
    },

    async fetchTabCounts() {
      try {
        const params = {
          page: 1,
          per_page: 1000,
          search: this.filters.search || undefined,
          tanggal: this.filters.tanggal || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await antrianPerawatService.getAll(params);
        const payload = response?.data || response;

        this.countRows = this.extractRows(payload);
      } catch (error) {
        this.countRows = [...this.rows];
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

    extractSummary(payload) {
      return (
        payload?.summary ||
        payload?.data?.summary ||
        payload?.meta?.summary ||
        payload?.data?.meta?.summary ||
        {}
      );
    },

    applyPagination(payload) {
      const meta =
        payload?.meta || payload?.pagination || payload?.data?.meta || {};

      const total = Number(
        payload?.total ||
          meta?.total ||
          payload?.data?.total ||
          this.rows.length ||
          0,
      );

      const perPage = Number(
        payload?.per_page ||
          meta?.per_page ||
          meta?.perPage ||
          payload?.data?.per_page ||
          this.pagination.perPage ||
          15,
      );

      const currentPage = Number(
        payload?.current_page ||
          meta?.current_page ||
          meta?.currentPage ||
          payload?.data?.current_page ||
          this.pagination.page ||
          1,
      );

      const lastPage = Number(
        payload?.last_page ||
          meta?.last_page ||
          meta?.lastPage ||
          payload?.data?.last_page ||
          Math.ceil(total / perPage) ||
          1,
      );

      this.pagination.total = total;
      this.pagination.perPage = perPage;
      this.pagination.page = currentPage;
      this.pagination.lastPage = lastPage || 1;
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

    onTabChange(value) {
      this.activeTab = value;
      this.pagination.page = 1;
      this.filters.status = this.mapTabToApiStatus(value);
      this.fetchData();
    },

    mapTabToApiStatus(value) {
      const map = {
        all: null,
        menunggu: "menunggu",
        diproses: "proses",
        selesai: "selesai",
        batal: "batal",
      };

      return map[value] ?? null;
    },

    matchesProgressFilter(item, progress) {
      if (progress === "cppt") return !this.isCpptDone(item);
      if (progress === "before_after") return !this.isBeforeAfterDone(item);
      if (progress === "bahan") return !this.isBahanTreatmentDone(item);

      if (progress === "lengkap") {
        return (
          this.isCpptDone(item) &&
          this.isBeforeAfterDone(item) &&
          this.isBahanTreatmentDone(item)
        );
      }

      return true;
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

    getCardKey(item) {
      return (
        item?.antrian_perawat_id ||
        item?.antrian_id ||
        item?.queue_id ||
        item?.id ||
        item?.registrasi_id ||
        item?.kode_registrasi ||
        `${this.getPasienName(item)}-${this.getDataDate(item)}-${this.getDataTime(item)}`
      );
    },

    getAntrianId(item) {
      return (
        item?.antrian_perawat_id ||
        item?.antrian_id ||
        item?.queue_id ||
        item?.antrian?.id ||
        item?.id ||
        null
      );
    },

    getRegistrasiId(item) {
      return (
        item?.registrasi_id ||
        item?.registrasi?.id ||
        item?.kunjungan_id ||
        null
      );
    },

    getKodeRegistrasi(item) {
      return (
        item?.kode_registrasi ||
        item?.no_registrasi ||
        item?.registrasi?.kode_registrasi ||
        item?.registrasi?.no_registrasi ||
        `REG-${this.getRegistrasiId(item) || this.getAntrianId(item) || "-"}`
      );
    },

    getNomorAntrian(item) {
      const value =
        item?.kode_nomor ||
        item?.nomor_antrian_perawat ||
        item?.nomor_antrian ||
        item?.no_antrian ||
        item?.antrian?.kode_nomor ||
        item?.antrian?.nomor ||
        item?.queue_number ||
        "";

      return String(value || "");
    },

    getDisplayQueueNumber(item) {
      const raw = this.getNomorAntrian(item);

      if (raw) {
        const cleanRaw = String(raw).trim();

        if (cleanRaw.length <= 4 && !cleanRaw.includes("-")) {
          return cleanRaw;
        }

        const matches = cleanRaw.match(/\d+/g);

        if (matches && matches.length) {
          let last = matches[matches.length - 1];

          if (last.length > 3) {
            last = last.slice(-3);
          }

          return last.padStart(3, "0");
        }
      }

      const code = String(this.getKodeRegistrasi(item) || "");
      const parts = code.split("-").filter(Boolean);
      const lastPart = parts.length ? parts[parts.length - 1] : "";

      if (/^\d+$/.test(lastPart)) {
        return lastPart.length > 3
          ? lastPart.slice(-3)
          : lastPart.padStart(3, "0");
      }

      const numbers = code.match(/\d+/g);

      if (numbers && numbers.length) {
        const lastNumber = numbers[numbers.length - 1];
        return lastNumber.length > 3
          ? lastNumber.slice(-3)
          : lastNumber.padStart(3, "0");
      }

      return "-";
    },

    getDataDate(item) {
      return (
        item?.tanggal ||
        item?.tanggal_kunjungan ||
        item?.tanggal_registrasi ||
        item?.registrasi?.tanggal_kunjungan ||
        item?.created_at ||
        item?.createdAt ||
        null
      );
    },

    getDataTime(item) {
      return (
        item?.jam ||
        item?.jam_kunjungan ||
        item?.jam_registrasi ||
        item?.checkin_at ||
        item?.registered_at ||
        item?.registrasi?.registered_at ||
        item?.created_at ||
        item?.createdAt ||
        null
      );
    },

    getQueueStartAt(item) {
      const directValue =
        item?.checkin_at ||
        item?.registered_at ||
        item?.antrian?.checkin_at ||
        item?.antrian?.created_at ||
        item?.created_at ||
        item?.createdAt;

      if (directValue) {
        return this.parseDateTime(directValue);
      }

      return this.parseDateTime(
        this.getDataDate(item),
        this.formatTime(this.getDataTime(item)),
      );
    },

    getQueueEndAt(item, status) {
      if (status === "selesai") {
        return this.parseDateTime(
          item?.finished_at ||
            item?.selesai_at ||
            item?.antrian?.finished_at ||
            item?.updated_at ||
            item?.updatedAt,
        );
      }

      if (status === "batal" || status === "dilewati") {
        return this.parseDateTime(
          item?.cancelled_at ||
            item?.batal_at ||
            item?.antrian?.cancelled_at ||
            item?.updated_at ||
            item?.updatedAt,
        );
      }

      return null;
    },

    getWaitingMinutes(item) {
      const startAt = this.getQueueStartAt(item);

      if (!startAt) return null;

      const status = this.getStatusValue(item);
      const endAt = this.getQueueEndAt(item, status) || new Date();

      return Math.max(
        0,
        Math.floor((endAt.getTime() - startAt.getTime()) / 60000),
      );
    },

    getWaitingLabel(item) {
      const status = this.getStatusValue(item);

      if (status === "selesai") return "Selesai";
      if (status === "batal") return "Batal";
      if (status === "dilewati") return "Dilewati";
      if (status === "proses") return "Sedang diproses";
      if (status === "dipanggil") return "Sudah dipanggil";

      const minutes = this.getWaitingMinutes(item);

      if (minutes === null) return "-";
      if (minutes < 1) return "Baru masuk";
      if (minutes < 60) return `Menunggu ${minutes} menit`;

      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;

      return rest
        ? `Menunggu ${hours} jam ${rest} menit`
        : `Menunggu ${hours} jam`;
    },

    getWaitingTextClass(item) {
      const status = this.getStatusValue(item);

      if (status === "selesai") return "text-success";
      if (status === "batal" || status === "dilewati") return "text-error";
      if (status === "proses" || status === "dipanggil") return "text-primary";

      const minutes = this.getWaitingMinutes(item);

      if (minutes === null) return "";
      if (minutes >= 60) return "text-error";
      if (minutes >= 30) return "text-warning";

      return "text-success";
    },

    normalizeStatus(raw, item = null) {
      if (item) {
        if (this.isTruthy(item?.is_delete) || this.isTruthy(item?.is_batal))
          return "batal";

        if (
          this.isTruthy(item?.is_selesai) ||
          this.isTruthy(item?.is_done) ||
          item?.finished_at ||
          item?.selesai_at
        ) {
          return "selesai";
        }
      }

      if (raw === 0 || raw === "0") return "menunggu";
      if (raw === 1 || raw === "1") return "menunggu";
      if (raw === 2 || raw === "2") return "proses";
      if (raw === 3 || raw === "3") return "selesai";
      if (raw === 4 || raw === "4") return "selesai";
      if (raw === 9 || raw === "9") return "batal";

      const value = String(raw || "menunggu").toLowerCase();

      if (["waiting", "wait", "menunggu", "pending"].includes(value))
        return "menunggu";
      if (["called", "call", "dipanggil"].includes(value)) return "dipanggil";

      if (
        [
          "serve",
          "serving",
          "process",
          "processing",
          "proses",
          "diproses",
          "berjalan",
        ].includes(value)
      )
        return "proses";
      if (
        [
          "done",
          "finish",
          "finished",
          "selesai",
          "complete",
          "completed",
        ].includes(value)
      )
        return "selesai";
      if (["skip", "skipped", "lewat", "dilewati"].includes(value))
        return "dilewati";
      if (["cancel", "cancelled", "canceled", "batal"].includes(value))
        return "batal";

      return value;
    },

    getStatusValue(item) {
      const raw =
        item?.status_antrian ||
        item?.antrian?.status ||
        item?.queue_status ||
        item?.status_task ||
        item?.status ||
        item?.status_perawat;

      return this.normalizeStatus(raw, item);
    },

    getStatusMeta(item) {
      const status = this.getStatusValue(item);

      const map = {
        menunggu: {
          label: "Menunggu",
          color: "warning",
          icon: "mdi-clock-outline",
        },
        dipanggil: {
          label: "Dipanggil",
          color: "info",
          icon: "mdi-bell-ring-outline",
        },
        proses: {
          label: "Diproses",
          color: "primary",
          icon: "mdi-progress-clock",
        },
        selesai: {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-circle-outline",
        },
        dilewati: {
          label: "Dilewati",
          color: "error",
          icon: "mdi-debug-step-over",
        },
        batal: {
          label: "Batal",
          color: "error",
          icon: "mdi-close-circle-outline",
        },
      };

      return (
        map[status] || {
          label: status || "-",
          color: "secondary",
          icon: "mdi-help-circle-outline",
        }
      );
    },

    getPasienName(item) {
      return (
        item?.pasien?.nama ||
        item?.pasien?.nama_pasien ||
        item?.nama_pasien ||
        item?.pasien_nama ||
        item?.registrasi?.pasien?.nama ||
        "-"
      );
    },

    getPasienCode(item) {
      return (
        item?.pasien?.no_rm ||
        item?.no_rm ||
        item?.pasien_no_rm ||
        item?.registrasi?.pasien?.no_rm ||
        "RM -"
      );
    },

    getDokterName(item) {
      return (
        item?.dokter?.nama ||
        item?.dokter_awal?.nama ||
        item?.dokterAwal?.nama ||
        item?.nama_dokter ||
        item?.dokter_nama ||
        item?.registrasi?.dokter?.nama ||
        item?.registrasi?.dokter_awal?.nama ||
        "Belum ditentukan"
      );
    },

    getPerawatName(item) {
      return (
        item?.perawat?.nama ||
        item?.karyawan?.nama ||
        item?.beautician?.nama ||
        item?.nama_perawat ||
        item?.perawat_nama ||
        item?.karyawan_nama ||
        item?.registrasi?.perawat?.nama ||
        "Belum ditentukan"
      );
    },

    getTreatmentSummary(item) {
      const explicit =
        item?.nama_treatment ||
        item?.treatment_nama ||
        item?.treatment?.nama ||
        item?.master_treatment?.nama ||
        item?.nama_layanan ||
        item?.layanan_nama;

      if (explicit) return explicit;

      const items =
        item?.treatments ||
        item?.treatment_items ||
        item?.perawatan_detail ||
        item?.registrasi?.treatment_items ||
        [];

      if (Array.isArray(items) && items.length) {
        const names = items
          .map(
            (row) =>
              row?.nama_treatment ||
              row?.treatment?.nama ||
              row?.nama ||
              row?.label,
          )
          .filter(Boolean);

        if (names.length) {
          if (names.length <= 2) return names.join(" • ");
          return `${names.slice(0, 2).join(" • ")} +${names.length - 2} lainnya`;
        }
      }

      return "Treatment";
    },

    getCatatan(item) {
      return (
        item?.catatan ||
        item?.catatan_perawat ||
        item?.note ||
        item?.notes ||
        item?.registrasi?.catatan ||
        "-"
      );
    },

    getProgressValue(item, keys) {
      for (const key of keys) {
        const value = this.getNestedValue(item, key);

        if (value !== undefined && value !== null && value !== "") return value;
      }

      return null;
    },

    getNestedValue(object, path) {
      return String(path)
        .split(".")
        .reduce((result, key) => {
          if (result === undefined || result === null) return undefined;
          return result[key];
        }, object);
    },

    isProgressDone(value) {
      if (value === true) return true;
      if (typeof value === "number") return value > 0;

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return [
          "1",
          "true",
          "yes",
          "done",
          "selesai",
          "sudah",
          "completed",
        ].includes(normalized);
      }

      if (Array.isArray(value)) return value.length > 0;

      return Boolean(value);
    },

    isCpptDone(item) {
      const value = this.getProgressValue(item, [
        "input_cppt",
        "is_input_cppt",
        "cppt_done",
        "has_cppt",
        "registrasi_perawat_cppt",
        "cppt",
        "progress.cppt",
      ]);

      return this.isProgressDone(value);
    },

    isBeforeAfterDone(item) {
      const value = this.getProgressValue(item, [
        "input_before_after",
        "is_input_before_after",
        "before_after_done",
        "has_before_after",
        "has_foto_before_after",
        "registrasi_perawat_before_after_foto",
        "before_after",
        "progress.before_after",
      ]);

      return this.isProgressDone(value);
    },

    isBahanTreatmentDone(item) {
      const value = this.getProgressValue(item, [
        "input_bahan_treatment",
        "is_input_bahan_treatment",
        "bahan_treatment_done",
        "has_bahan_treatment",
        "has_input_bahan",
        "registrasi_perawat_bahan_treatment_detail",
        "bahan_treatment",
        "progress.bahan_treatment",
      ]);

      return this.isProgressDone(value);
    },

    getPrimaryAction(item) {
      const status = this.getStatusValue(item);

      if (status === "batal") return null;

      if (status === "selesai") {
        return {
          key: "cppt",
          label: "Lihat CPPT",
          icon: "mdi-eye-outline",
          color: "secondary",
        };
      }

      if (status === "menunggu") {
        return {
          key: "start",
          label: "Mulai",
          icon: "mdi-play-circle-outline",
          color: "primary",
        };
      }

      if (!this.isCpptDone(item)) {
        return {
          key: "cppt",
          label: "Input CPPT",
          icon: "mdi-clipboard-text-outline",
          color: "primary",
        };
      }

      if (!this.isBeforeAfterDone(item)) {
        return {
          key: "before_after",
          label: "Input Foto",
          icon: "mdi-camera-outline",
          color: "info",
        };
      }

      if (!this.isBahanTreatmentDone(item)) {
        return {
          key: "bahan",
          label: "Input Bahan",
          icon: "mdi-flask-outline",
          color: "deep-purple",
        };
      }

      return {
        key: "finish",
        label: "Selesaikan",
        icon: "mdi-check-circle-outline",
        color: "success",
      };
    },

    handlePrimaryAction(item) {
      const action = this.getPrimaryAction(item);

      if (!action) {
        this.showSnackbar("Aksi tidak tersedia untuk antrian ini.", "error");
        return;
      }

      if (action.key === "start") {
        this.startQueue(item);
        return;
      }

      if (action.key === "cppt") {
        this.goToCppt(item);
        return;
      }

      if (action.key === "before_after") {
        this.goToBeforeAfter(item);
        return;
      }

      if (action.key === "bahan") {
        this.goToBahanTreatment(item);
        return;
      }

      if (action.key === "finish") this.openFinishDialog(item);
    },

    isActionLoading(item, key) {
      return (
        this.actionLoading.id === this.getAntrianId(item) &&
        this.actionLoading.key === key
      );
    },

    canStart(item) {
      return this.getStatusValue(item) === "menunggu";
    },

    canFinish(item) {
      return !["selesai", "batal", "dilewati"].includes(
        this.getStatusValue(item),
      );
    },

    canDelete(item) {
      return !["selesai"].includes(this.getStatusValue(item));
    },

    async startQueue(item) {
      const id = this.getAntrianId(item);

      if (!id) {
        this.showSnackbar("ID antrian perawat tidak ditemukan.", "error");
        return;
      }

      this.actionLoading = { id, key: "start" };

      try {
        const response = await antrianPerawatService.start(id);

        this.showSnackbar(
          response?.message ||
            response?.data?.message ||
            "Antrian perawat mulai diproses.",
          "success",
        );

        this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.actionLoading = { id: null, key: null };
      }
    },

    openFinishDialog(item) {
      this.finishDialog.item = item;
      this.finishDialog.show = true;
    },

    closeFinishDialog() {
      this.finishDialog.show = false;
      this.finishDialog.loading = false;
      this.finishDialog.item = null;
    },

    async finishQueue() {
      const id = this.getAntrianId(this.finishDialog.item);

      if (!id) {
        this.showSnackbar("ID antrian perawat tidak ditemukan.", "error");
        return;
      }

      this.finishDialog.loading = true;

      try {
        const response = await antrianPerawatService.finish(id);

        this.showSnackbar(
          response?.message ||
            response?.data?.message ||
            "Antrian perawat berhasil diselesaikan.",
          "success",
        );

        this.closeFinishDialog();
        this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.finishDialog.loading = false;
      }
    },

    openDeleteDialog(item) {
      this.deleteDialog.item = item;
      this.deleteDialog.show = true;
    },

    closeDeleteDialog() {
      this.deleteDialog.show = false;
      this.deleteDialog.loading = false;
      this.deleteDialog.item = null;
    },

    async deleteQueue() {
      const id = this.getAntrianId(this.deleteDialog.item);

      if (!id) {
        this.showSnackbar("ID antrian perawat tidak ditemukan.", "error");
        return;
      }

      this.deleteDialog.loading = true;

      try {
        const response = await antrianPerawatService.delete(id);

        this.showSnackbar(
          response?.message ||
            response?.data?.message ||
            "Antrian perawat berhasil dihapus.",
          "success",
        );

        this.closeDeleteDialog();
        this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.deleteDialog.loading = false;
      }
    },

    goToCppt(item) {
      const id = this.getAntrianId(item);

      if (!id) {
        this.showSnackbar("ID antrian perawat tidak ditemukan.", "error");
        return;
      }

      this.$router.push(`/pelayanan-medis/antrian-perawat/${id}/input-cppt`);
    },

    goToBeforeAfter(item) {
      const id = this.getAntrianId(item);

      if (!id) {
        this.showSnackbar("ID antrian perawat tidak ditemukan.", "error");
        return;
      }

      this.$router.push(
        `/pelayanan-medis/antrian-perawat/${id}/input-before-after`,
      );
    },

    goToBahanTreatment(item) {
      const id = this.getAntrianId(item);

      if (!id) {
        this.showSnackbar("ID antrian perawat tidak ditemukan.", "error");
        return;
      }

      this.$router.push(
        `/pelayanan-medis/antrian-perawat/${id}/input-bahan-treatment`,
      );
    },

    isTruthy(value) {
      if (value === true) return true;
      if (typeof value === "number") return value > 0;

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return !["", "0", "false", "null", "undefined", "tidak", "no"].includes(
          normalized,
        );
      }

      return Boolean(value);
    },

    parseDateTime(value, fallbackTime = null) {
      if (!value) return null;
      if (value instanceof Date)
        return Number.isNaN(value.getTime()) ? null : value;

      const text = String(value).trim();
      if (!text) return null;

      let normalized = text;

      if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        normalized = fallbackTime
          ? `${normalized}T${fallbackTime}`
          : `${normalized}T00:00:00`;
      } else {
        normalized = normalized.replace(" ", "T");
      }

      const date = new Date(normalized);
      return Number.isNaN(date.getTime()) ? null : date;
    },

    formatDate(value) {
      if (!value) return "-";

      const text = String(value);
      const datePart = text.split("T")[0].split(" ")[0];

      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [year, month, day] = datePart.split("-");
        return `${day}/${month}/${year}`;
      }

      const date = this.parseDateTime(value);
      if (!date) return "-";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },

    formatTime(value) {
      if (!value) return "-";

      const text = String(value).trim();

      if (/^\d{2}:\d{2}/.test(text)) return text.slice(0, 5);

      const timePart = text.includes("T")
        ? text.split("T")[1]
        : text.includes(" ")
          ? text.split(" ")[1]
          : "";

      if (timePart && /^\d{2}:\d{2}/.test(timePart))
        return timePart.slice(0, 5);

      const date = this.parseDateTime(value);
      if (!date) return "-";

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${hours}:${minutes}`;
    },

    getErrorMessage(error) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Terjadi kesalahan saat memuat data antrian perawat."
      );
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

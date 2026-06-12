<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Antrian Dokter</h1>
        <p class="page-subtitle">
          Pantau pasien yang masuk ke jalur dokter, lama tunggu, status, dan
          aksi proses.
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card variant="flat" class="main-card">
      <div class="section-body">
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              class="search-field"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              prepend-inner-icon="mdi-magnify"
              placeholder="Cari no registrasi, no RM, pasien, dokter..."
              @keyup.enter="onSearch"
              @click:clear="onClearSearch"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="filters.tanggal"
              variant="outlined"
              density="compact"
              hide-details
              type="date"
              label="Tanggal"
              prepend-inner-icon="mdi-calendar"
              @update:model-value="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.channel"
              class="status-field"
              variant="outlined"
              density="compact"
              hide-details
              label="Channel"
              :items="channelOptions"
              item-title="label"
              item-value="value"
              @update:model-value="onFilterChange"
            />
          </v-col>

          <v-col cols="12" sm="8" md="4">
            <div class="d-flex align-center ga-2 flex-wrap justify-md-end">
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
                <v-icon start icon="mdi-timer-sync-outline" />
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
          v-model="activeStatusTab"
          color="primary"
          align-tabs="start"
          slider-size="2"
          show-arrows
          class="queue-status-tabs"
          @update:model-value="onStatusTabChange"
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
              <v-chip size="x-small" variant="flat" color="primary">
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
              v-for="n in 3"
              :key="`skeleton-${n}`"
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
                          <span>{{ getPatientRm(item) }}</span>
                          <span>•</span>
                          <span>{{ getKodeRegistrasi(item) }}</span>
                        </div>
                      </div>

                      <div class="queue-card-status-inline">
                        <v-chip
                          size="small"
                          :color="getStatusColor(item)"
                          :prepend-icon="getStatusIcon(item)"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          {{ formatStatus(item) }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="queue-card-info">
                      <div class="queue-info-row">
                        <div class="queue-info-label">Waktu</div>
                        <div class="queue-info-value">
                          Masuk {{ getWaktuKunjungan(item) || "-" }}
                          <span class="text-medium-emphasis">|</span>
                          <span :class="getWaitingTextClass(item)">
                            {{ getWaitingLabel(item) }}
                          </span>
                        </div>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Layanan</div>
                        <div class="queue-info-value">
                          {{ formatLayanan(item) }}
                        </div>
                      </div>

                      <div class="queue-chip-row">
                        <v-chip
                          v-for="chip in getLayananChips(item)"
                          :key="`${getCardKey(item)}-${chip.label}`"
                          :color="chip.color"
                          :prepend-icon="chip.icon"
                          size="small"
                          variant="tonal"
                          class="service-chip"
                        >
                          {{ chip.label }}
                        </v-chip>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Dokter</div>
                        <div class="queue-info-value">
                          {{ getDokterName(item) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="queue-card-actions">
                    <v-btn
                      color="primary"
                      variant="flat"
                      prepend-icon="mdi-play-circle-outline"
                      class="text-none font-weight-bold"
                      @click.stop="goToProsesAntrianDokter(item)"
                    >
                      {{ getActionLabel(item) }}
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
                          prepend-icon="mdi-eye-outline"
                          title="Lihat / Proses"
                          @click="goToProsesAntrianDokter(item)"
                        />
                        <v-divider />
                        <v-list-item
                          prepend-icon="mdi-delete-outline"
                          title="Hapus Antrian"
                          base-color="error"
                          @click="confirmDelete(item)"
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
                icon="mdi-clipboard-text-off-outline"
                size="34"
                color="grey"
              />
            </v-avatar>

            <div class="empty-title">Belum ada antrian dokter</div>

            <div class="empty-description">
              Data akan muncul setelah FO menyimpan registrasi dengan jalur
              dokter.
            </div>

            <div class="empty-description">
              Coba ubah filter pencarian, tanggal, channel, atau tab status.
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

    <confirm-delete-dialog
      v-model="dialogDelete"
      :loading="deleteLoading"
      title="Konfirmasi Hapus"
      subtitle="Data antrian dokter akan dihapus dari daftar antrian."
      question="Yakin ingin menghapus antrian dokter ini?"
      :item-title="selectedItem ? getPasienName(selectedItem) : '-'"
      :item-subtitle="
        selectedItem
          ? `No Registrasi: ${getKodeRegistrasi(selectedItem)} • No Antrian: ${getDisplayQueueNumber(selectedItem)} • Dokter: ${getDokterName(selectedItem)} • Status: ${formatStatus(selectedItem)}`
          : ''
      "
      warning-text="Data antrian dokter ini akan dihapus secara soft delete."
      @cancel="closeDeleteDialog"
      @confirm="deleteItem"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="2500"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import antrianDokterService from "@/services/pelayanan-medis/antrianDokterService";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";

export default {
  name: "AllAntrianDokter",
  components: {
    ConfirmDeleteDialog,
  },
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

      activeStatusTab: "all",

      rows: [],
      countRows: [],
      summaryData: {},

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

      channelOptions: [
        { label: "Semua", value: null },
        { label: "Offline", value: "offline" },
        { label: "Online", value: "online" },
        { label: "Tanpa Konsultasi", value: "tanpa_konsultasi" },
      ],
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },

    summary() {
      const sourceRows = this.countRows.length ? this.countRows : this.rows;

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
          channel: this.filters.channel || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await antrianDokterService.getAll(params);
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
          channel: this.filters.channel || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await antrianDokterService.getAll(params);
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

    onStatusTabChange(value) {
      this.activeStatusTab = value;
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

      if (!id) {
        this.showSnackbar("ID registrasi tidak ditemukan", "error");
        return;
      }

      this.$router.push(
        `/pelayanan-medis/antrian-dokter/${id}/proses-antrian-dokter`,
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

      const id = this.getAntrianId(this.selectedItem);

      if (!id) {
        this.showSnackbar("ID antrian tidak ditemukan", "error");
        return;
      }

      this.deleteLoading = true;

      try {
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

    getCardKey(item) {
      return (
        item?.antrian_dokter_id ||
        item?.antrian_id ||
        item?.queue_id ||
        item?.id ||
        `${this.getKodeRegistrasi(item)}-${this.getPasienName(item)}`
      );
    },

    getAntrianId(item) {
      return (
        item?.antrian_dokter_id ||
        item?.antrian_id ||
        item?.queue_id ||
        item?.antrian?.id ||
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
      const value =
        item?.kode_nomor ||
        item?.nomor_antrian_dokter ||
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

      if (!raw) return "-";

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

      return cleanRaw;
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

    getPatientRm(item) {
      return item?.pasien?.no_rm || item?.no_rm || item?.pasien_no_rm || "RM -";
    },

    getDokterName(item) {
      const dokter =
        item?.dokter_awal?.nama ||
        item?.dokterAwal?.nama ||
        item?.dokter?.nama ||
        item?.registrasi?.dokter_awal?.nama ||
        item?.nama_dokter ||
        item?.dokter_nama ||
        "";

      return dokter || "Belum ditentukan";
    },

    getTanggalKunjungan(item) {
      return (
        item?.tanggal_kunjungan ||
        item?.tanggal ||
        item?.registrasi?.tanggal_kunjungan ||
        item?.antrian?.tanggal ||
        item?.created_at
      );
    },

    getWaktuKunjungan(item) {
      if (item?.waktu_kunjungan) return item.waktu_kunjungan;
      if (item?.jam_kunjungan) return item.jam_kunjungan;
      if (item?.antrian?.checkin_at)
        return this.formatTime(item.antrian.checkin_at);
      if (item?.checkin_at) return this.formatTime(item.checkin_at);

      return this.formatTime(
        item?.registered_at ||
          item?.registrasi?.registered_at ||
          item?.created_at ||
          item?.antrian?.created_at,
      );
    },

    getQueueStartAt(item) {
      const directValue =
        item?.checkin_at ||
        item?.antrian?.checkin_at ||
        item?.registered_at ||
        item?.registrasi?.registered_at ||
        item?.created_at ||
        item?.antrian?.created_at;

      if (directValue) {
        return this.parseDateTime(directValue);
      }

      return this.parseDateTime(
        this.getTanggalKunjungan(item),
        this.getWaktuKunjungan(item),
      );
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

    getQueueEndAt(item, status) {
      if (status === "selesai") {
        return this.parseDateTime(
          item?.finished_at ||
            item?.antrian?.finished_at ||
            item?.updated_at ||
            item?.registrasi?.updated_at,
        );
      }

      if (status === "batal") {
        return this.parseDateTime(
          item?.cancelled_at ||
            item?.antrian?.cancelled_at ||
            item?.updated_at ||
            item?.registrasi?.updated_at,
        );
      }

      return null;
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

    normalizeStatus(raw) {
      if (raw === 0 || raw === "0") return "menunggu";
      if (raw === 1 || raw === "1") return "menunggu";
      if (raw === 2 || raw === "2") return "selesai";
      if (raw === 9 || raw === "9") return "batal";

      const value = String(raw || "menunggu").toLowerCase();

      if (["waiting", "wait", "menunggu"].includes(value)) return "menunggu";
      if (["called", "call", "dipanggil"].includes(value)) return "dipanggil";

      if (
        [
          "serve",
          "serving",
          "process",
          "processing",
          "proses",
          "diproses",
        ].includes(value)
      ) {
        return "proses";
      }

      if (["done", "finish", "finished", "selesai"].includes(value)) {
        return "selesai";
      }

      if (["skip", "skipped", "lewat", "dilewati"].includes(value)) {
        return "dilewati";
      }

      if (["cancel", "cancelled", "canceled", "batal"].includes(value)) {
        return "batal";
      }

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
        item?.antrian?.status ||
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
        dilewati: "Dilewati",
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
        dilewati: "error",
        batal: "error",
      };

      return map[status] || "secondary";
    },

    getStatusIcon(item) {
      const status = this.getStatusValue(item);

      const map = {
        menunggu: "mdi-clock-outline",
        dipanggil: "mdi-bell-ring-outline",
        proses: "mdi-progress-clock",
        selesai: "mdi-check-circle-outline",
        dilewati: "mdi-debug-step-over",
        batal: "mdi-close-circle-outline",
      };

      return map[status] || "mdi-help-circle-outline";
    },

    getActionLabel(item) {
      const status = this.getStatusValue(item);

      if (status === "selesai") return "Lihat";
      if (status === "proses") return "Lanjutkan";
      if (status === "dipanggil") return "Proses";

      return "Proses";
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
      if (sourceName) return sourceName;

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
      if (sourceCode.includes("OFFLINE") || sourceCode.includes("DOKTER"))
        return "primary";

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
      if (sourceCode.includes("OFFLINE") || sourceCode.includes("DOKTER"))
        return "mdi-hospital-building";

      const value = this.getKonsultasiChannelValue(item);
      if (value === "1" || value === "offline") return "mdi-hospital-building";
      if (value === "2" || value === "online") return "mdi-monitor-account";

      return "mdi-minus-circle-outline";
    },

    formatLayanan(item) {
      const hasKonsultasi = this.hasKonsultasi(item);
      const hasTreatment = this.hasTreatment(item);
      const hasPenjualan = this.hasPenjualan(item);

      if (hasKonsultasi && hasTreatment && hasPenjualan)
        return "Konsultasi Dokter • Treatment • Produk";
      if (hasKonsultasi && hasTreatment) return "Konsultasi Dokter • Treatment";
      if (hasKonsultasi && hasPenjualan) return "Konsultasi Dokter • Produk";
      if (hasTreatment && hasPenjualan) return "Treatment • Produk";
      if (hasKonsultasi) return "Konsultasi Dokter";
      if (hasTreatment) return "Treatment";
      if (hasPenjualan) return "Produk";

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
          color: "deep-purple",
          icon: "mdi-face-woman-shimmer-outline",
        });
      }

      if (this.hasPenjualan(item)) {
        chips.push({
          label: "Produk",
          color: "teal",
          icon: "mdi-package-variant-closed",
        });
      }

      if (!chips.length) {
        chips.push({
          label: "Pelayanan Dokter",
          color: "secondary",
          icon: "mdi-stethoscope",
        });
      }

      return chips;
    },

    hasKonsultasi(item) {
      const channelValue = this.getKonsultasiChannelValue(item);
      const sourceCode = this.getKonsultasiSourceCode(item);
      const sourceName = this.getKonsultasiSourceName(item);

      return (
        this.isTruthy(item?.is_konsul) ||
        this.isTruthy(item?.is_konsultasi) ||
        this.isTruthy(item?.has_konsultasi) ||
        this.isTruthy(item?.registrasi?.is_konsul) ||
        this.isTruthy(item?.registrasi?.is_konsultasi) ||
        this.toNumber(item?.total_konsultasi, 0) > 0 ||
        this.toNumber(item?.registrasi?.total_konsultasi, 0) > 0 ||
        Boolean(item?.konsultasi || item?.konsultasi_id) ||
        Boolean(sourceCode || sourceName) ||
        ["1", "2", "offline", "online"].includes(channelValue)
      );
    },

    hasTreatment(item) {
      return (
        this.isTruthy(item?.is_treatment) ||
        this.isTruthy(item?.registrasi?.is_treatment) ||
        this.toNumber(item?.total_treatment, 0) > 0 ||
        this.toNumber(item?.registrasi?.total_treatment, 0) > 0 ||
        this.hasArrayData(item?.treatments) ||
        this.hasArrayData(item?.treatment_items) ||
        this.hasArrayData(item?.registrasi?.treatments) ||
        this.hasArrayData(item?.registrasi?.treatment_items)
      );
    },

    hasPenjualan(item) {
      return (
        this.isTruthy(item?.is_penjualan) ||
        this.isTruthy(item?.registrasi?.is_penjualan) ||
        this.isTruthy(item?.is_pembelian_online) ||
        this.isTruthy(item?.registrasi?.is_pembelian_online) ||
        this.toNumber(item?.total_penjualan, 0) > 0 ||
        this.toNumber(item?.registrasi?.total_penjualan, 0) > 0 ||
        this.hasArrayData(item?.produk) ||
        this.hasArrayData(item?.produks) ||
        this.hasArrayData(item?.penjualan_items) ||
        this.hasArrayData(item?.registrasi?.penjualan_items)
      );
    },

    hasArrayData(value) {
      return Array.isArray(value) && value.length > 0;
    },

    isTruthy(value) {
      if (value === true) return true;
      if (typeof value === "number") return value > 0;

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return !["", "0", "false", "null", "undefined", "tidak"].includes(
          normalized,
        );
      }

      return Boolean(value);
    },

    toNumber(value, fallback = 0) {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
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

    formatTime(value) {
      if (!value) return "";

      const text = String(value).trim();

      if (/^\d{2}:\d{2}/.test(text)) {
        return text.slice(0, 5);
      }

      const timePart = text.includes("T")
        ? text.split("T")[1]
        : text.includes(" ")
          ? text.split(" ")[1]
          : "";

      if (timePart && /^\d{2}:\d{2}/.test(timePart)) {
        return timePart.slice(0, 5);
      }

      const date = this.parseDateTime(value);
      if (!date) return "";

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${hours}:${minutes}`;
    },

    getErrorMessage(error) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Terjadi kesalahan saat memuat data antrian dokter"
      );
    },

    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

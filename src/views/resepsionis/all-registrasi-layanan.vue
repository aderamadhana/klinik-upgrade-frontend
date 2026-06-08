<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Registrasi Layanan</h1>
        <p class="page-subtitle">
          Monitoring registrasi pasien, layanan, task berjalan, dan aksi
          lanjutan.
        </p>
      </div>

      <div class="d-flex align-center ga-2 flex-wrap">
        <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0">
          <template #divider>
            <v-icon size="16">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>

        <v-btn
          color="success"
          variant="flat"
          prepend-icon="mdi-plus"
          class="toolbar-btn"
          @click="goToAdd"
        >
          Entry Data
        </v-btn>
      </div>
    </div>

    <v-card variant="flat" class="main-card">
      <div class="section-body">
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              placeholder="Cari registrasi, pasien, dokter, no RM..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="applyFilters"
              @click:clear="applyFilters"
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
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.layanan"
              :items="layananItems"
              item-title="title"
              item-value="value"
              label="Layanan"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="4">
            <div class="d-flex justify-end ga-2 flex-wrap">
              <v-chip
                color="secondary"
                variant="tonal"
                size="small"
                class="font-weight-bold"
              >
                <v-icon icon="mdi-account-key-outline" start />
                Role: {{ currentRoleText }}
              </v-chip>

              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-refresh"
                class="toolbar-btn"
                :loading="loading"
                @click="fetchData"
              >
                Refresh
              </v-btn>
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

        <template v-else-if="visibleRows.length">
          <div class="queue-card-list">
            <v-card
              v-for="item in visibleRows"
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
                    <div class="ticket-label">Registrasi</div>
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
                          {{ formatTime(getDataTime(item)) }}
                        </div>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Pasien</div>
                        <div class="queue-info-value">
                          {{ getPasienMeta(item) }}
                        </div>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Layanan</div>
                        <div class="queue-info-value">
                          {{ getLayananSummary(item) }}
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

                        <v-chip
                          size="small"
                          :color="getTaskMeta(item).color"
                          :prepend-icon="getTaskMeta(item).icon"
                          variant="tonal"
                          class="service-chip"
                        >
                          {{ getTaskMeta(item).label }}
                        </v-chip>

                        <v-chip
                          v-if="isOnlineConsultation(item)"
                          size="small"
                          :color="
                            hasBuktiChatKonsultasiOnline(item)
                              ? 'success'
                              : 'warning'
                          "
                          :prepend-icon="
                            hasBuktiChatKonsultasiOnline(item)
                              ? 'mdi-check-circle-outline'
                              : 'mdi-alert-circle-outline'
                          "
                          variant="tonal"
                          class="service-chip"
                        >
                          {{
                            hasBuktiChatKonsultasiOnline(item)
                              ? "Bukti chat ada"
                              : "Belum upload bukti chat"
                          }}
                        </v-chip>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Petugas</div>
                        <div class="queue-info-value">
                          Dokter: {{ getDokterName(item) }}
                          <span class="text-medium-emphasis">/</span>
                          Perawat: {{ getPerawatName(item) }}
                        </div>
                      </div>

                      <div class="queue-info-row">
                        <div class="queue-info-label">Total</div>
                        <div class="queue-info-value font-weight-bold">
                          Rp {{ formatNumber(getTotalAmount(item)) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="queue-card-actions">
                    <v-btn
                      v-if="getPrimaryAction(item)"
                      :color="getActionButtonColor(getPrimaryAction(item))"
                      variant="flat"
                      :prepend-icon="getPrimaryAction(item).icon"
                      class="text-none font-weight-bold"
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
                      @click="goToDetail(item)"
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
                          prepend-icon="mdi-eye-outline"
                          title="Lihat Detail"
                          @click="goToDetail(item)"
                        />

                        <v-list-item
                          v-if="canViewBuktiChatKonsultasiOnline(item)"
                          prepend-icon="mdi-file-eye-outline"
                          title="Lihat Bukti Chat"
                          @click="viewBuktiChatKonsultasiOnline(item)"
                        />

                        <v-list-item
                          v-if="canUploadBuktiChatKonsultasiOnline(item)"
                          prepend-icon="mdi-upload-outline"
                          title="Upload Bukti Chat"
                          @click="openBuktiChatDialog(item)"
                        />

                        <v-divider v-if="canCancel(item)" />

                        <v-list-item
                          v-if="canCancel(item)"
                          prepend-icon="mdi-close-circle-outline"
                          title="Batalkan Registrasi"
                          base-color="error"
                          @click="openCancelDialog(item)"
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

            <div class="empty-title">Data registrasi belum tersedia</div>

            <div class="empty-description">
              Ubah filter, tanggal, tab status, atau tambahkan registrasi
              layanan baru.
            </div>

            <v-btn
              color="success"
              variant="flat"
              prepend-icon="mdi-plus"
              class="mt-3 toolbar-btn"
              @click="goToAdd"
            >
              Entry Data
            </v-btn>
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
            :items="[10, 15, 25, 50]"
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

    <v-dialog v-model="cancelDialog.show" max-width="480">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title"> Batalkan Registrasi </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            Registrasi akan dibatalkan dan tidak bisa diproses ke task
            berikutnya.
          </v-alert>

          <div v-if="cancelDialog.item" class="delete-dialog-info">
            <div>
              <strong>No Registrasi:</strong>
              {{ getKodeRegistrasi(cancelDialog.item) }}
            </div>
            <div>
              <strong>Pasien:</strong>
              {{ getPasienName(cancelDialog.item) }}
            </div>
            <div>
              <strong>Layanan:</strong>
              {{ getLayananSummary(cancelDialog.item) }}
            </div>
            <div>
              <strong>Task:</strong>
              {{ getTaskMeta(cancelDialog.item).label }}
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            class="text-none font-weight-bold"
            :disabled="cancelDialog.loading"
            @click="closeCancelDialog"
          >
            Tutup
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-close-circle-outline"
            class="text-none font-weight-bold"
            :loading="cancelDialog.loading"
            @click="submitCancel"
          >
            Batalkan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="buktiChatDialog.show" max-width="520">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Upload Bukti Chat Konsultasi Online
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <div v-if="buktiChatDialog.item" class="delete-dialog-info mb-4">
            <div>
              <strong>No Registrasi:</strong>
              {{ getKodeRegistrasi(buktiChatDialog.item) }}
            </div>
            <div>
              <strong>Pasien:</strong>
              {{ getPasienName(buktiChatDialog.item) }}
            </div>
          </div>

          <v-file-input
            v-model="buktiChatDialog.file"
            label="Pilih file bukti chat"
            prepend-icon=""
            prepend-inner-icon="mdi-paperclip"
            variant="outlined"
            density="compact"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            :error-messages="buktiChatDialog.error"
            show-size
          />

          <div class="text-caption text-medium-emphasis mt-2">
            Format yang didukung: JPG, JPEG, PNG, WEBP, atau PDF. Maksimal 5 MB.
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            class="text-none font-weight-bold"
            :disabled="buktiChatDialog.loading"
            @click="closeBuktiChatDialog"
          >
            Tutup
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-upload-outline"
            class="text-none font-weight-bold"
            :loading="buktiChatDialog.loading"
            :disabled="!buktiChatDialog.file"
            @click="submitBuktiChatKonsultasiOnline"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3500"
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
import registrasiLayananService from "@/services/registrasi/registrasiLayananService";

export default {
  name: "AllRegistrasiLayanan",

  data() {
    return {
      loading: false,
      errorMessage: "",
      activeTab: "all",

      breadcrumbs: [
        {
          title: "Resepsionis",
          disabled: true,
        },
        {
          title: "Registrasi Layanan",
          disabled: true,
        },
      ],

      filters: {
        search: "",
        tanggal: this.getToday(),
        layanan: null,
        current_task: null,
        status: null,
      },

      layananItems: [
        { title: "Konsultasi", value: "konsultasi" },
        { title: "Treatment", value: "treatment" },
        { title: "Penjualan", value: "penjualan" },
        { title: "Pembelian Online", value: "pembelian_online" },
      ],

      rows: [],
      countRows: [],

      pagination: {
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      },

      cancelDialog: {
        show: false,
        loading: false,
        item: null,
      },

      buktiChatDialog: {
        show: false,
        loading: false,
        item: null,
        file: null,
        error: "",
      },

      snackbar: {
        show: false,
        color: "success",
        message: "",
      },

      accessRules: {
        proses_dokter: {
          label: "Proses Dokter",
          roles: [
            "superadmin",
            "super_admin",
            "administrator",
            "admin",
            "dokter",
            "doctor",
            "it",
            "superuser",
          ],
        },
        pembayaran: {
          label: "Pembayaran",
          roles: [
            "superadmin",
            "super_admin",
            "administrator",
            "admin",
            "kasir",
            "cashier",
            "keuangan",
            "finance",
            "it",
            "superuser",
          ],
        },
        proses_treatment: {
          label: "Proses Treatment",
          roles: [
            "superadmin",
            "super_admin",
            "administrator",
            "admin",
            "dokter",
            "doctor",
            "perawat",
            "beautician",
            "it",
            "superuser",
          ],
        },
        proses_perawat: {
          label: "Proses Perawat",
          roles: [
            "superadmin",
            "super_admin",
            "administrator",
            "admin",
            "perawat",
            "beautician",
            "it",
            "superuser",
          ],
        },
      },
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },

    currentRole() {
      return this.resolveCurrentRole();
    },

    currentRoleTokens() {
      return this.normalizeRoleTokens(this.currentRole);
    },

    currentRoleText() {
      return this.getRoleLabel(this.currentRole) || "Tidak terbaca";
    },

    summaryCounts() {
      const sourceRows = this.countRows.length ? this.countRows : this.rows;

      return {
        all: sourceRows.length,
        active: sourceRows.filter((item) => this.isActiveStatus(item)).length,
        dokter: sourceRows.filter(
          (item) => Number(this.getCurrentTaskValue(item)) === 1,
        ).length,
        treatment: sourceRows.filter(
          (item) => Number(this.getCurrentTaskValue(item)) === 2,
        ).length,
        perawat: sourceRows.filter(
          (item) => Number(this.getCurrentTaskValue(item)) === 3,
        ).length,
        pembayaran: sourceRows.filter(
          (item) => Number(this.getCurrentTaskValue(item)) === 4,
        ).length,
        selesai: sourceRows.filter(
          (item) => this.getStatusValue(item) === "selesai",
        ).length,
        batal: sourceRows.filter(
          (item) => this.getStatusValue(item) === "batal",
        ).length,
      };
    },

    statusTabs() {
      return [
        {
          label: "Semua",
          value: "all",
          icon: "mdi-format-list-bulleted",
          count: this.getTabCount("all"),
        },
        {
          label: "Aktif",
          value: "active",
          icon: "mdi-progress-clock",
          count: this.getTabCount("active"),
        },
        {
          label: "Dokter",
          value: "dokter",
          icon: "mdi-stethoscope",
          count: this.getTabCount("dokter"),
        },
        {
          label: "Treatment",
          value: "treatment",
          icon: "mdi-face-woman-shimmer-outline",
          count: this.getTabCount("treatment"),
        },
        {
          label: "Perawat",
          value: "perawat",
          icon: "mdi-account-heart-outline",
          count: this.getTabCount("perawat"),
        },
        {
          label: "Pembayaran",
          value: "pembayaran",
          icon: "mdi-cash-register",
          count: this.getTabCount("pembayaran"),
        },
        {
          label: "Selesai",
          value: "selesai",
          icon: "mdi-check-circle-outline",
          count: this.getTabCount("selesai"),
        },
        {
          label: "Batal",
          value: "batal",
          icon: "mdi-close-circle-outline",
          count: this.getTabCount("batal"),
        },
      ];
    },

    visibleRows() {
      if (this.activeTab === "all") return this.rows;
      return this.rows.filter((item) => this.matchesTab(item, this.activeTab));
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    getToday() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    goToAdd() {
      this.$router.push("/resepsionis/registrasi-layanan/add");
    },

    goToDetail(item) {
      const id = this.getRegistrasiId(item);
      if (!id) {
        this.showSnackbar("ID registrasi tidak ditemukan.", "error");
        return;
      }
      this.$router.push(`/resepsionis/registrasi-layanan/${id}`);
    },

    applyFilters() {
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
      const mapped = this.mapTabToFilter(value);
      this.filters.status = mapped.status;
      this.filters.current_task = mapped.current_task;
      this.fetchData();
    },

    mapTabToFilter(value) {
      const map = {
        all: {
          status: null,
          current_task: null,
        },
        active: {
          status: 1,
          current_task: null,
        },
        dokter: {
          status: 1,
          current_task: 1,
        },
        treatment: {
          status: 1,
          current_task: 2,
        },
        perawat: {
          status: 1,
          current_task: 3,
        },
        pembayaran: {
          status: 1,
          current_task: 4,
        },
        selesai: {
          status: 2,
          current_task: null,
        },
        batal: {
          status: 9,
          current_task: null,
        },
      };

      return map[value] || map.all;
    },

    getTabCount(value) {
      return this.summaryCounts[value] || 0;
    },

    matchesTab(item, tab) {
      if (tab === "all") return true;
      if (tab === "active") return this.isActiveStatus(item);
      if (tab === "dokter") return Number(this.getCurrentTaskValue(item)) === 1;
      if (tab === "treatment")
        return Number(this.getCurrentTaskValue(item)) === 2;
      if (tab === "perawat")
        return Number(this.getCurrentTaskValue(item)) === 3;
      if (tab === "pembayaran")
        return Number(this.getCurrentTaskValue(item)) === 4;
      if (tab === "selesai") return this.getStatusValue(item) === "selesai";
      if (tab === "batal") return this.getStatusValue(item) === "batal";
      return true;
    },

    async fetchData() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const params = {
          page: this.pagination.page,
          per_page: this.pagination.perPage,
          search: this.filters.search || undefined,
          tanggal: this.filters.tanggal || undefined,
          layanan: this.filters.layanan || undefined,
          current_task: this.filters.current_task || undefined,
          status: this.filters.status || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await registrasiLayananService.getAll(params);
        const payload = response?.data || response;

        this.rows = this.extractRows(payload);
        this.applyPagination(payload);
        await this.fetchTabCounts();
      } catch (error) {
        this.rows = [];
        this.countRows = [];
        this.pagination.total = 0;
        this.pagination.lastPage = 1;
        this.errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal memuat data registrasi layanan.";
      } finally {
        this.loading = false;
      }
    },

    async fetchTabCounts() {
      try {
        const params = {
          page: 1,
          per_page: 1000,
          search: this.filters.search || undefined,
          tanggal: this.filters.tanggal || undefined,
          layanan: this.filters.layanan || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await registrasiLayananService.getAll(params);
        const payload = response?.data || response;
        this.countRows = this.extractRows(payload);
      } catch (error) {
        this.countRows = [...this.rows];
      }
    },

    extractRows(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      if (Array.isArray(payload?.rows)) return payload.rows;
      if (Array.isArray(payload?.items)) return payload.items;
      return [];
    },

    applyPagination(payload) {
      const meta = payload?.meta || payload?.pagination || payload || {};

      const total = Number(
        meta.total ||
          payload?.total ||
          payload?.data?.total ||
          this.rows.length ||
          0,
      );
      const perPage = Number(
        meta.per_page ||
          meta.perPage ||
          payload?.per_page ||
          payload?.data?.per_page ||
          this.pagination.perPage ||
          15,
      );
      const currentPage = Number(
        meta.current_page ||
          meta.currentPage ||
          payload?.current_page ||
          payload?.data?.current_page ||
          this.pagination.page ||
          1,
      );
      const lastPage = Number(
        meta.last_page ||
          meta.lastPage ||
          payload?.last_page ||
          payload?.data?.last_page ||
          Math.ceil(total / perPage) ||
          1,
      );

      this.pagination.total = total;
      this.pagination.perPage = perPage;
      this.pagination.page = currentPage;
      this.pagination.lastPage = lastPage || 1;
    },

    getCardKey(item) {
      return (
        item?.id ||
        item?.registrasi_id ||
        item?.kode_registrasi ||
        `${this.getPasienName(item)}-${this.getDataDate(item)}-${this.getDataTime(item)}`
      );
    },

    getRegistrasiId(item) {
      return item?.id || item?.registrasi_id || item?.registrasi?.id || null;
    },

    getKodeRegistrasi(item) {
      return (
        item?.kode_registrasi ||
        item?.no_registrasi ||
        `REG-${this.getRegistrasiId(item) || "-"}`
      );
    },

    getDisplayQueueNumber(item) {
      const code = String(this.getKodeRegistrasi(item) || "");
      const parts = code.split("-").filter(Boolean);
      const lastPart = parts.length ? parts[parts.length - 1] : "";
      if (/^\d+$/.test(lastPart))
        return lastPart.length > 3
          ? lastPart.slice(-3)
          : lastPart.padStart(3, "0");
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
        item?.tanggal_registrasi ||
        item?.tanggal_kunjungan ||
        item?.created_at ||
        item?.createdAt ||
        null
      );
    },

    getDataTime(item) {
      return (
        item?.jam ||
        item?.jam_registrasi ||
        item?.jam_kunjungan ||
        item?.created_at ||
        item?.createdAt ||
        null
      );
    },

    hasConsultation(item) {
      return (
        Number(item?.ada_konsultasi || 0) === 1 ||
        Number(item?.layanan?.ada_konsultasi || 0) === 1 ||
        Boolean(item?.konsultasi) ||
        Boolean(item?.konsultasi_id)
      );
    },

    hasTreatment(item) {
      return (
        Number(item?.ada_treatment || 0) === 1 ||
        Number(item?.layanan?.ada_treatment || 0) === 1 ||
        Boolean(item?.perawatan) ||
        Boolean(item?.perawatan_id) ||
        Boolean(item?.treatment_id)
      );
    },

    hasSales(item) {
      return (
        Number(item?.ada_penjualan || 0) === 1 ||
        Number(item?.layanan?.ada_penjualan || 0) === 1 ||
        Boolean(item?.penjualan) ||
        Boolean(item?.penjualan_id)
      );
    },

    isPembelianOnline(item) {
      return (
        Number(item?.is_pembelian_online || 0) === 1 ||
        Number(item?.layanan?.is_pembelian_online || 0) === 1 ||
        item?.channel_penjualan === "online" ||
        item?.tipe_penjualan === "online"
      );
    },

    getConsultationSourceCode(item) {
      return (
        item?.konsultasi_source_code ||
        item?.layanan?.konsultasi_source_code ||
        item?.konsultasi?.source_code ||
        item?.source_konsultasi ||
        ""
      );
    },

    getConsultationSourceName(item) {
      return (
        item?.jenis_konsultasi_label ||
        item?.layanan?.jenis_konsultasi_label ||
        item?.konsultasi_source_name ||
        item?.layanan?.konsultasi_source_name ||
        item?.konsultasi?.source_name ||
        ""
      );
    },

    getConsultationLabel(item) {
      const sourceName = this.getConsultationSourceName(item);
      if (sourceName) return sourceName;

      const sourceCode = String(
        this.getConsultationSourceCode(item) || "",
      ).toUpperCase();
      if (sourceCode.includes("ONLINE")) return "Konsultasi Online";
      if (sourceCode.includes("SPPG")) return "Konsultasi SPPG";
      if (sourceCode.includes("SPKK")) return "Konsultasi SPKK";
      if (sourceCode.includes("OFFLINE") || sourceCode.includes("DOKTER"))
        return "Konsultasi Dokter";

      const channel = String(
        item?.channel_konsultasi ?? item?.layanan?.channel_konsultasi ?? "",
      ).toLowerCase();
      if (channel === "2" || channel === "online") return "Konsultasi Online";
      if (channel === "1" || channel === "offline") return "Konsultasi Dokter";
      return "Konsultasi";
    },

    getLayananSummary(item) {
      const labels = [];
      if (this.hasConsultation(item))
        labels.push(this.getConsultationLabel(item));
      if (this.hasTreatment(item)) labels.push("Treatment");
      if (this.hasSales(item)) labels.push("Penjualan");
      if (this.isPembelianOnline(item)) labels.push("Pembelian Online");
      return labels.length ? labels.join(" • ") : "-";
    },

    getLayananChips(item) {
      const chips = [];
      if (this.hasConsultation(item))
        chips.push({
          label: this.getConsultationLabel(item),
          color: this.isOnlineConsultation(item) ? "info" : "primary",
          icon: this.isOnlineConsultation(item)
            ? "mdi-monitor-account"
            : "mdi-stethoscope",
        });
      if (this.hasTreatment(item))
        chips.push({
          label: "Treatment",
          color: "success",
          icon: "mdi-face-woman-shimmer-outline",
        });
      if (this.hasSales(item))
        chips.push({
          label: "Penjualan",
          color: "info",
          icon: "mdi-cart-outline",
        });
      if (this.isPembelianOnline(item))
        chips.push({
          label: "Pembelian Online",
          color: "deep-purple",
          icon: "mdi-web",
        });
      if (!chips.length)
        chips.push({
          label: "Belum ada layanan",
          color: "secondary",
          icon: "mdi-minus-circle-outline",
        });
      return chips;
    },

    getPasienName(item) {
      return (
        item?.pasien?.nama ||
        item?.pasien_nama ||
        item?.nama_pasien ||
        item?.nama_pembeli ||
        "-"
      );
    },

    getPasienCode(item) {
      return (
        item?.pasien?.kode_pasien ||
        item?.pasien?.no_rm ||
        item?.pasien_kode ||
        item?.kode_pasien ||
        item?.no_rm ||
        "RM -"
      );
    },

    getPasienPhone(item) {
      return (
        item?.pasien?.no_hp ||
        item?.pasien?.no_wa ||
        item?.pasien_no_hp ||
        item?.no_hp ||
        item?.no_wa ||
        "-"
      );
    },

    getPasienMeta(item) {
      return `${this.getPasienCode(item)} • ${this.getPasienPhone(item)}`;
    },

    getDokterName(item) {
      return (
        item?.dokter?.nama ||
        item?.dokter_nama ||
        item?.nama_dokter ||
        item?.dokter_name ||
        "Belum ditentukan"
      );
    },

    getPerawatName(item) {
      return (
        item?.perawat?.nama ||
        item?.perawat_nama ||
        item?.nama_perawat ||
        item?.perawat_name ||
        "Belum ditentukan"
      );
    },

    getTotalAmount(item) {
      return (
        item?.total_harga ||
        item?.total ||
        item?.grand_total ||
        item?.total_bayar ||
        item?.nominal_total ||
        0
      );
    },

    getStatusValue(item) {
      const rawStatus =
        item?.status ??
        item?.status_registrasi ??
        item?.status_label?.value ??
        item?.status_label ??
        item?.status_text ??
        "";

      if (rawStatus === 1 || rawStatus === "1") return "aktif";
      if (rawStatus === 2 || rawStatus === "2") return "selesai";
      if (rawStatus === 9 || rawStatus === "9") return "batal";

      if (this.isCancelled(item)) return "batal";
      if (this.isDone(item)) return "selesai";

      const raw = String(rawStatus).toLowerCase();

      if (["batal", "cancel", "cancelled", "canceled"].includes(raw))
        return "batal";
      if (["selesai", "done", "finish", "finished", "lunas"].includes(raw))
        return "selesai";
      if (["aktif", "active", "progress", "proses"].includes(raw))
        return "aktif";

      return "aktif";
    },

    isActiveStatus(item) {
      return this.getStatusValue(item) === "aktif";
    },

    isCancelled(item) {
      return (
        Number(item?.is_cancel || 0) === 1 ||
        Number(item?.is_batal || 0) === 1 ||
        Number(item?.is_delete || 0) === 1 ||
        String(item?.status || "").toLowerCase() === "batal"
      );
    },

    isDone(item) {
      const task = Number(this.getCurrentTaskValue(item) || 0);
      const status = String(item?.status || "").toLowerCase();
      return (
        task >= 5 ||
        Number(item?.is_selesai || 0) === 1 ||
        ["selesai", "done", "finish", "finished"].includes(status)
      );
    },

    getStatusMeta(item) {
      const status = this.getStatusValue(item);
      if (status === "batal")
        return {
          label: "Batal",
          color: "error",
          icon: "mdi-close-circle-outline",
        };
      if (status === "selesai")
        return {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-circle-outline",
        };
      return { label: "Aktif", color: "primary", icon: "mdi-progress-clock" };
    },

    getCurrentTaskValue(item) {
      return (
        item?.current_task ||
        item?.task_type ||
        item?.task?.task_type ||
        item?.currentTask?.task_type ||
        item?.registrasi_task?.task_type ||
        null
      );
    },

    getTaskMeta(item) {
      const task = Number(this.getCurrentTaskValue(item) || 0);
      const map = {
        1: {
          label: "Konsultasi / Dokter",
          color: "primary",
          icon: "mdi-stethoscope",
        },
        2: {
          label: "Treatment",
          color: "success",
          icon: "mdi-face-woman-shimmer-outline",
        },
        3: {
          label: "Perawat",
          color: "deep-purple",
          icon: "mdi-account-heart-outline",
        },
        4: { label: "Pembayaran", color: "warning", icon: "mdi-cash-register" },
        5: {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-circle-outline",
        },
      };
      return (
        map[task] || {
          label: "Belum ada task",
          color: "secondary",
          icon: "mdi-minus-circle-outline",
        }
      );
    },

    getPrimaryAction(item) {
      if (this.getStatusValue(item) === "batal") return null;
      const id = this.getRegistrasiId(item);
      const task = Number(this.getCurrentTaskValue(item) || 0);
      if (!id) return null;
      if (this.getStatusValue(item) === "selesai" || task >= 5)
        return {
          key: "detail",
          label: "Lihat Detail",
          icon: "mdi-eye-outline",
          color: "secondary",
          to: `/resepsionis/registrasi-layanan/${id}`,
        };
      if (task === 1 && this.canAccessAction("proses_dokter"))
        return {
          key: "proses_dokter",
          label: "Proses Dokter",
          icon: "mdi-stethoscope",
          color: "primary",
          to: `/pelayanan-medis/antrian-dokter/${id}/proses-antrian-dokter`,
        };
      if (task === 2 && this.canAccessAction("proses_treatment"))
        return {
          key: "proses_treatment",
          label: "Proses Treatment",
          icon: "mdi-face-woman-shimmer-outline",
          color: "success",
          to: `/pelayanan-medis/antrian-dokter/${id}/proses-antrian-dokter`,
        };
      if (task === 3 && this.canAccessAction("proses_perawat"))
        return {
          key: "proses_perawat",
          label: "Lihat Antrian Perawat",
          icon: "mdi-account-heart-outline",
          color: "deep-purple",
          to: "/pelayanan-medis/antrian-perawat",
        };
      if (task === 4 && this.canAccessAction("pembayaran"))
        return {
          key: "pembayaran",
          label: "Proses Pembayaran",
          icon: "mdi-cash-register",
          color: "warning",
          to: `/kasir/daftar-pembayaran/${id}/proses-pembayaran`,
        };
      return {
        key: "detail",
        label: "Lihat Detail",
        icon: "mdi-eye-outline",
        color: "secondary",
        to: `/resepsionis/registrasi-layanan/${id}`,
      };
    },

    getActionButtonColor(action) {
      return action?.color || "primary";
    },

    handlePrimaryAction(item) {
      const action = this.getPrimaryAction(item);
      if (!action?.to) {
        this.showSnackbar("Aksi tidak tersedia untuk registrasi ini.", "error");
        return;
      }
      this.$router.push(action.to);
    },

    canCancel(item) {
      return this.getStatusValue(item) === "aktif";
    },

    openCancelDialog(item) {
      this.cancelDialog.item = item;
      this.cancelDialog.show = true;
    },

    closeCancelDialog() {
      this.cancelDialog.show = false;
      this.cancelDialog.loading = false;
      this.cancelDialog.item = null;
    },

    async submitCancel() {
      const id = this.getRegistrasiId(this.cancelDialog.item);
      if (!id) {
        this.showSnackbar("ID registrasi tidak ditemukan.", "error");
        return;
      }
      this.cancelDialog.loading = true;
      try {
        const response = await registrasiLayananService.cancel(id);
        this.showSnackbar(
          response?.message ||
            response?.data?.message ||
            "Registrasi berhasil dibatalkan.",
          "success",
        );
        this.closeCancelDialog();
        this.fetchData();
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message ||
            error?.message ||
            "Gagal membatalkan registrasi.",
          "error",
        );
      } finally {
        this.cancelDialog.loading = false;
      }
    },

    isOnlineConsultation(item) {
      if (!this.hasConsultation(item)) return false;
      const sourceCode = String(
        this.getConsultationSourceCode(item) || "",
      ).toUpperCase();
      const sourceName = String(
        this.getConsultationSourceName(item) || "",
      ).toUpperCase();
      const channel = String(
        item?.channel_konsultasi ?? item?.layanan?.channel_konsultasi ?? "",
      ).toLowerCase();
      return (
        sourceCode.includes("ONLINE") ||
        sourceName.includes("ONLINE") ||
        channel === "online" ||
        channel === "2"
      );
    },

    hasBuktiChatKonsultasiOnline(item) {
      return Boolean(this.getBuktiChatKonsultasiOnlineUrl(item));
    },

    getBuktiChatKonsultasiOnlineUrl(item) {
      return (
        item?.bukti_chat_konsultasi_online_url ||
        item?.bukti_chat_konsultasi_online ||
        item?.konsultasi_online?.bukti_chat_konsultasi_online_url ||
        item?.konsultasi_online?.bukti_chat_konsultasi_online ||
        item?.registrasi?.bukti_chat_konsultasi_online_url ||
        item?.registrasi?.bukti_chat_konsultasi_online ||
        ""
      );
    },

    canViewBuktiChatKonsultasiOnline(item) {
      return (
        this.isOnlineConsultation(item) &&
        this.hasBuktiChatKonsultasiOnline(item)
      );
    },

    canUploadBuktiChatKonsultasiOnline(item) {
      return (
        this.isOnlineConsultation(item) &&
        !this.hasBuktiChatKonsultasiOnline(item) &&
        this.getStatusValue(item) === "aktif"
      );
    },

    viewBuktiChatKonsultasiOnline(item) {
      const url = this.getBuktiChatKonsultasiOnlineUrl(item);
      if (!url) {
        this.showSnackbar("File bukti chat belum tersedia.", "error");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    },

    openBuktiChatDialog(item) {
      this.buktiChatDialog.show = true;
      this.buktiChatDialog.item = item;
      this.buktiChatDialog.file = null;
      this.buktiChatDialog.error = "";
    },

    closeBuktiChatDialog() {
      this.buktiChatDialog.show = false;
      this.buktiChatDialog.loading = false;
      this.buktiChatDialog.item = null;
      this.buktiChatDialog.file = null;
      this.buktiChatDialog.error = "";
    },

    async submitBuktiChatKonsultasiOnline() {
      const id = this.getRegistrasiId(this.buktiChatDialog.item);
      const selectedFile = Array.isArray(this.buktiChatDialog.file)
        ? this.buktiChatDialog.file[0]
        : this.buktiChatDialog.file;
      if (!id) {
        this.buktiChatDialog.error = "ID registrasi tidak ditemukan.";
        return;
      }
      if (!selectedFile) {
        this.buktiChatDialog.error = "File bukti chat wajib dipilih.";
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        this.buktiChatDialog.error = "Ukuran file maksimal 5 MB.";
        return;
      }
      this.buktiChatDialog.loading = true;
      this.buktiChatDialog.error = "";
      try {
        const response =
          await registrasiLayananService.uploadBuktiChatKonsultasiOnline(
            id,
            selectedFile,
          );
        this.showSnackbar(
          response?.message ||
            response?.data?.message ||
            "Bukti chat berhasil diupload.",
          "success",
        );
        this.closeBuktiChatDialog();
        this.fetchData();
      } catch (error) {
        this.buktiChatDialog.error =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Gagal upload bukti chat.";
      } finally {
        this.buktiChatDialog.loading = false;
      }
    },

    canAccessAction(key) {
      const rule = this.accessRules[key];
      if (!rule) return true;
      if (!rule.roles || !rule.roles.length) return true;
      return rule.roles.some((role) => this.currentRoleTokens.includes(role));
    },

    resolveCurrentRole() {
      const selectedRole = this.safeJsonParse(
        localStorage.getItem("selected_role"),
        null,
      );
      const user = this.safeJsonParse(localStorage.getItem("user"), null);
      return (
        selectedRole?.name ||
        selectedRole?.nama ||
        selectedRole?.role_name ||
        localStorage.getItem("selected_role_name") ||
        user?.role?.name ||
        user?.role?.nama ||
        user?.role_name ||
        user?.role ||
        user?.jabatan ||
        ""
      );
    },

    normalizeRoleTokens(role) {
      const text = String(role || "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase();
      const baseTokens = text
        .split(/[\s,/_-]+/)
        .map((token) => token.trim())
        .filter(Boolean);
      const joined = text.replace(/[\s/_-]+/g, "_");
      return Array.from(new Set([...baseTokens, joined]));
    },

    getRoleLabel(role) {
      const value = String(role || "").trim();
      if (!value) return "";
      return value
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    },

    safeJsonParse(value, fallback = null) {
      try {
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    },

    formatDate(value) {
      if (!value) return "-";
      const text = String(value);
      const datePart = text.split("T")[0].split(" ")[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [year, month, day] = datePart.split("-");
        return `${day}/${month}/${year}`;
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "-";
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
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "-";
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },

    formatNumber(value) {
      const number = Number(value || 0);
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
      }).format(Number.isFinite(number) ? number : 0);
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

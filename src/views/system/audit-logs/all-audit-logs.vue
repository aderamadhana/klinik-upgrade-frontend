<template>
  <div class="audit-page">
    <!-- HEADER -->
    <div class="page-top">
      <div>
        <h1 class="page-title">Audit Logs</h1>
        <p class="page-subtitle">
          Pantau aktivitas perubahan data sistem, user, dan histori update
          record.
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" class="page-breadcrumbs">
        <template #divider>
          <span class="mx-1">/</span>
        </template>
      </v-breadcrumbs>
    </div>

    <!-- SUMMARY -->
    <v-row dense class="summary-row">
      <v-col cols="12" sm="6" md="3">
        <div class="summary-card">
          <div>
            <div class="summary-label">Total Log</div>
            <div class="summary-value">{{ formatNumber(summary.total) }}</div>
          </div>
          <div class="summary-icon icon-blue">
            <v-icon size="22">mdi-clipboard-text-clock-outline</v-icon>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div class="summary-card">
          <div>
            <div class="summary-label">Hari Ini</div>
            <div class="summary-value">{{ formatNumber(summary.today) }}</div>
          </div>
          <div class="summary-icon icon-green">
            <v-icon size="22">mdi-calendar-check-outline</v-icon>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div class="summary-card">
          <div>
            <div class="summary-label">Create / Update</div>
            <div class="summary-value">
              {{
                formatNumber(
                  getActionTotal("create") + getActionTotal("update"),
                )
              }}
            </div>
          </div>
          <div class="summary-icon icon-orange">
            <v-icon size="22">mdi-pencil-box-multiple-outline</v-icon>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <div class="summary-card">
          <div>
            <div class="summary-label">Delete / Force Delete</div>
            <div class="summary-value">
              {{
                formatNumber(
                  getActionTotal("delete") + getActionTotal("force_delete"),
                )
              }}
            </div>
          </div>
          <div class="summary-icon icon-red">
            <v-icon size="22">mdi-alert-circle-outline</v-icon>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ACTION CARDS -->
    <v-row dense class="action-row">
      <v-col cols="12" md="4">
        <div class="action-card">
          <div class="action-card-left">
            <div class="action-badge action-badge-blue">
              <v-icon size="22">mdi-refresh</v-icon>
            </div>

            <div>
              <div class="action-title">Refresh Audit Log</div>
              <div class="action-desc">
                Muat ulang data audit log terbaru dari sistem.
              </div>
            </div>
          </div>

          <v-btn
            color="primary"
            variant="flat"
            class="action-btn"
            :loading="loading"
            @click="refreshAll"
          >
            Refresh Data
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="action-card">
          <div class="action-card-left">
            <div class="action-badge action-badge-green">
              <v-icon size="22">mdi-filter-cog-outline</v-icon>
            </div>

            <div>
              <div class="action-title">Reset Filter</div>
              <div class="action-desc">
                Bersihkan filter pencarian dan tampilkan semua data audit.
              </div>
            </div>
          </div>

          <v-btn
            color="success"
            variant="flat"
            class="action-btn"
            @click="resetFilters"
          >
            Reset Filter
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="action-card">
          <div class="action-card-left">
            <div class="action-badge action-badge-orange">
              <v-icon size="22">mdi-shield-search-outline</v-icon>
            </div>

            <div>
              <div class="action-title">Filter Aktivitas Sensitif</div>
              <div class="action-desc">
                Fokus pada aktivitas delete atau force delete yang perlu
                perhatian.
              </div>
            </div>
          </div>

          <v-btn
            color="warning"
            variant="flat"
            class="action-btn"
            @click="showSensitiveLogs"
          >
            Tampilkan Sensitif
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- TABLE SECTION -->
    <div class="table-card">
      <div class="table-card-header">
        <div>
          <h2 class="table-title">Daftar Audit Log</h2>
          <div class="table-subtitle">
            Riwayat perubahan data berdasarkan module, tabel, user, dan action.
          </div>
        </div>

        <div class="table-toolbar">
          <v-text-field
            v-model="filters.search"
            placeholder="Cari user / tabel / deskripsi"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            class="toolbar-search"
            @keyup.enter="applyFilters"
            @click:clear="applyFilters"
          />

          <v-select
            v-model="filters.action"
            :items="filterOptions.actions"
            label="Action"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            class="toolbar-select"
          />

          <v-select
            v-model="filters.module_name"
            :items="filterOptions.modules"
            label="Module"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            class="toolbar-select"
          />
        </div>
      </div>

      <div class="quick-filter-row">
        <v-btn size="small" class="quick-chip" @click="quickFilter('create')">
          Tampilkan create
        </v-btn>

        <v-btn size="small" class="quick-chip" @click="quickFilter('update')">
          Tampilkan update
        </v-btn>

        <v-btn size="small" class="quick-chip" @click="quickFilter('delete')">
          Tampilkan delete
        </v-btn>

        <v-btn
          size="small"
          class="quick-chip"
          @click="quickFilter('force_delete')"
        >
          Tampilkan force delete
        </v-btn>

        <v-btn size="small" class="quick-chip" @click="resetFilters">
          Reset filter
        </v-btn>

        <div class="ml-auto d-flex align-center ga-2 quick-date-filter">
          <v-text-field
            v-model="filters.date_from"
            type="date"
            label="Dari"
            variant="outlined"
            density="compact"
            hide-details
            class="date-field"
          />

          <v-text-field
            v-model="filters.date_to"
            type="date"
            label="Sampai"
            variant="outlined"
            density="compact"
            hide-details
            class="date-field"
          />

          <v-btn color="primary" variant="flat" @click="applyFilters">
            Terapkan
          </v-btn>
        </div>
      </div>

      <v-data-table-server
        v-model:page="pagination.page"
        v-model:items-per-page="pagination.per_page"
        :headers="headers"
        :items="items"
        :items-length="pagination.total"
        :loading="loading"
        item-value="id"
        density="comfortable"
        class="audit-table"
        @update:options="handleTableOptions"
      >
        <template #loading>
          <div class="pa-6 text-center text-medium-emphasis">
            Memuat data audit log...
          </div>
        </template>

        <template #item.created_at="{ item }">
          <div class="cell-date">
            {{ formatDateTime(item.created_at) }}
          </div>
        </template>

        <template #item.table_name="{ item }">
          <div class="product-like-cell">
            <div class="product-title">{{ item.table_name || "-" }}</div>
            <div class="product-subtitle">
              Record ID: {{ item.record_id || "-" }}
            </div>
          </div>
        </template>

        <template #item.action="{ item }">
          <v-chip
            size="small"
            :color="getActionColor(item.action)"
            class="status-chip"
          >
            {{ formatAction(item.action) }}
          </v-chip>
        </template>

        <template #item.user="{ item }">
          <div class="product-like-cell">
            <div class="product-title">{{ item.username || "-" }}</div>
            <div class="product-subtitle">
              {{ item.role_name || "-" }}
            </div>
          </div>
        </template>

        <template #item.description="{ item }">
          <div class="desc-cell">
            {{ item.description || "-" }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="action-cell">
            <v-btn
              size="small"
              color="primary"
              class="mr-2"
              @click="openDetail(item)"
            >
              <v-icon start size="16">mdi-eye-outline</v-icon>
              Detail
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="pa-8 text-center text-medium-emphasis">
            Tidak ada data audit log
          </div>
        </template>
      </v-data-table-server>
    </div>

    <!-- DETAIL DIALOG -->
    <v-dialog v-model="detailDialog" max-width="1180" scrollable>
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet color="primary" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon
                  icon="mdi-clipboard-text-clock-outline"
                  color="primary"
                  size="26"
                />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  Detail Audit Log
                </div>
                <div class="text-body-2 text-white">
                  ID: {{ selectedItem ? selectedItem.id : "-" }}
                </div>
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                v-if="selectedItem?.action"
                size="small"
                color="white"
                variant="flat"
                class="font-weight-medium"
              >
                {{ formatAction(selectedItem.action) }}
              </v-chip>

              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click="detailDialog = false"
              />
            </div>
          </div>
        </v-sheet>

        <v-card-text v-if="detailLoading" class="pa-4">
          <v-card class="rounded-lg border mb-4" elevation="0">
            <v-card-text class="pa-6 text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="42"
                width="4"
              />

              <div class="text-subtitle-1 font-weight-bold mt-4">
                Memuat detail audit log...
              </div>

              <div class="text-body-2 text-medium-emphasis mt-1">
                Sistem sedang mengambil old values dan new values.
              </div>
            </v-card-text>
          </v-card>

          <v-row dense>
            <v-col v-for="n in 8" :key="`info-${n}`" cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <v-skeleton-loader type="text, heading" />
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6">
              <v-sheet rounded="lg" border class="pa-3">
                <v-skeleton-loader type="paragraph, paragraph, paragraph" />
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6">
              <v-sheet rounded="lg" border class="pa-3">
                <v-skeleton-loader type="paragraph, paragraph, paragraph" />
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-text v-else-if="selectedItem" class="pa-4">
          <v-row dense class="mb-4">
            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon
                      icon="mdi-calendar-clock"
                      color="primary"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">Tanggal</div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ formatDateTime(selectedItem.created_at) }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon
                      icon="mdi-view-module-outline"
                      color="primary"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">Module</div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ selectedItem.module_name || "-" }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon icon="mdi-table" color="primary" size="19" />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">Tabel</div>
                    <div
                      class="text-body-2 font-weight-bold text-high-emphasis"
                    >
                      {{ selectedItem.table_name || "-" }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon
                      icon="mdi-lightning-bolt-outline"
                      color="primary"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">Action</div>
                    <v-chip
                      size="small"
                      :color="getActionColor(selectedItem.action)"
                      variant="tonal"
                      class="font-weight-bold mt-1"
                    >
                      {{ formatAction(selectedItem.action) }}
                    </v-chip>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis">Record ID</div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ selectedItem.record_id || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis">Toko ID</div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ selectedItem.toko_id || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis">User</div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ selectedItem.username || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis">Role</div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ selectedItem.role_name || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis">IP Address</div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ selectedItem.ip_address || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="6">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis">Reason</div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ selectedItem.reason || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis">Deskripsi</div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ selectedItem.description || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis">User Agent</div>
                <div class="text-body-2 text-high-emphasis">
                  {{ selectedItem.user_agent || "-" }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-card class="rounded-lg border h-100" elevation="0">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center ga-3 mb-3">
                    <v-avatar size="34" color="orange-lighten-5">
                      <v-icon icon="mdi-history" color="warning" size="19" />
                    </v-avatar>

                    <div>
                      <div class="text-subtitle-1 font-weight-bold">
                        Old Values
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        Data sebelum perubahan.
                      </div>
                    </div>
                  </div>

                  <v-sheet
                    rounded="lg"
                    border
                    max-height="420"
                    class="pa-3 bg-grey-lighten-4 overflow-auto"
                  >
                    <pre class="ma-0 text-body-2">{{
                      formatJson(
                        selectedItem.old_values_parsed ||
                          selectedItem.old_values,
                      )
                    }}</pre>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card class="rounded-lg border h-100" elevation="0">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center ga-3 mb-3">
                    <v-avatar size="34" color="green-lighten-5">
                      <v-icon
                        icon="mdi-plus-circle-outline"
                        color="success"
                        size="19"
                      />
                    </v-avatar>

                    <div>
                      <div class="text-subtitle-1 font-weight-bold">
                        New Values
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        Data setelah perubahan.
                      </div>
                    </div>
                  </div>

                  <v-sheet
                    rounded="lg"
                    border
                    max-height="420"
                    class="pa-3 bg-grey-lighten-4 overflow-auto"
                  >
                    <pre class="ma-0 text-body-2">{{
                      formatJson(
                        selectedItem.new_values_parsed ||
                          selectedItem.new_values,
                      )
                    }}</pre>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-text v-else class="pa-4">
          <v-card class="rounded-lg border" elevation="0">
            <v-empty-state
              icon="mdi-alert-circle-outline"
              title="Detail audit log gagal dimuat"
              text="Silakan tutup modal lalu buka kembali detail data."
            />
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-close"
            @click="detailDialog = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import auditLogService from "@/services/auditLogService";

export default {
  name: "AuditLogsView",

  data() {
    return {
      loading: false,
      detailLoading: false,
      loading: false,
      detailDialog: false,
      selectedItem: null,

      breadcrumbs: [
        { title: "System", disabled: false, to: "/dashboard" },
        { title: "Audit Logs", disabled: true },
      ],

      headers: [
        { title: "Tanggal", key: "created_at", sortable: false, width: 160 },
        { title: "Tabel", key: "table_name", sortable: false, width: 220 },
        { title: "Action", key: "action", sortable: false, width: 140 },
        { title: "User", key: "user", sortable: false, width: 180 },
        { title: "Deskripsi", key: "description", sortable: false },
        {
          title: "Action",
          key: "actions",
          sortable: false,
          width: 140,
          align: "end",
        },
      ],

      items: [],

      pagination: {
        page: 1,
        per_page: 10,
        total: 0,
      },

      filters: {
        search: "",
        module_name: null,
        table_name: null,
        action: null,
        date_from: "",
        date_to: "",
      },

      filterOptions: {
        modules: [],
        tables: [],
        actions: [],
      },

      summary: {
        total: 0,
        today: 0,
        by_action: [],
      },
    };
  },

  mounted() {
    this.fetchInitialData();
  },

  methods: {
    async fetchInitialData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchFilters(),
          this.fetchSummary(),
          this.fetchData(),
        ]);
      } finally {
        this.loading = false;
      }
    },

    async fetchData() {
      const params = {
        page: this.pagination.page,
        per_page: this.pagination.per_page,
        ...this.cleanFilters(this.filters),
      };

      const response = await auditLogService.getAll(params);
      const result = response.data || {};

      this.items = result.data || [];
      this.pagination.total = result.total || 0;
      this.pagination.page = result.current_page || 1;
      this.pagination.per_page = Number(result.per_page || 10);
    },

    async fetchFilters() {
      const response = await auditLogService.getFilters();
      const data = response.data || {};

      this.filterOptions.modules = data.modules || [];
      this.filterOptions.tables = data.tables || [];
      this.filterOptions.actions = data.actions || [];
    },

    async fetchSummary() {
      const response = await auditLogService.getSummary(
        this.cleanFilters({
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
        }),
      );

      this.summary = {
        total: response.data?.total || 0,
        today: response.data?.today || 0,
        by_action: response.data?.by_action || [],
      };
    },

    async refreshAll() {
      this.loading = true;
      try {
        await Promise.all([this.fetchSummary(), this.fetchData()]);
      } finally {
        this.loading = false;
      }
    },

    async applyFilters() {
      this.pagination.page = 1;
      this.loading = true;
      try {
        await Promise.all([this.fetchSummary(), this.fetchData()]);
      } finally {
        this.loading = false;
      }
    },

    async openDetail(item) {
      this.detailDialog = true;
      this.detailLoading = true;
      this.selectedItem = null;

      try {
        const response = await auditLogService.getById(item.id);
        this.selectedItem = response.data;
      } catch (error) {
        console.error(error);
        this.selectedItem = null;
      } finally {
        this.detailLoading = false;
      }
    },

    async handleTableOptions(options) {
      this.pagination.page = options.page;
      this.pagination.per_page = options.itemsPerPage;
      await this.fetchData();
    },

    quickFilter(action) {
      this.filters.action = action;
      this.applyFilters();
    },

    resetFilters() {
      this.filters = {
        search: "",
        module_name: null,
        table_name: null,
        action: null,
        date_from: "",
        date_to: "",
      };
      this.applyFilters();
    },

    showSensitiveLogs() {
      this.filters.action = "delete";
      this.applyFilters();
    },

    getActionTotal(action) {
      const found = (this.summary.by_action || []).find(
        (item) => item.action === action,
      );
      return Number(found?.total || 0);
    },

    cleanFilters(filters) {
      const result = {};
      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== "") {
          result[key] = value;
        }
      });
      return result;
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    formatDateTime(value) {
      if (!value) return "-";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    formatAction(action) {
      const map = {
        create: "Create",
        update: "Update",
        delete: "Delete",
        restore: "Restore",
        force_delete: "Force Delete",
      };
      return map[action] || action || "-";
    },

    getActionColor(action) {
      const map = {
        create: "success",
        update: "primary",
        delete: "error",
        restore: "warning",
        force_delete: "error",
      };
      return map[action] || "secondary";
    },

    formatJson(value) {
      if (!value) return "-";

      if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
      }

      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch (error) {
        return value;
      }
    },
  },
};
</script>

<style scoped>
.audit-page {
  padding-bottom: 24px;
}

.page-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: #172033;
  margin: 0;
}

.page-subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: #667085;
}

.page-breadcrumbs {
  padding: 0;
  color: #98a2b3;
  font-size: 14px;
}

.summary-row,
.action-row {
  margin-bottom: 4px;
}

.summary-card {
  background: #fff;
  border: 1px solid #e7eaf0;
  border-radius: 18px;
  padding: 18px 18px;
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.03);
}

.summary-label {
  font-size: 14px;
  color: #667085;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 20px;
  line-height: 1;
  font-weight: 700;
  color: #101828;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-blue {
  background: #e8f1ff;
  color: #1d66d2;
}

.icon-green {
  background: #e7f6ec;
  color: #16a34a;
}

.icon-orange {
  background: #fff2e6;
  color: #f79009;
}

.icon-red {
  background: #ffeaea;
  color: #f04438;
}

.action-card {
  background: #fff;
  border: 1px solid #e7eaf0;
  border-radius: 18px;
  padding: 16px 18px;
  min-height: 124px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.03);
}

.action-card-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.action-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-badge-blue {
  background: #e8f1ff;
  color: #1d66d2;
}

.action-badge-green {
  background: #e7f6ec;
  color: #16a34a;
}

.action-badge-orange {
  background: #fff2e6;
  color: #f79009;
}

.action-title {
  font-size: 16px;
  font-weight: 700;
  color: #101828;
  margin-bottom: 3px;
}

.action-desc {
  font-size: 14px;
  color: #667085;
  line-height: 1.45;
}

.action-btn {
  align-self: flex-start;
  margin-top: 14px;
  border-radius: 10px;
  text-transform: none;
  font-weight: 600;
}

.table-card {
  margin-top: 10px;
  background: #fff;
  border: 1px solid #e7eaf0;
  border-radius: 20px;
  padding: 18px 18px 6px;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.03);
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 16px;
}

.table-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #101828;
}

.table-subtitle {
  font-size: 14px;
  color: #667085;
  margin-top: 4px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-search {
  width: 320px;
}

.toolbar-select {
  width: 160px;
}

.quick-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.quick-chip {
  border-radius: 999px;
  text-transform: none;
  font-weight: 500;
}

.quick-date-filter {
  flex-wrap: wrap;
}

.date-field {
  width: 150px;
}

.audit-table :deep(.v-data-table-header__content) {
  font-weight: 700;
  color: #101828;
}

.audit-table :deep(table) {
  border-collapse: separate;
  border-spacing: 0;
}

.audit-table :deep(tbody tr) {
  transition: background 0.2s ease;
}

.audit-table :deep(tbody tr:hover) {
  background: #fafbfc;
}

.audit-table :deep(td),
.audit-table :deep(th) {
  vertical-align: middle;
}

.cell-date {
  white-space: nowrap;
  font-size: 14px;
  color: #344054;
}

.product-like-cell {
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 14px;
  font-weight: 600;
  color: #101828;
}

.product-subtitle {
  font-size: 13px;
  color: #667085;
  margin-top: 2px;
}

.status-chip {
  font-weight: 600;
}

.desc-cell {
  max-width: 440px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #344054;
}

.action-cell {
  display: flex;
  justify-content: flex-end;
}

.detail-dialog-card {
  border-radius: 18px;
}

.detail-dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
}

.dialog-main-title {
  font-size: 18px;
  font-weight: 700;
  color: #101828;
}

.dialog-subtitle {
  font-size: 13px;
  color: #667085;
  margin-top: 2px;
}

.detail-dialog-body {
  padding: 18px 20px !important;
}

.detail-info-box {
  background: #fafbfc;
  border: 1px solid #edf0f5;
  border-radius: 14px;
  padding: 12px 14px;
  height: 100%;
}

.detail-label {
  font-size: 12px;
  color: #667085;
  margin-bottom: 6px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #101828;
  word-break: break-word;
}

.detail-user-agent {
  font-weight: 400;
  line-height: 1.5;
}

.json-card {
  background: #fafbfc;
  border: 1px solid #edf0f5;
  border-radius: 16px;
  overflow: hidden;
}

.json-title {
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 700;
  color: #101828;
  border-bottom: 1px solid #edf0f5;
}

.json-box {
  margin: 0;
  padding: 14px;
  max-height: 360px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.55;
  color: #344054;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 1200px) {
  .table-card-header {
    flex-direction: column;
  }

  .table-toolbar {
    width: 100%;
  }
}

@media (max-width: 960px) {
  .page-top {
    flex-direction: column;
  }

  .toolbar-search,
  .toolbar-select {
    width: 100%;
  }

  .quick-filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .quick-date-filter {
    width: 100%;
    justify-content: flex-start;
  }
}
.detail-loading-box,
.detail-empty-box {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.detail-loading-title {
  margin-top: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #101828;
}

.detail-loading-subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: #667085;
  text-align: center;
}

.skeleton-info-box {
  background: #fafbfc;
  border: 1px solid #edf0f5;
  border-radius: 14px;
  padding: 14px;
  height: 72px;
}

.skeleton-line {
  border-radius: 999px;
  background: linear-gradient(90deg, #eef1f6 25%, #f8fafc 37%, #eef1f6 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

.skeleton-line.small {
  width: 45%;
  height: 10px;
  margin-bottom: 12px;
}

.skeleton-line.large {
  width: 75%;
  height: 14px;
}

.skeleton-json-box {
  height: 260px;
  border-radius: 16px;
  background: linear-gradient(90deg, #eef1f6 25%, #f8fafc 37%, #eef1f6 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border: 1px solid #edf0f5;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>

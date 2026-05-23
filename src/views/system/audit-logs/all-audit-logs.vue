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
        <v-btn
          size="small"
          variant="tonal"
          class="quick-chip"
          @click="quickFilter('create')"
        >
          Tampilkan create
        </v-btn>

        <v-btn
          size="small"
          variant="tonal"
          class="quick-chip"
          @click="quickFilter('update')"
        >
          Tampilkan update
        </v-btn>

        <v-btn
          size="small"
          variant="tonal"
          class="quick-chip"
          @click="quickFilter('delete')"
        >
          Tampilkan delete
        </v-btn>

        <v-btn
          size="small"
          variant="tonal"
          class="quick-chip"
          @click="quickFilter('force_delete')"
        >
          Tampilkan force delete
        </v-btn>

        <v-btn
          size="small"
          variant="tonal"
          class="quick-chip"
          @click="resetFilters"
        >
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
            variant="tonal"
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
              variant="tonal"
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
    <!-- DETAIL DIALOG -->
    <v-dialog v-model="detailDialog" max-width="1100">
      <v-card class="detail-dialog-card">
        <v-card-title class="detail-dialog-title">
          <div>
            <div class="dialog-main-title">Detail Audit Log</div>
            <div class="dialog-subtitle">
              ID: {{ selectedItem ? selectedItem.id : "-" }}
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="detailDialog = false"
          />
        </v-card-title>

        <v-divider />

        <!-- LOADING STATE -->
        <v-card-text v-if="detailLoading" class="detail-dialog-body">
          <div class="detail-loading-box">
            <v-progress-circular
              indeterminate
              color="primary"
              size="42"
              width="4"
            />

            <div class="detail-loading-title">Memuat detail audit log...</div>

            <div class="detail-loading-subtitle">
              Sistem sedang mengambil old values dan new values.
            </div>
          </div>

          <v-row dense class="mt-4">
            <v-col v-for="n in 8" :key="`info-${n}`" cols="12" md="3">
              <div class="skeleton-info-box">
                <div class="skeleton-line small"></div>
                <div class="skeleton-line large"></div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="skeleton-json-box"></div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="skeleton-json-box"></div>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- DETAIL CONTENT -->
        <v-card-text v-else-if="selectedItem" class="detail-dialog-body">
          <v-row dense class="mb-3">
            <v-col cols="12" md="3">
              <div class="detail-info-box">
                <div class="detail-label">Tanggal</div>
                <div class="detail-value">
                  {{ formatDateTime(selectedItem.created_at) }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="detail-info-box">
                <div class="detail-label">Module</div>
                <div class="detail-value">
                  {{ selectedItem.module_name || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="detail-info-box">
                <div class="detail-label">Tabel</div>
                <div class="detail-value">
                  {{ selectedItem.table_name || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="detail-info-box">
                <div class="detail-label">Action</div>
                <div class="detail-value">
                  <v-chip
                    size="small"
                    :color="getActionColor(selectedItem.action)"
                    variant="tonal"
                  >
                    {{ formatAction(selectedItem.action) }}
                  </v-chip>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="detail-info-box">
                <div class="detail-label">Record ID</div>
                <div class="detail-value">
                  {{ selectedItem.record_id || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="detail-info-box">
                <div class="detail-label">Toko ID</div>
                <div class="detail-value">
                  {{ selectedItem.toko_id || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="detail-info-box">
                <div class="detail-label">User</div>
                <div class="detail-value">
                  {{ selectedItem.username || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="detail-info-box">
                <div class="detail-label">Role</div>
                <div class="detail-value">
                  {{ selectedItem.role_name || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-info-box">
                <div class="detail-label">IP Address</div>
                <div class="detail-value">
                  {{ selectedItem.ip_address || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-info-box">
                <div class="detail-label">Reason</div>
                <div class="detail-value">
                  {{ selectedItem.reason || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="detail-info-box">
                <div class="detail-label">Deskripsi</div>
                <div class="detail-value">
                  {{ selectedItem.description || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="detail-info-box">
                <div class="detail-label">User Agent</div>
                <div class="detail-value detail-user-agent">
                  {{ selectedItem.user_agent || "-" }}
                </div>
              </div>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" md="6">
              <div class="json-card">
                <div class="json-title">Old Values</div>
                <pre class="json-box">{{
                  formatJson(
                    selectedItem.old_values_parsed || selectedItem.old_values,
                  )
                }}</pre>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="json-card">
                <div class="json-title">New Values</div>
                <pre class="json-box">{{
                  formatJson(
                    selectedItem.new_values_parsed || selectedItem.new_values,
                  )
                }}</pre>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- FAILED STATE -->
        <v-card-text v-else class="detail-dialog-body">
          <div class="detail-empty-box">
            <v-icon size="46" color="error"> mdi-alert-circle-outline </v-icon>

            <div class="detail-loading-title">
              Detail audit log gagal dimuat
            </div>

            <div class="detail-loading-subtitle">
              Silakan tutup modal lalu buka kembali detail data.
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn variant="text" @click="detailDialog = false"> Tutup </v-btn>
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

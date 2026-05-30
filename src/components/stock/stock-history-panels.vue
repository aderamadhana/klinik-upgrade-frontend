<template>
  <v-expansion-panels class="mt-4" variant="accordion">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <div>
          <div class="panel-title">Riwayat Penerimaan Stok</div>
          <div class="panel-subtitle">
            Draft, posted, dan cancelled penerimaan barang.
          </div>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <div class="table-toolbar mb-3">
          <v-text-field
            :model-value="penerimaanSearch"
            placeholder="Cari kode / faktur supplier"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="search-input"
            @update:model-value="$emit('update:penerimaanSearch', $event)"
            @keyup.enter="$emit('refresh-penerimaan')"
          />

          <div class="toolbar-actions">
            <v-select
              :model-value="penerimaanStatus"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="select-input"
              @update:model-value="handlePenerimaanStatusChanged"
            />

            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              :loading="loadingPenerimaan"
              @click="$emit('refresh-penerimaan')"
            >
              Refresh
            </v-btn>
          </div>
        </div>

        <v-data-table-server
          :headers="penerimaanHeaders"
          :items="penerimaanRows"
          :loading="loadingPenerimaan"
          :items-length="penerimaanTotal"
          :items-per-page="penerimaanItemsPerPage"
          :page="penerimaanPage"
          density="compact"
          item-value="id"
          @update:options="$emit('update-penerimaan-options', $event)"
        >
          <template #item.tanggal="{ item }">
            {{ formatDate(item.tanggal) }}
          </template>

          <template #item.supplier="{ item }">
            {{ getSupplierName(item) }}
          </template>

          <template #item.status="{ item }">
            <v-chip size="small" :color="getStatusColor(item.status)">
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.total_qty="{ item }">
            {{ formatNumber(item.total_qty) }}
          </template>

          <template #item.total_nominal="{ item }">
            {{ formatCurrency(item.total_nominal) }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                size="small"
                color="primary"
                icon="mdi-eye-outline"
                @click="$emit('show-penerimaan-detail', item)"
              />

              <v-btn
                v-if="item.status === 'DRAFT'"
                size="small"
                color="success"
                icon="mdi-check-circle-outline"
                @click="$emit('post-penerimaan', item)"
              />

              <v-btn
                v-if="item.status === 'DRAFT'"
                size="small"
                color="error"
                icon="mdi-close-circle-outline"
                @click="$emit('cancel-penerimaan', item)"
              />
            </div>
          </template>
        </v-data-table-server>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title>
        <div>
          <div class="panel-title">Riwayat Penyesuaian Stok</div>
          <div class="panel-subtitle">Stok awal, koreksi, dan opname.</div>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <div class="table-toolbar mb-3">
          <v-text-field
            :model-value="penyesuaianSearch"
            placeholder="Cari kode penyesuaian"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="search-input"
            @update:model-value="$emit('update:penyesuaianSearch', $event)"
            @keyup.enter="$emit('refresh-penyesuaian')"
          />

          <div class="toolbar-actions">
            <v-select
              :model-value="jenisPenyesuaian"
              :items="jenisPenyesuaianOptions"
              label="Jenis"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="select-input"
              @update:model-value="handleJenisPenyesuaianChanged"
            />

            <v-select
              :model-value="penyesuaianStatus"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="select-input"
              @update:model-value="handlePenyesuaianStatusChanged"
            />

            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              :loading="loadingPenyesuaian"
              @click="$emit('refresh-penyesuaian')"
            >
              Refresh
            </v-btn>
          </div>
        </div>

        <v-data-table-server
          :headers="penyesuaianHeaders"
          :items="penyesuaianRows"
          :loading="loadingPenyesuaian"
          :items-length="penyesuaianTotal"
          :items-per-page="penyesuaianItemsPerPage"
          :page="penyesuaianPage"
          density="compact"
          item-value="id"
          @update:options="$emit('update-penyesuaian-options', $event)"
        >
          <template #item.tanggal="{ item }">
            {{ formatDate(item.tanggal) }}
          </template>

          <template #item.jenis_penyesuaian="{ item }">
            <v-chip size="small">
              {{ item.jenis_penyesuaian }}
            </v-chip>
          </template>

          <template #item.status="{ item }">
            <v-chip size="small" :color="getStatusColor(item.status)">
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                size="small"
                color="primary"
                icon="mdi-eye-outline"
                @click="$emit('show-penyesuaian-detail', item)"
              />

              <v-btn
                v-if="item.status === 'DRAFT'"
                size="small"
                color="success"
                icon="mdi-check-circle-outline"
                @click="$emit('post-penyesuaian', item)"
              />

              <v-btn
                v-if="item.status === 'DRAFT'"
                size="small"
                color="error"
                icon="mdi-close-circle-outline"
                @click="$emit('cancel-penyesuaian', item)"
              />
            </div>
          </template>
        </v-data-table-server>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  name: "StockHistoryPanels",

  props: {
    penerimaanSearch: {
      type: String,
      default: "",
    },
    penerimaanStatus: {
      type: String,
      default: "",
    },
    penyesuaianSearch: {
      type: String,
      default: "",
    },
    penyesuaianStatus: {
      type: String,
      default: "",
    },
    jenisPenyesuaian: {
      type: String,
      default: "",
    },
    penerimaanTotal: {
      type: Number,
      default: 0,
    },
    penerimaanPage: {
      type: Number,
      default: 1,
    },
    penerimaanItemsPerPage: {
      type: Number,
      default: 10,
    },
    penyesuaianTotal: {
      type: Number,
      default: 0,
    },
    penyesuaianPage: {
      type: Number,
      default: 1,
    },
    penyesuaianItemsPerPage: {
      type: Number,
      default: 10,
    },
    penerimaanRows: {
      type: Array,
      default: () => [],
    },
    penyesuaianRows: {
      type: Array,
      default: () => [],
    },
    penerimaanHeaders: {
      type: Array,
      default: () => [],
    },
    penyesuaianHeaders: {
      type: Array,
      default: () => [],
    },
    statusOptions: {
      type: Array,
      default: () => [],
    },
    jenisPenyesuaianOptions: {
      type: Array,
      default: () => [],
    },
    loadingPenerimaan: {
      type: Boolean,
      default: false,
    },
    loadingPenyesuaian: {
      type: Boolean,
      default: false,
    },
    formatDate: {
      type: Function,
      required: true,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    formatCurrency: {
      type: Function,
      required: true,
    },
    getStatusColor: {
      type: Function,
      required: true,
    },
    getSupplierName: {
      type: Function,
      required: true,
    },
  },

  emits: [
    "update:penerimaanSearch",
    "update:penerimaanStatus",
    "update:penyesuaianSearch",
    "update:penyesuaianStatus",
    "update:jenisPenyesuaian",
    "refresh-penerimaan",
    "refresh-penyesuaian",
    "show-penerimaan-detail",
    "show-penyesuaian-detail",
    "post-penerimaan",
    "cancel-penerimaan",
    "post-penyesuaian",
    "cancel-penyesuaian",
    "update-penerimaan-options",
    "update-penyesuaian-options",
  ],

  methods: {
    handlePenerimaanStatusChanged(value) {
      this.$emit("update:penerimaanStatus", value);
      this.$emit("refresh-penerimaan");
    },

    handleJenisPenyesuaianChanged(value) {
      this.$emit("update:jenisPenyesuaian", value);
      this.$emit("refresh-penyesuaian");
    },

    handlePenyesuaianStatusChanged(value) {
      this.$emit("update:penyesuaianStatus", value);
      this.$emit("refresh-penyesuaian");
    },
  },
};
</script>

<style scoped>
.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.panel-subtitle {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 320px;
  max-width: 100%;
}

.select-input {
  width: 190px;
  max-width: 100%;
}

@media (max-width: 768px) {
  .table-toolbar,
  .toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input,
  .select-input {
    width: 100%;
  }
}
</style>

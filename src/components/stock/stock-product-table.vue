<template>
  <v-card class="stock-card" variant="flat">
    <v-card-text>
      <div class="table-toolbar">
        <div>
          <div class="section-title">Daftar Stok Produk</div>
          <div class="section-subtitle">
            Lokasi aktif: {{ selectedTempatName }}
          </div>
        </div>

        <div class="toolbar-actions">
          <v-text-field
            :model-value="search"
            placeholder="Cari kode / nama produk"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="search-input"
            @update:model-value="$emit('update:search', $event)"
            @keyup.enter="$emit('refresh')"
            @click:clear="$emit('refresh')"
          />

          <v-select
            :model-value="tempatProdukId"
            :items="tempatProdukOptions"
            item-title="nama_tempat_produk"
            item-value="id"
            label="Tempat"
            variant="outlined"
            density="compact"
            hide-details
            class="select-input"
            @update:model-value="handleTempatChanged"
          />
        </div>
      </div>

      <div class="filter-row">
        <v-chip
          :color="showOnlyAttention ? 'primary' : undefined"
          :variant="showOnlyAttention ? 'flat' : 'tonal'"
          size="small"
          @click="$emit('update:showOnlyAttention', !showOnlyAttention)"
        >
          Tampilkan yang perlu perhatian
        </v-chip>

        <v-chip
          :color="showOnlyEmpty ? 'error' : undefined"
          :variant="showOnlyEmpty ? 'flat' : 'tonal'"
          size="small"
          @click="$emit('update:showOnlyEmpty', !showOnlyEmpty)"
        >
          Tampilkan stok kosong
        </v-chip>

        <v-chip size="small" @click="$emit('reset-filter')">
          Reset filter
        </v-chip>
      </div>

      <v-data-table-server
        :headers="headers"
        :items="items"
        :loading="loading"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :page="page"
        density="comfortable"
        item-value="id"
        @update:options="$emit('update-options', $event)"
      >
        <template #item.no="{ index }">
          {{ index + 1 }}
        </template>

        <template #item.produk="{ item }">
          <div class="product-cell">
            <div class="product-name">{{ item.nama_produk }}</div>
            <div class="product-code">
              {{ item.kode_produk }} · {{ item.tempat_produk_nama }}
            </div>
          </div>
        </template>

        <template #item.harga_jual="{ item }">
          {{ formatCurrency(item.harga_jual) }}
        </template>

        <template #item.stok_akhir="{ item }">
          <strong>{{ formatNumber(item.stok_akhir) }}</strong>
        </template>

        <template #item.stok_reserved="{ item }">
          <span class="text-medium-emphasis">
            {{ formatNumber(item.stok_reserved) }}
          </span>
        </template>

        <template #item.stok_tersedia="{ item }">
          <div class="stock-available">
            <div class="d-flex align-center justify-space-between mb-1">
              <strong>{{ formatNumber(item.stok_tersedia) }}</strong>
              <span class="text-caption text-medium-emphasis">
                Min {{ formatNumber(item.stok_minimum) }}
              </span>
            </div>

            <v-progress-linear
              :model-value="getStockProgress(item)"
              :color="getStockStatus(item).color"
              height="6"
              rounded
            />
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip size="small" :color="getStockStatus(item).color">
            {{ getStockStatus(item).label }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-2 justify-end">
            <v-btn
              size="small"
              color="primary"
              prepend-icon="mdi-card-bulleted-outline"
              @click="$emit('open-kartu', item)"
            >
              Kartu
            </v-btn>

            <v-btn
              size="small"
              color="warning"
              icon="mdi-pencil-outline"
              @click="$emit('open-penyesuaian', item)"
            />
          </div>
        </template>

        <template #no-data>
          <div class="empty-state">
            <v-icon size="42" color="grey">mdi-database-off-outline</v-icon>
            <div class="empty-title">Data stok belum tersedia</div>
            <div class="empty-desc">
              Lakukan penerimaan atau penyesuaian stok awal terlebih dahulu.
            </div>
          </div>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "StockProductTable",

  props: {
    search: {
      type: String,
      default: "",
    },
    tempatProdukId: {
      type: [String, Number, null],
      default: null,
    },
    showOnlyAttention: {
      type: Boolean,
      default: false,
    },
    showOnlyEmpty: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Array,
      default: () => [],
    },
    tempatProdukOptions: {
      type: Array,
      default: () => [],
    },
    selectedTempatName: {
      type: String,
      default: "-",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    formatCurrency: {
      type: Function,
      required: true,
    },
    getStockStatus: {
      type: Function,
      required: true,
    },
    getStockProgress: {
      type: Function,
      required: true,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
    page: {
      type: Number,
      default: 1,
    },
  },

  emits: [
    "update:search",
    "update:tempatProdukId",
    "update:showOnlyAttention",
    "update:showOnlyEmpty",
    "refresh",
    "reset-filter",
    "open-kartu",
    "open-penyesuaian",
    "update-options",
  ],

  methods: {
    handleTempatChanged(value) {
      this.$emit("update:tempatProdukId", value);
      this.$emit("refresh");
    },
  },
};
</script>

<style scoped>
.stock-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
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

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.product-cell {
  padding: 6px 0;
}

.product-name {
  font-weight: 700;
  color: #111827;
}

.product-code {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.stock-available {
  min-width: 170px;
}

.empty-state {
  padding: 36px 0;
  text-align: center;
  color: #6b7280;
}

.empty-title {
  font-weight: 700;
  color: #111827;
  margin-top: 8px;
}

.empty-desc {
  font-size: 13px;
  margin-top: 4px;
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

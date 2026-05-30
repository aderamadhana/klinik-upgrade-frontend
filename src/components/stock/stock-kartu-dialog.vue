<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1100"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="dialog-title">
        <div>
          <div>Kartu Stok</div>
          <div class="dialog-subtitle">
            {{ item?.kode_produk }} · {{ item?.nama_produk }}
          </div>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row class="mb-3">
          <v-col cols="12" md="3">
            <v-text-field
              :model-value="tanggalAwal"
              type="date"
              label="Tanggal Awal"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="$emit('update:tanggalAwal', $event)"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              :model-value="tanggalAkhir"
              type="date"
              label="Tanggal Akhir"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="$emit('update:tanggalAkhir', $event)"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              :loading="loading"
              @click="$emit('fetch')"
            >
              Tampilkan
            </v-btn>
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          density="compact"
          item-value="id"
        >
          <template #item.tanggal="{ item }">
            {{ formatDateTime(item.tanggal) }}
          </template>

          <template #item.tipe_mutasi="{ item }">
            <v-chip size="small">
              {{ item.tipe_mutasi }}
            </v-chip>
          </template>

          <template #item.qty_masuk="{ item }">
            {{ formatNumber(item.qty_masuk) }}
          </template>

          <template #item.qty_keluar="{ item }">
            {{ formatNumber(item.qty_keluar) }}
          </template>

          <template #item.qty_adjustment="{ item }">
            {{ formatNumber(item.qty_adjustment) }}
          </template>

          <template #item.stok_sebelum="{ item }">
            {{ formatNumber(item.stok_sebelum) }}
          </template>

          <template #item.stok_sesudah="{ item }">
            <strong>{{ formatNumber(item.stok_sesudah) }}</strong>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "StockKartuDialog",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: null,
    },
    rows: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    tanggalAwal: {
      type: String,
      default: "",
    },
    tanggalAkhir: {
      type: String,
      default: "",
    },
    formatDateTime: {
      type: Function,
      required: true,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
  },

  emits: [
    "update:modelValue",
    "update:tanggalAwal",
    "update:tanggalAkhir",
    "fetch",
  ],
};
</script>

<style scoped>
.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dialog-subtitle {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}
</style>

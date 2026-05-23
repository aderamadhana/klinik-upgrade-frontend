<template>
  <v-dialog
    :model-value="modelValue"
    max-width="980"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="dialog-title">
        <div>
          <div>{{ dialog.title }}</div>
          <div class="dialog-subtitle">{{ dialog.subtitle }}</div>
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
            <div class="info-label">Tanggal</div>
            <div class="info-value">{{ formatDate(dialog.data?.tanggal) }}</div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="info-label">Status</div>
            <v-chip
              size="small"
              :color="getStatusColor(dialog.data?.status)"
              variant="tonal"
            >
              {{ dialog.data?.status || "-" }}
            </v-chip>
          </v-col>

          <v-col cols="12" md="3">
            <div class="info-label">Tempat</div>
            <div class="info-value">
              {{ dialog.data?.tempat_produk?.nama_tempat_produk || "-" }}
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="info-label">Catatan</div>
            <div class="info-value">{{ dialog.data?.catatan || "-" }}</div>
          </v-col>
        </v-row>

        <v-table density="compact">
          <thead>
            <tr>
              <th>Produk</th>
              <th v-if="dialog.type === 'penerimaan'">Qty</th>
              <th v-if="dialog.type === 'penerimaan'">Harga Beli</th>
              <th v-if="dialog.type === 'penerimaan'">Subtotal</th>

              <th v-if="dialog.type === 'penyesuaian'">Stok Sistem</th>
              <th v-if="dialog.type === 'penyesuaian'">Stok Fisik</th>
              <th v-if="dialog.type === 'penyesuaian'">Selisih</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in dialog.details" :key="row.id">
              <td>
                {{
                  row.produk?.kode_accurate || row.produk?.kode_produk || "-"
                }}
                -
                {{ row.produk?.nama || row.produk?.nama_produk || "-" }}
              </td>

              <td v-if="dialog.type === 'penerimaan'">
                {{ formatNumber(row.qty) }}
              </td>

              <td v-if="dialog.type === 'penerimaan'">
                {{ formatCurrency(row.harga_beli) }}
              </td>

              <td v-if="dialog.type === 'penerimaan'">
                {{ formatCurrency(row.subtotal) }}
              </td>

              <td v-if="dialog.type === 'penyesuaian'">
                {{ formatNumber(row.stok_sistem) }}
              </td>

              <td v-if="dialog.type === 'penyesuaian'">
                {{ formatNumber(row.stok_fisik) }}
              </td>

              <td v-if="dialog.type === 'penyesuaian'">
                {{ formatNumber(row.selisih) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "StockDetailDialog",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    dialog: {
      type: Object,
      required: true,
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
  },

  emits: ["update:modelValue"],
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

.info-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-value {
  font-weight: 600;
  color: #111827;
}
</style>

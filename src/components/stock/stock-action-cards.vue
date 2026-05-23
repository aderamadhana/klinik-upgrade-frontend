<template>
  <v-row class="mb-4">
    <v-col cols="12" md="4">
      <v-card class="stock-card" variant="flat">
        <v-card-text class="d-flex align-start ga-4">
          <v-avatar color="primary" variant="tonal" rounded="lg">
            <v-icon>mdi-clipboard-list-outline</v-icon>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="action-title">Stok Hari Ini</div>
            <div class="action-desc">
              Lihat stok aktual, stok tersedia, dan item yang perlu dicek.
            </div>
            <v-btn
              class="mt-3"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-refresh"
              :loading="loadingStock"
              @click="$emit('refresh-stock')"
            >
              Refresh Stok
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card class="stock-card" variant="flat">
        <v-card-text class="d-flex align-start ga-4">
          <v-avatar color="success" variant="tonal" rounded="lg">
            <v-icon>mdi-truck-delivery-outline</v-icon>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="action-title">Penerimaan Stok</div>
            <div class="action-desc">
              Catat barang masuk dari supplier dan posting ke saldo stok.
            </div>
            <v-btn
              class="mt-3"
              color="success"
              prepend-icon="mdi-plus"
              @click="$emit('open-penerimaan')"
            >
              Buat Penerimaan
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card class="stock-card" variant="flat">
        <v-card-text class="d-flex align-start ga-4">
          <v-avatar color="warning" variant="tonal" rounded="lg">
            <v-icon>mdi-tune-variant</v-icon>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="action-title">Penyesuaian Stok</div>
            <div class="action-desc">
              Koreksi stok awal, stok fisik, dan hasil opname.
            </div>
            <v-btn
              class="mt-3"
              color="warning"
              prepend-icon="mdi-plus"
              @click="$emit('open-penyesuaian')"
            >
              Buat Penyesuaian
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "StockActionCards",

  props: {
    loadingStock: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["refresh-stock", "open-penerimaan", "open-penyesuaian"],
};
</script>

<style scoped>
.stock-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.action-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.action-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}
</style>

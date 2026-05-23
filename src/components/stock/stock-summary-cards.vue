<template>
  <v-row class="mb-4">
    <v-col cols="12" md="3">
      <v-card class="stock-card" variant="flat">
        <v-card-text>
          <div class="stat-head">
            <div>
              <div class="stat-label">Total Item</div>
              <div class="stat-value">{{ summary.totalProduk }}</div>
            </div>
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-pill</v-icon>
            </v-avatar>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="3">
      <v-card class="stock-card" variant="flat">
        <v-card-text>
          <div class="stat-head">
            <div>
              <div class="stat-label">Total Stok</div>
              <div class="stat-value">
                {{ formatNumber(summary.totalStokAkhir) }}
              </div>
            </div>
            <v-avatar color="success" variant="tonal">
              <v-icon>mdi-package-variant-closed</v-icon>
            </v-avatar>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="3">
      <v-card class="stock-card" variant="flat">
        <v-card-text>
          <div class="stat-head">
            <div>
              <div class="stat-label">Reserved</div>
              <div class="stat-value">
                {{ formatNumber(summary.totalReserved) }}
              </div>
            </div>
            <v-avatar color="warning" variant="tonal">
              <v-icon>mdi-lock-clock</v-icon>
            </v-avatar>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="3">
      <v-card class="stock-card" variant="flat">
        <v-card-text>
          <div class="stat-head">
            <div>
              <div class="stat-label">Perlu Perhatian</div>
              <div class="stat-value">{{ summary.perluPerhatian }}</div>
            </div>
            <v-avatar color="error" variant="tonal">
              <v-icon>mdi-alert-circle-outline</v-icon>
            </v-avatar>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "StockSummaryCards",

  props: {
    summary: {
      type: Object,
      required: true,
    },
    formatNumber: {
      type: Function,
      required: true,
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

.stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
}
</style>

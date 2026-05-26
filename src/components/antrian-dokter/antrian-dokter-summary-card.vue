<template>
  <div>
    <v-divider class="mb-5" />

    <div class="text-subtitle-1 font-weight-bold mb-3">
      Ringkasan Pembayaran
    </div>

    <v-card variant="outlined" class="mb-5">
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" md="3">
            <div class="text-caption text-medium-emphasis">Total Treatment</div>
            <div class="text-h6 font-weight-bold">
              {{ formatRupiah(totalTreatment) }}
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="text-caption text-medium-emphasis">
              Total Obat / Produk
            </div>
            <div class="text-h6 font-weight-bold">
              {{ formatRupiah(totalObat) }}
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="text-caption text-medium-emphasis">
              Biaya Konsultasi
            </div>
            <div class="text-h6 font-weight-bold">
              {{ formatRupiah(consultationFee) }}
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="text-caption text-medium-emphasis">Grand Total</div>
            <div class="text-h5 font-weight-bold text-primary">
              {{ formatRupiah(grandTotal) }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AntrianDokterSummaryCard",

  props: {
    totalTreatment: {
      type: Number,
      default: 0,
    },
    totalObat: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
  },

  methods: {
    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },
  },
};
</script>

<template>
  <div class="summary-sticky">
    <v-card class="section-card mb-4" variant="flat">
      <v-card-text class="pa-5">
        <div class="summary-title">Ringkasan Pembayaran</div>

        <div class="summary-row">
          <span>Subtotal Obat</span>
          <strong>{{ formatCurrency(totalPenjualan) }}</strong>
        </div>

        <div class="summary-row">
          <span>Subtotal Treatment</span>
          <strong>{{ formatCurrency(totalTreatment) }}</strong>
        </div>

        <div class="summary-row">
          <span>Subtotal</span>
          <strong>{{ formatCurrency(subtotal) }}</strong>
        </div>

        <div class="summary-row">
          <span>Diskon Subtotal</span>
          <strong class="text-error">
            - {{ formatCurrency(subtotalDiscountAmount) }}
          </strong>
        </div>

        <div v-if="promoDiscountAmount > 0" class="summary-row">
          <span>Total Promo</span>
          <strong class="text-error">
            - {{ formatCurrency(promoDiscountAmount) }}
          </strong>
        </div>

        <div class="summary-grand-total">
          <div class="summary-grand-label">Grand Total</div>
          <div class="summary-grand-value">
            {{ formatCurrency(grandTotal) }}
          </div>
        </div>

        <div class="section-mini-title mt-5">Pembayaran</div>

        <div class="quick-actions mb-3">
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            class="quick-action-btn"
            @click="$emit('set-exact-payment')"
          >
            Bayar Pas
          </v-btn>

          <v-btn
            variant="tonal"
            color="secondary"
            size="small"
            class="quick-action-btn"
            @click="$emit('split-evenly')"
          >
            Bagi Rata
          </v-btn>

          <v-btn
            v-if="hasCashMethod"
            variant="tonal"
            color="success"
            size="small"
            class="quick-action-btn"
            @click="$emit('sync-cash-received')"
          >
            Cash Pas
          </v-btn>
        </div>

        <div
          v-for="(pay, index) in pembayaran"
          :key="`pay-${index}`"
          class="payment-card"
        >
          <div class="payment-card-header">
            <div class="payment-card-title">Metode Bayar #{{ index + 1 }}</div>

            <v-btn
              icon
              size="small"
              variant="text"
              color="error"
              :disabled="pembayaran.length === 1"
              @click="$emit('remove-pay', index)"
            >
              <v-icon size="18">mdi-delete-outline</v-icon>
            </v-btn>
          </div>

          <div class="payment-card-grid">
            <v-select
              :model-value="pay.metode_bayar_id"
              :items="metodeList"
              item-title="nama"
              item-value="id"
              label="Metode Bayar"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="
                $emit('update-payment-field', {
                  index,
                  field: 'metode_bayar_id',
                  value: $event,
                })
              "
            />

            <v-text-field
              :model-value="pay.nominal"
              label="Nominal Dialokasikan"
              type="number"
              variant="outlined"
              density="comfortable"
              prefix="Rp"
              hide-details="auto"
              @update:model-value="
                $emit('update-payment-field', {
                  index,
                  field: 'nominal',
                  value: $event,
                })
              "
            />
          </div>
        </div>

        <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-plus"
          class="mb-4 payment-add-btn"
          @click="$emit('add-pay')"
        >
          Tambah Metode Bayar
        </v-btn>

        <v-divider class="my-4" />

        <div class="summary-row">
          <span>Total Metode Bayar</span>
          <strong>{{ formatCurrency(totalBayar) }}</strong>
        </div>

        <div class="summary-row">
          <span>Status Tagihan</span>
          <v-chip
            :color="paymentCoverageStatus.color"
            size="small"
            variant="flat"
          >
            {{ paymentCoverageStatus.text }}
          </v-chip>
        </div>

        <div class="summary-row">
          <span>Sisa Tagihan</span>
          <strong :class="sisaTagihan > 0 ? 'text-error' : 'text-success'">
            {{ formatCurrency(sisaTagihan) }}
          </strong>
        </div>

        <div v-if="hasCashMethod" class="cash-received-box mt-4">
          <div class="cash-box-title">Input Cash Diterima</div>
          <div class="cash-box-subtitle">
            Dipakai untuk hitung kembalian dari metode CASH
          </div>

          <v-row dense class="mt-2">
            <v-col cols="12">
              <v-text-field
                :model-value="cashReceived"
                label="Nominal Dibayar Customer (Cash)"
                type="number"
                variant="outlined"
                density="comfortable"
                prefix="Rp"
                hide-details="auto"
                @update:model-value="
                  $emit('update-cash-received', Number($event || 0))
                "
              />
            </v-col>

            <v-col cols="12">
              <div class="summary-row mb-2">
                <span>Nominal CASH Dialokasikan</span>
                <strong>{{ formatCurrency(cashAllocated) }}</strong>
              </div>

              <div class="summary-row mb-0">
                <span>Kembalian Cash</span>
                <strong :class="cashChange > 0 ? 'text-success' : 'text-body'">
                  {{ formatCurrency(cashChange) }}
                </strong>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-btn
          color="primary"
          size="default"
          block
          class="save-btn mt-4"
          @click="$emit('submit')"
        >
          Simpan Pembayaran
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "PembayaranSummaryCard",

  props: {
    totalPenjualan: { type: Number, default: 0 },
    totalTreatment: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    subtotalDiscountAmount: { type: Number, default: 0 },
    promoDiscountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    pembayaran: { type: Array, default: () => [] },
    metodeList: { type: Array, default: () => [] },
    totalBayar: { type: Number, default: 0 },
    sisaTagihan: { type: Number, default: 0 },
    paymentCoverageStatus: {
      type: Object,
      default: () => ({
        text: "Belum Lunas",
        color: "error",
      }),
    },
    hasCashMethod: { type: Boolean, default: false },
    cashReceived: { type: Number, default: 0 },
    cashAllocated: { type: Number, default: 0 },
    cashChange: { type: Number, default: 0 },
    formatCurrency: {
      type: Function,
      required: true,
    },
  },

  emits: [
    "add-pay",
    "remove-pay",
    "update-payment-field",
    "set-exact-payment",
    "split-evenly",
    "sync-cash-received",
    "update-cash-received",
    "submit",
  ],
};
</script>

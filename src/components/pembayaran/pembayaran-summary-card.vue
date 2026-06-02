<template>
  <v-card variant="flat" class="border">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            Ringkasan Pembayaran
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Total tagihan dan metode bayar
          </div>
        </div>
        <v-chip
          :color="paymentCoverageStatus.color"
          variant="tonal"
          size="small"
        >
          {{ paymentCoverageStatus.text }}
        </v-chip>
      </div>

      <v-card color="primary" variant="flat" class="mb-4">
        <v-card-text class="pa-5">
          <div class="d-flex align-start justify-space-between ga-4">
            <div>
              <div
                class="text-caption text-white text-uppercase font-weight-bold mb-2"
              >
                Grand Total Dibayar
              </div>
              <div class="text-h4 font-weight-black text-white">
                {{ formatMoney(safeGrandTotal) }}
              </div>
              <div class="text-body-2 text-white mt-2">
                Nominal akhir setelah diskon subtotal dan voucher/promo.
              </div>
            </div>
            <v-avatar color="white" variant="tonal" size="48">
              <v-icon icon="mdi-cash-multiple" color="white" size="28" />
            </v-avatar>
          </div>
        </v-card-text>
      </v-card>

      <v-card variant="outlined" class="mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-medium-emphasis">Produk / Obat</span>
            <strong class="text-body-2">{{
              formatMoney(safeTotalPenjualan)
            }}</strong>
          </div>
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-medium-emphasis">Treatment</span>
            <strong class="text-body-2">{{
              formatMoney(safeTotalTreatment)
            }}</strong>
          </div>
          <v-divider class="my-3" />
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-medium-emphasis">Subtotal</span>
            <strong class="text-body-2">{{ formatMoney(safeSubtotal) }}</strong>
          </div>
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-medium-emphasis"
              >Diskon Subtotal</span
            >
            <strong class="text-body-2 text-error">
              - {{ formatMoney(safeSubtotalDiscountAmount) }}
            </strong>
          </div>
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-body-2 text-medium-emphasis"
              >Voucher / Promo</span
            >
            <strong class="text-body-2 text-error">
              - {{ formatMoney(safePromoDiscountAmount) }}
            </strong>
          </div>
          <v-divider class="my-3" />
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-body-2 font-weight-bold">Grand Total</div>
              <div class="text-caption text-medium-emphasis">
                Subtotal dikurangi diskon dan promo
              </div>
            </div>
            <strong class="text-h6 font-weight-black text-primary">
              {{ formatMoney(safeGrandTotal) }}
            </strong>
          </div>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="safeGrandTotal > 0"
        color="primary"
        variant="tonal"
        density="comfortable"
        class="mb-4"
        icon="mdi-information-outline"
      >
        <div class="d-flex justify-space-between align-center ga-3 flex-wrap">
          <div>
            <div class="text-body-2 font-weight-bold">
              Nominal yang harus dibayar
            </div>
            <div class="text-caption text-medium-emphasis">
              Gunakan Bayar Pas atau Cash Pas untuk mengisi nominal otomatis.
            </div>
          </div>
          <div class="text-h6 font-weight-black text-primary">
            {{ formatMoney(safeGrandTotal) }}
          </div>
        </div>
      </v-alert>

      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <div class="text-subtitle-2 font-weight-bold">Pembayaran</div>
          <div class="text-body-2 text-medium-emphasis">
            Atur satu atau beberapa metode pembayaran
          </div>
        </div>
        <v-chip
          v-if="overPaymentAmount > 0"
          color="warning"
          variant="tonal"
          size="small"
        >
          Lebih Input
        </v-chip>
      </div>

      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-cash-check"
          :disabled="safeGrandTotal <= 0"
          @click="$emit('set-exact-payment')"
        >
          Bayar Pas
        </v-btn>

        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-call-split"
          :disabled="safeGrandTotal <= 0 || pembayaran.length <= 1"
          @click="$emit('split-evenly')"
        >
          Bagi Rata
        </v-btn>

        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-cash-sync"
          :disabled="safeGrandTotal <= 0"
          @click="$emit('sync-cash-received')"
        >
          Cash Pas
        </v-btn>
      </div>

      <v-card
        v-for="(pay, index) in pembayaran"
        :key="`pay-${index}`"
        variant="outlined"
        class="mb-3"
      >
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="34">
              <v-icon icon="mdi-credit-card-outline" size="18" />
            </v-avatar>
          </template>

          <div class="text-body-2 font-weight-bold">
            Metode Bayar #{{ index + 1 }}
          </div>

          <template #append>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              :disabled="pembayaran.length === 1"
              @click="$emit('remove-pay', index)"
            />
          </template>
        </v-card-item>

        <v-divider />

        <v-card-text class="pa-4">
          <v-select
            :model-value="pay.metode_bayar_id"
            :items="normalizedMetodeList"
            item-title="nama"
            item-value="id"
            label="Metode Bayar"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-wallet-outline"
            hide-details="auto"
            class="mb-3"
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
            prepend-inner-icon="mdi-cash"
            hide-details="auto"
            @update:model-value="
              $emit('update-payment-field', {
                index,
                field: 'nominal',
                value: Number($event || 0),
              })
            "
          />
        </v-card-text>
      </v-card>

      <v-btn
        color="primary"
        variant="outlined"
        block
        prepend-icon="mdi-plus"
        class="mb-4"
        @click="$emit('add-pay')"
      >
        Tambah Metode Bayar
      </v-btn>

      <v-card variant="outlined" class="mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-body-2 text-medium-emphasis"
              >Total Metode Bayar</span
            >
            <strong class="text-body-2">{{
              formatMoney(safeTotalBayar)
            }}</strong>
          </div>

          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-body-2 text-medium-emphasis">Status Tagihan</span>
            <v-chip
              :color="paymentCoverageStatus.color"
              variant="tonal"
              size="small"
            >
              {{ paymentCoverageStatus.text }}
            </v-chip>
          </div>

          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2 text-medium-emphasis">Sisa Tagihan</span>
            <strong
              class="text-body-2"
              :class="safeSisaTagihan > 0 ? 'text-error' : 'text-success'"
            >
              {{ formatMoney(safeSisaTagihan) }}
            </strong>
          </div>

          <template v-if="overPaymentAmount > 0">
            <v-divider class="my-3" />
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2 text-medium-emphasis">Lebih Bayar</span>
              <strong class="text-body-2 text-warning">
                {{ formatMoney(overPaymentAmount) }}
              </strong>
            </div>
          </template>
        </v-card-text>
      </v-card>

      <v-card v-if="hasCashMethod" variant="outlined" class="mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-start ga-3 mb-3">
            <v-avatar color="primary" variant="tonal" size="36">
              <v-icon icon="mdi-cash-register" size="20" />
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold">
                Input Cash Diterima
              </div>
              <div class="text-caption text-medium-emphasis">
                Dipakai untuk hitung kembalian dari metode CASH
              </div>
            </div>
          </div>

          <v-text-field
            :model-value="cashReceived"
            label="Nominal Dibayar Customer (Cash)"
            type="number"
            variant="outlined"
            density="comfortable"
            prefix="Rp"
            hide-details="auto"
            prepend-inner-icon="mdi-cash-plus"
            @update:model-value="
              $emit('update-cash-received', Number($event || 0))
            "
          />

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-body-2 text-medium-emphasis"
              >Nominal CASH Dialokasikan</span
            >
            <strong class="text-body-2">{{
              formatMoney(cashAllocated)
            }}</strong>
          </div>

          <div class="d-flex justify-space-between align-center">
            <span class="text-body-2 text-medium-emphasis">Kembalian Cash</span>
            <strong
              class="text-body-2"
              :class="cashChange > 0 ? 'text-success' : 'text-medium-emphasis'"
            >
              {{ formatMoney(cashChange) }}
            </strong>
          </div>
        </v-card-text>
      </v-card>

      <v-btn
        color="primary"
        variant="outlined"
        block
        size="large"
        prepend-icon="mdi-content-save-check-outline"
        :loading="loadingSubmit"
        :disabled="safeGrandTotal <= 0 || safeSisaTagihan > 0 || loadingSubmit"
        @click="$emit('submit')"
      >
        Simpan Pembayaran
      </v-btn>
    </v-card-text>
  </v-card>
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
      default: () => ({ text: "Belum Lunas", color: "error" }),
    },
    hasCashMethod: { type: Boolean, default: false },
    cashReceived: { type: Number, default: 0 },
    cashAllocated: { type: Number, default: 0 },
    cashChange: { type: Number, default: 0 },
    loadingSubmit: { type: Boolean, default: false },
    formatCurrency: { type: Function, default: null },
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
  computed: {
    normalizedMetodeList() {
      return this.metodeList.map((item) => ({
        id: item.id,
        nama:
          item.nama ||
          item.nama_metode ||
          item.nama_metode_bayar ||
          item.nama_akun ||
          item.label ||
          "-",
      }));
    },
    safeTotalPenjualan() {
      return Number(this.totalPenjualan || 0);
    },
    safeTotalTreatment() {
      return Number(this.totalTreatment || 0);
    },
    safeSubtotal() {
      return Number(this.subtotal || 0);
    },
    safeSubtotalDiscountAmount() {
      return Number(this.subtotalDiscountAmount || 0);
    },
    safePromoDiscountAmount() {
      return Number(this.promoDiscountAmount || 0);
    },
    safeGrandTotal() {
      return Number(this.grandTotal || 0);
    },
    safeTotalBayar() {
      return Number(this.totalBayar || 0);
    },
    safeSisaTagihan() {
      return Number(this.sisaTagihan || 0);
    },
    overPaymentAmount() {
      return Math.max(this.safeTotalBayar - this.safeGrandTotal, 0);
    },
  },
  methods: {
    formatMoney(value) {
      if (this.formatCurrency) {
        return this.formatCurrency(Number(value || 0));
      }
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },
  },
};
</script>

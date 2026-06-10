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
          :color="displayPaymentCoverageStatus.color"
          variant="tonal"
          size="small"
        >
          {{ displayPaymentCoverageStatus.text }}
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

      <v-card
        v-if="
          hasMemberInfo || safeMemberDiscountAmount > 0 || safePointEarned > 0
        "
        variant="outlined"
        class="mb-4"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-start ga-3">
            <v-avatar color="success" variant="tonal" size="36">
              <v-icon icon="mdi-card-account-details-star-outline" size="20" />
            </v-avatar>
            <div class="flex-grow-1 min-w-0">
              <div
                class="d-flex align-center justify-space-between ga-3 flex-wrap"
              >
                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    Member & Poin
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ memberLabel }}
                  </div>
                </div>
                <v-chip
                  v-if="safePointEarned > 0"
                  color="success"
                  variant="tonal"
                  size="small"
                >
                  +{{ safePointEarned }} poin
                </v-chip>
              </div>

              <v-divider class="my-3" />

              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2 text-medium-emphasis"
                  >Diskon Member</span
                >
                <strong
                  class="text-body-2"
                  :class="
                    safeMemberDiscountAmount > 0
                      ? 'text-error'
                      : 'text-medium-emphasis'
                  "
                >
                  - {{ formatMoney(safeMemberDiscountAmount) }}
                </strong>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-2 text-medium-emphasis"
                  >Poin Didapat</span
                >
                <strong class="text-body-2 text-success">
                  {{ safePointEarned }} poin
                </strong>
              </div>
            </div>
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
          <div
            v-if="hasKonsultasi || safeTotalKonsultasi > 0"
            class="d-flex justify-space-between align-center mb-2"
          >
            <span class="text-body-2 text-medium-emphasis">Konsultasi</span>
            <strong
              class="text-body-2"
              :class="safeTotalKonsultasi <= 0 ? 'text-success' : ''"
            >
              {{ formatMoney(safeTotalKonsultasi) }}
            </strong>
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
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-medium-emphasis"
              >Voucher / Promo</span
            >
            <strong class="text-body-2 text-error">
              - {{ formatMoney(safePromoDiscountAmount) }}
            </strong>
          </div>
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-body-2 text-medium-emphasis">Diskon Member</span>
            <strong class="text-body-2 text-error">
              - {{ formatMoney(safeMemberDiscountAmount) }}
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

      <div class="d-flex flex-wrap ga-2 mb-4 payment-action-bar">
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-cash-check"
          class="text-none font-weight-bold payment-quick-btn"
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
          class="text-none font-weight-bold payment-quick-btn"
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
          class="text-none font-weight-bold payment-quick-btn"
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
        class="mb-3 payment-method-card"
        :class="{
          'payment-method-card--cash': isCashRow(pay),
          'payment-method-card--filled': Number(pay.nominal || 0) > 0,
        }"
      >
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar
              :color="isCashRow(pay) ? 'success' : 'primary'"
              variant="tonal"
              size="34"
              class="payment-method-avatar"
            >
              <v-icon
                :icon="
                  isCashRow(pay)
                    ? 'mdi-cash-register'
                    : 'mdi-credit-card-outline'
                "
                size="18"
              />
            </v-avatar>
          </template>

          <div>
            <div class="text-body-2 font-weight-bold">
              Metode Bayar #{{ index + 1 }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ pay.metode_bayar_nama || "Pilih metode pembayaran" }}
            </div>
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

      <v-card variant="outlined" class="mb-4 payment-total-card">
        <v-card-text class="pa-4">
          <div
            class="d-flex justify-space-between align-center mb-3 payment-total-row"
          >
            <span class="text-body-2 text-medium-emphasis"
              >Total Metode Bayar</span
            >
            <strong class="payment-total-amount">{{
              formatMoney(safeTotalBayar)
            }}</strong>
          </div>

          <div
            class="d-flex justify-space-between align-center mb-3 payment-total-row"
          >
            <span class="text-body-2 text-medium-emphasis">Status Tagihan</span>
            <v-chip
              :color="displayPaymentCoverageStatus.color"
              variant="tonal"
              size="small"
              class="payment-status-chip"
            >
              {{ displayPaymentCoverageStatus.text }}
            </v-chip>
          </div>

          <div
            class="d-flex justify-space-between align-center payment-total-row"
          >
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
    totalPenjualan: { type: [Number, String], default: 0 },
    totalTreatment: { type: [Number, String], default: 0 },
    totalKonsultasi: { type: [Number, String], default: 0 },
    hasKonsultasi: { type: Boolean, default: false },
    subtotal: { type: [Number, String], default: 0 },
    subtotalDiscountAmount: { type: [Number, String], default: 0 },
    promoDiscountAmount: { type: [Number, String], default: 0 },
    memberId: { type: [Number, String], default: null },
    memberNo: { type: String, default: "" },
    memberTierNama: { type: String, default: "" },
    memberDiscountAmount: { type: [Number, String], default: 0 },
    pointEarned: { type: [Number, String], default: 0 },
    poin: { type: [Number, String], default: 0 },
    grandTotal: { type: [Number, String], default: 0 },
    invoiceSummary: {
      type: Object,
      default: () => ({}),
    },
    pembayaran: { type: Array, default: () => [] },
    metodeList: { type: Array, default: () => [] },
    totalBayar: { type: [Number, String], default: 0 },
    sisaTagihan: { type: [Number, String], default: 0 },
    paymentCoverageStatus: {
      type: Object,
      default: () => ({ text: "Belum Lunas", color: "error" }),
    },
    hasCashMethod: { type: Boolean, default: false },
    cashReceived: { type: [Number, String], default: 0 },
    cashAllocated: { type: [Number, String], default: 0 },
    cashChange: { type: [Number, String], default: 0 },
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
    invoiceSummaryData() {
      return this.invoiceSummary && typeof this.invoiceSummary === "object"
        ? this.invoiceSummary
        : {};
    },
    useInvoiceSummaryFallback() {
      const liveSubtotal = this.toAmount(this.subtotal);
      const liveGrandTotal = this.toAmount(this.grandTotal);
      const invoiceSubtotal = this.getInvoiceAmount(
        "subtotal",
        "subtotal_tagihan",
      );
      const invoiceGrandTotal = this.getInvoiceAmount(
        "grand_total",
        "total_tagihan",
        "total_pembayaran",
      );

      return (
        liveSubtotal <= 0 &&
        liveGrandTotal <= 0 &&
        (invoiceSubtotal > 0 || invoiceGrandTotal > 0)
      );
    },
    safeTotalPenjualan() {
      if (this.useInvoiceSummaryFallback) {
        return this.getInvoiceAmount("subtotal_produk", "subtotal_obat");
      }

      return this.toAmount(this.totalPenjualan);
    },
    safeTotalTreatment() {
      if (this.useInvoiceSummaryFallback) {
        return this.getInvoiceAmount("subtotal_treatment");
      }

      return this.toAmount(this.totalTreatment);
    },
    safeTotalKonsultasi() {
      if (this.useInvoiceSummaryFallback) {
        return this.getInvoiceAmount("subtotal_konsultasi");
      }

      return this.toAmount(this.totalKonsultasi);
    },
    safeSubtotal() {
      if (this.useInvoiceSummaryFallback) {
        const invoiceSubtotal = this.getInvoiceAmount("subtotal");

        if (invoiceSubtotal > 0) {
          return invoiceSubtotal;
        }

        return (
          this.safeTotalPenjualan +
          this.safeTotalTreatment +
          this.safeTotalKonsultasi
        );
      }

      return this.toAmount(this.subtotal);
    },
    safeSubtotalDiscountAmount() {
      if (this.useInvoiceSummaryFallback) {
        return this.getInvoiceAmount(
          "diskon_subtotal",
          "diskon_subtotal_amount",
        );
      }

      return this.toAmount(this.subtotalDiscountAmount);
    },
    safePromoDiscountAmount() {
      if (this.useInvoiceSummaryFallback) {
        return this.getInvoiceAmount("diskon_promo", "total_promo");
      }

      return this.toAmount(this.promoDiscountAmount);
    },
    safeMemberDiscountAmount() {
      if (this.useInvoiceSummaryFallback) {
        return this.getInvoiceAmount("diskon_member_amount");
      }

      return this.toAmount(this.memberDiscountAmount);
    },
    safePointEarned() {
      return this.toAmount(this.pointEarned);
    },
    hasMemberInfo() {
      return Boolean(this.memberId || this.memberNo || this.memberTierNama);
    },
    memberLabel() {
      if (!this.hasMemberInfo) {
        return "Pasien belum terdeteksi sebagai member aktif";
      }

      const tier = this.memberTierNama ? ` • ${this.memberTierNama}` : "";
      return `${this.memberNo || "Member aktif"}${tier}`;
    },
    safeGrandTotal() {
      if (this.useInvoiceSummaryFallback) {
        const invoiceGrandTotal = this.getInvoiceAmount(
          "grand_total",
          "total_tagihan",
          "total_pembayaran",
        );

        if (invoiceGrandTotal > 0) {
          return invoiceGrandTotal;
        }

        return Math.max(
          this.safeSubtotal -
            this.safeSubtotalDiscountAmount -
            this.safePromoDiscountAmount -
            this.safeMemberDiscountAmount,
          0,
        );
      }

      return this.toAmount(this.grandTotal);
    },
    safeTotalBayar() {
      const liveTotalBayar = this.toAmount(this.totalBayar);

      if (liveTotalBayar > 0 || !this.useInvoiceSummaryFallback) {
        return liveTotalBayar;
      }

      return this.getInvoiceAmount("total_bayar");
    },
    safeSisaTagihan() {
      return Math.max(this.safeGrandTotal - this.safeTotalBayar, 0);
    },
    displayPaymentCoverageStatus() {
      if (this.safeTotalBayar < this.safeGrandTotal) {
        return { text: "Belum Lunas", color: "error" };
      }

      if (this.safeTotalBayar === this.safeGrandTotal) {
        return { text: "Pas", color: "success" };
      }

      return { text: "Lebih Input", color: "warning" };
    },
    overPaymentAmount() {
      return Math.max(this.safeTotalBayar - this.safeGrandTotal, 0);
    },
  },
  methods: {
    toAmount(value) {
      if (value === null || value === undefined || value === "") {
        return 0;
      }

      if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
      }

      let text = String(value)
        .trim()
        .replace(/[^\d,.-]/g, "");

      if (!text) {
        return 0;
      }

      const hasComma = text.includes(",");
      const hasDot = text.includes(".");

      if (hasComma && hasDot) {
        if (text.lastIndexOf(",") > text.lastIndexOf(".")) {
          text = text.replace(/\./g, "").replace(",", ".");
        } else {
          text = text.replace(/,/g, "");
        }
      } else if (hasComma) {
        text = text.replace(",", ".");
      } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(text)) {
        text = text.replace(/\./g, "");
      }

      const amount = Number(text);
      return Number.isFinite(amount) ? amount : 0;
    },
    getInvoiceAmount(...keys) {
      for (const key of keys) {
        const value = this.invoiceSummaryData?.[key];

        if (value !== undefined && value !== null && value !== "") {
          return this.toAmount(value);
        }
      }

      return 0;
    },
    isCashRow(item) {
      const text = [
        item?.metode_bayar_nama,
        item?.nama,
        item?.nama_metode,
        item?.nama_metode_bayar,
        item?.nama_akun,
        item?.label,
        item?.kode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes("cash") || text.includes("tunai");
    },
    formatMoney(value) {
      if (this.formatCurrency) {
        return this.formatCurrency(this.toAmount(value));
      }
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(this.toAmount(value));
    },
  },
};
</script>

<style scoped>
.payment-action-bar {
  padding: 10px;
  border: 1px solid rgba(25, 118, 210, 0.16);
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.payment-quick-btn {
  min-height: 32px;
  letter-spacing: 0 !important;
}

.payment-method-card {
  border-color: #d7e3f3 !important;
  border-radius: 12px !important;
  background: #ffffff;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.payment-method-card--filled {
  border-color: #b8d3f6 !important;
  background: #fbfdff;
}

.payment-method-card--cash {
  border-color: #1976d2 !important;
  background: #f5fbff;
  box-shadow: 0 8px 18px rgba(25, 118, 210, 0.12) !important;
}

.payment-method-avatar {
  box-shadow: inset 0 0 0 1px rgba(25, 118, 210, 0.08);
}

.payment-total-card {
  border-color: #aecaed !important;
  border-radius: 12px !important;
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
}

.payment-total-row {
  min-height: 30px;
}

.payment-total-amount {
  color: #111827;
  font-size: 15px;
  font-weight: 800;
}

.payment-status-chip {
  font-weight: 800;
}
</style>

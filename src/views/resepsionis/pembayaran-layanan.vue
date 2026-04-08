<template>
  <div class="payment-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Pembayaran Kasir</h1>
        <p class="page-subtitle">
          Input transaksi lebih cepat, promo bisa multi pilih, dan pembayaran
          lebih jelas
        </p>
      </div>
      <v-breadcrumbs :items="breadcrumbs" divider="/" class="pa-0" />
    </div>
    <v-row align="start" class="mt-1">
      <!-- LEFT -->
      <v-col cols="12" lg="8">
        <!-- HEADER TRANSAKSI -->
        <v-card rounded="xl" elevation="2" class="mb-4">
          <v-card-text class="pa-5">
            <div class="section-header mb-4">
              <div>
                <div class="section-title">Informasi Transaksi</div>
                <div class="section-subtitle">
                  Isi data inti transaksi terlebih dahulu
                </div>
              </div>
            </div>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="header.tanggal"
                  label="Tanggal"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="header.pasien"
                  :items="pasienList"
                  label="Pasien"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-search"
                  hide-details="auto"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="header.dokter"
                  :items="dokterList"
                  label="Dokter"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-stethoscope"
                  hide-details="auto"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model.number="header.poin"
                  label="Poin"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-star-circle-outline"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="header.jenis_transaksi"
                  :items="jenisList"
                  label="Kategori Transaksi"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="header.sumber"
                  :items="sumberList"
                  label="Sumber Kedatangan"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  class="action-main-btn"
                >
                  Perbarui Data Pasien
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="header.catatan"
                  label="Catatan Tambahan"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-note-text-outline"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <!-- OBAT -->
        <v-card rounded="xl" elevation="2" class="mb-4">
          <v-card-text class="pa-5">
            <div class="section-header">
              <div>
                <div class="section-title">Obat</div>
                <div class="section-subtitle">
                  Tambahkan produk yang dibeli pasien
                </div>
              </div>
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                @click="addPenjualanItem"
              >
                Tambah Obat
              </v-btn>
            </div>
            <div
              v-for="(item, index) in penjualanItems"
              :key="'obat-' + index"
              class="entry-card"
            >
              <div class="entry-card-header">
                <div class="entry-card-title">Obat #{{ index + 1 }}</div>
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  @click="removePenjualanItem(index)"
                  :disabled="penjualanItems.length === 1"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </div>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="item.nama"
                    :items="obatList"
                    item-title="title"
                    item-value="title"
                    label="Nama Obat"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-pill"
                    hide-details="auto"
                    clearable
                    @update:modelValue="fillObat(index)"
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="item.qty"
                    label="Qty"
                    type="number"
                    min="1"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field
                    v-model="item.unit"
                    label="Unit"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field
                    v-model.number="item.harga"
                    label="Harga"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prefix="Rp"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <div class="field-label">Diskon</div>
                  <div class="split-field">
                    <v-select
                      v-model="item.diskon_type"
                      :items="diskonTypeList"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                    <v-text-field
                      v-model.number="item.diskon"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="item.referral"
                    label="Diskon Referral"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prefix="Rp"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    :model-value="formatCurrency(getPenjualanSubtotal(item))"
                    label="Subtotal"
                    readonly
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="item.frekuensi"
                    :items="frekuensiList"
                    label="Frekuensi"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="item.waktu_pakai"
                    :items="waktuPakaiList"
                    label="Waktu Pakai"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="item.penggunaan"
                    label="Instruksi Pemakaian"
                    rows="2"
                    auto-grow
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
        <!-- TREATMENT -->
        <v-card rounded="xl" elevation="2" class="mb-4">
          <v-card-text class="pa-5">
            <div class="section-header">
              <div>
                <div class="section-title">Treatment</div>
                <div class="section-subtitle">
                  Tambahkan tindakan yang dilakukan ke pasien
                </div>
              </div>
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                @click="addTreatmentItem"
              >
                Tambah Treatment
              </v-btn>
            </div>
            <div
              v-for="(item, index) in treatmentItems"
              :key="'treatment-' + index"
              class="entry-card"
            >
              <div class="entry-card-header">
                <div class="entry-card-title">Treatment #{{ index + 1 }}</div>
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  @click="removeTreatmentItem(index)"
                  :disabled="treatmentItems.length === 1"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </div>
              <v-row dense>
                <v-col cols="12" md="5">
                  <v-autocomplete
                    v-model="item.nama"
                    :items="tindakanList"
                    item-title="title"
                    item-value="title"
                    label="Nama Treatment"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-medical-bag"
                    hide-details="auto"
                    clearable
                    @update:modelValue="fillTreatment(index)"
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="item.qty"
                    label="Qty"
                    type="number"
                    min="1"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6" md="5">
                  <v-select
                    v-model="item.beautician"
                    :items="perawatList"
                    label="Beautician / Perawat"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="item.harga"
                    label="Harga"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prefix="Rp"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <div class="field-label">Diskon</div>
                  <div class="split-field">
                    <v-select
                      v-model="item.diskon_type"
                      :items="diskonTypeList"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                    <v-text-field
                      v-model.number="item.diskon"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="item.referral"
                    label="Diskon Referral"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prefix="Rp"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    :model-value="formatCurrency(getTreatmentSubtotal(item))"
                    label="Subtotal"
                    readonly
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
        <!-- PROMO -->
        <v-card rounded="xl" elevation="2" class="mb-4">
          <v-card-text class="pa-5">
            <div class="section-header mb-4">
              <div>
                <div class="section-title">Voucher & Promo</div>
                <div class="section-subtitle">
                  Bisa pilih lebih dari 1 voucher / promo
                </div>
              </div>
            </div>
            <div class="promo-trigger" @click="promoDrawer = true">
              <div class="promo-icon-wrap">
                <v-icon size="28">mdi-ticket-percent-outline</v-icon>
              </div>
              <div class="promo-copy">
                <div class="promo-title">Pilih Voucher / Promo</div>
                <div class="promo-subtitle">
                  Buka daftar promo atau masukkan kode promo
                </div>
              </div>
              <div class="promo-arrow"><v-icon>mdi-chevron-right</v-icon></div>
            </div>
            <div v-if="appliedPromos.length" class="selected-promo-wrap mt-4">
              <div class="selected-promo-title">Promo yang dipilih</div>
              <div class="selected-promo-list">
                <div
                  v-for="(promo, index) in appliedPromos"
                  :key="promo.id"
                  class="selected-promo-card"
                >
                  <div class="selected-promo-content">
                    <div class="selected-promo-name">{{ promo.nama }}</div>
                    <div class="selected-promo-desc">
                      {{ promo.mode }} {{ format(promo.value) }} • Potongan:
                      {{ formatCurrency(getPromoAmount(promo)) }}
                    </div>
                  </div>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="removeAppliedPromo(index)"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
            <v-row dense class="mt-4">
              <v-col cols="12" md="4">
                <v-select
                  v-model="diskonSubtotal.type"
                  :items="diskonTypeList"
                  label="Tipe Diskon Subtotal"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model.number="diskonSubtotal.value"
                  label="Nilai Diskon Subtotal"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  :prefix="diskonSubtotal.type === 'Rp' ? 'Rp' : ''"
                  :suffix="diskonSubtotal.type === '%' ? '%' : ''"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- RIGHT -->
      <v-col cols="12" lg="4">
        <div class="summary-sticky">
          <v-card rounded="xl" elevation="2" class="mb-4">
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
              <div class="summary-row" v-if="appliedPromos.length">
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
                  @click="setExactPayment"
                >
                  Bayar Pas
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="secondary"
                  size="small"
                  @click="splitEvenly"
                >
                  Bagi Rata
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="success"
                  size="small"
                  @click="syncCashReceived"
                  v-if="hasCashMethod"
                >
                  Cash Pas
                </v-btn>
              </div>
              <div
                v-for="(pay, index) in pembayaran"
                :key="'pay-' + index"
                class="payment-card"
              >
                <div class="payment-card-header">
                  <div class="payment-card-title">
                    Metode Bayar #{{ index + 1 }}
                  </div>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="removePay(index)"
                    :disabled="pembayaran.length === 1"
                  >
                    <v-icon size="18">mdi-delete-outline</v-icon>
                  </v-btn>
                </div>
                <div class="payment-card-grid">
                  <v-select
                    v-model="pay.metode"
                    :items="metodeList"
                    label="Metode Bayar"
                    variant="solo-filled"
                    density="comfortable"
                    hide-details="auto"
                  />
                  <v-text-field
                    v-model.number="pay.nominal"
                    label="Nominal Dialokasikan"
                    type="number"
                    variant="solo-filled"
                    density="comfortable"
                    prefix="Rp"
                    hide-details="auto"
                  />
                </div>
              </div>
              <v-btn
                block
                variant="outlined"
                prepend-icon="mdi-plus"
                class="mb-4"
                @click="addPay"
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
                <strong
                  :class="sisaTagihan > 0 ? 'text-error' : 'text-success'"
                >
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
                      v-model.number="cashReceived"
                      label="Nominal Dibayar Customer (Cash)"
                      type="number"
                      variant="solo-filled"
                      density="comfortable"
                      prefix="Rp"
                      hide-details="auto"
                    />
                  </v-col>
                  <v-col cols="12">
                    <div class="summary-row mb-2">
                      <span>Nominal CASH Dialokasikan</span>
                      <strong>{{ formatCurrency(cashAllocated) }}</strong>
                    </div>
                    <div class="summary-row mb-0">
                      <span>Kembalian Cash</span>
                      <strong
                        :class="cashChange > 0 ? 'text-success' : 'text-body'"
                      >
                        {{ formatCurrency(cashChange) }}
                      </strong>
                    </div>
                  </v-col>
                </v-row>
              </div>
              <v-btn
                color="error"
                size="large"
                block
                class="save-btn mt-4"
                @click="submit"
              >
                Simpan Pembayaran
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
    <!-- PROMO DRAWER -->
    <v-navigation-drawer
      v-model="promoDrawer"
      location="right"
      temporary
      width="460"
      class="promo-drawer"
    >
      <div class="promo-drawer-header">
        <div class="promo-drawer-title">Pilih Voucher / Promo</div>
        <div class="promo-drawer-actions">
          <v-btn variant="text" color="error" @click="resetPromo">
            Reset Semua
          </v-btn>
          <v-btn icon variant="text" @click="promoDrawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="promo-drawer-body">
        <div class="promo-code-row">
          <v-text-field
            v-model="promoCode"
            placeholder="Masukkan kode promo"
            label="Kode Promo"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <v-btn color="success" variant="flat" @click="applyPromoCode">
            Terapkan
          </v-btn>
        </div>
        <div class="promo-group">
          <div class="promo-group-title">Promo Treatment</div>
          <div
            class="promo-card"
            :class="{ selected: isPromoSelected(promo) }"
            v-for="promo in promoTreatmentList"
            :key="promo.id"
          >
            <div class="promo-card-title">{{ promo.nama }}</div>
            <div class="promo-card-desc">{{ promo.desc }}</div>
            <div class="promo-card-quota">Sisa Kuota: {{ promo.kuota }}</div>
            <div class="promo-card-action">
              <v-btn
                :color="isPromoSelected(promo) ? 'error' : 'success'"
                variant="flat"
                size="small"
                @click="togglePromo(promo)"
              >
                {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
              </v-btn>
            </div>
          </div>
        </div>
        <div class="promo-group">
          <div class="promo-group-title">Promo Product</div>
          <div
            class="promo-card"
            :class="{ selected: isPromoSelected(promo) }"
            v-for="promo in promoProductList"
            :key="promo.id"
          >
            <div class="promo-card-title">{{ promo.nama }}</div>
            <div class="promo-card-desc">{{ promo.desc }}</div>
            <div class="promo-card-quota">Sisa Kuota: {{ promo.kuota }}</div>
            <div class="promo-card-action">
              <v-btn
                :color="isPromoSelected(promo) ? 'error' : 'success'"
                variant="flat"
                size="small"
                @click="togglePromo(promo)"
              >
                {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
              </v-btn>
            </div>
          </div>
        </div>
        <div class="promo-group">
          <div class="promo-group-title">Promo Value</div>
          <div class="promo-note">
            Voucher/promo sekarang bisa dipilih lebih dari satu. Aturan stacking
            bisa Anda sesuaikan lagi jika ada rule bisnis tertentu.
          </div>
          <div
            class="promo-card"
            :class="{ selected: isPromoSelected(promo) }"
            v-for="promo in promoValueList"
            :key="promo.id"
          >
            <div class="promo-card-title">{{ promo.nama }}</div>
            <div class="promo-card-desc">{{ promo.desc }}</div>
            <div class="promo-card-quota">Sisa Kuota: {{ promo.kuota }}</div>
            <div class="promo-card-action">
              <v-btn
                :color="isPromoSelected(promo) ? 'error' : 'success'"
                variant="flat"
                size="small"
                @click="togglePromo(promo)"
              >
                {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-navigation-drawer>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>
<script>
function createPenjualanItem() {
  return {
    nama: null,
    harga: 0,
    qty: 1,
    unit: "pcs",
    diskon_type: "%",
    diskon: 0,
    referral: 0,
    frekuensi: "",
    waktu_pakai: "",
    penggunaan: "",
  };
}
function createTreatmentItem() {
  return {
    nama: null,
    qty: 1,
    beautician: null,
    harga: 0,
    diskon_type: "%",
    diskon: 0,
    referral: 0,
  };
}
function createPaymentItem() {
  return { metode: "CASH", nominal: 0 };
}
export default {
  name: "PembayaranKasirPage",
  data() {
    return {
      promoDrawer: false,
      promoCode: "",
      cashReceived: 0,
      breadcrumbs: [
        { title: "Kasir", disabled: true },
        { title: "Pembayaran", disabled: true },
      ],
      header: {
        tanggal: new Date().toISOString().slice(0, 10),
        pasien: "CICI YUGESTI",
        dokter: null,
        poin: 0,
        jenis_transaksi: "Umum",
        catatan: "",
        sumber: "Pelanggan Lama",
      },
      penjualanItems: [createPenjualanItem()],
      treatmentItems: [
        {
          nama: "KELOID INJECTION",
          qty: 1,
          beautician: "YULINA TANTRINI",
          harga: 350000,
          diskon_type: "%",
          diskon: 0,
          referral: 0,
        },
      ],
      diskonSubtotal: { type: "%", value: 0 },
      pembayaran: [
        { metode: "CASH", nominal: 0 },
        { metode: "QR BCA", nominal: 0 },
      ],
      pasienList: ["CICI YUGESTI", "BUDI SANTOSO", "SITI AMINAH"],
      dokterList: ["dr. Andi", "dr. Bunga", "dr. Candra"],
      perawatList: ["YULINA TANTRINI", "RINA", "TIKA"],
      tindakanList: [
        { title: "KELOID INJECTION", harga: 350000 },
        { title: "FACIAL ACNE", harga: 150000 },
        { title: "LASER BRIGHT", harga: 500000 },
      ],
      obatList: [
        { title: "CREAM SIANG", harga: 120000, unit: "pcs" },
        { title: "CREAM MALAM", harga: 135000, unit: "pcs" },
        { title: "FACIAL WASH", harga: 75000, unit: "pcs" },
      ],
      jenisList: ["Umum", "Member", "Referral", "Owner", "Endorse"],
      sumberList: ["Pelanggan Lama", "Pelanggan Baru", "Instagram", "Referral"],
      metodeList: ["CASH", "QR BCA", "TRANSFER", "DEBIT", "QRIS"],
      diskonTypeList: ["%", "Rp"],
      frekuensiList: ["1x sehari", "2x sehari", "3x sehari"],
      waktuPakaiList: ["Pagi", "Siang", "Malam"],
      promoTreatmentList: [
        {
          id: 1,
          kode: "SHOPEE100",
          nama: "TRIAL PENGAMBILAN TREATMENT SHOPEE",
          desc: "100% Maks. Rp. 999,999,999",
          kuota: "Tidak Terbatas",
          value: 100,
          mode: "%",
        },
        {
          id: 2,
          kode: "KARYAWAN100",
          nama: "VOUCHER FASILITAS KARYAWAN",
          desc: "100% Maks. Rp. 99,999,999",
          kuota: "Tidak Terbatas",
          value: 100,
          mode: "%",
        },
      ],
      promoProductList: [
        {
          id: 3,
          kode: "PRODUCT10",
          nama: "PROMO PRODUCT 10%",
          desc: "Diskon product 10%",
          kuota: "58",
          value: 10,
          mode: "%",
        },
      ],
      promoValueList: [
        {
          id: 4,
          kode: "VITHAA5",
          nama: "EXTRA DISC 5% KOL VITHAA",
          desc: "5% Maks. Rp. 9,999,999 - Bisa digabung promo berjalan",
          kuota: "Tidak Terbatas",
          value: 5,
          mode: "%",
        },
      ],
      appliedPromos: [],
      snackbar: { show: false, text: "", color: "success" },
    };
  },
  computed: {
    totalPenjualan() {
      return this.penjualanItems.reduce(
        (sum, item) => sum + this.getPenjualanSubtotal(item),
        0,
      );
    },
    totalTreatment() {
      return this.treatmentItems.reduce(
        (sum, item) => sum + this.getTreatmentSubtotal(item),
        0,
      );
    },
    subtotal() {
      return this.totalPenjualan + this.totalTreatment;
    },
    subtotalDiscountAmount() {
      const value = Number(this.diskonSubtotal.value || 0);
      if (this.diskonSubtotal.type === "%") {
        return (this.subtotal * value) / 100;
      }
      return value;
    },
    promoBaseAmount() {
      return Math.max(this.subtotal - this.subtotalDiscountAmount, 0);
    },
    promoDiscountAmount() {
      const total = this.appliedPromos.reduce(
        (sum, promo) => sum + this.getPromoAmount(promo),
        0,
      );
      return Math.min(total, this.promoBaseAmount);
    },
    grandTotal() {
      return Math.max(
        this.subtotal - this.subtotalDiscountAmount - this.promoDiscountAmount,
        0,
      );
    },
    totalBayar() {
      return this.pembayaran.reduce(
        (sum, item) => sum + Number(item.nominal || 0),
        0,
      );
    },
    sisaTagihan() {
      return Math.max(this.grandTotal - this.totalBayar, 0);
    },
    hasCashMethod() {
      return this.pembayaran.some((item) => item.metode === "CASH");
    },
    cashAllocated() {
      return this.pembayaran
        .filter((item) => item.metode === "CASH")
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);
    },
    cashChange() {
      return Math.max(Number(this.cashReceived || 0) - this.cashAllocated, 0);
    },
    paymentCoverageStatus() {
      if (this.totalBayar < this.grandTotal) {
        return { text: "Belum Lunas", color: "error" };
      }
      if (this.totalBayar === this.grandTotal) {
        return { text: "Pas", color: "success" };
      }
      return { text: "Lebih Input", color: "warning" };
    },
    allPromoList() {
      return [
        ...this.promoTreatmentList,
        ...this.promoProductList,
        ...this.promoValueList,
      ];
    },
  },
  methods: {
    format(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },
    formatCurrency(value) {
      return `Rp ${this.format(value)}`;
    },
    getDiskonAmount(base, type, value) {
      const numericBase = Number(base || 0);
      const numericValue = Number(value || 0);
      if (type === "%") {
        return (numericBase * numericValue) / 100;
      }
      return numericValue;
    },
    getPromoAmount(promo) {
      if (!promo) return 0;
      const base = Number(this.promoBaseAmount || 0);
      if (promo.mode === "%") {
        return (base * Number(promo.value || 0)) / 100;
      }
      return Number(promo.value || 0);
    },
    isPromoSelected(promo) {
      return this.appliedPromos.some((item) => item.id === promo.id);
    },
    togglePromo(promo) {
      const exists = this.appliedPromos.find((item) => item.id === promo.id);
      if (exists) {
        this.appliedPromos = this.appliedPromos.filter(
          (item) => item.id !== promo.id,
        );
        this.snackbar = {
          show: true,
          text: `Promo "${promo.nama}" dibatalkan`,
          color: "info",
        };
        return;
      }
      this.appliedPromos.push({ ...promo });
      this.snackbar = {
        show: true,
        text: `Promo "${promo.nama}" ditambahkan`,
        color: "success",
      };
    },
    removeAppliedPromo(index) {
      this.appliedPromos.splice(index, 1);
    },
    getPenjualanSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.qty || 0);
      const diskon = this.getDiskonAmount(base, item.diskon_type, item.diskon);
      const referral = Number(item.referral || 0);
      return Math.max(base - diskon - referral, 0);
    },
    getTreatmentSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.qty || 0);
      const diskon = this.getDiskonAmount(base, item.diskon_type, item.diskon);
      const referral = Number(item.referral || 0);
      return Math.max(base - diskon - referral, 0);
    },
    fillObat(index) {
      const selected = this.obatList.find(
        (x) => x.title === this.penjualanItems[index].nama,
      );
      if (!selected) return;
      this.penjualanItems[index].harga = selected.harga;
      this.penjualanItems[index].unit = selected.unit;
    },
    fillTreatment(index) {
      const selected = this.tindakanList.find(
        (x) => x.title === this.treatmentItems[index].nama,
      );
      if (!selected) return;
      this.treatmentItems[index].harga = selected.harga;
    },
    addPenjualanItem() {
      this.penjualanItems.push(createPenjualanItem());
    },
    removePenjualanItem(index) {
      if (this.penjualanItems.length === 1) return;
      this.penjualanItems.splice(index, 1);
    },
    addTreatmentItem() {
      this.treatmentItems.push(createTreatmentItem());
    },
    removeTreatmentItem(index) {
      if (this.treatmentItems.length === 1) return;
      this.treatmentItems.splice(index, 1);
    },
    addPay() {
      this.pembayaran.push(createPaymentItem());
    },
    removePay(index) {
      if (this.pembayaran.length === 1) return;
      this.pembayaran.splice(index, 1);
    },
    setExactPayment() {
      if (!this.pembayaran.length) {
        this.pembayaran.push(createPaymentItem());
      }
      this.pembayaran = this.pembayaran.map((item, index) => ({
        ...item,
        nominal: index === 0 ? this.grandTotal : 0,
      }));
      if (this.pembayaran[0]?.metode === "CASH") {
        this.cashReceived = this.grandTotal;
      }
      this.snackbar = {
        show: true,
        text: "Pembayaran diset pas sesuai grand total",
        color: "success",
      };
    },
    splitEvenly() {
      if (!this.pembayaran.length) {
        this.pembayaran.push(createPaymentItem());
      }
      const count = this.pembayaran.length;
      const base = Math.floor(this.grandTotal / count);
      let remainder = this.grandTotal - base * count;
      this.pembayaran = this.pembayaran.map((item) => {
        const extra = remainder > 0 ? 1 : 0;
        remainder -= extra;
        return { ...item, nominal: base + extra };
      });
      this.cashReceived = this.cashAllocated;
      this.snackbar = {
        show: true,
        text: "Nominal dibagi rata ke semua metode bayar",
        color: "info",
      };
    },
    syncCashReceived() {
      this.cashReceived = this.cashAllocated;
      this.snackbar = {
        show: true,
        text: "Nominal cash diterima disamakan dengan cash dialokasikan",
        color: "success",
      };
    },
    applyPromoCode() {
      if (!this.promoCode) {
        this.snackbar = {
          show: true,
          text: "Masukkan kode promo terlebih dahulu",
          color: "error",
        };
        return;
      }
      const normalizedCode = String(this.promoCode).trim().toUpperCase();
      const foundPromo = this.allPromoList.find(
        (item) =>
          String(item.kode || "").toUpperCase() === normalizedCode ||
          String(item.nama || "").toUpperCase() === normalizedCode,
      );
      if (!foundPromo) {
        this.snackbar = {
          show: true,
          text: `Kode promo "${this.promoCode}" tidak ditemukan`,
          color: "error",
        };
        return;
      }
      if (this.isPromoSelected(foundPromo)) {
        this.snackbar = {
          show: true,
          text: `Promo "${foundPromo.nama}" sudah dipilih`,
          color: "info",
        };
        return;
      }
      this.appliedPromos.push({ ...foundPromo });
      this.snackbar = {
        show: true,
        text: `Promo "${foundPromo.nama}" ditambahkan`,
        color: "success",
      };
      this.promoCode = "";
    },
    resetPromo() {
      this.appliedPromos = [];
      this.promoCode = "";
      this.snackbar = {
        show: true,
        text: "Semua promo direset",
        color: "info",
      };
    },
    submit() {
      const payload = {
        header: this.header,
        penjualan: this.penjualanItems,
        treatment: this.treatmentItems,
        diskon_subtotal: this.diskonSubtotal,
        applied_promos: this.appliedPromos,
        pembayaran: this.pembayaran,
        subtotal: this.subtotal,
        subtotal_discount: this.subtotalDiscountAmount,
        promo_discount: this.promoDiscountAmount,
        grand_total: this.grandTotal,
        total_bayar: this.totalBayar,
        sisa_tagihan: this.sisaTagihan,
        cash_allocated: this.cashAllocated,
        cash_received: this.cashReceived,
        cash_change: this.cashChange,
      };
      console.log("PAYLOAD PEMBAYARAN:", payload);
      this.snackbar = {
        show: true,
        text: "Pembayaran berhasil diproses",
        color: "success",
      };
    },
  },
};
</script>
<style scoped>
.payment-page {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fb;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}
.page-title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  color: #111827;
}
.page-subtitle {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}
.section-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}
.action-main-btn {
  height: 48px;
  font-weight: 700;
}
.entry-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 16px;
  margin-top: 16px;
}
.entry-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.entry-card-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}
.field-label {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
}
.split-field {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 8px;
}
.promo-trigger {
  border: 1.5px solid #22c55e;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.2s ease;
}
.promo-trigger:hover {
  background: #f0fdf4;
}
.promo-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #dcfce7;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.promo-copy {
  flex: 1;
}
.promo-title {
  font-size: 16px;
  font-weight: 800;
  color: #166534;
}
.promo-subtitle {
  margin-top: 2px;
  font-size: 13px;
  color: #15803d;
}
.promo-arrow {
  color: #16a34a;
}
.selected-promo-wrap {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
}
.selected-promo-title {
  font-size: 13px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 10px;
}
.selected-promo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.selected-promo-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}
.selected-promo-content {
  min-width: 0;
}
.selected-promo-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.selected-promo-desc {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}
.summary-sticky {
  position: sticky;
  top: 20px;
}
.summary-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 16px;
}
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: #374151;
  margin-bottom: 10px;
}
.summary-row strong {
  color: #111827;
  text-align: right;
}
.summary-grand-total {
  margin-top: 16px;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #111827, #1f2937);
  color: #ffffff;
}
.summary-grand-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;
}
.summary-grand-value {
  margin-top: 6px;
  font-size: 32px;
  font-weight: 900;
  line-height: 1.1;
}
.section-mini-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}
.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.payment-card {
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fafafa;
  margin-bottom: 12px;
}
.payment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.payment-card-title {
  font-size: 13px;
  font-weight: 800;
  color: #374151;
}
.payment-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.cash-received-box {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
}
.cash-box-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}
.cash-box-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}
.save-btn {
  font-weight: 800;
  letter-spacing: 0.02em;
}
.promo-drawer {
  background: #ffffff;
}
.promo-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.promo-drawer-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}
.promo-drawer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.promo-drawer-body {
  padding: 16px;
}
.promo-code-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  margin-bottom: 20px;
}
.promo-group {
  margin-bottom: 22px;
}
.promo-group-title {
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.promo-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  background: #ffffff;
  transition: 0.2s ease;
}
.promo-card.selected {
  border-color: #22c55e;
  background: #f0fdf4;
}
.promo-card-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}
.promo-card-desc {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 12px;
}
.promo-card-quota {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
}
.promo-card-action {
  display: flex;
  justify-content: flex-end;
}
.promo-note {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
}
.text-success {
  color: #16a34a !important;
}
.text-error {
  color: #dc2626 !important;
}
.text-body {
  color: #111827 !important;
}
@media (max-width: 1260px) {
  .summary-sticky {
    position: static;
  }
}
@media (max-width: 768px) {
  .payment-page {
    padding: 14px;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .promo-code-row,
  .payment-card-grid {
    grid-template-columns: 1fr;
  }
  .summary-grand-value {
    font-size: 26px;
  }
  .split-field {
    grid-template-columns: 90px 1fr;
  }
}
</style>

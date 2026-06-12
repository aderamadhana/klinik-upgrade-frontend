<template>
  <div>
    <v-overlay
      :model-value="loadingPage"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular indeterminate size="48" color="primary" />
    </v-overlay>

    <div class="page-header-pembayaran">
      <div>
        <h1 class="page-title">Pembayaran Kasir</h1>
        <p class="page-subtitle">
          Proses pembayaran berdasarkan data registrasi layanan
        </p>
      </div>
      <v-breadcrumbs :items="breadcrumbs" divider="/" class="pa-0" />
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      class="mb-4"
      density="comfortable"
    >
      {{ errorMessage }}
    </v-alert>

    <v-row align="start" class="mt-1">
      <v-col cols="12" lg="8">
        <TransaksiHeaderCard
          :header="header"
          :jenis-transaksi-list="jenisTransaksiList"
          :sumber-informasi-list="sumberInformasiList"
          :deposit-expired-option-list="depositExpiredOptionList"
          :dokter-list="dokterList"
          :loading-reference="loadingReference"
          :has-produk-item="penjualanItems.length > 0"
          @update-header-field="updateHeaderField"
        />

        <PembayaranObatCard
          :items="penjualanItems"
          :obat-list="obatList"
          :diskon-type-list="diskonTypeList"
          :frekuensi-list="frekuensiList"
          :waktu-pakai-list="waktuPakaiList"
          :format-currency="formatCurrency"
          :get-subtotal="getPenjualanSubtotal"
          :discount-readonly="true"
          :get-display-subtotal="getPenjualanDisplaySubtotal"
          :get-voucher-discount-type="getProdukVoucherDiscountType"
          :get-voucher-discount-value="getProdukVoucherDiscountValue"
          @add-item="addPenjualanItem"
          @remove-item="removePenjualanItem"
          @update-item-field="updatePenjualanItemField"
          @fill-item="fillObat"
        />

        <PembayaranTreatmentCard
          :items="treatmentItems"
          :tindakan-list="tindakanList"
          :perawat-list="perawatList"
          :diskon-type-list="diskonTypeList"
          :format-currency="formatCurrency"
          :get-subtotal="getTreatmentSubtotal"
          :discount-readonly="true"
          :get-display-subtotal="getTreatmentDisplaySubtotal"
          :get-voucher-discount-type="getTreatmentVoucherDiscountType"
          :get-voucher-discount-value="getTreatmentVoucherDiscountValue"
          @add-item="addTreatmentItem"
          @remove-item="removeTreatmentItem"
          @update-item-field="updateTreatmentItemField"
          @fill-item="fillTreatment"
        />

        <PembayaranPromoCard
          :applied-promos="appliedPromos"
          :diskon-subtotal="diskonSubtotal"
          :diskon-type-list="diskonTypeList"
          :format="format"
          :format-currency="formatCurrency"
          :get-promo-amount="getPromoAmount"
          @open-promo="openPromoDrawer"
          @remove-promo="removeAppliedPromo"
          @update-diskon-subtotal="updateDiskonSubtotal"
        />
      </v-col>

      <v-col cols="12" lg="4">
        <div class="summary-sticky">
          <PembayaranSummaryCard
            :total-penjualan="totalPenjualan"
            :total-treatment="totalTreatment"
            :total-konsultasi="totalKonsultasi"
            :has-konsultasi="hasKonsultasi"
            :subtotal="subtotal"
            :subtotal-discount-amount="subtotalDiscountAmount"
            :promo-discount-amount="promoDiscountAmount"
            :member-id="header.member_id"
            :member-no="header.member_no"
            :member-tier-nama="header.member_tier_nama"
            :member-discount-amount="memberDiscountAmount"
            :point-earned="header.point_earned"
            :poin="header.poin"
            :grand-total="grandTotal"
            :invoice-summary="invoiceSummarySnapshot"
            :pembayaran="pembayaran"
            :metode-list="metodeList"
            :total-bayar="totalBayar"
            :sisa-tagihan="sisaTagihan"
            :payment-coverage-status="paymentCoverageStatus"
            :has-cash-method="hasCashMethod"
            :cash-received="cashReceived"
            :cash-allocated="cashAllocated"
            :cash-change="cashChange"
            :loading-submit="loadingSubmit"
            :format-currency="formatCurrency"
            @add-pay="addPay"
            @remove-pay="removePay"
            @update-payment-field="updatePaymentField"
            @set-exact-payment="setExactPayment"
            @split-evenly="splitEvenly"
            @sync-cash-received="syncCashReceived"
            @update-cash-received="cashReceived = $event"
            @submit="submit"
          />
        </div>
      </v-col>
    </v-row>

    <PembayaranPromoDrawer
      v-model="promoDrawer"
      :promo-code="promoCode"
      :promo-treatment-list="promoTreatmentList"
      :promo-product-list="promoProductList"
      :promo-bundling-list="promoBundlingList"
      :promo-value-list="promoValueList"
      :is-promo-selected="isPromoSelected"
      @update-promo-code="promoCode = $event"
      @apply-promo-code="applyPromoCode"
      @toggle-promo="togglePromo"
      @reset-promo="resetPromo"
    />

    <v-dialog
      v-model="depositTreatmentDialog"
      max-width="1180"
      persistent
      scrollable
    >
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet color="primary" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon icon="mdi-wallet-giftcard" color="primary" size="26" />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  Pilih Treatment Deposit
                </div>
                <div class="text-body-2 text-white">
                  Pilih treatment dan tentukan qty yang akan dibuat sebagai
                  saldo deposit.
                </div>
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                v-if="treatmentItems?.length"
                size="small"
                color="white"
                variant="flat"
                class="font-weight-medium"
              >
                {{ selectedDepositTreatmentKeys.length }} /
                {{ treatmentItems.length }} dipilih
              </v-chip>

              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click.stop="closeDepositTreatmentDialog"
              />
            </div>
          </div>
        </v-sheet>

        <v-card-text class="pa-4">
          <v-alert
            type="info"
            variant="tonal"
            border="start"
            rounded="lg"
            class="mb-4"
          >
            Produk/obat tetap dibayar normal. Deposit hanya dibuat untuk
            treatment dan qty yang dipilih.
          </v-alert>

          <v-alert
            v-if="!treatmentItems.length"
            type="warning"
            variant="tonal"
            border="start"
            rounded="lg"
          >
            Transaksi deposit hanya bisa dipilih jika transaksi memiliki minimal
            satu treatment.
          </v-alert>

          <v-card v-else class="rounded-lg border" elevation="0">
            <v-card-text class="pa-4">
              <div
                class="d-flex align-start justify-space-between ga-3 flex-wrap mb-4"
              >
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Daftar Treatment
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ selectedDepositTreatmentKeys.length }} dari
                    {{ treatmentItems.length }} treatment dipilih
                    <span v-if="selectedDepositTreatmentQtyTotal > 0">
                      • Total Qty Deposit {{ selectedDepositTreatmentQtyTotal }}
                    </span>
                  </div>
                </div>

                <div class="d-flex ga-2 flex-wrap">
                  <v-btn
                    type="button"
                    size="small"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-check-all"
                    @click.stop="selectAllDepositTreatments"
                  >
                    Pilih Semua
                  </v-btn>

                  <v-btn
                    type="button"
                    size="small"
                    color="error"
                    variant="tonal"
                    prepend-icon="mdi-close-circle-outline"
                    @click.stop="clearDepositTreatments"
                  >
                    Kosongkan
                  </v-btn>
                </div>
              </div>

              <v-card
                v-for="(item, index) in treatmentItems"
                :key="getTreatmentItemKey(item, index)"
                variant="outlined"
                rounded="lg"
                class="mb-3"
                :color="
                  isDepositTreatmentSelected(item, index)
                    ? 'green-lighten-5'
                    : undefined
                "
                @click.stop="toggleDepositTreatmentItem(item, index)"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-start ga-3">
                    <v-checkbox-btn
                      :model-value="isDepositTreatmentSelected(item, index)"
                      color="green"
                      density="compact"
                      @click.stop="toggleDepositTreatmentItem(item, index)"
                    />

                    <div class="flex-grow-1">
                      <div
                        class="d-flex justify-space-between align-start ga-3 flex-wrap"
                      >
                        <div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              item.nama_treatment ||
                              item.nama_item ||
                              item.nama ||
                              "Treatment"
                            }}
                          </div>

                          <div class="text-caption text-medium-emphasis">
                            {{
                              item.beautician ||
                              item.perawat_nama ||
                              "Beautician belum dipilih"
                            }}
                          </div>
                        </div>

                        <v-chip
                          size="small"
                          :color="
                            isDepositTreatmentSelected(item, index)
                              ? 'success'
                              : 'grey'
                          "
                          variant="tonal"
                        >
                          {{
                            isDepositTreatmentSelected(item, index)
                              ? "Dipilih"
                              : "Belum dipilih"
                          }}
                        </v-chip>
                      </div>

                      <div class="d-flex align-center ga-2 mt-3 flex-wrap">
                        <v-chip size="small" variant="tonal" color="blue-grey">
                          Qty Invoice {{ getTreatmentQty(item) }}
                        </v-chip>

                        <div class="d-flex align-center ga-1" @click.stop>
                          <v-btn
                            icon="mdi-minus"
                            size="x-small"
                            variant="tonal"
                            color="primary"
                            density="comfortable"
                            :disabled="
                              !isDepositTreatmentSelected(item, index) ||
                              getDepositTreatmentQty(item, index) <= 1
                            "
                            @click.stop="
                              decreaseDepositTreatmentQty(item, index)
                            "
                          />

                          <v-chip size="small" variant="tonal" color="primary">
                            Deposit Qty
                            {{ getDepositTreatmentQty(item, index) }}
                          </v-chip>

                          <v-btn
                            icon="mdi-plus"
                            size="x-small"
                            variant="tonal"
                            color="primary"
                            density="comfortable"
                            :disabled="
                              !isDepositTreatmentSelected(item, index) ||
                              getDepositTreatmentQty(item, index) >=
                                getTreatmentQty(item)
                            "
                            @click.stop="
                              increaseDepositTreatmentQty(item, index)
                            "
                          />
                        </div>

                        <v-chip size="small" variant="tonal" color="blue-grey">
                          Harga
                          {{ formatCurrency(resolveTreatmentHarga(item)) }}
                        </v-chip>

                        <v-chip size="small" variant="tonal" color="success">
                          Deposit
                          {{
                            formatCurrency(
                              getDepositTreatmentSubtotal(item, index),
                            )
                          }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            type="button"
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-close"
            @click.stop="closeDepositTreatmentDialog"
          >
            Batal
          </v-btn>

          <v-btn
            type="button"
            color="primary"
            variant="flat"
            prepend-icon="mdi-cash-check"
            :disabled="!selectedDepositTreatmentKeys.length"
            @click.stop="confirmDepositTreatmentDialog"
          >
            Lanjutkan Pembayaran
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="phoneConfirmDialog"
      max-width="680"
      persistent
      scrollable
    >
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet color="primary" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon
                  icon="mdi-phone-check-outline"
                  color="primary"
                  size="26"
                />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  Konfirmasi Nomor Pasien
                </div>
                <div class="text-body-2 text-white">
                  Perbarui nomor HP/WA pasien sebelum pembayaran diselesaikan
                  jika ada perubahan.
                </div>
              </div>
            </div>
          </div>
        </v-sheet>

        <v-card-text class="pa-4">
          <v-card class="rounded-lg border" elevation="0">
            <v-card-text class="pa-4">
              <div class="d-flex align-start ga-3 mb-4">
                <v-avatar size="38" color="blue-lighten-5">
                  <v-icon
                    icon="mdi-card-account-phone-outline"
                    color="primary"
                    size="22"
                  />
                </v-avatar>

                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    Data Kontak Pasien
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Pastikan nomor aktif agar follow-up pasien dan notifikasi
                    WhatsApp tidak gagal.
                  </div>
                </div>
              </div>

              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="phoneForm.no_hp"
                    label="No. HP"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-cellphone"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="phoneForm.no_wa"
                    label="No. WhatsApp"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-whatsapp"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="phoneForm.no_telp"
                    label="No. Telepon"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-phone"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="continueWithoutPhoneUpdate"
          >
            Lanjut Tanpa Ubah
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-content-save-check-outline"
            @click="confirmPhoneAndSubmit"
          >
            Simpan Nomor & Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="memberRewardDialog"
      max-width="760"
      persistent
      scrollable
    >
      <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
        <v-sheet color="primary" class="pa-4">
          <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar size="44" color="white" rounded="lg">
                <v-icon icon="mdi-crown" color="primary" size="26" />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold text-white">
                  Benefit Member Diperbarui
                </div>
                <div class="text-body-2 text-white">
                  Pasien mendapatkan update member setelah pembayaran berhasil.
                </div>
              </div>
            </div>

            <v-chip
              v-if="memberReward?.current_tier_nama"
              size="small"
              color="white"
              variant="flat"
              class="font-weight-medium"
            >
              {{ memberReward.current_tier_nama }}
            </v-chip>
          </div>
        </v-sheet>

        <v-card-text class="pa-4">
          <v-alert
            v-if="memberReward && memberReward.tier_changed"
            type="success"
            variant="tonal"
            border="start"
            rounded="lg"
            class="mb-4"
          >
            Tier pasien naik dari
            <strong>{{ memberReward.previous_tier_nama || "-" }}</strong>
            menjadi
            <strong>{{ memberReward.current_tier_nama || "-" }}</strong
            >.
          </v-alert>

          <v-alert
            v-else-if="memberReward && memberReward.member_created"
            type="success"
            variant="tonal"
            border="start"
            rounded="lg"
            class="mb-4"
          >
            Pasien berhasil menjadi member
            <strong>{{ memberReward.current_tier_nama || "-" }}</strong
            >.
          </v-alert>

          <v-row dense class="mb-4">
            <v-col cols="12" sm="6">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="blue-lighten-5">
                    <v-icon
                      icon="mdi-star-plus-outline"
                      color="primary"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Poin Didapat
                    </div>
                    <div class="text-h6 font-weight-bold text-high-emphasis">
                      {{
                        formatNumber(
                          memberReward ? memberReward.point_earned : 0,
                        )
                      }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div class="d-flex align-start ga-3">
                  <v-avatar size="34" color="green-lighten-5">
                    <v-icon
                      icon="mdi-star-circle-outline"
                      color="success"
                      size="19"
                    />
                  </v-avatar>

                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Saldo Poin
                    </div>
                    <div class="text-h6 font-weight-bold text-high-emphasis">
                      {{
                        formatNumber(
                          memberReward ? memberReward.point_balance : 0,
                        )
                      }}
                    </div>
                  </div>
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-card class="rounded-lg border" elevation="0">
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon
                    icon="mdi-card-account-details-outline"
                    color="primary"
                  />
                </template>

                <v-list-item-title>No. Member</v-list-item-title>
                <v-list-item-subtitle>
                  {{ memberReward ? memberReward.member_no || "-" : "-" }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider />

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-star-circle-outline" color="primary" />
                </template>

                <v-list-item-title>Tier Saat Ini</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    memberReward ? memberReward.current_tier_nama || "-" : "-"
                  }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider />

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-receipt-text-outline" color="primary" />
                </template>

                <v-list-item-title>No. Invoice</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    memberReward
                      ? memberReward.no_invoice || header.invoice_no || "-"
                      : header.invoice_no || "-"
                  }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-arrow-right"
            @click="continueAfterMemberReward"
          >
            Lanjut ke Daftar Pembayaran
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import api from "@/plugins/axios";
import TransaksiHeaderCard from "@/components/pembayaran/transaksi-header-card.vue";
import PembayaranObatCard from "@/components/pembayaran/pembayaran-obat-card.vue";
import PembayaranPromoCard from "@/components/pembayaran/pembayaran-promo-card.vue";
import PembayaranPromoDrawer from "@/components/pembayaran/pembayaran-promo-drawer.vue";
import PembayaranSummaryCard from "@/components/pembayaran/pembayaran-summary-card.vue";
import PembayaranTreatmentCard from "@/components/pembayaran/pembayaran-treatment-card.vue";
import pembayaranService from "@/services/kasir/pembayaranService";
import referenceService from "@/services/referenceService";
import karyawanService from "@/services/master/karyawanService";

export default {
  name: "PembayaranKasirPage",
  components: {
    TransaksiHeaderCard,
    PembayaranObatCard,
    PembayaranPromoCard,
    PembayaranPromoDrawer,
    PembayaranSummaryCard,
    PembayaranTreatmentCard,
  },
  data() {
    return {
      loadingPage: false,
      loadingReference: false,
      loadingKaryawan: false,
      loadingSubmit: false,
      memberRewardDialog: false,
      memberReward: null,
      pendingFinishRedirect: null,
      errorMessage: "",
      registrasiDetail: null,
      useInvoiceSummarySnapshot: false,
      invoiceSummarySnapshot: {
        subtotal_produk: 0,
        subtotal_treatment: 0,
        subtotal_konsultasi: 0,
        subtotal: 0,
        diskon_subtotal: 0,
        diskon_promo: 0,
        diskon_member_amount: 0,
        grand_total: 0,
        total_bayar: 0,
        sisa_tagihan: 0,
      },
      promoDrawer: false,
      promoCode: "",
      depositTreatmentDialog: false,
      selectedDepositTreatmentItemIds: [],
      selectedDepositTreatmentKeys: [],
      selectedDepositTreatmentQtyMap: {},
      selectedDepositTreatmentItems: [],
      depositSelectionConfirmed: false,
      phoneConfirmDialog: false,
      phoneConfirmationDone: false,
      shouldUpdatePatientPhone: false,
      phoneForm: {
        no_hp: "",
        no_wa: "",
        no_telp: "",
      },
      cashReceived: 0,
      breadcrumbs: [
        { title: "Kasir", disabled: true },
        { title: "Daftar Pembayaran", disabled: true },
        { title: "Proses Pembayaran", disabled: true },
      ],
      header: {
        registrasi_id: null,
        invoice_id: null,
        invoice_no: "",
        kode_registrasi: "",
        toko_id: null,
        tanggal: "",
        pasien_id: null,
        pasien_nama: "",
        pasien_no_rm: "",
        pasien_no_hp: "",
        pasien_no_wa: "",
        pasien_no_telp: "",
        member_id: null,
        member_no: "",
        member_tier_nama: "",
        diskon_member_amount: 0,
        point_earned: 0,
        poin: 0,
        dokter_id: null,
        dokter_nama: "",
        perawat_id: null,
        perawat_nama: "",
        jenis_transaksi_id: 0,
        jenis_transaksi: "Umum",
        jenis_transaksi_kode: null,
        sumber_informasi_id: null,
        sumber_informasi_kode: null,
        sumber: "Pelanggan Lama",
        voucher_label: "-",
        voucher_count: 0,
        catatan: "",
        referensi_dokter_id: null,
        deposit_expired_option_id: null,
        deposit_expired_at: null,
        has_konsultasi: false,
        subtotal_konsultasi: 0,
      },
      jenisTransaksiList: [],
      sumberInformasiList: [],
      depositExpiredOptionList: [],
      penjualanItems: [],
      treatmentItems: [],
      diskonSubtotal: {
        type: "%",
        value: 0,
      },
      pembayaran: [],
      metodeList: [],
      obatList: [],
      tindakanList: [],
      perawatList: [],
      dokterList: [],
      apiKaryawanList: [],
      promoTreatmentList: [],
      promoProductList: [],
      promoBundlingList: [],
      promoValueList: [],
      appliedPromos: [],
      diskonTypeList: ["%", "Rp"],
      frekuensiList: [
        { title: "1 x sehari", value: "1 x sehari" },
        { title: "2 x sehari", value: "2 x sehari" },
        { title: "3 x sehari", value: "3 x sehari" },
        { title: "4 x sehari", value: "4 x sehari" },
      ],
      waktuPakaiList: [
        { title: "Pagi", value: "pagi" },
        { title: "Siang", value: "siang" },
        { title: "Sore", value: "sore" },
        { title: "Malam", value: "malam" },
        { title: "Pagi - Siang", value: "pagi - siang" },
        { title: "Pagi - Sore", value: "pagi - sore" },
        { title: "Pagi - Malam", value: "pagi - malam" },
        { title: "Siang - Sore", value: "siang - sore" },
        { title: "Siang - Malam", value: "siang - malam" },
        { title: "Sore - Malam", value: "sore - malam" },
        { title: "Pagi - Siang - Malam", value: "pagi - siang - malam" },
        { title: "Pagi - Sore - Malam", value: "pagi - sore - malam" },
        { title: "Siang - Sore - Malam", value: "siang - sore - malam" },
        {
          title: "Pagi - Siang - Sore - Malam",
          value: "pagi - siang - sore - malam",
        },
      ],
      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },
  computed: {
    isDepositTransaction() {
      return Number(this.header.jenis_transaksi_id || 0) === 4;
    },
    calculatedTotalPenjualan() {
      return this.penjualanItems.reduce(
        (sum, item) => sum + this.getPenjualanSubtotal(item),
        0,
      );
    },
    calculatedTotalTreatment() {
      return this.treatmentItems.reduce(
        (sum, item) => sum + this.getTreatmentSubtotal(item),
        0,
      );
    },
    totalPenjualan() {
      if (this.useInvoiceSummarySnapshot) {
        return Number(this.invoiceSummarySnapshot.subtotal_produk || 0);
      }

      return this.calculatedTotalPenjualan;
    },
    totalTreatment() {
      if (this.useInvoiceSummarySnapshot) {
        return Number(this.invoiceSummarySnapshot.subtotal_treatment || 0);
      }

      return this.calculatedTotalTreatment;
    },
    hasKonsultasi() {
      return Boolean(this.header.has_konsultasi) || this.rawTotalKonsultasi > 0;
    },
    rawTotalKonsultasi() {
      if (this.useInvoiceSummarySnapshot) {
        return Number(this.invoiceSummarySnapshot.subtotal_konsultasi || 0);
      }

      return Number(this.header.subtotal_konsultasi || 0);
    },
    totalKonsultasi() {
      if (this.useInvoiceSummarySnapshot) {
        return Number(this.invoiceSummarySnapshot.subtotal_konsultasi || 0);
      }

      if (this.treatmentItems.length > 0 || this.calculatedTotalTreatment > 0) {
        return 0;
      }

      return this.rawTotalKonsultasi;
    },
    subtotal() {
      if (this.useInvoiceSummarySnapshot) {
        const snapshotSubtotal = Number(
          this.invoiceSummarySnapshot.subtotal || 0,
        );

        if (snapshotSubtotal > 0) {
          return snapshotSubtotal;
        }
      }

      return this.totalPenjualan + this.totalTreatment + this.totalKonsultasi;
    },
    subtotalDiscountAmount() {
      if (this.useInvoiceSummarySnapshot) {
        return Number(this.invoiceSummarySnapshot.diskon_subtotal || 0);
      }

      const value = Number(this.diskonSubtotal.value || 0);
      if (this.diskonSubtotal.type === "%") {
        return Math.min((this.subtotal * value) / 100, this.subtotal);
      }
      return Math.min(value, this.subtotal);
    },
    promoBaseAmount() {
      return Math.max(this.subtotal - this.subtotalDiscountAmount, 0);
    },
    promoDiscountAmount() {
      if (this.useInvoiceSummarySnapshot) {
        return Number(this.invoiceSummarySnapshot.diskon_promo || 0);
      }

      let remainingBase = this.promoBaseAmount;
      let total = 0;

      for (const promo of this.appliedPromos) {
        if (remainingBase <= 0) {
          break;
        }

        const amount = this.calculateSinglePromoAmount(promo, remainingBase);
        const cappedAmount = Math.min(amount, remainingBase);

        total += cappedAmount;
        remainingBase = Math.max(remainingBase - cappedAmount, 0);
      }

      return Math.min(total, this.promoBaseAmount);
    },
    memberDiscountAmount() {
      if (this.useInvoiceSummarySnapshot) {
        return Number(this.invoiceSummarySnapshot.diskon_member_amount || 0);
      }

      return Math.min(
        Number(this.header.diskon_member_amount || 0),
        Math.max(
          this.subtotal -
            this.subtotalDiscountAmount -
            this.promoDiscountAmount,
          0,
        ),
      );
    },
    grandTotal() {
      if (this.useInvoiceSummarySnapshot) {
        return Number(this.invoiceSummarySnapshot.grand_total || 0);
      }

      return Math.max(
        this.subtotal -
          this.subtotalDiscountAmount -
          this.promoDiscountAmount -
          this.memberDiscountAmount,
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
      return this.pembayaran.some((item) => this.isCashPayment(item));
    },
    cashAllocated() {
      return this.pembayaran
        .filter((item) => this.isCashPayment(item))
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
        ...this.promoBundlingList,
        ...this.promoValueList,
      ];
    },
    selectedDepositTreatmentQtyTotal() {
      return this.selectedDepositTreatmentKeys.reduce((sum, key) => {
        return sum + Number(this.selectedDepositTreatmentQtyMap[key] || 0);
      }, 0);
    },
  },
  mounted() {
    this.loadPage();
  },
  methods: {
    async loadPage() {
      const invoiceId = this.$route.params.id;
      if (!invoiceId) {
        this.errorMessage = "ID invoice tidak ditemukan di URL.";
        return;
      }

      this.loadingPage = true;
      this.errorMessage = "";

      try {
        await this.fetchPaymentHeaderReferences();

        const response = await pembayaranService.getById(invoiceId);
        if (!response?.status) {
          this.errorMessage =
            response?.message || "Gagal mengambil detail invoice pembayaran.";
          return;
        }

        const data = this.normalizePaymentDetailData(response.data || {});

        this.registrasiDetail = data;
        this.mapHeaderFromRegistrasi(data);
        this.mapPenjualanFromRegistrasi(data);
        this.mapTreatmentFromRegistrasi(data);
        this.mapInvoiceSummaryFromInvoice(data);
        this.mapDiskonSubtotalFromInvoice(data);
        this.mapAppliedPromosFromInvoice(data);
        this.mapPembayaranFromInvoice(data);
        this.updateHeaderVoucherInfo();

        await this.fetchMetodeBayar();
        await this.fetchReferenceItemData();
        await this.fetchVoucherEligible();
        this.setDefaultCashPayment();
      } catch (error) {
        console.error("LOAD PROSES PEMBAYARAN ERROR:", error);
        this.errorMessage =
          error?.response?.data?.message ||
          "Gagal memuat data proses pembayaran.";
      } finally {
        this.loadingPage = false;
      }
    },

    normalizePaymentDetailData(detail = {}) {
      const invoiceSource =
        detail.invoice || detail.pembayaran_invoice || detail.payment || {};
      const registrasi =
        invoiceSource.registrasi ||
        detail.registrasi ||
        detail.registration ||
        {};

      const pickArray = (...candidates) =>
        candidates.find((value) => Array.isArray(value)) || [];

      const items = pickArray(
        detail.items,
        detail.invoice_items,
        invoiceSource.items,
      );
      const metode = pickArray(
        detail.metode,
        detail.payment_methods,
        invoiceSource.metode,
      );
      const promo = pickArray(
        detail.promo,
        detail.promos,
        invoiceSource.promo,
        invoiceSource.promos,
      );
      const depositClaims = pickArray(
        detail.deposit_claims,
        invoiceSource.deposit_claims,
      );

      const registrasiId = this.firstDefined(
        invoiceSource.registrasi_id,
        detail.registrasi_id,
        registrasi.id,
        null,
      );
      const pasien =
        invoiceSource.pasien || registrasi.pasien || detail.pasien || null;
      const dokterAwal =
        invoiceSource.dokter_awal ||
        registrasi.dokter_awal ||
        registrasi.dokterAwal ||
        detail.dokter_awal ||
        null;
      const perawatAwal =
        invoiceSource.perawat_awal ||
        registrasi.perawat_awal ||
        registrasi.perawatAwal ||
        detail.perawat_awal ||
        null;

      const invoice = {
        ...invoiceSource,
        items,
        metode,
        promo,
        promos: promo,
        deposit_claims: depositClaims,
      };

      return {
        ...registrasi,
        ...invoiceSource,
        id: registrasiId,
        registrasi_id: registrasiId,
        kode_registrasi: this.firstDefined(
          invoiceSource.kode_registrasi,
          detail.kode_registrasi,
          registrasi.kode_registrasi,
          "",
        ),
        toko_id: this.firstDefined(
          invoiceSource.toko_id,
          detail.toko_id,
          registrasi.toko_id,
          null,
        ),
        tanggal_kunjungan: this.firstDefined(
          invoiceSource.tanggal_kunjungan,
          detail.tanggal_kunjungan,
          registrasi.tanggal_kunjungan,
          invoiceSource.tanggal,
          null,
        ),
        tanggal: this.firstDefined(
          invoiceSource.tanggal,
          invoiceSource.tanggal_kunjungan,
          detail.tanggal,
          registrasi.tanggal,
          registrasi.tanggal_kunjungan,
          null,
        ),
        registered_at: this.firstDefined(
          invoiceSource.registered_at,
          detail.registered_at,
          registrasi.registered_at,
          null,
        ),
        pasien_id: this.firstDefined(
          invoiceSource.pasien_id,
          detail.pasien_id,
          registrasi.pasien_id,
          pasien?.id,
          null,
        ),
        pasien,
        dokter_awal_id: this.firstDefined(
          invoiceSource.dokter_id,
          detail.dokter_awal_id,
          registrasi.dokter_awal_id,
          dokterAwal?.id,
          null,
        ),
        dokter_awal: dokterAwal,
        perawat_awal_id: this.firstDefined(
          invoiceSource.perawat_id,
          detail.perawat_awal_id,
          registrasi.perawat_awal_id,
          perawatAwal?.id,
          null,
        ),
        perawat_awal: perawatAwal,
        invoice,
        pembayaran_invoice: invoice,
        invoice_items: items,
        items,
        metode,
        promo,
        promos: promo,
        deposit_claims: depositClaims,
      };
    },

    resolveInvoiceItemSourceSubtotal(item = {}) {
      const directSubtotal = this.toPromoNumber(item.subtotal);
      if (directSubtotal > 0) {
        return directSubtotal;
      }

      const afterSubtotalDiscount = this.toPromoNumber(
        item.subtotal_after_diskon_subtotal,
      );
      if (afterSubtotalDiscount > 0) {
        return afterSubtotalDiscount;
      }

      const beforeSubtotalDiscount = this.toPromoNumber(
        item.subtotal_before_diskon_subtotal,
      );
      if (beforeSubtotalDiscount > 0) {
        return beforeSubtotalDiscount;
      }

      const total = this.toPromoNumber(item.total);
      if (total > 0) {
        return total;
      }

      const qty = Math.max(this.toPromoNumber(item.qty ?? item.jumlah ?? 1), 1);
      const harga = this.toPromoNumber(
        item.harga ?? item.harga_jual ?? item.tarif ?? 0,
      );
      const gross = harga * qty;
      const itemDiscount = this.toPromoNumber(
        item.diskon_amount ?? item.total_diskon_item ?? 0,
      );
      const referralDiscount = this.toPromoNumber(item.diskon_referral ?? 0);

      if (gross > 0) {
        return Math.max(gross - itemDiscount - referralDiscount, 0);
      }

      const hasSubtotalField = [
        item.subtotal,
        item.subtotal_after_diskon_subtotal,
        item.subtotal_before_diskon_subtotal,
        item.total,
      ].some((value) => value !== undefined && value !== null && value !== "");

      return hasSubtotalField ? 0 : null;
    },

    mapInvoiceSummaryFromInvoice(data = {}) {
      const invoice = data.invoice || data.pembayaran_invoice || data || {};
      const items = this.extractInvoiceItems(data).filter(
        (item) => Number(item?.is_delete || 0) !== 1,
      );

      const itemTotals = items.reduce(
        (result, item) => {
          const amount = Number(
            this.resolveInvoiceItemSourceSubtotal(item) || 0,
          );
          const itemType = Number(item.item_type || 0);

          if (itemType === 3) {
            result.produk += amount;
          } else if (itemType === 2 || itemType === 4) {
            result.treatment += amount;
          } else if (itemType === 1 || itemType === 5) {
            result.konsultasi += amount;
          }

          return result;
        },
        {
          produk: 0,
          treatment: 0,
          konsultasi: 0,
        },
      );

      const subtotalProduk = Math.max(
        this.toPromoNumber(
          this.firstDefined(
            invoice.subtotal_produk,
            invoice.subtotal_obat,
            data.subtotal_produk,
            data.subtotal_obat,
            0,
          ),
        ),
        itemTotals.produk,
      );
      const subtotalTreatment = Math.max(
        this.toPromoNumber(
          this.firstDefined(
            invoice.subtotal_treatment,
            data.subtotal_treatment,
            0,
          ),
        ),
        itemTotals.treatment,
      );
      const subtotalKonsultasi = Math.max(
        this.toPromoNumber(
          this.firstDefined(
            invoice.subtotal_konsultasi,
            data.subtotal_konsultasi,
            0,
          ),
        ),
        itemTotals.konsultasi,
      );

      const subtotalFromItems =
        subtotalProduk + subtotalTreatment + subtotalKonsultasi;
      const subtotal = Math.max(
        this.toPromoNumber(
          this.firstDefined(invoice.subtotal, data.subtotal, 0),
        ),
        subtotalFromItems,
      );
      const diskonSubtotal = this.toPromoNumber(
        this.firstDefined(
          invoice.diskon_subtotal,
          invoice.diskon_subtotal_amount,
          data.diskon_subtotal,
          data.diskon_subtotal_amount,
          0,
        ),
      );
      const diskonPromo = this.toPromoNumber(
        this.firstDefined(
          invoice.diskon_promo,
          invoice.total_promo,
          data.diskon_promo,
          data.total_promo,
          0,
        ),
      );
      const diskonMember = this.toPromoNumber(
        this.firstDefined(
          invoice.diskon_member_amount,
          data.diskon_member_amount,
          0,
        ),
      );
      const calculatedGrandTotal = Math.max(
        subtotal - diskonSubtotal - diskonPromo - diskonMember,
        0,
      );
      const invoiceGrandTotal = this.toPromoNumber(
        this.firstDefined(
          invoice.grand_total,
          invoice.total_tagihan,
          invoice.total_pembayaran,
          data.grand_total,
          data.total_tagihan,
          0,
        ),
      );
      const grandTotal =
        invoiceGrandTotal > 0 ? invoiceGrandTotal : calculatedGrandTotal;
      const totalBayar = this.toPromoNumber(
        this.firstDefined(invoice.total_bayar, data.total_bayar, 0),
      );

      this.invoiceSummarySnapshot = {
        subtotal_produk: subtotalProduk,
        subtotal_treatment: subtotalTreatment,
        subtotal_konsultasi: subtotalKonsultasi,
        subtotal,
        diskon_subtotal: diskonSubtotal,
        diskon_promo: diskonPromo,
        diskon_member_amount: diskonMember,
        grand_total: grandTotal,
        total_bayar: totalBayar,
        sisa_tagihan: Math.max(grandTotal - totalBayar, 0),
      };
      this.useInvoiceSummarySnapshot =
        grandTotal > 0 || subtotal > 0 || items.length > 0;
    },

    activateLiveSummaryCalculation() {
      this.useInvoiceSummarySnapshot = false;
    },

    mapDiskonSubtotalFromInvoice(data = {}) {
      const invoice = data.invoice || data.pembayaran_invoice || data || {};
      const rawType = this.firstDefined(
        invoice.diskon_subtotal_tipe,
        data.diskon_subtotal_tipe,
        null,
      );
      const rawValue = this.toPromoNumber(
        this.firstDefined(
          invoice.diskon_subtotal_nilai,
          data.diskon_subtotal_nilai,
          0,
        ),
      );
      const amount = this.toPromoNumber(
        this.firstDefined(
          invoice.diskon_subtotal_amount,
          invoice.diskon_subtotal,
          data.diskon_subtotal_amount,
          data.diskon_subtotal,
          0,
        ),
      );

      let type = this.resolveDiskonType(rawType);
      let value = rawValue;

      if (value <= 0 && amount > 0) {
        type = "Rp";
        value = amount;
      }

      this.diskonSubtotal = {
        type,
        value,
      };
    },

    mapPembayaranFromInvoice(data = {}) {
      const invoice = data.invoice || data.pembayaran_invoice || {};
      const candidates = [data.metode, invoice.metode, data.payment_methods];
      const methods = candidates.find((value) => Array.isArray(value)) || [];

      this.pembayaran = methods
        .filter((item) => Number(item?.is_delete || 0) !== 1)
        .map((item) => ({
          id: item.id || null,
          metode_bayar_id: item.metode_bayar_id || null,
          metode_bayar_nama:
            item.metode_bayar_nama ||
            item.nama_metode_bayar ||
            item.nama ||
            null,
          metode_bayar_tipe: item.metode_bayar_tipe || item.tipe || null,
          nominal: Number(
            item.nominal_dialokasikan ?? item.nominal ?? item.amount ?? 0,
          ),
          nominal_diterima: Number(
            item.nominal_diterima ??
              item.nominal_dialokasikan ??
              item.nominal ??
              0,
          ),
          no_referensi: item.no_referensi || null,
          catatan: item.catatan || null,
        }));

      this.cashReceived = this.pembayaran
        .filter((item) => this.isCashPayment(item))
        .reduce(
          (sum, item) =>
            sum + Number(item.nominal_diterima || item.nominal || 0),
          0,
        );
    },
    async fetchPaymentHeaderReferences() {
      this.loadingReference = true;
      try {
        const [jenisTransaksi, sumberInformasi, expiredOptions] =
          await Promise.all([
            referenceService.jenisTransaksi().catch(() => []),
            referenceService.sumberInformasi().catch(() => []),
            referenceService.depositExpiredOption
              ? referenceService.depositExpiredOption().catch(() => [])
              : Promise.resolve([]),
          ]);

        this.jenisTransaksiList = this.extractRows(jenisTransaksi).map(
          (item) => ({
            id: Number(item.id ?? item.value ?? 0),
            value: Number(item.value ?? item.id ?? 0),
            title:
              item.title ||
              item.label ||
              item.nama_jenis_transaksi ||
              item.nama ||
              "Umum",
            label:
              item.label ||
              item.title ||
              item.nama_jenis_transaksi ||
              item.nama ||
              "Umum",
            kode: item.kode || item.kode_jenis_transaksi || null,
            raw: item,
          }),
        );

        this.sumberInformasiList = this.extractRows(sumberInformasi).map(
          (item) => ({
            id: Number(item.id ?? item.value ?? 0),
            value: Number(item.value ?? item.id ?? 0),
            title:
              item.title ||
              item.label ||
              item.nama_sumber_informasi ||
              item.nama ||
              "Lainnya",
            label:
              item.label ||
              item.title ||
              item.nama_sumber_informasi ||
              item.nama ||
              "Lainnya",
            kode: item.kode || item.kode_sumber_informasi || null,
            kategori_sumber: item.kategori_sumber || null,
            raw: item,
          }),
        );

        this.depositExpiredOptionList = this.extractRows(expiredOptions).map(
          (item) => ({
            id: Number(item.id ?? item.value ?? 0),
            value: Number(item.value ?? item.id ?? 0),
            title:
              item.title || item.label || item.nama || item.nama_option || "-",
            label:
              item.label || item.title || item.nama || item.nama_option || "-",
            kode: item.kode || item.code || null,
            jumlah_hari: Number(item.jumlah_hari || item.days || 0),
            raw: item,
          }),
        );
      } catch (error) {
        console.error("FETCH PAYMENT HEADER REFERENCES ERROR:", error);
        this.jenisTransaksiList = [];
        this.sumberInformasiList = [];
        this.depositExpiredOptionList = [];
      } finally {
        this.loadingReference = false;
      }
    },
    async fetchMetodeBayar() {
      try {
        const response = await referenceService.metodeBayar({
          toko_id: this.header.toko_id,
        });
        this.metodeList = this.extractRows(response).map((item) =>
          this.normalizeMetodeBayar(item),
        );
      } catch (error) {
        console.error("FETCH METODE BAYAR ERROR:", error);
        this.metodeList = [];
      }
    },
    async fetchReferenceItemData() {
      const params = { toko_id: this.header.toko_id };

      try {
        const [produk, treatment] = await Promise.all([
          referenceService.produkByToko(params),
          referenceService.treatmentByToko(params),
        ]);

        this.obatList = this.extractRows(produk)
          .map((item) => this.normalizePaymentProdukOption(item))
          .filter((item) => item.title && item.title !== "-");

        this.tindakanList = this.extractRows(treatment).map((item) => ({
          id: item.treatment_id || item.master_treatment_id || item.id,
          treatment_toko_id:
            item.treatment_toko_id || item.master_treatment_toko_id || item.id,
          title:
            item.nama_treatment ||
            item.treatment_nama ||
            item.nama ||
            item.treatment?.nama ||
            "-",
          harga: Number(
            item.harga ||
              item.harga_treatment ||
              item.tarif ||
              item.harga_terendah ||
              item.price ||
              0,
          ),
          raw: item,
        }));

        await this.fetchKaryawanByToko();
      } catch (error) {
        console.error("FETCH REFERENCE ITEM ERROR:", error);
        this.obatList = [];
        this.tindakanList = [];
        this.perawatList = [];
        this.dokterList = [];
      }
    },
    async fetchKaryawanByToko() {
      if (!this.header.toko_id) {
        this.apiKaryawanList = [];
        this.perawatList = [];
        this.dokterList = [];
        return;
      }

      this.loadingKaryawan = true;
      try {
        const response = await karyawanService.getAll({
          toko_id: this.header.toko_id,
          per_page: 100,
        });

        this.apiKaryawanList = this.extractRows(response);
        this.perawatList = this.apiKaryawanList
          .filter((item) => this.isPerawat(item))
          .map((item) => ({
            id: item.id,
            title: item.nama,
            nama: item.nama,
            raw: item,
          }));

        this.dokterList = this.apiKaryawanList
          .filter((item) => this.isDokter(item))
          .map((item) => ({
            id: item.id,
            title: item.nama,
            nama: item.nama,
            raw: item,
          }));
      } catch (error) {
        console.error("FETCH KARYAWAN BY TOKO ERROR:", error);
        this.apiKaryawanList = [];
        this.perawatList = [];
        this.dokterList = [];
      } finally {
        this.loadingKaryawan = false;
      }
    },
    async openPromoDrawer() {
      this.promoDrawer = true;
      await this.fetchVoucherEligible();
    },
    findObatOption(value, row = {}) {
      const valueText = String(value || "").trim();

      if (valueText) {
        const byStableValue = this.obatList.find(
          (option) => String(option?.value || "") === valueText,
        );

        if (byStableValue) return byStableValue;
      }

      const rowProdukTokoId = this.resolveProdukTokoId(row);

      if (rowProdukTokoId) {
        const byProdukTokoId = this.obatList.find(
          (option) =>
            String(this.resolveProdukTokoId(option) || "") ===
            String(rowProdukTokoId),
        );

        if (byProdukTokoId) return byProdukTokoId;
      }

      const rowProdukId = this.resolveProdukId(row);

      if (rowProdukId) {
        const byProdukId = this.obatList.find(
          (option) =>
            String(this.resolveProdukId(option) || "") === String(rowProdukId),
        );

        if (byProdukId) return byProdukId;
      }

      if (valueText) {
        const normalizedValue = this.normalizeLookupText(valueText);

        return (
          this.obatList.find((option) => {
            return (
              this.normalizeLookupText(option?.title) === normalizedValue ||
              this.normalizeLookupText(option?.nama) === normalizedValue ||
              this.normalizeLookupText(option?.raw?.nama) === normalizedValue ||
              this.normalizeLookupText(option?.raw?.nama_produk) ===
                normalizedValue ||
              this.normalizeLookupText(option?.raw?.produk_nama) ===
                normalizedValue ||
              this.normalizeLookupText(option?.raw?.produk?.nama) ===
                normalizedValue
            );
          }) || null
        );
      }

      return null;
    },
    findTreatmentOption(value, row = {}) {
      const candidates = [
        value,
        row?.nama,
        row?.treatment_id,
        row?.treatment_toko_id,
        row?.id,
      ]
        .filter((item) => item !== null && item !== undefined && item !== "")
        .map((item) => String(item));

      return this.tindakanList.find((option) => {
        const optionCandidates = [
          option?.id,
          option?.treatment_id,
          option?.treatment_toko_id,
          option?.title,
          option?.nama,
          option?.raw?.treatment_id,
          option?.raw?.treatment_toko_id,
          option?.raw?.id,
          option?.raw?.nama,
          option?.raw?.nama_treatment,
          option?.raw?.treatment?.nama,
        ]
          .filter((item) => item !== null && item !== undefined && item !== "")
          .map((item) => String(item));

        return optionCandidates.some((item) => candidates.includes(item));
      });
    },
    hydrateSelectedItemsFromReferences() {
      this.penjualanItems = this.penjualanItems.map((item) => {
        const selected = this.findObatOption(item?.nama, item);
        if (!selected) return item;

        return {
          ...item,
          produk_id:
            Number(
              this.resolveProdukId(selected) || this.resolveProdukId(item) || 0,
            ) || null,
          produk_toko_id:
            Number(
              this.resolveProdukTokoId(selected) ||
                this.resolveProdukTokoId(item) ||
                0,
            ) || null,
          nama: selected.title || selected.nama || item.nama,
          harga: Number(
            item.harga || selected.harga || selected.raw?.harga_jual || 0,
          ),
          unit:
            item.unit || selected.unit || selected.raw?.nama_satuan || "pcs",
        };
      });

      this.treatmentItems = this.treatmentItems.map((item) => {
        const selected = this.findTreatmentOption(item?.nama, item);
        if (!selected) return item;

        return {
          ...item,
          treatment_id:
            Number(
              selected.id ||
                selected.raw?.treatment_id ||
                item.treatment_id ||
                0,
            ) || null,
          treatment_toko_id:
            Number(
              selected.treatment_toko_id ||
                selected.raw?.treatment_toko_id ||
                item.treatment_toko_id ||
                0,
            ) || null,
          nama: selected.title || selected.nama || item.nama,
          harga: Number(
            item.harga ||
              selected.harga ||
              selected.raw?.tarif ||
              selected.raw?.harga_terendah ||
              0,
          ),
        };
      });
    },
    getSelectedProdukIds() {
      return [
        ...new Set(
          this.penjualanItems
            .map((item) => {
              if (Number(item?.produk_id || 0) > 0) {
                return Number(item.produk_id);
              }

              const selected = this.findObatOption(item?.nama, item);
              return Number(
                this.resolveProdukId(selected) ||
                  this.resolveProdukId(item) ||
                  0,
              );
            })
            .filter((id) => Number(id || 0) > 0),
        ),
      ];
    },
    getSelectedTreatmentIds() {
      return [
        ...new Set(
          this.treatmentItems
            .map((item) => {
              if (Number(item?.treatment_id || 0) > 0) {
                return Number(item.treatment_id);
              }

              const selected = this.findTreatmentOption(item?.nama, item);
              return Number(selected?.id || selected?.raw?.treatment_id || 0);
            })
            .filter((id) => Number(id || 0) > 0),
        ),
      ];
    },
    async fetchVoucherEligible() {
      try {
        this.hydrateSelectedItemsFromReferences();

        const params = {
          toko_id: this.header.toko_id,
          pasien_id: this.header.pasien_id,
          tanggal: this.header.tanggal || undefined,
          produk_ids: this.getSelectedProdukIds(),
          treatment_ids: this.getSelectedTreatmentIds(),
        };

        const response = await referenceService.voucherDiskonEligible(params);
        const data = this.normalizeVoucherEligibleResponse(response);

        this.promoTreatmentList = this.filterPromoListByCurrentItems(
          data.treatment,
        );
        this.promoProductList = this.filterPromoListByCurrentItems(data.produk);
        this.promoBundlingList = this.filterPromoListByCurrentItems(
          data.bundling,
        );
        this.promoValueList = this.filterPromoListByCurrentItems(data.value);
        this.refreshAppliedPromosFromEligibleList();
        this.pruneAppliedPromosByCurrentItems();
        this.updateHeaderVoucherInfo();
      } catch (error) {
        console.error("FETCH VOUCHER ELIGIBLE ERROR:", error);
        this.promoTreatmentList = [];
        this.promoProductList = [];
        this.promoBundlingList = [];
        this.promoValueList = [];
        this.updateHeaderVoucherInfo();
      }
    },
    extractInvoiceItems(data = {}) {
      const candidates = [
        data.invoice?.items,
        data.pembayaran_invoice?.items,
        data.invoice_items,
        data.items,
      ];

      const selected = candidates.find((items) => Array.isArray(items));
      return selected || [];
    },
    mergePenjualanDetailsWithResep(data = {}) {
      const rows = Array.isArray(data.penjualan_details)
        ? [...data.penjualan_details]
        : Array.isArray(data.penjualan?.items)
          ? [...data.penjualan.items]
          : [];

      const resepDetails = Array.isArray(data.dokter_soap?.resep_details)
        ? data.dokter_soap.resep_details
        : Array.isArray(data.dokterSoap?.resepDetails)
          ? data.dokterSoap.resepDetails
          : [];

      const existingResepIds = new Set(
        rows
          .map((item) => item.source_resep_detail_id)
          .filter(Boolean)
          .map((id) => String(id)),
      );

      resepDetails.forEach((item) => {
        const resepId = item.id || null;
        if (resepId && existingResepIds.has(String(resepId))) return;

        rows.push({
          id: null,
          source_type: 2,
          source_resep_id: item.soap_id || null,
          source_resep_detail_id: resepId,
          source_karyawan_id: data.dokter_awal_id || data.dokter_id || null,
          is_saran_dokter: item.is_saran_dokter ?? 1,
          produk_toko_id: item.produk_toko_id || null,
          produk_id: item.produk_id || null,
          tempat_produk_id: item.tempat_produk_id || null,
          stock_reservasi_id: item.stock_reservasi_id || null,
          nama_produk: item.nama_produk || item.produk?.nama || "",
          harga: item.harga || 0,
          jumlah: item.jumlah || 1,
          subtotal:
            item.total || Number(item.harga || 0) * Number(item.jumlah || 1),
          frekuensi_penggunaan: item.frekuensi || "",
          waktu_penggunaan: item.waktu_pakai || "",
          instruksi_pemakaian: item.penggunaan || "",
        });
      });

      return rows;
    },
    extractRows(response) {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.rows)) return response.rows;
      if (Array.isArray(response?.items)) return response.items;
      return [];
    },
    toDateInputValue(value) {
      if (!value) return "";
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        if (/^\d{4}-\d{2}-\d{2}[ T]/.test(trimmed)) return trimmed.slice(0, 10);
        const parsedSlash = trimmed.match(
          /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/,
        );
        if (parsedSlash) {
          const [, day, month, year] = parsedSlash;
          return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 10);
    },
    getHeaderDateValue(data = {}, invoice = {}) {
      return this.toDateInputValue(
        data.tanggal_kunjungan ||
          data.tanggal ||
          data.registered_at ||
          invoice.tanggal_kunjungan ||
          invoice.tanggal ||
          invoice.tanggal_invoice_date ||
          invoice.tanggal_invoice ||
          invoice.created_at ||
          "",
      );
    },
    normalizeVoucherEligibleResponse(response = {}) {
      const data = response?.data?.data || response?.data || response || {};

      const normalizeGroup = (items, fallbackJenisVoucherId = null) => {
        return Array.isArray(items)
          ? items.map((item) =>
              this.normalizeVoucherPromo(item, fallbackJenisVoucherId),
            )
          : [];
      };

      return {
        treatment: normalizeGroup(data.treatment, 1),
        produk: normalizeGroup(data.produk, 2),
        bundling: normalizeGroup(data.bundling, 3),
        value: normalizeGroup(data.value, 4),
        all: normalizeGroup(data.all, null),
      };
    },

    normalizeVoucherPromo(item = {}, fallbackJenisVoucherId = null) {
      const raw =
        item.raw || item.voucher || item.master_voucher_diskon || item;

      const id = this.firstDefined(
        item.id,
        item.voucher_id,
        item.master_voucher_diskon_id,
        raw.id,
        raw.voucher_id,
        raw.master_voucher_diskon_id,
      );

      const tipeDiskon = this.firstDefined(
        item.tipe_diskon,
        item.diskon_tipe,
        item.type,
        raw.tipe_diskon,
        raw.diskon_tipe,
        raw.type,
        "",
      );

      const totalDiskon = this.toPromoNumber(
        this.firstDefined(
          item.total_diskon,
          item.diskon_nilai,
          item.nilai_diskon,
          item.value,
          raw.total_diskon,
          raw.diskon_nilai,
          raw.nilai_diskon,
          raw.value,
          0,
        ),
      );

      const totalDiskonMaksimal = this.toPromoNumber(
        this.firstDefined(
          item.total_diskon_maksimal,
          item.diskon_maksimal,
          item.maksimal_diskon,
          item.max_diskon,
          item.maximum_discount,
          item.max_discount,
          item.max_nominal,
          item.maksimal_potongan,
          raw.total_diskon_maksimal,
          raw.diskon_maksimal,
          raw.maksimal_diskon,
          raw.max_diskon,
          raw.maximum_discount,
          raw.max_discount,
          raw.max_nominal,
          raw.maksimal_potongan,
          0,
        ),
      );

      return {
        ...item,
        id,
        voucher_id: this.firstDefined(
          item.voucher_id,
          item.master_voucher_diskon_id,
          id,
        ),
        master_voucher_diskon_id: this.firstDefined(
          item.master_voucher_diskon_id,
          item.voucher_id,
          id,
        ),
        nama_voucher: this.firstDefined(
          item.nama_voucher,
          item.nama,
          item.title,
          raw.nama_voucher,
          raw.nama,
          raw.title,
          "-",
        ),
        kode_voucher: this.firstDefined(
          item.kode_voucher,
          item.kode,
          item.code,
          raw.kode_voucher,
          raw.kode,
          raw.code,
          null,
        ),
        jenis_voucher_id: this.toPromoNumber(
          this.firstDefined(
            item.jenis_voucher_id,
            item.jenis_id,
            item.voucher_jenis_id,
            item.master_voucher_diskon_jenis_id,
            raw.jenis_voucher_id,
            raw.jenis_id,
            raw.voucher_jenis_id,
            raw.master_voucher_diskon_jenis_id,
            fallbackJenisVoucherId,
            0,
          ),
        ),
        tipe_diskon: tipeDiskon,
        total_diskon: totalDiskon,
        total_diskon_maksimal: totalDiskonMaksimal,
        is_bisa_digabung_promo: this.firstDefined(
          item.is_bisa_digabung_promo,
          raw.is_bisa_digabung_promo,
          0,
        ),
        diskon_amount: 0,
        raw,
      };
    },

    extractInvoicePromos(data = {}) {
      const invoice = data.invoice || data.pembayaran_invoice || {};
      const candidates = [
        invoice.promo,
        invoice.promos,
        invoice.voucher,
        invoice.voucher_list,
        data.promo,
        data.promos,
        data.voucher,
        data.voucher_list,
      ];

      const selected = candidates.find((items) => Array.isArray(items));
      return selected || [];
    },
    mapAppliedPromosFromInvoice(data = {}) {
      const promos = this.extractInvoicePromos(data)
        .filter((promo) => Number(promo.is_delete || 0) !== 1)
        .map((promo) =>
          this.normalizeVoucherPromo({
            ...promo,
            id:
              promo.voucher_id ||
              promo.master_voucher_diskon_id ||
              promo.id ||
              null,
            voucher_id:
              promo.voucher_id ||
              promo.master_voucher_diskon_id ||
              promo.id ||
              null,
            nama:
              promo.nama_voucher ||
              promo.nama ||
              promo.label ||
              promo.kode_voucher ||
              "Voucher",
            nama_voucher:
              promo.nama_voucher ||
              promo.nama ||
              promo.label ||
              promo.kode_voucher ||
              "Voucher",
            kode_voucher:
              promo.kode_voucher || promo.kode || promo.code || null,
            tipe_diskon:
              promo.tipe_diskon || promo.diskon_tipe || promo.type || null,
            total_diskon: this.firstDefined(
              promo.diskon_nilai,
              promo.total_diskon,
              promo.nilai_diskon,
              promo.value,
              0,
            ),
            total_diskon_maksimal: this.firstDefined(
              promo.total_diskon_maksimal,
              promo.diskon_maksimal,
              promo.maksimal_diskon,
              promo.max_diskon,
              promo.maximum_discount,
              promo.max_discount,
              promo.max_nominal,
              promo.maksimal_potongan,
              promo.raw?.total_diskon_maksimal,
              promo.raw?.diskon_maksimal,
              0,
            ),
            diskon_amount: 0,
            raw:
              promo.raw ||
              promo.voucher ||
              promo.master_voucher_diskon ||
              promo,
          }),
        );

      this.appliedPromos = promos;
    },
    updateHeaderVoucherInfo() {
      const appliedNames = this.appliedPromos
        .map(
          (promo) =>
            promo.nama_voucher ||
            promo.nama ||
            promo.kode_voucher ||
            promo.kode,
        )
        .filter(Boolean);

      const eligibleCount = this.allPromoList.length;
      const label = appliedNames.length
        ? appliedNames.join(", ")
        : eligibleCount > 0
          ? `${eligibleCount} voucher eligible`
          : "Tidak ada voucher";

      this.header = {
        ...this.header,
        voucher_label: label,
        voucher_count: appliedNames.length || eligibleCount,
      };
    },
    normalizePaymentProdukOption(item = {}) {
      const raw = item?.raw || item || {};
      const produk = raw?.produk || raw?.master_produk || {};
      const produkToko =
        raw?.produk_toko ||
        raw?.produkToko ||
        raw?.master_produk_toko ||
        raw?.masterProdukToko ||
        {};

      const produkTokoId = this.firstDefined(
        raw.produk_toko_id,
        raw.master_produk_toko_id,
        raw.obat_toko_id,
        raw.toko_produk_id,
        produkToko.id,
        raw.id,
        null,
      );
      const produkId = this.firstDefined(
        raw.produk_id,
        raw.obat_id,
        raw.master_produk_id,
        raw.product_id,
        produk.id,
        produk.master_produk_id,
        null,
      );
      const title = this.firstDefined(
        raw.nama_produk,
        raw.produk_nama,
        raw.nama_obat,
        raw.nama,
        produk.nama,
        produk.nama_produk,
        produk.nama_obat,
        raw.title,
        raw.label,
        "-",
      );
      const value = produkTokoId
        ? `pt:${produkTokoId}`
        : produkId
          ? `p:${produkId}`
          : `n:${title}`;

      return {
        ...raw,
        id: Number(produkId || 0) || null,
        produk_id: Number(produkId || 0) || null,
        produk_toko_id: Number(produkTokoId || 0) || null,
        value,
        title,
        label: title,
        harga: Number(raw.harga_jual || raw.harga || raw.harga_produk || 0),
        unit:
          raw.satuan ||
          raw.satuan_nama ||
          raw.nama_satuan ||
          produk?.satuan?.nama ||
          produk?.satuan?.nama_satuan ||
          "pcs",
        raw,
      };
    },

    resolveProdukTokoId(source = {}) {
      const row = source?.raw || source || {};
      const produkToko =
        row?.produk_toko ||
        row?.produkToko ||
        row?.master_produk_toko ||
        row?.masterProdukToko ||
        {};

      const value = this.firstDefined(
        source?.produk_toko_id,
        source?.master_produk_toko_id,
        source?.obat_toko_id,
        source?.toko_produk_id,
        row?.produk_toko_id,
        row?.master_produk_toko_id,
        row?.obat_toko_id,
        row?.toko_produk_id,
        produkToko?.id,
        null,
      );

      return Number(value || 0) || null;
    },

    resolveProdukId(source = {}) {
      const row = source?.raw || source || {};
      const produk = row?.produk || row?.master_produk || {};

      const value = this.firstDefined(
        source?.produk_id,
        source?.obat_id,
        source?.master_produk_id,
        source?.product_id,
        row?.produk_id,
        row?.obat_id,
        row?.master_produk_id,
        row?.product_id,
        produk?.id,
        produk?.master_produk_id,
        null,
      );

      return Number(value || 0) || null;
    },

    normalizeLookupText(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    },

    normalizeMetodeBayar(item = {}) {
      return {
        id: item.id,
        kode:
          item.kode ||
          item.kode_metode ||
          item.code ||
          item.nama ||
          item.nama_metode ||
          "",
        nama:
          item.nama ||
          item.nama_metode ||
          item.nama_metode_bayar ||
          item.nama_akun ||
          item.label ||
          "-",
        tipe: item.tipe || item.tipe_metode || item.jenis || null,
        raw: item,
      };
    },
    resolveConsultationSubtotal(data = {}, invoice = {}) {
      const items = this.extractInvoiceItems(data);
      const itemTotal = items
        .filter(
          (item) =>
            Number(item.item_type || 0) === 1 &&
            Number(item.is_delete || 0) !== 1,
        )
        .reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

      const candidates = [
        invoice.subtotal_konsultasi,
        data.subtotal_konsultasi,
        data.total_konsultasi,
        itemTotal,
      ];

      for (const value of candidates) {
        const amount = Number(value || 0);
        if (amount > 0) return amount;
      }

      return 0;
    },
    resolveHasKonsultasi(data = {}, invoice = {}) {
      const channel = String(
        data.channel_konsultasi ||
          data.konsultasi_source_code ||
          invoice.konsultasi_source_code ||
          "",
      ).toLowerCase();

      return (
        Number(data.ada_konsultasi || data.layanan?.ada_konsultasi || 0) ===
          1 ||
        Number(data.is_konsultasi || invoice.is_konsultasi || 0) === 1 ||
        Number(
          data.is_konsultasi_online || invoice.is_konsultasi_online || 0,
        ) === 1 ||
        ["offline", "online", "sppg", "spkk", "konsultasi"].includes(channel) ||
        this.resolveConsultationSubtotal(data, invoice) > 0
      );
    },
    mapHeaderFromRegistrasi(data) {
      const invoice = data.invoice || data.pembayaran_invoice || {};
      const jenisTransaksiId = Number(
        invoice.jenis_transaksi ?? data.jenis_transaksi ?? 0,
      );
      const jenisTransaksi = this.getJenisTransaksiById(jenisTransaksiId);
      const sumberInformasiId =
        invoice.sumber_informasi_id ||
        data.sumber_informasi_id ||
        data.pasien?.sumber_informasi_id ||
        this.getDefaultSumberInformasiId(data.pasien);
      const sumberInformasi = this.getSumberInformasiById(sumberInformasiId);

      this.header = {
        ...this.header,
        registrasi_id: data.registrasi_id || data.id || null,
        invoice_id: invoice.id || invoice.invoice_id || data.invoice_id || null,
        invoice_no:
          invoice.no_invoice ||
          invoice.nomor_invoice ||
          invoice.invoice_number ||
          "",
        kode_registrasi: data.kode_registrasi || invoice.kode_registrasi || "",
        toko_id: data.toko_id || null,
        tanggal: this.getHeaderDateValue(data, invoice),
        pasien_id: data.pasien_id || data.pasien_new_id || null,
        pasien_nama: data.pasien?.nama || data.nama_pasien || "",
        pasien_no_rm: data.pasien?.no_rm || data.no_rm || "",
        pasien_no_hp:
          data.pasien?.no_hp ||
          data.pasien?.no_wa ||
          data.no_hp ||
          invoice.pasien_no_hp ||
          "",
        pasien_no_wa: data.pasien?.no_wa || invoice.pasien_no_wa || "",
        pasien_no_telp: data.pasien?.no_telp || invoice.pasien_no_telp || "",
        member_id: invoice.member_id || data.member_id || null,
        member_no: invoice.member_no || data.member_no || "",
        member_tier_nama:
          invoice.member_tier_nama || data.member_tier_nama || "",
        diskon_member_amount: Number(
          invoice.diskon_member_amount || data.diskon_member_amount || 0,
        ),
        point_earned: Number(invoice.point_earned || data.point_earned || 0),
        poin: Number(
          invoice.poin ||
            invoice.point_earned ||
            data.pasien?.poin ||
            data.poin ||
            0,
        ),
        dokter_id: data.dokter_awal_id || data.dokter_id || null,
        dokter_nama: data.dokter_awal?.nama || data.dokter?.nama || "-",
        perawat_id: data.perawat_awal_id || data.perawat_id || null,
        perawat_nama: data.perawat_awal?.nama || data.perawat?.nama || "-",
        jenis_transaksi_id: jenisTransaksiId,
        jenis_transaksi: jenisTransaksi?.title || "Umum",
        jenis_transaksi_kode: jenisTransaksi?.kode || null,
        sumber_informasi_id: sumberInformasi?.id || sumberInformasiId || null,
        sumber_informasi_kode: sumberInformasi?.kode || null,
        sumber:
          invoice.sumber_kedatangan ||
          data.sumber_kedatangan ||
          sumberInformasi?.title ||
          this.getSumberKedatanganLabel(data.pasien),
        voucher_label:
          invoice.voucher_label ||
          invoice.voucher_nama ||
          this.extractInvoicePromos(data)
            .map(
              (promo) =>
                promo.nama_voucher ||
                promo.nama ||
                promo.kode_voucher ||
                promo.kode,
            )
            .filter(Boolean)
            .join(", ") ||
          this.header.voucher_label ||
          "-",
        voucher_count:
          this.extractInvoicePromos(data).length ||
          this.header.voucher_count ||
          0,
        catatan: invoice.catatan || data.catatan_registrasi || "",
        referensi_dokter_id: invoice.referensi_dokter_id || null,
        deposit_expired_option_id: invoice.deposit_expired_option_id || null,
        deposit_expired_at: invoice.deposit_expired_at || null,
        has_konsultasi: this.resolveHasKonsultasi(data, invoice),
        subtotal_konsultasi: this.resolveConsultationSubtotal(data, invoice),
      };
    },
    mapPenjualanFromRegistrasi(data) {
      const invoiceItems = this.extractInvoiceItems(data).filter(
        (item) =>
          Number(item.item_type || 0) === 3 &&
          Number(item.is_delete || 0) !== 1,
      );

      const source = invoiceItems.length
        ? invoiceItems
        : this.mergePenjualanDetailsWithResep(data);

      this.penjualanItems = source.map((item) =>
        this.mapPenjualanItemFromSource(item, invoiceItems.length > 0),
      );
    },
    mapPenjualanItemFromSource(item, fromInvoice = false) {
      const diskonType = this.resolveDiskonType(
        item.diskon_type || item.diskon_tipe || item.diskon_tipe_kode,
      );
      const diskonValue = Number(
        item.diskon || item.diskon_nilai || item.diskon_value || 0,
      );

      const frekuensi = this.normalizeFrekuensiPenggunaan(
        item.frekuensi ||
          item.frekuensi_penggunaan ||
          item.frekuensi_pakai ||
          "",
      );
      const waktuPakai = this.normalizeWaktuPakai(
        item.waktu_pakai || item.waktu_penggunaan || item.waktu_pemakaian || "",
      );
      const penggunaan =
        item.instruksi_pemakaian ||
        item.penggunaan ||
        [frekuensi, waktuPakai].filter(Boolean).join(" - ");

      return {
        invoice_item_id: fromInvoice ? item.id || null : null,
        registrasi_penjualan_detail_id: fromInvoice
          ? item.source_detail_id || null
          : item.id || null,
        source_type: item.source_type || null,
        source_resep_id: item.source_resep_id || null,
        source_resep_detail_id: item.source_resep_detail_id || null,
        produk_toko_id:
          item.produk_toko_id ||
          item.master_produk_toko_id ||
          item.obat_toko_id ||
          null,
        produk_id:
          item.produk_id || item.master_produk_id || item.obat_id || null,
        tempat_produk_id: item.tempat_produk_id || null,
        stock_reservasi_id: item.stock_reservasi_id || null,
        nama:
          item.nama_item ||
          item.nama_produk ||
          item.produk_nama ||
          item.nama_obat ||
          item.produk?.nama ||
          item.master_produk?.nama ||
          "",
        harga: Number(item.harga || item.harga_jual || item.subtotal || 0),
        qty: Number(item.qty || item.jumlah || 1),
        unit: item.satuan || item.unit || "pcs",
        voucher_diskon_id: item.voucher_diskon_id || null,
        voucher_diskon_ids: item.voucher_diskon_id
          ? [item.voucher_diskon_id]
          : [],
        voucher_diskon_nama: "",
        manual_diskon_type: diskonType,
        manual_diskon: diskonValue,
        diskon_referral: Number(item.diskon_referral || 0),
        promo_diskon_amount: Number(item.promo_diskon_amount || 0),
        source_subtotal: fromInvoice
          ? this.resolveInvoiceItemSourceSubtotal(item)
          : null,
        use_source_subtotal:
          fromInvoice && this.resolveInvoiceItemSourceSubtotal(item) !== null,
        diskon_type: diskonType,
        diskon: diskonValue,
        frekuensi,
        waktu_pakai: waktuPakai,
        penggunaan,
      };
    },
    mapTreatmentFromRegistrasi(data) {
      const invoiceItems = this.extractInvoiceItems(data).filter(
        (item) =>
          Number(item.item_type || 0) === 2 &&
          Number(item.is_delete || 0) !== 1,
      );

      const source = invoiceItems.length
        ? invoiceItems
        : Array.isArray(data.treatment_details)
          ? data.treatment_details
          : Array.isArray(data.treatment?.items)
            ? data.treatment.items
            : [];

      this.treatmentItems = source.map((item) =>
        this.mapTreatmentItemFromSource(item, data, invoiceItems.length > 0),
      );
    },
    mapTreatmentItemFromSource(item, data = {}, fromInvoice = false) {
      const diskonType = this.resolveDiskonType(
        item.diskon_type || item.diskon_tipe || item.diskon_tipe_kode,
      );
      const diskonValue = Number(
        item.diskon || item.diskon_nilai || item.diskon_value || 0,
      );
      const harga = this.resolveTreatmentHarga(item);

      return {
        invoice_item_id: fromInvoice ? item.id || null : null,
        registrasi_treatment_detail_id: fromInvoice
          ? item.source_detail_id || null
          : item.id || null,
        treatment_toko_id:
          item.treatment_toko_id || item.master_treatment_toko_id || null,
        treatment_id: item.treatment_id || item.master_treatment_id || null,
        nama:
          item.nama_item ||
          item.nama_treatment ||
          item.treatment_nama ||
          item.master_treatment?.nama ||
          item.treatment?.nama ||
          "",
        qty: Number(item.qty || item.jumlah || 1),
        beautician: data.perawat_awal?.nama || item.perawat?.nama || null,
        beautician_id: data.perawat_awal_id || item.perawat_id || null,
        harga,
        voucher_diskon_id: item.voucher_diskon_id || null,
        voucher_diskon_ids: item.voucher_diskon_id
          ? [item.voucher_diskon_id]
          : [],
        voucher_diskon_nama: "",
        manual_diskon_type: diskonType,
        manual_diskon: diskonValue,
        diskon_referral: Number(item.diskon_referral || 0),
        promo_diskon_amount: Number(item.promo_diskon_amount || 0),
        source_subtotal: fromInvoice
          ? this.resolveInvoiceItemSourceSubtotal(item)
          : null,
        use_source_subtotal:
          fromInvoice && this.resolveInvoiceItemSourceSubtotal(item) !== null,
        diskon_type: diskonType,
        diskon: diskonValue,
      };
    },
    resolveDiskonType(value) {
      const text = String(value ?? "")
        .trim()
        .toLowerCase();

      if (["2", "rp", "rupiah", "nominal"].includes(text)) {
        return "Rp";
      }

      return "%";
    },
    getJenisTransaksiById(value) {
      return this.jenisTransaksiList.find(
        (item) => Number(item.value) === Number(value),
      );
    },
    getSumberInformasiById(value) {
      return this.sumberInformasiList.find(
        (item) => Number(item.value) === Number(value),
      );
    },
    getDefaultSumberInformasiId(pasien) {
      const targetName = this.getSumberKedatanganLabel(pasien);
      const selected = this.sumberInformasiList.find(
        (item) => String(item.title).toLowerCase() === targetName.toLowerCase(),
      );
      return selected?.value || null;
    },
    getSumberKedatanganLabel(pasien) {
      if (!pasien) return "Pelanggan Lama";
      return Number(pasien.tipe_pasien || 0) === 1
        ? "Pelanggan Baru"
        : "Pelanggan Lama";
    },
    normalizeFrekuensiPenggunaan(value) {
      const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/^(\d+)x\s+sehari$/, "$1 x sehari")
        .replace(/^(\d+)\s*x\s*sehari$/, "$1 x sehari");

      const selected = this.frekuensiList.find(
        (item) => String(item.value).toLowerCase() === normalized,
      );
      if (selected) return selected.value;

      const selectedByTitle = this.frekuensiList.find(
        (item) => String(item.title).toLowerCase() === normalized,
      );
      return selectedByTitle?.value || normalized;
    },
    normalizeWaktuPakai(value) {
      const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s*-\s*/g, " - ")
        .replace(/\s+/g, " ");

      const selected = this.waktuPakaiList.find(
        (item) => String(item.value).toLowerCase() === normalized,
      );
      if (selected) return selected.value;

      const selectedByTitle = this.waktuPakaiList.find(
        (item) => String(item.title).toLowerCase() === normalized,
      );
      return selectedByTitle?.value || normalized;
    },
    isPerawat(item) {
      const jabatanNama = String(
        item.jabatan?.nama ||
          item.jabatan_nama ||
          item.nama_jabatan ||
          item.role_name ||
          "",
      ).toLowerCase();
      const jabatanId = Number(item.jabatan_id || 0);
      return (
        jabatanNama.includes("perawat") ||
        jabatanNama.includes("beautician") ||
        jabatanNama.includes("nurse") ||
        jabatanId === 2
      );
    },
    isDokter(item) {
      const jabatanNama = String(
        item.jabatan?.nama ||
          item.jabatan_nama ||
          item.nama_jabatan ||
          item.role_name ||
          "",
      ).toLowerCase();
      const jabatanId = Number(item.jabatan_id || 0);
      return (
        jabatanNama.includes("dokter") ||
        jabatanNama.includes("doctor") ||
        jabatanId === 1
      );
    },
    updateHeaderField({ field, value }) {
      this.header[field] = value;
      if (field === "jenis_transaksi_id") {
        this.depositSelectionConfirmed = false;
        this.selectedDepositTreatmentItemIds = [];
      }

      if (field === "jenis_transaksi_id" && Number(value || 0) !== 4) {
        this.header.referensi_dokter_id = null;
        this.header.deposit_expired_option_id = null;
        this.header.deposit_expired_at = null;
      }
    },
    updateDiskonSubtotal({ field, value }) {
      this.activateLiveSummaryCalculation();
      this.diskonSubtotal[field] =
        field === "value" ? Number(value || 0) : value;
    },
    updatePenjualanItemField({ index, field, value }) {
      if (!this.penjualanItems[index]) return;
      this.activateLiveSummaryCalculation();
      if (["diskon_type", "diskon"].includes(field)) return;
      if (field === "waktu_pakai") {
        this.penjualanItems[index][field] = this.normalizeWaktuPakai(value);
        return;
      }
      this.penjualanItems[index][field] = ["harga", "qty"].includes(field)
        ? Number(value || 0)
        : value;
      if (
        ["harga", "qty", "produk_id", "produk_toko_id", "nama"].includes(field)
      ) {
        this.penjualanItems[index].source_subtotal = null;
        this.penjualanItems[index].use_source_subtotal = false;
      }
      if (["harga", "qty"].includes(field)) {
        this.recalculatePromoEffects();
      }
      if (["produk_id", "produk_toko_id", "nama"].includes(field)) {
        this.resetPromo();
        this.fetchVoucherEligible();
      }
    },
    updateTreatmentItemField({ index, field, value }) {
      if (!this.treatmentItems[index]) return;
      this.activateLiveSummaryCalculation();
      if (field === "beautician") {
        const selected = this.perawatList.find(
          (item) => String(item.title) === String(value),
        );
        this.treatmentItems[index] = {
          ...this.treatmentItems[index],
          beautician: selected?.title || value,
          beautician_id: selected?.id || null,
        };
        return;
      }
      if (["diskon_type", "diskon"].includes(field)) return;
      this.treatmentItems[index][field] = ["harga", "qty"].includes(field)
        ? Number(value || 0)
        : value;
      if (
        ["harga", "qty", "treatment_id", "treatment_toko_id", "nama"].includes(
          field,
        )
      ) {
        this.treatmentItems[index].source_subtotal = null;
        this.treatmentItems[index].use_source_subtotal = false;
      }
      if (["harga", "qty"].includes(field)) {
        this.recalculatePromoEffects();
      }
      if (["treatment_id", "treatment_toko_id", "nama"].includes(field)) {
        this.resetPromo();
        this.fetchVoucherEligible();
      }
    },
    addPenjualanItem() {
      this.activateLiveSummaryCalculation();
      this.penjualanItems.push({
        registrasi_penjualan_detail_id: null,
        produk_toko_id: null,
        produk_id: null,
        nama: null,
        harga: 0,
        qty: 1,
        unit: "pcs",
        voucher_diskon_id: null,
        voucher_diskon_ids: [],
        voucher_diskon_nama: "",
        manual_diskon_type: "%",
        manual_diskon: 0,
        promo_diskon_amount: 0,
        source_subtotal: null,
        use_source_subtotal: false,
        diskon_type: "%",
        diskon: 0,
        frekuensi: "",
        waktu_pakai: "",
        penggunaan: "",
      });
    },
    removePenjualanItem(index) {
      this.activateLiveSummaryCalculation();
      this.penjualanItems.splice(index, 1);
      this.resetPromo();
      this.fetchVoucherEligible();
    },
    fillObat(index) {
      this.activateLiveSummaryCalculation();
      const item = this.penjualanItems[index];
      const selected = this.findObatOption(item?.nama, item);
      if (!selected) return;

      this.penjualanItems[index] = {
        ...item,
        produk_id: Number(this.resolveProdukId(selected) || 0) || null,
        produk_toko_id: Number(this.resolveProdukTokoId(selected) || 0) || null,
        nama: selected.title,
        harga: Number(selected.harga || selected.raw?.harga_jual || 0),
        unit: selected.unit || selected.raw?.nama_satuan || "pcs",
        voucher_diskon_id: null,
        voucher_diskon_ids: [],
        voucher_diskon_nama: "",
        manual_diskon_type: "%",
        manual_diskon: 0,
        promo_diskon_amount: 0,
        source_subtotal: null,
        use_source_subtotal: false,
        diskon_type: "%",
        diskon: 0,
      };
      this.resetPromo();
      this.fetchVoucherEligible();
    },
    addTreatmentItem() {
      this.activateLiveSummaryCalculation();
      this.treatmentItems.push({
        registrasi_treatment_detail_id: null,
        treatment_toko_id: null,
        treatment_id: null,
        nama: null,
        qty: 1,
        beautician: null,
        beautician_id: null,
        harga: 0,
        voucher_diskon_id: null,
        voucher_diskon_ids: [],
        voucher_diskon_nama: "",
        manual_diskon_type: "%",
        manual_diskon: 0,
        promo_diskon_amount: 0,
        source_subtotal: null,
        use_source_subtotal: false,
        diskon_type: "%",
        diskon: 0,
      });
    },
    removeTreatmentItem(index) {
      this.activateLiveSummaryCalculation();
      this.treatmentItems.splice(index, 1);
      this.resetPromo();
      this.fetchVoucherEligible();
    },
    fillTreatment(index) {
      this.activateLiveSummaryCalculation();
      const item = this.treatmentItems[index];
      const selected = this.findTreatmentOption(item?.nama, item);
      if (!selected) return;

      this.treatmentItems[index] = {
        ...item,
        treatment_id:
          Number(selected.id || selected.raw?.treatment_id || 0) || null,
        treatment_toko_id:
          Number(
            selected.treatment_toko_id || selected.raw?.treatment_toko_id || 0,
          ) || null,
        nama: selected.title,
        harga: Number(
          selected.harga ||
            selected.raw?.tarif ||
            selected.raw?.harga_terendah ||
            0,
        ),
        voucher_diskon_id: null,
        voucher_diskon_ids: [],
        voucher_diskon_nama: "",
        manual_diskon_type: "%",
        manual_diskon: 0,
        promo_diskon_amount: 0,
        source_subtotal: null,
        use_source_subtotal: false,
        diskon_type: "%",
        diskon: 0,
      };
      this.resetPromo();
      this.fetchVoucherEligible();
    },
    getItemDiscount(item) {
      const value = Number(item.diskon || item.manual_diskon || 0);
      const gross = Number(item.harga || 0) * Number(item.qty || 0);
      if ((item.diskon_type || item.manual_diskon_type) === "%") {
        return Math.min((gross * value) / 100, gross);
      }
      return Math.min(value, gross);
    },
    getPenjualanSubtotal(item) {
      if (
        item?.use_source_subtotal &&
        item?.source_subtotal !== null &&
        item?.source_subtotal !== undefined
      ) {
        return Math.max(Number(item.source_subtotal || 0), 0);
      }

      const gross = Number(item.harga || 0) * Number(item.qty || 0);
      return Math.max(
        gross -
          this.getItemDiscount(item) -
          Number(item.diskon_referral || 0) -
          Number(item.promo_diskon_amount || 0),
        0,
      );
    },
    getPenjualanDisplaySubtotal(item) {
      const subtotal = Number(this.getPenjualanSubtotal(item) || 0);
      const voucherAmount = Number(
        this.getItemVoucherDiscountAmount(item, "produk") || 0,
      );

      return Math.max(subtotal - voucherAmount, 0);
    },

    getTreatmentDisplaySubtotal(item) {
      const subtotal = Number(this.getTreatmentSubtotal(item) || 0);
      const voucherAmount = Number(
        this.getItemVoucherDiscountAmount(item, "treatment") || 0,
      );

      return Math.max(subtotal - voucherAmount, 0);
    },

    getProdukVoucherDiscountType(item) {
      return this.getItemVoucherDiscountType(item, "produk");
    },

    getTreatmentVoucherDiscountType(item) {
      return this.getItemVoucherDiscountType(item, "treatment");
    },

    getProdukVoucherDiscountValue(item) {
      return this.getItemVoucherDiscountValue(item, "produk");
    },

    getTreatmentVoucherDiscountValue(item) {
      return this.getItemVoucherDiscountValue(item, "treatment");
    },

    getItemVoucherDiscountType(item, itemType) {
      const promos = this.getItemVoucherPromos(item, itemType);

      if (!promos.length) {
        return item.diskon_type || item.manual_diskon_type || "%";
      }

      if (
        promos.length === 1 &&
        this.isPercentDiscountType(
          promos[0].tipe_diskon || promos[0].diskon_tipe,
        )
      ) {
        return "%";
      }

      return "Rp";
    },

    getItemVoucherDiscountValue(item, itemType) {
      const promos = this.getItemVoucherPromos(item, itemType);

      if (!promos.length) {
        return Number(item.diskon || item.manual_diskon || 0);
      }

      if (
        promos.length === 1 &&
        this.isPercentDiscountType(
          promos[0].tipe_diskon || promos[0].diskon_tipe,
        )
      ) {
        return Number(promos[0].total_diskon || promos[0].diskon_nilai || 0);
      }

      return this.getItemVoucherDiscountAmount(item, itemType);
    },

    getItemVoucherDiscountAmount(item, itemType) {
      const subtotal =
        itemType === "produk"
          ? Number(this.getPenjualanSubtotal(item) || 0)
          : Number(this.getTreatmentSubtotal(item) || 0);

      if (subtotal <= 0) {
        return 0;
      }

      const promos = this.getItemVoucherPromos(item, itemType);

      return promos.reduce((total, promo) => {
        return (
          total +
          this.calculatePromoAmountForItem(promo, item, itemType, subtotal)
        );
      }, 0);
    },

    getItemVoucherPromos(item, itemType) {
      return (this.appliedPromos || []).filter((promo) => {
        const promoKind = this.getPromoKind(promo);

        if (itemType === "produk" && promoKind !== "produk") {
          return false;
        }

        if (itemType === "treatment" && promoKind !== "treatment") {
          return false;
        }

        return this.promoMatchesItem(promo, item, itemType);
      });
    },

    promoMatchesItem(promo, item, itemType) {
      const targets = this.getPromoItemTargetIds(promo, itemType);

      if (targets.length) {
        const itemIds =
          itemType === "produk"
            ? [
                item.produk_id,
                item.produk_toko_id,
                item.item_id,
                item.id,
                item.invoice_item_id,
              ]
            : [
                item.treatment_id,
                item.treatment_toko_id,
                item.item_id,
                item.id,
                item.invoice_item_id,
              ];

        return itemIds
          .filter(
            (value) => value !== null && value !== undefined && value !== "",
          )
          .map((value) => String(value))
          .some((value) => targets.includes(value));
      }

      const promoText = this.normalizePromoText(
        [promo?.nama_voucher, promo?.kode_voucher, promo?.deskripsi]
          .filter(Boolean)
          .join(" "),
      );

      const itemName = this.normalizePromoText(
        item?.nama || item?.nama_produk || item?.nama_treatment || "",
      );

      if (promoText && itemName && promoText.includes(itemName)) {
        return true;
      }

      const list =
        itemType === "produk"
          ? this.penjualanItems || []
          : this.treatmentItems || [];

      return list.length === 1;
    },

    getPromoItemTargetIds(promo, itemType) {
      const ids = [];

      const pushValue = (value) => {
        if (value !== null && value !== undefined && value !== "") {
          ids.push(String(value));
        }
      };

      const directKeys =
        itemType === "produk"
          ? ["produk_id", "product_id", "master_produk_id", "item_id"]
          : ["treatment_id", "master_treatment_id", "item_id"];

      directKeys.forEach((key) => pushValue(promo?.[key]));

      const arrayKeys =
        itemType === "produk"
          ? ["produk_ids", "product_ids", "master_produk_ids", "item_ids"]
          : ["treatment_ids", "master_treatment_ids", "item_ids"];

      arrayKeys.forEach((key) => {
        if (Array.isArray(promo?.[key])) {
          promo[key].forEach(pushValue);
        }
      });

      const itemArrays = [
        promo?.items,
        promo?.voucher_items,
        promo?.voucher_item,
        promo?.master_voucher_diskon_items,
        promo?.detail_items,
      ];

      itemArrays.forEach((rows) => {
        if (!Array.isArray(rows)) return;

        rows.forEach((row) => {
          const rowType = this.normalizePromoText(
            row?.item_type || row?.type || row?.jenis || "",
          );

          const isProduk =
            itemType === "produk" &&
            (rowType.includes("produk") ||
              rowType.includes("product") ||
              rowType.includes("obat"));

          const isTreatment =
            itemType === "treatment" &&
            (rowType.includes("treatment") || rowType.includes("perawatan"));

          if (!rowType || isProduk || isTreatment) {
            pushValue(row?.item_id);
            pushValue(row?.produk_id);
            pushValue(row?.product_id);
            pushValue(row?.treatment_id);
            pushValue(row?.master_produk_id);
            pushValue(row?.master_treatment_id);
          }
        });
      });

      return [...new Set(ids)];
    },

    calculatePromoAmountForItem(promo, item, itemType, baseSubtotal) {
      const tipeDiskon = this.getPromoDiscountType(promo);
      const nilaiDiskon = this.getPromoDiscountValue(promo);
      const maxDiscount = this.getPromoMaxDiscount(promo);
      const subtotal = this.toPromoNumber(baseSubtotal);

      if (subtotal <= 0 || nilaiDiskon <= 0) {
        return 0;
      }

      if (this.isPercentDiscountType(tipeDiskon)) {
        const calculated = (subtotal * nilaiDiskon) / 100;
        const capped =
          maxDiscount > 0 ? Math.min(calculated, maxDiscount) : calculated;

        return Math.min(capped, subtotal);
      }

      return Math.min(nilaiDiskon, subtotal);
    },

    isPercentDiscountType(value) {
      const text = String(value || "")
        .toLowerCase()
        .trim();

      return ["percent", "persen", "%", "1"].includes(text);
    },

    normalizePromoText(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    },
    getTreatmentSubtotal(item) {
      if (
        item?.use_source_subtotal &&
        item?.source_subtotal !== null &&
        item?.source_subtotal !== undefined
      ) {
        return Math.max(Number(item.source_subtotal || 0), 0);
      }

      const harga = this.resolveTreatmentHarga(item);
      const gross = Number(harga || 0) * Number(item.qty || 0);
      return Math.max(
        gross -
          this.getItemDiscount({ ...item, harga }) -
          Number(item.diskon_referral || 0) -
          Number(item.promo_diskon_amount || 0),
        0,
      );
    },
    getPromoEligibleBase(promo) {
      const itemBase = this.getPromoMatchedItemBase(promo);
      const subtotal = Number(this.subtotal || 0);
      const subtotalDiscount = Number(this.subtotalDiscountAmount || 0);

      if (subtotal <= 0 || itemBase <= 0) return 0;

      const discountShare = (subtotalDiscount * itemBase) / subtotal;
      return Math.max(itemBase - discountShare, 0);
    },
    getPromoMatchedItemBase(promo) {
      if (!promo) return 0;

      const kind = this.getPromoKind(promo);
      const hasSpecificItems = this.hasPromoSpecificItems(promo);

      if (hasSpecificItems) {
        const productBase = this.getPromoMatchedPenjualanItems(promo).reduce(
          (sum, item) => sum + this.getPenjualanSubtotal(item),
          0,
        );
        const treatmentBase = this.getPromoMatchedTreatmentItems(promo).reduce(
          (sum, item) => sum + this.getTreatmentSubtotal(item),
          0,
        );

        return productBase + treatmentBase;
      }

      if (kind === "produk") {
        return Number(this.totalPenjualan || 0);
      }

      if (kind === "treatment") {
        return Number(this.totalTreatment || 0);
      }

      return (
        Number(this.totalPenjualan || 0) + Number(this.totalTreatment || 0)
      );
    },
    getPromoKind(promo) {
      if (!promo) return "all";

      const jenis = Number(
        promo.jenis_voucher_id ||
          promo.jenis_id ||
          promo.voucher_jenis_id ||
          promo.master_voucher_diskon_jenis_id ||
          0,
      );

      if (jenis === 1) return "treatment";
      if (jenis === 2) return "produk";
      if (jenis === 3 || jenis === 4) return "all";

      if (
        Number(promo.bisa_produk || 0) === 1 &&
        Number(promo.bisa_treatment || 0) !== 1
      ) {
        return "produk";
      }

      if (
        Number(promo.bisa_treatment || 0) === 1 &&
        Number(promo.bisa_produk || 0) !== 1
      ) {
        return "treatment";
      }

      const key = this.getPromoKey(promo);
      if (key) {
        if (
          this.promoProductList.some((item) => this.getPromoKey(item) === key)
        ) {
          return "produk";
        }

        if (
          this.promoTreatmentList.some((item) => this.getPromoKey(item) === key)
        ) {
          return "treatment";
        }
      }

      return "all";
    },
    getPromoItems(promo) {
      const items =
        promo?.items || promo?.voucher_items || promo?.detail_items || [];
      return Array.isArray(items) ? items : [];
    },
    normalizePromoItemType(value) {
      const text = String(value || "").toLowerCase();

      if (["produk", "product", "obat"].includes(text)) {
        return "produk";
      }

      if (["treatment", "perawatan"].includes(text)) {
        return "treatment";
      }

      return text;
    },
    getPromoSpecificIds(promo, type) {
      return this.getPromoItems(promo)
        .filter(
          (item) =>
            this.normalizePromoItemType(item.item_type || item.type) === type,
        )
        .map((item) =>
          Number(item.item_id || item.produk_id || item.treatment_id || 0),
        )
        .filter((id) => id > 0);
    },
    hasPromoSpecificItems(promo) {
      return this.getPromoItems(promo).some((item) =>
        ["produk", "treatment"].includes(
          this.normalizePromoItemType(item.item_type || item.type),
        ),
      );
    },
    getPromoMatchedPenjualanItems(promo) {
      const ids = this.getPromoSpecificIds(promo, "produk");

      if (!ids.length && !this.hasPromoSpecificItems(promo)) {
        return this.getPromoKind(promo) === "produk" ||
          this.getPromoKind(promo) === "all"
          ? this.penjualanItems
          : [];
      }

      return this.penjualanItems.filter((item) =>
        ids.includes(Number(item.produk_id || 0)),
      );
    },
    getPromoMatchedTreatmentItems(promo) {
      const ids = this.getPromoSpecificIds(promo, "treatment");

      if (!ids.length && !this.hasPromoSpecificItems(promo)) {
        return this.getPromoKind(promo) === "treatment" ||
          this.getPromoKind(promo) === "all"
          ? this.treatmentItems
          : [];
      }

      return this.treatmentItems.filter((item) =>
        ids.includes(Number(item.treatment_id || 0)),
      );
    },
    isPromoEligibleForCurrentItems(promo) {
      if (!promo) return false;

      if (this.hasPromoSpecificItems(promo)) {
        return (
          this.getPromoMatchedPenjualanItems(promo).length > 0 ||
          this.getPromoMatchedTreatmentItems(promo).length > 0
        );
      }

      const kind = this.getPromoKind(promo);

      if (kind === "produk") {
        return this.penjualanItems.some(
          (item) => Number(item.produk_id || 0) > 0,
        );
      }

      if (kind === "treatment") {
        return this.treatmentItems.some(
          (item) => Number(item.treatment_id || 0) > 0,
        );
      }

      return (
        this.penjualanItems.some((item) => Number(item.produk_id || 0) > 0) ||
        this.treatmentItems.some((item) => Number(item.treatment_id || 0) > 0)
      );
    },
    filterPromoListByCurrentItems(list = []) {
      return Array.isArray(list)
        ? list.filter((promo) => this.isPromoEligibleForCurrentItems(promo))
        : [];
    },
    refreshAppliedPromosFromEligibleList() {
      if (!Array.isArray(this.appliedPromos) || !this.appliedPromos.length) {
        return;
      }

      this.appliedPromos = this.appliedPromos.map((promo) => {
        const key = this.getPromoKey(promo);
        const eligible = this.allPromoList.find(
          (item) => this.getPromoKey(item) === key,
        );

        if (!eligible) {
          return this.normalizeVoucherPromo(promo);
        }

        return this.normalizeVoucherPromo({
          ...promo,
          ...eligible,
          kode_voucher:
            promo.kode_voucher ||
            promo.kode ||
            promo.code ||
            eligible.kode_voucher,
          raw: eligible.raw || promo.raw || eligible,
          total_diskon_maksimal: this.firstDefined(
            eligible.total_diskon_maksimal,
            eligible.diskon_maksimal,
            eligible.maksimal_diskon,
            eligible.max_diskon,
            eligible.raw?.total_diskon_maksimal,
            promo.total_diskon_maksimal,
            promo.diskon_maksimal,
            promo.maksimal_diskon,
            promo.max_diskon,
            promo.raw?.total_diskon_maksimal,
            0,
          ),
          diskon_amount: 0,
        });
      });
    },

    pruneAppliedPromosByCurrentItems() {
      const before = this.appliedPromos.length;
      this.appliedPromos = this.appliedPromos.filter((promo) =>
        this.isPromoEligibleForCurrentItems(promo),
      );

      if (this.appliedPromos.length !== before) {
        this.recalculatePromoEffects();
      }
    },
    getPromoDiscountValue(promo) {
      const raw =
        promo?.raw || promo?.voucher || promo?.master_voucher_diskon || {};

      return Number(
        promo?.total_diskon ??
          promo?.diskon_nilai ??
          promo?.nilai_diskon ??
          promo?.value ??
          raw?.total_diskon ??
          raw?.diskon_nilai ??
          raw?.nilai_diskon ??
          raw?.value ??
          0,
      );
    },
    getPromoDiscountType(promo) {
      const raw =
        promo?.raw || promo?.voucher || promo?.master_voucher_diskon || {};
      const value = String(
        promo?.mode ??
          promo?.tipe_diskon_kode ??
          promo?.diskon_tipe ??
          promo?.tipe_diskon ??
          raw?.mode ??
          raw?.tipe_diskon_kode ??
          raw?.diskon_tipe ??
          raw?.tipe_diskon ??
          "",
      )
        .trim()
        .toLowerCase();

      if (["%", "percent", "persen", "1"].includes(value)) {
        return "%";
      }

      return "Rp";
    },
    getPromoMaxDiscount(promo) {
      const raw =
        promo?.raw || promo?.voucher || promo?.master_voucher_diskon || {};

      return Number(
        promo?.total_diskon_maksimal ??
          promo?.diskon_maksimal ??
          promo?.maksimal_diskon ??
          promo?.max_diskon ??
          promo?.maximum_discount ??
          promo?.max_discount ??
          promo?.max_nominal ??
          promo?.maksimal_potongan ??
          raw?.total_diskon_maksimal ??
          raw?.diskon_maksimal ??
          raw?.maksimal_diskon ??
          raw?.max_diskon ??
          raw?.maximum_discount ??
          raw?.max_discount ??
          raw?.max_nominal ??
          raw?.maksimal_potongan ??
          0,
      );
    },

    calculatePromoAmountByBase(base, promo) {
      const value = this.getPromoDiscountValue(promo);
      const tipe = this.getPromoDiscountType(promo);
      const max = this.getPromoMaxDiscount(promo);
      const eligibleBase = this.toPromoNumber(base);

      if (eligibleBase <= 0 || value <= 0) return 0;

      if (
        tipe.includes("percent") ||
        tipe.includes("persen") ||
        tipe === "%" ||
        tipe === "1"
      ) {
        const calculated = (eligibleBase * value) / 100;
        const capped = max > 0 ? Math.min(calculated, max) : calculated;

        return Math.min(capped, eligibleBase);
      }

      return Math.min(value, eligibleBase);
    },
    getItemPromoEligibleBase(item, kind = "produk") {
      const itemBase =
        kind === "treatment"
          ? this.getTreatmentSubtotal(item)
          : this.getPenjualanSubtotal(item);
      const subtotal = Number(this.subtotal || 0);
      const subtotalDiscount = Number(this.subtotalDiscountAmount || 0);

      if (subtotal <= 0 || itemBase <= 0) return 0;

      const discountShare = (subtotalDiscount * itemBase) / subtotal;
      return Math.max(itemBase - discountShare, 0);
    },
    getPromoAmount(promo) {
      if (!promo) {
        return 0;
      }

      let remainingBase = this.promoBaseAmount;
      const currentKey = this.getPromoKey(promo);

      for (const item of this.appliedPromos) {
        const itemKey = this.getPromoKey(item);

        if (itemKey === currentKey) {
          break;
        }

        const previousAmount = this.calculateSinglePromoAmount(
          item,
          remainingBase,
        );
        remainingBase = Math.max(remainingBase - previousAmount, 0);
      }

      return Math.min(
        this.calculateSinglePromoAmount(promo, remainingBase),
        remainingBase,
      );
    },
    calculateSinglePromoAmount(promo, baseAmount = 0) {
      const base = Math.max(Number(baseAmount || 0), 0);

      if (base <= 0 || !promo) {
        return 0;
      }

      if (this.isValuePromo(promo)) {
        return this.calculateValuePromoAmount(promo, base);
      }

      const fixedAmount = this.getPromoFixedAmount(promo);

      if (fixedAmount > 0) {
        return Math.min(fixedAmount, base);
      }

      const tipe = this.getPromoDiscountType(promo);
      const nilai = this.getPromoDiscountValue(promo);
      const maxDiscount = this.getPromoMaxDiscount(promo);

      if (nilai <= 0) {
        return 0;
      }

      if (tipe === "%") {
        let amount = Math.round(((base * nilai) / 100) * 100) / 100;

        if (maxDiscount > 0) {
          amount = Math.min(amount, maxDiscount);
        }

        return Math.min(amount, base);
      }

      let amount = nilai;

      if (maxDiscount > 0) {
        amount = Math.min(amount, maxDiscount);
      }

      return Math.min(amount, base);
    },
    getPromoFixedAmount(promo) {
      if (this.isValuePromo(promo)) {
        return 0;
      }

      return Number(
        promo?.diskon_amount ??
          promo?.amount ??
          promo?.total_potongan ??
          promo?.potongan ??
          promo?.total_discount_amount ??
          0,
      );
    },

    isValuePromo(promo) {
      const raw =
        promo?.raw || promo?.voucher || promo?.master_voucher_diskon || {};
      const jenisId = Number(
        promo?.jenis_voucher_id ??
          promo?.jenis_id ??
          promo?.voucher_jenis_id ??
          raw?.jenis_voucher_id ??
          raw?.jenis_id ??
          0,
      );

      if (jenisId === 4) {
        return true;
      }

      const text = String(
        promo?.jenis_voucher ||
          promo?.jenis ||
          promo?.kategori ||
          promo?.type ||
          raw?.jenis_voucher ||
          raw?.jenis ||
          raw?.kategori ||
          raw?.type ||
          "",
      ).toLowerCase();

      return text === "value" || text.includes("value");
    },
    calculateValuePromoAmount(promo, baseAmount = 0) {
      const base = Math.max(Number(baseAmount || 0), 0);
      const tipe = this.getPromoDiscountType(promo);
      const nilai = this.getPromoDiscountValue(promo);
      const maxDiscount = this.getPromoMaxDiscount(promo);

      if (base <= 0 || nilai <= 0) {
        return 0;
      }

      let amount = 0;

      if (tipe === "%") {
        amount = Math.round(((base * nilai) / 100) * 100) / 100;
      } else {
        amount = nilai;
      }

      if (maxDiscount > 0) {
        amount = Math.min(amount, maxDiscount);
      }

      return Math.min(amount, base);
    },
    getPromoKey(promo) {
      return String(
        promo?.voucher_id ??
          promo?.id ??
          promo?.master_voucher_diskon_id ??
          promo?.kode_voucher ??
          promo?.kode ??
          promo?.nama_voucher ??
          promo?.nama ??
          "",
      );
    },
    isPromoSelected(promo) {
      const key = this.getPromoKey(promo);
      if (!key) return false;
      return this.appliedPromos.some((item) => this.getPromoKey(item) === key);
    },
    applyPromoCode() {
      const code = String(this.promoCode || "")
        .trim()
        .toLowerCase();
      if (!code) return;

      const selected = this.allPromoList.find((promo) => {
        const kode = String(
          promo.kode_voucher || promo.kode || promo.code || "",
        ).toLowerCase();
        return kode === code;
      });

      if (!selected) {
        this.showSnackbar(
          "Kode promo tidak ditemukan atau tidak eligible.",
          "warning",
        );
        return;
      }

      this.togglePromo(selected);
    },
    togglePromo(promo) {
      if (!promo) return;
      this.activateLiveSummaryCalculation();

      const normalizedPromo = this.normalizeVoucherPromo(promo);
      const key = this.getPromoKey(normalizedPromo);

      if (!key) return;

      if (this.isPromoSelected(normalizedPromo)) {
        this.appliedPromos = this.appliedPromos.filter(
          (item) => this.getPromoKey(item) !== key,
        );
      } else {
        this.appliedPromos = [...this.appliedPromos, normalizedPromo];
      }

      this.recalculatePromoEffects();
      this.updateHeaderVoucherInfo();
    },
    removeAppliedPromo(promoOrIndex) {
      this.activateLiveSummaryCalculation();
      if (typeof promoOrIndex === "number") {
        this.appliedPromos = this.appliedPromos.filter(
          (_, index) => index !== promoOrIndex,
        );
      } else {
        const key = this.getPromoKey(promoOrIndex);
        this.appliedPromos = key
          ? this.appliedPromos.filter((item) => this.getPromoKey(item) !== key)
          : [];
      }

      this.recalculatePromoEffects();
      this.updateHeaderVoucherInfo();
    },
    resetPromo() {
      this.activateLiveSummaryCalculation();
      this.appliedPromos = [];
      this.promoCode = "";
      this.recalculatePromoEffects();
      this.updateHeaderVoucherInfo();
    },
    recalculatePromoEffects() {
      this.penjualanItems = this.penjualanItems.map((item) => ({
        ...item,
        promo_diskon_amount: 0,
      }));
      this.treatmentItems = this.treatmentItems.map((item) => ({
        ...item,
        promo_diskon_amount: 0,
      }));
    },
    addPay() {
      this.pembayaran.push({
        metode_bayar_id: null,
        metode_bayar_nama: null,
        metode_bayar_tipe: null,
        nominal: this.sisaTagihan,
        nominal_diterima: this.sisaTagihan,
        no_referensi: null,
        catatan: null,
      });
    },
    removePay(index) {
      this.pembayaran.splice(index, 1);
    },
    updatePaymentField({ index, field, value }) {
      if (!this.pembayaran[index]) return;

      if (["metode_bayar_id", "metode_bayar_nama"].includes(field)) {
        const selected = this.metodeList.find((item) => {
          const selectedName =
            item.nama ||
            item.nama_metode ||
            item.nama_metode_bayar ||
            item.nama_akun ||
            item.label ||
            "";

          return (
            String(item.id) === String(value) ||
            String(selectedName) === String(value)
          );
        });

        this.pembayaran[index] = {
          ...this.pembayaran[index],
          metode_bayar_id: selected?.id || value || null,
          metode_bayar_nama:
            selected?.nama ||
            selected?.nama_metode ||
            selected?.nama_metode_bayar ||
            selected?.nama_akun ||
            selected?.label ||
            this.pembayaran[index].metode_bayar_nama ||
            value,
          metode_bayar_tipe:
            selected?.tipe ||
            selected?.metode_bayar_tipe ||
            this.pembayaran[index].metode_bayar_tipe ||
            null,
        };

        if (this.isCashPayment(this.pembayaran[index])) {
          this.cashReceived = this.cashAllocated;
        }
        return;
      }

      this.pembayaran[index][field] = ["nominal", "nominal_diterima"].includes(
        field,
      )
        ? Number(value || 0)
        : value;

      if (field === "nominal" && this.isCashPayment(this.pembayaran[index])) {
        this.cashReceived = this.cashAllocated;
      }
    },
    setExactPayment() {
      if (!this.pembayaran.length) {
        this.addPay();
      }
      this.pembayaran[0].nominal = this.grandTotal;
      this.pembayaran[0].nominal_diterima = this.grandTotal;
      if (this.hasCashMethod) {
        this.cashReceived = this.cashAllocated;
      }
    },
    splitEvenly() {
      if (!this.pembayaran.length) return;
      const amount = Math.floor(this.grandTotal / this.pembayaran.length);
      let allocated = 0;

      this.pembayaran = this.pembayaran.map((item, index) => {
        const nominal =
          index === this.pembayaran.length - 1
            ? this.grandTotal - allocated
            : amount;
        allocated += nominal;
        return {
          ...item,
          nominal,
          nominal_diterima: nominal,
        };
      });
      if (this.hasCashMethod) {
        this.cashReceived = this.cashAllocated;
      }
    },
    syncCashReceived() {
      const cash = this.metodeList.find((item) => this.isCashPayment(item));

      if (!cash) {
        this.showSnackbar(
          "Metode bayar CASH/Tunai belum tersedia di master metode bayar.",
          "error",
        );
        return;
      }

      const amount = Number(this.grandTotal || 0);
      this.pembayaran = [
        {
          metode_bayar_id: cash.id || null,
          metode_bayar_nama:
            cash.nama ||
            cash.nama_metode ||
            cash.nama_metode_bayar ||
            cash.nama_akun ||
            cash.label ||
            "CASH",
          metode_bayar_tipe: cash.tipe || cash.metode_bayar_tipe || null,
          nominal: amount,
          nominal_diterima: amount,
          no_referensi: null,
          catatan: null,
        },
      ];
      this.cashReceived = amount;
    },
    isCashPayment(item) {
      const text = [
        item?.metode_bayar_nama,
        item?.nama,
        item?.nama_metode,
        item?.nama_metode_bayar,
        item?.nama_akun,
        item?.label,
        item?.kode,
        item?.kode_akun,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes("cash") || text.includes("tunai");
    },
    setDefaultCashPayment() {
      if (this.pembayaran.length) return;
      this.syncCashReceived();
    },
    getTreatmentItemId(item) {
      const candidates = [
        item?.invoice_item_id,
        item?.pembayaran_item_id,
        item?.id,
        item?.registrasi_treatment_detail_id,
        item?.source_detail_id,
      ];

      for (const value of candidates) {
        const id = Number(value || 0);
        if (id > 0) return id;
      }

      return null;
    },
    getTreatmentItemKey(item, index = 0) {
      const id = this.getTreatmentItemId(item);
      if (id) return `treatment-${id}`;

      const fallback = [
        item?.treatment_toko_id,
        item?.treatment_id,
        item?.nama,
        item?.nama_item,
        item?.nama_treatment,
        index,
      ]
        .filter(
          (value) => value !== null && value !== undefined && value !== "",
        )
        .join("-");

      return `treatment-temp-${fallback || index}`;
    },
    resolveTreatmentHarga(item) {
      const qty = Math.max(Number(item?.qty || item?.jumlah || 1), 1);
      const candidates = [
        item?.harga,
        item?.harga_treatment,
        item?.tarif,
        item?.harga_terendah,
        item?.price,
        item?.raw?.harga,
        item?.raw?.harga_treatment,
        item?.raw?.tarif,
        item?.raw?.harga_terendah,
        item?.treatment_toko?.tarif,
        item?.treatmentToko?.tarif,
        item?.master_treatment_toko?.tarif,
      ];

      for (const value of candidates) {
        const amount = Number(value || 0);
        if (amount > 0) return amount;
      }

      const subtotal = Number(item?.subtotal || item?.total || 0);
      return subtotal > 0 ? subtotal / qty : 0;
    },
    getSelectedDepositTreatmentIds() {
      const selectedKeys = new Set(
        this.selectedDepositTreatmentKeys.map(String),
      );

      return this.treatmentItems
        .map((item, index) => ({
          key: this.getTreatmentItemKey(item, index),
          id: this.getTreatmentItemId(item),
        }))
        .filter(
          (row) => selectedKeys.has(String(row.key)) && Number(row.id || 0) > 0,
        )
        .map((row) => Number(row.id));
    },
    isDepositTreatmentSelected(item, index = 0) {
      const key = this.getTreatmentItemKey(item, index);
      return this.selectedDepositTreatmentKeys
        .map(String)
        .includes(String(key));
    },
    openDepositTreatmentDialog() {
      if (!this.selectedDepositTreatmentKeys.length) {
        this.selectAllDepositTreatments();
      }

      this.depositTreatmentDialog = true;
    },
    openPhoneConfirmDialog() {
      this.phoneForm = {
        no_hp: this.header.pasien_no_hp || "",
        no_wa: this.header.pasien_no_wa || this.header.pasien_no_hp || "",
        no_telp: this.header.pasien_no_telp || "",
      };
      this.phoneConfirmDialog = true;
    },
    confirmPhoneAndSubmit() {
      if (
        !String(
          this.phoneForm.no_hp ||
            this.phoneForm.no_wa ||
            this.phoneForm.no_telp ||
            "",
        ).trim()
      ) {
        this.showSnackbar(
          "Isi minimal salah satu nomor HP/WA/telepon pasien.",
          "error",
        );
        return;
      }

      this.shouldUpdatePatientPhone = true;
      this.phoneConfirmationDone = true;
      this.phoneConfirmDialog = false;
      this.$nextTick(() => this.submit());
    },
    continueWithoutPhoneUpdate() {
      this.shouldUpdatePatientPhone = false;
      this.phoneConfirmationDone = true;
      this.phoneConfirmDialog = false;
      this.$nextTick(() => this.submit());
    },
    validateBeforeSubmit() {
      const jenisTransaksi = Number(this.header.jenis_transaksi_id || 0);
      const catatan = String(this.header.catatan || "").trim();

      if (jenisTransaksi !== 0 && !catatan) {
        this.showSnackbar(
          "Catatan wajib diisi untuk transaksi khusus.",
          "error",
        );
        return false;
      }

      if (jenisTransaksi === 4) {
        if (!this.treatmentItems.length) {
          this.showSnackbar(
            "Jenis transaksi deposit hanya bisa dipilih jika transaksi memiliki minimal satu treatment.",
            "error",
          );
          return false;
        }

        if (!this.header.referensi_dokter_id) {
          this.showSnackbar(
            "Referensi dokter wajib diisi untuk transaksi deposit.",
            "error",
          );
          return false;
        }

        if (
          !this.header.deposit_expired_option_id &&
          !this.header.deposit_expired_at
        ) {
          this.showSnackbar("Masa berlaku deposit wajib diisi.", "error");
          return false;
        }
      }

      if (this.totalBayar < this.grandTotal) {
        this.showSnackbar(
          "Total pembayaran masih kurang dari grand total.",
          "error",
        );
        return false;
      }

      if (!this.pembayaran.length) {
        this.showSnackbar("Metode pembayaran wajib diisi.", "error");
        return false;
      }

      return true;
    },
    buildFinishPayload() {
      const selectedDepositTreatmentItems = this.isDepositTransaction
        ? this.buildSelectedDepositTreatmentItems()
        : [];

      return {
        jenis_transaksi: Number(this.header.jenis_transaksi_id || 0),
        catatan_pembayaran: this.header.catatan || null,
        sumber_informasi_id: this.header.sumber_informasi_id || null,
        sumber_kedatangan: this.header.sumber || null,
        referensi_dokter_id: this.header.referensi_dokter_id || null,
        deposit_expired_option_id:
          this.header.deposit_expired_option_id || null,
        deposit_expired_at: this.header.deposit_expired_at || null,
        deposit_item_ids: this.isDepositTransaction
          ? this.selectedDepositTreatmentItemIds
          : [],

        deposit_treatment_item_ids: this.isDepositTransaction
          ? this.selectedDepositTreatmentItemIds
          : [],

        deposit_treatment_items: selectedDepositTreatmentItems,

        deposit_items: selectedDepositTreatmentItems.map((item) => ({
          item_id: item.invoice_item_id || item.pembayaran_item_id || null,
          pembayaran_item_id:
            item.pembayaran_item_id || item.invoice_item_id || null,
          invoice_item_id:
            item.invoice_item_id || item.pembayaran_item_id || null,
          source_detail_id: item.source_detail_id || null,
          registrasi_treatment_detail_id:
            item.registrasi_treatment_detail_id ||
            item.source_detail_id ||
            null,
          treatment_id: item.treatment_id || null,
          treatment_toko_id: item.treatment_toko_id || null,
          qty: item.qty_deposit,
          qty_deposit: item.qty_deposit,
        })),
        update_pasien_phone: this.shouldUpdatePatientPhone,
        pasien_no_hp_update: this.phoneForm.no_hp || null,
        pasien_no_wa_update: this.phoneForm.no_wa || null,
        pasien_no_telp_update: this.phoneForm.no_telp || null,
        metode: this.pembayaran.map((item, index) => ({
          metode_bayar_id: item.metode_bayar_id || null,
          metode_bayar_nama: item.metode_bayar_nama || item.nama || "CASH",
          metode_bayar_tipe: item.metode_bayar_tipe || null,
          nominal_dialokasikan: Number(item.nominal || 0),
          nominal_diterima: Number(item.nominal_diterima || item.nominal || 0),
          no_referensi: item.no_referensi || null,
          catatan: item.catatan || null,
          sort_order: index + 1,
        })),
        penjualan_items: this.penjualanItems,
        treatment_items: this.treatmentItems,
        promo_ids: this.appliedPromos
          .map(
            (item) =>
              item.id || item.voucher_id || item.master_voucher_diskon_id,
          )
          .filter(Boolean),
        promos: this.appliedPromos.map((item) => ({
          id:
            item.id || item.voucher_id || item.master_voucher_diskon_id || null,
          voucher_id: item.voucher_id || item.id || null,
          kode_voucher: item.kode_voucher || item.kode || item.code || null,
          nama_voucher: item.nama_voucher || item.nama || item.label || null,
          tipe_diskon:
            item.tipe_diskon || item.diskon_tipe || item.type || null,
          total_diskon: this.getPromoDiscountValue(item),
          total_diskon_maksimal: this.getPromoMaxDiscount(item),
          diskon_amount: this.getPromoAmount(item),
        })),
        diskon_subtotal_tipe: this.diskonSubtotal.type,
        diskon_subtotal_nilai: Number(this.diskonSubtotal.value || 0),
        grand_total: this.grandTotal,
      };
    },
    async submit() {
      if (this.loadingSubmit) return;
      if (!this.validateBeforeSubmit()) return;

      if (this.isDepositTransaction && !this.depositSelectionConfirmed) {
        this.openDepositTreatmentDialog();
        return;
      }

      if (!this.phoneConfirmationDone) {
        this.openPhoneConfirmDialog();
        return;
      }

      const invoiceId = this.header.invoice_id || this.header.registrasi_id;
      if (!invoiceId) {
        this.showSnackbar("Invoice belum tersedia.", "error");
        return;
      }

      this.loadingSubmit = true;
      try {
        const payload = this.buildFinishPayload();
        const response = await api.post(
          `/kasir/pembayaran/${invoiceId}/finish`,
          payload,
          {
            timeout: 180000,
          },
        );

        if (!response?.data?.status) {
          this.showSnackbar(
            response?.data?.message || "Gagal menyelesaikan pembayaran.",
            "error",
          );
          return;
        }

        this.handleFinishSuccessResponse(response.data);
      } catch (error) {
        console.error("SUBMIT PEMBAYARAN ERROR:", error);

        if (this.isFinishTransportCanceled(error)) {
          this.showSnackbar(
            "Response pembayaran terputus. Mengecek status invoice...",
            "warning",
          );

          const resolved =
            await this.resolveFinishAfterTransportFailure(invoiceId);
          if (resolved) {
            this.handleFinishSuccessResponse(resolved);
            return;
          }

          this.showSnackbar(
            "Pembayaran mungkin masih diproses. Refresh daftar pembayaran sebelum submit ulang.",
            "warning",
          );
          return;
        }

        const message =
          error?.response?.data?.message ||
          Object.values(error?.response?.data?.errors || {})?.flat?.()?.[0] ||
          "Gagal menyelesaikan pembayaran.";
        this.showSnackbar(message, "error");
      } finally {
        this.loadingSubmit = false;
      }
    },
    handleFinishSuccessResponse(data) {
      const reward = this.normalizeMemberReward(
        data?.data?.member_reward || data?.member_reward || null,
      );

      this.showSnackbar(
        data?.message || "Pembayaran berhasil diselesaikan.",
        "success",
      );

      if (reward?.should_show) {
        this.memberReward = reward;
        this.pendingFinishRedirect = { path: "/kasir/daftar-pembayaran" };
        this.memberRewardDialog = true;
        return;
      }

      window.setTimeout(() => {
        this.goToPaymentList();
      }, 500);
    },
    normalizeMemberReward(payload) {
      if (!payload || typeof payload !== "object") {
        return null;
      }

      const pointEarned = Number(payload.point_earned || 0);
      const pointBalance = Number(payload.point_balance || 0);
      const totalPoint = Number(payload.total_point || pointBalance || 0);
      const tierChanged = Boolean(payload.tier_changed);
      const memberCreated = Boolean(payload.member_created);

      return {
        ...payload,
        should_show: Boolean(
          payload.should_show ||
          tierChanged ||
          memberCreated ||
          pointEarned > 0,
        ),
        tier_changed: tierChanged,
        member_created: memberCreated,
        point_earned: pointEarned,
        point_balance: pointBalance,
        total_point: totalPoint,
        total_spending: Number(payload.total_spending || 0),
      };
    },
    continueAfterMemberReward() {
      this.memberRewardDialog = false;
      this.goToPaymentList();
    },
    goToPaymentList() {
      const target = this.pendingFinishRedirect || {
        path: "/kasir/daftar-pembayaran",
      };

      this.pendingFinishRedirect = null;
      this.$router.replace(target);
    },
    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },
    isFinishTransportCanceled(error) {
      const code = String(error?.code || "").toUpperCase();
      const name = String(error?.name || "").toLowerCase();
      const message = String(error?.message || "").toLowerCase();

      return (
        code === "ERR_CANCELED" ||
        code === "ECONNABORTED" ||
        name.includes("canceled") ||
        message.includes("canceled") ||
        message.includes("cancelled") ||
        message.includes("timeout") ||
        message.includes("network error")
      );
    },
    async resolveFinishAfterTransportFailure(invoiceId) {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await this.wait(800 + attempt * 700);

        try {
          const response = await api.get(`/kasir/pembayaran/${invoiceId}`, {
            timeout: 30000,
          });

          const invoice =
            response?.data?.data?.invoice ||
            response?.data?.data ||
            response?.data?.invoice ||
            null;

          if (this.isInvoicePaid(invoice)) {
            return {
              status: true,
              message: "Pembayaran berhasil diselesaikan.",
              data: invoice,
            };
          }
        } catch (statusError) {
          console.warn("CEK STATUS PEMBAYARAN GAGAL:", statusError);
        }
      }

      return null;
    },
    isInvoicePaid(invoice) {
      if (!invoice) return false;

      const statusKey = String(invoice.status_key || "").toLowerCase();
      const statusLabel = String(invoice.status_label || "").toLowerCase();
      const statusText = String(invoice.status_text || "").toLowerCase();
      const status = Number(invoice.status || invoice.status_invoice || 0);

      return (
        Boolean(invoice.tanggal_lunas) ||
        statusKey === "lunas" ||
        statusLabel.includes("lunas") ||
        statusText.includes("lunas") ||
        status >= 3
      );
    },
    wait(ms) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    },
    format(value) {
      return this.formatCurrency(value);
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },
    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    getTreatmentQty(item) {
      return Math.max(Number(item?.qty || item?.jumlah || 1), 1);
    },

    getTreatmentInvoiceItemId(item) {
      const candidates = [
        item?.pembayaran_item_id,
        item?.invoice_item_id,
        item?.item_id,
        item?.id,
      ];

      for (const value of candidates) {
        const id = Number(value || 0);
        if (id > 0) return id;
      }

      return null;
    },

    getDepositTreatmentQty(item, index) {
      const key = this.getTreatmentItemKey(item, index);
      const maxQty = this.getTreatmentQty(item);
      const qty = Number(this.selectedDepositTreatmentQtyMap[key] || 0);

      if (!this.selectedDepositTreatmentKeys.includes(key)) {
        return 0;
      }

      return Math.min(Math.max(qty || maxQty, 1), maxQty);
    },

    getDepositTreatmentSubtotal(item, index) {
      return (
        this.resolveTreatmentHarga(item) *
        this.getDepositTreatmentQty(item, index)
      );
    },

    setDepositTreatmentQty(item, index, qty) {
      const key = this.getTreatmentItemKey(item, index);
      const maxQty = this.getTreatmentQty(item);
      const safeQty = Math.min(Math.max(Number(qty || 1), 1), maxQty);

      this.selectedDepositTreatmentQtyMap = {
        ...this.selectedDepositTreatmentQtyMap,
        [key]: safeQty,
      };
    },

    increaseDepositTreatmentQty(item, index) {
      if (!this.isDepositTreatmentSelected(item, index)) return;

      const currentQty = this.getDepositTreatmentQty(item, index);
      this.setDepositTreatmentQty(item, index, currentQty + 1);
    },

    decreaseDepositTreatmentQty(item, index) {
      if (!this.isDepositTreatmentSelected(item, index)) return;

      const currentQty = this.getDepositTreatmentQty(item, index);
      this.setDepositTreatmentQty(item, index, currentQty - 1);
    },

    toggleDepositTreatmentItem(item, index) {
      const key = this.getTreatmentItemKey(item, index);
      const itemId = this.getTreatmentInvoiceItemId(item, index);

      if (this.selectedDepositTreatmentKeys.includes(key)) {
        this.selectedDepositTreatmentKeys =
          this.selectedDepositTreatmentKeys.filter(
            (selectedKey) => selectedKey !== key,
          );

        this.selectedDepositTreatmentItemIds =
          this.selectedDepositTreatmentItemIds.filter(
            (selectedId) => String(selectedId) !== String(itemId),
          );

        const qtyMap = { ...this.selectedDepositTreatmentQtyMap };
        delete qtyMap[key];
        this.selectedDepositTreatmentQtyMap = qtyMap;

        return;
      }

      this.selectedDepositTreatmentKeys = [
        ...this.selectedDepositTreatmentKeys,
        key,
      ];

      if (itemId) {
        this.selectedDepositTreatmentItemIds = [
          ...this.selectedDepositTreatmentItemIds,
          itemId,
        ];
      }

      this.setDepositTreatmentQty(item, index, this.getTreatmentQty(item));
    },

    selectAllDepositTreatments() {
      const keys = [];
      const ids = [];
      const qtyMap = {};

      this.treatmentItems.forEach((item, index) => {
        const key = this.getTreatmentItemKey(item, index);
        const itemId = this.getTreatmentInvoiceItemId(item, index);

        keys.push(key);

        if (itemId) {
          ids.push(itemId);
        }

        qtyMap[key] = this.getTreatmentQty(item);
      });

      this.selectedDepositTreatmentKeys = keys;
      this.selectedDepositTreatmentItemIds = ids;
      this.selectedDepositTreatmentQtyMap = qtyMap;
    },

    clearDepositTreatments() {
      this.selectedDepositTreatmentKeys = [];
      this.selectedDepositTreatmentItemIds = [];
      this.selectedDepositTreatmentQtyMap = {};
      this.selectedDepositTreatmentItems = [];
    },

    buildSelectedDepositTreatmentItems() {
      return this.treatmentItems
        .map((item, index) => {
          const key = this.getTreatmentItemKey(item, index);

          if (
            !this.selectedDepositTreatmentKeys.map(String).includes(String(key))
          ) {
            return null;
          }

          const qtyDeposit = this.getDepositTreatmentQty(item, index);
          const hargaSatuan = this.resolveTreatmentHarga(item);
          const invoiceItemId = this.getTreatmentInvoiceItemId(item, index);

          return {
            key,
            pembayaran_item_id: invoiceItemId,
            invoice_item_id: invoiceItemId,
            source_detail_id:
              item?.source_detail_id ||
              item?.registrasi_treatment_detail_id ||
              null,
            registrasi_treatment_detail_id:
              item?.registrasi_treatment_detail_id ||
              item?.source_detail_id ||
              null,
            treatment_id: item?.treatment_id || null,
            treatment_toko_id: item?.treatment_toko_id || null,
            nama_treatment:
              item?.nama_treatment ||
              item?.nama_item ||
              item?.nama ||
              "Treatment",
            qty_invoice: this.getTreatmentQty(item),
            qty_deposit: qtyDeposit,
            harga_satuan: hargaSatuan,
            total_deposit: hargaSatuan * qtyDeposit,
          };
        })
        .filter(Boolean);
    },

    confirmDepositTreatmentDialog() {
      const selectedItems = this.buildSelectedDepositTreatmentItems();

      if (!selectedItems.length) {
        this.showSnackbar("Pilih minimal satu treatment deposit.", "warning");
        return;
      }

      this.selectedDepositTreatmentItems = selectedItems;
      this.selectedDepositTreatmentItemIds = selectedItems
        .map((item) => item.pembayaran_item_id)
        .filter(Boolean);

      this.depositSelectionConfirmed = true;
      this.depositTreatmentDialog = false;
    },

    closeDepositTreatmentDialog() {
      this.depositTreatmentDialog = false;
    },

    isBundlingPromo(promo) {
      const jenisId = Number(
        promo?.jenis_voucher_id ||
          promo?.voucher_jenis_id ||
          promo?.jenis_id ||
          promo?.jenis_voucher?.id ||
          0,
      );

      if (jenisId === 3) return true;

      const text = String(
        [
          promo?.nama_voucher,
          promo?.kode_voucher,
          promo?.jenis_voucher,
          promo?.jenis,
          promo?.kategori,
          promo?.type,
          promo?.nama_jenis,
        ]
          .filter(Boolean)
          .join(" "),
      )
        .toLowerCase()
        .trim();

      return text.includes("bundling");
    },

    capBundlingPromoAmount(amount, promo) {
      const tipe = this.getPromoDiscountType(promo);
      const value = this.getPromoDiscountValue(promo);
      const max = this.getPromoMaxDiscount(promo);

      if (this.isPercentDiscountType(tipe)) {
        return max > 0 ? Math.min(amount, max) : amount;
      }

      const caps = [];

      if (value > 0) caps.push(value);
      if (max > 0) caps.push(max);

      if (!caps.length) return amount;

      return Math.min(amount, ...caps);
    },

    toPromoNumber(value) {
      if (value === null || value === undefined || value === "") return 0;

      if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
      }

      let text = String(value).trim();

      if (!text || text.toLowerCase() === "null") return 0;

      text = text.replace(/[^\d,.-]/g, "");

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

      const number = Number(text);

      return Number.isFinite(number) ? number : 0;
    },

    firstDefined(...values) {
      return values.find(
        (value) => value !== undefined && value !== null && value !== "",
      );
    },
  },
};
</script>

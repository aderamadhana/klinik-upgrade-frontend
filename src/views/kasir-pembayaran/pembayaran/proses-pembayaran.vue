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

    <v-dialog v-model="depositTreatmentDialog" max-width="640" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">
          <div class="d-flex align-center justify-space-between ga-3">
            <div class="d-flex align-center ga-3 min-w-0">
              <v-avatar color="green-lighten-5" size="34">
                <v-icon
                  color="green-darken-2"
                  icon="mdi-wallet-giftcard"
                  size="20"
                />
              </v-avatar>
              <div class="min-w-0">
                <div class="text-subtitle-1 font-weight-bold">
                  Pilih Treatment Deposit
                </div>
                <v-card-subtitle class="text-caption pa-0 mt-1">
                  Pilih treatment yang akan dibuat sebagai saldo deposit
                </v-card-subtitle>
              </div>
            </div>

            <v-btn
              icon="mdi-close"
              variant="text"
              density="comfortable"
              size="small"
              @click.stop="closeDepositTreatmentDialog"
            />
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-alert type="info" variant="tonal" density="compact" class="mb-3">
            Produk/obat tetap dibayar normal. Deposit hanya dibuat untuk
            treatment yang dipilih.
          </v-alert>

          <v-alert
            v-if="!treatmentItems.length"
            type="warning"
            variant="tonal"
            density="compact"
          >
            Transaksi deposit hanya bisa dipilih jika transaksi memiliki minimal
            satu treatment.
          </v-alert>

          <div v-else>
            <div
              class="d-flex align-center justify-space-between mb-3 ga-3 flex-wrap"
            >
              <div>
                <div class="text-body-2 font-weight-bold">Daftar Treatment</div>
                <div class="text-caption text-medium-emphasis">
                  {{ selectedDepositTreatmentKeys.length }} dari
                  {{ treatmentItems.length }} treatment dipilih
                </div>
              </div>

              <div class="d-flex ga-2">
                <v-btn
                  type="button"
                  size="small"
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-check-all"
                  class="text-none font-weight-medium"
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
                  class="text-none font-weight-medium"
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
              class="mb-2"
              :class="
                isDepositTreatmentSelected(item, index)
                  ? 'bg-green-lighten-5'
                  : ''
              "
              @click.stop="toggleDepositTreatmentItem(item, index)"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-start ga-2">
                  <v-checkbox-btn
                    :model-value="isDepositTreatmentSelected(item, index)"
                    color="green"
                    density="compact"
                    @click.stop="toggleDepositTreatmentItem(item, index)"
                  />

                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex justify-space-between align-start ga-2">
                      <div class="min-w-0">
                        <div class="text-body-2 font-weight-bold text-truncate">
                          {{
                            item.nama_treatment ||
                            item.nama_item ||
                            item.nama ||
                            "Treatment"
                          }}
                        </div>
                        <div
                          class="text-caption text-medium-emphasis text-truncate"
                        >
                          {{ item.beautician || "Beautician belum dipilih" }}
                        </div>
                      </div>

                      <v-chip
                        size="x-small"
                        :color="
                          isDepositTreatmentSelected(item, index)
                            ? 'green'
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

                    <div class="d-flex align-center ga-2 mt-2 flex-wrap">
                      <v-chip size="small" variant="tonal" color="blue-grey">
                        Qty {{ Number(item.qty || item.jumlah || 1) }}
                      </v-chip>
                      <v-chip size="small" variant="tonal" color="blue-grey">
                        Harga {{ formatCurrency(resolveTreatmentHarga(item)) }}
                      </v-chip>
                      <v-chip size="small" variant="tonal" color="green">
                        Deposit {{ formatCurrency(getTreatmentSubtotal(item)) }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn
            type="button"
            size="small"
            variant="tonal"
            color="grey-darken-1"
            prepend-icon="mdi-close"
            class="text-none font-weight-medium"
            @click.stop="closeDepositTreatmentDialog"
          >
            Batal
          </v-btn>

          <v-btn
            type="button"
            size="small"
            color="primary"
            variant="flat"
            prepend-icon="mdi-cash-check"
            class="text-none font-weight-medium"
            :disabled="!selectedDepositTreatmentKeys.length"
            @click.stop="confirmDepositTreatmentDialog"
          >
            Lanjutkan Pembayaran
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="phoneConfirmDialog" max-width="620" persistent>
      <v-card>
        <v-card-title>
          <div class="text-h6 font-weight-bold">Konfirmasi Nomor Pasien</div>
          <div class="text-body-2 text-medium-emphasis">
            Perbarui nomor HP/WA pasien sebelum pembayaran diselesaikan jika ada
            perubahan.
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text>
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

        <v-divider />

        <v-card-actions>
          <v-btn variant="text" @click="continueWithoutPhoneUpdate">
            Lanjut Tanpa Ubah
          </v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="confirmPhoneAndSubmit">
            Simpan Nomor & Submit
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
import registrasiLayananService from "@/services/registrasi/registrasiLayananService";
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
      errorMessage: "",
      registrasiDetail: null,
      promoDrawer: false,
      promoCode: "",
      depositTreatmentDialog: false,
      selectedDepositTreatmentItemIds: [],
      selectedDepositTreatmentKeys: [],
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
    hasKonsultasi() {
      return Boolean(this.header.has_konsultasi) || this.rawTotalKonsultasi > 0;
    },
    rawTotalKonsultasi() {
      return Number(this.header.subtotal_konsultasi || 0);
    },
    totalKonsultasi() {
      if (this.treatmentItems.length > 0 || this.totalTreatment > 0) {
        return 0;
      }

      return this.rawTotalKonsultasi;
    },
    subtotal() {
      return this.totalPenjualan + this.totalTreatment + this.totalKonsultasi;
    },
    subtotalDiscountAmount() {
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
      const total = this.appliedPromos.reduce(
        (sum, promo) => sum + this.getPromoAmount(promo),
        0,
      );
      return Math.min(total, this.promoBaseAmount);
    },
    memberDiscountAmount() {
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
  },
  mounted() {
    this.loadPage();
  },
  methods: {
    async loadPage() {
      const registrasiId = this.$route.params.id;
      if (!registrasiId) {
        this.errorMessage = "ID registrasi tidak ditemukan di URL.";
        return;
      }

      this.loadingPage = true;
      this.errorMessage = "";

      try {
        await this.fetchPaymentHeaderReferences();

        const response = await registrasiLayananService.getById(registrasiId);
        if (!response?.status) {
          this.errorMessage =
            response?.message || "Gagal mengambil detail registrasi.";
          return;
        }

        const data = response.data || {};
        const paymentInvoice = await this.generatePaymentInvoice(registrasiId);

        if (paymentInvoice) {
          data.invoice = paymentInvoice;
          data.invoice_items = this.extractInvoiceItems({
            invoice: paymentInvoice,
          });
        }

        this.registrasiDetail = data;
        this.mapHeaderFromRegistrasi(data);
        this.mapPenjualanFromRegistrasi(data);
        this.mapTreatmentFromRegistrasi(data);
        this.mapAppliedPromosFromInvoice(data);
        this.updateHeaderVoucherInfo();

        await this.fetchMetodeBayar();
        await this.fetchReferenceItemData();
        await this.fetchVoucherEligible();
        this.setDefaultCashPayment();
      } catch (error) {
        console.error("LOAD PROSES PEMBAYARAN ERROR:", error);
        this.errorMessage = "Gagal memuat data proses pembayaran.";
      } finally {
        this.loadingPage = false;
      }
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

        this.obatList = this.extractRows(produk).map((item) => ({
          id: item.produk_id || item.master_produk_id || item.id,
          produk_toko_id:
            item.produk_toko_id || item.master_produk_toko_id || item.id,
          title:
            item.nama_produk ||
            item.produk_nama ||
            item.nama ||
            item.produk?.nama ||
            "-",
          harga: Number(item.harga_jual || item.harga || 0),
          unit:
            item.satuan ||
            item.satuan_nama ||
            item.produk?.satuan?.nama ||
            "pcs",
          raw: item,
        }));

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
      const candidates = [
        value,
        row?.nama,
        row?.produk_id,
        row?.produk_toko_id,
        row?.id,
      ]
        .filter((item) => item !== null && item !== undefined && item !== "")
        .map((item) => String(item));

      return this.obatList.find((option) => {
        const optionCandidates = [
          option?.id,
          option?.produk_id,
          option?.produk_toko_id,
          option?.title,
          option?.nama,
          option?.raw?.produk_id,
          option?.raw?.produk_toko_id,
          option?.raw?.id,
          option?.raw?.nama,
          option?.raw?.nama_produk,
          option?.raw?.produk?.nama,
        ]
          .filter((item) => item !== null && item !== undefined && item !== "")
          .map((item) => String(item));

        return optionCandidates.some((item) => candidates.includes(item));
      });
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
              selected.id || selected.raw?.produk_id || item.produk_id || 0,
            ) || null,
          produk_toko_id:
            Number(
              selected.produk_toko_id ||
                selected.raw?.produk_toko_id ||
                item.produk_toko_id ||
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
              return Number(selected?.id || selected?.raw?.produk_id || 0);
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
    async generatePaymentInvoice(registrasiId) {
      try {
        const response = await api.post(
          `/kasir/pembayaran/generate/${registrasiId}`,
        );
        if (!response?.data?.status) {
          return null;
        }
        return response.data.data || null;
      } catch (error) {
        console.error("GENERATE PAYMENT INVOICE ERROR:", error);
        return null;
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
      return {
        treatment: Array.isArray(data.treatment) ? data.treatment : [],
        produk: Array.isArray(data.produk) ? data.produk : [],
        bundling: Array.isArray(data.bundling) ? data.bundling : [],
        value: Array.isArray(data.value) ? data.value : [],
        all: Array.isArray(data.all) ? data.all : [],
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
        .map((promo) => ({
          ...promo,
          id: promo.voucher_id || promo.id,
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
          kode_voucher: promo.kode_voucher || promo.kode || promo.code || null,
          tipe_diskon:
            promo.tipe_diskon || promo.diskon_tipe || promo.type || null,
          total_diskon: Number(
            promo.diskon_nilai || promo.total_diskon || promo.value || 0,
          ),
          diskon_amount: Number(promo.diskon_amount || 0),
        }));

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
        registrasi_id: data.id || null,
        invoice_id: invoice.id || data.invoice_id || null,
        kode_registrasi: data.kode_registrasi || "",
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
        promo_diskon_amount: Number(item.promo_diskon_amount || 0),
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
        promo_diskon_amount: Number(item.promo_diskon_amount || 0),
        diskon_type: diskonType,
        diskon: diskonValue,
      };
    },
    resolveDiskonType(value) {
      if (
        value === "nominal" ||
        value === "Rp" ||
        value === "rp" ||
        Number(value) === 1
      ) {
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
      this.diskonSubtotal[field] =
        field === "value" ? Number(value || 0) : value;
    },
    updatePenjualanItemField({ index, field, value }) {
      if (!this.penjualanItems[index]) return;
      if (["diskon_type", "diskon"].includes(field)) return;
      if (field === "waktu_pakai") {
        this.penjualanItems[index][field] = this.normalizeWaktuPakai(value);
        return;
      }
      this.penjualanItems[index][field] = ["harga", "qty"].includes(field)
        ? Number(value || 0)
        : value;
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
      if (["harga", "qty"].includes(field)) {
        this.recalculatePromoEffects();
      }
      if (["treatment_id", "treatment_toko_id", "nama"].includes(field)) {
        this.resetPromo();
        this.fetchVoucherEligible();
      }
    },
    addPenjualanItem() {
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
        diskon_type: "%",
        diskon: 0,
        frekuensi: "",
        waktu_pakai: "",
        penggunaan: "",
      });
    },
    removePenjualanItem(index) {
      this.penjualanItems.splice(index, 1);
      this.resetPromo();
      this.fetchVoucherEligible();
    },
    fillObat(index) {
      const item = this.penjualanItems[index];
      const selected = this.findObatOption(item?.nama, item);
      if (!selected) return;

      this.penjualanItems[index] = {
        ...item,
        produk_id: Number(selected.id || selected.raw?.produk_id || 0) || null,
        produk_toko_id:
          Number(
            selected.produk_toko_id || selected.raw?.produk_toko_id || 0,
          ) || null,
        nama: selected.title,
        harga: Number(selected.harga || selected.raw?.harga_jual || 0),
        unit: selected.unit || selected.raw?.nama_satuan || "pcs",
        voucher_diskon_id: null,
        voucher_diskon_ids: [],
        voucher_diskon_nama: "",
        manual_diskon_type: "%",
        manual_diskon: 0,
        promo_diskon_amount: 0,
        diskon_type: "%",
        diskon: 0,
      };
      this.resetPromo();
      this.fetchVoucherEligible();
    },
    addTreatmentItem() {
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
        diskon_type: "%",
        diskon: 0,
      });
    },
    removeTreatmentItem(index) {
      this.treatmentItems.splice(index, 1);
      this.resetPromo();
      this.fetchVoucherEligible();
    },
    fillTreatment(index) {
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
      const gross = Number(item.harga || 0) * Number(item.qty || 0);
      return Math.max(
        gross -
          this.getItemDiscount(item) -
          Number(item.promo_diskon_amount || 0),
        0,
      );
    },
    getTreatmentSubtotal(item) {
      const harga = this.resolveTreatmentHarga(item);
      const gross = Number(harga || 0) * Number(item.qty || 0);
      return Math.max(
        gross -
          this.getItemDiscount({ ...item, harga }) -
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
      return Number(
        promo?.nilai_diskon ||
          promo?.total_diskon ||
          promo?.diskon ||
          promo?.amount ||
          0,
      );
    },
    getPromoDiscountType(promo) {
      return String(
        promo?.tipe_diskon || promo?.diskon_tipe || promo?.type || "",
      ).toLowerCase();
    },
    getPromoMaxDiscount(promo) {
      return Number(
        promo?.total_diskon_maksimal ||
          promo?.maksimal_diskon ||
          promo?.max_diskon ||
          promo?.maximum_discount ||
          promo?.max_discount ||
          0,
      );
    },
    calculatePromoAmountByBase(base, promo) {
      const value = this.getPromoDiscountValue(promo);
      const tipe = this.getPromoDiscountType(promo);
      const max = this.getPromoMaxDiscount(promo);
      const eligibleBase = Number(base || 0);

      if (eligibleBase <= 0 || value <= 0) return 0;

      if (
        tipe.includes("percent") ||
        tipe.includes("persen") ||
        tipe === "%" ||
        tipe === "1"
      ) {
        const calculated = (eligibleBase * value) / 100;
        return max > 0
          ? Math.min(calculated, max, eligibleBase)
          : Math.min(calculated, eligibleBase);
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
      if (!promo) return 0;

      if (this.hasPromoSpecificItems(promo)) {
        const productAmount = this.getPromoMatchedPenjualanItems(promo).reduce(
          (sum, item) =>
            sum +
            this.calculatePromoAmountByBase(
              this.getItemPromoEligibleBase(item, "produk"),
              promo,
            ),
          0,
        );

        const treatmentAmount = this.getPromoMatchedTreatmentItems(
          promo,
        ).reduce(
          (sum, item) =>
            sum +
            this.calculatePromoAmountByBase(
              this.getItemPromoEligibleBase(item, "treatment"),
              promo,
            ),
          0,
        );

        return productAmount + treatmentAmount;
      }

      return this.calculatePromoAmountByBase(
        this.getPromoEligibleBase(promo),
        promo,
      );
    },
    getPromoKey(promo) {
      if (!promo) return "";
      return String(
        promo.id ||
          promo.voucher_id ||
          promo.master_voucher_diskon_id ||
          promo.kode_voucher ||
          promo.kode ||
          promo.code ||
          promo.nama_voucher ||
          promo.nama ||
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
      const key = this.getPromoKey(promo);
      if (!key) return;

      if (this.isPromoSelected(promo)) {
        this.appliedPromos = this.appliedPromos.filter(
          (item) => this.getPromoKey(item) !== key,
        );
      } else {
        this.appliedPromos = [...this.appliedPromos, promo];
      }

      this.recalculatePromoEffects();
      this.updateHeaderVoucherInfo();
    },
    removeAppliedPromo(promoOrIndex) {
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
    selectAllDepositTreatments() {
      this.selectedDepositTreatmentKeys = this.treatmentItems
        .map((item, index) => this.getTreatmentItemKey(item, index))
        .filter(Boolean);

      this.selectedDepositTreatmentItemIds =
        this.getSelectedDepositTreatmentIds();
    },
    clearDepositTreatments() {
      this.selectedDepositTreatmentKeys = [];
      this.selectedDepositTreatmentItemIds = [];
    },
    isDepositTreatmentSelected(item, index = 0) {
      const key = this.getTreatmentItemKey(item, index);
      return this.selectedDepositTreatmentKeys
        .map(String)
        .includes(String(key));
    },
    toggleDepositTreatmentItem(item, index = 0) {
      const key = this.getTreatmentItemKey(item, index);
      if (!key) return;

      const selected = this.selectedDepositTreatmentKeys.map(String);
      if (selected.includes(String(key))) {
        this.selectedDepositTreatmentKeys = selected.filter(
          (value) => value !== String(key),
        );
      } else {
        this.selectedDepositTreatmentKeys = [...selected, String(key)];
      }

      this.selectedDepositTreatmentItemIds =
        this.getSelectedDepositTreatmentIds();
    },
    openDepositTreatmentDialog() {
      if (!this.selectedDepositTreatmentKeys.length) {
        this.selectAllDepositTreatments();
      }

      this.depositTreatmentDialog = true;
    },
    closeDepositTreatmentDialog() {
      this.depositTreatmentDialog = false;
    },
    confirmDepositTreatmentDialog() {
      this.selectedDepositTreatmentItemIds =
        this.getSelectedDepositTreatmentIds();

      if (!this.selectedDepositTreatmentKeys.length) {
        this.showSnackbar(
          "Pilih minimal satu treatment yang akan dijadikan deposit.",
          "error",
        );
        return;
      }

      if (!this.selectedDepositTreatmentItemIds.length) {
        this.showSnackbar(
          "Treatment deposit belum memiliki ID invoice. Refresh/generate ulang pembayaran terlebih dahulu.",
          "error",
        );
        return;
      }

      this.selectedDepositTreatmentItemIds = [
        ...new Set(
          this.selectedDepositTreatmentItemIds.map((id) => Number(id)),
        ),
      ];
      this.depositSelectionConfirmed = true;
      this.depositTreatmentDialog = false;
      this.$nextTick(() => this.submit());
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
          total_diskon: Number(
            item.total_diskon || item.nilai_diskon || item.diskon || 0,
          ),
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
      this.showSnackbar(
        data?.message || "Pembayaran berhasil diselesaikan.",
        "success",
      );

      window.setTimeout(() => {
        this.$router.replace({ path: "/kasir/daftar-pembayaran" });
      }, 500);
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
  },
};
</script>

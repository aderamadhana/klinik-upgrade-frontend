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
          @open-promo="promoDrawer = true"
          @remove-promo="removeAppliedPromo"
          @update-diskon-subtotal="updateDiskonSubtotal"
        />
      </v-col>

      <v-col cols="12" lg="4">
        <PembayaranSummaryCard
          :total-penjualan="totalPenjualan"
          :total-treatment="totalTreatment"
          :subtotal="subtotal"
          :subtotal-discount-amount="subtotalDiscountAmount"
          :promo-discount-amount="promoDiscountAmount"
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

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
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
      loadingKaryawan: false,
      errorMessage: "",
      registrasiDetail: null,

      promoDrawer: false,
      promoCode: "",
      cashReceived: 0,

      breadcrumbs: [
        { title: "Kasir", disabled: true },
        { title: "Daftar Pembayaran", disabled: true },
        { title: "Proses Pembayaran", disabled: true },
      ],

      header: {
        registrasi_id: null,
        kode_registrasi: "",
        toko_id: null,
        tanggal: "",
        pasien_id: null,
        pasien_nama: "",
        pasien_no_rm: "",
        pasien_no_hp: "",
        poin: 0,
        dokter_id: null,
        dokter_nama: "",
        perawat_id: null,
        perawat_nama: "",
        jenis_transaksi: "Umum",
        sumber: "Pelanggan Lama",
        catatan: "",
      },

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
      apiKaryawanList: [],

      promoTreatmentList: [],
      promoProductList: [],
      promoBundlingList: [],
      promoValueList: [],
      appliedPromos: [],

      diskonTypeList: ["%", "Rp"],
      frekuensiList: ["1x sehari", "2x sehari", "3x sehari"],
      waktuPakaiList: ["Pagi", "Siang", "Malam"],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
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
        return Math.min((this.subtotal * value) / 100, this.subtotal);
      }

      return Math.min(value, this.subtotal);
    },

    promoBaseAmount() {
      return Math.max(this.subtotal - this.subtotalDiscountAmount, 0);
    },

    promoDiscountAmount() {
      const valuePromos = this.appliedPromos.filter(
        (promo) => Number(promo.jenis_voucher_id || 0) === 4,
      );

      const total = valuePromos.reduce(
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
        const response = await registrasiLayananService.getById(registrasiId);

        if (!response?.status) {
          this.errorMessage =
            response?.message || "Gagal mengambil detail registrasi.";
          return;
        }

        const data = response.data || {};

        this.registrasiDetail = data;

        this.mapHeaderFromRegistrasi(data);
        this.mapPenjualanFromRegistrasi(data);
        this.mapTreatmentFromRegistrasi(data);

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
      const params = {
        toko_id: this.header.toko_id,
      };

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
          harga: Number(item.harga || item.harga_treatment || 0),
          raw: item,
        }));

        await this.fetchKaryawanByToko();
      } catch (error) {
        console.error("FETCH REFERENCE ITEM ERROR:", error);
        this.obatList = [];
        this.tindakanList = [];
        this.perawatList = [];
      }
    },

    async fetchKaryawanByToko() {
      if (!this.header.toko_id) {
        this.apiKaryawanList = [];
        this.perawatList = [];
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
      } catch (error) {
        console.error("FETCH KARYAWAN BY TOKO ERROR:", error);
        this.apiKaryawanList = [];
        this.perawatList = [];
      } finally {
        this.loadingKaryawan = false;
      }
    },

    async fetchVoucherEligible() {
      try {
        const params = {
          toko_id: this.header.toko_id,
          produk_ids: this.penjualanItems
            .map((item) => item.produk_id)
            .filter(Boolean),
          treatment_ids: this.treatmentItems
            .map((item) => item.treatment_id)
            .filter(Boolean),
        };

        const data = await referenceService.voucherDiskonEligible(params);

        this.promoTreatmentList = data?.treatment || [];
        this.promoProductList = data?.produk || [];
        this.promoBundlingList = data?.bundling || [];
        this.promoValueList = data?.value || [];
      } catch (error) {
        console.error("FETCH VOUCHER ELIGIBLE ERROR:", error);
        this.promoTreatmentList = [];
        this.promoProductList = [];
        this.promoBundlingList = [];
        this.promoValueList = [];
      }
    },

    extractRows(response) {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.items)) return response.items;
      return [];
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
        raw: item,
      };
    },

    mapHeaderFromRegistrasi(data) {
      this.header = {
        registrasi_id: data.id || null,
        kode_registrasi: data.kode_registrasi || "",
        toko_id: data.toko_id || null,

        tanggal: data.tanggal_kunjungan || data.tanggal || "",
        pasien_id: data.pasien_id || null,
        pasien_nama: data.pasien?.nama || "",
        pasien_no_rm: data.pasien?.no_rm || "",
        pasien_no_hp: data.pasien?.no_wa || data.pasien?.no_hp || "",
        poin: Number(data.pasien?.poin || data.poin || 0),

        dokter_id: data.dokter_awal_id || null,
        dokter_nama: data.dokter_awal?.nama || "-",

        perawat_id: data.perawat_awal_id || null,
        perawat_nama: data.perawat_awal?.nama || "-",

        jenis_transaksi: this.getJenisTransaksiLabel(data),
        sumber: this.getSumberKedatanganLabel(data.pasien),
        catatan: data.catatan_registrasi || "",
      };
    },

    mapPenjualanFromRegistrasi(data) {
      const details = Array.isArray(data.penjualan_details)
        ? data.penjualan_details
        : [];

      this.penjualanItems = details.map((item) => {
        const diskonType = this.resolveDiskonType(item.diskon_tipe);
        const diskonValue = Number(item.diskon_nilai || 0);

        return {
          registrasi_penjualan_detail_id: item.id || null,
          produk_toko_id: item.produk_toko_id || null,
          produk_id: item.produk_id || null,

          nama: item.nama_produk || item.produk?.nama || "",
          harga: Number(item.harga || 0),
          qty: Number(item.jumlah || 1),
          unit: item.produk?.satuan?.nama || item.unit || "pcs",

          voucher_diskon_id: item.voucher_diskon_id || null,
          voucher_diskon_ids: item.voucher_diskon_id
            ? [item.voucher_diskon_id]
            : [],
          voucher_diskon_nama: "",

          manual_diskon_type: diskonType,
          manual_diskon: diskonValue,
          promo_diskon_amount: 0,

          diskon_type: diskonType,
          diskon: diskonValue,

          frekuensi: item.frekuensi || "",
          waktu_pakai: item.waktu_pakai || "",
          penggunaan: item.penggunaan || "",
        };
      });
    },

    mapTreatmentFromRegistrasi(data) {
      const details = Array.isArray(data.treatment_details)
        ? data.treatment_details
        : [];

      this.treatmentItems = details.map((item) => {
        const diskonType = this.resolveDiskonType(item.diskon_tipe);
        const diskonValue = Number(item.diskon_nilai || 0);

        return {
          registrasi_treatment_detail_id: item.id || null,
          treatment_toko_id: item.treatment_toko_id || null,
          treatment_id: item.treatment_id || null,

          nama:
            item.nama_treatment ||
            item.treatment?.nama ||
            item.master_treatment?.nama ||
            "",

          qty: Number(item.jumlah || 1),

          beautician: data.perawat_awal?.nama || null,
          beautician_id: data.perawat_awal_id || null,

          harga: Number(
            item.harga || item.harga_treatment || item.subtotal || 0,
          ),

          voucher_diskon_id: item.voucher_diskon_id || null,
          voucher_diskon_ids: item.voucher_diskon_id
            ? [item.voucher_diskon_id]
            : [],
          voucher_diskon_nama: "",

          manual_diskon_type: diskonType,
          manual_diskon: diskonValue,
          promo_diskon_amount: 0,

          diskon_type: diskonType,
          diskon: diskonValue,
        };
      });
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

    getJenisTransaksiLabel(data) {
      const hasTreatment =
        Boolean(data.is_treatment) ||
        (Array.isArray(data.treatment_details) &&
          data.treatment_details.length > 0);

      const hasPenjualan =
        Boolean(data.is_penjualan) ||
        (Array.isArray(data.penjualan_details) &&
          data.penjualan_details.length > 0);

      if (hasTreatment && hasPenjualan) return "Treatment + Produk";
      if (hasTreatment) return "Treatment";
      if (hasPenjualan) return "Produk";
      if (Number(data.channel_konsultasi) === 1) return "Konsultasi Online";

      return "Umum";
    },

    getSumberKedatanganLabel(pasien) {
      if (!pasien) return "Pelanggan Lama";

      return Number(pasien.tipe_pasien || 0) === 1
        ? "Pelanggan Baru"
        : "Pelanggan Lama";
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

    updateHeaderField({ field, value }) {
      this.header[field] = value;
    },

    updateDiskonSubtotal({ field, value }) {
      this.diskonSubtotal[field] =
        field === "value" ? Number(value || 0) : value;
    },

    updatePenjualanItemField({ index, field, value }) {
      if (!this.penjualanItems[index]) return;

      if (["diskon_type", "diskon"].includes(field)) {
        return;
      }

      this.penjualanItems[index][field] = ["harga", "qty"].includes(field)
        ? Number(value || 0)
        : value;

      if (["harga", "qty"].includes(field)) {
        this.recalculatePromoEffects();
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

      if (["diskon_type", "diskon"].includes(field)) {
        return;
      }

      this.treatmentItems[index][field] = ["harga", "qty"].includes(field)
        ? Number(value || 0)
        : value;

      if (["harga", "qty"].includes(field)) {
        this.recalculatePromoEffects();
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

      const selected = this.obatList.find(
        (obat) => String(obat.title) === String(item.nama),
      );

      if (!selected) return;

      this.penjualanItems[index] = {
        ...item,
        produk_id: selected.id,
        produk_toko_id: selected.produk_toko_id,
        nama: selected.title,
        harga: selected.harga,
        unit: selected.unit || "pcs",

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

      const selected = this.tindakanList.find(
        (treatment) => String(treatment.title) === String(item.nama),
      );

      if (!selected) return;

      this.treatmentItems[index] = {
        ...item,
        treatment_id: selected.id,
        treatment_toko_id: selected.treatment_toko_id,
        nama: selected.title,
        harga: selected.harga,

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

    format(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    formatCurrency(value) {
      return `Rp ${this.format(value)}`;
    },

    getDiskonAmount(base, type, value) {
      const numericBase = Number(base || 0);
      const numericValue = Number(value || 0);

      if (numericBase <= 0 || numericValue <= 0) {
        return 0;
      }

      if (type === "%") {
        return Math.min((numericBase * numericValue) / 100, numericBase);
      }

      return Math.min(numericValue, numericBase);
    },

    getPenjualanSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.qty || 0);
      const diskon = this.getDiskonAmount(base, item.diskon_type, item.diskon);

      return Math.max(base - diskon, 0);
    },

    getTreatmentSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.qty || 0);
      const diskon = this.getDiskonAmount(base, item.diskon_type, item.diskon);

      return Math.max(base - diskon, 0);
    },

    getPromoAmount(promo) {
      if (!promo) return 0;

      const base = Number(this.promoBaseAmount || 0);

      const mode = this.resolveVoucherDiskonType(
        promo.mode ||
          promo.tipe_diskon_kode ||
          promo.tipe_diskon ||
          promo.tipe_diskon_item,
      );

      const value = Number(
        promo.value ||
          promo.total_diskon ||
          promo.diskon_nilai ||
          promo.nilai_diskon ||
          0,
      );

      return this.getDiskonAmount(base, mode, value);
    },

    isPromoSelected(promo) {
      return this.appliedPromos.some(
        (item) => Number(item.id) === Number(promo.id),
      );
    },

    togglePromo(promo) {
      const exists = this.isPromoSelected(promo);

      if (exists) {
        this.appliedPromos = this.appliedPromos.filter(
          (item) => Number(item.id) !== Number(promo.id),
        );
      } else {
        this.appliedPromos.push({ ...promo });
      }

      this.recalculatePromoEffects();
    },

    removeAppliedPromo(index) {
      this.appliedPromos.splice(index, 1);
      this.recalculatePromoEffects();
    },

    applyPromoCode() {
      const code = String(this.promoCode || "")
        .trim()
        .toUpperCase();

      if (!code) return;

      const foundPromo = this.allPromoList.find((item) => {
        return (
          String(item.kode || "").toUpperCase() === code ||
          String(item.nama || item.nama_voucher || "").toUpperCase() === code
        );
      });

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
          text: `Voucher "${
            foundPromo.nama || foundPromo.nama_voucher
          }" sudah dipilih`,
          color: "info",
        };

        return;
      }

      this.appliedPromos.push({ ...foundPromo });
      this.recalculatePromoEffects();
      this.promoCode = "";
    },

    resetPromo() {
      this.appliedPromos = [];
      this.promoCode = "";
      this.recalculatePromoEffects();
    },

    recalculatePromoEffects() {
      const itemPromos = this.appliedPromos.filter(
        (promo) => Number(promo.jenis_voucher_id || 0) !== 4,
      );

      this.penjualanItems = this.penjualanItems.map((item) =>
        this.recalculateItemPromoEffect(item, "produk", itemPromos),
      );

      this.treatmentItems = this.treatmentItems.map((item) =>
        this.recalculateItemPromoEffect(item, "treatment", itemPromos),
      );
    },

    recalculateItemPromoEffect(item, itemType, promos) {
      const base = Number(item.harga || 0) * Number(item.qty || 0);

      const manualType = item.manual_diskon_type || item.diskon_type || "%";
      const manualValue = Number(item.manual_diskon || 0);
      const manualAmount = this.getDiskonAmount(base, manualType, manualValue);

      let promoAmount = 0;
      const voucherIds = [];
      const voucherNames = [];

      promos.forEach((promo) => {
        const jenisVoucherId = Number(promo.jenis_voucher_id || 0);

        if (itemType === "produk" && ![2, 3].includes(jenisVoucherId)) {
          return;
        }

        if (itemType === "treatment" && ![1, 3].includes(jenisVoucherId)) {
          return;
        }

        const voucherItemsByType = this.getVoucherItemsByType(promo, itemType);
        const matchedVoucherItems = this.getMatchingVoucherItems(
          promo,
          itemType,
          item,
        );

        if (voucherItemsByType.length && !matchedVoucherItems.length) {
          return;
        }

        const targets = matchedVoucherItems.length
          ? matchedVoucherItems
          : [null];

        targets.forEach((voucherItem) => {
          const amount = this.calculateVoucherItemDiscount(
            base,
            promo,
            voucherItem,
          );

          if (amount <= 0) return;

          promoAmount += amount;
          voucherIds.push(promo.id);
          voucherNames.push(promo.nama || promo.nama_voucher || "Voucher");
        });
      });

      const maxPromoAmount = Math.max(base - manualAmount, 0);
      const cappedPromoAmount = Math.min(promoAmount, maxPromoAmount);
      const totalDiscountAmount = Math.min(
        manualAmount + cappedPromoAmount,
        base,
      );

      const hasPromo = cappedPromoAmount > 0;
      const uniqueVoucherIds = [...new Set(voucherIds)];
      const uniqueVoucherNames = [...new Set(voucherNames)];

      return {
        ...item,
        manual_diskon_type: manualType,
        manual_diskon: manualValue,
        promo_diskon_amount: cappedPromoAmount,

        voucher_diskon_id: uniqueVoucherIds.length
          ? uniqueVoucherIds[uniqueVoucherIds.length - 1]
          : null,
        voucher_diskon_ids: uniqueVoucherIds,
        voucher_diskon_nama: uniqueVoucherNames.join(", "),

        diskon_type: hasPromo ? "Rp" : manualType,
        diskon: hasPromo ? totalDiscountAmount : manualValue,
      };
    },

    getVoucherItemsByType(promo, type) {
      const voucherItems = Array.isArray(promo?.items) ? promo.items : [];

      return voucherItems.filter(
        (item) => this.getVoucherItemType(item) === type,
      );
    },

    getMatchingVoucherItems(promo, type, targetItem) {
      const voucherItems = this.getVoucherItemsByType(promo, type);

      return voucherItems.filter((voucherItem) =>
        this.isVoucherItemMatched(voucherItem, type, targetItem),
      );
    },

    getVoucherItemType(item = {}) {
      const rawType = String(
        item.item_type ||
          item.jenis_item ||
          item.type ||
          item.kategori_item ||
          "",
      ).toLowerCase();

      if (
        rawType.includes("produk") ||
        rawType.includes("product") ||
        rawType.includes("obat")
      ) {
        return "produk";
      }

      if (
        rawType.includes("treatment") ||
        rawType.includes("tindakan") ||
        rawType.includes("layanan")
      ) {
        return "treatment";
      }

      return rawType;
    },

    getVoucherItemId(voucherItem = {}, type) {
      if (type === "produk") {
        return (
          voucherItem.item_id ||
          voucherItem.produk_id ||
          voucherItem.produk_toko_id ||
          voucherItem.master_produk_id ||
          voucherItem.master_produk_toko_id ||
          null
        );
      }

      if (type === "treatment") {
        return (
          voucherItem.item_id ||
          voucherItem.treatment_id ||
          voucherItem.treatment_toko_id ||
          voucherItem.master_treatment_id ||
          voucherItem.master_treatment_toko_id ||
          null
        );
      }

      return voucherItem.item_id || null;
    },

    isVoucherItemMatched(voucherItem, type, targetItem) {
      const voucherItemId = Number(
        this.getVoucherItemId(voucherItem, type) || 0,
      );

      if (!voucherItemId) return false;

      if (type === "produk") {
        const targetIds = [
          targetItem.produk_id,
          targetItem.produk_toko_id,
          targetItem.master_produk_id,
          targetItem.master_produk_toko_id,
        ]
          .filter(Boolean)
          .map((id) => Number(id));

        return targetIds.includes(voucherItemId);
      }

      if (type === "treatment") {
        const targetIds = [
          targetItem.treatment_id,
          targetItem.treatment_toko_id,
          targetItem.master_treatment_id,
          targetItem.master_treatment_toko_id,
        ]
          .filter(Boolean)
          .map((id) => Number(id));

        return targetIds.includes(voucherItemId);
      }

      return false;
    },

    calculateVoucherItemDiscount(base, promo, voucherItem = null) {
      const diskonType = this.resolveVoucherDiskonType(
        voucherItem?.tipe_diskon_item ||
          voucherItem?.diskon_type ||
          voucherItem?.diskon_tipe ||
          voucherItem?.tipe_diskon ||
          promo?.tipe_diskon_item ||
          promo?.tipe_diskon ||
          promo?.mode,
      );

      const diskonValue = Number(
        this.getVoucherDiscountValue(promo, voucherItem),
      );

      return this.getDiskonAmount(base, diskonType, diskonValue);
    },

    getVoucherDiscountValue(promo, voucherItem = null) {
      if (voucherItem) {
        if (
          voucherItem.nilai_diskon_item !== null &&
          voucherItem.nilai_diskon_item !== undefined
        ) {
          return voucherItem.nilai_diskon_item;
        }

        if (
          voucherItem.diskon_nilai !== null &&
          voucherItem.diskon_nilai !== undefined
        ) {
          return voucherItem.diskon_nilai;
        }

        if (
          voucherItem.nilai_diskon !== null &&
          voucherItem.nilai_diskon !== undefined
        ) {
          return voucherItem.nilai_diskon;
        }

        if (
          voucherItem.total_diskon !== null &&
          voucherItem.total_diskon !== undefined
        ) {
          return voucherItem.total_diskon;
        }
      }

      return (
        promo?.total_diskon ||
        promo?.value ||
        promo?.diskon_nilai ||
        promo?.nilai_diskon ||
        0
      );
    },

    resolveVoucherDiskonType(value) {
      const text = String(value || "").toLowerCase();

      if (
        text === "nominal" ||
        text === "rp" ||
        text === "rupiah" ||
        text === "amount" ||
        Number(value) === 1
      ) {
        return "Rp";
      }

      return "%";
    },

    createPaymentItem(method = null) {
      return {
        metode_bayar_id: method?.id || null,
        metode_bayar_nama: method?.nama || "",
        metode_bayar_kode: method?.kode || "",
        nominal: 0,
      };
    },

    findCashMethod() {
      return (
        this.metodeList.find((item) => {
          const kode = String(item.kode || "").toUpperCase();
          const nama = String(item.nama || "").toUpperCase();

          return kode === "CASH" || nama === "CASH" || nama === "TUNAI";
        }) ||
        this.metodeList[0] ||
        null
      );
    },

    setDefaultCashPayment() {
      const cashMethod = this.findCashMethod();
      this.pembayaran = [this.createPaymentItem(cashMethod)];
    },

    findMetodeById(id) {
      return this.metodeList.find((item) => String(item.id) === String(id));
    },

    isCashPayment(pay) {
      const method = this.findMetodeById(pay.metode_bayar_id);

      const kode = String(
        method?.kode || pay.metode_bayar_kode || "",
      ).toUpperCase();
      const nama = String(
        method?.nama || pay.metode_bayar_nama || "",
      ).toUpperCase();

      return kode === "CASH" || nama === "CASH" || nama === "TUNAI";
    },

    updatePaymentField({ index, field, value }) {
      if (!this.pembayaran[index]) return;

      if (field === "metode_bayar_id") {
        const method = this.findMetodeById(value);

        this.pembayaran[index] = {
          ...this.pembayaran[index],
          metode_bayar_id: value,
          metode_bayar_nama: method?.nama || "",
          metode_bayar_kode: method?.kode || "",
        };

        return;
      }

      this.pembayaran[index][field] =
        field === "nominal" ? Number(value || 0) : value;
    },

    addPay() {
      const usedIds = this.pembayaran.map((item) => item.metode_bayar_id);

      const nextMethod =
        this.metodeList.find((item) => !usedIds.includes(item.id)) ||
        this.metodeList[0] ||
        null;

      this.pembayaran.push(this.createPaymentItem(nextMethod));
    },

    removePay(index) {
      if (this.pembayaran.length === 1) return;
      this.pembayaran.splice(index, 1);
    },

    setExactPayment() {
      if (!this.pembayaran.length) {
        this.setDefaultCashPayment();
      }

      this.pembayaran = this.pembayaran.map((item, index) => ({
        ...item,
        nominal: index === 0 ? this.grandTotal : 0,
      }));

      if (this.isCashPayment(this.pembayaran[0])) {
        this.cashReceived = this.grandTotal;
      }
    },

    splitEvenly() {
      if (!this.pembayaran.length) {
        this.setDefaultCashPayment();
      }

      const count = this.pembayaran.length;
      const base = Math.floor(this.grandTotal / count);
      let remainder = this.grandTotal - base * count;

      this.pembayaran = this.pembayaran.map((item) => {
        const extra = remainder > 0 ? 1 : 0;
        remainder -= extra;

        return {
          ...item,
          nominal: base + extra,
        };
      });

      this.cashReceived = this.cashAllocated;
    },

    syncCashReceived() {
      this.cashReceived = this.cashAllocated;
    },

    submit() {
      const payload = {
        registrasi_id: this.header.registrasi_id,
        toko_id: this.header.toko_id,
        tanggal: this.header.tanggal,
        pasien_id: this.header.pasien_id,
        dokter_id: this.header.dokter_id,
        perawat_id: this.header.perawat_id,
        catatan: this.header.catatan,

        penjualan: this.penjualanItems,
        treatment: this.treatmentItems,

        diskon_subtotal: this.diskonSubtotal,
        voucher: this.appliedPromos,

        pembayaran: this.pembayaran,

        subtotal: this.subtotal,
        subtotal_discount: this.subtotalDiscountAmount,
        promo_discount: this.promoDiscountAmount,
        grand_total: this.grandTotal,
        total_bayar: this.totalBayar,
        sisa_tagihan: this.sisaTagihan,
        cash_received: this.cashReceived,
        cash_change: this.cashChange,
      };

      console.log("PAYLOAD PEMBAYARAN:", payload);

      this.snackbar = {
        show: true,
        text: "Payload pembayaran siap diproses",
        color: "success",
      };
    },
  },
};
</script>

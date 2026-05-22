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
      variant="tonal"
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

      this.penjualanItems = details.map((item) => ({
        registrasi_penjualan_detail_id: item.id || null,
        produk_toko_id: item.produk_toko_id || null,
        produk_id: item.produk_id || null,

        nama: item.nama_produk || item.produk?.nama || "",
        harga: Number(item.harga || 0),
        qty: Number(item.jumlah || 1),
        unit: item.produk?.satuan?.nama || item.unit || "pcs",

        voucher_diskon_id: item.voucher_diskon_id || null,
        voucher_diskon_nama: "",

        diskon_type: this.resolveDiskonType(item.diskon_tipe),
        diskon: Number(item.diskon_nilai || 0),

        frekuensi: item.frekuensi || "",
        waktu_pakai: item.waktu_pakai || "",
        penggunaan: item.penggunaan || "",
      }));
    },

    mapTreatmentFromRegistrasi(data) {
      const details = Array.isArray(data.treatment_details)
        ? data.treatment_details
        : [];

      this.treatmentItems = details.map((item) => ({
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

        harga: Number(item.harga || item.harga_treatment || item.subtotal || 0),

        voucher_diskon_id: item.voucher_diskon_id || null,
        voucher_diskon_nama: "",

        diskon_type: this.resolveDiskonType(item.diskon_tipe),
        diskon: Number(item.diskon_nilai || 0),
      }));
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

      this.penjualanItems[index][field] = ["harga", "qty", "diskon"].includes(
        field,
      )
        ? Number(value || 0)
        : value;
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

      this.treatmentItems[index][field] = ["harga", "qty", "diskon"].includes(
        field,
      )
        ? Number(value || 0)
        : value;
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
        voucher_diskon_nama: "",
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
        voucher_diskon_nama: "",
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
        voucher_diskon_nama: "",
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
        voucher_diskon_nama: "",
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
      const mode =
        promo.mode ||
        promo.tipe_diskon_kode ||
        (promo.tipe_diskon === "nominal" ? "Rp" : "%");

      const value = Number(promo.value || promo.total_diskon || 0);

      if (mode === "Rp") return value;

      return (base * value) / 100;
    },

    isPromoSelected(promo) {
      return this.appliedPromos.some(
        (item) => Number(item.id) === Number(promo.id),
      );
    },

    togglePromo(promo) {
      const exists = this.isPromoSelected(promo);

      if (exists) {
        this.removePromoEffect(promo);

        this.appliedPromos = this.appliedPromos.filter(
          (item) => Number(item.id) !== Number(promo.id),
        );

        return;
      }

      this.appliedPromos.push({ ...promo });
      this.applyPromoEffect(promo);
    },

    applyPromoEffect(promo) {
      const jenisVoucherId = Number(promo.jenis_voucher_id || 0);

      if (jenisVoucherId === 1) {
        this.applyTreatmentVoucher(promo);
        return;
      }

      if (jenisVoucherId === 2) {
        this.applyProdukVoucher(promo);
        return;
      }

      if (jenisVoucherId === 3) {
        this.applyBundlingVoucher(promo);
      }
    },

    removePromoEffect(promo) {
      const jenisVoucherId = Number(promo.jenis_voucher_id || 0);

      if (jenisVoucherId === 1) {
        this.resetTreatmentVoucher(promo);
        return;
      }

      if (jenisVoucherId === 2) {
        this.resetProdukVoucher(promo);
        return;
      }

      if (jenisVoucherId === 3) {
        this.resetBundlingVoucher(promo);
      }
    },

    applyProdukVoucher(promo) {
      const voucherItems = Array.isArray(promo.items) ? promo.items : [];

      const productVoucherItems = voucherItems.filter(
        (item) => String(item.item_type || "").toLowerCase() === "produk",
      );

      const diskonType = this.resolveVoucherDiskonType(
        promo.tipe_diskon_item || promo.tipe_diskon || promo.mode,
      );

      const defaultDiskonValue = Number(
        promo.total_diskon || promo.value || promo.diskon_nilai || 0,
      );

      const applyToIndex = (targetIndex, voucherItem = null) => {
        if (targetIndex < 0) return;

        const diskonValue =
          voucherItem &&
          voucherItem.nilai_diskon_item !== null &&
          voucherItem.nilai_diskon_item !== undefined
            ? Number(voucherItem.nilai_diskon_item || 0)
            : defaultDiskonValue;

        const finalDiskonType = this.resolveVoucherDiskonType(
          voucherItem?.tipe_diskon_item || promo.tipe_diskon || promo.mode,
        );

        this.penjualanItems[targetIndex] = {
          ...this.penjualanItems[targetIndex],
          voucher_diskon_id: promo.id,
          voucher_diskon_nama: promo.nama || promo.nama_voucher || "",
          diskon_type: finalDiskonType,
          diskon: diskonValue,
        };
      };

      if (productVoucherItems.length) {
        productVoucherItems.forEach((voucherItem) => {
          const targetIndex = this.penjualanItems.findIndex((item) => {
            return (
              Number(item.produk_id) === Number(voucherItem.item_id) ||
              Number(item.produk_toko_id) === Number(voucherItem.item_id)
            );
          });

          applyToIndex(targetIndex, voucherItem);
        });

        return;
      }

      this.penjualanItems.forEach((_, index) => {
        applyToIndex(index, null);
      });
    },

    applyTreatmentVoucher(promo) {
      const voucherItems = Array.isArray(promo.items) ? promo.items : [];

      voucherItems
        .filter(
          (item) => String(item.item_type || "").toLowerCase() === "treatment",
        )
        .forEach((voucherItem) => {
          const targetIndex = this.treatmentItems.findIndex(
            (item) => Number(item.treatment_id) === Number(voucherItem.item_id),
          );

          if (targetIndex < 0) return;

          const diskonType = this.resolveVoucherDiskonType(
            voucherItem.tipe_diskon_item || promo.tipe_diskon,
          );

          const diskonValue =
            voucherItem.nilai_diskon_item !== null &&
            voucherItem.nilai_diskon_item !== undefined
              ? Number(voucherItem.nilai_diskon_item || 0)
              : Number(promo.total_diskon || promo.value || 0);

          this.treatmentItems[targetIndex] = {
            ...this.treatmentItems[targetIndex],
            voucher_diskon_id: promo.id,
            voucher_diskon_nama: promo.nama || promo.nama_voucher || "",
            diskon_type: diskonType,
            diskon: diskonValue,
          };
        });
    },

    applyBundlingVoucher(promo) {
      this.applyProdukVoucher(promo);
      this.applyTreatmentVoucher(promo);
    },

    resetProdukVoucher(promo) {
      this.penjualanItems = this.penjualanItems.map((item) => {
        if (Number(item.voucher_diskon_id) !== Number(promo.id)) return item;

        return {
          ...item,
          voucher_diskon_id: null,
          voucher_diskon_nama: "",
          diskon_type: "%",
          diskon: 0,
        };
      });
    },

    resetTreatmentVoucher(promo) {
      this.treatmentItems = this.treatmentItems.map((item) => {
        if (Number(item.voucher_diskon_id) !== Number(promo.id)) return item;

        return {
          ...item,
          voucher_diskon_id: null,
          voucher_diskon_nama: "",
          diskon_type: "%",
          diskon: 0,
        };
      });
    },

    resetBundlingVoucher(promo) {
      this.resetProdukVoucher(promo);
      this.resetTreatmentVoucher(promo);
    },

    resolveVoucherDiskonType(value) {
      const text = String(value || "").toLowerCase();

      if (
        text === "nominal" ||
        text === "rp" ||
        text === "rupiah" ||
        text === "amount"
      ) {
        return "Rp";
      }

      return "%";
    },

    removeAppliedPromo(index) {
      const promo = this.appliedPromos[index];

      if (promo) {
        this.removePromoEffect(promo);
      }

      this.appliedPromos.splice(index, 1);
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
          text: `Voucher "${foundPromo.nama || foundPromo.nama_voucher}" sudah dipilih`,
          color: "info",
        };

        return;
      }

      this.appliedPromos.push({ ...foundPromo });
      this.applyPromoEffect(foundPromo);
      this.promoCode = "";
    },

    resetPromo() {
      this.appliedPromos.forEach((promo) => {
        this.removePromoEffect(promo);
      });

      this.appliedPromos = [];
      this.promoCode = "";
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

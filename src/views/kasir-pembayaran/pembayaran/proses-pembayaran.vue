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
          :loading-reference="loadingReference"
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
        <div class="summary-sticky">
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
        catatan: "",
      },
      jenisTransaksiList: [],
      sumberInformasiList: [],
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

    async fetchPaymentHeaderReferences() {
      this.loadingReference = true;

      try {
        const [jenisTransaksi, sumberInformasi] = await Promise.all([
          referenceService.jenisTransaksi(),
          referenceService.sumberInformasi(),
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
      } catch (error) {
        console.error("FETCH PAYMENT HEADER REFERENCES ERROR:", error);
        this.jenisTransaksiList = [];
        this.sumberInformasiList = [];
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
      if (Array.isArray(response?.rows)) return response.rows;
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
        tipe: item.tipe || item.tipe_metode || item.jenis || null,
        raw: item,
      };
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
        registrasi_id: data.id || null,
        invoice_id: invoice.id || data.invoice_id || null,
        kode_registrasi: data.kode_registrasi || "",
        toko_id: data.toko_id || null,
        tanggal: data.tanggal_kunjungan || data.tanggal || "",
        pasien_id: data.pasien_id || data.pasien_new_id || null,
        pasien_nama: data.pasien?.nama || data.nama_pasien || "",
        pasien_no_rm: data.pasien?.no_rm || data.no_rm || "",
        pasien_no_hp:
          data.pasien?.no_wa || data.pasien?.no_hp || data.no_hp || "",
        poin: Number(data.pasien?.poin || data.poin || 0),
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
        catatan: invoice.catatan || data.catatan_registrasi || "",
      };
    },

    mapPenjualanFromRegistrasi(data) {
      const source = Array.isArray(data.penjualan_details)
        ? data.penjualan_details
        : Array.isArray(data.penjualan?.items)
          ? data.penjualan.items
          : [];

      this.penjualanItems = source.map((item) => {
        const diskonType = this.resolveDiskonType(
          item.diskon_type || item.diskon_tipe || item.diskon_tipe_kode,
        );
        const diskonValue = Number(
          item.diskon || item.diskon_nilai || item.diskon_value || 0,
        );

        return {
          registrasi_penjualan_detail_id: item.id || null,
          produk_toko_id:
            item.produk_toko_id ||
            item.master_produk_toko_id ||
            item.obat_toko_id ||
            null,
          produk_id:
            item.produk_id || item.master_produk_id || item.obat_id || null,
          nama:
            item.nama_produk ||
            item.produk_nama ||
            item.nama_obat ||
            item.produk?.nama ||
            item.master_produk?.nama ||
            "",
          harga: Number(item.harga || item.harga_jual || item.subtotal || 0),
          qty: Number(item.jumlah || item.qty || 1),
          unit: item.unit || item.satuan || "pcs",
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
          frekuensi: this.normalizeFrekuensiPenggunaan(
            item.frekuensi || item.frekuensi_penggunaan || "",
          ),
          waktu_pakai: this.normalizeWaktuPakai(
            item.waktu_pakai || item.waktu_penggunaan || "",
          ),
          penggunaan: item.penggunaan || "",
        };
      });
    },

    mapTreatmentFromRegistrasi(data) {
      const source = Array.isArray(data.treatment_details)
        ? data.treatment_details
        : Array.isArray(data.treatment?.items)
          ? data.treatment.items
          : [];

      this.treatmentItems = source.map((item) => {
        const diskonType = this.resolveDiskonType(
          item.diskon_type || item.diskon_tipe || item.diskon_tipe_kode,
        );
        const diskonValue = Number(
          item.diskon || item.diskon_nilai || item.diskon_value || 0,
        );

        return {
          registrasi_treatment_detail_id: item.id || null,
          treatment_toko_id:
            item.treatment_toko_id || item.master_treatment_toko_id || null,
          treatment_id: item.treatment_id || item.master_treatment_id || null,
          nama:
            item.nama_treatment ||
            item.treatment_nama ||
            item.master_treatment?.nama ||
            item.treatment?.nama ||
            "",
          qty: Number(item.jumlah || item.qty || 1),
          beautician: data.perawat_awal?.nama || item.perawat?.nama || null,
          beautician_id: data.perawat_awal_id || item.perawat_id || null,
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

    updateHeaderField({ field, value }) {
      this.header[field] = value;
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

      if (numericBase <= 0 || numericValue <= 0) return 0;

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

    resolveVoucherDiskonType(value) {
      const normalized = String(value || "").toLowerCase();

      if (
        normalized === "nominal" ||
        normalized === "rp" ||
        normalized === "fixed" ||
        Number(value) === 1
      ) {
        return "Rp";
      }

      return "%";
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
          text: `Voucher "${foundPromo.nama || foundPromo.nama_voucher}" sudah dipilih`,
          color: "info",
        };
        return;
      }

      this.appliedPromos.push({ ...foundPromo });
      this.recalculatePromoEffects();
    },

    resetPromo() {
      this.appliedPromos = [];
      this.promoCode = "";
      this.recalculatePromoEffects();
    },

    recalculatePromoEffects() {
      this.penjualanItems = this.penjualanItems.map((item) => ({
        ...item,
        promo_diskon_amount: 0,
        diskon_type: item.manual_diskon_type || item.diskon_type || "%",
        diskon: Number(item.manual_diskon || item.diskon || 0),
      }));

      this.treatmentItems = this.treatmentItems.map((item) => ({
        ...item,
        promo_diskon_amount: 0,
        diskon_type: item.manual_diskon_type || item.diskon_type || "%",
        diskon: Number(item.manual_diskon || item.diskon || 0),
      }));
    },

    addPay() {
      this.pembayaran.push({
        metode_bayar_id: null,
        metode_bayar_nama: "",
        metode_bayar_tipe: null,
        nominal: 0,
        no_referensi: "",
        catatan: "",
      });
    },

    removePay(index) {
      if (this.pembayaran.length <= 1) return;
      this.pembayaran.splice(index, 1);
    },

    updatePaymentField({ index, field, value }) {
      if (!this.pembayaran[index]) return;

      if (field === "metode_bayar_id") {
        const selected = this.metodeList.find(
          (item) => Number(item.id) === Number(value),
        );

        this.pembayaran[index] = {
          ...this.pembayaran[index],
          metode_bayar_id: value,
          metode_bayar_nama: selected?.nama || "",
          metode_bayar_tipe: selected?.tipe || null,
        };
        return;
      }

      this.pembayaran[index][field] =
        field === "nominal" ? Number(value || 0) : value;
    },

    setDefaultCashPayment() {
      if (this.pembayaran.length > 0) return;

      const cash = this.metodeList.find((item) => this.isCashMaster(item));

      this.pembayaran = [
        {
          metode_bayar_id: cash?.id || null,
          metode_bayar_nama: cash?.nama || "CASH",
          metode_bayar_tipe: cash?.tipe || null,
          nominal: this.grandTotal,
          no_referensi: "",
          catatan: "",
        },
      ];

      this.cashReceived = this.cashAllocated;
    },

    setExactPayment() {
      if (this.pembayaran.length === 0) {
        this.setDefaultCashPayment();
        return;
      }

      this.pembayaran[0].nominal = this.grandTotal;

      for (let i = 1; i < this.pembayaran.length; i += 1) {
        this.pembayaran[i].nominal = 0;
      }

      this.syncCashReceived();
    },

    splitEvenly() {
      if (this.pembayaran.length <= 0) return;

      const count = this.pembayaran.length;
      const base = Math.floor(this.grandTotal / count);
      const remainder = this.grandTotal - base * count;

      this.pembayaran = this.pembayaran.map((item, index) => ({
        ...item,
        nominal: index === 0 ? base + remainder : base,
      }));

      this.syncCashReceived();
    },

    syncCashReceived() {
      if (!this.hasCashMethod) return;
      this.cashReceived = this.cashAllocated;
    },

    isCashMaster(item = {}) {
      const value = String(
        item.kode ||
          item.nama ||
          item.nama_metode ||
          item.nama_metode_bayar ||
          "",
      ).toLowerCase();

      return value.includes("cash") || value.includes("tunai");
    },

    isCashPayment(item = {}) {
      const selected = this.metodeList.find(
        (metode) => Number(metode.id) === Number(item.metode_bayar_id),
      );
      const value = String(
        item.metode_bayar_nama || selected?.nama || "",
      ).toLowerCase();

      return value.includes("cash") || value.includes("tunai");
    },

    async ensureInvoiceBeforeFinish() {
      if (this.header.invoice_id) {
        return this.header.invoice_id;
      }

      const registrasiId = this.header.registrasi_id || this.$route.params.id;

      if (!registrasiId) {
        throw new Error("ID registrasi pembayaran tidak ditemukan.");
      }

      try {
        const response = await api.post(
          `/kasir/pembayaran/generate/${registrasiId}`,
        );
        const result = response.data;
        const invoice = result?.data || {};

        if (result?.status && invoice?.id) {
          this.header.invoice_id = invoice.id;
          return invoice.id;
        }
      } catch (error) {
        console.warn("GENERATE INVOICE BEFORE FINISH SKIPPED:", error);
      }

      return registrasiId;
    },

    buildSubmitPayload() {
      return {
        jenis_transaksi: Number(this.header.jenis_transaksi_id || 0),
        jenis_transaksi_nama: this.header.jenis_transaksi || null,
        sumber_informasi_id: this.header.sumber_informasi_id || null,
        sumber_kedatangan: this.header.sumber || null,
        catatan_pembayaran: this.header.catatan || null,
        subtotal_obat: this.totalPenjualan,
        subtotal_treatment: this.totalTreatment,
        subtotal: this.subtotal,
        diskon_subtotal: this.subtotalDiscountAmount,
        diskon_promo: this.promoDiscountAmount,
        grand_total: this.grandTotal,
        jumlah_bayar: this.totalBayar,
        cash_diterima: this.cashReceived,
        cash_kembalian: this.cashChange,
        metode: this.pembayaran.map((item) => ({
          metode_bayar_id: item.metode_bayar_id,
          metode_bayar_nama: item.metode_bayar_nama,
          metode_bayar_tipe: item.metode_bayar_tipe,
          nominal_dialokasikan: Number(item.nominal || 0),
          nominal_diterima: this.isCashPayment(item)
            ? Number(this.cashReceived || 0)
            : Number(item.nominal || 0),
          no_referensi: item.no_referensi || null,
          catatan: item.catatan || null,
        })),
        promo: this.appliedPromos.map((item) => ({
          voucher_diskon_id: item.id,
          kode_voucher: item.kode || item.kode_voucher || null,
          nama_voucher: item.nama || item.nama_voucher || null,
          nilai_diskon: this.getPromoAmount(item),
        })),
      };
    },

    async submit() {
      if (this.grandTotal <= 0) {
        this.snackbar = {
          show: true,
          text: "Grand total masih kosong.",
          color: "error",
        };
        return;
      }

      if (this.sisaTagihan > 0) {
        this.snackbar = {
          show: true,
          text: "Jumlah pembayaran masih kurang dari grand total.",
          color: "error",
        };
        return;
      }

      this.loadingSubmit = true;

      try {
        const id = await this.ensureInvoiceBeforeFinish();
        const payload = this.buildSubmitPayload();
        const response = await api.post(
          `/kasir/pembayaran/${id}/finish`,
          payload,
        );
        const result = response.data;

        if (!result?.status) {
          throw new Error(result?.message || "Gagal menyimpan pembayaran.");
        }

        this.snackbar = {
          show: true,
          text: result.message || "Pembayaran berhasil disimpan.",
          color: "success",
        };

        this.$router.push({ path: "/kasir/daftar-pembayaran" });
      } catch (error) {
        console.error("SUBMIT PEMBAYARAN ERROR:", error);
        this.snackbar = {
          show: true,
          text:
            error?.response?.data?.message ||
            error?.message ||
            "Gagal menyimpan pembayaran.",
          color: "error",
        };
      } finally {
        this.loadingSubmit = false;
      }
    },
  },
};
</script>

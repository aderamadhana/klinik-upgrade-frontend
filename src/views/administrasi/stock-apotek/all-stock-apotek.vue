<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen Stok Apotek</h1>
        <p class="page-subtitle">
          Pantau stok, lakukan penerimaan barang, koreksi stok, dan lihat kartu
          stok produk.
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-alert
      v-if="alert.show"
      :type="alert.type"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="alert.show = false"
    >
      {{ alert.message }}
    </v-alert>

    <StockSummaryCards :summary="summary" :format-number="formatNumber" />

    <StockActionCards
      :loading-stock="loading.stock"
      @refresh-stock="refreshStockFromButton"
      @open-penerimaan="openPenerimaanDialog"
      @open-penyesuaian="openPenyesuaianDialog"
    />

    <StockProductTable
      v-model:search="filter.search"
      v-model:tempatProdukId="filter.tempat_produk_id"
      v-model:showOnlyAttention="filter.showOnlyAttention"
      v-model:showOnlyEmpty="filter.showOnlyEmpty"
      :items="filteredStockRows"
      :loading="loading.stock"
      :tempat-produk-options="tempatProdukOptions"
      :selected-tempat-name="selectedTempatName"
      :headers="stockHeaders"
      :total-items="pagination.stock.total"
      :items-per-page="pagination.stock.itemsPerPage"
      :page="pagination.stock.page"
      :format-number="formatNumber"
      :format-currency="formatCurrency"
      :get-stock-status="getStockStatus"
      :get-stock-progress="getStockProgress"
      @refresh="refreshStockFromFilter"
      @reset-filter="resetLocalFilter"
      @open-kartu="openKartuDialog"
      @open-penyesuaian="openPenyesuaianDialog"
      @update-options="handleStockTableOptions"
    />

    <StockHistoryPanels
      v-model:penerimaanSearch="penerimaanFilter.search"
      v-model:penerimaanStatus="penerimaanFilter.status"
      v-model:penyesuaianSearch="penyesuaianFilter.search"
      v-model:penyesuaianStatus="penyesuaianFilter.status"
      v-model:jenisPenyesuaian="penyesuaianFilter.jenis_penyesuaian"
      :penerimaan-rows="penerimaanRows"
      :penyesuaian-rows="penyesuaianRows"
      :penerimaan-headers="penerimaanHeaders"
      :penyesuaian-headers="penyesuaianHeaders"
      :status-options="statusOptions"
      :jenis-penyesuaian-options="jenisPenyesuaianOptions"
      :loading-penerimaan="loading.penerimaan"
      :loading-penyesuaian="loading.penyesuaian"
      :penerimaan-total="pagination.penerimaan.total"
      :penerimaan-page="pagination.penerimaan.page"
      :penerimaan-items-per-page="pagination.penerimaan.itemsPerPage"
      :penyesuaian-total="pagination.penyesuaian.total"
      :penyesuaian-page="pagination.penyesuaian.page"
      :penyesuaian-items-per-page="pagination.penyesuaian.itemsPerPage"
      :format-date="formatDate"
      :format-number="formatNumber"
      :format-currency="formatCurrency"
      :get-status-color="getStatusColor"
      :get-supplier-name="getSupplierName"
      @refresh-penerimaan="refreshPenerimaanFromFilter"
      @refresh-penyesuaian="refreshPenyesuaianFromFilter"
      @update-penerimaan-options="handlePenerimaanTableOptions"
      @update-penyesuaian-options="handlePenyesuaianTableOptions"
      @show-penerimaan-detail="showPenerimaanDetail"
      @show-penyesuaian-detail="showPenyesuaianDetail"
      @post-penerimaan="confirmPostPenerimaan"
      @cancel-penerimaan="confirmCancelPenerimaan"
      @post-penyesuaian="confirmPostPenyesuaian"
      @cancel-penyesuaian="confirmCancelPenyesuaian"
    />

    <StockKartuDialog
      v-model="kartuDialog.show"
      :item="kartuDialog.item"
      :rows="kartuRows"
      :headers="kartuHeaders"
      :loading="loading.kartu"
      :tanggal-awal="kartuFilter.tanggal_awal"
      :tanggal-akhir="kartuFilter.tanggal_akhir"
      :format-date-time="formatDateTime"
      :format-number="formatNumber"
      @update:tanggal-awal="kartuFilter.tanggal_awal = $event"
      @update:tanggal-akhir="kartuFilter.tanggal_akhir = $event"
      @fetch="fetchKartuStok"
    />

    <StockPenerimaanDialog
      v-model="penerimaanDialog"
      :form="penerimaanForm"
      :tempat-produk-options="tempatProdukOptions"
      :supplier-options="supplierOptions"
      :produk-options="produkOptions"
      :loading="loading.submitPenerimaan"
      :format-currency="formatCurrency"
      @add-row="addPenerimaanRow"
      @remove-row="removePenerimaanRow"
      @produk-changed="handlePenerimaanProdukChanged"
      @submit-draft="submitPenerimaan(false)"
      @submit-post="submitPenerimaan(true)"
    />

    <StockPenyesuaianDialog
      v-model="penyesuaianDialog"
      :form="penyesuaianForm"
      :tempat-produk-options="tempatProdukOptions"
      :produk-options="produkOptions"
      :jenis-penyesuaian-options="jenisPenyesuaianOptions"
      :loading="loading.submitPenyesuaian"
      :format-number="formatNumber"
      :get-selisih="getSelisih"
      @add-row="addPenyesuaianRow"
      @remove-row="removePenyesuaianRow"
      @produk-changed="handlePenyesuaianProdukChanged"
      @submit-draft="submitPenyesuaian(false)"
      @submit-post="submitPenyesuaian(true)"
    />

    <StockDetailDialog
      v-model="detailDialog.show"
      :dialog="detailDialog"
      :format-date="formatDate"
      :format-number="formatNumber"
      :format-currency="formatCurrency"
      :get-status-color="getStatusColor"
    />

    <StockConfirmDialog
      v-model="confirmDialog.show"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :color="confirmDialog.color"
      :loading="confirmDialog.loading"
      @confirm="runConfirmAction"
    />
  </div>
</template>

<script>
import stockService from "@/services/stockService";
import referenceService from "@/services/referenceService";

import StockSummaryCards from "@/components/stock/stock-summary-cards.vue";
import StockActionCards from "@/components/stock/stock-action-cards.vue";
import StockProductTable from "@/components/stock/stock-product-table.vue";
import StockHistoryPanels from "@/components/stock/stock-history-panels.vue";
import StockKartuDialog from "@/components/stock/stock-kartu-dialog.vue";
import StockPenerimaanDialog from "@/components/stock/stock-penerimaan-dialog.vue";
import StockPenyesuaianDialog from "@/components/stock/stock-penyesuaian-dialog.vue";
import StockDetailDialog from "@/components/stock/stock-detail-dialog.vue";
import StockConfirmDialog from "@/components/stock/stock-confirm-dialog.vue";

export default {
  name: "AllStockApotek",

  components: {
    StockSummaryCards,
    StockActionCards,
    StockProductTable,
    StockHistoryPanels,
    StockKartuDialog,
    StockPenerimaanDialog,
    StockPenyesuaianDialog,
    StockDetailDialog,
    StockConfirmDialog,
  },

  data() {
    return {
      selectedTokoId: null,

      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        {
          title: "Stok Apotek",
          disabled: false,
          to: "/administrasi/stock-apotek",
        },
      ],

      alert: {
        show: false,
        type: "success",
        message: "",
      },

      loading: {
        initial: false,
        stock: false,
        kartu: false,
        penerimaan: false,
        penyesuaian: false,
        submitPenerimaan: false,
        submitPenyesuaian: false,
      },

      pagination: {
        stock: {
          page: 1,
          itemsPerPage: 10,
          total: 0,
        },
        penerimaan: {
          page: 1,
          itemsPerPage: 10,
          total: 0,
        },
        penyesuaian: {
          page: 1,
          itemsPerPage: 10,
          total: 0,
        },
      },

      filter: {
        search: "",
        tempat_produk_id: null,
        showOnlyAttention: false,
        showOnlyEmpty: false,
      },

      penerimaanFilter: {
        search: "",
        status: "",
      },

      penyesuaianFilter: {
        search: "",
        status: "",
        jenis_penyesuaian: "",
      },

      kartuFilter: {
        produk_toko_id: null,
        tempat_produk_id: null,
        tanggal_awal: "",
        tanggal_akhir: "",
      },

      tempatProdukOptions: [],
      supplierOptions: [],
      produkOptions: [],

      stockRows: [],
      allFallbackStockRows: [],
      kartuRows: [],
      penerimaanRows: [],
      penyesuaianRows: [],

      penerimaanDialog: false,
      penyesuaianDialog: false,

      penerimaanForm: {
        tanggal: "",
        tempat_produk_id: null,
        supplier_id: null,
        no_faktur_supplier: "",
        tanggal_faktur: "",
        catatan: "",
        details: [],
      },

      penyesuaianForm: {
        tanggal: "",
        tempat_produk_id: null,
        jenis_penyesuaian: "KOREKSI",
        catatan: "",
        details: [],
      },

      kartuDialog: {
        show: false,
        item: null,
      },

      detailDialog: {
        show: false,
        type: "",
        title: "",
        subtitle: "",
        data: null,
        details: [],
      },

      confirmDialog: {
        show: false,
        title: "",
        message: "",
        color: "primary",
        loading: false,
        action: null,
      },

      statusOptions: ["DRAFT", "POSTED", "CANCELLED"],
      jenisPenyesuaianOptions: ["STOK_AWAL", "KOREKSI", "OPNAME"],

      stockHeaders: [
        { title: "No", key: "no", sortable: false, width: 60 },
        { title: "Produk", key: "produk" },
        { title: "Harga Jual", key: "harga_jual", width: 140 },
        { title: "Stok Akhir", key: "stok_akhir", width: 120 },
        { title: "Reserved", key: "stok_reserved", width: 120 },
        { title: "Stok Tersedia", key: "stok_tersedia", width: 220 },
        { title: "Status", key: "status", width: 120 },
        {
          title: "Action",
          key: "actions",
          sortable: false,
          align: "end",
          width: 180,
        },
      ],

      kartuHeaders: [
        { title: "Tanggal", key: "tanggal", width: 170 },
        { title: "Tipe", key: "tipe_mutasi", width: 170 },
        { title: "Masuk", key: "qty_masuk", width: 100 },
        { title: "Keluar", key: "qty_keluar", width: 100 },
        { title: "Adjustment", key: "qty_adjustment", width: 120 },
        { title: "Sebelum", key: "stok_sebelum", width: 120 },
        { title: "Sesudah", key: "stok_sesudah", width: 120 },
        { title: "Keterangan", key: "keterangan" },
      ],

      penerimaanHeaders: [
        { title: "Kode", key: "kode_penerimaan" },
        { title: "Tanggal", key: "tanggal", width: 120 },
        { title: "Supplier", key: "supplier" },
        { title: "Status", key: "status", width: 120 },
        { title: "Qty", key: "total_qty", width: 100 },
        { title: "Nominal", key: "total_nominal", width: 150 },
        {
          title: "Action",
          key: "actions",
          sortable: false,
          align: "end",
          width: 160,
        },
      ],

      penyesuaianHeaders: [
        { title: "Kode", key: "kode_penyesuaian" },
        { title: "Tanggal", key: "tanggal", width: 120 },
        { title: "Jenis", key: "jenis_penyesuaian", width: 150 },
        { title: "Status", key: "status", width: 120 },
        { title: "Catatan", key: "catatan" },
        {
          title: "Action",
          key: "actions",
          sortable: false,
          align: "end",
          width: 160,
        },
      ],
    };
  },

  computed: {
    filteredStockRows() {
      let rows = [...this.stockRows];

      if (this.filter.showOnlyAttention) {
        rows = rows.filter((row) => {
          const status = this.getStockStatus(row);
          return status.value === "LOW" || status.value === "EMPTY";
        });
      }

      if (this.filter.showOnlyEmpty) {
        rows = rows.filter((row) => Number(row.stok_tersedia || 0) <= 0);
      }

      return rows;
    },

    summary() {
      const rowsForSummary = this.allFallbackStockRows.length
        ? this.allFallbackStockRows
        : this.stockRows;

      const totalProduk = this.pagination.stock.total || rowsForSummary.length;

      const totalStokAkhir = rowsForSummary.reduce(
        (sum, row) => sum + Number(row.stok_akhir || 0),
        0,
      );

      const totalReserved = rowsForSummary.reduce(
        (sum, row) => sum + Number(row.stok_reserved || 0),
        0,
      );

      const perluPerhatian = rowsForSummary.filter((row) => {
        const status = this.getStockStatus(row);
        return status.value === "LOW" || status.value === "EMPTY";
      }).length;

      return {
        totalProduk,
        totalStokAkhir,
        totalReserved,
        perluPerhatian,
      };
    },

    selectedTempatName() {
      const selected = this.tempatProdukOptions.find((item) => {
        return String(item.id) === String(this.filter.tempat_produk_id);
      });

      return selected?.nama_tempat_produk || "-";
    },
  },

  async mounted() {
    this.selectedTokoId = this.getSelectedTokoId();
    this.setDefaultDates();
    await this.fetchInitialData();
  },

  methods: {
    async fetchInitialData() {
      this.loading.initial = true;

      try {
        await this.fetchTempatProduk();

        this.filter.tempat_produk_id = this.getApotekTempatId();
        this.kartuFilter.tempat_produk_id = this.filter.tempat_produk_id;

        await this.fetchSupplierOptions();
        await this.fetchProdukOptions();
        await this.fetchStockHariIni();

        await Promise.all([this.fetchPenerimaan(), this.fetchPenyesuaian()]);
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(error, "Gagal mengambil data awal stok"),
        );
      } finally {
        this.loading.initial = false;
      }
    },

    async fetchTempatProduk() {
      try {
        if (typeof referenceService.tempatProduk !== "function") {
          this.tempatProdukOptions = [
            { id: 1, nama_tempat_produk: "Apotek" },
            { id: 2, nama_tempat_produk: "Kabin" },
          ];
          return;
        }

        const response = await referenceService.tempatProduk();
        const rows = this.extractArray(response);

        this.tempatProdukOptions = rows.length
          ? rows
          : [
              { id: 1, nama_tempat_produk: "Apotek" },
              { id: 2, nama_tempat_produk: "Kabin" },
            ];
      } catch (error) {
        this.tempatProdukOptions = [
          { id: 1, nama_tempat_produk: "Apotek" },
          { id: 2, nama_tempat_produk: "Kabin" },
        ];
      }
    },

    async fetchSupplierOptions() {
      try {
        let response = [];

        if (typeof referenceService.supplier === "function") {
          response = await referenceService.supplier();
        } else if (typeof referenceService.suppliers === "function") {
          response = await referenceService.suppliers();
        }

        const rows = this.extractArray(response);

        this.supplierOptions = rows.map((row) => ({
          ...row,
          nama_supplier:
            row.nama_supplier ||
            row.nama ||
            row.name ||
            row.supplier_name ||
            "-",
        }));
      } catch (error) {
        this.supplierOptions = [];
      }
    },

    async fetchProdukOptions() {
      try {
        let response = [];

        if (typeof referenceService.produkByToko === "function") {
          response = await referenceService.produkByToko({
            toko_id: this.selectedTokoId,
          });
        } else if (typeof referenceService.produkToko === "function") {
          response = await referenceService.produkToko({
            toko_id: this.selectedTokoId,
          });
        }

        const rows = this.extractArray(response);
        this.produkOptions = this.normalizeProdukOptions(rows);
      } catch (error) {
        this.produkOptions = [];
      }
    },

    async fetchStockHariIni() {
      this.selectedTokoId = this.getSelectedTokoId();

      if (!this.selectedTokoId) {
        this.showError("Cabang belum dipilih.");
        this.stockRows = [];
        this.pagination.stock.total = 0;
        return;
      }

      this.loading.stock = true;

      try {
        const response = await stockService.getStockHariIni({
          toko_id: this.selectedTokoId,
          tempat_produk_id: this.filter.tempat_produk_id,
          search: this.filter.search,
          page: this.pagination.stock.page,
          per_page: this.pagination.stock.itemsPerPage,
        });

        const payload = this.extractPaginator(response);
        const rows = this.normalizeStockRows(payload.rows);

        if (rows.length > 0) {
          this.stockRows = rows;
          this.allFallbackStockRows = [];
          this.pagination.stock.total = payload.total;
          this.pagination.stock.page = payload.page;
          this.pagination.stock.itemsPerPage = payload.perPage;
          this.clearCabangAlertIfNeeded();
          return;
        }

        await this.useProdukMasterAsStockFallback();
        this.clearCabangAlertIfNeeded();
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(error, "Gagal mengambil stok hari ini"),
        );

        if (!this.stockRows.length && this.produkOptions.length) {
          await this.useProdukMasterAsStockFallback();
        }
      } finally {
        this.loading.stock = false;
      }
    },

    async useProdukMasterAsStockFallback() {
      if (!this.produkOptions.length) {
        await this.fetchProdukOptions();
      }

      let rows = this.buildZeroStockRowsFromProdukOptions(this.produkOptions);

      if (this.filter.tempat_produk_id) {
        rows = rows.filter((row) => {
          return (
            String(row.tempat_produk_id) ===
            String(this.filter.tempat_produk_id)
          );
        });
      }

      const keyword = String(this.filter.search || "")
        .toLowerCase()
        .trim();

      if (keyword) {
        rows = rows.filter((row) => {
          return (
            String(row.kode_produk || "")
              .toLowerCase()
              .includes(keyword) ||
            String(row.nama_produk || "")
              .toLowerCase()
              .includes(keyword)
          );
        });
      }

      this.allFallbackStockRows = rows;

      const total = rows.length;
      const page = Number(this.pagination.stock.page || 1);
      const perPage = Number(this.pagination.stock.itemsPerPage || 10);
      const start = (page - 1) * perPage;
      const end = start + perPage;

      this.stockRows = rows.slice(start, end);
      this.pagination.stock.total = total;
    },

    async fetchKartuStok() {
      if (!this.kartuFilter.produk_toko_id) {
        this.showError("Produk belum dipilih.");
        return;
      }

      this.loading.kartu = true;

      try {
        const response = await stockService.getKartuStok({
          toko_id: this.selectedTokoId,
          produk_toko_id: this.kartuFilter.produk_toko_id,
          tempat_produk_id: this.kartuFilter.tempat_produk_id,
          tanggal_awal: this.kartuFilter.tanggal_awal,
          tanggal_akhir: this.kartuFilter.tanggal_akhir,
        });

        this.kartuRows = this.extractArray(response);
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(error, "Gagal mengambil kartu stok"),
        );
      } finally {
        this.loading.kartu = false;
      }
    },

    async fetchPenerimaan() {
      if (!this.selectedTokoId) return;

      this.loading.penerimaan = true;

      try {
        const response = await stockService.getPenerimaan({
          toko_id: this.selectedTokoId,
          tempat_produk_id: this.filter.tempat_produk_id,
          search: this.penerimaanFilter.search,
          status: this.penerimaanFilter.status,
          page: this.pagination.penerimaan.page,
          per_page: this.pagination.penerimaan.itemsPerPage,
        });

        const payload = this.extractPaginator(response);

        this.penerimaanRows = payload.rows;
        this.pagination.penerimaan.total = payload.total;
        this.pagination.penerimaan.page = payload.page;
        this.pagination.penerimaan.itemsPerPage = payload.perPage;
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(
            error,
            "Gagal mengambil data penerimaan",
          ),
        );
      } finally {
        this.loading.penerimaan = false;
      }
    },

    async fetchPenyesuaian() {
      if (!this.selectedTokoId) return;

      this.loading.penyesuaian = true;

      try {
        const response = await stockService.getPenyesuaian({
          toko_id: this.selectedTokoId,
          tempat_produk_id: this.filter.tempat_produk_id,
          search: this.penyesuaianFilter.search,
          status: this.penyesuaianFilter.status,
          jenis_penyesuaian: this.penyesuaianFilter.jenis_penyesuaian,
          page: this.pagination.penyesuaian.page,
          per_page: this.pagination.penyesuaian.itemsPerPage,
        });

        const payload = this.extractPaginator(response);

        this.penyesuaianRows = payload.rows;
        this.pagination.penyesuaian.total = payload.total;
        this.pagination.penyesuaian.page = payload.page;
        this.pagination.penyesuaian.itemsPerPage = payload.perPage;
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(
            error,
            "Gagal mengambil data penyesuaian",
          ),
        );
      } finally {
        this.loading.penyesuaian = false;
      }
    },

    handleStockTableOptions(options) {
      const page = Number(options.page || 1);
      const itemsPerPage = Number(options.itemsPerPage || 10);

      const samePage =
        page === Number(this.pagination.stock.page) &&
        itemsPerPage === Number(this.pagination.stock.itemsPerPage);

      if (samePage && this.stockRows.length) return;

      this.pagination.stock.page = page;
      this.pagination.stock.itemsPerPage = itemsPerPage;

      this.fetchStockHariIni();
    },

    handlePenerimaanTableOptions(options) {
      const page = Number(options.page || 1);
      const itemsPerPage = Number(options.itemsPerPage || 10);

      const samePage =
        page === Number(this.pagination.penerimaan.page) &&
        itemsPerPage === Number(this.pagination.penerimaan.itemsPerPage);

      if (samePage && this.penerimaanRows.length) return;

      this.pagination.penerimaan.page = page;
      this.pagination.penerimaan.itemsPerPage = itemsPerPage;

      this.fetchPenerimaan();
    },

    handlePenyesuaianTableOptions(options) {
      const page = Number(options.page || 1);
      const itemsPerPage = Number(options.itemsPerPage || 10);

      const samePage =
        page === Number(this.pagination.penyesuaian.page) &&
        itemsPerPage === Number(this.pagination.penyesuaian.itemsPerPage);

      if (samePage && this.penyesuaianRows.length) return;

      this.pagination.penyesuaian.page = page;
      this.pagination.penyesuaian.itemsPerPage = itemsPerPage;

      this.fetchPenyesuaian();
    },

    refreshStockFromButton() {
      this.pagination.stock.page = 1;
      this.fetchStockHariIni();
    },

    refreshStockFromFilter() {
      this.pagination.stock.page = 1;
      this.fetchStockHariIni();
    },

    refreshPenerimaanFromFilter() {
      this.pagination.penerimaan.page = 1;
      this.fetchPenerimaan();
    },

    refreshPenyesuaianFromFilter() {
      this.pagination.penyesuaian.page = 1;
      this.fetchPenyesuaian();
    },

    openKartuDialog(item) {
      this.kartuDialog = {
        show: true,
        item,
      };

      this.kartuFilter.produk_toko_id = item.produk_toko_id;
      this.kartuFilter.tempat_produk_id =
        item.tempat_produk_id || this.filter.tempat_produk_id;
      this.kartuRows = [];

      this.$nextTick(() => {
        this.fetchKartuStok();
      });
    },

    openPenerimaanDialog() {
      this.penerimaanForm = this.getDefaultPenerimaanForm();
      this.penerimaanForm.tempat_produk_id =
        this.filter.tempat_produk_id || this.getApotekTempatId();
      this.penerimaanDialog = true;
    },

    addPenerimaanRow() {
      this.penerimaanForm.details.push(this.getDefaultPenerimaanDetail());
    },

    removePenerimaanRow(index) {
      this.penerimaanForm.details.splice(index, 1);
    },

    handlePenerimaanProdukChanged(row) {
      const selected = this.produkOptions.find((item) => {
        return String(item.produk_toko_id) === String(row.produk_toko_id);
      });

      if (!selected) return;

      row.produk_id = selected.produk_id;
      row.harga_beli = Number(selected.harga_beli || 0);
      row.harga_jual = Number(selected.harga_jual || 0);
    },

    async submitPenerimaan(postAfterSave = false) {
      const payload = this.buildPenerimaanPayload();
      if (!payload) return;

      this.loading.submitPenerimaan = true;

      try {
        const response = await stockService.createPenerimaan(payload);
        const data = this.extractObject(response);
        const penerimaan = data?.id ? data : data?.data;

        if (postAfterSave && penerimaan?.id) {
          await stockService.postPenerimaan(penerimaan.id);
        }

        this.showSuccess(
          postAfterSave
            ? "Penerimaan berhasil disimpan dan diposting."
            : "Penerimaan berhasil disimpan sebagai draft.",
        );

        this.penerimaanDialog = false;

        await Promise.all([this.fetchStockHariIni(), this.fetchPenerimaan()]);
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(error, "Gagal menyimpan penerimaan"),
        );
      } finally {
        this.loading.submitPenerimaan = false;
      }
    },

    confirmPostPenerimaan(item) {
      this.openConfirm({
        title: "Posting penerimaan?",
        message: `Penerimaan ${item.kode_penerimaan} akan menambah stok produk.`,
        color: "success",
        action: async () => {
          await stockService.postPenerimaan(item.id);
          this.showSuccess("Penerimaan berhasil diposting.");
          await Promise.all([this.fetchStockHariIni(), this.fetchPenerimaan()]);
        },
      });
    },

    confirmCancelPenerimaan(item) {
      this.openConfirm({
        title: "Batalkan penerimaan?",
        message: `Penerimaan ${item.kode_penerimaan} akan dibatalkan.`,
        color: "error",
        action: async () => {
          await stockService.cancelPenerimaan(item.id);
          this.showSuccess("Penerimaan berhasil dibatalkan.");
          await this.fetchPenerimaan();
        },
      });
    },

    async showPenerimaanDetail(item) {
      try {
        const response = await stockService.getPenerimaanById(item.id);
        const data = this.extractObject(response) || item;

        this.detailDialog = {
          show: true,
          type: "penerimaan",
          title: `Penerimaan ${data.kode_penerimaan || "-"}`,
          subtitle: this.getPostedSubtitle(data.status),
          data,
          details: data.details || data.semua_details || [],
        };
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(
            error,
            "Gagal mengambil detail penerimaan",
          ),
        );
      }
    },

    openPenyesuaianDialog(item = null) {
      this.penyesuaianForm = this.getDefaultPenyesuaianForm();
      this.penyesuaianForm.tempat_produk_id =
        item?.tempat_produk_id ||
        this.filter.tempat_produk_id ||
        this.getApotekTempatId();

      if (item?.produk_toko_id) {
        this.penyesuaianForm.details = [
          {
            produk_toko_id: item.produk_toko_id,
            produk_id: item.produk_id,
            stok_sistem: Number(item.stok_akhir || 0),
            stok_fisik: Number(item.stok_akhir || 0),
            keterangan: "",
          },
        ];
      }

      this.penyesuaianDialog = true;
    },

    addPenyesuaianRow() {
      this.penyesuaianForm.details.push(this.getDefaultPenyesuaianDetail());
    },

    removePenyesuaianRow(index) {
      this.penyesuaianForm.details.splice(index, 1);
    },

    async handlePenyesuaianProdukChanged(row) {
      const selected = this.produkOptions.find((item) => {
        return String(item.produk_toko_id) === String(row.produk_toko_id);
      });

      if (!selected) return;

      row.produk_id = selected.produk_id;

      const localStock = [...this.stockRows, ...this.allFallbackStockRows].find(
        (item) => {
          return (
            String(item.produk_toko_id) === String(row.produk_toko_id) &&
            String(item.tempat_produk_id) ===
              String(this.penyesuaianForm.tempat_produk_id)
          );
        },
      );

      if (localStock) {
        row.stok_sistem = Number(localStock.stok_akhir || 0);
        row.stok_fisik = Number(localStock.stok_akhir || 0);
        return;
      }

      try {
        const response = await stockService.getStokTersedia({
          toko_id: this.selectedTokoId,
          produk_toko_id: row.produk_toko_id,
          tempat_produk_id: this.penyesuaianForm.tempat_produk_id,
        });

        const stock = this.extractObject(response) || {};
        row.stok_sistem = Number(stock.stok_akhir || 0);
        row.stok_fisik = Number(stock.stok_akhir || 0);
      } catch (error) {
        row.stok_sistem = 0;
        row.stok_fisik = 0;
      }
    },

    async submitPenyesuaian(postAfterSave = false) {
      const payload = this.buildPenyesuaianPayload();
      if (!payload) return;

      this.loading.submitPenyesuaian = true;

      try {
        const response = await stockService.createPenyesuaian(payload);
        const data = this.extractObject(response);
        const penyesuaian = data?.id ? data : data?.data;

        if (postAfterSave && penyesuaian?.id) {
          await stockService.postPenyesuaian(penyesuaian.id);
        }

        this.showSuccess(
          postAfterSave
            ? "Penyesuaian berhasil disimpan dan diposting."
            : "Penyesuaian berhasil disimpan sebagai draft.",
        );

        this.penyesuaianDialog = false;

        await Promise.all([this.fetchStockHariIni(), this.fetchPenyesuaian()]);
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(error, "Gagal menyimpan penyesuaian"),
        );
      } finally {
        this.loading.submitPenyesuaian = false;
      }
    },

    confirmPostPenyesuaian(item) {
      this.openConfirm({
        title: "Posting penyesuaian?",
        message: `Penyesuaian ${item.kode_penyesuaian} akan mengubah saldo stok.`,
        color: "success",
        action: async () => {
          await stockService.postPenyesuaian(item.id);
          this.showSuccess("Penyesuaian berhasil diposting.");
          await Promise.all([
            this.fetchStockHariIni(),
            this.fetchPenyesuaian(),
          ]);
        },
      });
    },

    confirmCancelPenyesuaian(item) {
      this.openConfirm({
        title: "Batalkan penyesuaian?",
        message: `Penyesuaian ${item.kode_penyesuaian} akan dibatalkan.`,
        color: "error",
        action: async () => {
          await stockService.cancelPenyesuaian(item.id);
          this.showSuccess("Penyesuaian berhasil dibatalkan.");
          await this.fetchPenyesuaian();
        },
      });
    },

    async showPenyesuaianDetail(item) {
      try {
        const response = await stockService.getPenyesuaianById(item.id);
        const data = this.extractObject(response) || item;

        this.detailDialog = {
          show: true,
          type: "penyesuaian",
          title: `Penyesuaian ${data.kode_penyesuaian || "-"}`,
          subtitle: data.jenis_penyesuaian || "-",
          data,
          details: data.details || data.semua_details || [],
        };
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(
            error,
            "Gagal mengambil detail penyesuaian",
          ),
        );
      }
    },

    buildPenerimaanPayload() {
      if (!this.selectedTokoId) {
        this.showError("Cabang belum dipilih.");
        return null;
      }

      if (!this.penerimaanForm.tanggal) {
        this.showError("Tanggal penerimaan wajib diisi.");
        return null;
      }

      if (!this.penerimaanForm.tempat_produk_id) {
        this.showError("Tempat stok wajib dipilih.");
        return null;
      }

      const details = this.penerimaanForm.details
        .filter(
          (row) =>
            row.produk_toko_id && row.produk_id && Number(row.qty || 0) > 0,
        )
        .map((row) => ({
          produk_toko_id: row.produk_toko_id,
          produk_id: row.produk_id,
          qty: Number(row.qty || 0),
          harga_beli: Number(row.harga_beli || 0),
          harga_jual: Number(row.harga_jual || 0),
          expired_date: row.expired_date || null,
          batch_no: row.batch_no || null,
          keterangan: row.keterangan || null,
        }));

      if (!details.length) {
        this.showError("Minimal isi satu produk dengan qty lebih dari 0.");
        return null;
      }

      return {
        tanggal: this.penerimaanForm.tanggal,
        toko_id: this.selectedTokoId,
        tempat_produk_id: this.penerimaanForm.tempat_produk_id,
        supplier_id: this.penerimaanForm.supplier_id || null,
        no_faktur_supplier: this.penerimaanForm.no_faktur_supplier || null,
        tanggal_faktur: this.penerimaanForm.tanggal_faktur || null,
        catatan: this.penerimaanForm.catatan || null,
        details,
      };
    },

    buildPenyesuaianPayload() {
      if (!this.selectedTokoId) {
        this.showError("Cabang belum dipilih.");
        return null;
      }

      if (!this.penyesuaianForm.tanggal) {
        this.showError("Tanggal penyesuaian wajib diisi.");
        return null;
      }

      if (!this.penyesuaianForm.tempat_produk_id) {
        this.showError("Tempat stok wajib dipilih.");
        return null;
      }

      const details = this.penyesuaianForm.details
        .filter((row) => row.produk_toko_id && row.produk_id)
        .map((row) => ({
          produk_toko_id: row.produk_toko_id,
          produk_id: row.produk_id,
          stok_fisik: Number(row.stok_fisik || 0),
          keterangan: row.keterangan || null,
        }));

      if (!details.length) {
        this.showError("Minimal isi satu produk.");
        return null;
      }

      return {
        tanggal: this.penyesuaianForm.tanggal,
        toko_id: this.selectedTokoId,
        tempat_produk_id: this.penyesuaianForm.tempat_produk_id,
        jenis_penyesuaian: this.penyesuaianForm.jenis_penyesuaian,
        catatan: this.penyesuaianForm.catatan || null,
        details,
      };
    },

    getDefaultPenerimaanForm() {
      return {
        tanggal: this.today(),
        tempat_produk_id:
          this.filter.tempat_produk_id || this.getApotekTempatId(),
        supplier_id: null,
        no_faktur_supplier: "",
        tanggal_faktur: "",
        catatan: "",
        details: [this.getDefaultPenerimaanDetail()],
      };
    },

    getDefaultPenerimaanDetail() {
      return {
        produk_toko_id: null,
        produk_id: null,
        qty: 1,
        harga_beli: 0,
        harga_jual: 0,
        expired_date: null,
        batch_no: null,
        keterangan: null,
      };
    },

    getDefaultPenyesuaianForm() {
      return {
        tanggal: this.today(),
        tempat_produk_id:
          this.filter.tempat_produk_id || this.getApotekTempatId(),
        jenis_penyesuaian: "KOREKSI",
        catatan: "",
        details: [this.getDefaultPenyesuaianDetail()],
      };
    },

    getDefaultPenyesuaianDetail() {
      return {
        produk_toko_id: null,
        produk_id: null,
        stok_sistem: 0,
        stok_fisik: 0,
        keterangan: "",
      };
    },

    normalizeStockRows(rows = []) {
      return rows.map((row) => {
        const produkToko =
          row.produk_toko || row.produkToko || row.master_produk_toko || {};
        const produk =
          row.produk || produkToko.produk || row.master_produk || {};
        const tempatProduk = row.tempat_produk || row.tempatProduk || {};

        const kodeProduk =
          row.kode_produk ||
          row.kode_accurate ||
          produk.kode_produk ||
          produk.kode_accurate ||
          produk.kode ||
          produkToko.kode_produk ||
          produkToko.kode_accurate ||
          "-";

        const namaProduk =
          row.nama_produk ||
          row.nama ||
          produk.nama_produk ||
          produk.nama ||
          produkToko.nama_produk ||
          produkToko.nama ||
          "-";

        const produkTokoId =
          row.produk_toko_id ||
          row.master_produk_toko_id ||
          produkToko.id ||
          row.id;

        const produkId =
          row.produk_id ||
          row.master_produk_id ||
          produk.id ||
          produkToko.produk_id;

        const tempatProdukId =
          row.tempat_produk_id ||
          row.tempat_produk_id ||
          tempatProduk.id ||
          produk.tempat_produk_id ||
          produk.tempat_produk_id ||
          this.getApotekTempatId();

        const stokAkhir = Number(row.stok_akhir || row.stok || row.stock || 0);
        const stokReserved = Number(row.stok_reserved || row.reserved || 0);

        return {
          ...row,
          id: row.id || `${produkTokoId}-${tempatProdukId}`,
          produk_toko_id: produkTokoId,
          produk_id: produkId,
          tempat_produk_id: tempatProdukId,
          tempat_produk_nama:
            tempatProduk.nama_tempat_produk ||
            row.nama_tempat_produk ||
            this.getTempatName(tempatProdukId),
          kode_produk: kodeProduk,
          nama_produk: namaProduk,
          label_produk: `${kodeProduk} - ${namaProduk}`,
          harga_jual: Number(
            row.harga_jual ||
              produkToko.harga_jual ||
              row.harga_jual_terakhir ||
              0,
          ),
          harga_beli: Number(
            row.harga_beli ||
              produkToko.harga_beli ||
              row.harga_beli_terakhir ||
              0,
          ),
          stok_akhir: stokAkhir,
          stok_reserved: stokReserved,
          stok_tersedia: stokAkhir - stokReserved,
          stok_minimum: Number(
            row.stok_minimum || produkToko.stok_minimum || 0,
          ),
        };
      });
    },

    normalizeProdukOptions(rows = []) {
      const mapped = rows.map((row) => {
        const produkToko = row.produk_toko || row.produkToko || row;
        const produk =
          row.produk || produkToko.produk || row.master_produk || {};

        const produkTokoId =
          row.produk_toko_id ||
          row.master_produk_toko_id ||
          produkToko.id ||
          row.id;

        const produkId =
          row.produk_id ||
          row.master_produk_id ||
          produk.id ||
          produkToko.produk_id;

        const tempatProdukId =
          row.tempat_produk_id ||
          row.tempat_produk_id ||
          produk.tempat_produk_id ||
          produk.tempat_produk_id ||
          this.getApotekTempatId();

        const kodeProduk =
          row.kode_produk ||
          row.kode_accurate ||
          produk.kode_produk ||
          produk.kode_accurate ||
          produk.kode ||
          "-";

        const namaProduk =
          row.nama_produk ||
          row.nama ||
          produk.nama_produk ||
          produk.nama ||
          "-";

        return {
          ...row,
          produk_toko_id: produkTokoId,
          produk_id: produkId,
          tempat_produk_id: tempatProdukId,
          kode_produk: kodeProduk,
          nama_produk: namaProduk,
          label_produk: `${kodeProduk} - ${namaProduk}`,
          harga_jual: Number(row.harga_jual || produkToko.harga_jual || 0),
          harga_beli: Number(row.harga_beli || produkToko.harga_beli || 0),
          stok_minimum: Number(
            row.stok_minimum || produkToko.stok_minimum || 0,
          ),
        };
      });

      const unique = [];
      const seen = new Set();

      mapped.forEach((row) => {
        if (!row.produk_toko_id || seen.has(String(row.produk_toko_id))) return;
        seen.add(String(row.produk_toko_id));
        unique.push(row);
      });

      return unique;
    },

    buildZeroStockRowsFromProdukOptions(rows = []) {
      return rows.map((row) => ({
        id: `fallback-${row.produk_toko_id}-${row.tempat_produk_id}`,
        produk_toko_id: row.produk_toko_id,
        produk_id: row.produk_id,
        tempat_produk_id: row.tempat_produk_id,
        tempat_produk_nama: this.getTempatName(row.tempat_produk_id),
        kode_produk: row.kode_produk,
        nama_produk: row.nama_produk,
        label_produk: row.label_produk,
        harga_jual: Number(row.harga_jual || 0),
        harga_beli: Number(row.harga_beli || 0),
        stok_akhir: 0,
        stok_reserved: 0,
        stok_tersedia: 0,
        stok_minimum: Number(row.stok_minimum || 0),
        is_fallback_master_produk: true,
      }));
    },

    extractPaginator(response) {
      const root = response?.data !== undefined ? response.data : response;
      const payload = root?.data !== undefined ? root.data : root;

      if (Array.isArray(payload)) {
        return {
          rows: payload,
          total: payload.length,
          page: 1,
          perPage: payload.length || 10,
        };
      }

      if (payload && Array.isArray(payload.data)) {
        return {
          rows: payload.data,
          total: Number(payload.total || payload.data.length || 0),
          page: Number(payload.current_page || payload.page || 1),
          perPage: Number(
            payload.per_page ||
              payload.items_per_page ||
              this.pagination.stock.itemsPerPage ||
              10,
          ),
        };
      }

      if (root && Array.isArray(root.data)) {
        return {
          rows: root.data,
          total: Number(root.total || root.data.length || 0),
          page: Number(root.current_page || root.page || 1),
          perPage: Number(root.per_page || root.items_per_page || 10),
        };
      }

      return {
        rows: [],
        total: 0,
        page: 1,
        perPage: 10,
      };
    },

    extractArray(response) {
      const root = response?.data !== undefined ? response.data : response;

      if (Array.isArray(root)) return root;
      if (Array.isArray(root?.data)) return root.data;
      if (Array.isArray(root?.data?.data)) return root.data.data;

      return [];
    },

    extractObject(response) {
      const root = response?.data !== undefined ? response.data : response;

      if (root?.data && !Array.isArray(root.data)) return root.data;
      return root || null;
    },

    getStockStatus(item) {
      const tersedia = Number(item.stok_tersedia || 0);
      const minimum = Number(item.stok_minimum || 0);

      if (tersedia <= 0) {
        return {
          value: "EMPTY",
          label: "Kosong",
          color: "error",
        };
      }

      if (minimum > 0 && tersedia <= minimum) {
        return {
          value: "LOW",
          label: "Menipis",
          color: "warning",
        };
      }

      return {
        value: "SAFE",
        label: "Aman",
        color: "success",
      };
    },

    getStockProgress(item) {
      const tersedia = Number(item.stok_tersedia || 0);
      const minimum = Number(item.stok_minimum || 0);

      if (tersedia <= 0) return 0;
      if (minimum <= 0) return 100;

      const target = minimum * 3;
      return Math.min(100, Math.round((tersedia / target) * 100));
    },

    getSelisih(row) {
      return Number(row.stok_fisik || 0) - Number(row.stok_sistem || 0);
    },

    getSupplierName(item) {
      return (
        item?.supplier?.nama_supplier ||
        item?.supplier?.nama ||
        item?.nama_supplier ||
        "-"
      );
    },

    getStatusColor(status) {
      if (status === "POSTED") return "success";
      if (status === "CANCELLED") return "error";
      return "warning";
    },

    getPostedSubtitle(status) {
      if (status === "POSTED") return "Sudah mempengaruhi stok";
      if (status === "CANCELLED") return "Dibatalkan";
      return "Masih draft";
    },

    getTempatName(id) {
      const item = this.tempatProdukOptions.find(
        (row) => String(row.id) === String(id),
      );
      return item?.nama_tempat_produk || "-";
    },

    resetLocalFilter() {
      this.filter.search = "";
      this.filter.showOnlyAttention = false;
      this.filter.showOnlyEmpty = false;
      this.pagination.stock.page = 1;
      this.fetchStockHariIni();
    },

    openConfirm({ title, message, color = "primary", action }) {
      this.confirmDialog = {
        show: true,
        title,
        message,
        color,
        loading: false,
        action,
      };
    },

    async runConfirmAction() {
      if (typeof this.confirmDialog.action !== "function") {
        this.confirmDialog.show = false;
        return;
      }

      this.confirmDialog.loading = true;

      try {
        await this.confirmDialog.action();
        this.confirmDialog.show = false;
      } catch (error) {
        this.showError(
          stockService.getErrorMessage(error, "Gagal memproses data"),
        );
      } finally {
        this.confirmDialog.loading = false;
      }
    },

    setDefaultDates() {
      const today = this.today();
      const firstDay = `${today.substring(0, 8)}01`;

      this.kartuFilter.tanggal_awal = firstDay;
      this.kartuFilter.tanggal_akhir = today;
    },

    getSelectedTokoId() {
      const directKeys = [
        "selected_toko_id",
        "selected_cabang_id",
        "toko_id",
        "cabang_id",
        "current_toko_id",
        "current_cabang_id",
        "selectedTokoId",
        "selectedCabangId",
      ];

      for (const key of directKeys) {
        const value = localStorage.getItem(key);

        if (value && value !== "null" && value !== "undefined") {
          return value;
        }
      }

      const objectKeys = [
        "selected_toko",
        "selected_cabang",
        "selectedToko",
        "selectedCabang",
        "toko",
        "cabang",
      ];

      for (const key of objectKeys) {
        const raw = localStorage.getItem(key);

        if (!raw || raw === "null" || raw === "undefined") continue;

        try {
          const obj = JSON.parse(raw);
          const value =
            obj?.id ||
            obj?.toko_id ||
            obj?.cabang_id ||
            obj?.value ||
            obj?.kode;

          if (value) return value;
        } catch (error) {
          // ignore invalid JSON
        }
      }

      const userRaw = localStorage.getItem("user");

      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          const value =
            user?.toko_id ||
            user?.cabang_id ||
            user?.toko?.id ||
            user?.cabang?.id ||
            user?.penempatan?.toko_id ||
            user?.penempatan?.cabang_id;

          if (value) return value;
        } catch (error) {
          // ignore invalid JSON
        }
      }

      return null;
    },

    getApotekTempatId() {
      const apotek = this.tempatProdukOptions.find((item) => {
        return String(item.nama_tempat_produk || "")
          .toLowerCase()
          .includes("apotek");
      });

      return apotek?.id || 1;
    },

    clearCabangAlertIfNeeded() {
      if (
        this.alert.show &&
        this.alert.type === "error" &&
        String(this.alert.message || "").includes("Cabang belum dipilih")
      ) {
        this.alert.show = false;
      }
    },

    today() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    formatDate(value) {
      if (!value) return "-";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    formatDateTime(value) {
      if (!value) return "-";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID", {
        maximumFractionDigits: 4,
      });
    },

    formatCurrency(value) {
      return Number(value || 0).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      });
    },

    showSuccess(message) {
      this.alert = {
        show: true,
        type: "success",
        message,
      };
    },

    showError(message) {
      this.alert = {
        show: true,
        type: "error",
        message,
      };
    },
  },
};
</script>

<template>
  <div>
    <div
      class="d-flex flex-column flex-lg-row justify-space-between align-start ga-4 mb-4"
    >
      <div>
        <div class="text-overline text-primary font-weight-bold">Kasir</div>
        <h1 class="text-h5 font-weight-bold mb-1">Riwayat Pembayaran</h1>
        <div class="text-body-2 text-medium-emphasis">
          Arsip invoice yang sudah diproses kasir, lengkap dengan pasien,
          layanan, metode bayar, status, dan cetak ulang invoice.
        </div>
      </div>

      <div class="d-flex ga-2 flex-wrap">
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-refresh"
          class="text-none font-weight-bold"
          :loading="loading"
          @click="fetchData(1)"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <v-row dense class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" class="border h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">
              Invoice ditampilkan
            </div>
            <div class="text-h5 font-weight-bold">
              {{ formatNumber(summary.invoiceCount) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" class="border h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">
              Nominal halaman ini
            </div>
            <div class="text-h6 font-weight-bold">
              {{ formatCurrency(summary.grandTotal) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" class="border h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">Treatment</div>
            <div class="text-h6 font-weight-bold">
              {{ formatCurrency(summary.treatmentTotal) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card variant="flat" class="border h-100">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">
              Produk / Obat
            </div>
            <div class="text-h6 font-weight-bold">
              {{ formatCurrency(summary.productTotal) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="flat" class="border mb-4">
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              density="compact"
              variant="outlined"
              placeholder="Cari invoice, registrasi, pasien, no RM..."
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
              @keyup.enter="fetchData(1)"
              @click:clear="handleSearchClear"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="filters.tanggal"
              type="date"
              label="Tanggal"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-calendar"
              hide-details
              clearable
              @update:model-value="fetchData(1)"
              @click:clear="fetchData(1)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Status"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchData(1)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.channel"
              :items="channelOptions"
              item-title="title"
              item-value="value"
              label="Channel"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchData(1)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="pagination.perPage"
              :items="perPageOptions"
              label="Per halaman"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="handlePerPageChange"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card variant="flat" class="border">
      <v-data-table
        :headers="headers"
        :items="normalizedRows"
        :loading="loading"
        item-value="_row_key"
        density="comfortable"
        class="payment-table"
        hide-default-footer
      >
        <template #item.tanggal="{ item }">
          <div class="py-2">
            <div class="text-body-2 font-weight-bold">
              {{ formatDate(getDataDate(item)) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ getDataTime(item) }}
            </div>
            <div
              v-if="getTokoLabel(item)"
              class="text-caption text-medium-emphasis mt-1"
            >
              {{ getTokoLabel(item) }}
            </div>
          </div>
        </template>

        <template #item.invoice="{ item }">
          <div class="py-2">
            <div class="text-body-2 font-weight-bold text-primary">
              {{ getNomorInvoice(item) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ getNomorKunjungan(item) }}
            </div>
            <div class="d-flex align-center ga-1 flex-wrap mt-2">
              <v-chip size="x-small" variant="tonal" color="primary">
                {{ getJenisTransaksiLabel(item) }}
              </v-chip>
              <v-chip
                v-if="getChannelLabel(item)"
                size="x-small"
                variant="tonal"
                color="info"
              >
                {{ getChannelLabel(item) }}
              </v-chip>
            </div>
          </div>
        </template>

        <template #item.pasien="{ item }">
          <div class="py-2">
            <div class="text-body-2 font-weight-bold">
              {{ getPatientName(item) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ getPatientMeta(item) }}
            </div>
            <div
              v-if="getMemberLabel(item)"
              class="text-caption text-medium-emphasis mt-1"
            >
              {{ getMemberLabel(item) }}
            </div>
          </div>
        </template>

        <template #item.layanan="{ item }">
          <div class="py-2">
            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                v-for="service in getServiceChips(item)"
                :key="`${getInvoiceKey(item)}-${service.label}`"
                :color="service.color"
                size="small"
                variant="tonal"
              >
                {{ service.label }}
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-2">
              {{ getMetodePembayaran(item) || "Metode bayar belum tersedia" }}
            </div>
          </div>
        </template>

        <template #item.total_status="{ item }">
          <div class="py-2 text-right">
            <div class="text-body-2 font-weight-bold">
              {{ formatCurrency(getInvoiceTotal(item)) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Bayar: {{ formatCurrency(getTotalBayar(item)) }}
            </div>
            <v-chip
              class="mt-2"
              size="small"
              variant="tonal"
              :color="getStatusMeta(item).color"
              :prepend-icon="getStatusMeta(item).icon"
            >
              {{ getStatusMeta(item).label }}
            </v-chip>
          </div>
        </template>

        <template #item.aksi="{ item }">
          <div class="d-flex justify-end ga-2 py-2">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-printer-outline"
              class="text-none font-weight-bold"
              :loading="printingInvoiceId === getPrintableInvoiceId(item)"
              :disabled="!getPrintableInvoiceId(item)"
              @click="openInvoiceReceipt(item)"
            >
              Cetak
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="py-10 text-center">
            <v-icon size="42" color="grey">mdi-file-search-outline</v-icon>
            <div class="text-subtitle-2 font-weight-bold mt-3">
              Riwayat belum ditemukan
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Ubah tanggal, status, channel, atau kata kunci pencarian.
            </div>
          </div>
        </template>
      </v-data-table>

      <v-divider />

      <v-card-text>
        <div
          class="d-flex flex-column flex-md-row justify-space-between align-center ga-3"
        >
          <div class="text-body-2 text-medium-emphasis">
            Menampilkan
            <strong>{{
              pagination.from || (normalizedRows.length ? 1 : 0)
            }}</strong>
            -
            <strong>{{ pagination.to || normalizedRows.length }}</strong>
            dari
            <strong>{{ pagination.total }}</strong>
            data
          </div>

          <v-pagination
            v-model="pagination.page"
            :length="pagination.lastPage"
            density="comfortable"
            rounded="circle"
            total-visible="5"
            @update:model-value="fetchData"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import pembayaranService from "@/services/kasir/pembayaranService";

export default {
  name: "RiwayatPembayaran",

  data() {
    return {
      loading: false,
      printingInvoiceId: null,
      searchTimer: null,
      rows: [],
      filters: {
        search: "",
        tanggal: this.todayDate(),
        status: "lunas",
        channel: "",
      },
      pagination: {
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
        from: null,
        to: null,
      },
      perPageOptions: [10, 15, 25, 50],
      statusOptions: [
        { title: "Semua", value: "" },
        { title: "Lunas", value: "lunas" },
        { title: "Diproses", value: "proses" },
        { title: "Menunggu", value: "menunggu" },
      ],
      channelOptions: [
        { title: "Semua", value: "" },
        { title: "Offline", value: "offline" },
        { title: "Online", value: "online" },
      ],
      headers: [
        {
          title: "Tanggal",
          key: "tanggal",
          sortable: false,
          minWidth: 150,
        },
        {
          title: "Invoice",
          key: "invoice",
          sortable: false,
          minWidth: 250,
        },
        {
          title: "Pasien",
          key: "pasien",
          sortable: false,
          minWidth: 250,
        },
        {
          title: "Layanan / Metode",
          key: "layanan",
          sortable: false,
          minWidth: 260,
        },
        {
          title: "Total / Status",
          key: "total_status",
          sortable: false,
          align: "end",
          minWidth: 180,
        },
        {
          title: "Aksi",
          key: "aksi",
          sortable: false,
          align: "end",
          minWidth: 120,
        },
      ],
      snackbar: {
        show: false,
        color: "success",
        text: "",
      },
    };
  },

  computed: {
    normalizedRows() {
      return this.flattenRows(this.rows);
    },

    summary() {
      return this.normalizedRows.reduce(
        (result, item) => {
          result.invoiceCount += 1;
          result.grandTotal += Number(this.getInvoiceTotal(item) || 0);
          result.treatmentTotal += Number(item?.subtotal_treatment || 0);
          result.productTotal += Number(item?.subtotal_produk || 0);
          return result;
        },
        {
          invoiceCount: 0,
          grandTotal: 0,
          treatmentTotal: 0,
          productTotal: 0,
        },
      );
    },
  },

  watch: {
    "filters.search"() {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = window.setTimeout(() => {
        this.fetchData(1);
      }, 450);
    },
  },

  mounted() {
    this.fetchData(1);
  },

  beforeUnmount() {
    window.clearTimeout(this.searchTimer);
  },

  beforeDestroy() {
    window.clearTimeout(this.searchTimer);
  },

  methods: {
    todayDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    async fetchData(page = this.pagination.page) {
      this.loading = true;
      try {
        const params = {
          page,
          per_page: this.pagination.perPage,
          tanggal: this.filters.tanggal || undefined,
          status: this.filters.status || undefined,
          channel: this.filters.channel || undefined,
          search: this.filters.search || undefined,
        };

        const response = await pembayaranService.getHistory(params);
        const payload = response?.data || response || {};
        const rows = this.extractRows(payload);

        this.rows = rows;
        this.applyPagination(payload, rows, page);
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message ||
            "Gagal mengambil riwayat pembayaran.",
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    extractRows(payload) {
      if (Array.isArray(payload?.rows)) {
        return payload.rows;
      }

      if (Array.isArray(payload?.data?.rows)) {
        return payload.data.rows;
      }

      if (Array.isArray(payload?.data?.data)) {
        return payload.data.data;
      }

      if (Array.isArray(payload?.data)) {
        return payload.data;
      }

      return [];
    },

    applyPagination(payload, rows, fallbackPage) {
      const meta = payload?.meta || payload?.data?.meta || payload || {};
      const perPage = Number(
        meta.per_page || meta.perPage || this.pagination.perPage || 15,
      );
      const total = Number(
        meta.total_group ||
          meta.total ||
          meta.total_data ||
          meta.total_invoice ||
          rows.length ||
          0,
      );

      this.pagination.page = Number(
        meta.current_page || meta.page || fallbackPage || 1,
      );
      this.pagination.perPage = perPage;
      this.pagination.total = total;
      this.pagination.lastPage = Number(
        meta.last_page ||
          meta.lastPage ||
          Math.max(1, Math.ceil(total / perPage)),
      );
      this.pagination.from = meta.from || null;
      this.pagination.to = meta.to || null;
    },

    handlePerPageChange() {
      this.fetchData(1);
    },

    handleSearchClear() {
      this.filters.search = "";
      this.fetchData(1);
    },

    flattenRows(rows) {
      const flattened = [];

      rows.forEach((row) => {
        const children = this.getInvoiceChildren(row);

        if (children.length) {
          children.forEach((child) => {
            flattened.push({
              ...row,
              ...child,
              _parent: row,
              _invoice_child: child,
              _row_key: this.getInvoiceKey(child),
            });
          });
          return;
        }

        flattened.push({
          ...row,
          _row_key: this.getInvoiceKey(row),
        });
      });

      if (!this.filters.status) {
        return flattened;
      }

      return flattened.filter(
        (item) => this.getStatusKey(item) === this.filters.status,
      );
    },

    getInvoiceChildren(item) {
      const candidates = [
        item?.invoices,
        item?.invoice_list,
        item?.invoice_rows,
        item?.detail_invoices,
        item?.detail_invoice,
        item?.grouped_invoices,
        item?.invoice_details,
        item?.children,
      ];

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate;
        }
      }

      return [];
    },

    getInvoiceKey(invoice) {
      return (
        invoice?.invoice_id ||
        invoice?.pembayaran_invoice_id ||
        invoice?.pembayaran_id ||
        invoice?.id ||
        invoice?.no_invoice ||
        invoice?.nomor_invoice ||
        invoice?.invoice_number ||
        `${invoice?.jenis_transaksi || "invoice"}-${invoice?.grand_total || 0}`
      );
    },

    getInvoiceId(item) {
      const value =
        item?.invoice_id ??
        item?.pembayaran_invoice_id ??
        item?.pembayaran_id ??
        item?.id ??
        item?.invoice?.id ??
        item?._invoice_child?.id ??
        null;

      const numericValue = Number(value);
      return Number.isFinite(numericValue) && numericValue > 0
        ? numericValue
        : null;
    },

    getPrintableInvoiceId(item) {
      return this.getInvoiceId(item);
    },

    getNomorInvoice(item) {
      return (
        item?.no_invoice ||
        item?.nomor_invoice ||
        item?.invoice_number ||
        item?.faktur ||
        item?._invoice_child?.no_invoice ||
        "-"
      );
    },

    getNomorKunjungan(item) {
      return (
        item?.kode_registrasi ||
        item?.nomor_registrasi ||
        item?.no_registrasi ||
        item?.registrasi?.kode_registrasi ||
        item?._parent?.kode_registrasi ||
        "-"
      );
    },

    getDataDate(item) {
      return (
        item?.tanggal_lunas ||
        item?.paid_at ||
        item?.tanggal_invoice ||
        item?.tanggal_kunjungan ||
        item?.tanggal ||
        item?.date_create ||
        item?.created_at ||
        item?._parent?.tanggal_invoice ||
        null
      );
    },

    getDataTime(item) {
      const value = this.getDataDate(item);
      if (!value) {
        return "-";
      }

      const date = this.normalizeDate(value);
      if (!date) {
        return "-";
      }

      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    getPatientName(item) {
      return (
        item?.pasien_nama ||
        item?.nama_pasien ||
        item?.pasien?.nama ||
        item?.registrasi?.pasien?.nama ||
        item?._parent?.pasien_nama ||
        item?._parent?.nama_pasien ||
        "-"
      );
    },

    getPatientMeta(item) {
      const noRm =
        item?.no_rm ||
        item?.pasien_no_rm ||
        item?.pasien?.no_rm ||
        item?.registrasi?.pasien?.no_rm ||
        item?._parent?.no_rm ||
        "-";

      const phone =
        item?.pasien_no_hp ||
        item?.no_hp ||
        item?.pasien?.no_hp ||
        item?.pasien?.no_wa ||
        item?.registrasi?.pasien?.no_hp ||
        item?._parent?.pasien_no_hp ||
        "-";

      return `${noRm} • ${phone}`;
    },

    getMemberLabel(item) {
      const memberNo = item?.member_no || item?._parent?.member_no || "";
      const tier =
        item?.member_tier_nama || item?._parent?.member_tier_nama || "";

      if (memberNo && tier) {
        return `${memberNo} • ${tier}`;
      }

      return memberNo || tier || "";
    },

    getTokoLabel(item) {
      return (
        item?.cabang ||
        item?.nama_cabang ||
        item?.toko_nama ||
        item?.toko?.nama_toko ||
        item?.toko?.nama ||
        item?.registrasi?.toko?.nama_toko ||
        item?._parent?.toko_nama ||
        ""
      );
    },

    getChannelLabel(item) {
      const raw =
        item?.channel ||
        item?.channel_konsultasi ||
        item?.registrasi?.channel_konsultasi ||
        item?._parent?.channel ||
        item?._parent?.channel_konsultasi ||
        "";

      const value = String(raw).toLowerCase();
      if (["2", "online"].includes(value)) {
        return "Online";
      }
      if (["1", "offline"].includes(value)) {
        return "Offline";
      }
      return "";
    },

    getJenisTransaksiLabel(item) {
      const value = Number(
        item?.jenis_transaksi ??
          item?.jenis_transaksi_id ??
          item?._invoice_child?.jenis_transaksi ??
          item?._parent?.jenis_transaksi ??
          0,
      );

      const labels = {
        0: "Umum",
        1: "Endorse / Faskar",
        2: "EliteGlowbal",
        3: "Owner",
        4: "Deposit",
      };

      return labels[value] || "Umum";
    },

    getServiceChips(item) {
      const chips = [];
      const subtotalTreatment = Number(item?.subtotal_treatment || 0);
      const subtotalProduk = Number(item?.subtotal_produk || 0);
      const subtotalKonsultasi = Number(item?.subtotal_konsultasi || 0);
      const suffix = String(
        item?.invoice_suffix || item?._invoice_child?.invoice_suffix || "",
      ).toUpperCase();
      const jenisTransaksi = Number(item?.jenis_transaksi ?? 0);

      if (subtotalKonsultasi > 0 || this.hasConsultation(item)) {
        chips.push({ label: "Konsultasi", color: "info" });
      }

      if (subtotalTreatment > 0 || this.hasTreatment(item)) {
        chips.push({ label: "Treatment", color: "success" });
      }

      if (subtotalProduk > 0 || this.hasSales(item)) {
        chips.push({ label: "Produk / Obat", color: "primary" });
      }

      if (jenisTransaksi === 4 || suffix === "D") {
        chips.push({ label: "Deposit", color: "deep-purple" });
      }

      return chips.length ? chips : [{ label: "Invoice", color: "grey" }];
    },

    hasConsultation(item) {
      return Boolean(
        item?.has_konsultasi ||
        item?.is_konsultasi ||
        item?.konsultasi_source_code ||
        item?.registrasi?.konsultasi_source_code,
      );
    },

    hasTreatment(item) {
      return Boolean(
        item?.has_treatment ||
        item?.is_treatment ||
        Number(item?.subtotal_treatment || 0) > 0 ||
        item?._parent?.has_treatment ||
        Number(item?._parent?.subtotal_treatment || 0) > 0,
      );
    },

    hasSales(item) {
      return Boolean(
        item?.has_penjualan ||
        item?.has_sales ||
        item?.is_penjualan ||
        Number(item?.subtotal_produk || 0) > 0 ||
        item?._parent?.has_penjualan ||
        Number(item?._parent?.subtotal_produk || 0) > 0,
      );
    },

    getInvoiceTotal(item) {
      return Number(
        item?.grand_total ??
          item?.total_tagihan ??
          item?.total_pembayaran ??
          item?.total_invoice ??
          item?.total ??
          item?.subtotal ??
          item?.amount ??
          0,
      );
    },

    getTotalBayar(item) {
      return Number(
        item?.total_bayar ??
          item?.jumlah_bayar ??
          item?.total_dibayar ??
          item?.paid_amount ??
          item?.grand_total ??
          0,
      );
    },

    getMetodePembayaran(item) {
      const metode =
        item?.metode_pembayaran ||
        item?.metode_bayar ||
        item?.payment_method ||
        item?.metode ||
        item?.metode_list ||
        item?._invoice_child?.metode ||
        item?._parent?.metode ||
        "";

      if (Array.isArray(metode)) {
        return metode
          .map((row) => row?.metode_bayar_nama || row?.nama || row?.name || row)
          .filter(Boolean)
          .join(", ");
      }

      if (typeof metode === "object" && metode !== null) {
        return metode?.metode_bayar_nama || metode?.nama || metode?.name || "";
      }

      return metode;
    },

    getStatusKey(item) {
      const raw = String(
        item?.status_key ||
          item?.status_label ||
          item?.status_invoice ||
          item?.status ||
          item?._invoice_child?.status ||
          "",
      ).toLowerCase();

      if (["3", "lunas", "paid", "selesai"].includes(raw)) {
        return "lunas";
      }

      if (["2", "proses", "diproses", "process"].includes(raw)) {
        return "proses";
      }

      if (["9", "batal", "cancel", "cancelled", "canceled"].includes(raw)) {
        return "batal";
      }

      return "menunggu";
    },

    getStatusMeta(item) {
      const key = this.getStatusKey(item);

      if (key === "lunas") {
        return {
          label: "Lunas",
          color: "success",
          icon: "mdi-check-circle-outline",
        };
      }

      if (key === "proses") {
        return {
          label: "Diproses",
          color: "info",
          icon: "mdi-progress-clock",
        };
      }

      if (key === "batal") {
        return {
          label: "Batal",
          color: "error",
          icon: "mdi-close-circle-outline",
        };
      }

      return {
        label: "Menunggu",
        color: "warning",
        icon: "mdi-clock-outline",
      };
    },

    async openInvoiceReceipt(item) {
      const invoiceId = this.getPrintableInvoiceId(item);
      if (!invoiceId) {
        this.showSnackbar("ID invoice tidak tersedia untuk dicetak.", "error");
        return;
      }

      this.printingInvoiceId = invoiceId;
      try {
        const html = await pembayaranService.printInvoice(invoiceId);
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
          this.showSnackbar(
            "Popup browser diblokir. Izinkan popup untuk cetak invoice.",
            "error",
          );
          return;
        }

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message || "Gagal mencetak invoice.",
          "error",
        );
      } finally {
        this.printingInvoiceId = null;
      }
    },

    normalizeDate(value) {
      if (!value) {
        return null;
      }

      const date = new Date(String(value).replace(" ", "T"));
      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    },

    formatDate(value) {
      const date = this.normalizeDate(value);
      if (!date) {
        return value || "-";
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },
  },
};
</script>

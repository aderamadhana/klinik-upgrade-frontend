<template>
  <div>
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
              @update:model-value="fetchData(1)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchData(1)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.channel"
              :items="channelOptions"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchData(1)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="1" class="d-flex justify-end">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              :loading="loading"
              class="text-none"
              @click="fetchData(1)"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card variant="flat" class="border">
      <v-data-table
        :headers="headers"
        :items="rows"
        :loading="loading"
        :items-per-page="pagination.perPage"
        density="comfortable"
        item-value="id"
        class="border-0"
        hide-default-footer
      >
        <template #loading>
          <v-skeleton-loader type="table-row@6" />
        </template>

        <template #no-data>
          <div class="d-flex flex-column align-center justify-center py-12">
            <v-icon size="42" color="grey">mdi-cash-register</v-icon>
            <div class="text-subtitle-1 font-weight-bold mt-3">
              Data pembayaran tidak ditemukan
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Ubah filter atau tekan Refresh untuk memuat ulang data.
            </div>
          </div>
        </template>

        <template #item.invoice="{ item }">
          <div class="py-2">
            <div class="d-flex align-center flex-wrap ga-2 mb-1">
              <v-btn
                variant="text"
                color="primary"
                density="comfortable"
                size="small"
                class="px-0 text-none font-weight-bold"
                @click="goToDetailPembayaran(getActionTarget(item))"
              >
                {{ getNomorInvoice(item) }}
              </v-btn>

              <v-chip
                v-if="isGroupedInvoice(item)"
                color="primary"
                variant="tonal"
                size="x-small"
                prepend-icon="mdi-file-multiple-outline"
              >
                {{ getInvoiceBadgeLabel(item) }}
              </v-chip>
            </div>

            <div
              class="d-flex align-center ga-1 text-body-2 text-medium-emphasis"
            >
              <v-icon size="14">mdi-file-document-outline</v-icon>
              <span>{{ getNomorKunjungan(item) }}</span>
            </div>

            <div
              class="d-flex align-center ga-1 text-body-2 text-medium-emphasis mt-1"
            >
              <v-icon size="14">mdi-calendar-month-outline</v-icon>
              <span>{{ formatDate(getDataDate(item)) }}</span>
            </div>

            <div
              class="d-flex align-center ga-1 text-body-2 text-medium-emphasis mt-1"
            >
              <v-icon size="14">mdi-clock-outline</v-icon>
              <span>{{ getDataTime(item) }}</span>
            </div>

            <v-sheet
              v-if="getInvoiceChildren(item).length"
              color="grey-lighten-5"
              rounded="lg"
              border
              class="mt-3 pa-2"
            >
              <div
                v-for="child in getInvoiceChildren(item)"
                :key="getInvoiceKey(child)"
                class="d-flex align-center ga-2 py-1"
              >
                <v-chip
                  :color="getJenisTransaksiColor(child)"
                  variant="tonal"
                  size="x-small"
                  class="font-weight-bold"
                >
                  {{ getJenisTransaksiLabel(child) }}
                </v-chip>

                <div class="text-body-2 text-truncate flex-grow-1">
                  {{ getNomorInvoice(child) }}
                </div>

                <div class="text-body-2 font-weight-bold text-no-wrap">
                  Rp {{ formatNumber(getInvoiceTotal(child)) }}
                </div>
              </div>
            </v-sheet>
          </div>
        </template>

        <template #item.pasien="{ item }">
          <div class="py-2">
            <div class="text-body-2 font-weight-bold">
              {{ getPasienName(item) }}
            </div>

            <div class="text-body-2 text-medium-emphasis mt-1">
              {{ getPasienMeta(item) }}
            </div>

            <div class="d-flex align-center flex-wrap ga-1 mt-2">
              <v-chip
                v-if="getCabangLabel(item)"
                color="primary"
                variant="tonal"
                size="x-small"
                class="font-weight-bold"
              >
                {{ getCabangLabel(item) }}
              </v-chip>

              <v-chip
                v-if="getDokterLabel(item)"
                color="blue"
                variant="tonal"
                size="x-small"
                class="font-weight-bold"
              >
                Dokter: {{ getDokterLabel(item) }}
              </v-chip>

              <v-chip
                v-if="getPerawatLabel(item)"
                color="green"
                variant="tonal"
                size="x-small"
                class="font-weight-bold"
              >
                Perawat: {{ getPerawatLabel(item) }}
              </v-chip>
            </div>
          </div>
        </template>

        <template #item.layanan="{ item }">
          <div class="d-flex align-center flex-wrap ga-2 py-2">
            <v-chip
              v-if="hasTreatment(item)"
              color="success"
              variant="tonal"
              size="small"
              prepend-icon="mdi-face-woman-shimmer-outline"
              class="font-weight-bold"
            >
              Treatment
            </v-chip>

            <v-chip
              v-if="hasSales(item)"
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-cart-outline"
              class="font-weight-bold"
            >
              Penjualan
            </v-chip>

            <v-chip
              v-if="hasConsultation(item)"
              color="info"
              variant="tonal"
              size="small"
              prepend-icon="mdi-stethoscope"
              class="font-weight-bold"
            >
              {{ getConsultationLabel(item) }}
            </v-chip>

            <v-chip
              v-if="hasDeposit(item)"
              color="deep-purple"
              variant="tonal"
              size="small"
              prepend-icon="mdi-wallet-giftcard"
              class="font-weight-bold"
            >
              Deposit
            </v-chip>

            <v-chip
              v-if="isPembelianOnline(item)"
              color="orange"
              variant="tonal"
              size="small"
              prepend-icon="mdi-web"
              class="font-weight-bold"
            >
              Online
            </v-chip>
          </div>
        </template>

        <template #item.total_status="{ item }">
          <div class="py-2">
            <div class="text-body-1 font-weight-bold text-no-wrap">
              Rp {{ formatNumber(getTotalTagihan(item)) }}
            </div>

            <div
              v-if="getMetodePembayaran(item)"
              class="text-body-2 text-medium-emphasis mt-1"
            >
              {{ getMetodePembayaran(item) }}
            </div>

            <div class="d-flex align-center flex-wrap ga-1 mt-2">
              <v-chip
                :color="getStatusMeta(item).color"
                variant="tonal"
                size="x-small"
                :prepend-icon="getStatusMeta(item).icon"
                class="font-weight-bold"
              >
                {{ getStatusMeta(item).label }}
              </v-chip>
            </div>
          </div>
        </template>

        <template #item.aksi="{ item }">
          <div class="d-flex justify-end align-center ga-2 py-2">
            <v-btn
              v-if="canProcessPayment(item)"
              color="orange"
              variant="flat"
              size="small"
              prepend-icon="mdi-cash-register"
              class="text-none font-weight-bold"
              @click="goToProsesPembayaran(getProcessTarget(item))"
            >
              Pembayaran
            </v-btn>

            <v-menu
              v-else-if="getInvoiceChildren(item).length > 1"
              location="bottom end"
              :close-on-content-click="true"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="success"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-printer"
                  append-icon="mdi-chevron-down"
                  class="text-none font-weight-bold"
                  :loading="printingInvoiceId === getGroupPrintKey(item)"
                >
                  Invoice
                </v-btn>
              </template>

              <v-card min-width="280" variant="flat" class="border">
                <v-list density="compact">
                  <v-list-subheader>AKSI INVOICE</v-list-subheader>

                  <v-list-item
                    prepend-icon="mdi-printer"
                    title="Cetak Semua"
                    subtitle="Gabungkan semua invoice dalam 1 halaman print"
                    :disabled="printingInvoiceId === getGroupPrintKey(item)"
                    @click="openAllInvoiceReceipts(item)"
                  />

                  <v-divider />

                  <v-list-item
                    v-for="child in getInvoiceChildren(item)"
                    :key="getInvoiceKey(child)"
                    prepend-icon="mdi-file-document-outline"
                    :title="`Cetak ${getJenisTransaksiLabel(child)}`"
                    :subtitle="getNomorInvoice(child)"
                    :disabled="
                      printingInvoiceId === getPrintableInvoiceId(child) ||
                      printingInvoiceId === getGroupPrintKey(item)
                    "
                    @click="openInvoiceReceipt(child)"
                  >
                    <template #append>
                      <div class="text-body-2 font-weight-bold">
                        Rp {{ formatNumber(getInvoiceTotal(child)) }}
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>

            <v-btn
              v-else
              color="success"
              variant="tonal"
              size="small"
              prepend-icon="mdi-printer"
              class="text-none font-weight-bold"
              :loading="printingInvoiceId === getPrintableInvoiceId(item)"
              @click="openInvoiceReceipt(getActionTarget(item))"
            >
              Invoice
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <v-divider />

      <v-card-text>
        <div class="d-flex align-center justify-space-between flex-wrap ga-4">
          <div class="text-body-2 text-medium-emphasis">
            Total data:
            <span class="font-weight-bold text-high-emphasis">
              {{ pagination.total }}
            </span>
          </div>

          <div class="d-flex align-center ga-3">
            <v-select
              v-model="pagination.perPage"
              :items="perPageOptions"
              density="compact"
              variant="outlined"
              hide-details
              class="flex-grow-0"
              @update:model-value="handlePerPageChange"
            />

            <v-pagination
              v-model="pagination.page"
              :length="pagination.lastPage"
              density="comfortable"
              rounded="circle"
              total-visible="5"
              @update:model-value="fetchData"
            />
          </div>
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
  name: "AllPembayaran",

  data() {
    return {
      loading: false,
      printingInvoiceId: null,
      searchTimer: null,
      rows: [],
      filters: {
        search: "",
        tanggal: this.todayDate(),
        status: "",
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
        { title: "Menunggu", value: "menunggu" },
        { title: "Diproses", value: "proses" },
        { title: "Lunas", value: "lunas" },
      ],
      channelOptions: [
        { title: "Semua", value: "" },
        { title: "Offline", value: "offline" },
        { title: "Online", value: "online" },
      ],
      headers: [
        {
          title: "Invoice",
          key: "invoice",
          sortable: false,
          minWidth: 290,
        },
        {
          title: "Pasien",
          key: "pasien",
          sortable: false,
          minWidth: 260,
        },
        {
          title: "Layanan",
          key: "layanan",
          sortable: false,
          minWidth: 260,
        },
        {
          title: "Total / Status",
          key: "total_status",
          sortable: false,
          minWidth: 190,
        },
        {
          title: "Aksi",
          key: "aksi",
          sortable: false,
          align: "end",
          minWidth: 170,
        },
      ],
      snackbar: {
        show: false,
        color: "success",
        text: "",
      },
    };
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
          sync_pending: 1,
        };

        const response = await pembayaranService.getAll(params);
        const payload = response?.data || response || {};
        const rows = this.extractRows(payload);

        this.rows = rows;
        this.applyPagination(payload, rows, page);
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message || "Gagal mengambil data pembayaran.",
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

      this.pagination.page = Number(
        meta.current_page || meta.page || fallbackPage || 1,
      );

      this.pagination.perPage = Number(
        meta.per_page || meta.perPage || this.pagination.perPage || 15,
      );

      this.pagination.total = Number(
        meta.total_group ||
          meta.total ||
          meta.total_data ||
          meta.total_invoice ||
          rows.length ||
          0,
      );

      this.pagination.lastPage = Number(
        meta.last_page ||
          meta.lastPage ||
          Math.max(
            1,
            Math.ceil(this.pagination.total / this.pagination.perPage),
          ),
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

    getActionTarget(item) {
      const children = this.getInvoiceChildren(item);

      return children[0] || item;
    },

    getProcessTarget(item) {
      const children = this.getInvoiceChildren(item);

      if (!children.length) {
        return item;
      }

      const unpaidChild =
        children.find((child) => this.getStatusKey(child) !== "lunas") ||
        children[0];

      return {
        ...item,
        ...unpaidChild,
        registrasi_id:
          this.getRegistrasiId(unpaidChild) || this.getRegistrasiId(item),
        kode_registrasi:
          unpaidChild?.kode_registrasi ||
          item?.kode_registrasi ||
          unpaidChild?.registrasi?.kode_registrasi ||
          item?.registrasi?.kode_registrasi,
      };
    },

    getRegistrasiId(item) {
      const value =
        item?.registrasi_id ??
        item?.registrasi_kunjungan_id ??
        item?.registrasi?.id ??
        item?.kunjungan_id ??
        item?.registration_id ??
        null;

      const numericValue = Number(value);

      return Number.isFinite(numericValue) && numericValue > 0
        ? numericValue
        : null;
    },

    getInvoiceId(item) {
      const value =
        item?.invoice_id ??
        item?.pembayaran_invoice_id ??
        item?.pembayaran_id ??
        item?.id ??
        item?.invoice?.id ??
        null;

      const numericValue = Number(value);

      return Number.isFinite(numericValue) && numericValue > 0
        ? numericValue
        : null;
    },

    getProcessRouteId(item) {
      return this.getInvoiceId(item);
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

    isGroupedInvoice(item) {
      return this.getInvoiceCount(item) > 1;
    },

    getInvoiceCount(item) {
      const childrenCount = this.getInvoiceChildren(item).length;

      return Number(
        item?.invoice_count ||
          item?.jumlah_invoice ||
          item?.total_invoice_group ||
          item?.total_group_invoice ||
          item?.total_invoice ||
          childrenCount ||
          1,
      );
    },

    getInvoiceBadgeLabel(item) {
      return `${this.getInvoiceCount(item)} invoice`;
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

    getNomorInvoice(item) {
      return (
        item?.no_invoice ||
        item?.nomor_invoice ||
        item?.invoice_number ||
        item?.faktur ||
        "-"
      );
    },

    getNomorKunjungan(item) {
      return (
        item?.kode_registrasi ||
        item?.nomor_registrasi ||
        item?.no_registrasi ||
        item?.registrasi?.kode_registrasi ||
        "-"
      );
    },

    getDataDate(item) {
      return (
        item?.tanggal_invoice ||
        item?.tanggal_kunjungan ||
        item?.tanggal ||
        item?.date_create ||
        item?.created_at ||
        null
      );
    },

    getDataTime(item) {
      const value =
        item?.jam_invoice ||
        item?.jam_kunjungan ||
        item?.jam ||
        item?.created_at ||
        item?.date_create ||
        "";

      if (!value) {
        return "-";
      }

      const raw = String(value);

      if (/^\d{2}:\d{2}/.test(raw)) {
        return raw.slice(0, 5);
      }

      const match = raw.match(/\d{2}:\d{2}/);

      return match ? match[0] : "-";
    },

    getPasienName(item) {
      return (
        item?.pasien_nama ||
        item?.nama_pasien ||
        item?.pasien?.nama ||
        item?.registrasi?.pasien?.nama ||
        "-"
      );
    },

    getPasienMeta(item) {
      const noRm =
        item?.pasien_no_rm ||
        item?.no_rm ||
        item?.pasien?.no_rm ||
        item?.registrasi?.pasien?.no_rm ||
        "-";

      const phone =
        item?.pasien_no_hp ||
        item?.no_hp ||
        item?.no_wa ||
        item?.pasien?.no_hp ||
        item?.registrasi?.pasien?.no_hp ||
        "-";

      return `${noRm} • ${phone}`;
    },

    getCabangLabel(item) {
      return (
        item?.cabang ||
        item?.nama_cabang ||
        item?.toko_nama ||
        item?.toko?.nama ||
        item?.registrasi?.toko?.nama ||
        ""
      );
    },

    getDokterLabel(item) {
      return (
        item?.dokter_nama ||
        item?.nama_dokter ||
        item?.dokter?.nama ||
        item?.registrasi?.dokter_awal?.nama ||
        item?.registrasi?.dokterAwal?.nama ||
        ""
      );
    },

    getPerawatLabel(item) {
      return (
        item?.perawat_nama ||
        item?.nama_perawat ||
        item?.perawat?.nama ||
        item?.registrasi?.perawat_awal?.nama ||
        item?.registrasi?.perawatAwal?.nama ||
        ""
      );
    },

    getTotalTagihan(item) {
      const children = this.getInvoiceChildren(item);

      if (children.length) {
        const total = children.reduce((sum, child) => {
          return sum + Number(this.getInvoiceTotal(child) || 0);
        }, 0);

        if (total > 0) {
          return total;
        }
      }

      return this.getInvoiceTotal(item);
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

    getMetodePembayaran(item) {
      const metode =
        item?.metode_pembayaran ||
        item?.metode_bayar ||
        item?.payment_method ||
        item?.metode?.[0]?.metode_bayar_nama ||
        item?.metode?.[0]?.nama ||
        "";

      if (Array.isArray(metode)) {
        return metode
          .map((row) => row?.metode_bayar_nama || row?.nama || row)
          .filter(Boolean)
          .join(", ");
      }

      return metode;
    },

    getStatusKey(item) {
      const raw = String(
        item?.status_key ||
          item?.status_label ||
          item?.status_invoice ||
          item?.status ||
          "",
      ).toLowerCase();

      if (["3", "lunas", "paid", "selesai"].includes(raw)) {
        return "lunas";
      }

      if (["2", "proses", "diproses", "process"].includes(raw)) {
        return "proses";
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

      return {
        label: "Menunggu",
        color: "warning",
        icon: "mdi-clock-outline",
      };
    },

    canProcessPayment(item) {
      const children = this.getInvoiceChildren(item);

      if (children.length) {
        return children.some((child) => this.getStatusKey(child) !== "lunas");
      }

      return this.getStatusKey(item) !== "lunas";
    },

    hasTreatment(item) {
      if (
        item?.has_treatment ||
        item?.is_treatment ||
        Number(item?.subtotal_treatment || 0) > 0
      ) {
        return true;
      }

      return this.getInvoiceChildren(item).some((child) =>
        this.hasTreatment(child),
      );
    },

    hasSales(item) {
      if (
        item?.has_penjualan ||
        item?.has_sales ||
        item?.is_penjualan ||
        Number(item?.subtotal_produk || item?.subtotal_penjualan || 0) > 0
      ) {
        return true;
      }

      return this.getInvoiceChildren(item).some((child) =>
        this.hasSales(child),
      );
    },

    hasConsultation(item) {
      if (
        item?.has_konsultasi ||
        item?.is_konsultasi ||
        item?.is_konsul ||
        Number(item?.subtotal_konsultasi || 0) > 0
      ) {
        return true;
      }

      return this.getInvoiceChildren(item).some((child) =>
        this.hasConsultation(child),
      );
    },

    hasDeposit(item) {
      if (
        item?.has_deposit ||
        item?.is_deposit ||
        item?.jenis_transaksi === 4 ||
        String(item?.jenis_transaksi).toLowerCase() === "deposit" ||
        Number(item?.total_deposit || 0) > 0 ||
        Number(item?.total_deposit_claim || 0) > 0
      ) {
        return true;
      }

      return this.getInvoiceChildren(item).some((child) =>
        this.hasDeposit(child),
      );
    },

    isPembelianOnline(item) {
      if (
        item?.is_pembelian_online ||
        item?.channel === "online" ||
        item?.channel_konsultasi === "online"
      ) {
        return true;
      }

      return this.getInvoiceChildren(item).some((child) =>
        this.isPembelianOnline(child),
      );
    },

    getConsultationLabel(item) {
      if (this.isPembelianOnline(item)) {
        return "Konsultasi Online";
      }

      return "Konsultasi";
    },

    getJenisTransaksiLabel(item) {
      const label =
        item?.jenis_transaksi_label ||
        item?.tipe_invoice_label ||
        item?.kategori_invoice_label ||
        "";

      if (label) {
        return label;
      }

      const value = String(
        item?.jenis_transaksi ??
          item?.tipe_invoice ??
          item?.kategori_invoice ??
          "",
      ).toLowerCase();

      const map = {
        0: "Umum",
        umum: "Umum",
        1: "Endorse",
        endorse: "Endorse",
        faskar: "Faskar",
        2: "EliteGlowbal",
        eliteglowbal: "EliteGlowbal",
        3: "Owner",
        owner: "Owner",
        4: "Deposit",
        deposit: "Deposit",
      };

      return map[value] || "Umum";
    },

    getJenisTransaksiColor(item) {
      const label = this.getJenisTransaksiLabel(item).toLowerCase();

      if (label.includes("deposit")) {
        return "deep-purple";
      }

      if (label.includes("owner")) {
        return "orange";
      }

      if (label.includes("elite")) {
        return "cyan";
      }

      if (label.includes("endorse") || label.includes("faskar")) {
        return "warning";
      }

      return "primary";
    },

    getRoutePaymentId(item) {
      const target = this.getActionTarget(item);

      return (
        target?.invoice_id ||
        target?.pembayaran_invoice_id ||
        target?.pembayaran_id ||
        target?.id ||
        target?.registrasi_id ||
        item?.invoice_id ||
        item?.pembayaran_invoice_id ||
        item?.pembayaran_id ||
        item?.id ||
        item?.registrasi_id
      );
    },

    getPrintableInvoiceId(item) {
      return (
        item?.invoice_id ||
        item?.pembayaran_invoice_id ||
        item?.pembayaran_id ||
        item?.id ||
        item?.invoice?.id ||
        null
      );
    },

    getGroupPrintKey(item) {
      return `group-${
        item?.group_key ||
        item?.registrasi_id ||
        item?.kode_registrasi ||
        item?.id ||
        this.getNomorInvoice(item)
      }`;
    },

    getPrintableInvoiceTargets(item) {
      const children = this.getInvoiceChildren(item);

      if (children.length) {
        return children.filter((child) => this.getPrintableInvoiceId(child));
      }

      return this.getPrintableInvoiceId(item) ? [item] : [];
    },

    goToDetailPembayaran(item) {
      this.goToProsesPembayaran(item);
    },

    goToProsesPembayaran(item) {
      const invoiceId = this.getProcessRouteId(item);

      if (!invoiceId) {
        this.showSnackbar(
          "ID invoice tidak ditemukan pada data pembayaran.",
          "error",
        );
        return;
      }

      this.$router.push({
        name: "Proses Pembayaran Layanan",
        params: {
          id: invoiceId,
        },
      });
    },

    async openInvoiceReceipt(item) {
      const invoiceId = this.getPrintableInvoiceId(item);

      if (!invoiceId) {
        this.showSnackbar("ID invoice tidak ditemukan.", "error");
        return;
      }

      this.printingInvoiceId = invoiceId;

      try {
        const html = await pembayaranService.printInvoice(invoiceId);
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
          this.showSnackbar("Popup browser diblokir.", "error");
          return;
        }

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message || "Gagal membuka invoice.",
          "error",
        );
      } finally {
        this.printingInvoiceId = null;
      }
    },

    extractBodyHtml(html) {
      if (!html) {
        return "";
      }

      const match = String(html).match(/<body[^>]*>([\s\S]*?)<\/body>/i);

      return match ? match[1] : html;
    },

    extractHeadPrintHtml(html) {
      if (!html) {
        return "";
      }

      const source = String(html);
      const styleTags = source.match(/<style[\s\S]*?<\/style>/gi) || [];
      const linkTags =
        source.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];

      return [...linkTags, ...styleTags].join("\n");
    },

    combineInvoiceHtml(htmlList) {
      const headHtml = this.extractHeadPrintHtml(htmlList[0] || "");

      const bodyHtml = htmlList
        .map((html) => {
          return `
            <section class="invoice-print-page">
              ${this.extractBodyHtml(html)}
            </section>
          `;
        })
        .join("\n");

      return `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Cetak Semua Invoice</title>
            ${headHtml}
            <style>
              .invoice-print-page {
                page-break-after: always;
                break-after: page;
              }

              .invoice-print-page:last-child {
                page-break-after: auto;
                break-after: auto;
              }

              @media print {
                .invoice-print-page {
                  page-break-after: always;
                  break-after: page;
                }

                .invoice-print-page:last-child {
                  page-break-after: auto;
                  break-after: auto;
                }
              }
            </style>
          </head>
          <body>
            ${bodyHtml}
          </body>
        </html>
      `;
    },

    async openAllInvoiceReceipts(item) {
      const targets = this.getPrintableInvoiceTargets(item);
      const printKey = this.getGroupPrintKey(item);

      if (!targets.length) {
        this.showSnackbar("Daftar invoice tidak ditemukan.", "error");
        return;
      }

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        this.showSnackbar("Popup browser diblokir.", "error");
        return;
      }

      this.printingInvoiceId = printKey;

      try {
        printWindow.document.open();
        printWindow.document.write(`
          <!doctype html>
          <html>
            <head>
              <title>Memuat Invoice</title>
            </head>
            <body>
              <p style="font-family: Arial, sans-serif;">Memuat invoice...</p>
            </body>
          </html>
        `);
        printWindow.document.close();

        const htmlList = [];

        for (const target of targets) {
          const invoiceId = this.getPrintableInvoiceId(target);

          if (!invoiceId) {
            continue;
          }

          const html = await pembayaranService.printInvoice(invoiceId);
          htmlList.push(html);
        }

        if (!htmlList.length) {
          printWindow.close();
          this.showSnackbar("Invoice tidak dapat dimuat.", "error");
          return;
        }

        printWindow.document.open();
        printWindow.document.write(this.combineInvoiceHtml(htmlList));
        printWindow.document.close();
        printWindow.focus();
      } catch (error) {
        printWindow.close();

        this.showSnackbar(
          error?.response?.data?.message || "Gagal membuka semua invoice.",
          "error",
        );
      } finally {
        this.printingInvoiceId = null;
      }
    },

    formatDate(value) {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatNumber(value) {
      const number = Number(value || 0);

      return number.toLocaleString("id-ID", {
        minimumFractionDigits: number % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      });
    },

    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

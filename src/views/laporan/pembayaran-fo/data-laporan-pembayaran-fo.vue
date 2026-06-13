<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">Data Laporan Pembayaran FO</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Rekap transaksi, pembayaran, kembalian, dan tipe pembayaran per kasir.
        </div>
      </div>

      <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0" />
    </div>

    <v-card elevation="0" rounded="lg" border class="mb-4">
      <v-card-title
        class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
      >
        <v-icon icon="mdi-filter-variant" size="20" />
        Filter Laporan
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.tanggal"
              type="date"
              label="Tanggal"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :disabled="loading || loadingCashiers"
              @update:model-value="loadCashiers"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="filters.kasir_username"
              :items="cashiers"
              item-title="nama"
              item-value="username"
              label="Kasir"
              prepend-inner-icon="mdi-account-cash-outline"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
              :loading="loadingCashiers"
              :disabled="loadingCashiers"
              no-data-text="Kasir tidak ditemukan"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #subtitle>
                    {{ item.raw.username }}
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn
              color="primary"
              height="40"
              block
              prepend-icon="mdi-magnify"
              :loading="loading"
              :disabled="!canSubmit || loadingCashiers"
              @click="loadSummary"
            >
              Terapkan
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row dense class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Total Invoice</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.totals.total_invoice) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Lunas {{ number(summary.totals.total_lunas) }} · Belum lunas
              {{ number(summary.totals.total_belum_lunas) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          color="primary"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Total Pembelian</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.totals.total_pembelian) }}
            </div>
            <div class="text-caption mt-1">
              Treatment dan produk sebelum diskon subtotal.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          color="success"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Total Bayar</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.totals.total_bayar) }}
            </div>
            <div class="text-caption mt-1">
              Nilai pembayaran tercatat pada invoice.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          color="warning"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Total Kembalian</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.totals.total_kembalian) }}
            </div>
            <div class="text-caption mt-1">
              Kasir {{ summary.cashier?.nama || "-" }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border class="mb-4">
      <v-card-title class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" md="5">
            <div
              class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
            >
              <v-icon icon="mdi-cash-register" size="20" />
              Detail Pembayaran FO
            </div>
          </v-col>

          <v-col cols="12" md="7">
            <div class="d-flex justify-end align-center flex-wrap ga-2">
              <v-text-field
                v-model="search"
                label="Cari data"
                placeholder="Faktur, pasien, atau jenis transaksi"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                class="flex-grow-1"
              />

              <v-btn
                color="error"
                variant="flat"
                prepend-icon="mdi-file-pdf-box"
                :loading="downloading === 'pdf'"
                :disabled="!canSubmit || loading || downloading !== ''"
                @click="downloadReport('pdf')"
              >
                Cetak Laporan .pdf
              </v-btn>

              <v-btn
                color="success"
                variant="flat"
                prepend-icon="mdi-file-excel-box"
                :loading="downloading === 'excel'"
                :disabled="!canSubmit || loading || downloading !== ''"
                @click="downloadReport('excel')"
              >
                Cetak Laporan .xlsx
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        :search="search"
        item-value="id"
        density="comfortable"
      >
        <template #item.no="{ index }">{{ index + 1 }}</template>

        <template #item.faktur="{ item }">
          <div class="font-weight-bold text-primary">{{ item.faktur }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ date(item.tanggal) }}
          </div>
        </template>

        <template #item.pasien="{ item }">
          <div class="font-weight-medium">{{ item.pasien }}</div>
        </template>

        <template #item.treatment="{ item }">{{
          rupiah(item.treatment)
        }}</template>
        <template #item.produk="{ item }">{{ rupiah(item.produk) }}</template>
        <template #item.total_pembelian="{ item }">
          <strong>{{ rupiah(item.total_pembelian) }}</strong>
        </template>
        <template #item.diskon_subtotal="{ item }">
          {{ rupiah(item.diskon_subtotal) }}
        </template>
        <template #item.bayar="{ item }">{{ rupiah(item.bayar) }}</template>
        <template #item.kembalian="{ item }">{{
          rupiah(item.kembalian)
        }}</template>

        <template #item.status_label="{ item }">
          <v-chip
            :color="item.status ? 'success' : 'warning'"
            variant="tonal"
            size="small"
          >
            {{ item.status_label }}
          </v-chip>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada data pembayaran untuk kasir dan tanggal yang dipilih.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title
        class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
      >
        <v-icon icon="mdi-credit-card-outline" size="20" />
        Ringkasan Tipe Pembayaran
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="paymentHeaders"
        :items="summary.payment_types"
        :loading="loading"
        item-value="key"
        density="comfortable"
        :items-per-page="-1"
      >
        <template #item.jumlah="{ item }">
          <div class="text-right font-weight-bold">
            {{ rupiah(item.jumlah) }}
          </div>
        </template>

        <template #bottom />
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import pembayaranFoService from "@/services/laporan/pembayaranFoService";

function today() {
  const current = new Date();
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default {
  name: "DataLaporanPembayaranFo",

  data() {
    return {
      loading: false,
      loadingCashiers: false,
      downloading: "",
      errorMessage: "",
      search: "",
      cashiers: [],
      filters: {
        tanggal: today(),
        kasir_username: null,
      },
      summary: this.emptySummary(),
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard", disabled: false },
        { title: "Laporan", disabled: true },
      ],
      headers: [
        {
          title: "No.",
          key: "no",
          sortable: false,
          width: 70,
          align: "center",
        },
        { title: "Faktur", key: "faktur", minWidth: 170 },
        { title: "Pasien", key: "pasien", minWidth: 190 },
        { title: "Treatment", key: "treatment", minWidth: 140, align: "end" },
        { title: "Produk", key: "produk", minWidth: 140, align: "end" },
        {
          title: "Total Pembelian",
          key: "total_pembelian",
          minWidth: 165,
          align: "end",
        },
        {
          title: "Diskon Subtotal",
          key: "diskon_subtotal",
          minWidth: 155,
          align: "end",
        },
        { title: "Bayar", key: "bayar", minWidth: 140, align: "end" },
        { title: "Kembalian", key: "kembalian", minWidth: 140, align: "end" },
        { title: "Jenis Transaksi", key: "jenis_transaksi", minWidth: 170 },
        {
          title: "Status",
          key: "status_label",
          minWidth: 105,
          align: "center",
        },
      ],
      paymentHeaders: [
        { title: "Tipe Pembayaran", key: "nama", sortable: false },
        {
          title: "Jumlah",
          key: "jumlah",
          sortable: false,
          align: "end",
          width: 220,
        },
      ],
    };
  },

  computed: {
    canSubmit() {
      return Boolean(this.filters.tanggal && this.filters.kasir_username);
    },
  },

  async created() {
    await this.loadCashiers();
  },

  methods: {
    emptySummary() {
      return {
        filters: null,
        branch_name: "",
        cashier: null,
        totals: {
          total_invoice: 0,
          total_treatment: 0,
          total_produk: 0,
          total_pembelian: 0,
          total_diskon_subtotal: 0,
          total_bayar: 0,
          total_kembalian: 0,
          total_lunas: 0,
          total_belum_lunas: 0,
        },
        rows: [],
        payment_types: [],
      };
    },

    buildParams() {
      return {
        tanggal: this.filters.tanggal,
        kasir_username: this.filters.kasir_username,
      };
    },

    async loadCashiers() {
      if (!this.filters.tanggal || this.loadingCashiers) return;

      this.loadingCashiers = true;
      this.errorMessage = "";
      const selected = this.filters.kasir_username;

      try {
        const response = await pembayaranFoService.kasir({
          tanggal: this.filters.tanggal,
        });

        this.cashiers = Array.isArray(response?.data) ? response.data : [];
        const stillAvailable = this.cashiers.some(
          (item) => item.username === selected,
        );

        this.filters.kasir_username = stillAvailable
          ? selected
          : this.cashiers[0]?.username || null;

        if (this.filters.kasir_username) {
          await this.loadSummary();
        } else {
          this.summary = this.emptySummary();
        }
      } catch (error) {
        this.cashiers = [];
        this.filters.kasir_username = null;
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil daftar kasir.",
        );
      } finally {
        this.loadingCashiers = false;
      }
    },

    async loadSummary() {
      if (!this.canSubmit || this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await pembayaranFoService.summary(this.buildParams());
        const data = response?.data || {};
        const totals = data.totals || {};

        this.summary = {
          filters: data.filters || null,
          branch_name: data.branch_name || "",
          cashier: data.cashier || null,
          totals: {
            total_invoice: Number(totals.total_invoice || 0),
            total_treatment: Number(totals.total_treatment || 0),
            total_produk: Number(totals.total_produk || 0),
            total_pembelian: Number(totals.total_pembelian || 0),
            total_diskon_subtotal: Number(totals.total_diskon_subtotal || 0),
            total_bayar: Number(totals.total_bayar || 0),
            total_kembalian: Number(totals.total_kembalian || 0),
            total_lunas: Number(totals.total_lunas || 0),
            total_belum_lunas: Number(totals.total_belum_lunas || 0),
          },
          rows: Array.isArray(data.rows) ? data.rows : [],
          payment_types: Array.isArray(data.payment_types)
            ? data.payment_types
            : [],
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil laporan pembayaran FO.",
        );
      } finally {
        this.loading = false;
      }
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await pembayaranFoService.exportReport({
            format,
            ...this.buildParams(),
          });

        const fileBlob = new Blob([blob], {
          type: contentType || blob?.type || "application/octet-stream",
        });
        const url = window.URL.createObjectURL(fileBlob);

        if (format === "pdf") {
          window.open(url, "_blank", "noopener,noreferrer");
          window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
          return;
        }

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengunduh laporan pembayaran FO.",
        );
      } finally {
        this.downloading = "";
      }
    },

    getErrorMessage(error, fallback) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
      );
    },

    number(value) {
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    rupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    date(value) {
      if (!value) return "-";
      const parsed = new Date(`${value}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) return value;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(parsed);
    },
  },
};
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">Data Laporan Pemasukan</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Cetak pemasukan berdasarkan jenis transaksi dan sumber transaksi.
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
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.tanggal_awal"
              type="date"
              label="Tanggal awal"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-calendar-start"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.tanggal_akhir"
              type="date"
              label="Tanggal akhir"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-calendar-end"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="filters.jenis_transaksi"
              :items="jenisTransaksiItems"
              item-title="nama"
              item-value="value"
              label="Jenis transaksi"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-swap-horizontal"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-end">
            <v-btn
              color="primary"
              block
              height="40"
              prepend-icon="mdi-magnify"
              :loading="loading"
              :disabled="!canSubmit"
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
              {{ number(summary.total_invoice) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Periode {{ displayPeriod }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border color="error" variant="tonal">
          <v-card-text>
            <div class="text-body-2">Pemasukan Langsung</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.langsung.grand_total) }}
            </div>
            <div class="text-caption mt-1">
              {{ number(summary.langsung.total_invoice) }} invoice langsung.
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
            <div class="text-body-2">Pemasukan Booking</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.booking.grand_total) }}
            </div>
            <div class="text-caption mt-1">
              {{ number(summary.booking.total_invoice) }} invoice booking.
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
            <div class="text-body-2">Grand Total</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.grand_total) }}
            </div>
            <div class="text-caption mt-1">
              {{ selectedJenisLabel }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border class="mb-4">
      <v-card-title
        class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
      >
        <v-icon icon="mdi-format-list-bulleted-type" size="20" />
        Ringkasan Per Jenis Transaksi
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row dense>
          <v-col
            v-for="item in summary.by_jenis_transaksi"
            :key="item.id"
            cols="12"
            sm="6"
            md="4"
            lg="2"
          >
            <v-card elevation="0" rounded="lg" border>
              <v-card-text>
                <v-chip
                  size="small"
                  variant="tonal"
                  color="primary"
                  class="mb-3 font-weight-bold"
                >
                  {{ item.id }}
                </v-chip>
                <div class="text-body-2 font-weight-bold">
                  {{ item.nama }}
                </div>
                <div class="text-h6 font-weight-bold mt-2">
                  {{ rupiah(item.grand_total) }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ number(item.total_invoice) }} invoice •
                  {{ number(item.total_pasien) }} pasien
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title
        class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
      >
        <v-icon icon="mdi-file-chart-outline" size="20" />
        Cetak Data Laporan Pemasukan
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Laporan memakai tanggal lunas invoice. Jenis transaksi mengikuti
          master: 0 Umum, 1 Endorse/Fasilitas Karyawan, 2 EliteGlowbal, 3 Owner,
          4 Deposit.
        </v-alert>

        <v-row dense>
          <v-col
            v-for="option in exportOptions"
            :key="option.value"
            cols="12"
            md="4"
          >
            <v-card elevation="0" rounded="lg" border>
              <v-card-text>
                <div class="d-flex align-center ga-2 mb-3">
                  <v-icon :icon="option.icon" :color="option.color" />
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">
                      {{ option.title }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ option.description }}
                    </div>
                  </div>
                </div>

                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="error"
                      variant="flat"
                      block
                      prepend-icon="mdi-file-pdf-box"
                      :loading="downloading === `${option.value}-pdf`"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport(option.value, 'pdf')"
                    >
                      PDF
                    </v-btn>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-btn
                      color="success"
                      variant="flat"
                      block
                      prepend-icon="mdi-microsoft-excel"
                      :loading="downloading === `${option.value}-excel`"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport(option.value, 'excel')"
                    >
                      Excel
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import pemasukanUmumService from "@/services/laporan/pemasukanUmumService";

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function emptyAggregate() {
  return {
    total_invoice: 0,
    total_pasien: 0,
    subtotal_produk: 0,
    subtotal_treatment: 0,
    subtotal_konsultasi: 0,
    total_diskon: 0,
    grand_total: 0,
    total_bayar: 0,
  };
}

function defaultJenisTransaksi() {
  return [
    { id: 0, kode: "UMUM", nama: "Umum", value: "0" },
    {
      id: 1,
      kode: "ENDORSE_FASKAR",
      nama: "Endorse / Fasilitas Karyawan",
      value: "1",
    },
    { id: 2, kode: "ELITEGLOWBAL", nama: "EliteGlowbal", value: "2" },
    { id: 3, kode: "OWNER", nama: "Owner", value: "3" },
    { id: 4, kode: "DEPOSIT", nama: "Deposit", value: "4" },
  ];
}

export default {
  name: "DataLaporanPemasukanUmum",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        jenis_transaksi: "",
      },
      jenisTransaksiOptions: defaultJenisTransaksi(),
      summary: {
        total_invoice: 0,
        total_pasien: 0,
        grand_total: 0,
        total_bayar: 0,
        total_diskon: 0,
        langsung: emptyAggregate(),
        booking: emptyAggregate(),
        by_jenis_transaksi: defaultJenisTransaksi().map((item) => ({
          id: item.id,
          nama: item.nama,
          ...emptyAggregate(),
        })),
      },
      breadcrumbs: [
        {
          title: "Dashboard",
          disabled: false,
          to: "/dashboard",
        },
        {
          title: "Laporan",
          disabled: true,
        },
      ],
    };
  },

  computed: {
    canSubmit() {
      return Boolean(this.filters.tanggal_awal && this.filters.tanggal_akhir);
    },

    hasAnyDownload() {
      return Boolean(this.downloading);
    },

    jenisTransaksiItems() {
      return [
        {
          nama: "Semua jenis transaksi",
          value: "",
        },
        ...this.jenisTransaksiOptions.map((item) => ({
          nama: `${item.id} - ${item.nama}`,
          value: String(item.id),
        })),
      ];
    },

    selectedJenisLabel() {
      if (this.filters.jenis_transaksi === "") {
        return "Semua jenis transaksi";
      }

      const selected = this.jenisTransaksiOptions.find(
        (item) => String(item.id) === String(this.filters.jenis_transaksi),
      );

      return selected?.nama || "Jenis transaksi terpilih";
    },

    displayPeriod() {
      return `${this.formatDate(this.filters.tanggal_awal)} - ${this.formatDate(
        this.filters.tanggal_akhir,
      )}`;
    },

    exportOptions() {
      return [
        {
          value: "semua",
          title: "Semua Pemasukan",
          description: "Gabungan transaksi langsung dan booking.",
          icon: "mdi-file-chart-outline",
          color: "primary",
        },
        {
          value: "langsung",
          title: "Pemasukan Langsung",
          description: "Transaksi tanpa sumber booking.",
          icon: "mdi-storefront-outline",
          color: "error",
        },
        {
          value: "booking",
          title: "Pemasukan Booking",
          description: "Transaksi yang berasal dari booking.",
          icon: "mdi-calendar-check-outline",
          color: "warning",
        },
      ];
    },
  },

  watch: {
    "filters.tanggal_awal"() {
      this.syncDateRange();
    },

    "filters.tanggal_akhir"() {
      this.syncDateRange();
    },
  },

  mounted() {
    this.loadSummary();
  },

  methods: {
    syncDateRange() {
      if (
        this.filters.tanggal_awal &&
        this.filters.tanggal_akhir &&
        this.filters.tanggal_akhir < this.filters.tanggal_awal
      ) {
        this.filters.tanggal_akhir = this.filters.tanggal_awal;
      }
    },

    buildParams() {
      const params = {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
      };

      if (this.filters.jenis_transaksi !== "") {
        params.jenis_transaksi = this.filters.jenis_transaksi;
      }

      return params;
    },

    async loadSummary() {
      if (!this.canSubmit) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await pemasukanUmumService.summary(this.buildParams());
        const data = response?.data || {};

        this.jenisTransaksiOptions = this.normalizeJenisTransaksiOptions(
          data.jenis_transaksi_options,
        );
        this.summary = {
          total_invoice: Number(data.total_invoice || 0),
          total_pasien: Number(data.total_pasien || 0),
          grand_total: Number(data.grand_total || 0),
          total_bayar: Number(data.total_bayar || 0),
          total_diskon: Number(data.total_diskon || 0),
          langsung: this.normalizeAggregate(data.langsung),
          booking: this.normalizeAggregate(data.booking),
          by_jenis_transaksi: this.normalizeByJenisTransaksi(
            data.by_jenis_transaksi,
          ),
        };
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil ringkasan laporan pemasukan.",
        );
      } finally {
        this.loading = false;
      }
    },

    normalizeJenisTransaksiOptions(value) {
      const items =
        Array.isArray(value) && value.length ? value : defaultJenisTransaksi();

      return items.map((item) => ({
        id: Number(item.id),
        kode: item.kode_jenis_transaksi || item.kode || "-",
        nama: item.nama_jenis_transaksi || item.nama || "-",
        value: String(item.id),
      }));
    },

    normalizeAggregate(value) {
      const aggregate = value || {};

      return {
        total_invoice: Number(aggregate.total_invoice || 0),
        total_pasien: Number(aggregate.total_pasien || 0),
        subtotal_produk: Number(aggregate.subtotal_produk || 0),
        subtotal_treatment: Number(aggregate.subtotal_treatment || 0),
        subtotal_konsultasi: Number(aggregate.subtotal_konsultasi || 0),
        total_diskon: Number(aggregate.total_diskon || 0),
        grand_total: Number(aggregate.grand_total || 0),
        total_bayar: Number(aggregate.total_bayar || 0),
      };
    },

    normalizeByJenisTransaksi(value) {
      const source = Array.isArray(value) ? value : [];
      const map = new Map(source.map((item) => [Number(item.id), item]));

      return this.jenisTransaksiOptions.map((option) => {
        const item = map.get(Number(option.id)) || {};

        return {
          id: Number(option.id),
          nama: option.nama,
          ...this.normalizeAggregate(item),
        };
      });
    },

    async downloadReport(jenis, format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = `${jenis}-${format}`;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await pemasukanUmumService.exportReport({
            jenis,
            format,
            ...this.buildParams(),
          });

        const fallbackType =
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf";
        const fileBlob = new Blob([blob], {
          type: contentType || blob?.type || fallbackType,
        });
        const url = window.URL.createObjectURL(fileBlob);

        if (format === "pdf") {
          window.open(url, "_blank");
        } else {
          const link = document.createElement("a");
          link.href = url;
          link.download = filename || `laporan-pemasukan-${jenis}.xlsx`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

        window.setTimeout(() => window.URL.revokeObjectURL(url), 1500);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengekspor laporan pemasukan.",
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

    formatDate(value) {
      if (!value) return "-";
      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    },

    rupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    number(value) {
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2,
      }).format(Number(value || 0));
    },
  },
};
</script>

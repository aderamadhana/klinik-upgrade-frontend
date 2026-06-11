<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">
          Data Top Pasien Nominal Terbanyak
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Ranking pasien berdasarkan akumulasi grand total invoice lunas.
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

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.nominal_min"
              :items="nominalRangeItems"
              item-title="label"
              item-value="value"
              label="Nominal awal"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-cash-minus"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.nominal_max"
              :items="nominalRangeItems"
              item-title="label"
              item-value="value"
              label="Nominal akhir"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-cash-plus"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="filters.peringkat"
              type="number"
              label="Peringkat"
              placeholder="Masukkan jumlah peringkat"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-podium"
              min="1"
              max="1000"
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

          <v-col
            cols="12"
            md="5"
            class="d-flex justify-end align-start ga-2 flex-wrap"
          >
            <v-btn
              color="primary"
              height="40"
              prepend-icon="mdi-magnify"
              :loading="loading"
              :disabled="!canSubmit"
              @click="loadSummary"
            >
              Terapkan
            </v-btn>
            <v-btn
              color="error"
              height="40"
              prepend-icon="mdi-file-pdf-box"
              :loading="downloading === 'pdf'"
              :disabled="!canSubmit || loading || downloading !== ''"
              @click="downloadReport('pdf')"
            >
              Cetak laporan .pdf
            </v-btn>
            <v-btn
              color="success"
              height="40"
              prepend-icon="mdi-file-excel-box"
              :loading="downloading === 'excel'"
              :disabled="!canSubmit || loading || downloading !== ''"
              @click="downloadReport('excel')"
            >
              Cetak laporan .xlsx
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row dense class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Total Pasien</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_pasien) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Top {{ number(filters.peringkat) }} pasien sesuai filter.
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
            <div class="text-body-2">Total Nominal</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_nominal) }}
            </div>
            <div class="text-caption mt-1">
              Dari {{ number(summary.total_invoice) }} invoice lunas.
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
            <div class="text-body-2">Rata-rata / Pasien</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.rata_nominal_per_pasien) }}
            </div>
            <div class="text-caption mt-1">
              Berdasarkan total nominal pasien.
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
            <div class="text-body-2">Range Nominal</div>
            <div class="text-h6 font-weight-bold mt-1">
              {{ selectedNominalRangeLabel }}
            </div>
            <div class="text-caption mt-1">
              {{ selectedJenisLabel }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
          <v-icon icon="mdi-trophy-award" size="20" />
          Hasil Ranking Pasien
        </div>

        <v-chip color="primary" variant="tonal" size="small">
          Tanggal lunas invoice
        </v-chip>
      </v-card-title>
      <v-divider />

      <v-card-text v-if="summary.top_pasien" class="pb-0">
        <v-alert type="info" variant="tonal" density="compact">
          Peringkat pertama:
          <strong>{{ summary.top_pasien.nama_pasien }}</strong>
          dengan total nominal
          <strong>{{ rupiah(summary.top_pasien.total_nominal) }}</strong>
          dari
          <strong>{{ number(summary.top_pasien.total_invoice) }}</strong>
          invoice.
        </v-alert>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        item-value="peringkat"
        density="comfortable"
        class="text-no-wrap"
      >
        <template #item.peringkat="{ item }">
          <v-chip
            size="small"
            color="primary"
            variant="tonal"
            class="font-weight-bold"
          >
            #{{ item.peringkat }}
          </v-chip>
        </template>

        <template #item.nama_pasien="{ item }">
          <div class="font-weight-bold">{{ item.nama_pasien }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.no_rm }} • {{ item.no_hp || "-" }}
          </div>
        </template>

        <template #item.periode_transaksi="{ item }">
          <div>{{ item.periode_transaksi }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ number(item.total_hari_transaksi) }} hari transaksi
          </div>
        </template>

        <template #item.total_invoice="{ item }">
          <div class="font-weight-bold text-right">
            {{ number(item.total_invoice) }} invoice
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            Avg {{ rupiah(item.rata_nominal_per_invoice) }}
          </div>
        </template>

        <template #item.total_nominal="{ item }">
          <div class="font-weight-bold text-right">
            {{ rupiah(item.total_nominal) }}
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            Bayar {{ rupiah(item.total_bayar) }}
          </div>
        </template>

        <template #item.komposisi="{ item }">
          <div class="font-weight-bold">
            Treatment {{ rupiah(item.total_treatment) }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Produk {{ rupiah(item.total_produk) }} • Konsul
            {{ rupiah(item.total_konsultasi) }}
          </div>
        </template>

        <template #item.diskon="{ item }">
          <div class="text-right">{{ rupiah(item.total_diskon) }}</div>
          <div class="text-caption text-medium-emphasis text-right">
            Bruto {{ rupiah(item.total_bruto) }}
          </div>
        </template>

        <template #item.invoice_terkait="{ item }">
          <div class="text-truncate">
            {{ item.invoice_terkait }}
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada pasien dalam periode dan range nominal ini.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import topPasienNominalTerbanyakService from "@/services/laporan/topPasienNominalTerbanyakService";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultJenisTransaksi() {
  return [
    { id: 0, kode: "UMUM", nama: "Umum" },
    { id: 1, kode: "ENDORSE_FASKAR", nama: "Endorse / Fasilitas Karyawan" },
    { id: 2, kode: "ELITEGLOWBAL", nama: "EliteGlowbal" },
    { id: 3, kode: "OWNER", nama: "Owner" },
    { id: 4, kode: "DEPOSIT", nama: "Deposit" },
  ];
}

function defaultNominalRanges() {
  return [
    { label: "Rp 0", value: 0 },
    { label: "Rp 500.000", value: 500000 },
    { label: "Rp 1.000.000", value: 1000000 },
    { label: "Rp 2.000.000", value: 2000000 },
    { label: "Rp 3.000.000", value: 3000000 },
    { label: "Rp 5.000.000", value: 5000000 },
    { label: "Rp 10.000.000", value: 10000000 },
    { label: "Rp 25.000.000", value: 25000000 },
    { label: "Rp 50.000.000", value: 50000000 },
    { label: "Rp 100.000.000", value: 100000000 },
  ];
}

export default {
  name: "DataTopPasienNominalTerbanyak",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        nominal_min: 1000000,
        nominal_max: 5000000,
        peringkat: 10,
        jenis_transaksi: "all",
      },
      jenisTransaksiOptions: defaultJenisTransaksi(),
      nominalRangeOptions: defaultNominalRanges(),
      summary: this.emptySummary(),
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard", disabled: false },
        { title: "Laporan", disabled: true },
      ],
      headers: [
        { title: "Peringkat", key: "peringkat", sortable: false, width: 110 },
        { title: "Pasien", key: "nama_pasien", sortable: false, minWidth: 260 },
        { title: "Cabang", key: "cabang", sortable: false, minWidth: 160 },
        {
          title: "Periode",
          key: "periode_transaksi",
          sortable: false,
          minWidth: 180,
        },
        {
          title: "Invoice",
          key: "total_invoice",
          sortable: false,
          align: "end",
          width: 170,
        },
        {
          title: "Total Nominal",
          key: "total_nominal",
          sortable: false,
          align: "end",
          width: 190,
        },
        {
          title: "Komposisi",
          key: "komposisi",
          sortable: false,
          minWidth: 300,
        },
        {
          title: "Diskon",
          key: "diskon",
          sortable: false,
          align: "end",
          width: 170,
        },
        {
          title: "Jenis Transaksi",
          key: "jenis_transaksi",
          sortable: false,
          minWidth: 180,
        },
        {
          title: "Invoice Terkait",
          key: "invoice_terkait",
          sortable: false,
          minWidth: 340,
        },
      ],
    };
  },

  computed: {
    canSubmit() {
      return (
        Boolean(this.filters.tanggal_awal) &&
        Boolean(this.filters.tanggal_akhir) &&
        Number(this.filters.peringkat || 0) > 0 &&
        Number(this.filters.nominal_min || 0) <=
          Number(this.filters.nominal_max || 0)
      );
    },

    jenisTransaksiItems() {
      return [
        { nama: "Semua jenis transaksi", value: "all" },
        ...this.jenisTransaksiOptions.map((item) => ({
          nama: `${item.id} - ${item.nama}`,
          value: String(item.id),
        })),
      ];
    },

    nominalRangeItems() {
      return this.nominalRangeOptions.map((item) => ({
        label: item.label || this.rupiah(item.value),
        value: Number(item.value || 0),
      }));
    },

    selectedJenisLabel() {
      if (
        !this.filters.jenis_transaksi ||
        this.filters.jenis_transaksi === "all"
      ) {
        return "Semua jenis transaksi";
      }

      const selected = this.jenisTransaksiOptions.find(
        (item) => String(item.id) === String(this.filters.jenis_transaksi),
      );

      return selected?.nama || "Jenis transaksi dipilih";
    },

    selectedNominalRangeLabel() {
      return `${this.rupiah(this.filters.nominal_min)} - ${this.rupiah(this.filters.nominal_max)}`;
    },
  },

  created() {
    this.loadSummary();
  },

  methods: {
    emptySummary() {
      return {
        filters: null,
        total_pasien: 0,
        total_invoice: 0,
        total_hari_transaksi: 0,
        total_nominal: 0,
        total_treatment: 0,
        total_produk: 0,
        total_konsultasi: 0,
        rata_nominal_per_pasien: 0,
        rows: [],
        top_pasien: null,
      };
    },

    buildParams() {
      const params = {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
        nominal_min: Number(this.filters.nominal_min || 0),
        nominal_max: Number(this.filters.nominal_max || 0),
        peringkat: Number(this.filters.peringkat || 10),
      };

      if (
        this.filters.jenis_transaksi &&
        this.filters.jenis_transaksi !== "all"
      ) {
        params.jenis_transaksi = this.filters.jenis_transaksi;
      }

      return params;
    },

    async loadSummary() {
      if (!this.canSubmit || this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await topPasienNominalTerbanyakService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.jenisTransaksiOptions = this.normalizeJenisTransaksiOptions(
          data.jenis_transaksi_options,
        );
        this.nominalRangeOptions = this.normalizeNominalRangeOptions(
          data.nominal_range_options,
        );
        this.summary = {
          filters: data.filters || null,
          total_pasien: Number(data.total_pasien || 0),
          total_invoice: Number(data.total_invoice || 0),
          total_hari_transaksi: Number(data.total_hari_transaksi || 0),
          total_nominal: Number(data.total_nominal || 0),
          total_treatment: Number(data.total_treatment || 0),
          total_produk: Number(data.total_produk || 0),
          total_konsultasi: Number(data.total_konsultasi || 0),
          rata_nominal_per_pasien: Number(data.rata_nominal_per_pasien || 0),
          rows: this.normalizeRows(data.rows),
          top_pasien: data.top_pasien
            ? this.normalizeRows([data.top_pasien])[0]
            : null,
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data top pasien nominal terbanyak.",
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
      }));
    },

    normalizeNominalRangeOptions(value) {
      const items =
        Array.isArray(value) && value.length ? value : defaultNominalRanges();

      return items.map((item) => ({
        label: item.label || this.rupiah(item.value),
        value: Number(item.value || 0),
      }));
    },

    normalizeRows(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item) => ({
        peringkat: Number(item.peringkat || 0),
        pasien_id: item.pasien_id,
        no_rm: item.no_rm || "-",
        nama_pasien: item.nama_pasien || "-",
        no_hp: item.no_hp || "-",
        cabang: item.cabang || "-",
        periode_transaksi: item.periode_transaksi || "-",
        total_invoice: Number(item.total_invoice || 0),
        total_hari_transaksi: Number(item.total_hari_transaksi || 0),
        total_nominal: Number(item.total_nominal || 0),
        total_treatment: Number(item.total_treatment || 0),
        total_produk: Number(item.total_produk || 0),
        total_konsultasi: Number(item.total_konsultasi || 0),
        total_bruto: Number(item.total_bruto || 0),
        total_diskon: Number(item.total_diskon || 0),
        total_bayar: Number(item.total_bayar || 0),
        rata_nominal_per_invoice: Number(item.rata_nominal_per_invoice || 0),
        kontribusi_treatment_persen: Number(
          item.kontribusi_treatment_persen || 0,
        ),
        kontribusi_produk_persen: Number(item.kontribusi_produk_persen || 0),
        jenis_transaksi: item.jenis_transaksi || "-",
        invoice_terkait: item.invoice_terkait || "-",
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await topPasienNominalTerbanyakService.exportReport({
            format,
            ...this.buildParams(),
          });

        const fileBlob = new Blob([blob], {
          type: contentType || blob?.type || "application/octet-stream",
        });
        const url = window.URL.createObjectURL(fileBlob);

        if (format === "pdf") {
          window.open(url, "_blank");
        } else {
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengunduh laporan top pasien nominal terbanyak.",
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

<template>
  <div class="pa-4">
    <div
      class="d-flex flex-column flex-md-row justify-space-between align-start ga-3 mb-4"
    >
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">
          Data Laporan Tindakan Terlaris
        </h1>
        <div class="text-body-2 text-medium-emphasis">
          Ranking tindakan/treatment berdasarkan qty terbanyak dari invoice
          lunas.
        </div>
      </div>

      <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0">
        <template #divider>
          <v-icon icon="mdi-chevron-right" size="16" />
        </template>
      </v-breadcrumbs>
    </div>

    <v-card elevation="0" rounded="lg" border class="mb-4">
      <v-card-title
        class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
      >
        <v-icon icon="mdi-filter-outline" size="20" />
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
        >
          {{ errorMessage }}
        </v-alert>

        <v-row dense>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.tanggal_awal"
              type="date"
              label="Tanggal Awal"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.tanggal_akhir"
              type="date"
              label="Tanggal Akhir"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="filters.jenis_transaksi"
              :items="jenisTransaksiItems"
              item-title="nama"
              item-value="value"
              label="Jenis Transaksi"
              variant="outlined"
              density="compact"
              hide-details="auto"
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
            <div class="text-body-2 text-medium-emphasis">Total Tindakan</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_tindakan) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ number(summary.total_item) }} item dari
              {{ number(summary.total_invoice) }} invoice
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
            <div class="text-body-2">Total Qty</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_qty) }}
            </div>
            <div class="text-caption mt-1">Periode {{ displayPeriod }}</div>
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
            <div class="text-body-2">Total Net Treatment</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_net) }}
            </div>
            <div class="text-caption mt-1">
              {{ selectedJenisLabel }}
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
            <div class="text-body-2">Rata-rata Net / Qty</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.rata_net_per_qty) }}
            </div>
            <div class="text-caption mt-1">
              {{ number(summary.total_pasien) }} pasien unik
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense class="mb-4">
      <v-col cols="12" md="5">
        <v-card elevation="0" rounded="lg" border height="100%">
          <v-card-title
            class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
          >
            <v-icon icon="mdi-trophy-outline" size="20" />
            Tindakan Terlaris
          </v-card-title>
          <v-divider />
          <v-card-text v-if="summary.top_tindakan">
            <v-chip
              color="primary"
              variant="tonal"
              class="mb-3 font-weight-bold"
            >
              #{{ summary.top_tindakan.peringkat }}
            </v-chip>
            <div class="text-h6 font-weight-bold mb-1">
              {{ summary.top_tindakan.nama_tindakan }}
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              {{ summary.top_tindakan.kode_accurate }} •
              {{ summary.top_tindakan.kategori_sales }}
            </div>

            <v-row dense>
              <v-col cols="6">
                <v-sheet rounded="lg" border class="pa-3">
                  <div class="text-caption text-medium-emphasis">Qty</div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ number(summary.top_tindakan.total_qty) }}
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet rounded="lg" border class="pa-3">
                  <div class="text-caption text-medium-emphasis">Net</div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ rupiah(summary.top_tindakan.total_net) }}
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text v-else class="text-medium-emphasis">
            Belum ada data tindakan pada filter ini.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card elevation="0" rounded="lg" border height="100%">
          <v-card-title
            class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
          >
            <v-icon icon="mdi-file-chart-outline" size="20" />
            Cetak Data Laporan Tindakan Terlaris
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-alert type="info" variant="tonal" density="compact" class="mb-4">
              Data memakai item invoice treatment yang sudah lunas. Urutan
              terlaris dihitung dari total qty, lalu total net sebagai pembeda.
            </v-alert>

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-btn
                  color="error"
                  block
                  min-height="44"
                  prepend-icon="mdi-file-pdf-box"
                  :loading="downloading === 'pdf'"
                  :disabled="!canSubmit || Boolean(downloading)"
                  @click="downloadReport('pdf')"
                >
                  Cetak Laporan .pdf
                </v-btn>
              </v-col>

              <v-col cols="12" sm="6">
                <v-btn
                  color="success"
                  block
                  min-height="44"
                  prepend-icon="mdi-file-excel-box"
                  :loading="downloading === 'excel'"
                  :disabled="!canSubmit || Boolean(downloading)"
                  @click="downloadReport('excel')"
                >
                  Cetak Laporan .xlsx
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title
        class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3"
      >
        <div class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
          <v-icon icon="mdi-format-list-numbered" size="20" />
          Preview Top 50 Tindakan
        </div>
        <v-chip
          size="small"
          variant="tonal"
          color="primary"
          class="font-weight-bold"
        >
          {{ selectedJenisLabel }}
        </v-chip>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        item-value="peringkat"
        density="compact"
        class="text-body-2"
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

        <template #item.nama_tindakan="{ item }">
          <div class="font-weight-bold">{{ item.nama_tindakan }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.kode_accurate }} • {{ item.kategori_sales }}
          </div>
        </template>

        <template #item.total_qty="{ item }">
          <div class="font-weight-bold text-right">
            {{ number(item.total_qty) }}
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            {{ number(item.total_item) }} item
          </div>
        </template>

        <template #item.total_net="{ item }">
          <div class="font-weight-bold text-right">
            {{ rupiah(item.total_net) }}
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            Avg {{ rupiah(item.rata_net_per_qty) }} / qty
          </div>
        </template>

        <template #item.total_invoice="{ item }">
          <div class="text-right">{{ number(item.total_invoice) }} invoice</div>
          <div class="text-caption text-medium-emphasis text-right">
            {{ number(item.total_pasien) }} pasien
          </div>
        </template>

        <template #item.total_diskon="{ item }">
          <div class="text-right">{{ rupiah(item.total_diskon) }}</div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada data tindakan pada periode ini.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import tindakanTerlarisService from "@/services/laporan/tindakanTerlarisService";

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

export default {
  name: "DataLaporanTindakanTerlaris",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        jenis_transaksi: "all",
      },
      jenisTransaksiOptions: defaultJenisTransaksi(),
      summary: this.emptySummary(),
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard", disabled: false },
        { title: "Laporan", disabled: true },
      ],
      headers: [
        { title: "Peringkat", key: "peringkat", sortable: false, width: 110 },
        {
          title: "Tindakan",
          key: "nama_tindakan",
          sortable: false,
          minWidth: 280,
        },
        { title: "Cabang", key: "cabang", sortable: false, minWidth: 160 },
        {
          title: "Invoice/Pasien",
          key: "total_invoice",
          sortable: false,
          align: "end",
          width: 160,
        },
        {
          title: "Qty",
          key: "total_qty",
          sortable: false,
          align: "end",
          width: 150,
        },
        {
          title: "Diskon",
          key: "total_diskon",
          sortable: false,
          align: "end",
          width: 150,
        },
        {
          title: "Net",
          key: "total_net",
          sortable: false,
          align: "end",
          width: 190,
        },
        {
          title: "Jenis Transaksi",
          key: "jenis_transaksi",
          sortable: false,
          minWidth: 200,
        },
        {
          title: "Dokter",
          key: "dokter_terkait",
          sortable: false,
          minWidth: 180,
        },
        {
          title: "Nurse/Beautician",
          key: "perawat_terkait",
          sortable: false,
          minWidth: 180,
        },
      ],
    };
  },

  computed: {
    canSubmit() {
      return (
        Boolean(this.filters.tanggal_awal) &&
        Boolean(this.filters.tanggal_akhir)
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

    displayPeriod() {
      return `${this.formatDate(this.filters.tanggal_awal)} - ${this.formatDate(this.filters.tanggal_akhir)}`;
    },
  },

  created() {
    this.loadSummary();
  },

  methods: {
    emptySummary() {
      return {
        filters: null,
        total_tindakan: 0,
        total_invoice: 0,
        total_pasien: 0,
        total_item: 0,
        total_qty: 0,
        total_gross: 0,
        total_diskon: 0,
        total_net: 0,
        rata_net_per_qty: 0,
        top_tindakan: null,
        rows: [],
      };
    },

    buildParams() {
      const params = {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
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
        const response = await tindakanTerlarisService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.jenisTransaksiOptions = this.normalizeJenisTransaksiOptions(
          data.jenis_transaksi_options,
        );
        this.summary = {
          filters: data.filters || null,
          total_tindakan: Number(data.total_tindakan || 0),
          total_invoice: Number(data.total_invoice || 0),
          total_pasien: Number(data.total_pasien || 0),
          total_item: Number(data.total_item || 0),
          total_qty: Number(data.total_qty || 0),
          total_gross: Number(data.total_gross || 0),
          total_diskon: Number(data.total_diskon || 0),
          total_net: Number(data.total_net || 0),
          rata_net_per_qty: Number(data.rata_net_per_qty || 0),
          top_tindakan: data.top_tindakan
            ? this.normalizeRows([data.top_tindakan])[0]
            : null,
          rows: this.normalizeRows(data.rows),
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data tindakan terlaris.",
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

    normalizeRows(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item) => ({
        peringkat: Number(item.peringkat || 0),
        treatment_id: item.treatment_id || null,
        kode_accurate: item.kode_accurate || "-",
        nama_tindakan: item.nama_tindakan || "-",
        kategori_sales: item.kategori_sales || "-",
        cabang: item.cabang || "-",
        total_invoice: Number(item.total_invoice || 0),
        total_pasien: Number(item.total_pasien || 0),
        total_item: Number(item.total_item || 0),
        total_qty: Number(item.total_qty || 0),
        total_gross: Number(item.total_gross || 0),
        total_diskon: Number(item.total_diskon || 0),
        total_net: Number(item.total_net || 0),
        rata_net_per_qty: Number(item.rata_net_per_qty || 0),
        tanggal_pertama: item.tanggal_pertama || "-",
        tanggal_terakhir: item.tanggal_terakhir || "-",
        jenis_transaksi: item.jenis_transaksi || "-",
        dokter_terkait: item.dokter_terkait || "-",
        perawat_terkait: item.perawat_terkait || "-",
        invoice_terkait: item.invoice_terkait || "-",
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await tindakanTerlarisService.exportReport({
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
          "Gagal mengunduh laporan tindakan terlaris.",
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
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(value || 0));
    },

    formatDate(value) {
      if (!value) return "-";
      const [year, month, day] = String(value).split("-");
      if (!year || !month || !day) return value;
      return `${day}/${month}/${year}`;
    },
  },
};
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">
          Data Laporan Jumlah Peningkatan
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Ringkasan jumlah transaksi produk, perawatan, dan pasien baru per
          cabang.
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
          <v-col cols="12" md="5">
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

          <v-col cols="12" md="5">
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

          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn
              color="primary"
              height="40"
              block
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
              {{ number(summary.total_pembelian) }}
            </div>
            <div class="text-caption mt-1">
              Registrasi unik dengan produk atau obat.
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
            <div class="text-body-2">Total Perawatan</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_perawatan) }}
            </div>
            <div class="text-caption mt-1">
              Registrasi unik dengan layanan treatment.
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
            <div class="text-body-2">Total Pasien Baru</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_pasien_baru) }}
            </div>
            <div class="text-caption mt-1">
              Transaksi lunas pertama sepanjang histori.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Cakupan Cabang</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_cabang) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ summary.branch_label || "Semua cabang" }}
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
          <v-icon icon="mdi-chart-box-outline" size="20" />
          Ringkasan per Cabang
        </div>

        <div class="d-flex align-center ga-2 flex-wrap">
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
      </v-card-title>

      <v-divider />

      <v-card-text class="pb-0">
        <v-alert type="info" variant="tonal" density="compact">
          Pembelian dan perawatan dihitung per registrasi unik agar invoice
          split tidak dihitung dua kali. Pasien baru mengikuti transaksi lunas
          pertama pasien sepanjang histori.
        </v-alert>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        item-value="toko_id"
        density="comfortable"
      >
        <template #item.no="{ item }">
          <div class="text-center">{{ item.no }}</div>
        </template>

        <template #item.total_pembelian="{ item }">
          <div class="text-right font-weight-bold">
            {{ number(item.total_pembelian) }}
          </div>
        </template>

        <template #item.total_perawatan="{ item }">
          <div class="text-right font-weight-bold">
            {{ number(item.total_perawatan) }}
          </div>
        </template>

        <template #item.total_pasien_baru="{ item }">
          <div class="text-right font-weight-bold">
            {{ number(item.total_pasien_baru) }}
          </div>
        </template>

        <template #item.toko_nama="{ item }">
          <div class="font-weight-bold">{{ item.toko_nama }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.toko_kode }} · {{ item.toko_kode_singkat }}
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada cabang yang sesuai dengan filter laporan.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import jumlahPeningkatanService from "@/services/laporan/jumlahPeningkatanService";

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default {
  name: "DataLaporanJumlahPeningkatan",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
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
        {
          title: "Total Pembelian",
          key: "total_pembelian",
          sortable: false,
          width: 190,
          align: "end",
        },
        {
          title: "Total Perawatan",
          key: "total_perawatan",
          sortable: false,
          width: 190,
          align: "end",
        },
        {
          title: "Total Pasien Baru",
          key: "total_pasien_baru",
          sortable: false,
          width: 200,
          align: "end",
        },
        {
          title: "Toko ID",
          key: "toko_nama",
          sortable: false,
          minWidth: 220,
        },
      ],
    };
  },

  computed: {
    canSubmit() {
      return (
        Boolean(this.filters.tanggal_awal) &&
        Boolean(this.filters.tanggal_akhir) &&
        this.filters.tanggal_akhir >= this.filters.tanggal_awal
      );
    },
  },

  created() {
    this.loadSummary();
  },

  methods: {
    emptySummary() {
      return {
        filters: null,
        branch_label: "",
        total_cabang: 0,
        total_pembelian: 0,
        total_perawatan: 0,
        total_pasien_baru: 0,
        rows: [],
      };
    },

    buildParams() {
      return {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
      };
    },

    async loadSummary() {
      if (!this.canSubmit || this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await jumlahPeningkatanService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.summary = {
          filters: data.filters || null,
          branch_label: data.branch_label || "",
          total_cabang: Number(data.total_cabang || 0),
          total_pembelian: Number(data.total_pembelian || 0),
          total_perawatan: Number(data.total_perawatan || 0),
          total_pasien_baru: Number(data.total_pasien_baru || 0),
          rows: this.normalizeRows(data.rows),
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil laporan jumlah peningkatan.",
        );
      } finally {
        this.loading = false;
      }
    },

    normalizeRows(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item, index) => ({
        no: Number(item.no || index + 1),
        toko_id: Number(item.toko_id || 0),
        toko_kode: item.toko_kode || "-",
        toko_kode_singkat: item.toko_kode_singkat || "-",
        toko_nama: item.toko_nama || "-",
        total_pembelian: Number(item.total_pembelian || 0),
        total_perawatan: Number(item.total_perawatan || 0),
        total_pasien_baru: Number(item.total_pasien_baru || 0),
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await jumlahPeningkatanService.exportReport({
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
          "Gagal mengunduh laporan jumlah peningkatan.",
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
  },
};
</script>

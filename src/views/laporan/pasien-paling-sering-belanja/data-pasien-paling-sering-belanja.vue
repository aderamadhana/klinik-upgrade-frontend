<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">
          Data Pasien Paling Sering Belanja
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Peringkat pasien berdasarkan jumlah transaksi lunas dan total nominal
          belanja.
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

          <v-col cols="12" md="4">
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
            <v-text-field
              v-model.number="filters.peringkat"
              type="number"
              label="Peringkat"
              placeholder="Contoh: 10"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-podium"
              min="1"
              max="1000"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" class="d-flex justify-end">
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
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row dense class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">
              Pasien Dirangking
            </div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_pasien) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Maksimal top {{ number(filters.peringkat) }} pasien.
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
            <div class="text-body-2">Jumlah Transaksi</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_transaksi) }}
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
            <div class="text-body-2">Total Nominal</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_nominal) }}
            </div>
            <div class="text-caption mt-1">
              Grand total invoice lunas bernilai positif.
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
            <div class="text-body-2">Rata-rata / Transaksi</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.rata_rata_per_transaksi) }}
            </div>
            <div class="text-caption mt-1">
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
          <v-icon icon="mdi-account-star-outline" size="20" />
          Hasil Peringkat Pasien
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

      <v-card-text v-if="summary.top_pasien" class="pb-0">
        <v-alert type="info" variant="tonal" density="compact">
          Peringkat pertama:
          <strong>{{ summary.top_pasien.nama_pasien }}</strong> dengan
          <strong>
            {{ number(summary.top_pasien.jumlah_transaksi) }} transaksi
          </strong>
          dan total nominal
          <strong>{{ rupiah(summary.top_pasien.total_nominal) }}</strong
          >.
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
            {{ item.no_rm }} • {{ item.no_hp }}
          </div>
        </template>

        <template #item.jumlah_transaksi="{ item }">
          <div class="font-weight-bold text-right">
            {{ number(item.jumlah_transaksi) }} transaksi
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            {{ number(item.jumlah_invoice) }} invoice
          </div>
        </template>

        <template #item.total_nominal="{ item }">
          <div class="font-weight-bold text-right">
            {{ rupiah(item.total_nominal) }}
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            Rata-rata {{ rupiah(item.rata_rata_transaksi) }}
          </div>
        </template>

        <template #item.transaksi_terakhir="{ item }">
          <div>{{ dateTime(item.transaksi_terakhir) }}</div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada transaksi pasien pada periode dan cabang yang dipilih.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import pasienPalingSeringBelanjaService from "@/services/laporan/pasienPalingSeringBelanjaService";

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default {
  name: "DataPasienPalingSeringBelanja",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        peringkat: 10,
      },
      summary: this.emptySummary(),
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard", disabled: false },
        { title: "Laporan", disabled: true },
      ],
      headers: [
        { title: "Peringkat", key: "peringkat", sortable: false, width: 110 },
        { title: "Pasien", key: "nama_pasien", sortable: false, minWidth: 260 },
        { title: "Cabang", key: "cabang", sortable: false, minWidth: 170 },
        {
          title: "Jumlah Transaksi",
          key: "jumlah_transaksi",
          sortable: false,
          align: "end",
          width: 190,
        },
        {
          title: "Total Nominal",
          key: "total_nominal",
          sortable: false,
          align: "end",
          width: 220,
        },
        {
          title: "Transaksi Terakhir",
          key: "transaksi_terakhir",
          sortable: false,
          width: 180,
        },
      ],
    };
  },

  computed: {
    canSubmit() {
      return (
        Boolean(this.filters.tanggal_awal) &&
        Boolean(this.filters.tanggal_akhir) &&
        this.filters.tanggal_akhir >= this.filters.tanggal_awal &&
        Number(this.filters.peringkat || 0) > 0 &&
        Number(this.filters.peringkat || 0) <= 1000
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
        total_pasien: 0,
        total_transaksi: 0,
        total_invoice: 0,
        total_nominal: 0,
        rata_rata_per_transaksi: 0,
        rows: [],
        top_pasien: null,
      };
    },

    buildParams() {
      return {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
        peringkat: Number(this.filters.peringkat || 10),
      };
    },

    async loadSummary() {
      if (!this.canSubmit || this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await pasienPalingSeringBelanjaService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.summary = {
          filters: data.filters || null,
          branch_label: data.branch_label || "",
          total_pasien: Number(data.total_pasien || 0),
          total_transaksi: Number(data.total_transaksi || 0),
          total_invoice: Number(data.total_invoice || 0),
          total_nominal: Number(data.total_nominal || 0),
          rata_rata_per_transaksi: Number(data.rata_rata_per_transaksi || 0),
          rows: this.normalizeRows(data.rows),
          top_pasien: data.top_pasien
            ? this.normalizeRows([data.top_pasien])[0]
            : null,
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil laporan pasien paling sering belanja.",
        );
      } finally {
        this.loading = false;
      }
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
        jumlah_transaksi: Number(item.jumlah_transaksi || 0),
        jumlah_invoice: Number(item.jumlah_invoice || 0),
        total_nominal: Number(item.total_nominal || 0),
        rata_rata_transaksi: Number(item.rata_rata_transaksi || 0),
        transaksi_terakhir: item.transaksi_terakhir || null,
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await pasienPalingSeringBelanjaService.exportReport({
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
          "Gagal mengunduh laporan pasien paling sering belanja.",
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

    dateTime(value) {
      if (!value) return "-";

      const normalized = String(value).replace(" ", "T");
      const date = new Date(normalized);

      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
  },
};
</script>

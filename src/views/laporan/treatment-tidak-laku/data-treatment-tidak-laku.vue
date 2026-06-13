<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">
          Data Laporan Treatment Tidak Laku
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Treatment aktif yang tidak memiliki transaksi lunas pada periode
          terpilih.
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
          closable
          class="mb-4"
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

          <v-col cols="12" md="4" class="d-flex align-end">
            <v-btn
              color="primary"
              min-height="40"
              prepend-icon="mdi-magnify"
              :loading="loading"
              :disabled="!canSubmit"
              @click="loadSummary"
            >
              Terapkan Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row dense class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border height="100%">
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Treatment Aktif</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_treatment_aktif) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ summary.branch_label || "Semua cabang" }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          height="100%"
          color="success"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Treatment Laku</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_treatment_laku) }}
            </div>
            <div class="text-caption mt-1">
              Memiliki transaksi lunas pada periode ini.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          height="100%"
          color="error"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Treatment Tidak Laku</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_treatment_tidak_laku) }}
            </div>
            <div class="text-caption mt-1">Tidak memiliki transaksi lunas.</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          height="100%"
          color="warning"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Persentase Tidak Laku</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ percentage(summary.persentase_tidak_laku) }}
            </div>
            <div class="text-caption mt-1">Periode {{ displayPeriod }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title class="d-flex align-center flex-wrap ga-3 py-4">
        <div class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
          <v-icon icon="mdi-spa-outline" size="20" />
          Daftar Treatment Tidak Laku
        </div>

        <v-spacer />

        <v-text-field
          v-model="search"
          label="Cari treatment"
          placeholder="Nama, kode Accurate, atau kategori"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :search="search"
        :loading="loading"
        item-value="treatment_id"
        density="comfortable"
        :items-per-page="25"
        no-data-text="Tidak ada treatment tidak laku pada periode ini."
        loading-text="Memuat data treatment..."
      >
        <template #item.no="{ index }">
          {{ index + 1 }}
        </template>

        <template #item.kode_accurate="{ item }">
          {{ item.kode_accurate || "-" }}
        </template>

        <template #item.kategori_sales="{ item }">
          <v-chip size="small" variant="tonal" color="primary">
            {{ item.kategori_sales || "Tanpa kategori" }}
          </v-chip>
        </template>
      </v-data-table>

      <v-divider />

      <v-card-actions class="d-flex flex-wrap ga-2 pa-4">
        <v-btn
          color="error"
          variant="flat"
          min-height="40"
          prepend-icon="mdi-file-pdf-box"
          :loading="downloading === 'pdf'"
          :disabled="!canSubmit || hasAnyDownload"
          @click="downloadReport('pdf')"
        >
          Cetak laporan .pdf
        </v-btn>

        <v-btn
          color="success"
          variant="flat"
          min-height="40"
          prepend-icon="mdi-file-excel-box"
          :loading="downloading === 'excel'"
          :disabled="!canSubmit || hasAnyDownload"
          @click="downloadReport('excel')"
        >
          Cetak laporan .xlsx
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import treatmentTidakLakuService from "@/services/laporan/treatmentTidakLakuService";

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function emptySummary() {
  return {
    total_treatment_aktif: 0,
    total_treatment_laku: 0,
    total_treatment_tidak_laku: 0,
    persentase_tidak_laku: 0,
    branch_label: "",
    rows: [],
  };
}

export default {
  name: "DataTreatmentTidakLaku",

  data() {
    const currentDate = today();

    return {
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard" },
        { title: "Laporan", disabled: true },
        { title: "Treatment Tidak Laku", disabled: true },
      ],
      filters: {
        tanggal_awal: currentDate,
        tanggal_akhir: currentDate,
      },
      headers: [
        { title: "No.", key: "no", sortable: false, width: 80 },
        { title: "Nama Treatment", key: "nama" },
        { title: "Kode Accurate", key: "kode_accurate", width: 180 },
        { title: "Kategori", key: "kategori_sales", width: 180 },
      ],
      summary: emptySummary(),
      search: "",
      loading: false,
      downloading: "",
      errorMessage: "",
    };
  },

  computed: {
    canSubmit() {
      return Boolean(
        this.filters.tanggal_awal &&
        this.filters.tanggal_akhir &&
        this.filters.tanggal_awal <= this.filters.tanggal_akhir,
      );
    },

    hasAnyDownload() {
      return Boolean(this.downloading);
    },

    displayPeriod() {
      return `${this.formatDate(this.filters.tanggal_awal)} s/d ${this.formatDate(
        this.filters.tanggal_akhir,
      )}`;
    },
  },

  mounted() {
    this.loadSummary();
  },

  methods: {
    async loadSummary() {
      if (!this.canSubmit || this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await treatmentTidakLakuService.summary({
          ...this.filters,
        });

        this.summary = {
          ...emptySummary(),
          ...(response?.data || {}),
          rows: Array.isArray(response?.data?.rows) ? response.data.rows : [],
        };
      } catch (error) {
        this.summary = emptySummary();
        this.errorMessage = this.resolveError(
          error,
          "Gagal mengambil laporan treatment tidak laku.",
        );
      } finally {
        this.loading = false;
      }
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.hasAnyDownload) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const result = await treatmentTidakLakuService.exportReport({
          format,
          ...this.filters,
        });

        const url = URL.createObjectURL(result.blob);

        if (format === "pdf") {
          window.open(url, "_blank", "noopener,noreferrer");
          window.setTimeout(() => URL.revokeObjectURL(url), 60000);
          return;
        }

        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        this.errorMessage = this.resolveError(
          error,
          "Gagal mencetak laporan treatment tidak laku.",
        );
      } finally {
        this.downloading = "";
      }
    },

    number(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    percentage(value) {
      return `${new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(value || 0))}%`;
    },

    formatDate(value) {
      if (!value) return "-";

      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    },

    resolveError(error, fallback) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
      );
    },
  },
};
</script>

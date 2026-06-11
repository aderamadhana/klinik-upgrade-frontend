<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">Data Laporan Detail Pasien</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Export data detail pasien berdasarkan tanggal daftar pasien.
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

          <v-col cols="12" md="4" class="d-flex align-end">
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
            <div class="text-body-2 text-medium-emphasis">Total Pasien</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_pasien) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Periode {{ displayPeriod }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Member Aktif</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_member) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Berdasarkan data member terbaru pasien.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">No. WA Terisi</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_no_wa_terisi) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Berguna untuk follow-up CRM.
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
            <div class="text-body-2">Total Spending</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_spending) }}
            </div>
            <div class="text-caption mt-1">
              Dari invoice lunas pasien yang masuk filter.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title
        class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
      >
        <v-icon icon="mdi-file-chart-outline" size="20" />
        Cetak Data Laporan Detail Pasien
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Data memakai tanggal daftar pasien. Cabang mengikuti toko aktif dari
          header request.
        </v-alert>

        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-btn
              color="error"
              block
              min-height="44"
              prepend-icon="mdi-file-pdf-box"
              :loading="downloading === 'pdf'"
              :disabled="!canSubmit || hasAnyDownload"
              @click="downloadReport('pdf')"
            >
              Cetak laporan .pdf
            </v-btn>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-btn
              color="success"
              block
              min-height="44"
              prepend-icon="mdi-file-excel-box"
              :loading="downloading === 'excel'"
              :disabled="!canSubmit || hasAnyDownload"
              @click="downloadReport('excel')"
            >
              Cetak laporan .xlsx
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import detailPasienService from "@/services/laporan/detailPasienService";

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export default {
  name: "DataLaporanDetailPasien",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
      },
      summary: {
        total_pasien: 0,
        total_member: 0,
        total_no_wa_terisi: 0,
        total_spending: 0,
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

    displayPeriod() {
      return `${this.formatDate(this.filters.tanggal_awal)} - ${this.formatDate(
        this.filters.tanggal_akhir,
      )}`;
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
      return {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
      };
    },

    async loadSummary() {
      if (!this.canSubmit) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await detailPasienService.summary(this.buildParams());
        const data = response?.data || {};

        this.summary = {
          total_pasien: Number(data.total_pasien || 0),
          total_member: Number(data.total_member || 0),
          total_no_wa_terisi: Number(data.total_no_wa_terisi || 0),
          total_spending: Number(data.total_spending || 0),
        };
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil ringkasan laporan detail pasien.",
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
          await detailPasienService.exportReport({
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
          "Gagal mengunduh laporan detail pasien.",
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

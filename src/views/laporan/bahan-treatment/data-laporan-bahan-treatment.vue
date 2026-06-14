<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">Laporan Bahan Treatment</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Detail penggunaan bahan per transaksi dan rekap total bahan per
          treatment.
        </div>
      </div>

      <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0" />
    </div>

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

    <div class="d-flex align-center ga-2 flex-wrap mb-4">
      <v-btn-toggle
        v-model="activeReport"
        mandatory
        color="primary"
        variant="outlined"
        density="comfortable"
        :disabled="loading || downloading"
      >
        <v-btn value="detail" prepend-icon="mdi-file-document-multiple-outline">
          Detail
        </v-btn>
        <v-btn value="rekap" prepend-icon="mdi-chart-box-outline">
          Rekap
        </v-btn>
      </v-btn-toggle>
    </div>

    <v-card elevation="0" rounded="lg" border class="mb-4">
      <v-card-title class="d-flex align-center ga-2 font-weight-bold">
        <v-icon
          :icon="
            activeReport === 'detail'
              ? 'mdi-file-document-outline'
              : 'mdi-chart-box-outline'
          "
          size="21"
          color="primary"
        />
        {{ activeReportTitle }}
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="filters.tanggal_awal"
              type="date"
              label="Tanggal Awal"
              prepend-inner-icon="mdi-calendar-start"
              variant="outlined"
              density="compact"
              :disabled="loading || downloading"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="5">
            <v-text-field
              v-model="filters.tanggal_akhir"
              type="date"
              label="Tanggal Akhir"
              prepend-inner-icon="mdi-calendar-end"
              variant="outlined"
              density="compact"
              :disabled="loading || downloading"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-start">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-magnify"
              block
              :loading="loading"
              :disabled="downloading || !isFilterValid"
              @click="loadSummary"
            >
              Tampilkan
            </v-btn>
          </v-col>
        </v-row>

        <div class="text-caption text-medium-emphasis mt-3">
          Periode menggunakan tanggal pengisian bahan oleh Nurse Station.
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 d-flex flex-wrap ga-2">
        <v-btn
          color="error"
          variant="flat"
          prepend-icon="mdi-file-pdf-box"
          :loading="downloadingFormat === 'pdf'"
          :disabled="loading || downloading || !isFilterValid"
          @click="downloadReport('pdf')"
        >
          Cetak Laporan PDF
        </v-btn>

        <v-btn
          color="success"
          variant="flat"
          prepend-icon="mdi-file-excel-box"
          :loading="downloadingFormat === 'excel'"
          :disabled="loading || downloading || !isFilterValid"
          @click="downloadReport('excel')"
        >
          Export Excel (.xlsx)
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-row dense class="mb-4">
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          color="primary"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">{{ firstSummaryLabel }}</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(firstSummaryValue) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" rounded="lg" border color="info" variant="tonal">
          <v-card-text>
            <div class="text-body-2">{{ secondSummaryLabel }}</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(secondSummaryValue) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          color="warning"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Jumlah Baris Bahan</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.totals.total_bahan) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          rounded="lg"
          border
          color="success"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">{{ fourthSummaryLabel }}</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(fourthSummaryValue) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div>
          <div class="text-subtitle-1 font-weight-bold">Preview Laporan</div>
          <div class="text-caption text-medium-emphasis mt-1">
            Cabang: {{ summary.branch_label || "-" }}
          </div>
        </div>

        <div class="d-flex align-center ga-2 flex-wrap">
          <v-text-field
            v-model="search"
            label="Cari data"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />

          <v-btn
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-refresh"
            :loading="loading"
            :disabled="downloading"
            @click="loadSummary"
          >
            Muat Ulang
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="activeHeaders"
        :items="summary.rows"
        :loading="loading"
        :search="search"
        :item-value="activeReport === 'detail' ? 'id' : 'no_global'"
        density="comfortable"
      >
        <template #item.no_invoice="{ item }">
          <div class="font-weight-bold">{{ item.no_invoice }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ date(item.tanggal) }}
          </div>
        </template>

        <template #item.nama_pasien="{ item }">
          <div class="font-weight-bold">{{ item.nama_pasien }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.no_rm }}
          </div>
        </template>

        <template #item.nama_treatment="{ item }">
          <div class="font-weight-medium">{{ item.nama_treatment }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.kode_treatment }}
          </div>
        </template>

        <template #item.nama_bahan="{ item }">
          <div class="font-weight-medium">{{ item.nama_bahan }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.kode_bahan }}
          </div>
        </template>

        <template #item.jumlah="{ item }">
          <div class="text-right font-weight-bold">
            {{ quantity(item.jumlah) }}
          </div>
        </template>

        <template #item.total_jumlah="{ item }">
          <div class="text-right font-weight-bold">
            {{ quantity(item.total_jumlah) }}
          </div>
        </template>

        <template #item.frekuensi="{ item }">
          <div class="text-center font-weight-bold">
            {{ number(item.frekuensi) }}
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada penggunaan bahan treatment pada periode yang dipilih.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import bahanTreatmentService from "@/services/laporan/bahanTreatmentService";

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initialFilters() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    tanggal_awal: toDateInput(firstDay),
    tanggal_akhir: toDateInput(today),
  };
}

function createEmptySummary() {
  return {
    branch_label: "-",
    filters: {},
    jenis: "detail",
    totals: {
      total_registrasi: 0,
      total_pasien: 0,
      total_treatment: 0,
      total_bahan: 0,
      total_jumlah: 0,
      total_frekuensi: 0,
    },
    groups: [],
    rows: [],
  };
}

export default {
  name: "DataLaporanBahanTreatment",

  data() {
    return {
      activeReport: "detail",
      filters: initialFilters(),
      loading: false,
      downloadingFormat: "",
      errorMessage: "",
      search: "",
      summary: createEmptySummary(),
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard", disabled: false },
        { title: "Laporan", disabled: true },
        { title: "Bahan Treatment", disabled: true },
      ],
      detailHeaders: [
        {
          title: "Faktur / Tanggal",
          key: "no_invoice",
          minWidth: 190,
        },
        {
          title: "Pasien",
          key: "nama_pasien",
          minWidth: 210,
        },
        {
          title: "Treatment",
          key: "nama_treatment",
          minWidth: 240,
        },
        {
          title: "Bahan",
          key: "nama_bahan",
          minWidth: 260,
        },
        {
          title: "Satuan",
          key: "satuan",
          align: "center",
          minWidth: 100,
        },
        {
          title: "Jumlah",
          key: "jumlah",
          align: "end",
          minWidth: 110,
        },
      ],
      recapHeaders: [
        {
          title: "Treatment",
          key: "nama_treatment",
          minWidth: 270,
        },
        {
          title: "Bahan",
          key: "nama_bahan",
          minWidth: 300,
        },
        {
          title: "Satuan",
          key: "satuan",
          align: "center",
          minWidth: 110,
        },
        {
          title: "Total Jumlah",
          key: "total_jumlah",
          align: "end",
          minWidth: 140,
        },
        {
          title: "Frekuensi",
          key: "frekuensi",
          align: "center",
          minWidth: 120,
        },
      ],
    };
  },

  computed: {
    downloading() {
      return Boolean(this.downloadingFormat);
    },

    activeReportTitle() {
      return this.activeReport === "detail"
        ? "Detail Bahan Treatment"
        : "Rekap Bahan Treatment";
    },

    activeHeaders() {
      return this.activeReport === "detail"
        ? this.detailHeaders
        : this.recapHeaders;
    },

    isFilterValid() {
      return Boolean(
        this.filters.tanggal_awal &&
        this.filters.tanggal_akhir &&
        this.filters.tanggal_akhir >= this.filters.tanggal_awal,
      );
    },

    firstSummaryLabel() {
      return this.activeReport === "detail"
        ? "Total Registrasi"
        : "Total Treatment";
    },

    firstSummaryValue() {
      return this.activeReport === "detail"
        ? this.summary.totals.total_registrasi
        : this.summary.totals.total_treatment;
    },

    secondSummaryLabel() {
      return this.activeReport === "detail"
        ? "Total Treatment"
        : "Total Frekuensi";
    },

    secondSummaryValue() {
      return this.activeReport === "detail"
        ? this.summary.totals.total_treatment
        : this.summary.totals.total_frekuensi;
    },

    fourthSummaryLabel() {
      return this.activeReport === "detail"
        ? "Total Pasien"
        : "Total Registrasi";
    },

    fourthSummaryValue() {
      return this.activeReport === "detail"
        ? this.summary.totals.total_pasien
        : this.summary.totals.total_registrasi;
    },
  },

  watch: {
    activeReport() {
      this.search = "";
      this.loadSummary();
    },
  },

  mounted() {
    this.loadSummary();
  },

  methods: {
    emptySummary() {
      return createEmptySummary();
    },

    requestParams() {
      return {
        jenis: this.activeReport,
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
      };
    },

    async loadSummary() {
      if (!this.isFilterValid || this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await bahanTreatmentService.summary(
          this.requestParams(),
        );
        const data = response?.data || {};

        this.summary = {
          ...this.emptySummary(),
          ...data,
          totals: {
            ...this.emptySummary().totals,
            ...(data.totals || {}),
          },
          groups: Array.isArray(data.groups) ? data.groups : [],
          rows: Array.isArray(data.rows) ? data.rows : [],
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.errorText(
          error,
          "Gagal mengambil laporan bahan treatment.",
        );
      } finally {
        this.loading = false;
      }
    },

    async downloadReport(format) {
      if (!this.isFilterValid || this.downloading) return;

      this.downloadingFormat = format;
      this.errorMessage = "";

      try {
        const result = await bahanTreatmentService.exportReport({
          ...this.requestParams(),
          format,
        });

        const url = URL.createObjectURL(result.blob);

        if (format === "pdf") {
          const opened = window.open(url, "_blank", "noopener,noreferrer");

          if (!opened) {
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = result.filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
          }

          window.setTimeout(() => URL.revokeObjectURL(url), 60000);
          return;
        }

        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = result.filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        this.errorMessage = await this.downloadErrorText(
          error,
          "Gagal mengekspor laporan bahan treatment.",
        );
      } finally {
        this.downloadingFormat = "";
      }
    },

    errorText(error, fallback) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
      );
    },

    async downloadErrorText(error, fallback) {
      const data = error?.response?.data;

      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          return parsed?.message || parsed?.error || fallback;
        } catch {
          return fallback;
        }
      }

      return this.errorText(error, fallback);
    },

    number(value) {
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    quantity(value) {
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      }).format(Number(value || 0));
    },

    date(value) {
      if (!value) return "-";

      const [year, month, day] = String(value).split("-");
      if (!year || !month || !day) return value;

      return `${day}/${month}/${year}`;
    },
  },
};
</script>

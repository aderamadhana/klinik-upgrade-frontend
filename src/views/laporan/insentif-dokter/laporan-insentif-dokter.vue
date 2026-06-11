<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">Laporan Insentif Dokter</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Export insentif treatment dan produk dokter berdasarkan invoice lunas.
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
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="filters.dokter_id"
              :items="dokterOptions"
              :loading="loadingDokter"
              item-title="label"
              item-value="id"
              label="Dokter"
              placeholder="Pilih dokter"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
              :disabled="loading"
              no-data-text="Dokter tidak ditemukan"
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
      <v-col cols="12" md="4">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Treatment</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.treatment.total_insentif) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ summary.treatment.total_item }} item •
              {{ number(summary.treatment.total_qty) }} qty
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Produk</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.produk.total_insentif) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ summary.produk.total_item }} item •
              {{ number(summary.produk.total_qty) }} qty
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          elevation="0"
          rounded="lg"
          border
          color="primary"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Total Insentif</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.grand_total_insentif) }}
            </div>
            <div class="text-caption mt-1">Periode {{ displayPeriod }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title
        class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
      >
        <v-icon icon="mdi-file-chart-outline" size="20" />
        Insentif Dokter (%)
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-alert
          v-if="!filters.dokter_id"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Pilih dokter dulu sebelum export laporan.
        </v-alert>

        <v-row>
          <v-col
            v-for="group in reportGroups"
            :key="group.key"
            cols="12"
            md="6"
          >
            <v-card elevation="0" rounded="lg" border>
              <v-card-title
                class="d-flex align-center justify-space-between ga-3 text-subtitle-2 font-weight-bold"
              >
                <span>{{ group.title }}</span>
                <v-chip size="small" variant="tonal" :color="group.color">
                  {{ rupiah(group.total) }}
                </v-chip>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="error"
                      block
                      min-height="44"
                      prepend-icon="mdi-file-pdf-box"
                      :loading="downloading === `${group.key}-summary-pdf`"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport(group.key, 'summary', 'pdf')"
                    >
                      {{ group.summaryPdfLabel }}
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="success"
                      block
                      min-height="44"
                      prepend-icon="mdi-file-excel-box"
                      :loading="downloading === `${group.key}-summary-excel`"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport(group.key, 'summary', 'excel')"
                    >
                      {{ group.summaryExcelLabel }}
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="error"
                      block
                      min-height="52"
                      prepend-icon="mdi-file-pdf-box"
                      :loading="downloading === `${group.key}-detail-pdf`"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport(group.key, 'detail', 'pdf')"
                    >
                      {{ group.detailPdfLabel }}
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="success"
                      block
                      min-height="52"
                      prepend-icon="mdi-file-excel-box"
                      :loading="downloading === `${group.key}-detail-excel`"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport(group.key, 'detail', 'excel')"
                    >
                      {{ group.detailExcelLabel }}
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
import insentifDokterService from "@/services/laporan/insentifDokterService";

export default {
  name: "LaporanInsentifDokter",

  data() {
    const today = this.todayDate();

    return {
      breadcrumbs: [
        {
          title: "Dashboard",
          to: "/dashboard",
          disabled: false,
        },
        {
          title: "Laporan",
          disabled: true,
        },
        {
          title: "Insentif Dokter",
          disabled: true,
        },
      ],
      filters: {
        tanggal_awal: today,
        tanggal_akhir: today,
        dokter_id: null,
      },
      dokterOptions: [],
      summary: {
        treatment: {
          total_item: 0,
          total_qty: 0,
          total_omzet: 0,
          total_insentif: 0,
        },
        produk: {
          total_item: 0,
          total_qty: 0,
          total_omzet: 0,
          total_insentif: 0,
        },
        grand_total_insentif: 0,
      },
      loading: false,
      loadingDokter: false,
      downloading: "",
      errorMessage: "",
    };
  },

  computed: {
    canSubmit() {
      return Boolean(
        this.filters.tanggal_awal &&
        this.filters.tanggal_akhir &&
        this.filters.dokter_id,
      );
    },

    hasAnyDownload() {
      return this.downloading !== "";
    },

    displayPeriod() {
      return `${this.formatDate(this.filters.tanggal_awal)} - ${this.formatDate(
        this.filters.tanggal_akhir,
      )}`;
    },

    reportGroups() {
      return [
        {
          key: "treatment",
          title: "Laporan Insentif Treatment",
          color: "primary",
          total: this.summary.treatment.total_insentif,
          summaryPdfLabel: "Laporan Insentif Treatment",
          summaryExcelLabel: "Laporan Insentif Treatment",
          detailPdfLabel: "[Detail] Laporan Insentif Treatment",
          detailExcelLabel: "[Detail] Laporan Insentif Treatment",
        },
        {
          key: "produk",
          title: "Laporan Insentif Produk",
          color: "success",
          total: this.summary.produk.total_insentif,
          summaryPdfLabel: "Laporan Insentif Produk",
          summaryExcelLabel: "Laporan Insentif Produk",
          detailPdfLabel: "[Detail] Laporan Insentif Produk",
          detailExcelLabel: "[Detail] Laporan Insentif Produk",
        },
      ];
    },
  },

  mounted() {
    this.loadDokter();
  },

  methods: {
    defaultSummary() {
      return {
        treatment: {
          total_item: 0,
          total_qty: 0,
          total_omzet: 0,
          total_insentif: 0,
        },
        produk: {
          total_item: 0,
          total_qty: 0,
          total_omzet: 0,
          total_insentif: 0,
        },
        grand_total_insentif: 0,
      };
    },

    todayDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    async loadDokter() {
      this.loadingDokter = true;
      this.errorMessage = "";

      try {
        const response = await insentifDokterService.dokter({ limit: 100 });
        this.dokterOptions = response?.data || [];

        if (!this.filters.dokter_id && this.dokterOptions.length) {
          this.filters.dokter_id = this.dokterOptions[0].id;
          await this.loadSummary();
        }
      } catch (error) {
        this.errorMessage = await this.getErrorMessage(
          error,
          "Gagal mengambil daftar dokter.",
        );
      } finally {
        this.loadingDokter = false;
      }
    },

    async loadSummary() {
      if (!this.canSubmit) {
        this.errorMessage = "Tanggal dan dokter wajib dipilih.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await insentifDokterService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.summary = {
          ...this.defaultSummary(),
          ...data,
          treatment: {
            ...this.defaultSummary().treatment,
            ...(data.treatment || {}),
          },
          produk: {
            ...this.defaultSummary().produk,
            ...(data.produk || {}),
          },
        };
      } catch (error) {
        this.summary = this.defaultSummary();
        this.errorMessage = await this.getErrorMessage(
          error,
          "Gagal mengambil ringkasan insentif dokter.",
        );
      } finally {
        this.loading = false;
      }
    },

    async downloadReport(kategori, jenis, format) {
      if (!this.canSubmit || this.hasAnyDownload) return;

      const key = `${kategori}-${jenis}-${format}`;
      this.downloading = key;
      this.errorMessage = "";

      try {
        const response = await insentifDokterService.exportReport({
          kategori,
          jenis,
          format,
          ...this.buildParams(),
        });

        const blob = new Blob([response.blob], {
          type:
            response.contentType ||
            (format === "excel" ? "application/vnd.ms-excel" : "text/html"),
        });
        const url = window.URL.createObjectURL(blob);

        if (format === "pdf") {
          window.open(url, "_blank");
          window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
          return;
        }

        const link = document.createElement("a");
        link.href = url;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.errorMessage = await this.getErrorMessage(
          error,
          "Gagal export laporan insentif dokter.",
        );
      } finally {
        this.downloading = "";
      }
    },

    buildParams() {
      return {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
        dokter_id: this.filters.dokter_id,
      };
    },

    formatDate(value) {
      if (!value) return "-";
      const [year, month, day] = String(value).split("-");

      if (!year || !month || !day) return value;
      return `${day}/${month}/${year}`;
    },

    rupiah(value) {
      const number = Number(value || 0);
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(number);
    },

    number(value) {
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
      }).format(Number(value || 0));
    },

    async getErrorMessage(error, fallback) {
      const data = error?.response?.data;

      if (data instanceof Blob) {
        const text = await data.text();
        try {
          const json = JSON.parse(text);
          return json?.message || fallback;
        } catch {
          return fallback;
        }
      }

      if (data?.message) return data.message;
      if (error?.message) return error.message;
      return fallback;
    },
  },
};
</script>

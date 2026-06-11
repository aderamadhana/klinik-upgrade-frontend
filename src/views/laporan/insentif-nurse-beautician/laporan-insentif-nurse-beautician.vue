<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">
          Laporan Insentif Nurse/Beautician
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Export insentif treatment nurse dan beautician berdasarkan invoice
          lunas.
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
              v-model="filters.staff_id"
              :items="staffOptions"
              :loading="loadingStaff"
              item-title="label"
              item-value="id"
              label="Beautician/Nurse"
              placeholder="Pilih Beautician/Nurse"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
              :disabled="loading"
              no-data-text="Beautician/Nurse tidak ditemukan"
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
            <div class="text-body-2 text-medium-emphasis">Total Insentif</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.treatment.total_insentif) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ summary.treatment.total_item }} treatment •
              {{ number(summary.treatment.total_qty) }} qty
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">
              Omzet Treatment Net
            </div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.treatment.total_omzet) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Dasar dari invoice lunas periode {{ displayPeriod }}
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
            <div class="text-body-2">Filter Staff</div>
            <div class="text-h6 font-weight-bold mt-1 text-truncate">
              {{ selectedStaffLabel }}
            </div>
            <div class="text-caption mt-1">
              Cabang mengikuti toko aktif dari header request.
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
        Laporan Insentif Treatment Nurse
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Staff boleh dikosongkan untuk export semua Nurse/Beautician pada
          cabang aktif.
        </v-alert>

        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="0" rounded="lg" border>
              <v-card-title
                class="d-flex align-center justify-space-between ga-3 text-subtitle-2 font-weight-bold"
              >
                <span>Laporan Insentif Treatment Nurse (Summary)</span>
                <v-chip size="small" variant="tonal" color="primary">
                  {{ rupiah(summary.treatment.total_insentif) }}
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
                      :loading="downloading === 'summary-pdf'"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport('summary', 'pdf')"
                    >
                      Laporan Insentif Nurse
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="success"
                      block
                      min-height="44"
                      prepend-icon="mdi-file-excel-box"
                      :loading="downloading === 'summary-excel'"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport('summary', 'excel')"
                    >
                      Laporan Insentif Nurse
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card elevation="0" rounded="lg" border>
              <v-card-title
                class="d-flex align-center justify-space-between ga-3 text-subtitle-2 font-weight-bold"
              >
                <span>Laporan Insentif Treatment Nurse (Detail)</span>
                <v-chip size="small" variant="tonal" color="primary">
                  Per transaksi
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
                      :loading="downloading === 'detail-pdf'"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport('detail', 'pdf')"
                    >
                      [DETAIL] Laporan Insentif Nurse
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="success"
                      block
                      min-height="44"
                      prepend-icon="mdi-file-excel-box"
                      :loading="downloading === 'detail-excel'"
                      :disabled="!canSubmit || hasAnyDownload"
                      @click="downloadReport('detail', 'excel')"
                    >
                      [DETAIL] Laporan Insentif Nurse
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
import insentifNurseBeauticianService from "@/services/laporan/insentifNurseBeauticianService";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default {
  name: "LaporanInsentifNurseBeautician",

  data() {
    return {
      loading: false,
      loadingStaff: false,
      downloading: "",
      errorMessage: "",
      staffOptions: [],
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        staff_id: null,
      },
      summary: {
        treatment: {
          total_item: 0,
          total_qty: 0,
          total_omzet: 0,
          total_insentif: 0,
        },
        grand_total_insentif: 0,
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

    selectedStaffLabel() {
      const selected = this.staffOptions.find(
        (item) => Number(item.id) === Number(this.filters.staff_id),
      );

      return selected?.label || "Semua Nurse/Beautician";
    },
  },

  watch: {
    "filters.tanggal_awal"() {
      this.ensureValidDateRange();
    },

    "filters.tanggal_akhir"() {
      this.ensureValidDateRange();
    },
  },

  async mounted() {
    await this.loadStaffOptions();
    await this.loadSummary();
  },

  methods: {
    ensureValidDateRange() {
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
        staff_id: this.filters.staff_id || undefined,
      };
    },

    async loadStaffOptions() {
      this.loadingStaff = true;

      try {
        const response = await insentifNurseBeauticianService.staff({
          limit: 100,
        });
        this.staffOptions = response?.data || [];
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data Nurse/Beautician.",
        );
      } finally {
        this.loadingStaff = false;
      }
    },

    async loadSummary() {
      if (!this.canSubmit) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await insentifNurseBeauticianService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.summary = {
          treatment: {
            total_item: Number(data.treatment?.total_item || 0),
            total_qty: Number(data.treatment?.total_qty || 0),
            total_omzet: Number(data.treatment?.total_omzet || 0),
            total_insentif: Number(data.treatment?.total_insentif || 0),
          },
          grand_total_insentif: Number(data.grand_total_insentif || 0),
        };
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil ringkasan laporan.",
        );
      } finally {
        this.loading = false;
      }
    },

    async downloadReport(jenis, format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = `${jenis}-${format}`;
      this.errorMessage = "";

      try {
        const response = await insentifNurseBeauticianService.exportReport({
          jenis,
          format,
          ...this.buildParams(),
        });

        this.handleExportBlob(response, format);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal export laporan.",
        );
      } finally {
        this.downloading = "";
      }
    },

    handleExportBlob(response, format) {
      const blob = response.blob;
      const url = window.URL.createObjectURL(blob);

      if (format === "pdf") {
        const popup = window.open(url, "_blank");

        if (!popup) {
          this.forceDownload(url, response.filename);
        } else {
          window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        }

        return;
      }

      this.forceDownload(url, response.filename);
    },

    forceDownload(url, filename) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },

    getErrorMessage(error, fallback) {
      const data = error?.response?.data;

      if (data instanceof Blob) {
        return fallback;
      }

      return data?.message || data?.error || error?.message || fallback;
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

    formatDate(value) {
      if (!value) return "-";

      const [year, month, day] = String(value).split("-");
      if (!year || !month || !day) return value;

      return `${day}/${month}/${year}`;
    },
  },
};
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-3 mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Laporan Insentif Apoteker</h1>
        <div class="text-body-2 text-medium-emphasis">
          Rekap fee berdasarkan resep atau faktur yang selesai diproses petugas
          farmasi.
        </div>
      </div>

      <v-breadcrumbs :items="breadcrumbs" class="pa-0" density="compact" />
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
              v-model="filters.apoteker_id"
              :items="petugasOptions"
              :loading="loadingPetugas"
              item-title="label"
              item-value="id"
              label="Apoteker / Asisten Apoteker"
              placeholder="Semua petugas"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
              :disabled="loading"
              no-data-text="Petugas tidak ditemukan"
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
        <v-card elevation="0" rounded="lg" border height="100%">
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Total Insentif</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.grand_total_insentif) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Periode {{ displayPeriod }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="0" rounded="lg" border height="100%">
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Resep Selesai</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.resep.total_resep) }} faktur
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Fee {{ rupiah(summary.resep.fee_per_resep) }} per resep
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          elevation="0"
          rounded="lg"
          border
          height="100%"
          color="primary"
          variant="tonal"
        >
          <v-card-text>
            <div class="text-body-2">Petugas</div>
            <div class="text-h6 font-weight-bold mt-1">
              {{ selectedPetugasLabel }}
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
        Export Laporan
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Jika petugas dikosongkan, PDF dibuat per petugas dan Excel dibuat satu
          sheet untuk setiap petugas.
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
              Download PDF
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
              Download Excel
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import insentifApotekerService from "@/services/laporan/insentifApotekerService";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default {
  name: "LaporanInsentifApoteker",

  data() {
    return {
      loading: false,
      loadingPetugas: false,
      downloading: "",
      errorMessage: "",
      petugasOptions: [],
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        apoteker_id: null,
      },
      summary: {
        resep: {
          total_resep: 0,
          total_faktur: 0,
          fee_per_resep: 0,
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

    selectedPetugasLabel() {
      const selected = this.petugasOptions.find(
        (item) => Number(item.id) === Number(this.filters.apoteker_id),
      );

      return selected?.label || "Semua Apoteker / Asisten";
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
    await this.loadPetugasOptions();
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
        apoteker_id: this.filters.apoteker_id || undefined,
      };
    },

    async loadPetugasOptions() {
      this.loadingPetugas = true;

      try {
        const response = await insentifApotekerService.petugas({ limit: 100 });
        this.petugasOptions = response?.data || [];
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data Apoteker.",
        );
      } finally {
        this.loadingPetugas = false;
      }
    },

    async loadSummary() {
      if (!this.canSubmit) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await insentifApotekerService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.summary = {
          resep: {
            total_resep: Number(data.resep?.total_resep || 0),
            total_faktur: Number(data.resep?.total_faktur || 0),
            fee_per_resep: Number(data.resep?.fee_per_resep || 0),
            total_insentif: Number(data.resep?.total_insentif || 0),
          },
          produk: {
            total_item: Number(data.produk?.total_item || 0),
            total_qty: Number(data.produk?.total_qty || 0),
            total_omzet: Number(data.produk?.total_omzet || 0),
            total_insentif: Number(data.produk?.total_insentif || 0),
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

    async downloadReport(format) {
      if (!this.canSubmit || this.hasAnyDownload) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const result = await insentifApotekerService.exportReport({
          format,
          ...this.buildParams(),
        });

        const url = window.URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengunduh laporan.",
        );
      } finally {
        this.downloading = "";
      }
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

      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    },

    getErrorMessage(error, fallback) {
      return error?.response?.data?.message || error?.message || fallback;
    },
  },
};
</script>

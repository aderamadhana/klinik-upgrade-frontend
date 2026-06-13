<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">
          Data Laporan Pasien Terakhir Transaksi Treatment
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Menampilkan transaksi treatment terakhir setiap pasien pada cabang
          aktif dan periode yang dipilih.
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
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">Total Pasien</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_pasien) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Pasien dengan transaksi terakhir pada periode.
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
            <div class="text-body-2">Total Faktur</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_faktur) }}
            </div>
            <div class="text-caption mt-1">
              Faktur lunas pada transaksi terakhir pasien.
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
            <div class="text-body-2">Total Item Treatment</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_item) }}
            </div>
            <div class="text-caption mt-1">
              Item layanan pada transaksi terakhir.
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
            <div class="text-body-2">Cabang</div>
            <div class="text-subtitle-1 font-weight-bold mt-2">
              {{ summary.branch_name || "Semua Cabang" }}
            </div>
            <div class="text-caption mt-2">
              Mengikuti cabang aktif pada sesi pengguna.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" md="5">
            <div
              class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
            >
              <v-icon icon="mdi-account-clock-outline" size="20" />
              Pasien Terakhir Transaksi Treatment
            </div>
          </v-col>

          <v-col cols="12" md="7">
            <div class="d-flex justify-end align-center flex-wrap ga-2">
              <v-text-field
                v-model="search"
                label="Cari data"
                placeholder="Nama, no. RM, treatment, atau faktur"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                class="flex-grow-1"
              />

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
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        :search="search"
        item-value="pasien_id"
        density="comfortable"
      >
        <template #item.no="{ index }">
          {{ index + 1 }}
        </template>

        <template #item.nama_pasien="{ item }">
          <div class="font-weight-bold">{{ item.nama_pasien }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.cabang }}
          </div>
        </template>

        <template #item.no_rm="{ item }">
          <div class="font-weight-medium">{{ item.no_rm }}</div>
        </template>

        <template #item.treatment_terakhir="{ item }">
          <div class="font-weight-medium text-wrap">
            {{ item.treatment_terakhir }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ number(item.jumlah_item) }} item layanan
          </div>
        </template>

        <template #item.tanggal_terakhir="{ item }">
          <div class="font-weight-medium">
            {{ date(item.tanggal_terakhir) }}
          </div>
        </template>

        <template #item.faktur="{ item }">
          <div class="font-weight-bold text-primary text-wrap">
            {{ item.faktur }}
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada pasien dengan transaksi treatment terakhir pada periode
            dan cabang yang dipilih.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import pasienTerakhirTransaksiTreatmentService from "@/services/laporan/pasienTerakhirTransaksiTreatmentService";

function today() {
  const current = new Date();
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default {
  name: "DataPasienTerakhirTransaksiTreatment",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      search: "",
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
          title: "Nama",
          key: "nama_pasien",
          sortable: true,
          minWidth: 220,
        },
        {
          title: "No RM",
          key: "no_rm",
          sortable: true,
          minWidth: 170,
        },
        {
          title: "Treatment Terakhir",
          key: "treatment_terakhir",
          sortable: true,
          minWidth: 330,
        },
        {
          title: "Tanggal Terakhir",
          key: "tanggal_terakhir",
          sortable: true,
          minWidth: 160,
        },
        {
          title: "Faktur",
          key: "faktur",
          sortable: true,
          minWidth: 190,
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
        branch_name: "",
        total_pasien: 0,
        total_faktur: 0,
        total_item: 0,
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
        const response = await pasienTerakhirTransaksiTreatmentService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.summary = {
          filters: data.filters || null,
          branch_name: data.branch_name || "",
          total_pasien: Number(data.total_pasien || 0),
          total_faktur: Number(data.total_faktur || 0),
          total_item: Number(data.total_item || 0),
          rows: this.normalizeRows(data.rows),
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil laporan pasien terakhir transaksi treatment.",
        );
      } finally {
        this.loading = false;
      }
    },

    normalizeRows(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item) => ({
        pasien_id: Number(item.pasien_id || 0),
        nama_pasien: item.nama_pasien || "-",
        no_rm: item.no_rm || "-",
        treatment_terakhir: item.treatment_terakhir || "-",
        tanggal_terakhir: item.tanggal_terakhir || null,
        faktur: item.faktur || "-",
        cabang: item.cabang || "-",
        jumlah_item: Number(item.jumlah_item || 0),
        jumlah_faktur: Number(item.jumlah_faktur || 0),
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await pasienTerakhirTransaksiTreatmentService.exportReport({
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
          "Gagal mengunduh laporan pasien terakhir transaksi treatment.",
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

    date(value) {
      if (!value) return "-";

      const parsed = new Date(`${value}T00:00:00`);

      if (Number.isNaN(parsed.getTime())) return value;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(parsed);
    },
  },
};
</script>

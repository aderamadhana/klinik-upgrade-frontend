<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">Laporan Detail Treatment</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Detail treatment, konsultasi, deposit treatment, dan item penanda
          layanan pada invoice yang sudah lunas.
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
            <div class="text-body-2 text-medium-emphasis">Total Baris</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_item) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Item treatment dan layanan terkait.
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
            <div class="text-body-2">Invoice Lunas</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_invoice) }}
            </div>
            <div class="text-caption mt-1">
              {{ number(summary.total_pasien) }} pasien unik.
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
            <div class="text-body-2">Total Qty</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_qty) }}
            </div>
            <div class="text-caption mt-1">
              Akumulasi jumlah treatment dan layanan.
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
            <div class="text-body-2">Total Harga Treatment</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_harga) }}
            </div>
            <div class="text-caption mt-1">
              Nilai net setelah diskon item dan subtotal.
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
          <v-icon icon="mdi-clipboard-text-search-outline" size="20" />
          Detail Treatment
        </div>

        <div class="d-flex align-center ga-2 flex-wrap">
          <v-text-field
            v-model="search"
            label="Cari data"
            placeholder="Invoice, pasien, atau treatment"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            width="300"
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
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        :search="search"
        item-value="id"
        density="comfortable"
        class="text-no-wrap"
      >
        <template #item.tanggal="{ item }">
          <div class="font-weight-medium">{{ date(item.tanggal) }}</div>
        </template>

        <template #item.no_invoice="{ item }">
          <div class="font-weight-bold text-primary">{{ item.no_invoice }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.cabang }}
          </div>
        </template>

        <template #item.nama_pasien="{ item }">
          <div class="font-weight-bold">{{ item.nama_pasien }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.no_rm }}
          </div>
        </template>

        <template #item.nama_treatment="{ item }">
          <div class="font-weight-bold">{{ item.nama_treatment }}</div>
          <v-chip
            size="x-small"
            variant="tonal"
            :color="itemTypeColor(item.item_type)"
            class="mt-1"
          >
            {{ item.jenis_item }}
          </v-chip>
        </template>

        <template #item.qty="{ item }">
          <div class="text-right font-weight-medium">
            {{ number(item.qty) }}
          </div>
        </template>

        <template #item.total_harga="{ item }">
          <div class="text-right font-weight-bold">
            {{ rupiah(item.total_harga) }}
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada detail treatment pada periode dan cabang yang dipilih.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import detailTreatmentService from "@/services/laporan/detailTreatmentService";

function today() {
  const current = new Date();
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default {
  name: "DataLaporanDetailTreatment",

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
        { title: "Tanggal", key: "tanggal", sortable: true, width: 130 },
        {
          title: "No Faktur",
          key: "no_invoice",
          sortable: true,
          minWidth: 190,
        },
        {
          title: "Nama Pasien",
          key: "nama_pasien",
          sortable: true,
          minWidth: 240,
        },
        {
          title: "Nama Treatment",
          key: "nama_treatment",
          sortable: true,
          minWidth: 300,
        },
        {
          title: "Jumlah",
          key: "qty",
          sortable: true,
          align: "end",
          width: 110,
        },
        {
          title: "Total Harga Treatment",
          key: "total_harga",
          sortable: true,
          align: "end",
          minWidth: 210,
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
        total_item: 0,
        total_invoice: 0,
        total_pasien: 0,
        total_qty: 0,
        total_harga: 0,
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
        const response = await detailTreatmentService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.summary = {
          filters: data.filters || null,
          branch_label: data.branch_label || "",
          total_item: Number(data.total_item || 0),
          total_invoice: Number(data.total_invoice || 0),
          total_pasien: Number(data.total_pasien || 0),
          total_qty: Number(data.total_qty || 0),
          total_harga: Number(data.total_harga || 0),
          rows: this.normalizeRows(data.rows),
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil laporan detail treatment.",
        );
      } finally {
        this.loading = false;
      }
    },

    normalizeRows(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item) => ({
        id: Number(item.id || 0),
        pembayaran_id: Number(item.pembayaran_id || 0),
        tanggal: item.tanggal || null,
        no_invoice: item.no_invoice || "-",
        cabang: item.cabang || "-",
        pasien_id: item.pasien_id ? Number(item.pasien_id) : null,
        no_rm: item.no_rm || "-",
        nama_pasien: item.nama_pasien || "-",
        treatment_id: item.treatment_id ? Number(item.treatment_id) : null,
        nama_treatment: item.nama_treatment || "-",
        item_type: Number(item.item_type || 0),
        jenis_item: item.jenis_item || "Lainnya",
        qty: Number(item.qty || 0),
        total_harga: Number(item.total_harga || 0),
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await detailTreatmentService.exportReport({
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
          "Gagal mengunduh laporan detail treatment.",
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

    itemTypeColor(itemType) {
      const colors = {
        1: "info",
        2: "primary",
        4: "warning",
        5: "secondary",
      };

      return colors[Number(itemType)] || "default";
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

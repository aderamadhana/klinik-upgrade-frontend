<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">Laporan Produk Resep Dokter</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Daftar produk yang tercatat pada resep dokter berdasarkan periode dan
          dokter yang dipilih.
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
              prepend-inner-icon="mdi-calendar-start"
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
              prepend-inner-icon="mdi-calendar-end"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="filters.dokter_id"
              :items="doctors"
              item-title="label"
              item-value="id"
              label="Dokter"
              placeholder="Pilih dokter"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-doctor"
              clearable
              :loading="loadingDoctors"
              :disabled="loading"
              no-data-text="Dokter tidak ditemukan"
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
            <div class="text-body-2">Total Baris Resep</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_item) }}
            </div>
            <div class="text-caption mt-1">
              Jumlah detail produk pada resep.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border color="info" variant="tonal">
          <v-card-text>
            <div class="text-body-2">Total Pasien</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_pasien) }}
            </div>
            <div class="text-caption mt-1">Pasien unik dalam laporan.</div>
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
            <div class="text-caption mt-1">Akumulasi jumlah produk resep.</div>
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
            <div class="text-body-2">Grand Total</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.grand_total) }}
            </div>
            <div class="text-caption mt-1">
              Nilai produk berdasarkan detail resep.
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
          <v-icon icon="mdi-prescription" size="20" />
          Produk Resep Dokter
        </div>

        <div class="d-flex align-center ga-2 flex-wrap">
          <v-text-field
            v-model="search"
            label="Cari data"
            placeholder="Pasien atau produk"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            width="280"
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

      <v-card-text v-if="summary.filters" class="pb-0">
        <v-alert type="info" variant="tonal" density="compact">
          Dokter: <strong>{{ summary.filters.dokter_nama || "-" }}</strong>
          <span v-if="summary.branch_label">
            · Cabang: <strong>{{ summary.branch_label }}</strong>
          </span>
        </v-alert>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        :search="search"
        item-value="id"
        density="comfortable"
      >
        <template #item.tanggal="{ item }">
          <div class="font-weight-medium">{{ date(item.tanggal) }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.cabang }}</div>
        </template>

        <template #item.nama_pasien="{ item }">
          <div class="font-weight-bold">{{ item.nama_pasien }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.no_rm }}</div>
        </template>

        <template #item.nama_produk="{ item }">
          <div class="font-weight-bold">{{ item.nama_produk }}</div>
        </template>

        <template #item.jumlah="{ item }">
          <div class="text-right font-weight-medium">
            {{ number(item.jumlah) }}
          </div>
        </template>

        <template #item.total_harga="{ item }">
          <div class="text-right font-weight-bold">
            {{ rupiah(item.total_harga) }}
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            {{ rupiah(item.harga_satuan) }} / item
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            {{
              filters.dokter_id
                ? "Tidak ada produk resep dokter pada periode yang dipilih."
                : "Pilih dokter untuk menampilkan laporan."
            }}
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import produkResepDokterService from "@/services/laporan/produkResepDokterService";

function today() {
  const current = new Date();
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default {
  name: "DataLaporanProdukResepDokter",

  data() {
    return {
      loading: false,
      loadingDoctors: false,
      downloading: "",
      errorMessage: "",
      search: "",
      doctors: [],
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        dokter_id: null,
      },
      summary: this.emptySummary(),
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard", disabled: false },
        { title: "Laporan", disabled: true },
      ],
      headers: [
        { title: "Tanggal", key: "tanggal", sortable: true, width: 150 },
        {
          title: "Nama Pasien",
          key: "nama_pasien",
          sortable: true,
          minWidth: 260,
        },
        {
          title: "Nama Produk",
          key: "nama_produk",
          sortable: true,
          minWidth: 300,
        },
        {
          title: "Jumlah",
          key: "jumlah",
          sortable: true,
          align: "end",
          width: 110,
        },
        {
          title: "Harga Produk",
          key: "total_harga",
          sortable: true,
          align: "end",
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
        this.filters.tanggal_akhir >= this.filters.tanggal_awal &&
        Boolean(this.filters.dokter_id)
      );
    },
  },

  created() {
    this.loadDoctors();
  },

  methods: {
    emptySummary() {
      return {
        filters: null,
        branch_label: "",
        total_item: 0,
        total_pasien: 0,
        total_qty: 0,
        grand_total: 0,
        rows: [],
      };
    },

    buildParams() {
      return {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
        dokter_id: this.filters.dokter_id,
      };
    },

    async loadDoctors() {
      if (this.loadingDoctors) return;

      this.loadingDoctors = true;

      try {
        const response = await produkResepDokterService.dokter({ limit: 100 });
        this.doctors = Array.isArray(response?.data) ? response.data : [];
      } catch (error) {
        this.doctors = [];
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil daftar dokter.",
        );
      } finally {
        this.loadingDoctors = false;
      }
    },

    async loadSummary() {
      if (!this.canSubmit || this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await produkResepDokterService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.summary = {
          filters: data.filters || null,
          branch_label: data.branch_label || "",
          total_item: Number(data.total_item || 0),
          total_pasien: Number(data.total_pasien || 0),
          total_qty: Number(data.total_qty || 0),
          grand_total: Number(data.grand_total || 0),
          rows: this.normalizeRows(data.rows),
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil laporan produk resep dokter.",
        );
      } finally {
        this.loading = false;
      }
    },

    normalizeRows(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item) => ({
        id: Number(item.id || 0),
        registrasi_id: Number(item.registrasi_id || 0),
        tanggal: item.tanggal || null,
        cabang: item.cabang || "-",
        pasien_id: item.pasien_id ? Number(item.pasien_id) : null,
        no_rm: item.no_rm || "-",
        nama_pasien: item.nama_pasien || "-",
        dokter_nama: item.dokter_nama || "-",
        produk_id: item.produk_id ? Number(item.produk_id) : null,
        nama_produk: item.nama_produk || "-",
        jumlah: Number(item.jumlah || 0),
        harga_satuan: Number(item.harga_satuan || 0),
        total_harga: Number(item.total_harga || 0),
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await produkResepDokterService.exportReport({
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
          "Gagal mengunduh laporan produk resep dokter.",
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

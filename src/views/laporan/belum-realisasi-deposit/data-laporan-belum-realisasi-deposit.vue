<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">
          Laporan Deposit Belum Realisasi
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Deposit treatment yang masih memiliki sisa sesi dan belum seluruhnya
          diklaim pasien.
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
            <div class="text-body-2">Deposit Belum Realisasi</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_deposit) }}
            </div>
            <div class="text-caption mt-1">Jumlah paket deposit tersisa.</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" rounded="lg" border color="info" variant="tonal">
          <v-card-text>
            <div class="text-body-2">Total Pasien</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_pasien) }}
            </div>
            <div class="text-caption mt-1">Pasien unik pemilik deposit.</div>
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
            <div class="text-body-2">Total Sisa Sesi</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_qty_sisa) }}
            </div>
            <div class="text-caption mt-1">
              Termasuk {{ number(summary.total_expired) }} deposit kedaluwarsa.
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
            <div class="text-body-2">Nilai Belum Realisasi</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_nilai_sisa) }}
            </div>
            <div class="text-caption mt-1">
              Akumulasi nilai deposit tersisa.
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
          <div
            class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
          >
            <v-icon icon="mdi-wallet-outline" size="20" />
            Daftar Deposit Belum Realisasi
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Cabang: {{ summary.branch_label || "-" }}
          </div>
        </div>

        <div class="d-flex align-center ga-2 flex-wrap">
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

          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-file-pdf-box"
            :loading="downloading"
            :disabled="loading || downloading"
            @click="downloadPdf"
          >
            PDF Laporan Deposit Belum Realisasi
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pb-2">
        <v-row dense>
          <v-col cols="12" md="5" lg="4">
            <v-text-field
              v-model="search"
              label="Cari data"
              placeholder="Faktur, pasien, treatment, atau catatan"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="7" lg="8" class="d-flex align-center">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="w-100"
            >
              Deposit kedaluwarsa tetap ditampilkan selama masih mempunyai sisa
              klaim.
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        :search="search"
        item-value="id"
        density="comfortable"
      >
        <template #item.no_invoice="{ item }">
          <div class="font-weight-bold">{{ item.no_invoice }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.toko_nama }}
          </div>
        </template>

        <template #item.nama_pasien="{ item }">
          <div class="font-weight-bold">{{ item.nama_pasien }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.no_rm }}</div>
        </template>

        <template #item.nama_treatment="{ item }">
          <div class="font-weight-medium">{{ item.nama_treatment }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ number(item.qty_sisa) }} sesi × {{ rupiah(item.harga_satuan) }}
          </div>
        </template>

        <template #item.catatan="{ item }">
          <div class="text-wrap">{{ item.catatan }}</div>
        </template>

        <template #item.expired_at="{ item }">
          <div class="font-weight-medium">{{ date(item.expired_at) }}</div>
          <v-chip
            :color="item.is_expired ? 'error' : 'success'"
            variant="tonal"
            size="x-small"
            class="mt-1"
          >
            {{ item.status_expired }}
          </v-chip>
        </template>

        <template #item.nilai_sisa="{ item }">
          <div class="text-right font-weight-bold">
            {{ rupiah(item.nilai_sisa) }}
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada deposit yang belum direalisasi pada cabang ini.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import belumRealisasiDepositService from "@/services/laporan/belumRealisasiDepositService";

export default {
  name: "DataLaporanBelumRealisasiDeposit",

  data() {
    return {
      loading: false,
      downloading: false,
      errorMessage: "",
      search: "",
      summary: this.emptySummary(),
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard", disabled: false },
        { title: "Laporan", disabled: true },
      ],
      headers: [
        {
          title: "No. Faktur",
          key: "no_invoice",
          sortable: true,
          minWidth: 180,
        },
        {
          title: "Nama Pasien",
          key: "nama_pasien",
          sortable: true,
          minWidth: 230,
        },
        {
          title: "Nama Treatment",
          key: "nama_treatment",
          sortable: true,
          minWidth: 280,
        },
        {
          title: "Catatan",
          key: "catatan",
          sortable: false,
          minWidth: 240,
        },
        {
          title: "Tanggal Exp",
          key: "expired_at",
          sortable: true,
          minWidth: 150,
        },
        {
          title: "Nilai Tersisa",
          key: "nilai_sisa",
          sortable: true,
          align: "end",
          minWidth: 170,
        },
      ],
    };
  },

  created() {
    this.loadSummary();
  },

  methods: {
    emptySummary() {
      return {
        branch_label: "",
        total_deposit: 0,
        total_pasien: 0,
        total_qty_sisa: 0,
        total_nilai_sisa: 0,
        total_expired: 0,
        rows: [],
      };
    },

    async loadSummary() {
      if (this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await belumRealisasiDepositService.summary();
        const data = response?.data || {};

        this.summary = {
          branch_label: data.branch_label || "",
          total_deposit: Number(data.total_deposit || 0),
          total_pasien: Number(data.total_pasien || 0),
          total_qty_sisa: Number(data.total_qty_sisa || 0),
          total_nilai_sisa: Number(data.total_nilai_sisa || 0),
          total_expired: Number(data.total_expired || 0),
          rows: this.normalizeRows(data.rows),
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil laporan deposit belum realisasi.",
        );
      } finally {
        this.loading = false;
      }
    },

    normalizeRows(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item) => ({
        id: Number(item.id || 0),
        pasien_id: Number(item.pasien_id || 0),
        toko_id: Number(item.toko_id || 0),
        toko_nama: item.toko_nama || "-",
        treatment_id: Number(item.treatment_id || 0),
        no_invoice: item.no_invoice || "-",
        no_rm: item.no_rm || "-",
        nama_pasien: item.nama_pasien || "-",
        nama_treatment: item.nama_treatment || "-",
        catatan: item.catatan || "-",
        expired_at: item.expired_at || null,
        is_expired: Boolean(item.is_expired),
        status_expired: item.status_expired || "-",
        qty_sisa: Number(item.qty_sisa || 0),
        harga_satuan: Number(item.harga_satuan || 0),
        nilai_sisa: Number(item.nilai_sisa || 0),
      }));
    },

    async downloadPdf() {
      if (this.downloading) return;

      this.downloading = true;
      this.errorMessage = "";

      try {
        const { blob, contentType } =
          await belumRealisasiDepositService.exportPdf();
        const fileBlob = new Blob([blob], {
          type: contentType || blob?.type || "application/pdf",
        });
        const url = window.URL.createObjectURL(fileBlob);

        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mencetak laporan deposit belum realisasi.",
        );
      } finally {
        this.downloading = false;
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

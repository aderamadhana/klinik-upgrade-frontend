<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">
          Data Pasien Treatment Terbanyak
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Ranking pasien berdasarkan total qty treatment dari invoice lunas.
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

          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="filters.peringkat"
              type="number"
              label="Peringkat"
              placeholder="Masukkan jumlah peringkat"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-podium"
              min="1"
              max="1000"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.jenis_transaksi"
              :items="jenisTransaksiItems"
              item-title="nama"
              item-value="value"
              label="Jenis transaksi"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-swap-horizontal"
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" class="d-flex justify-end">
            <v-btn
              color="primary"
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
              Top {{ number(filters.peringkat) }} pasien periode ini.
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
            <div class="text-body-2">Total Qty Treatment</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_qty_treatment) }}
            </div>
            <div class="text-caption mt-1">
              Dari {{ number(summary.total_invoice) }} invoice.
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
            <div class="text-body-2">Total Net Treatment</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_nilai_treatment) }}
            </div>
            <div class="text-caption mt-1">
              Berdasarkan subtotal item treatment.
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
            <div class="text-body-2">Rata-rata Qty / Pasien</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.rata_qty_per_pasien) }}
            </div>
            <div class="text-caption mt-1">
              {{ selectedJenisLabel }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border class="mb-4">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
          <v-icon icon="mdi-trophy-outline" size="20" />
          Hasil Ranking Pasien
        </div>

        <div class="d-flex align-center ga-2 flex-wrap">
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

      <v-card-text v-if="summary.top_pasien" class="pb-0">
        <v-alert type="info" variant="tonal" density="compact">
          Peringkat pertama:
          <strong>{{ summary.top_pasien.nama_pasien }}</strong> dengan
          <strong>{{ number(summary.top_pasien.total_qty_treatment) }}</strong>
          qty treatment dan net treatment
          <strong>{{ rupiah(summary.top_pasien.total_nilai_treatment) }}</strong
          >.
        </v-alert>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="summary.rows"
        :loading="loading"
        item-value="peringkat"
        density="comfortable"
        class="text-no-wrap"
      >
        <template #item.peringkat="{ item }">
          <v-chip
            size="small"
            color="primary"
            variant="tonal"
            class="font-weight-bold"
          >
            #{{ item.peringkat }}
          </v-chip>
        </template>

        <template #item.nama_pasien="{ item }">
          <div class="font-weight-bold">{{ item.nama_pasien }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.no_rm }} • {{ item.no_hp || "-" }}
          </div>
        </template>

        <template #item.total_qty_treatment="{ item }">
          <div class="font-weight-bold text-right">
            {{ number(item.total_qty_treatment) }}
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            {{ number(item.total_jenis_treatment) }} jenis
          </div>
        </template>

        <template #item.total_nilai_treatment="{ item }">
          <div class="font-weight-bold text-right">
            {{ rupiah(item.total_nilai_treatment) }}
          </div>
          <div class="text-caption text-medium-emphasis text-right">
            Avg {{ rupiah(item.rata_nilai_per_qty) }} / qty
          </div>
        </template>

        <template #item.treatment_terbanyak="{ item }">
          <div class="font-weight-bold">{{ item.treatment_terbanyak }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ number(item.qty_treatment_terbanyak) }}x •
            {{ item.treatment_detail }}
          </div>
        </template>

        <template #item.total_invoice="{ item }">
          <div>{{ number(item.total_invoice) }} invoice</div>
          <div class="text-caption text-medium-emphasis">
            {{ number(item.total_hari_transaksi) }} hari transaksi
          </div>
        </template>

        <template #item.total_item_treatment="{ item }">
          <div>{{ number(item.total_item_treatment) }} item</div>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            Tidak ada data pasien treatment pada periode ini.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import pasienTreatmentTerbanyakService from "@/services/laporan/pasienTreatmentTerbanyakService";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultJenisTransaksi() {
  return [
    { id: 0, kode: "UMUM", nama: "Umum" },
    { id: 1, kode: "ENDORSE_FASKAR", nama: "Endorse / Fasilitas Karyawan" },
    { id: 2, kode: "ELITEGLOWBAL", nama: "EliteGlowbal" },
    { id: 3, kode: "OWNER", nama: "Owner" },
    { id: 4, kode: "DEPOSIT", nama: "Deposit" },
  ];
}

export default {
  name: "DataPasienTreatmentTerbanyak",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        peringkat: 10,
        jenis_transaksi: "all",
      },
      jenisTransaksiOptions: defaultJenisTransaksi(),
      summary: this.emptySummary(),
      breadcrumbs: [
        { title: "Dashboard", to: "/dashboard", disabled: false },
        { title: "Laporan", disabled: true },
      ],
      headers: [
        { title: "Peringkat", key: "peringkat", sortable: false, width: 110 },
        { title: "Pasien", key: "nama_pasien", sortable: false, minWidth: 260 },
        { title: "Cabang", key: "cabang", sortable: false, minWidth: 160 },
        {
          title: "Invoice",
          key: "total_invoice",
          sortable: false,
          align: "end",
          width: 150,
        },
        {
          title: "Item",
          key: "total_item_treatment",
          sortable: false,
          align: "end",
          width: 120,
        },
        {
          title: "Qty Treatment",
          key: "total_qty_treatment",
          sortable: false,
          align: "end",
          width: 170,
        },
        {
          title: "Net Treatment",
          key: "total_nilai_treatment",
          sortable: false,
          align: "end",
          width: 190,
        },
        {
          title: "Treatment Dominan",
          key: "treatment_terbanyak",
          sortable: false,
          minWidth: 320,
        },
        {
          title: "Jenis Transaksi",
          key: "jenis_transaksi",
          sortable: false,
          minWidth: 180,
        },
      ],
    };
  },

  computed: {
    canSubmit() {
      return (
        Boolean(this.filters.tanggal_awal) &&
        Boolean(this.filters.tanggal_akhir) &&
        Number(this.filters.peringkat || 0) > 0
      );
    },

    jenisTransaksiItems() {
      return [
        { nama: "Semua jenis transaksi", value: "all" },
        ...this.jenisTransaksiOptions.map((item) => ({
          nama: `${item.id} - ${item.nama}`,
          value: String(item.id),
        })),
      ];
    },

    selectedJenisLabel() {
      if (
        !this.filters.jenis_transaksi ||
        this.filters.jenis_transaksi === "all"
      ) {
        return "Semua jenis transaksi";
      }

      const selected = this.jenisTransaksiOptions.find(
        (item) => String(item.id) === String(this.filters.jenis_transaksi),
      );

      return selected?.nama || "Jenis transaksi dipilih";
    },
  },

  created() {
    this.loadSummary();
  },

  methods: {
    emptySummary() {
      return {
        filters: null,
        total_pasien: 0,
        total_invoice: 0,
        total_hari_transaksi: 0,
        total_qty_treatment: 0,
        total_nilai_treatment: 0,
        rata_qty_per_pasien: 0,
        rows: [],
        top_pasien: null,
      };
    },

    buildParams() {
      const params = {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
        peringkat: Number(this.filters.peringkat || 10),
      };

      if (
        this.filters.jenis_transaksi &&
        this.filters.jenis_transaksi !== "all"
      ) {
        params.jenis_transaksi = this.filters.jenis_transaksi;
      }

      return params;
    },

    async loadSummary() {
      if (!this.canSubmit || this.loading) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await pasienTreatmentTerbanyakService.summary(
          this.buildParams(),
        );
        const data = response?.data || {};

        this.jenisTransaksiOptions = this.normalizeJenisTransaksiOptions(
          data.jenis_transaksi_options,
        );
        this.summary = {
          filters: data.filters || null,
          total_pasien: Number(data.total_pasien || 0),
          total_invoice: Number(data.total_invoice || 0),
          total_hari_transaksi: Number(data.total_hari_transaksi || 0),
          total_qty_treatment: Number(data.total_qty_treatment || 0),
          total_nilai_treatment: Number(data.total_nilai_treatment || 0),
          rata_qty_per_pasien: Number(data.rata_qty_per_pasien || 0),
          rows: this.normalizeRows(data.rows),
          top_pasien: data.top_pasien
            ? this.normalizeRows([data.top_pasien])[0]
            : null,
        };
      } catch (error) {
        this.summary = this.emptySummary();
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data pasien treatment terbanyak.",
        );
      } finally {
        this.loading = false;
      }
    },

    normalizeJenisTransaksiOptions(value) {
      const items =
        Array.isArray(value) && value.length ? value : defaultJenisTransaksi();

      return items.map((item) => ({
        id: Number(item.id),
        kode: item.kode_jenis_transaksi || item.kode || "-",
        nama: item.nama_jenis_transaksi || item.nama || "-",
      }));
    },

    normalizeRows(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item) => ({
        peringkat: Number(item.peringkat || 0),
        pasien_id: item.pasien_id,
        no_rm: item.no_rm || "-",
        nama_pasien: item.nama_pasien || "-",
        no_hp: item.no_hp || "-",
        cabang: item.cabang || "-",
        total_invoice: Number(item.total_invoice || 0),
        total_hari_transaksi: Number(item.total_hari_transaksi || 0),
        total_item_treatment: Number(item.total_item_treatment || 0),
        total_qty_treatment: Number(item.total_qty_treatment || 0),
        total_jenis_treatment: Number(item.total_jenis_treatment || 0),
        total_nilai_treatment: Number(item.total_nilai_treatment || 0),
        rata_nilai_per_qty: Number(item.rata_nilai_per_qty || 0),
        treatment_terbanyak: item.treatment_terbanyak || "-",
        qty_treatment_terbanyak: Number(item.qty_treatment_terbanyak || 0),
        nilai_treatment_terbanyak: Number(item.nilai_treatment_terbanyak || 0),
        treatment_detail: item.treatment_detail || "-",
        jenis_transaksi: item.jenis_transaksi || "-",
        dokter: item.dokter || "-",
        perawat: item.perawat || "-",
        invoice_terkait: item.invoice_terkait || "-",
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await pasienTreatmentTerbanyakService.exportReport({
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
          "Gagal mengunduh laporan pasien treatment terbanyak.",
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
  },
};
</script>

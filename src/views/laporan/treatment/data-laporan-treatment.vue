<template>
  <div>
    <div class="d-flex justify-space-between align-start flex-wrap ga-4 mb-4">
      <div>
        <div class="text-h4 font-weight-bold">Data Laporan Treatment</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Export detail treatment dari invoice lunas berdasarkan tanggal
          transaksi.
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
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" rounded="lg" border>
          <v-card-text>
            <div class="text-body-2 text-medium-emphasis">
              Total Item Treatment
            </div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_item) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ number(summary.total_invoice) }} invoice •
              {{ number(summary.total_pasien) }} pasien
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
            <div class="text-body-2">Total Qty</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ number(summary.total_qty) }}
            </div>
            <div class="text-caption mt-1">Periode {{ displayPeriod }}</div>
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
            <div class="text-body-2">Total Diskon</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_diskon) }}
            </div>
            <div class="text-caption mt-1">
              Diskon item + referral + subtotal.
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
            <div class="text-body-2">Subtotal Net Treatment</div>
            <div class="text-h5 font-weight-bold mt-1">
              {{ rupiah(summary.total_net) }}
            </div>
            <div class="text-caption mt-1">
              {{ selectedJenisLabel }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense class="mb-4">
      <v-col cols="12" md="7">
        <v-card elevation="0" rounded="lg" border height="100%">
          <v-card-title
            class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
          >
            <v-icon icon="mdi-format-list-bulleted-type" size="20" />
            Ringkasan Per Jenis Transaksi
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row dense>
              <v-col
                v-for="item in summary.by_jenis_transaksi"
                :key="item.id"
                cols="12"
                sm="6"
              >
                <v-card elevation="0" rounded="lg" border>
                  <v-card-text>
                    <div class="d-flex align-center justify-space-between ga-3">
                      <div>
                        <v-chip
                          size="small"
                          variant="tonal"
                          color="primary"
                          class="mb-2 font-weight-bold"
                        >
                          {{ item.id }}
                        </v-chip>
                        <div class="text-body-2 font-weight-bold">
                          {{ item.nama }}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-subtitle-1 font-weight-bold">
                          {{ rupiah(item.total_net) }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ number(item.total_qty) }} qty
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card elevation="0" rounded="lg" border height="100%">
          <v-card-title
            class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
          >
            <v-icon icon="mdi-star-outline" size="20" />
            Top Treatment
          </v-card-title>
          <v-divider />
          <v-list density="compact" lines="two">
            <v-list-item
              v-for="item in summary.top_treatment"
              :key="`${item.treatment_id}-${item.nama_treatment}`"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="34">
                  <v-icon icon="mdi-spa-outline" size="18" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">
                {{ item.nama_treatment }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ number(item.total_qty) }} qty • {{ rupiah(item.total_net) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="!summary.top_treatment.length">
              <v-list-item-title class="text-medium-emphasis">
                Belum ada data treatment pada filter ini.
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" rounded="lg" border>
      <v-card-title
        class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold"
      >
        <v-icon icon="mdi-file-chart-outline" size="20" />
        Cetak Data Laporan Treatment
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Data memakai item invoice treatment yang sudah lunas. Deposit
          treatment dan claim deposit tetap masuk agar laporan tidak kehilangan
          aktivitas treatment.
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
              Cetak laporan Excel
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import treatmentService from "@/services/laporan/treatmentService";

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function emptyJenisAggregate() {
  return {
    total_item: 0,
    total_invoice: 0,
    total_pasien: 0,
    total_qty: 0,
    total_gross: 0,
    total_diskon: 0,
    total_net: 0,
  };
}

function defaultJenisTransaksi() {
  return [
    { id: 0, kode: "UMUM", nama: "Umum", value: "0" },
    {
      id: 1,
      kode: "ENDORSE_FASKAR",
      nama: "Endorse / Fasilitas Karyawan",
      value: "1",
    },
    { id: 2, kode: "ELITEGLOWBAL", nama: "EliteGlowbal", value: "2" },
    { id: 3, kode: "OWNER", nama: "Owner", value: "3" },
    { id: 4, kode: "DEPOSIT", nama: "Deposit", value: "4" },
  ];
}

export default {
  name: "DataLaporanTreatment",

  data() {
    return {
      loading: false,
      downloading: "",
      errorMessage: "",
      filters: {
        tanggal_awal: today(),
        tanggal_akhir: today(),
        jenis_transaksi: "",
      },
      jenisTransaksiOptions: defaultJenisTransaksi(),
      summary: {
        total_item: 0,
        total_invoice: 0,
        total_pasien: 0,
        total_qty: 0,
        total_gross: 0,
        total_diskon: 0,
        total_net: 0,
        by_jenis_transaksi: defaultJenisTransaksi().map((item) => ({
          id: item.id,
          nama: item.nama,
          ...emptyJenisAggregate(),
        })),
        top_treatment: [],
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

    jenisTransaksiItems() {
      return [
        {
          nama: "Semua jenis transaksi",
          value: "",
        },
        ...this.jenisTransaksiOptions.map((item) => ({
          nama: `${item.id} - ${item.nama}`,
          value: String(item.id),
        })),
      ];
    },

    selectedJenisLabel() {
      if (this.filters.jenis_transaksi === "") {
        return "Semua jenis transaksi";
      }

      const selected = this.jenisTransaksiOptions.find(
        (item) => String(item.id) === String(this.filters.jenis_transaksi),
      );

      return selected?.nama || "Jenis transaksi terpilih";
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
      const params = {
        tanggal_awal: this.filters.tanggal_awal,
        tanggal_akhir: this.filters.tanggal_akhir,
      };

      if (this.filters.jenis_transaksi !== "") {
        params.jenis_transaksi = this.filters.jenis_transaksi;
      }

      return params;
    },

    async loadSummary() {
      if (!this.canSubmit) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await treatmentService.summary(this.buildParams());
        const data = response?.data || {};

        this.jenisTransaksiOptions = this.normalizeJenisTransaksiOptions(
          data.jenis_transaksi_options,
        );
        this.summary = {
          total_item: Number(data.total_item || 0),
          total_invoice: Number(data.total_invoice || 0),
          total_pasien: Number(data.total_pasien || 0),
          total_qty: Number(data.total_qty || 0),
          total_gross: Number(data.total_gross || 0),
          total_diskon: Number(data.total_diskon || 0),
          total_net: Number(data.total_net || 0),
          by_jenis_transaksi: this.normalizeByJenisTransaksi(
            data.by_jenis_transaksi,
          ),
          top_treatment: this.normalizeTopTreatment(data.top_treatment),
        };
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil ringkasan laporan treatment.",
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
        value: String(item.id),
      }));
    },

    normalizeJenisAggregate(value) {
      const aggregate = value || {};

      return {
        total_item: Number(aggregate.total_item || 0),
        total_invoice: Number(aggregate.total_invoice || 0),
        total_pasien: Number(aggregate.total_pasien || 0),
        total_qty: Number(aggregate.total_qty || 0),
        total_gross: Number(aggregate.total_gross || 0),
        total_diskon: Number(aggregate.total_diskon || 0),
        total_net: Number(aggregate.total_net || 0),
      };
    },

    normalizeByJenisTransaksi(value) {
      const source = Array.isArray(value) ? value : [];
      const map = new Map(source.map((item) => [Number(item.id), item]));

      return this.jenisTransaksiOptions.map((option) => {
        const item = map.get(Number(option.id)) || {};

        return {
          id: Number(option.id),
          nama: option.nama,
          ...this.normalizeJenisAggregate(item),
        };
      });
    },

    normalizeTopTreatment(value) {
      if (!Array.isArray(value)) return [];

      return value.map((item) => ({
        treatment_id: item.treatment_id,
        nama_treatment: item.nama_treatment || "-",
        total_item: Number(item.total_item || 0),
        total_qty: Number(item.total_qty || 0),
        total_net: Number(item.total_net || 0),
      }));
    },

    async downloadReport(format) {
      if (!this.canSubmit || this.downloading) return;

      this.downloading = format;
      this.errorMessage = "";

      try {
        const { blob, filename, contentType } =
          await treatmentService.exportReport({
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
          "Gagal mengunduh laporan treatment.",
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

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div
      class="d-flex flex-column flex-md-row justify-space-between align-start ga-3 mb-5"
    >
      <div>
        <div class="text-h5 font-weight-bold text-high-emphasis">
          STO Accurate
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Upload faktur STO ke Accurate berdasarkan data STO yang belum
          terkirim.
        </div>
      </div>

      <div class="d-flex align-center ga-1 text-body-2">
        <router-link to="/dashboard" class="text-primary text-decoration-none">
          Dashboard
        </router-link>
        <span class="text-medium-emphasis">/</span>
        <span class="text-medium-emphasis">Report To Accurate</span>
      </div>
    </div>

    <v-card variant="flat" border rounded="lg" class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.date"
              type="date"
              label="Tanggal"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              :min="minSettlementDate"
              @click:clear="filters.date = ''"
              @keyup.enter="reload"
            />
          </v-col>

          <v-col cols="12" sm="8" md="5">
            <v-text-field
              v-model="filters.search"
              label="Cari"
              placeholder="No faktur, nama toko, status, pengirim"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="reload"
            />
          </v-col>

          <v-col cols="12" sm="4" md="2" class="d-flex ga-2">
            <v-btn
              color="primary"
              variant="flat"
              class="text-none flex-grow-1"
              :loading="loading"
              @click="reload"
            >
              Tampilkan
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card variant="flat" border rounded="lg">
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="perPage"
        :headers="headers"
        :items="items"
        :items-length="pagination.total"
        :loading="loading"
        item-value="id"
        density="comfortable"
        @update:options="loadOptions"
      >
        <template #[`item.status_transaksi`]="{ item }">
          <span class="font-weight-medium">
            {{ item.status_transaksi || "-" }}
          </span>
        </template>

        <template #[`item.total_harga`]="{ item }">
          <span class="font-weight-medium">
            {{ formatCurrency(item.total_harga) }}
          </span>
        </template>

        <template #[`item.status_text`]="{ item }">
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-chip :color="item.status_color" size="x-small" variant="flat">
              {{ item.status_label }}
            </v-chip>
            <span class="text-body-2">{{ item.status_text }}</span>
          </div>
          <div v-if="item.error_message" class="text-caption text-error mt-1">
            {{ item.error_message }}
          </div>
        </template>

        <template #[`item.aksi`]="{ item }">
          <div class="d-flex justify-end">
            <v-btn
              v-if="item.can_upload"
              color="primary"
              variant="flat"
              size="small"
              class="text-none"
              prepend-icon="mdi-send"
              :loading="uploadingKey === rowKey(item)"
              @click="openConfirm(item)"
            >
              Kirim
            </v-btn>
            <span v-else class="text-medium-emphasis">-</span>
          </div>
        </template>

        <template #no-data>
          <div class="pa-8 text-center">
            <v-icon size="36" color="grey">mdi-database-off-outline</v-icon>
            <div class="text-subtitle-2 font-weight-bold mt-3">
              Data STO belum ada
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Ubah filter tanggal atau pencarian untuk menampilkan data.
            </div>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="confirmDialog" max-width="540">
      <v-card rounded="lg">
        <v-card-title class="font-weight-bold">
          Kirim STO ke Accurate
        </v-card-title>

        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Data STO akan dikirim sebagai faktur penjualan ke Accurate. Proses
            ini tidak boleh diulang jika Accurate sudah menerima faktur.
          </div>

          <v-list density="compact" lines="two" border rounded>
            <v-list-item
              title="Tanggal"
              :subtitle="selectedRow?.tanggal_faktur || '-'"
            />
            <v-list-item
              title="No. Faktur"
              :subtitle="selectedRow?.no_faktur || '-'"
            />
            <v-list-item
              title="Nama Toko"
              :subtitle="selectedRow?.nama_toko || '-'"
            />
            <v-list-item
              title="Metode Pembayaran"
              :subtitle="selectedRow?.metode_pembayaran || '-'"
            />
            <v-list-item
              title="Total Harga"
              :subtitle="formatCurrency(selectedRow?.total_harga || 0)"
            />
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            @click="confirmDialog = false"
          >
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            :loading="uploading"
            @click="uploadSelected"
          >
            Kirim Sekarang
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import accurateSettlementService from "@/services/accurateSettlementService";

export default {
  name: "SettlementStoAccurate",

  data() {
    return {
      loading: false,
      uploading: false,
      uploadingKey: null,
      confirmDialog: false,
      selectedRow: null,
      page: 1,
      perPage: 10,
      filters: {
        date: "",
        search: "",
      },
      items: [],
      pagination: {
        total: 0,
        current_page: 1,
        per_page: 10,
        last_page: 1,
      },
      snackbar: {
        show: false,
        color: "success",
        message: "",
      },
      headers: [
        { title: "Tanggal", key: "tanggal_faktur", minWidth: 120 },
        { title: "No. Faktur", key: "no_faktur", minWidth: 160 },
        { title: "Status Transaksi", key: "status_transaksi", minWidth: 190 },
        { title: "Nama Toko", key: "nama_toko", minWidth: 200 },
        { title: "Metode Pembayaran", key: "metode_pembayaran", minWidth: 170 },
        {
          title: "Total Harga",
          key: "total_harga",
          align: "end",
          minWidth: 150,
        },
        {
          title: "Status Accurate",
          key: "status_text",
          sortable: false,
          minWidth: 230,
        },
        { title: "Tanggal Kirim", key: "tanggal_kirim", minWidth: 160 },
        { title: "Nama Pengirim", key: "nama_pengirim", minWidth: 150 },
        { title: "Keterangan", key: "keterangan", minWidth: 320 },
        {
          title: "Aksi",
          key: "aksi",
          align: "end",
          sortable: false,
          minWidth: 120,
        },
      ],
    };
  },

  computed: {
    minSettlementDate() {
      return this.formatDateForInput(this.addDays(new Date(), -7));
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    loadOptions(options = {}) {
      if (options.page) this.page = options.page;
      if (options.itemsPerPage) this.perPage = options.itemsPerPage;
      this.loadData();
    },

    reload() {
      this.page = 1;
      this.loadData();
    },

    async loadData() {
      if (!this.isValidSettlementDate()) {
        this.items = [];
        this.pagination = {
          total: 0,
          current_page: 1,
          per_page: this.perPage,
          last_page: 1,
        };
        this.showSnackbar(
          `Tanggal minimal adalah ${this.formatDisplayDate(
            this.minSettlementDate,
          )}.`,
          "warning",
        );
        return;
      }

      this.loading = true;
      try {
        const response = await accurateSettlementService.getSto({
          date: this.filters.date || undefined,
          search: this.filters.search || undefined,
          page: this.page,
          per_page: this.perPage,
        });

        this.items = response?.items || [];
        this.pagination = response?.pagination || this.pagination;
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Gagal mengambil data STO Accurate."),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    openConfirm(item) {
      this.selectedRow = item;
      this.confirmDialog = true;
    },

    async uploadSelected() {
      if (!this.selectedRow || this.uploading) return;

      this.uploading = true;
      this.uploadingKey = this.rowKey(this.selectedRow);

      try {
        const response = await accurateSettlementService.uploadSto({
          sto_invoice_id: this.selectedRow.sto_invoice_id,
        });

        this.showSnackbar(
          response?.message || "Faktur STO berhasil dikirim ke Accurate.",
          "success",
        );
        this.confirmDialog = false;
        this.selectedRow = null;
        await this.loadData();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Upload STO Accurate gagal."),
          "error",
        );
      } finally {
        this.uploading = false;
        this.uploadingKey = null;
      }
    },

    rowKey(item) {
      return `${item?.sto_invoice_id || ""}`;
    },

    isValidSettlementDate() {
      if (!this.filters.date) return true;
      return this.filters.date >= this.minSettlementDate;
    },

    addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },

    formatDateForInput(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    formatDisplayDate(value) {
      if (!value) return "-";
      const [year, month, day] = String(value).split("-");
      return `${day}/${month}/${year}`;
    },

    formatCurrency(value) {
      const number = Number(value || 0);
      return `Rp. ${number.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    },

    getErrorMessage(error, fallback) {
      return (
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        fallback
      );
    },

    showSnackbar(message, color = "success") {
      this.snackbar = {
        show: true,
        color,
        message,
      };
    },
  },
};
</script>

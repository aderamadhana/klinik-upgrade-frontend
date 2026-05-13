<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Voucher Diskon</h1>
        <p class="page-subtitle">
          Kelola direct voucher dan generate voucher dalam satu halaman
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          :to="'/administrasi/voucher-diskon/add'"
        >
          Tambah Voucher
        </v-btn>

        <v-text-field
          v-model="search"
          placeholder="Cari voucher, deskripsi, cabang..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 320px"
          @keyup.enter="handleSearch"
          @click:clear="handleClearSearch"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-tabs
          v-model="activeTab"
          color="primary"
          density="comfortable"
          class="mb-4"
        >
          <v-tab value="direct">
            <v-icon icon="mdi-ticket-percent-outline" start />
            Direct Voucher
          </v-tab>

          <v-tab value="generate">
            <v-icon icon="mdi-ticket-confirmation-outline" start />
            Generate Voucher
          </v-tab>
        </v-tabs>

        <v-data-table-server
          :headers="headers"
          :items="vouchersForTable"
          :items-length="totalItems"
          :items-per-page="itemsPerPage"
          :items-per-page-options="itemsPerPageOptions"
          :loading="loading"
          :page="page"
          item-value="id"
          density="compact"
          loading-text="Memuat data voucher..."
          no-data-text="Data voucher belum tersedia"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.nama="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.nama || "-" }}
              </div>

              <div
                v-if="item.deskripsi && item.deskripsi !== '-'"
                class="text-caption text-medium-emphasis"
                style="max-width: 360px"
              >
                {{ item.deskripsi }}
              </div>
            </div>
          </template>

          <template #item.mode_label="{ item }">
            <v-chip
              size="small"
              :color="item.mode_voucher === 'direct' ? 'primary' : 'purple'"
              variant="tonal"
            >
              {{ item.mode_label }}
            </v-chip>
          </template>

          <template #item.jenis_label="{ item }">
            <v-chip
              size="small"
              :color="getJenisVoucherColor(item.jenis_voucher_id)"
              variant="tonal"
            >
              {{ item.jenis_label }}
            </v-chip>
          </template>

          <template #item.diskon_label="{ item }">
            <span class="font-weight-bold text-success">
              {{ item.diskon_label }}
            </span>
          </template>

          <template #item.qty_generate="{ item }">
            <v-chip size="small" color="info" variant="tonal">
              {{ item.qty_generate }}
            </v-chip>
          </template>

          <template #item.berlaku="{ item }">
            <v-chip
              size="small"
              :color="item.is_all_toko ? 'success' : 'primary'"
              variant="tonal"
            >
              {{ item.berlaku }}
            </v-chip>
          </template>

          <template #item.periode="{ item }">
            {{ item.periode }}
          </template>

          <template #item.item_count="{ item }">
            <v-chip size="small" color="secondary" variant="tonal">
              {{ item.item_count }} item
            </v-chip>
          </template>

          <template #item.status_label="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item.status_voucher)"
              variant="tonal"
            >
              {{ item.status_label }}
            </v-chip>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end flex-wrap">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                icon="mdi-pencil"
                title="Edit Voucher"
                :to="`/administrasi/voucher-diskon/edit-voucher-diskon/${item.id}`"
              />

              <v-btn
                size="small"
                color="amber-darken-1"
                variant="tonal"
                icon="mdi-format-list-bulleted"
                title="Konfigurasi Voucher"
                :to="`/administrasi/voucher-diskon/konfigurasi-voucher-diskon/${item.id}`"
              />

              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                icon="mdi-download"
                title="Download Voucher"
                @click="downloadVoucher(item)"
              />

              <v-btn
                size="small"
                color="error"
                variant="tonal"
                icon="mdi-delete"
                title="Hapus Voucher"
                @click="confirmDelete(item)"
              />
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-6">
              <div class="text-subtitle-2 mb-1">
                Data voucher belum tersedia
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Klik Tambah Voucher untuk membuat voucher baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Konfirmasi Hapus
        </v-card-title>

        <v-divider />

        <v-card-text>
          <p class="mb-2">Yakin ingin menghapus voucher ini?</p>

          <v-alert type="warning" variant="tonal" rounded="lg">
            <strong>{{ selectedItem?.nama || "-" }}</strong>
            <br />
            Data akan dihapus secara soft delete.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            :disabled="loadingDelete"
            @click="deleteDialog = false"
          >
            Batal
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="loadingDelete"
            :disabled="loadingDelete"
            @click="deleteVoucher"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import voucherDiskonService from "@/services/master/voucherDiskonService";

export default {
  name: "VoucherDiskonIndex",

  data() {
    return {
      activeTab: "direct",
      search: "",

      loading: false,
      loadingDelete: false,
      deleteDialog: false,
      selectedItem: null,

      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      fetchTimer: null,

      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 25, title: "25" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
      ],

      jenisVoucherOptions: [
        { label: "Treatment", value: 1, color: "primary" },
        { label: "Produk", value: 2, color: "success" },
        { label: "Bundling", value: 3, color: "purple" },
        { label: "Value", value: 4, color: "warning" },
      ],

      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        {
          title: "Voucher Diskon",
          disabled: false,
          to: "/administrasi/voucher-diskon",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "NAMA", key: "nama" },
        { title: "MODE", key: "mode_label" },
        { title: "JENIS", key: "jenis_label", sortable: false },
        { title: "DISKON", key: "diskon_label" },
        { title: "QTY", key: "qty_generate", sortable: false },
        { title: "BERLAKU DI", key: "berlaku", sortable: false },
        { title: "PERIODE", key: "periode", sortable: false },
        { title: "ITEM", key: "item_count", sortable: false },
        { title: "STATUS", key: "status_label", sortable: false },
        { title: "AKSI", key: "action", sortable: false, align: "end" },
      ],

      vouchers: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    vouchersForTable() {
      return this.vouchers.map((item) => this.mapVoucher(item));
    },
  },

  watch: {
    activeTab() {
      this.page = 1;
      this.fetchVouchers();
    },

    search() {
      this.page = 1;
      this.queueFetchVouchers();
    },
  },

  mounted() {
    this.fetchVouchers();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchVouchers() {
      this.loading = true;

      try {
        const response = await voucherDiskonService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
          mode_voucher: this.activeTab,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.vouchers = rows;
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.vouchers = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data voucher diskon"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchVouchers() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchVouchers();
      }, 350);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.fetchVouchers();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.fetchVouchers();
    },

    handleSearch() {
      this.page = 1;
      this.fetchVouchers();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;

      this.$nextTick(() => {
        this.fetchVouchers();
      });
    },

    extractRows(response) {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.items)) return response.items;

      return [];
    },

    extractMeta(response) {
      if (response?.meta) return response.meta;
      if (response?.data?.meta) return response.data.meta;

      if (
        response?.current_page ||
        response?.per_page ||
        response?.total ||
        response?.last_page
      ) {
        return {
          current_page: response.current_page,
          per_page: response.per_page,
          total: response.total,
          last_page: response.last_page,
        };
      }

      if (
        response?.data?.current_page ||
        response?.data?.per_page ||
        response?.data?.total ||
        response?.data?.last_page
      ) {
        return {
          current_page: response.data.current_page,
          per_page: response.data.per_page,
          total: response.data.total,
          last_page: response.data.last_page,
        };
      }

      return {
        current_page: this.page,
        per_page: this.itemsPerPage,
        total: 0,
        last_page: 1,
      };
    },

    mapVoucher(item) {
      const modeVoucher = item.mode_voucher || "-";
      const statusVoucher = Number(item.status_voucher ?? 0);
      const isAllToko = Number(item.is_all_toko || 0) === 1;
      const items = Array.isArray(item.items)
        ? item.items.filter((row) => Number(row.is_delete || 0) === 0)
        : [];

      const jenisVoucherId = Number(item.jenis_voucher_id || 3);

      return {
        id: item.id,
        legacy_id: item.legacy_id ?? null,

        nama: item.nama_voucher ?? item.nama ?? "-",
        deskripsi: item.deskripsi ?? "-",

        mode_voucher: modeVoucher,
        mode_label:
          modeVoucher === "direct"
            ? "Direct Voucher"
            : modeVoucher === "generate"
              ? "Generate Voucher"
              : "-",

        jenis_voucher_id: jenisVoucherId,
        jenis_label: this.getJenisVoucherLabel(jenisVoucherId),

        tipe_diskon: item.tipe_diskon ?? "-",
        total_diskon: Number(item.total_diskon || 0),
        diskon_label: this.formatDiskon(item.tipe_diskon, item.total_diskon),

        qty_generate: Number(item.qty_generate || 1),

        toko_id: item.toko_id ?? null,
        is_all_toko: isAllToko,
        berlaku: isAllToko
          ? "Semua Cabang"
          : item.toko?.nama_toko ||
            item.toko?.nama ||
            item.nama_toko ||
            "Cabang Tertentu",

        is_unlimited_date: Number(item.is_unlimited_date || 0) === 1,
        tanggal_mulai: item.tanggal_mulai ?? null,
        tanggal_akhir: item.tanggal_akhir ?? null,
        periode:
          Number(item.is_unlimited_date || 0) === 1
            ? "Tanpa batas"
            : `${this.formatDate(item.tanggal_mulai)} - ${this.formatDate(
                item.tanggal_akhir,
              )}`,

        item_count: items.length,

        status_voucher: statusVoucher,
        status_label: this.getStatusLabel(statusVoucher),

        raw: item,
      };
    },

    getJenisVoucherLabel(value) {
      const item = this.jenisVoucherOptions.find(
        (row) => Number(row.value) === Number(value),
      );

      return item ? item.label : "-";
    },

    getJenisVoucherColor(value) {
      const item = this.jenisVoucherOptions.find(
        (row) => Number(row.value) === Number(value),
      );

      return item ? item.color : "secondary";
    },

    formatDiskon(tipeDiskon, totalDiskon) {
      const tipe = String(tipeDiskon || "").toLowerCase();
      const value = Number(totalDiskon || 0);

      if (["percent", "persen"].includes(tipe)) {
        return `${value}%`;
      }

      if (["nominal", "rupiah"].includes(tipe)) {
        return this.formatRupiah(value);
      }

      return value ? String(value) : "-";
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    formatDate(value) {
      if (!value) return "-";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    },

    getStatusLabel(status) {
      const map = {
        0: "Draft",
        1: "Aktif",
        2: "Nonaktif",
      };

      return map[Number(status)] || "-";
    },

    getStatusColor(status) {
      const map = {
        0: "warning",
        1: "success",
        2: "error",
      };

      return map[Number(status)] || "secondary";
    },

    rowNumber(index) {
      return (Number(this.page) - 1) * Number(this.itemsPerPage) + index + 1;
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteVoucher() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data voucher tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await voucherDiskonService.delete(this.selectedItem.id);

        this.showSnackbar("Voucher berhasil dihapus", "success");

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchVouchers();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus voucher"),
          "error",
        );
      } finally {
        this.loadingDelete = false;
      }
    },

    downloadVoucher(item) {
      console.log("Download voucher:", item);

      this.showSnackbar(
        "Download voucher belum dihubungkan ke endpoint export",
        "info",
      );
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },

    getErrorMessage(error, fallbackMessage) {
      const response = error?.response?.data;

      if (response?.message) return response.message;
      if (response?.error) return response.error;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];

        if (firstKey && Array.isArray(response.errors[firstKey])) {
          return response.errors[firstKey][0];
        }
      }

      return fallbackMessage;
    },
  },
};
</script>

<style scoped>
:deep(.v-data-table .v-table__wrapper > table > tbody > tr > td) {
  vertical-align: middle;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

:deep(.v-data-table thead th) {
  font-weight: 700 !important;
  color: #374151 !important;
  background: #fafafa !important;
}

:deep(.v-data-table tbody td) {
  font-size: 13px;
}
</style>

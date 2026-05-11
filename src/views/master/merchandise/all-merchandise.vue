<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Merchandise</h1>
        <p class="page-subtitle">
          Kelola data merchandise, voucher, reward poin, dan stok yang tersedia
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            color="success"
            prepend-icon="mdi-plus"
            :to="'/master/merchandise/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari kode, nama, jenis reward..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 300px"
          @keyup.enter="handleSearch"
          @click:clear="handleClearSearch"
        />
      </v-card-title>

      <v-card-text>
        <div class="table-responsive">
          <v-data-table-server
            :page="page"
            :items-per-page="itemsPerPage"
            :headers="headers"
            :items="formattedMerchandises"
            :items-length="totalItems"
            :loading="loading"
            :items-per-page-options="itemsPerPageOptions"
            item-value="id"
            density="compact"
            class="responsive-table"
            loading-text="Memuat data merchandise..."
            no-data-text="Data merchandise belum tersedia"
            @update:page="handlePageChange"
            @update:items-per-page="handleItemsPerPageChange"
          >
            <template #loading>
              <v-skeleton-loader type="table-row@6" />
            </template>

            <template #item.no="{ index }">
              {{ rowNumber(index) }}
            </template>

            <template #item.kode="{ item }">
              <span class="font-weight-medium">
                {{ item.kode || "-" }}
              </span>
            </template>

            <template #item.nama="{ item }">
              <div>
                <div class="font-weight-medium">
                  {{ item.nama || "-" }}
                </div>
                <div
                  v-if="item.deskripsi"
                  class="text-caption text-medium-emphasis"
                  style="max-width: 320px"
                >
                  {{ item.deskripsi }}
                </div>
              </div>
            </template>

            <template #item.jenis_reward="{ item }">
              <v-chip size="small" color="primary" variant="tonal">
                {{ formatJenisReward(item.jenis_reward) }}
              </v-chip>
            </template>

            <template #item.diskon_display="{ item }">
              {{ item.diskon_display }}
            </template>

            <template #item.harga_poin="{ item }">
              {{ formatNumber(item.harga_poin) }}
            </template>

            <template #item.stok="{ item }">
              <v-chip
                size="small"
                :color="Number(item.stok || 0) > 0 ? 'success' : 'error'"
                variant="tonal"
              >
                {{ formatNumber(item.stok) }}
              </v-chip>
            </template>

            <template #item.action="{ item }">
              <div class="d-flex ga-2 justify-end">
                <v-btn
                  size="small"
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-pencil"
                  :to="'/master/merchandise/edit/' + item.id"
                >
                  Edit
                </v-btn>

                <v-btn
                  size="small"
                  color="error"
                  variant="tonal"
                  prepend-icon="mdi-delete"
                  @click="confirmDelete(item)"
                >
                  Hapus
                </v-btn>
              </div>
            </template>

            <template #no-data>
              <div class="text-center py-6">
                <div class="text-subtitle-2 mb-1">
                  Data merchandise belum tersedia
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  Klik Entry Data untuk menambahkan merchandise baru.
                </div>
              </div>
            </template>
          </v-data-table-server>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Konfirmasi Hapus
        </v-card-title>

        <v-divider />

        <v-card-text>
          <p class="mb-2">Yakin ingin menghapus merchandise ini?</p>

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
            @click="deleteMerchandise"
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
import merchandiseService from "@/services/master/merchandiseService";

export default {
  name: "MerchandiseIndex",

  data() {
    return {
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

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Merchandise", disabled: false, to: "/master/merchandise" },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "KODE", key: "kode" },
        { title: "NAMA MERCHANDISE", key: "nama" },
        { title: "JENIS REWARD", key: "jenis_reward" },
        { title: "DISKON", key: "diskon_display" },
        { title: "HARGA POIN", key: "harga_poin" },
        { title: "STOK", key: "stok" },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
      ],

      merchandises: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    formattedMerchandises() {
      return this.merchandises.map((item) => ({
        ...item,
        diskon_display: this.formatDiskon(item),
      }));
    },
  },

  mounted() {
    this.fetchMerchandises();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchMerchandises() {
      this.loading = true;

      try {
        const response = await merchandiseService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.merchandises = rows;
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.merchandises = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data merchandise"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchMerchandises() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchMerchandises();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchMerchandises();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchMerchandises();
    },

    handleSearch() {
      this.page = 1;
      this.fetchMerchandises();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchMerchandises();
    },

    extractRows(response) {
      if (Array.isArray(response)) {
        return response;
      }

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      if (Array.isArray(response?.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response?.items)) {
        return response.items;
      }

      return [];
    },

    extractMeta(response) {
      if (response?.meta) {
        return response.meta;
      }

      if (response?.data?.meta) {
        return response.data.meta;
      }

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

    rowNumber(index) {
      return (Number(this.page) - 1) * Number(this.itemsPerPage) + index + 1;
    },

    formatJenisReward(value) {
      if (!value) return "-";

      const map = {
        pr: "Diskon Persen",
        rp: "Diskon Nominal",
        sv: "Merchandise / Souvenir",
        voucher: "Voucher",
        merchandise: "Merchandise",
        souvenir: "Souvenir",
        diskon_persen: "Diskon Persen",
        diskon_nominal: "Diskon Nominal",
      };

      return map[value] || String(value).replace(/_/g, " ");
    },

    formatDiskon(item) {
      const persen = Number(item.nilai_diskon_persen || 0);
      const nominal = Number(item.nilai_diskon_nominal || 0);

      if (persen > 0) {
        return `${persen}%`;
      }

      if (nominal > 0) {
        return this.formatRupiah(nominal);
      }

      return "-";
    },

    formatRupiah(value) {
      const number = Number(value || 0);

      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(number);
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteMerchandise() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data merchandise tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await merchandiseService.delete(this.selectedItem.id);

        this.showSnackbar("Data merchandise berhasil dihapus", "success");

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchMerchandises();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data merchandise"),
          "error",
        );
      } finally {
        this.loadingDelete = false;
      }
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

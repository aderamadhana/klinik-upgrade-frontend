<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Counter Antrian</h1>
        <p class="page-subtitle">
          Kelola counter layanan untuk proses pemanggilan antrian
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
            :to="'/master/antrian-counter/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari kode, nama, keterangan..."
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
            :items="counterList"
            :items-length="totalItems"
            :loading="loading"
            :items-per-page-options="itemsPerPageOptions"
            item-value="id"
            density="compact"
            class="responsive-table"
            loading-text="Memuat data counter antrian..."
            no-data-text="Data counter antrian belum tersedia"
            @update:page="handlePageChange"
            @update:items-per-page="handleItemsPerPageChange"
          >
            <template #loading>
              <v-skeleton-loader type="table-row@6" />
            </template>

            <template #item.no="{ index }">
              {{ rowNumber(index) }}
            </template>

            <template #item.toko="{ item }">
              <span class="font-weight-medium">
                {{ item.toko?.nama || item.toko?.nama_toko || "-" }}
              </span>
            </template>

            <template #item.kode="{ item }">
              <span class="font-weight-bold">
                {{ item.kode || "-" }}
              </span>
            </template>

            <template #item.nama="{ item }">
              <div>
                <div class="font-weight-medium">
                  {{ item.nama || "-" }}
                </div>

                <div
                  v-if="item.keterangan"
                  class="text-caption text-medium-emphasis"
                  style="max-width: 360px"
                >
                  {{ item.keterangan }}
                </div>
              </div>
            </template>

            <template #item.status="{ item }">
              <v-chip
                size="small"
                :color="item.is_active ? 'success' : 'error'"
                variant="tonal"
              >
                {{ item.is_active ? "Aktif" : "Nonaktif" }}
              </v-chip>
            </template>

            <template #item.action="{ item }">
              <div class="d-flex ga-2 justify-end">
                <v-btn
                  size="small"
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-pencil"
                  :to="'/master/antrian-counter/edit/' + item.id"
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
                  Data counter antrian belum tersedia
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  Klik Entry Data untuk menambahkan counter antrian.
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
          <p class="mb-2">Yakin ingin menghapus counter antrian ini?</p>

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
            @click="deleteCounter"
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
import masterAntrianCounterService from "@/services/master/masterAntrianCounterService";

export default {
  name: "AllAntrianCounter",

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
        {
          title: "Counter Antrian",
          disabled: false,
          to: "/master/antrian-counter",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "CABANG", key: "toko" },
        { title: "KODE", key: "kode" },
        { title: "NAMA COUNTER", key: "nama" },
        { title: "STATUS", key: "status" },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
      ],

      counterList: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  mounted() {
    this.fetchCounter();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchCounter() {
      this.loading = true;

      try {
        const response = await masterAntrianCounterService.getAll({
          keyword: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.counterList = rows;
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.counterList = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data counter antrian"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchCounter() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchCounter();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchCounter();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchCounter();
    },

    handleSearch() {
      this.page = 1;
      this.fetchCounter();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchCounter();
    },

    extractRows(response) {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      return [];
    },

    extractMeta(response) {
      if (response?.data?.current_page || response?.data?.total) {
        return {
          current_page: response.data.current_page,
          per_page: response.data.per_page,
          total: response.data.total,
          last_page: response.data.last_page,
        };
      }

      if (response?.current_page || response?.total) {
        return {
          current_page: response.current_page,
          per_page: response.per_page,
          total: response.total,
          last_page: response.last_page,
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

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteCounter() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data counter tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await masterAntrianCounterService.delete(this.selectedItem.id);

        this.showSnackbar("Counter antrian berhasil dihapus", "success");

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchCounter();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus counter antrian"),
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

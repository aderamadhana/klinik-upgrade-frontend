<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Supplier</h1>
        <p class="page-subtitle">
          Kelola data supplier yang terdaftar di sistem
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
            prepend-icon="mdi-plus"
            color="success"
            :to="'/master/supplier/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari supplier..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 280px"
          @keyup.enter="handleSearch"
          @click:clear="handleClearSearch"
        />
      </v-card-title>

      <v-card-text>
        <v-data-table-server
          :page="page"
          :items-per-page="itemsPerPage"
          :headers="headers"
          :items="suppliers"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          loading-text="Memuat data supplier..."
          no-data-text="Data supplier belum tersedia"
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

              <div class="text-caption text-medium-emphasis" v-if="item.email">
                {{ item.email }}
              </div>
            </div>
          </template>

          <template #item.alamat="{ item }">
            <div style="max-width: 320px">
              <div>
                {{ item.alamat || "-" }}
              </div>

              <div class="text-caption text-medium-emphasis" v-if="item.kota">
                {{ item.kota }}
              </div>
            </div>
          </template>

          <template #item.no_telp="{ item }">
            {{ item.no_telp || "-" }}
          </template>

          <template #item.kontak_person="{ item }">
            {{ item.kontak_person || "-" }}
          </template>

          <template #item.cabang="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="toko in getTokoList(item)"
                :key="toko.id"
                size="small"
                variant="tonal"
                color="primary"
              >
                {{ toko.nama }}
              </v-chip>

              <span v-if="getTokoList(item).length === 0">-</span>
            </div>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                color="primary"
                size="small"
                variant="tonal"
                prepend-icon="mdi-pencil"
                :to="'/master/supplier/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="error"
                size="small"
                variant="tonal"
                prepend-icon="mdi-delete"
                @click="openDeleteDialog(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-6">
              <div class="text-subtitle-2 mb-1">
                Data supplier belum tersedia
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan supplier baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Hapus Supplier
        </v-card-title>

        <v-divider />

        <v-card-text>
          <p class="mb-2">Yakin ingin menghapus supplier ini?</p>

          <v-alert type="warning" variant="tonal" rounded="lg">
            <strong>{{ selectedSupplier?.nama || "-" }}</strong>
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
            @click="confirmDeleteSupplier"
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
import supplierService from "@/services/master/supplierService";

export default {
  name: "SupplierIndex",

  data() {
    return {
      search: "",
      loading: false,
      loadingDelete: false,
      deleteDialog: false,
      selectedSupplier: null,

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
        { title: "Supplier", disabled: false, to: "/master/supplier" },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "KODE", key: "kode" },
        { title: "NAMA SUPPLIER", key: "nama" },
        { title: "ALAMAT", key: "alamat" },
        { title: "TELP", key: "no_telp" },
        { title: "KONTAK", key: "kontak_person" },
        { title: "CABANG", key: "cabang", sortable: false },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
      ],

      suppliers: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  mounted() {
    this.fetchSuppliers();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchSuppliers() {
      this.loading = true;

      try {
        const response = await supplierService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.suppliers = rows;
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.suppliers = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data supplier"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchSuppliers() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchSuppliers();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchSuppliers();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchSuppliers();
    },

    handleSearch() {
      this.page = 1;
      this.fetchSuppliers();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchSuppliers();
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

    getTokoList(item) {
      const relation = item.toko_aktif || item.tokoAktif || item.toko || [];

      if (!Array.isArray(relation)) {
        return [];
      }

      return relation
        .map((row) => {
          const toko = row.toko || {};

          return {
            id: toko.id || row.toko_id,
            nama:
              toko.nama_toko || toko.nama || row.nama_toko || row.nama || "-",
          };
        })
        .filter((row) => row.id);
    },

    openDeleteDialog(item) {
      this.selectedSupplier = item;
      this.deleteDialog = true;
    },

    async confirmDeleteSupplier() {
      if (!this.selectedSupplier?.id) {
        this.showSnackbar("Supplier tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await supplierService.delete(this.selectedSupplier.id);

        this.showSnackbar("Data supplier berhasil dihapus", "success");

        this.deleteDialog = false;
        this.selectedSupplier = null;

        await this.fetchSuppliers();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data supplier"),
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

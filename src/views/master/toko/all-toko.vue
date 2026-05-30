<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Toko</h1>
        <p class="page-subtitle">Kelola data toko yang terdaftar di sistem</p>
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
            :to="'/master/toko/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari kode, nama toko, alamat..."
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
        <v-data-table-server
          :page="page"
          :items-per-page="itemsPerPage"
          :headers="headers"
          :items="tokos"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          loading-text="Memuat data toko..."
          no-data-text="Data toko belum tersedia"
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

          <template #item.kode_toko="{ item }">
            <v-chip size="small" color="primary">
              {{ item.kode_toko || "-" }}
            </v-chip>
          </template>

          <template #item.nama_toko="{ item }">
            <div class="font-weight-medium">
              {{ item.nama_toko || "-" }}
            </div>
          </template>

          <template #item.jenis_toko="{ item }">
            <v-chip size="small" :color="getJenisTokoColor(item.jenis_toko)">
              {{ getJenisTokoLabel(item.jenis_toko) }}
            </v-chip>
          </template>

          <template #item.alamat="{ item }">
            <div style="max-width: 360px">
              {{ item.alamat || "-" }}
            </div>
          </template>

          <template #item.no_telepon="{ item }">
            {{ item.no_telepon || "-" }}
          </template>

          <!-- <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="Number(item.is_delete) === 1 ? 'error' : 'success'"
              
            >
              {{ Number(item.is_delete) === 1 ? "Nonaktif" : "Aktif" }}
            </v-chip>
          </template> -->

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end">
              <!-- <v-btn
                size="small"
                color="primary"
                
                prepend-icon="mdi-pencil"
                :to="'/master/toko/edit/' + item.id"
              >
                Edit
              </v-btn> -->

              <v-btn
                size="small"
                color="error"
                prepend-icon="mdi-delete"
                @click="confirmDelete(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-6">
              <div class="text-subtitle-2 mb-1">Data toko belum tersedia</div>

              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan toko baru.
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
          <p class="mb-2">Yakin ingin menghapus toko ini?</p>

          <v-alert type="warning" rounded="lg">
            <strong>{{ selectedItem?.nama_toko || "-" }}</strong>
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
            @click="deleteToko"
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
import tokoService from "@/services/master/tokoService";

export default {
  name: "AllToko",

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
        { title: "Toko", disabled: false, to: "/master/toko" },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "KODE", key: "kode" },
        { title: "KODE TOKO", key: "kode_toko" },
        { title: "NAMA TOKO", key: "nama_toko" },
        { title: "JENIS", key: "jenis_toko" },
        { title: "ALAMAT", key: "alamat" },
        { title: "TELP", key: "no_telepon" },
        // { title: "STATUS", key: "status", sortable: false },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
      ],

      tokos: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  mounted() {
    this.fetchTokos();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchTokos() {
      this.loading = true;

      try {
        const response = await tokoService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.tokos = rows.map((item) => this.mapToko(item));
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.tokos = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data toko"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchTokos() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchTokos();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchTokos();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchTokos();
    },

    handleSearch() {
      this.page = 1;
      this.fetchTokos();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchTokos();
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

    mapToko(item) {
      return {
        id: item.id,
        kode: item.kode ?? "-",
        kode_toko: item.kode_toko ?? "-",
        nama_toko: item.nama_toko ?? item.nama ?? "-",
        jenis_toko: item.jenis_toko ?? null,
        no_telepon: item.no_telepon ?? item.telp ?? "-",
        alamat: item.alamat ?? "-",
        source_template: item.source_template ?? null,
        token_cdn: item.token_cdn ?? null,
        is_delete: item.is_delete ?? 0,
        raw: item,
      };
    },

    rowNumber(index) {
      return (Number(this.page) - 1) * Number(this.itemsPerPage) + index + 1;
    },

    getJenisTokoLabel(value) {
      const map = {
        1: "Cabang",
        2: "Management",
        3: "Central",
      };

      return map[Number(value)] || "-";
    },

    getJenisTokoColor(value) {
      const map = {
        1: "success",
        2: "purple",
        3: "primary",
      };

      return map[Number(value)] || "secondary";
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteToko() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data toko tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await tokoService.delete(this.selectedItem.id);

        this.showSnackbar("Data toko berhasil dihapus", "success");

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchTokos();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data toko"),
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

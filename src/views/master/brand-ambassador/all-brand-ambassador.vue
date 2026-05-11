<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Brand Ambassador</h1>
        <p class="page-subtitle">Kelola data brand ambassador per cabang</p>
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
            :to="'/master/brand-ambassador/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari kode, nama, cabang, instagram..."
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
          :items="brandAmbassadorsWithCabang"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          loading-text="Memuat data brand ambassador..."
          no-data-text="Data brand ambassador belum tersedia"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.cabang="{ item }">
            <v-chip size="small" color="primary" variant="tonal">
              {{ item.cabang || "-" }}
            </v-chip>
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
              <div class="text-caption text-medium-emphasis" v-if="item.alamat">
                {{ item.alamat }}
              </div>
            </div>
          </template>

          <template #item.no_telp="{ item }">
            {{ item.no_telp || "-" }}
          </template>

          <template #item.email="{ item }">
            {{ item.email || "-" }}
          </template>

          <template #item.instagram="{ item }">
            <span v-if="item.instagram">
              {{ item.instagram }}
            </span>
            <span v-else>-</span>
          </template>

          <template #item.catatan="{ item }">
            <div style="max-width: 280px">
              {{ item.catatan || "-" }}
            </div>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                color="primary"
                size="small"
                variant="tonal"
                prepend-icon="mdi-pencil"
                :to="'/master/brand-ambassador/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="info"
                size="small"
                variant="tonal"
                prepend-icon="mdi-eye"
                @click="detailBrandAmbassador(item)"
              >
                Detail
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
                Data brand ambassador belum tersedia
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan brand ambassador baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDetail" max-width="800">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Detail Brand Ambassador
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-label">Cabang</div>
              <div class="detail-value">{{ selectedItem?.cabang || "-" }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Kode</div>
              <div class="detail-value">{{ selectedItem?.kode || "-" }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Nama</div>
              <div class="detail-value">{{ selectedItem?.nama || "-" }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">No. Telepon</div>
              <div class="detail-value">
                {{ selectedItem?.no_telp || "-" }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Email</div>
              <div class="detail-value">{{ selectedItem?.email || "-" }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Instagram</div>
              <div class="detail-value">
                {{ selectedItem?.instagram || "-" }}
              </div>
            </v-col>

            <v-col cols="12">
              <div class="detail-label">Alamat</div>
              <div class="detail-value">{{ selectedItem?.alamat || "-" }}</div>
            </v-col>

            <v-col cols="12">
              <div class="detail-label">Catatan</div>
              <div class="detail-value">
                {{ selectedItem?.catatan || "-" }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="dialogDetail = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Hapus Brand Ambassador
        </v-card-title>

        <v-divider />

        <v-card-text>
          <p class="mb-2">Yakin ingin menghapus data brand ambassador ini?</p>

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
            @click="confirmDelete"
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
import brandAmbassadorService from "@/services/master/brandAmbassadorService";

export default {
  name: "BrandAmbassadorIndex",

  data() {
    return {
      search: "",
      loading: false,
      loadingDelete: false,
      dialogDetail: false,
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
          title: "Brand Ambassador",
          disabled: false,
          to: "/master/brand-ambassador",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "CABANG", key: "cabang" },
        { title: "KODE", key: "kode" },
        { title: "NAMA", key: "nama" },
        { title: "NO. TELEPON", key: "no_telp" },
        { title: "EMAIL", key: "email" },
        { title: "INSTAGRAM", key: "instagram" },
        { title: "CATATAN", key: "catatan" },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
      ],

      brandAmbassadors: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    brandAmbassadorsWithCabang() {
      return this.brandAmbassadors.map((item) => ({
        ...item,
        cabang: this.getTokoName(item),
      }));
    },
  },

  mounted() {
    this.fetchBrandAmbassadors();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchBrandAmbassadors() {
      this.loading = true;

      try {
        const response = await brandAmbassadorService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.brandAmbassadors = rows;
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.brandAmbassadors = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data brand ambassador"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchBrandAmbassadors() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchBrandAmbassadors();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchBrandAmbassadors();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchBrandAmbassadors();
    },

    handleSearch() {
      this.page = 1;
      this.fetchBrandAmbassadors();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchBrandAmbassadors();
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

    getTokoName(item) {
      return (
        item?.toko?.nama_toko ||
        item?.toko?.nama ||
        item?.nama_toko ||
        item?.cabang ||
        "-"
      );
    },

    detailBrandAmbassador(item) {
      this.selectedItem = {
        ...item,
        cabang: this.getTokoName(item),
      };

      this.dialogDetail = true;
    },

    openDeleteDialog(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data brand ambassador tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await brandAmbassadorService.delete(this.selectedItem.id);

        this.showSnackbar("Data brand ambassador berhasil dihapus", "success");

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchBrandAmbassadors();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data brand ambassador"),
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

<style scoped>
.detail-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
}
</style>

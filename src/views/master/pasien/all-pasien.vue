<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Pasien</h1>
        <p class="page-subtitle">Kelola data pasien yang terdaftar di sistem</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title class="d-flex justify-space-between align-center">
        <v-text-field
          v-model="search"
          placeholder="Cari pasien..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 280px"
          @keyup.enter="handleSearch"
          @click:clear="handleClearSearch"
        />

        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          to="/resepsionis/daftar-baru"
        >
          Entry Data
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="successMessage"
          type="success"
          density="comfortable"
          class="mb-4"
          closable
          @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          density="comfortable"
          class="mb-4"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-data-table-server
          :headers="headers"
          :items="pasiens"
          :items-length="totalItems"
          :items-per-page="itemsPerPage"
          :page="page"
          :items-per-page-options="itemsPerPageOptions"
          :loading="loading"
          item-value="id"
          density="compact"
          class="elevation-0"
          @update:options="handleTableOptions"
        >
          <template #item.no_identitas="{ item }">
            {{ item.no_identitas || "-" }}
          </template>

          <template #item.nama_pasien="{ item }">
            <div class="font-weight-medium">
              {{ item.nama_pasien || item.nama || "-" }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.no_hp || "-" }}
            </div>
          </template>

          <template #item.alamat="{ item }">
            {{ item.alamat_detail || item.alamat || "-" }}
          </template>

          <template #item.ttl="{ item }">
            {{ formatTTL(item) }}
          </template>

          <template #item.jenis_kelamin="{ item }">
            <v-chip
              size="small"
              :color="item.jenis_kelamin === 'L' ? 'blue' : 'pink'"
            >
              {{ formatJenisKelamin(item) }}
            </v-chip>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex align-center justify-center ga-2">
              <v-btn
                size="small"
                color="info"
                prepend-icon="mdi-history"
                :to="`/master/pasien/riwayat/${item.id}`"
              >
                Riwayat
              </v-btn>

              <v-btn
                size="small"
                color="warning"
                prepend-icon="mdi-pencil"
                :to="`/master/pasien/edit/${item.id}`"
              >
                Edit
              </v-btn>

              <v-btn
                size="small"
                color="error"
                prepend-icon="mdi-delete"
                @click="openDeleteDialog(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="py-6 text-center text-medium-emphasis">
              Tidak ada data pasien
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Hapus Pasien
        </v-card-title>

        <v-card-text>
          Yakin ingin menghapus pasien
          <strong>{{
            selectedPasien?.nama_pasien || selectedPasien?.nama
          }}</strong
          >? Data akan ditandai sebagai terhapus.
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            :disabled="loadingDelete"
            @click="closeDeleteDialog"
          >
            Batal
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="loadingDelete"
            @click="deletePasien"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import pasienService from "@/services/pasienService";

export default {
  name: "AllPasien",

  data() {
    return {
      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Pasien", disabled: false, to: "/master/pasien" },
      ],

      search: "",
      searchTimer: null,

      loading: false,
      loadingDelete: false,

      successMessage: "",
      errorMessage: "",

      page: 1,
      itemsPerPage: 10,
      totalItems: 0,

      itemsPerPageOptions: [
        { title: "10", value: 10 },
        { title: "25", value: 25 },
        { title: "50", value: 50 },
        { title: "100", value: 100 },
      ],

      headers: [
        { title: "No. RM", key: "no_rm", sortable: false },
        { title: "KTP / Passport", key: "no_identitas", sortable: false },
        { title: "Nama Pasien", key: "nama_pasien", sortable: false },
        { title: "Alamat", key: "alamat", sortable: false },
        { title: "TTL", key: "ttl", sortable: false },
        { title: "L/P", key: "jenis_kelamin", sortable: false },
        { title: "Action", key: "action", sortable: false, align: "center" },
      ],

      pasiens: [],

      deleteDialog: false,
      selectedPasien: null,
    };
  },

  watch: {
    search() {
      clearTimeout(this.searchTimer);

      this.searchTimer = setTimeout(() => {
        this.page = 1;
        this.fetchPasien();
      }, 500);
    },
  },

  methods: {
    async fetchPasien() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const params = {
          page: this.page,
          per_page: this.itemsPerPage,
          search: this.search || undefined,
        };

        const response = await pasienService.getAll(params);
        const paginator = response.data || {};

        this.pasiens = paginator.data || [];
        this.totalItems = Number(paginator.total || 0);
        this.page = Number(paginator.current_page || this.page);
        this.itemsPerPage = Number(paginator.per_page || this.itemsPerPage);
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Gagal mengambil data pasien";

        this.pasiens = [];
        this.totalItems = 0;
      } finally {
        this.loading = false;
      }
    },

    handleTableOptions(options) {
      const nextPage = Number(options.page || 1);
      const nextPerPage = Number(options.itemsPerPage || 10);

      if (this.page === nextPage && this.itemsPerPage === nextPerPage) {
        if (!this.pasiens.length) {
          this.fetchPasien();
        }
        return;
      }

      this.page = nextPage;
      this.itemsPerPage = nextPerPage;

      this.fetchPasien();
    },

    handleSearch() {
      this.page = 1;
      this.fetchPasien();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchPasien();
    },

    openDeleteDialog(item) {
      this.selectedPasien = item;
      this.deleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.selectedPasien = null;
    },

    async deletePasien() {
      if (!this.selectedPasien?.id) {
        return;
      }

      this.loadingDelete = true;
      this.successMessage = "";
      this.errorMessage = "";

      try {
        const response = await pasienService.delete(this.selectedPasien.id);

        this.successMessage =
          response.message || "Data pasien berhasil dihapus";

        this.closeDeleteDialog();

        if (this.pasiens.length === 1 && this.page > 1) {
          this.page -= 1;
        }

        await this.fetchPasien();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Gagal menghapus data pasien";
      } finally {
        this.loadingDelete = false;
      }
    },

    formatTTL(item) {
      const tempat = item.tempat_lahir || "-";
      const tanggal = item.tanggal_lahir || "-";

      if (tempat === "-" && tanggal === "-") {
        return "-";
      }

      return `${tempat}, ${tanggal}`;
    },

    formatJenisKelamin(item) {
      if (item.jenis_kelamin_text) {
        return item.jenis_kelamin_text;
      }

      if (item.jenis_kelamin === "L") {
        return "L";
      }

      if (item.jenis_kelamin === "P") {
        return "P";
      }

      return "-";
    },
  },
};
</script>

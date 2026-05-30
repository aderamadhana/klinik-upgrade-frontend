<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Karyawan</h1>
        <p class="page-subtitle">
          Kelola data karyawan yang terdaftar di sistem
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card elevation="1">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          :to="'/master/karyawan/add'"
        >
          Entry Data
        </v-btn>

        <v-text-field
          v-model="search"
          placeholder="Cari karyawan..."
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
          :items="karyawans"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          class="elevation-0"
          loading-text="Memuat data karyawan..."
          no-data-text="Data karyawan belum tersedia"
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
            <div class="font-weight-medium">
              {{ item.nama || "-" }}
            </div>
          </template>

          <template #item.alamat="{ item }">
            {{ item.alamat || "-" }}
          </template>

          <template #item.no_telp="{ item }">
            {{ item.no_telp || "-" }}
          </template>

          <template #item.jabatan="{ item }">
            {{ item.jabatan || "-" }}
          </template>

          <template #item.penempatan="{ item }">
            <div
              v-if="item.penempatan && item.penempatan.length"
              class="d-flex flex-wrap ga-1"
            >
              <v-chip
                v-for="place in item.penempatan"
                :key="place.id || place.toko_id"
                size="small"
                :color="Number(place.is_primary) === 1 ? 'primary' : 'default'"
              >
                {{ place.nama_toko }}
                <span v-if="Number(place.is_primary) === 1" class="ml-1">
                  • Utama
                </span>
              </v-chip>
            </div>

            <span v-else>-</span>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="Number(item.is_delete) === 1 ? 'error' : 'success'"
            >
              {{ Number(item.is_delete) === 1 ? "Nonaktif" : "Aktif" }}
            </v-chip>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                size="small"
                color="primary"
                prepend-icon="mdi-pencil"
                :to="`/master/karyawan/edit/${getItemId(item)}`"
              >
                Edit
              </v-btn>

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
              <div class="text-subtitle-2 mb-1">
                Data karyawan belum tersedia
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan karyawan baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDelete" width="430">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Konfirmasi Hapus
        </v-card-title>

        <v-divider />

        <v-card-text>
          Apakah Tuan yakin ingin menghapus karyawan
          <b>{{ selectedKaryawan?.nama || "-" }}</b
          >?
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            color="grey"
            :disabled="loadingDelete"
            @click="dialogDelete = false"
          >
            Batal
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="loadingDelete"
            @click="deleteKaryawan"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import karyawanService from "@/services/master/karyawanService";

export default {
  name: "KaryawanIndex",

  data() {
    return {
      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Karyawan", disabled: false, to: "/master/karyawan" },
      ],

      loading: false,
      loadingDelete: false,
      dialogDelete: false,

      selectedKaryawan: null,
      errorMessage: "",
      search: "",

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

      snackbar: {
        show: false,
        message: "",
        color: "success",
      },

      headers: [
        { title: "No", key: "no", sortable: false, width: "70px" },
        { title: "Kode", key: "kode" },
        { title: "Nama Lengkap", key: "nama" },
        { title: "Alamat", key: "alamat" },
        { title: "Telp", key: "no_telp" },
        { title: "Jabatan", key: "jabatan" },
        { title: "Penempatan", key: "penempatan", sortable: false },
        { title: "Status", key: "status", sortable: false },
        { title: "Action", key: "action", sortable: false, align: "end" },
      ],

      karyawans: [],
    };
  },

  mounted() {
    this.fetchKaryawan();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchKaryawan() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await karyawanService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.karyawans = rows.map((item) => this.mapKaryawan(item));

        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data karyawan.",
        );

        this.karyawans = [];
        this.totalItems = 0;
      } finally {
        this.loading = false;
      }
    },

    queueFetchKaryawan() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchKaryawan();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchKaryawan();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchKaryawan();
    },

    handleSearch() {
      this.page = 1;
      this.fetchKaryawan();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchKaryawan();
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

    mapKaryawan(item) {
      return {
        id: item.id ?? item.new_id ?? item.kode ?? item.karyawan_id,
        kode: item.kode ?? item.kode_karyawan ?? item.nik ?? "-",
        nama: item.nama ?? item.nama_lengkap ?? item.name ?? "-",
        alamat: item.alamat ?? item.address ?? "-",
        no_telp: item.no_telp ?? item.no_hp ?? item.phone ?? "-",
        jabatan:
          item.jabatan?.nama_jabatan ??
          item.jabatan?.nama ??
          item.master_jabatan?.nama ??
          "-",
        penempatan: this.mapPenempatan(item.penempatan),
        is_delete: item.is_delete ?? 0,
        raw: item,
      };
    },

    mapPenempatan(penempatan) {
      if (!Array.isArray(penempatan)) {
        return [];
      }

      return penempatan
        .filter((item) => Number(item.is_delete ?? 0) === 0)
        .map((item) => ({
          id: item.id,
          toko_id: item.toko_id,
          is_primary: item.is_primary,
          tanggal_mulai: item.tanggal_mulai,
          tanggal_selesai: item.tanggal_selesai,
          nama_toko:
            item.toko?.nama_toko || item.nama_toko || item.toko_name || "-",
          kode_toko: item.toko?.kode_toko || item.kode_toko || "",
        }))
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
    },

    rowNumber(index) {
      return (Number(this.page) - 1) * Number(this.itemsPerPage) + index + 1;
    },

    getItemId(item) {
      return item.id ?? item.kode;
    },

    confirmDelete(karyawan) {
      this.selectedKaryawan = karyawan;
      this.dialogDelete = true;
    },

    async deleteKaryawan() {
      if (!this.selectedKaryawan) return;

      const id = this.getItemId(this.selectedKaryawan);

      if (!id) {
        this.showSnackbar("ID karyawan tidak ditemukan.", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await karyawanService.delete(id);

        this.dialogDelete = false;
        this.selectedKaryawan = null;

        this.showSnackbar("Data karyawan berhasil dihapus.", "success");

        await this.fetchKaryawan();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data karyawan."),
          "error",
        );
      } finally {
        this.loadingDelete = false;
      }
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    getErrorMessage(error, fallbackMessage) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        fallbackMessage
      );
    },
  },
};
</script>

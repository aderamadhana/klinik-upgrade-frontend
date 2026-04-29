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
      variant="tonal"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
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
          @keyup.enter="fetchKaryawan"
          @click:clear="handleClearSearch"
        />
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="karyawans"
          :loading="loading"
          :search="search"
          item-value="id"
          density="compact"
          class="elevation-0"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ index + 1 }}
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

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="Number(item.is_delete) === 1 ? 'error' : 'success'"
              variant="tonal"
            >
              {{ Number(item.is_delete) === 1 ? "Nonaktif" : "Aktif" }}
            </v-chip>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-pencil"
                :to="`/master/karyawan/edit/${getItemId(item)}`"
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
                Data karyawan belum tersedia
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan karyawan baru.
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDelete" width="430">
      <v-card>
        <v-card-title class="text-h6"> Konfirmasi Hapus </v-card-title>

        <v-card-text>
          Apakah Tuan yakin ingin menghapus karyawan
          <b>{{ selectedKaryawan?.nama || "-" }}</b
          >?
        </v-card-text>

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
        { title: "Status", key: "status", sortable: false },
        { title: "Action", key: "action", sortable: false, align: "end" },
      ],

      karyawans: [],
    };
  },

  mounted() {
    this.fetchKaryawan();
  },

  methods: {
    async fetchKaryawan() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const result = await karyawanService.getAll({
          search: this.search || "",
        });

        console.log(result);
        const rows = result.data ?? result.result ?? result;

        this.karyawans = Array.isArray(rows)
          ? rows.map((item) => this.mapKaryawan(item))
          : [];
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data karyawan.",
        );
      } finally {
        this.loading = false;
      }
    },

    mapKaryawan(item) {
      return {
        id: item.id ?? item.new_id ?? item.kode ?? item.karyawan_id,
        kode: item.kode ?? item.kode_karyawan ?? item.nik ?? "-",
        nama: item.nama ?? item.nama_lengkap ?? item.name ?? "-",
        alamat: item.alamat ?? item.address ?? "-",
        no_telp: item.no_telp ?? item.no_hp ?? item.phone ?? "-",
        jabatan: item.jabatan?.nama_jabatan ?? "-",
        is_delete: item.is_delete ?? 0,
        raw: item,
      };
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

    handleClearSearch() {
      this.search = "";
      this.fetchKaryawan();
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    getErrorMessage(error, fallbackMessage) {
      return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        fallbackMessage
      );
    },
  },
};
</script>

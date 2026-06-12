<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Bahan Perawat</h1>
        <p class="page-subtitle">
          Kelola daftar bahan yang digunakan pada proses tindakan perawat.
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
            small
            color="success"
            prepend-icon="mdi-plus"
            @click="openForm()"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari bahan, kode accurate, satuan..."
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

      <v-card-text>
        <v-data-table-server
          :page="page"
          :items-per-page="itemsPerPage"
          :headers="headers"
          :items="items"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          loading-text="Memuat data bahan perawat..."
          no-data-text="Data bahan perawat belum tersedia"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.nama_bahan="{ item }">
            <div class="font-weight-medium">
              {{ item.nama_bahan || "-" }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.kode_accurate_obat_bahan || "Kode Accurate belum ada" }}
            </div>
          </template>

          <template #item.satuan="{ item }">
            <v-chip size="small" color="primary">
              {{ item.satuan || "-" }}
            </v-chip>
          </template>

          <template #item.is_active="{ item }">
            <v-chip
              size="small"
              :color="Number(item.is_active) === 1 ? 'success' : 'error'"
            >
              {{ Number(item.is_active) === 1 ? "Aktif" : "Nonaktif" }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                size="small"
                color="primary"
                prepend-icon="mdi-pencil"
                @click="openForm(item)"
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
            <div class="text-center py-6">
              <div class="text-subtitle-2 mb-1">
                Data bahan perawat belum tersedia
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan bahan baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialog" max-width="620" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">
            {{ form.id ? "Edit Bahan Perawat" : "Tambah Bahan Perawat" }}
          </span>

          <v-btn
            icon="mdi-close"
            variant="text"
            :disabled="saving"
            @click="closeForm"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-form ref="formRef" v-model="formValid" @submit.prevent="submit">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.nama_bahan"
                  label="Nama Bahan"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.kode_accurate_obat_bahan"
                  label="Kode Accurate"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.satuan"
                  label="Satuan"
                  variant="outlined"
                  density="compact"
                  placeholder="ml / shoot / pcs"
                />
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="form.is_active"
                  color="success"
                  inset
                  hide-details
                  :label="form.is_active ? 'Status aktif' : 'Status nonaktif'"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="text" :disabled="saving" @click="closeForm">
            Batal
          </v-btn>

          <v-btn
            color="success"
            variant="flat"
            prepend-icon="mdi-content-save"
            :loading="saving"
            @click="submit"
          >
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <confirm-delete-dialog
      v-model="deleteDialog"
      :loading="deleting"
      title="Konfirmasi Hapus"
      subtitle="Data bahan perawat akan dihapus secara soft delete."
      question="Yakin ingin menghapus bahan perawat ini?"
      :item-title="selectedItem?.nama_bahan || '-'"
      warning-text="Data bahan perawat akan dihapus secara soft delete."
      @cancel="closeDeleteDialog"
      @confirm="deleteData"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import perawatBahanService from "@/services/master/perawatBahanService";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";

export default {
  name: "AllPerawatBahan",
  components: {
    ConfirmDeleteDialog,
  },
  data() {
    return {
      breadcrumbs: [
        { title: "Dashboard", disabled: false, to: "/dashboard" },
        { title: "Master", disabled: true },
        {
          title: "Bahan Perawat",
          disabled: false,
          to: "/master/perawat-bahan",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "BAHAN", key: "nama_bahan", sortable: false },
        { title: "SATUAN", key: "satuan", sortable: false },
        { title: "STATUS", key: "is_active", sortable: false },
        { title: "ACTION", key: "actions", sortable: false, align: "end" },
      ],

      items: [],
      search: "",

      page: 1,
      itemsPerPage: 10,
      itemsPerPageOptions: [10, 25, 50, 100],
      totalItems: 0,

      loading: false,
      saving: false,
      deleting: false,

      formDialog: false,
      deleteDialog: false,
      selectedItem: null,
      fetchTimer: null,
      formValid: false,

      form: this.defaultForm(),

      rules: {
        required: (value) => !!value || "Field wajib diisi",
      },

      snackbar: {
        show: false,
        color: "success",
        message: "",
      },
    };
  },

  mounted() {
    this.loadData();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    defaultForm() {
      return {
        id: null,
        nama_bahan: "",
        kode_accurate_obat_bahan: "",
        satuan: "",
        is_active: true,
      };
    },

    async loadData() {
      this.loading = true;

      try {
        const response = await perawatBahanService.getAll({
          page: this.page,
          per_page: this.itemsPerPage,
          search: this.search || "",
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.items = rows.map((item) => this.mapItem(item));
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        this.items = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal mengambil data bahan perawat"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueLoadData() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.loadData();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueLoadData();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueLoadData();
    },

    handleSearch() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.page = 1;
      this.loadData();
    },

    handleClearSearch() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.search = "";
      this.page = 1;
      this.loadData();
    },

    rowNumber(index) {
      return (
        (Number(this.page || 1) - 1) * Number(this.itemsPerPage || 10) +
        index +
        1
      );
    },

    mapItem(item) {
      return {
        id: item.id,
        nama_bahan: item.nama_bahan || "-",
        kode_accurate_obat_bahan: item.kode_accurate_obat_bahan || "",
        satuan: item.satuan || "-",
        is_active: Number(item.is_active) === 1 ? 1 : 0,
      };
    },

    openForm(item = null) {
      this.form = item
        ? {
            id: item.id,
            nama_bahan: item.nama_bahan === "-" ? "" : item.nama_bahan || "",
            kode_accurate_obat_bahan: item.kode_accurate_obat_bahan || "",
            satuan: item.satuan === "-" ? "" : item.satuan || "",
            is_active: Number(item.is_active) === 1,
          }
        : this.defaultForm();

      this.formDialog = true;
    },

    closeForm() {
      this.formDialog = false;
      this.form = this.defaultForm();

      if (this.$refs.formRef) {
        this.$refs.formRef.resetValidation();
      }
    },

    async submit() {
      if (this.$refs.formRef) {
        const validation = await this.$refs.formRef.validate();

        if (!validation.valid) return;
      }

      this.saving = true;

      try {
        const payload = {
          nama_bahan: this.form.nama_bahan,
          kode_accurate_obat_bahan: this.form.kode_accurate_obat_bahan || null,
          satuan: this.form.satuan || null,
          is_active: this.form.is_active ? 1 : 0,
        };

        if (this.form.id) {
          await perawatBahanService.update(this.form.id, payload);
        } else {
          await perawatBahanService.create(payload);
        }

        this.showSnackbar("Data bahan perawat berhasil disimpan", "success");
        this.closeForm();
        this.loadData();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menyimpan data bahan perawat"),
          "error",
        );
      } finally {
        this.saving = false;
      }
    },

    openDeleteDialog(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.selectedItem = null;
    },

    async deleteData() {
      if (!this.selectedItem?.id) return;

      this.deleting = true;

      try {
        await perawatBahanService.delete(this.selectedItem.id);

        this.showSnackbar("Data bahan perawat berhasil dihapus", "success");
        this.closeDeleteDialog();

        if (this.items.length === 1 && this.page > 1) {
          this.page -= 1;
        }

        this.loadData();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data bahan perawat"),
          "error",
        );
      } finally {
        this.deleting = false;
      }
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

    getErrorMessage(error, fallback) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
      );
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

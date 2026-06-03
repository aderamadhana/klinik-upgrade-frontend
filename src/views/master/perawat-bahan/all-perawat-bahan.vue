<template>
  <v-container fluid class="pa-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Bahan Perawat</h1>
        <p class="page-subtitle">
          Kelola daftar bahan yang digunakan pada proses tindakan perawat.
        </p>

        <v-breadcrumbs
          :items="breadcrumbs"
          density="compact"
          class="pa-0 mt-2"
        />
      </div>

      <v-btn
        color="success"
        prepend-icon="mdi-plus"
        class="toolbar-btn"
        @click="openForm()"
      >
        Entry Data
      </v-btn>
    </div>

    <v-card class="main-card">
      <div class="toolbar-wrap">
        <div class="toolbar-filter">
          <v-text-field
            v-model="search"
            label="Cari bahan / kode accurate"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="search-field"
          />
        </div>

        <div class="action-wrap">
          <v-btn
            variant="tonal"
            prepend-icon="mdi-refresh"
            class="toolbar-btn"
            :loading="loading"
            @click="loadData"
          >
            Refresh
          </v-btn>
        </div>
      </div>

      <div class="table-wrap">
        <v-data-table-server
          v-model:page="page"
          v-model:items-per-page="perPage"
          :headers="headers"
          :items="items"
          :items-length="totalItems"
          :loading="loading"
          loading-text="Memuat data bahan perawat..."
          item-value="id"
          density="compact"
          class="payment-table"
          @update:options="handleTableOptions"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" class="pa-4" />
          </template>

          <template #[`item.nama_bahan`]="{ item }">
            <div class="patient-name">
              {{ item.nama_bahan }}
            </div>
            <div class="patient-meta">
              {{ item.kode_accurate_obat_bahan || "Kode Accurate belum ada" }}
            </div>
          </template>

          <template #[`item.satuan`]="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              color="primary"
              class="badge-chip"
            >
              {{ item.satuan || "-" }}
            </v-chip>
          </template>

          <template #[`item.is_active`]="{ item }">
            <span
              class="status-pill"
              :class="
                Number(item.is_active) === 1 ? 'status-paid' : 'status-cancel'
              "
            >
              {{ Number(item.is_active) === 1 ? "Aktif" : "Nonaktif" }}
            </span>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="action-cell">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-pencil"
                class="text-action-btn"
                @click="openForm(item)"
              >
                Edit
              </v-btn>

              <v-btn
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete"
                class="text-action-btn"
                @click="openDeleteDialog(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="empty-state">
              <v-icon size="44" color="grey">mdi-flask-outline</v-icon>
              <div class="empty-title">Data bahan perawat belum tersedia</div>
              <div class="empty-description">
                Tambahkan bahan seperti kapas, gel, cairan, atau bahan tindakan
                lainnya.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </div>
    </v-card>

    <v-dialog v-model="formDialog" max-width="620" persistent>
      <v-card class="dialog-card">
        <div class="dialog-title">
          {{ form.id ? "Edit Bahan Perawat" : "Tambah Bahan Perawat" }}
        </div>

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
                  label="Status aktif"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end px-5 pb-4">
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

    <v-dialog v-model="deleteDialog" max-width="460">
      <v-card class="dialog-card">
        <div class="dialog-title">Hapus Bahan Perawat</div>

        <v-card-text>
          Data ini akan ditandai sebagai terhapus.

          <div class="delete-dialog-info" v-if="selectedItem">
            <strong>{{ selectedItem.nama_bahan }}</strong>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end px-5 pb-4">
          <v-btn variant="text" :disabled="deleting" @click="closeDeleteDialog">
            Batal
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-delete"
            :loading="deleting"
            @click="deleteData"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import perawatBahanService from "@/services/master/perawatBahanService";

export default {
  name: "AllPerawatBahan",

  data() {
    return {
      breadcrumbs: [
        { title: "Dashboard", disabled: false, to: "/dashboard" },
        { title: "Master", disabled: true },
        { title: "Bahan Perawat", disabled: true },
      ],

      headers: [
        { title: "Bahan", key: "nama_bahan", sortable: false },
        { title: "Satuan", key: "satuan", sortable: false },
        { title: "Status", key: "is_active", sortable: false },
        { title: "Aksi", key: "actions", sortable: false, align: "end" },
      ],

      items: [],
      search: "",

      page: 1,
      perPage: 10,
      totalItems: 0,

      loading: false,
      saving: false,
      deleting: false,

      formDialog: false,
      deleteDialog: false,
      selectedItem: null,
      searchTimer: null,
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

  watch: {
    search() {
      clearTimeout(this.searchTimer);

      this.searchTimer = setTimeout(() => {
        this.page = 1;
        this.loadData();
      }, 400);
    },
  },

  mounted() {
    this.loadData();
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
          per_page: this.perPage,
          search: this.search || undefined,
        });

        this.items = this.extractRows(response);
        this.totalItems = this.extractTotal(response);
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message || "Gagal mengambil data bahan perawat",
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    handleTableOptions(options) {
      const nextPage = Number(options.page || 1);
      const nextPerPage = Number(options.itemsPerPage || 10);

      if (this.page === nextPage && this.perPage === nextPerPage) {
        return;
      }

      this.page = nextPage;
      this.perPage = nextPerPage;
      this.loadData();
    },

    openForm(item = null) {
      this.form = item
        ? {
            id: item.id,
            nama_bahan: item.nama_bahan || "",
            kode_accurate_obat_bahan: item.kode_accurate_obat_bahan || "",
            satuan: item.satuan || "",
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
      const validation = await this.$refs.formRef.validate();

      if (!validation.valid) return;

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
          error.response?.data?.message || "Gagal menyimpan data bahan perawat",
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
        this.loadData();
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message || "Gagal menghapus data bahan perawat",
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

    extractTotal(response) {
      if (response?.meta?.total !== undefined)
        return Number(response.meta.total);
      if (response?.data?.total !== undefined)
        return Number(response.data.total);
      if (response?.total !== undefined) return Number(response.total);
      return this.extractRows(response).length;
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

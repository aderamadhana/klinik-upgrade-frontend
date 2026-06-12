<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Bahan per Treatment</h1>
        <p class="page-subtitle">
          Atur bahan default yang digunakan perawat untuk masing-masing
          treatment.
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div class="d-flex ga-2 flex-wrap">
          <v-btn color="success" prepend-icon="mdi-plus" @click="openForm()">
            Entry Data
          </v-btn>

          <v-btn
            variant="tonal"
            prepend-icon="mdi-refresh"
            :loading="loading"
            @click="loadData"
          >
            Refresh
          </v-btn>
        </div>

        <div class="d-flex ga-2 flex-wrap align-center">
          <v-autocomplete
            v-model="filterTreatmentId"
            :items="treatmentOptions"
            item-title="label"
            item-value="id"
            placeholder="Filter treatment"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            :loading="loadingTreatment"
            style="min-width: 260px; max-width: 320px"
            @update:model-value="handleFilterChange"
            @click:clear="handleClearFilter"
          />

          <v-text-field
            v-model="search"
            placeholder="Cari treatment / bahan..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            style="max-width: 300px"
            @keyup.enter="handleSearch"
            @click:clear="handleClearSearch"
          />
        </div>
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
          loading-text="Memuat data bahan per treatment..."
          no-data-text="Data bahan per treatment belum tersedia"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.treatment="{ item }">
            <div class="font-weight-medium">
              {{ getTreatmentName(item) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ getTreatmentCode(item) }}
            </div>
          </template>

          <template #item.bahan="{ item }">
            <div class="font-weight-medium">
              {{ getBahanName(item) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ getBahanCode(item) }}
            </div>
          </template>

          <template #item.jumlah_default="{ item }">
            <div class="text-right font-weight-medium">
              {{ formatQty(item.jumlah_default) }}
            </div>
          </template>

          <template #item.satuan="{ item }">
            <v-chip size="small" color="primary">
              {{ getSatuan(item) }}
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
              <v-icon size="42" color="grey">mdi-flask-outline</v-icon>

              <div class="text-subtitle-2 mt-2 mb-1">
                Data bahan per treatment belum tersedia
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Pilih treatment, lalu tentukan bahan default dan jumlah
                pemakaiannya.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialog" max-width="720" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">
            {{
              form.id
                ? "Edit Bahan per Treatment"
                : "Tambah Bahan per Treatment"
            }}
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
                <v-autocomplete
                  v-model="form.treatment_id"
                  :items="treatmentOptions"
                  item-title="label"
                  item-value="id"
                  label="Treatment"
                  variant="outlined"
                  density="compact"
                  clearable
                  :loading="loadingTreatment"
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="form.perawat_bahan_id"
                  :items="bahanOptions"
                  item-title="label"
                  item-value="id"
                  label="Bahan Perawat"
                  variant="outlined"
                  density="compact"
                  clearable
                  :loading="loadingBahan"
                  :rules="[rules.required]"
                  @update:model-value="onBahanChanged"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.jumlah_default"
                  label="Jumlah Default"
                  type="number"
                  min="0"
                  step="0.0001"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required, rules.positiveNumber]"
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
      subtitle="Data bahan per treatment akan dihapus secara soft delete."
      question="Yakin ingin menghapus bahan per treatment ini?"
      :item-title="`Treatment: ${selectedItem ? getTreatmentName(selectedItem) : '-'}`"
      :warning-text="`Bahan: ${selectedItem ? getBahanName(selectedItem) : '-'}`"
      item-subtitle="Data akan dihapus secara soft delete."
      @cancel="closeDeleteDialog"
      @confirm="deleteData"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import treatmentBahanService from "@/services/master/treatmentBahanService";
import treatmentService from "@/services/master/treatmentService";
import referenceService from "@/services/referenceService";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";

export default {
  name: "AllTreatmentBahan",
  components: {
    ConfirmDeleteDialog,
  },
  data() {
    return {
      breadcrumbs: [
        { title: "Dashboard", disabled: false, to: "/dashboard" },
        { title: "Master", disabled: true },
        {
          title: "Bahan per Treatment",
          disabled: false,
          to: "/master/treatment-bahan",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "TREATMENT", key: "treatment", sortable: false },
        { title: "BAHAN", key: "bahan", sortable: false },
        {
          title: "JUMLAH",
          key: "jumlah_default",
          sortable: false,
          align: "end",
        },
        { title: "SATUAN", key: "satuan", sortable: false },
        { title: "STATUS", key: "is_active", sortable: false },
        { title: "ACTION", key: "actions", sortable: false, align: "end" },
      ],

      items: [],
      treatmentOptions: [],
      bahanOptions: [],

      search: "",
      filterTreatmentId: null,

      page: 1,
      itemsPerPage: 10,
      itemsPerPageOptions: [10, 25, 50, 100],
      totalItems: 0,

      loading: false,
      loadingTreatment: false,
      loadingBahan: false,
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
        positiveNumber: (value) =>
          Number(value) > 0 || "Nilai harus lebih dari 0",
      },

      snackbar: {
        show: false,
        color: "success",
        message: "",
      },
    };
  },

  mounted() {
    this.loadTreatments();
    this.loadBahanPerawat();
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
        treatment_id: null,
        perawat_bahan_id: null,
        jumlah_default: null,
        satuan: "",
        is_active: true,
      };
    },

    async loadData() {
      this.loading = true;

      try {
        const response = await treatmentBahanService.getAll({
          page: this.page,
          per_page: this.itemsPerPage,
          search: this.search || undefined,
          treatment_id: this.filterTreatmentId || undefined,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.items = rows;
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
          this.getErrorMessage(
            error,
            "Gagal mengambil data bahan per treatment",
          ),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    async loadTreatments() {
      this.loadingTreatment = true;

      try {
        const response = await treatmentService.getAll({
          page: 1,
          per_page: 1000,
        });

        this.treatmentOptions = this.extractRows(response).map((item) => ({
          ...item,
          label: `${item.nama || "-"}${
            item.kode_accurate ? ` - ${item.kode_accurate}` : ""
          }`,
        }));
      } catch (error) {
        this.treatmentOptions = [];
      } finally {
        this.loadingTreatment = false;
      }
    },

    async loadBahanPerawat() {
      this.loadingBahan = true;

      try {
        const response = await referenceService.bahanPerawat({
          limit: 500,
        });

        const rows = Array.isArray(response)
          ? response
          : this.extractRows(response);

        this.bahanOptions = rows.map((item) => ({
          ...item,
          label:
            item.label ||
            `${item.nama_bahan || "-"}${
              item.satuan ? ` - ${item.satuan}` : ""
            }`,
        }));
      } catch (error) {
        this.bahanOptions = [];
      } finally {
        this.loadingBahan = false;
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

    handleFilterChange() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.page = 1;
      this.loadData();
    },

    handleClearFilter() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.filterTreatmentId = null;
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

    openForm(item = null) {
      this.form = item
        ? {
            id: item.id,
            treatment_id: item.treatment_id || null,
            perawat_bahan_id: item.perawat_bahan_id || null,
            jumlah_default: item.jumlah_default || null,
            satuan: item.satuan || item.bahan?.satuan || "",
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

    onBahanChanged(bahanId) {
      const bahan = this.bahanOptions.find(
        (item) => Number(item.id) === Number(bahanId),
      );

      if (!bahan) return;

      this.form.satuan = bahan.satuan || this.form.satuan || "";
    },

    async submit() {
      if (this.$refs.formRef) {
        const validation = await this.$refs.formRef.validate();

        if (!validation.valid) return;
      }

      this.saving = true;

      try {
        const payload = {
          treatment_id: this.form.treatment_id,
          perawat_bahan_id: this.form.perawat_bahan_id,
          jumlah_default: Number(this.form.jumlah_default || 0),
          satuan: this.form.satuan || null,
          is_active: this.form.is_active ? 1 : 0,
        };

        if (this.form.id) {
          await treatmentBahanService.update(this.form.id, payload);
        } else {
          await treatmentBahanService.create(payload);
        }

        this.showSnackbar(
          "Data bahan per treatment berhasil disimpan",
          "success",
        );

        this.closeForm();
        this.loadData();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(
            error,
            "Gagal menyimpan data bahan per treatment",
          ),
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
        await treatmentBahanService.delete(this.selectedItem.id);

        this.showSnackbar(
          "Data bahan per treatment berhasil dihapus",
          "success",
        );

        this.closeDeleteDialog();

        if (this.items.length === 1 && this.page > 1) {
          this.page -= 1;
        }

        this.loadData();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(
            error,
            "Gagal menghapus data bahan per treatment",
          ),
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

    getTreatmentName(item) {
      return item?.treatment?.nama || item?.nama_treatment || "-";
    },

    getTreatmentCode(item) {
      return item?.treatment?.kode_accurate || item?.treatment?.kode || "-";
    },

    getBahanName(item) {
      return item?.bahan?.nama_bahan || item?.nama_bahan || "-";
    },

    getBahanCode(item) {
      return (
        item?.bahan?.kode_accurate_obat_bahan ||
        item?.kode_accurate_obat_bahan ||
        "-"
      );
    },

    getSatuan(item) {
      return item?.satuan || item?.bahan?.satuan || "-";
    },

    formatQty(value) {
      const number = Number(value || 0);

      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      }).format(number);
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

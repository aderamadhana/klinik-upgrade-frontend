<template>
  <v-container fluid class="pa-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">Bahan per Treatment</h1>
        <p class="page-subtitle">
          Atur bahan default yang digunakan perawat untuk masing-masing
          treatment.
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
            label="Cari treatment / bahan"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="search-field"
          />

          <v-autocomplete
            v-model="filterTreatmentId"
            :items="treatmentOptions"
            item-title="label"
            item-value="id"
            label="Filter Treatment"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="filter-select"
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
          loading-text="Memuat data bahan per treatment..."
          item-value="id"
          density="compact"
          class="payment-table"
          @update:options="handleTableOptions"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" class="pa-4" />
          </template>

          <template #[`item.treatment`]="{ item }">
            <div class="service-title">
              {{ getTreatmentName(item) }}
            </div>
            <div class="service-sub">
              {{ getTreatmentCode(item) }}
            </div>
          </template>

          <template #[`item.bahan`]="{ item }">
            <div class="patient-name">
              {{ getBahanName(item) }}
            </div>
            <div class="patient-meta">
              {{ getBahanCode(item) }}
            </div>
          </template>

          <template #[`item.jumlah_default`]="{ item }">
            <div class="amount-main">
              {{ formatQty(item.jumlah_default) }}
            </div>
          </template>

          <template #[`item.satuan`]="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              color="primary"
              class="badge-chip"
            >
              {{ getSatuan(item) }}
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
              <div class="empty-title">
                Data bahan per treatment belum tersedia
              </div>
              <div class="empty-description">
                Pilih treatment, lalu tentukan bahan default dan jumlah
                pemakaiannya.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </div>
    </v-card>

    <v-dialog v-model="formDialog" max-width="720" persistent>
      <v-card class="dialog-card">
        <div class="dialog-title">
          {{
            form.id ? "Edit Bahan per Treatment" : "Tambah Bahan per Treatment"
          }}
        </div>

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

    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card class="dialog-card">
        <div class="dialog-title">Hapus Bahan per Treatment</div>

        <v-card-text>
          Data ini akan ditandai sebagai terhapus.

          <div class="delete-dialog-info" v-if="selectedItem">
            <div>
              <strong>Treatment:</strong> {{ getTreatmentName(selectedItem) }}
            </div>
            <div><strong>Bahan:</strong> {{ getBahanName(selectedItem) }}</div>
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
import treatmentBahanService from "@/services/master/treatmentBahanService";
import treatmentService from "@/services/master/treatmentService";
import referenceService from "@/services/referenceService";

export default {
  name: "AllTreatmentBahan",

  data() {
    return {
      breadcrumbs: [
        { title: "Dashboard", disabled: false, to: "/dashboard" },
        { title: "Master", disabled: true },
        { title: "Bahan per Treatment", disabled: true },
      ],

      headers: [
        { title: "Treatment", key: "treatment", sortable: false },
        { title: "Bahan", key: "bahan", sortable: false },
        {
          title: "Jumlah",
          key: "jumlah_default",
          sortable: false,
          align: "end",
        },
        { title: "Satuan", key: "satuan", sortable: false },
        { title: "Status", key: "is_active", sortable: false },
        { title: "Aksi", key: "actions", sortable: false, align: "end" },
      ],

      items: [],
      treatmentOptions: [],
      bahanOptions: [],

      search: "",
      filterTreatmentId: null,

      page: 1,
      perPage: 10,
      totalItems: 0,

      loading: false,
      loadingTreatment: false,
      loadingBahan: false,
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

  watch: {
    search() {
      clearTimeout(this.searchTimer);

      this.searchTimer = setTimeout(() => {
        this.page = 1;
        this.loadData();
      }, 400);
    },

    filterTreatmentId() {
      this.page = 1;
      this.loadData();
    },
  },

  mounted() {
    this.loadTreatments();
    this.loadBahanPerawat();
    this.loadData();
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
          per_page: this.perPage,
          search: this.search || undefined,
          treatment_id: this.filterTreatmentId || undefined,
        });

        this.items = this.extractRows(response);
        this.totalItems = this.extractTotal(response);
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message ||
            "Gagal mengambil data bahan per treatment",
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
            `${item.nama_bahan || "-"}${item.satuan ? ` - ${item.satuan}` : ""}`,
        }));
      } catch (error) {
        this.bahanOptions = [];
      } finally {
        this.loadingBahan = false;
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
      const validation = await this.$refs.formRef.validate();

      if (!validation.valid) return;

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
          error.response?.data?.message ||
            "Gagal menyimpan data bahan per treatment",
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
        this.loadData();
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message ||
            "Gagal menghapus data bahan per treatment",
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

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

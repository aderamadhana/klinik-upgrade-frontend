<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Bahan Treatment</h1>
        <p class="page-subtitle">
          Perbarui bahan default yang digunakan dalam proses treatment perawat.
        </p>

        <v-breadcrumbs
          :items="breadcrumbs"
          density="compact"
          class="pa-0 mt-2"
        />
      </div>

      <v-btn
        variant="tonal"
        prepend-icon="mdi-arrow-left"
        class="toolbar-btn"
        @click="$router.push('/master/treatment-bahan')"
      >
        Kembali
      </v-btn>
    </div>

    <v-card class="main-card">
      <div class="section-header">Form Edit Bahan Treatment</div>

      <v-card-text class="section-body">
        <v-skeleton-loader v-if="loadingDetail" type="article, actions" />

        <v-form
          v-else
          ref="formRef"
          v-model="formValid"
          @submit.prevent="submit"
        >
          <v-row dense>
            <v-col cols="12" md="6">
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

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.produk_id"
                :items="produkOptions"
                item-title="label"
                item-value="id"
                label="Bahan / Produk"
                variant="outlined"
                density="compact"
                clearable
                :loading="loadingProduk"
                :rules="[rules.required]"
                @update:model-value="onProdukChanged"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.qty_default"
                label="Qty Default"
                type="number"
                min="0"
                step="0.0001"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.positiveNumber]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.satuan_id"
                :items="satuanOptions"
                item-title="label"
                item-value="id"
                label="Satuan"
                variant="outlined"
                density="compact"
                clearable
                :loading="loadingSatuan"
                @update:model-value="onSatuanChanged"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.sort_order"
                label="Urutan"
                type="number"
                min="0"
                variant="outlined"
                density="compact"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="form.is_required"
                color="success"
                inset
                hide-details
                label="Bahan wajib digunakan"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="form.is_active"
                color="success"
                inset
                hide-details
                label="Status aktif"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            Perubahan ini hanya memengaruhi generate bahan berikutnya. Data
            transaksi nurse yang sudah berjalan tidak otomatis berubah.
          </v-alert>

          <div class="bottom-actions">
            <v-btn
              variant="tonal"
              class="toolbar-btn"
              @click="$router.push('/master/treatment-bahan')"
            >
              Batal
            </v-btn>

            <v-btn
              color="success"
              variant="flat"
              prepend-icon="mdi-content-save"
              class="toolbar-btn"
              :loading="saving"
              type="submit"
            >
              Simpan Perubahan
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import treatmentBahanService from "@/services/master/treatmentBahanService";
import treatmentService from "@/services/master/treatmentService";
import produkService from "@/services/master/produkService";
import referenceService from "@/services/referenceService";

export default {
  name: "EditTreatmentBahan",

  data() {
    return {
      breadcrumbs: [
        { title: "Dashboard", disabled: false, to: "/dashboard" },
        { title: "Master", disabled: true },
        {
          title: "Bahan Treatment",
          disabled: false,
          to: "/master/treatment-bahan",
        },
        { title: "Edit", disabled: true },
      ],

      formValid: false,
      loadingDetail: false,
      saving: false,

      loadingTreatment: false,
      loadingProduk: false,
      loadingSatuan: false,

      treatmentOptions: [],
      produkOptions: [],
      satuanOptions: [],

      form: {
        treatment_id: null,
        produk_id: null,
        qty_default: null,
        satuan_id: null,
        satuan_nama: null,
        is_required: true,
        is_active: true,
        sort_order: 0,
      },

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

  computed: {
    id() {
      return this.$route.params.id;
    },
  },

  async mounted() {
    await this.loadOptions();
    await this.loadDetail();
  },

  methods: {
    async loadOptions() {
      await Promise.all([
        this.loadTreatments(),
        this.loadProduk(),
        this.loadSatuan(),
      ]);
    },

    async loadDetail() {
      this.loadingDetail = true;

      try {
        const data = await treatmentBahanService.getById(this.id);

        this.form = {
          treatment_id: data.treatment_id || null,
          produk_id: data.produk_id || null,
          qty_default: data.qty_default || null,
          satuan_id: data.satuan_id || data.produk?.satuan_id || null,
          satuan_nama:
            data.satuan_nama ||
            data.satuan?.nama_satuan ||
            data.produk?.satuan?.nama_satuan ||
            null,
          is_required: Number(data.is_required) === 1,
          is_active: Number(data.is_active) === 1,
          sort_order: data.sort_order || 0,
        };

        if (this.form.satuan_id && !this.form.satuan_nama) {
          this.onSatuanChanged(this.form.satuan_id);
        }
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message ||
            "Gagal mengambil detail bahan treatment",
          "error",
        );

        setTimeout(() => {
          this.$router.push("/master/treatment-bahan");
        }, 700);
      } finally {
        this.loadingDetail = false;
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
          label: `${item.nama || "-"}${item.kode_accurate ? ` - ${item.kode_accurate}` : ""}`,
        }));
      } catch (error) {
        this.treatmentOptions = [];
      } finally {
        this.loadingTreatment = false;
      }
    },

    async loadProduk() {
      this.loadingProduk = true;

      try {
        const response = await produkService.getAll({
          page: 1,
          per_page: 1000,
        });

        this.produkOptions = this.extractRows(response).map((item) => ({
          ...item,
          label: `${item.nama || "-"}${item.kode_accurate ? ` - ${item.kode_accurate}` : ""}`,
        }));
      } catch (error) {
        this.produkOptions = [];
      } finally {
        this.loadingProduk = false;
      }
    },

    async loadSatuan() {
      this.loadingSatuan = true;

      try {
        const response = await referenceService.satuan();

        this.satuanOptions = this.extractRows(response).map((item) => ({
          ...item,
          label: item.nama_satuan || item.nama || "-",
        }));
      } catch (error) {
        this.satuanOptions = [];
      } finally {
        this.loadingSatuan = false;
      }
    },

    onProdukChanged(produkId) {
      const produk = this.produkOptions.find(
        (item) => Number(item.id) === Number(produkId),
      );

      if (!produk) return;

      if (produk.satuan_id && !this.form.satuan_id) {
        this.form.satuan_id = produk.satuan_id;
        this.onSatuanChanged(produk.satuan_id);
      }
    },

    onSatuanChanged(satuanId) {
      const satuan = this.satuanOptions.find(
        (item) => Number(item.id) === Number(satuanId),
      );
      this.form.satuan_nama = satuan?.nama_satuan || satuan?.nama || null;
    },

    async submit() {
      const validation = await this.$refs.formRef.validate();

      if (!validation.valid) {
        this.showSnackbar("Periksa kembali form yang wajib diisi", "error");
        return;
      }

      this.saving = true;

      try {
        const payload = this.buildPayload();

        await treatmentBahanService.update(this.id, payload);

        this.showSnackbar("Bahan treatment berhasil diperbarui", "success");

        setTimeout(() => {
          this.$router.push("/master/treatment-bahan");
        }, 500);
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message || "Gagal memperbarui bahan treatment",
          "error",
        );
      } finally {
        this.saving = false;
      }
    },

    buildPayload() {
      return {
        treatment_id: this.form.treatment_id,
        produk_id: this.form.produk_id,
        qty_default: Number(this.form.qty_default || 0),
        satuan_id: this.form.satuan_id,
        satuan_nama: this.form.satuan_nama,
        is_required: this.form.is_required ? 1 : 0,
        is_active: this.form.is_active ? 1 : 0,
        sort_order: Number(this.form.sort_order || 0),
      };
    },

    extractRows(response) {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.items)) return response.items;
      return [];
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

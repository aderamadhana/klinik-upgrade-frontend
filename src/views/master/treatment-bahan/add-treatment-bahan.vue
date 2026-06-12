<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tambah Bahan Treatment</h1>
        <p class="page-subtitle">
          Tambahkan bahan default untuk treatment yang akan diproses oleh
          perawat.
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
      <div class="section-header">Form Bahan Treatment</div>

      <v-card-text class="section-body">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="submit">
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
                @update:model-value="onTreatmentChanged"
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

          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            Data ini menjadi template bahan. Saat treatment masuk proses nurse,
            bahan dapat digenerate sebagai detail pemakaian perawat.
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
              Simpan
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
  name: "AddTreatmentBahan",

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
        { title: "Tambah", disabled: true },
      ],

      formValid: false,
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

  mounted() {
    this.loadOptions();
  },

  methods: {
    async loadOptions() {
      await Promise.all([
        this.loadTreatments(),
        this.loadProduk(),
        this.loadSatuan(),
      ]);
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

    onTreatmentChanged() {},

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

        await treatmentBahanService.create(payload);

        this.showSnackbar("Bahan treatment berhasil disimpan", "success");

        setTimeout(() => {
          this.$router.push("/master/treatment-bahan");
        }, 500);
      } catch (error) {
        this.showSnackbar(
          error.response?.data?.message || "Gagal menyimpan bahan treatment",
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

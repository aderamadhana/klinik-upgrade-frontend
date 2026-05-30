<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tambah Toko</h1>
        <p class="page-subtitle">Tambahkan data toko baru ke sistem</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title class="text-h6 font-weight-bold">
        Form Master Toko
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-alert type="info" class="mb-6" rounded="lg">
          Isi data utama toko terlebih dahulu. Kolom bertanda
          <strong>*</strong> wajib diisi.
        </v-alert>

        <v-form
          ref="formRef"
          v-model="isValid"
          validate-on="submit lazy"
          @submit.prevent="submitForm"
        >
          <div class="text-subtitle-1 font-weight-bold mb-3">
            Informasi Utama
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode"
                label="Kode *"
                placeholder="Contoh: AEMS-001"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-barcode"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode_toko"
                label="Kode Toko *"
                placeholder="Contoh: MLG"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-store-outline"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.nama_toko"
                label="Nama Toko *"
                placeholder="Masukkan nama toko"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-domain"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.jenis_toko"
                label="Jenis Toko *"
                placeholder="Pilih jenis toko"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-shape-outline"
                :items="jenisTokoOptions"
                item-title="label"
                item-value="value"
                :rules="[rules.requiredSelect]"
                clearable
                auto-select-first
                no-data-text="Jenis toko tidak ditemukan"
                :custom-filter="filterOption"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_telepon"
                label="No. Telepon"
                placeholder="Masukkan nomor telepon"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-phone-outline"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.alamat"
                label="Alamat"
                placeholder="Masukkan alamat lengkap toko"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker-outline"
                rows="3"
                auto-grow
                clearable
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-subtitle-1 font-weight-bold mb-3">
            Pengaturan Tambahan
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.source_template"
                label="Source Template"
                placeholder="Opsional"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-file-code-outline"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.token_cdn"
                label="Token CDN"
                placeholder="Opsional"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-key-outline"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.sort_order"
                label="Sort Order"
                placeholder="Contoh: 1"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-sort-numeric-ascending"
                hint="Semakin kecil angka, semakin atas urutannya"
                persistent-hint
              />
            </v-col>
          </v-row>

          <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
            <v-btn
              variant="outlined"
              color="secondary"
              :to="'/master/toko'"
              :disabled="loading"
            >
              Batal
            </v-btn>

            <v-btn
              color="success"
              variant="flat"
              type="submit"
              prepend-icon="mdi-content-save"
              :loading="loading"
              :disabled="loading"
            >
              Simpan Toko
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import tokoService from "@/services/master/tokoService";

export default {
  name: "AddToko",

  data() {
    return {
      isValid: false,
      loading: false,

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Toko", disabled: false, to: "/master/toko" },
        { title: "Tambah Toko", disabled: true },
      ],

      form: {
        kode: "",
        kode_toko: "",
        nama_toko: "",
        jenis_toko: null,
        no_telepon: "",
        alamat: "",
        source_template: "",
        token_cdn: "",
        sort_order: 0,
      },

      jenisTokoOptions: [
        { label: "Cabang", value: 1 },
        { label: "Management", value: 2 },
        { label: "Central", value: 3 },
      ],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!String(v ?? "").trim() || "Field ini wajib diisi",
        requiredSelect: (v) =>
          (v !== null && v !== undefined && v !== "") ||
          "Field ini wajib diisi",
      },
    };
  },

  computed: {
    payload() {
      return this.buildPayload();
    },
  },

  methods: {
    filterOption(itemTitle, queryText, item) {
      const title =
        typeof itemTitle === "string"
          ? itemTitle
          : (item?.raw?.label ?? item?.raw?.nama ?? "");

      const text = String(title || "").toLowerCase();
      const query = String(queryText || "").toLowerCase();

      return text.includes(query);
    },

    buildPayload() {
      return {
        kode: this.cleanValue(this.form.kode),
        kode_toko: this.cleanValue(this.form.kode_toko),
        nama_toko: this.cleanValue(this.form.nama_toko),
        jenis_toko: Number(this.form.jenis_toko),
        no_telepon: this.cleanValue(this.form.no_telepon),
        alamat: this.cleanValue(this.form.alamat),
        source_template: this.cleanValue(this.form.source_template),
        token_cdn: this.cleanValue(this.form.token_cdn),
        sort_order: Number(this.form.sort_order || 0),
      };
    },

    cleanValue(value) {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      if (typeof value === "string") {
        return value.trim() || null;
      }

      return value;
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      this.loading = true;

      try {
        await tokoService.create(this.payload);

        this.showSnackbar("Data toko berhasil disimpan", "success");

        this.$router.replace("/master/toko");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menyimpan data toko"),
          "error",
        );
      } finally {
        this.loading = false;
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

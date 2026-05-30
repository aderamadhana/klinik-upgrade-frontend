<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tambah Kategori Antrian</h1>
        <p class="page-subtitle">
          Input kategori antrian manual atau samakan dengan cabang lain
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title class="text-h6 font-weight-bold">
        Form Kategori Antrian
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-alert type="info" class="mb-6" rounded="lg">
          Gunakan Input Manual untuk membuat satu kategori. Gunakan Samakan
          Cabang untuk menyalin seluruh kategori dari Global/cabang sumber ke
          cabang tujuan.
        </v-alert>

        <v-btn-toggle
          v-model="mode"
          color="primary"
          mandatory
          variant="outlined"
          class="mb-6"
        >
          <v-btn value="manual" prepend-icon="mdi-pencil"> Input Manual </v-btn>

          <v-btn value="copy" prepend-icon="mdi-content-copy">
            Samakan Cabang
          </v-btn>
        </v-btn-toggle>

        <v-form
          ref="formRef"
          v-model="isValid"
          validate-on="submit lazy"
          @submit.prevent="submitForm"
        >
          <template v-if="mode === 'manual'">
            <div class="text-subtitle-1 font-weight-bold mb-3">
              Informasi Utama
            </div>

            <v-row>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="form.toko_id"
                  label="Cabang"
                  placeholder="Pilih cabang atau Global"
                  :items="sourceTokoOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-store-outline"
                  clearable
                  :loading="loadingToko"
                  no-data-text="Cabang tidak ditemukan"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.kode"
                  label="Kode *"
                  placeholder="Contoh: P"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-alpha-k-box-outline"
                  :rules="[rules.required]"
                  maxlength="10"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.icon"
                  label="Icon"
                  placeholder="Contoh: mdi-spa-outline"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-emoticon-outline"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.nama"
                  label="Nama Kategori *"
                  placeholder="Contoh: Treatment"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-format-list-bulleted-type"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.priority_level"
                  label="Priority Level"
                  placeholder="Contoh: 0 / 100"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-sort-numeric-descending"
                  :rules="[rules.nonNegativeInteger]"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.deskripsi"
                  label="Deskripsi"
                  placeholder="Masukkan deskripsi kategori"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-note-text-outline"
                  rows="3"
                  auto-grow
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-switch
                  v-model="form.is_priority"
                  label="Kategori Prioritas"
                  color="warning"
                  inset
                  hide-details
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-switch
                  v-model="form.is_active"
                  label="Status Aktif"
                  color="success"
                  inset
                  hide-details
                />
              </v-col>
            </v-row>
          </template>

          <template v-else>
            <div class="text-subtitle-1 font-weight-bold mb-3">
              Samakan Kategori dengan Cabang Lain
            </div>

            <v-row>
              <v-col cols="12" md="5">
                <v-autocomplete
                  v-model="copyForm.source_toko_id"
                  label="Ambil Data Dari *"
                  placeholder="Pilih sumber data"
                  :items="sourceTokoOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-source-branch"
                  :rules="[rules.requiredSelect]"
                  :loading="loadingToko"
                  no-data-text="Cabang tidak ditemukan"
                />
              </v-col>

              <v-col cols="12" md="7">
                <v-autocomplete
                  v-model="copyForm.target_toko_ids"
                  label="Terapkan ke Cabang *"
                  placeholder="Pilih satu atau beberapa cabang"
                  :items="targetTokoOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-store-plus-outline"
                  :rules="[rules.requiredArray]"
                  multiple
                  chips
                  closable-chips
                  :loading="loadingToko"
                  no-data-text="Cabang tidak ditemukan"
                />
              </v-col>

              <v-col cols="12">
                <v-alert type="warning" rounded="lg">
                  Jika kode kategori sudah ada di cabang tujuan, data akan
                  diperbarui. Jika belum ada, data akan dibuat baru.
                </v-alert>
              </v-col>
            </v-row>
          </template>

          <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
            <v-btn
              variant="outlined"
              color="secondary"
              :to="'/master/antrian-kategori'"
              :disabled="loadingSave"
            >
              Batal
            </v-btn>

            <v-btn
              color="success"
              variant="flat"
              type="submit"
              prepend-icon="mdi-content-save"
              :loading="loadingSave"
              :disabled="loadingSave"
            >
              {{ mode === "manual" ? "Simpan Kategori" : "Samakan Cabang" }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import referenceService from "@/services/referenceService";
import masterAntrianKategoriService from "@/services/master/masterAntrianKategoriService";

export default {
  name: "AddAntrianKategori",

  data() {
    return {
      mode: "manual",
      isValid: false,
      loadingSave: false,
      loadingToko: false,

      breadcrumbs: [
        { title: "Master", disabled: true },
        {
          title: "Kategori Antrian",
          disabled: false,
          to: "/master/antrian-kategori",
        },
        { title: "Tambah Kategori Antrian", disabled: true },
      ],

      tokoOptions: [],

      form: {
        toko_id: "__global__",
        kode: "",
        nama: "",
        deskripsi: "",
        icon: "",
        is_priority: false,
        priority_level: 0,
        is_active: true,
      },

      copyForm: {
        source_toko_id: "__global__",
        target_toko_ids: [],
      },

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
        requiredArray: (v) =>
          (Array.isArray(v) && v.length > 0) || "Pilih minimal 1 cabang",
        nonNegativeInteger: (v) => {
          if (v === null || v === undefined || v === "") return true;

          const value = Number(v);

          return (
            (Number.isInteger(value) && value >= 0) ||
            "Harus bilangan bulat >= 0"
          );
        },
      },
    };
  },

  computed: {
    sourceTokoOptions() {
      return [
        { label: "Global Semua Cabang", value: "__global__" },
        ...this.tokoOptions,
      ];
    },

    targetTokoOptions() {
      return this.tokoOptions;
    },

    payload() {
      return {
        toko_id:
          this.form.toko_id === "__global__" || !this.form.toko_id
            ? null
            : this.form.toko_id,
        kode: this.cleanValue(this.form.kode)?.toUpperCase(),
        nama: this.cleanValue(this.form.nama),
        deskripsi: this.cleanValue(this.form.deskripsi),
        icon: this.cleanValue(this.form.icon),
        is_priority: Boolean(this.form.is_priority),
        priority_level: Number(this.form.priority_level || 0),
        is_active: Boolean(this.form.is_active),
      };
    },
  },

  mounted() {
    this.fetchToko();
  },

  methods: {
    async fetchToko() {
      this.loadingToko = true;

      try {
        const rows = await referenceService.toko();
        const tokoRows = Array.isArray(rows) ? rows : rows?.data || [];

        this.tokoOptions = tokoRows.map((item) => ({
          label: item.nama || item.nama_toko || item.name || "-",
          value: item.id,
        }));
      } catch (error) {
        console.error(error);
        this.showSnackbar("Gagal memuat data cabang", "error");
      } finally {
        this.loadingToko = false;
      }
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      if (this.mode === "manual") {
        await this.submitManual();
        return;
      }

      await this.submitCopy();
    },

    async submitManual() {
      this.loadingSave = true;

      try {
        await masterAntrianKategoriService.create(this.payload);

        this.showSnackbar("Kategori antrian berhasil disimpan", "success");

        this.$router.replace("/master/antrian-kategori");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menyimpan kategori antrian"),
          "error",
        );
      } finally {
        this.loadingSave = false;
      }
    },

    async submitCopy() {
      this.loadingSave = true;

      try {
        await masterAntrianKategoriService.syncFromBranch({
          source_toko_id: this.copyForm.source_toko_id,
          target_toko_ids: this.copyForm.target_toko_ids,
        });

        this.showSnackbar(
          "Kategori berhasil disamakan dengan cabang tujuan",
          "success",
        );

        this.$router.replace("/master/antrian-kategori");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menyamakan kategori antrian"),
          "error",
        );
      } finally {
        this.loadingSave = false;
      }
    },

    cleanValue(value) {
      if (value === undefined || value === null || value === "") return null;
      if (typeof value === "string") return value.trim() || null;

      return value;
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

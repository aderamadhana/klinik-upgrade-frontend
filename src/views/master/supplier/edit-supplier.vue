<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Supplier</h1>
        <p class="page-subtitle">
          Ubah data supplier dan mapping cabang yang menggunakan supplier ini
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-skeleton-loader v-if="loadingPage" type="article" />

    <template v-else>
      <v-card elevation="1">
        <v-card-title class="text-h6 font-weight-bold">
          Form Edit Supplier
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-6">
          <v-alert type="info" variant="tonal" class="mb-6" rounded="lg">
            Ubah data supplier, lalu sesuaikan cabang yang menggunakan supplier
            ini.
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
                  placeholder="Contoh: SUP001"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-barcode"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.nama"
                  label="Nama Supplier *"
                  placeholder="Masukkan nama supplier / perusahaan"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-domain"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.kontak_person"
                  label="Kontak Person"
                  placeholder="Nama PIC / contact person"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-tie-outline"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.no_telp"
                  label="No. Telepon"
                  placeholder="Nomor telepon / WhatsApp"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-phone-outline"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  placeholder="Masukkan email supplier"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="[rules.email]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.kota"
                  label="Kota"
                  placeholder="Masukkan kota supplier"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-city-variant-outline"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.sort_order"
                  label="Sort Order"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-sort-numeric-ascending"
                  hint="Semakin kecil angka, semakin atas urutannya"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.alamat"
                  label="Alamat"
                  placeholder="Masukkan alamat supplier"
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

            <div
              class="d-flex justify-space-between align-center mb-3 flex-wrap ga-3"
            >
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Cabang / Toko yang Menggunakan Supplier
                </div>
                <div class="text-caption text-medium-emphasis">
                  Pilih cabang yang bisa menggunakan supplier ini
                </div>
              </div>

              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-plus"
                @click="addTokoMapping"
              >
                Tambah Cabang
              </v-btn>
            </div>

            <v-alert type="info" variant="tonal" class="mb-4" rounded="lg">
              Centang <strong>Default</strong> jika supplier ini menjadi
              supplier utama di cabang tersebut.
            </v-alert>

            <v-card
              v-for="(item, index) in form.toko_mapping"
              :key="index"
              variant="outlined"
              class="mb-4"
              rounded="lg"
            >
              <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-subtitle-2 font-weight-bold">
                  Cabang {{ index + 1 }}
                </span>

                <v-btn
                  v-if="form.toko_mapping.length > 1"
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="removeTokoMapping(index)"
                />
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col cols="12" md="10">
                    <v-autocomplete
                      v-model="item.toko_id"
                      label="Toko / Cabang *"
                      placeholder="Pilih toko"
                      :items="tokoOptions"
                      item-title="nama"
                      item-value="id"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-store-marker-outline"
                      :rules="[rules.required]"
                      :loading="loadingMaster"
                      clearable
                      auto-select-first
                      no-data-text="Toko tidak ditemukan"
                      :custom-filter="filterOption"
                    />
                  </v-col>

                  <v-col cols="12" md="2" class="d-flex align-center">
                    <v-checkbox
                      v-model="item.is_default"
                      label="Default"
                      color="success"
                      hide-details
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
              <v-btn
                variant="outlined"
                color="secondary"
                :to="'/master/supplier'"
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
                Update Supplier
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </template>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>

    <v-dialog v-model="dialogPreview" max-width="900">
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Preview Payload Update</span>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogPreview = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <pre class="payload-preview">{{ formattedPayload }}</pre>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="dialogPreview = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import referenceService from "@/services/referenceService";
import supplierService from "@/services/master/supplierService";

export default {
  name: "EditSupplier",

  data() {
    return {
      isValid: false,
      loadingPage: false,
      loadingMaster: false,
      loadingSave: false,
      dialogPreview: false,

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Supplier", disabled: false, to: "/master/supplier" },
        { title: "Edit Supplier", disabled: true },
      ],

      tokoOptions: [],

      form: {
        kode: "",
        nama: "",
        kontak_person: "",
        no_telp: "",
        email: "",
        alamat: "",
        kota: "",
        sort_order: 0,
        toko_mapping: [
          {
            toko_id: null,
            is_default: false,
          },
        ],
      },

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!String(v ?? "").trim() || "Field ini wajib diisi",
        email: (v) => {
          const value = String(v ?? "").trim();

          if (!value) return true;

          return (
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
            "Format email tidak valid"
          );
        },
      },
    };
  },

  computed: {
    supplierId() {
      return this.$route.params.id;
    },

    payload() {
      return this.buildPayload();
    },

    formattedPayload() {
      return JSON.stringify(this.payload, null, 2);
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    async initPage() {
      this.loadingPage = true;

      try {
        await this.fetchMasterData();
        await this.fetchDetailSupplier();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data supplier"),
          "error",
        );
      } finally {
        this.loadingPage = false;
      }
    },

    async fetchMasterData() {
      this.loadingMaster = true;

      try {
        const tokoRes = await referenceService.toko();

        this.tokoOptions = this.normalizeToko(tokoRes);
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data toko"),
          "error",
        );

        throw error;
      } finally {
        this.loadingMaster = false;
      }
    },

    async fetchDetailSupplier() {
      try {
        const detail = await supplierService.getById(this.supplierId);

        if (!detail) {
          this.showSnackbar("Data supplier tidak ditemukan", "error");
          this.$router.replace("/master/supplier");
          return;
        }

        this.form = {
          kode: detail.kode || "",
          nama: detail.nama || "",
          kontak_person: detail.kontak_person || "",
          no_telp: detail.no_telp || "",
          email: detail.email || "",
          alamat: detail.alamat || "",
          kota: detail.kota || "",
          sort_order: Number(detail.sort_order || 0),
          toko_mapping: this.extractTokoMapping(detail),
        };
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat detail supplier"),
          "error",
        );

        throw error;
      }
    },

    normalizeToko(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.toko_id ?? item.value,
          nama: item.nama_toko ?? item.nama ?? item.name ?? item.label ?? "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    extractRows(response) {
      const source = response?.data ?? response?.result ?? response ?? [];

      if (Array.isArray(source)) {
        return source;
      }

      if (Array.isArray(source.data)) {
        return source.data;
      }

      if (Array.isArray(source.items)) {
        return source.items;
      }

      return [];
    },

    extractTokoMapping(detail) {
      const relation =
        detail.toko_aktif ||
        detail.tokoAktif ||
        detail.toko ||
        detail.penempatan ||
        [];

      if (!Array.isArray(relation) || relation.length === 0) {
        return [
          {
            toko_id: null,
            is_default: false,
          },
        ];
      }

      return relation
        .map((item) => ({
          toko_id: item.toko_id ?? item.toko?.id ?? item.id ?? null,
          is_default: Number(item.is_default || 0) === 1,
        }))
        .filter((item) => item.toko_id);
    },

    filterOption(itemTitle, queryText, item) {
      const title =
        typeof itemTitle === "string"
          ? itemTitle
          : (item?.raw?.nama ?? item?.raw?.label ?? "");

      const text = String(title || "").toLowerCase();
      const query = String(queryText || "").toLowerCase();

      return text.includes(query);
    },

    addTokoMapping() {
      this.form.toko_mapping.push({
        toko_id: null,
        is_default: false,
      });
    },

    removeTokoMapping(index) {
      this.form.toko_mapping.splice(index, 1);
    },

    validateTokoMapping() {
      if (!this.form.toko_mapping.length) {
        return "Minimal harus ada 1 cabang";
      }

      const tokoIds = this.form.toko_mapping
        .map((item) => item.toko_id)
        .filter((id) => id !== null && id !== "");

      if (tokoIds.length !== this.form.toko_mapping.length) {
        return "Semua cabang harus dipilih";
      }

      const uniqueTokoIds = new Set(tokoIds.map((id) => String(id)));

      if (uniqueTokoIds.size !== tokoIds.length) {
        return "Cabang tidak boleh duplikat";
      }

      return null;
    },

    buildPayload() {
      return {
        kode: this.cleanValue(this.form.kode),
        nama: this.cleanValue(this.form.nama),
        kontak_person: this.cleanValue(this.form.kontak_person),
        no_telp: this.cleanValue(this.form.no_telp),
        email: this.cleanValue(this.form.email),
        alamat: this.cleanValue(this.form.alamat),
        kota: this.cleanValue(this.form.kota),
        sort_order: Number(this.form.sort_order || 0),

        toko: this.form.toko_mapping.map((item) => ({
          toko_id: item.toko_id,
          is_default: item.is_default ? 1 : 0,
        })),
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

      const mappingError = this.validateTokoMapping();

      if (mappingError) {
        this.showSnackbar(mappingError, "error");
        return;
      }

      this.loadingSave = true;

      try {
        await supplierService.update(this.supplierId, this.payload);

        this.showSnackbar("Data supplier berhasil diperbarui", "success");

        this.$router.replace("/master/supplier");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memperbarui data supplier"),
          "error",
        );
      } finally {
        this.loadingSave = false;
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

<style scoped>
.payload-preview {
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}
</style>

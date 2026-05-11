<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Brand Ambassador</h1>
        <p class="page-subtitle">
          Ubah data brand ambassador berdasarkan cabang klinik
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-skeleton-loader v-if="loadingPage" type="article" />

    <template v-else>
      <v-card elevation="1">
        <v-card-title class="text-h6 font-weight-bold">
          Form Edit Brand Ambassador
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-6">
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
                <v-autocomplete
                  v-model="form.toko_id"
                  label="Cabang / Toko *"
                  placeholder="Pilih cabang"
                  :items="tokoOptions"
                  item-title="nama"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-store-marker-outline"
                  :rules="[rules.requiredSelect]"
                  :loading="loadingMaster"
                  clearable
                  auto-select-first
                  no-data-text="Cabang tidak ditemukan"
                  :custom-filter="filterOption"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.kode"
                  label="Kode *"
                  placeholder="Contoh: BA001"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-barcode"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.nama"
                  label="Nama *"
                  placeholder="Masukkan nama brand ambassador"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-star-outline"
                  :rules="[rules.required]"
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
                  placeholder="Masukkan email"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="[rules.email]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.instagram"
                  label="Instagram"
                  placeholder="Contoh: @namaakun"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-instagram"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.alamat"
                  label="Alamat"
                  placeholder="Masukkan alamat"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-map-marker-outline"
                  rows="3"
                  auto-grow
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.catatan"
                  label="Catatan"
                  placeholder="Masukkan catatan tambahan"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-note-text-outline"
                  rows="3"
                  auto-grow
                  clearable
                />
              </v-col>
            </v-row>

            <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
              <v-btn
                variant="outlined"
                color="secondary"
                :to="'/master/brand-ambassador'"
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
                Update Brand Ambassador
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
import brandAmbassadorService from "@/services/master/brandAmbassadorService";

export default {
  name: "EditBrandAmbassador",

  data() {
    return {
      isValid: false,
      loadingPage: false,
      loadingMaster: false,
      loadingSave: false,
      dialogPreview: false,

      breadcrumbs: [
        { title: "Master", disabled: true },
        {
          title: "Brand Ambassador",
          disabled: false,
          to: "/master/brand-ambassador",
        },
        { title: "Edit Brand Ambassador", disabled: true },
      ],

      tokoOptions: [],

      form: {
        toko_id: null,
        kode: "",
        nama: "",
        no_telp: "",
        email: "",
        instagram: "",
        alamat: "",
        catatan: "",
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
    brandAmbassadorId() {
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
        await this.fetchDetailBrandAmbassador();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data brand ambassador"),
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
          this.getErrorMessage(error, "Gagal memuat data cabang"),
          "error",
        );

        throw error;
      } finally {
        this.loadingMaster = false;
      }
    },

    async fetchDetailBrandAmbassador() {
      try {
        const detail = await brandAmbassadorService.getById(
          this.brandAmbassadorId,
        );

        if (!detail) {
          this.showSnackbar("Data brand ambassador tidak ditemukan", "error");
          this.$router.replace("/master/brand-ambassador");
          return;
        }

        this.form = {
          toko_id:
            detail.toko_id ?? detail.toko?.id ?? detail.master_toko_id ?? null,
          kode: detail.kode || "",
          nama: detail.nama || "",
          no_telp: detail.no_telp || "",
          email: detail.email || "",
          instagram: detail.instagram || "",
          alamat: detail.alamat || "",
          catatan: detail.catatan || "",
        };
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat detail brand ambassador"),
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

    filterOption(itemTitle, queryText, item) {
      const title =
        typeof itemTitle === "string"
          ? itemTitle
          : (item?.raw?.nama ?? item?.raw?.label ?? "");

      const text = String(title || "").toLowerCase();
      const query = String(queryText || "").toLowerCase();

      return text.includes(query);
    },

    buildPayload() {
      return {
        toko_id: this.form.toko_id,
        kode: this.cleanValue(this.form.kode),
        nama: this.cleanValue(this.form.nama),
        no_telp: this.cleanValue(this.form.no_telp),
        email: this.cleanValue(this.form.email),
        instagram: this.cleanValue(this.form.instagram),
        alamat: this.cleanValue(this.form.alamat),
        catatan: this.cleanValue(this.form.catatan),
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

      this.loadingSave = true;

      try {
        await brandAmbassadorService.update(
          this.brandAmbassadorId,
          this.payload,
        );

        this.showSnackbar(
          "Data brand ambassador berhasil diperbarui",
          "success",
        );

        this.$router.replace("/master/brand-ambassador");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(
            error,
            "Gagal memperbarui data brand ambassador",
          ),
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

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Merchandise</h1>
        <p class="page-subtitle">
          Ubah data master reward, voucher, diskon, atau merchandise
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-skeleton-loader v-if="loadingPage" type="article" />

    <template v-else>
      <v-card elevation="1">
        <v-card-title class="text-h6 font-weight-bold">
          Form Edit Merchandise
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-6">
          <v-alert type="info" class="mb-6" rounded="lg">
            Pilih jenis reward terlebih dahulu. Field diskon akan menyesuaikan
            otomatis.
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
                  placeholder="Contoh: MRH001"
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
                  label="Nama *"
                  placeholder="Masukkan nama reward / merchandise"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-gift-outline"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="form.jenis_reward"
                  label="Jenis Reward *"
                  placeholder="Pilih jenis reward"
                  :items="jenisRewardOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-tag-outline"
                  :rules="[rules.requiredSelect]"
                  clearable
                  auto-select-first
                  no-data-text="Jenis reward tidak ditemukan"
                  :custom-filter="filterOption"
                />
              </v-col>

              <v-col
                v-if="form.jenis_reward === 'diskon_persen'"
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="form.nilai_diskon_persen"
                  label="Nilai Diskon Persen *"
                  placeholder="Contoh: 10"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-percent-outline"
                  suffix="%"
                  :rules="[rules.required, rules.percent]"
                />
              </v-col>

              <v-col
                v-if="form.jenis_reward === 'diskon_nominal'"
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="form.nilai_diskon_nominal"
                  label="Nilai Diskon Nominal *"
                  placeholder="Contoh: 50000"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-cash"
                  prefix="Rp"
                  :rules="[rules.required, rules.nonNegative]"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.harga_poin"
                  label="Harga Poin *"
                  placeholder="Contoh: 100"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-star-circle-outline"
                  :rules="[rules.required, rules.nonNegativeInteger]"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.stok"
                  label="Stok *"
                  placeholder="Contoh: 50"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-package-variant-closed"
                  :rules="[rules.required, rules.nonNegativeInteger]"
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

              <v-col cols="12">
                <v-textarea
                  v-model="form.deskripsi"
                  label="Deskripsi"
                  placeholder="Masukkan deskripsi reward"
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
                :to="'/master/merchandise'"
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
                Update Merchandise
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
import merchandiseService from "@/services/master/merchandiseService";

export default {
  name: "EditMerchandise",

  data() {
    return {
      isValid: false,
      loadingPage: false,
      loadingSave: false,
      dialogPreview: false,

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Merchandise", disabled: false, to: "/master/merchandise" },
        { title: "Edit Merchandise", disabled: true },
      ],

      jenisRewardOptions: [
        { label: "Merchandise", value: "merchandise" },
        { label: "Diskon Persen", value: "diskon_persen" },
        { label: "Diskon Nominal", value: "diskon_nominal" },
      ],

      form: {
        kode: "",
        nama: "",
        jenis_reward: null,
        nilai_diskon_persen: null,
        nilai_diskon_nominal: null,
        harga_poin: 0,
        stok: 0,
        deskripsi: "",
        sort_order: 0,
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
        nonNegative: (v) => {
          if (v === null || v === undefined || v === "") return true;

          return Number(v) >= 0 || "Nilai tidak boleh kurang dari 0";
        },
        nonNegativeInteger: (v) => {
          if (v === null || v === undefined || v === "") {
            return "Field ini wajib diisi";
          }

          const value = Number(v);

          return (
            (Number.isInteger(value) && value >= 0) ||
            "Harus bilangan bulat >= 0"
          );
        },
        percent: (v) => {
          if (v === null || v === undefined || v === "") {
            return "Field ini wajib diisi";
          }

          const value = Number(v);

          return (
            (value >= 0 && value <= 100) || "Persen harus antara 0 sampai 100"
          );
        },
      },
    };
  },

  computed: {
    merchandiseId() {
      return this.$route.params.id;
    },

    payload() {
      return this.buildPayload();
    },

    formattedPayload() {
      return JSON.stringify(this.payload, null, 2);
    },
  },

  watch: {
    "form.jenis_reward"(value) {
      if (value !== "pr") {
        this.form.nilai_diskon_persen = null;
      }

      if (value !== "rp") {
        this.form.nilai_diskon_nominal = null;
      }
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    async initPage() {
      this.loadingPage = true;

      try {
        await this.fetchDetailMerchandise();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data merchandise"),
          "error",
        );
      } finally {
        this.loadingPage = false;
      }
    },

    async fetchDetailMerchandise() {
      try {
        const detail = await merchandiseService.getById(this.merchandiseId);

        if (!detail) {
          this.showSnackbar("Data merchandise tidak ditemukan", "error");
          this.$router.replace("/master/merchandise");
          return;
        }

        this.form = {
          kode: detail.kode || "",
          nama: detail.nama || "",
          jenis_reward: this.normalizeJenisReward(detail.jenis_reward),
          nilai_diskon_persen: detail.nilai_diskon_persen,
          nilai_diskon_nominal: detail.nilai_diskon_nominal,
          harga_poin: Number(detail.harga_poin || 0),
          stok: Number(detail.stok || 0),
          deskripsi: detail.deskripsi || "",
          sort_order: Number(detail.sort_order || 0),
        };
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat detail merchandise"),
          "error",
        );

        throw error;
      }
    },

    normalizeJenisReward(value) {
      const map = {
        merchandise: "merchandise",
        diskon_persen: "diskon_persen",
        diskon_nominal: "diskon_nominal",
      };

      return map[value] || value || null;
    },

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
        nama: this.cleanValue(this.form.nama),
        jenis_reward: this.cleanValue(this.form.jenis_reward),

        nilai_diskon_persen:
          this.form.jenis_reward === "pr"
            ? Number(this.form.nilai_diskon_persen || 0)
            : null,

        nilai_diskon_nominal:
          this.form.jenis_reward === "rp"
            ? Number(this.form.nilai_diskon_nominal || 0)
            : null,

        harga_poin: Number(this.form.harga_poin || 0),
        stok: Number(this.form.stok || 0),
        deskripsi: this.cleanValue(this.form.deskripsi),
        sort_order: Number(this.form.sort_order || 0),
      };
    },

    validateBusinessRule() {
      if (this.form.jenis_reward === "pr") {
        if (
          this.form.nilai_diskon_persen === null ||
          this.form.nilai_diskon_persen === undefined ||
          this.form.nilai_diskon_persen === ""
        ) {
          return "Nilai diskon persen wajib diisi";
        }

        const percent = Number(this.form.nilai_diskon_persen);

        if (percent < 0 || percent > 100) {
          return "Nilai diskon persen harus antara 0 sampai 100";
        }
      }

      if (this.form.jenis_reward === "rp") {
        if (
          this.form.nilai_diskon_nominal === null ||
          this.form.nilai_diskon_nominal === undefined ||
          this.form.nilai_diskon_nominal === ""
        ) {
          return "Nilai diskon nominal wajib diisi";
        }

        if (Number(this.form.nilai_diskon_nominal) < 0) {
          return "Nilai diskon nominal tidak boleh kurang dari 0";
        }
      }

      return null;
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

      const ruleError = this.validateBusinessRule();

      if (ruleError) {
        this.showSnackbar(ruleError, "error");
        return;
      }

      this.loadingSave = true;

      try {
        await merchandiseService.update(this.merchandiseId, this.payload);

        this.showSnackbar("Data merchandise berhasil diperbarui", "success");

        this.$router.replace("/master/merchandise");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memperbarui data merchandise"),
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

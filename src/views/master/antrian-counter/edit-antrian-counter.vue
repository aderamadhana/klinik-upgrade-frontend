<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Counter Antrian</h1>
        <p class="page-subtitle">
          Ubah counter antrian dan terapkan ke cabang lain bila diperlukan
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-skeleton-loader v-if="loadingPage" type="article" />

    <template v-else>
      <v-card elevation="1">
        <v-card-title class="text-h6 font-weight-bold">
          Form Edit Counter Antrian
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-6">
          <v-alert type="info" class="mb-6" rounded="lg">
            Perubahan utama akan disimpan ke counter ini. Aktifkan opsi terapkan
            ke cabang lain jika counter dengan kode yang sama juga ingin dibuat
            atau diperbarui di cabang lain.
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
                <v-autocomplete
                  v-model="form.toko_id"
                  label="Cabang *"
                  placeholder="Pilih cabang"
                  :items="tokoOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-store-outline"
                  :rules="[rules.requiredSelect]"
                  clearable
                  :loading="loadingToko"
                  no-data-text="Cabang tidak ditemukan"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.kode"
                  label="Kode"
                  placeholder="Contoh: C1"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-barcode"
                  maxlength="30"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.nama"
                  label="Nama Counter *"
                  placeholder="Contoh: Counter 1"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-counter"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.keterangan"
                  label="Keterangan"
                  placeholder="Masukkan keterangan counter"
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
                  v-model="form.is_active"
                  label="Status Aktif"
                  color="success"
                  inset
                  hide-details
                />
              </v-col>
            </v-row>

            <v-divider class="my-6" />

            <div class="text-subtitle-1 font-weight-bold mb-3">
              Opsi Samakan ke Cabang Lain
            </div>

            <v-row>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="applyToOtherBranches"
                  label="Terapkan ke cabang lain"
                  color="primary"
                  inset
                  hide-details
                />
              </v-col>

              <v-col v-if="applyToOtherBranches" cols="12" md="8">
                <v-autocomplete
                  v-model="target_toko_ids"
                  label="Cabang Tujuan *"
                  placeholder="Pilih cabang tujuan"
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

              <v-col v-if="applyToOtherBranches" cols="12">
                <v-alert type="warning" rounded="lg">
                  Sistem akan menerapkan data counter ini ke cabang tujuan. Jika
                  kode sudah ada, data akan diperbarui. Jika belum ada, data
                  akan dibuat baru.
                </v-alert>
              </v-col>
            </v-row>

            <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
              <v-btn
                variant="outlined"
                color="secondary"
                :to="'/master/antrian-counter'"
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
                Update Counter
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </template>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import referenceService from "@/services/referenceService";
import masterAntrianCounterService from "@/services/master/masterAntrianCounterService";

export default {
  name: "EditAntrianCounter",

  data() {
    return {
      isValid: false,
      loadingPage: false,
      loadingSave: false,
      loadingToko: false,

      applyToOtherBranches: false,
      target_toko_ids: [],

      breadcrumbs: [
        { title: "Master", disabled: true },
        {
          title: "Counter Antrian",
          disabled: false,
          to: "/master/antrian-counter",
        },
        { title: "Edit Counter Antrian", disabled: true },
      ],

      tokoOptions: [],

      form: {
        toko_id: null,
        kode: "",
        nama: "",
        keterangan: "",
        is_active: true,
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
          !this.applyToOtherBranches ||
          (Array.isArray(v) && v.length > 0) ||
          "Pilih minimal 1 cabang",
      },
    };
  },

  computed: {
    counterId() {
      return this.$route.params.id;
    },

    targetTokoOptions() {
      return this.tokoOptions.filter((item) => {
        return Number(item.value) !== Number(this.form.toko_id);
      });
    },

    payload() {
      return {
        toko_id: this.form.toko_id,
        kode: this.cleanValue(this.form.kode)?.toUpperCase(),
        nama: this.cleanValue(this.form.nama),
        keterangan: this.cleanValue(this.form.keterangan),
        is_active: Boolean(this.form.is_active),
      };
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    async initPage() {
      this.loadingPage = true;

      try {
        await Promise.all([this.fetchToko(), this.fetchDetail()]);
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data counter antrian"),
          "error",
        );
      } finally {
        this.loadingPage = false;
      }
    },

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
      } finally {
        this.loadingToko = false;
      }
    },

    async fetchDetail() {
      const response = await masterAntrianCounterService.getById(
        this.counterId,
      );

      const detail = response?.data || response;

      if (!detail?.id) {
        this.showSnackbar("Data counter antrian tidak ditemukan", "error");
        this.$router.replace("/master/antrian-counter");
        return;
      }

      this.form = {
        toko_id: detail.toko_id || null,
        kode: detail.kode || "",
        nama: detail.nama || "",
        keterangan: detail.keterangan || "",
        is_active: Boolean(detail.is_active),
      };
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      this.loadingSave = true;

      try {
        await masterAntrianCounterService.update(this.counterId, this.payload);

        if (this.applyToOtherBranches) {
          await this.applyToBranches();
        }

        this.showSnackbar("Counter antrian berhasil diperbarui", "success");

        this.$router.replace("/master/antrian-counter");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memperbarui counter antrian"),
          "error",
        );
      } finally {
        this.loadingSave = false;
      }
    },

    async applyToBranches() {
      for (const targetTokoId of this.target_toko_ids) {
        await masterAntrianCounterService.syncFromBranch({
          source_toko_id: this.form.toko_id,
          target_toko_ids: [targetTokoId],
        });
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

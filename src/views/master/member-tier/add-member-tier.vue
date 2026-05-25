<template>
  <div>
    <div class="page-header mb-4">
      <div>
        <h1 class="page-title">Tambah Member Tier</h1>
        <div class="page-subtitle">
          Tambahkan aturan tier member berdasarkan nilai transaksi pelanggan.
        </div>
      </div>

      <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mt-2" />
    </div>

    <v-card class="master-card" elevation="1">
      <v-card-text>
        <v-form ref="formRef" v-model="isValid" @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode"
                label="Kode Tier"
                placeholder="Contoh: SILVER"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                :error-messages="errors.kode"
                hide-details="auto"
                @input="clearError('kode')"
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.nama"
                label="Nama Tier"
                placeholder="Contoh: Silver Member"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                :error-messages="errors.nama"
                hide-details="auto"
                @input="clearError('nama')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.minimal_spending"
                label="Minimal Spending"
                placeholder="Contoh: 1000000"
                variant="outlined"
                density="compact"
                type="number"
                min="0"
                prefix="Rp"
                :rules="[rules.required, rules.nonNegative]"
                :error-messages="errors.minimal_spending"
                hide-details="auto"
                @input="clearError('minimal_spending')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.diskon_persen"
                label="Diskon Persen"
                placeholder="Contoh: 5"
                variant="outlined"
                density="compact"
                type="number"
                min="0"
                max="100"
                suffix="%"
                :rules="[rules.required, rules.percent]"
                :error-messages="errors.diskon_persen"
                hide-details="auto"
                @input="clearError('diskon_persen')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.point_rate"
                label="Point Rate"
                placeholder="Contoh: 0.0100"
                variant="outlined"
                density="compact"
                type="number"
                min="0"
                step="0.0001"
                :rules="[rules.required, rules.nonNegative]"
                :error-messages="errors.point_rate"
                hide-details="auto"
                @input="clearError('point_rate')"
              >
                <template #append-inner>
                  <v-tooltip text="Contoh: 0.01 berarti 1 poin per Rp100">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" size="18"
                        >mdi-information-outline</v-icon
                      >
                    </template>
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="form.sort_order"
                label="Urutan"
                placeholder="1"
                variant="outlined"
                density="compact"
                type="number"
                min="0"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-switch
                v-model="form.is_active"
                label="Status Aktif"
                color="success"
                inset
                hide-details
              />
            </v-col>
          </v-row>

          <v-alert type="info" variant="tonal" density="compact" class="mt-2">
            Tier biasanya dihitung dari total spending pelanggan. Pastikan
            minimal spending antar tier tidak tumpang tindih.
          </v-alert>

          <v-divider class="my-5" />

          <div class="d-flex justify-end ga-2">
            <v-btn
              variant="tonal"
              color="grey"
              @click="$router.push('/master/member-tier')"
            >
              Kembali
            </v-btn>

            <v-btn
              color="success"
              type="submit"
              prepend-icon="mdi-content-save"
              :loading="saving"
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
import memberTierService from "@/services/master/memberTierService";

export default {
  name: "AddMemberTier",

  data() {
    return {
      isValid: false,
      saving: false,

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Member Tier", disabled: false, to: "/master/member-tier" },
        { title: "Tambah", disabled: true },
      ],

      form: {
        kode: "",
        nama: "",
        minimal_spending: 0,
        diskon_persen: 0,
        point_rate: 0,
        sort_order: 0,
        is_active: true,
      },

      errors: {},

      rules: {
        required: (value) =>
          (value !== null && value !== undefined && value !== "") ||
          "Field wajib diisi",
        nonNegative: (value) =>
          Number(value) >= 0 || "Nilai tidak boleh kurang dari 0",
        percent: (value) => {
          const numberValue = Number(value);
          return (
            (numberValue >= 0 && numberValue <= 100) ||
            "Diskon harus 0 sampai 100"
          );
        },
      },

      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },

  methods: {
    async submitForm() {
      const validation = await this.$refs.formRef.validate();
      if (!validation.valid) return;

      this.saving = true;
      this.errors = {};

      try {
        const payload = this.buildPayload();
        const response = await memberTierService.create(payload);

        this.showSnackbar(
          response.message || "Member tier berhasil ditambahkan",
        );
        setTimeout(() => {
          this.$router.push("/master/member-tier");
        }, 500);
      } catch (error) {
        this.handleError(error, "Gagal menyimpan member tier");
      } finally {
        this.saving = false;
      }
    },

    buildPayload() {
      return {
        kode: String(this.form.kode || "")
          .trim()
          .toUpperCase(),
        nama: String(this.form.nama || "").trim(),
        minimal_spending: Number(this.form.minimal_spending || 0),
        diskon_persen: Number(this.form.diskon_persen || 0),
        point_rate: Number(this.form.point_rate || 0),
        sort_order: Number(this.form.sort_order || 0),
        is_active: this.form.is_active ? 1 : 0,
      };
    },

    clearError(field) {
      if (this.errors[field]) {
        this.errors[field] = [];
      }
    },

    handleError(error, fallbackMessage) {
      const response = error?.response?.data;

      if (response?.errors) {
        this.errors = response.errors;
      }

      this.showSnackbar(response?.message || fallbackMessage, "error");
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

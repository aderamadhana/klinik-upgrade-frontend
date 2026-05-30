<template>
  <div>
    <div class="page-header mb-4">
      <div>
        <h1 class="page-title">Tambah Poin Rule</h1>
        <div class="page-subtitle">
          Tambahkan aturan nominal transaksi untuk menghasilkan poin.
        </div>
      </div>

      <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mt-2" />
    </div>

    <v-card class="master-card" elevation="1">
      <v-card-text>
        <v-form ref="formRef" v-model="isValid" @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.nama_rule"
                label="Nama Rule"
                placeholder="Contoh: Poin Transaksi Reguler"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                :error-messages="errors.nama_rule"
                hide-details="auto"
                @input="clearError('nama_rule')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.nominal_per_poin"
                label="Nominal per Poin"
                placeholder="Contoh: 100000"
                variant="outlined"
                density="compact"
                type="number"
                min="0"
                prefix="Rp"
                :rules="[rules.required, rules.nonNegative]"
                :error-messages="errors.nominal_per_poin"
                hide-details="auto"
                @input="clearError('nominal_per_poin')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.minimal_transaksi"
                label="Minimal Transaksi"
                placeholder="Contoh: 100000"
                variant="outlined"
                density="compact"
                type="number"
                min="0"
                prefix="Rp"
                :rules="[rules.required, rules.nonNegative]"
                :error-messages="errors.minimal_transaksi"
                hide-details="auto"
                @input="clearError('minimal_transaksi')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.berlaku_mulai"
                label="Berlaku Mulai"
                variant="outlined"
                density="compact"
                type="date"
                :error-messages="errors.berlaku_mulai"
                hide-details="auto"
                @input="clearError('berlaku_mulai')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.berlaku_sampai"
                label="Berlaku Sampai"
                variant="outlined"
                density="compact"
                type="date"
                :error-messages="errors.berlaku_sampai"
                hide-details="auto"
                @input="clearError('berlaku_sampai')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="form.is_berlaku_kelipatan"
                label="Berlaku Kelipatan"
                color="primary"
                inset
                hide-details
              />
              <div class="text-caption text-medium-emphasis mt-1">
                Jika aktif, transaksi Rp250.000 dengan nominal Rp100.000 per
                poin menghasilkan 2 poin.
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="form.is_active"
                label="Status Aktif"
                color="success"
                inset
                hide-details
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.keterangan"
                label="Keterangan"
                placeholder="Catatan tambahan aturan poin"
                variant="outlined"
                density="compact"
                rows="3"
                auto-grow
                :error-messages="errors.keterangan"
                hide-details="auto"
                @input="clearError('keterangan')"
              />
            </v-col>
          </v-row>

          <v-alert type="info" density="compact" class="mt-2">
            Rule aktif sebaiknya tidak dibuat tumpang tindih pada periode yang
            sama agar perhitungan poin tidak ambigu.
          </v-alert>

          <v-divider class="my-5" />

          <div class="d-flex justify-end ga-2">
            <v-btn color="grey" @click="$router.push('/master/poin-rule')">
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
import poinRuleService from "@/services/master/poinRuleService";

export default {
  name: "AddPoinRule",

  data() {
    return {
      isValid: false,
      saving: false,
      errors: {},

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Poin Rule", disabled: false, to: "/master/poin-rule" },
        { title: "Tambah", disabled: true },
      ],

      form: {
        nama_rule: "",
        nominal_per_poin: 100000,
        minimal_transaksi: 100000,
        berlaku_mulai: "",
        berlaku_sampai: "",
        is_berlaku_kelipatan: true,
        is_active: true,
        keterangan: "",
      },

      rules: {
        required: (value) =>
          (value !== null && value !== undefined && value !== "") ||
          "Field wajib diisi",
        nonNegative: (value) =>
          Number(value) >= 0 || "Nilai tidak boleh kurang dari 0",
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
        const response = await poinRuleService.create(this.buildPayload());

        this.showSnackbar(response.message || "Poin rule berhasil ditambahkan");
        setTimeout(() => {
          this.$router.push("/master/poin-rule");
        }, 500);
      } catch (error) {
        this.handleError(error, "Gagal menyimpan poin rule");
      } finally {
        this.saving = false;
      }
    },

    buildPayload() {
      return {
        nama_rule: String(this.form.nama_rule || "").trim(),
        nominal_per_poin: Number(this.form.nominal_per_poin || 0),
        minimal_transaksi: Number(this.form.minimal_transaksi || 0),
        berlaku_mulai: this.form.berlaku_mulai || null,
        berlaku_sampai: this.form.berlaku_sampai || null,
        is_berlaku_kelipatan: this.form.is_berlaku_kelipatan ? 1 : 0,
        is_active: this.form.is_active ? 1 : 0,
        keterangan: this.form.keterangan || null,
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

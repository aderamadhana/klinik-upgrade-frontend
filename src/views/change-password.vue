<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Change Password</h1>
        <p class="page-subtitle">
          Ubah password akun login untuk menjaga keamanan akses sistem
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="successMessage"
      type="success"
      class="mb-4"
      closable
      @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

    <v-card elevation="1">
      <v-card-title class="text-h6 font-weight-bold">
        Form Change Password
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-form
          ref="formRef"
          v-model="isValid"
          validate-on="submit lazy"
          @submit.prevent="submitForm"
        >
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.current_password"
                label="Password Lama *"
                :type="showCurrentPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="
                  showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'
                "
                :rules="[rules.required]"
                placeholder="Masukkan password lama"
                @click:append-inner="showCurrentPassword = !showCurrentPassword"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.new_password"
                label="Password Baru *"
                :type="showNewPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-reset"
                :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="[rules.required, rules.passwordMin]"
                placeholder="Minimal 6 karakter"
                @click:append-inner="showNewPassword = !showNewPassword"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.new_password_confirmation"
                label="Konfirmasi Password Baru *"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-check-outline"
                :append-inner-icon="
                  showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'
                "
                :rules="[rules.required, rules.passwordMatch]"
                placeholder="Ulangi password baru"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              />
            </v-col>
          </v-row>

          <v-alert type="info" class="mt-2">
            Setelah password berhasil diubah, status wajib ganti password akan
            dinonaktifkan.
          </v-alert>
        </v-form>
      </v-card-text>
    </v-card>

    <div class="d-flex justify-end ga-3 mt-6">
      <v-btn
        color="secondary"
        variant="outlined"
        :disabled="loading"
        :to="'/dashboard'"
      >
        Batal
      </v-btn>

      <v-btn
        color="success"
        variant="flat"
        prepend-icon="mdi-content-save"
        :loading="loading"
        :disabled="loading"
        @click="submitForm"
      >
        Simpan Password
      </v-btn>
    </div>
  </div>
</template>

<script>
import authService from "@/services/authService";

export default {
  name: "ChangePassword",

  data() {
    return {
      isValid: false,
      loading: false,

      errorMessage: "",
      successMessage: "",

      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,

      breadcrumbs: [
        { title: "Dashboard", disabled: false, to: "/dashboard" },
        { title: "Change Password", disabled: true },
      ],

      form: {
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      },

      rules: {
        required: (v) => !!String(v ?? "").trim() || "Field ini wajib diisi",
        passwordMin: (v) =>
          String(v ?? "").length >= 6 || "Password minimal 6 karakter",
        passwordMatch: (v) =>
          v === this.form.new_password || "Konfirmasi password tidak sama",
      },
    };
  },

  methods: {
    async submitForm() {
      this.errorMessage = "";
      this.successMessage = "";

      const result = await this.$refs.formRef.validate();

      if (!result.valid) return;

      if (this.form.current_password === this.form.new_password) {
        this.errorMessage =
          "Password baru tidak boleh sama dengan password lama.";
        return;
      }

      this.loading = true;

      try {
        await authService.changePassword({
          current_password: this.form.current_password,
          new_password: this.form.new_password,
          new_password_confirmation: this.form.new_password_confirmation,
        });

        this.successMessage = "Password berhasil diubah.";

        const user = this.getLocalUser();

        if (user) {
          user.must_change_password = 0;
          localStorage.setItem("user", JSON.stringify(user));
        }

        this.resetForm();

        setTimeout(() => {
          this.$router.replace("/dashboard");
        }, 600);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengubah password.",
        );
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      };

      this.$nextTick(() => {
        this.$refs.formRef?.resetValidation();
      });
    },

    getLocalUser() {
      try {
        const user = localStorage.getItem("user");

        if (!user) return null;

        return JSON.parse(user);
      } catch (error) {
        return null;
      }
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

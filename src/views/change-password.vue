<template>
  <v-container fluid class="fill-height bg-grey-lighten-4 pa-4 pa-sm-6">
    <v-row justify="center" align="center" class="ma-0">
      <v-col cols="12" sm="10" md="7" lg="5" xl="4">
        <v-card rounded="lg" elevation="4">
          <v-card-text class="pa-6 pa-sm-8">
            <div class="d-flex align-start ga-4 mb-6">
              <v-avatar color="primary" variant="tonal" size="56">
                <v-icon icon="mdi-lock-reset" size="30" />
              </v-avatar>

              <div>
                <div class="text-h5 font-weight-bold mb-1">Ganti Password</div>
                <div class="text-body-2 text-medium-emphasis">
                  Gunakan password baru untuk melindungi akses akun Anda.
                </div>
              </div>
            </div>

            <v-alert
              v-if="isForcedPasswordChange"
              type="warning"
              variant="tonal"
              density="comfortable"
              icon="mdi-alert-circle-outline"
              class="mb-5"
            >
              Password harus diganti sebelum Anda dapat mengakses sistem.
            </v-alert>

            <v-sheet
              v-if="localUser"
              color="grey-lighten-4"
              rounded="lg"
              class="pa-4 mb-5"
            >
              <div class="text-caption text-medium-emphasis mb-1">
                Akun yang sedang digunakan
              </div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ displayName }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ localUser.username || "-" }}
              </div>
            </v-sheet>

            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              density="comfortable"
              closable
              class="mb-5"
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>

            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              density="comfortable"
              class="mb-5"
            >
              {{ successMessage }}
            </v-alert>

            <v-form
              ref="formRef"
              v-model="isValid"
              validate-on="submit lazy"
              @submit.prevent="submitForm"
            >
              <v-text-field
                v-model="form.current_password"
                label="Password Lama"
                :type="showCurrentPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="
                  showCurrentPassword
                    ? 'mdi-eye-off-outline'
                    : 'mdi-eye-outline'
                "
                :rules="[rules.required]"
                :disabled="loading"
                autocomplete="current-password"
                class="mb-2"
                @click:append-inner="showCurrentPassword = !showCurrentPassword"
              />

              <v-text-field
                v-model="form.new_password"
                label="Password Baru"
                :type="showNewPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-reset"
                :append-inner-icon="
                  showNewPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                :rules="[
                  rules.required,
                  rules.passwordMin,
                  rules.passwordDifferent,
                ]"
                :disabled="loading"
                autocomplete="new-password"
                hint="Minimal 6 karakter dan tidak boleh sama dengan password lama."
                persistent-hint
                class="mb-2"
                @click:append-inner="showNewPassword = !showNewPassword"
              />

              <v-text-field
                v-model="form.new_password_confirmation"
                label="Konfirmasi Password Baru"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-check-outline"
                :append-inner-icon="
                  showConfirmPassword
                    ? 'mdi-eye-off-outline'
                    : 'mdi-eye-outline'
                "
                :rules="[rules.required, rules.passwordMatch]"
                :disabled="loading"
                autocomplete="new-password"
                class="mb-4"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              />

              <v-divider class="mb-5" />

              <div class="d-flex flex-column flex-sm-row ga-3">
                <v-btn
                  v-if="isForcedPasswordChange"
                  variant="outlined"
                  color="secondary"
                  prepend-icon="mdi-logout"
                  :disabled="loading"
                  @click="logout"
                >
                  Keluar
                </v-btn>

                <v-btn
                  v-else
                  variant="outlined"
                  color="secondary"
                  :disabled="loading"
                  @click="$router.replace('/dashboard')"
                >
                  Batal
                </v-btn>

                <v-spacer />

                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-content-save-check-outline"
                  :loading="loading"
                  :disabled="loading"
                >
                  Simpan Password
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
      localUser: null,
      redirectTimer: null,
      form: {
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      },
      rules: {
        required: (value) =>
          !!String(value ?? "").trim() || "Field ini wajib diisi.",
        passwordMin: (value) =>
          String(value ?? "").length >= 6 ||
          "Password baru minimal 6 karakter.",
        passwordDifferent: (value) =>
          !value ||
          value !== this.form.current_password ||
          "Password baru tidak boleh sama dengan password lama.",
        passwordMatch: (value) =>
          value === this.form.new_password ||
          "Konfirmasi password baru tidak sama.",
      },
    };
  },

  computed: {
    isForcedPasswordChange() {
      const storageFlag = Number(
        localStorage.getItem("must_change_password") || 0,
      );
      const userFlag = Number(this.localUser?.must_change_password || 0);

      return storageFlag === 1 || userFlag === 1;
    },

    displayName() {
      return (
        this.localUser?.display_name ||
        this.localUser?.nama ||
        this.localUser?.username ||
        "Pengguna"
      );
    },
  },

  created() {
    this.localUser = this.getLocalUser();
  },

  beforeUnmount() {
    if (this.redirectTimer) {
      window.clearTimeout(this.redirectTimer);
    }
  },

  methods: {
    async submitForm() {
      this.errorMessage = "";
      this.successMessage = "";

      const result = await this.$refs.formRef?.validate();
      if (!result?.valid) return;

      this.loading = true;

      try {
        const response = await authService.changePassword({
          current_password: this.form.current_password,
          new_password: this.form.new_password,
          new_password_confirmation: this.form.new_password_confirmation,
        });

        if (response?.status !== true) {
          throw new Error(response?.message || "Gagal mengubah password.");
        }

        this.persistPasswordChanged();
        this.successMessage = response?.message || "Password berhasil diubah.";
        this.resetForm();

        this.redirectTimer = window.setTimeout(() => {
          this.$router.replace("/dashboard");
        }, 700);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengubah password.",
        );
      } finally {
        this.loading = false;
      }
    },

    persistPasswordChanged() {
      localStorage.setItem("must_change_password", "0");

      const user = this.getLocalUser();
      if (!user) return;

      user.must_change_password = 0;
      localStorage.setItem("user", JSON.stringify(user));
      this.localUser = user;
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

    logout() {
      authService.logout();
    },

    getLocalUser() {
      try {
        const value = localStorage.getItem("user");
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },

    getErrorMessage(error, fallbackMessage) {
      const response = error?.response?.data;

      if (response?.message) return response.message;
      if (response?.error) return response.error;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];
        const firstError = response.errors[firstKey];

        if (Array.isArray(firstError) && firstError.length) {
          return firstError[0];
        }
      }

      if (error?.message) return error.message;

      return fallbackMessage;
    },
  },
};
</script>

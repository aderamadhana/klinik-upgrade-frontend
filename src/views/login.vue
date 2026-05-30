<script>
import bg from "@/assets/login.png";
import logo from "@/assets/smart_clinic.webp";
import authService from "@/services/authService";
import { setAuthData } from "@/services/token.service";

export default {
  data() {
    return {
      bg,
      logo,
      loading: false,
      errorMessage: "",
      showPassword: false,
      form: {
        username: "",
        password: "",
      },
    };
  },

  methods: {
    async handleLogin() {
      this.errorMessage = "";

      if (!this.form.username || !this.form.password) {
        this.errorMessage = "Username dan password wajib diisi.";
        return;
      }

      this.loading = true;

      try {
        const result = await authService.login({
          username: this.form.username,
          password: this.form.password,
        });

        const responseBody = result?.data || result;
        const authData = responseBody?.data || responseBody;

        if (!authData?.access_token) {
          throw new Error("Token tidak ditemukan dari response login.");
        }

        setAuthData(responseBody);

        if (authData.user) {
          localStorage.setItem("user", JSON.stringify(authData.user));
        }

        if (authData.access) {
          localStorage.setItem("access", JSON.stringify(authData.access));
        }

        localStorage.setItem(
          "must_change_password",
          String(authData.must_change_password || 0),
        );

        if (Number(authData.must_change_password || 0) === 1) {
          this.$router.replace("/change-password");
          return;
        }

        this.$router.replace("/dashboard");
      } catch (error) {
        const status = error.response?.status;

        if (status === 401) {
          this.errorMessage = "Username atau password salah.";
        } else if (status === 422) {
          this.errorMessage = "Validasi gagal. Cek kembali input login.";
        } else {
          this.errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Gagal terhubung ke server.";
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div class="hero" :style="{ backgroundImage: `url(${bg})` }">
    <div class="left-area">
      <div class="login-wrapper">
        <div class="login-header">
          <img :src="logo" class="logo" />
          <h2 class="title text-uppercase fw-bold">Login Account</h2>
        </div>

        <v-alert
          v-if="errorMessage"
          type="error"
          density="compact"
          class="mb-5"
        >
          {{ errorMessage }}
        </v-alert>

        <v-text-field
          v-model="form.username"
          label="Email / Username"
          variant="outlined"
          prepend-inner-icon="mdi-account-outline"
          hide-details
          class="mb-6"
          :disabled="loading"
          @keyup.enter="handleLogin"
        />

        <v-text-field
          v-model="form.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="
            showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          hide-details
          class="mb-10"
          :disabled="loading"
          @click:append-inner="showPassword = !showPassword"
          @keyup.enter="handleLogin"
        />

        <v-btn
          class="login-btn mb-8"
          :loading="loading"
          :disabled="loading"
          @click="handleLogin"
        >
          Login
        </v-btn>

        <div class="login-footer">
          <div class="divider"></div>
          <p class="version">v1.6.1 - 2024-07-28</p>
          <p class="copyright">© PT KKI 2026</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  min-height: 100svh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: grid;
  grid-template-columns: 42% 58%;
}

.left-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-wrapper {
  width: 520px;
  max-width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 50px;
}

.logo {
  width: 300px;
  max-width: 100%;
}

.title {
  font-size: 26px;
  font-weight: 600;
  color: hsl(304 38% 49% / 1);
}

.login-btn {
  width: 100%;
  height: 60px;
  border-radius: 14px;
  font-weight: 600;
  background: linear-gradient(90deg, #b04ca5, #8e3f91);
  color: white;
  text-transform: none;
  letter-spacing: 0;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.15);
  margin-bottom: 18px;
}

.version {
  font-size: 13px;
  font-weight: 500;
  color: #b04ca5;
  margin-bottom: 6px;
}

.copyright {
  font-size: 12px;
  color: #777;
}

@media (max-width: 768px) {
  .hero {
    background-image: none !important;
    background-color: #f7eef6;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
  }

  .left-area {
    width: 100%;
    padding: 0;
    justify-content: center;
  }

  .login-wrapper {
    width: 100%;
    max-width: 430px;
    background: #ffffff;
    padding: 34px 24px 28px;
    border-radius: 24px;
    box-shadow: 0 16px 40px rgba(142, 63, 145, 0.16);
  }

  .login-header {
    margin-bottom: 32px;
  }

  .logo {
    width: 230px;
  }

  .title {
    font-size: 21px;
    margin-top: 8px;
  }

  .login-btn {
    height: 54px;
    border-radius: 13px;
  }

  .login-footer {
    margin-top: 24px;
  }
}

@media (max-width: 420px) {
  .hero {
    padding: 18px 12px;
  }

  .login-wrapper {
    padding: 30px 20px 24px;
    border-radius: 20px;
  }

  .logo {
    width: 210px;
  }

  .title {
    font-size: 19px;
  }
}
</style>

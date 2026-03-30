<script>
import bg from "@/assets/login.png";
import logo from "@/assets/smart_clinic.webp";

export default {
  data() {
    return {
      bg,
      logo,
      loading: false,
    };
  },

  methods: {
    async handleLogin() {
      if (this.loading) return;

      this.loading = true;

      try {
        // simulasi request API
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.$router.push("/dashboard");
        // nanti panggil API login di sini
      } catch (e) {
        console.error(e);
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

        <v-text-field
          label="Email / Username"
          variant="outlined"
          hide-details
          class="mb-6"
        />

        <v-text-field
          label="Password"
          type="password"
          variant="outlined"
          hide-details
          class="mb-10"
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
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: grid;
  grid-template-columns: 44% 56%;
}

.left-area {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-wrapper {
  width: 520px;
}

.login-header {
  text-align: center;
  margin-bottom: 50px;
}

.logo {
  width: 300px;
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
</style>

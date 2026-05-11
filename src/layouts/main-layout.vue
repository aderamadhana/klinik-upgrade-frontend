<template>
  <v-layout class="admin-layout">
    <AppSidebar
      v-model="drawer"
      :current-role-id="selectedRoleId"
      :current-role-object="selectedRoleObject"
      :current-cabang-id="selectedCabangId"
    />

    <div class="main-area">
      <AppHeader
        @toggle="drawer = !drawer"
        @role-changed="handleRoleChanged"
        @cabang-changed="handleCabangChanged"
      />

      <v-main class="content-area">
        <v-container fluid class="pa-6">
          <router-view />
        </v-container>
      </v-main>
    </div>
  </v-layout>
</template>

<script>
import AppHeader from "@/components/app-header.vue";
import AppSidebar from "@/components/app-sidebar.vue";

export default {
  name: "AdminLayout",

  components: {
    AppSidebar,
    AppHeader,
  },

  data() {
    return {
      drawer: true,

      selectedRoleId: localStorage.getItem("selected_role_id") || null,
      selectedRoleObject: this.getLocalJson("selected_role"),

      selectedCabangId: localStorage.getItem("selected_toko_id") || null,
      selectedCabangObject: this.getLocalJson("selected_toko"),
    };
  },

  methods: {
    getLocalJson(key) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },

    handleRoleChanged(payload) {
      this.selectedRoleId = payload?.role_id || payload?.id || null;
      this.selectedRoleObject = payload?.role || null;

      /**
       * Opsional tapi lebih aman:
       * kalau user sedang di halaman yang tidak tersedia untuk role baru,
       * kembalikan ke dashboard agar tidak melihat halaman yang seharusnya tersembunyi.
       */
      if (this.$route.path !== "/dashboard") {
        this.$router.replace("/dashboard");
      }
    },

    handleCabangChanged(payload) {
      this.selectedCabangId = payload?.toko_id || payload?.id || null;
      this.selectedCabangObject = payload?.cabang || null;
    },
  },
};
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
}
</style>

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

      <v-main ref="contentArea" class="content-area">
        <v-container fluid class="pa-6">
          <router-view v-slot="{ Component }">
            <component :is="Component" :key="contentReloadKey" />
          </router-view>
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

      contentVersion: 0,
    };
  },

  computed: {
    contentReloadKey() {
      return [
        this.$route.fullPath,
        this.selectedRoleId || "no-role",
        this.selectedCabangId || "no-cabang",
        this.contentVersion,
      ].join("-");
    },
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

    reloadCurrentContent() {
      this.contentVersion += 1;

      this.$nextTick(() => {
        const contentEl = this.$refs.contentArea?.$el;

        if (contentEl) {
          contentEl.scrollTop = 0;
        }
      });
    },

    handleRoleChanged(payload) {
      const roleId = payload?.role_id || payload?.id || null;
      const roleObject = payload?.role || null;

      this.selectedRoleId = roleId ? String(roleId) : null;
      this.selectedRoleObject = roleObject;

      if (payload?.is_initial) {
        return;
      }

      if (this.$route.path !== "/dashboard") {
        this.$router.replace("/dashboard");
      } else {
        this.reloadCurrentContent();
      }
    },

    handleCabangChanged(payload) {
      const cabangId = payload?.toko_id || payload?.id || null;
      const cabangObject = payload?.cabang || null;

      this.selectedCabangId = cabangId ? String(cabangId) : null;
      this.selectedCabangObject = cabangObject;

      if (payload?.is_initial) {
        return;
      }

      this.reloadCurrentContent();
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

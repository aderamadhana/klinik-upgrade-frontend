<template>
  <v-layout class="admin-layout">
    <AppSidebar v-model="drawer" :current-role="selectedRole" />

    <div class="main-area">
      <AppHeader
        @toggle="drawer = !drawer"
        @update:role="selectedRole = $event"
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
  components: { AppSidebar, AppHeader },
  data() {
    return {
      drawer: true,
      selectedRole: "administrator",
    };
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

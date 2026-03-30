<template>
  <v-layout class="admin-layout">
    <!-- SIDEBAR -->
    <AppSidebar v-model="drawer" />

    <!-- HEADER + CONTENT -->
    <div class="main-area">
      <AppHeader @toggle="drawer = !drawer" />

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
  components: { AppSidebar, AppHeader },
  data() {
    return { drawer: true };
  },
};
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-area {
  background: #f8fafc;
  min-height: 100vh;
}
</style>

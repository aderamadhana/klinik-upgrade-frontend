<template>
  <v-app-bar app flat height="60" class="admin-header">
    <!-- TOGGLE -->
    <v-app-bar-nav-icon @click="$emit('toggle')" class="mr-2" />

    <!-- NAMA KLINIK -->
    <div class="clinic-name">KLINIK JAKARTA SELATAN</div>

    <v-spacer />

    <!-- USER AREA -->
    <v-menu location="bottom end" transition="fade-transition" :offset="[8, 0]">
      <template #activator="{ props }">
        <div v-bind="props" class="user-trigger">
          <v-avatar color="lime" size="30" class="user-avatar">
            <span class="avatar-text">IJ</span>
          </v-avatar>
          <span class="user-name">IT JKS</span>
          <v-icon size="16" class="chevron-icon">mdi-chevron-down</v-icon>
        </div>
      </template>

      <v-card class="user-menu" elevation="0">
        <v-list density="compact" class="menu-list">
          <v-list-item
            class="menu-item"
            @click="goChangePassword"
            min-height="36"
          >
            <template #prepend>
              <v-icon size="15" class="menu-icon">mdi-key-outline</v-icon>
            </template>
            <v-list-item-title class="menu-label"
              >Change Password</v-list-item-title
            >
          </v-list-item>

          <v-divider class="menu-divider" />

          <v-list-item
            class="menu-item logout-item"
            @click="logout"
            min-height="36"
          >
            <template #prepend>
              <v-icon size="15" class="menu-icon">mdi-logout</v-icon>
            </template>
            <v-list-item-title class="menu-label">Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script>
export default {
  emits: ["toggle"],
  methods: {
    goChangePassword() {
      this.$router.push("/change-password");
    },
    logout() {
      // handle logout
    },
  },
};
</script>

<style scoped>
.admin-header {
  background: #ffffff !important;
  border-bottom: 1px solid #e5e7eb !important;
}

.clinic-name {
  font-size: 13.5px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.3px;
}

/* === USER TRIGGER === */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  padding: 5px 10px 5px 6px;
  border-radius: 8px;
  margin-right: 8px;
  transition: background 0.15s ease;
}

.user-trigger:hover {
  background: #f3f4f6;
}

.user-avatar {
  font-size: 11px !important;
  font-weight: 700;
}

.avatar-text {
  font-size: 11px;
  font-weight: 700;
  color: #374151;
}

.user-name {
  font-size: 13.5px;
  font-weight: 500;
  color: #374151;
}

.chevron-icon {
  color: #9ca3af;
}

/* === DROPDOWN MENU === */
.user-menu {
  min-width: 195px !important;
  max-width: 210px !important;
  border-radius: 10px !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
  overflow: hidden;
}

.menu-list {
  padding: 4px !important;
}

.menu-divider {
  margin: 3px 6px !important;
  border-color: #f3f4f6 !important;
}

.menu-item {
  border-radius: 6px !important;
  padding: 0 8px !important;
  transition: background 0.12s ease !important;
}

.menu-item:hover {
  background: #f3f4f6 !important;
}

.logout-item:hover {
  background: #fef2f2 !important;
}

.logout-item:hover .menu-icon,
.logout-item:hover .menu-label {
  color: #ef4444 !important;
}

.menu-icon {
  color: #6b7280;
  margin-right: 4px !important;
  min-width: unset !important;
}

.menu-item :deep(.v-list-item__prepend) {
  width: auto !important;
  margin-right: 0 !important;
}

.menu-item :deep(.v-list-item__prepend .v-icon) {
  margin-inline-end: -20px !important;
}

.menu-label {
  font-size: 13px !important;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}
</style>

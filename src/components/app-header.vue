<template>
  <v-app-bar app flat height="60" class="admin-header">
    <v-app-bar-nav-icon @click="$emit('toggle')" class="mr-2" />

    <div class="clinic-name">{{ currentClinicName }}</div>

    <v-spacer />

    <div class="header-filters">
      <v-select
        v-model="selectedCabang"
        :items="cabangOptions"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        menu-icon="mdi-chevron-down"
        class="filter-select"
        @update:model-value="onCabangChange"
      />

      <v-select
        v-model="selectedRole"
        :items="roleOptions"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        menu-icon="mdi-chevron-down"
        class="filter-select"
        @update:model-value="onRoleChange"
      />
    </div>

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
            <v-list-item-title class="menu-label">
              Change Password
            </v-list-item-title>
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
  name: "AppHeader",
  emits: ["toggle", "update:cabang", "update:role"],
  data() {
    return {
      selectedCabang: "jakarta_selatan",
      selectedRole: "administrator",
      cabangOptions: [
        { title: "All Cabang Klinik", value: "all" },
        { title: "Malang", value: "malang" },
        { title: "Surabaya", value: "surabaya" },
        { title: "Bandung", value: "bandung" },
        { title: "Sidoarjo", value: "sidoarjo" },
        { title: "Bekasi", value: "bekasi" },
        { title: "Medan", value: "medan" },
        { title: "Depok", value: "depok" },
        { title: "Yogyakarta", value: "yogyakarta" },
        { title: "Jakarta Selatan", value: "jakarta_selatan" },
        { title: "Management", value: "management" },
        { title: "Glow Central", value: "glow_central" },
      ],
      roleOptions: [
        { title: "All Role", value: "all" },
        { title: "Administrator", value: "administrator" },
        { title: "Dokter", value: "dokter" },
        { title: "Front Office", value: "front office" },
        { title: "Apoteker", value: "apoteker" },
        { title: "Branch Accounting", value: "branch accounting" },
        { title: "Security", value: "security" },
        { title: "Sudo", value: "sudo" },
        { title: "SP", value: "sp" },
        { title: "IT", value: "it" },
        { title: "Management", value: "management" },
      ],
    };
  },
  computed: {
    currentClinicName() {
      const cabang = this.cabangOptions.find(
        (item) => item.value === this.selectedCabang,
      );

      if (!cabang) return "KLINIK";
      if (this.selectedCabang === "all") return "SEMUA CABANG KLINIK";

      return cabang.title.toUpperCase();
    },
  },
  mounted() {
    this.$emit("update:cabang", this.selectedCabang);
    this.$emit("update:role", this.selectedRole);
  },
  methods: {
    onCabangChange(value) {
      this.$emit("update:cabang", value);
    },
    onRoleChange(value) {
      this.$emit("update:role", value);
    },
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
  padding: 0 10px;
}

.clinic-name {
  font-size: 13.5px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.header-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 12px;
}

.filter-select {
  width: 190px;
}

.filter-select :deep(.v-field) {
  min-height: 38px !important;
  border-radius: 10px !important;
  background: #ffffff !important;
  box-shadow: none !important;
}

.filter-select :deep(.v-field__outline) {
  color: #d1d5db !important;
}

.filter-select :deep(.v-field__input) {
  min-height: 38px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  font-size: 13px !important;
  font-weight: 500;
  color: #374151 !important;
}

.filter-select :deep(.v-select__selection-text) {
  font-size: 13px !important;
  font-weight: 500;
  color: #374151 !important;
}

.filter-select :deep(.v-field__append-inner .v-icon) {
  color: #9ca3af !important;
  opacity: 1 !important;
  font-size: 18px !important;
}

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

@media (max-width: 1100px) {
  .clinic-name {
    display: none;
  }

  .filter-select {
    width: 160px;
  }
}

@media (max-width: 768px) {
  .header-filters {
    gap: 8px;
    margin-right: 8px;
  }

  .filter-select {
    width: 140px;
  }

  .user-name {
    display: none;
  }
}
</style>

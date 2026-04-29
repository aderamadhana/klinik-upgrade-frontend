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
            <span class="avatar-text">{{ avatarInitial }}</span>
          </v-avatar>

          <span class="user-name">{{ headerUserName }}</span>

          <v-icon size="16" class="chevron-icon">mdi-chevron-down</v-icon>
        </div>
      </template>

      <v-card class="user-menu" elevation="0">
        <v-list density="compact" class="menu-list">
          <v-list-item class="menu-item" @click="goChangePassword">
            <template #prepend>
              <v-icon size="15" class="menu-icon">mdi-key-outline</v-icon>
            </template>

            <v-list-item-title class="menu-label">
              Change Password
            </v-list-item-title>
          </v-list-item>

          <v-divider class="menu-divider" />

          <v-list-item class="menu-item logout-item" @click="handleLogout">
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
      user: null,
      access: null,

      selectedCabang: null,
      selectedRole: null,

      cabangOptions: [],
      roleOptions: [],
    };
  },

  computed: {
    currentClinicName() {
      const cabang = this.cabangOptions.find(
        (item) => String(item.value) === String(this.selectedCabang),
      );

      if (!cabang) return "KLINIK";

      return String(cabang.title || "KLINIK").toUpperCase();
    },

    headerUserName() {
      const userName =
        this.user?.display_name ||
        this.user?.nama ||
        this.user?.username ||
        "User";

      const selectedRole = this.roleOptions.find(
        (item) => String(item.value) === String(this.selectedRole),
      );

      const roleName = selectedRole?.title || this.user?.role_name || "";

      if (!roleName) return userName;

      return `${userName}`;
    },

    avatarInitial() {
      const name =
        this.user?.display_name ||
        this.user?.nama ||
        this.user?.username ||
        "U";

      const words = String(name).trim().split(/\s+/).filter(Boolean);

      if (!words.length) return "U";

      if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      }

      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    },
  },

  mounted() {
    this.initHeader();
  },

  methods: {
    initHeader() {
      this.user = this.getLocalJson("user");
      console.log(localStorage.getItem("access"));
      this.access = this.getLocalJson("access");
      this.setRoleOptions();
      this.setCabangOptions();
      this.setDefaultSelection();

      this.emitCurrentAccess();
    },

    getLocalJson(key) {
      try {
        const value = localStorage.getItem(key);

        if (!value) return null;

        return JSON.parse(value);
      } catch (error) {
        return null;
      }
    },

    setRoleOptions() {
      const roles = Array.isArray(this.access?.roles) ? this.access.roles : [];

      this.roleOptions = roles
        .map((item) => ({
          title:
            item.role_name ||
            item.nama_role ||
            item.nama ||
            item.name ||
            item.kode_role ||
            "-",
          value: item.role_id || item.id,
          raw: item,
        }))
        .filter((item) => item.value && item.title !== "-");

      if (!this.roleOptions.length && this.user?.role_id) {
        this.roleOptions = [
          {
            title: this.user.role_name || "Role",
            value: this.user.role_id,
            raw: this.user,
          },
        ];
      }
    },

    setCabangOptions() {
      const penempatan = Array.isArray(this.access?.penempatan)
        ? this.access.penempatan
        : [];
      console.log(this.access);

      this.cabangOptions = penempatan
        .map((item) => ({
          title:
            item.nama_toko ||
            item.toko?.nama_toko ||
            item.toko?.nama ||
            item.nama ||
            "-",
          value: item.toko_id || item.id,
          is_primary: Number(item.is_primary || 0) === 1,
          raw: item,
        }))
        .filter((item) => item.value && item.title !== "-");

      if (!this.cabangOptions.length && this.access?.primary_toko) {
        const toko = this.access.primary_toko;

        this.cabangOptions = [
          {
            title: toko.nama_toko || toko.nama || "KLINIK",
            value: toko.toko_id || toko.id,
            is_primary: true,
            raw: toko,
          },
        ];
      }
    },

    setDefaultSelection() {
      const savedCabang = localStorage.getItem("selected_toko_id");
      const savedRole = localStorage.getItem("selected_role_id");

      const primaryCabang =
        this.cabangOptions.find((item) => item.is_primary) ||
        this.cabangOptions[0] ||
        null;

      const defaultRole =
        this.roleOptions.find(
          (item) => String(item.value) === String(this.user?.role_id),
        ) ||
        this.roleOptions[0] ||
        null;

      const savedCabangExists = this.cabangOptions.some(
        (item) => String(item.value) === String(savedCabang),
      );

      const savedRoleExists = this.roleOptions.some(
        (item) => String(item.value) === String(savedRole),
      );

      this.selectedCabang = savedCabangExists
        ? Number(savedCabang)
        : primaryCabang?.value || null;

      this.selectedRole = savedRoleExists
        ? Number(savedRole)
        : defaultRole?.value || null;

      if (this.selectedCabang) {
        localStorage.setItem("selected_toko_id", this.selectedCabang);
      }

      if (this.selectedRole) {
        localStorage.setItem("selected_role_id", this.selectedRole);
      }
    },

    emitCurrentAccess() {
      this.$emit("update:cabang", this.selectedCabang);
      this.$emit("update:role", this.selectedRole);
    },

    onCabangChange(value) {
      const selected = this.cabangOptions.find(
        (item) => String(item.value) === String(value),
      );

      localStorage.setItem("selected_toko_id", value);

      if (selected) {
        localStorage.setItem("selected_toko", JSON.stringify(selected.raw));
      }

      this.$emit("update:cabang", value);
    },

    onRoleChange(value) {
      const selected = this.roleOptions.find(
        (item) => String(item.value) === String(value),
      );

      localStorage.setItem("selected_role_id", value);

      if (selected) {
        localStorage.setItem("selected_role", JSON.stringify(selected.raw));
      }

      this.$emit("update:role", value);
    },

    goChangePassword() {
      this.$router.push("/dashboard/change-password");
    },

    handleLogout() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("access");
      localStorage.removeItem("selected_toko_id");
      localStorage.removeItem("selected_toko");
      localStorage.removeItem("selected_role_id");
      localStorage.removeItem("selected_role");

      this.$router.replace("/login");
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

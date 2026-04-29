<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master User</h1>
        <p class="page-subtitle">
          Kelola data user, role, dan cabang user klinik
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            color="success"
            prepend-icon="mdi-plus"
            :to="'/master/user/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari nama, username, cabang, role..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 320px"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="user"
          :search="search"
          :loading="loading"
          item-value="id"
          density="compact"
        >
          <template #item.role="{ item }">
            <v-chip
              size="small"
              :color="getRoleColor(item.role)"
              variant="tonal"
            >
              {{ item.role }}
            </v-chip>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-pencil"
                :to="`/master/user/edit/${item.id}`"
              >
                Edit
              </v-btn>

              <v-btn
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete"
                @click="confirmDelete(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-6 text-medium-emphasis">
              Data user tidak ditemukan
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Konfirmasi Hapus
        </v-card-title>

        <v-divider />

        <v-card-text>
          Yakin ingin menghapus user
          <strong>{{ selectedUser?.nama }}</strong
          >?
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="deleteDialog = false"
          >
            Batal
          </v-btn>

          <v-btn color="error" @click="deleteUser"> Hapus </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import userService from "@/services/master/userService";

export default {
  name: "AllUser",

  data() {
    return {
      search: "",
      loading: false,
      loadingDelete: false,
      deleteDialog: false,
      selectedUser: null,

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "User", disabled: false, to: "/master/user" },
      ],

      headers: [
        { title: "Nama", key: "nama" },
        { title: "Username", key: "username" },
        { title: "Cabang", key: "cabang" },
        { title: "Role", key: "role" },
        { title: "Action", key: "action", sortable: false, width: "220px" },
      ],

      user: [],
    };
  },

  mounted() {
    this.fetchUser();
  },

  methods: {
    async fetchUser() {
      this.loading = true;

      try {
        const result = await userService.getAll({
          search: this.search || "",
        });

        const rows = result?.data ?? result?.result ?? result ?? [];

        this.user = Array.isArray(rows)
          ? rows.map((item) => this.mapUser(item))
          : [];
      } catch (error) {
        console.error(error);

        const message = this.getErrorMessage(
          error,
          "Gagal mengambil data user",
        );

        this.showSnackbar(message, "error");
      } finally {
        this.loading = false;
      }
    },

    mapUser(item) {
      return {
        id: item.id ?? item.user_id ?? item.new_id,

        nama:
          item.nama ??
          item.display_name ??
          item.name ??
          item.nama_karyawan ??
          item.karyawan?.nama ??
          "-",

        username: item.username ?? item.email ?? "-",

        cabang: this.mapCabangFromPenempatan(item.penempatan),

        role:
          item.role ??
          item.nama_role ??
          item.role_name ??
          item.master_role?.nama ??
          "-",

        is_active: item.is_active ?? 1,
        raw: item,
      };
    },

    mapCabangFromPenempatan(penempatan) {
      if (!Array.isArray(penempatan) || !penempatan.length) {
        return "-";
      }

      const activePenempatan = penempatan.filter(
        (item) => Number(item.is_delete || 0) === 0,
      );

      if (!activePenempatan.length) {
        return "-";
      }

      const primary =
        activePenempatan.find((item) => Number(item.is_primary || 0) === 1) ||
        activePenempatan[0];

      return (
        primary?.toko?.nama_toko ??
        primary?.toko?.nama ??
        primary?.nama_toko ??
        primary?.nama ??
        "-"
      );
    },

    getRoleColor(role) {
      const normalizedRole = String(role || "").toLowerCase();

      const map = {
        superuser: "red",
        "super admin": "red",
        administrator: "primary",
        admin: "primary",
        it: "indigo",
        management: "purple",
        dokter: "success",
        doctor: "success",
        nurse: "teal",
        perawat: "teal",
        "customer service": "warning",
        "front office": "info",
        fo: "info",
        kasir: "orange",
        apotik: "cyan",
        security: "blue-grey",
      };

      return map[normalizedRole] || "secondary";
    },

    exportFullData() {
      this.showSnackbar("Export full data belum diaktifkan", "warning");
    },

    confirmDelete(user) {
      this.selectedUser = user;
      this.deleteDialog = true;
    },

    async deleteUser() {
      if (!this.selectedUser) return;

      const id = this.selectedUser.id;

      if (!id) {
        this.showSnackbar("ID user tidak ditemukan", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await userService.delete(id);

        this.deleteDialog = false;
        this.selectedUser = null;

        this.showSnackbar("User berhasil dihapus", "success");

        await this.fetchUser();
      } catch (error) {
        console.error(error);

        const message = this.getErrorMessage(error, "Gagal menghapus user");

        this.showSnackbar(message, "error");
      } finally {
        this.loadingDelete = false;
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },

    getErrorMessage(error, fallbackMessage) {
      const response = error?.response?.data;

      if (response?.message) return response.message;

      if (response?.error) return response.error;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];

        if (firstKey && Array.isArray(response.errors[firstKey])) {
          return response.errors[firstKey][0];
        }
      }

      return fallbackMessage;
    },
  },
};
</script>

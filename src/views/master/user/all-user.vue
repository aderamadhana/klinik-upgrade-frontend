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
          clearable
          style="max-width: 320px"
          @keyup.enter="handleSearch"
          @click:clear="handleClearSearch"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-data-table-server
          :page="page"
          :items-per-page="itemsPerPage"
          :headers="headers"
          :items="users"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          loading-text="Memuat data user..."
          no-data-text="Data user tidak ditemukan"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.nama="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.nama || "-" }}
              </div>
              <div
                v-if="item.display_name && item.display_name !== item.nama"
                class="text-caption text-medium-emphasis"
              >
                {{ item.display_name }}
              </div>
            </div>
          </template>

          <template #item.username="{ item }">
            {{ item.username || "-" }}
          </template>

          <template #item.cabang="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="cabang in getCabangList(item)"
                :key="cabang.id"
                size="small"
                color="primary"
              >
                {{ cabang.nama }}
              </v-chip>

              <span v-if="getCabangList(item).length === 0">-</span>
            </div>
          </template>

          <template #item.role="{ item }">
            <v-chip size="small" :color="getRoleColor(item.role)">
              {{ item.role || "-" }}
            </v-chip>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="Number(item.is_active) === 1 ? 'success' : 'error'"
            >
              {{ Number(item.is_active) === 1 ? "Aktif" : "Nonaktif" }}
            </v-chip>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                size="small"
                color="primary"
                prepend-icon="mdi-pencil"
                :to="`/master/user/edit/${item.id}`"
              >
                Edit
              </v-btn>

              <v-btn
                size="small"
                color="error"
                prepend-icon="mdi-delete"
                @click="confirmDelete(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-6">
              <div class="text-subtitle-2 mb-1">Data user tidak ditemukan</div>

              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan user baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <confirm-delete-dialog
      v-model="deleteDialog"
      :loading="loadingDelete"
      title="Konfirmasi Hapus"
      subtitle="Data user akan dihapus secara soft delete."
      question="Yakin ingin menghapus user ini?"
      :item-title="selectedUser?.nama || '-'"
      warning-text="Data user akan dihapus secara soft delete."
      @confirm="deleteUser"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import userService from "@/services/master/userService";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";

export default {
  name: "AllUser",
  components: {
    ConfirmDeleteDialog,
  },
  data() {
    return {
      search: "",
      loading: false,
      loadingDelete: false,
      deleteDialog: false,
      selectedUser: null,

      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      fetchTimer: null,

      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 25, title: "25" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
      ],

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
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "Nama", key: "nama" },
        { title: "Username", key: "username" },
        { title: "Cabang", key: "cabang", sortable: false },
        { title: "Role", key: "role" },
        { title: "Status", key: "status", sortable: false },
        { title: "Action", key: "action", sortable: false, align: "end" },
      ],

      users: [],
    };
  },

  mounted() {
    this.fetchUser();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchUser() {
      this.loading = true;

      try {
        const response = await userService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.users = rows.map((item) => this.mapUser(item));
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.users = [];
        this.totalItems = 0;

        const message = this.getErrorMessage(
          error,
          "Gagal mengambil data user",
        );

        this.showSnackbar(message, "error");
      } finally {
        this.loading = false;
      }
    },

    queueFetchUser() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchUser();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchUser();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchUser();
    },

    handleSearch() {
      this.page = 1;
      this.fetchUser();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchUser();
    },

    extractRows(response) {
      if (Array.isArray(response)) {
        return response;
      }

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      if (Array.isArray(response?.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response?.items)) {
        return response.items;
      }

      return [];
    },

    extractMeta(response) {
      if (response?.meta) {
        return response.meta;
      }

      if (response?.data?.meta) {
        return response.data.meta;
      }

      if (
        response?.current_page ||
        response?.per_page ||
        response?.total ||
        response?.last_page
      ) {
        return {
          current_page: response.current_page,
          per_page: response.per_page,
          total: response.total,
          last_page: response.last_page,
        };
      }

      if (
        response?.data?.current_page ||
        response?.data?.per_page ||
        response?.data?.total ||
        response?.data?.last_page
      ) {
        return {
          current_page: response.data.current_page,
          per_page: response.data.per_page,
          total: response.data.total,
          last_page: response.data.last_page,
        };
      }

      return {
        current_page: this.page,
        per_page: this.itemsPerPage,
        total: 0,
        last_page: 1,
      };
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

        display_name: item.display_name ?? null,

        username: item.username ?? item.email ?? "-",

        cabang: this.mapCabangFromPenempatan(item.penempatan),

        role:
          item.role ??
          item.nama_role ??
          item.role_name ??
          item.master_role?.nama ??
          "-",

        is_active: item.is_active ?? 1,
        penempatan: item.penempatan ?? [],
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

    getCabangList(item) {
      const penempatan = item.raw?.penempatan || item.penempatan || [];

      if (!Array.isArray(penempatan)) {
        return [];
      }

      return penempatan
        .filter((row) => Number(row.is_delete || 0) === 0)
        .map((row) => {
          const toko = row.toko || {};

          return {
            id: toko.id || row.toko_id,
            nama:
              toko.nama_toko || toko.nama || row.nama_toko || row.nama || "-",
          };
        })
        .filter((row) => row.id);
    },

    rowNumber(index) {
      return (Number(this.page) - 1) * Number(this.itemsPerPage) + index + 1;
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

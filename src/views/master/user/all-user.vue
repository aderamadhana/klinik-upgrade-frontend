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
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                :to="'/master/user/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="error"
                size="small"
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
export default {
  name: "AllUser",

  data() {
    return {
      search: "",
      deleteDialog: false,
      selectedUser: null,

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "User", disabled: false, to: "/user" },
      ],

      headers: [
        { title: "Nama", key: "nama" },
        { title: "Username", key: "username" },
        { title: "Cabang", key: "cabang" },
        { title: "Role", key: "role" },
        { title: "Action", key: "action", sortable: false, width: "220px" },
      ],

      user: [
        {
          id: 1,
          nama: "Adli",
          username: "adlibm",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "administrator",
        },
        {
          id: 2,
          nama: "ADLI ARHANI",
          username: "dradli",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "dokter",
        },
        {
          id: 3,
          nama: "AJENG PUTRI S",
          username: "bmajengputri",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "administrator",
        },
        {
          id: 4,
          nama: "ASTRI DWIHARTARI",
          username: "dpjpastri",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "dokter",
        },
        {
          id: 5,
          nama: "CRMJKS",
          username: "crmjakarta",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "customer service",
        },
        {
          id: 6,
          nama: "Dinda zahra",
          username: "drdindajkt",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "dokter",
        },
        {
          id: 7,
          nama: "FOJKT",
          username: "fojkt",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "front office",
        },
        {
          id: 8,
          nama: "GHEBY INGE NATALIA",
          username: "fogheby",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "front office",
        },
        {
          id: 9,
          nama: "HR Management",
          username: "hrkijks",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "administrator",
        },
        {
          id: 10,
          nama: "itcrm",
          username: "itcrm",
          cabang: "KLINIK JAKARTA SELATAN",
          role: "customer service",
        },
        {
          id: 11,
          nama: "Farah Nabila",
          username: "farahn",
          cabang: "KLINIK MALANG",
          role: "front office",
        },
        {
          id: 12,
          nama: "Rizki Saputra",
          username: "rizkis",
          cabang: "KLINIK SURABAYA",
          role: "administrator",
        },
        {
          id: 13,
          nama: "dr. Kevin",
          username: "drkevin",
          cabang: "KLINIK SURABAYA",
          role: "dokter",
        },
      ],
    };
  },

  methods: {
    getRoleColor(role) {
      const map = {
        administrator: "primary",
        dokter: "success",
        "customer service": "warning",
        "front office": "info",
      };

      return map[role] || "secondary";
    },

    exportFullData() {
      console.log("export full data user");
      this.showSnackbar("Export full data diproses", "success");
    },

    confirmDelete(user) {
      this.selectedUser = user;
      this.deleteDialog = true;
    },

    deleteUser() {
      if (!this.selectedUser) return;

      this.user = this.user.filter((item) => item.id !== this.selectedUser.id);

      this.deleteDialog = false;
      this.showSnackbar("User berhasil dihapus", "success");
      this.selectedUser = null;
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },
  },
};
</script>

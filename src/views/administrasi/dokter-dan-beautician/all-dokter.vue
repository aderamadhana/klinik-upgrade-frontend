<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dokter</h1>
        <p class="page-subtitle">Kelola data dokter yang terdaftar di sistem</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card>
      <!-- HEADER ACTION -->
      <!-- ACTION BAR -->
      <v-card-title class="d-flex justify-space-between align-center">
        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          :to="'/administrasi/dokter/add'"
        >
          Entry Data
        </v-btn>

        <v-text-field
          v-model="search"
          placeholder="Cari dokter..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 260px"
        />
      </v-card-title>
      <!-- TABLE -->
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="karyawans"
          :search="search"
          item-value="kode"
          density="compact"
        >
          <!-- ACTION COLUMN -->
          <template #item.action="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                size="small"
                color="primary"
                prepend-icon="mdi-pencil"
                :to="'/administrasi/karyawan/edit/' + item.kode"
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
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- MODAL HAPUS -->
    <v-dialog v-model="dialogDelete" width="400">
      <v-card>
        <v-card-title class="bg-red text-white">
          Konfirmasi Hapus
        </v-card-title>

        <v-card-text>
          Hapus karyawan
          <b>{{ selectedKaryawan?.nama }}</b> ?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="grey" @click="dialogDelete = false"> Batal </v-btn>

          <v-btn color="error" @click="deleteKaryawan"> Hapus </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Dokter", disabled: false, to: "/administrasi/dokter" },
      ],
      tokoId: 1,

      dialogDelete: false,

      selectedKaryawan: null,

      search: "",

      headers: [
        { title: "Kode", key: "kode" },
        { title: "Nama Lengkap", key: "nama" },
        { title: "Alamat", key: "alamat" },
        { title: "Telp", key: "no_telp" },
        { title: "Jabatan", key: "jabatan" },
        { title: "Action", key: "action", sortable: false },
      ],

      // dummy data
      karyawans: [
        {
          kode: "K001",
          nama: "Budi Santoso",
          alamat: "Jakarta",
          no_telp: "08123456789",
          jabatan: "Dokter",
        },
        {
          kode: "K002",
          nama: "Siti Aminah",
          alamat: "Bandung",
          no_telp: "082233445566",
          jabatan: "Perawat",
        },
        {
          kode: "K003",
          nama: "Andi Wijaya",
          alamat: "Surabaya",
          no_telp: "081122334455",
          jabatan: "Admin",
        },
      ],
    };
  },
  methods: {
    confirmDelete(karyawan) {
      this.selectedKaryawan = karyawan;
      this.dialogDelete = true;
    },

    deleteKaryawan() {
      this.karyawans = this.karyawans.filter(
        (k) => k.kode !== this.selectedKaryawan.kode,
      );

      this.dialogDelete = false;
    },

    previewFoto(karyawan) {
      console.log("preview foto", karyawan);
    },

    uploadFoto(karyawan) {
      console.log("upload foto", karyawan);
    },

    deleteFoto(karyawan) {
      console.log("delete foto", karyawan);
    },
  },
};
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Pasien</h1>
        <p class="page-subtitle">Kelola data pasien yang terdaftar di sistem</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <!-- HEADER ACTION -->
      <v-card-title class="d-flex justify-end align-center">
        <v-text-field
          v-model="search"
          placeholder="Cari pasien..."
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
          :items="pasiens"
          :search="search"
          item-value="kode"
          density="compact"
        >
          <!-- ACTION COLUMN -->
          <template v-slot:item.action="{ item }">
            <v-btn
              size="small"
              color="info"
              class="mr-2"
              :to="'/master/pasien/riwayat/' + item.kode"
            >
              Riwayat
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Pasien", disabled: false, to: "/master/pasien" },
      ],
      tokoId: 1,
      search: "",

      headers: [
        { title: "No.RM", key: "no_rm" },
        { title: "KTP PASSPORT", key: "ktp_passport" },
        { title: "NAMA PASIEN", key: "nama_pasien" },
        { title: "ALAMAT", key: "alamat" },
        { title: "TTL", key: "ttl" },
        { title: "L/P", key: "lp" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      pasiens: [
        {
          no_rm: "A-1900001",
          ktp_passport: "3588xxxxxxxxxxxx",
          nama_pasien: "RENI UMI SANJARWATI NN",
          alamat: "JL KENANGA NO. 10",
          ttl: "MALANG, 1991-04-03",
          lp: "W",
        },
        {
          no_rm: "A-1900002",
          ktp_passport: "3578xxxxxxxxxxxx",
          nama_pasien: "BUDI SANTOSO",
          alamat: "JL MERDEKA NO. 10",
          ttl: "JAKARTA, 1988-07-12",
          lp: "L",
        },
        {
          no_rm: "A-1900003",
          ktp_passport: "3276xxxxxxxxxxxx",
          nama_pasien: "SITI AMINAH",
          alamat: "JL KENANGA NO. 5",
          ttl: "BANDUNG, 1993-11-21",
          lp: "W",
        },
      ],
    };
  },
  methods: {
    previewFoto(pasien) {
      console.log("preview foto", pasien);
    },

    uploadFoto(pasien) {
      console.log("upload foto", pasien);
    },

    deleteFoto(pasien) {
      console.log("delete foto", pasien);
    },
  },
};
</script>

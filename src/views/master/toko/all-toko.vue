<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Toko</h1>
        <p class="page-subtitle">Kelola data toko yang terdaftar di sistem</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex ga-2">
          <v-btn
            color="success"
            prepend-icon="mdi-plus"
            :to="'/master/toko/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari toko..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 260px"
        />
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="tokos"
          :search="search"
          item-value="kode"
          density="compact"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AllToko",
  data() {
    return {
      search: "",

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Toko", disabled: false, to: "/master/toko" },
      ],

      headers: [
        { title: "Kode", key: "kode" },
        { title: "Nama Toko", key: "nama" },
        { title: "Alamat", key: "alamat" },
        { title: "Telp", key: "telp" },
      ],

      tokos: [
        {
          kode: "AEMS-001",
          nama: "MALANG",
          alamat: "Jl. Guntur No.8, Oro-oro Dowo, Klojen, Kota Malang",
          telp: "0341-3015563",
        },
        {
          kode: "AEMS-002",
          nama: "SURABAYA",
          alamat: "Jl. Biliton No. 01",
          telp: "031-99445657",
        },
        {
          kode: "AEMS-003",
          nama: "BANDUNG",
          alamat: "Jl. Lombok No. 33",
          telp: "022-4233533",
        },
        {
          kode: "AEMS-004",
          nama: "SIDOARJO",
          alamat: "Jl. Jenggolo No. 26",
          telp: "031-99710305",
        },
        {
          kode: "AEMS-005",
          nama: "BEKASI",
          alamat: "Jl. KH Noer Alie No. 41",
          telp: "021-89464702",
        },
        {
          kode: "AEMS-006",
          nama: "MEDAN",
          alamat: "Jl. Kapten Pattimura No. 131",
          telp: "061-80513107",
        },
        {
          kode: "AEMS-007",
          nama: "DEPOK",
          alamat: "Jl. Ir Juanda RT/RW 03/26",
          telp: "021-77844161",
        },
        {
          kode: "AEMS-008",
          nama: "YOGYAKARTA",
          alamat: "Jl. KH. Ahmad Dahlan No.77",
          telp: "0274-3900792",
        },
        {
          kode: "AEMS-009",
          nama: "JAKARTA SELATAN",
          alamat:
            "Jl. Wolter Monginsidi No. 48, Petogogan, Kec. Kby. Baru Kota Jakarta Selatan",
          telp: "021",
        },
        {
          kode: "AEMS-099",
          nama: "MANAGEMENT",
          alamat: "-",
          telp: "0",
        },
      ],
    };
  },

  methods: {
    exportFullData() {
      console.log("export full data toko");
    },
  },
};
</script>

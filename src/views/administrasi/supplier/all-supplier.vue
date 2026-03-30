<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Supplier</h1>
        <p class="page-subtitle">
          Kelola data supplier yang terdaftar di sistem
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <!-- HEADER ACTION -->
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            prepend-icon="mdi-plus"
            color="success"
            :to="'/administrasi/supplier/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari supplier..."
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
          :items="suppliers"
          :search="search"
          item-value="kode"
          density="compact"
        >
          <template v-slot:item.action="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                :to="'/administrasi/supplier/edit/' + item.kode"
              >
                Edit Supplier
              </v-btn>

              <v-btn
                color="error"
                size="small"
                prepend-icon="mdi-delete"
                @click="deleteSupplier(item)"
              >
                Hapus Supplier
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "SupplierIndex",
  data() {
    return {
      search: "",
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Supplier", disabled: false, to: "/administrasi/supplier" },
      ],

      headers: [
        { title: "KODE", key: "kode" },
        { title: "NAMA PERUSAHAAN", key: "nama" },
        { title: "ALAMAT", key: "alamat" },
        { title: "TELP", key: "no_telp" },
        { title: "KONTAK", key: "kontak" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      suppliers: [
        {
          kode: "SUP001",
          nama: "PT Maju Jaya",
          alamat: "Jl. Kenanga No. 10, Malang",
          no_telp: "0341-123456",
          kontak: "Budi",
        },
        {
          kode: "SUP002",
          nama: "CV Sumber Rejeki",
          alamat: "Jl. Merdeka No. 25, Surabaya",
          no_telp: "031-987654",
          kontak: "Siti",
        },
        {
          kode: "SUP003",
          nama: "PT Berkah Abadi",
          alamat: "Jl. Soekarno Hatta No. 8, Bandung",
          no_telp: "022-456789",
          kontak: "Andi",
        },
      ],
    };
  },
  methods: {
    exportFullData() {
      console.log("export full data");
    },
    deleteSupplier(item) {
      console.log("hapus supplier", item);
    },
  },
};
</script>

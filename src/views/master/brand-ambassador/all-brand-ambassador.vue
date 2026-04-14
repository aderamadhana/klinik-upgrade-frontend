<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Brand Ambassador</h1>
        <p class="page-subtitle">Kelola data brand ambassador per cabang</p>
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
            :to="'/master/brand-ambassador/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari kode, nama, cabang, instagram..."
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
          :items="brandAmbassadorsWithCabang"
          :search="search"
          item-value="id"
          density="compact"
        >
          <template v-slot:item.action="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                :to="'/master/brand-ambassador/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="info"
                size="small"
                prepend-icon="mdi-eye"
                @click="detailBrandAmbassador(item)"
              >
                Detail
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDetail" max-width="800">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Detail Brand Ambassador
        </v-card-title>

        <v-divider />

        <v-card-text>
          <pre class="mb-0">{{ formattedDetail }}</pre>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="dialogDetail = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "BrandAmbassadorIndex",
  data() {
    return {
      search: "",
      dialogDetail: false,
      selectedItem: null,

      breadcrumbs: [
        { title: "Master", disabled: true },
        {
          title: "Brand Ambassador",
          disabled: false,
          to: "/master/brand-ambassador",
        },
      ],

      headers: [
        { title: "CABANG", key: "cabang" },
        { title: "KODE", key: "kode" },
        { title: "NAMA", key: "nama" },
        { title: "NO. TELEPON", key: "no_telp" },
        { title: "EMAIL", key: "email" },
        { title: "INSTAGRAM", key: "instagram" },
        { title: "CATATAN", key: "catatan" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      tokoOptions: [
        { id: 1, nama: "Malang" },
        { id: 2, nama: "Surabaya" },
        { id: 3, nama: "Bandung" },
        { id: 4, nama: "Sidoarjo" },
        { id: 5, nama: "Bekasi" },
        { id: 6, nama: "Medan" },
        { id: 7, nama: "Depok" },
        { id: 8, nama: "Yogyakarta" },
      ],

      brandAmbassadors: [
        {
          id: 1,
          toko_id: 1,
          kode: "BA001",
          nama: "Alya Putri",
          no_telp: "081234567890",
          email: "alya.putri@mail.com",
          instagram: "@alyaputri",
          alamat: "Jl. Ijen No. 12, Malang",
          catatan: "Fokus campaign skincare premium",
        },
        {
          id: 2,
          toko_id: 2,
          kode: "BA002",
          nama: "Nabila Safa",
          no_telp: "082233445566",
          email: "nabila.safa@mail.com",
          instagram: "@nabilasafa",
          alamat: "Jl. Diponegoro No. 8, Surabaya",
          catatan: "Aktif untuk promo event cabang Surabaya",
        },
        {
          id: 3,
          toko_id: 3,
          kode: "BA003",
          nama: "Raisa Anindya",
          no_telp: "081998877665",
          email: "raisa.anindya@mail.com",
          instagram: "@raisaanindya",
          alamat: "Jl. Braga No. 21, Bandung",
          catatan: "Konten dominan Instagram Reels",
        },
        {
          id: 4,
          toko_id: 7,
          kode: "BA004",
          nama: "Dinda Maharani",
          no_telp: "085712341234",
          email: "dinda.maharani@mail.com",
          instagram: "@dindamaharani",
          alamat: "Jl. Margonda No. 33, Depok",
          catatan: "Diprioritaskan untuk akuisisi member baru",
        },
        {
          id: 5,
          toko_id: 8,
          kode: "BA005",
          nama: "Salsa Kirana",
          no_telp: "081377788899",
          email: "salsa.kirana@mail.com",
          instagram: "@salsakirana",
          alamat: "Jl. Kaliurang No. 15, Yogyakarta",
          catatan: "Kolaborasi campaign treatment seasonal",
        },
      ],
    };
  },

  computed: {
    brandAmbassadorsWithCabang() {
      return this.brandAmbassadors.map((item) => ({
        ...item,
        cabang: this.getTokoName(item.toko_id),
      }));
    },

    formattedDetail() {
      return JSON.stringify(this.selectedItem, null, 2);
    },
  },

  methods: {
    getTokoName(tokoId) {
      const toko = this.tokoOptions.find(
        (item) => Number(item.id) === Number(tokoId),
      );
      return toko ? toko.nama : "-";
    },

    detailBrandAmbassador(item) {
      this.selectedItem = item;
      this.dialogDetail = true;
    },
  },
};
</script>

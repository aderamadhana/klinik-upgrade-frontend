<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Treatment</h1>
        <p class="page-subtitle">
          Kelola data jasa atau tindakan yang terdaftar di sistem
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
            color="warning"
            prepend-icon="mdi-export"
            :to="'/administrasi/treatment/excel_treatments'"
          >
            Export Full Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari treatment..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 260px"
        />
      </v-card-title>

      <v-card-text>
        <div class="table-responsive">
          <v-data-table
            :headers="headers"
            :items="formattedTreatments"
            :search="search"
            item-value="kode"
            density="compact"
            class="responsive-table text-no-wrap"
          >
            <template #item.tarif_umum="{ item }">
              {{ formatRupiah(item.tarif_umum) }}
            </template>

            <template #item.action="{ item }">
              <div class="d-flex ga-2">
                <v-btn
                  color="info"
                  size="small"
                  prepend-icon="mdi-eye"
                  :to="'/administrasi/treatment/read/' + item.kode"
                >
                  Lihat Detail
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "TreatmentIndex",
  data() {
    return {
      search: "",
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Treatment", disabled: false, to: "/administrasi/treatment" },
      ],

      headers: [
        { title: "KODE", key: "kode" },
        { title: "NAMA JASA/TINDAKAN", key: "nama" },
        { title: "BAGIAN", key: "nama_unit" },
        { title: "JENIS", key: "nama_tipe" },
        { title: "TARIF (RP)", key: "tarif_umum" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      // contoh dummy
      treatments: [
        {
          kode: "TRX001",
          nama: "Facial Brightening",
          nama_unit: "Wajah",
          nama_tipe: "Facial",
          tarif_umum: 350000,
        },
        {
          kode: "TRX002",
          nama: "Laser Rejuvenation",
          nama_unit: "Wajah",
          nama_tipe: "Laser",
          tarif_umum: 750000,
        },
        {
          kode: "TRX003",
          nama: "Hair Removal",
          nama_unit: "Tubuh",
          nama_tipe: "Treatment",
          tarif_umum: 500000,
        },
      ],
    };
  },

  computed: {
    formattedTreatments() {
      return this.treatments.map((item) => ({
        ...item,
      }));
    },
  },

  methods: {
    formatRupiah(value) {
      const number = Number(value || 0);
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(number);
    },
  },
};
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">
          {{ pageTitle }}
        </h1>
        <div class="text-body-2 text-medium-emphasis">
          Halaman laporan sudah terdaftar dan siap dilanjutkan ke implementasi
          data.
        </div>
      </div>

      <v-btn
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-arrow-left"
        @click="$router.back()"
      >
        Kembali
      </v-btn>
    </div>

    <v-card variant="outlined">
      <v-card-text class="pa-8 text-center">
        <v-icon
          icon="mdi-file-chart-outline"
          size="56"
          color="primary"
          class="mb-4"
        />

        <div class="text-h6 font-weight-bold mb-2">
          Laporan Belum Diimplementasikan
        </div>

        <div class="text-body-2 text-medium-emphasis mx-auto">
          Route untuk {{ pageTitle }} sudah aktif. Endpoint, filter, dan tabel
          laporan perlu diimplementasikan pada tahap berikutnya.
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "LaporanBelumTersedia",

  computed: {
    pageTitle() {
      return this.$route.meta?.title || "Laporan";
    },
  },
};
</script>

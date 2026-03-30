<template>
  <v-container class="fill-height">
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" sm="10" md="6" lg="5">
        <v-card class="pa-8" rounded="xl" elevation="6">
          <div class="text-overline">Error</div>
          <div class="text-h2 font-weight-black">404</div>
          <div class="text-h6 mt-1">Halaman tidak ditemukan</div>
          <div class="text-body-2 text-medium-emphasis mt-3">
            Halaman yang kamu cari tidak ada atau URL-nya salah.
          </div>

          <v-btn
            class="mt-6"
            color="primary"
            size="large"
            @click="goBack"
            prepend-icon="mdi-arrow-left"
          >
            Kembali
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
function goBack() {
  if (window.history.length > 1) window.history.back();
  else window.location.href = "/";
}
</script>

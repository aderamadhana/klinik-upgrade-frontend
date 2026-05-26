<template>
  <div class="mb-6">
    <div class="text-subtitle-1 font-weight-bold mb-3">
      Informasi Medis Pendaftaran
    </div>

    <v-card variant="outlined">
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-textarea
              :model-value="onlineRegistration.alergi"
              label="Alergi"
              variant="outlined"
              density="comfortable"
              rows="2"
              auto-grow
              readonly
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-textarea
              :model-value="onlineRegistration.keluhan_utama"
              label="Keluhan Utama"
              variant="outlined"
              density="comfortable"
              rows="2"
              auto-grow
              readonly
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-textarea
              :model-value="onlineRegistration.produk_sebelumnya"
              label="Produk / Obat Sebelumnya"
              variant="outlined"
              density="comfortable"
              rows="3"
              auto-grow
              readonly
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              :model-value="onlineRegistration.sedang_hamil"
              label="Sedang Hamil"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              :model-value="onlineRegistration.sedang_menyusui"
              label="Sedang Menyusui"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              :model-value="onlineRegistration.catatan_cs"
              label="Catatan CS / Catatan Awal"
              variant="outlined"
              density="comfortable"
              rows="2"
              auto-grow
              readonly
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AntrianDokterOnlineInfo",

  props: {
    onlineRegistration: {
      type: Object,
      required: true,
    },
  },
};
</script>

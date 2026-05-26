<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      border="start"
      class="mb-4"
    >
      Bagian ini hanya muncul jika layanan konsultasi dipilih dan channel
      konsultasi adalah offline.
    </v-alert>

    <v-card variant="flat" class="border">
      <v-card-text class="pa-4">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
        >
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="42">
              <v-icon size="22">mdi-clipboard-text-outline</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Detail Konsultasi
              </div>
              <div class="text-caption text-medium-emphasis">
                Catatan awal untuk membantu dokter memahami kondisi pasien
              </div>
            </div>
          </div>

          <v-chip
            color="primary"
            variant="tonal"
            size="small"
            class="font-weight-medium"
          >
            <v-icon start size="16">mdi-stethoscope</v-icon>
            Konsultasi Offline
          </v-chip>
        </div>

        <v-row dense>
          <v-col cols="12" md="7">
            <v-textarea
              :model-value="konsultasiOffline.keluhan_awal"
              label="Keluhan Awal"
              rows="5"
              auto-grow
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-message-text-outline"
              :rules="[rules.required]"
              placeholder="Tuliskan keluhan utama pasien, misalnya jerawat, flek, iritasi, atau keluhan lainnya"
              hide-details="auto"
              @update:modelValue="updateField('keluhan_awal', $event)"
            >
              <template #message>
                Wajib diisi. Jelaskan keluhan utama pasien secara singkat dan
                jelas.
              </template>
            </v-textarea>
          </v-col>

          <v-col cols="12" md="5">
            <v-card variant="tonal" color="primary" class="h-100">
              <v-card-text class="pa-4">
                <div class="d-flex align-start ga-3">
                  <v-icon size="22">mdi-information-outline</v-icon>

                  <div>
                    <div class="text-subtitle-2 font-weight-bold mb-1">
                      Panduan Pengisian
                    </div>

                    <div class="text-body-2">
                      Isi keluhan utama dengan ringkas, jelas, dan sesuai ucapan
                      pasien. Detail pemeriksaan tetap dilakukan dokter pada
                      tahap pelayanan.
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="d-flex flex-column ga-2">
                  <div class="d-flex align-center ga-2">
                    <v-icon size="18">mdi-check-circle-outline</v-icon>
                    <span class="text-caption">
                      Keluhan utama wajib diisi
                    </span>
                  </div>

                  <div class="d-flex align-center ga-2">
                    <v-icon size="18">mdi-check-circle-outline</v-icon>
                    <span class="text-caption">
                      Catatan tambahan bersifat opsional
                    </span>
                  </div>

                  <div class="d-flex align-center ga-2">
                    <v-icon size="18">mdi-check-circle-outline</v-icon>
                    <span class="text-caption">
                      Tidak perlu mengisi SOAP di tahap FO
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-textarea
              :model-value="konsultasiOffline.catatan"
              label="Catatan Awal Konsultasi"
              rows="4"
              auto-grow
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-note-text-outline"
              placeholder="Catatan tambahan dari front office atau petugas sebelum pasien bertemu dokter"
              hide-details="auto"
              @update:modelValue="updateField('catatan', $event)"
            >
              <template #message>
                Opsional. Gunakan untuk informasi tambahan yang perlu diketahui
                petugas atau dokter.
              </template>
            </v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "KonsultasiOffline",

  props: {
    form: {
      type: Object,
      required: true,
    },
    rules: {
      type: Object,
      required: true,
    },
  },

  emits: ["update-konsultasi-offline"],

  computed: {
    konsultasiOffline() {
      return {
        keluhan_awal: "",
        catatan: "",
        ...(this.form?.konsultasi_offline || {}),
      };
    },
  },

  methods: {
    updateField(field, value) {
      this.$emit("update-konsultasi-offline", { field, value });
    },
  },
};
</script>

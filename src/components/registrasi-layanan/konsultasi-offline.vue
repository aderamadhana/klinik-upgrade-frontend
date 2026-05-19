<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-5"
    >
      Bagian ini hanya muncul jika layanan konsultasi dipilih dan channel
      konsultasi adalah offline.
    </v-alert>

    <div class="group-wrap">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="primary">
            mdi-clipboard-text-outline
          </v-icon>
          Detail Konsultasi
        </div>
        <div class="group-subtitle">
          Catatan awal yang membantu dokter memahami kondisi pasien sebelum
          pemeriksaan
        </div>
      </div>

      <v-row density="comfortable">
        <v-col cols="12">
          <v-textarea
            :model-value="konsultasiOffline.keluhan_awal"
            label="Keluhan Awal"
            rows="4"
            auto-grow
            variant="outlined"
            density="comfortable"
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

        <v-col cols="12">
          <v-textarea
            :model-value="konsultasiOffline.catatan"
            label="Catatan Awal Konsultasi"
            rows="4"
            auto-grow
            variant="outlined"
            density="comfortable"
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
    </div>
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

<style scoped>
.group-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 20px;
  background: #fff;
}

.group-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.group-subtitle {
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .group-wrap {
    padding: 16px;
  }
}
</style>

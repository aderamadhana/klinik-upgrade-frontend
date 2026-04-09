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

      <v-row dense>
        <v-col cols="12">
          <v-textarea
            :model-value="form.konsultasi_offline.keluhan_awal"
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
            :model-value="form.konsultasi_offline.catatan"
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

    <div class="group-wrap mt-5">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="success">
            mdi-clipboard-check-outline
          </v-icon>
          Ringkasan Input
        </div>
        <div class="group-subtitle">
          Preview singkat data konsultasi offline yang telah diisi
        </div>
      </div>

      <v-row dense>
        <v-col cols="12" md="6">
          <div class="summary-box">
            <div class="summary-label">Keluhan Awal</div>
            <div class="summary-value summary-value--multiline">
              {{ form.konsultasi_offline.keluhan_awal || "-" }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="summary-box">
            <div class="summary-label">Catatan Awal</div>
            <div class="summary-value summary-value--multiline">
              {{ form.konsultasi_offline.catatan || "-" }}
            </div>
          </div>
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
  methods: {
    updateField(field, value) {
      this.$emit("update-konsultasi-offline", { field, value });
    },
  },
};
</script>

<style scoped>
.konsultasi-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

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

.summary-box {
  height: 100%;
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.summary-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

.summary-value--multiline {
  white-space: pre-line;
  line-height: 1.6;
  font-weight: 500;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .group-wrap {
    padding: 16px;
  }
}
</style>

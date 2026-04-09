<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-5"
    >
      Pastikan pasien dan petugas penanggung jawab sudah benar sebelum
      melanjutkan ke tahap berikutnya.
    </v-alert>

    <div class="group-wrap mb-5">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="primary">
            mdi-card-account-details-outline
          </v-icon>
          Data Registrasi
        </div>
        <div class="group-subtitle">
          Informasi utama yang dibutuhkan untuk memulai registrasi pasien
        </div>
      </div>

      <v-row dense>
        <v-col cols="12" md="3">
          <v-text-field
            :model-value="form.tanggal"
            label="Tanggal Registrasi"
            type="date"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-calendar"
            :rules="[rules.required]"
            hide-details="auto"
            @update:modelValue="updateField('tanggal', $event)"
          />
        </v-col>

        <v-col cols="12" md="9">
          <v-autocomplete
            :model-value="form.pasien_new_id"
            label="Pasien"
            placeholder="Cari nama pasien atau identitas"
            :items="pasienList"
            item-title="text"
            item-value="id"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-search"
            :rules="[rules.required]"
            clearable
            hide-details="auto"
            @update:modelValue="onPatientSelected"
          >
            <template #message>
              Cari berdasarkan nama pasien, nomor RM, atau identitas
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </div>

    <v-expand-transition>
      <div v-if="selectedPatient" class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="success">
              mdi-account-box-outline
            </v-icon>
            Ringkasan Pasien
          </div>
          <div class="group-subtitle">Preview singkat pasien yang dipilih</div>
        </div>

        <v-row dense>
          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Nama Pasien</div>
              <div class="summary-value">
                {{ selectedPatient.nama || "-" }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="summary-box">
              <div class="summary-label">No. RM</div>
              <div class="summary-value">
                {{ selectedPatient.no_rm || "-" }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="summary-box">
              <div class="summary-label">No. HP</div>
              <div class="summary-value">
                {{ selectedPatient.no_hp || "-" }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="2">
            <div class="summary-box">
              <div class="summary-label">Status</div>
              <div class="summary-value">
                <v-chip
                  size="small"
                  :color="selectedPatient.is_member ? 'success' : 'grey'"
                  variant="tonal"
                >
                  {{ selectedPatient.is_member ? "Member" : "Non Member" }}
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>

    <div class="group-wrap">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="primary">
            mdi-account-tie-outline
          </v-icon>
          Penanggung Jawab
        </div>
        <div class="group-subtitle">
          Petugas yang menangani pasien pada kunjungan ini
        </div>
      </div>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            :model-value="form.dokter_id"
            label="Dokter Penanggung Jawab"
            placeholder="Pilih dokter"
            :items="dokterList"
            item-title="nama"
            item-value="id"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-stethoscope"
            clearable
            hide-details="auto"
            @update:modelValue="updateField('dokter_id', $event)"
          >
            <template #message>
              Dokter yang bertanggung jawab pada layanan pasien
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            :model-value="form.perawat_id"
            label="Perawat / Beautician"
            placeholder="Pilih perawat atau beautician"
            :items="perawatList"
            item-title="nama"
            item-value="id"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-heart-outline"
            clearable
            hide-details="auto"
            @update:modelValue="updateField('perawat_id', $event)"
          >
            <template #message>
              Dapat dikosongkan bila belum ditentukan saat registrasi
            </template>
          </v-select>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  name: "InformasiRegistrasi",
  props: {
    form: {
      type: Object,
      required: true,
    },
    rules: {
      type: Object,
      required: true,
    },
    pasienList: {
      type: Array,
      default: () => [],
    },
    dokterList: {
      type: Array,
      default: () => [],
    },
    perawatList: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update-field", "patient-change"],
  computed: {
    selectedPatient() {
      if (!this.form.pasien_new_id) return null;

      const patient = this.pasienList.find(
        (item) => item.id === this.form.pasien_new_id,
      );

      if (!patient) return null;

      return {
        ...patient,
        nama: patient.nama || patient.text || "-",
        no_rm: patient.no_rm || "-",
        no_hp: patient.no_hp || "-",
        is_member: patient.is_member || false,
      };
    },
  },
  methods: {
    updateField(field, value) {
      this.$emit("update-field", { field, value });
    },
    onPatientSelected(value) {
      this.$emit("update-field", { field: "pasien_new_id", value });
      this.$emit("patient-change", value);
    },
  },
};
</script>

<style scoped>
.registrasi-card {
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

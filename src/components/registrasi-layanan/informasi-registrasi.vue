<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-5"
    >
      FO cukup mengisi header kunjungan dan penanggung jawab awal yang relevan.
      Penentuan detail medis tidak dilakukan di tahap ini.
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
          Informasi utama untuk membuat visit / kunjungan pasien
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
              Cari berdasarkan nama pasien, no. RM, atau identitas lain
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12">
          <v-textarea
            :model-value="form.catatan_registrasi"
            label="Catatan Registrasi"
            placeholder="Catatan awal dari FO, booking, keluhan singkat, atau instruksi operasional"
            variant="outlined"
            density="comfortable"
            rows="2"
            auto-grow
            prepend-inner-icon="mdi-text-box-outline"
            hide-details="auto"
            @update:modelValue="updateField('catatan_registrasi', $event)"
          />
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
              <div class="summary-value">{{ selectedPatient.nama || "-" }}</div>
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
          Penanggung Jawab Awal
        </div>
        <div class="group-subtitle">
          Tampilkan hanya petugas yang relevan dengan routing yang dipilih FO
        </div>
      </div>

      <v-alert
        v-if="!showDokterField && !showPerawatField"
        type="warning"
        variant="tonal"
        rounded="lg"
        border="start"
        class="mb-4"
      >
        Pilih layanan dan route treatment dulu supaya penanggung jawab awal yang
        relevan muncul di sini.
      </v-alert>

      <v-row dense v-else>
        <v-col v-if="showDokterField" cols="12" :md="showPerawatField ? 6 : 12">
          <v-select
            :model-value="form.dokter_id"
            label="Dokter Tujuan / Penanggung Jawab Awal"
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
              Disarankan jika ada konsultasi atau treatment ditangani dokter
            </template>
          </v-select>
        </v-col>

        <v-col v-if="showPerawatField" cols="12" :md="showDokterField ? 6 : 12">
          <v-select
            :model-value="form.perawat_id"
            label="Perawat / Beautician Tujuan"
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
              Disarankan jika treatment diarahkan ke nurse station
            </template>
          </v-select>
        </v-col>
      </v-row>

      <div v-if="routingHints.length" class="routing-hints mt-4">
        <div
          v-for="(hint, index) in routingHints"
          :key="index"
          class="routing-hint"
        >
          {{ hint }}
        </div>
      </div>
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
    layananState() {
      return {
        ada_konsultasi: false,
        channel_konsultasi: "",
        ada_treatment: false,
        route_treatment: "",
        ada_penjualan: false,
        ...(this.form?.layanan || {}),
      };
    },
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
        is_member: Boolean(patient.is_member),
      };
    },
    showDokterField() {
      return (
        this.layananState.ada_konsultasi ||
        (this.layananState.ada_treatment &&
          this.layananState.route_treatment === "dokter") ||
        Boolean(this.form.dokter_id)
      );
    },
    showPerawatField() {
      return (
        (this.layananState.ada_treatment &&
          this.layananState.route_treatment === "nurse_station") ||
        Boolean(this.form.perawat_id)
      );
    },
    routingHints() {
      const hints = [];

      if (this.layananState.ada_konsultasi) {
        hints.push(
          `Konsultasi ${this.formatChannel(
            this.layananState.channel_konsultasi,
          )} akan diarahkan ke dokter.`,
        );
      }

      if (
        this.layananState.ada_treatment &&
        this.layananState.route_treatment === "dokter"
      ) {
        hints.push("Treatment berada di jalur dokter / pelayanan medis.");
      }

      if (
        this.layananState.ada_treatment &&
        this.layananState.route_treatment === "nurse_station"
      ) {
        hints.push("Treatment diarahkan ke nurse station / beautician.");
      }

      if (
        this.layananState.ada_penjualan &&
        (this.layananState.ada_konsultasi || this.layananState.ada_treatment)
      ) {
        hints.push(
          "Penjualan produk akan ikut pada transaksi kunjungan pasien.",
        );
      } else if (this.layananState.ada_penjualan) {
        hints.push("Penjualan produk dapat langsung diteruskan ke pembayaran.");
      }

      return hints;
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
    formatChannel(value) {
      if (!value) return "belum dipilih";
      if (value === "offline") return "offline";
      if (value === "online") return "online";
      return value;
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

.routing-hints {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.routing-hint {
  font-size: 13px;
  color: #475569;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
}

@media (max-width: 768px) {
  .group-wrap {
    padding: 16px;
  }
}
</style>

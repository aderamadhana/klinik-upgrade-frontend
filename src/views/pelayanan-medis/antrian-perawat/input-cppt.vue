<template>
  <div class="cppt-page">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Input CPPT</h1>
        <p class="page-subtitle">
          Catatan perkembangan pasien terintegrasi dengan alur input yang lebih
          ringkas dan terstruktur
        </p>
      </div>

      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Kembali
      </v-btn>
    </div>

    <!-- RINGKASAN PASIEN -->
    <v-card rounded="lg" elevation="0" border class="mb-5">
      <v-card-text class="pa-4 pa-md-5">
        <div class="section-top mb-4">
          <div>
            <div class="section-title">Ringkasan Pasien</div>
            <div class="section-subtitle">
              Pastikan data kunjungan benar sebelum mengisi CPPT
            </div>
          </div>
        </div>

        <v-row>
          <v-col
            v-for="item in patientSummary"
            :key="item.label"
            cols="12"
            sm="6"
            md="3"
          >
            <div class="summary-box">
              <div class="summary-label">{{ item.label }}</div>
              <div class="summary-value">{{ item.value }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- FORM -->
    <v-card rounded="lg" elevation="0" border>
      <v-card-title class="form-card-title">Form Input CPPT</v-card-title>
      <v-divider />

      <v-card-text class="pa-4 pa-md-5">
        <v-alert type="info" variant="tonal" density="comfortable" class="mb-5">
          Isi CPPT secara singkat, spesifik, dan fokus pada kondisi pasien saat
          ini. Gunakan template cepat untuk mempercepat input, lalu sesuaikan
          isinya.
        </v-alert>

        <!-- META -->
        <div class="meta-section mb-5">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.tanggal_jam"
                label="Tanggal & Jam"
                type="datetime-local"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-clock"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.dokter_penanggung_jawab"
                label="Dokter Penanggung Jawab"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-stethoscope"
                readonly
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.perawat_pelaksana"
                :items="perawatOptions"
                item-title="label"
                item-value="value"
                label="Perawat Pelaksana"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-heart-outline"
                clearable
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </div>

        <!-- SOAP GRID -->
        <v-row>
          <!-- S -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="soap-card">
              <div class="soap-card-header">
                <div class="soap-title-wrap">
                  <div class="soap-badge">S</div>
                  <div>
                    <div class="soap-title">Subyektif</div>
                    <div class="soap-subtitle">Keluhan dan cerita pasien</div>
                  </div>
                </div>

                <v-chip
                  size="small"
                  :color="
                    isFilled(['subyektif_kategori', 'subyektif_catatan'])
                      ? 'success'
                      : 'default'
                  "
                  variant="tonal"
                >
                  {{
                    isFilled(["subyektif_kategori", "subyektif_catatan"])
                      ? "Terisi"
                      : "Belum"
                  }}
                </v-chip>
              </div>

              <div class="soap-card-body">
                <v-autocomplete
                  v-model="form.subyektif_kategori"
                  :items="subjectiveOptions"
                  item-title="label"
                  item-value="value"
                  label="Kategori Subyektif"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  hide-details="auto"
                  class="mb-3"
                />

                <div class="quick-label">Template cepat</div>
                <div class="quick-chip-wrap mb-3">
                  <v-chip
                    v-for="item in subjectiveTemplates"
                    :key="item"
                    size="small"
                    variant="outlined"
                    @click="appendToField('subyektif_catatan', item)"
                  >
                    {{ item }}
                  </v-chip>
                </div>

                <v-textarea
                  v-model="form.subyektif_catatan"
                  label="Catatan Subyektif"
                  placeholder="Contoh: Pasien mengeluh jerawat meradang sejak 1 minggu terakhir..."
                  variant="outlined"
                  rows="5"
                  auto-grow
                  hide-details="auto"
                />
              </div>
            </v-card>
          </v-col>

          <!-- O -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="soap-card">
              <div class="soap-card-header">
                <div class="soap-title-wrap">
                  <div class="soap-badge">O</div>
                  <div>
                    <div class="soap-title">Obyektif</div>
                    <div class="soap-subtitle">
                      Hasil pemeriksaan dan temuan klinis
                    </div>
                  </div>
                </div>

                <v-chip
                  size="small"
                  :color="isFilled(['obyektif']) ? 'success' : 'default'"
                  variant="tonal"
                >
                  {{ isFilled(["obyektif"]) ? "Terisi" : "Belum" }}
                </v-chip>
              </div>

              <div class="soap-card-body">
                <div class="quick-label">Template cepat</div>
                <div class="quick-chip-wrap mb-3">
                  <v-chip
                    v-for="item in objectiveTemplates"
                    :key="item"
                    size="small"
                    variant="outlined"
                    @click="appendToField('obyektif', item)"
                  >
                    {{ item }}
                  </v-chip>
                </div>

                <v-textarea
                  v-model="form.obyektif"
                  label="Catatan Obyektif"
                  placeholder="Contoh: Tampak lesi inflamasi aktif pada area pipi kanan dan kiri..."
                  variant="outlined"
                  rows="7"
                  auto-grow
                  hide-details="auto"
                />
              </div>
            </v-card>
          </v-col>

          <!-- A -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="soap-card">
              <div class="soap-card-header">
                <div class="soap-title-wrap">
                  <div class="soap-badge">A</div>
                  <div>
                    <div class="soap-title">Assessment</div>
                    <div class="soap-subtitle">
                      Diagnosa atau penilaian klinis
                    </div>
                  </div>
                </div>

                <v-chip
                  size="small"
                  :color="
                    isFilled(['diagnosa', 'assessment_catatan'])
                      ? 'success'
                      : 'default'
                  "
                  variant="tonal"
                >
                  {{
                    isFilled(["diagnosa", "assessment_catatan"])
                      ? "Terisi"
                      : "Belum"
                  }}
                </v-chip>
              </div>

              <div class="soap-card-body">
                <v-autocomplete
                  v-model="form.diagnosa"
                  :items="assessmentOptions"
                  item-title="label"
                  item-value="value"
                  label="Diagnosa / Assessment"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  hide-details="auto"
                  class="mb-3"
                />

                <div class="quick-label">Template cepat</div>
                <div class="quick-chip-wrap mb-3">
                  <v-chip
                    v-for="item in assessmentTemplates"
                    :key="item"
                    size="small"
                    variant="outlined"
                    @click="appendToField('assessment_catatan', item)"
                  >
                    {{ item }}
                  </v-chip>
                </div>

                <v-textarea
                  v-model="form.assessment_catatan"
                  label="Catatan Assessment"
                  placeholder="Contoh: Gambaran klinis mengarah ke acne vulgaris derajat ringan-sedang..."
                  variant="outlined"
                  rows="5"
                  auto-grow
                  hide-details="auto"
                />
              </div>
            </v-card>
          </v-col>

          <!-- P -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="soap-card">
              <div class="soap-card-header">
                <div class="soap-title-wrap">
                  <div class="soap-badge">P</div>
                  <div>
                    <div class="soap-title">Plan</div>
                    <div class="soap-subtitle">
                      Rencana terapi, kontrol, dan tindak lanjut
                    </div>
                  </div>
                </div>

                <v-chip
                  size="small"
                  :color="isFilled(['plan']) ? 'success' : 'default'"
                  variant="tonal"
                >
                  {{ isFilled(["plan"]) ? "Terisi" : "Belum" }}
                </v-chip>
              </div>

              <div class="soap-card-body">
                <div class="quick-label">Template cepat</div>
                <div class="quick-chip-wrap mb-3">
                  <v-chip
                    v-for="item in planTemplates"
                    :key="item"
                    size="small"
                    variant="outlined"
                    @click="appendToField('plan', item)"
                  >
                    {{ item }}
                  </v-chip>
                </div>

                <v-textarea
                  v-model="form.plan"
                  label="Catatan Plan"
                  placeholder="Contoh: Lanjutkan terapi topikal, observasi respons 2 minggu, kontrol ulang..."
                  variant="outlined"
                  rows="7"
                  auto-grow
                  hide-details="auto"
                />
              </div>
            </v-card>
          </v-col>

          <!-- TINDAKAN -->
          <v-col cols="12">
            <v-card variant="outlined" class="soap-card">
              <div class="soap-card-header">
                <div class="soap-title-wrap">
                  <div class="soap-badge tindakan-badge">T</div>
                  <div>
                    <div class="soap-title">Tindakan & Evaluasi</div>
                    <div class="soap-subtitle">
                      Tindakan yang dilakukan dan evaluasi singkat
                    </div>
                  </div>
                </div>

                <v-chip
                  size="small"
                  :color="isFilled(['tindakan']) ? 'success' : 'default'"
                  variant="tonal"
                >
                  {{ isFilled(["tindakan"]) ? "Terisi" : "Belum" }}
                </v-chip>
              </div>

              <div class="soap-card-body">
                <div class="quick-label">Template cepat</div>
                <div class="quick-chip-wrap mb-3">
                  <v-chip
                    v-for="item in tindakanTemplates"
                    :key="item"
                    size="small"
                    variant="outlined"
                    @click="appendToField('tindakan', item)"
                  >
                    {{ item }}
                  </v-chip>
                </div>

                <v-textarea
                  v-model="form.tindakan"
                  label="Catatan Tindakan & Evaluasi"
                  placeholder="Contoh: Edukasi pasien diberikan, tindakan dilakukan sesuai prosedur, pasien toleransi baik..."
                  variant="outlined"
                  rows="5"
                  auto-grow
                  hide-details="auto"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <!-- ACTION BAR -->
      <div class="action-bar">
        <div class="action-bar-left">
          <span class="action-hint">
            {{ completedCount }}/5 bagian sudah terisi
          </span>
        </div>

        <div class="action-bar-right">
          <v-btn variant="text" color="secondary" @click="resetForm">
            Reset
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            @click="submitForm"
          >
            Simpan CPPT
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "InputCppt",
  data() {
    return {
      patient: {
        nama_pasien: "ADE RAMADHANA PRATAMA",
        no_rm: "M20260307001",
        no_telepon: "6281234567890",
        tanggal_kunjungan: "2026-04-20",
        waktu_kunjungan: "09:00",
        dokter: "Dr. Rayi Vialita Poetri",
        klinik: "MALANG",
        channel: "Online",
      },

      form: {
        tanggal_jam: this.getCurrentDateTime(),
        dokter_penanggung_jawab: "Dr. Rayi Vialita Poetri",
        perawat_pelaksana: null,

        subyektif_kategori: null,
        subyektif_catatan: "",

        obyektif: "",

        diagnosa: null,
        assessment_catatan: "",

        plan: "",
        tindakan: "",
      },

      perawatOptions: [
        { label: "Perawat A", value: "perawat_a" },
        { label: "Perawat B", value: "perawat_b" },
        { label: "Perawat C", value: "perawat_c" },
      ],

      subjectiveOptions: [
        { label: "Keluhan Utama", value: "keluhan_utama" },
        { label: "Kontrol", value: "kontrol" },
        { label: "Evaluasi Terapi", value: "evaluasi_terapi" },
      ],

      assessmentOptions: [
        { label: "Acne Vulgaris", value: "acne_vulgaris" },
        { label: "Melasma", value: "melasma" },
        { label: "PIH", value: "pih" },
        { label: "Dermatitis", value: "dermatitis" },
      ],

      subjectiveTemplates: [
        "Keluhan utama pasien",
        "Kontrol pasca tindakan",
        "Keluhan membaik",
        "Keluhan memberat",
      ],

      objectiveTemplates: [
        "Temuan klinis sesuai pemeriksaan",
        "Kelainan tampak pada area yang dikeluhkan",
        "Evaluasi objektif dilakukan",
        "Respons terhadap terapi dievaluasi",
      ],

      assessmentTemplates: [
        "Sesuai gambaran klinis",
        "Pertimbangan diagnosa kerja",
        "Perlu evaluasi lanjutan",
        "Respons terapi cukup baik",
      ],

      planTemplates: [
        "Lanjutkan terapi",
        "Kontrol ulang sesuai jadwal",
        "Edukasi pasien diberikan",
        "Monitoring keluhan dan respons terapi",
      ],

      tindakanTemplates: [
        "Tindakan dilakukan sesuai prosedur",
        "Pasien toleransi baik selama tindakan",
        "Edukasi pasca tindakan diberikan",
        "Evaluasi ulang pada kunjungan berikutnya",
      ],
    };
  },

  computed: {
    patientSummary() {
      return [
        { label: "Nama Pasien", value: this.patient.nama_pasien },
        { label: "No. RM", value: this.patient.no_rm },
        { label: "No. Telepon", value: this.patient.no_telepon },
        { label: "Tanggal Kunjungan", value: this.patient.tanggal_kunjungan },
        { label: "Waktu Kunjungan", value: this.patient.waktu_kunjungan },
        { label: "Dokter", value: this.patient.dokter },
        { label: "Klinik", value: this.patient.klinik },
        { label: "Channel", value: this.patient.channel },
      ];
    },

    completedCount() {
      let total = 0;

      if (this.isFilled(["subyektif_kategori", "subyektif_catatan"])) total++;
      if (this.isFilled(["obyektif"])) total++;
      if (this.isFilled(["diagnosa", "assessment_catatan"])) total++;
      if (this.isFilled(["plan"])) total++;
      if (this.isFilled(["tindakan"])) total++;

      return total;
    },
  },

  methods: {
    getCurrentDateTime() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");

      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    isFilled(fields) {
      return fields.some((field) => {
        const value = this.form[field];
        if (Array.isArray(value)) return value.length > 0;
        return (
          value !== null && value !== undefined && String(value).trim() !== ""
        );
      });
    },

    appendToField(field, text) {
      if (!text) return;

      const current = this.form[field] ? String(this.form[field]).trim() : "";

      if (!current) {
        this.form[field] = text;
        return;
      }

      if (!current.includes(text)) {
        this.form[field] = `${current}\n${text}`;
      }
    },

    resetForm() {
      this.form = {
        tanggal_jam: this.getCurrentDateTime(),
        dokter_penanggung_jawab: this.patient.dokter,
        perawat_pelaksana: null,
        subyektif_kategori: null,
        subyektif_catatan: "",
        obyektif: "",
        diagnosa: null,
        assessment_catatan: "",
        plan: "",
        tindakan: "",
      };
    },

    goBack() {
      this.$router.back();
    },

    submitForm() {
      console.log("submit cppt", this.form);

      // contoh integrasi:
      // this.$axios.post('/cppt/store', this.form)
      // atau emit ke parent
      // this.$emit('save', this.form)
    },
  },
};
</script>

<style scoped>
.cppt-page {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.page-subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.section-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-box {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 14px 12px;
  height: 100%;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  word-break: break-word;
}

.form-card-title {
  padding: 18px 20px;
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
}

.meta-section {
  padding: 16px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fbfdff;
}

.soap-card {
  border-radius: 14px;
  height: 100%;
  overflow: hidden;
}

.soap-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 16px 0;
  flex-wrap: wrap;
}

.soap-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.soap-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #e8f1ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

.tindakan-badge {
  background: #eefbf3;
  color: #16a34a;
}

.soap-title {
  font-size: 16px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.soap-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}

.soap-card-body {
  padding: 16px;
}

.quick-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.quick-chip-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-bar {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  background: #fff;
}

.action-bar-left {
  display: flex;
  align-items: center;
}

.action-bar-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.action-hint {
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 960px) {
  .page-title {
    font-size: 22px;
  }

  .action-bar {
    align-items: stretch;
  }

  .action-bar-right {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

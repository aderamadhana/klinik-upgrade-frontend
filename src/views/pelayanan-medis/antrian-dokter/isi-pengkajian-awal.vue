<template>
  <div class="pengkajian-page">
    <div class="page-header d-flex justify-space-between align-start mb-6">
      <div>
        <h1 class="page-title">Form Pengkajian Awal Pasien</h1>
        <p class="page-subtitle">
          Input pengkajian awal pasien rawat jalan sebelum pemeriksaan dokter
        </p>
      </div>

      <div class="d-flex gap-2">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-arrow-left"
          @click="$router.back()"
        >
          Kembali
        </v-btn>
      </div>
    </div>

    <v-card class="main-card">
      <div class="section-header">Form Pengkajian Awal</div>

      <v-card-text class="pa-5">
        <v-alert type="info" class="mb-6">
          Lengkapi pengkajian awal pasien sebelum melanjutkan ke form SOAP.
        </v-alert>

        <div class="form-group-title">Data Pasien</div>

        <div class="block-section mb-6">
          <div class="form-section-title text-center mb-5">
            PENGKAJIAN AWAL PASIEN RAWAT JALAN
          </div>

          <div class="sub-block-title">Identitas Pasien</div>

          <div class="patient-detail-card">
            <div class="patient-detail-grid">
              <div class="patient-detail-item patient-detail-item--wide">
                <div class="patient-detail-label">Nama</div>
                <div class="patient-detail-value">{{ patient.nama }}</div>
              </div>

              <div class="patient-detail-item">
                <div class="patient-detail-label">Tgl Lahir</div>
                <div class="patient-detail-value">{{ patient.tgl_lahir }}</div>
              </div>

              <div class="patient-detail-item">
                <div class="patient-detail-label">Tanggal Input</div>
                <div class="patient-detail-value">
                  {{ patient.tanggal_input }}
                </div>
              </div>

              <div class="patient-detail-item patient-detail-item--wide">
                <div class="patient-detail-label">No. RM</div>
                <div class="patient-detail-value">{{ patient.no_rm }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Anamnesis (S)</div>

        <div class="block-section mb-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.keluhan_utama"
                label="Keluhan Utama"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.keluhan_tambahan"
                label="Keluhan Tambahan"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.riwayat_penyakit_sekarang"
                label="Riwayat Penyakit Sekarang"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.riwayat_penyakit_dahulu"
                label="Riwayat Penyakit Dahulu"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.riwayat_penyakit_keluarga"
                label="Riwayat Penyakit Keluarga"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Pemeriksaan Fisik Umum (O)</div>

        <div class="block-section mb-6">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.keadaan_umum"
                label="Keadaan Umum"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.kesadaran_gcs"
                label="Kesadaran (GCS)"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model="form.gcs_e"
                label="E"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model="form.gcs_v"
                label="V"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model="form.gcs_m"
                label="M"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <div class="inner-divider"></div>

          <div
            v-for="item in pemeriksaanItems"
            :key="item.key"
            class="exam-row"
          >
            <v-row align="center">
              <v-col cols="12" md="3">
                <div class="exam-label">{{ item.label }}</div>
              </v-col>

              <v-col cols="12" md="4">
                <v-radio-group
                  v-model="form[item.key].status"
                  inline
                  hide-details
                  density="comfortable"
                >
                  <v-radio label="Normal" value="Normal" />
                  <v-radio label="Abnormal" value="Abnormal" />
                </v-radio-group>
              </v-col>

              <v-col cols="12" md="5">
                <v-text-field
                  v-model="form[item.key].keterangan"
                  label="Keterangan Abnormal"
                  variant="outlined"
                  density="comfortable"
                  :disabled="form[item.key].status !== 'Abnormal'"
                />
              </v-col>
            </v-row>
          </div>
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Pemeriksaan Fisik Khusus</div>

        <div class="block-section mb-6">
          <v-textarea
            v-model="form.pemeriksaan_fisik_khusus"
            label="Pemeriksaan Fisik Khusus"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Pemeriksaan Penunjang</div>

        <div class="block-section mb-6">
          <v-textarea
            v-model="form.pemeriksaan_penunjang"
            label="Pemeriksaan Penunjang"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Diagnosa (A)</div>

        <div class="block-section mb-6">
          <v-textarea
            v-model="form.diagnosa"
            label="Diagnosa"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Rencana Terapi (P)</div>

        <div class="block-section mb-6">
          <v-textarea
            v-model="form.rencana_terapi"
            label="Rencana Terapi"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Rencana Tindak Lanjut</div>

        <div class="block-section mb-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.rujuk_ke"
                label="Rujuk Ke"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.jadwal_kontrol"
                label="Jadwal Kontrol"
                type="date"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </div>

        <div class="form-divider"></div>
        <div class="form-group-title">Edukasi Pasien</div>

        <div class="block-section mb-6">
          <v-row>
            <v-col cols="12" md="7">
              <div class="sub-block-title mb-4">
                Telah diinformasikan kepada pasien/keluarga mengenai:
              </div>

              <v-checkbox
                v-model="form.edukasi.hasil_pemeriksaan"
                label="Hasil Pemeriksaan"
                hide-details
                class="mb-2"
              />

              <v-checkbox
                v-model="form.edukasi.tindakan_medis"
                label="Tindakan medis, pengobatan, dan risiko"
                hide-details
                class="mb-2"
              />

              <v-checkbox
                v-model="form.edukasi.komplikasi"
                label="Komplikasi yang mungkin terjadi"
                hide-details
                class="mb-2"
              />
            </v-col>

            <v-col cols="12" md="5">
              <div class="sub-block-title mb-4">Pemahaman Pasien</div>

              <v-radio-group
                v-model="form.pemahaman_pasien"
                hide-details
                density="comfortable"
              >
                <v-radio label="Paham" value="Paham" />
                <v-radio label="Tidak Paham" value="Tidak Paham" />
              </v-radio-group>
            </v-col>
          </v-row>

          <div class="inner-divider"></div>

          <v-row>
            <v-col cols="12" md="6">
              <div class="signature-box">
                <div class="signature-title">Penerima Informasi</div>
                <div class="signature-name">({{ patient.nama }})</div>
                <div class="signature-subtitle">Tanda Tangan & Nama Terang</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="signature-box">
                <div class="signature-title">Nama Dokter</div>
                <div class="signature-name">
                  ({{
                    form.nama_dokter || "Dokter Belum Input Pengkajian Awal"
                  }})
                </div>
                <div class="signature-subtitle">Tanda Tangan & Nama Terang</div>
              </div>
            </v-col>
          </v-row>
        </div>

        <div class="footer-actions">
          <v-btn
            variant="outlined"
            color="secondary"
            size="large"
            @click="$router.back()"
          >
            Batal
          </v-btn>

          <v-btn
            color="success"
            size="large"
            prepend-icon="mdi-content-save"
            @click="submitForm"
          >
            Simpan
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "IsiPengkajianAwal",
  data() {
    return {
      patient: {
        nama: "ADE RAMADHANA PRATAMA (tak buat tes kak)",
        no_rm: "A20250802003",
        tgl_lahir: "1999-01-03",
        tanggal_input: "2026-04-20",
      },

      pemeriksaanItems: [
        { key: "tht", label: "THT" },
        { key: "kepala", label: "Kepala" },
        { key: "mata", label: "Mata" },
        { key: "leher", label: "Leher" },
        { key: "paru", label: "Paru" },
        { key: "jantung", label: "Jantung" },
        { key: "abdomen", label: "Abdomen" },
        { key: "ekstremitas", label: "Ekstremitas" },
        { key: "kulit", label: "Kulit" },
      ],

      form: {
        keluhan_utama: "",
        keluhan_tambahan: "",
        riwayat_penyakit_sekarang: "",
        riwayat_penyakit_dahulu: "",
        riwayat_penyakit_keluarga: "",

        keadaan_umum: "",
        kesadaran_gcs: "",
        gcs_e: "",
        gcs_v: "",
        gcs_m: "",

        tht: { status: "Normal", keterangan: "" },
        kepala: { status: "Normal", keterangan: "" },
        mata: { status: "Normal", keterangan: "" },
        leher: { status: "Normal", keterangan: "" },
        paru: { status: "Normal", keterangan: "" },
        jantung: { status: "Normal", keterangan: "" },
        abdomen: { status: "Normal", keterangan: "" },
        ekstremitas: { status: "Normal", keterangan: "" },
        kulit: { status: "Normal", keterangan: "" },

        pemeriksaan_fisik_khusus: "",
        pemeriksaan_penunjang: "",
        diagnosa: "",
        rencana_terapi: "",
        rujuk_ke: "",
        jadwal_kontrol: "",

        edukasi: {
          hasil_pemeriksaan: false,
          tindakan_medis: false,
          komplikasi: false,
        },

        pemahaman_pasien: "Paham",
        nama_dokter: "",
      },
    };
  },

  methods: {
    submitForm() {
      const payload = {
        patient: this.patient,
        form: this.form,
      };

      console.log("Submit Pengkajian Awal:", payload);

      this.$router.push(
        `/pelayanan-medis/antrian-konsultasi/${this.$route.params.id}/isi-soap`,
      );
    },
  },
};
</script>

<style scoped>
.pengkajian-page {
  padding-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.gap-2 {
  gap: 8px;
}

.main-card {
  border-radius: 10px !important;
  border: 1px solid #e5e7eb;
  box-shadow: none !important;
  overflow: hidden;
}

.section-header {
  font-size: 18px;
  font-weight: 700;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.form-group-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

.form-divider {
  border-top: 1px solid #e5e7eb;
  margin: 28px 0 24px;
}

.inner-divider {
  border-top: 1px solid #e5e7eb;
  margin: 20px 0;
}

.block-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}

.form-section-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: #111827;
}

.sub-block-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.exam-row {
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.exam-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.exam-label {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.signature-box {
  min-height: 170px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background: #fafafa;
}

.signature-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 18px;
}

.signature-name {
  font-size: 16px;
  margin-bottom: 18px;
}

.signature-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

:deep(.v-field) {
  border-radius: 6px !important;
}

:deep(.v-selection-control) {
  min-height: 32px;
}

@media (max-width: 960px) {
  .form-section-title {
    font-size: 22px;
    text-align: left;
  }

  .footer-actions {
    justify-content: flex-start;
  }
}
</style>

<template>
  <section class="content">
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengkajian Awal Pasien</h1>
        <p class="page-subtitle">Ringkasan pengkajian awal pasien</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>
    <div class="card">
      <div class="card-body">
        <v-alert v-if="errorMessage" type="error" class="mb-4" closable>
          {{ errorMessage }}
        </v-alert>
        <v-form @submit.prevent="submitForm">
          <input
            type="hidden"
            name="pasien_new_id"
            :value="form.pasien_new_id"
          />
          <!-- IDENTITAS PASIEN -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: center;
                    padding: 10px;
                    font-size: 24px;
                    border-bottom: 1px solid black;
                  "
                >
                  PENGKAJIAN AWAL PASIEN RAWAT JALAN
                </th>
              </tr>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  IDENTITAS PASIEN
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 20%; padding: 5px">Nama:</td>
                <td
                  style="
                    width: 30%;
                    padding: 5px;
                    border-right: 1px solid black;
                  "
                >
                  {{ form.nama || "Data tidak ditemukan" }}
                </td>
                <td style="width: 20%; padding: 5px">Tgl Lahir:</td>
                <td style="width: 30%; padding: 5px">
                  {{ form.tgl_lahir || "Data tidak ditemukan" }}
                </td>
              </tr>
              <tr>
                <td style="width: 20%; padding: 5px">No. RM:</td>
                <td
                  style="
                    width: 30%;
                    padding: 5px;
                    border-right: 1px solid black;
                  "
                >
                  {{ form.no_rm || "Data tidak ditemukan" }}
                </td>
                <td style="width: 20%; padding: 5px">Tanggal Input:</td>
                <td style="width: 30%; padding: 5px">
                  {{ form.tanggal_input }}
                </td>
              </tr>
            </tbody>
          </table>
          <!-- ANAMNESIS -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  ANAMNESIS (S)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 5%; padding: 5px">1.</td>
                <td
                  style="
                    width: 35%;
                    padding: 5px;
                    border-right: 1px solid black;
                  "
                >
                  Keluhan Utama
                </td>
                <td
                  colspan="2"
                  style="
                    width: 60%;
                    padding: 5px;
                    border-bottom: 1px solid black;
                  "
                >
                  <v-text-field
                    v-model="form.s_keluhan_utama"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="Masukkan keluhan utama"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
              <tr>
                <td style="width: 5%; padding: 5px">2.</td>
                <td
                  style="
                    width: 35%;
                    padding: 5px;
                    border-right: 1px solid black;
                  "
                >
                  Riwayat Penyakit Sekarang
                </td>
                <td
                  colspan="2"
                  style="
                    width: 60%;
                    padding: 5px;
                    border-bottom: 1px solid black;
                  "
                >
                  <v-textarea
                    v-model="form.s_riwayat_penyakit_sekarang"
                    class="boxed-textarea"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    rows="2"
                    auto-grow
                    no-resize
                    placeholder="Masukkan riwayat penyakit sekarang"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
              <tr>
                <td style="width: 5%; padding: 5px">3.</td>
                <td
                  style="
                    width: 35%;
                    padding: 5px;
                    border-right: 1px solid black;
                  "
                >
                  Riwayat Penyakit Dahulu
                </td>
                <td
                  colspan="2"
                  style="
                    width: 60%;
                    padding: 5px;
                    border-bottom: 1px solid black;
                  "
                >
                  <v-textarea
                    v-model="form.s_riwayat_penyakit_dahulu"
                    class="boxed-textarea"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    rows="2"
                    auto-grow
                    no-resize
                    placeholder="Masukkan riwayat penyakit dahulu"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
              <tr>
                <td style="width: 5%; padding: 5px">4.</td>
                <td
                  style="
                    width: 35%;
                    padding: 5px;
                    border-right: 1px solid black;
                  "
                >
                  Riwayat Penyakit Keluarga
                </td>
                <td
                  colspan="2"
                  style="
                    width: 60%;
                    padding: 5px;
                    border-bottom: 1px solid black;
                  "
                >
                  <v-text-field
                    v-model="form.s_riwayat_penyakit_keluarga"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="Masukkan riwayat penyakit keluarga"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <!-- PEMERIKSAAN FISIK UMUM -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="5"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  PEMERIKSAAN FISIK UMUM (O)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 20%; padding: 5px">Keadaan Umum:</td>
                <td colspan="4" style="width: 80%; padding: 5px">
                  <v-text-field
                    v-model="form.o_keadaan_umum"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="Masukkan keadaan umum"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
              <tr>
                <td style="width: 20%; padding: 5px">Kesadaran (GCS):</td>
                <td style="width: 20%; padding: 5px">
                  <v-text-field
                    v-model="form.o_GCS"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="Contoh: Compos Mentis"
                    :readonly="readonlyMode"
                  />
                </td>
                <td style="width: 20%; padding: 5px">
                  <div class="mb-1">E:</div>
                  <v-text-field
                    v-model="form.o_eye_GCS"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="E"
                    :readonly="readonlyMode"
                  />
                </td>
                <td style="width: 20%; padding: 5px">
                  <div class="mb-1">V:</div>
                  <v-text-field
                    v-model="form.o_verbal_GCS"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="V"
                    :readonly="readonlyMode"
                  />
                </td>
                <td style="width: 20%; padding: 5px">
                  <div class="mb-1">M:</div>
                  <v-text-field
                    v-model="form.o_motor_GCS"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="M"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
              <tr v-for="item in pemeriksaanList" :key="item.label">
                <td style="width: 20%; padding: 5px">{{ item.label }}:</td>
                <td colspan="2" style="width: 40%; padding: 5px">
                  <v-radio-group
                    v-model="form[item.checklistKey]"
                    inline
                    hide-details
                    class="table-radio"
                    :disabled="readonlyMode"
                  >
                    <v-radio label="Normal" :value="1" />
                    <v-radio label="Abnormal" :value="2" />
                  </v-radio-group>
                </td>
                <td colspan="3" style="width: 40%; padding: 5px">
                  <v-text-field
                    v-model="form[item.keteranganKey]"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="Masukkan keterangan abnormal"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <!-- PEMERIKSAAN FISIK KHUSUS -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  PEMERIKSAAN FISIK KHUSUS
                  <v-textarea
                    v-model="form.pemeriksaan_fisik_khusus"
                    class="boxed-textarea mt-2"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    rows="2"
                    auto-grow
                    no-resize
                    placeholder="Masukkan pemeriksaan fisik khusus"
                    :readonly="readonlyMode"
                  />
                </th>
              </tr>
            </thead>
          </table>
          <!-- PEMERIKSAAN PENUNJANG -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  PEMERIKSAAN PENUNJANG
                  <v-textarea
                    v-model="form.pemeriksaan_penunjang"
                    class="boxed-textarea mt-2"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    rows="2"
                    auto-grow
                    no-resize
                    placeholder="Masukkan pemeriksaan penunjang"
                    :readonly="readonlyMode"
                  />
                </th>
              </tr>
            </thead>
          </table>
          <!-- DIAGNOSA -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  DIAGNOSA (A)
                  <v-textarea
                    v-model="form.a_diagnosa"
                    class="boxed-textarea mt-2"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    rows="2"
                    auto-grow
                    no-resize
                    placeholder="Masukkan diagnosa"
                    :readonly="readonlyMode"
                  />
                </th>
              </tr>
            </thead>
          </table>
          <!-- RENCANA TERAPI -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  RENCANA TERAPI (P)
                  <v-textarea
                    v-model="form.p_rencana_terapi"
                    class="boxed-textarea mt-2"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    rows="2"
                    auto-grow
                    no-resize
                    placeholder="Masukkan rencana terapi"
                    :readonly="readonlyMode"
                  />
                </th>
              </tr>
            </thead>
          </table>
          <!-- RENCANA TINDAK LANJUT -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  RENCANA TINDAK LANJUT
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 5%; padding: 5px">1.</td>
                <td
                  style="
                    width: 35%;
                    padding: 5px;
                    border-right: 1px solid black;
                  "
                >
                  Rujuk Ke
                </td>
                <td
                  colspan="2"
                  style="
                    width: 60%;
                    padding: 5px;
                    border-bottom: 1px solid black;
                  "
                >
                  <v-text-field
                    v-model="form.rujuk_ke"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="Masukkan tujuan rujukan"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
              <tr>
                <td style="width: 5%; padding: 5px">2.</td>
                <td
                  style="
                    width: 35%;
                    padding: 5px;
                    border-right: 1px solid black;
                  "
                >
                  Jadwal Kontrol
                </td>
                <td
                  colspan="2"
                  style="
                    width: 60%;
                    padding: 5px;
                    border-bottom: 1px solid black;
                  "
                >
                  <v-text-field
                    v-model="form.tanggal_kontrol"
                    class="boxed-input"
                    variant="outlined"
                    hide-details
                    density="comfortable"
                    placeholder="Contoh: 2025-04-08"
                    :readonly="readonlyMode"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <!-- EDUKASI PASIEN -->
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid black;
              margin-top: 20px;
            "
          >
            <thead>
              <tr>
                <th
                  colspan="4"
                  style="
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid black;
                  "
                >
                  EDUKASI PASIEN
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colspan="2"
                  style="
                    padding: 10px;
                    border-right: 1px solid black;
                    vertical-align: top;
                  "
                >
                  <p class="mb-2">
                    Telah diinformasikan kepada pasien/keluarga mengenai:
                  </p>
                  <v-checkbox
                    v-model="form.info_hasil_pemeriksaan"
                    label="Hasil Pemeriksaan"
                    hide-details
                    density="compact"
                    class="table-check"
                    :disabled="readonlyMode"
                  />
                  <v-checkbox
                    v-model="form.info_tindakan_pengobatan_resiko"
                    label="Tindakan medis, pengobatan, dan risiko"
                    hide-details
                    density="compact"
                    class="table-check"
                    :disabled="readonlyMode"
                  />
                  <v-checkbox
                    v-model="form.info_kemungkinan_komplikasi"
                    label="Komplikasi yang mungkin terjadi"
                    hide-details
                    density="compact"
                    class="table-check"
                    :disabled="readonlyMode"
                  />
                </td>
                <td colspan="2" style="padding: 10px; vertical-align: top">
                  <p class="mb-2">Pemahaman Pasien:</p>
                  <v-radio-group
                    v-model="form.status_paham_pasien"
                    hide-details
                    class="table-radio"
                    :disabled="readonlyMode"
                  >
                    <v-radio label="Paham" :value="1" />
                    <v-radio label="Tidak Paham" :value="0" />
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="
                    padding: 10px;
                    text-align: center;
                    border-top: 1px solid black;
                    border-right: 1px solid black;
                  "
                >
                  <p>Penerima Informasi</p>
                  <p>( {{ form.nama || "Data tidak ditemukan" }} )</p>
                  <p>Tanda Tangan &amp; Nama Terang</p>
                </td>
                <td
                  colspan="2"
                  style="
                    padding: 10px;
                    text-align: center;
                    border-top: 1px solid black;
                  "
                >
                  <p>Nama Dokter</p>
                  <p>( {{ form.nama_karyawan || "Data tidak ditemukan" }} )</p>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="d-flex justify-center ga-3 mt-6">
            <v-btn
              type="button"
              variant="outlined"
              color="secondary"
              @click="resetForm"
            >
              Reset Dummy
            </v-btn>
            <v-btn type="submit" color="primary"> Simpan </v-btn>
          </div>
        </v-form>
      </div>
    </div>
  </section>
</template>
<script>
function getDummyForm(id) {
  return {
    pasien_new_id: id ? `PSN-${id}` : "PSN-001",
    nama: "Anisa Putri",
    tgl_lahir: "1998-04-12",
    no_rm: "RM-000123",
    tanggal_input: new Date().toISOString().slice(0, 10),
    nama_karyawan: "dr. Budi Santoso",
    s_keluhan_utama: "",
    s_riwayat_penyakit_sekarang: "",
    s_riwayat_penyakit_dahulu: "",
    s_riwayat_penyakit_keluarga: "",
    o_keadaan_umum: "",
    o_GCS: "",
    o_eye_GCS: "",
    o_verbal_GCS: "",
    o_motor_GCS: "",
    o_keadaan_tht_checklist: 1,
    o_keadaan_tht: "",
    o_keadaan_kepala_checklist: 1,
    o_keadaan_kepala: "",
    o_keadaan_mata_checklist: 1,
    o_keadaan_mata: "",
    o_keadaan_leher_checklist: 1,
    o_keadaan_leher: "",
    o_keadaan_paru_checklist: 1,
    o_keadaan_paru: "",
    o_keadaan_jantung_checklist: 1,
    o_keadaan_jantung: "",
    o_keadaan_abdomen_checklist: 1,
    o_keadaan_abdomen: "",
    o_keadaan_ekstremitas_checklist: 1,
    o_keadaan_ekstremitas: "",
    o_keadaan_kulit_checklist: 1,
    o_keadaan_kulit: "",
    pemeriksaan_fisik_khusus: "",
    pemeriksaan_penunjang: "",
    a_diagnosa: "",
    p_rencana_terapi: "",
    rujuk_ke: "",
    tanggal_kontrol: "",
    info_hasil_pemeriksaan: false,
    info_tindakan_pengobatan_resiko: false,
    info_kemungkinan_komplikasi: false,
    status_paham_pasien: 1,
  };
}

export default {
  name: "PengkajianAwal",
  data() {
    return {
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Pasien", disabled: false, to: "/master/pasien" },
        { title: "Riwayat", disabled: true },
        { title: "Pengkajian Awal", disabled: true },
      ],
      readonlyMode: false,
      errorMessage: "",
      pemeriksaanList: [
        {
          label: "THT",
          checklistKey: "o_keadaan_tht_checklist",
          keteranganKey: "o_keadaan_tht",
        },
        {
          label: "Kepala",
          checklistKey: "o_keadaan_kepala_checklist",
          keteranganKey: "o_keadaan_kepala",
        },
        {
          label: "Mata",
          checklistKey: "o_keadaan_mata_checklist",
          keteranganKey: "o_keadaan_mata",
        },
        {
          label: "Leher",
          checklistKey: "o_keadaan_leher_checklist",
          keteranganKey: "o_keadaan_leher",
        },
        {
          label: "Paru",
          checklistKey: "o_keadaan_paru_checklist",
          keteranganKey: "o_keadaan_paru",
        },
        {
          label: "Jantung",
          checklistKey: "o_keadaan_jantung_checklist",
          keteranganKey: "o_keadaan_jantung",
        },
        {
          label: "Abdomen",
          checklistKey: "o_keadaan_abdomen_checklist",
          keteranganKey: "o_keadaan_abdomen",
        },
        {
          label: "Ekstremitas",
          checklistKey: "o_keadaan_ekstremitas_checklist",
          keteranganKey: "o_keadaan_ekstremitas",
        },
        {
          label: "Kulit",
          checklistKey: "o_keadaan_kulit_checklist",
          keteranganKey: "o_keadaan_kulit",
        },
      ],
      form: getDummyForm(this.$route.params.id),
    };
  },
  methods: {
    getDummyForm,

    resetForm() {
      Object.assign(this.form, this.getDummyForm(this.$route.params.id));
    },

    submitForm() {
      const payload = JSON.parse(JSON.stringify(this.form));
      console.log("submit pengkajian awal", payload);
    },
  },
  watch: {
    "$route.params.id"(newId) {
      Object.assign(this.form, this.getDummyForm(newId));
    },
  },
};
</script>
<style scoped>
.boxed-input,
.boxed-textarea {
  margin: 0;
}
.boxed-input :deep(.v-input__details),
.boxed-textarea :deep(.v-input__details),
.table-radio :deep(.v-input__details),
.table-check :deep(.v-input__details) {
  display: none !important;
}
.boxed-input :deep(.v-field),
.boxed-textarea :deep(.v-field) {
  background: #fff !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}
.boxed-input :deep(.v-field__outline),
.boxed-textarea :deep(.v-field__outline) {
  --v-field-border-opacity: 1 !important;
}
.boxed-input :deep(.v-field__input) {
  min-height: 40px !important;
  padding: 0 12px !important;
  color: #000 !important;
}
.boxed-textarea :deep(.v-field__input) {
  padding: 8px 12px !important;
  color: #000 !important;
}
.boxed-input :deep(input),
.boxed-textarea :deep(textarea) {
  color: #000 !important;
  -webkit-text-fill-color: #000 !important;
  opacity: 1 !important;
  font-size: 14px !important;
  line-height: 1.45 !important;
}
.boxed-input :deep(input::placeholder),
.boxed-textarea :deep(textarea::placeholder) {
  color: #777 !important;
  opacity: 1 !important;
}
.boxed-input :deep(.v-field--focused),
.boxed-textarea :deep(.v-field--focused) {
  box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.15) !important;
}
.boxed-input :deep(.v-field--disabled),
.boxed-textarea :deep(.v-field--disabled) {
  opacity: 1 !important;
  background: #f8f8f8 !important;
}
.table-radio {
  margin: 0;
  padding: 0;
}
.table-radio :deep(.v-selection-control-group) {
  gap: 12px;
}
.table-radio :deep(.v-selection-control) {
  min-height: 24px !important;
}
.table-radio :deep(.v-label),
.table-check :deep(.v-label) {
  color: #000 !important;
  opacity: 1 !important;
}
.table-check {
  margin: 0;
}
.table-check :deep(.v-selection-control) {
  min-height: 28px !important;
}
</style>

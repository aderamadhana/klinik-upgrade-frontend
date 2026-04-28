<template>
  <div>
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title">Registrasi Pasien Klinik</h1>
        <p class="page-subtitle">Tambahkan data pasien baru ke sistem</p>
      </div>
    </div>

    <v-card rounded="lg" elevation="1">
      <v-card-title class="text-h6 font-weight-bold px-6 py-4">
        Form Registrasi Pasien Klinik
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-alert type="info" variant="tonal" density="comfortable" class="mb-6">
          Isi data pasien terlebih dahulu. Kolom bertanda * wajib diisi.
        </v-alert>

        <v-form ref="formRef">
          <div class="text-subtitle-2 font-weight-bold mb-4">
            Informasi Utama
          </div>

          <v-row dense>
            <v-col cols="12" md="9">
              <v-text-field
                v-model="form.nama_pasien"
                label="Nama Pasien *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.tipe_pasien"
                :items="['Pasien', 'Non Pasien']"
                label="Tipe Pasien"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.no_rm"
                label="No. RM"
                variant="outlined"
                density="comfortable"
                readonly
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.no_identitas"
                label="KTP/SIM/Passport *"
                placeholder="16 Digit Nomor Pengenal"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_reseller"
                label="No. Reseller"
                placeholder="Optional"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.downline_dari"
                :items="downlineOptions"
                label="Downline dari"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mt-6 mb-4">
            Alamat Pasien
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.provinsi"
                :items="provinsiOptions"
                label="Provinsi"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.kota"
                :items="kotaOptions"
                label="Kota/Kabupaten"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.kecamatan"
                :items="kecamatanOptions"
                label="Kecamatan"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.kelurahan"
                :items="kelurahanOptions"
                label="Kelurahan/Desa"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.alamat_detail"
                label="Alamat Detail *"
                rows="3"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mt-6 mb-4">
            Data Pribadi
          </div>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.jenis_kelamin"
                :items="jenisKelaminOptions"
                label="Jenis Kelamin *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.pekerjaan"
                :items="pekerjaanOptions"
                label="Pekerjaan *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.status_pernikahan"
                :items="statusPernikahanOptions"
                label="Status Pernikahan"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.agama"
                :items="agamaOptions"
                label="Agama *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.tempat_lahir"
                label="Tempat Lahir *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.tanggal_lahir"
                label="Tanggal Lahir *"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mt-6 mb-4">
            Kontak Pasien
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_telp"
                label="No. Telp"
                placeholder="Optional / Isi jika ada nomor lain"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_hp"
                label="No. HP *"
                prefix="+62"
                placeholder="81122334455"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Email *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_wa"
                label="No. WA"
                prefix="+62"
                placeholder="8123456789"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.sumber_info"
                label="Sumber Info"
                placeholder="Optional"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mt-6 mb-4">
            Informasi Tambahan
          </div>

          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.alergi_obat"
                label="Alergi Obat"
                placeholder="Optional"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.masalah_kulit"
                label="Masalah Kulit"
                placeholder="Optional"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.catatan"
                label="Catatan"
                placeholder="Optional"
                rows="3"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.nb"
                label="NB"
                placeholder="Optional"
                rows="3"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn
          color="success"
          variant="tonal"
          prepend-icon="mdi-account-key"
          @click="buatTokenRegistrasi"
        >
          Buat Token Registrasi Pasien Mandiri
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-content-save"
          @click="submitForm"
        >
          Tambahkan
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AddPasien",

  data() {
    return {
      form: {
        nama_pasien: "",
        tipe_pasien: "Pasien",
        no_rm: "I20260424001",
        no_identitas: "",
        no_reseller: "",
        downline_dari: "Elite Glowbal",

        provinsi: null,
        kota: null,
        kecamatan: null,
        kelurahan: null,
        alamat_detail: "",

        jenis_kelamin: null,
        pekerjaan: null,
        status_pernikahan: null,
        agama: null,

        tempat_lahir: "",
        tanggal_lahir: "",
        no_telp: "",
        no_hp: "",
        email: "",
        no_wa: "",
        sumber_info: "",

        alergi_obat: "",
        masalah_kulit: "",
        catatan: "",
        nb: "",
      },

      downlineOptions: ["Elite Glowbal"],

      jenisKelaminOptions: [
        { title: "Laki-laki", value: "L" },
        { title: "Perempuan", value: "P" },
      ],

      pekerjaanOptions: [
        "Pelajar/Mahasiswa",
        "Karyawan",
        "Wiraswasta",
        "Ibu Rumah Tangga",
        "Lainnya",
      ],

      statusPernikahanOptions: ["Belum Menikah", "Menikah", "Cerai"],

      agamaOptions: [
        "Islam",
        "Kristen",
        "Katolik",
        "Hindu",
        "Buddha",
        "Konghucu",
      ],

      provinsiOptions: [],
      kotaOptions: [],
      kecamatanOptions: [],
      kelurahanOptions: [],
    };
  },

  methods: {
    required(value) {
      return !!value || "Field wajib diisi";
    },

    submitForm() {
      console.log("submit pasien", this.form);
    },

    buatTokenRegistrasi() {
      console.log("buat token registrasi mandiri", this.form);
    },
  },
};
</script>

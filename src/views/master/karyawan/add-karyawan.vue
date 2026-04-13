<template>
  <v-container fluid>
    <v-col cols="12" md="10" lg="8">
      <v-card elevation="2" rounded="lg">
        <v-toolbar color="info" density="comfortable">
          <v-toolbar-title>
            {{ isEdit ? "Edit Karyawan" : "Tambah Karyawan" }}
          </v-toolbar-title>
        </v-toolbar>

        <v-alert
          v-if="errorMessages.length"
          type="error"
          variant="tonal"
          class="ma-4"
        >
          <div v-for="(err, i) in errorMessages" :key="i">
            {{ err }}
          </div>
        </v-alert>

        <v-form @submit.prevent="submitForm">
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="form.jabatan_id"
                  :items="jabatans"
                  item-title="nama"
                  item-value="id"
                  label="Jabatan"
                  placeholder="Pilih Jabatan"
                  variant="outlined"
                  prepend-inner-icon="mdi-briefcase-account"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.nik"
                  label="NIK"
                  placeholder="Masukkan NIK"
                  variant="outlined"
                  prepend-inner-icon="mdi-card-account-details-outline"
                  maxlength="16"
                  counter="16"
                  inputmode="numeric"
                  required
                  @input="onInputNik"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.no_telp"
                  label="No. Telp"
                  placeholder="Masukkan nomor telepon"
                  variant="outlined"
                  prepend-inner-icon="mdi-phone"
                  inputmode="numeric"
                  required
                  @input="onInputTelp"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.nama"
                  label="Nama"
                  placeholder="Masukkan nama karyawan"
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  required
                  @input="onInputNama"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.alamat"
                  label="Alamat"
                  placeholder="Masukkan alamat"
                  variant="outlined"
                  prepend-inner-icon="mdi-map-marker"
                  rows="3"
                  auto-grow
                  required
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-expand-transition>
              <div v-if="showDokterFields">
                <v-row dense>
                  <v-col cols="12">
                    <div class="text-subtitle-1 mb-3">Informasi Dokter</div>
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      v-model="form.no_sip_dok"
                      label="No. SIP Dokter"
                      placeholder="Masukkan nomor SIP dokter"
                      variant="outlined"
                      prepend-inner-icon="mdi-file-document-outline"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-switch
                      v-model="form.is_spesialis"
                      :true-value="1"
                      :false-value="0"
                      color="info"
                      inset
                      label="Apakah Dokter Spesialis?"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>
          </v-card-text>

          <v-divider />

          <v-card-actions class="px-6 py-4">
            <v-spacer />

            <v-btn variant="tonal" color="grey" @click="resetForm">
              Reset
            </v-btn>

            <v-btn type="submit" color="info" variant="flat">
              {{ isEdit ? "Edit Karyawan" : "Tambah Karyawan" }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-col>
  </v-container>
</template>

<script>
export default {
  name: "FormKaryawan",
  data() {
    return {
      errorMessages: [],
      jabatans: [
        // { id: 1, nama: "DOKTER" },
        // { id: 2, nama: "NURSE" },
      ],
      karyawan: null,
      form: {
        jabatan_id: "",
        nik: "",
        nama: "",
        alamat: "",
        no_telp: "",
        no_sip_dok: "",
        is_spesialis: 0,
      },
    };
  },

  computed: {
    isEdit() {
      return !!this.karyawan;
    },
    showDokterFields() {
      return String(this.form.jabatan_id) === "1";
    },
  },

  mounted() {
    this.initForm();
  },

  methods: {
    initForm() {
      if (!this.karyawan) return;

      this.form.jabatan_id = this.karyawan.jabatan_id ?? "";
      this.form.nik = this.karyawan.NIK ?? "";
      this.form.nama = this.karyawan.nama ?? "";
      this.form.alamat = this.karyawan.alamat ?? "";
      this.form.no_telp = this.karyawan.no_telp ?? "";
      this.form.no_sip_dok = this.karyawan.no_sip_dok ?? "";
      this.form.is_spesialis = this.karyawan.is_dokter_spesialis == 1 ? 1 : 0;
    },

    onInputNik() {
      this.form.nik = String(this.form.nik).replace(/\D/g, "").slice(0, 16);
    },

    onInputNama() {
      this.form.nama = String(this.form.nama).toUpperCase();
    },

    onInputTelp() {
      this.form.no_telp = String(this.form.no_telp).replace(/\D/g, "");
    },

    validateForm() {
      const errors = [];

      if (!this.form.jabatan_id) errors.push("Jabatan wajib dipilih");
      if (!this.form.nik) errors.push("NIK wajib diisi");
      if (this.form.nik && this.form.nik.length > 16) {
        errors.push("NIK maksimal 16 digit");
      }
      if (!this.form.nama) errors.push("Nama wajib diisi");
      if (!this.form.alamat) errors.push("Alamat wajib diisi");
      if (!this.form.no_telp) errors.push("No. Telp wajib diisi");

      this.errorMessages = errors;
      return errors.length === 0;
    },

    submitForm() {
      if (!this.validateForm()) return;

      const payload = {
        jabatan_id: this.form.jabatan_id,
        nik: this.form.nik,
        nama: this.form.nama,
        alamat: this.form.alamat,
        no_telp: this.form.no_telp,
        no_sip_dok: this.showDokterFields ? this.form.no_sip_dok : "",
        is_spesialis: this.showDokterFields ? this.form.is_spesialis : 0,
      };

      console.log("submit payload:", payload);
    },

    resetForm() {
      this.form = {
        jabatan_id: "",
        nik: "",
        nama: "",
        alamat: "",
        no_telp: "",
        no_sip_dok: "",
        is_spesialis: 0,
      };
      this.errorMessages = [];
    },
  },

  watch: {
    "form.jabatan_id"(val) {
      if (String(val) !== "1") {
        this.form.no_sip_dok = "";
        this.form.is_spesialis = 0;
      }
    },
  },
};
</script>

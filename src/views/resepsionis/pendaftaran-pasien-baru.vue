<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Registrasi Pasien</h1>
        <p class="page-subtitle">
          Lengkapi data identitas, kontak, dan informasi dasar pasien
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-form ref="formRef" v-model="isFormValid">
      <!-- Section: Identitas -->
      <v-card class="mb-4" rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Identitas Pasien
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_rm"
                label="Nomor Rekam Medis"
                variant="outlined"
                density="comfortable"
                readonly
                prepend-inner-icon="mdi-card-account-details-outline"
                hint="Nomor dibuat otomatis oleh sistem"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.nama"
                label="Nama Lengkap"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
                :rules="[rules.required]"
                placeholder="Masukkan nama lengkap pasien"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.ktp_passport"
                label="KTP / SIM / Passport"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-card-bulleted-outline"
                :rules="[rules.required, rules.identityMin]"
                placeholder="Masukkan nomor identitas"
                hint="Pastikan nomor identitas belum pernah terdaftar"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.jenis_kelamin"
                label="Jenis Kelamin"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-human-male-female"
                :items="genderOptions"
                item-title="label"
                item-value="value"
                :rules="[rules.required]"
                placeholder="Pilih jenis kelamin"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.tempat_lahir"
                label="Tempat Lahir"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker-outline"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.tgl_lahir"
                label="Tanggal Lahir"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="calculatedAge"
                label="Umur"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-timer-sand"
                readonly
                hint="Dihitung otomatis dari tanggal lahir"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Section: Kontak -->
      <v-card class="mb-4" rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Kontak & Alamat
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.no_hp"
                label="Nomor HP"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cellphone"
                :rules="[rules.required, rules.phoneMin]"
                placeholder="Contoh: 081234567890"
                hint="Akan disimpan dalam format 62xxxxxxxxxx"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.no_wa"
                label="Nomor WhatsApp"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-whatsapp"
                :rules="[rules.required, rules.phoneMin]"
                placeholder="Contoh: 081234567890"
                hint="Akan disimpan dalam format 62xxxxxxxxxx"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.email"
                label="Email"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email-outline"
                :rules="[rules.email]"
                placeholder="nama@email.com"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_telp"
                label="Telepon Rumah / Lainnya"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-phone-outline"
                placeholder="Opsional"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.kota"
                label="Kota Domisili"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-city-variant-outline"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.form_prov"
                label="Provinsi"
                variant="outlined"
                density="comfortable"
                :items="provinceOptions"
                item-title="label"
                item-value="value"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.form_kab"
                label="Kabupaten / Kota"
                variant="outlined"
                density="comfortable"
                :items="cityOptions"
                item-title="label"
                item-value="value"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.form_kec"
                label="Kecamatan"
                variant="outlined"
                density="comfortable"
                :items="districtOptions"
                item-title="label"
                item-value="value"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.form_des"
                label="Desa / Kelurahan"
                variant="outlined"
                density="comfortable"
                :items="villageOptions"
                item-title="label"
                item-value="value"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.alamat"
                label="Alamat Lengkap"
                variant="outlined"
                density="comfortable"
                rows="3"
                prepend-inner-icon="mdi-home-outline"
                :rules="[rules.required]"
                placeholder="Masukkan alamat lengkap pasien"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Section: Informasi Pribadi -->
      <v-card class="mb-4" rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Informasi Pribadi
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.pekerjaan"
                label="Pekerjaan"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-briefcase-outline"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.status_pernikahan"
                label="Status Pernikahan"
                variant="outlined"
                density="comfortable"
                :items="maritalOptions"
                item-title="label"
                item-value="value"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.agama"
                label="Agama"
                variant="outlined"
                density="comfortable"
                :items="religionOptions"
                item-title="label"
                item-value="value"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.sumber_info"
                label="Sumber Informasi"
                variant="outlined"
                density="comfortable"
                :items="sourceInfoOptions"
                item-title="label"
                item-value="value"
                hint="Contoh: Instagram, teman, walk-in, Google"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.reseller_id"
                label="Reseller ID"
                variant="outlined"
                density="comfortable"
                placeholder="Opsional"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_reseller"
                label="Nomor Reseller"
                variant="outlined"
                density="comfortable"
                placeholder="Opsional"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.password"
                label="Password"
                type="password"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                hint="Isi jika akun pasien perlu dibuat"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Section: Medis -->
      <v-card rounded="lg">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Informasi Medis Tambahan
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="form.alergi_obat"
                label="Alergi Obat"
                variant="outlined"
                density="comfortable"
                rows="3"
                placeholder="Tuliskan jika ada"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-textarea
                v-model="form.masalah_kulit"
                label="Masalah Kulit"
                variant="outlined"
                density="comfortable"
                rows="3"
                placeholder="Tuliskan keluhan atau kondisi kulit"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.catatan"
                label="Catatan"
                variant="outlined"
                density="comfortable"
                rows="2"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.note"
                label="Catatan Internal"
                variant="outlined"
                density="comfortable"
                rows="2"
                hint="Digunakan untuk kebutuhan internal klinik"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-form>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
    <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
      <v-btn
        color="info"
        variant="flat"
        size="large"
        prepend-icon="mdi-content-save"
        @click="submitForm"
        :loading="loading"
      >
        Simpan Data Pasien
      </v-btn>

      <v-btn
        color="success"
        variant="flat"
        size="large"
        prepend-icon="mdi-key"
        @click="generateToken"
      >
        Buat Token Registrasi Mandiri
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "RegistrasiPasienPage",

  data() {
    return {
      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        {
          title: "Pendaftaran Pasien Baru",
          disabled: false,
          to: "/resepsionis/daftar-baru",
        },
      ],
      isFormValid: false,
      loading: false,

      form: {
        no_rm: "RM-2026-0001",
        nama: "",
        ktp_passport: "",
        jenis_kelamin: "",
        tempat_lahir: "",
        tgl_lahir: "",

        no_hp: "",
        no_wa: "",
        email: "",
        no_telp: "",
        kota: "",
        form_prov: null,
        form_kab: null,
        form_kec: null,
        form_des: null,
        alamat: "",

        pekerjaan: "",
        status_pernikahan: "",
        agama: "",
        sumber_info: "",
        reseller_id: "",
        no_reseller: "",
        password: "",

        alergi_obat: "",
        masalah_kulit: "",
        catatan: "",
        note: "",
        img: "",
      },

      genderOptions: [
        { label: "Laki-laki", value: "L" },
        { label: "Perempuan", value: "P" },
      ],

      maritalOptions: [
        { label: "Belum Menikah", value: "Belum Menikah" },
        { label: "Menikah", value: "Menikah" },
        { label: "Cerai", value: "Cerai" },
      ],

      religionOptions: [
        { label: "Islam", value: "Islam" },
        { label: "Kristen", value: "Kristen" },
        { label: "Katolik", value: "Katolik" },
        { label: "Hindu", value: "Hindu" },
        { label: "Buddha", value: "Buddha" },
        { label: "Konghucu", value: "Konghucu" },
      ],

      sourceInfoOptions: [
        { label: "Instagram", value: "Instagram" },
        { label: "TikTok", value: "TikTok" },
        { label: "Google", value: "Google" },
        { label: "Teman / Keluarga", value: "Teman / Keluarga" },
        { label: "Walk-in", value: "Walk-in" },
      ],

      provinceOptions: [
        { label: "DKI Jakarta", value: "DKI Jakarta" },
        { label: "Jawa Barat", value: "Jawa Barat" },
        { label: "Banten", value: "Banten" },
      ],

      cityOptions: [
        { label: "Jakarta Selatan", value: "Jakarta Selatan" },
        { label: "Bandung", value: "Bandung" },
        { label: "Tangerang", value: "Tangerang" },
      ],

      districtOptions: [
        { label: "Setiabudi", value: "Setiabudi" },
        { label: "Coblong", value: "Coblong" },
        { label: "Serpong", value: "Serpong" },
      ],

      villageOptions: [
        { label: "Karet", value: "Karet" },
        { label: "Dago", value: "Dago" },
        { label: "Lengkong", value: "Lengkong" },
      ],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!String(v || "").trim() || "Field ini wajib diisi",
        email: (v) =>
          !v ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
          "Format email tidak valid",
        phoneMin: (v) =>
          !v ||
          String(v).replace(/\D/g, "").length >= 9 ||
          "Nomor minimal 9 digit",
        identityMin: (v) =>
          !v ||
          String(v).replace(/\s/g, "").length >= 8 ||
          "Nomor identitas terlalu pendek",
      },
    };
  },

  computed: {
    calculatedAge() {
      if (!this.form.tgl_lahir) return "-";

      const birthDate = new Date(this.form.tgl_lahir);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age >= 0 ? `${age} tahun` : "-";
    },

    payload() {
      return {
        ...this.form,
        no_hp: this.normalizePhone(this.form.no_hp),
        no_wa: this.normalizePhone(this.form.no_wa),
        umur: this.extractAgeNumber(),
      };
    },
  },

  methods: {
    normalizePhone(value) {
      const cleaned = String(value || "").replace(/\D/g, "");
      if (!cleaned) return "";
      return "62" + cleaned.replace(/^0+/, "");
    },

    extractAgeNumber() {
      if (!this.form.tgl_lahir) return null;

      const birthDate = new Date(this.form.tgl_lahir);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age >= 0 ? age : null;
    },

    resetForm() {
      this.form = {
        no_rm: "RM-2026-0001",
        nama: "",
        ktp_passport: "",
        jenis_kelamin: "",
        tempat_lahir: "",
        tgl_lahir: "",

        no_hp: "",
        no_wa: "",
        email: "",
        no_telp: "",
        kota: "",
        form_prov: null,
        form_kab: null,
        form_kec: null,
        form_des: null,
        alamat: "",

        pekerjaan: "",
        status_pernikahan: "",
        agama: "",
        sumber_info: "",
        reseller_id: "",
        no_reseller: "",
        password: "",

        alergi_obat: "",
        masalah_kulit: "",
        catatan: "",
        note: "",
        img: "",
      };
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      this.loading = true;

      try {
        // Dummy submit
        console.log("Payload registrasi pasien:", this.payload);

        this.showSnackbar("Registrasi pasien berhasil disimpan", "success");
      } catch (error) {
        this.showSnackbar("Gagal menyimpan registrasi pasien", "error");
      } finally {
        this.loading = false;
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },
  },
};
</script>

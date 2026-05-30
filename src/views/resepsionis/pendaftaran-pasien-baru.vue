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
        <v-alert type="info" density="comfortable" class="mb-6">
          Isi data pasien terlebih dahulu. Kolom bertanda * wajib diisi.
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          density="comfortable"
          class="mb-6"
          closable
          @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          density="comfortable"
          class="mb-6"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
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
                :error-messages="
                  validationErrors.nama_pasien || validationErrors.nama
                "
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="form.tipe_pasien"
                :items="tipePasienOptions"
                item-title="title"
                item-value="value"
                label="Tipe Pasien *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                :error-messages="validationErrors.tipe_pasien"
                auto-select-first
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.no_identitas"
                label="KTP/SIM/Passport *"
                placeholder="Maksimal 16 digit nomor pengenal"
                variant="outlined"
                density="comfortable"
                inputmode="numeric"
                maxlength="16"
                counter="16"
                :rules="[
                  required,
                  digitsOnly('KTP/SIM/Passport'),
                  maxDigits(16, 'KTP/SIM/Passport'),
                ]"
                :error-messages="validationErrors.no_identitas"
                @update:model-value="setDigits('no_identitas', $event, 16)"
              />
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mt-6 mb-4">
            Alamat Pasien
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.provinsi_kode"
                :items="provinsiOptions"
                item-title="label"
                item-value="value"
                label="Provinsi"
                variant="outlined"
                density="comfortable"
                clearable
                auto-select-first
                :loading="loadingProvinsi"
                :error-messages="validationErrors.provinsi_kode"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.kota_kode"
                :items="kotaOptions"
                item-title="label"
                item-value="value"
                label="Kota/Kabupaten"
                variant="outlined"
                density="comfortable"
                clearable
                auto-select-first
                :disabled="!form.provinsi_kode"
                :loading="loadingKota"
                :error-messages="validationErrors.kota_kode"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.kecamatan_kode"
                :items="kecamatanOptions"
                item-title="label"
                item-value="value"
                label="Kecamatan"
                variant="outlined"
                density="comfortable"
                clearable
                auto-select-first
                :disabled="!form.kota_kode"
                :loading="loadingKecamatan"
                :error-messages="validationErrors.kecamatan_kode"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.kelurahan_kode"
                :items="kelurahanOptions"
                item-title="label"
                item-value="value"
                label="Kelurahan/Desa"
                variant="outlined"
                density="comfortable"
                clearable
                auto-select-first
                :disabled="!form.kecamatan_kode"
                :loading="loadingKelurahan"
                :error-messages="validationErrors.kelurahan_kode"
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
                :error-messages="
                  validationErrors.alamat_detail || validationErrors.alamat
                "
              />
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mt-6 mb-4">
            Data Pribadi
          </div>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.jenis_kelamin"
                :items="jenisKelaminOptions"
                item-title="title"
                item-value="value"
                label="Jenis Kelamin *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                :error-messages="validationErrors.jenis_kelamin"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.pekerjaan_id"
                :items="pekerjaanOptions"
                item-title="label"
                item-value="value"
                label="Pekerjaan *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                :loading="loadingPekerjaan"
                :error-messages="validationErrors.pekerjaan_id"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.status_pernikahan"
                :items="statusPernikahanOptions"
                item-title="title"
                item-value="value"
                label="Status Pernikahan"
                variant="outlined"
                density="comfortable"
                clearable
                auto-select-first
                :error-messages="validationErrors.status_pernikahan"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.agama_id"
                :items="agamaOptions"
                item-title="label"
                item-value="value"
                label="Agama *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                :loading="loadingAgama"
                :error-messages="validationErrors.agama_id"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.tempat_lahir"
                label="Tempat Lahir *"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                :error-messages="validationErrors.tempat_lahir"
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
                :error-messages="validationErrors.tanggal_lahir"
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
                placeholder="Optional / maksimal 10 digit"
                variant="outlined"
                density="comfortable"
                inputmode="numeric"
                maxlength="10"
                counter="10"
                :rules="[
                  optionalDigitsOnly('No. Telp'),
                  optionalMaxDigits(10, 'No. Telp'),
                ]"
                :error-messages="validationErrors.no_telp"
                @update:model-value="setDigits('no_telp', $event, 10)"
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
                inputmode="numeric"
                maxlength="11"
                counter="11"
                :rules="[required, phone62Max13('No. HP')]"
                :error-messages="validationErrors.no_hp"
                @update:model-value="setPhoneLocal('no_hp', $event)"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="Email"
                placeholder="Optional"
                variant="outlined"
                density="comfortable"
                :error-messages="validationErrors.email"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_wa"
                label="No. WA"
                prefix="+62"
                placeholder="81234567890"
                variant="outlined"
                density="comfortable"
                inputmode="numeric"
                maxlength="11"
                counter="11"
                :rules="[optionalPhone62Max13('No. WA')]"
                :error-messages="validationErrors.no_wa"
                @update:model-value="setPhoneLocal('no_wa', $event)"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.sumber_info"
                label="Sumber Info"
                placeholder="Optional"
                variant="outlined"
                density="comfortable"
                :error-messages="validationErrors.sumber_info"
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
                :error-messages="validationErrors.alergi_obat"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.masalah_kulit"
                label="Masalah Kulit"
                placeholder="Optional"
                variant="outlined"
                density="comfortable"
                :error-messages="validationErrors.masalah_kulit"
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
                :error-messages="validationErrors.catatan"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn
          color="success"
          prepend-icon="mdi-account-key"
          :disabled="loadingSubmit"
          @click="buatTokenRegistrasi"
        >
          Buat Token Registrasi Pasien Mandiri
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-content-save"
          :loading="loadingSubmit"
          @click="submitForm"
        >
          Tambahkan
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import pasienService from "@/services/pasienService";
import referenceService from "@/services/referenceService";

export default {
  name: "AddPasien",

  data() {
    return {
      loadingSubmit: false,
      loadingAgama: false,
      loadingPekerjaan: false,
      loadingProvinsi: false,
      loadingKota: false,
      loadingKecamatan: false,
      loadingKelurahan: false,

      successMessage: "",
      errorMessage: "",
      validationErrors: {},

      form: {
        nama_pasien: "",
        tipe_pasien: 1,
        toko_id: localStorage.getItem("selected_toko_id") || null,

        no_identitas: "",

        provinsi_kode: null,
        kota_kode: null,
        kecamatan_kode: null,
        kelurahan_kode: null,
        alamat_detail: "",

        jenis_kelamin: null,
        pekerjaan_id: null,
        status_pernikahan: null,
        agama_id: null,

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
      },

      tipePasienOptions: [
        { title: "Pasien", value: 1 },
        { title: "Non Pasien", value: 2 },
      ],

      jenisKelaminOptions: [
        { title: "Laki-laki", value: "L" },
        { title: "Perempuan", value: "P" },
      ],

      statusPernikahanOptions: [
        { title: "Belum Menikah", value: 1 },
        { title: "Menikah", value: 2 },
        { title: "Cerai", value: 3 },
      ],

      agamaOptions: [],
      pekerjaanOptions: [],

      provinsiOptions: [],
      kotaOptions: [],
      kecamatanOptions: [],
      kelurahanOptions: [],
    };
  },

  watch: {
    "form.provinsi_kode"(value) {
      this.form.kota_kode = null;
      this.form.kecamatan_kode = null;
      this.form.kelurahan_kode = null;

      this.kotaOptions = [];
      this.kecamatanOptions = [];
      this.kelurahanOptions = [];

      if (value) {
        this.fetchKota(value);
      }
    },

    "form.kota_kode"(value) {
      this.form.kecamatan_kode = null;
      this.form.kelurahan_kode = null;

      this.kecamatanOptions = [];
      this.kelurahanOptions = [];

      if (value) {
        this.fetchKecamatan(value);
      }
    },

    "form.kecamatan_kode"(value) {
      this.form.kelurahan_kode = null;
      this.kelurahanOptions = [];

      if (value) {
        this.fetchKelurahan(value);
      }
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    getDefaultForm() {
      return {
        nama_pasien: "",
        tipe_pasien: 1,
        toko_id: localStorage.getItem("selected_toko_id") || null,

        no_identitas: "",

        provinsi_kode: null,
        kota_kode: null,
        kecamatan_kode: null,
        kelurahan_kode: null,
        alamat_detail: "",

        jenis_kelamin: null,
        pekerjaan_id: null,
        status_pernikahan: null,
        agama_id: null,

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
      };
    },

    async initPage() {
      this.refreshTokoFromLocalStorage();

      await Promise.all([
        this.fetchAgama(),
        this.fetchPekerjaan(),
        this.fetchProvinsi(),
      ]);
    },

    refreshTokoFromLocalStorage() {
      this.form.toko_id = localStorage.getItem("selected_toko_id") || null;
    },

    required(value) {
      return !!value || "Field wajib diisi";
    },

    async fetchAgama() {
      this.loadingAgama = true;

      try {
        const rows = await referenceService.agama();

        this.agamaOptions = (rows || []).map((item) => ({
          label: item.label || item.nama_agama,
          value: item.value || item.id,
        }));
      } catch (error) {
        this.errorMessage = "Gagal mengambil data agama";
      } finally {
        this.loadingAgama = false;
      }
    },

    async fetchPekerjaan() {
      this.loadingPekerjaan = true;

      try {
        const rows = await referenceService.pekerjaan();

        this.pekerjaanOptions = (rows || []).map((item) => ({
          label: item.label || item.nama_pekerjaan,
          value: item.value || item.id,
        }));
      } catch (error) {
        this.errorMessage = "Gagal mengambil data pekerjaan";
      } finally {
        this.loadingPekerjaan = false;
      }
    },

    async fetchProvinsi() {
      this.loadingProvinsi = true;

      try {
        const rows = await referenceService.provinces();
        this.provinsiOptions = this.mapWilayahOptions(rows || []);
      } catch (error) {
        this.errorMessage = "Gagal mengambil data provinsi";
      } finally {
        this.loadingProvinsi = false;
      }
    },

    async fetchKota(provinceCode) {
      this.loadingKota = true;

      try {
        const rows = await referenceService.regencies(provinceCode);
        this.kotaOptions = this.mapWilayahOptions(rows || []);
      } catch (error) {
        this.errorMessage = "Gagal mengambil data kota/kabupaten";
      } finally {
        this.loadingKota = false;
      }
    },

    async fetchKecamatan(regencyCode) {
      this.loadingKecamatan = true;

      try {
        const rows = await referenceService.districts(regencyCode);
        this.kecamatanOptions = this.mapWilayahOptions(rows || []);
      } catch (error) {
        this.errorMessage = "Gagal mengambil data kecamatan";
      } finally {
        this.loadingKecamatan = false;
      }
    },

    async fetchKelurahan(districtCode) {
      this.loadingKelurahan = true;

      try {
        const rows = await referenceService.villages(districtCode);
        this.kelurahanOptions = this.mapWilayahOptions(rows || []);
      } catch (error) {
        this.errorMessage = "Gagal mengambil data kelurahan/desa";
      } finally {
        this.loadingKelurahan = false;
      }
    },

    mapWilayahOptions(rows) {
      return rows.map((item) => ({
        label: item.name || item.nama || item.label,
        value: item.code || item.kode || item.value || item.id,
      }));
    },

    buildPayload() {
      return {
        nama_pasien: this.form.nama_pasien,
        tipe_pasien: this.form.tipe_pasien,
        toko_id: this.form.toko_id,

        no_identitas: this.normalizeDigits(this.form.no_identitas, 16),

        provinsi_kode: this.form.provinsi_kode,
        kota_kode: this.form.kota_kode,
        kecamatan_kode: this.form.kecamatan_kode,
        kelurahan_kode: this.form.kelurahan_kode,
        alamat_detail: this.form.alamat_detail,

        jenis_kelamin: this.form.jenis_kelamin,
        pekerjaan_id: this.form.pekerjaan_id,
        status_pernikahan: this.form.status_pernikahan,
        agama_id: this.form.agama_id,

        tempat_lahir: this.form.tempat_lahir,
        tanggal_lahir: this.form.tanggal_lahir,

        no_telp: this.normalizeDigits(this.form.no_telp, 10),
        no_hp: this.toFullPhone62(this.form.no_hp),
        email: this.form.email,
        no_wa: this.toFullPhone62(this.form.no_wa),
        sumber_info: this.form.sumber_info,

        alergi_obat: this.form.alergi_obat,
        masalah_kulit: this.form.masalah_kulit,
        catatan: this.form.catatan,
      };
    },

    async submitForm() {
      this.successMessage = "";
      this.errorMessage = "";
      this.validationErrors = {};

      this.refreshTokoFromLocalStorage();

      if (!this.form.toko_id) {
        this.errorMessage =
          "Cabang belum terpilih. Pilih cabang terlebih dahulu di header.";
        return;
      }

      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.errorMessage = "Periksa kembali data yang wajib diisi";
        return;
      }

      this.loadingSubmit = true;

      try {
        const payload = this.buildPayload();
        const response = await pasienService.create(payload);

        const noRm = response.data?.no_rm;

        this.successMessage = noRm
          ? `Data pasien berhasil ditambahkan. No. RM: ${noRm}`
          : response.message || "Data pasien berhasil ditambahkan";

        this.resetForm();
      } catch (error) {
        if (error.response?.status === 422) {
          this.validationErrors = error.response.data?.errors || {};
          this.errorMessage =
            error.response.data?.message || "Validasi data pasien gagal";
        } else {
          this.errorMessage =
            error.response?.data?.message ||
            "Terjadi kesalahan saat menyimpan data pasien";
        }
      } finally {
        this.loadingSubmit = false;
      }
    },

    resetForm() {
      this.form = this.getDefaultForm();

      this.kotaOptions = [];
      this.kecamatanOptions = [];
      this.kelurahanOptions = [];

      this.$nextTick(() => {
        this.$refs.formRef?.resetValidation();
      });
    },

    buatTokenRegistrasi() {
      this.refreshTokoFromLocalStorage();

      if (!this.form.toko_id) {
        this.errorMessage =
          "Cabang belum terpilih. Pilih cabang terlebih dahulu di header.";
        return;
      }

      console.log("buat token registrasi mandiri", this.form);
    },

    normalizeDigits(value, maxLength = null) {
      const digits = String(value || "").replace(/\D/g, "");

      if (!maxLength) {
        return digits;
      }

      return digits.slice(0, maxLength);
    },

    normalizePhoneLocal(value) {
      let digits = String(value || "").replace(/\D/g, "");

      if (digits.startsWith("62")) {
        digits = digits.slice(2);
      }

      if (digits.startsWith("0")) {
        digits = digits.slice(1);
      }

      return digits.slice(0, 11);
    },

    toFullPhone62(value) {
      const localNumber = this.normalizePhoneLocal(value);

      if (!localNumber) {
        return "";
      }

      return `62${localNumber}`;
    },

    setDigits(field, value, maxLength) {
      this.form[field] = this.normalizeDigits(value, maxLength);
    },

    setPhoneLocal(field, value) {
      this.form[field] = this.normalizePhoneLocal(value);
    },

    digitsOnly(label) {
      return (value) => {
        if (!value) {
          return true;
        }

        return /^\d+$/.test(String(value)) || `${label} hanya boleh angka`;
      };
    },

    optionalDigitsOnly(label) {
      return (value) => {
        if (!value) {
          return true;
        }

        return /^\d+$/.test(String(value)) || `${label} hanya boleh angka`;
      };
    },

    maxDigits(max, label) {
      return (value) => {
        if (!value) {
          return true;
        }

        return String(value).length <= max || `${label} maksimal ${max} digit`;
      };
    },

    optionalMaxDigits(max, label) {
      return (value) => {
        if (!value) {
          return true;
        }

        return String(value).length <= max || `${label} maksimal ${max} digit`;
      };
    },

    phone62Max13(label) {
      return (value) => {
        if (!value) {
          return true;
        }

        const fullNumber = this.toFullPhone62(value);

        return (
          fullNumber.length <= 13 ||
          `${label} maksimal 13 digit termasuk kode negara 62`
        );
      };
    },

    optionalPhone62Max13(label) {
      return (value) => {
        if (!value) {
          return true;
        }

        const fullNumber = this.toFullPhone62(value);

        return (
          fullNumber.length <= 13 ||
          `${label} maksimal 13 digit termasuk kode negara 62`
        );
      };
    },
  },
};
</script>

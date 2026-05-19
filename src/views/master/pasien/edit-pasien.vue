<template>
  <div>
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title">Edit Pasien Klinik</h1>
        <p class="page-subtitle">Perbarui data pasien yang sudah terdaftar</p>
      </div>
    </div>

    <v-card rounded="lg" elevation="1">
      <v-card-title class="text-h6 font-weight-bold px-6 py-4">
        Form Edit Pasien Klinik
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-alert type="info" variant="tonal" density="comfortable" class="mb-6">
          Perbarui data pasien. No. RM dan cabang asal tidak dapat diubah.
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
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
          variant="tonal"
          density="comfortable"
          class="mb-6"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-skeleton-loader v-if="loadingDetail" type="article, actions" />

        <v-form v-else ref="formRef">
          <div class="text-subtitle-2 font-weight-bold mb-4">
            Informasi Utama
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_rm"
                label="No. RM"
                variant="outlined"
                density="comfortable"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.nama_toko"
                label="Cabang"
                variant="outlined"
                density="comfortable"
                readonly
              />
            </v-col>

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
                placeholder="16 Digit Nomor Pengenal"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                :error-messages="validationErrors.no_identitas"
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
                placeholder="Optional / Isi jika ada nomor lain"
                variant="outlined"
                density="comfortable"
                :error-messages="validationErrors.no_telp"
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
                :error-messages="validationErrors.no_hp"
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
                placeholder="8123456789"
                variant="outlined"
                density="comfortable"
                :error-messages="validationErrors.no_wa"
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
          variant="tonal"
          prepend-icon="mdi-arrow-left"
          :disabled="loadingSubmit"
          to="/master/pasien"
        >
          Kembali
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-content-save"
          :loading="loadingSubmit"
          :disabled="loadingDetail"
          @click="submitForm"
        >
          Simpan Perubahan
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import pasienService from "@/services/pasienService";
import referenceService from "@/services/referenceService";

export default {
  name: "EditPasien",

  data() {
    return {
      loadingDetail: false,
      loadingSubmit: false,
      loadingAgama: false,
      loadingPekerjaan: false,
      loadingProvinsi: false,
      loadingKota: false,
      loadingKecamatan: false,
      loadingKelurahan: false,

      isHydrating: false,

      successMessage: "",
      errorMessage: "",
      validationErrors: {},

      form: this.getDefaultForm(),

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

  computed: {
    pasienId() {
      return this.$route.params.id;
    },
  },

  watch: {
    "form.provinsi_kode"(value) {
      if (this.isHydrating) return;

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
      if (this.isHydrating) return;

      this.form.kecamatan_kode = null;
      this.form.kelurahan_kode = null;

      this.kecamatanOptions = [];
      this.kelurahanOptions = [];

      if (value) {
        this.fetchKecamatan(value);
      }
    },

    "form.kecamatan_kode"(value) {
      if (this.isHydrating) return;

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
        id: null,
        no_rm: "",
        toko_id: null,
        nama_toko: "",

        nama_pasien: "",
        tipe_pasien: 1,
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
      this.loadingDetail = true;
      this.errorMessage = "";
      this.validationErrors = {};

      try {
        await Promise.all([
          this.fetchAgama(),
          this.fetchPekerjaan(),
          this.fetchProvinsi(),
        ]);

        await this.fetchPasienDetail();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Gagal memuat data pasien";
      } finally {
        this.loadingDetail = false;
      }
    },

    required(value) {
      return !!value || "Field wajib diisi";
    },

    async fetchPasienDetail() {
      const response = await pasienService.getById(this.pasienId);
      const pasien = response.data || {};

      this.isHydrating = true;

      this.form = {
        id: pasien.id,
        no_rm: pasien.no_rm || "",
        toko_id: pasien.toko_id || null,
        nama_toko: pasien.toko?.nama_toko || "",

        nama_pasien: pasien.nama_pasien || pasien.nama || "",
        tipe_pasien: pasien.tipe_pasien || 1,
        no_identitas: pasien.no_identitas || "",

        provinsi_kode: pasien.provinsi_kode || null,
        kota_kode: pasien.kota_kode || null,
        kecamatan_kode: pasien.kecamatan_kode || null,
        kelurahan_kode: pasien.kelurahan_kode || null,
        alamat_detail: pasien.alamat_detail || pasien.alamat || "",

        jenis_kelamin: pasien.jenis_kelamin || null,
        pekerjaan_id: pasien.pekerjaan_id || pasien.pekerjaan?.id || null,
        status_pernikahan: pasien.status_pernikahan || null,
        agama_id: pasien.agama_id || pasien.agama?.id || null,

        tempat_lahir: pasien.tempat_lahir || "",
        tanggal_lahir: pasien.tanggal_lahir || "",
        no_telp: pasien.no_telp || "",
        no_hp: pasien.no_hp || "",
        email: pasien.email || "",
        no_wa: pasien.no_wa || "",
        sumber_info: pasien.sumber_info || "",

        alergi_obat: pasien.alergi_obat || "",
        masalah_kulit: pasien.masalah_kulit || "",
        catatan: pasien.catatan || "",
      };

      await this.loadWilayahFromExistingData();

      this.isHydrating = false;

      this.$nextTick(() => {
        this.$refs.formRef?.resetValidation();
      });
    },

    async loadWilayahFromExistingData() {
      if (this.form.provinsi_kode) {
        await this.fetchKota(this.form.provinsi_kode);
      }

      if (this.form.kota_kode) {
        await this.fetchKecamatan(this.form.kota_kode);
      }

      if (this.form.kecamatan_kode) {
        await this.fetchKelurahan(this.form.kecamatan_kode);
      }
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

        no_identitas: this.form.no_identitas,

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

        no_telp: this.form.no_telp,
        no_hp: this.form.no_hp,
        email: this.form.email,
        no_wa: this.form.no_wa,
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

      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.errorMessage = "Periksa kembali data yang wajib diisi";
        return;
      }

      this.loadingSubmit = true;

      try {
        const payload = this.buildPayload();
        const response = await pasienService.update(this.pasienId, payload);

        this.successMessage =
          response.message || "Data pasien berhasil diperbarui";

        await this.fetchPasienDetail();
      } catch (error) {
        if (error.response?.status === 422) {
          this.validationErrors = error.response.data?.errors || {};
          this.errorMessage =
            error.response.data?.message || "Validasi data pasien gagal";
        } else {
          this.errorMessage =
            error.response?.data?.message ||
            "Terjadi kesalahan saat memperbarui data pasien";
        }
      } finally {
        this.loadingSubmit = false;
      }
    },
  },
};
</script>

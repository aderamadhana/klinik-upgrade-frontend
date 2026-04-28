<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tambah User Klinik</h1>
        <p class="page-subtitle">
          Buat akun user baru berdasarkan role dan data karyawan yang tersedia
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title class="text-h6 font-weight-bold">
        Form Tambah User
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-form
          ref="formRef"
          v-model="isFormValid"
          validate-on="submit lazy"
          @submit.prevent="submitForm"
        >
          <div class="text-subtitle-1 font-weight-bold mb-3">
            Informasi Role
          </div>

          <v-row>
            <v-col cols="12">
              <v-select
                v-model="form.role"
                label="Role *"
                :items="roleOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-shield-account-outline"
                :rules="[rules.required]"
                clearable
                @update:model-value="handleRoleChange"
              />
            </v-col>
          </v-row>

          <v-alert
            v-if="form.role && isJabatanBasedRole"
            type="info"
            variant="tonal"
            class="mb-4"
            rounded="lg"
          >
            Role ini terhubung ke <strong>master_jabatan</strong>, jadi nama
            user diambil dari data karyawan dan penempatan bisa lebih dari satu.
          </v-alert>

          <v-alert
            v-if="form.role && !isJabatanBasedRole"
            type="warning"
            variant="tonal"
            class="mb-4"
            rounded="lg"
          >
            Role ini tidak ditemukan di <strong>master_jabatan</strong>, jadi
            nama diinput manual.
          </v-alert>

          <v-divider class="my-6" />

          <div class="text-subtitle-1 font-weight-bold mb-3">
            Informasi Pengguna
          </div>

          <v-row v-if="isJabatanBasedRole">
            <v-col cols="12" md="6">
              <v-select
                v-model="form.karyawan_id"
                label="Nama Karyawan *"
                :items="filteredKaryawanOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-search-outline"
                :rules="[rules.required]"
                clearable
                @update:model-value="handleKaryawanChange"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="selectedJabatanName"
                label="Jabatan"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-badge-account-outline"
                readonly
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="form.penempatan_ids"
                label="Penempatan Cabang *"
                :items="selectedPenempatanOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-store-marker-outline"
                :rules="[rules.minOnePlacement]"
                multiple
                chips
                closable-chips
                clearable
                :disabled="!form.karyawan_id"
                hint="Bisa memilih lebih dari satu penempatan"
                persistent-hint
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                :model-value="form.nama"
                label="Nama User"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
                readonly
              />
            </v-col>

            <v-col
              cols="12"
              v-if="form.role && filteredKaryawanOptions.length === 0"
            >
              <v-alert type="warning" variant="tonal" rounded="lg">
                Tidak ada data karyawan untuk role / jabatan ini.
              </v-alert>
            </v-col>
          </v-row>

          <v-row v-else>
            <v-col cols="12">
              <v-text-field
                v-model="form.nama"
                label="Nama *"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
                :rules="[rules.required]"
                placeholder="Masukkan nama user"
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-subtitle-1 font-weight-bold mb-3">
            Kredensial Login
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.username"
                label="Username *"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-circle-outline"
                :rules="[rules.required, rules.usernameMin]"
                placeholder="Masukkan username"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.password"
                label="Password *"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="[rules.required, rules.passwordMin]"
                placeholder="Masukkan password"
                @click:append-inner="showPassword = !showPassword"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
      <v-btn
        color="secondary"
        variant="outlined"
        size="large"
        :to="'/master/user'"
      >
        Batal
      </v-btn>

      <v-btn
        color="success"
        variant="flat"
        size="large"
        prepend-icon="mdi-content-save"
        @click="submitForm"
        :loading="loading"
      >
        Simpan User
      </v-btn>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>

    <v-dialog v-model="dialogPreview" max-width="900">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Preview Payload
        </v-card-title>

        <v-divider />

        <v-card-text>
          <pre>{{ formattedPayload }}</pre>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="dialogPreview = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "AddUserPage",

  data() {
    return {
      isFormValid: false,
      loading: false,
      showPassword: false,
      dialogPreview: false,

      breadcrumbs: [
        { title: "Users", disabled: true },
        { title: "Data User Klinik", disabled: false, to: "/master/user" },
        { title: "Tambah User", disabled: true },
      ],

      form: {
        role: null,
        nama: "",
        karyawan_id: null,
        penempatan_ids: [],
        username: "",
        password: "",
      },

      roleOptions: [
        { label: "Administrator", value: "administrator" },
        { label: "Dokter", value: "dokter" },
        { label: "Front Office", value: "front office" },
        { label: "Customer Service", value: "customer service" },
        { label: "Beautician", value: "beautician" },
        { label: "Apoteker", value: "apoteker" },
        { label: "Asisten Apoteker", value: "asisten apoteker" },
        { label: "Karyawan", value: "karyawan" },
        { label: "IT", value: "it" },
        { label: "Management", value: "management" },
      ],

      masterJabatan: [
        { id: 1, nama: "Apoteker" },
        { id: 2, nama: "Asisten Apoteker" },
        { id: 3, nama: "Beautician" },
        { id: 4, nama: "Dokter" },
        { id: 5, nama: "Front Office" },
        { id: 6, nama: "Karyawan" },
        { id: 7, nama: "Customer Service" },
      ],

      masterKaryawan: [
        {
          id: 101,
          jabatan_id: 4,
          kode: "DR001",
          nama: "dr. Kevin Aditya",
          is_delete: 0,
        },
        {
          id: 102,
          jabatan_id: 4,
          kode: "DR002",
          nama: "dr. Dinda Zahra",
          is_delete: 0,
        },
        {
          id: 103,
          jabatan_id: 5,
          kode: "FO001",
          nama: "Gheby Inge Natalia",
          is_delete: 0,
        },
        {
          id: 104,
          jabatan_id: 5,
          kode: "FO002",
          nama: "Ajeng Putri S",
          is_delete: 0,
        },
        { id: 105, jabatan_id: 7, kode: "CS001", nama: "CRMJKS", is_delete: 0 },
        {
          id: 106,
          jabatan_id: 3,
          kode: "BT001",
          nama: "Nabila Ayu",
          is_delete: 0,
        },
        {
          id: 107,
          jabatan_id: 1,
          kode: "AP001",
          nama: "Farah Nabila",
          is_delete: 0,
        },
        {
          id: 108,
          jabatan_id: 2,
          kode: "AA001",
          nama: "Rizky Saputra",
          is_delete: 0,
        },
        {
          id: 109,
          jabatan_id: 6,
          kode: "KR001",
          nama: "Budi Santoso",
          is_delete: 0,
        },
      ],

      masterKaryawanPenempatan: [
        { id: 1, karyawan_id: 101, toko_id: 1, is_primary: 1, is_delete: 0 },
        { id: 2, karyawan_id: 101, toko_id: 2, is_primary: 0, is_delete: 0 },
        { id: 3, karyawan_id: 102, toko_id: 5, is_primary: 1, is_delete: 0 },
        { id: 4, karyawan_id: 103, toko_id: 1, is_primary: 1, is_delete: 0 },
        { id: 5, karyawan_id: 103, toko_id: 3, is_primary: 0, is_delete: 0 },
        { id: 6, karyawan_id: 104, toko_id: 5, is_primary: 1, is_delete: 0 },
        { id: 7, karyawan_id: 105, toko_id: 1, is_primary: 1, is_delete: 0 },
        { id: 8, karyawan_id: 106, toko_id: 2, is_primary: 1, is_delete: 0 },
        { id: 9, karyawan_id: 106, toko_id: 4, is_primary: 0, is_delete: 0 },
        { id: 10, karyawan_id: 107, toko_id: 8, is_primary: 1, is_delete: 0 },
        { id: 11, karyawan_id: 108, toko_id: 2, is_primary: 1, is_delete: 0 },
        { id: 12, karyawan_id: 109, toko_id: 1, is_primary: 1, is_delete: 0 },
        { id: 13, karyawan_id: 109, toko_id: 7, is_primary: 0, is_delete: 0 },
      ],

      tokoOptions: [
        { id: 1, nama: "KLINIK JAKARTA SELATAN" },
        { id: 2, nama: "KLINIK SURABAYA" },
        { id: 3, nama: "KLINIK BANDUNG" },
        { id: 4, nama: "KLINIK SIDOARJO" },
        { id: 5, nama: "KLINIK BEKASI" },
        { id: 6, nama: "KLINIK MEDAN" },
        { id: 7, nama: "KLINIK DEPOK" },
        { id: 8, nama: "KLINIK MALANG" },
      ],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!String(v ?? "").trim() || "Field ini wajib diisi",
        usernameMin: (v) =>
          String(v ?? "").trim().length >= 4 || "Username minimal 4 karakter",
        passwordMin: (v) =>
          String(v ?? "").trim().length >= 6 || "Password minimal 6 karakter",
        minOnePlacement: (v) =>
          (Array.isArray(v) && v.length > 0) || "Minimal pilih 1 penempatan",
      },
    };
  },

  computed: {
    matchedJabatan() {
      if (!this.form.role) return null;

      const normalizedRole = this.normalizeText(this.form.role);

      return (
        this.masterJabatan.find(
          (item) => this.normalizeText(item.nama) === normalizedRole,
        ) || null
      );
    },

    isJabatanBasedRole() {
      return !!this.matchedJabatan;
    },

    filteredKaryawanOptions() {
      if (!this.matchedJabatan) return [];

      return this.masterKaryawan.filter(
        (item) =>
          Number(item.jabatan_id) === Number(this.matchedJabatan.id) &&
          Number(item.is_delete) === 0,
      );
    },

    selectedKaryawan() {
      return (
        this.masterKaryawan.find(
          (item) => Number(item.id) === Number(this.form.karyawan_id),
        ) || null
      );
    },

    selectedJabatanName() {
      return this.matchedJabatan ? this.matchedJabatan.nama : "-";
    },

    selectedPenempatanOptions() {
      if (!this.form.karyawan_id) return [];

      const penempatanIds = this.masterKaryawanPenempatan
        .filter(
          (item) =>
            Number(item.karyawan_id) === Number(this.form.karyawan_id) &&
            Number(item.is_delete) === 0,
        )
        .map((item) => item.toko_id);

      return this.tokoOptions.filter((item) => penempatanIds.includes(item.id));
    },

    payload() {
      return {
        role: this.form.role,
        nama: this.form.nama,
        username: this.form.username,
        password: this.form.password,
        karyawan_id: this.isJabatanBasedRole ? this.form.karyawan_id : null,
        penempatan_ids: this.isJabatanBasedRole ? this.form.penempatan_ids : [],
      };
    },

    formattedPayload() {
      return JSON.stringify(this.payload, null, 2);
    },
  },

  methods: {
    normalizeText(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    },

    handleRoleChange() {
      this.form.karyawan_id = null;
      this.form.penempatan_ids = [];
      this.form.nama = "";
    },

    handleKaryawanChange() {
      if (!this.selectedKaryawan) {
        this.form.nama = "";
        this.form.penempatan_ids = [];
        return;
      }

      this.form.nama = this.selectedKaryawan.nama;

      const penempatanIds = this.masterKaryawanPenempatan
        .filter(
          (item) =>
            Number(item.karyawan_id) === Number(this.selectedKaryawan.id) &&
            Number(item.is_delete) === 0,
        )
        .map((item) => item.toko_id);

      this.form.penempatan_ids = [...new Set(penempatanIds)];
    },

    async submitForm() {
      const validForm = await this.$refs.formRef.validate();

      if (!validForm.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      if (this.isJabatanBasedRole && !this.form.karyawan_id) {
        this.showSnackbar("Pilih nama karyawan terlebih dahulu", "error");
        return;
      }

      if (this.isJabatanBasedRole && !this.form.penempatan_ids.length) {
        this.showSnackbar("Pilih minimal satu penempatan", "error");
        return;
      }

      if (!this.isJabatanBasedRole && !String(this.form.nama || "").trim()) {
        this.showSnackbar("Nama wajib diisi", "error");
        return;
      }

      this.loading = true;

      try {
        console.log("Payload add user:", this.payload);
        this.dialogPreview = true;
        this.showSnackbar("User berhasil diproses", "success");
      } catch (error) {
        this.showSnackbar("Gagal memproses user", "error");
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

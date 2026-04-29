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
              <v-autocomplete
                v-model="form.role_id"
                label="Role *"
                :items="roleOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-shield-account-outline"
                :rules="[rules.required]"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Role tidak ditemukan"
                :custom-filter="filterOption"
                @update:model-value="handleRoleChange"
              />
            </v-col>
          </v-row>

          <v-alert
            v-if="form.role_id && isJabatanBasedRole"
            type="info"
            variant="tonal"
            class="mb-4"
            rounded="lg"
          >
            Role ini terhubung ke <strong>master_jabatan</strong>, jadi nama
            user diambil dari data karyawan dan penempatan bisa lebih dari satu.
          </v-alert>

          <v-alert
            v-if="form.role_id && !isJabatanBasedRole"
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
              <v-autocomplete
                v-model="form.karyawan_id"
                label="Nama Karyawan *"
                :items="filteredKaryawanOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-search-outline"
                :rules="[rules.required]"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Karyawan tidak ditemukan"
                :custom-filter="filterOption"
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
              <v-autocomplete
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
                no-data-text="Penempatan tidak ditemukan"
                :custom-filter="filterOption"
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
              v-if="form.role_id && filteredKaryawanOptions.length === 0"
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
        :disabled="loading"
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
import referenceService from "@/services/referenceService";
import karyawanService from "@/services/master/karyawanService";
import userService from "@/services/master/userService";

export default {
  name: "AddUserPage",

  data() {
    return {
      isFormValid: false,
      loading: false,
      loadingMaster: false,
      showPassword: false,
      dialogPreview: false,

      breadcrumbs: [
        { title: "Users", disabled: true },
        { title: "Data User Klinik", disabled: false, to: "/master/user" },
        { title: "Tambah User", disabled: true },
      ],

      form: {
        role_id: null,
        nama: "",
        karyawan_id: null,
        penempatan_ids: [],
        username: "",
        password: "",
      },

      roleOptions: [],
      masterJabatan: [],
      masterKaryawan: [],
      tokoOptions: [],

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
    selectedRole() {
      if (!this.form.role_id) return null;

      return (
        this.roleOptions.find(
          (item) => String(item.id) === String(this.form.role_id),
        ) || null
      );
    },

    selectedRoleName() {
      return this.selectedRole?.nama || "";
    },

    matchedJabatan() {
      if (!this.selectedRoleName) return null;

      const normalizedRole = this.normalizeText(this.selectedRoleName);

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
          Number(item.is_delete || 0) === 0,
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
      if (!this.selectedKaryawan) return [];

      const penempatan = Array.isArray(this.selectedKaryawan.penempatan)
        ? this.selectedKaryawan.penempatan
        : [];

      const activePenempatan = penempatan.filter(
        (item) => Number(item.is_delete || 0) === 0,
      );

      return activePenempatan
        .map((item) => {
          const tokoId = item.toko_id ?? item.toko?.id ?? null;

          const toko = this.tokoOptions.find(
            (t) => String(t.id) === String(tokoId),
          );

          const nama =
            item.toko?.nama_toko ??
            item.toko?.nama ??
            item.nama_toko ??
            toko?.nama ??
            "-";

          return {
            id: tokoId,
            nama: Number(item.is_primary || 0) === 1 ? `${nama} (Utama)` : nama,
            is_primary: Number(item.is_primary || 0) === 1,
          };
        })
        .filter((item) => item.id);
    },

    payload() {
      return {
        karyawan_id: this.isJabatanBasedRole ? this.form.karyawan_id : null,

        role_id: this.form.role_id,
        role_name: this.selectedRoleName,

        username: this.cleanValue(this.form.username),
        password: this.cleanValue(this.form.password),
        email: null,

        nama: this.cleanValue(this.form.nama),
        display_name: this.cleanValue(this.form.nama),

        is_active: 1,
        must_change_password: 0,

        penempatan: this.buildPenempatanPayload(),
      };
    },

    formattedPayload() {
      return JSON.stringify(this.payload, null, 2);
    },
  },

  mounted() {
    this.fetchMasterData();
  },

  methods: {
    async fetchMasterData() {
      this.loadingMaster = true;

      try {
        const [rolesRes, jabatanRes, tokoRes, karyawanRes] = await Promise.all([
          referenceService.roles(),
          referenceService.jabatan(),
          referenceService.toko(),
          karyawanService.getAll({ per_page: 1000 }),
        ]);

        this.roleOptions = this.normalizeRoles(rolesRes);
        this.masterJabatan = this.normalizeJabatan(jabatanRes);
        this.tokoOptions = this.normalizeToko(tokoRes);
        this.masterKaryawan = this.normalizeKaryawanList(karyawanRes);
      } catch (error) {
        console.error(error);

        const message = this.getErrorMessage(
          error,
          "Gagal memuat data referensi",
        );

        this.showSnackbar(message, "error");
      } finally {
        this.loadingMaster = false;
      }
    },

    normalizeRoles(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.role_id ?? item.value,
          nama: item.nama_role ?? "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeJabatan(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.jabatan_id ?? item.value,
          nama:
            item.nama ?? item.nama_jabatan ?? item.name ?? item.label ?? "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeToko(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.toko_id ?? item.value,
          nama: item.nama_toko ?? item.nama ?? item.name ?? item.label ?? "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeKaryawanList(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.karyawan_id ?? item.new_id,
          jabatan_id:
            item.jabatan_id ??
            item.jabatan?.id ??
            item.master_jabatan?.id ??
            null,
          kode: item.kode ?? item.kode_karyawan ?? "-",
          nama: item.nama ?? item.nama_karyawan ?? item.name ?? "-",
          is_delete: item.is_delete ?? 0,
          penempatan: this.normalizeKaryawanPenempatan(item.penempatan),
          raw: item,
        }))
        .filter((item) => item.id);
    },

    normalizeKaryawanPenempatan(penempatan) {
      if (!Array.isArray(penempatan)) return [];

      return penempatan.map((item) => ({
        id: item.id,
        toko_id: item.toko_id ?? item.toko?.id ?? null,
        is_primary: Number(item.is_primary || 0) === 1 ? 1 : 0,
        is_delete: Number(item.is_delete || 0),
        toko: item.toko ?? null,
        nama_toko:
          item.toko?.nama_toko ?? item.toko?.nama ?? item.nama_toko ?? null,
      }));
    },

    extractRows(response) {
      const source = response?.data ?? response?.result ?? response ?? [];

      if (Array.isArray(source)) {
        return source;
      }

      if (Array.isArray(source.data)) {
        return source.data;
      }

      if (Array.isArray(source.items)) {
        return source.items;
      }

      return [];
    },

    normalizeText(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    },

    filterOption(itemTitle, queryText, item) {
      const title =
        typeof itemTitle === "string"
          ? itemTitle
          : (item?.raw?.nama ?? item?.raw?.label ?? "");

      const text = String(title || "").toLowerCase();
      const query = String(queryText || "").toLowerCase();

      return text.includes(query);
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

      const penempatan = Array.isArray(this.selectedKaryawan.penempatan)
        ? this.selectedKaryawan.penempatan
        : [];

      const activePenempatan = penempatan.filter(
        (item) => Number(item.is_delete || 0) === 0 && item.toko_id,
      );

      const tokoIds = activePenempatan.map((item) => item.toko_id);

      this.form.penempatan_ids = [...new Set(tokoIds)];
    },

    buildPenempatanPayload() {
      if (!this.isJabatanBasedRole) {
        return [];
      }

      const selectedTokoIds = this.form.penempatan_ids || [];

      if (!selectedTokoIds.length) {
        return [];
      }

      const primaryTokoId = this.getPrimaryTokoIdForSelectedKaryawan();

      return selectedTokoIds.map((tokoId, index) => ({
        toko_id: tokoId,
        is_primary:
          String(tokoId) === String(primaryTokoId) ||
          (!primaryTokoId && index === 0)
            ? 1
            : 0,
        is_active: 1,
      }));
    },

    getPrimaryTokoIdForSelectedKaryawan() {
      if (!this.selectedKaryawan) return null;

      const penempatan = Array.isArray(this.selectedKaryawan.penempatan)
        ? this.selectedKaryawan.penempatan
        : [];

      const primary = penempatan.find(
        (item) =>
          Number(item.is_delete || 0) === 0 &&
          Number(item.is_primary || 0) === 1,
      );

      return primary?.toko_id ?? null;
    },

    cleanValue(value) {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      if (typeof value === "string") {
        return value.trim() || null;
      }

      return value;
    },

    async submitForm() {
      const validForm = await this.$refs.formRef.validate();

      if (!validForm.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      if (!this.form.role_id || !this.selectedRole) {
        this.showSnackbar("Role wajib dipilih", "error");
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
        await userService.create(this.payload);

        this.showSnackbar("User berhasil disimpan", "success");

        this.$router.replace("/master/user");
      } catch (error) {
        console.error(error);

        const message = this.getErrorMessage(error, "Gagal menyimpan user");

        this.showSnackbar(message, "error");
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

    getErrorMessage(error, fallbackMessage) {
      const response = error?.response?.data;

      if (response?.message) return response.message;

      if (response?.error) return response.error;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];

        if (firstKey && Array.isArray(response.errors[firstKey])) {
          return response.errors[firstKey][0];
        }
      }

      return fallbackMessage;
    },
  },
};
</script>

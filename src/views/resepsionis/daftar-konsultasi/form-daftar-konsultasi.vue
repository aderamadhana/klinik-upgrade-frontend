<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Pendaftaran Konsultasi</h1>
        <p class="page-subtitle">
          Pilih pasien dan tenaga medis untuk memproses konsultasi
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card>
      <v-card-text>
        <div class="form-head mb-6">
          <div class="text-h6 font-weight-bold">Data Konsultasi</div>
          <div class="text-body-2 text-medium-emphasis">
            Lengkapi data berikut sebelum melanjutkan proses
          </div>
        </div>

        <v-alert
          v-if="showMemberWarning"
          type="warning"
          variant="tonal"
          rounded="lg"
          class="mb-4"
        >
          Pasien ini terdaftar sebagai member.
        </v-alert>

        <v-alert
          v-if="showKtpWarning"
          type="info"
          variant="tonal"
          rounded="lg"
          class="mb-6"
        >
          <div
            class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3"
          >
            <div>
              Nomor identitas pasien belum sesuai atau pasien belum memiliki
              nomor IHS.
            </div>

            <v-btn
              color="warning"
              variant="flat"
              prepend-icon="mdi-pencil"
              @click="openEditKtpDialog"
            >
              Edit KTP / Passport
            </v-btn>
          </div>
        </v-alert>

        <v-form ref="formRef" v-model="isFormValid">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.tanggal"
                label="Tanggal Konsultasi"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-autocomplete
                v-model="form.pasien_new_id"
                label="Pasien"
                placeholder="Cari nama pasien atau nomor identitas"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-search"
                :items="pasienList"
                item-title="text"
                item-value="id"
                :rules="[rules.required]"
                clearable
                hide-details="auto"
                @update:modelValue="onPatientChange"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.dokter_id"
                label="Dokter"
                placeholder="Pilih dokter"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-stethoscope"
                :items="dokterList"
                item-title="nama"
                item-value="id"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.perawat_id"
                label="Perawat"
                placeholder="Pilih perawat"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-heart-outline"
                :items="perawatList"
                item-title="nama"
                item-value="id"
                clearable
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <div class="action-bar">
            <v-btn variant="text" color="secondary" @click="resetForm">
              Reset
            </v-btn>

            <v-btn
              color="error"
              variant="flat"
              size="large"
              rounded="lg"
              prepend-icon="mdi-play-circle"
              :loading="loading"
              :disabled="loading"
              @click="submitForm"
            >
              Proses Konsultasi
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="editKtpDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="text-h6">Edit KTP / Passport</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="editKtpForm.ktp_passport"
            label="KTP / Passport"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model="editKtpForm.nama_pasien"
            label="Nama Lengkap Pasien"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="editKtpDialog = false">Batal</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-content-save"
            @click="saveKtp"
          >
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isFormValid: false,
      loading: false,
      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        {
          title: "Daftar Konsultasi",
          disabled: false,
          to: "/resepsionis/konsultasi",
        },
      ],

      form: {
        tanggal: this.getToday(),
        pasien_new_id: null,
        dokter_id: null,
        perawat_id: null,
      },

      pasienList: [
        {
          id: "PS001",
          text: "Budi Santoso - 3276010101010001",
          nama_pasien: "Budi Santoso",
          ktp_passport: "3276010101010001",
          no_ihs: "IHS001",
          created_date: "2026-04-01",
          is_member: true,
        },
        {
          id: "PS002",
          text: "Siti Aminah - 12345678",
          nama_pasien: "Siti Aminah",
          ktp_passport: "12345678",
          no_ihs: "",
          created_date: "2026-03-20",
          is_member: false,
        },
      ],

      dokterList: [
        { id: "D001", nama: "dr. Andi Saputra" },
        { id: "D002", nama: "dr. Bunga Lestari" },
      ],

      perawatList: [
        { id: "P001", nama: "Ns. Rina" },
        { id: "P002", nama: "Ns. Tika" },
      ],

      editKtpDialog: false,
      editKtpForm: {
        patient_id: null,
        ktp_passport: "",
        nama_pasien: "",
      },

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!v || "Field ini wajib diisi",
      },
    };
  },

  computed: {
    selectedPatient() {
      return (
        this.pasienList.find((item) => item.id === this.form.pasien_new_id) ||
        null
      );
    },

    showMemberWarning() {
      return !!this.selectedPatient?.is_member;
    },

    showKtpWarning() {
      if (!this.selectedPatient) return false;

      const ktpPassport = String(this.selectedPatient.ktp_passport || "");
      const noIhs = String(this.selectedPatient.no_ihs || "");
      const createdDate = String(this.selectedPatient.created_date || "");

      return (
        ktpPassport.length !== 16 ||
        (noIhs.length === 0 && createdDate !== this.getToday())
      );
    },
  },

  methods: {
    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    },

    onPatientChange() {},

    openEditKtpDialog() {
      if (!this.selectedPatient) return;

      this.editKtpForm = {
        patient_id: this.selectedPatient.id,
        ktp_passport: this.selectedPatient.ktp_passport,
        nama_pasien: this.selectedPatient.nama_pasien,
      };

      this.editKtpDialog = true;
    },

    saveKtp() {
      this.editKtpDialog = false;
      this.showSnackbar("Data identitas pasien diperbarui", "success");
    },

    resetForm() {
      this.form = {
        tanggal: this.getToday(),
        pasien_new_id: null,
        dokter_id: null,
        perawat_id: null,
      };
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Lengkapi field yang wajib diisi", "error");
        return;
      }

      this.loading = true;

      try {
        this.showSnackbar("Data konsultasi berhasil diproses", "success");
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

<style scoped>
.page-wrap {
  padding: 24px;
}

.form-head {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 16px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-bar {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}
</style>

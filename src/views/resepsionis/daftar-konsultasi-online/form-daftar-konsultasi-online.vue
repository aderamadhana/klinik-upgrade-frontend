<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Pendaftaran Konsultasi Online</h1>
        <p class="page-subtitle">
          Lengkapi data pasien dan informasi medis untuk proses konsultasi
          online.
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-alert
      v-if="flashError"
      type="error"
      closable
      class="mb-4"
      @click:close="flashError = ''"
    >
      {{ flashError }}
    </v-alert>

    <v-alert
      v-if="flashSuccess"
      type="success"
      closable
      class="mb-4"
      @click:close="flashSuccess = ''"
    >
      {{ flashSuccess }}
    </v-alert>

    <v-card>
      <v-card-text>
        <v-form ref="formRef" v-model="isFormValid">
          <div class="text-subtitle-1 font-weight-bold mb-4">
            Data Pendaftaran
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.tanggal"
                label="Tanggal Konsultasi"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.pasien_new_id"
                label="Pasien"
                placeholder="Pilih pasien"
                :items="pasienList"
                item-title="text"
                item-value="id"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
                clearable
                @update:modelValue="onPatientChange"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.dokter_id"
                label="Dokter"
                placeholder="Pilih dokter"
                :items="dokterList"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.request_dokter"
                label="Request Dokter"
                placeholder="Opsional"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-subtitle-1 font-weight-bold mb-4">
            Informasi Medis
          </div>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="form.alergi"
                label="Alergi"
                rows="3"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.keluhan"
                label="Keluhan Utama"
                rows="4"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.produk_sebelumnya"
                label="Produk / Obat Sebelumnya"
                rows="3"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-subtitle-1 font-weight-bold mb-4">
            Kondisi Khusus
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-radio-group
                v-model="form.sedang_hamil"
                label="Sedang hamil?"
                inline
                :rules="[rules.required]"
                hide-details="auto"
              >
                <v-radio label="Ya" value="ya" />
                <v-radio label="Tidak" value="tidak" />
              </v-radio-group>
            </v-col>

            <v-col cols="12" md="6">
              <v-radio-group
                v-model="form.sedang_menyusui"
                label="Sedang menyusui?"
                inline
                :rules="[rules.required]"
                hide-details="auto"
              >
                <v-radio label="Ya" value="ya" />
                <v-radio label="Tidak" value="tidak" />
              </v-radio-group>
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-subtitle-1 font-weight-bold mb-4">
            Dokumentasi Foto
          </div>

          <v-row>
            <v-col
              v-for="photo in photoCards"
              :key="photo.key"
              cols="12"
              md="4"
            >
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-title class="font-weight-bold">
                  {{ photo.title }}
                </v-card-title>

                <v-card-text>
                  <div
                    class="upload-dropzone"
                    :class="{
                      'upload-dropzone--active': dragActive === photo.key,
                    }"
                    @click="triggerFileInput(photo.key)"
                    @dragover.prevent="onDragOver(photo.key)"
                    @dragleave.prevent="onDragLeave"
                    @drop.prevent="onDrop($event, photo.key)"
                  >
                    <div>
                      <div class="text-body-1 font-weight-medium">
                        Klik atau drag gambar ke sini
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        PNG, JPG, JPEG, WEBP
                      </div>
                    </div>
                  </div>

                  <input
                    :ref="`fileInput_${photo.key}`"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    class="d-none"
                    @change="onFileChange($event, photo.key)"
                  />

                  <v-img
                    :src="form[photo.previewKey]"
                    height="280"
                    cover
                    rounded="lg"
                    class="mt-4 bg-grey-lighten-3"
                  />

                  <div
                    class="d-flex justify-space-between align-center mt-3 ga-2"
                  >
                    <div class="text-body-2 text-medium-emphasis text-truncate">
                      {{ form[photo.fileNameKey] || "Belum ada file dipilih" }}
                    </div>

                    <v-btn
                      v-if="form[photo.fileNameKey]"
                      size="small"
                      variant="text"
                      color="error"
                      prepend-icon="mdi-delete-outline"
                      @click.stop="removeImage(photo.key)"
                    >
                      Hapus
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-subtitle-1 font-weight-bold mb-4">
            Catatan Tambahan
          </div>

          <v-textarea
            v-model="form.catatan"
            label="Catatan"
            rows="3"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />

          <template v-if="form.pasien_new_id">
            <v-divider class="my-6" />

            <div class="text-subtitle-1 font-weight-bold mb-4">
              Riwayat Konsultasi
            </div>

            <v-data-table
              :headers="historyHeaders"
              :items="consultationHistory"
              item-value="id"
            >
              <template #item.tindakan_html="{ item }">
                <div v-html="item.tindakan_html || '-'" />
              </template>

              <template #item.obat_html="{ item }">
                <div v-html="item.obat_html || '-'" />
              </template>

              <template #item.catatan_html="{ item }">
                <div v-html="item.catatan_html || '-'" />
              </template>

              <template #no-data>
                <div class="text-center py-6">
                  <div class="text-body-1 font-weight-medium mb-1">
                    Belum ada riwayat konsultasi
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Riwayat pasien akan tampil di sini
                  </div>
                </div>
              </template>
            </v-data-table>
          </template>

          <div class="d-flex justify-end ga-2 mt-6">
            <v-btn variant="text" @click="resetForm"> Reset </v-btn>

            <v-btn
              color="primary"
              prepend-icon="mdi-send"
              :loading="loading"
              @click="submitForm"
            >
              Daftar Konsultasi
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="pageLoader" persistent width="300">
      <v-card>
        <v-card-text class="text-center py-6">
          <v-progress-circular indeterminate color="primary" class="mb-3" />
          <div>Memproses pendaftaran...</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import sisiKanan from "@/assets/sisi-kanan2.jpg";
import sisiTengah from "@/assets/sisi-tengah2.jpg";
import sisiKiri from "@/assets/sisi-kiri2.jpg";

export default {
  name: "PendaftaranKonsultasiOnlinePage",

  data() {
    return {
      isFormValid: false,
      loading: false,
      pageLoader: false,
      flashError: "",
      flashSuccess: "",
      dragActive: null,

      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        {
          title: "Daftar Konsultasi Online",
          disabled: false,
          to: "/resepsionis/konsultasi-online",
        },
      ],
      form: {
        tanggal: this.getToday(),
        pasien_new_id: null,
        dokter_id: null,
        request_dokter: "",
        alergi: "",
        keluhan: "",
        produk_sebelumnya: "",
        sedang_hamil: null,
        sedang_menyusui: null,
        catatan: "",

        bukti_foto_kiri: "",
        bukti_foto_depan: "",
        bukti_foto_kanan: "",

        preview_before_1: sisiKanan,
        preview_before_2: sisiTengah,
        preview_before_3: sisiKiri,

        file_name_1: "",
        file_name_2: "",
        file_name_3: "",
      },

      pasienList: [
        { id: "PS001", text: "Budi Santoso" },
        { id: "PS002", text: "Siti Aminah" },
        { id: "PS003", text: "Rina Lestari" },
      ],

      dokterList: [
        { id: "D001", nama: "dr. Andi Saputra" },
        { id: "D002", nama: "dr. Bunga Lestari" },
        { id: "D003", nama: "dr. Candra Wijaya" },
      ],

      historyHeaders: [
        { title: "TGL", key: "tgl" },
        { title: "DOKTER", key: "dokter" },
        { title: "TINDAKAN & PERAWAT", key: "tindakan_html", sortable: false },
        { title: "OBAT", key: "obat_html", sortable: false },
        { title: "CATATAN DOKTER", key: "catatan_html", sortable: false },
        { title: "KLINIK", key: "lokasi" },
      ],

      consultationHistory: [],

      photoCards: [
        {
          key: "before_1",
          title: "Upload Foto Pasien 1",
          previewKey: "preview_before_1",
          fileNameKey: "file_name_1",
        },
        {
          key: "before_2",
          title: "Upload Foto Pasien 2",
          previewKey: "preview_before_2",
          fileNameKey: "file_name_2",
        },
        {
          key: "before_3",
          title: "Upload Foto Pasien 3",
          previewKey: "preview_before_3",
          fileNameKey: "file_name_3",
        },
      ],

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

  methods: {
    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    },

    onPatientChange(patientId) {
      if (!patientId) {
        this.consultationHistory = [];
        return;
      }

      this.consultationHistory = [
        {
          id: 1,
          tgl: "2026-04-01",
          dokter: "dr. Andi Saputra",
          tindakan_html: "Facial Acne<br><small>Perawat: Ns. Rina</small>",
          obat_html: "Krim Malam<br>Sabun Wajah",
          catatan_html: "Kulit sensitif, hindari exfoliasi berlebih",
          lokasi: "Klinik Pusat",
        },
      ];
    },

    triggerFileInput(key) {
      const refName = `fileInput_${key}`;
      const input = this.$refs[refName];

      if (Array.isArray(input)) {
        input[0]?.click();
      } else {
        input?.click();
      }
    },

    onDragOver(key) {
      this.dragActive = key;
    },

    onDragLeave() {
      this.dragActive = null;
    },

    onDrop(event, key) {
      this.dragActive = null;
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;

      this.processImageFile(file, key);
    },

    onFileChange(event, key) {
      const file = event.target.files?.[0];
      if (!file) return;

      this.processImageFile(file, key);
      event.target.value = "";
    },

    processImageFile(file, key) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        this.showSnackbar(
          "Format file harus PNG, JPG, JPEG, atau WEBP",
          "error",
        );
        return;
      }

      const previewMap = {
        before_1: "preview_before_1",
        before_2: "preview_before_2",
        before_3: "preview_before_3",
      };

      const hiddenMap = {
        before_1: "bukti_foto_kiri",
        before_2: "bukti_foto_depan",
        before_3: "bukti_foto_kanan",
      };

      const fileNameMap = {
        before_1: "file_name_1",
        before_2: "file_name_2",
        before_3: "file_name_3",
      };

      this.form[previewMap[key]] = URL.createObjectURL(file);
      this.form[hiddenMap[key]] = file;
      this.form[fileNameMap[key]] = file.name;
    },

    removeImage(key) {
      const previewMap = {
        before_1: "preview_before_1",
        before_2: "preview_before_2",
        before_3: "preview_before_3",
      };

      const hiddenMap = {
        before_1: "bukti_foto_kiri",
        before_2: "bukti_foto_depan",
        before_3: "bukti_foto_kanan",
      };

      const fileNameMap = {
        before_1: "file_name_1",
        before_2: "file_name_2",
        before_3: "file_name_3",
      };

      const defaultPreviewMap = {
        before_1: sisiKanan,
        before_2: sisiTengah,
        before_3: sisiKiri,
      };

      this.form[previewMap[key]] = defaultPreviewMap[key];
      this.form[hiddenMap[key]] = "";
      this.form[fileNameMap[key]] = "";
    },

    resetForm() {
      this.form = {
        tanggal: this.getToday(),
        pasien_new_id: null,
        dokter_id: null,
        request_dokter: "",
        alergi: "",
        keluhan: "",
        produk_sebelumnya: "",
        sedang_hamil: null,
        sedang_menyusui: null,
        catatan: "",

        bukti_foto_kiri: "",
        bukti_foto_depan: "",
        bukti_foto_kanan: "",

        preview_before_1: "/assets/sisi-kanan2.jpg",
        preview_before_2: "/assets/sisi-tengah2.jpg",
        preview_before_3: "/assets/sisi-kiri2.jpg",

        file_name_1: "",
        file_name_2: "",
        file_name_3: "",
      };

      this.consultationHistory = [];
      this.dragActive = null;
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar(
          "Mohon lengkapi semua field yang wajib diisi",
          "error",
        );
        return;
      }

      this.loading = true;
      this.pageLoader = true;

      try {
        const payload = {
          ...this.form,
          bukti_foto_kiri: this.form.bukti_foto_kiri,
          bukti_foto_depan: this.form.bukti_foto_depan,
          bukti_foto_kanan: this.form.bukti_foto_kanan,
        };

        console.log("Submit:", payload);

        await new Promise((resolve) => setTimeout(resolve, 1500));
        this.showSnackbar(
          "Pendaftaran konsultasi berhasil diproses",
          "success",
        );
      } catch (error) {
        this.showSnackbar("Gagal memproses pendaftaran", "error");
      } finally {
        this.loading = false;
        this.pageLoader = false;
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
.upload-dropzone {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease;
  padding: 12px 16px;
}

.upload-dropzone:hover {
  background: rgba(0, 0, 0, 0.02);
}

.upload-dropzone--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}
</style>

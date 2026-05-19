<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-5"
    >
      Bagian ini hanya muncul jika layanan konsultasi dipilih dan channel
      konsultasi adalah online.
    </v-alert>

    <!-- FORM UTAMA -->
    <div class="group-wrap mb-5">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="primary">
            mdi-file-document-edit-outline
          </v-icon>
          Form Konsultasi
        </div>

        <div class="group-subtitle">
          Informasi utama yang dibutuhkan dokter sebelum meninjau pasien secara
          online
        </div>
      </div>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field
            :model-value="ko.request_dokter"
            label="Request Dokter Khusus"
            placeholder="Opsional"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-doctor"
            hide-details="auto"
            @update:modelValue="updateField('request_dokter', $event)"
          >
            <template #message>
              Isi jika pasien meminta dokter tertentu
            </template>
          </v-text-field>
        </v-col>

        <v-col cols="12">
          <v-textarea
            :model-value="ko.alergi"
            label="Alergi"
            rows="3"
            auto-grow
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            placeholder="Sebutkan alergi, jika tidak ada tulis 'Tidak ada'"
            hide-details="auto"
            @update:modelValue="updateField('alergi', $event)"
          >
            <template #message>
              Wajib diisi. Jika tidak ada alergi, tulis dengan jelas.
            </template>
          </v-textarea>
        </v-col>

        <v-col cols="12">
          <v-textarea
            :model-value="ko.keluhan"
            label="Keluhan Utama"
            rows="4"
            auto-grow
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            placeholder="Jelaskan keluhan pasien secara detail"
            hide-details="auto"
            @update:modelValue="updateField('keluhan', $event)"
          >
            <template #message>
              Jelaskan kondisi utama pasien sejelas mungkin agar konsultasi
              lebih efektif.
            </template>
          </v-textarea>
        </v-col>

        <v-col cols="12">
          <v-textarea
            :model-value="ko.produk_sebelumnya"
            label="Produk / Obat Sebelumnya"
            rows="3"
            auto-grow
            variant="outlined"
            density="comfortable"
            placeholder="Tuliskan produk atau obat yang pernah/sedang digunakan"
            hide-details="auto"
            @update:modelValue="updateField('produk_sebelumnya', $event)"
          >
            <template #message>
              Opsional, namun sangat membantu untuk menilai kondisi pasien
            </template>
          </v-textarea>
        </v-col>

        <v-col cols="12" md="6">
          <div class="radio-card">
            <div class="radio-card__title">Sedang hamil?</div>
            <div class="radio-card__desc">
              Informasi ini diperlukan untuk pertimbangan tindakan atau obat
            </div>

            <v-radio-group
              :model-value="ko.sedang_hamil"
              inline
              hide-details="auto"
              @update:modelValue="updateField('sedang_hamil', $event)"
            >
              <v-radio label="Ya" value="ya" />
              <v-radio label="Tidak" value="tidak" />
            </v-radio-group>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="radio-card">
            <div class="radio-card__title">Sedang menyusui?</div>
            <div class="radio-card__desc">
              Informasi ini membantu dokter dalam menentukan rekomendasi aman
            </div>

            <v-radio-group
              :model-value="ko.sedang_menyusui"
              inline
              hide-details="auto"
              @update:modelValue="updateField('sedang_menyusui', $event)"
            >
              <v-radio label="Ya" value="ya" />
              <v-radio label="Tidak" value="tidak" />
            </v-radio-group>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- FOTO -->
    <div class="group-wrap mb-5">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="primary">
            mdi-image-multiple-outline
          </v-icon>
          Dokumentasi Foto
        </div>

        <div class="group-subtitle">
          Upload foto pasien untuk membantu peninjauan visual sebelum konsultasi
        </div>
      </div>

      <template v-if="photoCards && photoCards.length">
        <v-row dense>
          <v-col v-for="photo in photoCards" :key="photo.key" cols="12" md="4">
            <v-card variant="outlined" rounded="xl" class="photo-card h-100">
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
                  @dragover.prevent="$emit('drag-over', photo.key)"
                  @dragleave.prevent="$emit('drag-leave')"
                  @drop.prevent="$emit('file-drop', $event, photo.key)"
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
                  @change="$emit('file-change', $event, photo.key)"
                />

                <v-img
                  :src="getPreviewSrc(photo.previewKey)"
                  height="220"
                  cover
                  rounded="lg"
                  class="mt-4 bg-grey-lighten-3"
                />

                <div
                  class="d-flex justify-space-between align-center mt-3 ga-2"
                >
                  <div class="text-body-2 text-medium-emphasis text-truncate">
                    {{ ko[photo.fileNameKey] || "Belum ada file dipilih" }}
                  </div>

                  <v-btn
                    v-if="ko[photo.fileNameKey]"
                    size="small"
                    variant="text"
                    color="error"
                    prepend-icon="mdi-delete-outline"
                    @click.stop="$emit('remove-image', photo.key)"
                  >
                    Hapus
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-else>
        <div class="empty-state">
          <v-icon size="36" color="grey">mdi-image-off-outline</v-icon>
          <div class="empty-state__title">Belum ada slot upload foto</div>
          <div class="empty-state__text">
            Data foto belum disiapkan dari parent, jadi area upload belum dapat
            ditampilkan.
          </div>
        </div>
      </template>
    </div>

    <!-- RIWAYAT -->
    <div class="group-wrap">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="success">mdi-history</v-icon>
          Riwayat Konsultasi
        </div>

        <div class="group-subtitle">
          Riwayat konsultasi sebelumnya untuk referensi dokter
        </div>
      </div>

      <template v-if="consultationHistory && consultationHistory.length">
        <v-card rounded="xl" variant="outlined">
          <v-data-table
            :headers="historyHeaders"
            :items="consultationHistory"
            item-value="id"
            density="comfortable"
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
          </v-data-table>
        </v-card>
      </template>

      <template v-else>
        <div class="empty-state">
          <v-icon size="36" color="grey">mdi-history</v-icon>
          <div class="empty-state__title">Belum ada riwayat konsultasi</div>
          <div class="empty-state__text">
            Sistem belum menemukan riwayat konsultasi sebelumnya untuk pasien
            ini.
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import sisiKanan from "@/assets/sisi-kanan2.jpg";
import sisiTengah from "@/assets/sisi-tengah2.jpg";
import sisiKiri from "@/assets/sisi-kiri2.jpg";

export default {
  name: "KonsultasiOnline",

  props: {
    form: {
      type: Object,
      required: true,
    },
    rules: {
      type: Object,
      required: true,
    },
    dragActive: {
      type: String,
      default: null,
    },
    consultationHistory: {
      type: Array,
      default: () => [],
    },
    historyHeaders: {
      type: Array,
      default: () => [],
    },
    photoCards: {
      type: Array,
      default: () => [],
    },
  },

  emits: [
    "update-konsultasi-online",
    "drag-over",
    "drag-leave",
    "file-drop",
    "file-change",
    "remove-image",
  ],

  computed: {
    ko() {
      return (
        this.form?.konsultasi_online || {
          request_dokter: "",
          alergi: "",
          keluhan: "",
          produk_sebelumnya: "",
          sedang_hamil: null,
          sedang_menyusui: null,
          bukti_foto_kiri: "",
          bukti_foto_depan: "",
          bukti_foto_kanan: "",
          preview_before_1: "",
          preview_before_2: "",
          preview_before_3: "",
          file_name_1: "",
          file_name_2: "",
          file_name_3: "",
        }
      );
    },
  },

  methods: {
    updateField(field, value) {
      this.$emit("update-konsultasi-online", { field, value });
    },

    triggerFileInput(key) {
      const refName = `fileInput_${key}`;
      const input = this.$refs[refName];

      if (Array.isArray(input)) {
        input[0]?.click();
        return;
      }

      input?.click();
    },

    getPreviewSrc(previewKey) {
      const defaultPreviewMap = {
        preview_before_1: sisiKanan,
        preview_before_2: sisiTengah,
        preview_before_3: sisiKiri,
      };

      return this.ko[previewKey] || defaultPreviewMap[previewKey] || "";
    },
  },
};
</script>

<style scoped>
.group-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 20px;
  background: #fff;
}

.group-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.group-subtitle {
  font-size: 13px;
  color: #6b7280;
}

.radio-card {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;
}

.radio-card__title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.radio-card__desc {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.5;
}

.upload-dropzone {
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  min-height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease;
  padding: 12px 16px;
  background: #fafafa;
}

.upload-dropzone:hover {
  background: rgba(0, 0, 0, 0.02);
}

.upload-dropzone--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.photo-card {
  height: 100%;
}

.h-100 {
  height: 100%;
}

.empty-state {
  min-height: 180px;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.empty-state__title {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.empty-state__text {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
  max-width: 520px;
}

@media (max-width: 768px) {
  .group-wrap {
    padding: 16px;
  }
}
</style>

<template>
  <div class="mt-3">
    <v-alert type="info" density="comfortable" border="start" class="mb-4">
      Bagian ini hanya muncul jika layanan konsultasi dipilih dan channel
      konsultasi adalah online.
    </v-alert>

    <v-card variant="flat" class="border mb-4">
      <v-card-text class="pa-4">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
        >
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" size="42">
              <v-icon size="22">mdi-file-document-edit-outline</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Form Konsultasi
              </div>
              <div class="text-caption text-medium-emphasis">
                Informasi utama yang dibutuhkan dokter sebelum meninjau pasien
                secara online
              </div>
            </div>
          </div>

          <v-chip color="primary" size="small" class="font-weight-medium">
            Konsultasi Online
          </v-chip>
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
              @update:model-value="updateField('request_dokter', $event)"
            >
              <template #message>
                Isi jika pasien meminta dokter tertentu
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-text class="pa-3">
                <div class="text-subtitle-2 font-weight-bold mb-1">
                  Kondisi Khusus
                </div>

                <div class="text-caption text-medium-emphasis mb-3">
                  Dibutuhkan untuk pertimbangan tindakan atau obat.
                </div>

                <v-row dense>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-medium-emphasis mb-1">
                      Sedang hamil?
                    </div>

                    <v-radio-group
                      :model-value="ko.sedang_hamil"
                      inline
                      density="compact"
                      hide-details="auto"
                      @update:model-value="updateField('sedang_hamil', $event)"
                    >
                      <v-radio label="Ya" value="ya" />
                      <v-radio label="Tidak" value="tidak" />
                    </v-radio-group>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <div class="text-caption text-medium-emphasis mb-1">
                      Sedang menyusui?
                    </div>

                    <v-radio-group
                      :model-value="ko.sedang_menyusui"
                      inline
                      density="compact"
                      hide-details="auto"
                      @update:model-value="
                        updateField('sedang_menyusui', $event)
                      "
                    >
                      <v-radio label="Ya" value="ya" />
                      <v-radio label="Tidak" value="tidak" />
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
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
              @update:model-value="updateField('alergi', $event)"
            >
              <template #message>
                Wajib diisi. Jika tidak ada alergi, tulis dengan jelas.
              </template>
            </v-textarea>
          </v-col>

          <v-col cols="12" md="6">
            <v-textarea
              :model-value="ko.produk_sebelumnya"
              label="Produk / Obat Sebelumnya"
              rows="3"
              auto-grow
              variant="outlined"
              density="comfortable"
              placeholder="Tuliskan produk atau obat yang pernah/sedang digunakan"
              hide-details="auto"
              @update:model-value="updateField('produk_sebelumnya', $event)"
            >
              <template #message>
                Opsional, namun sangat membantu untuk menilai kondisi pasien
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
              @update:model-value="updateField('keluhan', $event)"
            >
              <template #message>
                Jelaskan kondisi utama pasien sejelas mungkin agar konsultasi
                lebih efektif.
              </template>
            </v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card variant="flat" class="border mb-4">
      <v-card-text class="pa-4">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
        >
          <div class="d-flex align-center ga-3">
            <v-avatar color="info" size="42">
              <v-icon size="22">mdi-image-multiple-outline</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Dokumentasi Foto
              </div>

              <div class="text-caption text-medium-emphasis">
                Upload foto pasien untuk membantu peninjauan visual sebelum
                konsultasi
              </div>
            </div>
          </div>

          <v-chip color="info" size="small">
            {{
              photoCards && photoCards.length
                ? `${photoCards.length} slot foto`
                : "Belum ada slot"
            }}
          </v-chip>
        </div>

        <template v-if="photoCards && photoCards.length">
          <v-row dense>
            <v-col
              v-for="photo in photoCards"
              :key="photo.key"
              cols="12"
              md="4"
            >
              <v-card variant="outlined" class="h-100">
                <v-card-title class="pa-3 text-subtitle-2 font-weight-bold">
                  {{ photo.title }}
                </v-card-title>

                <v-divider />

                <v-card-text class="pa-3">
                  <v-card
                    :color="dragActive === photo.key ? 'primary' : undefined"
                    :variant="dragActive === photo.key ? 'tonal' : 'outlined'"
                    class="pa-4 text-center"
                    role="button"
                    @click="triggerFileInput(photo.key)"
                    @dragover.prevent="onDragOver(photo.key)"
                    @dragleave.prevent="onDragLeave"
                    @drop.prevent="onDrop($event, photo)"
                  >
                    <v-icon
                      :color="dragActive === photo.key ? 'primary' : 'grey'"
                      size="34"
                      class="mb-2"
                    >
                      mdi-cloud-upload-outline
                    </v-icon>

                    <div class="text-body-2 font-weight-bold">
                      Klik atau drag gambar ke sini
                    </div>

                    <div class="text-caption text-medium-emphasis">
                      PNG, JPG, JPEG, WEBP
                    </div>
                  </v-card>

                  <input
                    :ref="`fileInput_${photo.key}`"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    class="d-none"
                    @change="onFileChange($event, photo)"
                  />

                  <v-img
                    v-if="getPreviewSrc(photo)"
                    :src="getPreviewSrc(photo)"
                    height="210"
                    cover
                    class="mt-3 bg-grey-lighten-3 rounded"
                  />

                  <v-card
                    v-else
                    variant="outlined"
                    height="210"
                    class="mt-3 d-flex align-center justify-center"
                  >
                    <div class="text-center">
                      <v-icon size="38" color="grey">mdi-image-outline</v-icon>
                      <div class="text-caption text-medium-emphasis mt-2">
                        Belum ada preview
                      </div>
                    </div>
                  </v-card>

                  <div
                    class="d-flex justify-space-between align-center mt-3 ga-2"
                  >
                    <div
                      class="text-caption text-medium-emphasis text-truncate"
                    >
                      {{ ko[photo.fileNameKey] || "Belum ada file dipilih" }}
                    </div>

                    <v-btn
                      v-if="
                        ko[photo.fileNameKey] || getSelectedPreviewSrc(photo)
                      "
                      size="small"
                      color="error"
                      variant="tonal"
                      prepend-icon="mdi-delete-outline"
                      @click.stop="removePhoto(photo)"
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
          <v-card variant="outlined">
            <v-card-text class="pa-8">
              <div
                class="d-flex flex-column align-center justify-center text-center"
              >
                <v-avatar color="grey-lighten-3" size="56" class="mb-4">
                  <v-icon size="30" color="grey-darken-1">
                    mdi-image-off-outline
                  </v-icon>
                </v-avatar>

                <div class="text-subtitle-2 font-weight-bold">
                  Belum ada slot upload foto
                </div>

                <div class="text-body-2 text-medium-emphasis mt-1">
                  Data foto belum disiapkan dari parent, jadi area upload belum
                  dapat ditampilkan.
                </div>
              </div>
            </v-card-text>
          </v-card>
        </template>
      </v-card-text>
    </v-card>

    <v-card variant="flat" class="border">
      <v-card-text class="pa-4">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
        >
          <div class="d-flex align-center ga-3">
            <v-avatar color="success" size="42">
              <v-icon size="22">mdi-history</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Riwayat Konsultasi
              </div>

              <div class="text-caption text-medium-emphasis">
                Riwayat konsultasi sebelumnya untuk referensi dokter
              </div>
            </div>
          </div>

          <v-chip color="success" size="small">
            {{
              consultationHistory && consultationHistory.length
                ? `${consultationHistory.length} riwayat`
                : "Tidak ada riwayat"
            }}
          </v-chip>
        </div>

        <template v-if="consultationHistory && consultationHistory.length">
          <v-card variant="outlined">
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
          <v-card variant="outlined">
            <v-card-text class="pa-10">
              <div
                class="d-flex flex-column align-center justify-center text-center"
              >
                <v-avatar color="grey-lighten-3" size="56" class="mb-4">
                  <v-icon size="30" color="grey-darken-1"> mdi-history </v-icon>
                </v-avatar>

                <div class="text-subtitle-2 font-weight-bold">
                  Belum ada riwayat konsultasi
                </div>

                <div class="text-body-2 text-medium-emphasis mt-1">
                  Sistem belum menemukan riwayat konsultasi sebelumnya untuk
                  pasien ini.
                </div>
              </div>
            </v-card-text>
          </v-card>
        </template>
      </v-card-text>
    </v-card>
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

  data() {
    return {
      localPreviewUrls: {},
    };
  },

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

  beforeUnmount() {
    Object.values(this.localPreviewUrls || {}).forEach((url) => {
      if (url && String(url).startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
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

    onDragOver(key) {
      this.$emit("drag-over", key);
    },

    onDragLeave() {
      this.$emit("drag-leave");
    },

    onDrop(event, photo) {
      this.$emit("file-drop", event, photo.key);

      const file = event?.dataTransfer?.files?.[0] || null;

      if (!file) {
        return;
      }

      this.setPhotoFile(file, photo, event);
    },

    onFileChange(event, photo) {
      const file = event?.target?.files?.[0] || null;

      if (!file) {
        return;
      }

      this.setPhotoFile(file, photo, event);
    },

    setPhotoFile(file, photo, event = null) {
      if (!this.isValidImageFile(file)) {
        this.resetNativeInput(photo.key);
        return;
      }

      this.revokePreviewUrl(photo.previewKey);

      const previewUrl = URL.createObjectURL(file);
      const uploadField = this.getUploadField(photo.key);

      this.localPreviewUrls = {
        ...this.localPreviewUrls,
        [photo.previewKey]: previewUrl,
      };

      this.updateField(photo.previewKey, previewUrl);
      this.updateField(photo.fileNameKey, file.name);

      if (uploadField) {
        this.updateField(uploadField, file);
      }

      this.$emit("file-change", event, photo.key, file);
    },

    removePhoto(photo) {
      const uploadField = this.getUploadField(photo.key);

      this.revokePreviewUrl(photo.previewKey);

      this.localPreviewUrls = {
        ...this.localPreviewUrls,
        [photo.previewKey]: "",
      };

      this.updateField(photo.previewKey, "");
      this.updateField(photo.fileNameKey, "");

      if (uploadField) {
        this.updateField(uploadField, "");
      }

      this.resetNativeInput(photo.key);
      this.$emit("remove-image", photo.key);
    },

    resetNativeInput(key) {
      const refName = `fileInput_${key}`;
      const input = this.$refs[refName];

      if (Array.isArray(input)) {
        if (input[0]) {
          input[0].value = "";
        }

        return;
      }

      if (input) {
        input.value = "";
      }
    },

    isValidImageFile(file) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      return Boolean(file && allowedTypes.includes(file.type));
    },

    revokePreviewUrl(previewKey) {
      const existingUrl = this.localPreviewUrls?.[previewKey];

      if (existingUrl && String(existingUrl).startsWith("blob:")) {
        URL.revokeObjectURL(existingUrl);
      }
    },

    getUploadField(key) {
      const map = {
        before_1: "bukti_foto_kiri",
        before_2: "bukti_foto_depan",
        before_3: "bukti_foto_kanan",
      };

      return map[key] || null;
    },

    getSelectedPreviewSrc(photo) {
      return (
        this.localPreviewUrls?.[photo.previewKey] ||
        this.ko[photo.previewKey] ||
        ""
      );
    },

    getPreviewSrc(photo) {
      const selectedPreview = this.getSelectedPreviewSrc(photo);

      if (selectedPreview) {
        return selectedPreview;
      }

      const defaultPreviewMap = {
        preview_before_1: sisiKanan,
        preview_before_2: sisiTengah,
        preview_before_3: sisiKiri,
      };

      return defaultPreviewMap[photo.previewKey] || "";
    },
  },
};
</script>

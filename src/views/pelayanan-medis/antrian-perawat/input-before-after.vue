<template>
  <div class="before-after-page">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Input Before & After</h1>
        <p class="page-subtitle">
          Upload dokumentasi before dan after pasien dengan alur yang lebih
          jelas dan mudah digunakan
        </p>
      </div>

      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Kembali
      </v-btn>
    </div>

    <!-- RINGKASAN -->
    <v-card rounded="lg" elevation="0" border class="mb-5">
      <v-card-text class="pa-4 pa-md-5">
        <div class="section-top mb-4">
          <div>
            <div class="section-title">Ringkasan Pasien</div>
            <div class="section-subtitle">
              Pastikan data pasien dan kunjungan sudah sesuai sebelum upload
              foto
            </div>
          </div>
        </div>

        <v-row>
          <v-col
            v-for="item in patientSummary"
            :key="item.label"
            cols="12"
            sm="6"
            md="3"
          >
            <div class="summary-box">
              <div class="summary-label">{{ item.label }}</div>
              <div class="summary-value">{{ item.value }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- FORM -->
    <v-card rounded="lg" elevation="0" border>
      <v-card-title class="form-card-title">
        Form Upload Before & After
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4 pa-md-5">
        <v-alert type="info" density="comfortable" class="mb-5">
          Upload masing-masing 3 foto untuk tahap Before dan After. Klik tahap
          yang ingin dikerjakan, lalu upload foto pada slot yang tersedia.
        </v-alert>

        <!-- STEP SWITCH -->
        <div class="section-title mb-2">Tahap Upload</div>
        <div class="section-subtitle mb-4">
          Pilih tahap yang ingin dibuka. Tahap aktif akan ditampilkan di bawah.
        </div>

        <div class="step-switch mb-5">
          <button
            type="button"
            class="step-card"
            :class="{ active: currentStep === 'before' }"
            @click="setStep('before')"
          >
            <div class="step-card-top">
              <div class="step-badge">1</div>
              <div class="step-text-wrap">
                <div class="step-title">Foto Before</div>
                <div class="step-subtitle">
                  {{ beforeUploadedCount }}/3 foto terupload
                </div>
              </div>
            </div>
            <div class="step-hint">
              Klik untuk membuka slot upload foto before
            </div>
          </button>

          <button
            type="button"
            class="step-card"
            :class="{ active: currentStep === 'after' }"
            @click="setStep('after')"
          >
            <div class="step-card-top">
              <div class="step-badge">2</div>
              <div class="step-text-wrap">
                <div class="step-title">Foto After</div>
                <div class="step-subtitle">
                  {{ afterUploadedCount }}/3 foto terupload
                </div>
              </div>
            </div>
            <div class="step-hint">
              Klik untuk membuka slot upload foto after
            </div>
          </button>
        </div>

        <!-- CURRENT STEP HEADER -->
        <div class="current-step-head mb-4">
          <div class="soap-title-wrap">
            <div class="soap-badge photo-badge">
              {{ currentStep === "before" ? "B" : "A" }}
            </div>
            <div>
              <div class="soap-title">
                {{
                  currentStep === "before"
                    ? "Upload Foto Before"
                    : "Upload Foto After"
                }}
              </div>
              <div class="soap-subtitle">
                {{
                  currentStep === "before"
                    ? "Upload kondisi pasien sebelum tindakan"
                    : "Upload kondisi pasien setelah tindakan"
                }}
              </div>
            </div>
          </div>

          <v-chip
            size="small"
            :color="isCurrentStepComplete ? 'success' : 'default'"
          >
            {{ currentUploadedCount }}/3 terupload
          </v-chip>
        </div>

        <!-- UPLOAD GRID -->
        <v-row>
          <v-col
            v-for="(slot, index) in currentSlots"
            :key="slot.key"
            cols="12"
            md="4"
          >
            <div class="upload-slot-card">
              <div class="upload-slot-head">
                <div class="upload-slot-title">
                  {{ slot.title }}
                </div>

                <v-chip
                  size="x-small"
                  :color="slot.previewUrl ? 'success' : 'default'"
                >
                  {{ slot.previewUrl ? "Terupload" : "Kosong" }}
                </v-chip>
              </div>

              <div
                class="drop-zone"
                :class="{ dragging: dragIndex === index }"
                @click="openPicker(index)"
                @dragover.prevent="handleDragOver(index)"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop($event, index)"
              >
                <input
                  :ref="setFileInputRef(index)"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="handleFileChange($event, index)"
                />

                <div class="drop-zone-inner">
                  <v-icon size="22">mdi-cloud-upload-outline</v-icon>
                  <span v-if="!slot.fileName">
                    Klik atau drag gambar ke sini
                  </span>
                  <span v-else class="file-name">
                    {{ slot.fileName }}
                  </span>
                </div>
              </div>

              <div class="preview-frame">
                <template v-if="slot.previewUrl">
                  <img
                    :src="slot.previewUrl"
                    :alt="slot.title"
                    class="preview-image"
                  />

                  <div class="preview-actions">
                    <v-btn
                      size="small"
                      color="error"
                      variant="flat"
                      icon="mdi-close"
                      @click.stop="removeImage(index)"
                    />
                  </div>
                </template>

                <template v-else>
                  <div class="preview-placeholder">
                    <div class="placeholder-avatar">
                      <v-icon size="72" color="#c7ced8">
                        mdi-image-outline
                      </v-icon>
                    </div>
                    <div class="placeholder-text">Preview {{ slot.title }}</div>
                  </div>
                </template>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <!-- ACTION BAR -->
      <div class="action-bar">
        <div class="action-bar-left">
          <span class="action-hint">
            {{ totalUploadedCount }}/6 foto sudah terupload
          </span>
        </div>

        <div class="action-bar-right">
          <v-btn variant="text" color="secondary" @click="resetCurrentStep">
            Reset Tahap Ini
          </v-btn>

          <v-btn
            v-if="currentStep === 'before'"
            color="primary"
            append-icon="mdi-arrow-right"
            :disabled="!isCurrentStepComplete"
            @click="setStep('after')"
          >
            Lanjut ke After
          </v-btn>

          <template v-else>
            <v-btn
              variant="outlined"
              color="primary"
              prepend-icon="mdi-arrow-left"
              @click="setStep('before')"
            >
              Kembali Before
            </v-btn>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              :disabled="!isAllComplete"
              @click="saveBeforeAfter"
            >
              Simpan Foto
            </v-btn>
          </template>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
const createSlots = (label) =>
  [1, 2, 3].map((num) => ({
    key: `${label.toLowerCase()}-${num}`,
    title: `${label} ${num}`,
    file: null,
    fileName: "",
    previewUrl: "",
  }));

export default {
  name: "InputBeforeAfter",

  data() {
    return {
      currentStep: "before",
      dragIndex: null,

      patient: {
        nama_pasien: "ADE RAMADHANA PRATAMA",
        no_rm: "M20260307001",
        cabang: "MALANG",
        dokter: "Dr. Rayi Vialita Poetri",
        tanggal_kunjungan: "2026-04-20",
        waktu_kunjungan: "09:00",
        channel: "Online",
        treatment: "Facial Barbie Light",
      },

      beforeSlots: createSlots("Before"),
      afterSlots: createSlots("After"),

      fileInputRefs: {
        before: [],
        after: [],
      },
    };
  },

  computed: {
    patientSummary() {
      return [
        { label: "Nama Pasien", value: this.patient.nama_pasien },
        { label: "No. RM", value: this.patient.no_rm },
        { label: "Cabang", value: this.patient.cabang },
        { label: "Dokter", value: this.patient.dokter },
        { label: "Tanggal Kunjungan", value: this.patient.tanggal_kunjungan },
        { label: "Waktu Kunjungan", value: this.patient.waktu_kunjungan },
        { label: "Channel", value: this.patient.channel },
        { label: "Treatment", value: this.patient.treatment },
      ];
    },

    currentSlots() {
      return this.currentStep === "before" ? this.beforeSlots : this.afterSlots;
    },

    currentUploadedCount() {
      return this.currentSlots.filter((item) => item.previewUrl).length;
    },

    beforeUploadedCount() {
      return this.beforeSlots.filter((item) => item.previewUrl).length;
    },

    afterUploadedCount() {
      return this.afterSlots.filter((item) => item.previewUrl).length;
    },

    totalUploadedCount() {
      return this.beforeUploadedCount + this.afterUploadedCount;
    },

    isCurrentStepComplete() {
      return this.currentSlots.every((item) => !!item.previewUrl);
    },

    isAllComplete() {
      return (
        this.beforeSlots.every((item) => !!item.previewUrl) &&
        this.afterSlots.every((item) => !!item.previewUrl)
      );
    },
  },

  methods: {
    setStep(step) {
      this.currentStep = step;
      this.dragIndex = null;
    },

    goBack() {
      this.$router.back();
    },

    setFileInputRef(index) {
      return (el) => {
        if (!this.fileInputRefs[this.currentStep]) {
          this.fileInputRefs[this.currentStep] = [];
        }
        this.fileInputRefs[this.currentStep][index] = el;
      };
    },

    openPicker(index) {
      const input = this.fileInputRefs[this.currentStep]?.[index];
      if (input) input.click();
    },

    handleDragOver(index) {
      this.dragIndex = index;
    },

    handleDragLeave() {
      this.dragIndex = null;
    },

    handleDrop(event, index) {
      this.dragIndex = null;
      const file = event.dataTransfer.files?.[0];
      if (file) {
        this.setFileToSlot(file, index);
      }
    },

    handleFileChange(event, index) {
      const file = event.target.files?.[0];
      if (file) {
        this.setFileToSlot(file, index);
      }

      event.target.value = "";
    },

    setFileToSlot(file, index) {
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar.");
        return;
      }

      const targetSlots =
        this.currentStep === "before" ? this.beforeSlots : this.afterSlots;

      const oldPreview = targetSlots[index].previewUrl;
      if (oldPreview) {
        URL.revokeObjectURL(oldPreview);
      }

      const previewUrl = URL.createObjectURL(file);

      targetSlots[index] = {
        ...targetSlots[index],
        file,
        fileName: file.name,
        previewUrl,
      };
    },

    removeImage(index) {
      const targetSlots =
        this.currentStep === "before" ? this.beforeSlots : this.afterSlots;

      if (targetSlots[index].previewUrl) {
        URL.revokeObjectURL(targetSlots[index].previewUrl);
      }

      targetSlots[index] = {
        ...targetSlots[index],
        file: null,
        fileName: "",
        previewUrl: "",
      };
    },

    resetCurrentStep() {
      const targetSlots =
        this.currentStep === "before" ? this.beforeSlots : this.afterSlots;

      targetSlots.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      if (this.currentStep === "before") {
        this.beforeSlots = createSlots("Before");
      } else {
        this.afterSlots = createSlots("After");
      }
    },

    saveBeforeAfter() {
      const payload = {
        before: this.beforeSlots.map((item, index) => ({
          urutan: index + 1,
          title: item.title,
          file: item.file,
          fileName: item.fileName,
        })),
        after: this.afterSlots.map((item, index) => ({
          urutan: index + 1,
          title: item.title,
          file: item.file,
          fileName: item.fileName,
        })),
      };

      console.log("payload before after:", payload);

      // Contoh:
      // const formData = new FormData();
      // this.beforeSlots.forEach((item, i) => formData.append(`before_${i + 1}`, item.file));
      // this.afterSlots.forEach((item, i) => formData.append(`after_${i + 1}`, item.file));
      // this.$axios.post('/before-after/store', formData);
    },
  },

  beforeUnmount() {
    [...this.beforeSlots, ...this.afterSlots].forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  },
};
</script>

<style scoped>
.before-after-page {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.page-subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.summary-box {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 14px 12px;
  height: 100%;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  word-break: break-word;
}

.form-card-title {
  padding: 18px 20px;
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
}

.step-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.step-card {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  text-align: left;
  transition: all 0.2s ease;
  cursor: pointer;
}

.step-card:hover {
  border-color: #cfd8e6;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}

.step-card.active {
  border-color: #bfdbfe;
  background: #f8fbff;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
}

.step-card-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #e8f1ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

.step-text-wrap {
  min-width: 0;
}

.step-title {
  font-size: 16px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.step-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.step-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #94a3b8;
}

.current-step-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.soap-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.soap-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #e8f1ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

.photo-badge {
  background: #f3e8ff;
  color: #9333ea;
}

.soap-title {
  font-size: 16px;
  font-weight: 700;
  color: #172b4d;
  line-height: 1.2;
}

.soap-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}

.upload-slot-card {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  height: 100%;
}

.upload-slot-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.upload-slot-title {
  font-size: 15px;
  font-weight: 700;
  color: #172b4d;
}

.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  padding: 14px;
  background: #fbfdff;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: #7aa6ff;
  background: #f4f8ff;
}

.drop-zone-inner {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  padding: 0 8px;
}

.file-name {
  color: #2563eb;
  word-break: break-word;
}

.preview-frame {
  position: relative;
  min-height: 240px;
  border: 1px solid #d9e1ea;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(180deg, #fafafa 0%, #f1f4f8 100%);
}

.preview-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}

.preview-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.preview-placeholder {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #94a3b8;
  padding: 16px;
}

.placeholder-avatar {
  width: 112px;
  height: 112px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px dashed #d6dde8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.action-bar {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  background: #fff;
}

.action-bar-left {
  display: flex;
  align-items: center;
}

.action-bar-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.action-hint {
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 960px) {
  .page-title {
    font-size: 22px;
  }

  .step-switch {
    grid-template-columns: 1fr;
  }

  .preview-frame,
  .preview-placeholder,
  .preview-image {
    min-height: 220px;
    height: 220px;
  }

  .action-bar {
    align-items: stretch;
  }

  .action-bar-right {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

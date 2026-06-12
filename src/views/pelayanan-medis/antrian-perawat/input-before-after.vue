<template>
  <v-container fluid class="pa-0">
    <div
      class="d-flex flex-column flex-md-row align-md-start justify-space-between ga-3 mb-4"
    >
      <div>
        <div class="text-h5 font-weight-bold">Input Before & After</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Dokumentasi kondisi pasien sebelum dan setelah tindakan perawat.
        </div>
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

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      closable
      class="mb-4"
      @click:close="errorMessage = ''"
    >
      <div
        class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-3"
      >
        <span>{{ errorMessage }}</span>
        <v-btn
          size="small"
          variant="outlined"
          color="error"
          :loading="loading"
          @click="fetchPage"
        >
          Muat Ulang
        </v-btn>
      </div>
    </v-alert>

    <v-skeleton-loader
      v-if="loading"
      type="heading, paragraph, card, card, actions"
    />

    <template v-else-if="detail">
      <v-card variant="outlined" rounded="lg" class="mb-4">
        <v-card-title
          class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-3 py-4"
        >
          <div>
            <div class="text-subtitle-1 font-weight-bold">Ringkasan Pasien</div>
            <div class="text-caption text-medium-emphasis mt-1">
              Pastikan pasien, kunjungan, dan treatment sudah sesuai.
            </div>
          </div>

          <v-chip
            :color="statusColor"
            variant="tonal"
            size="small"
            prepend-icon="mdi-circle-medium"
          >
            {{ statusLabel }}
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col
              v-for="item in registrationSummary"
              :key="item.label"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-sheet border rounded="lg" class="pa-3 h-100 bg-grey-lighten-5">
                <div class="text-caption text-medium-emphasis">
                  {{ item.label }}
                </div>
                <div class="text-body-2 font-weight-bold mt-1">
                  {{ item.value || "-" }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="text-caption text-medium-emphasis mb-2">Treatment</div>
          <div v-if="treatmentNames.length" class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="treatment in treatmentNames"
              :key="treatment"
              color="primary"
              variant="tonal"
              size="small"
            >
              {{ treatment }}
            </v-chip>
          </div>
          <div v-else class="text-body-2 text-medium-emphasis">
            Treatment belum tercatat.
          </div>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="isWaiting"
        type="warning"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        Antrian perawat masih berstatus menunggu. Foto tetap dapat diunggah atau
        diubah selama task belum selesai atau dibatalkan.
      </v-alert>

      <v-alert
        v-else-if="isReadOnly"
        :type="taskStatus === 9 ? 'error' : 'info'"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        Dokumentasi ditampilkan dalam mode baca karena task perawat sudah
        {{ taskStatus === 9 ? "dibatalkan" : "selesai" }}.
      </v-alert>

      <v-alert
        v-else-if="canEdit"
        type="info"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        Wajib tersedia 3 foto Before dan 3 foto After. Format yang didukung:
        JPG, JPEG, PNG, atau WEBP dengan ukuran maksimal 5 MB per foto.
      </v-alert>

      <v-card variant="outlined" rounded="lg">
        <v-card-title
          class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3 py-4"
        >
          <div>
            <div class="text-subtitle-1 font-weight-bold">
              Dokumentasi Before & After
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ totalUploadedCount }}/6 slot terisi
              <span v-if="changedCount">
                • {{ changedCount }} perubahan belum disimpan
              </span>
            </div>
          </div>

          <v-progress-circular
            :model-value="completionPercentage"
            :color="isAllComplete ? 'success' : 'primary'"
            :size="44"
            :width="5"
          >
            <span class="text-caption font-weight-bold">
              {{ completionPercentage }}%
            </span>
          </v-progress-circular>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-tabs
            v-model="currentStep"
            color="primary"
            grow
            show-arrows
            class="mb-5"
          >
            <v-tab value="before">
              <v-icon start>mdi-camera-outline</v-icon>
              Foto Before
              <v-chip
                size="x-small"
                class="ml-2"
                :color="beforeUploadedCount === 3 ? 'success' : 'grey'"
                variant="tonal"
              >
                {{ beforeUploadedCount }}/3
              </v-chip>
            </v-tab>

            <v-tab value="after">
              <v-icon start>mdi-camera-check-outline</v-icon>
              Foto After
              <v-chip
                size="x-small"
                class="ml-2"
                :color="afterUploadedCount === 3 ? 'success' : 'grey'"
                variant="tonal"
              >
                {{ afterUploadedCount }}/3
              </v-chip>
            </v-tab>
          </v-tabs>

          <div
            class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-3 mb-4"
          >
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ currentStep === "before" ? "Foto Before" : "Foto After" }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{
                  currentStep === "before"
                    ? "Dokumentasikan kondisi pasien sebelum tindakan dilakukan."
                    : "Dokumentasikan hasil pasien setelah tindakan selesai."
                }}
              </div>
            </div>

            <v-chip
              :color="currentUploadedCount === 3 ? 'success' : 'warning'"
              variant="tonal"
              size="small"
            >
              {{ currentUploadedCount }}/3 foto tersedia
            </v-chip>
          </div>

          <v-row>
            <v-col
              v-for="(slot, index) in currentSlots"
              :key="slot.key"
              cols="12"
              md="4"
            >
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-title
                  class="d-flex align-center justify-space-between ga-2 py-3"
                >
                  <span class="text-subtitle-2 font-weight-bold">
                    {{ slot.title }}
                  </span>
                  <v-chip
                    :color="slotStatusColor(slot)"
                    variant="tonal"
                    size="x-small"
                  >
                    {{ slotStatusText(slot) }}
                  </v-chip>
                </v-card-title>

                <v-divider />

                <v-img
                  v-if="slotDisplayUrl(slot)"
                  :src="slotDisplayUrl(slot)"
                  :alt="slot.title"
                  :aspect-ratio="4 / 3"
                  cover
                  class="bg-grey-lighten-4"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular color="primary" indeterminate />
                    </div>
                  </template>
                </v-img>

                <v-sheet
                  v-else
                  :height="260"
                  class="d-flex flex-column align-center justify-center text-center pa-4 bg-grey-lighten-4"
                >
                  <v-icon
                    :color="slot.previewError ? 'error' : 'grey'"
                    size="64"
                  >
                    {{
                      slot.previewError
                        ? "mdi-image-off-outline"
                        : "mdi-image-outline"
                    }}
                  </v-icon>
                  <div
                    class="text-body-2 font-weight-medium mt-3"
                    :class="slot.previewError ? 'text-error' : ''"
                  >
                    {{
                      slot.previewError
                        ? "Preview foto gagal dimuat"
                        : `Belum ada ${slot.title}`
                    }}
                  </div>
                </v-sheet>

                <v-card-text>
                  <v-file-input
                    :model-value="slot.file ? [slot.file] : []"
                    :label="slot.persistedPhoto ? 'Ganti foto' : 'Pilih foto'"
                    accept="image/jpeg,image/png,image/webp"
                    variant="outlined"
                    density="comfortable"
                    prepend-icon="mdi-camera"
                    clearable
                    show-size
                    :disabled="!canEdit || saving"
                    :rules="photoRules"
                    @update:model-value="handleFileChange($event, index)"
                  />

                  <div
                    v-if="slot.file"
                    class="d-flex align-start ga-2 text-caption text-primary"
                  >
                    <v-icon size="16">mdi-content-save-alert-outline</v-icon>
                    <span>
                      {{ slot.file.name }} siap menggantikan foto tersimpan.
                    </span>
                  </div>

                  <div
                    v-else-if="slot.persistedPhoto"
                    class="d-flex flex-column ga-1 text-caption text-medium-emphasis"
                  >
                    <div class="d-flex align-start ga-2">
                      <v-icon size="16" color="success">
                        mdi-check-circle-outline
                      </v-icon>
                      <span>{{
                        slot.persistedPhoto.file_name || slot.title
                      }}</span>
                    </div>
                    <div v-if="slot.persistedPhoto.tanggal_upload" class="ml-6">
                      Diunggah
                      {{ formatDateTime(slot.persistedPhoto.tanggal_upload) }}
                    </div>
                  </div>

                  <div
                    v-else
                    class="d-flex align-start ga-2 text-caption text-medium-emphasis"
                  >
                    <v-icon size="16">mdi-information-outline</v-icon>
                    <span>Slot ini wajib diisi sebelum data disimpan.</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions
          class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3 pa-4"
        >
          <div class="text-caption text-medium-emphasis">
            <span v-if="changedCount">
              Terdapat {{ changedCount }} foto baru yang belum disimpan.
            </span>
            <span v-else-if="isAllComplete">
              Seluruh foto sudah tersimpan lengkap.
            </span>
            <span v-else>
              Lengkapi seluruh 6 slot foto untuk menyimpan dokumentasi.
            </span>
          </div>

          <div class="d-flex flex-wrap justify-end ga-2">
            <v-btn
              variant="text"
              color="secondary"
              :disabled="!canEdit || saving || currentChangedCount === 0"
              @click="resetCurrentStep"
            >
              Batalkan Perubahan Tahap Ini
            </v-btn>

            <v-btn
              v-if="currentStep === 'before'"
              color="primary"
              variant="tonal"
              append-icon="mdi-arrow-right"
              :disabled="beforeUploadedCount !== 3"
              @click="currentStep = 'after'"
            >
              Lanjut ke After
            </v-btn>

            <v-btn
              v-else
              color="primary"
              variant="tonal"
              prepend-icon="mdi-arrow-left"
              @click="currentStep = 'before'"
            >
              Kembali ke Before
            </v-btn>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              :loading="saving"
              :disabled="!canSave"
              @click="saveBeforeAfter"
            >
              Simpan Foto
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </template>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="3500"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import antrianPerawatService from "@/services/pelayanan-medis/antrianPerawatService";

const createSlots = (type) =>
  [1, 2, 3].map((order) => ({
    key: `${type}-${order}`,
    type,
    order,
    title: `${type === "before" ? "Before" : "After"} ${order}`,
    persistedPhoto: null,
    persistedPreviewUrl: "",
    file: null,
    selectedPreviewUrl: "",
    previewError: false,
  }));

export default {
  name: "InputBeforeAfter",

  data() {
    return {
      loading: false,
      saving: false,
      errorMessage: "",
      detail: null,
      beforeAfterMeta: null,
      currentStep: "before",
      beforeSlots: createSlots("before"),
      afterSlots: createSlots("after"),
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },

  computed: {
    registrationId() {
      return Number(this.$route.params.id || 0);
    },

    tasks() {
      const tasks = this.detail?.tasks || this.detail?.registrasi_tasks || [];
      return Array.isArray(tasks) ? tasks : [];
    },

    nurseTask() {
      return (
        this.tasks
          .filter(
            (task) =>
              Number(task?.task_type) === 3 &&
              Number(task?.is_delete || 0) === 0,
          )
          .sort(
            (a, b) => Number(a?.task_order || 0) - Number(b?.task_order || 0),
          )[0] || null
      );
    },

    taskStatus() {
      return Number(
        this.beforeAfterMeta?.task_status ??
          this.detail?.status_task ??
          this.nurseTask?.status ??
          -1,
      );
    },

    isWaiting() {
      return this.taskStatus === 0;
    },

    canEdit() {
      return (
        Boolean(this.beforeAfterMeta?.editable) &&
        this.taskStatus >= 0 &&
        ![2, 9].includes(this.taskStatus)
      );
    },

    isReadOnly() {
      return this.taskStatus === 2 || this.taskStatus === 9;
    },

    statusLabel() {
      const labels = {
        0: "Menunggu",
        1: "Sedang Diproses",
        2: "Selesai",
        9: "Batal",
      };

      return labels[this.taskStatus] || "Status Tidak Dikenal";
    },

    statusColor() {
      const colors = {
        0: "warning",
        1: "primary",
        2: "success",
        9: "error",
      };

      return colors[this.taskStatus] || "grey";
    },

    currentSlots() {
      return this.currentStep === "before" ? this.beforeSlots : this.afterSlots;
    },

    beforeUploadedCount() {
      return this.beforeSlots.filter((slot) => this.slotHasPhoto(slot)).length;
    },

    afterUploadedCount() {
      return this.afterSlots.filter((slot) => this.slotHasPhoto(slot)).length;
    },

    currentUploadedCount() {
      return this.currentSlots.filter((slot) => this.slotHasPhoto(slot)).length;
    },

    totalUploadedCount() {
      return this.beforeUploadedCount + this.afterUploadedCount;
    },

    changedCount() {
      return [...this.beforeSlots, ...this.afterSlots].filter(
        (slot) => !!slot.file,
      ).length;
    },

    currentChangedCount() {
      return this.currentSlots.filter((slot) => !!slot.file).length;
    },

    isAllComplete() {
      return this.totalUploadedCount === 6;
    },

    completionPercentage() {
      return Math.round((this.totalUploadedCount / 6) * 100);
    },

    canSave() {
      return (
        this.canEdit &&
        !this.saving &&
        this.isAllComplete &&
        this.changedCount > 0
      );
    },

    photoRules() {
      return [this.validateFile];
    },

    patientName() {
      return this.firstValue(
        this.detail?.nama_pasien,
        this.detail?.pasien?.nama,
      );
    },

    medicalRecordNumber() {
      return this.firstValue(this.detail?.no_rm, this.detail?.pasien?.no_rm);
    },

    phoneNumber() {
      return this.firstValue(
        this.detail?.no_hp,
        this.detail?.pasien?.no_hp,
        this.detail?.pasien?.no_wa,
      );
    },

    doctorName() {
      return this.firstValue(
        this.detail?.nama_dokter,
        this.detail?.dokter_awal?.nama,
        this.detail?.dokterAwal?.nama,
      );
    },

    assignedNurseName() {
      return this.firstValue(
        this.nurseTask?.assigned_karyawan?.nama,
        this.nurseTask?.assignedKaryawan?.nama,
        this.detail?.nama_perawat,
        this.detail?.perawat_awal?.nama,
        this.detail?.perawatAwal?.nama,
      );
    },

    clinicName() {
      return this.firstValue(
        this.detail?.toko?.nama_toko,
        this.detail?.toko?.nama,
        this.detail?.nama_toko,
        this.detail?.klinik,
      );
    },

    consultationChannel() {
      return this.firstValue(
        this.detail?.jenis_konsultasi_label,
        this.detail?.channel_konsultasi_label,
        this.detail?.channel,
      );
    },

    treatmentNames() {
      const details =
        this.detail?.treatment_details || this.detail?.treatmentDetails || [];

      if (Array.isArray(details) && details.length) {
        const names = details
          .filter((item) => Number(item?.is_delete || 0) === 0)
          .map((item) =>
            this.firstValue(
              item?.nama_treatment,
              item?.treatment?.nama,
              item?.treatment?.nama_treatment,
              item?.treatment_toko?.nama_treatment,
              item?.treatmentToko?.nama_treatment,
            ),
          )
          .filter(Boolean);

        return [...new Set(names)];
      }

      const fallback = this.detail?.nama_tindakan;
      return fallback && fallback !== "-" ? [String(fallback)] : [];
    },

    registrationSummary() {
      const visitDate = this.formatDate(
        this.detail?.tanggal_kunjungan || this.detail?.tanggal,
      );
      const visitTime = this.firstValue(
        this.detail?.waktu_kunjungan,
        this.formatTime(this.detail?.registered_at),
      );

      return [
        {
          label: "No. Registrasi",
          value: this.firstValue(
            this.detail?.kode_registrasi,
            this.detail?.nomor_antrian,
          ),
        },
        { label: "Nama Pasien", value: this.patientName },
        { label: "No. RM", value: this.medicalRecordNumber },
        { label: "No. Telepon", value: this.phoneNumber },
        {
          label: "Tanggal Kunjungan",
          value: [visitDate, visitTime].filter(Boolean).join(" • "),
        },
        { label: "Klinik", value: this.clinicName },
        { label: "Dokter", value: this.doctorName },
        { label: "Perawat", value: this.assignedNurseName },
        { label: "Channel", value: this.consultationChannel },
      ];
    },
  },

  watch: {
    registrationId() {
      this.fetchPage();
    },
  },

  mounted() {
    this.fetchPage();
  },

  beforeUnmount() {
    this.cleanupAllObjectUrls();
  },

  methods: {
    async fetchPage() {
      if (!this.registrationId) {
        this.errorMessage = "ID registrasi tidak ditemukan pada URL.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const [detailResponse, beforeAfterResponse] = await Promise.all([
          antrianPerawatService.getById(this.registrationId),
          antrianPerawatService.getBeforeAfter(this.registrationId),
        ]);

        this.detail = detailResponse?.data || detailResponse;
        await this.applyBeforeAfterData(
          beforeAfterResponse?.data || beforeAfterResponse,
        );
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Detail registrasi atau dokumentasi before-after gagal dimuat.",
        );
      } finally {
        this.loading = false;
      }
    },

    async applyBeforeAfterData(data) {
      this.cleanupAllObjectUrls();
      this.beforeSlots = createSlots("before");
      this.afterSlots = createSlots("after");
      this.beforeAfterMeta = data || null;

      const previewJobs = [];

      [
        { type: "before", photos: data?.before },
        { type: "after", photos: data?.after },
      ].forEach(({ type, photos }) => {
        const targetSlots =
          type === "before" ? this.beforeSlots : this.afterSlots;

        (Array.isArray(photos) ? photos : []).forEach((photo) => {
          const index = Number(photo?.urutan || 0) - 1;
          if (index < 0 || index >= targetSlots.length) return;

          targetSlots[index].persistedPhoto = photo;
          targetSlots[index].previewError = false;
          previewJobs.push(
            this.loadPersistedPreview(targetSlots[index], photo),
          );
        });
      });

      await Promise.allSettled(previewJobs);
    },

    async loadPersistedPreview(slot, photo) {
      if (!photo?.id) return;

      try {
        const blob = await antrianPerawatService.getBeforeAfterPhoto(
          this.registrationId,
          photo.id,
        );

        if (!(blob instanceof Blob)) {
          throw new Error("Respons foto bukan file gambar.");
        }

        slot.persistedPreviewUrl = URL.createObjectURL(blob);
        slot.previewError = false;
      } catch (error) {
        slot.persistedPreviewUrl = "";
        slot.previewError = true;
      }
    },

    handleFileChange(value, index) {
      const file = this.normalizeFile(value);
      const targetSlots =
        this.currentStep === "before" ? this.beforeSlots : this.afterSlots;
      const slot = targetSlots[index];

      if (!slot) return;

      if (!file) {
        this.clearSelectedFile(slot);
        return;
      }

      const validation = this.validateFile(file);
      if (validation !== true) {
        this.showSnackbar(validation, "error");
        this.clearSelectedFile(slot);
        return;
      }

      if (slot.selectedPreviewUrl) {
        URL.revokeObjectURL(slot.selectedPreviewUrl);
      }

      slot.file = file;
      slot.selectedPreviewUrl = URL.createObjectURL(file);
      slot.previewError = false;
    },

    normalizeFile(value) {
      if (Array.isArray(value)) return value[0] || null;
      return value instanceof File ? value : null;
    },

    validateFile(value) {
      const file = this.normalizeFile(value) || value;
      if (!file) return true;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return "File harus berformat JPG, JPEG, PNG, atau WEBP.";
      }

      if (Number(file.size || 0) > 5 * 1024 * 1024) {
        return "Ukuran file maksimal 5 MB.";
      }

      return true;
    },

    clearSelectedFile(slot) {
      if (slot.selectedPreviewUrl) {
        URL.revokeObjectURL(slot.selectedPreviewUrl);
      }

      slot.file = null;
      slot.selectedPreviewUrl = "";
      slot.previewError = Boolean(
        slot.persistedPhoto && !slot.persistedPreviewUrl,
      );
    },

    resetCurrentStep() {
      this.currentSlots.forEach((slot) => this.clearSelectedFile(slot));
    },

    slotHasPhoto(slot) {
      return Boolean(slot?.file || slot?.persistedPhoto);
    },

    slotDisplayUrl(slot) {
      return slot?.selectedPreviewUrl || slot?.persistedPreviewUrl || "";
    },

    slotStatusText(slot) {
      if (slot?.file) return "Belum Disimpan";
      if (slot?.persistedPhoto) return "Tersimpan";
      return "Wajib Diisi";
    },

    slotStatusColor(slot) {
      if (slot?.file) return "warning";
      if (slot?.persistedPhoto) return "success";
      return "error";
    },

    async saveBeforeAfter() {
      if (!this.canEdit || this.saving) return;

      if (!this.isAllComplete) {
        this.showSnackbar(
          "Lengkapi 3 foto Before dan 3 foto After sebelum menyimpan.",
          "error",
        );
        return;
      }

      if (!this.changedCount) {
        this.showSnackbar(
          "Tidak ada perubahan foto untuk disimpan.",
          "warning",
        );
        return;
      }

      const formData = new FormData();

      [...this.beforeSlots, ...this.afterSlots].forEach((slot) => {
        if (slot.file instanceof File) {
          formData.append(`${slot.type}_${slot.order}`, slot.file);
        }
      });

      this.saving = true;
      this.errorMessage = "";

      try {
        const response = await antrianPerawatService.saveBeforeAfter(
          this.registrationId,
          formData,
        );

        this.showSnackbar(
          response?.message || "Foto before dan after berhasil disimpan.",
          "success",
        );

        await this.$router.push({
          path: "/pelayanan-medis/antrian-perawat",
        });
      } catch (error) {
        const message = this.getErrorMessage(
          error,
          "Foto before dan after gagal disimpan.",
        );

        this.errorMessage = message;
        this.showSnackbar(message, "error");
      } finally {
        this.saving = false;
      }
    },

    cleanupAllObjectUrls() {
      [...this.beforeSlots, ...this.afterSlots].forEach((slot) => {
        if (slot.persistedPreviewUrl) {
          URL.revokeObjectURL(slot.persistedPreviewUrl);
        }

        if (slot.selectedPreviewUrl) {
          URL.revokeObjectURL(slot.selectedPreviewUrl);
        }
      });
    },

    firstValue(...values) {
      const value = values.find(
        (item) =>
          item !== null && item !== undefined && String(item).trim().length > 0,
      );

      return value === undefined ? "" : String(value);
    },

    formatDate(value) {
      if (!value) return "";

      const raw = String(value).slice(0, 10);
      const date = new Date(`${raw}T00:00:00`);
      if (Number.isNaN(date.getTime())) return raw;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    },

    formatTime(value) {
      if (!value) return "";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        const match = String(value).match(/(\d{2}):(\d{2})/);
        return match ? `${match[1]}:${match[2]}` : "";
      }

      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    },

    formatDateTime(value) {
      if (!value) return "-";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    },

    getErrorMessage(error, fallback = "Terjadi kesalahan.") {
      const errors = error?.response?.data?.errors;

      if (errors && typeof errors === "object") {
        const firstError = Object.values(errors).flat().find(Boolean);
        if (firstError) return String(firstError);
      }

      return error?.response?.data?.message || error?.message || fallback;
    },

    showSnackbar(message, color = "success") {
      this.snackbar = {
        show: true,
        message,
        color,
      };
    },

    goBack() {
      this.$router.back();
    },
  },
};
</script>

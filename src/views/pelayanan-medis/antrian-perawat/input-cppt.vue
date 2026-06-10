<template>
  <v-container fluid class="pa-0">
    <div class="d-flex flex-wrap align-start justify-space-between ga-3 mb-4">
      <div>
        <div class="text-h5 font-weight-bold">Input CPPT</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Catatan Perkembangan Pasien Terintegrasi untuk tindakan perawat.
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
      closable
      class="mb-4"
      @click:close="errorMessage = ''"
    >
      <div class="d-flex flex-wrap align-center justify-space-between ga-3">
        <span>{{ errorMessage }}</span>
        <v-btn
          v-if="!detail"
          size="small"
          variant="outlined"
          color="error"
          @click="fetchDetail"
        >
          Muat Ulang
        </v-btn>
      </div>
    </v-alert>

    <template v-if="loading">
      <v-card variant="outlined" rounded="lg" class="mb-4">
        <v-card-text>
          <v-skeleton-loader type="heading, paragraph, paragraph" />
        </v-card-text>
      </v-card>

      <v-card variant="outlined" rounded="lg">
        <v-card-text>
          <v-skeleton-loader type="heading, paragraph, paragraph, paragraph" />
        </v-card-text>
      </v-card>
    </template>

    <template v-else-if="detail">
      <v-card variant="outlined" rounded="lg" class="mb-4">
        <v-card-title
          class="d-flex flex-wrap align-center justify-space-between ga-3 pa-4"
        >
          <div>
            <div class="text-subtitle-1 font-weight-bold">
              Detail Registrasi
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              Pastikan identitas pasien dan layanan sudah sesuai sebelum mengisi
              CPPT.
            </div>
          </div>

          <v-chip
            :color="statusColor"
            size="small"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ statusLabel }}
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-row dense>
            <v-col
              v-for="item in registrationSummary"
              :key="item.label"
              cols="12"
              sm="6"
              md="3"
            >
              <v-sheet border rounded="lg" class="pa-3 h-100">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ item.label }}
                </div>
                <div class="text-body-2 font-weight-medium text-break">
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
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ treatment }}
            </v-chip>
          </div>
          <div v-else class="text-body-2 text-medium-emphasis">-</div>

          <template v-if="registrationNote">
            <v-divider class="my-4" />
            <div class="text-caption text-medium-emphasis mb-1">
              Catatan Registrasi
            </div>
            <div class="text-body-2 text-pre-wrap">
              {{ registrationNote }}
            </div>
          </template>
        </v-card-text>
      </v-card>

      <v-alert v-if="isReadOnly" type="info" variant="tonal" class="mb-4">
        Task perawat sudah selesai atau dibatalkan. Data CPPT hanya dapat
        dilihat.
      </v-alert>

      <v-alert
        v-else-if="isWaiting"
        type="warning"
        variant="tonal"
        class="mb-4"
      >
        Antrian masih menunggu. Mulai antrian perawat terlebih dahulu sebelum
        menyimpan CPPT.
      </v-alert>

      <v-form ref="form" v-model="formValid" @submit.prevent="saveCppt">
        <v-card variant="outlined" rounded="lg">
          <v-card-title
            class="d-flex flex-wrap align-center justify-space-between ga-3 pa-4"
          >
            <div>
              <div class="text-subtitle-1 font-weight-bold">Form CPPT</div>
              <div class="text-caption text-medium-emphasis mt-1">
                Lengkapi petugas pelaksana serta seluruh komponen SOAP dan
                tindakan.
              </div>
            </div>

            <v-chip
              :color="completedCount === 5 ? 'success' : 'default'"
              size="small"
              variant="tonal"
            >
              {{ completedCount }}/5 bagian terisi
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-1">
              Informasi Pengisian
            </div>
            <div class="text-caption text-medium-emphasis mb-4">
              Perawat penanggung jawab hanya menampilkan karyawan aktif dengan
              jabatan Nurse atau Beautician pada cabang registrasi.
            </div>

            <v-row>
              <v-col cols="12" sm="6" lg="3">
                <v-text-field
                  v-model="form.tanggal_pengisian"
                  label="Tanggal & Jam"
                  type="datetime-local"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar-clock"
                  :rules="requiredRules"
                  :readonly="!canEdit"
                  :disabled="saving"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-text-field
                  :model-value="patientName"
                  label="Nama Pasien"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-outline"
                  readonly
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-text-field
                  :model-value="doctorName"
                  label="Dokter Penanggung Jawab"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-stethoscope"
                  readonly
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-autocomplete
                  v-model="form.perawat_id"
                  :items="nurseOptions"
                  item-title="label"
                  item-value="id"
                  label="Perawat Penanggung Jawab"
                  placeholder="Pilih Nurse / Beautician"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-heart-outline"
                  :loading="referenceLoading"
                  :rules="requiredRules"
                  :readonly="!canEdit"
                  :disabled="saving || referenceLoading"
                  no-data-text="Nurse atau Beautician tidak ditemukan"
                  clearable
                  hide-details="auto"
                />
              </v-col>
            </v-row>

            <v-divider class="my-5" />

            <v-row>
              <v-col cols="12" lg="6">
                <v-card variant="outlined" rounded="lg" class="h-100">
                  <v-card-title class="d-flex align-center ga-3 pa-4">
                    <v-avatar color="primary" variant="tonal" size="36">
                      <span class="font-weight-bold">S</span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        Subjective
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Keluhan atau kondisi yang disampaikan pasien.
                      </div>
                    </div>
                  </v-card-title>

                  <v-divider />

                  <v-card-text class="pa-4">
                    <v-autocomplete
                      v-model="form.subjective_ids"
                      :items="subjectiveOptions"
                      item-title="label"
                      item-value="id"
                      label="Subyektif (S)"
                      placeholder="Pilih satu atau lebih subjective"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-message-text-outline"
                      :loading="referenceLoading"
                      :rules="multipleSelectionRules"
                      :readonly="!canEdit"
                      :disabled="saving || referenceLoading"
                      no-data-text="Data subjective tidak ditemukan"
                      multiple
                      chips
                      closable-chips
                      clearable
                      hide-details="auto"
                      class="mb-4"
                    />

                    <v-alert
                      v-if="selectedSubjectiveDescription"
                      type="info"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                    >
                      {{ selectedSubjectiveDescription }}
                    </v-alert>

                    <v-textarea
                      v-model="form.subjective_lainnya"
                      label="Keterangan Subjective"
                      placeholder="Tuliskan keluhan tambahan, perubahan kondisi, atau informasi lain dari pasien."
                      variant="outlined"
                      rows="5"
                      auto-grow
                      counter
                      :readonly="!canEdit"
                      :disabled="saving"
                      hide-details="auto"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6">
                <v-card variant="outlined" rounded="lg" class="h-100">
                  <v-card-title class="d-flex align-center ga-3 pa-4">
                    <v-avatar color="info" variant="tonal" size="36">
                      <span class="font-weight-bold">O</span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        Objective
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Temuan hasil pemeriksaan dan observasi klinis.
                      </div>
                    </div>
                  </v-card-title>

                  <v-divider />

                  <v-card-text class="pa-4">
                    <v-textarea
                      v-model="form.objective"
                      label="Obyektif (O)"
                      placeholder="Tuliskan hasil pemeriksaan, tanda klinis, dan kondisi yang dapat diamati."
                      variant="outlined"
                      rows="8"
                      auto-grow
                      counter
                      :rules="requiredRules"
                      :readonly="!canEdit"
                      :disabled="saving"
                      hide-details="auto"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6">
                <v-card variant="outlined" rounded="lg" class="h-100">
                  <v-card-title class="d-flex align-center ga-3 pa-4">
                    <v-avatar color="warning" variant="tonal" size="36">
                      <span class="font-weight-bold">A</span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        Assessment
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Diagnosa atau penilaian klinis pasien.
                      </div>
                    </div>
                  </v-card-title>

                  <v-divider />

                  <v-card-text class="pa-4">
                    <v-autocomplete
                      v-model="form.assessment_ids"
                      :items="assessmentOptions"
                      item-title="label"
                      item-value="id"
                      label="Assessment (A) / Diagnosa"
                      placeholder="Pilih satu atau lebih assessment"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-clipboard-pulse-outline"
                      :loading="referenceLoading"
                      :rules="multipleSelectionRules"
                      :readonly="!canEdit"
                      :disabled="saving || referenceLoading"
                      no-data-text="Data assessment tidak ditemukan"
                      multiple
                      chips
                      closable-chips
                      clearable
                      hide-details="auto"
                      class="mb-4"
                    />

                    <v-alert
                      v-if="selectedAssessmentDescription"
                      type="info"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                    >
                      {{ selectedAssessmentDescription }}
                    </v-alert>

                    <v-textarea
                      v-model="form.assessment_lainnya"
                      label="Keterangan Assessment"
                      placeholder="Tuliskan penilaian tambahan atau pertimbangan klinis."
                      variant="outlined"
                      rows="5"
                      auto-grow
                      counter
                      :readonly="!canEdit"
                      :disabled="saving"
                      hide-details="auto"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6">
                <v-card variant="outlined" rounded="lg" class="h-100">
                  <v-card-title class="d-flex align-center ga-3 pa-4">
                    <v-avatar color="success" variant="tonal" size="36">
                      <span class="font-weight-bold">P</span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">Plan</div>
                      <div class="text-caption text-medium-emphasis">
                        Rencana terapi, edukasi, kontrol, dan tindak lanjut.
                      </div>
                    </div>
                  </v-card-title>

                  <v-divider />

                  <v-card-text class="pa-4">
                    <v-textarea
                      v-model="form.plan"
                      label="Plan (P)"
                      placeholder="Tuliskan rencana terapi, edukasi pasien, kontrol, atau tindak lanjut."
                      variant="outlined"
                      rows="8"
                      auto-grow
                      counter
                      :rules="requiredRules"
                      :readonly="!canEdit"
                      :disabled="saving"
                      hide-details="auto"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-card variant="outlined" rounded="lg">
                  <v-card-title class="d-flex align-center ga-3 pa-4">
                    <v-avatar color="secondary" variant="tonal" size="36">
                      <span class="font-weight-bold">T</span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        Tindakan dan Evaluasi
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Tindakan yang dilakukan, respons pasien, dan hasil
                        evaluasi.
                      </div>
                    </div>
                  </v-card-title>

                  <v-divider />

                  <v-card-text class="pa-4">
                    <v-textarea
                      v-model="form.tindakan"
                      label="Tindakan dan Evaluasi"
                      placeholder="Tuliskan tindakan yang dilakukan, toleransi pasien, edukasi pascatindakan, dan hasil evaluasi."
                      variant="outlined"
                      rows="5"
                      auto-grow
                      counter
                      :rules="requiredRules"
                      :readonly="!canEdit"
                      :disabled="saving"
                      hide-details="auto"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />

          <v-card-actions
            class="d-flex flex-wrap justify-space-between ga-3 pa-4"
          >
            <div class="text-caption text-medium-emphasis">
              <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
              Subjective, Objective, Assessment, Plan, dan Tindakan wajib
              dilengkapi.
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-btn
                variant="text"
                color="secondary"
                :disabled="!canEdit || saving"
                @click="resetForm"
              >
                Reset
              </v-btn>

              <v-btn
                type="submit"
                color="primary"
                prepend-icon="mdi-content-save-outline"
                :loading="saving"
                :disabled="!canEdit || referenceLoading"
              >
                {{ cpptId ? "Perbarui CPPT" : "Simpan CPPT" }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-form>
    </template>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import antrianPerawatService from "@/services/pelayanan-medis/antrianPerawatService";
import karyawanService from "@/services/master/karyawanService";
import referenceService from "@/services/referenceService";

export default {
  name: "InputCppt",

  data() {
    return {
      loading: false,
      referenceLoading: false,
      saving: false,
      formValid: false,
      detail: null,
      cpptId: null,
      errorMessage: "",
      subjectiveOptions: [],
      assessmentOptions: [],
      nurseOptions: [],
      form: this.emptyForm(),
      requiredRules: [
        (value) =>
          (value !== null &&
            value !== undefined &&
            String(value).trim().length > 0) ||
          "Wajib diisi.",
      ],
      multipleSelectionRules: [
        (value) =>
          (Array.isArray(value) && value.length > 0) ||
          "Pilih minimal satu data.",
      ],
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
      return Number(this.detail?.status_task ?? this.nurseTask?.status ?? -1);
    },

    isWaiting() {
      return this.taskStatus === 0;
    },

    canEdit() {
      return this.taskStatus === 1;
    },

    isReadOnly() {
      return this.taskStatus === 2 || this.taskStatus === 9;
    },

    statusLabel() {
      const status = String(
        this.detail?.status_antrian_perawat || "",
      ).toLowerCase();

      if (status === "selesai") return "Selesai";
      if (status === "proses" || status === "diproses") {
        return "Sedang Diproses";
      }
      if (status === "batal") return "Batal";
      return "Menunggu";
    },

    statusColor() {
      const status = String(
        this.detail?.status_antrian_perawat || "",
      ).toLowerCase();

      if (status === "selesai") return "success";
      if (status === "proses" || status === "diproses") return "primary";
      if (status === "batal") return "error";
      return "warning";
    },

    tokoId() {
      const value =
        this.detail?.toko_id ||
        this.detail?.toko?.id ||
        this.detail?.registrasi?.toko_id;

      return Number(value || 0) || null;
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

    registrationNote() {
      return this.firstValue(
        this.detail?.catatan_registrasi,
        this.detail?.catatan,
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
      if (!fallback || fallback === "-") return [];

      return [String(fallback)];
    },

    registrationSummary() {
      const visitDate = this.formatDate(this.detail?.tanggal_kunjungan);
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
        { label: "Perawat Awal", value: this.assignedNurseName },
        { label: "Channel", value: this.consultationChannel },
      ];
    },

    selectedSubjectiveDescription() {
      return this.getSelectedOptions(
        this.subjectiveOptions,
        this.form.subjective_ids,
      )
        .map((item) => item?.deskripsi)
        .filter(Boolean)
        .join(" • ");
    },

    selectedAssessmentDescription() {
      return this.getSelectedOptions(
        this.assessmentOptions,
        this.form.assessment_ids,
      )
        .map((item) => item?.deskripsi)
        .filter(Boolean)
        .join(" • ");
    },

    completedCount() {
      const subjectiveFilled =
        (Array.isArray(this.form.subjective_ids) &&
          this.form.subjective_ids.length > 0) ||
        String(this.form.subjective_lainnya || "").trim().length > 0;
      const objectiveFilled =
        String(this.form.objective || "").trim().length > 0;
      const assessmentFilled =
        (Array.isArray(this.form.assessment_ids) &&
          this.form.assessment_ids.length > 0) ||
        String(this.form.assessment_lainnya || "").trim().length > 0;
      const planFilled = String(this.form.plan || "").trim().length > 0;
      const tindakanFilled = String(this.form.tindakan || "").trim().length > 0;

      return [
        subjectiveFilled,
        objectiveFilled,
        assessmentFilled,
        planFilled,
        tindakanFilled,
      ].filter(Boolean).length;
    },
  },

  watch: {
    registrationId() {
      this.fetchDetail();
    },
  },

  mounted() {
    this.fetchDetail();
  },

  methods: {
    emptyForm() {
      return {
        tanggal_pengisian: this.currentDateTimeLocal(),
        perawat_id: null,
        subjective_ids: [],
        subjective_lainnya: "",
        objective: "",
        assessment_ids: [],
        assessment_lainnya: "",
        plan: "",
        tindakan: "",
      };
    },

    async fetchDetail({ reloadReferences = true } = {}) {
      if (!this.registrationId) {
        this.errorMessage = "ID registrasi tidak ditemukan pada URL.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await antrianPerawatService.getById(
          this.registrationId,
        );
        this.detail = response?.data || response;

        if (reloadReferences || !this.subjectiveOptions.length) {
          await this.loadReferenceData();
        }

        this.applyExistingCppt();
      } catch (error) {
        if (!this.detail) {
          this.detail = null;
        }

        this.errorMessage = this.getErrorMessage(
          error,
          "Detail registrasi atau data referensi gagal dimuat.",
        );
      } finally {
        this.loading = false;
      }
    },

    async loadReferenceData() {
      this.referenceLoading = true;

      try {
        const [subjectiveData, assessmentData, jabatanData] = await Promise.all(
          [
            referenceService.subjective(),
            referenceService.assessment(),
            referenceService.jabatan(),
          ],
        );

        this.subjectiveOptions =
          this.normalizeSubjectiveOptions(subjectiveData);
        this.assessmentOptions =
          this.normalizeAssessmentOptions(assessmentData);

        const jabatanIds = (Array.isArray(jabatanData) ? jabatanData : [])
          .filter((item) => this.isNurseOrBeauticianRole(item))
          .map((item) => Number(item?.id || 0))
          .filter(Boolean);

        if (!jabatanIds.length) {
          throw new Error(
            "Jabatan Nurse atau Beautician tidak ditemukan pada master jabatan.",
          );
        }

        const responses = await Promise.all(
          jabatanIds.map((jabatanId) =>
            karyawanService.getAll({
              jabatan_id: jabatanId,
              ...(this.tokoId ? { toko_id: this.tokoId } : {}),
              per_page: 100,
            }),
          ),
        );

        const employees = responses.flatMap((response) =>
          Array.isArray(response?.data) ? response.data : [],
        );

        this.nurseOptions = this.normalizeNurseOptions(employees);
        this.includeAssignedNurseOption();
      } finally {
        this.referenceLoading = false;
      }
    },

    normalizeSubjectiveOptions(items) {
      return (Array.isArray(items) ? items : [])
        .map((item) => {
          const id = Number(item?.id ?? item?.value ?? 0);
          const nama = this.firstValue(
            item?.nama,
            item?.nama_subjective,
            item?.label,
          );
          const kode = this.firstValue(item?.kode, item?.kode_subjective);

          return {
            ...item,
            id,
            label: nama || kode,
            deskripsi: this.firstValue(item?.deskripsi),
          };
        })
        .filter((item) => item.id && item.label);
    },

    normalizeAssessmentOptions(items) {
      return (Array.isArray(items) ? items : [])
        .map((item) => {
          const id = Number(item?.id ?? item?.value ?? 0);
          const kode = this.firstValue(item?.kode, item?.kode_assessment);
          const nama = this.firstValue(
            item?.nama,
            item?.nama_assessment,
            item?.label,
          );
          const label = [kode, nama]
            .filter(Boolean)
            .filter((value, index, array) => array.indexOf(value) === index)
            .join(" - ");

          return {
            ...item,
            id,
            label,
            deskripsi: this.firstValue(item?.deskripsi),
          };
        })
        .filter((item) => item.id && item.label);
    },

    normalizeNurseOptions(items) {
      const options = (Array.isArray(items) ? items : [])
        .map((item) => {
          const id = Number(item?.id || 0);
          const jabatan = this.firstValue(
            item?.jabatan?.nama_jabatan,
            item?.jabatan?.nama,
          );
          const kode = this.firstValue(item?.kode);
          const nama = this.firstValue(item?.nama);
          const meta = [jabatan, kode].filter(Boolean).join(" • ");

          return {
            ...item,
            id,
            label: meta ? `${nama} — ${meta}` : nama,
          };
        })
        .filter((item) => item.id && item.label);

      return Array.from(
        new Map(options.map((item) => [item.id, item])).values(),
      ).sort((a, b) => String(a.label).localeCompare(String(b.label), "id"));
    },

    isNurseOrBeauticianRole(item) {
      const code = String(item?.kode_jabatan || item?.kode || "").toUpperCase();
      const name = String(item?.nama_jabatan || item?.nama || "").toLowerCase();

      return (
        ["NS", "BC"].includes(code) || name === "nurse" || name === "beautician"
      );
    },

    includeAssignedNurseOption() {
      const employee =
        this.nurseTask?.assigned_karyawan ||
        this.nurseTask?.assignedKaryawan ||
        this.detail?.perawat_awal ||
        this.detail?.perawatAwal;
      const id = Number(
        employee?.id ||
          this.nurseTask?.assigned_karyawan_id ||
          this.detail?.perawat_awal_id ||
          0,
      );

      if (!id || this.nurseOptions.some((item) => item.id === id)) return;

      const nama = this.firstValue(employee?.nama, this.assignedNurseName);
      if (!nama) return;

      const jabatan = this.firstValue(
        employee?.jabatan?.nama_jabatan,
        employee?.jabatan?.nama,
      );

      this.nurseOptions.push({
        ...employee,
        id,
        label: jabatan ? `${nama} — ${jabatan}` : nama,
      });
    },

    applyExistingCppt() {
      const activeCppt = this.getActiveCppt();

      if (!activeCppt) {
        this.cpptId = null;
        this.form = {
          ...this.emptyForm(),
          perawat_id: this.defaultNurseId(),
        };
        return;
      }

      this.cpptId = activeCppt.id;

      const subjectiveIds = this.extractReferenceIds(
        activeCppt.subjectives || activeCppt.subjective_references,
        activeCppt.subjective_ids,
        activeCppt.subjective_category_id,
      );
      const assessmentIds = this.extractReferenceIds(
        activeCppt.assessments || activeCppt.assessment_references,
        activeCppt.assessment_ids,
        activeCppt.assessment_id,
      );

      this.form = {
        tanggal_pengisian: this.toDateTimeLocal(
          activeCppt.tanggal_pengisian || activeCppt.created_at,
        ),
        perawat_id: Number(activeCppt.perawat_id || 0) || this.defaultNurseId(),
        subjective_ids: subjectiveIds,
        subjective_lainnya:
          activeCppt.subjective_lainnya ||
          (!subjectiveIds.length ? activeCppt.subjective || "" : ""),
        objective: activeCppt.objective || "",
        assessment_ids: assessmentIds,
        assessment_lainnya:
          activeCppt.assessment_lainnya ||
          (!assessmentIds.length ? activeCppt.assessment || "" : ""),
        plan: activeCppt.plan || "",
        tindakan: activeCppt.tindakan || "",
      };
    },

    getActiveCppt() {
      const collections = [
        this.detail?.perawat_cppts,
        this.detail?.perawatCppts,
        this.detail?.cppt_detail,
      ];

      const cppts = collections.find((item) => Array.isArray(item)) || [];

      return (
        cppts
          .filter((item) => Number(item?.is_delete || 0) === 0)
          .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null
      );
    },

    defaultNurseId() {
      const id = Number(
        this.nurseTask?.assigned_karyawan_id ||
          this.nurseTask?.assigned_karyawan?.id ||
          this.nurseTask?.assignedKaryawan?.id ||
          this.detail?.perawat_awal_id ||
          this.detail?.perawat_awal?.id ||
          this.detail?.perawatAwal?.id ||
          0,
      );

      return id || null;
    },

    resetForm() {
      if (!this.canEdit || this.saving) return;

      const existing = this.getActiveCppt();

      if (existing) {
        this.applyExistingCppt();
      } else {
        this.form = {
          ...this.emptyForm(),
          perawat_id: this.defaultNurseId(),
        };
      }

      this.$refs.form?.resetValidation();
    },

    async saveCppt() {
      if (!this.canEdit || this.saving) return;

      const validation = await this.$refs.form?.validate();
      if (!validation?.valid) {
        this.showSnackbar("Lengkapi seluruh field wajib CPPT.", "error");
        return;
      }

      this.saving = true;
      this.errorMessage = "";

      try {
        const response = await antrianPerawatService.saveCppt(
          this.registrationId,
          {
            tanggal_pengisian: this.form.tanggal_pengisian || null,
            perawat_id: Number(this.form.perawat_id),
            subjective_ids: this.normalizeIdArray(this.form.subjective_ids),
            subjective_lainnya: this.nullableText(this.form.subjective_lainnya),
            objective: String(this.form.objective || "").trim(),
            assessment_ids: this.normalizeIdArray(this.form.assessment_ids),
            assessment_lainnya: this.nullableText(this.form.assessment_lainnya),
            plan: String(this.form.plan || "").trim(),
            tindakan: String(this.form.tindakan || "").trim(),
          },
        );

        this.cpptId = response?.data?.id || this.cpptId;

        await this.$router.replace({
          name: "Nurse Station",
        });
      } catch (error) {
        const message = this.getErrorMessage(
          error,
          "CPPT perawat gagal disimpan.",
        );

        this.errorMessage = message;
        this.showSnackbar(message, "error");
      } finally {
        this.saving = false;
      }
    },

    getSelectedOptions(items, ids) {
      const selectedIds = new Set(this.normalizeIdArray(ids));
      return (Array.isArray(items) ? items : []).filter((item) =>
        selectedIds.has(Number(item?.id || 0)),
      );
    },

    extractReferenceIds(relationItems, directIds, fallbackId) {
      const relationIds = (Array.isArray(relationItems) ? relationItems : [])
        .map((item) => Number(item?.id || item?.value || 0))
        .filter(Boolean);

      if (relationIds.length) return [...new Set(relationIds)];

      const normalizedDirectIds = this.normalizeIdArray(directIds);
      if (normalizedDirectIds.length) return normalizedDirectIds;

      const legacyId = Number(fallbackId || 0);
      return legacyId ? [legacyId] : [];
    },

    normalizeIdArray(value) {
      const values = Array.isArray(value) ? value : value ? [value] : [];
      return [
        ...new Set(values.map((item) => Number(item || 0)).filter(Boolean)),
      ];
    },

    nullableText(value) {
      const normalized = String(value || "").trim();
      return normalized || null;
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

    currentDateTimeLocal() {
      return this.toDateTimeLocal(new Date());
    },

    toDateTimeLocal(value) {
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return "";

      const pad = (number) => String(number).padStart(2, "0");

      return [
        date.getFullYear(),
        "-",
        pad(date.getMonth() + 1),
        "-",
        pad(date.getDate()),
        "T",
        pad(date.getHours()),
        ":",
        pad(date.getMinutes()),
      ].join("");
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

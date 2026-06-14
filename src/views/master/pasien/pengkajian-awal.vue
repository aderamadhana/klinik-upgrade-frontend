<template>
  <section class="pa-4 pa-md-6">
    <div
      class="d-flex flex-column flex-md-row justify-space-between align-start ga-4 mb-6"
    >
      <div>
        <div class="d-flex align-center ga-2 mb-2">
          <v-icon color="primary" icon="mdi-clipboard-text-outline" size="28" />
          <h1 class="text-h5 font-weight-bold">Pengkajian Awal Pasien</h1>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Dokumentasi anamnesis, pemeriksaan fisik, diagnosis, dan rencana
          terapi pasien.
        </div>
      </div>

      <div class="d-flex align-center ga-2 flex-wrap">
        <v-btn
          :to="backRoute"
          color="secondary"
          prepend-icon="mdi-arrow-left"
          variant="outlined"
        >
          Kembali
        </v-btn>

        <v-btn
          v-if="history.length"
          :disabled="loadingPage || saving"
          color="primary"
          prepend-icon="mdi-plus"
          variant="tonal"
          @click="startNewAssessment"
        >
          Pengkajian Baru
        </v-btn>
      </div>
    </div>

    <v-breadcrumbs class="pa-0 mb-5" :items="breadcrumbs" divider="/" />

    <v-alert
      v-if="errorMessage"
      class="mb-5"
      closable
      type="error"
      variant="tonal"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader v-if="loadingPage" type="article, article, article" />

    <template v-else>
      <v-card class="mb-5" elevation="0" variant="outlined">
        <v-card-text class="pa-5 pa-md-6">
          <div
            class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-5"
          >
            <div class="d-flex align-center ga-4">
              <v-avatar color="primary" size="64">
                <span class="text-h6 font-weight-bold text-white">
                  {{ patientInitials }}
                </span>
              </v-avatar>

              <div>
                <div class="text-caption text-medium-emphasis mb-1">
                  IDENTITAS PASIEN
                </div>
                <div class="text-h6 font-weight-bold mb-2">
                  {{ patient.nama || "Data tidak ditemukan" }}
                </div>
                <div class="d-flex align-center ga-2 flex-wrap">
                  <v-chip size="small" variant="tonal" color="primary">
                    {{ patient.no_rm || "No. RM belum tersedia" }}
                  </v-chip>
                  <v-chip size="small" variant="outlined">
                    ID {{ patient.id || "-" }}
                  </v-chip>
                  <v-chip
                    v-if="patient.toko_nama"
                    size="small"
                    variant="outlined"
                  >
                    {{ patient.toko_nama }}
                  </v-chip>
                </div>
              </div>
            </div>

            <div class="d-flex flex-column align-start align-md-end ga-2">
              <v-chip
                :color="readonlyMode ? 'secondary' : 'primary'"
                :prepend-icon="
                  readonlyMode ? 'mdi-lock-outline' : 'mdi-pencil-outline'
                "
                variant="tonal"
              >
                {{
                  readonlyMode
                    ? "Riwayat Mode Baca"
                    : form.id
                      ? "Edit Pengkajian Terbaru"
                      : "Pengkajian Baru"
                }}
              </v-chip>
              <div class="text-caption text-medium-emphasis">
                {{ formatDateTime(form.tanggal_pengkajian) }}
              </div>
            </div>
          </div>

          <v-divider class="my-5" />

          <v-row>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis mb-1">
                Tanggal Lahir
              </div>
              <div class="text-body-1 font-weight-medium">
                {{ formatDate(patient.tanggal_lahir) }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis mb-1">Usia</div>
              <div class="text-body-1 font-weight-medium">{{ patientAge }}</div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis mb-1">
                Pemeriksa
              </div>
              <div class="text-body-1 font-weight-medium">
                {{
                  form.nama_pemeriksa || "Akan mengikuti akun yang menyimpan"
                }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis mb-1">
                Status Pemeriksaan
              </div>
              <div class="d-flex ga-2 flex-wrap">
                <v-chip color="success" size="small" variant="tonal">
                  {{ normalCount }} Normal
                </v-chip>
                <v-chip
                  v-if="abnormalCount"
                  color="warning"
                  size="small"
                  variant="tonal"
                >
                  {{ abnormalCount }} Abnormal
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
        <v-row align="start">
          <v-col cols="12" lg="8">
            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-title class="d-flex align-center ga-3 pa-5">
                <v-avatar color="primary" size="38" variant="tonal">
                  <v-icon icon="mdi-calendar-clock" size="21" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Waktu Pengkajian
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Tanggal dan waktu pelaksanaan pemeriksaan
                  </div>
                </div>
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-5">
                <v-text-field
                  v-model="form.tanggal_pengkajian"
                  :disabled="readonlyMode"
                  :rules="[rules.required]"
                  label="Tanggal dan Waktu Pengkajian"
                  prepend-inner-icon="mdi-calendar-clock"
                  type="datetime-local"
                  variant="outlined"
                />
              </v-card-text>
            </v-card>

            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-title class="d-flex align-center ga-3 pa-5">
                <v-avatar color="primary" size="38" variant="tonal">
                  <v-icon icon="mdi-account-voice" size="21" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Anamnesis</div>
                  <div class="text-caption text-medium-emphasis">
                    Data subjektif dan riwayat keluhan pasien
                  </div>
                </div>
              </v-card-title>

              <v-divider />

              <v-card-text class="pa-5">
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="form.s_keluhan_utama"
                      auto-grow
                      :readonly="readonlyMode"
                      :rules="[rules.required]"
                      label="Keluhan Utama"
                      placeholder="Tuliskan keluhan utama yang disampaikan pasien"
                      rows="2"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.s_riwayat_penyakit_sekarang"
                      auto-grow
                      :readonly="readonlyMode"
                      label="Riwayat Penyakit Sekarang"
                      placeholder="Jelaskan perjalanan keluhan atau penyakit saat ini"
                      rows="3"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-textarea
                      v-model="form.s_riwayat_penyakit_dahulu"
                      auto-grow
                      :readonly="readonlyMode"
                      label="Riwayat Penyakit Dahulu"
                      placeholder="Tuliskan riwayat penyakit sebelumnya"
                      rows="3"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-textarea
                      v-model="form.s_riwayat_penyakit_keluarga"
                      auto-grow
                      :readonly="readonlyMode"
                      label="Riwayat Penyakit Keluarga"
                      placeholder="Tuliskan riwayat penyakit dalam keluarga"
                      rows="3"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-title class="d-flex align-center ga-3 pa-5">
                <v-avatar color="info" size="38" variant="tonal">
                  <v-icon icon="mdi-stethoscope" size="21" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Pemeriksaan Fisik Umum
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Kondisi umum, kesadaran, dan skor Glasgow Coma Scale
                  </div>
                </div>
              </v-card-title>

              <v-divider />

              <v-card-text class="pa-5">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.o_keadaan_umum"
                      :readonly="readonlyMode"
                      :rules="[rules.required]"
                      label="Keadaan Umum"
                      placeholder="Contoh: baik, sedang, atau lemah"
                      prepend-inner-icon="mdi-heart-pulse"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.o_gcs"
                      :readonly="readonlyMode"
                      label="Kesadaran"
                      placeholder="Contoh: compos mentis"
                      prepend-inner-icon="mdi-brain"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-sheet class="pa-4" color="grey-lighten-5" rounded="lg">
                      <div
                        class="d-flex justify-space-between align-center ga-3 flex-wrap mb-4"
                      >
                        <div>
                          <div class="text-subtitle-2 font-weight-bold">
                            Glasgow Coma Scale
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Isi respons mata, verbal, dan motorik bila
                            dilakukan.
                          </div>
                        </div>
                        <v-chip color="info" variant="tonal">
                          Total GCS: {{ totalGcs || "-" }}
                        </v-chip>
                      </div>

                      <v-row>
                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model.number="form.o_eye_gcs"
                            :readonly="readonlyMode"
                            :rules="[rules.eyeGcs]"
                            label="Eye Response (E)"
                            max="4"
                            min="1"
                            type="number"
                            variant="outlined"
                          />
                        </v-col>

                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model.number="form.o_verbal_gcs"
                            :readonly="readonlyMode"
                            :rules="[rules.verbalGcs]"
                            label="Verbal Response (V)"
                            max="5"
                            min="1"
                            type="number"
                            variant="outlined"
                          />
                        </v-col>

                        <v-col cols="12" sm="4">
                          <v-text-field
                            v-model.number="form.o_motor_gcs"
                            :readonly="readonlyMode"
                            :rules="[rules.motorGcs]"
                            label="Motor Response (M)"
                            max="6"
                            min="1"
                            type="number"
                            variant="outlined"
                          />
                        </v-col>
                      </v-row>
                    </v-sheet>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-title class="d-flex align-center ga-3 pa-5">
                <v-avatar color="teal" size="38" variant="tonal">
                  <v-icon icon="mdi-human" size="21" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Pemeriksaan Per Sistem
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Tentukan kondisi normal atau abnormal dan berikan keterangan
                  </div>
                </div>
              </v-card-title>

              <v-divider />

              <v-card-text class="pa-5">
                <v-row>
                  <v-col
                    v-for="item in pemeriksaanList"
                    :key="item.label"
                    cols="12"
                    md="6"
                  >
                    <v-card elevation="0" variant="outlined">
                      <v-card-text class="pa-4">
                        <div
                          class="d-flex justify-space-between align-center ga-3 mb-3"
                        >
                          <div class="text-subtitle-2 font-weight-bold">
                            {{ item.label }}
                          </div>
                          <v-chip
                            :color="
                              form[item.checklistKey] === 1
                                ? 'success'
                                : 'warning'
                            "
                            size="small"
                            variant="tonal"
                          >
                            {{
                              form[item.checklistKey] === 1
                                ? "Normal"
                                : "Abnormal"
                            }}
                          </v-chip>
                        </div>

                        <v-radio-group
                          v-model="form[item.checklistKey]"
                          class="mb-3"
                          :disabled="readonlyMode"
                          hide-details
                          inline
                        >
                          <v-radio label="Normal" :value="1" />
                          <v-radio label="Abnormal" :value="2" />
                        </v-radio-group>

                        <v-textarea
                          v-model="form[item.keteranganKey]"
                          auto-grow
                          :disabled="
                            readonlyMode || form[item.checklistKey] === 1
                          "
                          :rules="[abnormalRule(item)]"
                          label="Keterangan"
                          placeholder="Jelaskan temuan abnormal"
                          rows="2"
                          variant="outlined"
                        />
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-title class="d-flex align-center ga-3 pa-5">
                <v-avatar color="deep-purple" size="38" variant="tonal">
                  <v-icon icon="mdi-microscope" size="21" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Pemeriksaan Lanjutan
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Temuan fisik khusus dan pemeriksaan penunjang
                  </div>
                </div>
              </v-card-title>

              <v-divider />

              <v-card-text class="pa-5">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-textarea
                      v-model="form.pemeriksaan_fisik_khusus"
                      auto-grow
                      :readonly="readonlyMode"
                      label="Pemeriksaan Fisik Khusus"
                      placeholder="Tuliskan hasil pemeriksaan fisik khusus"
                      rows="4"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-textarea
                      v-model="form.pemeriksaan_penunjang"
                      auto-grow
                      :readonly="readonlyMode"
                      label="Pemeriksaan Penunjang"
                      placeholder="Tuliskan hasil pemeriksaan penunjang"
                      rows="4"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-title class="d-flex align-center ga-3 pa-5">
                <v-avatar color="orange" size="38" variant="tonal">
                  <v-icon icon="mdi-clipboard-check-outline" size="21" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Assessment dan Rencana
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Diagnosis, rencana terapi, dan tindak lanjut pasien
                  </div>
                </div>
              </v-card-title>

              <v-divider />

              <v-card-text class="pa-5">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-textarea
                      v-model="form.a_diagnosa"
                      auto-grow
                      :readonly="readonlyMode"
                      :rules="[rules.required]"
                      label="Diagnosis / Assessment (A)"
                      placeholder="Tuliskan diagnosis atau hasil assessment"
                      rows="4"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-textarea
                      v-model="form.p_rencana_terapi"
                      auto-grow
                      :readonly="readonlyMode"
                      :rules="[rules.required]"
                      label="Rencana Terapi (P)"
                      placeholder="Tuliskan rencana terapi pasien"
                      rows="4"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.rujuk_ke"
                      :readonly="readonlyMode"
                      label="Rujuk Ke"
                      placeholder="Isi tujuan rujukan bila diperlukan"
                      prepend-inner-icon="mdi-hospital-building"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.tanggal_kontrol"
                      :readonly="readonlyMode"
                      label="Jadwal Kontrol"
                      prepend-inner-icon="mdi-calendar-clock"
                      type="date"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4">
            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-title class="d-flex align-center ga-3 pa-5">
                <v-avatar color="success" size="38" variant="tonal">
                  <v-icon icon="mdi-school-outline" size="21" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Edukasi Pasien
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Konfirmasi informasi yang sudah disampaikan
                  </div>
                </div>
              </v-card-title>

              <v-divider />

              <v-card-text class="pa-5">
                <div class="text-body-2 text-medium-emphasis mb-3">
                  Telah diinformasikan kepada pasien atau keluarga mengenai:
                </div>

                <v-checkbox
                  v-model="form.info_hasil_pemeriksaan"
                  :disabled="readonlyMode"
                  hide-details
                  label="Hasil pemeriksaan"
                />

                <v-checkbox
                  v-model="form.info_tindakan_pengobatan_resiko"
                  :disabled="readonlyMode"
                  hide-details
                  label="Tindakan medis, pengobatan, dan risiko"
                />

                <v-checkbox
                  v-model="form.info_kemungkinan_komplikasi"
                  :disabled="readonlyMode"
                  hide-details
                  label="Komplikasi yang mungkin terjadi"
                />

                <v-divider class="my-5" />

                <div class="text-subtitle-2 font-weight-bold mb-2">
                  Pemahaman Pasien
                </div>

                <v-radio-group
                  v-model="form.status_paham_pasien"
                  :disabled="readonlyMode"
                  hide-details
                >
                  <v-radio label="Pasien memahami penjelasan" :value="1" />
                  <v-radio
                    label="Pasien belum memahami penjelasan"
                    :value="0"
                  />
                </v-radio-group>

                <v-alert
                  class="mt-4"
                  :color="
                    form.status_paham_pasien === 1 ? 'success' : 'warning'
                  "
                  :icon="
                    form.status_paham_pasien === 1
                      ? 'mdi-check-circle-outline'
                      : 'mdi-alert-circle-outline'
                  "
                  variant="tonal"
                >
                  {{
                    form.status_paham_pasien === 1
                      ? "Pasien menyatakan telah memahami informasi yang diberikan."
                      : "Lakukan edukasi ulang dan pastikan pasien memahami penjelasan."
                  }}
                </v-alert>
              </v-card-text>
            </v-card>

            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-title class="d-flex align-center ga-3 pa-5">
                <v-avatar color="secondary" size="38" variant="tonal">
                  <v-icon icon="mdi-history" size="21" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Riwayat Pengkajian
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Catatan terbaru berada di urutan teratas
                  </div>
                </div>
              </v-card-title>

              <v-divider />

              <v-card-text v-if="!history.length" class="pa-5 text-center">
                <v-icon
                  class="mb-3"
                  color="medium-emphasis"
                  icon="mdi-clipboard-text-clock-outline"
                  size="42"
                />
                <div class="text-subtitle-2 font-weight-bold mb-1">
                  Belum ada pengkajian
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Pengkajian yang disimpan akan muncul di bagian ini.
                </div>
              </v-card-text>

              <v-list v-else class="pa-0" lines="three">
                <template v-for="(item, index) in history" :key="item.id">
                  <v-list-item
                    :active="Number(form.id) === Number(item.id)"
                    color="primary"
                    prepend-icon="mdi-clipboard-text-outline"
                    @click="loadAssessment(item.id)"
                  >
                    <v-list-item-title class="font-weight-bold">
                      {{ formatDateTime(item.tanggal_pengkajian) }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ item.nama_pemeriksa || "-" }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      {{ item.diagnosa || "Diagnosis belum tersedia" }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-divider v-if="index < history.length - 1" />
                </template>
              </v-list>
            </v-card>

            <v-card class="mb-5" elevation="0" variant="outlined">
              <v-card-text class="pa-5">
                <div class="text-subtitle-1 font-weight-bold mb-2">
                  Ringkasan Form
                </div>
                <div class="text-body-2 text-medium-emphasis mb-4">
                  Periksa kembali seluruh data sebelum menyimpan pengkajian.
                </div>

                <v-list class="pa-0" density="compact">
                  <v-list-item prepend-icon="mdi-account-voice">
                    <v-list-item-title>Anamnesis</v-list-item-title>
                    <template #append>
                      <v-icon
                        :color="hasAnamnesis ? 'success' : 'grey'"
                        :icon="
                          hasAnamnesis
                            ? 'mdi-check-circle'
                            : 'mdi-circle-outline'
                        "
                      />
                    </template>
                  </v-list-item>

                  <v-list-item prepend-icon="mdi-stethoscope">
                    <v-list-item-title>Pemeriksaan Fisik</v-list-item-title>
                    <template #append>
                      <v-icon
                        :color="hasPhysicalExam ? 'success' : 'grey'"
                        :icon="
                          hasPhysicalExam
                            ? 'mdi-check-circle'
                            : 'mdi-circle-outline'
                        "
                      />
                    </template>
                  </v-list-item>

                  <v-list-item prepend-icon="mdi-clipboard-check-outline">
                    <v-list-item-title
                      >Assessment dan Rencana</v-list-item-title
                    >
                    <template #append>
                      <v-icon
                        :color="hasAssessmentPlan ? 'success' : 'grey'"
                        :icon="
                          hasAssessmentPlan
                            ? 'mdi-check-circle'
                            : 'mdi-circle-outline'
                        "
                      />
                    </template>
                  </v-list-item>

                  <v-list-item prepend-icon="mdi-school-outline">
                    <v-list-item-title>Edukasi Pasien</v-list-item-title>
                    <template #append>
                      <v-icon
                        :color="hasEducation ? 'success' : 'grey'"
                        :icon="
                          hasEducation
                            ? 'mdi-check-circle'
                            : 'mdi-circle-outline'
                        "
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card elevation="0" variant="outlined">
          <v-card-actions class="d-flex justify-end ga-3 pa-4 flex-wrap">
            <v-btn :to="backRoute" color="secondary" variant="text">
              Kembali
            </v-btn>

            <v-btn
              v-if="!readonlyMode"
              :disabled="saving"
              color="secondary"
              prepend-icon="mdi-refresh"
              variant="outlined"
              @click="resetForm"
            >
              Reset Form
            </v-btn>

            <v-btn
              v-if="!readonlyMode"
              :disabled="saving"
              :loading="saving"
              color="primary"
              prepend-icon="mdi-content-save-outline"
              type="submit"
              variant="flat"
            >
              {{ form.id ? "Perbarui Pengkajian" : "Simpan Pengkajian" }}
            </v-btn>

            <v-btn
              v-else
              color="primary"
              prepend-icon="mdi-plus"
              variant="tonal"
              @click="startNewAssessment"
            >
              Buat Pengkajian Baru
            </v-btn>
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
  </section>
</template>

<script>
import pasienService from "@/services/pasienService";

function localDateTimeValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function emptyForm() {
  return {
    id: null,
    pasien_id: null,
    nama_pemeriksa: "",
    tanggal_pengkajian: localDateTimeValue(),
    s_keluhan_utama: "",
    s_riwayat_penyakit_sekarang: "",
    s_riwayat_penyakit_dahulu: "",
    s_riwayat_penyakit_keluarga: "",
    o_keadaan_umum: "",
    o_gcs: "",
    o_eye_gcs: null,
    o_verbal_gcs: null,
    o_motor_gcs: null,
    o_keadaan_tht_checklist: 1,
    o_keadaan_tht: "",
    o_keadaan_kepala_checklist: 1,
    o_keadaan_kepala: "",
    o_keadaan_mata_checklist: 1,
    o_keadaan_mata: "",
    o_keadaan_leher_checklist: 1,
    o_keadaan_leher: "",
    o_keadaan_paru_checklist: 1,
    o_keadaan_paru: "",
    o_keadaan_jantung_checklist: 1,
    o_keadaan_jantung: "",
    o_keadaan_abdomen_checklist: 1,
    o_keadaan_abdomen: "",
    o_keadaan_ekstremitas_checklist: 1,
    o_keadaan_ekstremitas: "",
    o_keadaan_kulit_checklist: 1,
    o_keadaan_kulit: "",
    pemeriksaan_fisik_khusus: "",
    pemeriksaan_penunjang: "",
    a_diagnosa: "",
    p_rencana_terapi: "",
    rujuk_ke: "",
    tanggal_kontrol: "",
    info_hasil_pemeriksaan: false,
    info_tindakan_pengobatan_resiko: false,
    info_kemungkinan_komplikasi: false,
    status_paham_pasien: 1,
  };
}

export default {
  name: "PengkajianAwal",

  data() {
    return {
      loadingPage: false,
      saving: false,
      formValid: false,
      errorMessage: "",
      patient: {},
      history: [],
      latestAssessmentId: null,
      form: emptyForm(),
      originalForm: emptyForm(),
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
      rules: {
        required: (value) =>
          (value !== null &&
            value !== undefined &&
            String(value).trim() !== "") ||
          "Wajib diisi.",
        eyeGcs: (value) =>
          value === null ||
          value === "" ||
          (Number(value) >= 1 && Number(value) <= 4) ||
          "Nilai E harus 1 sampai 4.",
        verbalGcs: (value) =>
          value === null ||
          value === "" ||
          (Number(value) >= 1 && Number(value) <= 5) ||
          "Nilai V harus 1 sampai 5.",
        motorGcs: (value) =>
          value === null ||
          value === "" ||
          (Number(value) >= 1 && Number(value) <= 6) ||
          "Nilai M harus 1 sampai 6.",
      },
      pemeriksaanList: [
        {
          label: "THT",
          checklistKey: "o_keadaan_tht_checklist",
          keteranganKey: "o_keadaan_tht",
        },
        {
          label: "Kepala",
          checklistKey: "o_keadaan_kepala_checklist",
          keteranganKey: "o_keadaan_kepala",
        },
        {
          label: "Mata",
          checklistKey: "o_keadaan_mata_checklist",
          keteranganKey: "o_keadaan_mata",
        },
        {
          label: "Leher",
          checklistKey: "o_keadaan_leher_checklist",
          keteranganKey: "o_keadaan_leher",
        },
        {
          label: "Paru",
          checklistKey: "o_keadaan_paru_checklist",
          keteranganKey: "o_keadaan_paru",
        },
        {
          label: "Jantung",
          checklistKey: "o_keadaan_jantung_checklist",
          keteranganKey: "o_keadaan_jantung",
        },
        {
          label: "Abdomen",
          checklistKey: "o_keadaan_abdomen_checklist",
          keteranganKey: "o_keadaan_abdomen",
        },
        {
          label: "Ekstremitas",
          checklistKey: "o_keadaan_ekstremitas_checklist",
          keteranganKey: "o_keadaan_ekstremitas",
        },
        {
          label: "Kulit",
          checklistKey: "o_keadaan_kulit_checklist",
          keteranganKey: "o_keadaan_kulit",
        },
      ],
    };
  },

  computed: {
    patientId() {
      return Number(this.$route.params.id || 0);
    },

    backRoute() {
      return `/master/pasien/riwayat/${this.patientId}`;
    },

    breadcrumbs() {
      return [
        { title: "Administrasi", disabled: true },
        { title: "Pasien", disabled: false, to: "/master/pasien" },
        {
          title: "Riwayat",
          disabled: false,
          to: this.backRoute,
        },
        { title: "Pengkajian Awal", disabled: true },
      ];
    },

    readonlyMode() {
      return Boolean(
        this.form.id &&
        this.latestAssessmentId &&
        Number(this.form.id) !== Number(this.latestAssessmentId),
      );
    },

    patientInitials() {
      const name = String(this.patient.nama || "").trim();

      if (!name) return "PS";

      return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    },

    patientAge() {
      if (!this.patient.tanggal_lahir) return "Data tidak ditemukan";

      const birthDate = new Date(`${this.patient.tanggal_lahir}T00:00:00`);
      if (Number.isNaN(birthDate.getTime())) return "Data tidak valid";

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age -= 1;
      }

      return `${Math.max(age, 0)} tahun`;
    },

    totalGcs() {
      const values = [
        this.form.o_eye_gcs,
        this.form.o_verbal_gcs,
        this.form.o_motor_gcs,
      ];

      if (values.some((value) => value === null || value === "")) return null;

      return values.reduce((total, value) => total + Number(value || 0), 0);
    },

    normalCount() {
      return this.pemeriksaanList.filter(
        (item) => Number(this.form[item.checklistKey]) === 1,
      ).length;
    },

    abnormalCount() {
      return this.pemeriksaanList.filter(
        (item) => Number(this.form[item.checklistKey]) === 2,
      ).length;
    },

    hasAnamnesis() {
      return Boolean(
        this.form.s_keluhan_utama ||
        this.form.s_riwayat_penyakit_sekarang ||
        this.form.s_riwayat_penyakit_dahulu ||
        this.form.s_riwayat_penyakit_keluarga,
      );
    },

    hasPhysicalExam() {
      return Boolean(
        this.form.o_keadaan_umum ||
        this.form.o_gcs ||
        this.form.pemeriksaan_fisik_khusus ||
        this.form.pemeriksaan_penunjang,
      );
    },

    hasAssessmentPlan() {
      return Boolean(
        this.form.a_diagnosa ||
        this.form.p_rencana_terapi ||
        this.form.rujuk_ke ||
        this.form.tanggal_kontrol,
      );
    },

    hasEducation() {
      return Boolean(
        this.form.info_hasil_pemeriksaan ||
        this.form.info_tindakan_pengobatan_resiko ||
        this.form.info_kemungkinan_komplikasi,
      );
    },
  },

  async mounted() {
    await this.loadPage();
  },

  methods: {
    async loadPage() {
      if (!this.patientId) {
        this.errorMessage = "ID pasien tidak valid.";
        return;
      }

      this.loadingPage = true;
      this.errorMessage = "";

      try {
        const response = await pasienService.getPengkajianAwal(this.patientId);
        const data = response?.data || response || {};

        this.patient = data.pasien || {};
        this.history = Array.isArray(data.history) ? data.history : [];
        this.latestAssessmentId = data.latest?.id || null;

        if (data.latest) {
          this.setForm(data.latest);
        } else {
          this.startNewAssessment(false);
        }
      } catch (error) {
        this.errorMessage = this.extractError(
          error,
          "Gagal mengambil data pengkajian awal pasien.",
        );
      } finally {
        this.loadingPage = false;
      }
    },

    async loadAssessment(id) {
      if (!id || this.saving) return;

      this.loadingPage = true;
      this.errorMessage = "";

      try {
        const response = await pasienService.getPengkajianAwalById(
          this.patientId,
          id,
        );
        const data = response?.data || response || {};

        if (data.pasien) this.patient = data.pasien;
        this.setForm(data.pengkajian || {});
      } catch (error) {
        this.errorMessage = this.extractError(
          error,
          "Gagal mengambil detail pengkajian awal.",
        );
      } finally {
        this.loadingPage = false;
      }
    },

    setForm(data) {
      const normalized = {
        ...emptyForm(),
        ...data,
        o_eye_gcs:
          data.o_eye_gcs === null || data.o_eye_gcs === undefined
            ? null
            : Number(data.o_eye_gcs),
        o_verbal_gcs:
          data.o_verbal_gcs === null || data.o_verbal_gcs === undefined
            ? null
            : Number(data.o_verbal_gcs),
        o_motor_gcs:
          data.o_motor_gcs === null || data.o_motor_gcs === undefined
            ? null
            : Number(data.o_motor_gcs),
        status_paham_pasien: Number(data.status_paham_pasien ?? 1),
      };

      this.form = JSON.parse(JSON.stringify(normalized));
      this.originalForm = JSON.parse(JSON.stringify(normalized));
      this.$nextTick(() => this.$refs.formRef?.resetValidation());
    },

    startNewAssessment(showNotification = true) {
      const freshForm = emptyForm();
      freshForm.pasien_id = this.patientId;
      this.form = freshForm;
      this.originalForm = JSON.parse(JSON.stringify(freshForm));
      this.errorMessage = "";
      this.$nextTick(() => this.$refs.formRef?.resetValidation());

      if (showNotification) {
        this.showSnackbar("Form pengkajian baru sudah disiapkan.", "info");
      }
    },

    resetForm() {
      this.form = JSON.parse(JSON.stringify(this.originalForm));
      this.$nextTick(() => this.$refs.formRef?.resetValidation());
    },

    abnormalRule(item) {
      return (value) =>
        Number(this.form[item.checklistKey]) !== 2 ||
        Boolean(String(value || "").trim()) ||
        `Keterangan ${item.label} wajib diisi karena hasil abnormal.`;
    },

    buildPayload() {
      const payload = { ...this.form };
      delete payload.id;
      delete payload.pasien_id;
      delete payload.nama_pemeriksa;
      delete payload.created_at;
      delete payload.updated_at;

      this.pemeriksaanList.forEach((item) => {
        payload[item.checklistKey] = Number(payload[item.checklistKey] || 1);
        if (payload[item.checklistKey] === 1)
          payload[item.keteranganKey] = null;
      });

      payload.o_eye_gcs = this.nullableNumber(payload.o_eye_gcs);
      payload.o_verbal_gcs = this.nullableNumber(payload.o_verbal_gcs);
      payload.o_motor_gcs = this.nullableNumber(payload.o_motor_gcs);
      payload.status_paham_pasien = Number(payload.status_paham_pasien || 0);
      payload.tanggal_kontrol = payload.tanggal_kontrol || null;

      return payload;
    },

    nullableNumber(value) {
      if (value === null || value === undefined || value === "") return null;
      return Number(value);
    },

    async submitForm() {
      if (this.readonlyMode || this.saving) return;

      const validation = await this.$refs.formRef?.validate();
      if (!validation?.valid) {
        this.showSnackbar(
          "Lengkapi field wajib dan keterangan pemeriksaan abnormal.",
          "error",
        );
        return;
      }

      this.saving = true;
      this.errorMessage = "";

      try {
        const payload = this.buildPayload();
        const response = this.form.id
          ? await pasienService.updatePengkajianAwal(
              this.patientId,
              this.form.id,
              payload,
            )
          : await pasienService.createPengkajianAwal(this.patientId, payload);

        const saved = response?.data || response || {};
        this.showSnackbar(
          response?.message || "Pengkajian awal berhasil disimpan.",
          "success",
        );

        await this.loadPage();

        if (saved.id && Number(this.form.id) !== Number(saved.id)) {
          await this.loadAssessment(saved.id);
        }
      } catch (error) {
        const message = this.extractError(
          error,
          "Gagal menyimpan pengkajian awal pasien.",
        );
        this.errorMessage = message;
        this.showSnackbar(message, "error");
      } finally {
        this.saving = false;
      }
    },

    formatDate(value) {
      if (!value) return "Data tidak ditemukan";

      const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    },

    formatDateTime(value) {
      if (!value) return "Belum disimpan";

      const normalized = String(value).includes("T")
        ? String(value)
        : String(value).replace(" ", "T");
      const date = new Date(normalized);

      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    extractError(error, fallback) {
      const response = error?.response?.data;
      const validationErrors = response?.errors;

      if (validationErrors && typeof validationErrors === "object") {
        const firstError = Object.values(validationErrors).flat()[0];
        if (firstError) return firstError;
      }

      return response?.message || error?.message || fallback;
    },

    showSnackbar(message, color = "success") {
      this.snackbar = {
        show: true,
        message,
        color,
      };
    },
  },

  watch: {
    "$route.params.id"() {
      this.patient = {};
      this.history = [];
      this.latestAssessmentId = null;
      this.form = emptyForm();
      this.originalForm = emptyForm();
      this.loadPage();
    },
  },
};
</script>

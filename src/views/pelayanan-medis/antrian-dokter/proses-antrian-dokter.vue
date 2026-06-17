<template>
  <div>
    <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4">
      <div>
        <div class="text-h6 font-weight-bold">Proses Antrian Dokter</div>
        <div class="text-body-2 text-medium-emphasis">
          Pemeriksaan dokter, SOAP, obat / produk, treatment, resep, dan
          tindakan lanjutan pasien.
        </div>

        <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mt-2">
          <template #divider>
            <v-icon size="16">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </div>

      <div class="d-flex align-center flex-wrap ga-2">
        <v-chip
          :color="channelChip.color"
          variant="tonal"
          prepend-icon="mdi-stethoscope"
        >
          {{ channelChip.label }}
        </v-chip>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="$router.back()"
        >
          Kembali
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      class="mb-4"
    >
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader v-if="loading" type="article, card, card, table" />

    <template v-else>
      <v-alert
        v-if="ruleAlert.show"
        :type="ruleAlert.type"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        <div class="font-weight-bold mb-1">
          {{ ruleAlert.title }}
        </div>
        <div class="text-body-2">
          {{ ruleAlert.message }}
        </div>
      </v-alert>

      <v-card variant="outlined" rounded="lg" class="mb-5">
        <v-card-text class="pa-4">
          <div
            class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4"
          >
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ patient.nama_pasien || "-" }}
              </div>

              <div class="text-body-2 text-medium-emphasis">
                {{ patient.kode_registrasi || "-" }} · RM
                {{ patient.no_rm || "-" }}
              </div>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="chip in serviceChips"
                :key="chip.label"
                :color="chip.color"
                variant="tonal"
                size="small"
                :prepend-icon="chip.icon"
              >
                {{ chip.label }}
              </v-chip>
            </div>
          </div>

          <v-row dense>
            <v-col cols="12" sm="6" md="3">
              <v-sheet border rounded="lg" class="pa-3 h-100">
                <div class="d-flex align-center ga-2 mb-1">
                  <v-icon size="18" color="primary">
                    mdi-calendar-clock-outline
                  </v-icon>

                  <div class="text-caption text-medium-emphasis">
                    Tanggal & Waktu Kunjungan
                  </div>
                </div>

                <div class="text-body-2 font-weight-bold">
                  {{ patient.tanggal_waktu_kunjungan || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet border rounded="lg" class="pa-3 h-100">
                <div class="d-flex align-center ga-2 mb-1">
                  <v-icon size="18" color="success">
                    mdi-hospital-building
                  </v-icon>

                  <div class="text-caption text-medium-emphasis">Klinik</div>
                </div>

                <div class="text-body-2 font-weight-bold">
                  {{ patient.klinik || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet border rounded="lg" class="pa-3 h-100">
                <div class="d-flex align-center ga-2 mb-1">
                  <v-icon size="18" color="info"> mdi-doctor </v-icon>

                  <div class="text-caption text-medium-emphasis">Dokter</div>
                </div>

                <div class="text-body-2 font-weight-bold">
                  {{ patient.dokter || "-" }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet border rounded="lg" class="pa-3 h-100">
                <div class="d-flex align-center ga-2 mb-1">
                  <v-icon size="18" color="deep-purple">
                    mdi-phone-outline
                  </v-icon>

                  <div class="text-caption text-medium-emphasis">
                    No. HP / WA
                  </div>
                </div>

                <div class="text-body-2 font-weight-bold">
                  {{ patient.no_hp || "-" }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <div class="d-flex justify-end flex-wrap ga-2 mt-4">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-clipboard-pulse-outline"
              :disabled="!pasienId"
              @click="goToPengkajianAwal"
            >
              Pengkajian Awal
            </v-btn>

            <v-btn
              color="deep-purple"
              variant="tonal"
              size="small"
              prepend-icon="mdi-face-recognition"
              :disabled="!pasienId"
              @click="openSkinAnalyzer"
            >
              Skin Analyzer
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" lg="8">
          <v-card
            v-if="showAddConsultationOption"
            variant="outlined"
            rounded="lg"
            class="mb-5"
          >
            <v-card-text class="pa-4">
              <div
                class="d-flex align-start justify-space-between flex-wrap ga-3"
              >
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Konsultasi Tambahan
                  </div>

                  <div class="text-caption text-medium-emphasis">
                    Aktifkan jika pasien treatment juga perlu konsultasi dokter.
                  </div>
                </div>

                <v-switch
                  v-model="form.add_consultation"
                  color="primary"
                  hide-details
                  inset
                  label="Tambah Konsultasi"
                />
              </div>

              <v-alert
                v-if="form.add_consultation"
                type="info"
                variant="tonal"
                density="compact"
                class="mt-3"
              >
                Karena pasien mengambil treatment, biaya konsultasi tetap Rp 0.
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card
            v-if="showOnlineMedicalInfo"
            variant="outlined"
            rounded="lg"
            class="mb-5"
          >
            <v-card-title
              class="d-flex align-start justify-space-between flex-wrap ga-3 pa-4"
            >
              <div class="d-flex align-start ga-3">
                <v-avatar color="primary" variant="tonal" size="40">
                  <v-icon size="22">mdi-laptop-account</v-icon>
                </v-avatar>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Intake Konsultasi Online
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Informasi awal pasien sebelum pemeriksaan dan pengisian SOAP
                    dokter.
                  </div>
                </div>
              </div>

              <div class="d-flex align-center flex-wrap ga-2">
                <v-chip
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-cloud-check-outline"
                >
                  {{ consultationLabel }}
                </v-chip>

                <v-chip
                  color="info"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-numeric-1-circle-outline"
                >
                  Tinjau Intake
                </v-chip>
              </div>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-4">
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                border="start"
                class="mb-4"
              >
                <div class="font-weight-bold mb-1">
                  Konfirmasi informasi sebelum pemeriksaan
                </div>
                <div class="text-body-2">
                  Gunakan data ini sebagai acuan awal, lalu lengkapi hasil
                  pemeriksaan pada SOAP Dokter di bagian berikutnya.
                </div>
              </v-alert>

              <template v-if="hasOnlineRegistrationClinicalInfo">
                <v-row dense>
                  <v-col
                    v-if="onlineRegistrationClinicalInfo.complaint"
                    cols="12"
                    :md="
                      onlineRegistrationClinicalInfo.requestedDoctor ? 8 : 12
                    "
                  >
                    <v-sheet border rounded="lg" class="pa-4 h-100">
                      <div class="d-flex align-start ga-3">
                        <v-avatar color="error" variant="tonal" size="34">
                          <v-icon size="19">mdi-comment-alert-outline</v-icon>
                        </v-avatar>

                        <div>
                          <div class="text-caption text-medium-emphasis mb-1">
                            Keluhan Utama
                          </div>
                          <div class="text-body-1 font-weight-bold">
                            {{
                              displayMedicalText(
                                onlineRegistrationClinicalInfo.complaint,
                              )
                            }}
                          </div>
                        </div>
                      </div>
                    </v-sheet>
                  </v-col>

                  <v-col
                    v-if="onlineRegistrationClinicalInfo.requestedDoctor"
                    cols="12"
                    :md="onlineRegistrationClinicalInfo.complaint ? 4 : 12"
                  >
                    <v-sheet border rounded="lg" class="pa-4 h-100">
                      <div class="d-flex align-start ga-3">
                        <v-avatar color="primary" variant="tonal" size="34">
                          <v-icon size="19">mdi-doctor</v-icon>
                        </v-avatar>

                        <div>
                          <div class="text-caption text-medium-emphasis mb-1">
                            Request Dokter
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              displayMedicalText(
                                onlineRegistrationClinicalInfo.requestedDoctor,
                              )
                            }}
                          </div>
                        </div>
                      </div>
                    </v-sheet>
                  </v-col>

                  <v-col
                    v-if="
                      onlineRegistrationClinicalInfo.allergy ||
                      onlineRegistrationClinicalInfo.previousMedication
                    "
                    cols="12"
                    md="6"
                  >
                    <v-list
                      border
                      rounded="lg"
                      density="compact"
                      class="py-0 h-100"
                    >
                      <v-list-item
                        v-if="onlineRegistrationClinicalInfo.allergy"
                        prepend-icon="mdi-allergy"
                        title="Riwayat Alergi"
                        :subtitle="onlineRegistrationClinicalInfo.allergy"
                        class="py-2"
                      />

                      <v-divider
                        v-if="
                          onlineRegistrationClinicalInfo.allergy &&
                          onlineRegistrationClinicalInfo.previousMedication
                        "
                      />

                      <v-list-item
                        v-if="onlineRegistrationClinicalInfo.previousMedication"
                        prepend-icon="mdi-pill-multiple"
                        title="Produk / Obat Sebelumnya"
                        :subtitle="
                          onlineRegistrationClinicalInfo.previousMedication
                        "
                        class="py-2"
                      />
                    </v-list>
                  </v-col>

                  <v-col
                    v-if="
                      onlineRegistrationClinicalInfo.pregnant ||
                      onlineRegistrationClinicalInfo.breastfeeding
                    "
                    cols="12"
                    md="6"
                  >
                    <v-sheet border rounded="lg" class="pa-4 h-100">
                      <div class="d-flex align-center ga-2 mb-3">
                        <v-icon size="19" color="deep-purple">
                          mdi-shield-account-outline
                        </v-icon>
                        <div class="text-subtitle-2 font-weight-bold">
                          Kondisi Khusus
                        </div>
                      </div>

                      <div
                        v-if="onlineRegistrationClinicalInfo.pregnant"
                        class="d-flex align-center justify-space-between ga-3"
                        :class="{
                          'mb-3': onlineRegistrationClinicalInfo.breastfeeding,
                        }"
                      >
                        <div class="text-body-2">Sedang Hamil</div>
                        <v-chip
                          :color="
                            medicalConditionColor(
                              onlineRegistrationClinicalInfo.pregnant,
                            )
                          "
                          variant="tonal"
                          size="small"
                        >
                          {{
                            displayMedicalText(
                              onlineRegistrationClinicalInfo.pregnant,
                            )
                          }}
                        </v-chip>
                      </div>

                      <v-divider
                        v-if="
                          onlineRegistrationClinicalInfo.pregnant &&
                          onlineRegistrationClinicalInfo.breastfeeding
                        "
                        class="mb-3"
                      />

                      <div
                        v-if="onlineRegistrationClinicalInfo.breastfeeding"
                        class="d-flex align-center justify-space-between ga-3"
                      >
                        <div class="text-body-2">Sedang Menyusui</div>
                        <v-chip
                          :color="
                            medicalConditionColor(
                              onlineRegistrationClinicalInfo.breastfeeding,
                            )
                          "
                          variant="tonal"
                          size="small"
                        >
                          {{
                            displayMedicalText(
                              onlineRegistrationClinicalInfo.breastfeeding,
                            )
                          }}
                        </v-chip>
                      </div>
                    </v-sheet>
                  </v-col>

                  <v-col v-if="onlineRegistrationClinicalInfo.note" cols="12">
                    <v-alert
                      type="warning"
                      variant="tonal"
                      density="compact"
                      border="start"
                    >
                      <div class="font-weight-bold mb-1">
                        Catatan Pendaftaran
                      </div>
                      <div class="text-body-2">
                        {{ onlineRegistrationClinicalInfo.note }}
                      </div>
                    </v-alert>
                  </v-col>
                </v-row>
              </template>

              <v-alert
                v-else
                type="warning"
                variant="tonal"
                density="compact"
                border="start"
              >
                Data medis pendaftaran online belum diisi. Dokter tetap dapat
                melanjutkan pemeriksaan dan mengisi SOAP.
              </v-alert>

              <v-expansion-panels
                v-if="onlineRegistrationPhotos.length"
                variant="accordion"
                class="mt-4"
              >
                <v-expansion-panel elevation="0" rounded="lg" class="border">
                  <v-expansion-panel-title class="py-3 px-4">
                    <div
                      class="d-flex align-center justify-space-between flex-wrap ga-3 w-100 pr-2"
                    >
                      <div class="d-flex align-center ga-3">
                        <v-avatar color="success" variant="tonal" size="34">
                          <v-icon size="19">mdi-camera-outline</v-icon>
                        </v-avatar>

                        <div>
                          <div class="text-body-2 font-weight-bold">
                            Dokumentasi Pendaftaran
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Foto kondisi pasien yang dikirim saat registrasi.
                          </div>
                        </div>
                      </div>

                      <v-chip color="success" variant="tonal" size="small">
                        {{ onlineRegistrationPhotos.length }} Foto
                      </v-chip>
                    </div>
                  </v-expansion-panel-title>

                  <v-expansion-panel-text>
                    <v-row dense>
                      <v-col
                        v-for="photo in onlineRegistrationPhotos"
                        :key="photo.key"
                        cols="12"
                        md="4"
                      >
                        <v-card variant="outlined" rounded="lg" class="h-100">
                          <v-card-text class="pa-3">
                            <div class="text-caption text-medium-emphasis mb-2">
                              {{ photo.label }}
                            </div>

                            <v-img
                              :src="photo.url"
                              height="190"
                              cover
                              rounded="lg"
                              class="border"
                            />

                            <div
                              v-if="photo.file_name"
                              class="text-caption text-medium-emphasis mt-2 text-truncate"
                            >
                              {{ photo.file_name }}
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-alert
                v-else
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-4"
              >
                Dokumentasi foto pendaftaran online belum tersedia.
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card
            v-if="showSoapForm"
            variant="outlined"
            rounded="lg"
            class="mb-5"
          >
            <v-card-text class="pa-4 pb-2">
              <div class="text-subtitle-1 font-weight-bold">SOAP Dokter</div>
              <div class="text-caption text-medium-emphasis">
                Nama Pasien : {{ patient.nama_pasien || "-" }}
              </div>
            </v-card-text>

            <v-divider />

            <v-sheet color="red-lighten-5" class="pa-4">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-card variant="flat" rounded="lg" class="bg-white h-100">
                    <v-card-text class="pa-4">
                      <v-divider class="mb-4" />

                      <div class="text-subtitle-2 font-weight-bold mb-4">
                        Subjective (S)
                      </div>

                      <v-divider class="mb-3" />

                      <v-autocomplete
                        v-model="form.soap.subjective_items"
                        :items="subjectiveOptions"
                        item-title="label"
                        item-value="value"
                        label="Subjective"
                        placeholder="Pilih subjective"
                        variant="outlined"
                        density="compact"
                        multiple
                        chips
                        closable-chips
                        hide-details
                        clearable
                        :loading="loadingReference"
                      />

                      <v-divider class="my-4" />

                      <v-textarea
                        v-model="form.soap.subjective_other"
                        label="Lainnya Subjective"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        auto-grow
                        hide-details
                      />
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="flat" rounded="lg" class="bg-white h-100">
                    <v-card-text class="pa-4">
                      <v-divider class="mb-4" />

                      <div class="text-subtitle-2 font-weight-bold mb-4">
                        Objectif (O)
                      </div>

                      <v-divider class="mb-3" />

                      <v-textarea
                        v-model="form.soap.objective"
                        label="Objective"
                        variant="outlined"
                        density="compact"
                        rows="6"
                        auto-grow
                        hide-details
                      />
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12">
                  <v-card variant="flat" rounded="lg" class="bg-white">
                    <v-card-text class="pa-4">
                      <v-divider class="mb-4" />

                      <div class="text-subtitle-2 font-weight-bold mb-4">
                        Assesment (A)
                      </div>

                      <v-divider class="mb-3" />

                      <v-autocomplete
                        v-model="form.soap.assessment_items"
                        :items="assessmentOptions"
                        item-title="label"
                        item-value="value"
                        label="Assesment"
                        placeholder="Pilih assesment"
                        variant="outlined"
                        density="compact"
                        multiple
                        chips
                        closable-chips
                        hide-details
                        clearable
                        :loading="loadingReference"
                      />

                      <v-divider class="my-4" />

                      <v-textarea
                        v-model="form.soap.assessment_other"
                        label="Lainnya Assesment"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        auto-grow
                        hide-details
                      />
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12">
                  <v-card variant="flat" rounded="lg" class="bg-white">
                    <v-card-text class="pa-4">
                      <div class="text-subtitle-1 font-weight-bold mb-4">
                        Resep
                      </div>

                      <v-divider class="mb-4" />

                      <div class="text-subtitle-2 font-weight-bold mb-4">
                        Plan (P)
                      </div>

                      <v-divider class="mb-3" />

                      <v-textarea
                        v-model="form.soap.planning"
                        label="Plan"
                        variant="outlined"
                        density="compact"
                        rows="3"
                        auto-grow
                        hide-details
                      />

                      <div class="text-subtitle-2 font-weight-bold mt-5 mb-2">
                        Next Date Konsultasi
                      </div>

                      <v-row dense>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="form.soap.next_date_konsultasi"
                            label="Next Date Konsultasi"
                            type="date"
                            variant="outlined"
                            density="compact"
                            hide-details
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-sheet>
          </v-card>

          <div v-if="showPatientHistory" class="mb-6">
            <v-divider class="mb-4" />

            <div
              class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3"
            >
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Riwayat Transaksi Pasien
                </div>

                <div class="text-caption text-medium-emphasis">
                  Klik transaksi untuk melihat detail treatment, obat, catatan,
                  dan SOAP.
                </div>
              </div>

              <div class="d-flex align-center ga-2 flex-wrap">
                <v-chip
                  v-if="riwayatSummary"
                  color="success"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-account-heart-outline"
                >
                  {{ riwayatSummaryText }}
                </v-chip>

                <v-chip
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-history"
                >
                  {{
                    loadingRiwayatTransaksi ? "Memuat" : riwayatTransaksi.length
                  }}
                  Riwayat
                </v-chip>
              </div>
            </div>

            <v-skeleton-loader
              v-if="loadingRiwayatTransaksi"
              type="list-item-two-line, list-item-two-line"
              class="border rounded-lg"
            />

            <v-card
              v-else-if="!riwayatTransaksi.length"
              variant="outlined"
              rounded="lg"
            >
              <v-card-text
                class="d-flex flex-column align-center justify-center text-center pa-6"
              >
                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="48"
                  class="mb-3"
                >
                  <v-icon size="26">mdi-clipboard-text-clock-outline</v-icon>
                </v-avatar>

                <div class="text-subtitle-2 font-weight-bold mb-1">
                  Riwayat transaksi belum tersedia
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  Data akan muncul setelah pasien memiliki registrasi,
                  pelayanan, atau transaksi yang tersimpan.
                </div>
              </v-card-text>
            </v-card>

            <v-expansion-panels v-else variant="accordion" multiple>
              <v-expansion-panel
                v-for="(item, index) in riwayatTransaksi"
                :key="
                  getRiwayatRaw(item)?.registrasi_id ||
                  getRiwayatRaw(item)?.id ||
                  `riwayat-${index}`
                "
                :value="
                  getRiwayatRaw(item)?.registrasi_id ||
                  getRiwayatRaw(item)?.id ||
                  `riwayat-${index}`
                "
                elevation="0"
                rounded="lg"
                class="border mb-2"
              >
                <v-expansion-panel-title class="py-2 px-3">
                  <v-row no-gutters align="center" class="w-100 pr-2">
                    <v-col cols="12" sm="8" md="9">
                      <div class="d-flex align-center ga-3">
                        <v-avatar
                          color="primary"
                          variant="tonal"
                          size="42"
                          class="flex-shrink-0"
                        >
                          <span class="text-body-2 font-weight-bold">
                            {{ riwayatSequence(index) }}
                          </span>
                        </v-avatar>

                        <div>
                          <div class="d-flex align-center flex-wrap ga-2 mb-1">
                            <span class="text-body-2 font-weight-bold">
                              {{ riwayatKodeRegistrasi(item) }}
                            </span>
                            <span class="text-caption text-medium-emphasis">
                              {{ riwayatInvoiceNo(item) }}
                            </span>
                          </div>

                          <div class="text-caption text-medium-emphasis">
                            {{ riwayatTanggal(item) }} ·
                            {{ riwayatWaktu(item) }} ·
                            {{ riwayatTokoName(item) }}
                          </div>

                          <div class="d-flex align-center flex-wrap ga-1 mt-1">
                            <v-chip
                              v-for="label in riwayatLayananLabels(item)"
                              :key="`${riwayatKodeRegistrasi(item)}-${label}`"
                              color="info"
                              variant="tonal"
                              size="x-small"
                            >
                              {{ label }}
                            </v-chip>

                            <v-chip
                              v-if="riwayatCpptCount(item)"
                              color="deep-purple"
                              variant="tonal"
                              size="x-small"
                            >
                              {{ riwayatCpptCount(item) }} CPPT
                            </v-chip>
                          </div>
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" sm="4" md="3" class="mt-2 mt-sm-0">
                      <div
                        class="d-flex flex-column align-start align-sm-end ga-1"
                      >
                        <div class="d-flex align-center flex-wrap ga-1">
                          <v-chip
                            :color="riwayatStatusColor(item)"
                            variant="tonal"
                            size="x-small"
                          >
                            {{ riwayatStatusText(item) }}
                          </v-chip>

                          <v-chip
                            color="blue-grey"
                            variant="tonal"
                            size="x-small"
                          >
                            {{ riwayatJenisTransaksi(item) }}
                          </v-chip>
                        </div>

                        <div class="text-body-1 font-weight-bold text-no-wrap">
                          Rp {{ formatNumber(riwayatGrandTotal(item)) }}
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                  <div class="d-flex flex-wrap ga-2 mb-3">
                    <v-chip
                      color="primary"
                      variant="outlined"
                      size="small"
                      prepend-icon="mdi-doctor"
                    >
                      Dokter: {{ riwayatDokterName(item) }}
                    </v-chip>

                    <v-chip
                      color="teal"
                      variant="outlined"
                      size="small"
                      prepend-icon="mdi-account-heart-outline"
                    >
                      Perawat: {{ riwayatPerawatName(item) }}
                    </v-chip>
                  </div>

                  <template
                    v-for="group in riwayatDetailGroups(item)"
                    :key="`${riwayatKodeRegistrasi(item)}-${group.key}`"
                  >
                    <v-card variant="outlined" rounded="lg" class="mb-3">
                      <v-card-title
                        class="d-flex align-center justify-space-between flex-wrap ga-2 py-2 px-3"
                      >
                        <div class="d-flex align-center ga-2">
                          <v-avatar
                            :color="group.color"
                            variant="tonal"
                            size="28"
                          >
                            <v-icon size="16">{{ group.icon }}</v-icon>
                          </v-avatar>

                          <span class="text-body-2 font-weight-bold">
                            {{ group.label }}
                          </span>
                        </div>

                        <v-chip
                          :color="group.color"
                          variant="tonal"
                          size="x-small"
                        >
                          {{ group.items.length }} Item
                        </v-chip>
                      </v-card-title>

                      <v-divider />

                      <v-table density="compact">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th class="text-no-wrap">Qty</th>
                            <th class="text-no-wrap">Harga</th>
                            <th class="text-no-wrap">Diskon</th>
                            <th class="text-no-wrap text-right">Subtotal</th>
                          </tr>
                        </thead>

                        <tbody>
                          <template v-for="row in group.items" :key="row.key">
                            <tr>
                              <td class="py-2">
                                <div class="text-body-2 font-weight-bold">
                                  {{ row.nama }}
                                </div>

                                <div
                                  v-if="row.kode_item !== '-'"
                                  class="text-caption text-medium-emphasis"
                                >
                                  {{ row.kode_item }}
                                </div>

                                <div class="d-flex flex-wrap ga-1 mt-1">
                                  <v-chip
                                    :color="group.color"
                                    variant="tonal"
                                    size="x-small"
                                  >
                                    {{ row.item_type_text }}
                                  </v-chip>

                                  <v-chip
                                    v-if="row.is_saran_dokter"
                                    color="success"
                                    variant="tonal"
                                    size="x-small"
                                  >
                                    Saran Dokter
                                  </v-chip>

                                  <v-chip
                                    v-if="row.expired_at !== '-'"
                                    color="error"
                                    variant="tonal"
                                    size="x-small"
                                  >
                                    Expired {{ row.expired_at }}
                                  </v-chip>

                                  <v-chip
                                    v-if="row.status !== '-'"
                                    color="blue-grey"
                                    variant="tonal"
                                    size="x-small"
                                  >
                                    {{ row.status_text }}
                                  </v-chip>
                                </div>
                              </td>

                              <td class="text-no-wrap">
                                {{ formatNumber(row.qty) }}
                                {{ row.satuan !== "-" ? row.satuan : "" }}
                              </td>

                              <td class="text-no-wrap">
                                <div>Rp {{ formatNumber(row.harga) }}</div>
                                <div class="text-caption text-medium-emphasis">
                                  Awal Rp
                                  {{ formatNumber(riwayatItemGross(row)) }}
                                </div>
                              </td>

                              <td class="text-no-wrap">
                                <div class="text-caption">
                                  Item:
                                  <span v-if="riwayatDiskonMeta(row)">
                                    {{ riwayatDiskonMeta(row) }} ·
                                  </span>
                                  Rp {{ formatNumber(row.diskon_amount) }}
                                </div>
                                <div class="text-caption">
                                  Referral: Rp
                                  {{ formatNumber(row.diskon_referral) }}
                                </div>
                                <div class="text-caption">
                                  Subtotal: Rp
                                  {{ formatNumber(row.diskon_subtotal_amount) }}
                                </div>
                              </td>

                              <td
                                class="text-right text-no-wrap font-weight-bold"
                              >
                                Rp {{ formatNumber(row.subtotal) }}
                              </td>
                            </tr>

                            <tr v-if="riwayatHasMedicationUsage(row)">
                              <td colspan="5" class="py-2 bg-grey-lighten-5">
                                <div
                                  class="d-flex align-center flex-wrap ga-3 text-caption"
                                >
                                  <span>
                                    <strong>Frekuensi:</strong>
                                    {{ row.frekuensi || "-" }}
                                  </span>
                                  <span>
                                    <strong>Waktu pakai:</strong>
                                    {{ row.waktu_pakai || "-" }}
                                  </span>
                                  <span>
                                    <strong>Instruksi:</strong>
                                    {{ row.instruksi_pemakaian || "-" }}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </v-table>
                    </v-card>
                  </template>

                  <v-alert
                    v-if="!riwayatDetailGroups(item).length"
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mb-3"
                  >
                    Transaksi ini tidak memiliki detail treatment atau obat /
                    produk pada invoice.
                  </v-alert>

                  <v-row dense>
                    <v-col cols="12" md="6">
                      <v-list-item
                        border
                        rounded="lg"
                        density="compact"
                        prepend-icon="mdi-note-text-outline"
                        title="Catatan"
                        :subtitle="riwayatCatatan(item)"
                        class="h-100"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-list-item
                        border
                        rounded="lg"
                        density="compact"
                        prepend-icon="mdi-clipboard-pulse-outline"
                        title="Ringkasan SOAP"
                        :subtitle="riwayatSoapSummary(item)"
                        class="h-100"
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <v-card variant="outlined" rounded="lg" class="mb-5">
            <v-card-text class="pa-4">
              <div
                class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4"
              >
                <div>
                  <div class="d-flex align-center ga-2 mb-1">
                    <v-avatar color="primary" variant="tonal" size="32">
                      <v-icon size="18">mdi-pill</v-icon>
                    </v-avatar>

                    <div class="text-subtitle-1 font-weight-bold">
                      Obat / Produk
                    </div>
                  </div>

                  <div class="text-body-2 text-medium-emphasis">
                    Pilih produk dari stok cabang aktif. Qty dikunci agar tidak
                    melebihi stok tersedia.
                  </div>
                </div>

                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  :disabled="loadingReference"
                  @click="addObatRow"
                >
                  Tambah Produk
                </v-btn>
              </div>

              <v-alert
                v-if="!obatOptions.length && !loadingReference"
                type="warning"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                Reference obat / produk belum tersedia untuk cabang ini.
              </v-alert>

              <v-alert
                v-if="hasInvalidObatStock"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                {{ obatStockValidation.message }}
              </v-alert>

              <v-sheet
                v-for="(item, index) in obatItems"
                :key="`obat-${index}`"
                border
                rounded="lg"
                class="pa-4 mb-3"
              >
                <div
                  class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4"
                >
                  <div class="d-flex align-start ga-3">
                    <v-avatar color="primary" variant="tonal" size="34">
                      <span class="text-body-2 font-weight-bold">
                        {{ index + 1 }}
                      </span>
                    </v-avatar>

                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        {{ item.nama || "Produk belum dipilih" }}
                      </div>

                      <div class="d-flex flex-wrap ga-2 mt-2">
                        <v-chip size="small" variant="tonal" color="primary">
                          Qty {{ formatNumber(item.jumlah || 0) }}
                        </v-chip>

                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="getObatStockError(item) ? 'error' : 'success'"
                        >
                          Stok {{ getStokText(item) }}
                        </v-chip>

                        <v-chip size="small" variant="tonal" color="blue-grey">
                          Subtotal Rp {{ formatNumber(item.subtotal) }}
                        </v-chip>
                      </div>
                    </div>
                  </div>

                  <v-btn
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    size="small"
                    :disabled="obatItems.length === 1"
                    @click="removeObatRow(index)"
                  />
                </div>

                <v-alert
                  v-if="getObatStockError(item)"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  {{ getObatStockError(item) }}
                </v-alert>

                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      v-model="item.produk_toko_id"
                      :items="obatOptions"
                      item-title="label_dropdown"
                      item-value="value"
                      :item-props="getObatItemProps"
                      :custom-filter="filterObatOptions"
                      label="Obat / Produk"
                      placeholder="Pilih obat / produk"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      clearable
                      menu-icon="mdi-chevron-down"
                      auto-select-first
                      :loading="loadingReference"
                      @update:model-value="onSelectObat(index, $event)"
                    >
                      <template #message>
                        Produk stok kosong tetap tampil, tetapi tidak bisa
                        dipilih.
                      </template>

                      <template #no-data>
                        <div class="pa-3 text-body-2 text-medium-emphasis">
                          Produk tidak ditemukan.
                        </div>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" sm="4" md="2">
                    <v-text-field
                      v-model.number="item.jumlah"
                      label="Qty"
                      type="number"
                      min="1"
                      :max="item.stok_terbaca ? item.stok_tersedia : undefined"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :error-messages="getObatStockError(item)"
                      @update:model-value="recalculateObat(index)"
                    />
                  </v-col>

                  <v-col cols="12" sm="4" md="2">
                    <v-text-field
                      v-model.number="item.harga"
                      label="Harga"
                      type="number"
                      min="0"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      readonly
                    />
                  </v-col>

                  <v-col cols="12" sm="4" md="2">
                    <v-text-field
                      :model-value="formatNumber(item.subtotal)"
                      label="Subtotal"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      readonly
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="item.frekuensi_penggunaan"
                      :items="frekuensiPenggunaanOptions"
                      item-title="title"
                      item-value="value"
                      label="Frekuensi Penggunaan"
                      placeholder="Pilih frekuensi"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      clearable
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="item.waktu_penggunaan"
                      :items="waktuPenggunaanOptions"
                      item-title="title"
                      item-value="value"
                      label="Waktu Penggunaan"
                      placeholder="Pilih waktu penggunaan"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-sheet>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" rounded="lg" class="mb-5">
            <v-card-text class="pa-4">
              <div
                class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4"
              >
                <div>
                  <div class="d-flex align-center ga-2 mb-1">
                    <v-avatar color="deep-purple" variant="tonal" size="32">
                      <v-icon size="18">mdi-face-woman-shimmer-outline</v-icon>
                    </v-avatar>

                    <div class="text-subtitle-1 font-weight-bold">
                      Treatment
                    </div>
                  </div>

                  <div class="text-body-2 text-medium-emphasis">
                    Pilih treatment dari reference cabang aktif. Catatan dibuat
                    per treatment agar tidak tercampur.
                  </div>
                </div>

                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  :disabled="loadingReference"
                  @click="addTreatmentRow"
                >
                  Tambah Treatment
                </v-btn>
              </div>

              <v-alert
                v-if="!treatmentOptions.length && !loadingReference"
                type="warning"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                Reference treatment belum tersedia untuk cabang ini.
              </v-alert>

              <v-sheet
                v-for="(item, index) in treatmentItems"
                :key="`treatment-${index}`"
                border
                rounded="lg"
                class="pa-4 mb-3"
              >
                <div
                  class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4"
                >
                  <div class="d-flex align-start ga-3">
                    <v-avatar color="deep-purple" variant="tonal" size="34">
                      <span class="text-body-2 font-weight-bold">
                        {{ index + 1 }}
                      </span>
                    </v-avatar>

                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        {{ item.nama || "Treatment belum dipilih" }}
                      </div>

                      <div class="d-flex flex-wrap ga-2 mt-2">
                        <v-chip size="small" variant="tonal" color="primary">
                          Qty {{ formatNumber(item.jumlah || 0) }}
                        </v-chip>

                        <v-chip size="small" variant="tonal" color="blue-grey">
                          Total Rp {{ formatNumber(item.total) }}
                        </v-chip>
                      </div>
                    </div>
                  </div>

                  <v-btn
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    size="small"
                    :disabled="treatmentItems.length === 1"
                    @click="removeTreatmentRow(index)"
                  />
                </div>

                <v-row dense>
                  <v-col cols="12" md="7">
                    <v-autocomplete
                      v-model="item.treatment_toko_id"
                      :items="treatmentOptions"
                      item-title="label"
                      item-value="value"
                      label="Treatment"
                      placeholder="Pilih treatment"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      clearable
                      :loading="loadingReference"
                      @update:model-value="onSelectTreatment(index, $event)"
                    />
                  </v-col>

                  <v-col cols="12" md="5">
                    <v-autocomplete
                      v-model="item.perawat_id"
                      :items="perawatOptions"
                      item-title="title"
                      item-value="value"
                      label="Nurse / Beautician"
                      placeholder="Pilih pelaksana treatment"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-account-heart-outline"
                      hide-details="auto"
                      clearable
                      :loading="loadingReference"
                      @update:model-value="onSelectPerawat(index, $event)"
                    >
                      <template #item="{ props: itemProps, item: option }">
                        <v-list-item
                          v-bind="itemProps"
                          :title="getPerawatItemTitle(option)"
                          :subtitle="getPerawatItemSubtitle(option)"
                        />
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model.number="item.jumlah"
                      label="Qty"
                      type="number"
                      min="1"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="recalculateTreatment(index)"
                    />
                  </v-col>

                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model.number="item.harga"
                      label="Harga"
                      type="number"
                      min="0"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      readonly
                    />
                  </v-col>

                  <v-col cols="12" sm="4">
                    <v-text-field
                      :model-value="formatNumber(item.total)"
                      label="Total"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      readonly
                    />
                  </v-col>
                </v-row>
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card variant="outlined" rounded="lg" class="mb-5">
            <v-card-text class="pa-4">
              <div class="d-flex align-start ga-3 mb-4">
                <v-avatar color="success" variant="tonal" size="36">
                  <v-icon size="20">mdi-calculator-variant-outline</v-icon>
                </v-avatar>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">Ringkasan</div>
                  <div class="text-body-2 text-medium-emphasis">
                    Estimasi biaya dari produk, treatment, dan konsultasi.
                  </div>
                </div>
              </div>

              <v-sheet border rounded="lg" class="pa-3 mb-3">
                <div class="d-flex justify-space-between align-center mb-3">
                  <div class="d-flex align-center ga-2">
                    <v-icon size="18" color="primary">mdi-pill</v-icon>
                    <div class="text-body-2 text-medium-emphasis">
                      Obat / Produk
                    </div>
                  </div>

                  <div class="text-body-2 font-weight-bold">
                    Rp {{ formatNumber(totalObat) }}
                  </div>
                </div>

                <div class="d-flex justify-space-between align-center mb-3">
                  <div class="d-flex align-center ga-2">
                    <v-icon size="18" color="deep-purple">
                      mdi-face-woman-shimmer-outline
                    </v-icon>
                    <div class="text-body-2 text-medium-emphasis">
                      Treatment
                    </div>
                  </div>

                  <div class="text-body-2 font-weight-bold">
                    Rp {{ formatNumber(totalTreatment) }}
                  </div>
                </div>

                <div class="d-flex justify-space-between align-center">
                  <div class="d-flex align-center ga-2">
                    <v-icon size="18" color="success">mdi-stethoscope</v-icon>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ consultationLabel }}
                    </div>
                  </div>

                  <div class="text-body-2 font-weight-bold">
                    Rp {{ formatNumber(consultationFee) }}
                  </div>
                </div>
              </v-sheet>

              <v-sheet border rounded="lg" color="grey-lighten-5" class="pa-4">
                <div class="text-caption text-medium-emphasis mb-1">
                  Grand Total
                </div>

                <div class="text-h5 font-weight-bold">
                  Rp {{ formatNumber(grandTotal) }}
                </div>
              </v-sheet>

              <v-alert
                v-if="hasTreatment"
                type="info"
                variant="tonal"
                density="compact"
                class="mt-4"
              >
                Biaya {{ consultationLabel }} menjadi Rp 0 karena pasien
                mengambil treatment.
              </v-alert>
            </v-card-text>

            <v-card-actions class="pa-4 pt-0">
              <v-btn
                color="success"
                variant="flat"
                block
                size="large"
                prepend-icon="mdi-content-save-outline"
                :loading="submitLoading"
                :disabled="hasInvalidObatStock"
                @click="submitForm"
              >
                Simpan Proses Dokter
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-dialog v-model="skinAnalyzerDialog" max-width="960" scrollable>
      <v-card rounded="lg">
        <v-card-title
          class="d-flex align-start justify-space-between ga-4 px-5 py-4"
        >
          <div>
            <div class="text-h6 font-weight-bold">Skin Analyzer</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Simpan dan buka kembali tautan hasil analisis kulit pasien.
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="skinAnalyzerSaving"
            @click="closeSkinAnalyzer"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <v-alert
            type="info"
            variant="tonal"
            border="start"
            icon="mdi-qrcode-scan"
            class="mb-4"
          >
            Scan QR dari perangkat Skin Analyzer atau tempel link hasil analisis
            pada kolom berikut.
          </v-alert>

          <v-form ref="skinAnalyzerForm" @submit.prevent="saveSkinAnalyzer">
            <v-row dense align="start">
              <v-col cols="12" md="9">
                <v-text-field
                  v-model.trim="skinAnalyzerLink"
                  label="Link hasil Skin Analyzer"
                  placeholder="https://..."
                  prepend-inner-icon="mdi-link-variant"
                  variant="outlined"
                  density="comfortable"
                  :rules="skinAnalyzerLinkRules"
                  :disabled="skinAnalyzerSaving"
                  maxlength="2048"
                  counter
                  clearable
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-btn
                  type="submit"
                  block
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-content-save-outline"
                  height="48"
                  :loading="skinAnalyzerSaving"
                  :disabled="skinAnalyzerSaving"
                >
                  Simpan
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <v-alert
            v-if="skinAnalyzerError"
            type="error"
            variant="tonal"
            border="start"
            class="mb-4"
            closable
            @click:close="skinAnalyzerError = ''"
          >
            {{ skinAnalyzerError }}
          </v-alert>

          <div class="border rounded-lg overflow-hidden">
            <v-progress-linear
              v-if="skinAnalyzerLoading"
              indeterminate
              color="primary"
            />

            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Tanggal & Waktu</th>
                  <th class="text-left">Dioperasikan Oleh</th>
                  <th class="text-left">Cabang</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                <template v-if="skinAnalyzerLoading">
                  <tr
                    v-for="index in 3"
                    :key="`skin-analyzer-loading-${index}`"
                  >
                    <td colspan="5" class="py-3">
                      <v-skeleton-loader type="text" />
                    </td>
                  </tr>
                </template>

                <template v-else-if="skinAnalyzerItems.length">
                  <tr v-for="(item, index) in skinAnalyzerItems" :key="item.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ formatSkinAnalyzerDateTime(item.created_at) }}</td>
                    <td class="font-weight-medium">
                      {{ item.operate_by || "-" }}
                    </td>
                    <td>{{ item.branch || "-" }}</td>
                    <td class="text-right">
                      <v-btn
                        color="primary"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-open-in-new"
                        @click="openSkinAnalyzerResult(item)"
                      >
                        Lihat Hasil
                      </v-btn>
                    </td>
                  </tr>
                </template>

                <tr v-else>
                  <td colspan="5" class="pa-0">
                    <div
                      class="d-flex flex-column align-center justify-center py-10 px-4 text-center"
                    >
                      <v-icon
                        icon="mdi-face-recognition"
                        size="42"
                        color="grey-lighten-1"
                        class="mb-2"
                      />
                      <div class="text-subtitle-2 font-weight-bold">
                        Belum ada hasil Skin Analyzer
                      </div>
                      <div class="text-body-2 text-medium-emphasis mt-1">
                        Tambahkan link hasil analisis pertama pasien melalui
                        form di atas.
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-5 py-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="secondary"
            :disabled="skinAnalyzerSaving"
            @click="closeSkinAnalyzer"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3500"
      location="top right"
    >
      {{ snackbar.message }}

      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false"> Tutup </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import api from "@/services/api";
import referenceService from "@/services/referenceService";
import antrianDokterService from "@/services/pelayanan-medis/antrianDokterService";

const CONSULTATION_PRICE = 100000;

export default {
  name: "ProsesAntrianDokter",

  data() {
    return {
      loading: false,
      loadingReference: false,
      submitLoading: false,
      errorMessage: "",

      registration: null,

      breadcrumbs: [
        {
          title: "Pelayanan Medis",
          disabled: true,
        },
        {
          title: "Antrian Dokter",
          to: "/pelayanan-medis/antrian-dokter",
        },
        {
          title: "Proses",
          disabled: true,
        },
      ],

      patient: {
        kode_registrasi: "-",
        nama_pasien: "-",
        no_rm: "-",
        no_hp: "-",
        tanggal_waktu_kunjungan: "-",
        dokter: "-",
        klinik: "-",
      },

      onlineRegistration: {
        registrasi_id: null,
        request_dokter_id: null,
        request_dokter_nama: null,
        request_dokter: null,
        alergi: null,
        keluhan_utama: null,
        keluhan: null,
        keluhan_awal: null,
        produk_obat_sebelumnya: null,
        produk_sebelumnya: null,
        sedang_hamil: null,
        sedang_hamil_raw: null,
        sedang_menyusui: null,
        sedang_menyusui_raw: null,
        catatan_cs: null,
        catatan_awal: null,
        catatan_registrasi: null,
        jenis_konsultasi: null,
        jenis_konsultasi_label: null,
        channel_konsultasi: null,
        channel_label: null,
        konsultasi_source_code: null,
        konsultasi_source_name: null,
        bukti_chat_konsultasi_online: null,
        bukti_chat_konsultasi_online_url: null,
        foto_kiri: null,
        foto_depan: null,
        foto_kanan: null,
        fotos: [],
      },

      form: {
        add_consultation: false,
        soap: {
          subjective_items: [],
          subjective_other: "",
          objective: "",
          assessment_items: [],
          assessment_other: "",
          planning: "",
          next_date_konsultasi: "",
        },
      },

      subjectiveOptions: [],
      assessmentOptions: [],
      obatOptions: [],
      treatmentOptions: [],
      perawatOptions: [],

      frekuensiPenggunaanOptions: [
        { title: "1 x sehari", value: "1 x sehari" },
        { title: "2 x sehari", value: "2 x sehari" },
        { title: "3 x sehari", value: "3 x sehari" },
        { title: "4 x sehari", value: "4 x sehari" },
      ],

      waktuPenggunaanOptions: [
        { title: "Pagi", value: "pagi" },
        { title: "Siang", value: "siang" },
        { title: "Sore", value: "sore" },
        { title: "Malam", value: "malam" },
        { title: "Pagi - Siang", value: "pagi - siang" },
        { title: "Pagi - Sore", value: "pagi - sore" },
        { title: "Pagi - Malam", value: "pagi - malam" },
        { title: "Siang - Sore", value: "siang - sore" },
        { title: "Siang - Malam", value: "siang - malam" },
        { title: "Sore - Malam", value: "sore - malam" },
        { title: "Pagi - Siang - Malam", value: "pagi - siang - malam" },
        { title: "Pagi - Sore - Malam", value: "pagi - sore - malam" },
        { title: "Siang - Sore - Malam", value: "siang - sore - malam" },
        {
          title: "Pagi - Siang - Sore - Malam",
          value: "pagi - siang - sore - malam",
        },
      ],

      riwayatTransaksi: [],
      riwayatSummary: null,
      loadingRiwayatTransaksi: false,
      obatItems: [],
      treatmentItems: [],

      skinAnalyzerDialog: false,
      skinAnalyzerLoading: false,
      skinAnalyzerSaving: false,
      skinAnalyzerError: "",
      skinAnalyzerLink: "",
      skinAnalyzerItems: [],
      skinAnalyzerLinkRules: [
        (value) =>
          Boolean(String(value || "").trim()) ||
          "Link hasil Skin Analyzer wajib diisi.",
        (value) => {
          const link = String(value || "").trim();
          if (!link) return true;

          return (
            /^https?:\/\/[^\s]+$/i.test(link) ||
            "Gunakan link lengkap yang diawali http:// atau https://."
          );
        },
        (value) =>
          String(value || "").length <= 2048 || "Link maksimal 2048 karakter.",
      ],

      snackbar: {
        show: false,
        color: "success",
        message: "",
      },
    };
  },

  computed: {
    antrianId() {
      return this.$route.params.id;
    },

    pasienId() {
      const value = this.resolvePasienId(this.registration || {});
      const pasienId = Number(value || 0);

      return pasienId > 0 ? pasienId : null;
    },

    riwayatSummaryText() {
      const summary = this.riwayatSummary || {};
      const totalVisit =
        summary.total_visit ||
        summary.total_kunjungan ||
        summary.visit_count ||
        summary.total_transaksi ||
        0;

      if (totalVisit) {
        return `${this.formatNumber(totalVisit)} Visit`;
      }

      return "Ringkasan Pasien";
    },

    consultationSourceCode() {
      return String(
        this.registration?.konsultasi_source_code ||
          this.registration?.layanan?.konsultasi_source_code ||
          this.registration?.konsultasi?.source_code ||
          "",
      ).trim();
    },

    consultationSourceName() {
      return String(
        this.registration?.jenis_konsultasi_label ||
          this.registration?.layanan?.jenis_konsultasi_label ||
          this.registration?.konsultasi_source_name ||
          this.registration?.layanan?.konsultasi_source_name ||
          this.registration?.konsultasi?.source_name ||
          "",
      ).trim();
    },

    consultationChannel() {
      return this.normalizeText(
        this.registration?.channel_konsultasi ??
          this.registration?.layanan?.channel_konsultasi ??
          this.registration?.konsultasi?.channel_konsultasi ??
          this.registration?.konsultasi_channel,
      );
    },

    consultationLabel() {
      if (this.consultationSourceName) {
        return this.consultationSourceName;
      }

      const sourceCode = this.consultationSourceCode.toUpperCase();

      if (sourceCode.includes("ONLINE")) return "Konsultasi Online";
      if (sourceCode.includes("SPPG")) return "Konsultasi SPPG";
      if (sourceCode.includes("SPKK")) return "Konsultasi SPKK";
      if (sourceCode.includes("OFFLINE") || sourceCode.includes("DOKTER")) {
        return "Konsultasi Dokter";
      }

      if (
        this.consultationChannel === "2" ||
        this.consultationChannel === "online"
      ) {
        return "Konsultasi Online";
      }

      if (
        this.consultationChannel === "1" ||
        this.consultationChannel === "offline"
      ) {
        return "Konsultasi Dokter";
      }

      return this.form.add_consultation
        ? "Konsultasi Dokter"
        : "Tanpa Konsultasi Awal";
    },

    consultationOriginalAmount() {
      const value =
        this.registration?.total_konsultasi ??
        this.registration?.layanan?.total_konsultasi ??
        this.registration?.biaya_konsultasi ??
        this.registration?.konsultasi_total ??
        this.registration?.konsultasi?.total_harga ??
        null;

      const number = Number(value);
      if (Number.isFinite(number) && number > 0) {
        return number;
      }

      return this.defaultConsultationAmount;
    },

    defaultConsultationAmount() {
      const sourceCode = this.consultationSourceCode.toUpperCase();
      const sourceName = this.consultationSourceName.toUpperCase();

      if (sourceCode.includes("ONLINE") || sourceName.includes("ONLINE")) {
        return 0;
      }

      if (sourceCode.includes("SPPG") || sourceName.includes("SPPG")) {
        return 250000;
      }

      if (sourceCode.includes("SPKK") || sourceName.includes("SPKK")) {
        return 150000;
      }

      if (
        sourceCode.includes("OFFLINE") ||
        sourceCode.includes("DOKTER") ||
        sourceName.includes("DOKTER") ||
        this.consultationChannel === "1" ||
        this.consultationChannel === "offline"
      ) {
        return CONSULTATION_PRICE;
      }

      return 0;
    },

    hasOriginalConsultation() {
      return (
        this.isTrue(this.registration?.ada_konsultasi) ||
        this.isTrue(this.registration?.is_konsultasi) ||
        this.isTrue(this.registration?.layanan?.ada_konsultasi) ||
        Boolean(this.consultationSourceCode) ||
        Number(
          this.registration?.channel_konsultasi ??
            this.registration?.layanan?.channel_konsultasi ??
            0,
        ) > 0 ||
        Boolean(this.registration?.konsultasi_id) ||
        Boolean(this.registration?.konsultasi)
      );
    },

    hasTreatment() {
      return (
        this.isTrue(this.registration?.ada_treatment) ||
        this.isTrue(this.registration?.is_treatment) ||
        this.isTrue(this.registration?.layanan?.ada_treatment) ||
        Boolean(this.registration?.perawatan_id) ||
        Boolean(this.registration?.perawatan) ||
        this.treatmentItems.some(
          (item) => item.treatment_toko_id || item.treatment_id,
        )
      );
    },

    hasPenjualan() {
      return (
        this.isTrue(this.registration?.ada_penjualan) ||
        this.isTrue(this.registration?.is_penjualan) ||
        this.isTrue(this.registration?.layanan?.ada_penjualan) ||
        Boolean(this.registration?.penjualan_id) ||
        Boolean(this.registration?.penjualan) ||
        this.obatItems.some((item) => item.produk_toko_id || item.produk_id)
      );
    },

    isOnlineConsultation() {
      const primaryChannel = this.normalizeText(
        this.registration?.channel_konsultasi ??
          this.registration?.layanan?.channel_konsultasi ??
          this.registration?.konsultasi?.channel_konsultasi ??
          this.registration?.konsultasi_channel,
      );

      if (primaryChannel) {
        if (
          primaryChannel === "2" ||
          primaryChannel === "online" ||
          primaryChannel.includes("online")
        ) {
          return true;
        }

        if (
          primaryChannel === "1" ||
          primaryChannel === "offline" ||
          primaryChannel.includes("offline")
        ) {
          return false;
        }
      }

      const primarySource = [
        this.consultationSourceCode,
        this.consultationSourceName,
        this.registration?.channel_konsultasi_label,
        this.registration?.channel_label,
      ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();

      if (primarySource.includes("ONLINE")) {
        return true;
      }

      if (
        primarySource.includes("OFFLINE") ||
        primarySource.includes("SPPG") ||
        primarySource.includes("SPKK")
      ) {
        return false;
      }

      const intakeType = Number(this.onlineRegistration?.jenis_konsultasi || 0);

      if (intakeType === 2) {
        return true;
      }

      if (intakeType === 1) {
        return false;
      }

      const intakeChannel = this.normalizeText(
        this.onlineRegistration?.channel_konsultasi,
      );

      if (
        intakeChannel === "2" ||
        intakeChannel === "online" ||
        intakeChannel.includes("online")
      ) {
        return true;
      }

      const intakeSource = [
        this.onlineRegistration?.konsultasi_source_code,
        this.onlineRegistration?.konsultasi_source_name,
        this.onlineRegistration?.jenis_konsultasi_label,
        this.onlineRegistration?.channel_label,
      ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();

      return intakeSource.includes("ONLINE");
    },

    showSoapForm() {
      return this.hasOriginalConsultation || this.form.add_consultation;
    },

    showPatientHistory() {
      return this.hasOriginalConsultation || this.form.add_consultation;
    },

    showAddConsultationOption() {
      return this.hasTreatment && !this.hasOriginalConsultation;
    },

    consultationFee() {
      if (this.hasTreatment) {
        return 0;
      }

      if (this.hasOriginalConsultation) {
        return this.consultationOriginalAmount;
      }

      if (!this.form.add_consultation) {
        return 0;
      }

      return CONSULTATION_PRICE;
    },

    totalObat() {
      return this.obatItems.reduce(
        (total, item) => total + this.toNumber(item.subtotal),
        0,
      );
    },

    totalTreatment() {
      return this.treatmentItems.reduce(
        (total, item) => total + this.toNumber(item.total),
        0,
      );
    },

    grandTotal() {
      return this.totalObat + this.totalTreatment + this.consultationFee;
    },

    obatStockValidation() {
      return this.getObatStockValidation();
    },

    hasInvalidObatStock() {
      return this.obatStockValidation.invalid;
    },

    channelChip() {
      const sourceCode = this.consultationSourceCode.toUpperCase();

      if (this.isOnlineConsultation) {
        return { label: this.consultationLabel, color: "primary" };
      }

      if (sourceCode.includes("SPPG")) {
        return { label: this.consultationLabel, color: "deep-purple" };
      }

      if (sourceCode.includes("SPKK")) {
        return { label: this.consultationLabel, color: "indigo" };
      }

      if (this.hasOriginalConsultation) {
        return { label: this.consultationLabel, color: "success" };
      }

      return { label: "Tanpa Konsultasi Awal", color: "grey" };
    },

    serviceChips() {
      const chips = [];

      if (this.hasOriginalConsultation) {
        chips.push({
          label: this.channelChip.label,
          color: this.channelChip.color,
          icon: "mdi-stethoscope",
        });
      }

      if (this.hasTreatment) {
        chips.push({
          label: "Treatment",
          color: "success",
          icon: "mdi-face-woman-shimmer-outline",
        });
      }

      if (this.hasPenjualan) {
        chips.push({
          label: "Obat / Produk",
          color: "info",
          icon: "mdi-pill",
        });
      }

      if (!chips.length) {
        chips.push({
          label: "Belum Ada Layanan",
          color: "grey",
          icon: "mdi-information-outline",
        });
      }

      return chips;
    },

    ruleAlert() {
      if (this.hasOriginalConsultation && this.isOnlineConsultation) {
        return {
          show: false,
          type: "info",
          title: "",
          message: "",
        };
      }

      if (this.hasOriginalConsultation && this.hasTreatment) {
        return {
          show: true,
          type: "success",
          title: "Konsultasi dengan treatment",
          message: `SOAP diisi dokter. Biaya ${this.consultationLabel} otomatis Rp 0 karena pasien mengambil treatment.`,
        };
      }

      if (this.hasTreatment && !this.hasOriginalConsultation) {
        return {
          show: true,
          type: "warning",
          title: "Treatment tanpa konsultasi awal",
          message:
            "Pasien tetap bisa ditambahkan konsultasi dari halaman ini. Jika konsultasi ditambahkan bersama treatment, biaya konsultasi tetap Rp 0.",
        };
      }

      if (this.hasOriginalConsultation && !this.hasTreatment) {
        return {
          show: true,
          type: "info",
          title: "Konsultasi tanpa treatment",
          message: `Biaya ${this.consultationLabel} dihitung Rp ${this.formatNumber(this.consultationOriginalAmount)} jika pasien tidak mengambil treatment.`,
        };
      }

      return {
        show: false,
        type: "info",
        title: "",
        message: "",
      };
    },
    showOnlineMedicalInfo() {
      return this.hasOriginalConsultation && this.isOnlineConsultation;
    },

    onlineRegistrationClinicalInfo() {
      const data = this.onlineRegistration || {};
      const pregnantRaw = data.sedang_hamil_raw ?? data.sedang_hamil;
      const breastfeedingRaw = data.sedang_menyusui_raw ?? data.sedang_menyusui;

      const notes = [
        data.catatan_cs,
        data.catatan_awal,
        data.catatan_registrasi,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean);

      return {
        requestedDoctor:
          data.request_dokter_nama || data.request_dokter || null,
        complaint:
          data.keluhan_utama || data.keluhan || data.keluhan_awal || null,
        allergy: data.alergi || null,
        previousMedication:
          data.produk_obat_sebelumnya || data.produk_sebelumnya || null,
        pregnant: this.hasMedicalValue(pregnantRaw)
          ? this.normalizeMedicalYesNo(pregnantRaw)
          : null,
        breastfeeding: this.hasMedicalValue(breastfeedingRaw)
          ? this.normalizeMedicalYesNo(breastfeedingRaw)
          : null,
        note: Array.from(new Set(notes)).join(" • ") || null,
      };
    },

    hasOnlineRegistrationClinicalInfo() {
      const info = this.onlineRegistrationClinicalInfo;

      return [
        info.requestedDoctor,
        info.complaint,
        info.allergy,
        info.previousMedication,
        info.pregnant,
        info.breastfeeding,
        info.note,
      ].some((value) => this.hasMedicalValue(value));
    },

    onlineRegistrationPhotos() {
      const data = this.onlineRegistration || {};

      const photos = [
        this.normalizeOnlinePhoto(data.foto_kiri, "Foto Kiri", "foto_kiri"),
        this.normalizeOnlinePhoto(data.foto_depan, "Foto Depan", "foto_depan"),
        this.normalizeOnlinePhoto(data.foto_kanan, "Foto Kanan", "foto_kanan"),
        ...(Array.isArray(data.fotos)
          ? data.fotos.map((photo, index) => {
              const position = Number(photo?.posisi_foto || 0);

              const label =
                photo?.label ||
                (position === 1
                  ? "Foto Kiri"
                  : position === 2
                    ? "Foto Depan"
                    : position === 3
                      ? "Foto Kanan"
                      : `Foto ${index + 1}`);

              const key =
                position === 1
                  ? "foto_kiri"
                  : position === 2
                    ? "foto_depan"
                    : position === 3
                      ? "foto_kanan"
                      : `foto_${index + 1}`;

              return this.normalizeOnlinePhoto(photo, label, key);
            })
          : []),
      ].filter(Boolean);

      return photos
        .filter((photo) => photo.url)
        .filter((photo, index, list) => {
          const currentKey =
            photo.posisi_foto || photo.key || photo.url || index;

          return (
            list.findIndex((item, itemIndex) => {
              const itemKey =
                item.posisi_foto || item.key || item.url || itemIndex;

              return itemKey === currentKey;
            }) === index
          );
        })
        .sort(
          (a, b) => Number(a.posisi_foto || 99) - Number(b.posisi_foto || 99),
        );
    },
  },
  mounted() {
    this.fetchDetail();
  },

  methods: {
    async fetchDetail() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await antrianDokterService.getById(this.antrianId);
        const data = response?.data || response || {};

        this.registration = data;
        this.mapRegistration(data);
        await this.fetchRiwayatTransaksi(data);

        await this.loadReferenceOptions(data);
        this.syncSelectedSoapOptions();
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal memuat data proses antrian dokter.",
        );
      } finally {
        this.loading = false;
      }
    },

    async fetchRiwayatTransaksi(data = {}) {
      const pasienId = this.resolvePasienId(data);

      if (!pasienId) {
        this.mapRiwayat(data);
        return;
      }

      this.loadingRiwayatTransaksi = true;

      try {
        const response = await api.get(
          `/administrasi/pasien/${pasienId}/riwayat`,
          {
            params: {
              limit: 20,
            },
          },
        );

        const payload = response?.data?.data || response?.data || {};
        const rows = this.extractRiwayatRows(payload);
        const currentRegistrasiId = Number(
          data?.registrasi_id ||
            data?.antrian_dokter_id ||
            data?.id ||
            this.antrianId,
        );

        this.riwayatSummary = payload?.summary || null;
        this.riwayatTransaksi = rows
          .filter((row) => {
            const raw = this.getRiwayatRaw(row);
            const rowRegistrasiId = Number(raw?.registrasi_id || raw?.id || 0);

            return (
              !currentRegistrasiId || rowRegistrasiId !== currentRegistrasiId
            );
          })
          .slice(0, 10);
      } catch (error) {
        console.error("Gagal memuat riwayat transaksi pasien:", error);
        this.mapRiwayat(data);
      } finally {
        this.loadingRiwayatTransaksi = false;
      }
    },

    async loadReferenceOptions(data = {}) {
      const tokoId = this.resolveTokoId(data);

      if (!tokoId) {
        this.showSnackbar(
          "Toko aktif tidak ditemukan. Reference produk dan treatment tidak bisa dimuat.",
          "warning",
        );
      }

      this.loadingReference = true;

      try {
        const params = {
          toko_id: tokoId || undefined,
          limit: 100,
        };

        const [
          produkResult,
          treatmentResult,
          perawatResult,
          subjectiveResult,
          assessmentResult,
        ] = await Promise.allSettled([
          tokoId ? referenceService.produkByToko(params) : Promise.resolve([]),
          tokoId
            ? referenceService.treatmentByToko(params)
            : Promise.resolve([]),
          tokoId
            ? referenceService.nurseBeautician({
                toko_id: tokoId,
                tanggal: this.resolveServiceDate(data),
              })
            : Promise.resolve([]),
          referenceService.subjective({ limit: 200 }),
          referenceService.assessment({ limit: 200 }),
        ]);

        if (produkResult.status === "fulfilled") {
          const produkOptions = this.normalizeProdukOptions(
            this.extractRows(produkResult.value),
          );

          // Reference produk-by-toko adalah sumber stok final.
          // Taruh di depan agar mengalahkan option awal dari detail antrian
          // yang biasanya belum membawa stok_tersedia/stock_produk_toko_id.
          this.obatOptions = this.uniqueOptions([
            ...produkOptions,
            ...this.obatOptions,
          ]);

          this.hydrateObatRowsFromOptions();
        }

        if (treatmentResult.status === "fulfilled") {
          this.treatmentOptions = this.uniqueOptions([
            ...this.treatmentOptions,
            ...this.normalizeTreatmentOptions(
              this.extractRows(treatmentResult.value),
            ),
          ]);
        }

        if (perawatResult.status === "fulfilled") {
          const fetchedPerawatOptions = this.normalizePerawatOptions(
            this.extractRows(perawatResult.value),
          );

          this.perawatOptions = this.uniqueOptions([
            ...fetchedPerawatOptions,
            ...this.perawatOptions,
          ]);

          this.hydrateTreatmentPerawatFromOptions();
        } else {
          this.perawatOptions = [];
          this.showSnackbar(
            this.getErrorMessage(
              perawatResult.reason,
              "Gagal memuat nurse / beautician cabang aktif.",
            ),
            "warning",
          );
        }

        if (subjectiveResult.status === "fulfilled") {
          this.subjectiveOptions = this.uniqueOptions([
            ...this.subjectiveOptions,
            ...this.normalizeSubjectiveOptions(
              this.extractRows(subjectiveResult.value),
            ),
          ]);
        }

        if (assessmentResult.status === "fulfilled") {
          this.assessmentOptions = this.uniqueOptions([
            ...this.assessmentOptions,
            ...this.normalizeAssessmentOptions(
              this.extractRows(assessmentResult.value),
            ),
          ]);
        }
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(
            error,
            "Gagal memuat reference SOAP, produk, dan treatment.",
          ),
          "warning",
        );
      } finally {
        this.loadingReference = false;
      }
    },

    mapRegistration(data = {}) {
      const pasien = data?.pasien || {};
      const toko = data?.toko || {};
      const dokter =
        data?.dokter || data?.dokter_awal || data?.dokterAwal || {};
      const intake =
        data?.konsultasi_intake ||
        data?.konsultasiIntake ||
        data?.informasi_medis ||
        {};

      const tanggalKunjungan =
        data?.tanggal_kunjungan ||
        data?.tanggal ||
        data?.registered_at ||
        data?.created_at;

      const waktuKunjungan =
        data?.jam_kunjungan ||
        data?.waktu_kunjungan ||
        data?.jam ||
        data?.registered_at ||
        data?.created_at;

      this.patient = {
        kode_registrasi:
          data?.kode_registrasi ||
          data?.no_registrasi ||
          data?.registrasi_layanan?.kode_registrasi ||
          `REG-${data?.id || "-"}`,
        nama_pasien:
          pasien?.nama ||
          pasien?.nama_pasien ||
          data?.nama_pasien ||
          data?.pasien_nama ||
          "-",
        no_rm:
          pasien?.kode_pasien ||
          pasien?.no_rm ||
          data?.no_rm ||
          data?.kode_pasien ||
          "-",
        no_hp:
          pasien?.no_hp || pasien?.no_wa || data?.no_hp || data?.no_wa || "-",
        tanggal_waktu_kunjungan: this.formatDateTime(
          tanggalKunjungan,
          waktuKunjungan,
        ),
        dokter:
          dokter?.nama ||
          dokter?.nama_karyawan ||
          data?.nama_dokter ||
          data?.dokter_nama ||
          "-",
        klinik:
          toko?.nama ||
          toko?.nama_toko ||
          data?.toko_nama ||
          data?.klinik ||
          "-",
      };

      const onlinePayload =
        data?.online_registration || data?.onlineRegistration || {};
      const intakePayload =
        data?.konsultasi_intake || data?.konsultasiIntake || {};
      const onlinePhotos = this.pickFirstArray(
        onlinePayload?.fotos,
        onlinePayload?.photos,
        intakePayload?.fotos,
        intakePayload?.photos,
        data?.konsultasi_fotos,
        data?.konsultasiFotos,
      );

      this.onlineRegistration = {
        registrasi_id: onlinePayload?.registrasi_id || data?.id || null,
        request_dokter_id:
          onlinePayload?.request_dokter_id ??
          intakePayload?.request_dokter_id ??
          null,
        request_dokter_nama:
          onlinePayload?.request_dokter_nama ||
          onlinePayload?.request_dokter ||
          intakePayload?.request_dokter_nama ||
          null,
        request_dokter:
          onlinePayload?.request_dokter ||
          onlinePayload?.request_dokter_nama ||
          intakePayload?.request_dokter_nama ||
          null,
        alergi: onlinePayload?.alergi ?? intakePayload?.alergi ?? null,
        keluhan_utama:
          onlinePayload?.keluhan_utama ||
          onlinePayload?.keluhan ||
          intakePayload?.keluhan_utama ||
          intakePayload?.keluhan_awal ||
          null,
        keluhan:
          onlinePayload?.keluhan ||
          onlinePayload?.keluhan_utama ||
          intakePayload?.keluhan_utama ||
          intakePayload?.keluhan_awal ||
          null,
        keluhan_awal:
          onlinePayload?.keluhan_awal || intakePayload?.keluhan_awal || null,
        produk_obat_sebelumnya:
          onlinePayload?.produk_obat_sebelumnya ||
          onlinePayload?.produk_sebelumnya ||
          intakePayload?.produk_obat_sebelumnya ||
          null,
        produk_sebelumnya:
          onlinePayload?.produk_sebelumnya ||
          onlinePayload?.produk_obat_sebelumnya ||
          intakePayload?.produk_obat_sebelumnya ||
          null,
        sedang_hamil:
          onlinePayload?.sedang_hamil ??
          onlinePayload?.sedang_hamil_raw ??
          intakePayload?.sedang_hamil ??
          null,
        sedang_hamil_raw:
          onlinePayload?.sedang_hamil_raw ??
          intakePayload?.sedang_hamil ??
          onlinePayload?.sedang_hamil ??
          null,
        sedang_menyusui:
          onlinePayload?.sedang_menyusui ??
          onlinePayload?.sedang_menyusui_raw ??
          intakePayload?.sedang_menyusui ??
          null,
        sedang_menyusui_raw:
          onlinePayload?.sedang_menyusui_raw ??
          intakePayload?.sedang_menyusui ??
          onlinePayload?.sedang_menyusui ??
          null,
        catatan_cs:
          onlinePayload?.catatan_cs || intakePayload?.catatan_cs || null,
        catatan_awal:
          onlinePayload?.catatan_awal || intakePayload?.catatan_awal || null,
        catatan_registrasi:
          onlinePayload?.catatan_registrasi || data?.catatan_registrasi || null,
        jenis_konsultasi:
          onlinePayload?.jenis_konsultasi ??
          intakePayload?.jenis_konsultasi ??
          null,
        jenis_konsultasi_label:
          onlinePayload?.jenis_konsultasi_label ||
          data?.jenis_konsultasi_label ||
          null,
        channel_konsultasi:
          onlinePayload?.channel_konsultasi ?? data?.channel_konsultasi ?? null,
        channel_label:
          onlinePayload?.channel_label ||
          data?.channel_konsultasi_label ||
          data?.channel_label ||
          null,
        konsultasi_source_code:
          onlinePayload?.konsultasi_source_code ||
          data?.konsultasi_source_code ||
          null,
        konsultasi_source_name:
          onlinePayload?.konsultasi_source_name ||
          data?.konsultasi_source_name ||
          null,
        bukti_chat_konsultasi_online:
          onlinePayload?.bukti_chat_konsultasi_online ||
          data?.bukti_chat_konsultasi_online ||
          null,
        bukti_chat_konsultasi_online_url:
          onlinePayload?.bukti_chat_konsultasi_online_url ||
          data?.bukti_chat_konsultasi_online_url ||
          null,
        foto_kiri:
          onlinePayload?.foto_kiri || this.findPhotoByPosition(onlinePhotos, 1),
        foto_depan:
          onlinePayload?.foto_depan ||
          this.findPhotoByPosition(onlinePhotos, 2),
        foto_kanan:
          onlinePayload?.foto_kanan ||
          this.findPhotoByPosition(onlinePhotos, 3),
        fotos: onlinePhotos,
      };

      this.mapSoap(data?.dokter_soap || data?.dokterSoap || data?.soap || {});
      this.mapObat(data);
      this.mapTreatment(data);
      this.mapRiwayat(data);
    },

    mapSoap(soap = {}) {
      this.form.soap = {
        subjective_items: this.toMultiArray(
          soap?.subjective_items ||
            soap?.subjective_options ||
            soap?.subjective_list ||
            soap?.subjective,
        ),
        subjective_other:
          soap?.subjective_other ||
          soap?.subjective_lainnya ||
          soap?.lainnya_subjective ||
          "",
        objective: soap?.objective || soap?.o || "",
        assessment_items: this.toMultiArray(
          soap?.assessment_items ||
            soap?.assessment_options ||
            soap?.assessment_list ||
            soap?.assessment,
        ),
        assessment_other:
          soap?.assessment_other ||
          soap?.assessment_lainnya ||
          soap?.lainnya_assessment ||
          "",
        planning: soap?.planning || soap?.plan || soap?.p || "",
        next_date_konsultasi: this.toDateInput(
          soap?.next_date_konsultasi ||
            soap?.next_konsultasi ||
            soap?.next_date ||
            "",
        ),
      };
    },

    mapObat(data = {}) {
      const rows = this.extractFirstArray(data, [
        "penjualan_details",
        "penjualanDetails",
        "penjualan_detail",
        "penjualanDetail",
        "obat_items",
        "obatItems",
        "produk_items",
        "produkItems",
      ]);

      const detailOptions = this.normalizeProdukOptions(rows);

      this.obatOptions = this.uniqueOptions([
        ...this.obatOptions,
        ...detailOptions,
      ]);

      this.obatItems = rows.length
        ? rows.map((item) => {
            const produk = item?.produk || item?.master_produk || {};
            const produkToko = item?.produk_toko || item?.produkToko || {};

            const produkTokoId =
              item?.produk_toko_id ||
              item?.master_produk_toko_id ||
              produkToko?.id ||
              item?.produk_id ||
              item?.obat_id ||
              null;

            const produkId =
              item?.produk_id ||
              item?.obat_id ||
              item?.master_produk_id ||
              produk?.id ||
              null;

            const nama =
              item?.nama_produk ||
              item?.produk_nama ||
              item?.nama_obat ||
              produk?.nama ||
              produk?.nama_produk ||
              "-";

            const harga = this.toNumber(
              item?.harga ||
                item?.harga_jual ||
                item?.harga_produk ||
                produkToko?.harga_jual ||
                produkToko?.harga ||
                produk?.harga_jual ||
                produk?.harga ||
                0,
            );

            const stockRaw = this.resolveStockValue(item, produkToko, produk);
            const stokTerbaca = stockRaw !== null;
            const stokTersedia = stokTerbaca ? this.toNumber(stockRaw) : null;

            const jumlah = this.normalizeQtyByStock(
              this.toNumber(item?.jumlah || item?.qty || 1),
              stokTersedia,
              stokTerbaca,
            );

            const subtotal = this.toNumber(
              item?.subtotal ||
                item?.total ||
                item?.total_harga ||
                harga * jumlah,
            );

            return {
              produk_toko_id: produkTokoId,
              produk_id: produkId,
              nama,
              jumlah,
              harga,
              subtotal,
              tempat_produk_id:
                item?.tempat_produk_id ||
                produkToko?.tempat_produk_id ||
                produk?.tempat_produk_id ||
                null,
              stock_produk_toko_id:
                item?.stock_produk_toko_id ||
                item?.stock_id ||
                produkToko?.stock_produk_toko_id ||
                null,
              stok_tersedia: stokTersedia,
              stok_terbaca: stokTerbaca,
              sumber_stok: item?.sumber_stok || null,
              frekuensi_penggunaan:
                item?.frekuensi_penggunaan ||
                item?.frekuensi ||
                item?.aturan_pakai ||
                "",
              waktu_penggunaan:
                item?.waktu_penggunaan ||
                item?.waktu_pakai ||
                item?.penggunaan ||
                "",
            };
          })
        : [this.createEmptyObatRow()];

      this.hydrateObatRowsFromOptions();
    },

    mapTreatment(data = {}) {
      const rows = this.extractFirstArray(data, [
        "treatment_details",
        "treatmentDetails",
        "perawatan_details",
        "perawatanDetails",
        "perawatan_detail",
        "perawatanDetail",
        "treatment_items",
        "treatmentItems",
      ]);

      const fallbackPerawat =
        data?.perawat_awal || data?.perawatAwal || data?.perawat || {};

      const fallbackPerawatId =
        data?.perawat_awal_id ??
        data?.perawat_id ??
        fallbackPerawat?.id ??
        null;

      const fallbackPerawatNama =
        data?.nama_perawat ||
        data?.perawat_nama ||
        fallbackPerawat?.nama ||
        fallbackPerawat?.nama_karyawan ||
        "";

      const fallbackJabatan =
        fallbackPerawat?.jabatan || fallbackPerawat?.master_jabatan || {};

      const fallbackJabatanKode =
        data?.perawat_jabatan_kode ||
        fallbackPerawat?.kode_jabatan ||
        fallbackJabatan?.kode_jabatan ||
        "";

      const fallbackJabatanNama =
        data?.perawat_jabatan_nama ||
        fallbackPerawat?.nama_jabatan ||
        fallbackJabatan?.nama_jabatan ||
        "";

      const detailOptions = this.normalizeTreatmentOptions(rows);

      this.treatmentOptions = this.uniqueOptions([
        ...this.treatmentOptions,
        ...detailOptions,
      ]);

      this.treatmentItems = rows.length
        ? rows.map((item) => {
            const treatment = item?.treatment || item?.master_treatment || {};
            const treatmentToko =
              item?.treatment_toko || item?.treatmentToko || {};
            const perawat = item?.perawat || item?.nurse || {};
            const jabatan =
              perawat?.jabatan ||
              perawat?.master_jabatan ||
              item?.perawat_jabatan ||
              {};

            const treatmentTokoId =
              item?.treatment_toko_id ||
              item?.master_treatment_toko_id ||
              treatmentToko?.id ||
              item?.treatment_id ||
              null;

            const treatmentId =
              item?.treatment_id ||
              item?.master_treatment_id ||
              treatment?.id ||
              null;

            const nama =
              item?.nama_treatment ||
              item?.treatment_nama ||
              item?.nama_tindakan ||
              treatment?.nama ||
              treatment?.nama_treatment ||
              "-";

            const harga = this.toNumber(
              item?.harga ||
                item?.tarif ||
                item?.harga_treatment ||
                item?.treatment_harga ||
                treatmentToko?.harga ||
                treatmentToko?.tarif ||
                treatment?.harga ||
                0,
            );

            const jumlah = this.toNumber(item?.jumlah || item?.qty || 1);
            const total = this.toNumber(
              item?.total || item?.total_harga || harga * jumlah,
            );

            const perawatId =
              item?.perawat_id ??
              perawat?.id ??
              item?.karyawan_id ??
              fallbackPerawatId ??
              null;

            const perawatNama =
              item?.perawat_nama ||
              perawat?.nama ||
              perawat?.nama_karyawan ||
              item?.nama_perawat ||
              (perawatId &&
              String(perawatId) === String(fallbackPerawatId || "")
                ? fallbackPerawatNama
                : "");

            const perawatJabatanKode =
              item?.perawat_jabatan_kode ||
              item?.kode_jabatan ||
              perawat?.kode_jabatan ||
              jabatan?.kode_jabatan ||
              (perawatId &&
              String(perawatId) === String(fallbackPerawatId || "")
                ? fallbackJabatanKode
                : "");

            const perawatJabatanNama =
              item?.perawat_jabatan_nama ||
              item?.nama_jabatan ||
              perawat?.nama_jabatan ||
              jabatan?.nama_jabatan ||
              (perawatId &&
              String(perawatId) === String(fallbackPerawatId || "")
                ? fallbackJabatanNama
                : "");

            return {
              treatment_toko_id: treatmentTokoId,
              treatment_id: treatmentId,
              nama,
              jumlah,
              harga,
              total,
              perawat_id: perawatId,
              perawat_nama: perawatNama,
              perawat_jabatan_kode: perawatJabatanKode,
              perawat_jabatan_nama: perawatJabatanNama,
            };
          })
        : [this.createEmptyTreatmentRow()];

      this.mergeExistingPerawatOptions(data);
    },

    mapRiwayat(data = {}) {
      this.riwayatTransaksi = this.extractRiwayatRows(data);
    },

    extractRiwayatRows(payload = {}) {
      if (Array.isArray(payload)) {
        return payload;
      }

      const data = payload?.data || payload || {};

      return this.pickFirstArray(
        data?.riwayat,
        data?.riwayat_transaksi,
        data?.riwayatTransaksi,
        data?.history_transaksi,
        data?.historyTransaksi,
        data?.rows,
        data?.items,
        payload?.riwayat,
        payload?.riwayat_transaksi,
        payload?.riwayatTransaksi,
      );
    },

    createEmptyObatRow() {
      return {
        produk_toko_id: null,
        produk_id: null,
        nama: "",
        jumlah: 1,
        harga: 0,
        subtotal: 0,
        tempat_produk_id: null,
        stock_produk_toko_id: null,
        stok_tersedia: null,
        stok_terbaca: false,
        sumber_stok: null,
        frekuensi_penggunaan: "",
        waktu_penggunaan: "",
      };
    },

    createEmptyTreatmentRow() {
      return {
        treatment_toko_id: null,
        treatment_id: null,
        nama: "",
        jumlah: 1,
        harga: 0,
        total: 0,
        perawat_id: null,
        perawat_nama: "",
        perawat_jabatan_kode: "",
        perawat_jabatan_nama: "",
      };
    },

    addObatRow() {
      this.obatItems.push(this.createEmptyObatRow());
    },

    removeObatRow(index) {
      if (this.obatItems.length <= 1) {
        return;
      }

      this.obatItems.splice(index, 1);
    },

    addTreatmentRow() {
      this.treatmentItems.push(this.createEmptyTreatmentRow());
    },

    removeTreatmentRow(index) {
      if (this.treatmentItems.length <= 1) {
        return;
      }

      this.treatmentItems.splice(index, 1);
    },

    onSelectObat(index, value) {
      const row = this.obatItems[index];

      if (!row) {
        return;
      }

      const option = this.obatOptions.find(
        (item) => String(item.value) === String(value),
      );

      if (!option) {
        this.clearObatRow(row);
        return;
      }

      if (this.isObatOptionDisabled(option)) {
        this.showSnackbar(
          `Produk ${option.nama || option.label || "-"} tidak bisa dipilih karena stok kosong.`,
          "error",
        );
        this.clearObatRow(row);
        return;
      }

      this.applyObatOptionToRow(row, option);
      this.recalculateObat(index);
    },

    recalculateObat(index) {
      const row = this.obatItems[index];

      if (!row) {
        return;
      }

      let jumlah = Math.max(this.toNumber(row.jumlah), 1);

      if (row.stok_terbaca && jumlah > this.toNumber(row.stok_tersedia)) {
        jumlah = this.toNumber(row.stok_tersedia);
      }

      if (jumlah < 1) {
        jumlah = 1;
      }

      const harga = this.toNumber(row.harga);

      row.jumlah = jumlah;
      row.subtotal = jumlah * harga;
    },

    onSelectTreatment(index, value) {
      const row = this.treatmentItems[index];

      if (!row) {
        return;
      }

      const option = this.treatmentOptions.find(
        (item) => String(item.value) === String(value),
      );

      if (!option) {
        row.treatment_toko_id = null;
        row.treatment_id = null;
        row.nama = "";
        row.harga = 0;
        row.total = 0;
        row.perawat_id = null;
        row.perawat_nama = "";
        row.perawat_jabatan_kode = "";
        row.perawat_jabatan_nama = "";
        return;
      }

      row.treatment_toko_id = option.value;
      row.treatment_id = option.treatment_id || null;
      row.nama = option.label || "";
      row.harga = this.toNumber(option.harga);
      this.recalculateTreatment(index);
    },

    onSelectPerawat(index, value) {
      const row = this.treatmentItems[index];

      if (!row) {
        return;
      }

      const option = this.perawatOptions.find(
        (item) => String(item.value) === String(value),
      );

      row.perawat_id = option?.value || null;
      row.perawat_nama = option?.nama || "";
      row.perawat_jabatan_kode = option?.kode_jabatan || "";
      row.perawat_jabatan_nama = option?.nama_jabatan || "";
    },
    getPerawatRawOption(option) {
      return option?.raw || option || {};
    },

    getPerawatItemTitle(option) {
      const raw = this.getPerawatRawOption(option);

      return raw.nama || raw.nama_karyawan || raw.title || option?.title || "-";
    },

    getPerawatItemSubtitle(option) {
      const raw = this.getPerawatRawOption(option);

      return raw.kode_jabatan || raw.nama_jabatan || "";
    },
    normalizePerawatOptions(rows = []) {
      return rows
        .map((item) => {
          const value = item?.value || item?.id || item?.karyawan_id || null;
          const nama =
            item?.nama ||
            item?.nama_karyawan ||
            item?.perawat_nama ||
            item?.title ||
            "-";
          const kodeJabatan =
            item?.kode_jabatan ||
            item?.jabatan?.kode_jabatan ||
            item?.perawat_jabatan_kode ||
            "";
          const namaJabatan =
            item?.nama_jabatan ||
            item?.jabatan?.nama_jabatan ||
            item?.perawat_jabatan_nama ||
            "";

          return {
            ...item,
            value,
            nama,
            kode_jabatan: kodeJabatan,
            nama_jabatan: namaJabatan,
            title: namaJabatan ? `${nama} - ${namaJabatan}` : nama,
          };
        })
        .filter((item) => item.value);
    },

    mergeExistingPerawatOptions(data = {}) {
      const headerPerawat =
        data?.perawat_awal || data?.perawatAwal || data?.perawat || {};

      const headerPerawatId =
        data?.perawat_awal_id ?? data?.perawat_id ?? headerPerawat?.id ?? null;

      const headerPerawatNama =
        data?.nama_perawat ||
        data?.perawat_nama ||
        headerPerawat?.nama ||
        headerPerawat?.nama_karyawan ||
        "";

      const headerJabatan =
        headerPerawat?.jabatan || headerPerawat?.master_jabatan || {};

      const headerOption = headerPerawatId
        ? [
            {
              value: headerPerawatId,
              id: headerPerawatId,
              nama: headerPerawatNama || `Karyawan #${headerPerawatId}`,
              kode_jabatan:
                data?.perawat_jabatan_kode ||
                headerPerawat?.kode_jabatan ||
                headerJabatan?.kode_jabatan ||
                "",
              nama_jabatan:
                data?.perawat_jabatan_nama ||
                headerPerawat?.nama_jabatan ||
                headerJabatan?.nama_jabatan ||
                "",
            },
          ]
        : [];

      const selectedOptions = this.treatmentItems
        .filter((row) => row?.perawat_id)
        .map((row) => ({
          value: row.perawat_id,
          id: row.perawat_id,
          nama:
            row.perawat_nama ||
            (String(row.perawat_id) === String(headerPerawatId || "")
              ? headerPerawatNama
              : "") ||
            `Karyawan #${row.perawat_id}`,
          kode_jabatan: row.perawat_jabatan_kode || "",
          nama_jabatan: row.perawat_jabatan_nama || "",
        }));

      this.perawatOptions = this.uniqueOptions([
        ...this.perawatOptions,
        ...this.normalizePerawatOptions([...selectedOptions, ...headerOption]),
      ]);
    },

    hydrateTreatmentPerawatFromOptions() {
      this.treatmentItems.forEach((row) => {
        if (!row?.perawat_id) {
          return;
        }

        const option = this.perawatOptions.find(
          (item) => String(item.value) === String(row.perawat_id),
        );

        if (!option) {
          // Jangan hapus pelaksana existing hanya karena sudah tidak muncul
          // pada reference aktif. Snapshot lama tetap dibutuhkan untuk audit
          // dan atribusi insentif.
          return;
        }

        row.perawat_nama = option.nama || row.perawat_nama || "";
        row.perawat_jabatan_kode =
          option.kode_jabatan || row.perawat_jabatan_kode || "";
        row.perawat_jabatan_nama =
          option.nama_jabatan || row.perawat_jabatan_nama || "";
      });
    },

    recalculateTreatment(index) {
      const row = this.treatmentItems[index];

      if (!row) {
        return;
      }

      const jumlah = Math.max(this.toNumber(row.jumlah), 1);
      const harga = this.toNumber(row.harga);

      row.jumlah = jumlah;
      row.total = jumlah * harga;
    },

    normalizeSubjectiveOptions(rows = []) {
      return rows
        .map((item) => {
          const label =
            item?.label ||
            item?.nama ||
            item?.nama_subjective ||
            item?.subjective ||
            item?.keluhan ||
            item?.title ||
            item?.text ||
            item?.value ||
            "-";

          const value =
            item?.id ||
            item?.subjective_id ||
            item?.kode ||
            item?.value ||
            label;

          return {
            label,
            value,
            id: item?.id || item?.subjective_id || null,
          };
        })
        .filter((item) => item.value && item.label && item.label !== "-");
    },

    normalizeAssessmentOptions(rows = []) {
      return rows
        .map((item) => {
          const kode =
            item?.kode || item?.kode_icd || item?.icd_code || item?.code || "";

          const nama =
            item?.nama ||
            item?.nama_assessment ||
            item?.nama_diagnosa ||
            item?.diagnosa ||
            item?.description ||
            item?.title ||
            item?.text ||
            item?.value ||
            "";

          const label =
            kode && nama && !String(nama).startsWith(String(kode))
              ? `${kode} - ${nama}`
              : nama || kode || "-";

          const value =
            item?.id ||
            item?.assessment_id ||
            item?.diagnosa_id ||
            item?.kode ||
            item?.kode_icd ||
            item?.value ||
            label;

          return {
            label,
            value,
            id: item?.id || item?.assessment_id || item?.diagnosa_id || null,
            kode,
          };
        })
        .filter((item) => item.value && item.label && item.label !== "-");
    },

    normalizeProdukOptions(rows = []) {
      return rows
        .map((item) => {
          const produk = item?.produk || item?.master_produk || {};
          const produkToko = item?.produk_toko || item?.produkToko || {};

          const produkTokoId =
            item?.produk_toko_id ||
            item?.master_produk_toko_id ||
            item?.obat_toko_id ||
            item?.toko_produk_id ||
            produkToko?.id ||
            item?.id ||
            null;

          const produkId =
            item?.produk_id ||
            item?.obat_id ||
            item?.master_produk_id ||
            item?.product_id ||
            produk?.id ||
            null;

          const nama =
            item?.nama_produk ||
            item?.produk_nama ||
            item?.nama_obat ||
            item?.nama ||
            produk?.nama ||
            produk?.nama_produk ||
            produk?.nama_obat ||
            item?.label ||
            "-";

          const kode =
            item?.kode_accurate ||
            item?.kode ||
            item?.kode_produk ||
            item?.kode_obat ||
            produk?.kode_accurate ||
            produk?.kode ||
            "";

          const harga = this.toNumber(
            item?.harga ||
              item?.harga_jual ||
              item?.harga_produk ||
              produkToko?.harga_jual ||
              produkToko?.harga ||
              produk?.harga_jual ||
              produk?.harga ||
              0,
          );

          const stockRaw = this.resolveStockValue(item, produkToko, produk);
          const statusRaw = String(item?.status_stok || "").toLowerCase();
          const stokHabisFlag =
            Number(item?.is_stok_habis || 0) === 1 ||
            statusRaw.includes("habis") ||
            statusRaw.includes("kosong");

          const stokTerbaca = stockRaw !== null || stokHabisFlag;
          const stokTersedia = stokTerbaca
            ? this.toNumber(stockRaw !== null ? stockRaw : 0)
            : null;
          const stokAkhir = this.toNumber(
            item?.stok_akhir ??
              item?.stok_available ??
              item?.stok_tersedia ??
              produkToko?.stok_akhir ??
              produkToko?.stok_available ??
              produkToko?.stok_tersedia ??
              stokTersedia ??
              0,
          );
          const stokReserved = this.toNumber(
            item?.stok_reserved ??
              item?.reserved_stock ??
              produkToko?.stok_reserved ??
              produkToko?.reserved_stock ??
              0,
          );
          const stokMinimum = this.toNumber(
            item?.stok_minimum ??
              produkToko?.stok_minimum ??
              produk?.stok_minimum ??
              0,
          );

          const isStokHabis = stokTerbaca && this.toNumber(stokTersedia) <= 0;
          const isStokMinimum =
            Number(item?.is_stok_minimum || 0) === 1 ||
            (stokTerbaca &&
              this.toNumber(stokTersedia) > 0 &&
              stokMinimum > 0 &&
              this.toNumber(stokTersedia) <= stokMinimum);

          let statusStok = item?.status_stok || "TERSEDIA";

          if (!stokTerbaca) {
            statusStok = "STOK TIDAK TERBACA";
          } else if (isStokHabis) {
            statusStok = "HABIS";
          } else if (isStokMinimum) {
            statusStok = "STOK MINIMUM";
          }

          const disabled =
            item?.disabled === true ||
            Number(item?.disabled || 0) === 1 ||
            !stokTerbaca ||
            isStokHabis;

          const labelSuffix = !stokTerbaca
            ? " (stok tidak terbaca)"
            : isStokHabis
              ? " (kosong)"
              : "";

          const labelDropdown = `${nama}${labelSuffix}`;

          return {
            ...item,

            label: nama,
            label_dropdown: labelDropdown,
            label_simple: labelDropdown,
            text: labelDropdown,
            title: labelDropdown,
            value: produkTokoId || produkId,

            produk_toko_id: produkTokoId || null,
            produk_id: produkId,
            nama,
            kode,
            kode_accurate: item?.kode_accurate || kode,

            tempat_produk_id:
              item?.tempat_produk_id ||
              item?.master_tempat_produk_id ||
              produkToko?.tempat_produk_id ||
              produk?.tempat_produk_id ||
              null,
            stock_produk_toko_id:
              item?.stock_produk_toko_id ||
              item?.stock_id ||
              item?.stock_produk_id ||
              item?.stock_produk_toko?.id ||
              item?.stockProdukToko?.id ||
              null,
            nama_satuan:
              item?.nama_satuan ||
              item?.satuan ||
              produk?.satuan?.nama_satuan ||
              produk?.satuan?.nama ||
              null,
            harga,
            stok_tersedia: stokTersedia,
            stok_terbaca: stokTerbaca,
            stok_akhir: stokAkhir,
            stok_reserved: stokReserved,
            stok_minimum: stokMinimum,
            is_stok_habis: isStokHabis ? 1 : 0,
            is_stok_minimum: isStokMinimum ? 1 : 0,
            status_stok: statusStok,
            disabled,
            sumber_stok: item?.sumber_stok || produkToko?.sumber_stok || null,
            search_text: [kode, nama, statusStok, stokTersedia]
              .filter(
                (value) =>
                  value !== null && value !== undefined && value !== "",
              )
              .join(" "),
          };
        })
        .filter((item) => item.value);
    },

    normalizeTreatmentOptions(rows = []) {
      return rows
        .map((item) => {
          const treatment = item?.treatment || item?.master_treatment || {};
          const treatmentToko =
            item?.treatment_toko || item?.treatmentToko || {};

          const treatmentTokoId =
            item?.treatment_toko_id ||
            item?.master_treatment_toko_id ||
            item?.tindakan_toko_id ||
            treatmentToko?.id ||
            item?.id ||
            null;

          const treatmentId =
            item?.treatment_id ||
            item?.master_treatment_id ||
            item?.tindakan_id ||
            treatment?.id ||
            null;

          const label =
            item?.label ||
            item?.nama_treatment ||
            item?.treatment_nama ||
            item?.nama_tindakan ||
            item?.nama ||
            treatment?.nama ||
            treatment?.nama_treatment ||
            "-";

          const harga = this.toNumber(
            item?.harga ||
              item?.tarif ||
              item?.harga_treatment ||
              item?.treatment_harga ||
              treatmentToko?.harga ||
              treatmentToko?.tarif ||
              treatment?.harga ||
              0,
          );

          return {
            label,
            value: treatmentTokoId || treatmentId,
            treatment_id: treatmentId,
            harga,
          };
        })
        .filter((item) => item.value);
    },

    uniqueOptions(items = []) {
      const map = new Map();

      items.forEach((item) => {
        if (!item?.value) {
          return;
        }

        const key = String(item.value);

        if (!map.has(key)) {
          map.set(key, item);
        }
      });

      return Array.from(map.values());
    },

    syncSelectedSoapOptions() {
      this.form.soap.subjective_items.forEach((value) => {
        if (
          !this.subjectiveOptions.some(
            (item) => String(item.value) === String(value),
          )
        ) {
          this.subjectiveOptions.push({
            label: this.displayText(value),
            value,
            id: null,
          });
        }
      });

      this.form.soap.assessment_items.forEach((value) => {
        if (
          !this.assessmentOptions.some(
            (item) => String(item.value) === String(value),
          )
        ) {
          this.assessmentOptions.push({
            label: this.displayText(value),
            value,
            id: null,
            kode: "",
          });
        }
      });
    },

    getObatRawOption(option) {
      if (!option) {
        return {};
      }

      return option.raw || option || {};
    },

    getObatItemProps(option) {
      const row = this.getObatRawOption(option);

      return {
        disabled: this.isObatOptionDisabled(row),
        title:
          row.label_dropdown ||
          row.label_simple ||
          row.label ||
          row.nama ||
          "-",
      };
    },

    isObatOptionDisabled(option) {
      const row = this.getObatRawOption(option);

      return (
        row.disabled === true ||
        Number(row.disabled || 0) === 1 ||
        !row.stok_terbaca ||
        this.toNumber(row.stok_tersedia) <= 0
      );
    },

    filterObatOptions(value, query, item) {
      const keyword = String(query || "")
        .toLowerCase()
        .trim();

      if (!keyword) {
        return true;
      }

      const row = this.getObatRawOption(item);
      const searchable = [
        row.nama,
        row.label,
        row.label_dropdown,
        row.label_simple,
        row.kode,
        row.kode_accurate,
        row.kode_produk,
        row.status_stok,
        row.search_text,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    },

    clearObatRow(row) {
      if (!row) {
        return;
      }

      row.produk_toko_id = null;
      row.produk_id = null;
      row.nama = "";
      row.harga = 0;
      row.subtotal = 0;
      row.tempat_produk_id = null;
      row.stock_produk_toko_id = null;
      row.stok_tersedia = null;
      row.stok_terbaca = false;
      row.sumber_stok = null;
    },

    findObatOption(item = {}) {
      if (!item?.produk_toko_id && !item?.produk_id) {
        return null;
      }

      const produkTokoId = item?.produk_toko_id;
      const produkId = item?.produk_id;

      return (
        this.obatOptions.find(
          (option) =>
            produkTokoId && String(option.value) === String(produkTokoId),
        ) ||
        this.obatOptions.find(
          (option) =>
            produkTokoId &&
            String(option.produk_toko_id || option.value) ===
              String(produkTokoId),
        ) ||
        this.obatOptions.find(
          (option) => produkId && String(option.produk_id) === String(produkId),
        ) ||
        null
      );
    },

    applyObatOptionToRow(row, option) {
      if (!row || !option) {
        return;
      }

      row.produk_toko_id =
        option.produk_toko_id || option.value || row.produk_toko_id || null;
      row.produk_id = option.produk_id || row.produk_id || null;
      row.nama = option.nama || option.label || row.nama || "";
      row.harga = this.toNumber(option.harga || row.harga);
      row.tempat_produk_id =
        option.tempat_produk_id || row.tempat_produk_id || null;
      row.stock_produk_toko_id =
        option.stock_produk_toko_id || row.stock_produk_toko_id || null;
      row.stok_tersedia = option.stok_terbaca
        ? this.toNumber(option.stok_tersedia)
        : row.stok_tersedia;
      row.stok_terbaca = Boolean(option.stok_terbaca || row.stok_terbaca);
      row.sumber_stok = option.sumber_stok || row.sumber_stok || null;
    },

    hydrateObatRowFromOptions(row) {
      if (!row || (!row.produk_toko_id && !row.produk_id)) {
        return;
      }

      const option = this.findObatOption(row);

      if (option) {
        this.applyObatOptionToRow(row, option);
      }
    },

    hydrateObatRowsFromOptions() {
      this.obatItems.forEach((row, index) => {
        this.hydrateObatRowFromOptions(row);
        this.recalculateObat(index);
      });
    },

    getObatStockValidation() {
      const selectedRows = this.obatItems.filter(
        (item) => item.produk_toko_id || item.produk_id,
      );

      for (const item of selectedRows) {
        if (!item.stok_terbaca) {
          return {
            invalid: true,
            message: `Stok produk "${item.nama || "-"}" tidak terbaca. Data tidak bisa disimpan.`,
          };
        }

        if (this.toNumber(item.stok_tersedia) <= 0) {
          return {
            invalid: true,
            message: `Stok produk "${item.nama || "-"}" kosong.`,
          };
        }

        if (this.toNumber(item.jumlah) > this.toNumber(item.stok_tersedia)) {
          return {
            invalid: true,
            message: `Qty produk "${item.nama || "-"}" melebihi stok tersedia (${this.formatNumber(item.stok_tersedia)}).`,
          };
        }
      }

      const grouped = new Map();

      selectedRows.forEach((item) => {
        const key = item.produk_toko_id
          ? `pt-${item.produk_toko_id}`
          : `p-${item.produk_id}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            nama: item.nama,
            qty: 0,
            stok: this.toNumber(item.stok_tersedia),
          });
        }

        const group = grouped.get(key);
        group.qty += this.toNumber(item.jumlah);
      });

      for (const group of grouped.values()) {
        if (group.qty > group.stok) {
          return {
            invalid: true,
            message: `Total qty produk "${group.nama || "-"}" melebihi stok tersedia (${this.formatNumber(group.stok)}).`,
          };
        }
      }

      return {
        invalid: false,
        message: "",
      };
    },

    getObatStockError(item) {
      if (!item?.produk_toko_id && !item?.produk_id) {
        return "";
      }

      if (!item.stok_terbaca) {
        return "Stok tidak terbaca";
      }

      if (this.toNumber(item.stok_tersedia) <= 0) {
        return "Stok kosong";
      }

      if (this.toNumber(item.jumlah) > this.toNumber(item.stok_tersedia)) {
        return `Maksimal ${this.formatNumber(item.stok_tersedia)}`;
      }

      return "";
    },

    getStokText(item) {
      if (!item?.produk_toko_id && !item?.produk_id) {
        return "-";
      }

      if (!item.stok_terbaca) {
        return "Tidak terbaca";
      }

      return this.formatNumber(item.stok_tersedia);
    },

    resolveStockValue(item = {}, produkToko = {}, produk = {}) {
      const stockProdukToko =
        item?.stock_produk_toko || item?.stockProdukToko || {};
      const stockProduk = item?.stock_produk || item?.stockProduk || {};

      const candidates = [
        item?.stok_tersedia,
        item?.stok_available,
        item?.stok_bisa_dijual,
        item?.stok_akhir,
        item?.sisa_stok,
        item?.stock_available,
        item?.qty_available,
        item?.qty_stock,
        item?.available_stock,
        item?.available_qty,
        stockProdukToko?.stok_tersedia,
        stockProdukToko?.stok_available,
        stockProdukToko?.stok_bisa_dijual,
        stockProdukToko?.stok_akhir,
        stockProdukToko?.sisa_stok,
        stockProdukToko?.stock_available,
        stockProdukToko?.qty_available,
        stockProdukToko?.qty_stock,
        stockProdukToko?.available_stock,
        stockProdukToko?.available_qty,
        stockProduk?.stok_tersedia,
        stockProduk?.stok_available,
        stockProduk?.stok_bisa_dijual,
        stockProduk?.stok_akhir,
        stockProduk?.sisa_stok,
        stockProduk?.stock_available,
        stockProduk?.qty_available,
        stockProduk?.qty_stock,
        produkToko?.stok_tersedia,
        produkToko?.stok_available,
        produkToko?.stok_bisa_dijual,
        produkToko?.stok_akhir,
        produkToko?.sisa_stok,
        produkToko?.stock_available,
        produkToko?.qty_available,
        produkToko?.qty_stock,
        produkToko?.available_stock,
        produkToko?.available_qty,
        produk?.stok_tersedia,
        produk?.stok_available,
        produk?.stok_bisa_dijual,
        produk?.stok_akhir,
        produk?.sisa_stok,
        produk?.stock_available,
        produk?.qty_available,
        produk?.qty_stock,
      ];

      const found = candidates.find((value) => {
        return (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          typeof value !== "object"
        );
      });

      return found === undefined ? null : found;
    },

    normalizeQtyByStock(qty, stokTersedia, stokTerbaca) {
      let jumlah = Math.max(this.toNumber(qty), 1);

      if (stokTerbaca) {
        const stok = this.toNumber(stokTersedia);

        if (stok <= 0) {
          return 1;
        }

        if (jumlah > stok) {
          jumlah = stok;
        }
      }

      return jumlah;
    },

    buildPayload() {
      const stockValidation = this.getObatStockValidation();

      if (stockValidation.invalid) {
        throw new Error(stockValidation.message);
      }

      const subjectiveItems = this.resolveSelectedLabels(
        this.form.soap.subjective_items,
        this.subjectiveOptions,
      );

      const assessmentItems = this.resolveSelectedLabels(
        this.form.soap.assessment_items,
        this.assessmentOptions,
      );

      const subjectiveText = this.joinSoapText(
        subjectiveItems,
        this.form.soap.subjective_other,
      );

      const assessmentText = this.joinSoapText(
        assessmentItems,
        this.form.soap.assessment_other,
      );

      const treatmentWithoutPerformer = this.treatmentItems.findIndex(
        (item) =>
          (item.treatment_toko_id || item.treatment_id) && !item.perawat_id,
      );

      if (treatmentWithoutPerformer >= 0) {
        throw new Error(
          `Nurse / Beautician pada treatment baris ${
            treatmentWithoutPerformer + 1
          } wajib dipilih.`,
        );
      }

      return {
        antrian_dokter_id: this.antrianId,
        registrasi_layanan_id:
          this.registration?.registrasi_layanan_id ||
          this.registration?.registrasi_id ||
          this.registration?.id ||
          null,
        add_consultation: this.form.add_consultation ? 1 : 0,
        channel_konsultasi: this.getEffectiveChannelPayload(),
        konsultasi_source_code: this.hasOriginalConsultation
          ? this.consultationSourceCode || null
          : this.form.add_consultation
            ? "KONSULTASI_OFFLINE"
            : null,
        konsultasi_source_name: this.hasOriginalConsultation
          ? this.consultationLabel || null
          : this.form.add_consultation
            ? "Konsultasi Dokter"
            : null,
        jenis_konsultasi_label: this.hasOriginalConsultation
          ? this.consultationLabel || null
          : this.form.add_consultation
            ? "Konsultasi Dokter"
            : null,
        biaya_konsultasi: this.consultationFee,
        total_konsultasi: this.consultationFee,
        total_obat: this.totalObat,
        total_treatment: this.totalTreatment,
        grand_total: this.grandTotal,
        soap: {
          subjective: subjectiveText,
          subjective_items: subjectiveItems,
          subjective_ids: this.resolveSelectedIds(
            this.form.soap.subjective_items,
            this.subjectiveOptions,
          ),
          subjective_other: this.form.soap.subjective_other || null,
          objective: this.form.soap.objective || null,
          assessment: assessmentText,
          assessment_items: assessmentItems,
          assessment_ids: this.resolveSelectedIds(
            this.form.soap.assessment_items,
            this.assessmentOptions,
          ),
          assessment_other: this.form.soap.assessment_other || null,
          planning: this.form.soap.planning || null,
          plan: this.form.soap.planning || null,
          next_date_konsultasi: this.form.soap.next_date_konsultasi || null,
        },
        obat_items: this.obatItems
          .filter((item) => item.produk_toko_id || item.produk_id)
          .map((item) => {
            const instruksiPemakaian =
              [item.frekuensi_penggunaan, item.waktu_penggunaan]
                .filter(Boolean)
                .join(" - ") || null;

            return {
              produk_toko_id: item.produk_toko_id,
              produk_id: item.produk_id,
              nama: item.nama,
              jumlah: this.toNumber(item.jumlah),
              harga: this.toNumber(item.harga),
              subtotal: this.toNumber(item.subtotal),
              tempat_produk_id: item.tempat_produk_id || null,
              stock_produk_toko_id: item.stock_produk_toko_id || null,
              stok_tersedia: item.stok_tersedia,
              stok_terbaca: item.stok_terbaca ? 1 : 0,
              sumber_stok: item.sumber_stok || null,
              frekuensi_penggunaan: item.frekuensi_penggunaan || null,
              waktu_penggunaan: item.waktu_penggunaan || null,
              frekuensi: item.frekuensi_penggunaan || null,
              waktu_pakai: item.waktu_penggunaan || null,
              instruksi_pemakaian: instruksiPemakaian,
            };
          }),
        treatment_items: this.treatmentItems
          .filter((item) => item.treatment_toko_id || item.treatment_id)
          .map((item) => ({
            treatment_toko_id: item.treatment_toko_id,
            treatment_id: item.treatment_id,
            nama: item.nama,
            jumlah: this.toNumber(item.jumlah),
            harga: this.toNumber(item.harga),
            total: this.toNumber(item.total),
            perawat_id: item.perawat_id || null,
            perawat_nama: item.perawat_nama || "",
            perawat_jabatan_kode: item.perawat_jabatan_kode || "",
            perawat_jabatan_nama: item.perawat_jabatan_nama || "",
          })),
      };
    },

    getEffectiveChannelPayload() {
      if (this.hasOriginalConsultation) {
        return this.consultationChannel || null;
      }

      if (this.form.add_consultation) {
        return "offline";
      }

      return null;
    },

    resolveKasirProcessRouteId(result = {}) {
      const routeId =
        this.antrianId ||
        this.registration?.registrasi_layanan_id ||
        this.registration?.registrasi_id ||
        this.registration?.registrasi_kunjungan_id ||
        this.registration?.id ||
        result?.data?.registrasi_layanan_id ||
        result?.data?.registrasi_id ||
        result?.data?.registrasi_kunjungan_id ||
        result?.registrasi_layanan_id ||
        result?.registrasi_id ||
        result?.registrasi_kunjungan_id ||
        null;

      return routeId ? String(routeId) : null;
    },

    async submitForm() {
      this.submitLoading = true;

      try {
        this.hydrateObatRowsFromOptions();
        const stockValidation = this.getObatStockValidation();

        if (stockValidation.invalid) {
          this.showSnackbar(stockValidation.message, "error");
          return;
        }

        const payload = this.buildPayload();

        const response = await api.post(
          `/pelayanan-medis/antrian-dokter/${this.antrianId}/finish`,
          payload,
        );

        this.showSnackbar("Proses dokter berhasil disimpan.", "success");

        setTimeout(() => {
          this.$router.push("/kasir/daftar-pembayaran");
        }, 500);
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menyimpan proses dokter."),
          "error",
        );
      } finally {
        this.submitLoading = false;
      }
    },

    goToPengkajianAwal() {
      if (!this.pasienId) {
        this.showSnackbar("Data pasien belum tersedia.", "error");
        return;
      }

      this.$router.push({
        name: "Pengkajian Pasien",
        params: { id: this.pasienId },
      });
    },

    async openSkinAnalyzer() {
      if (!this.pasienId) {
        this.showSnackbar("Data pasien belum tersedia.", "error");
        return;
      }

      this.skinAnalyzerDialog = true;
      this.skinAnalyzerError = "";
      this.skinAnalyzerLink = "";

      await this.$nextTick();
      this.$refs.skinAnalyzerForm?.resetValidation();
      await this.loadSkinAnalyzer();
    },

    closeSkinAnalyzer() {
      if (this.skinAnalyzerSaving) {
        return;
      }

      this.skinAnalyzerDialog = false;
      this.skinAnalyzerError = "";
      this.skinAnalyzerLink = "";
      this.$refs.skinAnalyzerForm?.resetValidation();
    },

    async loadSkinAnalyzer() {
      if (!this.pasienId) {
        this.skinAnalyzerItems = [];
        return;
      }

      this.skinAnalyzerLoading = true;
      this.skinAnalyzerError = "";

      try {
        const response = await api.get(
          `/administrasi/pasien/${this.pasienId}/skin-analyzer`,
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message ||
              "Data Skin Analyzer pasien gagal diambil.",
          );
        }

        this.skinAnalyzerItems = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      } catch (error) {
        this.skinAnalyzerItems = [];
        this.skinAnalyzerError = this.getErrorMessage(
          error,
          "Data Skin Analyzer pasien gagal diambil.",
        );
      } finally {
        this.skinAnalyzerLoading = false;
      }
    },

    async saveSkinAnalyzer() {
      if (this.skinAnalyzerSaving || !this.pasienId) {
        return;
      }

      const validation = await this.$refs.skinAnalyzerForm?.validate();

      if (!validation?.valid) {
        this.showSnackbar("Periksa kembali link hasil Skin Analyzer.", "error");
        return;
      }

      this.skinAnalyzerSaving = true;
      this.skinAnalyzerError = "";

      try {
        const response = await api.post(
          `/administrasi/pasien/${this.pasienId}/skin-analyzer`,
          { url: String(this.skinAnalyzerLink || "").trim() },
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message ||
              "Link hasil Skin Analyzer gagal disimpan.",
          );
        }

        this.skinAnalyzerLink = "";
        this.$refs.skinAnalyzerForm?.resetValidation();
        await this.loadSkinAnalyzer();

        this.showSnackbar(
          response.data?.message ||
            "Link hasil Skin Analyzer berhasil disimpan.",
          "success",
        );
      } catch (error) {
        const message = this.getErrorMessage(
          error,
          "Link hasil Skin Analyzer gagal disimpan.",
        );

        this.skinAnalyzerError = message;
        this.showSnackbar(message, "error");
      } finally {
        this.skinAnalyzerSaving = false;
      }
    },

    openSkinAnalyzerResult(item) {
      const url = String(item?.url || "").trim();

      if (!/^https?:\/\/[^\s]+$/i.test(url)) {
        this.showSnackbar("Link hasil Skin Analyzer tidak valid.", "error");
        return;
      }

      const popup = window.open("", "_blank");

      if (!popup) {
        this.showSnackbar("Popup diblokir browser.", "error");
        return;
      }

      popup.opener = null;
      popup.location.href = url;
    },

    formatSkinAnalyzerDateTime(value) {
      if (!value) {
        return "-";
      }

      const date = new Date(String(value).replace(" ", "T"));

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    resolveServiceDate(data = {}) {
      const value =
        data?.tanggal_kunjungan ||
        data?.tanggal_registrasi ||
        data?.tanggal ||
        data?.registrasi_layanan?.tanggal_kunjungan ||
        this.registration?.tanggal_kunjungan ||
        this.registration?.tanggal ||
        new Date().toISOString().slice(0, 10);

      return String(value).slice(0, 10);
    },

    resolveTokoId(data = {}) {
      return (
        data?.toko_id ||
        data?.toko?.id ||
        data?.registrasi_layanan?.toko_id ||
        localStorage.getItem("selected_toko_id") ||
        null
      );
    },

    resolvePasienId(data = {}) {
      return (
        data?.pasien_id ||
        data?.pasien?.id ||
        data?.patient?.id ||
        data?.registrasi_layanan?.pasien_id ||
        this.registration?.pasien_id ||
        this.registration?.pasien?.id ||
        null
      );
    },

    resolveSelectedLabels(values = [], options = []) {
      if (!Array.isArray(values)) {
        return [];
      }

      return values
        .map((value) => {
          const option = options.find(
            (item) => String(item.value) === String(value),
          );

          return option?.label || this.displayText(value);
        })
        .filter((item) => item && item !== "-");
    },

    resolveSelectedIds(values = [], options = []) {
      if (!Array.isArray(values)) {
        return [];
      }

      return values
        .map((value) => {
          const option = options.find(
            (item) => String(item.value) === String(value),
          );

          return option?.id || null;
        })
        .filter(Boolean);
    },

    extractRows(payload) {
      if (Array.isArray(payload)) {
        return payload;
      }

      if (Array.isArray(payload?.data)) {
        return payload.data;
      }

      if (Array.isArray(payload?.data?.data)) {
        return payload.data.data;
      }

      if (Array.isArray(payload?.rows)) {
        return payload.rows;
      }

      if (Array.isArray(payload?.items)) {
        return payload.items;
      }

      return [];
    },

    extractFirstArray(source = {}, keys = []) {
      for (const key of keys) {
        if (Array.isArray(source?.[key])) {
          return source[key];
        }
      }

      return [];
    },

    getRiwayatRaw(item) {
      return item?.raw || item || {};
    },

    getRiwayatValue(item, keys = []) {
      const raw = this.getRiwayatRaw(item);

      for (const key of keys) {
        if (
          raw?.[key] !== null &&
          raw?.[key] !== undefined &&
          raw?.[key] !== ""
        ) {
          return this.displayText(raw[key]);
        }
      }

      return "-";
    },

    getRiwayatArray(item, keys = []) {
      const raw = this.getRiwayatRaw(item);

      for (const key of keys) {
        if (raw?.[key]) {
          return this.toArray(raw[key]);
        }
      }

      return [];
    },

    getNestedValue(source = {}, path = "") {
      if (!path) {
        return null;
      }

      return String(path)
        .split(".")
        .reduce((value, key) => {
          if (value === null || value === undefined) {
            return null;
          }

          return value?.[key];
        }, source);
    },

    pickRiwayatValue(item, paths = []) {
      const raw = this.getRiwayatRaw(item);

      for (const path of paths) {
        const value = this.getNestedValue(raw, path);

        if (value !== null && value !== undefined && value !== "") {
          return value;
        }
      }

      return null;
    },

    riwayatTanggal(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "tanggal",
          "tgl",
          "tanggal_transaksi",
          "tanggal_kunjungan",
          "registered_at",
        ]),
      );
    },

    riwayatWaktu(item) {
      return this.displayText(
        this.pickRiwayatValue(item, ["waktu", "jam", "jam_kunjungan"]),
      );
    },

    riwayatKodeRegistrasi(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "kode_registrasi",
          "nomor_antrian",
          "no_registrasi",
        ]),
      );
    },

    riwayatDokterName(item) {
      return this.displayText(
        this.pickRiwayatValue(item, ["dokter.nama", "dokter", "nama_dokter"]),
      );
    },

    riwayatPerawatName(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "perawat.nama",
          "perawat",
          "nama_perawat",
        ]),
      );
    },

    riwayatTokoName(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "toko.nama_toko",
          "toko.nama",
          "klinik",
          "cabang",
        ]),
      );
    },

    riwayatChannelLabel(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "konsultasi_source_name",
          "channel_label",
          "channel_konsultasi_label",
          "layanan.label",
          "layanan_label",
        ]),
      );
    },

    riwayatInvoiceNo(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "pembayaran.no_invoice",
          "no_invoice",
          "transaksi",
          "faktur",
          "no_transaksi",
        ]),
      );
    },

    riwayatJenisTransaksi(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "pembayaran.jenis_transaksi_text",
          "jenis_transaksi_text",
          "jenis_transaksi",
        ]),
      );
    },

    riwayatGrandTotal(item) {
      return this.toNumber(
        this.pickRiwayatValue(item, [
          "pembayaran.grand_total",
          "grand_total",
          "total",
          "nominal",
        ]),
      );
    },

    riwayatStatusText(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "status.text",
          "status.invoice_text",
          "status.registrasi_text",
          "status_text",
          "status",
        ]),
      );
    },

    riwayatStatusColor(item) {
      return (
        this.pickRiwayatValue(item, ["status.color", "status_color"]) ||
        "primary"
      );
    },

    riwayatLayananLabels(item) {
      const layanan = this.pickRiwayatValue(item, ["layanan"]);

      if (Array.isArray(layanan)) {
        return layanan
          .map((row) => this.displayText(row))
          .filter((row) => row !== "-");
      }

      if (layanan && typeof layanan === "object") {
        return Object.values(layanan)
          .filter(Boolean)
          .map((row) => this.displayText(row))
          .filter((row) => row !== "-");
      }

      if (layanan) {
        return [this.displayText(layanan)].filter((row) => row !== "-");
      }

      return [];
    },

    riwayatItems(item, types = []) {
      const raw = this.getRiwayatRaw(item);
      const rows = this.pickFirstArray(
        raw?.items,
        raw?.invoice_items,
        raw?.pembayaran_items,
        raw?.details,
      );

      if (!types.length) {
        return rows;
      }

      return rows.filter((row) => {
        const itemTypeNumber = Number(row?.item_type || 0);
        const itemTypeText = String(
          row?.item_type_text ||
            row?.jenis_item_text ||
            row?.jenis_item ||
            row?.type ||
            row?.kategori ||
            "",
        ).toLowerCase();

        const sourceTypeText = String(
          row?.source_type_text ||
            row?.source_type ||
            row?.accurate_source_type ||
            "",
        ).toLowerCase();

        return types.some((allowedType) => {
          const allowed = String(allowedType).toLowerCase();

          if (["treatment", "perawatan"].includes(allowed)) {
            return (
              itemTypeNumber === 2 ||
              itemTypeNumber === 4 ||
              itemTypeText.includes("treatment") ||
              itemTypeText.includes("perawatan") ||
              sourceTypeText.includes("treatment") ||
              sourceTypeText.includes("perawatan")
            );
          }

          if (["produk", "obat", "penjualan"].includes(allowed)) {
            return (
              itemTypeNumber === 3 ||
              itemTypeText.includes("produk") ||
              itemTypeText.includes("obat") ||
              itemTypeText.includes("penjualan") ||
              sourceTypeText.includes("produk") ||
              sourceTypeText.includes("obat") ||
              sourceTypeText.includes("penjualan")
            );
          }

          return (
            itemTypeText.includes(allowed) || sourceTypeText.includes(allowed)
          );
        });
      });
    },

    normalizeRiwayatItem(row = {}, index = 0) {
      const itemType = this.toNumber(
        row?.item_type ?? row?.jenis_item ?? row?.type ?? 0,
      );

      const diskonTipe = this.toNumber(row?.diskon_tipe ?? 0);
      const status = this.toNumber(row?.status ?? 1);

      return {
        key:
          row?.id ||
          row?.item_id ||
          `${row?.nama || row?.nama_item || index}-${index}`,
        item_type: itemType,
        item_type_text: this.displayText(
          row?.item_type_text ||
            row?.jenis_item_text ||
            this.riwayatItemTypeText(itemType),
        ),
        kode_item: this.displayText(
          row?.kode_item ||
            row?.kode_produk ||
            row?.kode_treatment ||
            row?.kode ||
            "",
        ),
        nama:
          row?.nama_item ||
          row?.nama_produk ||
          row?.nama_treatment ||
          row?.nama ||
          row?.description ||
          "-",
        satuan: this.displayText(row?.satuan || row?.nama_satuan || ""),
        qty: this.toNumber(row?.jumlah ?? row?.qty ?? row?.quantity ?? 1),
        harga: this.toNumber(
          row?.harga ?? row?.harga_satuan ?? row?.unit_price ?? 0,
        ),
        diskon_tipe: diskonTipe,
        diskon_nilai: this.toNumber(row?.diskon_nilai ?? 0),
        diskon_amount: this.toNumber(row?.diskon_amount ?? 0),
        diskon_referral: this.toNumber(row?.diskon_referral ?? 0),
        diskon_subtotal_amount: this.toNumber(row?.diskon_subtotal_amount ?? 0),
        subtotal: this.toNumber(
          row?.subtotal_after_diskon_subtotal ??
            row?.subtotal ??
            row?.total_harga ??
            row?.total ??
            0,
        ),
        frekuensi:
          row?.frekuensi || row?.frekuensi_penggunaan || row?.frequency || "",
        waktu_pakai:
          row?.waktu_pakai || row?.waktu_penggunaan || row?.waktu || "",
        instruksi_pemakaian:
          row?.instruksi_pemakaian ||
          row?.aturan_pakai ||
          row?.cara_pakai ||
          row?.catatan_pemakaian ||
          "",
        expired_at: row?.expired_at ? this.formatDate(row.expired_at) : "-",
        status,
        status_text: this.displayText(
          row?.status_text || (status === 9 ? "Batal" : "Aktif"),
        ),
        is_saran_dokter: this.isTrue(row?.is_saran_dokter),
      };
    },

    riwayatItemTypeText(itemType) {
      const labels = {
        1: "Konsultasi",
        2: "Treatment",
        3: "Obat / Produk",
        4: "Deposit Treatment",
        5: "Layanan Non-Billing",
      };

      return labels[this.toNumber(itemType)] || "Item Lainnya";
    },

    riwayatTreatmentItems(item) {
      const rows = this.riwayatItems(item, ["treatment", "perawatan"]);

      return rows.map((row, index) => this.normalizeRiwayatItem(row, index));
    },

    riwayatProdukItems(item) {
      const rows = this.riwayatItems(item, ["produk", "obat", "penjualan"]);

      return rows.map((row, index) => this.normalizeRiwayatItem(row, index));
    },

    riwayatOtherItems(item) {
      const rows = this.riwayatItems(item).filter((row) => {
        const itemTypeNumber = this.toNumber(row?.item_type ?? 0);
        const itemTypeText = String(
          row?.item_type_text ||
            row?.jenis_item_text ||
            row?.jenis_item ||
            row?.type ||
            row?.kategori ||
            "",
        ).toLowerCase();
        const sourceTypeText = String(
          row?.source_type_text ||
            row?.source_type ||
            row?.accurate_source_type ||
            "",
        ).toLowerCase();

        const isTreatment =
          [2, 4].includes(itemTypeNumber) ||
          itemTypeText.includes("treatment") ||
          itemTypeText.includes("perawatan") ||
          sourceTypeText.includes("treatment") ||
          sourceTypeText.includes("perawatan");

        const isProduk =
          itemTypeNumber === 3 ||
          itemTypeText.includes("produk") ||
          itemTypeText.includes("obat") ||
          itemTypeText.includes("penjualan") ||
          sourceTypeText.includes("produk") ||
          sourceTypeText.includes("obat") ||
          sourceTypeText.includes("penjualan");

        return !isTreatment && !isProduk;
      });

      return rows.map((row, index) => this.normalizeRiwayatItem(row, index));
    },

    riwayatDetailGroups(item) {
      return [
        {
          key: "treatment",
          label: "Treatment",
          icon: "mdi-face-woman-shimmer-outline",
          color: "deep-purple",
          items: this.riwayatTreatmentItems(item),
        },
        {
          key: "produk",
          label: "Obat / Produk",
          icon: "mdi-pill",
          color: "primary",
          items: this.riwayatProdukItems(item),
        },
        {
          key: "lainnya",
          label: "Konsultasi / Layanan Lain",
          icon: "mdi-stethoscope",
          color: "success",
          items: this.riwayatOtherItems(item),
        },
      ].filter((group) => group.items.length > 0);
    },

    riwayatSequence(index) {
      const number = Math.max(this.riwayatTransaksi.length - index, 1);

      return String(number).padStart(3, "0");
    },

    riwayatItemGross(row = {}) {
      return this.toNumber(row?.harga) * this.toNumber(row?.qty);
    },

    riwayatDiskonMeta(row = {}) {
      const type = this.toNumber(row?.diskon_tipe);
      const value = this.toNumber(row?.diskon_nilai);

      if (type === 1) {
        return `${this.formatNumber(value)}%`;
      }

      if (type === 2) {
        return `Rp ${this.formatNumber(value)}`;
      }

      return "";
    },

    riwayatHasMedicationUsage(row = {}) {
      return Boolean(
        row?.frekuensi || row?.waktu_pakai || row?.instruksi_pemakaian,
      );
    },

    riwayatCpptCount(item) {
      const cppt = this.pickRiwayatValue(item, ["cppt"]);

      return Array.isArray(cppt) ? cppt.length : 0;
    },

    riwayatCatatan(item) {
      return this.displayText(
        this.pickRiwayatValue(item, [
          "catatan",
          "catatan_registrasi",
          "intake.keluhan_utama",
          "intake.keluhan_awal",
          "notes",
          "keterangan",
        ]),
      );
    },

    riwayatSoapSummary(item) {
      const soap = this.pickRiwayatValue(item, ["soap"]);

      if (!soap || typeof soap !== "object") {
        return "-";
      }

      const values = [
        soap?.subjective_text,
        soap?.subjective,
        soap?.objective,
        soap?.assessment_text,
        soap?.assessment,
        soap?.planning,
        soap?.plan,
      ]
        .map((value) => this.displayText(value))
        .filter((value) => value && value !== "-");

      return values.length ? values.slice(0, 2).join(" | ") : "-";
    },

    toArray(value) {
      if (!value) {
        return [];
      }

      if (Array.isArray(value)) {
        return value.filter(
          (item) => item !== null && item !== undefined && item !== "",
        );
      }

      return [value];
    },

    toMultiArray(value) {
      if (!value) {
        return [];
      }

      if (Array.isArray(value)) {
        return value
          .map((item) => this.extractValue(item))
          .filter((item) => item !== null && item !== undefined && item !== "");
      }

      if (typeof value === "string") {
        return value
          .split(/[|,;]/)
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return [this.extractValue(value)].filter(
        (item) => item !== null && item !== undefined && item !== "",
      );
    },

    extractValue(value) {
      if (value === null || value === undefined || value === "") {
        return "";
      }

      if (typeof value === "string" || typeof value === "number") {
        return value;
      }

      if (typeof value === "object") {
        return (
          value.id ||
          value.value ||
          value.subjective_id ||
          value.assessment_id ||
          value.diagnosa_id ||
          value.kode ||
          value.kode_icd ||
          value.nama ||
          value.label ||
          value.title ||
          value.text ||
          ""
        );
      }

      return String(value);
    },

    displayText(value) {
      if (value === null || value === undefined || value === "") {
        return "-";
      }

      if (typeof value === "string" || typeof value === "number") {
        return String(value);
      }

      if (Array.isArray(value)) {
        return value.map((item) => this.displayText(item)).join(", ");
      }

      if (typeof value === "object") {
        return (
          value.nama ||
          value.nama_treatment ||
          value.nama_produk ||
          value.nama_obat ||
          value.nama_perawat ||
          value.nama_dokter ||
          value.nama_subjective ||
          value.nama_assessment ||
          value.nama_diagnosa ||
          value.diagnosa ||
          value.description ||
          value.label ||
          value.title ||
          value.value ||
          value.faktur ||
          value.kode ||
          "-"
        );
      }

      return String(value);
    },

    joinSoapText(items = [], other = "") {
      const values = Array.isArray(items) ? [...items] : [];

      if (other) {
        values.push(other);
      }

      return values.filter(Boolean).join(", ");
    },

    isTrue(value) {
      return value === true || value === 1 || value === "1" || value === "true";
    },

    normalizeText(value) {
      if (value === null || value === undefined) {
        return "";
      }

      return String(value).trim().toLowerCase();
    },

    toNumber(value) {
      const number = Number(value || 0);

      return Number.isNaN(number) ? 0 : number;
    },

    formatNumber(value) {
      const number = this.toNumber(value);

      return number.toLocaleString("id-ID");
    },

    formatDate(value) {
      if (!value) {
        return "-";
      }

      const raw = String(value);

      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const [year, month, day] = raw.substring(0, 10).split("-");

        return new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
        ).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return raw;
      }

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatTime(value) {
      if (!value) {
        return "-";
      }

      const raw = String(value);
      const match = raw.match(/(\d{2}):(\d{2})/);

      if (match) {
        return `${match[1]}.${match[2]}`;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "-";
      }

      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");

      return `${hour}.${minute}`;
    },

    formatDateTime(dateValue, timeValue) {
      const dateText = this.formatDate(dateValue);
      const timeText = this.formatTime(timeValue);

      if (dateText === "-" && timeText === "-") {
        return "-";
      }

      if (dateText === "-") {
        return `Jam ${timeText}`;
      }

      if (timeText === "-") {
        return dateText;
      }

      return `${dateText}, Jam ${timeText}`;
    },

    toDateInput(value) {
      if (!value) {
        return "";
      }

      const raw = String(value);

      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        return raw.substring(0, 10);
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    getErrorMessage(error, fallback) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
      );
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    pickFirstArray(...values) {
      return (
        values.find((value) => Array.isArray(value) && value.length > 0) || []
      );
    },

    findPhotoByPosition(photos, position) {
      if (!Array.isArray(photos)) {
        return null;
      }

      return (
        photos.find((photo) => Number(photo?.posisi_foto || 0) === position) ||
        null
      );
    },

    hasMedicalValue(value) {
      return value !== null && value !== undefined && value !== "";
    },

    displayMedicalText(value) {
      if (value === null || value === undefined || value === "") {
        return "-";
      }

      return value;
    },

    normalizeMedicalYesNo(value) {
      if (value === null || value === undefined || value === "") {
        return "-";
      }

      const normalized = String(value).toLowerCase().trim();

      if (
        value === true ||
        value === 1 ||
        ["1", "true", "ya", "yes"].includes(normalized)
      ) {
        return "Ya";
      }

      if (
        value === false ||
        value === 0 ||
        ["0", "false", "tidak", "no"].includes(normalized)
      ) {
        return "Tidak";
      }

      return value;
    },

    medicalConditionColor(value) {
      const normalized = this.normalizeText(value);

      if (normalized === "ya") {
        return "warning";
      }

      if (normalized === "tidak") {
        return "success";
      }

      return "grey";
    },

    normalizeOnlinePhoto(photo, label, key) {
      if (!photo) {
        return null;
      }

      if (typeof photo === "string") {
        return {
          key,
          label,
          url: this.resolvePhotoUrl(photo),
          file_name: "",
          posisi_foto: null,
        };
      }

      const rawUrl = photo.file_url || photo.url || photo.file_path || "";

      return {
        key: photo.key || key,
        label: photo.label || label,
        url: this.resolvePhotoUrl(rawUrl),
        file_name: photo.file_name || "",
        posisi_foto: photo.posisi_foto || null,
      };
    },

    resolvePhotoUrl(value) {
      if (!value) {
        return "";
      }

      const url = String(value).trim();

      if (/^https?:\/\//i.test(url) || url.startsWith("blob:")) {
        return url;
      }

      const cleanUrl = url.replace(/^public\//, "");

      const apiBaseUrl =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_APP_API_URL ||
        import.meta.env.VITE_BASE_API_URL ||
        "";

      let backendOrigin = "";

      if (apiBaseUrl) {
        backendOrigin = apiBaseUrl.replace(/\/api\/?$/i, "").replace(/\/$/, "");
      } else if (window.location.port === "5173") {
        backendOrigin = `${window.location.protocol}//${window.location.hostname}:8000`;
      } else {
        backendOrigin = window.location.origin;
      }

      if (cleanUrl.startsWith("/storage/")) {
        return `${backendOrigin}${cleanUrl}`;
      }

      if (cleanUrl.startsWith("storage/")) {
        return `${backendOrigin}/${cleanUrl}`;
      }

      if (cleanUrl.startsWith("/")) {
        return `${backendOrigin}${cleanUrl}`;
      }

      return `${backendOrigin}/storage/${cleanUrl}`;
    },
  },
};
</script>

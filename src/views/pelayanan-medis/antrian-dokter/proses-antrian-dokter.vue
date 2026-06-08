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
              @click="goToPengkajianAwal"
            >
              Pengkajian Awal
            </v-btn>

            <v-btn
              color="deep-purple"
              variant="tonal"
              size="small"
              prepend-icon="mdi-face-recognition"
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
            <v-card-text class="pa-4 pb-2">
              <div
                class="d-flex align-start justify-space-between flex-wrap ga-3"
              >
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Informasi Medis Pendaftaran
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Data awal dari pendaftaran konsultasi online.
                  </div>
                </div>

                <v-chip color="primary" variant="tonal" size="small">
                  {{
                    displayMedicalText(
                      onlineRegistration.jenis_konsultasi_label ||
                        onlineRegistration.konsultasi_source_name ||
                        onlineRegistration.source_name ||
                        onlineRegistration.channel_label ||
                        "Konsultasi Online",
                    )
                  }}
                </v-chip>
              </div>
            </v-card-text>

            <v-divider />

            <v-card-text class="pa-4">
              <v-row dense>
                <v-col
                  v-for="item in onlineRegistrationItems"
                  :key="item.key"
                  cols="12"
                  :md="item.cols || 6"
                >
                  <v-sheet border rounded="lg" class="pa-3 h-100">
                    <div class="text-caption text-medium-emphasis mb-1">
                      {{ item.label }}
                    </div>

                    <div class="text-body-2 font-weight-medium">
                      {{ displayMedicalText(item.value) }}
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>

              <template v-if="onlineRegistrationPhotos.length">
                <v-divider class="my-4" />

                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3"
                >
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">
                      Dokumentasi Foto Pendaftaran
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Foto kiri, depan, dan kanan dari pendaftaran konsultasi
                      online.
                    </div>
                  </div>

                  <v-chip color="success" variant="tonal" size="small">
                    {{ onlineRegistrationPhotos.length }} Foto
                  </v-chip>
                </div>

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
                          v-if="photo.url"
                          :src="photo.url"
                          height="180"
                          cover
                          rounded="lg"
                          class="border"
                        />

                        <v-sheet
                          v-else
                          border
                          rounded="lg"
                          class="pa-6 text-center text-medium-emphasis"
                        >
                          <v-icon size="32" class="mb-2">
                            mdi-image-off-outline
                          </v-icon>
                          <div class="text-caption">Foto belum tersedia</div>
                        </v-sheet>

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
              </template>

              <v-alert
                v-else-if="
                  Number(onlineRegistration.channel_konsultasi || 0) === 2
                "
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-4"
              >
                Foto pendaftaran belum tersedia pada payload detail antrian
                dokter.
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

          <div class="mb-6">
            <v-divider class="mb-5" />

            <div
              class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3"
            >
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Riwayat Transaksi Pasien
                </div>

                <div class="text-caption text-medium-emphasis">
                  Riwayat pelayanan, transaksi, treatment, obat, SOAP, dan CPPT
                  pasien sebelumnya.
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

            <v-data-table
              :headers="riwayatHeaders"
              :items="riwayatTransaksi"
              :loading="loadingRiwayatTransaksi"
              density="comfortable"
              item-value="registrasi_id"
              :hide-default-footer="riwayatTransaksi.length <= 5"
              class="border"
            >
              <template #loading>
                <div class="pa-6 text-center text-medium-emphasis">
                  <v-progress-circular indeterminate size="28" class="mb-3" />
                  <div class="text-body-2">
                    Memuat riwayat transaksi pasien...
                  </div>
                </div>
              </template>

              <template #no-data>
                <div
                  class="d-flex flex-column align-center justify-center text-center pa-8"
                >
                  <v-avatar
                    color="primary"
                    variant="tonal"
                    size="56"
                    class="mb-3"
                  >
                    <v-icon size="30">
                      mdi-clipboard-text-clock-outline
                    </v-icon>
                  </v-avatar>

                  <div class="text-subtitle-2 font-weight-bold mb-1">
                    Riwayat transaksi belum tersedia
                  </div>

                  <div class="text-body-2 text-medium-emphasis">
                    Data akan muncul setelah pasien memiliki registrasi,
                    pelayanan, atau transaksi yang tersimpan.
                  </div>
                </div>
              </template>

              <template #item.tgl="{ item }">
                <div class="py-1">
                  <div class="text-body-2 font-weight-medium">
                    {{ riwayatTanggal(item) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ riwayatWaktu(item) }}
                  </div>
                  <div
                    class="text-caption text-primary font-weight-medium mt-1"
                  >
                    {{ riwayatKodeRegistrasi(item) }}
                  </div>
                </div>
              </template>

              <template #item.dokter="{ item }">
                <div class="py-1">
                  <div class="text-body-2 font-weight-medium">
                    {{ riwayatDokterName(item) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Perawat: {{ riwayatPerawatName(item) }}
                  </div>
                </div>
              </template>

              <template #item.tindakan_perawat="{ item }">
                <div class="py-1">
                  <div
                    v-if="riwayatTreatmentItems(item).length"
                    class="d-flex flex-column ga-1"
                  >
                    <div
                      v-for="row in riwayatTreatmentItems(item)"
                      :key="row.key"
                      class="text-body-2"
                    >
                      <span class="font-weight-medium">{{ row.nama }}</span>
                      <span class="text-medium-emphasis">
                        x {{ formatNumber(row.qty) }}
                      </span>
                    </div>
                  </div>

                  <span v-else class="text-body-2 text-medium-emphasis">-</span>

                  <div
                    v-if="riwayatLayananLabels(item).length"
                    class="d-flex flex-wrap ga-1 mt-2"
                  >
                    <v-chip
                      v-for="label in riwayatLayananLabels(item)"
                      :key="label"
                      size="x-small"
                      color="info"
                      variant="tonal"
                    >
                      {{ label }}
                    </v-chip>
                  </div>
                </div>
              </template>

              <template #item.obat="{ item }">
                <div
                  v-if="riwayatProdukItems(item).length"
                  class="d-flex flex-column ga-2 py-1"
                >
                  <div
                    v-for="row in riwayatProdukItems(item)"
                    :key="row.key"
                    class="text-body-2"
                  >
                    <div>
                      <span class="font-weight-medium">{{ row.nama }}</span>
                      <span class="text-medium-emphasis">
                        x {{ formatNumber(row.qty) }}
                      </span>
                    </div>

                    <div
                      v-if="
                        row.frekuensi ||
                        row.waktu_pakai ||
                        row.instruksi_pemakaian
                      "
                      class="text-caption text-medium-emphasis mt-1"
                    >
                      <span v-if="row.frekuensi">{{ row.frekuensi }}</span>
                      <span v-if="row.frekuensi && row.waktu_pakai"> • </span>
                      <span v-if="row.waktu_pakai">{{ row.waktu_pakai }}</span>
                      <span
                        v-if="
                          (row.frekuensi || row.waktu_pakai) &&
                          row.instruksi_pemakaian
                        "
                      >
                        •
                      </span>
                      <span v-if="row.instruksi_pemakaian">
                        {{ row.instruksi_pemakaian }}
                      </span>
                    </div>
                  </div>
                </div>

                <span v-else class="text-body-2 text-medium-emphasis">-</span>
              </template>

              <template #item.catatan="{ item }">
                <div class="py-1">
                  <div class="text-body-2">
                    {{ riwayatCatatan(item) }}
                  </div>

                  <div
                    v-if="riwayatSoapSummary(item) !== '-'"
                    class="text-caption text-medium-emphasis mt-1"
                  >
                    SOAP: {{ riwayatSoapSummary(item) }}
                  </div>
                </div>
              </template>

              <template #item.transaksi="{ item }">
                <div class="py-1 text-right">
                  <div class="text-body-2 font-weight-bold">
                    {{ riwayatInvoiceNo(item) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ riwayatJenisTransaksi(item) }}
                  </div>
                  <div class="text-body-2 font-weight-bold mt-1">
                    Rp {{ formatNumber(riwayatGrandTotal(item)) }}
                  </div>
                  <v-chip
                    size="x-small"
                    :color="riwayatStatusColor(item)"
                    variant="tonal"
                    class="mt-1"
                  >
                    {{ riwayatStatusText(item) }}
                  </v-chip>
                </div>
              </template>

              <template #item.klinik="{ item }">
                <div class="py-1">
                  <div class="text-body-2 font-weight-medium">
                    {{ riwayatTokoName(item) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ riwayatChannelLabel(item) }}
                  </div>
                </div>
              </template>
            </v-data-table>
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
                      item-title="label"
                      item-value="value"
                      label="Obat / Produk"
                      placeholder="Pilih obat / produk"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      clearable
                      :loading="loadingReference"
                      @update:model-value="onSelectObat(index, $event)"
                    />
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
                  <v-col cols="12" md="6">
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

                  <v-col cols="12" sm="4" md="2">
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

      riwayatHeaders: [
        { title: "TGL", key: "tgl", sortable: false, minWidth: 120 },
        { title: "DOKTER", key: "dokter", sortable: false, minWidth: 160 },
        {
          title: "TINDAKAN & PERAWAT",
          key: "tindakan_perawat",
          sortable: false,
          minWidth: 240,
        },
        { title: "OBAT", key: "obat", sortable: false, minWidth: 220 },
        { title: "CATATAN", key: "catatan", sortable: false, minWidth: 240 },
        {
          title: "TRANSAKSI",
          key: "transaksi",
          sortable: false,
          minWidth: 160,
        },
        { title: "KLINIK", key: "klinik", sortable: false, minWidth: 140 },
      ],

      riwayatTransaksi: [],
      riwayatSummary: null,
      loadingRiwayatTransaksi: false,
      obatItems: [],
      treatmentItems: [],

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
      const sourceCode = this.consultationSourceCode.toUpperCase();
      const sourceName = this.consultationSourceName.toUpperCase();

      return (
        sourceCode.includes("ONLINE") ||
        sourceName.includes("ONLINE") ||
        this.consultationChannel === "2" ||
        this.consultationChannel.includes("online")
      );
    },

    showSoapForm() {
      if (this.hasOriginalConsultation && !this.isOnlineConsultation) {
        return true;
      }

      if (!this.hasOriginalConsultation && this.form.add_consultation) {
        return true;
      }

      return false;
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
          show: true,
          type: "info",
          title: "Konsultasi online",
          message:
            "Informasi medis pendaftaran ditampilkan sebagai acuan dokter. SOAP tidak ditampilkan untuk konsultasi online.",
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
      const data = this.onlineRegistration || {};

      return (
        Number(data.channel_konsultasi || 0) === 2 ||
        this.hasMedicalValue(data.konsultasi_source_code) ||
        this.hasMedicalValue(data.konsultasi_source_name) ||
        this.hasMedicalValue(data.request_dokter_nama) ||
        this.hasMedicalValue(data.request_dokter) ||
        this.hasMedicalValue(data.keluhan_utama) ||
        this.hasMedicalValue(data.keluhan) ||
        this.hasMedicalValue(data.keluhan_awal) ||
        this.hasMedicalValue(data.alergi) ||
        this.hasMedicalValue(data.produk_obat_sebelumnya) ||
        this.hasMedicalValue(data.produk_sebelumnya) ||
        this.hasMedicalValue(data.sedang_hamil) ||
        this.hasMedicalValue(data.sedang_menyusui) ||
        this.hasMedicalValue(data.catatan_cs) ||
        this.hasMedicalValue(data.catatan_awal) ||
        this.hasMedicalValue(data.catatan_registrasi) ||
        this.onlineRegistrationPhotos.length > 0
      );
    },

    onlineRegistrationItems() {
      const data = this.onlineRegistration || {};

      return [
        {
          key: "request_dokter_nama",
          label: "Request Dokter Khusus",
          value: data.request_dokter_nama || data.request_dokter,
        },
        {
          key: "keluhan_utama",
          label: "Keluhan Utama",
          value: data.keluhan_utama || data.keluhan || data.keluhan_awal,
          cols: 12,
        },
        {
          key: "alergi",
          label: "Alergi",
          value: data.alergi,
        },
        {
          key: "produk_obat_sebelumnya",
          label: "Produk / Obat Sebelumnya",
          value: data.produk_obat_sebelumnya || data.produk_sebelumnya,
        },
        {
          key: "sedang_hamil",
          label: "Sedang Hamil",
          value: this.normalizeMedicalYesNo(
            data.sedang_hamil_raw ?? data.sedang_hamil,
          ),
        },
        {
          key: "sedang_menyusui",
          label: "Sedang Menyusui",
          value: this.normalizeMedicalYesNo(
            data.sedang_menyusui_raw ?? data.sedang_menyusui,
          ),
        },
      ];
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
          subjectiveResult,
          assessmentResult,
        ] = await Promise.allSettled([
          tokoId ? referenceService.produkByToko(params) : Promise.resolve([]),
          tokoId
            ? referenceService.treatmentByToko(params)
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
          "Konsultasi Online",
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

            return {
              treatment_toko_id: treatmentTokoId,
              treatment_id: treatmentId,
              nama,
              jumlah,
              harga,
              total,
              perawat_id: item?.perawat_id || item?.karyawan_id || null,
            };
          })
        : [this.createEmptyTreatmentRow()];
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
        row.produk_toko_id = null;
        row.produk_id = null;
        row.nama = "";
        row.harga = 0;
        row.subtotal = 0;
        row.stok_tersedia = null;
        row.stok_terbaca = false;
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
        return;
      }

      row.treatment_toko_id = option.value;
      row.treatment_id = option.treatment_id || null;
      row.nama = option.label || "";
      row.harga = this.toNumber(option.harga);
      this.recalculateTreatment(index);
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

          const label =
            item?.label ||
            item?.nama_produk ||
            item?.produk_nama ||
            item?.nama_obat ||
            item?.nama ||
            produk?.nama ||
            produk?.nama_produk ||
            produk?.nama_obat ||
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

          return {
            label,
            value: produkTokoId || produkId,
            produk_toko_id: produkTokoId || null,
            produk_id: produkId,
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
            stok_akhir: item?.stok_akhir ?? null,
            stok_reserved: item?.stok_reserved ?? null,
            sumber_stok: item?.sumber_stok || null,
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
      row.nama = option.label || row.nama || "";
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
      const candidates = [
        item?.stok_tersedia,
        item?.stok_available,
        item?.stok_akhir,
        item?.sisa_stok,
        item?.stock_available,
        item?.stock,
        item?.stok,
        item?.qty_available,
        produkToko?.stok_tersedia,
        produkToko?.stok_available,
        produkToko?.stok_akhir,
        produkToko?.sisa_stok,
        produkToko?.stock_available,
        produkToko?.stock,
        produkToko?.stok,
        produkToko?.qty_available,
        produk?.stok_tersedia,
        produk?.stok_available,
        produk?.stok_akhir,
        produk?.sisa_stok,
        produk?.stock,
        produk?.stok,
      ];

      const found = candidates.find(
        (value) => value !== null && value !== undefined && value !== "",
      );

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
      this.$router.push(
        `/pelayanan-medis/antrian-dokter/${this.antrianId}/isi-pengkajian-awal`,
      );
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
      return {
        key:
          row?.id ||
          row?.item_id ||
          `${row?.nama || row?.nama_item || index}-${index}`,
        nama:
          row?.nama_item ||
          row?.nama_produk ||
          row?.nama_treatment ||
          row?.nama ||
          row?.description ||
          "-",
        qty: this.toNumber(row?.jumlah || row?.qty || row?.quantity || 1),
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
      };
    },

    riwayatTreatmentItems(item) {
      const rows = this.riwayatItems(item, ["treatment", "perawatan"]);

      return rows.map((row, index) => this.normalizeRiwayatItem(row, index));
    },

    riwayatProdukItems(item) {
      const rows = this.riwayatItems(item, ["produk", "obat", "penjualan"]);

      return rows.map((row, index) => this.normalizeRiwayatItem(row, index));
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

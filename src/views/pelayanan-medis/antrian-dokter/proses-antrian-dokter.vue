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
              <div class="text-subtitle-1 font-weight-bold">
                Informasi Medis Pendaftaran
              </div>
              <div class="text-caption text-medium-emphasis">
                Data awal dari pendaftaran konsultasi online.
              </div>
            </v-card-text>

            <v-divider />

            <v-card-text class="pa-4">
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis">
                    Keluhan Utama
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    {{ onlineRegistration.keluhan_utama || "-" }}
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis">
                    Riwayat Penyakit
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    {{ onlineRegistration.riwayat_penyakit || "-" }}
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis">Alergi</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ onlineRegistration.alergi || "-" }}
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis">
                    Obat Dikonsumsi
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    {{ onlineRegistration.obat_dikonsumsi || "-" }}
                  </div>
                </v-col>

                <v-col cols="12">
                  <div class="text-caption text-medium-emphasis">
                    Catatan Pendaftaran
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    {{ onlineRegistration.catatan_pendaftaran || "-" }}
                  </div>
                </v-col>
              </v-row>
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
                  Riwayat pelayanan, transaksi, treatment, dan obat pasien
                  sebelumnya.
                </div>
              </div>

              <v-chip
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-history"
              >
                {{ riwayatTransaksi.length }} Riwayat
              </v-chip>
            </div>

            <v-data-table
              :headers="riwayatHeaders"
              :items="riwayatTransaksi"
              density="compact"
              item-value="id"
              :hide-default-footer="riwayatTransaksi.length === 0"
              class="border"
            >
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
                    Data akan muncul setelah pasien memiliki transaksi atau
                    pelayanan yang selesai.
                  </div>
                </div>
              </template>

              <template #item.tgl="{ item }">
                <div class="text-body-2">
                  {{
                    getRiwayatValue(item, [
                      "tgl",
                      "tanggal",
                      "tanggal_transaksi",
                    ])
                  }}
                </div>
              </template>

              <template #item.dokter="{ item }">
                <div class="text-body-2">
                  {{ getRiwayatValue(item, ["dokter", "nama_dokter"]) }}
                </div>
              </template>

              <template #item.tindakan_perawat="{ item }">
                <div
                  v-if="
                    getRiwayatArray(item, [
                      'tindakan_perawat',
                      'tindakan',
                      'treatment',
                    ]).length
                  "
                  class="d-flex flex-column ga-1 py-1"
                >
                  <div
                    v-for="(row, index) in getRiwayatArray(item, [
                      'tindakan_perawat',
                      'tindakan',
                      'treatment',
                    ])"
                    :key="index"
                    class="text-body-2"
                  >
                    {{ displayText(row) }}
                  </div>
                </div>

                <span v-else class="text-body-2 text-medium-emphasis"> - </span>
              </template>

              <template #item.obat="{ item }">
                <div
                  v-if="
                    getRiwayatArray(item, ['obat', 'produk', 'obat_produk'])
                      .length
                  "
                  class="d-flex flex-column ga-1 py-1"
                >
                  <div
                    v-for="(row, index) in getRiwayatArray(item, [
                      'obat',
                      'produk',
                      'obat_produk',
                    ])"
                    :key="index"
                    class="text-body-2"
                  >
                    {{ displayText(row) }}
                  </div>
                </div>

                <span v-else class="text-body-2 text-medium-emphasis"> - </span>
              </template>

              <template #item.catatan="{ item }">
                <div class="text-body-2">
                  {{
                    getRiwayatValue(item, ["catatan", "notes", "keterangan"])
                  }}
                </div>
              </template>

              <template #item.transaksi="{ item }">
                <div class="text-body-2 font-weight-medium">
                  {{
                    getRiwayatValue(item, [
                      "transaksi",
                      "faktur",
                      "no_transaksi",
                    ])
                  }}
                </div>
              </template>

              <template #item.klinik="{ item }">
                <div class="text-body-2">
                  {{ getRiwayatValue(item, ["klinik", "toko", "cabang"]) }}
                </div>
              </template>
            </v-data-table>
          </div>

          <v-card variant="outlined" rounded="lg" class="mb-5">
            <v-card-text class="pa-4 pb-2">
              <div
                class="d-flex align-center justify-space-between flex-wrap ga-2"
              >
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Obat / Produk
                  </div>

                  <div class="text-caption text-medium-emphasis">
                    Pilihan produk diambil dari reference produk cabang aktif
                    dan qty tidak boleh melebihi stok.
                  </div>
                </div>

                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addObatRow"
                >
                  Tambah
                </v-btn>
              </div>
            </v-card-text>

            <v-divider />

            <v-card-text class="pa-4">
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

              <v-row
                v-for="(item, index) in obatItems"
                :key="`obat-${index}`"
                dense
                align="center"
                class="mb-2"
              >
                <v-col cols="12" md="5">
                  <v-autocomplete
                    v-model="item.produk_toko_id"
                    :items="obatOptions"
                    item-title="display_label"
                    item-value="value"
                    label="Obat / Produk"
                    placeholder="Pilih obat / produk"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    :loading="loadingReference"
                    @update:model-value="onSelectObat(index, $event)"
                  />
                </v-col>

                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="item.jumlah"
                    label="Qty"
                    type="number"
                    min="1"
                    :max="item.stok_terbaca ? item.stok_tersedia : undefined"
                    variant="outlined"
                    density="compact"
                    :error-messages="getObatStockError(item)"
                    @update:model-value="recalculateObat(index)"
                  />
                </v-col>

                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="item.harga"
                    label="Harga"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    readonly
                  />
                </v-col>

                <v-col cols="10" md="2">
                  <v-text-field
                    :model-value="formatNumber(item.subtotal)"
                    label="Subtotal"
                    variant="outlined"
                    density="compact"
                    hide-details
                    readonly
                  />
                </v-col>

                <v-col cols="2" md="1">
                  <v-btn
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    size="small"
                    :disabled="obatItems.length === 1"
                    @click="removeObatRow(index)"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="item.frekuensi_penggunaan"
                    :items="frekuensiPenggunaanOptions"
                    item-title="title"
                    item-value="value"
                    label="Frekuensi Penggunaan"
                    placeholder="Pilih frekuensi"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="item.waktu_penggunaan"
                    :items="waktuPenggunaanOptions"
                    item-title="title"
                    item-value="value"
                    label="Penggunaan"
                    placeholder="Pilih waktu penggunaan"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    :model-value="getStokText(item)"
                    label="Stok Tersedia"
                    variant="outlined"
                    density="compact"
                    hide-details
                    readonly
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" rounded="lg" class="mb-5">
            <v-card-text class="pa-4 pb-2">
              <div
                class="d-flex align-center justify-space-between flex-wrap ga-2"
              >
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Treatment</div>

                  <div class="text-caption text-medium-emphasis">
                    Pilihan treatment diambil dari reference treatment cabang
                    aktif.
                  </div>
                </div>

                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addTreatmentRow"
                >
                  Tambah
                </v-btn>
              </div>
            </v-card-text>

            <v-divider />

            <v-card-text class="pa-4">
              <v-alert
                v-if="!treatmentOptions.length && !loadingReference"
                type="warning"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                Reference treatment belum tersedia untuk cabang ini.
              </v-alert>

              <v-row
                v-for="(item, index) in treatmentItems"
                :key="`treatment-${index}`"
                dense
                align="center"
                class="mb-2"
              >
                <v-col cols="12" md="5">
                  <v-autocomplete
                    v-model="item.treatment_toko_id"
                    :items="treatmentOptions"
                    item-title="label"
                    item-value="value"
                    label="Treatment"
                    placeholder="Pilih treatment"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    :loading="loadingReference"
                    @update:model-value="onSelectTreatment(index, $event)"
                  />
                </v-col>

                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="item.jumlah"
                    label="Qty"
                    type="number"
                    min="1"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="recalculateTreatment(index)"
                  />
                </v-col>

                <v-col cols="6" md="2">
                  <v-text-field
                    v-model.number="item.harga"
                    label="Harga"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    readonly
                  />
                </v-col>

                <v-col cols="10" md="2">
                  <v-text-field
                    :model-value="formatNumber(item.total)"
                    label="Total"
                    variant="outlined"
                    density="compact"
                    hide-details
                    readonly
                  />
                </v-col>

                <v-col cols="2" md="1">
                  <v-btn
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    size="small"
                    :disabled="treatmentItems.length === 1"
                    @click="removeTreatmentRow(index)"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="item.catatan"
                    label="Catatan Treatment"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card variant="outlined" rounded="lg" class="mb-5">
            <v-card-text class="pa-4 pb-2">
              <div class="text-subtitle-1 font-weight-bold">Ringkasan</div>
              <div class="text-caption text-medium-emphasis">
                Ringkasan biaya layanan pasien.
              </div>
            </v-card-text>

            <v-divider />

            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-body-2 text-medium-emphasis">
                  Obat / Produk
                </div>
                <div class="text-body-2 font-weight-bold">
                  Rp {{ formatNumber(totalObat) }}
                </div>
              </div>

              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-body-2 text-medium-emphasis">Treatment</div>
                <div class="text-body-2 font-weight-bold">
                  Rp {{ formatNumber(totalTreatment) }}
                </div>
              </div>

              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-body-2 text-medium-emphasis">
                  {{ consultationLabel }}
                </div>
                <div class="text-body-2 font-weight-bold">
                  Rp {{ formatNumber(consultationFee) }}
                </div>
              </div>

              <v-divider class="my-3" />

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-2 font-weight-bold">Grand Total</div>
                <div class="text-subtitle-1 font-weight-bold">
                  Rp {{ formatNumber(grandTotal) }}
                </div>
              </div>

              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mt-4"
              >
                Biaya konsultasi menjadi Rp 0 jika pasien mengambil treatment.
              </v-alert>
            </v-card-text>

            <v-card-actions class="pa-4 pt-0">
              <v-btn
                color="success"
                variant="flat"
                block
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
        keluhan_utama: "-",
        riwayat_penyakit: "-",
        alergi: "-",
        obat_dikonsumsi: "-",
        catatan_pendaftaran: "-",
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
        0;

      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
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

    showOnlineMedicalInfo() {
      return this.hasOriginalConsultation && this.isOnlineConsultation;
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
      if (this.hasOriginalConsultation) {
        return this.consultationOriginalAmount;
      }

      if (!this.form.add_consultation) {
        return 0;
      }

      if (this.hasTreatment) {
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
          message:
            "SOAP diisi dokter. Biaya konsultasi otomatis Rp 0 karena pasien mengambil treatment.",
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
          message:
            "Biaya konsultasi dihitung Rp 100.000 jika pasien tidak mengambil treatment.",
        };
      }

      return {
        show: false,
        type: "info",
        title: "",
        message: "",
      };
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
          this.obatOptions = this.uniqueOptions([
            ...this.obatOptions,
            ...this.normalizeProdukOptions(
              this.extractRows(produkResult.value),
            ),
          ]);
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

      this.onlineRegistration = {
        keluhan_utama:
          intake?.keluhan_utama ||
          intake?.keluhan ||
          data?.keluhan_utama ||
          "-",
        riwayat_penyakit:
          intake?.riwayat_penyakit || data?.riwayat_penyakit || "-",
        alergi: intake?.alergi || data?.alergi || "-",
        obat_dikonsumsi:
          intake?.obat_dikonsumsi || data?.obat_dikonsumsi || "-",
        catatan_pendaftaran:
          intake?.catatan ||
          data?.catatan_registrasi ||
          data?.catatan_pendaftaran ||
          "-",
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
              stok_tersedia: stokTersedia,
              stok_terbaca: stokTerbaca,
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
              catatan: item?.catatan || "",
            };
          })
        : [this.createEmptyTreatmentRow()];
    },

    mapRiwayat(data = {}) {
      this.riwayatTransaksi = this.extractFirstArray(data, [
        "riwayat_transaksi",
        "riwayatTransaksi",
        "history_transaksi",
        "historyTransaksi",
        "riwayat",
      ]);
    },

    createEmptyObatRow() {
      return {
        produk_toko_id: null,
        produk_id: null,
        nama: "",
        jumlah: 1,
        harga: 0,
        subtotal: 0,
        stok_tersedia: null,
        stok_terbaca: false,
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
        catatan: "",
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

      row.produk_toko_id = option.value;
      row.produk_id = option.produk_id || null;
      row.nama = option.label || "";
      row.harga = this.toNumber(option.harga);
      row.stok_tersedia = option.stok_tersedia;
      row.stok_terbaca = option.stok_terbaca;

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

          const displayLabel = stokTerbaca
            ? `${label} - Stok: ${this.formatNumber(stokTersedia)}`
            : `${label} - Stok: tidak terbaca`;

          return {
            label,
            display_label: displayLabel,
            value: produkTokoId || produkId,
            produk_id: produkId,
            harga,
            stok_tersedia: stokTersedia,
            stok_terbaca: stokTerbaca,
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
              stok_tersedia: item.stok_tersedia,
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
            catatan: item.catatan || null,
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
  },
};
</script>

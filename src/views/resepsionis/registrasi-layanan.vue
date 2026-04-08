<template>
  <div class="page-wrap">
    <div class="page-header d-flex justify-space-between align-start mb-6">
      <div>
        <h1 class="page-title">Pendaftaran Layanan Pasien</h1>
        <p class="page-subtitle">
          Satu halaman pendaftaran untuk konsultasi, treatment, dan penjualan
          langsung
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card rounded="xl" elevation="2">
      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="isFormValid">
          <!-- INFORMASI REGISTRASI -->
          <div class="section-head mb-6">
            <div class="section-title">
              <v-icon class="mr-2" color="primary"
                >mdi-clipboard-account-outline</v-icon
              >
              Informasi Registrasi
            </div>
            <div class="section-subtitle">
              Field umum diisi sekali untuk seluruh layanan dalam satu
              registrasi
            </div>
          </div>

          <v-alert type="info" variant="tonal" rounded="lg" class="mb-4">
            Halaman ini hanya untuk pendaftaran layanan. Pembayaran dilakukan di
            halaman terpisah setelah layanan difinalisasi.
          </v-alert>

          <v-row dense>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="form.tanggal"
                label="Tanggal Registrasi"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="5">
              <v-autocomplete
                v-model="form.pasien_new_id"
                label="Pasien"
                placeholder="Cari nama pasien atau identitas"
                :items="pasienList"
                item-title="text"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-search"
                :rules="[rules.required]"
                clearable
                hide-details="auto"
                @update:modelValue="onPatientChange"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.sumber"
                label="Sumber"
                :items="sumberList"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-source-branch"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.jenis_transaksi"
                label="Jenis Transaksi"
                :items="jenisTransaksiList"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-shape-outline"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.dokter_id"
                label="Dokter Penanggung Jawab"
                placeholder="Pilih dokter"
                :items="dokterList"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-stethoscope"
                clearable
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.perawat_id"
                label="Perawat / Beautician"
                placeholder="Pilih perawat"
                :items="perawatList"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-heart-outline"
                clearable
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <!-- PILIH LAYANAN -->
          <v-divider class="my-6" />

          <div class="section-head mb-4">
            <div class="section-title">
              <v-icon class="mr-2" color="primary"
                >mdi-format-list-checks</v-icon
              >
              Pilih Layanan
            </div>
            <div class="section-subtitle">
              Pilih layanan yang akan masuk ke registrasi ini
            </div>
          </div>

          <v-card variant="tonal" rounded="xl" class="service-card mb-6">
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="4">
                  <v-checkbox
                    v-model="form.layanan.ada_konsultasi"
                    label="Ada Konsultasi"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-checkbox
                    v-model="form.layanan.ada_treatment"
                    label="Ada Treatment"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-checkbox
                    v-model="form.layanan.ada_penjualan"
                    label="Ada Penjualan Langsung"
                    color="primary"
                    hide-details
                  />
                </v-col>
              </v-row>

              <v-expand-transition>
                <div v-if="form.layanan.ada_konsultasi" class="mt-4">
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="form.layanan.channel_konsultasi"
                        label="Channel Konsultasi"
                        :items="channelKonsultasiList"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-access-point"
                        :rules="
                          form.layanan.ada_konsultasi ? [rules.required] : []
                        "
                        hide-details="auto"
                      />
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>

          <!-- KONSULTASI OFFLINE -->
          <v-expand-transition>
            <div
              v-if="
                form.layanan.ada_konsultasi &&
                form.layanan.channel_konsultasi === 'offline'
              "
              class="mb-6"
            >
              <div class="subsection-wrap">
                <div class="subsection-title mb-4">
                  <v-icon class="mr-2" color="primary">mdi-stethoscope</v-icon>
                  Detail Konsultasi Offline
                </div>

                <v-row dense>
                  <v-col cols="12">
                    <v-textarea
                      v-model="form.konsultasi_offline.keluhan_awal"
                      label="Keluhan Awal"
                      rows="3"
                      auto-grow
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                      placeholder="Tuliskan keluhan awal pasien"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.konsultasi_offline.catatan"
                      label="Catatan Awal Konsultasi"
                      rows="3"
                      auto-grow
                      variant="outlined"
                      density="comfortable"
                      placeholder="Catatan tambahan untuk konsultasi offline"
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-expand-transition>

          <!-- KONSULTASI ONLINE -->
          <v-expand-transition>
            <div
              v-if="
                form.layanan.ada_konsultasi &&
                form.layanan.channel_konsultasi === 'online'
              "
              class="mb-6"
            >
              <div class="subsection-wrap">
                <div class="subsection-title mb-4">
                  <v-icon class="mr-2" color="primary"
                    >mdi-video-outline</v-icon
                  >
                  Detail Konsultasi Online
                </div>

                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.konsultasi_online.request_dokter"
                      label="Request Dokter Khusus"
                      placeholder="Opsional"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-doctor"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.konsultasi_online.alergi"
                      label="Alergi"
                      rows="3"
                      auto-grow
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                      placeholder="Sebutkan alergi, jika tidak ada tulis 'Tidak ada'"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.konsultasi_online.keluhan"
                      label="Keluhan Utama"
                      rows="4"
                      auto-grow
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                      placeholder="Jelaskan keluhan pasien"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.konsultasi_online.produk_sebelumnya"
                      label="Produk / Obat Sebelumnya"
                      rows="3"
                      auto-grow
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-radio-group
                      v-model="form.konsultasi_online.sedang_hamil"
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
                      v-model="form.konsultasi_online.sedang_menyusui"
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

                <div class="mini-title mb-4">Dokumentasi Foto</div>

                <v-row dense>
                  <v-col
                    v-for="photo in photoCards"
                    :key="photo.key"
                    cols="12"
                    md="4"
                  >
                    <v-card
                      variant="outlined"
                      rounded="xl"
                      class="photo-card h-100"
                    >
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
                          :src="form.konsultasi_online[photo.previewKey]"
                          height="220"
                          cover
                          rounded="lg"
                          class="mt-4 bg-grey-lighten-3"
                        />

                        <div
                          class="d-flex justify-space-between align-center mt-3 ga-2"
                        >
                          <div
                            class="text-body-2 text-medium-emphasis text-truncate"
                          >
                            {{
                              form.konsultasi_online[photo.fileNameKey] ||
                              "Belum ada file dipilih"
                            }}
                          </div>

                          <v-btn
                            v-if="form.konsultasi_online[photo.fileNameKey]"
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

                <div class="mini-title mb-4">Riwayat Konsultasi</div>
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

                    <template #no-data>
                      <div class="text-center py-6">
                        Belum ada riwayat konsultasi
                      </div>
                    </template>
                  </v-data-table>
                </v-card>
              </div>
            </div>
          </v-expand-transition>

          <!-- TREATMENT -->
          <v-expand-transition>
            <div v-if="form.layanan.ada_treatment" class="mb-6">
              <div class="subsection-wrap">
                <div class="subsection-title mb-4">
                  <v-icon class="mr-2" color="primary">mdi-spa</v-icon>
                  Detail Treatment
                </div>

                <v-alert
                  type="warning"
                  variant="tonal"
                  rounded="lg"
                  class="mb-4"
                >
                  Nominal di halaman ini bersifat estimasi awal. Finalisasi
                  dilakukan pada tahap layanan / tagihan.
                </v-alert>

                <v-checkbox
                  v-model="form.treatment.is_premier_lounge"
                  label="Centang jika transaksi dilakukan di Premier Lounge"
                  color="warning"
                  hide-details
                  class="mb-4"
                />

                <div
                  v-for="(item, index) in form.treatment.items"
                  :key="'treatment-' + index"
                  class="line-item mb-3"
                >
                  <v-row dense align="center">
                    <v-col cols="12" md="3">
                      <v-select
                        v-model="item.tindakan_id"
                        label="Tindakan"
                        :items="tindakanList"
                        item-title="nama"
                        item-value="id"
                        variant="outlined"
                        density="comfortable"
                        :rules="
                          form.layanan.ada_treatment ? [rules.required] : []
                        "
                        hide-details="auto"
                        @update:modelValue="fillTreatmentItem(index)"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-text-field
                        v-model.number="item.jumlah"
                        label="Jumlah"
                        type="number"
                        min="1"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="2">
                      <v-select
                        v-model="item.beautician_id"
                        label="Beautician"
                        :items="perawatList"
                        item-title="nama"
                        item-value="id"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="2">
                      <v-text-field
                        v-model.number="item.harga"
                        label="Harga Estimasi"
                        type="number"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-select
                        v-model="item.diskon_type"
                        label="Tipe"
                        :items="diskonTypeList"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-text-field
                        v-model.number="item.diskon_value"
                        label="Diskon"
                        type="number"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-text-field
                        v-model.number="item.diskon_referral"
                        label="Referral"
                        type="number"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-text-field
                        :model-value="formatNumber(getTreatmentSubtotal(item))"
                        label="Estimasi"
                        variant="outlined"
                        density="comfortable"
                        readonly
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" class="d-flex justify-end ga-2">
                      <v-btn
                        color="warning"
                        variant="flat"
                        icon
                        @click="addTreatmentItem"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>

                      <v-btn
                        color="error"
                        variant="flat"
                        icon
                        :disabled="form.treatment.items.length === 1"
                        @click="removeTreatmentItem(index)"
                      >
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </div>
          </v-expand-transition>

          <!-- PENJUALAN -->
          <v-expand-transition>
            <div v-if="form.layanan.ada_penjualan" class="mb-6">
              <div class="subsection-wrap">
                <div class="subsection-title mb-4">
                  <v-icon class="mr-2" color="primary">mdi-pill</v-icon>
                  Detail Penjualan Langsung
                </div>

                <v-alert
                  type="warning"
                  variant="tonal"
                  rounded="lg"
                  class="mb-4"
                >
                  Item penjualan di sini masih bersifat draft awal. Finalisasi
                  harga dan tagihan dilakukan setelah proses layanan.
                </v-alert>

                <v-row dense class="mb-2">
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model.number="form.penjualan.poin"
                      label="Poin"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-star-circle-outline"
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>

                <div
                  v-for="(item, index) in form.penjualan.items"
                  :key="'penjualan-' + index"
                  class="line-item mb-3"
                >
                  <v-row dense align="center">
                    <v-col cols="12" md="3">
                      <v-select
                        v-model="item.produk_id"
                        label="Nama Obat"
                        :items="obatList"
                        item-title="nama"
                        item-value="id"
                        variant="outlined"
                        density="comfortable"
                        :rules="
                          form.layanan.ada_penjualan ? [rules.required] : []
                        "
                        hide-details="auto"
                        @update:modelValue="fillPenjualanItem(index)"
                      />
                    </v-col>

                    <v-col cols="12" md="2">
                      <v-text-field
                        v-model.number="item.harga"
                        label="Harga Estimasi"
                        type="number"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-text-field
                        v-model.number="item.jumlah"
                        label="Jumlah"
                        type="number"
                        min="1"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-select
                        v-model="item.unit"
                        label="Unit"
                        :items="unitList"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-select
                        v-model="item.diskon_type"
                        label="Tipe"
                        :items="diskonTypeList"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-text-field
                        v-model.number="item.diskon_value"
                        label="Diskon"
                        type="number"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="1">
                      <v-text-field
                        v-model.number="item.diskon_referral"
                        label="Referral"
                        type="number"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12" md="2">
                      <v-text-field
                        :model-value="formatNumber(getPenjualanSubtotal(item))"
                        label="Estimasi"
                        variant="outlined"
                        density="comfortable"
                        readonly
                        hide-details="auto"
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-row dense>
                        <v-col cols="12" md="3">
                          <v-select
                            v-model="item.frekuensi"
                            label="Frekuensi"
                            :items="frekuensiList"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-select
                            v-model="item.waktu_pakai"
                            label="Waktu Pakai"
                            :items="waktuPakaiList"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          />
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-textarea
                            v-model="item.penggunaan"
                            label="Penggunaan"
                            rows="2"
                            auto-grow
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          />
                        </v-col>

                        <v-col
                          cols="12"
                          md="2"
                          class="d-flex justify-end align-start ga-2"
                        >
                          <v-btn
                            color="warning"
                            variant="flat"
                            icon
                            @click="addPenjualanItem"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>

                          <v-btn
                            color="error"
                            variant="flat"
                            icon
                            :disabled="form.penjualan.items.length === 1"
                            @click="removePenjualanItem(index)"
                          >
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </div>
          </v-expand-transition>

          <!-- CATATAN UMUM -->
          <v-divider class="my-6" />

          <div class="section-head mb-4">
            <div class="section-title">
              <v-icon class="mr-2" color="primary"
                >mdi-note-text-outline</v-icon
              >
              Catatan Umum Registrasi
            </div>
          </div>

          <v-textarea
            v-model="form.catatan_umum"
            label="Catatan"
            rows="3"
            auto-grow
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />

          <!-- RINGKASAN -->
          <v-divider class="my-6" />

          <div class="section-head mb-4">
            <div class="section-title">
              <v-icon class="mr-2" color="primary"
                >mdi-clipboard-text-outline</v-icon
              >
              Ringkasan Registrasi
            </div>
          </div>

          <v-row dense>
            <v-col cols="12" md="4">
              <div class="summary-box">
                <div class="summary-label">Konsultasi</div>
                <div class="summary-value small">
                  {{
                    form.layanan.ada_konsultasi
                      ? `Ya (${form.layanan.channel_konsultasi || "channel belum dipilih"})`
                      : "Tidak"
                  }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="summary-box">
                <div class="summary-label">Estimasi Treatment</div>
                <div class="summary-value">
                  Rp {{ formatNumber(totalTreatment) }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="summary-box">
                <div class="summary-label">Estimasi Penjualan</div>
                <div class="summary-value">
                  Rp {{ formatNumber(totalPenjualan) }}
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="action-bar">
            <v-btn variant="text" color="secondary" @click="resetForm">
              Reset
            </v-btn>

            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              prepend-icon="mdi-content-save"
              :loading="loading"
              :disabled="loading"
              @click="submitForm"
            >
              Simpan Pendaftaran
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

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
  name: "PendaftaranLayananTerpaduPage",

  data() {
    return {
      isFormValid: false,
      loading: false,
      dragActive: null,

      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        {
          title: "Pendaftaran Layanan",
          disabled: false,
          to: "/resepsionis/pendaftaran-layanan",
        },
      ],

      pasienList: [
        { id: "PS001", text: "Budi Santoso - 3276010101010001" },
        { id: "PS002", text: "Siti Aminah - 3276010101010002" },
        { id: "PS003", text: "Rina Lestari - 3276010101010003" },
      ],

      dokterList: [
        { id: "D001", nama: "dr. Andi Saputra" },
        { id: "D002", nama: "dr. Bunga Lestari" },
        { id: "D003", nama: "dr. Candra Wijaya" },
      ],

      perawatList: [
        { id: "P001", nama: "Ns. Rina" },
        { id: "P002", nama: "Ns. Tika" },
        { id: "P003", nama: "Ns. Dita" },
      ],

      tindakanList: [
        { id: "TR001", nama: "Facial Glow", harga: 150000 },
        { id: "TR002", nama: "Peeling Acne", harga: 250000 },
        { id: "TR003", nama: "Laser Brightening", harga: 500000 },
      ],

      obatList: [
        { id: "OB001", nama: "Cream Siang", harga: 120000, unit: "PCS" },
        { id: "OB002", nama: "Cream Malam", harga: 135000, unit: "PCS" },
        { id: "OB003", nama: "Facial Wash", harga: 75000, unit: "PCS" },
      ],

      sumberList: [
        "Pelanggan Lama",
        "Pelanggan Baru",
        "Instagram",
        "TikTok",
        "WhatsApp",
        "Referral",
      ],

      jenisTransaksiList: ["Umum", "Member", "Referral", "Owner", "Endorse"],
      channelKonsultasiList: [
        { title: "Offline", value: "offline" },
        { title: "Online", value: "online" },
      ],
      diskonTypeList: ["%", "Rp"],
      unitList: ["PCS", "BOX", "BOTOL", "SET"],
      frekuensiList: ["1x sehari", "2x sehari", "3x sehari", "Sesuai anjuran"],
      waktuPakaiList: [
        "Pagi",
        "Siang",
        "Malam",
        "Sesudah makan",
        "Sebelum tidur",
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

      form: this.getDefaultForm(),

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

  computed: {
    totalTreatment() {
      if (!this.form.layanan.ada_treatment) return 0;
      return this.form.treatment.items.reduce((sum, item) => {
        return sum + this.getTreatmentSubtotal(item);
      }, 0);
    },

    totalPenjualan() {
      if (!this.form.layanan.ada_penjualan) return 0;
      return this.form.penjualan.items.reduce((sum, item) => {
        return sum + this.getPenjualanSubtotal(item);
      }, 0);
    },
  },

  methods: {
    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    },

    getDefaultTreatmentItem() {
      return {
        tindakan_id: null,
        jumlah: 1,
        beautician_id: null,
        harga: 0,
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
      };
    },

    getDefaultPenjualanItem() {
      return {
        produk_id: null,
        harga: 0,
        jumlah: 1,
        unit: "PCS",
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
        frekuensi: "",
        waktu_pakai: "",
        penggunaan: "",
      };
    },

    getDefaultForm() {
      return {
        tanggal: this.getToday(),
        pasien_new_id: null,
        dokter_id: null,
        perawat_id: null,
        sumber: "Pelanggan Lama",
        jenis_transaksi: "Umum",
        catatan_umum: "",

        layanan: {
          ada_konsultasi: true,
          channel_konsultasi: "offline",
          ada_treatment: false,
          ada_penjualan: false,
        },

        konsultasi_offline: {
          keluhan_awal: "",
          catatan: "",
        },

        konsultasi_online: {
          request_dokter: "",
          alergi: "",
          keluhan: "",
          produk_sebelumnya: "",
          sedang_hamil: null,
          sedang_menyusui: null,

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

        treatment: {
          is_premier_lounge: false,
          items: [this.getDefaultTreatmentItem()],
        },

        penjualan: {
          poin: 0,
          items: [this.getDefaultPenjualanItem()],
        },
      };
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

    getDiskonAmount(base, type, value) {
      const numericBase = Number(base || 0);
      const numericValue = Number(value || 0);
      if (type === "%") return (numericBase * numericValue) / 100;
      return numericValue;
    },

    getTreatmentSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.jumlah || 0);
      const diskon = this.getDiskonAmount(
        base,
        item.diskon_type,
        item.diskon_value,
      );
      const referral = Number(item.diskon_referral || 0);
      return Math.max(base - diskon - referral, 0);
    },

    getPenjualanSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.jumlah || 0);
      const diskon = this.getDiskonAmount(
        base,
        item.diskon_type,
        item.diskon_value,
      );
      const referral = Number(item.diskon_referral || 0);
      return Math.max(base - diskon - referral, 0);
    },

    fillTreatmentItem(index) {
      const item = this.form.treatment.items[index];
      const tindakan = this.tindakanList.find((x) => x.id === item.tindakan_id);
      if (!tindakan) return;
      item.harga = tindakan.harga;
    },

    fillPenjualanItem(index) {
      const item = this.form.penjualan.items[index];
      const produk = this.obatList.find((x) => x.id === item.produk_id);
      if (!produk) return;
      item.harga = produk.harga;
      item.unit = produk.unit || "PCS";
    },

    addTreatmentItem() {
      this.form.treatment.items.push(this.getDefaultTreatmentItem());
    },

    removeTreatmentItem(index) {
      if (this.form.treatment.items.length === 1) return;
      this.form.treatment.items.splice(index, 1);
    },

    addPenjualanItem() {
      this.form.penjualan.items.push(this.getDefaultPenjualanItem());
    },

    removePenjualanItem(index) {
      if (this.form.penjualan.items.length === 1) return;
      this.form.penjualan.items.splice(index, 1);
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

      this.form.konsultasi_online[previewMap[key]] = URL.createObjectURL(file);
      this.form.konsultasi_online[hiddenMap[key]] = file;
      this.form.konsultasi_online[fileNameMap[key]] = file.name;
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

      this.form.konsultasi_online[previewMap[key]] = defaultPreviewMap[key];
      this.form.konsultasi_online[hiddenMap[key]] = "";
      this.form.konsultasi_online[fileNameMap[key]] = "";
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    validateBusinessRules() {
      const layananDipilih =
        this.form.layanan.ada_konsultasi ||
        this.form.layanan.ada_treatment ||
        this.form.layanan.ada_penjualan;

      if (!layananDipilih) {
        this.showSnackbar("Pilih minimal satu layanan", "error");
        return false;
      }

      if (this.form.layanan.ada_konsultasi) {
        if (!this.form.layanan.channel_konsultasi) {
          this.showSnackbar("Pilih channel konsultasi", "error");
          return false;
        }

        if (this.form.layanan.channel_konsultasi === "offline") {
          if (!this.form.konsultasi_offline.keluhan_awal) {
            this.showSnackbar(
              "Lengkapi keluhan awal konsultasi offline",
              "error",
            );
            return false;
          }
        }

        if (this.form.layanan.channel_konsultasi === "online") {
          const ko = this.form.konsultasi_online;
          if (
            !ko.alergi ||
            !ko.keluhan ||
            !ko.sedang_hamil ||
            !ko.sedang_menyusui
          ) {
            this.showSnackbar("Lengkapi field konsultasi online", "error");
            return false;
          }
        }
      }

      if (this.form.layanan.ada_treatment) {
        const invalidTreatment = this.form.treatment.items.some(
          (item) => !item.tindakan_id || Number(item.jumlah || 0) <= 0,
        );

        if (invalidTreatment) {
          this.showSnackbar("Lengkapi detail treatment", "error");
          return false;
        }
      }

      if (this.form.layanan.ada_penjualan) {
        const invalidPenjualan = this.form.penjualan.items.some(
          (item) => !item.produk_id || Number(item.jumlah || 0) <= 0,
        );

        if (invalidPenjualan) {
          this.showSnackbar("Lengkapi detail penjualan", "error");
          return false;
        }
      }

      return true;
    },

    resetForm() {
      this.form = this.getDefaultForm();
      this.consultationHistory = [];
      this.dragActive = null;
      this.showSnackbar("Form berhasil direset", "success");
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Lengkapi field wajib diisi", "error");
        return;
      }

      if (!this.validateBusinessRules()) return;

      this.loading = true;

      try {
        const payload = {
          registrasi: {
            tanggal: this.form.tanggal,
            pasien_new_id: this.form.pasien_new_id,
            dokter_id: this.form.dokter_id,
            perawat_id: this.form.perawat_id,
            sumber: this.form.sumber,
            jenis_transaksi: this.form.jenis_transaksi,
            catatan_umum: this.form.catatan_umum,
            status_registrasi: "draft",
          },
          layanan: {
            ada_konsultasi: this.form.layanan.ada_konsultasi,
            channel_konsultasi: this.form.layanan.channel_konsultasi,
            ada_treatment: this.form.layanan.ada_treatment,
            ada_penjualan: this.form.layanan.ada_penjualan,
          },
          detail: {
            konsultasi_offline:
              this.form.layanan.channel_konsultasi === "offline"
                ? this.form.konsultasi_offline
                : null,
            konsultasi_online:
              this.form.layanan.channel_konsultasi === "online"
                ? this.form.konsultasi_online
                : null,
            treatment: this.form.layanan.ada_treatment
              ? this.form.treatment
              : null,
            penjualan: this.form.layanan.ada_penjualan
              ? this.form.penjualan
              : null,
          },
        };

        console.log("FORM PENDAFTARAN TERPADU REVISI:", payload);

        await new Promise((resolve) => setTimeout(resolve, 1200));
        this.showSnackbar("Pendaftaran layanan berhasil disimpan", "success");

        // next ideal:
        // this.$router.push(`/resepsionis/registrasi/detail/${registrasiId}`)
      } catch (error) {
        this.showSnackbar("Gagal menyimpan pendaftaran", "error");
      } finally {
        this.loading = false;
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
.page-wrap {
  padding: 24px;
}
.page-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}
.page-subtitle {
  margin-top: 8px;
  margin-bottom: 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}
.section-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
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
.action-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.h-100 {
  height: 100%;
}
@media (max-width: 768px) {
  .page-wrap {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .action-bar {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}
</style>

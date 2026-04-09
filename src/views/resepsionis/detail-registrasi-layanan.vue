<template>
  <div class="page-wrap">
    <div class="page-header d-flex justify-space-between align-start mb-6">
      <div>
        <h1 class="page-title">Detail Registrasi</h1>
        <p class="page-subtitle">
          Proses layanan pasien sebelum finalisasi ke pembayaran
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <!-- HEADER REGISTRASI -->
    <v-card rounded="xl" elevation="2" class="mb-6">
      <v-card-text class="pa-6">
        <div class="section-head mb-4">
          <div class="section-title">
            <v-icon class="mr-2" color="primary"
              >mdi-clipboard-account-outline</v-icon
            >
            Informasi Registrasi
          </div>
          <div class="section-subtitle">Data utama registrasi pasien</div>
        </div>

        <v-row dense>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="registrasi.no_registrasi"
              label="No. Registrasi"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="registrasi.tanggal"
              label="Tanggal"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="registrasi.pasien"
              label="Pasien"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="registrasi.dokter"
              label="Dokter Penanggung Jawab"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="registrasi.perawat"
              label="Perawat / Beautician"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="registrasi.sumber"
              label="Sumber"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="registrasi.jenis_transaksi"
              label="Jenis Transaksi"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>
        </v-row>

        <div class="status-row mt-4">
          <div class="d-flex align-center ga-3 flex-wrap">
            <div class="text-body-2 text-medium-emphasis">
              Status Registrasi
            </div>
            <v-chip
              :color="getStatusColor(registrasi.status_registrasi)"
              variant="flat"
              size="large"
            >
              {{ formatStatus(registrasi.status_registrasi) }}
            </v-chip>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-btn
              variant="text"
              color="secondary"
              prepend-icon="mdi-pencil"
              @click="editHeaderDialog = true"
            >
              Edit Header
            </v-btn>

            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-content-save"
              :loading="loadingSave"
              @click="saveDetail"
            >
              Simpan Perubahan
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- LAYANAN AKTIF -->
    <v-card rounded="xl" elevation="2" class="mb-6">
      <v-card-text class="pa-6">
        <div class="section-head mb-4">
          <div class="section-title">
            <v-icon class="mr-2" color="primary">mdi-format-list-checks</v-icon>
            Layanan Aktif
          </div>
          <div class="section-subtitle">
            Layanan yang termasuk dalam registrasi ini
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Konsultasi</div>
              <div class="summary-value small">
                {{
                  registrasi.layanan.ada_konsultasi
                    ? `Ya (${registrasi.layanan.channel_konsultasi})`
                    : "Tidak"
                }}
              </div>
              <v-chip
                v-if="registrasi.layanan.ada_konsultasi"
                :color="getStatusColor(statusLayanan.konsultasi)"
                class="mt-3"
                size="small"
              >
                {{ formatStatus(statusLayanan.konsultasi) }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Treatment</div>
              <div class="summary-value small">
                {{ registrasi.layanan.ada_treatment ? "Aktif" : "Tidak" }}
              </div>
              <v-chip
                v-if="registrasi.layanan.ada_treatment"
                :color="getStatusColor(statusLayanan.treatment)"
                class="mt-3"
                size="small"
              >
                {{ formatStatus(statusLayanan.treatment) }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Penjualan</div>
              <div class="summary-value small">
                {{ registrasi.layanan.ada_penjualan ? "Aktif" : "Tidak" }}
              </div>
              <v-chip
                v-if="registrasi.layanan.ada_penjualan"
                :color="getStatusColor(statusLayanan.penjualan)"
                class="mt-3"
                size="small"
              >
                {{ formatStatus(statusLayanan.penjualan) }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- KONSULTASI -->
    <v-expand-transition>
      <v-card
        v-if="registrasi.layanan.ada_konsultasi"
        rounded="xl"
        elevation="2"
        class="mb-6"
      >
        <v-card-text class="pa-6">
          <div class="service-head mb-4">
            <div>
              <div class="section-title">
                <v-icon class="mr-2" color="primary">
                  {{
                    registrasi.layanan.channel_konsultasi === "online"
                      ? "mdi-video-outline"
                      : "mdi-stethoscope"
                  }}
                </v-icon>
                {{
                  registrasi.layanan.channel_konsultasi === "online"
                    ? "Konsultasi Online"
                    : "Konsultasi Offline"
                }}
              </div>
              <div class="section-subtitle">
                Proses pemeriksaan dan catatan dokter
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                :color="getStatusColor(statusLayanan.konsultasi)"
                variant="flat"
              >
                {{ formatStatus(statusLayanan.konsultasi) }}
              </v-chip>

              <v-btn
                color="success"
                variant="flat"
                prepend-icon="mdi-check-circle"
                @click="markLayananSelesai('konsultasi')"
              >
                Tandai Selesai
              </v-btn>
            </div>
          </div>

          <!-- KONSULTASI OFFLINE -->
          <template v-if="registrasi.layanan.channel_konsultasi === 'offline'">
            <v-row dense>
              <v-col cols="12">
                <v-textarea
                  v-model="konsultasiOffline.keluhan_awal"
                  label="Keluhan Awal"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="konsultasiOffline.anamnesa"
                  label="Anamnesa"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="konsultasiOffline.diagnosis"
                  label="Diagnosis"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="konsultasiOffline.catatan_dokter"
                  label="Catatan Dokter"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </template>

          <!-- KONSULTASI ONLINE -->
          <template v-else>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="konsultasiOnline.request_dokter"
                  label="Request Dokter Khusus"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="konsultasiOnline.alergi"
                  label="Alergi"
                  rows="2"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="konsultasiOnline.keluhan"
                  label="Keluhan Utama"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="konsultasiOnline.review_dokter"
                  label="Review Dokter"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="konsultasiOnline.rekomendasi"
                  label="Rekomendasi"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
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
                    <v-img
                      :src="konsultasiOnline[photo.previewKey]"
                      height="220"
                      cover
                      rounded="lg"
                      class="bg-grey-lighten-3"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- TREATMENT -->
    <v-expand-transition>
      <v-card
        v-if="registrasi.layanan.ada_treatment"
        rounded="xl"
        elevation="2"
        class="mb-6"
      >
        <v-card-text class="pa-6">
          <div class="service-head mb-4">
            <div>
              <div class="section-title">
                <v-icon class="mr-2" color="primary">mdi-spa</v-icon>
                Treatment
              </div>
              <div class="section-subtitle">
                Tindakan aktual yang benar-benar dikerjakan
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                :color="getStatusColor(statusLayanan.treatment)"
                variant="flat"
              >
                {{ formatStatus(statusLayanan.treatment) }}
              </v-chip>

              <v-btn
                color="success"
                variant="flat"
                prepend-icon="mdi-check-circle"
                @click="markLayananSelesai('treatment')"
              >
                Tandai Selesai
              </v-btn>
            </div>
          </div>

          <div
            v-for="(item, index) in treatment.items"
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
                  label="Harga Aktual"
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
                  label="Nilai"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-row dense>
                  <v-col cols="12" md="10">
                    <v-textarea
                      v-model="item.catatan"
                      label="Catatan Tindakan"
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
                      @click="addTreatmentItem"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>

                    <v-btn
                      color="error"
                      variant="flat"
                      icon
                      :disabled="treatment.items.length === 1"
                      @click="removeTreatmentItem(index)"
                    >
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>

          <div class="summary-box mt-4">
            <div class="summary-label">Total Treatment Aktual</div>
            <div class="summary-value">
              Rp {{ formatNumber(totalTreatment) }}
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- PENJUALAN -->
    <v-expand-transition>
      <v-card
        v-if="registrasi.layanan.ada_penjualan"
        rounded="xl"
        elevation="2"
        class="mb-6"
      >
        <v-card-text class="pa-6">
          <div class="service-head mb-4">
            <div>
              <div class="section-title">
                <v-icon class="mr-2" color="primary">mdi-pill</v-icon>
                Penjualan Langsung
              </div>
              <div class="section-subtitle">
                Item penjualan final sebelum pembayaran
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                :color="getStatusColor(statusLayanan.penjualan)"
                variant="flat"
              >
                {{ formatStatus(statusLayanan.penjualan) }}
              </v-chip>

              <v-btn
                color="success"
                variant="flat"
                prepend-icon="mdi-check-circle"
                @click="markLayananSelesai('penjualan')"
              >
                Tandai Selesai
              </v-btn>
            </div>
          </div>

          <v-row dense class="mb-3">
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="penjualan.poin"
                label="Poin"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <div
            v-for="(item, index) in penjualan.items"
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
                  hide-details="auto"
                  @update:modelValue="fillPenjualanItem(index)"
                />
              </v-col>

              <v-col cols="12" md="2">
                <v-text-field
                  v-model.number="item.harga"
                  label="Harga Aktual"
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
                  label="Nilai"
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
                      :disabled="penjualan.items.length === 1"
                      @click="removePenjualanItem(index)"
                    >
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>

          <div class="summary-box mt-4">
            <div class="summary-label">Total Penjualan Final</div>
            <div class="summary-value">
              Rp {{ formatNumber(totalPenjualan) }}
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- FINALISASI -->
    <v-card rounded="xl" elevation="2">
      <v-card-text class="pa-6">
        <div class="section-head mb-4">
          <div class="section-title">
            <v-icon class="mr-2" color="primary">mdi-cash-register</v-icon>
            Finalisasi Registrasi
          </div>
          <div class="section-subtitle">
            Semua layanan aktif harus selesai sebelum bisa masuk ke pembayaran
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="6">
            <div class="summary-box">
              <div class="summary-label">Total Treatment</div>
              <div class="summary-value">
                Rp {{ formatNumber(totalTreatment) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="summary-box">
              <div class="summary-label">Total Penjualan</div>
              <div class="summary-value">
                Rp {{ formatNumber(totalPenjualan) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12">
            <div class="summary-final">
              <div>
                <div class="summary-final-label">Total Tagihan Sementara</div>
                <div class="summary-final-note">
                  Nilai ini akan dibawa ke halaman pembayaran setelah finalisasi
                </div>
              </div>

              <div class="summary-final-value">
                Rp {{ formatNumber(totalTagihan) }}
              </div>
            </div>
          </v-col>
        </v-row>

        <div class="action-bar">
          <v-btn
            variant="text"
            color="secondary"
            prepend-icon="mdi-arrow-left"
            @click="$router.back()"
          >
            Kembali
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-check-decagram"
            :loading="loadingFinalisasi"
            :disabled="!canFinalize || loadingFinalisasi"
            @click="finalizeRegistrasi"
          >
            Finalisasi ke Pembayaran
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- DIALOG EDIT HEADER -->
    <v-dialog v-model="editHeaderDialog" max-width="720">
      <v-card rounded="xl">
        <v-card-title class="text-h6">Edit Header Registrasi</v-card-title>

        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-select
                v-model="registrasi.dokter_id"
                label="Dokter"
                :items="dokterList"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="syncDokterLabel"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="registrasi.perawat_id"
                label="Perawat / Beautician"
                :items="perawatList"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="syncPerawatLabel"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="registrasi.catatan_umum"
                label="Catatan Umum"
                rows="3"
                auto-grow
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="editHeaderDialog = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" @click="saveHeaderDialog">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  name: "DetailRegistrasiPage",

  data() {
    return {
      loadingSave: false,
      loadingFinalisasi: false,
      editHeaderDialog: false,

      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        { title: "Registrasi", disabled: false, to: "/resepsionis/registrasi" },
        { title: "Detail Registrasi", disabled: true },
      ],

      registrasi: {
        id: 1001,
        no_registrasi: "REG-20260408-0001",
        tanggal: "2026-04-08",
        pasien: "Budi Santoso - 3276010101010001",
        pasien_new_id: "PS001",
        dokter: "dr. Andi Saputra",
        dokter_id: "D001",
        perawat: "Ns. Rina",
        perawat_id: "P001",
        sumber: "Pelanggan Lama",
        jenis_transaksi: "Umum",
        catatan_umum: "",
        status_registrasi: "proses_layanan",

        layanan: {
          ada_konsultasi: true,
          channel_konsultasi: "online",
          ada_treatment: true,
          ada_penjualan: true,
        },
      },

      statusLayanan: {
        konsultasi: "sedang_diproses",
        treatment: "draft_item",
        penjualan: "draft_item",
      },

      konsultasiOffline: {
        keluhan_awal: "",
        anamnesa: "",
        diagnosis: "",
        catatan_dokter: "",
      },

      konsultasiOnline: {
        request_dokter: "dr. Bunga",
        alergi: "Tidak ada",
        keluhan: "Jerawat aktif dan kulit sensitif",
        review_dokter: "",
        rekomendasi: "",
        preview_before_1: sisiKanan,
        preview_before_2: sisiTengah,
        preview_before_3: sisiKiri,
      },

      treatment: {
        items: [
          {
            tindakan_id: "TR001",
            jumlah: 1,
            beautician_id: "P001",
            harga: 150000,
            diskon_type: "%",
            diskon_value: 0,
            diskon_referral: 0,
            catatan: "",
          },
        ],
      },

      penjualan: {
        poin: 0,
        items: [
          {
            produk_id: "OB001",
            harga: 120000,
            jumlah: 1,
            unit: "PCS",
            diskon_type: "%",
            diskon_value: 0,
            diskon_referral: 0,
            frekuensi: "2x sehari",
            waktu_pakai: "Pagi",
            penggunaan: "Oles tipis pada wajah",
          },
        ],
      },

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

      photoCards: [
        {
          key: "before_1",
          title: "Foto Pasien 1",
          previewKey: "preview_before_1",
        },
        {
          key: "before_2",
          title: "Foto Pasien 2",
          previewKey: "preview_before_2",
        },
        {
          key: "before_3",
          title: "Foto Pasien 3",
          previewKey: "preview_before_3",
        },
      ],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    totalTreatment() {
      if (!this.registrasi.layanan.ada_treatment) return 0;
      return this.treatment.items.reduce((sum, item) => {
        return sum + this.getTreatmentSubtotal(item);
      }, 0);
    },

    totalPenjualan() {
      if (!this.registrasi.layanan.ada_penjualan) return 0;
      return this.penjualan.items.reduce((sum, item) => {
        return sum + this.getPenjualanSubtotal(item);
      }, 0);
    },

    totalTagihan() {
      return this.totalTreatment + this.totalPenjualan;
    },

    canFinalize() {
      const layananAktif = [];

      if (this.registrasi.layanan.ada_konsultasi)
        layananAktif.push(this.statusLayanan.konsultasi);
      if (this.registrasi.layanan.ada_treatment)
        layananAktif.push(this.statusLayanan.treatment);
      if (this.registrasi.layanan.ada_penjualan)
        layananAktif.push(this.statusLayanan.penjualan);

      return (
        layananAktif.length > 0 &&
        layananAktif.every((status) => status === "selesai")
      );
    },
  },

  methods: {
    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    formatStatus(status) {
      const map = {
        draft: "Draft",
        terdaftar: "Terdaftar",
        proses_layanan: "Proses Layanan",
        menunggu_pembayaran: "Menunggu Pembayaran",
        lunas: "Lunas",
        batal: "Batal",
        belum_diproses: "Belum Diproses",
        sedang_diproses: "Sedang Diproses",
        draft_item: "Draft Item",
        final: "Final",
        selesai: "Selesai",
      };
      return map[status] || status;
    },

    getStatusColor(status) {
      const map = {
        draft: "grey",
        terdaftar: "info",
        proses_layanan: "warning",
        menunggu_pembayaran: "primary",
        lunas: "success",
        batal: "error",
        belum_diproses: "grey",
        sedang_diproses: "warning",
        draft_item: "orange",
        final: "primary",
        selesai: "success",
      };
      return map[status] || "grey";
    },

    getDiskonAmount(base, type, value) {
      const numericBase = Number(base || 0);
      const numericValue = Number(value || 0);

      if (type === "%") {
        return (numericBase * numericValue) / 100;
      }

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
      const item = this.treatment.items[index];
      const tindakan = this.tindakanList.find((x) => x.id === item.tindakan_id);
      if (!tindakan) return;
      item.harga = tindakan.harga;
    },

    fillPenjualanItem(index) {
      const item = this.penjualan.items[index];
      const produk = this.obatList.find((x) => x.id === item.produk_id);
      if (!produk) return;
      item.harga = produk.harga;
      item.unit = produk.unit || "PCS";
    },

    addTreatmentItem() {
      this.treatment.items.push({
        tindakan_id: null,
        jumlah: 1,
        beautician_id: null,
        harga: 0,
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
        catatan: "",
      });
    },

    removeTreatmentItem(index) {
      if (this.treatment.items.length === 1) return;
      this.treatment.items.splice(index, 1);
    },

    addPenjualanItem() {
      this.penjualan.items.push({
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
      });
    },

    removePenjualanItem(index) {
      if (this.penjualan.items.length === 1) return;
      this.penjualan.items.splice(index, 1);
    },

    markLayananSelesai(layanan) {
      this.statusLayanan[layanan] = "selesai";
      this.showSnackbar(`Layanan ${layanan} ditandai selesai`, "success");
    },

    syncDokterLabel() {
      const dokter = this.dokterList.find(
        (x) => x.id === this.registrasi.dokter_id,
      );
      this.registrasi.dokter = dokter ? dokter.nama : "";
    },

    syncPerawatLabel() {
      const perawat = this.perawatList.find(
        (x) => x.id === this.registrasi.perawat_id,
      );
      this.registrasi.perawat = perawat ? perawat.nama : "";
    },

    saveHeaderDialog() {
      this.syncDokterLabel();
      this.syncPerawatLabel();
      this.editHeaderDialog = false;
      this.showSnackbar("Header registrasi berhasil diperbarui", "success");
    },

    async saveDetail() {
      this.loadingSave = true;

      try {
        const payload = {
          registrasi: this.registrasi,
          status_layanan: this.statusLayanan,
          konsultasi_offline:
            this.registrasi.layanan.ada_konsultasi &&
            this.registrasi.layanan.channel_konsultasi === "offline"
              ? this.konsultasiOffline
              : null,
          konsultasi_online:
            this.registrasi.layanan.ada_konsultasi &&
            this.registrasi.layanan.channel_konsultasi === "online"
              ? this.konsultasiOnline
              : null,
          treatment: this.registrasi.layanan.ada_treatment
            ? this.treatment
            : null,
          penjualan: this.registrasi.layanan.ada_penjualan
            ? this.penjualan
            : null,
        };

        console.log("SAVE DETAIL REGISTRASI:", payload);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.showSnackbar("Detail registrasi berhasil disimpan", "success");
      } finally {
        this.loadingSave = false;
      }
    },

    async finalizeRegistrasi() {
      if (!this.canFinalize) {
        this.showSnackbar(
          "Semua layanan aktif harus selesai terlebih dahulu",
          "error",
        );
        return;
      }

      this.loadingFinalisasi = true;

      try {
        const payload = {
          registrasi_id: this.registrasi.id,
          status_registrasi: "menunggu_pembayaran",
          total_treatment: this.totalTreatment,
          total_penjualan: this.totalPenjualan,
          total_tagihan: this.totalTagihan,
        };

        console.log("FINALIZE REGISTRASI:", payload);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        this.registrasi.status_registrasi = "menunggu_pembayaran";
        this.showSnackbar(
          "Registrasi berhasil difinalisasi ke pembayaran",
          "success",
        );

        // next:
        // this.$router.push(`/resepsionis/pembayaran/${this.registrasi.id}`)
      } finally {
        this.loadingFinalisasi = false;
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
  line-height: 1.15;
  margin: 0;
  color: #1f2937;
}

.page-subtitle {
  margin-top: 8px;
  margin-bottom: 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  color: #7c3aed;
}

.section-subtitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
}

.service-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.mini-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.line-item {
  padding: 14px;
  border-radius: 18px;
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.summary-box {
  border-radius: 18px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border: 1px solid rgba(251, 146, 60, 0.2);
  height: 100%;
}

.summary-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 8px;
}

.summary-value {
  font-size: 30px;
  font-weight: 900;
  color: #111827;
}

.summary-value.small {
  font-size: 18px;
  font-weight: 700;
}

.summary-final {
  margin-top: 6px;
  border-radius: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ef4444, #db2777);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.summary-final-label {
  font-size: 14px;
  opacity: 0.92;
}

.summary-final-note {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.82;
}

.summary-final-value {
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.photo-card {
  border: 1px solid rgba(124, 58, 237, 0.12);
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .summary-final {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .page-wrap {
    padding: 16px;
  }

  .status-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-bar {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .summary-value {
    font-size: 24px;
  }

  .summary-final-value {
    font-size: 28px;
    white-space: normal;
  }
}
</style>

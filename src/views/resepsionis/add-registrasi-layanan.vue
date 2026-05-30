<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Registrasi Layanan</h1>
        <p class="page-subtitle">
          Form registrasi layanan pasien dengan alur bertahap
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-alert
      v-if="mappingWarning"
      type="warning"
      density="comfortable"
      class="mb-4"
      closable
      @click:close="mappingWarning = ''"
    >
      {{ mappingWarning }}
    </v-alert>

    <v-row dense>
      <v-col cols="12" md="3">
        <v-card variant="flat" class="border mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-4">
              <v-avatar color="primary" size="44">
                <v-icon size="24">mdi-clipboard-text-outline</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Progress Form
                </div>
                <div class="text-caption text-medium-emphasis">
                  Step {{ currentStepIndex + 1 }} dari
                  {{ availableSteps.length }}
                </div>
              </div>
            </div>

            <v-progress-linear
              :model-value="
                availableSteps.length
                  ? ((currentStepIndex + 1) / availableSteps.length) * 100
                  : 0
              "
              color="primary"
              height="8"
              rounded
              class="mb-4"
            />

            <div class="d-flex flex-column ga-2">
              <v-card
                v-for="(step, index) in availableSteps"
                :key="step.key"
                :color="
                  step.key === currentStepKey
                    ? 'primary'
                    : index < currentStepIndex
                      ? 'success'
                      : undefined
                "
                :variant="
                  step.key === currentStepKey || index < currentStepIndex
                    ? 'tonal'
                    : 'outlined'
                "
                rounded="lg"
                role="button"
                @click="goToStep(step.key, index)"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center ga-3">
                    <v-avatar
                      :color="
                        step.key === currentStepKey
                          ? 'primary'
                          : index < currentStepIndex
                            ? 'success'
                            : 'grey'
                      "
                      :variant="
                        step.key === currentStepKey || index < currentStepIndex
                          ? 'flat'
                          : 'tonal'
                      "
                      size="32"
                    >
                      <v-icon size="18">
                        {{ index < currentStepIndex ? "mdi-check" : step.icon }}
                      </v-icon>
                    </v-avatar>

                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-bold">
                        {{ step.shortTitle || step.title }}
                      </div>

                      <div
                        v-if="step.key === currentStepKey"
                        class="text-caption text-medium-emphasis"
                      >
                        Sedang diisi
                      </div>

                      <div
                        v-else-if="index < currentStepIndex"
                        class="text-caption text-medium-emphasis"
                      >
                        Selesai
                      </div>

                      <div v-else class="text-caption text-medium-emphasis">
                        Belum diisi
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card variant="flat" class="border mb-4">
          <v-card-text class="pa-4">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
            >
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary" size="46">
                  <v-icon size="24">
                    {{
                      currentStepMeta.icon || "mdi-file-document-edit-outline"
                    }}
                  </v-icon>
                </v-avatar>

                <div>
                  <div class="text-h6 font-weight-bold">
                    {{ currentStepMeta.title }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ currentStepMeta.subtitle }}
                  </div>
                </div>
              </div>

              <v-chip color="primary" class="font-weight-bold">
                {{
                  Math.round(
                    availableSteps.length
                      ? ((currentStepIndex + 1) / availableSteps.length) * 100
                      : 0,
                  )
                }}%
              </v-chip>
            </div>

            <v-divider class="mb-4" />

            <v-window v-model="currentStepKey">
              <v-window-item value="registrasi">
                <InformasiRegistrasi
                  v-if="currentStepKey === 'registrasi'"
                  :form="form"
                  :rules="rules"
                  :pasien-list="pasienList"
                  :dokter-list="dokterList"
                  :perawat-list="perawatList"
                  @update-field="updateFormField"
                  @patient-change="onPatientChange"
                />
              </v-window-item>

              <v-window-item value="layanan">
                <PilihLayanan
                  v-if="currentStepKey === 'layanan'"
                  :form="form"
                  :selected-konsultasi-mapping="selectedKonsultasiMapping"
                  :accurate-mapping-list="accurateMappingList"
                  @update-field="updateLayananField"
                  @update-layanan-field="updateLayananField"
                />
              </v-window-item>

              <v-window-item value="konsultasi">
                <KonsultasiOffline
                  v-if="
                    currentStepKey === 'konsultasi' &&
                    form.layanan.channel_konsultasi === 'offline'
                  "
                  :form="form"
                  :rules="rules"
                  @update-konsultasi-offline="updateKonsultasiOffline"
                />

                <KonsultasiOnline
                  v-else-if="
                    currentStepKey === 'konsultasi' &&
                    form.layanan.channel_konsultasi === 'online'
                  "
                  :form="form"
                  :rules="rules"
                  :drag-active="dragActive"
                  :consultation-history="consultationHistory"
                  :history-headers="historyHeaders"
                  :photo-cards="photoCards"
                  @update-konsultasi-online="updateKonsultasiOnline"
                  @drag-over="onDragOver"
                  @drag-leave="onDragLeave"
                  @file-drop="onDrop"
                  @file-change="onFileChange"
                  @remove-image="removeImage"
                />
              </v-window-item>

              <v-window-item value="treatment">
                <TreatmentSection
                  v-if="currentStepKey === 'treatment'"
                  :form="form"
                  :tindakan-list="tindakanList"
                  :total-treatment="totalTreatment"
                  :format-number="formatNumber"
                  :get-subtotal="getTreatmentSubtotal"
                  @update-treatment="form.treatment = $event"
                  @update-item="updateTreatmentItem"
                  @add-item="addTreatmentItem"
                  @remove-item="removeTreatmentItem"
                />
              </v-window-item>

              <v-window-item value="penjualan">
                <PenjualanSection
                  v-if="currentStepKey === 'penjualan'"
                  :form="form"
                  :obat-list="obatList"
                  :total-penjualan="totalPenjualan"
                  :format-number="formatNumber"
                  :get-subtotal="getPenjualanSubtotal"
                  @update-item="updatePenjualanItem"
                  @add-item="addPenjualanItem"
                  @remove-item="removePenjualanItem"
                />
              </v-window-item>

              <v-window-item value="ringkasan">
                <RingkasanSection
                  v-if="currentStepKey === 'ringkasan'"
                  :form="form"
                  :pasien-list="pasienList"
                  :dokter-list="dokterList"
                  :perawat-list="perawatList"
                  :tindakan-list="tindakanList"
                  :obat-list="obatList"
                  :total-treatment="totalTreatment"
                  :total-penjualan="totalPenjualan"
                  :total-konsultasi="totalKonsultasi"
                  :selected-konsultasi-mapping="selectedKonsultasiMapping"
                  :format-number="formatNumber"
                  :get-treatment-subtotal="getTreatmentSubtotal"
                  :get-penjualan-subtotal="getPenjualanSubtotal"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>

        <v-card variant="flat" class="border">
          <v-card-text class="pa-4">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-3"
            >
              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  {{ currentStepMeta.title }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ currentStepMeta.subtitle }}
                </div>
              </div>

              <div class="d-flex flex-wrap ga-2">
                <v-btn
                  variant="outlined"
                  color="grey-darken-1"
                  prepend-icon="mdi-arrow-left"
                  :disabled="isFirstStep || loading"
                  @click="prevStep"
                >
                  Sebelumnya
                </v-btn>

                <v-btn
                  color="error"
                  prepend-icon="mdi-refresh"
                  :disabled="loading"
                  @click="resetForm"
                >
                  Reset
                </v-btn>

                <v-btn
                  v-if="!isLastStep"
                  color="primary"
                  variant="flat"
                  append-icon="mdi-arrow-right"
                  :disabled="loading"
                  @click="nextStep"
                >
                  Lanjut
                </v-btn>

                <v-btn
                  v-else
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-content-save-outline"
                  :loading="loading"
                  :disabled="loading"
                  @click="handleSubmit"
                >
                  Simpan Registrasi
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="2500"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import registrasiLayananService from "@/services/registrasi/registrasiLayananService";
import referenceService from "@/services/referenceService";

import InformasiRegistrasi from "@/components/registrasi-layanan/informasi-registrasi.vue";
import PilihLayanan from "@/components/registrasi-layanan/pilih-layanan.vue";
import KonsultasiOffline from "@/components/registrasi-layanan/konsultasi-offline.vue";
import KonsultasiOnline from "@/components/registrasi-layanan/konsultasi-online.vue";
import TreatmentSection from "@/components/registrasi-layanan/treatment-section.vue";
import PenjualanSection from "@/components/registrasi-layanan/penjualan-section.vue";
import RingkasanSection from "@/components/registrasi-layanan/ringkasan-section.vue";

export default {
  name: "RegistrasiLayanan",

  components: {
    InformasiRegistrasi,
    PilihLayanan,
    KonsultasiOffline,
    KonsultasiOnline,
    TreatmentSection,
    PenjualanSection,
    RingkasanSection,
  },

  data() {
    return {
      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        {
          title: "Registrasi Layanan",
          disabled: false,
          to: "/resepsionis/registrasi-layanan",
        },
      ],

      currentStepKey: "registrasi",
      loading: false,
      dragActive: null,
      consultationHistory: [],
      accurateMappingList: [],
      mappingWarning: "",

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!v || "Field ini wajib diisi",
      },

      pasienList: [],
      dokterList: [],
      perawatList: [],
      tindakanList: [],
      obatList: [],

      historyHeaders: [
        { title: "TGL", key: "tgl" },
        { title: "DOKTER", key: "dokter" },
        { title: "TINDAKAN & PERAWAT", key: "tindakan_html", sortable: false },
        { title: "OBAT", key: "obat_html", sortable: false },
        { title: "CATATAN DOKTER", key: "catatan_html", sortable: false },
        { title: "KLINIK", key: "lokasi" },
      ],

      photoCards: [
        {
          key: "before_1",
          title: "Foto Kiri",
          previewKey: "preview_before_1",
          fileNameKey: "file_name_1",
        },
        {
          key: "before_2",
          title: "Foto Depan",
          previewKey: "preview_before_2",
          fileNameKey: "file_name_2",
        },
        {
          key: "before_3",
          title: "Foto Kanan",
          previewKey: "preview_before_3",
          fileNameKey: "file_name_3",
        },
      ],

      form: null,
    };
  },

  computed: {
    hasSelectedLayanan() {
      const layanan = this.form?.layanan || {};

      return (
        Boolean(layanan.ada_konsultasi) ||
        Boolean(layanan.ada_treatment) ||
        Boolean(layanan.ada_penjualan)
      );
    },

    availableSteps() {
      const layanan = this.form?.layanan || {};

      const steps = [
        {
          key: "registrasi",
          title: "Informasi Registrasi",
          shortTitle: "Registrasi",
          subtitle: "Lengkapi data dasar pasien",
          icon: "mdi-account",
        },
        {
          key: "layanan",
          title: "Pilih Layanan",
          shortTitle: "Layanan",
          subtitle: "Tentukan layanan yang akan diproses",
          icon: "mdi-format-list-checks",
        },
      ];

      if (layanan.ada_konsultasi) {
        steps.push({
          key: "konsultasi",
          title:
            layanan.channel_konsultasi === "online"
              ? "Konsultasi Online"
              : "Konsultasi Offline",
          shortTitle: "Konsultasi",
          subtitle:
            layanan.channel_konsultasi === "online"
              ? "Lengkapi data konsultasi online"
              : "Lengkapi keluhan awal pasien",
          icon:
            layanan.channel_konsultasi === "online"
              ? "mdi-video-outline"
              : "mdi-stethoscope",
        });
      }

      if (layanan.ada_treatment) {
        steps.push({
          key: "treatment",
          title: "Treatment",
          shortTitle: "Treatment",
          subtitle: `${this.form?.treatment?.items?.length || 0} item treatment`,
          icon: "mdi-spa",
        });
      }

      if (layanan.ada_penjualan) {
        steps.push({
          key: "penjualan",
          title: "Penjualan",
          shortTitle: "Penjualan",
          subtitle: `${this.form?.penjualan?.items?.length || 0} item produk`,
          icon: "mdi-pill",
        });
      }

      if (this.hasSelectedLayanan) {
        steps.push({
          key: "ringkasan",
          title: "Ringkasan Registrasi",
          shortTitle: "Ringkasan",
          subtitle: "Periksa kembali seluruh data",
          icon: "mdi-clipboard-check-outline",
        });
      }

      return steps;
    },

    availableStepKeys() {
      return this.availableSteps.map((step) => step.key).join("|");
    },

    currentStepIndex() {
      return this.availableSteps.findIndex(
        (step) => step.key === this.currentStepKey,
      );
    },

    currentStepMeta() {
      return (
        this.availableSteps[this.currentStepIndex] || {
          title: "Informasi Registrasi",
          subtitle: "",
          icon: "mdi-account-card-details-outline",
        }
      );
    },

    isFirstStep() {
      return this.currentStepIndex <= 0;
    },

    isLastStep() {
      return this.currentStepKey === "ringkasan";
    },

    progressWidth() {
      if (!this.availableSteps.length) return "0%";
      if (this.availableSteps.length === 1) return "100%";

      const index = Math.max(this.currentStepIndex, 0);
      const percent = (index / (this.availableSteps.length - 1)) * 100;

      return `${percent}%`;
    },

    totalTreatment() {
      if (!this.form?.layanan?.ada_treatment) return 0;

      return (this.form?.treatment?.items || []).reduce((sum, item) => {
        return sum + this.getTreatmentSubtotal(item);
      }, 0);
    },

    totalPenjualan() {
      if (!this.form?.layanan?.ada_penjualan) return 0;

      return (this.form?.penjualan?.items || []).reduce((sum, item) => {
        return sum + this.getPenjualanSubtotal(item);
      }, 0);
    },

    selectedKonsultasiSourceCode() {
      return this.getKonsultasiSourceCode();
    },

    selectedKonsultasiMapping() {
      return this.getAccurateMappingBySourceCode(
        this.selectedKonsultasiSourceCode,
      );
    },

    totalKonsultasi() {
      const mapping = this.selectedKonsultasiMapping;

      if (!this.form?.layanan?.ada_konsultasi || !mapping) {
        return 0;
      }

      if (this.form?.layanan?.ada_treatment) {
        return 0;
      }

      if (!this.toBoolean(mapping.is_billable)) {
        return 0;
      }

      return Number(mapping.default_harga || 0);
    },
  },

  watch: {
    availableStepKeys() {
      this.ensureCurrentStepAvailable();
    },
  },

  created() {
    this.form = this.getInitialForm();
    this.loadAccurateMappings();
  },

  methods: {
    getSelectedTokoId() {
      return (
        this.form?.toko_id ||
        this.form?.tokoId ||
        localStorage.getItem("selected_toko_id") ||
        null
      );
    },

    getErrorMessage(error) {
      const response = error?.response?.data;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];

        if (firstKey && Array.isArray(response.errors[firstKey])) {
          return response.errors[firstKey][0];
        }
      }

      return (
        response?.message ||
        response?.error ||
        error?.message ||
        "Gagal menyimpan registrasi"
      );
    },

    showSnackbar(text, color = "success") {
      this.snackbar.show = true;
      this.snackbar.text = text;
      this.snackbar.color = color;
    },

    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();

      return `${year}-${month}-${day}`;
    },

    toBoolean(value) {
      return value === true || value === 1 || value === "1";
    },

    createEmptyTreatmentItem() {
      return {
        tindakan_id: null,
        harga: 0,
        jumlah: 1,
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
      };
    },

    createEmptyPenjualanItem() {
      return {
        produk_id: null,
        harga: 0,
        jumlah: 1,
        unit: "",
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
        frekuensi: "",
        waktu_pakai: "",
        penggunaan: "",
      };
    },

    getInitialForm() {
      return {
        toko_id: localStorage.getItem("selected_toko_id") || null,
        tanggal: this.getToday(),
        pasien_new_id: null,
        pasien_id: null,
        dokter_id: null,
        perawat_id: null,

        konsultasi_source_code: null,
        konsultasi_source_name: null,
        konsultasi_mapping_id: null,
        konsultasi_kode_accurate: null,
        konsultasi_nama_accurate: null,

        total_konsultasi: 0,
        rule_biaya_konsultasi: 0,

        is_pembelian_online: false,
        pembelian_online_source_code: null,
        pembelian_online_source_name: null,
        pembelian_online_mapping_id: null,
        pembelian_online_kode_accurate: null,
        pembelian_online_nama_accurate: null,

        layanan: {
          ada_konsultasi: false,
          channel_konsultasi: "",

          konsultasi_source_code: null,
          konsultasi_source_name: null,
          konsultasi_mapping_id: null,
          konsultasi_kode_accurate: null,
          konsultasi_nama_accurate: null,

          ada_treatment: false,
          ada_penjualan: false,
          route_treatment: "",

          is_pembelian_online: false,
          pembelian_online_source_code: null,
          pembelian_online_source_name: null,
          pembelian_online_mapping_id: null,
          pembelian_online_kode_accurate: null,
          pembelian_online_nama_accurate: null,
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
          sedang_hamil: "",
          sedang_menyusui: "",
          bukti_foto_kiri: "",
          bukti_foto_depan: "",
          bukti_foto_kanan: "",
          preview_before_1: "",
          preview_before_2: "",
          preview_before_3: "",
          file_name_1: "",
          file_name_2: "",
          file_name_3: "",
        },

        treatment: {
          items: [this.createEmptyTreatmentItem()],
        },

        penjualan: {
          poin: 0,
          items: [this.createEmptyPenjualanItem()],
        },
      };
    },

    async loadAccurateMappings() {
      this.mappingWarning = "";

      try {
        if (typeof referenceService.accurateItemMapping !== "function") {
          this.mappingWarning =
            "Method referenceService.accurateItemMapping belum tersedia.";
          this.accurateMappingList = [];
          return;
        }

        this.accurateMappingList = await referenceService.accurateItemMapping();

        this.syncRegistrasiAccurateMapping();
      } catch (error) {
        console.error(error);
        this.accurateMappingList = [];
        this.mappingWarning =
          "Mapping Accurate gagal dimuat. Cek endpoint /reference/accurate-item-mapping.";
      }
    },

    async ensureAccurateMappingsLoaded() {
      if (
        Array.isArray(this.accurateMappingList) &&
        this.accurateMappingList.length > 0
      ) {
        return true;
      }

      await this.loadAccurateMappings();

      return (
        Array.isArray(this.accurateMappingList) &&
        this.accurateMappingList.length > 0
      );
    },

    getAccurateMappingBySourceCode(sourceCode) {
      if (!sourceCode) {
        return null;
      }

      return (
        (this.accurateMappingList || []).find((item) => {
          return (
            String(item?.source_code || "").toUpperCase() ===
            String(sourceCode || "").toUpperCase()
          );
        }) || null
      );
    },

    getKonsultasiSourceCode() {
      const layanan = this.form?.layanan || {};

      if (!layanan.ada_konsultasi) {
        return null;
      }

      if (layanan.konsultasi_source_code) {
        return layanan.konsultasi_source_code;
      }

      return layanan.channel_konsultasi === "online"
        ? "KONSULTASI_ONLINE"
        : "KONSULTASI_OFFLINE";
    },

    syncRegistrasiAccurateMapping() {
      if (!this.form) return;

      const sourceCode = this.getKonsultasiSourceCode();
      const mapping = this.getAccurateMappingBySourceCode(sourceCode);

      this.form.konsultasi_source_code = mapping?.source_code || sourceCode;
      this.form.konsultasi_source_name =
        mapping?.source_name ||
        this.form.layanan?.konsultasi_source_name ||
        mapping?.nama_accurate ||
        null;
      this.form.konsultasi_mapping_id =
        mapping?.id || this.form.layanan?.konsultasi_mapping_id || null;
      this.form.konsultasi_kode_accurate =
        mapping?.kode_accurate ||
        this.form.layanan?.konsultasi_kode_accurate ||
        null;
      this.form.konsultasi_nama_accurate =
        mapping?.nama_accurate ||
        this.form.layanan?.konsultasi_nama_accurate ||
        null;

      if (this.form.layanan) {
        this.form.layanan.konsultasi_source_code =
          mapping?.source_code || sourceCode;
        this.form.layanan.konsultasi_source_name =
          mapping?.source_name ||
          this.form.layanan?.konsultasi_source_name ||
          mapping?.nama_accurate ||
          null;
        this.form.layanan.konsultasi_mapping_id =
          mapping?.id || this.form.layanan?.konsultasi_mapping_id || null;
        this.form.layanan.konsultasi_kode_accurate =
          mapping?.kode_accurate ||
          this.form.layanan?.konsultasi_kode_accurate ||
          null;
        this.form.layanan.konsultasi_nama_accurate =
          mapping?.nama_accurate ||
          this.form.layanan?.konsultasi_nama_accurate ||
          null;
      }

      this.form.total_konsultasi = this.totalKonsultasi;

      if (!sourceCode) {
        this.form.rule_biaya_konsultasi = 0;
      } else if (this.form.layanan.ada_treatment) {
        this.form.rule_biaya_konsultasi = 2;
      } else if (this.totalKonsultasi > 0) {
        this.form.rule_biaya_konsultasi = 1;
      } else {
        this.form.rule_biaya_konsultasi = 3;
      }

      const isPembelianOnline = Boolean(
        this.form.layanan?.ada_penjualan &&
        this.form.layanan?.is_pembelian_online,
      );

      const pembelianOnlineMapping = isPembelianOnline
        ? this.getPembelianOnlineMapping()
        : null;

      this.form.is_pembelian_online = isPembelianOnline;
      this.form.pembelian_online_source_code = isPembelianOnline
        ? pembelianOnlineMapping?.source_code || "PEMBELIAN_ONLINE"
        : null;
      this.form.pembelian_online_source_name = isPembelianOnline
        ? pembelianOnlineMapping?.source_name ||
          this.form.layanan?.pembelian_online_source_name ||
          "Pembelian Online"
        : null;
      this.form.pembelian_online_mapping_id = isPembelianOnline
        ? pembelianOnlineMapping?.id ||
          this.form.layanan?.pembelian_online_mapping_id ||
          null
        : null;
      this.form.pembelian_online_kode_accurate = isPembelianOnline
        ? pembelianOnlineMapping?.kode_accurate ||
          this.form.layanan?.pembelian_online_kode_accurate ||
          null
        : null;
      this.form.pembelian_online_nama_accurate = isPembelianOnline
        ? pembelianOnlineMapping?.nama_accurate ||
          this.form.layanan?.pembelian_online_nama_accurate ||
          null
        : null;

      if (this.form.layanan) {
        this.form.layanan.is_pembelian_online = isPembelianOnline;
        this.form.layanan.pembelian_online_source_code =
          this.form.pembelian_online_source_code;
        this.form.layanan.pembelian_online_source_name =
          this.form.pembelian_online_source_name;
        this.form.layanan.pembelian_online_mapping_id =
          this.form.pembelian_online_mapping_id;
        this.form.layanan.pembelian_online_kode_accurate =
          this.form.pembelian_online_kode_accurate;
        this.form.layanan.pembelian_online_nama_accurate =
          this.form.pembelian_online_nama_accurate;
      }
    },
    getPembelianOnlineMapping() {
      return this.getAccurateMappingBySourceCode("PEMBELIAN_ONLINE");
    },

    validateRequiredAccurateMapping() {
      if (this.form?.layanan?.ada_konsultasi) {
        const sourceCode = this.getKonsultasiSourceCode();

        if (!sourceCode) {
          this.showSnackbar("Source code konsultasi belum terbentuk", "error");
          return false;
        }

        const mapping = this.getAccurateMappingBySourceCode(sourceCode);

        if (!mapping) {
          this.showSnackbar(
            `Mapping Accurate ${sourceCode} belum tersedia di master_accurate_item_mapping`,
            "error",
          );
          return false;
        }

        if (
          this.toBoolean(mapping.is_send_to_accurate) &&
          !mapping.kode_accurate
        ) {
          this.showSnackbar(
            `Kode Accurate untuk ${mapping.source_name || sourceCode} belum diisi`,
            "error",
          );
          return false;
        }
      }

      if (
        this.form?.layanan?.ada_penjualan &&
        this.form?.layanan?.is_pembelian_online
      ) {
        const mapping = this.getPembelianOnlineMapping();

        if (!mapping) {
          this.showSnackbar(
            "Mapping Accurate PEMBELIAN_ONLINE belum tersedia di master_accurate_item_mapping",
            "error",
          );
          return false;
        }

        if (
          this.toBoolean(mapping.is_send_to_accurate) &&
          !mapping.kode_accurate
        ) {
          this.showSnackbar(
            "Kode Accurate untuk PEMBELIAN_ONLINE belum diisi",
            "error",
          );
          return false;
        }
      }

      return true;
    },

    normalizeLayanan(value = {}) {
      const adaKonsultasi = Boolean(value.ada_konsultasi);
      const adaTreatment = Boolean(value.ada_treatment);
      const adaPenjualan = Boolean(value.ada_penjualan);

      let konsultasiSourceCode = value.konsultasi_source_code || null;
      let channelKonsultasi = value.channel_konsultasi || "";

      if (!adaKonsultasi) {
        konsultasiSourceCode = null;
        channelKonsultasi = "";
      }

      if (adaKonsultasi && konsultasiSourceCode && !channelKonsultasi) {
        channelKonsultasi = String(konsultasiSourceCode)
          .toUpperCase()
          .includes("ONLINE")
          ? "online"
          : "offline";
      }

      const konsultasiMapping = adaKonsultasi
        ? this.getAccurateMappingBySourceCode(konsultasiSourceCode)
        : null;

      const isPembelianOnline = adaPenjualan
        ? Boolean(value.is_pembelian_online)
        : false;

      const pembelianOnlineMapping = isPembelianOnline
        ? this.getPembelianOnlineMapping()
        : null;

      return {
        ada_konsultasi: adaKonsultasi,
        channel_konsultasi: channelKonsultasi,

        konsultasi_source_code: adaKonsultasi
          ? konsultasiMapping?.source_code || konsultasiSourceCode
          : null,
        konsultasi_source_name: adaKonsultasi
          ? konsultasiMapping?.source_name ||
            value.konsultasi_source_name ||
            null
          : null,
        konsultasi_mapping_id: adaKonsultasi
          ? konsultasiMapping?.id || value.konsultasi_mapping_id || null
          : null,
        konsultasi_kode_accurate: adaKonsultasi
          ? konsultasiMapping?.kode_accurate ||
            value.konsultasi_kode_accurate ||
            null
          : null,
        konsultasi_nama_accurate: adaKonsultasi
          ? konsultasiMapping?.nama_accurate ||
            value.konsultasi_nama_accurate ||
            null
          : null,

        ada_treatment: adaTreatment,
        ada_penjualan: adaPenjualan,
        route_treatment: value.route_treatment || "",

        is_pembelian_online: isPembelianOnline,
        pembelian_online_source_code: isPembelianOnline
          ? pembelianOnlineMapping?.source_code ||
            value.pembelian_online_source_code ||
            "PEMBELIAN_ONLINE"
          : null,
        pembelian_online_source_name: isPembelianOnline
          ? pembelianOnlineMapping?.source_name ||
            value.pembelian_online_source_name ||
            "Pembelian Online"
          : null,
        pembelian_online_mapping_id: isPembelianOnline
          ? pembelianOnlineMapping?.id ||
            value.pembelian_online_mapping_id ||
            null
          : null,
        pembelian_online_kode_accurate: isPembelianOnline
          ? pembelianOnlineMapping?.kode_accurate ||
            value.pembelian_online_kode_accurate ||
            null
          : null,
        pembelian_online_nama_accurate: isPembelianOnline
          ? pembelianOnlineMapping?.nama_accurate ||
            value.pembelian_online_nama_accurate ||
            null
          : null,
      };
    },

    ensureCurrentStepAvailable() {
      const exists = this.availableSteps.some(
        (step) => step.key === this.currentStepKey,
      );

      if (exists) return;

      const layananStepExists = this.availableSteps.some(
        (step) => step.key === "layanan",
      );

      this.currentStepKey = layananStepExists ? "layanan" : "registrasi";
    },

    syncDetailItemsByLayanan() {
      if (!this.form) return;

      if (!this.form.treatment) {
        this.form.treatment = {
          items: [this.createEmptyTreatmentItem()],
        };
      }

      if (!this.form.penjualan) {
        this.form.penjualan = {
          poin: 0,
          items: [this.createEmptyPenjualanItem()],
        };
      }

      if (
        this.form.layanan.ada_treatment &&
        (!Array.isArray(this.form.treatment.items) ||
          this.form.treatment.items.length === 0)
      ) {
        this.form.treatment.items = [this.createEmptyTreatmentItem()];
      }

      if (
        this.form.layanan.ada_penjualan &&
        (!Array.isArray(this.form.penjualan.items) ||
          this.form.penjualan.items.length === 0)
      ) {
        this.form.penjualan.items = [this.createEmptyPenjualanItem()];
      }

      if (!this.form.layanan.ada_treatment) {
        this.form.treatment.items = [this.createEmptyTreatmentItem()];
      }

      if (!this.form.layanan.ada_penjualan) {
        this.form.penjualan.items = [this.createEmptyPenjualanItem()];
      }
    },

    applyLayananSelection(value = {}) {
      this.form.layanan = this.normalizeLayanan(value);
      this.syncDetailItemsByLayanan();
      this.syncRegistrasiAccurateMapping();
      this.ensureCurrentStepAvailable();
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    goToStep(stepKey, index) {
      if (index <= this.currentStepIndex) {
        this.currentStepKey = stepKey;
      }
    },

    updateFormField({ field, value }) {
      this.form[field] = value;
    },

    updateLayananField(payload) {
      if (!payload || !this.form) return;

      if (payload.field === "layanan") {
        this.applyLayananSelection(payload.value || {});
        return;
      }

      if (
        Object.prototype.hasOwnProperty.call(payload, "ada_konsultasi") ||
        Object.prototype.hasOwnProperty.call(payload, "ada_treatment") ||
        Object.prototype.hasOwnProperty.call(payload, "ada_penjualan") ||
        Object.prototype.hasOwnProperty.call(payload, "is_pembelian_online")
      ) {
        this.applyLayananSelection({
          ...this.form.layanan,
          ...payload,
        });
        return;
      }

      if (payload.field) {
        this.applyLayananSelection({
          ...this.form.layanan,
          [payload.field]: payload.value,
        });
      }
    },

    updateKonsultasiOffline({ field, value }) {
      this.form.konsultasi_offline[field] = value;
    },

    updateKonsultasiOnline({ field, value }) {
      this.form.konsultasi_online[field] = value;
    },

    fillTreatmentPrice(index) {
      const item = this.form.treatment.items[index];
      const found = this.tindakanList.find((x) => x.id === item.tindakan_id);

      item.harga = found ? found.harga || 0 : 0;
    },

    fillProdukPrice(index) {
      const item = this.form.penjualan.items[index];
      const found = this.obatList.find((x) => x.id === item.produk_id);

      item.harga = found ? found.harga || 0 : 0;
      item.unit = found ? found.unit || "" : "";
    },

    updateTreatmentItem({ index, field, value }) {
      this.form.treatment.items[index][field] = value;

      if (field === "tindakan_id") {
        this.fillTreatmentPrice(index);
      }
    },

    addTreatmentItem() {
      this.form.treatment.items.push(this.createEmptyTreatmentItem());
    },

    removeTreatmentItem(index) {
      if (this.form.treatment.items.length === 1) {
        this.form.treatment.items = [this.createEmptyTreatmentItem()];
        return;
      }

      this.form.treatment.items.splice(index, 1);
    },

    updatePenjualanItem({ index, field, value }) {
      this.form.penjualan.items[index][field] = value;

      if (field === "produk_id") {
        this.fillProdukPrice(index);
      }
    },

    addPenjualanItem() {
      this.form.penjualan.items.push(this.createEmptyPenjualanItem());
    },

    removePenjualanItem(index) {
      if (this.form.penjualan.items.length === 1) {
        this.form.penjualan.items = [this.createEmptyPenjualanItem()];
        return;
      }

      this.form.penjualan.items.splice(index, 1);
    },

    getTreatmentSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.jumlah || 0);

      const diskon =
        item.diskon_type === "%"
          ? (base * Number(item.diskon_value || 0)) / 100
          : Number(item.diskon_value || 0);

      return Math.max(base - diskon - Number(item.diskon_referral || 0), 0);
    },

    getPenjualanSubtotal(item) {
      const base = Number(item.harga || 0) * Number(item.jumlah || 0);

      const diskon =
        item.diskon_type === "%"
          ? (base * Number(item.diskon_value || 0)) / 100
          : Number(item.diskon_value || 0);

      return Math.max(base - diskon - Number(item.diskon_referral || 0), 0);
    },

    validateRegistrasiStep() {
      if (!this.getSelectedTokoId()) {
        this.showSnackbar("Cabang aktif belum dipilih", "error");
        return false;
      }

      if (!this.form.tanggal || !this.form.pasien_new_id) {
        this.showSnackbar(
          "Lengkapi tanggal registrasi dan pasien terlebih dahulu",
          "error",
        );
        return false;
      }

      return true;
    },

    validateLayananStep() {
      if (!this.hasSelectedLayanan) {
        this.showSnackbar("Pilih minimal satu layanan", "error");
        return false;
      }

      if (
        this.form.layanan.ada_konsultasi &&
        !this.form.layanan.channel_konsultasi
      ) {
        this.showSnackbar("Pilih channel konsultasi", "error");
        return false;
      }

      return true;
    },

    validateKonsultasiStep() {
      if (!this.form.layanan.ada_konsultasi) return true;

      if (this.form.layanan.channel_konsultasi === "offline") {
        if (!this.form.konsultasi_offline.keluhan_awal) {
          this.showSnackbar(
            "Keluhan awal konsultasi offline wajib diisi",
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
          this.showSnackbar(
            "Lengkapi field wajib pada konsultasi online",
            "error",
          );
          return false;
        }
      }

      return true;
    },

    validateTreatmentStep() {
      if (!this.form.layanan.ada_treatment) return true;

      const items = this.form.treatment.items || [];
      const invalid = items.some(
        (item) => !item.tindakan_id || Number(item.jumlah || 0) <= 0,
      );

      if (!items.length || invalid) {
        this.showSnackbar("Lengkapi item treatment terlebih dahulu", "error");
        return false;
      }

      return true;
    },

    validatePenjualanStep() {
      if (!this.form.layanan.ada_penjualan) return true;

      const items = this.form.penjualan.items || [];
      const invalid = items.some(
        (item) => !item.produk_id || Number(item.jumlah || 0) <= 0,
      );

      if (!items.length || invalid) {
        this.showSnackbar("Lengkapi item penjualan terlebih dahulu", "error");
        return false;
      }

      return true;
    },

    validateCurrentStep() {
      if (this.currentStepKey === "registrasi") {
        return this.validateRegistrasiStep();
      }

      if (this.currentStepKey === "layanan") {
        return this.validateLayananStep();
      }

      if (this.currentStepKey === "konsultasi") {
        return this.validateKonsultasiStep();
      }

      if (this.currentStepKey === "treatment") {
        return this.validateTreatmentStep();
      }

      if (this.currentStepKey === "penjualan") {
        return this.validatePenjualanStep();
      }

      return true;
    },

    validateAllBeforeSubmit() {
      return (
        this.validateRegistrasiStep() &&
        this.validateLayananStep() &&
        this.validateKonsultasiStep() &&
        this.validateTreatmentStep() &&
        this.validatePenjualanStep() &&
        this.validateRequiredAccurateMapping()
      );
    },

    nextStep() {
      if (!this.validateCurrentStep()) return;

      const nextIndex = this.currentStepIndex + 1;

      if (nextIndex < this.availableSteps.length) {
        this.currentStepKey = this.availableSteps[nextIndex].key;
      }
    },

    prevStep() {
      const prevIndex = this.currentStepIndex - 1;

      if (prevIndex >= 0) {
        this.currentStepKey = this.availableSteps[prevIndex].key;
      }
    },

    async handleSubmit() {
      if (!this.validateAllBeforeSubmit()) return;

      this.loading = true;

      try {
        this.form.toko_id = this.getSelectedTokoId();

        await this.ensureAccurateMappingsLoaded();
        this.syncRegistrasiAccurateMapping();

        if (!this.validateRequiredAccurateMapping()) {
          return;
        }

        const response = await registrasiLayananService.create(this.form);

        if (response?.status === false) {
          this.showSnackbar(
            response?.message || "Gagal menyimpan registrasi",
            "error",
          );
          return;
        }

        this.showSnackbar(
          response?.message || "Registrasi berhasil disimpan",
          "success",
        );

        const registrasiId = response?.data?.id;

        if (registrasiId) {
          setTimeout(() => {
            this.$router.push({
              path: "/resepsionis/registrasi-layanan",
            });
          }, 500);

          return;
        }

        this.resetForm();
      } catch (error) {
        console.error(error);
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.currentStepKey = "registrasi";
      this.form = this.getInitialForm();
      this.dragActive = null;
      this.consultationHistory = [];
      this.mappingWarning = "";

      this.syncRegistrasiAccurateMapping();
      this.showSnackbar("Form berhasil direset", "success");
    },

    onPatientChange(value) {
      if (!value) {
        this.consultationHistory = [];
        return;
      }

      this.consultationHistory = [];
    },

    onDragOver(key) {
      this.dragActive = key;
    },

    onDragLeave() {
      this.dragActive = null;
    },

    processImageFile(file, key) {
      if (!file) return;

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

      const fileMap = {
        before_1: "bukti_foto_kiri",
        before_2: "bukti_foto_depan",
        before_3: "bukti_foto_kanan",
      };

      const fileNameMap = {
        before_1: "file_name_1",
        before_2: "file_name_2",
        before_3: "file_name_3",
      };

      const previewKey = previewMap[key];
      const fileKey = fileMap[key];
      const fileNameKey = fileNameMap[key];

      if (!previewKey || !fileKey || !fileNameKey) return;

      this.form.konsultasi_online[previewKey] = URL.createObjectURL(file);
      this.form.konsultasi_online[fileKey] = file;
      this.form.konsultasi_online[fileNameKey] = file.name;
    },

    onDrop(payload) {
      this.dragActive = null;

      const file = payload?.file || payload?.event?.dataTransfer?.files?.[0];

      if (!file) return;

      this.processImageFile(file, payload?.key);
    },

    onFileChange(payload) {
      const file = payload?.file || payload?.event?.target?.files?.[0];

      if (!file) return;

      this.processImageFile(file, payload?.key);

      if (payload?.event?.target) {
        payload.event.target.value = "";
      }
    },

    removeImage(key) {
      const previewMap = {
        before_1: "preview_before_1",
        before_2: "preview_before_2",
        before_3: "preview_before_3",
      };

      const fileMap = {
        before_1: "bukti_foto_kiri",
        before_2: "bukti_foto_depan",
        before_3: "bukti_foto_kanan",
      };

      const fileNameMap = {
        before_1: "file_name_1",
        before_2: "file_name_2",
        before_3: "file_name_3",
      };

      const previewKey = previewMap[key];
      const fileKey = fileMap[key];
      const fileNameKey = fileNameMap[key];

      if (!previewKey || !fileKey || !fileNameKey) return;

      this.form.konsultasi_online[previewKey] = "";
      this.form.konsultasi_online[fileKey] = "";
      this.form.konsultasi_online[fileNameKey] = "";
    },
  },
};
</script>

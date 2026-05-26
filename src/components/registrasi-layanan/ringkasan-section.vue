<template>
  <div class="mt-3">
    <v-card variant="flat" color="primary" class="mb-4" rounded="lg">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <div class="d-flex align-center ga-3">
            <v-avatar color="white" variant="tonal" size="44">
              <v-icon size="24">mdi-clipboard-check-outline</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Ringkasan Registrasi
              </div>
              <div class="text-body-2">
                Periksa kembali data sebelum registrasi disimpan.
              </div>
            </div>
          </div>

          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip
              :color="validationIssues.length ? 'warning' : 'success'"
              variant="flat"
              size="small"
              class="font-weight-bold"
            >
              <v-icon start size="16">
                {{
                  validationIssues.length
                    ? "mdi-alert-circle-outline"
                    : "mdi-check-circle-outline"
                }}
              </v-icon>
              {{ validationIssues.length ? "Perlu Dicek" : "Siap Disimpan" }}
            </v-chip>

            <v-chip color="primary" variant="flat" size="small">
              Rp {{ formatNumber(grandTotal || 0) }}
            </v-chip>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="primary" variant="tonal" size="38">
                <v-icon size="20">mdi-account-card-outline</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  Data Registrasi
                </div>
                <div class="text-caption text-medium-emphasis">
                  Identitas kunjungan pasien
                </div>
              </div>
            </div>

            <v-divider class="mb-3" />

            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Tanggal</div>
                <div class="text-body-2 font-weight-bold">
                  {{ form?.tanggal || "-" }}
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Pasien</div>
                <div class="text-body-2 font-weight-bold">
                  {{ selectedPatientName }}
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Dokter Awal</div>
                <div class="text-body-2 font-weight-bold">
                  {{ selectedDokterName }}
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Perawat Awal
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ selectedPerawatName }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="primary" variant="tonal" size="38">
                <v-icon size="20">mdi-format-list-checks</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  Layanan Dipilih
                </div>
                <div class="text-caption text-medium-emphasis">
                  Jalur layanan pasien
                </div>
              </div>
            </div>

            <v-divider class="mb-3" />

            <div class="d-flex align-center flex-wrap ga-2 mb-4">
              <v-chip
                v-if="layananState.ada_konsultasi"
                color="primary"
                variant="tonal"
                size="small"
              >
                <v-icon start size="16">mdi-stethoscope</v-icon>
                Konsultasi
              </v-chip>

              <v-chip
                v-if="layananState.ada_treatment"
                color="success"
                variant="tonal"
                size="small"
              >
                <v-icon start size="16">mdi-face-woman-shimmer-outline</v-icon>
                Treatment
              </v-chip>

              <v-chip
                v-if="layananState.ada_penjualan"
                color="info"
                variant="tonal"
                size="small"
              >
                <v-icon start size="16">mdi-cart-outline</v-icon>
                Penjualan
              </v-chip>

              <v-chip
                v-if="!hasSelectedLayanan"
                color="warning"
                variant="tonal"
                size="small"
              >
                Belum ada layanan
              </v-chip>
            </div>

            <v-row dense>
              <v-col v-if="layananState.ada_konsultasi" cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Jenis Konsultasi
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ consultationLabel }}
                </div>
              </v-col>

              <v-col v-if="layananState.ada_konsultasi" cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Channel</div>
                <div class="text-body-2 font-weight-bold">
                  {{ isConsultationOnline ? "Online" : "Offline" }}
                </div>
              </v-col>

              <v-col v-if="layananState.ada_treatment" cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Jalur Treatment
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ treatmentRoutingLabel }}
                </div>
              </v-col>

              <v-col v-if="layananState.ada_penjualan" cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Pembelian Online
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ layananState.is_pembelian_online ? "Ya" : "Tidak" }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="layananState.ada_konsultasi" cols="12">
        <v-card variant="outlined">
          <v-card-text class="pa-4">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-3 mb-3"
            >
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary" variant="tonal" size="38">
                  <v-icon size="20">
                    {{
                      isConsultationOnline
                        ? "mdi-video-outline"
                        : "mdi-stethoscope"
                    }}
                  </v-icon>
                </v-avatar>

                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    Detail Konsultasi
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{
                      isConsultationOnline
                        ? "Informasi konsultasi online"
                        : "Catatan konsultasi offline"
                    }}
                  </div>
                </div>
              </div>

              <v-chip color="primary" variant="tonal" size="small">
                {{ isConsultationOnline ? "Online" : "Offline" }}
              </v-chip>
            </div>

            <v-divider class="mb-3" />

            <template v-if="isConsultationOnline">
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="readonly-box">
                    <div class="text-caption text-medium-emphasis">Keluhan</div>
                    <div class="text-body-2">
                      {{ konsultasiOnlineState.keluhan || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="readonly-box">
                    <div class="text-caption text-medium-emphasis">Alergi</div>
                    <div class="text-body-2">
                      {{ konsultasiOnlineState.alergi || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="readonly-box">
                    <div class="text-caption text-medium-emphasis">
                      Sedang Hamil
                    </div>
                    <div class="text-body-2">
                      {{ konsultasiOnlineState.sedang_hamil || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="readonly-box">
                    <div class="text-caption text-medium-emphasis">
                      Sedang Menyusui
                    </div>
                    <div class="text-body-2">
                      {{ konsultasiOnlineState.sedang_menyusui || "-" }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </template>

            <template v-else>
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="readonly-box">
                    <div class="text-caption text-medium-emphasis">
                      Keluhan Awal
                    </div>
                    <div class="text-body-2">
                      {{ konsultasiOfflineState.keluhan_awal || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="readonly-box">
                    <div class="text-caption text-medium-emphasis">Catatan</div>
                    <div class="text-body-2">
                      {{ konsultasiOfflineState.catatan || "-" }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="layananState.ada_treatment" cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between ga-3 mb-3">
              <div class="d-flex align-center ga-3">
                <v-avatar color="success" variant="tonal" size="38">
                  <v-icon size="20">mdi-face-woman-shimmer-outline</v-icon>
                </v-avatar>

                <div>
                  <div class="text-subtitle-2 font-weight-bold">Treatment</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ selectedTreatmentItems.length }} item dipilih
                  </div>
                </div>
              </div>

              <v-chip color="success" variant="tonal" size="small">
                Rp {{ formatNumber(calculatedTreatmentTotal) }}
              </v-chip>
            </div>

            <v-divider class="mb-3" />

            <div
              v-if="selectedTreatmentItems.length"
              class="d-flex flex-column ga-2"
            >
              <div
                v-for="item in selectedTreatmentItems"
                :key="item.key"
                class="summary-item"
              >
                <div>
                  <div class="text-body-2 font-weight-bold">
                    {{ item.nama }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.jumlah }} x Rp {{ formatNumber(item.harga) }}
                  </div>
                </div>

                <div class="text-body-2 font-weight-bold">
                  Rp {{ formatNumber(item.subtotal) }}
                </div>
              </div>
            </div>

            <v-alert v-else type="warning" variant="tonal" density="compact">
              Item treatment belum dipilih.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="layananState.ada_penjualan" cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between ga-3 mb-3">
              <div class="d-flex align-center ga-3">
                <v-avatar color="info" variant="tonal" size="38">
                  <v-icon size="20">mdi-pill</v-icon>
                </v-avatar>

                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    Penjualan Produk
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ selectedPenjualanItems.length }} item dipilih
                  </div>
                </div>
              </div>

              <v-chip color="info" variant="tonal" size="small">
                Rp {{ formatNumber(calculatedPenjualanTotal) }}
              </v-chip>
            </div>

            <v-divider class="mb-3" />

            <div
              v-if="selectedPenjualanItems.length"
              class="d-flex flex-column ga-2"
            >
              <div
                v-for="item in selectedPenjualanItems"
                :key="item.key"
                class="summary-item"
              >
                <div>
                  <div class="text-body-2 font-weight-bold">
                    {{ item.nama }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.jumlah }} x Rp {{ formatNumber(item.harga) }}
                  </div>
                </div>

                <div class="text-body-2 font-weight-bold">
                  Rp {{ formatNumber(item.subtotal) }}
                </div>
              </div>
            </div>

            <v-alert v-else type="warning" variant="tonal" density="compact">
              Produk belum dipilih.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar
                :color="validationIssues.length ? 'warning' : 'success'"
                variant="tonal"
                size="38"
              >
                <v-icon size="20">
                  {{
                    validationIssues.length
                      ? "mdi-alert-circle-outline"
                      : "mdi-check-circle-outline"
                  }}
                </v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  Checklist Validasi
                </div>
                <div class="text-caption text-medium-emphasis">
                  Status kelengkapan data registrasi
                </div>
              </div>
            </div>

            <v-divider class="mb-3" />

            <template v-if="validationIssues.length">
              <div class="d-flex flex-column ga-2">
                <v-alert
                  v-for="(issue, index) in validationIssues"
                  :key="index"
                  color="warning"
                  variant="tonal"
                  density="compact"
                  border="start"
                >
                  {{ issue }}
                </v-alert>
              </div>
            </template>

            <template v-else>
              <v-alert color="success" variant="tonal" density="compact">
                Semua data minimum untuk registrasi sudah lengkap.
              </v-alert>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="Number(grandTotal || 0) > 0" cols="12">
        <v-card color="primary" variant="tonal">
          <v-card-text
            class="pa-4 d-flex align-center justify-space-between ga-3 flex-wrap"
          >
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="flat" size="42">
                <v-icon size="22">mdi-cash-multiple</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Grand Total Estimasi
                </div>
                <div class="text-caption text-medium-emphasis">
                  Total dari konsultasi, treatment, dan penjualan produk.
                </div>
              </div>
            </div>

            <div class="text-h6 font-weight-bold">
              Rp {{ formatNumber(grandTotal) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "RingkasanSection",

  props: {
    form: {
      type: Object,
      required: true,
    },
    pasienList: {
      type: Array,
      default: () => [],
    },
    dokterList: {
      type: Array,
      default: () => [],
    },
    perawatList: {
      type: Array,
      default: () => [],
    },
    tindakanList: {
      type: Array,
      default: () => [],
    },
    obatList: {
      type: Array,
      default: () => [],
    },
    accurateMappingList: {
      type: Array,
      default: () => [],
    },
    totalTreatment: {
      type: Number,
      default: 0,
    },
    totalPenjualan: {
      type: Number,
      default: 0,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    getTreatmentSubtotal: {
      type: Function,
      default: null,
    },
    getPenjualanSubtotal: {
      type: Function,
      default: null,
    },
  },

  computed: {
    layananState() {
      return {
        ada_konsultasi: false,
        channel_konsultasi: "",
        konsultasi_source_code: null,
        konsultasi_source_name: null,
        konsultasi_mapping_id: null,
        ada_treatment: false,
        ada_penjualan: false,
        route_treatment: "",
        is_pembelian_online: false,
        ...(this.form?.layanan || {}),
      };
    },

    treatmentState() {
      return {
        items: [],
        ...(this.form?.treatment || {}),
      };
    },

    penjualanState() {
      return {
        poin: 0,
        items: [],
        ...(this.form?.penjualan || {}),
      };
    },

    konsultasiOnlineState() {
      return {
        request_dokter: "",
        alergi: "",
        keluhan: "",
        produk_sebelumnya: "",
        sedang_hamil: "",
        sedang_menyusui: "",
        ...(this.form?.konsultasi_online || {}),
      };
    },

    konsultasiOfflineState() {
      return {
        keluhan_awal: "",
        catatan: "",
        ...(this.form?.konsultasi_offline || {}),
      };
    },

    activeMappings() {
      return (this.accurateMappingList || []).filter((item) => {
        if (!item) return false;

        return (
          !this.toBoolean(item.is_delete) &&
          this.toBoolean(item.is_active !== undefined ? item.is_active : true)
        );
      });
    },

    selectedKonsultasiMapping() {
      if (this.layananState.konsultasi_mapping_id) {
        const byId = this.activeMappings.find((item) => {
          return (
            String(item.id || "") ===
            String(this.layananState.konsultasi_mapping_id || "")
          );
        });

        if (byId) return byId;
      }

      return this.getMappingBySourceCode(
        this.layananState.konsultasi_source_code,
      );
    },

    isConsultationOnline() {
      return (
        String(this.layananState.channel_konsultasi || "").toLowerCase() ===
          "online" ||
        String(this.layananState.konsultasi_source_code || "")
          .toUpperCase()
          .includes("ONLINE")
      );
    },

    consultationLabel() {
      return (
        this.layananState.konsultasi_source_name ||
        this.selectedKonsultasiMapping?.source_name ||
        this.selectedKonsultasiMapping?.nama_accurate ||
        this.layananState.konsultasi_source_code ||
        "-"
      );
    },

    hasSelectedLayanan() {
      return (
        this.layananState.ada_konsultasi ||
        this.layananState.ada_treatment ||
        this.layananState.ada_penjualan
      );
    },

    selectedPatientName() {
      const direct =
        this.getDisplayText(this.form?.pasien) ||
        this.getDisplayText(this.form?.selected_pasien) ||
        this.getDisplayText(this.form?.pasien_detail) ||
        this.form?.pasien_nama ||
        this.form?.nama_pasien;

      if (direct) return direct;

      const id =
        this.form?.pasien_id ||
        this.form?.pasien_new_id ||
        this.form?.selected_pasien_id;

      const item = this.findById(this.pasienList, id);

      return this.getDisplayText(item) || "-";
    },

    selectedDokterName() {
      const direct =
        this.getDisplayText(this.form?.dokter) ||
        this.getDisplayText(this.form?.selected_dokter) ||
        this.form?.dokter_nama ||
        this.form?.nama_dokter;

      if (direct) return direct;

      const item = this.findById(this.dokterList, this.form?.dokter_id);

      return this.getDisplayText(item) || "-";
    },

    selectedPerawatName() {
      const direct =
        this.getDisplayText(this.form?.perawat) ||
        this.getDisplayText(this.form?.selected_perawat) ||
        this.form?.perawat_nama ||
        this.form?.nama_perawat;

      if (direct) return direct;

      const item = this.findById(this.perawatList, this.form?.perawat_id);

      return this.getDisplayText(item) || "-";
    },

    selectedTreatmentItems() {
      return (this.treatmentState.items || [])
        .filter((item) => item && this.getItemId(item, "treatment"))
        .map((item, index) => {
          const harga = this.resolvePrice(item);
          const jumlah = Number(item.jumlah || item.qty || 0);
          const subtotal = this.resolveTreatmentSubtotal(item);

          return {
            key: `${this.getItemId(item, "treatment")}-${index}`,
            nama: this.getTreatmentName(item),
            jumlah,
            harga,
            subtotal,
          };
        });
    },

    selectedPenjualanItems() {
      return (this.penjualanState.items || [])
        .filter((item) => item && this.getItemId(item, "produk"))
        .map((item, index) => {
          const harga = this.resolvePrice(item);
          const jumlah = Number(item.jumlah || item.qty || 0);
          const subtotal = this.resolvePenjualanSubtotal(item);

          return {
            key: `${this.getItemId(item, "produk")}-${index}`,
            nama: this.getProdukName(item),
            jumlah,
            harga,
            unit: item.unit || item.satuan || item.nama_satuan || "",
            subtotal,
          };
        });
    },

    calculatedTreatmentTotal() {
      const manual = Number(this.totalTreatment || 0);

      if (manual > 0) return manual;

      return this.selectedTreatmentItems.reduce((sum, item) => {
        return sum + Number(item.subtotal || 0);
      }, 0);
    },

    calculatedPenjualanTotal() {
      const manual = Number(this.totalPenjualan || 0);

      if (manual > 0) return manual;

      return this.selectedPenjualanItems.reduce((sum, item) => {
        return sum + Number(item.subtotal || 0);
      }, 0);
    },

    calculatedKonsultasiTotal() {
      if (!this.layananState.ada_konsultasi) return 0;

      if (this.layananState.ada_treatment) return 0;

      const fromForm = Number(this.form?.total_konsultasi || 0);

      if (fromForm > 0) return fromForm;

      return Number(this.selectedKonsultasiMapping?.default_harga || 0);
    },

    grandTotal() {
      return (
        Number(this.calculatedKonsultasiTotal || 0) +
        Number(this.calculatedTreatmentTotal || 0) +
        Number(this.calculatedPenjualanTotal || 0)
      );
    },

    treatmentRoutingLabel() {
      if (!this.layananState.ada_treatment) return "-";

      if (this.treatmentState.perlu_tindakan_perawat === true) {
        return "Masuk Nurse Station";
      }

      if (this.treatmentState.perlu_tindakan_perawat === false) {
        return "Tetap di Jalur Dokter";
      }

      return "-";
    },

    validationIssues() {
      const issues = [];

      if (this.isEmpty(this.form?.tanggal)) {
        issues.push("Tanggal registrasi belum diisi.");
      }

      if (this.selectedPatientName === "-") {
        issues.push("Pasien belum dipilih.");
      }

      if (!this.hasSelectedLayanan) {
        issues.push("Minimal satu layanan harus dipilih.");
      }

      if (
        this.layananState.ada_konsultasi &&
        this.isEmpty(this.layananState.konsultasi_source_code)
      ) {
        issues.push("Jenis konsultasi belum dipilih.");
      }

      if (
        this.layananState.ada_konsultasi &&
        this.isEmpty(this.layananState.channel_konsultasi)
      ) {
        issues.push("Channel konsultasi belum dipilih.");
      }

      if (this.layananState.ada_konsultasi && this.isConsultationOnline) {
        if (this.isEmpty(this.konsultasiOnlineState.keluhan)) {
          issues.push("Keluhan konsultasi online belum diisi.");
        }

        if (this.isEmpty(this.konsultasiOnlineState.alergi)) {
          issues.push("Alergi konsultasi online belum diisi.");
        }

        if (this.isEmpty(this.konsultasiOnlineState.sedang_hamil)) {
          issues.push("Status sedang hamil belum dipilih.");
        }

        if (this.isEmpty(this.konsultasiOnlineState.sedang_menyusui)) {
          issues.push("Status sedang menyusui belum dipilih.");
        }
      }

      if (
        this.layananState.ada_konsultasi &&
        !this.isConsultationOnline &&
        this.isEmpty(this.konsultasiOfflineState.keluhan_awal)
      ) {
        issues.push("Keluhan awal konsultasi offline belum diisi.");
      }

      if (
        this.layananState.ada_treatment &&
        !this.selectedTreatmentItems.length
      ) {
        issues.push("Minimal satu item treatment harus dipilih.");
      }

      if (
        this.layananState.ada_penjualan &&
        !this.selectedPenjualanItems.length
      ) {
        issues.push("Minimal satu produk harus dipilih.");
      }

      return issues;
    },

    isReadyToSave() {
      return this.validationIssues.length === 0;
    },

    queueSummary() {
      let antrianAwal = "-";
      let taskBerikutnya = "-";
      let penjualanFlow = "-";

      if (this.layananState.ada_konsultasi) {
        antrianAwal = this.isConsultationOnline
          ? "Antrian Konsultasi Online"
          : "Antrian Konsultasi Dokter";
      } else if (this.layananState.ada_treatment) {
        antrianAwal =
          this.treatmentState.perlu_tindakan_perawat === true
            ? "Antrian Perawat / Nurse Station"
            : "Antrian Treatment";
      } else if (this.layananState.ada_penjualan) {
        antrianAwal = "Pembayaran / Kasir";
      }

      if (
        this.layananState.ada_konsultasi &&
        this.layananState.ada_treatment &&
        this.treatmentState.perlu_tindakan_perawat === true
      ) {
        taskBerikutnya = "Konsultasi selesai, lalu masuk Nurse Station";
      } else if (
        this.layananState.ada_konsultasi &&
        this.layananState.ada_treatment
      ) {
        taskBerikutnya = "Konsultasi selesai, lalu lanjut treatment";
      } else if (this.layananState.ada_konsultasi) {
        taskBerikutnya =
          "Konsultasi selesai, lalu lanjut pembayaran bila ada tagihan";
      } else if (this.layananState.ada_treatment) {
        taskBerikutnya = "Treatment selesai, lalu lanjut pembayaran";
      } else if (this.layananState.ada_penjualan) {
        taskBerikutnya = "Langsung lanjut pembayaran";
      }

      if (
        this.layananState.ada_penjualan &&
        (this.layananState.ada_konsultasi || this.layananState.ada_treatment)
      ) {
        penjualanFlow = "Produk ikut dalam transaksi kunjungan";
      } else if (this.layananState.ada_penjualan) {
        penjualanFlow = "Produk langsung masuk pembayaran";
      }

      return {
        antrianAwal,
        taskBerikutnya,
        penjualanFlow,
      };
    },
  },

  methods: {
    isEmpty(value) {
      return (
        value === null || value === undefined || String(value).trim() === ""
      );
    },

    toBoolean(value) {
      return (
        value === true ||
        value === 1 ||
        value === "1" ||
        String(value).toLowerCase() === "true"
      );
    },

    normalizeValue(value) {
      if (value && typeof value === "object") {
        return (
          value.id ??
          value.value ??
          value.new_id ??
          value.treatment_id ??
          value.tindakan_id ??
          value.produk_id ??
          value.obat_id ??
          value.karyawan_id ??
          value.pasien_new_id ??
          null
        );
      }

      return value;
    },

    findById(list, id) {
      const normalizedId = this.normalizeValue(id);

      if (this.isEmpty(normalizedId)) return null;

      return (
        (list || []).find((item) => {
          const candidates = [
            item?.id,
            item?.value,
            item?.new_id,
            item?.pasien_new_id,
            item?.karyawan_id,
            item?.treatment_id,
            item?.produk_id,
            item?.obat_id,
          ];

          return candidates.some((candidate) => {
            return String(candidate ?? "") === String(normalizedId ?? "");
          });
        }) || null
      );
    },

    getDisplayText(item) {
      if (!item) return "";

      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }

      return (
        item.nama ||
        item.name ||
        item.text ||
        item.title ||
        item.label ||
        item.nama_pasien ||
        item.nama_karyawan ||
        item.nama_treatment ||
        item.nama_produk ||
        item.nama_obat_bahan ||
        ""
      );
    },

    getMappingBySourceCode(sourceCode) {
      if (!sourceCode) return null;

      return (
        this.activeMappings.find((item) => {
          return (
            String(item.source_code || "").toUpperCase() ===
            String(sourceCode || "").toUpperCase()
          );
        }) || null
      );
    },

    getItemId(item, type) {
      if (!item) return null;

      if (type === "treatment") {
        return (
          item.treatment_toko_id ||
          item.master_treatment_toko_id ||
          item.treatment_id ||
          item.master_treatment_id ||
          item.id ||
          null
        );
      }

      return (
        item.produk_toko_id ||
        item.master_produk_toko_id ||
        item.obat_toko_id ||
        item.produk_id ||
        item.master_produk_id ||
        item.obat_id ||
        item.id ||
        null
      );
    },

    resolvePrice(item) {
      return Number(
        item.harga ||
          item.harga_jual ||
          item.harga_treatment ||
          item.treatment_harga ||
          item.harga_produk ||
          item.price ||
          0,
      );
    },

    resolveTreatmentSubtotal(item) {
      if (this.getTreatmentSubtotal) {
        return Number(this.getTreatmentSubtotal(item) || 0);
      }

      return (
        Number(item.subtotal || item.total || 0) ||
        this.resolvePrice(item) * Number(item.jumlah || item.qty || 0)
      );
    },

    resolvePenjualanSubtotal(item) {
      if (this.getPenjualanSubtotal) {
        return Number(this.getPenjualanSubtotal(item) || 0);
      }

      return (
        Number(item.subtotal || item.total || 0) ||
        this.resolvePrice(item) * Number(item.jumlah || item.qty || 0)
      );
    },

    getTreatmentName(item) {
      const direct =
        item.nama ||
        item.nama_treatment ||
        item.treatment_name ||
        item.nama_item ||
        item.label;

      if (direct) return direct;

      const found = this.findById(
        this.tindakanList,
        this.getItemId(item, "treatment"),
      );

      return this.getDisplayText(found) || "Treatment";
    },

    getProdukName(item) {
      const direct =
        item.nama ||
        item.nama_produk ||
        item.nama_obat_bahan ||
        item.produk_name ||
        item.obat_name ||
        item.nama_item ||
        item.label;

      if (direct) return direct;

      const found = this.findById(
        this.obatList,
        this.getItemId(item, "produk"),
      );

      return this.getDisplayText(found) || "Produk";
    },
  },
};
</script>

<style scoped>
.readonly-box {
  min-height: 64px;
  padding: 12px;
  border-radius: 10px;
  background: #f5f5f5;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f5f5f5;
}

.queue-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
</style>

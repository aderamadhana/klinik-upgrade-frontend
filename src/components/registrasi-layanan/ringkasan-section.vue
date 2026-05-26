<template>
  <div class="mt-3">
    <v-card variant="tonal" class="mb-3">
      <v-card-text class="pa-3 d-flex align-center justify-space-between ga-3">
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            Ringkasan Registrasi
          </div>
          <div class="text-caption text-medium-emphasis">
            Periksa kembali data registrasi sebelum disimpan
          </div>
        </div>

        <v-chip
          :color="isReadyToSave ? 'success' : 'error'"
          variant="tonal"
          size="small"
          class="font-weight-bold"
        >
          <v-icon start size="15">
            {{
              isReadyToSave
                ? "mdi-check-circle-outline"
                : "mdi-alert-circle-outline"
            }}
          </v-icon>
          {{ isReadyToSave ? "Siap Disimpan" : "Belum Lengkap" }}
        </v-chip>
      </v-card-text>
    </v-card>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-title
            class="pa-3 pb-1 text-subtitle-2 font-weight-bold d-flex align-center"
          >
            <v-icon size="17" color="primary" class="mr-2">
              mdi-account-details-outline
            </v-icon>
            Informasi Registrasi
          </v-card-title>

          <v-card-text class="pa-3 pt-1">
            <v-list density="compact" class="pa-0">
              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Tanggal</span
                    >
                    <strong class="text-caption text-right">{{
                      form.tanggal || "-"
                    }}</strong>
                  </div>
                </template>
              </v-list-item>

              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Pasien</span
                    >
                    <strong class="text-caption text-right">{{
                      selectedPatientName
                    }}</strong>
                  </div>
                </template>
              </v-list-item>

              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Dokter Awal</span
                    >
                    <strong class="text-caption text-right">{{
                      selectedDokterName
                    }}</strong>
                  </div>
                </template>
              </v-list-item>

              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Perawat Awal</span
                    >
                    <strong class="text-caption text-right">{{
                      selectedPerawatName
                    }}</strong>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-title
            class="pa-3 pb-1 text-subtitle-2 font-weight-bold d-flex align-center"
          >
            <v-icon size="17" color="primary" class="mr-2">
              mdi-format-list-checks
            </v-icon>
            Layanan Dipilih
          </v-card-title>

          <v-card-text class="pa-3 pt-1">
            <div class="d-flex flex-wrap ga-1 mb-2">
              <v-chip
                v-if="layananState.ada_konsultasi"
                color="primary"
                variant="tonal"
                size="x-small"
              >
                Konsultasi {{ formatChannel(layananState.channel_konsultasi) }}
              </v-chip>

              <v-chip
                v-if="layananState.ada_treatment"
                color="success"
                variant="tonal"
                size="x-small"
              >
                Treatment
              </v-chip>

              <v-chip
                v-if="layananState.ada_penjualan"
                color="info"
                variant="tonal"
                size="x-small"
              >
                Penjualan Produk
              </v-chip>

              <v-chip
                v-if="!hasSelectedLayanan"
                color="error"
                variant="tonal"
                size="x-small"
              >
                Belum ada layanan dipilih
              </v-chip>
            </div>

            <v-list density="compact" class="pa-0">
              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Konsultasi</span
                    >
                    <strong class="text-caption">
                      {{ layananState.ada_konsultasi ? "Ya" : "Tidak" }}
                    </strong>
                  </div>
                </template>
              </v-list-item>

              <v-list-item v-if="layananState.ada_konsultasi" class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Channel</span
                    >
                    <strong class="text-caption">
                      {{ formatChannel(layananState.channel_konsultasi) }}
                    </strong>
                  </div>
                </template>
              </v-list-item>

              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Treatment</span
                    >
                    <strong class="text-caption">
                      {{ layananState.ada_treatment ? "Ya" : "Tidak" }}
                    </strong>
                  </div>
                </template>
              </v-list-item>

              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Penjualan</span
                    >
                    <strong class="text-caption">
                      {{ layananState.ada_penjualan ? "Ya" : "Tidak" }}
                    </strong>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="layananState.ada_konsultasi" cols="12">
        <v-card variant="outlined">
          <v-card-title
            class="pa-3 pb-1 text-subtitle-2 font-weight-bold d-flex align-center"
          >
            <v-icon size="17" color="primary" class="mr-2">
              {{
                isConsultationOnline ? "mdi-video-outline" : "mdi-stethoscope"
              }}
            </v-icon>
            Detail Konsultasi
            {{ formatChannel(layananState.channel_konsultasi) }}
          </v-card-title>

          <v-card-text class="pa-3 pt-1">
            <template v-if="isConsultationOnline">
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis">
                    Keluhan Utama
                  </div>
                  <div class="text-caption font-weight-medium">
                    {{ konsultasiOnlineState.keluhan || "-" }}
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis">Alergi</div>
                  <div class="text-caption font-weight-medium">
                    {{ konsultasiOnlineState.alergi || "-" }}
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <div class="text-caption text-medium-emphasis">
                    Request Dokter
                  </div>
                  <div class="text-caption font-weight-medium">
                    {{ konsultasiOnlineState.request_dokter || "-" }}
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <div class="text-caption text-medium-emphasis">
                    Sedang Hamil
                  </div>
                  <div class="text-caption font-weight-medium">
                    {{ formatYesNo(konsultasiOnlineState.sedang_hamil) }}
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <div class="text-caption text-medium-emphasis">
                    Sedang Menyusui
                  </div>
                  <div class="text-caption font-weight-medium">
                    {{ formatYesNo(konsultasiOnlineState.sedang_menyusui) }}
                  </div>
                </v-col>

                <v-col cols="12">
                  <div class="text-caption text-medium-emphasis">
                    Produk / Obat Sebelumnya
                  </div>
                  <div class="text-caption font-weight-medium">
                    {{ konsultasiOnlineState.produk_sebelumnya || "-" }}
                  </div>
                </v-col>
              </v-row>
            </template>

            <template v-else>
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis">
                    Keluhan Awal
                  </div>
                  <div class="text-caption font-weight-medium">
                    {{ konsultasiOfflineState.keluhan_awal || "-" }}
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="text-caption text-medium-emphasis">Catatan</div>
                  <div class="text-caption font-weight-medium">
                    {{ konsultasiOfflineState.catatan || "-" }}
                  </div>
                </v-col>
              </v-row>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="layananState.ada_treatment" cols="12">
        <v-card variant="outlined">
          <v-card-title
            class="pa-3 pb-1 d-flex align-center justify-space-between"
          >
            <div class="text-subtitle-2 font-weight-bold d-flex align-center">
              <v-icon size="17" color="success" class="mr-2">mdi-spa</v-icon>
              Ringkasan Treatment
            </div>

            <v-chip color="success" variant="tonal" size="x-small">
              Rp {{ formatNumber(calculatedTreatmentTotal) }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-3 pt-1">
            <template v-if="selectedTreatmentItems.length">
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="text-caption">Treatment</th>
                    <th class="text-caption">Qty</th>
                    <th class="text-caption">Harga</th>
                    <th class="text-caption text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedTreatmentItems" :key="item.key">
                    <td class="text-caption">{{ item.nama }}</td>
                    <td class="text-caption">{{ item.jumlah }}</td>
                    <td class="text-caption">
                      Rp {{ formatNumber(item.harga) }}
                    </td>
                    <td
                      class="text-caption text-right font-weight-bold text-success"
                    >
                      Rp {{ formatNumber(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <v-divider class="my-2" />

              <div class="d-flex justify-space-between ga-3">
                <span class="text-caption text-medium-emphasis"
                  >Total Treatment</span
                >
                <strong class="text-caption text-success">
                  Rp {{ formatNumber(calculatedTreatmentTotal) }}
                </strong>
              </div>

              <div
                v-if="treatmentRoutingLabel !== '-'"
                class="d-flex justify-space-between ga-3 mt-1"
              >
                <span class="text-caption text-medium-emphasis">Routing</span>
                <strong class="text-caption text-right">{{
                  treatmentRoutingLabel
                }}</strong>
              </div>
            </template>

            <template v-else>
              <v-alert color="info" variant="tonal" density="compact">
                Belum ada item treatment yang dipilih.
              </v-alert>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="layananState.ada_penjualan" cols="12">
        <v-card variant="outlined">
          <v-card-title
            class="pa-3 pb-1 d-flex align-center justify-space-between"
          >
            <div class="text-subtitle-2 font-weight-bold d-flex align-center">
              <v-icon size="17" color="info" class="mr-2">mdi-pill</v-icon>
              Ringkasan Penjualan Produk
            </div>

            <v-chip color="info" variant="tonal" size="x-small">
              Rp {{ formatNumber(calculatedPenjualanTotal) }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-3 pt-1">
            <template v-if="selectedPenjualanItems.length">
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="text-caption">Produk</th>
                    <th class="text-caption">Qty</th>
                    <th class="text-caption">Harga</th>
                    <th class="text-caption text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedPenjualanItems" :key="item.key">
                    <td class="text-caption">{{ item.nama }}</td>
                    <td class="text-caption">
                      {{ item.jumlah }} {{ item.unit }}
                    </td>
                    <td class="text-caption">
                      Rp {{ formatNumber(item.harga) }}
                    </td>
                    <td
                      class="text-caption text-right font-weight-bold text-info"
                    >
                      Rp {{ formatNumber(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <v-divider class="my-2" />

              <div class="d-flex justify-space-between ga-3">
                <span class="text-caption text-medium-emphasis"
                  >Total Penjualan</span
                >
                <strong class="text-caption text-info">
                  Rp {{ formatNumber(calculatedPenjualanTotal) }}
                </strong>
              </div>
            </template>

            <template v-else>
              <v-alert color="info" variant="tonal" density="compact">
                Belum ada produk yang dipilih.
              </v-alert>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-title
            class="pa-3 pb-1 text-subtitle-2 font-weight-bold d-flex align-center"
          >
            <v-icon size="17" color="warning" class="mr-2">
              mdi-source-branch
            </v-icon>
            Preview Antrian & Task
          </v-card-title>

          <v-card-text class="pa-3 pt-1">
            <v-list density="compact" class="pa-0">
              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Antrian Aktif Awal</span
                    >
                    <strong class="text-caption text-right">
                      {{ queueSummary.antrianAwal }}
                    </strong>
                  </div>
                </template>
              </v-list-item>

              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Task Berikutnya</span
                    >
                    <strong class="text-caption text-right">
                      {{ queueSummary.taskBerikutnya }}
                    </strong>
                  </div>
                </template>
              </v-list-item>

              <v-list-item class="px-0 py-1">
                <template #title>
                  <div class="d-flex justify-space-between ga-3">
                    <span class="text-caption text-medium-emphasis"
                      >Flow Penjualan</span
                    >
                    <strong class="text-caption text-right">
                      {{ queueSummary.penjualanFlow }}
                    </strong>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined" class="h-100">
          <v-card-title
            class="pa-3 pb-1 text-subtitle-2 font-weight-bold d-flex align-center"
          >
            <v-icon size="17" color="success" class="mr-2">
              mdi-clipboard-check-outline
            </v-icon>
            Checklist Validasi
          </v-card-title>

          <v-card-text class="pa-3 pt-1">
            <template v-if="validationIssues.length">
              <div class="d-flex flex-column ga-1">
                <v-alert
                  v-for="(issue, index) in validationIssues"
                  :key="index"
                  color="warning"
                  variant="tonal"
                  density="compact"
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
            class="pa-3 d-flex align-center justify-space-between ga-3"
          >
            <div>
              <div class="text-subtitle-2 font-weight-bold">
                Grand Total Estimasi
              </div>
              <div class="text-caption text-medium-emphasis">
                Total dari treatment dan penjualan produk yang dipilih
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
        ada_treatment: false,
        ada_penjualan: false,
        route_treatment: "",
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

    hasSelectedLayanan() {
      return (
        Boolean(this.layananState.ada_konsultasi) ||
        Boolean(this.layananState.ada_treatment) ||
        Boolean(this.layananState.ada_penjualan)
      );
    },

    isConsultationOnline() {
      return this.layananState.channel_konsultasi === "online";
    },

    selectedPatientName() {
      const direct =
        this.getDisplayText(this.form?.pasien) ||
        this.getDisplayText(this.form?.selected_pasien) ||
        this.getDisplayText(this.form?.pasien_detail) ||
        this.form?.pasien_nama ||
        this.form?.nama_pasien ||
        this.form?.nama_pelanggan;

      if (direct) return direct;

      const item = this.findById(this.pasienList, this.form?.pasien_new_id);
      return this.getDisplayText(item) || "-";
    },

    selectedDokterName() {
      const direct =
        this.getDisplayText(this.form?.dokter) ||
        this.getDisplayText(this.form?.selected_dokter) ||
        this.getDisplayText(this.form?.dokter_detail) ||
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
        this.getDisplayText(this.form?.perawat_detail) ||
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
      return this.selectedTreatmentItems.reduce((sum, item) => {
        return sum + Number(item.subtotal || 0);
      }, 0);
    },

    calculatedPenjualanTotal() {
      return this.selectedPenjualanItems.reduce((sum, item) => {
        return sum + Number(item.subtotal || 0);
      }, 0);
    },

    grandTotal() {
      return (
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
        issues.push("Minimal satu layanan wajib dipilih.");
      }

      if (
        this.layananState.ada_konsultasi &&
        this.isEmpty(this.layananState.channel_konsultasi)
      ) {
        issues.push("Channel konsultasi belum dipilih.");
      }

      if (this.layananState.ada_konsultasi && this.isConsultationOnline) {
        if (this.isEmpty(this.konsultasiOnlineState.keluhan)) {
          issues.push("Keluhan utama konsultasi online belum diisi.");
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

    findById(list, value) {
      const normalizedValue = this.normalizeValue(value);

      if (this.isEmpty(normalizedValue)) return null;

      return (list || []).find((row) => {
        const candidates = [
          row?.id,
          row?.value,
          row?.new_id,
          row?.treatment_id,
          row?.tindakan_id,
          row?.produk_id,
          row?.obat_id,
          row?.karyawan_id,
          row?.pasien_new_id,
          row?.kode,
        ];

        return candidates.some((candidate) => {
          return (
            !this.isEmpty(candidate) &&
            String(candidate) === String(normalizedValue)
          );
        });
      });
    },

    getDisplayText(row) {
      if (!row || typeof row === "string" || typeof row === "number") {
        return "";
      }

      return (
        row.nama ||
        row.text ||
        row.label ||
        row.name ||
        row.nama_pasien ||
        row.nama_pelanggan ||
        row.nama_karyawan ||
        row.nama_dokter ||
        row.nama_perawat ||
        row.nama_treatment ||
        row.nama_produk ||
        row.nama_obat ||
        row.title ||
        ""
      );
    },

    getItemId(item, type) {
      if (!item) return null;

      if (type === "treatment") {
        return this.normalizeValue(
          item.tindakan_id ||
            item.treatment_id ||
            item.master_treatment_id ||
            item.treatment ||
            item.tindakan ||
            item.selected_treatment,
        );
      }

      return this.normalizeValue(
        item.produk_id ||
          item.obat_id ||
          item.master_produk_id ||
          item.product_id ||
          item.produk ||
          item.obat ||
          item.selected_produk,
      );
    },

    getTreatmentName(item) {
      const direct =
        this.getDisplayText(item?.tindakan) ||
        this.getDisplayText(item?.treatment) ||
        this.getDisplayText(item?.master_treatment) ||
        this.getDisplayText(item?.selected_treatment) ||
        item?.nama_tindakan ||
        item?.nama_treatment ||
        item?.treatment_nama ||
        item?.tindakan_nama ||
        item?.nama ||
        item?.text ||
        item?.label;

      if (direct) return direct;

      const found = this.findById(
        this.tindakanList,
        this.getItemId(item, "treatment"),
      );

      return this.getDisplayText(found) || "Treatment belum teridentifikasi";
    },

    getProdukName(item) {
      const direct =
        this.getDisplayText(item?.produk) ||
        this.getDisplayText(item?.obat) ||
        this.getDisplayText(item?.master_produk) ||
        this.getDisplayText(item?.selected_produk) ||
        item?.nama_produk ||
        item?.nama_obat ||
        item?.produk_nama ||
        item?.obat_nama ||
        item?.nama ||
        item?.text ||
        item?.label;

      if (direct) return direct;

      const found = this.findById(
        this.obatList,
        this.getItemId(item, "produk"),
      );

      return this.getDisplayText(found) || "Produk belum teridentifikasi";
    },

    resolvePrice(item) {
      return Number(
        item?.harga ||
          item?.harga_jual ||
          item?.harga_treatment ||
          item?.treatment_harga ||
          item?.produk_harga ||
          item?.price ||
          0,
      );
    },

    resolveTreatmentSubtotal(item) {
      if (typeof this.getTreatmentSubtotal === "function") {
        return Number(this.getTreatmentSubtotal(item) || 0);
      }

      return this.calculateSubtotal(item);
    },

    resolvePenjualanSubtotal(item) {
      if (typeof this.getPenjualanSubtotal === "function") {
        return Number(this.getPenjualanSubtotal(item) || 0);
      }

      return this.calculateSubtotal(item);
    },

    calculateSubtotal(item) {
      const harga = this.resolvePrice(item);
      const jumlah = Number(item?.jumlah || item?.qty || 0);
      const base = harga * jumlah;
      const diskon =
        item?.diskon_type === "%"
          ? (base * Number(item?.diskon_value || 0)) / 100
          : Number(item?.diskon_value || 0);

      return Math.max(base - diskon - Number(item?.diskon_referral || 0), 0);
    },

    formatChannel(value) {
      if (!value) return "-";
      if (value === "offline") return "Offline";
      if (value === "online") return "Online";

      return value;
    },

    formatYesNo(value) {
      if (!value) return "-";
      if (value === "ya") return "Ya";
      if (value === "tidak") return "Tidak";

      return value;
    },
  },
};
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.summary-box {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 18px;
  background: #fff;
}

.summary-box.grand {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
}

.summary-box__title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 14px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row span {
  font-size: 13px;
  color: #64748b;
}

.summary-row strong {
  font-size: 13px;
  color: #0f172a;
  text-align: right;
}

.total-row {
  border-top: 1px solid #e5e7eb;
  border-bottom: none;
  padding-top: 14px;
}

.summary-total {
  font-size: 24px;
  font-weight: 800;
  white-space: nowrap;
}

.summary-total.grand-text {
  color: #0f172a;
}

.grand-subtitle {
  font-size: 13px;
  color: #64748b;
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-box {
  height: 100%;
  border-radius: 14px;
  padding: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.detail-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.detail-value {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

.detail-value.multiline {
  white-space: pre-line;
  line-height: 1.6;
  font-weight: 500;
}

.item-table {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
}

.item-table__head,
.item-table__row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 90px 150px 160px;
  gap: 12px;
  align-items: center;
}

.item-table__head {
  padding: 12px 14px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.item-table__row {
  padding: 12px 14px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #0f172a;
}

.item-table__row strong {
  text-align: right;
}

.empty-box {
  min-height: 88px;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
}

.issue-item {
  font-size: 13px;
  color: #b91c1c;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.18);
  margin-bottom: 10px;
}

.issue-item:last-child {
  margin-bottom: 0;
}

.ok-item {
  font-size: 13px;
  color: #166534;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.18);
}

.text-success {
  color: #16a34a !important;
}

.text-error {
  color: #dc2626 !important;
}

.text-info {
  color: #0284c7 !important;
}

@media (max-width: 960px) {
  .item-table__head,
  .item-table__row {
    grid-template-columns: 1fr;
  }

  .item-table__head {
    display: none;
  }

  .item-table__row strong {
    text-align: left;
  }

  .summary-box.grand {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .summary-row {
    flex-direction: column;
    gap: 6px;
  }

  .summary-row strong {
    text-align: left;
  }
}
</style>

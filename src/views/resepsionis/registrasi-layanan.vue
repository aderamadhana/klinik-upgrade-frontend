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

    <v-stepper v-model="currentStepKey" flat class="registrasi-stepper">
      <!-- SIMPLE HEADER -->
      <div class="simple-stepper">
        <div class="simple-stepper__track"></div>
        <div
          class="simple-stepper__progress"
          :style="{ width: progressWidth }"
        ></div>

        <div class="simple-stepper__list">
          <button
            v-for="(step, index) in availableSteps"
            :key="step.key"
            type="button"
            class="simple-stepper__item"
            :class="{
              'is-active': step.key === currentStepKey,
              'is-complete': index < currentStepIndex,
            }"
            @click="goToStep(step.key, index)"
          >
            <div class="simple-stepper__icon">
              <v-icon size="18">
                {{ index < currentStepIndex ? "mdi-check" : step.icon }}
              </v-icon>
            </div>
            <div class="simple-stepper__label">
              {{ step.shortTitle || step.title }}
            </div>
          </button>
        </div>
      </div>

      <!-- ACTIVE BODY -->
      <div class="step-body">
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

        <PilihLayanan
          v-else-if="currentStepKey === 'layanan'"
          :form="form"
          @update-layanan-field="updateLayananField"
        />

        <KonsultasiOffline
          v-else-if="
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

        <TreatmentSection
          v-else-if="currentStepKey === 'treatment'"
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

        <PenjualanSection
          v-else-if="currentStepKey === 'penjualan'"
          :form="form"
          :obat-list="obatList"
          :total-penjualan="totalPenjualan"
          :format-number="formatNumber"
          :get-subtotal="getPenjualanSubtotal"
          @update-item="updatePenjualanItem"
          @add-item="addPenjualanItem"
          @remove-item="removePenjualanItem"
        />

        <RingkasanSection
          v-else-if="currentStepKey === 'ringkasan'"
          :form="form"
          :pasien-list="pasienList"
          :dokter-list="dokterList"
          :perawat-list="perawatList"
          :tindakan-list="tindakanList"
          :obat-list="obatList"
          :total-treatment="totalTreatment"
          :total-penjualan="totalPenjualan"
          :format-number="formatNumber"
          :get-treatment-subtotal="getTreatmentSubtotal"
          :get-penjualan-subtotal="getPenjualanSubtotal"
        />

        <!-- INLINE FOOTER -->
        <div class="step-inline-footer">
          <div class="step-inline-footer__info">
            <div class="step-inline-footer__title">
              {{ currentStepMeta.title }}
            </div>
            <div class="step-inline-footer__subtitle">
              {{ currentStepMeta.subtitle }}
            </div>
          </div>

          <div class="step-inline-footer__actions">
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
              variant="outlined"
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
              prepend-icon="mdi-arrow-right"
              :disabled="loading"
              @click="nextStep"
            >
              Lanjut
            </v-btn>

            <v-btn
              v-else
              color="success"
              prepend-icon="mdi-content-save-outline"
              :loading="loading"
              @click="handleSubmit"
            >
              Simpan Registrasi
            </v-btn>
          </div>
        </div>
      </div>
    </v-stepper>

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

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!v || "Field ini wajib diisi",
      },

      pasienList: [
        {
          id: "PS001",
          text: "Budi Santoso - RM0001 - 081234567890",
          nama: "Budi Santoso",
          no_rm: "RM0001",
          no_hp: "081234567890",
          is_member: true,
        },
        {
          id: "PS002",
          text: "Siti Aminah - RM0002 - 081234567891",
          nama: "Siti Aminah",
          no_rm: "RM0002",
          no_hp: "081234567891",
          is_member: false,
        },
        {
          id: "PS003",
          text: "Rina Lestari - RM0003 - 081234567892",
          nama: "Rina Lestari",
          no_rm: "RM0003",
          no_hp: "081234567892",
          is_member: true,
        },
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
        { id: "TR004", nama: "Microdermabrasion", harga: 300000 },
      ],

      obatList: [
        { id: "OB001", nama: "Cream Siang", harga: 120000, unit: "PCS" },
        { id: "OB002", nama: "Cream Malam", harga: 135000, unit: "PCS" },
        { id: "OB003", nama: "Facial Wash", harga: 75000, unit: "PCS" },
        { id: "OB004", nama: "Serum Acne", harga: 180000, unit: "PCS" },
      ],

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
    availableSteps() {
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

      if (this.form?.layanan?.ada_konsultasi) {
        steps.push({
          key: "konsultasi",
          title:
            this.form.layanan.channel_konsultasi === "online"
              ? "Konsultasi Online"
              : "Konsultasi Offline",
          shortTitle: "Konsultasi",
          subtitle:
            this.form.layanan.channel_konsultasi === "online"
              ? "Lengkapi data konsultasi online"
              : "Lengkapi keluhan awal pasien",
          icon:
            this.form.layanan.channel_konsultasi === "online"
              ? "mdi-video-outline"
              : "mdi-stethoscope",
        });
      }

      if (this.form?.layanan?.ada_treatment) {
        steps.push({
          key: "treatment",
          title: "Treatment",
          shortTitle: "Treatment",
          subtitle: `${this.form.treatment.items.length} item treatment`,
          icon: "mdi-spa",
        });
      }

      if (this.form?.layanan?.ada_penjualan) {
        steps.push({
          key: "penjualan",
          title: "Penjualan",
          shortTitle: "Penjualan",
          subtitle: `${this.form.penjualan.items.length} item produk`,
          icon: "mdi-pill",
        });
      }

      steps.push({
        key: "ringkasan",
        title: "Ringkasan Registrasi",
        shortTitle: "Ringkasan",
        subtitle: "Periksa kembali seluruh data",
        icon: "mdi-clipboard-check-outline",
      });

      return steps;
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
      return this.currentStepIndex === this.availableSteps.length - 1;
    },

    progressWidth() {
      if (!this.availableSteps.length) return "0%";
      if (this.availableSteps.length === 1) return "100%";

      const percent =
        (this.currentStepIndex / (this.availableSteps.length - 1)) * 100;

      return `${percent}%`;
    },

    totalTreatment() {
      if (!this.form?.layanan?.ada_treatment) return 0;

      return this.form.treatment.items.reduce((sum, item) => {
        return sum + this.getTreatmentSubtotal(item);
      }, 0);
    },

    totalPenjualan() {
      if (!this.form?.layanan?.ada_penjualan) return 0;

      return this.form.penjualan.items.reduce((sum, item) => {
        return sum + this.getPenjualanSubtotal(item);
      }, 0);
    },
  },

  watch: {
    availableSteps: {
      deep: true,
      handler(newSteps) {
        const exists = newSteps.some(
          (step) => step.key === this.currentStepKey,
        );
        if (!exists) {
          this.currentStepKey = newSteps[0]?.key || "registrasi";
        }
      },
    },
  },

  created() {
    this.form = this.getInitialForm();
  },

  mounted() {
    this.consultationHistory = [
      {
        id: 1,
        tgl: "2026-04-01",
        dokter: "dr. Andi Saputra",
        tindakan_html: "Facial Acne<br><small>Perawat: Ns. Rina</small>",
        obat_html: "Cream Malam<br>Facial Wash",
        catatan_html: "Kulit sensitif, hindari scrub berlebihan",
        lokasi: "Klinik Malang",
      },
      {
        id: 2,
        tgl: "2026-03-15",
        dokter: "dr. Bunga Lestari",
        tindakan_html: "Peeling Acne<br><small>Perawat: Ns. Tika</small>",
        obat_html: "Serum Acne",
        catatan_html: "Respon kulit cukup baik, lanjut kontrol 2 minggu",
        lokasi: "Klinik Surabaya",
      },
    ];
  },

  methods: {
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

    getInitialForm() {
      return {
        tanggal: this.getToday(),
        pasien_new_id: "PS001",
        dokter_id: "D001",
        perawat_id: "P001",

        layanan: {
          ada_konsultasi: true,
          channel_konsultasi: "offline",
          ada_treatment: true,
          ada_penjualan: true,
        },

        konsultasi_offline: {
          keluhan_awal:
            "Jerawat meradang di area pipi dan dagu sejak 2 minggu terakhir",
          catatan: "Pasien ingin konsultasi sebelum lanjut treatment",
        },

        konsultasi_online: {
          request_dokter: "dr. Andi Saputra",
          alergi: "Tidak ada",
          keluhan: "Kulit berjerawat, berminyak, dan bekas kemerahan",
          produk_sebelumnya: "Pernah memakai facial wash acne dan krim malam",
          sedang_hamil: "tidak",
          sedang_menyusui: "tidak",

          bukti_foto_kiri: "",
          bukti_foto_depan: "",
          bukti_foto_kanan: "",

          preview_before_1:
            "https://via.placeholder.com/400x300?text=Foto+Kiri",
          preview_before_2:
            "https://via.placeholder.com/400x300?text=Foto+Depan",
          preview_before_3:
            "https://via.placeholder.com/400x300?text=Foto+Kanan",

          file_name_1: "",
          file_name_2: "",
          file_name_3: "",
        },

        treatment: {
          items: [
            {
              tindakan_id: "TR001",
              harga: 150000,
              jumlah: 1,
              diskon_type: "%",
              diskon_value: 10,
              diskon_referral: 0,
            },
            {
              tindakan_id: "TR002",
              harga: 250000,
              jumlah: 1,
              diskon_type: "Rp",
              diskon_value: 25000,
              diskon_referral: 0,
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
              diskon_value: 5,
              diskon_referral: 0,
              frekuensi: "2x sehari",
              waktu_pakai: "Pagi",
              penggunaan: "Oles tipis pada area wajah",
            },
            {
              produk_id: "OB002",
              harga: 135000,
              jumlah: 1,
              unit: "PCS",
              diskon_type: "Rp",
              diskon_value: 10000,
              diskon_referral: 0,
              frekuensi: "1x sehari",
              waktu_pakai: "Malam",
              penggunaan: "Gunakan sebelum tidur",
            },
          ],
        },
      };
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

    updateLayananField({ field, value }) {
      this.form.layanan[field] = value;

      if (field === "ada_konsultasi" && !value) {
        this.form.layanan.channel_konsultasi = "";
      }

      if (field === "ada_treatment" && value === false) {
        this.form.treatment = {
          perlu_tindakan_perawat: null,
          items: [],
        };
      }

      if (
        field === "ada_konsultasi" &&
        value &&
        !this.form.layanan.channel_konsultasi
      ) {
        this.form.layanan.channel_konsultasi = "offline";
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
      if (!found) return;
      item.harga = found.harga || 0;
    },

    fillProdukPrice(index) {
      const item = this.form.penjualan.items[index];
      const found = this.obatList.find((x) => x.id === item.produk_id);
      if (!found) return;
      item.harga = found.harga || 0;
      item.unit = found.unit || "PCS";
    },

    updateTreatmentItem({ index, field, value }) {
      this.form.treatment.items[index][field] = value;

      if (field === "tindakan_id") {
        this.fillTreatmentPrice(index);
      }
    },

    addTreatmentItem() {
      this.form.treatment.items.push({
        tindakan_id: null,
        harga: 0,
        jumlah: 1,
        diskon_type: "%",
        diskon_value: 0,
        diskon_referral: 0,
      });
    },

    removeTreatmentItem(index) {
      if (this.form.treatment.items.length === 1) {
        this.showSnackbar("Minimal harus ada satu item treatment", "warning");
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
      this.form.penjualan.items.push({
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
      if (this.form.penjualan.items.length === 1) {
        this.showSnackbar("Minimal harus ada satu item penjualan", "warning");
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

    validateCurrentStep() {
      const stepKey = this.currentStepKey;

      if (stepKey === "registrasi") {
        if (!this.form.tanggal || !this.form.pasien_new_id) {
          this.showSnackbar(
            "Lengkapi tanggal registrasi dan pasien terlebih dahulu",
            "error",
          );
          return false;
        }
      }

      if (stepKey === "layanan") {
        const layananDipilih =
          this.form.layanan.ada_konsultasi ||
          this.form.layanan.ada_treatment ||
          this.form.layanan.ada_penjualan;

        if (!layananDipilih) {
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
      }

      if (stepKey === "konsultasi") {
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
      }

      if (stepKey === "treatment") {
        const invalid = this.form.treatment.items.some(
          (item) => !item.tindakan_id || Number(item.jumlah || 0) <= 0,
        );

        if (invalid) {
          this.showSnackbar("Lengkapi item treatment terlebih dahulu", "error");
          return false;
        }
      }

      if (stepKey === "penjualan") {
        const invalid = this.form.penjualan.items.some(
          (item) => !item.produk_id || Number(item.jumlah || 0) <= 0,
        );

        if (invalid) {
          this.showSnackbar("Lengkapi item penjualan terlebih dahulu", "error");
          return false;
        }
      }

      return true;
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
      if (!this.validateCurrentStep()) return;

      this.loading = true;

      try {
        const payload = JSON.parse(JSON.stringify(this.form));
        console.log("submit payload:", payload);

        await new Promise((resolve) => setTimeout(resolve, 800));

        this.showSnackbar("Registrasi berhasil disimpan", "success");
      } catch (error) {
        console.error(error);
        this.showSnackbar("Gagal menyimpan registrasi", "error");
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.currentStepKey = "registrasi";
      this.form = this.getInitialForm();
      this.dragActive = null;
      this.showSnackbar("Form berhasil direset", "success");
    },

    onPatientChange(value) {
      if (!value) {
        this.consultationHistory = [];
        return;
      }

      this.consultationHistory = [
        {
          id: 1,
          tgl: "2026-04-01",
          dokter: "dr. Andi Saputra",
          tindakan_html: "Facial Acne<br><small>Perawat: Ns. Rina</small>",
          obat_html: "Cream Malam<br>Facial Wash",
          catatan_html: "Kulit sensitif, hindari scrub berlebihan",
          lokasi: "Klinik Malang",
        },
        {
          id: 2,
          tgl: "2026-03-15",
          dokter: "dr. Bunga Lestari",
          tindakan_html: "Peeling Acne<br><small>Perawat: Ns. Tika</small>",
          obat_html: "Serum Acne",
          catatan_html: "Respon kulit cukup baik, lanjut kontrol 2 minggu",
          lokasi: "Klinik Surabaya",
        },
      ];
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

    onDrop(event, key) {
      this.dragActive = null;
      const file = event?.dataTransfer?.files?.[0];
      if (!file) return;
      this.processImageFile(file, key);
    },

    onFileChange(event, key) {
      const file = event?.target?.files?.[0];
      if (!file) return;
      this.processImageFile(file, key);
      event.target.value = "";
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
        before_1: "https://via.placeholder.com/400x300?text=Foto+Kiri",
        before_2: "https://via.placeholder.com/400x300?text=Foto+Depan",
        before_3: "https://via.placeholder.com/400x300?text=Foto+Kanan",
      };

      this.form.konsultasi_online[previewMap[key]] = defaultPreviewMap[key];
      this.form.konsultasi_online[hiddenMap[key]] = "";
      this.form.konsultasi_online[fileNameMap[key]] = "";
    },
  },
};
</script>

<style scoped>
.registrasi-layanan-page {
  background: #f8fafc;
  min-height: 100%;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.registrasi-stepper {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.simple-stepper {
  position: relative;
  padding: 20px 24px 14px;
  border-bottom: 1px solid #eef2f7;
  background: #fff;
}

.simple-stepper__track {
  position: absolute;
  top: 39px;
  left: 56px;
  right: 56px;
  height: 2px;
  background: #e2e8f0;
  border-radius: 999px;
}

.simple-stepper__progress {
  position: absolute;
  top: 39px;
  left: 56px;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  border-radius: 999px;
  transition: width 0.25s ease;
}

.simple-stepper__list {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.simple-stepper__item {
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 88px;
  cursor: pointer;
  padding: 0;
}

.simple-stepper__icon {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #64748b;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #dbe4ee;
  transition: all 0.2s ease;
}

.simple-stepper__label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-align: center;
  line-height: 1.3;
}

.simple-stepper__item.is-active .simple-stepper__icon {
  background: rgb(var(--v-theme-primary));
  color: #fff;
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.18);
}

.simple-stepper__item.is-active .simple-stepper__label {
  color: #0f172a;
}

.simple-stepper__item.is-complete .simple-stepper__icon {
  background: rgb(var(--v-theme-success));
  color: #fff;
  box-shadow: 0 0 0 1px rgba(var(--v-theme-success), 0.18);
}

.simple-stepper__item.is-complete .simple-stepper__label {
  color: #334155;
}

.step-body {
  padding: 20px;
  background: #fff;
}

.step-inline-footer {
  margin-top: 20px;
  padding: 16px 20px;
  border-top: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background: #fff;
}

.step-inline-footer__title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.step-inline-footer__subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.step-inline-footer__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .simple-stepper {
    padding: 18px 12px 12px;
    overflow-x: auto;
  }

  .simple-stepper__track,
  .simple-stepper__progress {
    display: none;
  }

  .simple-stepper__list {
    justify-content: flex-start;
    min-width: max-content;
    gap: 14px;
  }

  .simple-stepper__item {
    min-width: 72px;
  }

  .step-body {
    padding: 14px;
  }

  .step-inline-footer {
    padding: 14px;
    flex-direction: column;
    align-items: stretch;
  }

  .step-inline-footer__actions {
    width: 100%;
    flex-direction: column;
  }

  .step-inline-footer__actions .v-btn {
    width: 100%;
  }
}
</style>

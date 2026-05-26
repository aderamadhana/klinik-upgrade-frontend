<template>
  <div>
    <div class="d-flex justify-space-between align-start mb-6">
      <div>
        <h1 class="page-title">Proses Antrian Dokter</h1>
        <p class="page-subtitle">
          Input data pelayanan dokter berdasarkan jenis layanan pasien
        </p>
      </div>

      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="$router.back()"
      >
        Kembali
      </v-btn>
    </div>

    <v-card variant="flat" class="border">
      <v-card-text class="pa-5">
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="mb-4"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-alert type="info" variant="tonal" density="compact" class="mb-5">
          Field yang tampil mengikuti jenis layanan pasien.
        </v-alert>

        <v-skeleton-loader v-if="loading" type="article, table, article" />

        <template v-else>
          <antrian-dokter-pasien-card
            :patient="patient"
            :channel-chip="channelChip"
            :service-chips="serviceChips"
            @pengkajian-awal="goToPengkajianAwal"
          />

          <antrian-dokter-konsultasi-option
            v-if="showAddConsultationOption"
            v-model="form.add_consultation"
          />

          <v-alert
            :type="ruleAlert.type"
            :color="ruleAlert.color"
            variant="tonal"
            density="compact"
            class="mb-5"
          >
            {{ ruleAlert.text }}
          </v-alert>

          <antrian-dokter-online-info
            v-if="showOnlineMedicalInfo"
            :online-registration="onlineRegistration"
          />

          <antrian-dokter-soap-section
            v-if="showSoapForm"
            v-model:form="form"
            :subjective-options="subjectiveOptions"
            :diagnosa-options="diagnosaOptions"
          />

          <antrian-dokter-riwayat-section
            :headers="riwayatHeaders"
            :items="riwayatTransaksi"
          />

          <antrian-dokter-obat-section
            v-if="showProductSection"
            v-model:items="obatItems"
            :options="obatOptions"
            :frekuensi-options="frekuensiOptions"
            :waktu-pakai-options="waktuPakaiOptions"
          />

          <antrian-dokter-treatment-section
            v-if="showTreatmentSection"
            v-model:items="treatmentItems"
            :options="treatmentOptions"
          />

          <antrian-dokter-summary-card
            :total-treatment="totalTreatment"
            :total-obat="totalObat"
            :consultation-fee="consultationFee"
            :grand-total="grandTotal"
          />

          <div class="d-flex justify-end ga-2 flex-wrap">
            <v-btn
              variant="outlined"
              color="secondary"
              size="large"
              @click="$router.back()"
            >
              Batal
            </v-btn>

            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-content-save-check-outline"
              :loading="submitLoading"
              @click="submitForm"
            >
              Simpan & Selesai
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="2500"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import registrasiLayananService from "@/services/registrasi/registrasiLayananService";

import AntrianDokterPasienCard from "@/components/antrian-dokter/antrian-dokter-pasien-card.vue";
import AntrianDokterKonsultasiOption from "@/components/antrian-dokter/antrian-dokter-konsultasi-option.vue";
import AntrianDokterOnlineInfo from "@/components/antrian-dokter/antrian-dokter-online-info.vue";
import AntrianDokterSoapSection from "@/components/antrian-dokter/antrian-dokter-soap-section.vue";
import AntrianDokterRiwayatSection from "@/components/antrian-dokter/antrian-dokter-riwayat-section.vue";
import AntrianDokterObatSection from "@/components/antrian-dokter/antrian-dokter-obat-section.vue";
import AntrianDokterTreatmentSection from "@/components/antrian-dokter/antrian-dokter-treatment-section.vue";
import AntrianDokterSummaryCard from "@/components/antrian-dokter/antrian-dokter-summary-card.vue";

const CONSULTATION_PRICE = 100000;

export default {
  name: "ProsesAntrianDokter",

  components: {
    AntrianDokterPasienCard,
    AntrianDokterKonsultasiOption,
    AntrianDokterOnlineInfo,
    AntrianDokterSoapSection,
    AntrianDokterRiwayatSection,
    AntrianDokterObatSection,
    AntrianDokterTreatmentSection,
    AntrianDokterSummaryCard,
  },

  data() {
    return {
      loading: false,
      submitLoading: false,
      errorMessage: "",

      registration: null,

      patient: {
        kode_registrasi: "-",
        nama_pasien: "-",
        no_rm: "-",
        no_hp: "-",
        tanggal_kunjungan: "-",
        waktu_kunjungan: "-",
        dokter: "-",
        klinik: "-",
      },

      onlineRegistration: {
        alergi: "-",
        keluhan_utama: "-",
        produk_sebelumnya: "-",
        sedang_hamil: "-",
        sedang_menyusui: "-",
        catatan_cs: "-",
      },

      form: {
        add_consultation: false,
        subjective_selected: [],
        subjective_lainnya: "",
        objective: "",
        assessment_selected: [],
        assessment_lainnya: "",
        plan: "",
        next_date_konsultasi: "",
      },

      subjectiveOptions: [
        "Jerawat meradang",
        "Kulit kusam",
        "Flek wajah",
        "Bruntusan",
        "Kulit berminyak",
        "Bekas jerawat",
      ],

      diagnosaOptions: [
        "Acne Vulgaris",
        "Post Inflammatory Hyperpigmentation",
        "Melasma",
        "Seborrheic Skin",
        "Sensitive Skin",
      ],

      frekuensiOptions: ["1x sehari", "2x sehari", "3x sehari", "Jika perlu"],
      waktuPakaiOptions: ["Pagi", "Siang", "Malam", "Pagi & Malam"],

      obatOptions: [],
      treatmentOptions: [],

      obatItems: [],
      treatmentItems: [],

      riwayatHeaders: [
        { title: "TGL", key: "tgl", sortable: false },
        { title: "DOKTER", key: "dokter", sortable: false },
        {
          title: "TINDAKAN & PERAWAT",
          key: "tindakan_perawat",
          sortable: false,
        },
        { title: "OBAT", key: "obat", sortable: false },
        { title: "CATATAN", key: "catatan", sortable: false },
        { title: "TRANSAKSI", key: "transaksi", sortable: false },
        { title: "KLINIK", key: "klinik", sortable: false },
      ],

      riwayatTransaksi: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    registrasiId() {
      return this.$route.params.id;
    },

    hasOriginalConsultation() {
      return this.isConsultationChannel(this.registration?.channel_konsultasi);
    },

    hasConsultation() {
      return this.hasOriginalConsultation || this.form.add_consultation;
    },

    hasTreatment() {
      return (
        this.isTrue(this.registration?.is_treatment) ||
        this.treatmentItems.some(
          (item) => item.treatment_toko_id || item.treatment_id,
        )
      );
    },

    hasPenjualan() {
      return (
        this.isTrue(this.registration?.is_penjualan) ||
        this.obatItems.some((item) => item.produk_toko_id || item.produk_id)
      );
    },

    isOfflineConsultation() {
      return (
        this.getChannelValue(this.registration?.channel_konsultasi) ===
        "offline"
      );
    },

    isOnlineConsultation() {
      return (
        this.getChannelValue(this.registration?.channel_konsultasi) === "online"
      );
    },

    showOnlineMedicalInfo() {
      return this.hasOriginalConsultation && this.isOnlineConsultation;
    },

    showSoapForm() {
      if (this.hasOriginalConsultation && this.isOfflineConsultation)
        return true;
      if (!this.hasOriginalConsultation && this.form.add_consultation)
        return true;

      return false;
    },

    showAddConsultationOption() {
      return this.hasTreatment && !this.hasOriginalConsultation;
    },

    showProductSection() {
      return this.hasTreatment || this.hasPenjualan || this.hasConsultation;
    },

    showTreatmentSection() {
      return this.hasTreatment;
    },

    totalObat() {
      return this.obatItems.reduce(
        (sum, item) => sum + this.toNumber(item.subtotal),
        0,
      );
    },

    totalTreatment() {
      return this.treatmentItems.reduce(
        (sum, item) => sum + this.toNumber(item.total),
        0,
      );
    },

    consultationFee() {
      if (!this.hasConsultation) return 0;
      if (this.hasTreatment) return 0;

      return CONSULTATION_PRICE;
    },

    grandTotal() {
      return this.totalTreatment + this.totalObat + this.consultationFee;
    },

    channelChip() {
      if (this.isOnlineConsultation) {
        return {
          label: "Konsultasi Online",
          color: "info",
          icon: "mdi-monitor-account",
        };
      }

      if (this.isOfflineConsultation) {
        return {
          label: "Konsultasi Offline",
          color: "primary",
          icon: "mdi-hospital-building",
        };
      }

      if (this.form.add_consultation) {
        return {
          label: "Konsultasi Tambahan",
          color: "primary",
          icon: "mdi-stethoscope",
        };
      }

      return {
        label: "Tanpa Konsultasi",
        color: "secondary",
        icon: "mdi-minus-circle-outline",
      };
    },

    serviceChips() {
      const chips = [];

      if (this.hasConsultation) {
        chips.push({
          label: "Konsultasi",
          color: "primary",
          icon: "mdi-stethoscope",
        });
      }

      if (this.hasTreatment) {
        chips.push({
          label: "Treatment",
          color: "secondary",
          icon: "mdi-face-woman-shimmer-outline",
        });
      }

      if (this.hasPenjualan) {
        chips.push({
          label: "Obat / Produk",
          color: "success",
          icon: "mdi-pill",
        });
      }

      if (!chips.length) {
        chips.push({
          label: "Pelayanan Dokter",
          color: "info",
          icon: "mdi-doctor",
        });
      }

      return chips;
    },

    ruleAlert() {
      if (
        this.hasOriginalConsultation &&
        this.isOfflineConsultation &&
        this.hasTreatment
      ) {
        return {
          type: "success",
          color: "success",
          text: "Konsultasi offline + treatment: SOAP tampil, Informasi Medis Pendaftaran tidak tampil, biaya konsultasi Rp 0.",
        };
      }

      if (
        this.hasOriginalConsultation &&
        this.isOnlineConsultation &&
        this.hasTreatment
      ) {
        return {
          type: "info",
          color: "info",
          text: "Konsultasi online + treatment: Informasi Medis Pendaftaran tampil, SOAP tidak tampil, biaya konsultasi Rp 0.",
        };
      }

      if (
        this.hasTreatment &&
        !this.hasOriginalConsultation &&
        !this.form.add_consultation
      ) {
        return {
          type: "warning",
          color: "warning",
          text: "Treatment saja: SOAP dan Informasi Medis Pendaftaran tidak tampil. Dokter tetap bisa menambahkan konsultasi dari opsi di atas.",
        };
      }

      if (this.hasTreatment && this.form.add_consultation) {
        return {
          type: "success",
          color: "success",
          text: "Treatment + konsultasi tambahan: SOAP tampil dan biaya konsultasi Rp 0.",
        };
      }

      if (this.hasConsultation && !this.hasTreatment) {
        return {
          type: "warning",
          color: "warning",
          text: "Konsultasi tanpa treatment: biaya konsultasi Rp 100.000.",
        };
      }

      return {
        type: "info",
        color: "info",
        text: "Data layanan mengikuti registrasi pasien.",
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
        const response = await registrasiLayananService.getById(
          this.registrasiId,
        );
        const data = response?.data || response;

        this.registration = data;
        this.mapRegistration(data);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },

    mapRegistration(data) {
      const pasien = data?.pasien || {};
      const toko = data?.toko || {};
      const dokter =
        data?.dokter_awal || data?.dokterAwal || data?.dokter || {};
      const intake = data?.konsultasi_intake || {};

      this.patient = {
        kode_registrasi: data?.kode_registrasi || "-",
        nama_pasien: pasien?.nama || data?.nama_pasien || "-",
        no_rm: pasien?.no_rm || data?.no_rm || "-",
        no_hp: pasien?.no_hp || pasien?.no_telp || data?.no_hp || "-",
        tanggal_kunjungan: this.formatDate(
          data?.tanggal_kunjungan || data?.tanggal,
        ),
        waktu_kunjungan: this.formatTime(
          data?.registered_at || data?.created_at,
        ),
        dokter: dokter?.nama || data?.nama_dokter || "-",
        klinik: toko?.nama_toko || toko?.nama || data?.toko_nama || "-",
      };

      this.onlineRegistration = {
        alergi: this.emptyText(intake?.alergi),
        keluhan_utama: this.emptyText(
          intake?.keluhan_utama || intake?.keluhan || intake?.keluhan_awal,
        ),
        produk_sebelumnya: this.emptyText(
          intake?.produk_obat_sebelumnya || intake?.produk_sebelumnya,
        ),
        sedang_hamil: this.formatBooleanText(intake?.sedang_hamil),
        sedang_menyusui: this.formatBooleanText(intake?.sedang_menyusui),
        catatan_cs: this.emptyText(intake?.catatan_cs || intake?.catatan_awal),
      };

      this.mapSoap(data?.dokter_soap);
      this.mapObat(data?.penjualan_details || []);
      this.mapTreatment(data?.treatment_details || []);
      this.mapRiwayat(data?.riwayat_transaksi || []);
    },

    mapSoap(soap) {
      if (!soap) return;

      this.form.subjective_selected = this.safeArray(soap?.subjective_selected);
      this.form.subjective_lainnya = soap?.subjective_lainnya || "";
      this.form.objective = soap?.objective || "";
      this.form.assessment_selected = this.safeArray(soap?.assessment_selected);
      this.form.assessment_lainnya = soap?.assessment_lainnya || "";
      this.form.plan = soap?.plan || "";
      this.form.next_date_konsultasi = soap?.next_date_konsultasi || "";
    },

    mapObat(rows) {
      this.obatOptions = this.uniqueOptions(
        rows.map((item) => ({
          label:
            item?.nama_produk ||
            item?.produk?.nama ||
            item?.produk_nama ||
            "Produk",
          value: item?.produk_toko_id || item?.produk_id || item?.id,
          produk_id: item?.produk_id || item?.produk?.id || null,
          harga: this.toNumber(item?.harga || item?.produk_toko?.harga_jual),
        })),
      );

      this.obatItems = rows.length
        ? rows.map((item) => ({
            id: item?.id || null,
            produk_id: item?.produk_id || item?.produk?.id || null,
            produk_toko_id: item?.produk_toko_id || item?.produk_id || null,
            nama_produk:
              item?.nama_produk ||
              item?.produk?.nama ||
              item?.produk_nama ||
              "",
            harga: this.toNumber(item?.harga || item?.produk_toko?.harga_jual),
            jumlah: this.toNumber(item?.jumlah || 1),
            subtotal: this.toNumber(item?.subtotal || item?.total),
            frekuensi: item?.frekuensi || "",
            waktu_pakai: item?.waktu_pakai || "",
            penggunaan: item?.penggunaan || "",
          }))
        : [this.createEmptyObatRow()];
    },

    mapTreatment(rows) {
      this.treatmentOptions = this.uniqueOptions(
        rows.map((item) => ({
          label:
            item?.nama_treatment ||
            item?.treatment?.nama ||
            item?.treatment_nama ||
            "Treatment",
          value: item?.treatment_toko_id || item?.treatment_id || item?.id,
          treatment_id: item?.treatment_id || item?.treatment?.id || null,
          harga: this.toNumber(item?.harga || item?.treatment_toko?.tarif),
        })),
      );

      this.treatmentItems = rows.length
        ? rows.map((item) => ({
            id: item?.id || null,
            treatment_id: item?.treatment_id || item?.treatment?.id || null,
            treatment_toko_id:
              item?.treatment_toko_id || item?.treatment_id || null,
            nama_treatment:
              item?.nama_treatment ||
              item?.treatment?.nama ||
              item?.treatment_nama ||
              "",
            harga: this.toNumber(item?.harga || item?.treatment_toko?.tarif),
            jumlah: this.toNumber(item?.jumlah || 1),
            total: this.toNumber(item?.total),
            perlu_tindakan_perawat: this.isTrue(item?.perlu_tindakan_perawat),
          }))
        : [this.createEmptyTreatmentRow()];
    },

    mapRiwayat(rows) {
      this.riwayatTransaksi = Array.isArray(rows) ? rows : [];
    },

    createEmptyObatRow() {
      return {
        id: null,
        produk_id: null,
        produk_toko_id: null,
        nama_produk: "",
        harga: 0,
        jumlah: 1,
        subtotal: 0,
        frekuensi: "",
        waktu_pakai: "",
        penggunaan: "",
      };
    },

    createEmptyTreatmentRow() {
      return {
        id: null,
        treatment_id: null,
        treatment_toko_id: null,
        nama_treatment: "",
        harga: 0,
        jumlah: 1,
        total: 0,
        perlu_tindakan_perawat: false,
      };
    },

    buildPayload() {
      return {
        registrasi_id: this.registrasiId,

        layanan: {
          ada_konsultasi: this.hasConsultation ? 1 : 0,
          add_konsultasi_dokter: this.form.add_consultation ? 1 : 0,
          channel_konsultasi: this.hasConsultation
            ? this.getEffectiveChannelPayload()
            : "",
          is_treatment: this.hasTreatment ? 1 : 0,
          is_penjualan: this.hasPenjualan ? 1 : 0,
          biaya_konsultasi: this.consultationFee,
        },

        dokter_soap: this.showSoapForm
          ? {
              subjective_selected: this.form.subjective_selected,
              subjective_lainnya: this.form.subjective_lainnya,
              objective: this.form.objective,
              assessment_selected: this.form.assessment_selected,
              assessment_lainnya: this.form.assessment_lainnya,
              plan: this.form.plan,
              next_date_konsultasi: this.form.next_date_konsultasi,
            }
          : null,

        penjualan: {
          total: this.totalObat,
          items: this.obatItems
            .filter((item) => item.produk_toko_id || item.produk_id)
            .map((item) => ({
              id: item.id,
              produk_toko_id: item.produk_toko_id,
              produk_id: item.produk_id,
              nama_produk: item.nama_produk,
              harga: this.toNumber(item.harga),
              jumlah: this.toNumber(item.jumlah),
              subtotal: this.toNumber(item.subtotal),
              frekuensi: item.frekuensi,
              waktu_pakai: item.waktu_pakai,
              penggunaan: item.penggunaan,
            })),
        },

        treatment: {
          total: this.totalTreatment,
          items: this.treatmentItems
            .filter((item) => item.treatment_toko_id || item.treatment_id)
            .map((item) => ({
              id: item.id,
              treatment_toko_id: item.treatment_toko_id,
              treatment_id: item.treatment_id,
              nama_treatment: item.nama_treatment,
              harga: this.toNumber(item.harga),
              jumlah: this.toNumber(item.jumlah),
              total: this.toNumber(item.total),
              perlu_tindakan_perawat: item.perlu_tindakan_perawat ? 1 : 0,
            })),
        },

        total: {
          total_treatment: this.totalTreatment,
          total_penjualan: this.totalObat,
          biaya_konsultasi: this.consultationFee,
          grand_total: this.grandTotal,
        },
      };
    },

    async submitForm() {
      this.submitLoading = true;

      try {
        const payload = this.buildPayload();

        await registrasiLayananService.processDokter(
          this.registrasiId,
          payload,
        );

        this.showSnackbar("Proses antrian dokter berhasil disimpan", "success");
        this.$router.push("/pelayanan-medis/antrian-dokter");
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.submitLoading = false;
      }
    },

    goToPengkajianAwal() {
      this.$router.push(
        `/pelayanan-medis/antrian-dokter/${this.registrasiId}/isi-pengkajian-awal`,
      );
    },

    getEffectiveChannelPayload() {
      if (this.isOnlineConsultation) return "online";
      return "offline";
    },

    getChannelValue(value) {
      const normalized = String(value || "").toLowerCase();

      if (normalized === "1" || normalized === "offline") return "offline";
      if (normalized === "2" || normalized === "online") return "online";

      return "";
    },

    isConsultationChannel(value) {
      return ["offline", "online"].includes(this.getChannelValue(value));
    },

    isTrue(value) {
      return value === true || value === 1 || value === "1";
    },

    toNumber(value) {
      if (typeof value === "number") return value;
      if (value === null || value === undefined || value === "") return 0;

      return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
    },

    safeArray(value) {
      if (Array.isArray(value)) return value;

      if (typeof value === "string" && value.trim() !== "") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch {
          return [value];
        }
      }

      return [];
    },

    uniqueOptions(items) {
      const map = new Map();

      items.forEach((item) => {
        if (!item.value) return;
        map.set(item.value, item);
      });

      return Array.from(map.values());
    },

    emptyText(value) {
      if (value === null || value === undefined || value === "") return "-";
      return value;
    },

    formatBooleanText(value) {
      if (value === null || value === undefined || value === "") return "-";
      if (this.isTrue(value)) return "Ya";

      const normalized = String(value).toLowerCase();

      if (["tidak", "no", "false", "0"].includes(normalized)) return "Tidak";

      return value;
    },

    formatDate(value) {
      if (!value) return "-";

      if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        const [year, month, day] = String(value).split("-").map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatTime(value) {
      if (!value) return "-";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return "-";

      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    showSnackbar(text, color = "success") {
      this.snackbar.show = true;
      this.snackbar.text = text;
      this.snackbar.color = color;
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
        "Terjadi kesalahan pada proses antrian dokter"
      );
    },
  },
};
</script>

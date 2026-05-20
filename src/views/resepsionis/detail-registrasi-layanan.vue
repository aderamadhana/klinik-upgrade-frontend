<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Detail Registrasi Layanan</h1>
        <p class="page-subtitle">Informasi lengkap registrasi layanan pasien</p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      rounded="lg"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader
      v-if="loading"
      type="article, table-row@3, actions"
      class="main-card"
    />

    <template v-else>
      <v-card class="main-card mb-4" flat>
        <div class="detail-header">
          <div>
            <div class="label-text">No Registrasi</div>
            <div class="code-text">
              {{ detail.kode_registrasi || `REG-${detail.id || "-"}` }}
            </div>
          </div>

          <div class="header-actions">
            <span class="status-pill" :class="getStatusClass(detail.status)">
              {{ getStatusLabel(detail.status) }}
            </span>

            <v-btn
              v-if="canProcess(detail)"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-play-circle-outline"
              class="action-btn"
              @click="goToProcess(detail)"
            >
              Proses
            </v-btn>

            <v-btn
              v-if="canCancel(detail)"
              color="error"
              variant="tonal"
              prepend-icon="mdi-close-circle-outline"
              class="action-btn"
              @click="confirmCancel"
            >
              Cancel
            </v-btn>
          </div>
        </div>

        <v-divider />

        <v-row class="pa-4" dense>
          <v-col cols="12" md="3">
            <div class="info-box">
              <div class="label-text">Tanggal Kunjungan</div>
              <div class="value-text">
                {{ formatDate(detail.tanggal_kunjungan || detail.tanggal) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="info-box">
              <div class="label-text">Jam Registrasi</div>
              <div class="value-text">
                {{ formatTime(detail.registered_at || detail.created_at) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="info-box">
              <div class="label-text">Total</div>
              <div class="value-text total-text">
                Rp {{ formatNumber(detail.grand_total || 0) }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="info-box">
              <div class="label-text">Current Task</div>
              <div class="value-text">
                {{ getTaskLabel(detail.current_task) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-card class="main-card" flat>
            <div class="section-head">
              <v-icon color="primary" size="20">mdi-account-outline</v-icon>
              <span>Data Pasien</span>
            </div>

            <v-divider />

            <div class="section-body">
              <div class="detail-row">
                <span>Nama Pasien</span>
                <strong>{{ getPasienName(detail) }}</strong>
              </div>

              <div class="detail-row">
                <span>No. RM</span>
                <strong>{{ getPasienValue(detail, "no_rm") }}</strong>
              </div>

              <div class="detail-row">
                <span>No. HP</span>
                <strong>{{ getPasienValue(detail, "no_hp") }}</strong>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="main-card" flat>
            <div class="section-head">
              <v-icon color="primary" size="20">mdi-account-tie-outline</v-icon>
              <span>Petugas Awal</span>
            </div>

            <v-divider />

            <div class="section-body">
              <div class="detail-row">
                <span>Dokter</span>
                <strong>{{ getDokterName(detail) }}</strong>
              </div>

              <div class="detail-row">
                <span>Perawat</span>
                <strong>{{ getPerawatName(detail) }}</strong>
              </div>

              <div class="detail-row">
                <span>Cabang</span>
                <strong>{{ getTokoName(detail) }}</strong>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card class="main-card mt-4" flat>
            <div class="section-head">
              <v-icon color="primary" size="20">mdi-format-list-checks</v-icon>
              <span>Layanan Dipilih</span>
            </div>

            <v-divider />

            <div class="section-body">
              <div class="service-list">
                <v-chip
                  v-if="Number(detail.channel_konsultasi || 0) > 0"
                  color="primary"
                  variant="tonal"
                  size="small"
                >
                  {{ getChannelLabel(detail.channel_konsultasi) }}
                </v-chip>

                <v-chip
                  v-if="isTrue(detail.is_treatment)"
                  color="success"
                  variant="tonal"
                  size="small"
                >
                  Treatment
                </v-chip>

                <v-chip
                  v-if="isTrue(detail.is_penjualan)"
                  color="info"
                  variant="tonal"
                  size="small"
                >
                  Penjualan
                </v-chip>

                <span
                  v-if="
                    Number(detail.channel_konsultasi || 0) === 0 &&
                    !isTrue(detail.is_treatment) &&
                    !isTrue(detail.is_penjualan)
                  "
                  class="empty-text"
                >
                  Tidak ada layanan
                </span>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card class="main-card mt-4" flat>
            <div class="section-head">
              <v-icon color="primary" size="20">mdi-note-text-outline</v-icon>
              <span>Catatan</span>
            </div>

            <v-divider />

            <div class="section-body">
              <div class="note-box">
                {{ detail.catatan || detail.keterangan || "Tidak ada catatan" }}
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <div class="bottom-actions">
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          prepend-icon="mdi-arrow-left"
          class="action-btn"
          @click="goBack"
        >
          Kembali
        </v-btn>
      </div>
    </template>

    <v-dialog v-model="cancelDialog.show" max-width="460">
      <v-card rounded="lg">
        <v-card-title class="font-weight-bold">
          Batalkan Registrasi?
        </v-card-title>

        <v-card-text>
          Data registrasi
          <strong>
            {{ detail.kode_registrasi || `REG-${detail.id}` }}
          </strong>
          akan dibatalkan.
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            color="grey-darken-1"
            :disabled="cancelDialog.loading"
            @click="cancelDialog.show = false"
          >
            Tutup
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="cancelDialog.loading"
            @click="cancelRegistrasi"
          >
            Batalkan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

export default {
  name: "DetailRegistrasiLayanan",

  data() {
    return {
      loading: false,
      errorMessage: "",
      detail: {},

      breadcrumbs: [
        { title: "Resepsionis", disabled: true },
        {
          title: "Registrasi Layanan",
          disabled: false,
          to: "/resepsionis/registrasi-layanan",
        },
        {
          title: "Detail",
          disabled: true,
        },
      ],

      cancelDialog: {
        show: false,
        loading: false,
      },

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    id() {
      return this.$route.params.id;
    },
  },

  mounted() {
    this.fetchDetail();
  },

  methods: {
    async fetchDetail() {
      if (!this.id) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await registrasiLayananService.getById(this.id);
        const payload = response?.data || response;

        this.detail = payload?.data || payload || {};
      } catch (error) {
        this.detail = {};
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },

    confirmCancel() {
      this.cancelDialog.show = true;
    },

    async cancelRegistrasi() {
      if (!this.detail?.id) return;

      this.cancelDialog.loading = true;

      try {
        const response = await registrasiLayananService.cancel(this.detail.id);

        this.showSnackbar(
          response?.message || "Registrasi berhasil dibatalkan",
          "success",
        );

        this.cancelDialog.show = false;
        await this.fetchDetail();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.cancelDialog.loading = false;
      }
    },

    goBack() {
      this.$router.push("/resepsionis/registrasi-layanan");
    },

    goToProcess(item) {
      const task = Number(item?.current_task || 0);

      if (task === 1) {
        this.$router.push(`/pelayanan-medis/antrian-dokter/proses/${item.id}`);
        return;
      }

      if (task === 2) {
        this.$router.push(`/pelayanan-medis/treatment/proses/${item.id}`);
        return;
      }

      if (task === 3) {
        this.$router.push(`/pelayanan-medis/nurse-station/proses/${item.id}`);
        return;
      }

      if (task === 4) {
        this.$router.push(`/kasir/pembayaran/proses/${item.id}`);
        return;
      }

      this.showSnackbar("Task registrasi belum tersedia", "warning");
    },

    canProcess(item) {
      return (
        Number(item?.status || 0) === 1 && Number(item?.current_task || 0) > 0
      );
    },

    canCancel(item) {
      return [0, 1].includes(Number(item?.status || 0));
    },

    getPasienName(item) {
      return (
        item?.pasien?.nama ||
        item?.pasien?.nama_pasien ||
        item?.pasien_nama ||
        item?.nama_pasien ||
        "-"
      );
    },

    getPasienValue(item, key) {
      return item?.pasien?.[key] || item?.[key] || "-";
    },

    getDokterName(item) {
      return (
        item?.dokter_awal?.nama ||
        item?.dokterAwal?.nama ||
        item?.dokter?.nama ||
        item?.dokter_nama ||
        "-"
      );
    },

    getPerawatName(item) {
      return (
        item?.perawat_awal?.nama ||
        item?.perawatAwal?.nama ||
        item?.perawat?.nama ||
        item?.perawat_nama ||
        "-"
      );
    },

    getTokoName(item) {
      return (
        item?.toko?.nama ||
        item?.toko?.nama_toko ||
        item?.toko_nama ||
        item?.nama_toko ||
        "-"
      );
    },

    getChannelLabel(value) {
      const numberValue = Number(value || 0);

      if (numberValue === 1) return "Konsultasi Offline";
      if (numberValue === 2) return "Konsultasi Online";

      if (value === "offline") return "Konsultasi Offline";
      if (value === "online") return "Konsultasi Online";

      return "Konsultasi";
    },

    getTaskLabel(value) {
      const numberValue = Number(value || 0);

      const map = {
        0: "Belum Ada Task",
        1: "Antrian Dokter",
        2: "Treatment",
        3: "Nurse Station",
        4: "Pembayaran",
      };

      return map[numberValue] || "-";
    },

    getStatusLabel(value) {
      const numberValue = Number(value || 0);

      const map = {
        0: "Draft",
        1: "Aktif",
        2: "Selesai",
        9: "Batal",
      };

      return map[numberValue] || "-";
    },

    getStatusClass(value) {
      const numberValue = Number(value || 0);

      const map = {
        0: "status-draft",
        1: "status-active",
        2: "status-done",
        9: "status-cancel",
      };

      return map[numberValue] || "status-draft";
    },

    isTrue(value) {
      return value === true || value === 1 || value === "1";
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
        "Terjadi kesalahan"
      );
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
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
  },
};
</script>

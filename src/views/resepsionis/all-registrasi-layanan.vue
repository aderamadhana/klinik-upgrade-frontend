<template>
  <div>
    <!-- PAGE HEADER: tetap pakai style existing -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Registrasi Layanan</h1>
        <p class="page-subtitle">
          Daftar registrasi layanan pasien yang sudah dibuat oleh FO
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card variant="flat" class="border mb-4">
      <!-- TOOLBAR -->
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <!-- KIRI: SEARCH -->
          <v-col cols="12" md="5">
            <v-text-field
              v-model="filters.search"
              label="Cari"
              placeholder="Kode, nama pasien, No. RM, No. HP"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
              @keyup.enter="fetchData"
              @click:clear="onClearSearch"
            />
          </v-col>

          <!-- KANAN: FILTER + ACTION -->
          <v-col cols="12" md="7">
            <v-row dense justify="end" align="center">
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filters.tanggal"
                  label="Tanggal"
                  type="date"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar"
                  hide-details
                  @update:modelValue="fetchData"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="filters.status"
                  label="Status"
                  :items="statusOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:modelValue="fetchData"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-refresh"
                  :loading="loading"
                  block
                  @click="fetchData"
                >
                  Refresh
                </v-btn>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-btn
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  block
                  @click="goToAdd"
                >
                  Entry Data
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <!-- ALERT -->
      <v-card-text v-if="!activeTokoId || errorMessage" class="pa-4 pb-0">
        <v-alert
          v-if="!activeTokoId"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          Cabang aktif belum terpilih. Data registrasi akan lebih akurat jika
          cabang sudah dipilih dari header.
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="mb-3"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <!-- TABLE -->
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          item-value="id"
          density="compact"
          class="border"
          :items-per-page="pagination.perPage"
          hide-default-footer
        >
          <template #loading>
            <v-skeleton-loader type="table-row@8" />
          </template>

          <template #item.registrasi_pasien="{ item }">
            <div class="py-2">
              <div class="d-flex align-start ga-3">
                <div>
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    class="px-0 font-weight-bold"
                    @click="goToDetail(item)"
                  >
                    {{ item.kode_registrasi || "-" }}
                  </v-btn>

                  <div
                    class="d-flex align-center ga-1 text-caption text-medium-emphasis"
                  >
                    <v-icon icon="mdi-calendar" size="14" />
                    <span>
                      {{ formatDate(item.tanggal_kunjungan || item.tanggal) }}
                    </span>
                  </div>

                  <div
                    class="d-flex align-center ga-1 text-caption text-medium-emphasis"
                  >
                    <v-icon icon="mdi-clock-outline" size="14" />
                    <span>
                      Jam
                      {{ formatTime(item.registered_at || item.created_at) }}
                    </span>
                  </div>
                </div>

                <v-divider vertical />

                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-bold">
                    {{ getPasienName(item) }}
                  </div>

                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ getPasienMeta(item) }}
                  </div>

                  <div class="d-flex flex-wrap ga-2 mt-2">
                    <v-chip size="x-small" color="primary" variant="tonal">
                      Dokter: {{ getDokterName(item) }}
                    </v-chip>

                    <v-chip size="x-small" color="success" variant="tonal">
                      Perawat: {{ getPerawatName(item) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="d-flex flex-wrap ga-1 py-2">
              <v-chip
                v-if="hasConsultation(item)"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ getChannelLabel(item.channel_konsultasi) }}
              </v-chip>

              <v-chip
                v-if="hasTreatment(item)"
                size="small"
                color="success"
                variant="tonal"
              >
                Treatment
              </v-chip>

              <v-chip
                v-if="hasSales(item)"
                size="small"
                color="info"
                variant="tonal"
              >
                Penjualan
              </v-chip>

              <span
                v-if="
                  !hasConsultation(item) &&
                  !hasTreatment(item) &&
                  !hasSales(item)
                "
                class="text-body-2 text-medium-emphasis"
              >
                -
              </span>
            </div>
          </template>

          <template #item.total_status="{ item }">
            <div class="py-2">
              <div class="text-body-2 font-weight-bold">
                Rp {{ formatNumber(item.grand_total || 0) }}
              </div>

              <v-chip
                size="x-small"
                :color="getFlowStatus(item).color"
                variant="tonal"
                :prepend-icon="getFlowStatus(item).icon"
                class="mt-1"
              >
                {{ getFlowStatus(item).label }}
              </v-chip>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end align-center ga-2 flex-wrap py-2">
              <v-btn
                v-if="getPrimaryAction(item)"
                size="small"
                :color="getPrimaryAction(item).color"
                variant="tonal"
                :prepend-icon="getPrimaryAction(item).icon"
                @click="handlePrimaryAction(item)"
              >
                {{ getPrimaryAction(item).label }}
              </v-btn>

              <v-btn
                v-if="canCancel(item)"
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-close-circle-outline"
                @click="confirmCancel(item)"
              >
                Cancel
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-avatar color="grey-lighten-3" size="56" class="mb-3">
                <v-icon
                  icon="mdi-clipboard-text-off-outline"
                  size="30"
                  color="grey"
                />
              </v-avatar>

              <div class="text-subtitle-2 font-weight-bold mb-1">
                Belum ada data registrasi
              </div>

              <div class="text-body-2 text-medium-emphasis mb-4">
                Data akan muncul setelah FO menyimpan registrasi layanan.
              </div>

              <v-btn
                color="success"
                variant="flat"
                prepend-icon="mdi-plus"
                @click="goToAdd"
              >
                Buat Registrasi
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider />

      <!-- FOOTER -->
      <v-card-actions class="pa-4">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 w-100"
        >
          <div class="text-body-2 text-medium-emphasis">
            Total data:
            <strong class="text-high-emphasis">
              {{ pagination.total }}
            </strong>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-select
              v-model="pagination.perPage"
              :items="[10, 15, 25, 50, 100]"
              variant="outlined"
              density="compact"
              hide-details
              width="96"
              @update:modelValue="onPerPageChange"
            />

            <v-pagination
              v-model="pagination.page"
              :length="pagination.lastPage"
              density="compact"
              total-visible="5"
              @update:modelValue="fetchData"
            />
          </div>
        </div>
      </v-card-actions>
    </v-card>

    <!-- CANCEL DIALOG -->
    <v-dialog v-model="cancelDialog.show" max-width="460">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold pa-4">
          Batalkan Registrasi?
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <div class="text-body-2 mb-3">
            Data registrasi
            <strong>
              {{
                cancelDialog.item?.kode_registrasi ||
                `REG-${cancelDialog.item?.id}`
              }}
            </strong>
            akan dibatalkan. Tindakan ini tidak menghapus data, hanya mengubah
            status menjadi batal.
          </div>

          <v-alert type="warning" variant="tonal" density="compact">
            Pastikan registrasi memang tidak dilanjutkan sebelum membatalkan.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
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

      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import registrasiLayananService from "@/services/registrasi/registrasiLayananService";

export default {
  name: "AllRegistrasiLayanan",

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

      loading: false,
      errorMessage: "",

      filters: {
        search: "",
        tanggal: this.getToday(),
        status: null,
      },

      rows: [],

      pagination: {
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      },

      headers: [
        {
          title: "Registrasi & Pasien",
          key: "registrasi_pasien",
          sortable: false,
          minWidth: 520,
        },
        {
          title: "Layanan",
          key: "layanan",
          sortable: false,
          minWidth: 230,
        },
        {
          title: "Total / Status",
          key: "total_status",
          sortable: false,
          align: "end",
          width: 220,
        },
        {
          title: "Aksi",
          key: "actions",
          sortable: false,
          align: "end",
          width: 260,
        },
      ],

      statusOptions: [
        { label: "Aktif", value: 1 },
        { label: "Selesai", value: 2 },
        { label: "Batal", value: 9 },
      ],

      cancelDialog: {
        show: false,
        loading: false,
        item: null,
      },

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();

      return `${year}-${month}-${day}`;
    },

    async fetchData() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const params = {
          page: this.pagination.page,
          per_page: this.pagination.perPage,
          search: this.filters.search || undefined,
          tanggal: this.filters.tanggal || undefined,
          status: this.filters.status ?? undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await registrasiLayananService.getAll(params);
        const payload = response?.data || response;

        this.rows = this.extractRows(payload);
        this.applyPagination(payload);
      } catch (error) {
        this.rows = [];
        this.pagination.total = 0;
        this.pagination.lastPage = 1;
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },

    extractRows(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.rows)) return payload.rows;

      return [];
    },

    applyPagination(payload) {
      this.pagination.total = Number(
        payload?.total || payload?.meta?.total || this.rows.length || 0,
      );

      this.pagination.lastPage = Number(
        payload?.last_page ||
          payload?.meta?.last_page ||
          Math.ceil(this.pagination.total / this.pagination.perPage) ||
          1,
      );

      this.pagination.page = Number(
        payload?.current_page ||
          payload?.meta?.current_page ||
          this.pagination.page ||
          1,
      );
    },

    onPerPageChange() {
      this.pagination.page = 1;
      this.fetchData();
    },

    onClearSearch() {
      this.filters.search = "";
      this.pagination.page = 1;
      this.fetchData();
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
        "Gagal mengambil data registrasi"
      );
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

    getPasienMeta(item) {
      const pasien = item?.pasien || {};

      return (
        [pasien.no_rm || item.no_rm, pasien.no_hp || item.no_hp]
          .filter(Boolean)
          .join(" • ") || "-"
      );
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

    getChannelLabel(value) {
      const numberValue = Number(value || 0);
      const stringValue = String(value || "").toLowerCase();

      if (numberValue === 1 || stringValue === "offline") {
        return "Konsultasi Offline";
      }

      if (numberValue === 2 || stringValue === "online") {
        return "Konsultasi Online";
      }

      return "Konsultasi";
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

    getFlowStatus(item) {
      const status = Number(item?.status || 0);

      if (status === 9) {
        return {
          label: "Batal",
          color: "error",
          icon: "mdi-close-circle-outline",
        };
      }

      if (status === 2) {
        return {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-circle-outline",
        };
      }

      if (this.isDoctorFlow(item)) {
        return {
          label: "Menunggu Dokter",
          color: "primary",
          icon: "mdi-stethoscope",
        };
      }

      if (this.isNurseFlow(item)) {
        return {
          label: "Menunggu Perawat",
          color: "success",
          icon: "mdi-account-heart-outline",
        };
      }

      if (this.isPaymentFlow(item)) {
        return {
          label: "Menunggu Pembayaran",
          color: "warning",
          icon: "mdi-cash-clock",
        };
      }

      if (Number(item?.current_task || 0) > 0) {
        return {
          label: "Dalam Proses",
          color: "info",
          icon: "mdi-progress-clock",
        };
      }

      if (status === 1) {
        return {
          label: "Aktif",
          color: "primary",
          icon: "mdi-check-circle-outline",
        };
      }

      return {
        label: this.getStatusLabel(status),
        color: "grey",
        icon: "mdi-information-outline",
      };
    },

    getPrimaryAction(item) {
      const status = Number(item?.status || 0);

      if (status === 9 || status === 2 || status === 0) {
        return {
          label: "Detail",
          icon: "mdi-eye-outline",
          color: "grey-darken-1",
          type: "detail",
        };
      }

      if (status !== 1) {
        return {
          label: "Detail",
          icon: "mdi-eye-outline",
          color: "grey-darken-1",
          type: "detail",
        };
      }

      if (this.isDoctorFlow(item)) {
        return {
          label: "Ke Dokter",
          icon: "mdi-stethoscope",
          color: "primary",
          type: "doctor",
        };
      }

      if (this.isNurseFlow(item)) {
        return {
          label: "Ke Perawat",
          icon: "mdi-account-heart-outline",
          color: "success",
          type: "nurse",
        };
      }

      if (this.isPaymentFlow(item)) {
        return {
          label: "Ke Pembayaran",
          icon: "mdi-cash-register",
          color: "warning",
          type: "payment",
        };
      }

      if (Number(item?.current_task || 0) > 0) {
        return {
          label: "Lanjutkan",
          icon: "mdi-play-circle-outline",
          color: "primary",
          type: "task",
        };
      }

      return {
        label: "Detail",
        icon: "mdi-eye-outline",
        color: "grey-darken-1",
        type: "detail",
      };
    },

    handlePrimaryAction(item) {
      const action = this.getPrimaryAction(item);

      if (!action) return;

      if (action.type === "doctor") {
        this.goToDoctorQueue(item);
        return;
      }

      if (action.type === "payment") {
        this.goToPayment(item);
        return;
      }

      if (action.type === "nurse") {
        this.goToNurseQueue(item);
        return;
      }

      if (action.type === "task") {
        this.goToProcess(item);
        return;
      }

      this.goToDetail(item);
    },

    isTrue(value) {
      return value === true || value === 1 || value === "1";
    },

    hasConsultation(item) {
      const value = item?.channel_konsultasi;
      const numberValue = Number(value || 0);
      const stringValue = String(value || "").toLowerCase();

      return (
        numberValue > 0 || stringValue === "offline" || stringValue === "online"
      );
    },

    hasTreatment(item) {
      return this.isTrue(item?.is_treatment);
    },

    hasSales(item) {
      return this.isTrue(item?.is_penjualan);
    },

    isPaymentPaid(item) {
      const candidates = [
        item?.status_pembayaran,
        item?.pembayaran_status,
        item?.payment_status,
        item?.invoice_status,
        item?.pembayaran?.status,
        item?.invoice?.status,
      ];

      return candidates.some((value) => {
        const stringValue = String(value ?? "").toLowerCase();
        const numberValue = Number(value);

        return (
          numberValue === 2 ||
          numberValue === 3 ||
          stringValue === "paid" ||
          stringValue === "lunas" ||
          stringValue === "selesai" ||
          stringValue === "success" ||
          stringValue === "settled"
        );
      });
    },

    isCompletedStatus(value) {
      if (value === null || value === undefined || value === "") return false;

      const stringValue = String(value).toLowerCase();
      const numberValue = Number(value);

      return (
        numberValue >= 2 ||
        [
          "selesai",
          "done",
          "complete",
          "completed",
          "finish",
          "finished",
        ].includes(stringValue)
      );
    },

    isDoctorDone(item) {
      const booleanFlags = [
        item?.is_dokter_selesai,
        item?.is_dokter_done,
        item?.dokter_selesai,
        item?.doctor_done,
        item?.has_dokter_done,
      ];

      if (booleanFlags.some((value) => this.isTrue(value))) {
        return true;
      }

      const timestamps = [
        item?.waktu_selesai_dokter,
        item?.tanggal_selesai_dokter,
        item?.dokter_finished_at,
        item?.doctor_finished_at,
      ];

      if (timestamps.some(Boolean)) {
        return true;
      }

      const statuses = [
        item?.status_antrian_dokter,
        item?.antrian_dokter_status,
        item?.antrian_dokter?.status,
        item?.antrianDokter?.status,
        item?.konsultasi?.status,
        item?.perawatan?.status_dokter,
      ];

      return statuses.some((value) => this.isCompletedStatus(value));
    },

    isNurseDone(item) {
      const booleanFlags = [
        item?.is_perawat_selesai,
        item?.is_perawat_done,
        item?.perawat_selesai,
        item?.nurse_done,
        item?.has_perawat_done,
      ];

      if (booleanFlags.some((value) => this.isTrue(value))) {
        return true;
      }

      const timestamps = [
        item?.waktu_selesai_perawat,
        item?.tanggal_selesai_perawat,
        item?.perawat_finished_at,
        item?.nurse_finished_at,
      ];

      if (timestamps.some(Boolean)) {
        return true;
      }

      const statuses = [
        item?.status_antrian_perawat,
        item?.antrian_perawat_status,
        item?.antrian_perawat?.status,
        item?.antrianPerawat?.status,
        item?.perawatan?.status_perawat,
      ];

      return statuses.some((value) => this.isCompletedStatus(value));
    },

    isDoctorFlow(item) {
      const needDoctor = this.hasConsultation(item) || this.hasTreatment(item);

      return needDoctor && !this.isDoctorDone(item);
    },

    isPaymentFlow(item) {
      const needPayment = this.hasSales(item) || this.hasTreatment(item);

      if (!needPayment) {
        return false;
      }

      if (this.isPaymentPaid(item)) {
        return false;
      }

      if (this.hasTreatment(item) && !this.isDoctorDone(item)) {
        return false;
      }

      return true;
    },

    isNurseFlow(item) {
      return (
        this.hasTreatment(item) &&
        this.isDoctorDone(item) &&
        this.isPaymentPaid(item) &&
        !this.isNurseDone(item)
      );
    },

    isSalesOnly(item) {
      return (
        this.hasSales(item) &&
        !this.hasConsultation(item) &&
        !this.hasTreatment(item)
      );
    },

    canCancel(item) {
      return [0, 1].includes(Number(item?.status || 0));
    },

    goToAdd() {
      this.$router.push("/resepsionis/registrasi-layanan/add");
    },

    goToDetail(item) {
      this.$router.push(`/resepsionis/registrasi-layanan/${item.id}`);
    },

    getRegistrasiId(item) {
      return item?.registrasi_id || item?.registrasi?.id || item?.id;
    },

    getPembayaranId(item) {
      return (
        item?.pembayaran_id ||
        item?.payment_id ||
        item?.invoice_id ||
        item?.pembayaran?.id ||
        item?.invoice?.id ||
        this.getRegistrasiId(item)
      );
    },

    goToDoctorQueue(item) {
      const id = this.getRegistrasiId(item);

      if (!id) {
        this.showSnackbar("ID registrasi tidak ditemukan", "error");
        return;
      }

      this.$router.push(
        `/pelayanan-medis/antrian-dokter/${id}/proses-antrian-dokter`,
      );
    },

    goToPayment(item) {
      const id = this.getPembayaranId(item);

      if (!id) {
        this.showSnackbar("ID pembayaran tidak ditemukan", "error");
        return;
      }

      this.$router.push(`/kasir/daftar-pembayaran/${id}/proses-pembayaran`);
    },

    goToNurseQueue() {
      this.$router.push("/pelayanan-medis/antrian-perawat");
    },

    goToProcess(item) {
      if (this.isDoctorFlow(item)) {
        this.goToDoctorQueue(item);
        return;
      }

      if (this.isPaymentFlow(item)) {
        this.goToPayment(item);
        return;
      }

      if (this.isNurseFlow(item)) {
        this.goToNurseQueue(item);
        return;
      }

      this.goToDetail(item);
    },

    confirmCancel(item) {
      this.cancelDialog.item = item;
      this.cancelDialog.show = true;
    },

    async cancelRegistrasi() {
      if (!this.cancelDialog.item?.id) return;

      this.cancelDialog.loading = true;

      try {
        const response = await registrasiLayananService.cancel(
          this.cancelDialog.item.id,
        );

        this.showSnackbar(
          response?.message || "Registrasi berhasil dibatalkan",
          "success",
        );

        this.cancelDialog.show = false;
        this.cancelDialog.item = null;

        this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.cancelDialog.loading = false;
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar.show = true;
      this.snackbar.text = text;
      this.snackbar.color = color;
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    formatTime(value) {
      if (!value) return "-";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "-";
      }

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

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },
};
</script>

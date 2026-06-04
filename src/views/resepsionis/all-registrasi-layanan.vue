<template>
  <div>
    <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4">
      <div>
        <div class="text-h6 font-weight-bold">Registrasi Layanan</div>
        <div class="text-body-2 text-medium-emphasis">
          Monitoring data registrasi layanan pasien berdasarkan master dan field
          registrasi terbaru.
        </div>

        <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 mt-2">
          <template #divider>
            <v-icon size="16">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </div>

      <v-btn
        color="success"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="goToAdd"
      >
        Entry Data
      </v-btn>
    </div>

    <v-card variant="outlined" class="mb-4">
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              placeholder="Cari registrasi / pasien / dokter"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="applyFilters"
              @click:clear="applyFilters"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="filters.tanggal"
              label="Tanggal"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.layanan"
              :items="layananItems"
              item-title="title"
              item-value="value"
              placeholder="Layanan"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.current_task"
              :items="taskItems"
              item-title="title"
              item-value="value"
              placeholder="Task"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.status"
              :items="statusItems"
              item-title="title"
              item-value="value"
              placeholder="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="1">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              class="w-100"
              :loading="loading"
              @click="fetchData"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      class="mb-4"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card variant="outlined">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          :items-per-page="pagination.perPage"
          item-value="id"
          density="compact"
          hide-default-footer
          class="border"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="40" color="grey"
                >mdi-clipboard-text-search-outline</v-icon
              >
              <div class="text-subtitle-2 mt-3">
                Data registrasi belum tersedia
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Ubah filter atau tambahkan registrasi layanan baru.
              </div>
            </div>
          </template>

          <template #item.registrasi_pasien="{ item }">
            <div class="d-flex align-start ga-3 py-2">
              <div class="min-w-0">
                <div class="text-primary font-weight-bold text-body-2 mb-1">
                  {{ item.kode_registrasi || `REG-${item.id}` }}
                </div>

                <div
                  class="text-body-2 text-medium-emphasis d-flex align-center ga-1 mb-1"
                >
                  <v-icon size="14">mdi-calendar-month-outline</v-icon>
                  <span>{{ formatDate(getDataDate(item)) }}</span>
                </div>

                <div
                  class="text-body-2 text-medium-emphasis d-flex align-center ga-1"
                >
                  <v-icon size="14">mdi-clock-outline</v-icon>
                  <span>{{ formatTime(getDataTime(item)) }}</span>
                </div>
              </div>

              <v-divider vertical />

              <div class="min-w-0">
                <div class="font-weight-bold text-body-2 mb-1">
                  {{ getPasienName(item) }}
                </div>

                <div class="text-body-2 text-medium-emphasis mb-2">
                  {{ getPasienMeta(item) }}
                </div>

                <div class="d-flex flex-wrap ga-1">
                  <v-chip size="x-small" color="primary" variant="tonal">
                    Dokter: {{ getDokterName(item) }}
                  </v-chip>

                  <v-chip size="x-small" color="success" variant="tonal">
                    Perawat: {{ getPerawatName(item) }}
                  </v-chip>
                </div>
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-if="hasTreatment(item)"
                size="small"
                color="success"
                variant="tonal"
                prepend-icon="mdi-face-woman-shimmer-outline"
              >
                Treatment
              </v-chip>

              <v-chip
                v-if="hasConsultation(item)"
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-stethoscope"
              >
                {{ getConsultationLabel(item) }}
              </v-chip>

              <v-chip
                v-if="hasSales(item)"
                size="small"
                color="info"
                variant="tonal"
                prepend-icon="mdi-cart-outline"
              >
                Penjualan
              </v-chip>

              <v-chip
                v-if="isPembelianOnline(item)"
                size="small"
                color="deep-purple"
                variant="tonal"
                prepend-icon="mdi-web"
              >
                Pembelian Online
              </v-chip>

              <span
                v-if="
                  !hasTreatment(item) &&
                  !hasConsultation(item) &&
                  !hasSales(item) &&
                  !isPembelianOnline(item)
                "
                class="text-body-2 text-medium-emphasis"
              >
                -
              </span>
            </div>
          </template>

          <template #item.total_status="{ item }">
            <div class="py-2">
              <div class="font-weight-bold text-body-2">
                Rp {{ formatNumber(getTotalAmount(item)) }}
              </div>

              <div class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  size="x-small"
                  :color="getStatusMeta(item).color"
                  variant="tonal"
                  :prepend-icon="getStatusMeta(item).icon"
                >
                  {{ getStatusMeta(item).label }}
                </v-chip>

                <v-chip
                  size="x-small"
                  :color="getTaskMeta(item).color"
                  variant="tonal"
                  :prepend-icon="getTaskMeta(item).icon"
                >
                  {{ getTaskMeta(item).label }}
                </v-chip>

                <v-chip
                  v-if="isOnlineConsultation(item)"
                  size="x-small"
                  :color="
                    hasBuktiChatKonsultasiOnline(item) ? 'success' : 'warning'
                  "
                  variant="tonal"
                  :prepend-icon="
                    hasBuktiChatKonsultasiOnline(item)
                      ? 'mdi-check-circle-outline'
                      : 'mdi-alert-circle-outline'
                  "
                >
                  {{
                    hasBuktiChatKonsultasiOnline(item)
                      ? "Bukti chat ada"
                      : "Belum upload bukti chat"
                  }}
                </v-chip>
              </div>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end flex-wrap ga-2 py-2">
              <v-btn
                v-if="getPrimaryAction(item)"
                :color="getActionButtonColor(getPrimaryAction(item))"
                variant="flat"
                size="small"
                :prepend-icon="getPrimaryAction(item).icon"
                @click="handlePrimaryAction(item)"
              >
                {{ getPrimaryAction(item).label }}
              </v-btn>
              <v-btn
                v-if="canViewBuktiChatKonsultasiOnline(item)"
                color="success"
                variant="tonal"
                size="small"
                prepend-icon="mdi-eye-outline"
                @click="viewBuktiChatKonsultasiOnline(item)"
              >
                Lihat Bukti
              </v-btn>

              <v-btn
                v-if="canUploadBuktiChatKonsultasiOnline(item)"
                color="warning"
                variant="tonal"
                size="small"
                prepend-icon="mdi-upload"
                @click="openBuktiChatDialog(item)"
              >
                Upload Bukti
              </v-btn>
              <v-btn
                v-if="canCancel(item)"
                color="error"
                variant="flat"
                size="small"
                prepend-icon="mdi-close-circle-outline"
                @click="openCancelDialog(item)"
              >
                Batal
              </v-btn>

              <span
                v-if="!getPrimaryAction(item) && !canCancel(item)"
                class="text-body-2 text-medium-emphasis"
              >
                Tidak ada aksi
              </span>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider />

      <v-card-text
        class="d-flex align-center justify-space-between flex-wrap ga-3"
      >
        <div class="text-body-2 text-medium-emphasis">
          Total data:
          <span class="font-weight-bold">{{ pagination.total }}</span>
        </div>

        <div class="d-flex align-center flex-wrap ga-3">
          <v-select
            v-model="pagination.perPage"
            :items="[10, 15, 25, 50]"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="onPerPageChange"
          />

          <v-pagination
            v-model="pagination.page"
            :length="pagination.lastPage || 1"
            density="compact"
            total-visible="5"
            @update:model-value="fetchData"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="cancelDialog.show" max-width="460">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Batalkan Registrasi
        </v-card-title>

        <v-card-text>
          <div class="text-body-2 mb-3">
            Yakin ingin membatalkan registrasi berikut?
          </div>

          <v-alert type="warning" variant="tonal" density="compact">
            {{ cancelDialog.item?.kode_registrasi || "-" }} -
            {{ getPasienName(cancelDialog.item || {}) }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn variant="text" @click="cancelDialog.show = false">
            Tutup
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="cancelDialog.loading"
            @click="confirmCancel"
          >
            Batalkan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="buktiChatDialog.show" max-width="520">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Upload Bukti Chat Konsultasi Online
        </v-card-title>

        <v-card-text>
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            {{ buktiChatDialog.item?.kode_registrasi || "-" }} -
            {{ getPasienName(buktiChatDialog.item || {}) }}
          </v-alert>

          <v-file-input
            v-model="buktiChatDialog.file"
            label="Pilih file bukti chat"
            variant="outlined"
            density="compact"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            show-size
            clearable
            prepend-icon="mdi-paperclip"
            :error-messages="buktiChatDialog.error"
          />

          <div class="text-caption text-medium-emphasis mt-2">
            Format yang didukung: JPG, JPEG, PNG, WEBP, atau PDF. Maksimal 5 MB.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeBuktiChatDialog"> Tutup </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="buktiChatDialog.loading"
            :disabled="!buktiChatDialog.file"
            @click="submitBuktiChatKonsultasiOnline"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import registrasiLayananService from "@/services/registrasi/registrasiLayananService";

export default {
  name: "AllRegistrasiLayanan",

  data() {
    return {
      loading: false,
      errorMessage: "",

      breadcrumbs: [
        {
          title: "Resepsionis",
          disabled: true,
        },
        {
          title: "Registrasi Layanan",
          disabled: true,
        },
      ],

      filters: {
        search: "",
        tanggal: this.getToday(),
        layanan: null,
        current_task: null,
        status: null,
      },

      headers: [
        {
          title: "Registrasi & Pasien",
          key: "registrasi_pasien",
          sortable: false,
          minWidth: 440,
        },
        {
          title: "Layanan",
          key: "layanan",
          sortable: false,
          minWidth: 260,
        },
        {
          title: "Total / Status",
          key: "total_status",
          sortable: false,
          minWidth: 220,
        },
        {
          title: "Aksi",
          key: "actions",
          sortable: false,
          align: "end",
          minWidth: 240,
        },
      ],

      layananItems: [
        {
          title: "Konsultasi",
          value: "konsultasi",
        },
        {
          title: "Treatment",
          value: "treatment",
        },
        {
          title: "Penjualan",
          value: "penjualan",
        },
        {
          title: "Pembelian Online",
          value: "pembelian_online",
        },
      ],

      taskItems: [
        {
          title: "Konsultasi / Dokter",
          value: 1,
        },
        {
          title: "Treatment",
          value: 2,
        },
        {
          title: "Perawat",
          value: 3,
        },
        {
          title: "Pembayaran",
          value: 4,
        },
        {
          title: "Selesai",
          value: 5,
        },
      ],

      statusItems: [
        {
          title: "Aktif",
          value: "aktif",
        },
        {
          title: "Batal",
          value: "batal",
        },
        {
          title: "Selesai",
          value: "selesai",
        },
      ],

      rows: [],

      pagination: {
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
      },

      cancelDialog: {
        show: false,
        loading: false,
        item: null,
      },

      buktiChatDialog: {
        show: false,
        loading: false,
        item: null,
        file: null,
        error: "",
      },

      snackbar: {
        show: false,
        color: "success",
        message: "",
      },

      accessRules: {
        proses_dokter: {
          label: "Proses Dokter",
          roles: [
            "superadmin",
            "super_admin",
            "administrator",
            "admin",
            "dokter",
            "doctor",
            "it",
          ],
        },
        pembayaran: {
          label: "Pembayaran",
          roles: [
            "superadmin",
            "super_admin",
            "administrator",
            "admin",
            "kasir",
            "cashier",
            "keuangan",
            "finance",
          ],
        },
        proses_treatment: {
          label: "Proses Treatment",
          roles: [
            "superadmin",
            "super_admin",
            "administrator",
            "admin",
            "perawat",
            "beautician",
          ],
        },
        proses_perawat: {
          label: "Proses Perawat",
          roles: [
            "superadmin",
            "super_admin",
            "administrator",
            "admin",
            "perawat",
            "beautician",
          ],
        },
      },
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },

    currentRole() {
      return this.resolveCurrentRole();
    },

    currentRoleTokens() {
      return this.normalizeRoleTokens(this.currentRole);
    },

    currentRoleText() {
      return this.getRoleLabel(this.currentRole) || "Tidak terbaca";
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    getToday() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    goToAdd() {
      this.$router.push("/resepsionis/registrasi-layanan/add");
    },

    applyFilters() {
      this.pagination.page = 1;
      this.fetchData();
    },

    onPerPageChange() {
      this.pagination.page = 1;
      this.fetchData();
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
          layanan: this.filters.layanan || undefined,
          current_task: this.filters.current_task || undefined,
          status: this.filters.status || undefined,
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
        this.errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal memuat data registrasi layanan.";
      } finally {
        this.loading = false;
      }
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

    applyPagination(payload) {
      const meta = payload?.meta || payload?.pagination || payload || {};

      const total = Number(
        meta.total ||
          payload?.total ||
          payload?.data?.total ||
          this.rows.length ||
          0,
      );

      const perPage = Number(
        meta.per_page ||
          meta.perPage ||
          payload?.per_page ||
          payload?.data?.per_page ||
          this.pagination.perPage ||
          15,
      );

      const currentPage = Number(
        meta.current_page ||
          meta.currentPage ||
          payload?.current_page ||
          payload?.data?.current_page ||
          this.pagination.page ||
          1,
      );

      const lastPage = Number(
        meta.last_page ||
          meta.lastPage ||
          payload?.last_page ||
          payload?.data?.last_page ||
          Math.ceil(total / perPage) ||
          1,
      );

      this.pagination.total = total;
      this.pagination.perPage = perPage;
      this.pagination.page = currentPage;
      this.pagination.lastPage = lastPage || 1;
    },

    getDataDate(item) {
      return (
        item?.tanggal ||
        item?.tanggal_registrasi ||
        item?.tanggal_kunjungan ||
        item?.created_at ||
        item?.createdAt ||
        null
      );
    },

    getDataTime(item) {
      return (
        item?.jam ||
        item?.jam_registrasi ||
        item?.jam_kunjungan ||
        item?.created_at ||
        item?.createdAt ||
        null
      );
    },

    hasConsultation(item) {
      return (
        Number(item?.ada_konsultasi || 0) === 1 ||
        Number(item?.layanan?.ada_konsultasi || 0) === 1 ||
        Boolean(item?.konsultasi) ||
        Boolean(item?.konsultasi_id)
      );
    },

    hasTreatment(item) {
      return (
        Number(item?.ada_treatment || 0) === 1 ||
        Number(item?.layanan?.ada_treatment || 0) === 1 ||
        Boolean(item?.perawatan) ||
        Boolean(item?.perawatan_id) ||
        Boolean(item?.treatment_id)
      );
    },

    hasSales(item) {
      return (
        Number(item?.ada_penjualan || 0) === 1 ||
        Number(item?.layanan?.ada_penjualan || 0) === 1 ||
        Boolean(item?.penjualan) ||
        Boolean(item?.penjualan_id)
      );
    },

    isPembelianOnline(item) {
      return (
        Number(item?.is_pembelian_online || 0) === 1 ||
        Number(item?.layanan?.is_pembelian_online || 0) === 1 ||
        item?.channel_penjualan === "online" ||
        item?.tipe_penjualan === "online"
      );
    },

    getConsultationSourceCode(item) {
      return (
        item?.konsultasi_source_code ||
        item?.layanan?.konsultasi_source_code ||
        item?.konsultasi?.source_code ||
        item?.source_konsultasi ||
        ""
      );
    },

    getConsultationSourceName(item) {
      return (
        item?.jenis_konsultasi_label ||
        item?.layanan?.jenis_konsultasi_label ||
        item?.konsultasi_source_name ||
        item?.layanan?.konsultasi_source_name ||
        item?.konsultasi?.source_name ||
        ""
      );
    },

    getConsultationLabel(item) {
      const sourceName = this.getConsultationSourceName(item);

      if (sourceName) {
        return sourceName;
      }

      const sourceCode = String(
        this.getConsultationSourceCode(item) || "",
      ).toUpperCase();

      if (sourceCode.includes("ONLINE")) return "Konsultasi Online";
      if (sourceCode.includes("SPPG")) return "Konsultasi SPPG";
      if (sourceCode.includes("SPKK")) return "Konsultasi SPKK";
      if (sourceCode.includes("OFFLINE") || sourceCode.includes("DOKTER")) {
        return "Konsultasi Dokter";
      }

      const channel = String(
        item?.channel_konsultasi ?? item?.layanan?.channel_konsultasi ?? "",
      ).toLowerCase();

      if (channel === "2" || channel === "online") return "Konsultasi Online";
      if (channel === "1" || channel === "offline") return "Konsultasi Dokter";

      return "Tanpa Konsultasi";
    },

    getPasienName(item) {
      return (
        item?.pasien?.nama ||
        item?.pasien_nama ||
        item?.nama_pasien ||
        item?.nama_pembeli ||
        "-"
      );
    },

    getPasienMeta(item) {
      const kode =
        item?.pasien?.kode_pasien ||
        item?.pasien?.no_rm ||
        item?.pasien_kode ||
        item?.kode_pasien ||
        item?.no_rm ||
        "-";

      const phone =
        item?.pasien?.no_hp ||
        item?.pasien?.no_wa ||
        item?.pasien_no_hp ||
        item?.no_hp ||
        item?.no_wa ||
        "-";

      return `${kode} • ${phone}`;
    },

    getDokterName(item) {
      return (
        item?.dokter?.nama ||
        item?.dokter_nama ||
        item?.nama_dokter ||
        item?.dokter_name ||
        "-"
      );
    },

    getPerawatName(item) {
      return (
        item?.perawat?.nama ||
        item?.perawat_nama ||
        item?.nama_perawat ||
        item?.perawat_name ||
        "-"
      );
    },

    getTotalAmount(item) {
      return (
        item?.total_harga ||
        item?.total ||
        item?.grand_total ||
        item?.total_bayar ||
        item?.nominal_total ||
        0
      );
    },

    getConsultationAmount(item) {
      const value =
        item?.total_konsultasi ??
        item?.layanan?.total_konsultasi ??
        item?.biaya_konsultasi ??
        item?.konsultasi_total ??
        item?.konsultasi?.total_harga ??
        0;

      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    },

    getStatusValue(item) {
      const raw =
        item?.status_registrasi || item?.status || item?.status_layanan;

      if (raw === null || raw === undefined || raw === "") {
        return "aktif";
      }

      return String(raw).toLowerCase();
    },

    getStatusMeta(item) {
      const status = this.getStatusValue(item);

      if (["batal", "cancel", "cancelled", "dibatalkan"].includes(status)) {
        return {
          label: "Batal",
          color: "error",
          icon: "mdi-close-circle-outline",
        };
      }

      if (
        ["selesai", "done", "completed", "finish", "finished"].includes(status)
      ) {
        return {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-circle-outline",
        };
      }

      return {
        label: "Aktif",
        color: "primary",
        icon: "mdi-clock-outline",
      };
    },

    getTaskValue(item) {
      return Number(
        item?.current_task ||
          item?.task ||
          item?.task_status ||
          item?.currentTask ||
          0,
      );
    },

    getTaskMeta(item) {
      const task = this.getTaskValue(item);

      if (task === 1) {
        return {
          label: "Konsultasi",
          color: "primary",
          icon: "mdi-stethoscope",
        };
      }

      if (task === 2) {
        return {
          label: "Treatment",
          color: "success",
          icon: "mdi-face-woman-shimmer-outline",
        };
      }

      if (task === 3) {
        return {
          label: "Perawat",
          color: "teal",
          icon: "mdi-account-heart-outline",
        };
      }

      if (task === 4) {
        return {
          label: "Pembayaran",
          color: "info",
          icon: "mdi-cash-register",
        };
      }

      if (task === 5) {
        return {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-circle-outline",
        };
      }

      return {
        label: "Belum ada task",
        color: "grey",
        icon: "mdi-progress-question",
      };
    },

    getPrimaryAction(item) {
      if (!this.isActiveItem(item)) {
        return null;
      }

      const task = this.getTaskValue(item);

      if (task === 1) {
        return {
          key: "proses_dokter",
          label: "Proses Dokter",
          color: "primary",
          icon: "mdi-stethoscope",
          route: (id) =>
            `/pelayanan-medis/antrian-dokter/${id}/proses-antrian-dokter`,
        };
      }

      if (task === 2) {
        return {
          key: "proses_treatment",
          label: "Proses Treatment",
          color: "success",
          icon: "mdi-face-woman-shimmer-outline",
          route: null,
        };
      }

      if (task === 3) {
        return {
          key: "proses_perawat",
          label: "Proses Perawat",
          color: "teal",
          icon: "mdi-account-heart-outline",
          route: null,
        };
      }

      if (task === 4) {
        return {
          key: "pembayaran",
          label: "Pembayaran",
          color: "info",
          icon: "mdi-cash-register",
          route: (id) => `/kasir/daftar-pembayaran/${id}/proses-pembayaran`,
        };
      }

      return null;
    },

    handlePrimaryAction(item) {
      const action = this.getPrimaryAction(item);

      if (!action) {
        this.showSnackbar(
          "Tidak ada aksi yang tersedia untuk data ini.",
          "warning",
        );
        return;
      }

      if (!this.canAccessAction(action.key)) {
        this.showSnackbar(this.getAccessDeniedMessage(action.key), "warning");
        return;
      }

      if (!action.route) {
        this.showSnackbar(
          `Aksi ${action.label} belum memiliki halaman proses langsung dari daftar registrasi.`,
          "warning",
        );
        return;
      }

      const routeId = this.resolveActionRouteId(item, action.key);

      if (!routeId) {
        this.showSnackbar(
          `ID tujuan untuk ${action.label} tidak ditemukan pada data registrasi.`,
          "error",
        );
        return;
      }

      this.$router.push(action.route(routeId));
    },

    resolveActionRouteId(item, actionKey) {
      if (actionKey === "proses_dokter") {
        return (
          item?.antrian_dokter_id ||
          item?.antrianDokter?.id ||
          item?.queue_dokter_id ||
          item?.dokter_queue_id ||
          item?.id
        );
      }

      if (actionKey === "pembayaran") {
        return (
          item?.pembayaran_id || item?.payment_id || item?.kasir_id || item?.id
        );
      }

      return item?.id || null;
    },

    getActionButtonColor(action) {
      if (!action?.key) {
        return action?.color || "primary";
      }

      return this.canAccessAction(action.key) ? action.color : "warning";
    },

    canCancel(item) {
      return this.isActiveItem(item);
    },

    isActiveItem(item) {
      const status = this.getStatusValue(item);

      return ![
        "batal",
        "cancel",
        "cancelled",
        "dibatalkan",
        "selesai",
        "done",
        "completed",
        "finish",
        "finished",
      ].includes(status);
    },

    openCancelDialog(item) {
      this.cancelDialog.item = item;
      this.cancelDialog.show = true;
    },

    async confirmCancel() {
      if (!this.cancelDialog.item?.id) {
        this.showSnackbar("ID registrasi tidak ditemukan.", "error");
        return;
      }

      this.cancelDialog.loading = true;

      try {
        await registrasiLayananService.cancel(this.cancelDialog.item.id);

        this.cancelDialog.show = false;
        this.cancelDialog.item = null;

        this.showSnackbar("Registrasi berhasil dibatalkan.", "success");
        this.fetchData();
      } catch (error) {
        this.showSnackbar(
          error?.response?.data?.message ||
            error?.message ||
            "Gagal membatalkan registrasi.",
          "error",
        );
      } finally {
        this.cancelDialog.loading = false;
      }
    },

    canAccessAction(actionKey) {
      const rule = this.accessRules[actionKey];

      if (!rule || !Array.isArray(rule.roles) || rule.roles.length === 0) {
        return true;
      }

      const activeTokens = new Set(this.currentRoleTokens);
      const allowedTokens = rule.roles.flatMap((role) =>
        this.normalizeRoleTokens(role),
      );

      return allowedTokens.some((token) => activeTokens.has(token));
    },

    getAccessDeniedMessage(actionKey) {
      const rule = this.accessRules[actionKey];

      if (!rule) {
        return "Akses ditolak untuk aksi ini.";
      }

      return `Akses ditolak. ${rule.label} hanya untuk role: ${rule.roles.join(
        ", ",
      )}. Role aktif Anda: ${this.currentRoleText}.`;
    },

    resolveCurrentRole() {
      const selectedRole = this.safeJsonParse(
        localStorage.getItem("selected_role"),
      );

      if (selectedRole) {
        return selectedRole;
      }

      const directRole =
        localStorage.getItem("role") ||
        localStorage.getItem("role_name") ||
        localStorage.getItem("user_role") ||
        localStorage.getItem("selected_role_name");

      if (directRole) {
        return this.safeJsonParse(directRole) || directRole;
      }

      const user =
        this.safeJsonParse(localStorage.getItem("user")) ||
        this.safeJsonParse(localStorage.getItem("auth_user")) ||
        this.safeJsonParse(localStorage.getItem("user_data")) ||
        this.safeJsonParse(localStorage.getItem("current_user"));

      return (
        user?.selected_role ||
        user?.selectedRole ||
        user?.role ||
        user?.roles ||
        user?.role_name ||
        user?.roleName ||
        user?.data?.selected_role ||
        user?.data?.role ||
        user?.data?.roles ||
        null
      );
    },

    safeJsonParse(value) {
      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },

    normalizeRoleTokens(role) {
      const tokens = new Set();

      const addToken = (value) => {
        if (value === null || value === undefined || value === "") {
          return;
        }

        const text = String(value).trim().toLowerCase();

        if (!text) {
          return;
        }

        const underscore = text
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
        const compact = text.replace(/[^a-z0-9]+/g, "");

        if (underscore) {
          tokens.add(underscore);
        }

        if (compact) {
          tokens.add(compact);
        }
      };

      const walk = (value) => {
        if (value === null || value === undefined || value === "") {
          return;
        }

        if (typeof value === "string" || typeof value === "number") {
          addToken(value);
          return;
        }

        if (Array.isArray(value)) {
          value.forEach((item) => walk(item));
          return;
        }

        if (typeof value === "object") {
          [
            "name",
            "nama",
            "label",
            "title",
            "code",
            "kode",
            "slug",
            "value",
            "role",
            "roles",
            "role_name",
            "roleName",
            "role_code",
            "roleCode",
          ].forEach((key) => walk(value[key]));
        }
      };

      walk(role);

      return Array.from(tokens);
    },

    getRoleLabel(role) {
      if (!role) {
        return "";
      }

      if (typeof role === "string" || typeof role === "number") {
        return String(role);
      }

      if (Array.isArray(role)) {
        return role
          .map((item) => this.getRoleLabel(item))
          .filter(Boolean)
          .join(", ");
      }

      return (
        role?.nama ||
        role?.name ||
        role?.label ||
        role?.title ||
        role?.role_name ||
        role?.roleName ||
        role?.code ||
        role?.kode ||
        ""
      );
    },

    formatNumber(value) {
      const number = Number(value || 0);

      if (Number.isNaN(number)) {
        return "0";
      }

      return number.toLocaleString("id-ID");
    },

    formatDate(value) {
      if (!value) {
        return "-";
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

    formatTime(value) {
      if (!value) {
        return "-";
      }

      const raw = String(value);

      const timeMatch = raw.match(/(\d{2}):(\d{2})/);

      if (timeMatch) {
        return `Jam ${timeMatch[1]}.${timeMatch[2]}`;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "-";
      }

      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");

      return `Jam ${hour}.${minute}`;
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    isOnlineConsultation(item) {
      const sourceCode = String(
        this.getConsultationSourceCode(item) || "",
      ).toUpperCase();

      const channel = String(
        item?.channel_konsultasi ?? item?.layanan?.channel_konsultasi ?? "",
      ).toLowerCase();

      return (
        sourceCode.includes("ONLINE") ||
        channel === "2" ||
        channel === "online" ||
        this.getConsultationLabel(item) === "Konsultasi Online"
      );
    },

    isRegistrationFinished(item) {
      const status = Number(item?.status ?? item?.status_registrasi ?? 0);

      if (status === 2) {
        return true;
      }

      const label = String(
        item?.status_label?.label ||
          item?.status_label ||
          item?.status_text ||
          item?.status_layanan ||
          "",
      ).toLowerCase();

      return ["selesai", "done", "completed", "finish", "finished"].includes(
        label,
      );
    },

    getBuktiChatKonsultasiOnlineUrl(item) {
      return (
        item?.bukti_chat_konsultasi_online_url ||
        item?.layanan?.bukti_chat_konsultasi_online_url ||
        item?.bukti_chat_url ||
        ""
      );
    },

    hasBuktiChatKonsultasiOnline(item) {
      return Boolean(
        this.getBuktiChatKonsultasiOnlineUrl(item) ||
        item?.bukti_chat_konsultasi_online ||
        item?.layanan?.bukti_chat_konsultasi_online ||
        Number(item?.is_upload_bukti_chat_konsultasi_online || 0) === 1 ||
        Number(item?.layanan?.is_upload_bukti_chat_konsultasi_online || 0) ===
          1,
      );
    },

    canUploadBuktiChatKonsultasiOnline(item) {
      return (
        this.isOnlineConsultation(item) &&
        this.isRegistrationFinished(item) &&
        !this.hasBuktiChatKonsultasiOnline(item)
      );
    },

    canViewBuktiChatKonsultasiOnline(item) {
      return (
        this.isOnlineConsultation(item) &&
        this.hasBuktiChatKonsultasiOnline(item)
      );
    },

    openBuktiChatDialog(item) {
      this.buktiChatDialog = {
        show: true,
        loading: false,
        item,
        file: null,
        error: "",
      };
    },

    closeBuktiChatDialog() {
      if (this.buktiChatDialog.loading) {
        return;
      }

      this.buktiChatDialog = {
        show: false,
        loading: false,
        item: null,
        file: null,
        error: "",
      };
    },

    async submitBuktiChatKonsultasiOnline() {
      const item = this.buktiChatDialog.item;
      const file = Array.isArray(this.buktiChatDialog.file)
        ? this.buktiChatDialog.file[0]
        : this.buktiChatDialog.file;

      if (!item?.id) {
        this.buktiChatDialog.error = "Data registrasi tidak valid.";
        return;
      }

      if (!file) {
        this.buktiChatDialog.error = "File bukti chat wajib dipilih.";
        return;
      }

      this.buktiChatDialog.loading = true;
      this.buktiChatDialog.error = "";

      try {
        const response =
          await registrasiLayananService.uploadBuktiChatKonsultasiOnline(
            item.id,
            file,
          );

        const payload = response?.data || {};

        const index = this.rows.findIndex(
          (row) => Number(row.id) === Number(item.id),
        );

        if (index >= 0) {
          const current = this.rows[index];

          this.rows.splice(index, 1, {
            ...current,
            bukti_chat_konsultasi_online:
              payload.bukti_chat_konsultasi_online ||
              current.bukti_chat_konsultasi_online,
            bukti_chat_konsultasi_online_url:
              payload.bukti_chat_konsultasi_online_url ||
              current.bukti_chat_konsultasi_online_url,
            is_upload_bukti_chat_konsultasi_online: 1,
            layanan: {
              ...(current.layanan || {}),
              bukti_chat_konsultasi_online:
                payload.bukti_chat_konsultasi_online ||
                current?.layanan?.bukti_chat_konsultasi_online,
              bukti_chat_konsultasi_online_url:
                payload.bukti_chat_konsultasi_online_url ||
                current?.layanan?.bukti_chat_konsultasi_online_url,
              is_upload_bukti_chat_konsultasi_online: 1,
            },
          });
        }

        this.showSnackbar(
          response?.message ||
            "Bukti chat konsultasi online berhasil diupload.",
          "success",
        );

        this.closeBuktiChatDialog();
      } catch (error) {
        this.buktiChatDialog.error =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal upload bukti chat konsultasi online.";
      } finally {
        this.buktiChatDialog.loading = false;
      }
    },

    viewBuktiChatKonsultasiOnline(item) {
      const url = this.getBuktiChatKonsultasiOnlineUrl(item);

      if (!url) {
        this.showSnackbar("File bukti chat belum tersedia.", "warning");
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    },
  },
};
</script>

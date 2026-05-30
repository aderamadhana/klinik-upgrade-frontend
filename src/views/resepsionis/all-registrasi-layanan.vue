<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
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
              variant="outlined"
              density="compact"
              hide-details
              clearable
              prepend-inner-icon="mdi-magnify"
              label="Cari registrasi / pasien / dokter"
              @keyup.enter="applyFilters"
              @click:clear="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.tanggal"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              label="Tanggal"
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.layanan"
              :items="layananItems"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              label="Layanan"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.current_task"
              :items="taskItems"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              label="Task"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.status"
              :items="statusItems"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              label="Status"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <v-col cols="12" md="1">
            <v-btn
              variant="outlined"
              color="primary"
              prepend-icon="mdi-refresh"
              @click="fetchData"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert v-if="errorMessage" type="error" border="start" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-card variant="outlined">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          :items-per-page="pagination.perPage"
          hide-default-footer
          density="compact"
          class="border"
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
                    {{ item.kode_registrasi || `REG-${item.id}` }}
                  </v-btn>

                  <div
                    class="d-flex align-center ga-1 text-caption text-medium-emphasis"
                  >
                    <v-icon size="14">mdi-calendar</v-icon>
                    <span>{{ formatDate(item.tanggal_kunjungan) }}</span>
                  </div>

                  <div
                    class="d-flex align-center ga-1 text-caption text-medium-emphasis"
                  >
                    <v-icon size="14">mdi-clock-outline</v-icon>
                    <span
                      >Jam
                      {{
                        formatTime(item.registered_at || item.created_at)
                      }}</span
                    >
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
                    <v-chip size="x-small" color="primary">
                      Dokter: {{ getDokterName(item) }}
                    </v-chip>

                    <v-chip size="x-small" color="success">
                      Perawat: {{ getPerawatName(item) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="d-flex flex-wrap ga-1 py-2">
              <v-chip v-if="hasConsultation(item)" size="small" color="primary">
                <v-icon start size="16">mdi-stethoscope</v-icon>
                {{ getConsultationLabel(item) }}
              </v-chip>

              <v-chip v-if="hasTreatment(item)" size="small" color="success">
                <v-icon start size="16">mdi-face-woman-shimmer-outline</v-icon>
                Treatment
              </v-chip>

              <v-chip v-if="hasSales(item)" size="small" color="info">
                <v-icon start size="16">mdi-cart-outline</v-icon>
                Penjualan
              </v-chip>

              <v-chip
                v-if="isPembelianOnline(item)"
                size="small"
                color="deep-purple"
              >
                <v-icon start size="16">mdi-web</v-icon>
                Pembelian Online
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
            <div class="py-2 text-right">
              <div class="text-body-2 font-weight-bold">
                Rp {{ formatNumber(item.grand_total || 0) }}
              </div>

              <div class="text-caption text-medium-emphasis">
                Konsul: Rp {{ formatNumber(item.total_konsultasi || 0) }}
              </div>

              <div class="d-flex justify-end flex-wrap ga-1 mt-1">
                <v-chip
                  size="x-small"
                  :color="getStatusMeta(item).color"
                  :prepend-icon="getStatusMeta(item).icon"
                >
                  {{ getStatusMeta(item).label }}
                </v-chip>

                <v-chip
                  size="x-small"
                  :color="getTaskMeta(item).color"
                  :prepend-icon="getTaskMeta(item).icon"
                >
                  {{ getTaskMeta(item).label }}
                </v-chip>
              </div>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end align-center ga-2 flex-wrap py-2">
              <v-btn
                size="small"
                color="primary"
                prepend-icon="mdi-eye-outline"
                @click="goToDetail(item)"
              >
                Detail
              </v-btn>

              <v-btn
                v-if="getPrimaryAction(item)"
                size="small"
                :color="getPrimaryAction(item).color"
                :prepend-icon="getPrimaryAction(item).icon"
                @click="handlePrimaryAction(item)"
              >
                {{ getPrimaryAction(item).label }}
              </v-btn>

              <v-btn
                v-if="canCancel(item)"
                size="small"
                color="error"
                prepend-icon="mdi-close-circle-outline"
                @click="confirmCancel(item)"
              >
                Batal
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-avatar color="grey-lighten-3" size="56" class="mb-3">
                <v-icon size="30" color="grey"
                  >mdi-clipboard-text-off-outline</v-icon
                >
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

      <v-card-actions class="pa-4">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 w-100"
        >
          <div class="text-body-2 text-medium-emphasis">
            Total data:
            <strong class="text-high-emphasis">{{ pagination.total }}</strong>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-select
              v-model="pagination.perPage"
              :items="[10, 15, 25, 50, 100]"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 96px"
              @update:model-value="onPerPageChange"
            />

            <v-pagination
              v-model="pagination.page"
              :length="pagination.lastPage"
              density="compact"
              total-visible="5"
              @update:model-value="fetchData"
            />
          </div>
        </div>
      </v-card-actions>
    </v-card>

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
            akan dibatalkan.
          </div>

          <v-alert type="warning" density="compact">
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
        layanan: null,
        current_task: null,
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
          minWidth: 260,
        },
        {
          title: "Total / Status",
          key: "total_status",
          sortable: false,
          align: "end",
          minWidth: 230,
        },
        {
          title: "Aksi",
          key: "actions",
          sortable: false,
          align: "end",
          minWidth: 300,
        },
      ],

      layananItems: [
        { title: "Konsultasi", value: "konsultasi" },
        { title: "Treatment", value: "treatment" },
        { title: "Penjualan", value: "penjualan" },
        { title: "Pembelian Online", value: "pembelian_online" },
      ],

      taskItems: [
        { title: "Konsultasi", value: 1 },
        { title: "Treatment", value: 2 },
        { title: "Nurse Station", value: 3 },
        { title: "Pembayaran", value: 4 },
        { title: "Selesai", value: 5 },
      ],

      statusItems: [
        { title: "Aktif", value: 1 },
        { title: "Selesai", value: 2 },
        { title: "Batal", value: 9 },
      ],

      cancelDialog: {
        show: false,
        loading: false,
        item: null,
      },

      snackbar: {
        show: false,
        color: "success",
        text: "",
      },

      searchTimer: null,
    };
  },

  computed: {
    activeTokoId() {
      return localStorage.getItem("selected_toko_id") || null;
    },
  },

  watch: {
    "filters.search"() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.applyFilters();
      }, 450);
    },
  },

  created() {
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
          current_task: this.filters.current_task ?? undefined,
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
      if (Array.isArray(payload)) {
        return payload;
      }

      if (Array.isArray(payload?.data)) {
        return payload.data;
      }

      if (Array.isArray(payload?.items)) {
        return payload.items;
      }

      return [];
    },

    applyPagination(payload) {
      this.pagination.page = Number(
        payload?.current_page || this.pagination.page || 1,
      );
      this.pagination.perPage = Number(
        payload?.per_page || this.pagination.perPage || 15,
      );
      this.pagination.total = Number(payload?.total || this.rows.length || 0);
      this.pagination.lastPage = Number(payload?.last_page || 1);
    },

    applyFilters() {
      this.pagination.page = 1;
      this.fetchData();
    },

    onPerPageChange() {
      this.pagination.page = 1;
      this.fetchData();
    },

    goToAdd() {
      this.$router.push("/resepsionis/registrasi-layanan/add");
    },

    goToDetail(item) {
      this.$router.push(`/resepsionis/registrasi-layanan/${item.id}`);
    },

    async handlePrimaryAction(item) {
      if (!item?.id) return;

      try {
        await registrasiLayananService.startCurrentTask(item.id);
        this.showSnackbar("Task berhasil diproses", "success");
        this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      }
    },

    confirmCancel(item) {
      this.cancelDialog.item = item;
      this.cancelDialog.show = true;
    },

    async cancelRegistrasi() {
      if (!this.cancelDialog.item?.id) return;

      this.cancelDialog.loading = true;

      try {
        await registrasiLayananService.cancel(this.cancelDialog.item.id);
        this.cancelDialog.show = false;
        this.cancelDialog.item = null;
        this.showSnackbar("Registrasi berhasil dibatalkan", "success");
        this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.cancelDialog.loading = false;
      }
    },

    toBoolean(value) {
      return (
        value === true ||
        value === 1 ||
        value === "1" ||
        String(value).toLowerCase() === "true"
      );
    },

    hasConsultation(item) {
      return (
        this.toBoolean(item?.is_konsultasi) ||
        this.toBoolean(item?.layanan?.ada_konsultasi) ||
        Boolean(item?.konsultasi_source_code) ||
        Boolean(item?.layanan?.konsultasi_source_code) ||
        Boolean(item?.channel_konsultasi)
      );
    },

    hasTreatment(item) {
      return (
        this.toBoolean(item?.is_treatment) ||
        this.toBoolean(item?.layanan?.ada_treatment)
      );
    },

    hasSales(item) {
      return (
        this.toBoolean(item?.is_penjualan) ||
        this.toBoolean(item?.layanan?.ada_penjualan)
      );
    },

    isPembelianOnline(item) {
      return (
        this.toBoolean(item?.is_pembelian_online) ||
        this.toBoolean(item?.layanan?.is_pembelian_online)
      );
    },

    getConsultationLabel(item) {
      return (
        item?.layanan?.konsultasi_mapping?.source_name ||
        item?.konsultasi_mapping?.source_name ||
        item?.konsultasi_source_name ||
        item?.layanan?.konsultasi_source_name ||
        item?.channel_konsultasi_label ||
        item?.layanan?.channel_label ||
        "Konsultasi"
      );
    },

    getConsultationSourceCode(item) {
      return (
        item?.layanan?.konsultasi_mapping?.source_code ||
        item?.konsultasi_mapping?.source_code ||
        item?.konsultasi_source_code ||
        item?.layanan?.konsultasi_source_code ||
        "-"
      );
    },

    getConsultationSourceName(item) {
      return (
        item?.layanan?.konsultasi_mapping?.source_name ||
        item?.konsultasi_mapping?.source_name ||
        item?.konsultasi_source_name ||
        item?.layanan?.konsultasi_source_name ||
        "-"
      );
    },

    getConsultationAccurateCode(item) {
      return (
        item?.layanan?.konsultasi_mapping?.kode_accurate ||
        item?.konsultasi_mapping?.kode_accurate ||
        null
      );
    },

    getPembelianOnlineSourceName(item) {
      return (
        item?.layanan?.pembelian_online_mapping?.source_name ||
        item?.pembelian_online_mapping?.source_name ||
        "Pembelian Online"
      );
    },

    getPembelianOnlineAccurateCode(item) {
      return (
        item?.layanan?.pembelian_online_mapping?.kode_accurate ||
        item?.pembelian_online_mapping?.kode_accurate ||
        null
      );
    },

    getPasienName(item) {
      return item?.pasien?.nama || item?.nama_pasien || "-";
    },

    getPasienMeta(item) {
      const noRm = item?.pasien?.no_rm || "-";
      const noHp = item?.pasien?.no_hp || "-";

      return `${noRm} • ${noHp}`;
    },

    getDokterName(item) {
      return item?.dokter_awal?.nama || item?.dokterAwal?.nama || "-";
    },

    getPerawatName(item) {
      return item?.perawat_awal?.nama || item?.perawatAwal?.nama || "-";
    },

    getStatusMeta(item) {
      if (item?.status_label) {
        return item.status_label;
      }

      const status = Number(item?.status || 0);

      if (status === 1) {
        return {
          label: "Aktif",
          color: "primary",
          icon: "mdi-progress-clock",
        };
      }

      if (status === 2) {
        return {
          label: "Selesai",
          color: "success",
          icon: "mdi-check-circle-outline",
        };
      }

      if (status === 9) {
        return {
          label: "Batal",
          color: "error",
          icon: "mdi-close-circle-outline",
        };
      }

      return {
        label: "Draft",
        color: "grey",
        icon: "mdi-file-outline",
      };
    },

    getTaskMeta(item) {
      if (item?.current_task_label) {
        return item.current_task_label;
      }

      const task = Number(item?.current_task || 0);

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
          label: "Nurse Station",
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
          icon: "mdi-check-all",
        };
      }

      return {
        label: "Draft",
        color: "grey",
        icon: "mdi-file-outline",
      };
    },

    getPrimaryAction(item) {
      if (Number(item?.status) !== 1) {
        return null;
      }

      const task = Number(item?.current_task || 0);

      if (task === 1) {
        return {
          label: "Proses Dokter",
          color: "primary",
          icon: "mdi-stethoscope",
        };
      }

      if (task === 2) {
        return {
          label: "Proses Treatment",
          color: "success",
          icon: "mdi-face-woman-shimmer-outline",
        };
      }

      if (task === 3) {
        return {
          label: "Proses Perawat",
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

      return null;
    },

    canCancel(item) {
      return Number(item?.status) === 1;
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    formatDate(value) {
      if (!value) return "-";

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

    getErrorMessage(error) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Terjadi kesalahan"
      );
    },

    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

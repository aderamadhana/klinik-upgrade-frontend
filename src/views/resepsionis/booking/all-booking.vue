<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Booking Layanan</h1>
        <p class="page-subtitle">
          Daftar booking layanan pasien berdasarkan tanggal, status, dan cabang
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card class="main-card" flat>
      <div class="toolbar-wrap">
        <div class="filter-wrap">
          <v-text-field
            v-model="filters.search"
            label="Cari"
            placeholder="Kode booking, nama pasien, No. HP"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            class="search-field"
            @keyup.enter="fetchData"
            @click:clear="onClearSearch"
          />

          <v-text-field
            v-model="filters.tanggal"
            label="Tanggal"
            type="date"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-calendar"
            hide-details
            class="date-field"
            @update:modelValue="fetchData"
          />

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
            class="status-field"
            @update:modelValue="fetchData"
          />
        </div>

        <div class="action-wrap">
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            prepend-icon="mdi-refresh"
            :loading="loading"
            class="toolbar-btn"
            @click="fetchData"
          >
            Refresh
          </v-btn>
        </div>
      </div>

      <v-alert
        v-if="!activeTokoId"
        type="warning"
        variant="tonal"
        border="start"
        rounded="lg"
        class="mx-4 mb-4"
      >
        Cabang aktif belum terpilih. Data booking akan lebih akurat jika cabang
        sudah dipilih dari header.
      </v-alert>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        border="start"
        rounded="lg"
        closable
        class="mx-4 mb-4"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <div class="table-wrap">
        <v-data-table
          :headers="headers"
          :items="rows"
          :loading="loading"
          item-value="id"
          density="compact"
          class="registrasi-table"
          :items-per-page="pagination.perPage"
          hide-default-footer
        >
          <template #loading>
            <v-skeleton-loader type="table-row@8" />
          </template>

          <template #item.booking_pasien="{ item }">
            <div class="identity-cell">
              <div class="reg-block">
                <button
                  type="button"
                  class="reg-code-link"
                  @click="openDetail(item)"
                >
                  {{ item.booking_code || "-" }}
                </button>

                <div class="reg-meta">
                  <v-icon size="14">mdi-calendar</v-icon>
                  <span>
                    {{ formatDate(item.appointment_at || item.booking_date) }}
                  </span>
                </div>

                <div class="reg-meta">
                  <v-icon size="14">mdi-clock-outline</v-icon>
                  <span>
                    Jam
                    {{ formatTime(item.appointment_at || item.booking_time) }}
                  </span>
                </div>
              </div>

              <div class="patient-block">
                <div class="patient-name">
                  {{ getPasienName(item) }}
                </div>

                <div class="patient-meta">
                  {{ getPasienMeta(item) }}
                </div>

                <div class="staff-line">
                  <span>
                    Kategori
                    <strong>{{ item.kategori?.nama || "-" }}</strong>
                  </span>

                  <span>
                    Source
                    <strong>{{ item.source || "-" }}</strong>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="service-cell">
              <v-chip
                v-if="item.kategori?.nama"
                size="small"
                color="primary"
                variant="tonal"
                class="service-chip"
              >
                {{ item.kategori.nama }}
              </v-chip>

              <v-chip
                v-if="item.dokter?.nama"
                size="small"
                color="success"
                variant="tonal"
                class="service-chip"
              >
                Dokter: {{ item.dokter.nama }}
              </v-chip>

              <v-chip
                v-if="item.treatment?.nama"
                size="small"
                color="info"
                variant="tonal"
                class="service-chip"
              >
                Treatment
              </v-chip>

              <div
                v-if="item.treatment?.nama"
                class="text-caption text-medium-emphasis mt-1"
                style="max-width: 320px"
              >
                {{ item.treatment.nama }}
              </div>

              <span
                v-if="
                  !item.kategori?.nama &&
                  !item.dokter?.nama &&
                  !item.treatment?.nama
                "
                class="empty-text"
              >
                -
              </span>
            </div>
          </template>

          <template #item.status_info="{ item }">
            <div class="amount-cell">
              <v-chip
                size="x-small"
                :color="statusMeta(item.status).color"
                variant="tonal"
                :prepend-icon="statusMeta(item.status).icon"
              >
                {{ statusMeta(item.status).text }}
              </v-chip>

              <div
                v-if="item.checked_in_at"
                class="text-caption text-medium-emphasis mt-1"
              >
                Check-in {{ formatDateTime(item.checked_in_at) }}
              </div>

              <div
                v-else-if="item.cancelled_at"
                class="text-caption text-medium-emphasis mt-1"
              >
                Batal {{ formatDateTime(item.cancelled_at) }}
              </div>

              <div
                v-else-if="item.completed_at"
                class="text-caption text-medium-emphasis mt-1"
              >
                Selesai {{ formatDateTime(item.completed_at) }}
              </div>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="action-cell">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-eye-outline"
                class="text-action-btn"
                @click="openDetail(item)"
              >
                Detail
              </v-btn>

              <v-btn
                v-if="canMarkLate(item)"
                size="small"
                color="warning"
                variant="tonal"
                prepend-icon="mdi-clock-alert-outline"
                class="text-action-btn"
                :loading="isActionLoading(item, 'late')"
                :disabled="actionLoadingId !== null"
                @click="confirmAction(item, 'late')"
              >
                Late
              </v-btn>

              <v-btn
                v-if="canNoShow(item)"
                size="small"
                color="deep-orange"
                variant="tonal"
                prepend-icon="mdi-account-off-outline"
                class="text-action-btn"
                :loading="isActionLoading(item, 'no-show')"
                :disabled="actionLoadingId !== null"
                @click="confirmAction(item, 'no-show')"
              >
                No Show
              </v-btn>

              <v-btn
                v-if="canCancel(item)"
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-close-circle-outline"
                class="text-action-btn"
                :loading="isActionLoading(item, 'cancel')"
                :disabled="actionLoadingId !== null"
                @click="confirmAction(item, 'cancel')"
              >
                Cancel
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="empty-state">
              <v-icon size="40" color="grey">
                mdi-calendar-remove-outline
              </v-icon>

              <div class="empty-title">Belum ada data booking</div>

              <div class="empty-description">
                Data booking akan muncul sesuai filter tanggal, status, dan
                cabang aktif.
              </div>
            </div>
          </template>
        </v-data-table>
      </div>

      <div class="table-footer">
        <div class="footer-count">
          Total data: <strong>{{ pagination.total }}</strong>
        </div>

        <div class="footer-actions">
          <v-select
            v-model="pagination.perPage"
            :items="[10, 15, 25, 50, 100]"
            variant="outlined"
            density="compact"
            hide-details
            class="per-page-field"
            @update:modelValue="onPerPageChange"
          />

          <v-pagination
            v-model="pagination.page"
            :length="pagination.lastPage"
            density="comfortable"
            total-visible="5"
            @update:modelValue="fetchData"
          />
        </div>
      </div>
    </v-card>

    <v-dialog v-model="detailDialog.show" max-width="620">
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Detail Booking</span>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="detailDialog.show = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text v-if="detailDialog.item">
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="detail-label">Kode Booking</div>
              <div class="detail-value">
                {{ detailDialog.item.booking_code || "-" }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Status</div>
              <v-chip
                size="small"
                :color="statusMeta(detailDialog.item.status).color"
                variant="tonal"
                :prepend-icon="statusMeta(detailDialog.item.status).icon"
              >
                {{ statusMeta(detailDialog.item.status).text }}
              </v-chip>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Nama Pasien</div>
              <div class="detail-value">
                {{ getPasienName(detailDialog.item) }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Nomor HP</div>
              <div class="detail-value">
                {{
                  detailDialog.item.no_hp ||
                  detailDialog.item.pasien?.no_hp ||
                  "-"
                }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Jadwal</div>
              <div class="detail-value">
                {{
                  formatDate(
                    detailDialog.item.appointment_at ||
                      detailDialog.item.booking_date,
                  )
                }}
                ·
                {{
                  formatTime(
                    detailDialog.item.appointment_at ||
                      detailDialog.item.booking_time,
                  )
                }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Kategori</div>
              <div class="detail-value">
                {{ detailDialog.item.kategori?.nama || "-" }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Dokter</div>
              <div class="detail-value">
                {{ detailDialog.item.dokter?.nama || "-" }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-label">Treatment</div>
              <div class="detail-value">
                {{ detailDialog.item.treatment?.nama || "-" }}
              </div>
            </v-col>

            <v-col cols="12">
              <div class="detail-label">Catatan</div>
              <div class="detail-value">
                {{ detailDialog.item.notes || "-" }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="detailDialog.show = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialog.show" max-width="460">
      <v-card rounded="lg">
        <v-card-title class="font-weight-bold">
          {{ confirmTitle }}
        </v-card-title>

        <v-card-text>
          {{ confirmMessage }}

          <v-alert type="warning" variant="tonal" rounded="lg" class="mt-4">
            <strong>{{ confirmDialog.item?.booking_code || "-" }}</strong>
            <br />
            {{ getPasienName(confirmDialog.item) }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            color="grey-darken-1"
            :disabled="actionLoadingId !== null"
            @click="confirmDialog.show = false"
          >
            Tutup
          </v-btn>

          <v-btn
            :color="confirmColor"
            variant="flat"
            :loading="actionLoadingId !== null"
            @click="executeAction"
          >
            Proses
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
import bookingLayananService from "@/services/antrian/bookingLayananService";

export default {
  name: "AllBooking",

  data() {
    return {
      breadcrumbs: [
        { title: "Booking", disabled: true },
        { title: "Booking Layanan", disabled: false, to: "/booking-layanan" },
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
          title: "Booking & Pasien",
          key: "booking_pasien",
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
          title: "Status",
          key: "status_info",
          sortable: false,
          align: "end",
          width: 220,
        },
        {
          title: "Aksi",
          key: "actions",
          sortable: false,
          align: "end",
          width: 310,
        },
      ],

      statusOptions: [
        { label: "Booked", value: "booked" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Checked In", value: "checked_in" },
        { label: "In Queue", value: "in_queue" },
        { label: "Called", value: "called" },
        { label: "Serving", value: "serving" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "No Show", value: "no_show" },
        { label: "Rescheduled", value: "rescheduled" },
        { label: "Late", value: "late" },
      ],

      detailDialog: {
        show: false,
        item: null,
      },

      confirmDialog: {
        show: false,
        item: null,
        type: "",
      },

      actionLoadingId: null,

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

    confirmTitle() {
      if (this.confirmDialog.type === "cancel") return "Batalkan Booking?";
      if (this.confirmDialog.type === "no-show") return "Tandai No Show?";
      if (this.confirmDialog.type === "late") return "Tandai Terlambat?";

      return "Konfirmasi";
    },

    confirmMessage() {
      if (this.confirmDialog.type === "cancel") {
        return "Booking akan dibatalkan. Tindakan ini tidak menghapus data, hanya mengubah status menjadi cancelled.";
      }

      if (this.confirmDialog.type === "no-show") {
        return "Booking akan ditandai sebagai no-show karena pasien tidak datang.";
      }

      if (this.confirmDialog.type === "late") {
        return "Booking akan ditandai sebagai late karena pasien terlambat.";
      }

      return "Yakin ingin memproses data ini?";
    },

    confirmColor() {
      if (this.confirmDialog.type === "cancel") return "error";
      if (this.confirmDialog.type === "no-show") return "deep-orange";
      if (this.confirmDialog.type === "late") return "warning";

      return "primary";
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
          keyword: this.filters.search || undefined,
          tanggal: this.filters.tanggal || undefined,
          status: this.filters.status || undefined,
          toko_id: this.activeTokoId || undefined,
        };

        const response = await bookingLayananService.getAll(params);
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

    getPasienName(item) {
      if (!item) return "-";

      return (
        item?.nama_pasien ||
        item?.pasien?.nama ||
        item?.pasien?.nama_pasien ||
        "-"
      );
    },

    getPasienMeta(item) {
      if (!item) return "-";

      return (
        [item?.pasien?.no_rm || item?.no_rm, item?.no_hp || item?.pasien?.no_hp]
          .filter(Boolean)
          .join(" • ") || "-"
      );
    },

    openDetail(item) {
      this.detailDialog.item = item;
      this.detailDialog.show = true;
    },

    confirmAction(item, type) {
      this.confirmDialog.item = item;
      this.confirmDialog.type = type;
      this.confirmDialog.show = true;
    },

    async executeAction() {
      const item = this.confirmDialog.item;
      const type = this.confirmDialog.type;

      if (!item?.id || !type) {
        this.showSnackbar("Data booking tidak valid", "error");
        return;
      }

      this.actionLoadingId = item.id;

      try {
        if (type === "cancel") {
          await bookingLayananService.cancel(item.id);
          this.showSnackbar("Booking berhasil dibatalkan", "success");
        }

        if (type === "no-show") {
          await bookingLayananService.noShow(item.id);
          this.showSnackbar("Booking berhasil ditandai no-show", "success");
        }

        if (type === "late") {
          await bookingLayananService.markLate(item.id);
          this.showSnackbar("Booking berhasil ditandai terlambat", "success");
        }

        this.confirmDialog.show = false;
        this.confirmDialog.item = null;
        this.confirmDialog.type = "";

        await this.fetchData();
      } catch (error) {
        this.showSnackbar(this.getErrorMessage(error), "error");
      } finally {
        this.actionLoadingId = null;
      }
    },

    isActionLoading(item, type) {
      return (
        this.actionLoadingId === item.id && this.confirmDialog.type === type
      );
    },

    canCancel(item) {
      return !["completed", "cancelled", "no_show"].includes(item.status);
    },

    canNoShow(item) {
      return ["booked", "confirmed", "late"].includes(item.status);
    },

    canMarkLate(item) {
      return ["booked", "confirmed"].includes(item.status);
    },

    statusMeta(status) {
      const meta = {
        booked: {
          text: "Booked",
          color: "blue-grey",
          icon: "mdi-calendar-outline",
        },
        confirmed: {
          text: "Confirmed",
          color: "primary",
          icon: "mdi-calendar-check-outline",
        },
        checked_in: {
          text: "Checked In",
          color: "info",
          icon: "mdi-account-check-outline",
        },
        in_queue: {
          text: "In Queue",
          color: "warning",
          icon: "mdi-account-clock-outline",
        },
        called: {
          text: "Called",
          color: "purple",
          icon: "mdi-bullhorn-outline",
        },
        serving: {
          text: "Serving",
          color: "success",
          icon: "mdi-progress-clock",
        },
        completed: {
          text: "Completed",
          color: "grey",
          icon: "mdi-check-circle-outline",
        },
        cancelled: {
          text: "Cancelled",
          color: "error",
          icon: "mdi-close-circle-outline",
        },
        no_show: {
          text: "No Show",
          color: "deep-orange",
          icon: "mdi-account-off-outline",
        },
        rescheduled: {
          text: "Rescheduled",
          color: "indigo",
          icon: "mdi-calendar-sync-outline",
        },
        late: {
          text: "Late",
          color: "warning",
          icon: "mdi-clock-alert-outline",
        },
      };

      return (
        meta[status] || {
          text: status || "-",
          color: "grey",
          icon: "mdi-information-outline",
        }
      );
    },

    formatDateTime(value) {
      if (!value) return "-";

      return `${this.formatDate(value)} ${this.formatTime(value)}`;
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

    formatTime(value) {
      if (!value) return "-";

      if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
        return value.slice(0, 5);
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "-";
      }

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
        "Gagal memproses data booking"
      );
    },
  },
};
</script>

<style scoped>
.detail-label {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
</style>

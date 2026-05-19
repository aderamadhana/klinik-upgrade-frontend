<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Registrasi Layanan</h1>
        <p class="page-subtitle">
          Daftar registrasi layanan pasien yang sudah dibuat oleh FO
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
            placeholder="Kode, nama pasien, No. RM, No. HP"
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
            @click="fetchData"
          >
            Refresh
          </v-btn>

          <v-btn color="success" prepend-icon="mdi-plus" @click="goToAdd">
            Entry Data
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
        Cabang aktif belum terpilih. Data registrasi akan lebih akurat jika
        cabang sudah dipilih dari header.
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
          density="comfortable"
          class="registrasi-table"
          :items-per-page="pagination.perPage"
          hide-default-footer
        >
          <template #loading>
            <v-skeleton-loader type="table-row@8" />
          </template>

          <template #item.registrasi_info="{ item }">
            <div class="registrasi-info">
              <div class="kode-cell">
                {{ item.kode_registrasi || "-" }}
              </div>

              <div class="date-line">
                <v-icon size="15" class="mr-1">mdi-calendar</v-icon>
                {{ formatDate(item.tanggal_kunjungan || item.tanggal) }}
              </div>

              <div class="date-line">
                <v-icon size="15" class="mr-1">mdi-clock-outline</v-icon>
                Jam {{ formatTime(item.registered_at || item.created_at) }}
              </div>
            </div>
          </template>

          <template #item.pasien_info="{ item }">
            <div class="pasien-info">
              <div class="patient-name">
                {{ getPasienName(item) }}
              </div>

              <div class="patient-meta">
                {{ getPasienMeta(item) }}
              </div>

              <div class="petugas-inline">
                <div>
                  <span>Dokter</span>
                  <strong>{{ getDokterName(item) }}</strong>
                </div>

                <div>
                  <span>Perawat</span>
                  <strong>{{ getPerawatName(item) }}</strong>
                </div>
              </div>
            </div>
          </template>

          <template #item.layanan="{ item }">
            <div class="chip-list">
              <v-chip
                v-if="Number(item.channel_konsultasi || 0) > 0"
                size="small"
                color="primary"
                variant="tonal"
                class="service-chip"
              >
                {{ getChannelLabel(item.channel_konsultasi) }}
              </v-chip>

              <v-chip
                v-if="isTrue(item.is_treatment)"
                size="small"
                color="success"
                variant="tonal"
                class="service-chip"
              >
                Treatment
              </v-chip>

              <v-chip
                v-if="isTrue(item.is_penjualan)"
                size="small"
                color="info"
                variant="tonal"
                class="service-chip"
              >
                Penjualan
              </v-chip>

              <v-chip
                v-if="
                  Number(item.channel_konsultasi || 0) === 0 &&
                  !isTrue(item.is_treatment) &&
                  !isTrue(item.is_penjualan)
                "
                size="small"
                color="grey"
                variant="tonal"
                class="service-chip"
              >
                -
              </v-chip>
            </div>
          </template>

          <template #item.total_status="{ item }">
            <div class="total-status-cell">
              <div class="total-cell">
                Rp {{ formatNumber(item.grand_total || 0) }}
              </div>

              <div
                class="status-indicator"
                :class="getStatusClass(item.status)"
              >
                <span class="status-dot"></span>
                <span>{{ getStatusLabel(item.status) }}</span>
              </div>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="action-cell">
              <v-btn
                v-if="canProcess(item)"
                size="small"
                color="success"
                variant="flat"
                prepend-icon="mdi-play-circle-outline"
                class="process-btn"
                @click="goToProcess(item)"
              >
                Proses
              </v-btn>

              <v-btn
                v-else
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-eye-outline"
                class="process-btn"
                @click="goToDetail(item)"
              >
                Detail
              </v-btn>

              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    size="small"
                    variant="text"
                    color="grey-darken-1"
                    icon="mdi-dots-vertical"
                    class="more-btn"
                  />
                </template>

                <v-list density="compact" min-width="160">
                  <v-list-item @click="goToDetail(item)">
                    <template #prepend>
                      <v-icon size="18" color="primary">mdi-eye-outline</v-icon>
                    </template>
                    <v-list-item-title>Detail</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="canCancel(item)"
                    class="text-error"
                    @click="confirmCancel(item)"
                  >
                    <template #prepend>
                      <v-icon size="18" color="error"
                        >mdi-close-circle-outline</v-icon
                      >
                    </template>
                    <v-list-item-title>Batalkan</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>

          <template #no-data>
            <div class="empty-state">
              <v-icon size="40" color="grey">
                mdi-clipboard-text-off-outline
              </v-icon>

              <div class="empty-title">Belum ada data registrasi</div>

              <div class="empty-text">
                Data akan muncul setelah FO menyimpan registrasi layanan.
              </div>

              <v-btn
                color="success"
                prepend-icon="mdi-plus"
                class="mt-4"
                @click="goToAdd"
              >
                Buat Registrasi
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>

      <div class="table-footer">
        <div class="text-body-2 text-medium-emphasis">
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

    <v-dialog v-model="cancelDialog.show" max-width="460">
      <v-card rounded="lg">
        <v-card-title class="font-weight-bold">
          Batalkan Registrasi?
        </v-card-title>

        <v-card-text>
          Data registrasi
          <strong>
            {{
              cancelDialog.item?.kode_registrasi ||
              `REG-${cancelDialog.item?.id}`
            }}
          </strong>
          akan dibatalkan. Tindakan ini tidak menghapus data, hanya mengubah
          status menjadi batal.
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
          title: "Registrasi",
          key: "registrasi_info",
          sortable: false,
          width: 210,
        },
        {
          title: "Pasien & Petugas",
          key: "pasien_info",
          sortable: false,
          minWidth: 360,
        },
        {
          title: "Layanan",
          key: "layanan",
          sortable: false,
          minWidth: 260,
        },
        {
          title: "Total & Status",
          key: "total_status",
          sortable: false,
          align: "end",
          width: 190,
        },
        {
          title: "Aksi",
          key: "actions",
          sortable: false,
          align: "end",
          width: 300,
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
    getToday() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();

      return `${year}-${month}-${day}`;
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

    showSnackbar(text, color = "success") {
      this.snackbar.show = true;
      this.snackbar.text = text;
      this.snackbar.color = color;
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

      if (numberValue === 1) return "Konsultasi Offline";
      if (numberValue === 2) return "Konsultasi Online";

      if (value === "offline") return "Konsultasi Offline";
      if (value === "online") return "Konsultasi Online";

      return "Konsultasi";
    },

    getTaskLabel(value) {
      const numberValue = Number(value || 0);

      const map = {
        0: "Tidak Ada Task",
        1: "Konsultasi",
        2: "Treatment",
        3: "Nurse Station",
        4: "Pembayaran",
      };

      return map[numberValue] || "-";
    },

    getTaskColor(value) {
      const numberValue = Number(value || 0);

      const map = {
        0: "grey",
        1: "primary",
        2: "success",
        3: "warning",
        4: "info",
      };

      return map[numberValue] || "grey";
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

    getStatusColor(value) {
      const numberValue = Number(value || 0);

      const map = {
        0: "grey",
        1: "primary",
        2: "success",
        9: "error",
      };

      return map[numberValue] || "grey";
    },

    isTrue(value) {
      return value === true || value === 1 || value === "1";
    },

    canProcess(item) {
      return (
        Number(item?.status || 0) === 1 && Number(item?.current_task || 0) > 0
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

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
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

    formatDateTime(value) {
      if (!value) return "-";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.page-subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: #64748b;
}

.main-card {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
}

.toolbar-wrap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  flex-wrap: wrap;
}

.filter-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-field {
  width: 320px;
  max-width: 100%;
}

.date-field {
  width: 180px;
}

.status-field {
  width: 160px;
}

.table-wrap {
  border-top: 1px solid #eef2f7;
  overflow-x: auto;
}

.registrasi-table {
  background: #fff;
  min-width: 1210px;
}

.registrasi-table :deep(thead th) {
  height: 52px !important;
  background: #f8fafc !important;
  color: #334155 !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  text-transform: none;
  letter-spacing: 0;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb !important;
}

.registrasi-table :deep(tbody tr) {
  min-height: 74px;
  transition: background 0.15s ease;
}

.registrasi-table :deep(tbody tr:hover) {
  background: #f8fbff !important;
}

.registrasi-table :deep(td) {
  padding: 14px 16px !important;
  vertical-align: middle;
  border-bottom: 1px solid #eef2f7 !important;
}

.kode-cell {
  max-width: 150px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
  white-space: normal;
  word-break: break-word;
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-main {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.date-sub {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #64748b;
  line-height: 1.3;
}

.patient-cell {
  line-height: 1.4;
}

.patient-name {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.patient-meta {
  font-size: 13px;
  color: #64748b;
}

.petugas-cell {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 13px;
}

.petugas-row {
  display: grid;
  grid-template-columns: 68px 1fr;
  gap: 8px;
  align-items: center;
  line-height: 1.35;
}

.petugas-row span {
  color: #64748b;
}

.petugas-row strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  max-width: 270px;
}

.service-chip {
  min-height: 26px;
  font-size: 12px !important;
  font-weight: 700 !important;
  padding-inline: 10px !important;
}

.total-cell {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
  line-height: 1.3;
}

.status-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-top: 1px solid #eef2f7;
  flex-wrap: wrap;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.per-page-field {
  width: 90px;
}

.empty-state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 32px;
  text-align: center;
}

.empty-title {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.empty-text {
  font-size: 13px;
  color: #64748b;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .toolbar-wrap {
    flex-direction: column;
  }

  .filter-wrap,
  .action-wrap {
    width: 100%;
  }

  .search-field,
  .date-field,
  .status-field {
    width: 100%;
  }

  .action-wrap .v-btn {
    flex: 1;
  }

  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .per-page-field {
    width: 100%;
  }
}
.table-wrap {
  border-top: 1px solid #eef2f7;
  overflow-x: auto;
}

.registrasi-table {
  background: #fff;
  min-width: 980px;
}

.registrasi-table :deep(thead th) {
  height: 50px !important;
  background: #f8fafc !important;
  color: #334155 !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  text-transform: none;
  letter-spacing: 0;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb !important;
}

.registrasi-table :deep(td) {
  padding: 16px 18px !important;
  vertical-align: middle;
  border-bottom: 1px solid #eef2f7 !important;
}

.registrasi-table :deep(tbody tr:hover) {
  background: #f8fbff !important;
}

.registrasi-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kode-cell {
  max-width: 170px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
}

.date-line {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #64748b;
  line-height: 1.3;
}

.pasien-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.patient-name {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.35;
}

.patient-meta {
  font-size: 13px;
  color: #64748b;
}

.petugas-inline {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.petugas-inline div {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.petugas-inline span {
  color: #64748b;
}

.petugas-inline strong {
  color: #0f172a;
  font-weight: 800;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  max-width: 250px;
}

.service-chip {
  min-height: 28px;
  font-size: 12px !important;
  font-weight: 700 !important;
  padding-inline: 10px !important;
}

.total-status-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.total-cell {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
  line-height: 1.3;
}

.action-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}
.total-status-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.total-cell {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
  line-height: 1.3;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  padding: 0;
  background: transparent;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.status-draft {
  color: #64748b;
}

.status-draft .status-dot {
  background: #94a3b8;
}

.status-active {
  color: #2563eb;
}

.status-active .status-dot {
  background: #2563eb;
}

.status-done {
  color: #16a34a;
}

.status-done .status-dot {
  background: #16a34a;
}

.status-cancel {
  color: #dc2626;
}

.status-cancel .status-dot {
  background: #dc2626;
}

.action-cell {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.process-btn {
  min-height: 34px;
  min-width: 92px;
  padding-inline: 14px !important;
  text-transform: none;
  font-size: 13px !important;
  font-weight: 800 !important;
  letter-spacing: 0;
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.16);
}

.more-btn {
  width: 34px !important;
  height: 34px !important;
}
</style>

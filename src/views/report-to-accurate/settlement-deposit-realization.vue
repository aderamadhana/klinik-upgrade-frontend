<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div
      class="d-flex flex-column flex-md-row justify-space-between align-start ga-3 mb-5"
    >
      <div>
        <div class="text-h5 font-weight-bold text-high-emphasis">
          Faktur Realisasi Deposit Accurate
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Upload faktur realisasi deposit treatment ke Accurate berdasarkan
          claim deposit aktif.
        </div>
      </div>

      <div class="d-flex align-center ga-1 text-body-2">
        <router-link to="/dashboard" class="text-primary text-decoration-none">
          Dashboard
        </router-link>
        <span class="text-medium-emphasis">/</span>
        <span class="text-medium-emphasis">Report To Accurate</span>
      </div>
    </div>

    <v-card variant="flat" border rounded="lg" class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.date"
              type="date"
              label="Tanggal"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              :min="minSettlementDate"
              @click:clear="filters.date = ''"
              @keyup.enter="reload"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.toko_id"
              :items="tokoOptions"
              item-title="nama"
              item-value="id"
              label="Cabang"
              prepend-inner-icon="mdi-store"
              variant="outlined"
              density="compact"
              hide-details
              :clearable="!activeTokoId"
              :disabled="Boolean(activeTokoId)"
              :loading="loadingToko"
              @update:model-value="handleManualTokoChange"
            />
          </v-col>

          <v-col cols="12" sm="8" md="4">
            <v-text-field
              v-model="filters.search"
              label="Cari"
              placeholder="Pasien, faktur deposit, faktur realisasi, treatment"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keyup.enter="reload"
            />
          </v-col>

          <v-col cols="12" sm="4" md="2" class="d-flex ga-2">
            <v-btn
              color="primary"
              variant="flat"
              class="text-none flex-grow-1"
              :loading="loading"
              @click="reload"
            >
              Tampilkan
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card variant="flat" border rounded="lg">
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="perPage"
        :headers="headers"
        :items="items"
        :items-length="pagination.total"
        :loading="loading"
        item-value="id"
        density="comfortable"
        @update:options="loadOptions"
      >
        <template #[`item.nama_pasien`]="{ item }">
          <div class="font-weight-medium">{{ item.nama_pasien || "-" }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ item.no_rm || "-" }}
          </div>
        </template>

        <template #[`item.nama_treatment`]="{ item }">
          <div class="font-weight-medium">{{ item.nama_treatment || "-" }}</div>
        </template>

        <template #[`item.total_realisasi`]="{ item }">
          <span class="font-weight-medium">
            {{ formatCurrency(item.total_realisasi) }}
          </span>
        </template>

        <template #[`item.status_text`]="{ item }">
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-chip :color="item.status_color" size="x-small" variant="flat">
              {{ item.status_label }}
            </v-chip>
            <span class="text-body-2">{{ item.status_text }}</span>
          </div>
          <div v-if="item.error_message" class="text-caption text-error mt-1">
            {{ item.error_message }}
          </div>
        </template>

        <template #[`item.aksi`]="{ item }">
          <div class="d-flex justify-end">
            <v-btn
              v-if="item.can_upload"
              color="primary"
              variant="flat"
              size="small"
              class="text-none"
              prepend-icon="mdi-cloud-upload-outline"
              :loading="uploadingKey === rowKey(item)"
              @click="openConfirm(item)"
            >
              Upload
            </v-btn>
            <span v-else class="text-medium-emphasis">-</span>
          </div>
        </template>

        <template #no-data>
          <div class="pa-8 text-center">
            <v-icon size="36" color="grey">mdi-database-off-outline</v-icon>
            <div class="text-subtitle-2 font-weight-bold mt-3">
              Data realisasi deposit belum ada
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Ubah filter tanggal atau cabang untuk menampilkan data.
            </div>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="confirmDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="font-weight-bold">
          Upload Faktur Realisasi Deposit
        </v-card-title>

        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Realisasi deposit akan dikirim sebagai faktur penjualan ke Accurate.
            Proses ini tidak boleh diulang jika Accurate sudah menerima faktur.
          </div>

          <v-list density="compact" lines="two" border rounded>
            <v-list-item
              title="Tanggal Faktur"
              :subtitle="selectedRow?.tanggal_faktur || '-'"
            />
            <v-list-item
              title="Pasien"
              :subtitle="selectedRow?.nama_pasien || '-'"
            />
            <v-list-item
              title="No. Faktur Deposit"
              :subtitle="selectedRow?.no_faktur_deposit || '-'"
            />
            <v-list-item
              title="No. Faktur Realisasi"
              :subtitle="selectedRow?.no_faktur_realisasi || '-'"
            />
            <v-list-item
              title="Treatment"
              :subtitle="selectedRow?.nama_treatment || '-'"
            />
            <v-list-item
              title="Total Realisasi"
              :subtitle="formatCurrency(selectedRow?.total_realisasi || 0)"
            />
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            @click="confirmDialog = false"
          >
            Batal
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            :loading="uploading"
            @click="uploadSelected"
          >
            Upload Sekarang
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import api from "@/services/api";
import accurateSettlementService from "@/services/accurateSettlementService";

export default {
  name: "SettlementDepositRealizationAccurate",

  data() {
    return {
      loading: false,
      loadingToko: false,
      uploading: false,
      uploadingKey: null,
      confirmDialog: false,
      selectedRow: null,
      activeTokoId: null,
      activeTokoName: "",
      page: 1,
      perPage: 10,
      filters: {
        date: "",
        toko_id: null,
        search: "",
      },
      tokoOptions: [],
      items: [],
      pagination: {
        total: 0,
        current_page: 1,
        per_page: 10,
        last_page: 1,
      },
      snackbar: {
        show: false,
        color: "success",
        message: "",
      },
      headers: [
        { title: "Tanggal Faktur", key: "tanggal_faktur", minWidth: 130 },
        { title: "Nama Pasien", key: "nama_pasien", minWidth: 190 },
        {
          title: "No. Faktur Deposit",
          key: "no_faktur_deposit",
          minWidth: 160,
        },
        {
          title: "No. Faktur Realisasi",
          key: "no_faktur_realisasi",
          minWidth: 170,
        },
        { title: "Nama Treatment", key: "nama_treatment", minWidth: 240 },
        {
          title: "Total Realisasi",
          key: "total_realisasi",
          align: "end",
          minWidth: 160,
        },
        {
          title: "Status Accurate",
          key: "status_text",
          sortable: false,
          minWidth: 230,
        },
        { title: "Tanggal Kirim", key: "tanggal_kirim", minWidth: 160 },
        { title: "Nama Pengirim", key: "nama_pengirim", minWidth: 150 },
        { title: "Keterangan", key: "keterangan", minWidth: 320 },
        {
          title: "Aksi",
          key: "aksi",
          align: "end",
          sortable: false,
          minWidth: 120,
        },
      ],
    };
  },

  computed: {
    minSettlementDate() {
      return this.formatDateForInput(this.addDays(new Date(), -7));
    },
  },

  mounted() {
    this.syncActiveTokoFilter();
    this.loadTokoOptions();
    this.loadData();

    window.addEventListener("storage", this.handleActiveTokoChanged);
    window.addEventListener("focus", this.handleActiveTokoChanged);
    window.addEventListener("toko-changed", this.handleActiveTokoChanged);
    window.addEventListener("cabang-changed", this.handleActiveTokoChanged);
    window.addEventListener(
      "selected-toko-changed",
      this.handleActiveTokoChanged,
    );
    window.addEventListener(
      "selected-cabang-changed",
      this.handleActiveTokoChanged,
    );
  },

  beforeUnmount() {
    window.removeEventListener("storage", this.handleActiveTokoChanged);
    window.removeEventListener("focus", this.handleActiveTokoChanged);
    window.removeEventListener("toko-changed", this.handleActiveTokoChanged);
    window.removeEventListener("cabang-changed", this.handleActiveTokoChanged);
    window.removeEventListener(
      "selected-toko-changed",
      this.handleActiveTokoChanged,
    );
    window.removeEventListener(
      "selected-cabang-changed",
      this.handleActiveTokoChanged,
    );
  },

  methods: {
    loadOptions(options = {}) {
      if (options.page) this.page = options.page;
      if (options.itemsPerPage) this.perPage = options.itemsPerPage;
      this.loadData();
    },

    reload() {
      this.page = 1;
      this.syncActiveTokoFilter();
      this.loadData();
    },

    async loadData() {
      this.syncActiveTokoFilter();

      if (!this.isValidSettlementDate()) {
        this.items = [];
        this.pagination = {
          total: 0,
          current_page: 1,
          per_page: this.perPage,
          last_page: 1,
        };
        this.showSnackbar(
          `Tanggal minimal adalah ${this.formatDisplayDate(
            this.minSettlementDate,
          )}.`,
          "warning",
        );
        return;
      }

      this.loading = true;
      try {
        const response = await accurateSettlementService.getDepositRealization({
          date: this.filters.date || undefined,
          toko_id: this.getEffectiveTokoId() || undefined,
          search: this.filters.search || undefined,
          page: this.page,
          per_page: this.perPage,
        });

        this.items = response?.items || [];
        this.pagination = response?.pagination || this.pagination;
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(
            error,
            "Gagal mengambil data faktur realisasi deposit Accurate.",
          ),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    async loadTokoOptions() {
      this.loadingToko = true;
      try {
        const response = await api.get("/reference/toko");
        const raw = response.data?.data || response.data || [];

        this.tokoOptions = Array.isArray(raw)
          ? raw.map((item) => ({
              id: Number(item.id),
              nama:
                item.nama_toko ||
                item.nama ||
                item.nama_cabang ||
                item.text ||
                item.label ||
                `Toko ${item.id}`,
            }))
          : [];

        this.ensureActiveTokoOption();
      } catch (error) {
        this.tokoOptions = [];
        this.ensureActiveTokoOption();
      } finally {
        this.loadingToko = false;
      }
    },

    openConfirm(item) {
      this.selectedRow = item;
      this.confirmDialog = true;
    },

    async uploadSelected() {
      if (!this.selectedRow || this.uploading) return;

      this.uploading = true;
      this.uploadingKey = this.rowKey(this.selectedRow);

      try {
        const response =
          await accurateSettlementService.uploadDepositRealization({
            deposit_claim_id: this.selectedRow.deposit_claim_id,
          });

        this.showSnackbar(
          response?.message ||
            "Faktur realisasi deposit berhasil dikirim ke Accurate.",
          "success",
        );
        this.confirmDialog = false;
        this.selectedRow = null;
        await this.loadData();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(
            error,
            "Upload faktur realisasi deposit Accurate gagal.",
          ),
          "error",
        );
      } finally {
        this.uploading = false;
        this.uploadingKey = null;
      }
    },

    handleManualTokoChange(value) {
      if (this.activeTokoId) {
        this.filters.toko_id = this.activeTokoId;
        return;
      }

      this.filters.toko_id = value ? Number(value) : null;
      this.reload();
    },

    handleActiveTokoChanged() {
      const previousId = this.activeTokoId;
      this.syncActiveTokoFilter();
      this.ensureActiveTokoOption();

      if (Number(previousId || 0) !== Number(this.activeTokoId || 0)) {
        this.page = 1;
        this.loadData();
      }
    },

    syncActiveTokoFilter() {
      const activeToko = this.getActiveTokoFromStorage();

      this.activeTokoId = activeToko?.id ? Number(activeToko.id) : null;
      this.activeTokoName = activeToko?.nama || "";

      if (this.activeTokoId) {
        this.filters.toko_id = this.activeTokoId;
      }

      this.ensureActiveTokoOption();
    },

    ensureActiveTokoOption() {
      if (!this.activeTokoId) return;

      const exists = this.tokoOptions.some(
        (item) => Number(item.id) === Number(this.activeTokoId),
      );

      if (!exists) {
        this.tokoOptions.push({
          id: Number(this.activeTokoId),
          nama: this.activeTokoName || `Toko ${this.activeTokoId}`,
        });
      }
    },

    getEffectiveTokoId() {
      return this.activeTokoId || this.filters.toko_id || null;
    },

    getActiveTokoFromStorage() {
      const directId =
        this.normalizeStorageId(localStorage.getItem("selected_toko_id")) ||
        this.normalizeStorageId(localStorage.getItem("selected_cabang_id"));

      const objectKeys = [
        "selected_toko",
        "selected_cabang",
        "active_toko",
        "active_cabang",
      ];

      for (const key of objectKeys) {
        const parsed = this.parseStorageObject(key);
        if (parsed?.id) {
          return parsed;
        }
      }

      if (directId) {
        return {
          id: directId,
          nama: "",
        };
      }

      return null;
    },

    parseStorageObject(key) {
      try {
        const value = localStorage.getItem(key);
        if (!value) return null;

        const item = JSON.parse(value);
        const id = this.normalizeStorageId(
          item?.id || item?.toko_id || item?.cabang_id || item?.value,
        );

        if (!id) return null;

        return {
          id,
          nama:
            item?.nama_toko ||
            item?.nama ||
            item?.nama_cabang ||
            item?.text ||
            item?.label ||
            "",
        };
      } catch (error) {
        return null;
      }
    },

    normalizeStorageId(value) {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) && numberValue > 0
        ? numberValue
        : null;
    },

    isValidSettlementDate() {
      if (!this.filters.date) return true;
      return this.filters.date >= this.minSettlementDate;
    },

    addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },

    formatDateForInput(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    formatDisplayDate(value) {
      if (!value) return "-";
      const [year, month, day] = String(value).split("-");
      return `${day}/${month}/${year}`;
    },

    rowKey(item) {
      return `${item?.deposit_claim_id || ""}`;
    },

    formatCurrency(value) {
      const number = Number(value || 0);
      return `Rp. ${number.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    },

    getErrorMessage(error, fallback) {
      return (
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        fallback
      );
    },

    showSnackbar(message, color = "success") {
      this.snackbar = {
        show: true,
        color,
        message,
      };
    },
  },
};
</script>

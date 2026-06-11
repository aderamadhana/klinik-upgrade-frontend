<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div
      class="d-flex flex-column flex-md-row justify-space-between align-start ga-3 mb-5"
    >
      <div>
        <div class="text-h5 font-weight-bold text-high-emphasis">
          Settlement Accurate (Umum)
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Upload faktur penjualan harian transaksi umum ke Accurate berdasarkan
          invoice lunas.
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
              clearable
              :loading="loadingToko"
            />
          </v-col>

          <v-col cols="12" sm="8" md="4">
            <v-text-field
              v-model="filters.search"
              label="Cari"
              placeholder="Faktur, status, cabang, pengirim"
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

    <v-row dense class="mb-4">
      <v-col cols="12" md="4">
        <v-card variant="flat" border rounded="lg">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Total System</div>
            <div class="text-h6 font-weight-bold mt-1">
              {{ formatCurrency(summary.total_system) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="flat" border rounded="lg">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">
              Total Amount Uploaded
            </div>
            <div class="text-h6 font-weight-bold mt-1">
              {{ formatCurrency(summary.total_amount) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="flat" border rounded="lg">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Status</div>
            <div class="d-flex flex-wrap ga-2 mt-2">
              <v-chip size="small" color="success" variant="tonal">
                Success {{ summary.success_count || 0 }}
              </v-chip>
              <v-chip size="small" color="blue-grey" variant="tonal">
                Pending {{ summary.pending_count || 0 }}
              </v-chip>
              <v-chip size="small" color="error" variant="tonal">
                Failed {{ summary.failed_count || 0 }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
        <template #[`item.total_system`]="{ item }">
          <span
            :class="
              item.total_system > 0 && !item.can_upload
                ? ''
                : 'font-weight-medium'
            "
          >
            {{ formatCurrency(item.total_system) }}
          </span>
        </template>

        <template #[`item.total_amount`]="{ item }">
          <span>{{
            item.total_amount ? formatCurrency(item.total_amount) : "Rp. 0"
          }}</span>
        </template>

        <template #[`item.status_text`]="{ item }">
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-chip :color="item.status_color" size="x-small" variant="flat">
              {{ item.status_label }}
            </v-chip>
            <span class="text-body-2">
              {{ statusText(item) }}
            </span>
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
              Data settlement belum ada
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Ubah filter tanggal atau cabang untuk menampilkan data.
            </div>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="confirmDialog" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="font-weight-bold">
          Upload Faktur Umum ke Accurate
        </v-card-title>
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Data akan dikirim sebagai faktur penjualan harian. Proses ini tidak
            boleh diulang jika Accurate sudah berhasil menerima faktur.
          </div>

          <v-list density="compact" lines="two" border rounded>
            <v-list-item
              title="Tanggal Faktur"
              :subtitle="selectedRow?.tanggal_faktur || '-'"
            />
            <v-list-item
              title="Cabang"
              :subtitle="selectedRow?.toko_nama || '-'"
            />
            <v-list-item
              title="Total System"
              :subtitle="formatCurrency(selectedRow?.total_system || 0)"
            />
            <v-list-item
              title="Deskripsi"
              :subtitle="selectedRow?.deskripsi_data || '-'"
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
  name: "SettlementAccurateUmum",
  data() {
    return {
      loading: false,
      loadingToko: false,
      uploading: false,
      uploadingKey: null,
      confirmDialog: false,
      selectedRow: null,
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
      summary: {
        total_system: 0,
        total_amount: 0,
        success_count: 0,
        pending_count: 0,
        failed_count: 0,
      },
      snackbar: {
        show: false,
        color: "success",
        message: "",
      },
      headers: [
        { title: "Tanggal Faktur", key: "tanggal_faktur", minWidth: 130 },
        { title: "Faktur", key: "faktur", minWidth: 130 },
        {
          title: "Total System",
          key: "total_system",
          align: "end",
          minWidth: 150,
        },
        {
          title: "Total Amount",
          key: "total_amount",
          align: "end",
          minWidth: 150,
        },
        { title: "Tanggal Upload", key: "tanggal_upload", minWidth: 160 },
        { title: "Status", key: "status_text", sortable: false, minWidth: 280 },
        { title: "Deskripsi Data", key: "deskripsi_data", minWidth: 230 },
        { title: "Nama Pengirim", key: "nama_pengirim", minWidth: 150 },
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
  mounted() {
    this.loadTokoOptions();
    this.loadData();
  },
  methods: {
    loadOptions(options = {}) {
      if (options.page) this.page = options.page;
      if (options.itemsPerPage) this.perPage = options.itemsPerPage;
      this.loadData();
    },

    reload() {
      this.page = 1;
      this.loadData();
    },

    async loadData() {
      this.loading = true;
      try {
        const response = await accurateSettlementService.getUmum({
          date: this.filters.date || undefined,
          toko_id: this.filters.toko_id || undefined,
          search: this.filters.search || undefined,
          page: this.page,
          per_page: this.perPage,
        });

        this.items = response?.items || [];
        this.pagination = response?.pagination || this.pagination;
        this.summary = response?.summary || this.summary;
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(
            error,
            "Gagal mengambil data settlement Accurate.",
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
                item.text ||
                item.label ||
                `Toko ${item.id}`,
            }))
          : [];
      } catch (error) {
        this.tokoOptions = [];
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
        const response = await accurateSettlementService.uploadUmum({
          tanggal_faktur: this.selectedRow.tanggal_faktur,
          toko_id: this.selectedRow.toko_id,
        });

        this.showSnackbar(
          response?.message || "Faktur berhasil diupload ke Accurate.",
          "success",
        );
        this.confirmDialog = false;
        this.selectedRow = null;
        await this.loadData();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Upload faktur Accurate gagal."),
          "error",
        );
      } finally {
        this.uploading = false;
        this.uploadingKey = null;
      }
    },

    statusText(item) {
      if (!item) return "-";
      if (
        Number(item.status_code) === 1 &&
        item.faktur &&
        item.faktur !== "-"
      ) {
        return `Faktur Penjualan "${item.faktur}" berhasil disimpan`;
      }
      return item.status_text || "-";
    },

    rowKey(item) {
      return `${item?.tanggal_faktur || ""}-${item?.toko_id || ""}`;
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

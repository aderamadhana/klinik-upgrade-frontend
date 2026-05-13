<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Treatment</h1>
        <p class="page-subtitle">
          Kelola data treatment global dan konfigurasi per cabang
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title
        class="d-flex justify-space-between align-center flex-wrap ga-3"
      >
        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            prepend-icon="mdi-plus"
            color="success"
            :to="'/master/treatment-global/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari kode, nama treatment, kategori..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 320px"
          @keyup.enter="handleSearch"
          @click:clear="handleClearSearch"
        />
      </v-card-title>

      <v-card-text>
        <v-data-table-server
          :page="page"
          :items-per-page="itemsPerPage"
          :headers="headers"
          :items="treatmentsForTable"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          loading-text="Memuat data treatment..."
          no-data-text="Data treatment belum tersedia"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        >
          <template #loading>
            <v-skeleton-loader type="table-row@6" />
          </template>

          <template #item.no="{ index }">
            {{ rowNumber(index) }}
          </template>

          <template #item.kode="{ item }">
            <span class="font-weight-medium">
              {{ item.kode || "-" }}
            </span>
          </template>

          <template #item.nama="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.nama || "-" }}
              </div>

              <div
                v-if="item.kode_accurate && item.kode_accurate !== '-'"
                class="text-caption text-medium-emphasis"
              >
                Accurate: {{ item.kode_accurate }}
              </div>
            </div>
          </template>

          <template #item.kategori_sales="{ item }">
            <v-chip
              size="small"
              :color="getKategoriSalesColor(item.kategori_sales)"
              variant="tonal"
            >
              {{ item.kategori_sales || "-" }}
            </v-chip>
          </template>

          <template #item.durasi_label="{ item }">
            {{ item.durasi_label }}
          </template>

          <template #item.is_ppn_label="{ item }">
            <v-chip
              size="small"
              :color="Number(item.is_ppn || 0) === 1 ? 'success' : 'grey'"
              variant="tonal"
            >
              {{ item.is_ppn_label }}
            </v-chip>
          </template>

          <template #item.jumlah_cabang="{ item }">
            <v-chip size="small" color="info" variant="tonal">
              {{ item.jumlah_cabang }}
            </v-chip>
          </template>

          <template #item.range_tarif="{ item }">
            {{ item.range_tarif || "-" }}
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="Number(item.is_delete || 0) === 1 ? 'error' : 'success'"
              variant="tonal"
            >
              {{ Number(item.is_delete || 0) === 1 ? "Deleted" : "Aktif" }}
            </v-chip>
          </template>

          <template #item.action="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                color="primary"
                size="small"
                variant="tonal"
                prepend-icon="mdi-pencil"
                :to="'/master/treatment-global/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="info"
                size="small"
                variant="tonal"
                prepend-icon="mdi-eye"
                @click="detailTreatment(item)"
              >
                Detail
              </v-btn>

              <v-btn
                color="error"
                size="small"
                variant="tonal"
                prepend-icon="mdi-delete"
                @click="openDeleteDialog(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-6">
              <div class="text-subtitle-2 mb-1">
                Data treatment belum tersedia
              </div>

              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan treatment baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDetail" max-width="1100" scrollable>
      <v-card rounded="xl" class="detail-shell">
        <div class="detail-header">
          <div class="d-flex align-center ga-3">
            <v-avatar size="48" color="blue-lighten-4">
              <v-icon icon="mdi-stethoscope" color="primary" size="28" />
            </v-avatar>

            <div>
              <div class="detail-title">
                {{ selectedItem?.nama || "-" }}
              </div>
              <div class="detail-subtitle">
                Detail treatment global dan konfigurasi tarif per cabang
              </div>
            </div>
          </div>

          <div class="d-flex ga-2 flex-wrap">
            <v-chip size="small" color="blue" variant="tonal">
              {{ selectedItem?.kode || "-" }}
            </v-chip>

            <v-chip
              v-if="
                selectedItem?.kode_accurate &&
                selectedItem.kode_accurate !== '-'
              "
              size="small"
              color="indigo"
              variant="tonal"
            >
              Accurate: {{ selectedItem.kode_accurate }}
            </v-chip>

            <v-chip
              size="small"
              :color="
                Number(selectedItem?.is_delete || 0) === 1 ? 'error' : 'success'
              "
              variant="tonal"
            >
              {{
                Number(selectedItem?.is_delete || 0) === 1 ? "Deleted" : "Aktif"
              }}
            </v-chip>
          </div>
        </div>

        <v-divider />

        <v-card-text class="detail-body">
          <v-row class="mb-3">
            <v-col cols="12" md="3">
              <div class="summary-box summary-blue">
                <div class="summary-label">Jumlah Cabang</div>
                <div class="summary-value">
                  {{ selectedItem?.jumlah_cabang || 0 }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="summary-box summary-green">
                <div class="summary-label">Range Tarif</div>
                <div class="summary-value">
                  {{ selectedItem?.range_tarif || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="summary-box summary-blue">
                <div class="summary-label">PPN</div>
                <div>
                  <v-chip
                    size="x-small"
                    :color="
                      Number(selectedItem?.is_ppn || 0) === 1
                        ? 'success'
                        : 'grey'
                    "
                    variant="flat"
                  >
                    {{ selectedItem?.is_ppn_label || "-" }}
                  </v-chip>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div class="summary-box summary-cyan">
                <div class="summary-label">Durasi</div>
                <div class="summary-value">
                  {{ selectedItem?.durasi_label || "-" }}
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="info-card mb-5">
            <div class="section-heading">Informasi Treatment</div>

            <v-row>
              <v-col cols="12" md="4">
                <div class="info-box">
                  <div class="info-label">Kode Treatment</div>
                  <div class="info-value">{{ selectedItem?.kode || "-" }}</div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="info-box">
                  <div class="info-label">Kode Accurate</div>
                  <div class="info-value">
                    {{ selectedItem?.kode_accurate || "-" }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="info-box">
                  <div class="info-label">Nama Treatment</div>
                  <div class="info-value">{{ selectedItem?.nama || "-" }}</div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="info-box">
                  <div class="info-label">Kategori Sales</div>
                  <div class="info-value">
                    {{ selectedItem?.kategori_sales || "-" }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="info-box">
                  <div class="info-label">Unit</div>
                  <div class="info-value">
                    {{ selectedItem?.unit_nama || "-" }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="info-box">
                  <div class="info-label">Tipe Treatment</div>
                  <div class="info-value">
                    {{ selectedItem?.tipe_nama || "-" }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="info-box">
                  <div class="info-label">Durasi</div>
                  <div class="info-value">
                    {{ selectedItem?.durasi_label || "-" }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <div
            class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2"
          >
            <div>
              <div class="section-heading pa-0">Konfigurasi Per Cabang</div>
              <div class="text-body-2 text-medium-emphasis">
                Tarif, modal, insentif, dan status aktif di tiap cabang
              </div>
            </div>

            <v-chip color="blue" variant="tonal" size="small">
              {{ selectedItem?.toko_configs?.length || 0 }} cabang
            </v-chip>
          </div>

          <div class="table-card">
            <v-data-table
              :headers="detailHeaders"
              :items="selectedItem?.toko_configs || []"
              density="compact"
              item-value="id"
              no-data-text="Belum ada konfigurasi cabang"
            >
              <template #item.toko_nama="{ item }">
                <div class="font-weight-medium">
                  {{ item.toko_nama || "-" }}
                </div>
              </template>

              <template #item.tarif="{ item }">
                <span class="font-weight-bold text-success">
                  {{ formatRupiah(item.tarif) }}
                </span>
              </template>

              <template #item.harga_terendah="{ item }">
                {{ formatRupiah(item.harga_terendah) }}
              </template>

              <template #item.biaya_modal="{ item }">
                {{ formatRupiah(item.biaya_modal) }}
              </template>

              <template #item.tarif_dokter="{ item }">
                {{ formatRupiah(item.tarif_dokter) }}
              </template>

              <template #item.tarif_beautician="{ item }">
                {{ formatRupiah(item.tarif_beautician) }}
              </template>

              <template #item.insentif_use="{ item }">
                <v-chip size="small" color="teal" variant="tonal">
                  {{ item.insentif_use || "-" }}
                </v-chip>
              </template>

              <template #item.status="{ item }">
                <v-chip
                  size="small"
                  :color="
                    Number(item.is_active || 0) === 1 ? 'success' : 'error'
                  "
                  variant="tonal"
                >
                  {{ Number(item.is_active || 0) === 1 ? "Aktif" : "Nonaktif" }}
                </v-chip>
              </template>
            </v-data-table>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            prepend-icon="mdi-close"
            @click="dialogDetail = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Hapus Treatment
        </v-card-title>

        <v-divider />

        <v-card-text>
          <p class="mb-2">Yakin ingin menghapus treatment ini?</p>

          <v-alert type="warning" variant="tonal" rounded="lg">
            <strong>{{ selectedItem?.nama || "-" }}</strong>
            <br />
            Data akan dihapus secara soft delete.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            :disabled="loadingDelete"
            @click="deleteDialog = false"
          >
            Batal
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="loadingDelete"
            :disabled="loadingDelete"
            @click="deleteTreatment"
          >
            Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import treatmentService from "@/services/master/treatmentService";

export default {
  name: "AllMasterTreatment",

  data() {
    return {
      search: "",
      loading: false,
      loadingDelete: false,
      dialogDetail: false,
      deleteDialog: false,
      selectedItem: null,

      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      fetchTimer: null,

      itemsPerPageOptions: [
        { value: 10, title: "10" },
        { value: 25, title: "25" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
      ],

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Treatment", disabled: false, to: "/master/treatment-global" },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "KODE", key: "kode" },
        { title: "NAMA TREATMENT", key: "nama" },
        { title: "KATEGORI", key: "kategori_sales" },
        { title: "DURASI", key: "durasi_label" },
        { title: "PPN", key: "is_ppn_label" },
        { title: "CABANG", key: "jumlah_cabang", sortable: false },
        { title: "RANGE TARIF", key: "range_tarif", sortable: false },
        { title: "STATUS", key: "status", sortable: false },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
      ],

      detailHeaders: [
        { title: "Cabang", key: "toko_nama" },
        { title: "Tarif", key: "tarif" },
        { title: "Harga Terendah", key: "harga_terendah" },
        { title: "Biaya Modal", key: "biaya_modal" },
        { title: "Tarif Dokter", key: "tarif_dokter" },
        { title: "Tarif Beautician", key: "tarif_beautician" },
        { title: "Insentif", key: "insentif_use" },
        { title: "Status", key: "status", sortable: false },
      ],

      treatments: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    treatmentsForTable() {
      return this.treatments.map((item) => this.mapTreatmentForTable(item));
    },
  },

  mounted() {
    this.fetchTreatments();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchTreatments() {
      this.loading = true;

      try {
        const response = await treatmentService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.treatments = rows;
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.treatments = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data treatment"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchTreatments() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchTreatments();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchTreatments();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchTreatments();
    },

    handleSearch() {
      this.page = 1;
      this.fetchTreatments();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchTreatments();
    },

    extractRows(response) {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.items)) return response.items;

      return [];
    },

    extractMeta(response) {
      if (response?.meta) return response.meta;
      if (response?.data?.meta) return response.data.meta;

      if (
        response?.current_page ||
        response?.per_page ||
        response?.total ||
        response?.last_page
      ) {
        return {
          current_page: response.current_page,
          per_page: response.per_page,
          total: response.total,
          last_page: response.last_page,
        };
      }

      if (
        response?.data?.current_page ||
        response?.data?.per_page ||
        response?.data?.total ||
        response?.data?.last_page
      ) {
        return {
          current_page: response.data.current_page,
          per_page: response.data.per_page,
          total: response.data.total,
          last_page: response.data.last_page,
        };
      }

      return {
        current_page: this.page,
        per_page: this.itemsPerPage,
        total: 0,
        last_page: 1,
      };
    },

    mapTreatmentForTable(item) {
      const configs = this.getHargaTokoList(item);
      const activeConfigs = configs.filter(
        (config) => Number(config.is_delete || 0) === 0,
      );

      const tarifList = activeConfigs
        .map((config) => Number(config.tarif || 0))
        .filter((tarif) => tarif >= 0);

      const minTarif = tarifList.length ? Math.min(...tarifList) : 0;
      const maxTarif = tarifList.length ? Math.max(...tarifList) : 0;

      return {
        id: item.id,
        legacy_id: item.legacy_id ?? null,
        kode: item.kode ?? "-",
        kode_accurate: item.kode_accurate ?? "-",
        nama: item.nama ?? "-",
        kategori_sales: item.kategori_sales ?? "-",
        unit_nama: this.getRelationName(
          item.unit,
          "nama_unit_treatment",
          "nama",
        ),
        tipe_nama: this.getRelationName(
          item.tipe,
          "nama_tipe_treatment",
          "nama",
        ),
        waktu: Number(item.waktu || 0),
        durasi_label: `${Number(item.waktu || 0)} menit`,
        is_ppn: item.is_ppn ?? 0,
        is_ppn_label: Number(item.is_ppn || 0) === 1 ? "Ya" : "Tidak",
        is_delete: item.is_delete ?? 0,

        jumlah_cabang: activeConfigs.length,
        range_tarif: activeConfigs.length
          ? minTarif === maxTarif
            ? this.formatRupiah(minTarif)
            : `${this.formatRupiah(minTarif)} - ${this.formatRupiah(maxTarif)}`
          : "-",

        raw: item,
      };
    },

    getHargaTokoList(item) {
      const relation =
        item.harga_toko ||
        item.hargaToko ||
        item.toko_configs ||
        item.toko_mapping ||
        item.toko ||
        [];

      return Array.isArray(relation) ? relation : [];
    },

    getRelationName(relation, primaryKey, fallbackKey = null) {
      if (!relation) return "-";

      return (
        relation?.[primaryKey] ||
        (fallbackKey ? relation?.[fallbackKey] : null) ||
        relation?.nama ||
        relation?.label ||
        "-"
      );
    },

    rowNumber(index) {
      return (Number(this.page) - 1) * Number(this.itemsPerPage) + index + 1;
    },

    getKategoriSalesColor(value) {
      const normalized = String(value || "").toLowerCase();

      const map = {
        low: "success",
        medium: "warning",
        high: "error",
      };

      return map[normalized] || "secondary";
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    detailTreatment(item) {
      const raw = item.raw || item;

      const configs = this.getHargaTokoList(raw)
        .filter((config) => Number(config.is_delete || 0) === 0)
        .map((config) => ({
          id: config.id,
          toko_id: config.toko_id,
          toko_nama:
            config.toko?.nama_toko ||
            config.toko?.nama ||
            config.toko_nama ||
            "-",

          harga_terendah: Number(config.harga_terendah || 0),
          tarif: Number(config.tarif || 0),
          biaya_modal: Number(config.biaya_modal || 0),

          tarif_dokter: Number(config.tarif_dokter || 0),
          tarif_beautician: Number(config.tarif_beautician || 0),

          presentase_tarif_dokter: Number(config.presentase_tarif_dokter || 0),
          presentase_tarif_dokter_sp: Number(
            config.presentase_tarif_dokter_sp || 0,
          ),

          flat_tarif_dokter: Number(config.flat_tarif_dokter || 0),
          flat_tarif_dokter_sp: Number(config.flat_tarif_dokter_sp || 0),

          insentif_use: config.insentif_use || "-",
          insentif_use_sp: config.insentif_use_sp || "-",

          is_active: config.is_active ?? 1,
        }));

      this.selectedItem = {
        ...item,
        toko_configs: configs,
      };

      this.dialogDetail = true;
    },

    openDeleteDialog(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteTreatment() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data treatment tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await treatmentService.delete(this.selectedItem.id);

        this.showSnackbar("Data treatment berhasil dihapus", "success");

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchTreatments();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data treatment"),
          "error",
        );
      } finally {
        this.loadingDelete = false;
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },

    getErrorMessage(error, fallbackMessage) {
      const response = error?.response?.data;

      if (response?.message) return response.message;
      if (response?.error) return response.error;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];

        if (firstKey && Array.isArray(response.errors[firstKey])) {
          return response.errors[firstKey][0];
        }
      }

      return fallbackMessage;
    },
  },
};
</script>

<style scoped>
.treatment-detail-dialog {
  overflow: hidden;
}

.treatment-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  flex-wrap: wrap;
  background: #ffffff;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  padding: 14px 16px 4px;
}

.info-item {
  min-height: 76px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.info-value {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  word-break: break-word;
}

.summary-card {
  height: calc(100% - 16px);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

:deep(.v-data-table thead th) {
  font-weight: 700 !important;
  color: #374151 !important;
  background: #fafafa !important;
}

:deep(.v-data-table tbody td) {
  font-size: 13px;
}
.detail-shell {
  overflow: hidden;
  background: #ffffff;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  flex-wrap: wrap;
  background: #f7fcff;
}

.detail-title {
  font-size: 22px;
  font-weight: 800;
  color: #202124;
  line-height: 1.2;
}

.detail-subtitle {
  font-size: 20px;
  color: #5f6368;
  line-height: 1.25;
}

.detail-body {
  padding: 20px;
}

.summary-box {
  min-height: 78px;
  border-radius: 8px;
  padding: 16px;
}

.summary-blue {
  background: #e8f3ff;
}

.summary-green {
  background: #eaf7ec;
}

.summary-cyan {
  background: #e9f7f8;
}

.summary-label {
  font-size: 12px;
  color: #3b82f6;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.summary-green .summary-value {
  color: #35a853;
}

.summary-cyan .summary-value {
  color: #38a3a5;
}

.info-card {
  border: 1px solid #222;
  border-radius: 8px;
  padding: 10px 16px 16px;
}

.section-heading {
  font-size: 20px;
  font-weight: 800;
  color: #222;
  padding-bottom: 8px;
}

.info-box {
  min-height: 68px;
  border: 1px solid #e0e4ea;
  border-radius: 10px;
  padding: 12px 14px;
  background: #ffffff;
}

.info-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.info-value {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  word-break: break-word;
}

.table-card {
  border: 1px solid #222;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-data-table thead th) {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #2b2b2b !important;
  background: #ffffff !important;
}

:deep(.v-data-table tbody td) {
  font-size: 14px !important;
}

:deep(.v-data-table-footer) {
  border-top: 1px solid #e5e7eb;
}
</style>

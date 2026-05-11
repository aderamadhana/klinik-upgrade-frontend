<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Master Produk</h1>
        <p class="page-subtitle">
          Kelola data produk global dan konfigurasi produk per cabang
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
            :to="'/master/product-global/add'"
          >
            Entry Data
          </v-btn>
        </div>

        <v-text-field
          v-model="search"
          placeholder="Cari kode, nama produk, kategori..."
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
          :items="produkForTable"
          :items-length="totalItems"
          :loading="loading"
          :items-per-page-options="itemsPerPageOptions"
          item-value="id"
          density="compact"
          loading-text="Memuat data produk..."
          no-data-text="Data produk belum tersedia"
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

          <template #item.kode_accurate="{ item }">
            {{ item.kode_accurate || "-" }}
          </template>

          <template #item.nama="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ item.nama || "-" }}
              </div>

              <div
                v-if="item.tempat_nama && item.tempat_nama !== '-'"
                class="text-caption text-medium-emphasis"
              >
                {{ item.tempat_nama }}
              </div>
            </div>
          </template>

          <template #item.kategori_produk_nama="{ item }">
            {{ item.kategori_produk_nama || "-" }}
          </template>

          <template #item.golongan_produk_nama="{ item }">
            {{ item.golongan_produk_nama || "-" }}
          </template>

          <template #item.satuan_nama="{ item }">
            {{ item.satuan_nama || "-" }}
          </template>

          <template #item.jenis_obat="{ item }">
            <div class="d-flex ga-1 flex-wrap">
              <v-chip
                v-if="Number(item.is_obat_resep || 0) === 1"
                size="small"
                color="primary"
                variant="tonal"
              >
                Resep
              </v-chip>

              <v-chip
                v-if="Number(item.is_obat_bebas || 0) === 1"
                size="small"
                color="success"
                variant="tonal"
              >
                Bebas
              </v-chip>

              <span
                v-if="
                  Number(item.is_obat_resep || 0) !== 1 &&
                  Number(item.is_obat_bebas || 0) !== 1
                "
              >
                -
              </span>
            </div>
          </template>

          <template #item.jumlah_cabang="{ item }">
            <v-chip size="small" color="info" variant="tonal">
              {{ item.jumlah_cabang }}
            </v-chip>
          </template>

          <template #item.range_harga="{ item }">
            {{ item.range_harga || "-" }}
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
                :to="'/master/product-global/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="info"
                size="small"
                variant="tonal"
                prepend-icon="mdi-eye"
                @click="detailProduk(item)"
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
              <div class="text-subtitle-2 mb-1">Data produk belum tersedia</div>

              <div class="text-body-2 text-medium-emphasis">
                Klik Entry Data untuk menambahkan produk baru.
              </div>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDetail" max-width="1100" scrollable>
      <v-card rounded="xl" class="detail-dialog-card">
        <v-card-title class="pa-0">
          <div class="detail-hero">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="tonal" size="48">
                <v-icon icon="mdi-package-variant-closed" size="28" />
              </v-avatar>

              <div>
                <div class="text-h6 font-weight-bold">
                  {{ selectedItem?.nama || "-" }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Detail produk global dan konfigurasi harga per cabang
                </div>
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap">
              <v-chip size="small" color="primary" variant="tonal">
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
                  Number(selectedItem?.is_delete || 0) === 1
                    ? 'error'
                    : 'success'
                "
                variant="tonal"
              >
                {{
                  Number(selectedItem?.is_delete || 0) === 1
                    ? "Deleted"
                    : "Aktif"
                }}
              </v-chip>
            </div>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <v-row class="mb-2">
            <v-col cols="12" md="3">
              <v-card variant="tonal" color="primary" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="detail-mini-label">Jumlah Cabang</div>
                  <div class="detail-mini-value">
                    {{ selectedItem?.jumlah_cabang || 0 }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card variant="tonal" color="success" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="detail-mini-label">Range Harga</div>
                  <div class="detail-mini-value text-truncate">
                    {{ selectedItem?.range_harga || "-" }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card variant="tonal" color="info" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="detail-mini-label">Jenis Obat</div>
                  <div class="d-flex ga-1 flex-wrap mt-1">
                    <v-chip
                      v-if="Number(selectedItem?.is_obat_resep || 0) === 1"
                      size="x-small"
                      color="primary"
                      variant="flat"
                    >
                      Resep
                    </v-chip>

                    <v-chip
                      v-if="Number(selectedItem?.is_obat_bebas || 0) === 1"
                      size="x-small"
                      color="success"
                      variant="flat"
                    >
                      Bebas
                    </v-chip>

                    <span
                      v-if="
                        Number(selectedItem?.is_obat_resep || 0) !== 1 &&
                        Number(selectedItem?.is_obat_bebas || 0) !== 1
                      "
                      class="detail-mini-value"
                    >
                      -
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card variant="tonal" color="secondary" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="detail-mini-label">Satuan</div>
                  <div class="detail-mini-value">
                    {{ selectedItem?.satuan_nama || "-" }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-card variant="outlined" rounded="lg" class="mb-5">
            <v-card-title class="text-subtitle-1 font-weight-bold pb-1">
              Informasi Produk
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="detail-field">
                    <div class="detail-label">Kode Produk</div>
                    <div class="detail-value">
                      {{ selectedItem?.kode || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <div class="detail-field">
                    <div class="detail-label">Kode Accurate</div>
                    <div class="detail-value">
                      {{ selectedItem?.kode_accurate || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <div class="detail-field">
                    <div class="detail-label">Nama Produk</div>
                    <div class="detail-value">
                      {{ selectedItem?.nama || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="3">
                  <div class="detail-field">
                    <div class="detail-label">Kategori</div>
                    <div class="detail-value">
                      {{ selectedItem?.kategori_produk_nama || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="3">
                  <div class="detail-field">
                    <div class="detail-label">Golongan</div>
                    <div class="detail-value">
                      {{ selectedItem?.golongan_produk_nama || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="3">
                  <div class="detail-field">
                    <div class="detail-label">Tempat Produk</div>
                    <div class="detail-value">
                      {{ selectedItem?.tempat_nama || "-" }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="3">
                  <div class="detail-field">
                    <div class="detail-label">Satuan</div>
                    <div class="detail-value">
                      {{ selectedItem?.satuan_nama || "-" }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <div
            class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2"
          >
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Konfigurasi Per Cabang
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Harga, supplier, stok, dan fee yang berlaku di tiap cabang
              </div>
            </div>

            <v-chip color="info" variant="tonal" size="small">
              {{ selectedItem?.toko_configs?.length || 0 }} cabang
            </v-chip>
          </div>

          <v-card variant="outlined" rounded="lg">
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

              <template #item.supplier_nama="{ item }">
                <v-chip size="small" color="secondary" variant="tonal">
                  {{ item.supplier_nama || "-" }}
                </v-chip>
              </template>

              <template #item.harga_jual="{ item }">
                <span class="font-weight-bold text-success">
                  {{ formatRupiah(item.harga_jual) }}
                </span>
              </template>

              <template #item.harga_beli="{ item }">
                {{ formatRupiah(item.harga_beli) }}
              </template>

              <template #item.stok_awal="{ item }">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ formatNumber(item.stok_awal) }}
                </v-chip>
              </template>

              <template #item.stok_minimum="{ item }">
                <v-chip
                  size="small"
                  :color="
                    Number(item.stok_minimum || 0) > 0 ? 'warning' : 'grey'
                  "
                  variant="tonal"
                >
                  {{ formatNumber(item.stok_minimum) }}
                </v-chip>
              </template>

              <template #item.fee_dokter="{ item }">
                {{ formatRupiah(item.fee_dokter) }}
              </template>

              <template #item.fee_beautician="{ item }">
                {{ formatRupiah(item.fee_beautician) }}
              </template>
            </v-data-table>
          </v-card>
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
          Hapus Produk
        </v-card-title>

        <v-divider />

        <v-card-text>
          <p class="mb-2">Yakin ingin menghapus produk ini?</p>

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
            @click="deleteProduk"
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
import produkService from "@/services/master/produkService";

export default {
  name: "AllProduk",

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
        {
          title: "Produk",
          disabled: false,
          to: "/master/product-global",
        },
      ],

      headers: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "KODE", key: "kode" },
        { title: "KODE ACCURATE", key: "kode_accurate" },
        { title: "NAMA PRODUK", key: "nama" },
        { title: "KATEGORI", key: "kategori_produk_nama" },
        { title: "GOLONGAN", key: "golongan_produk_nama" },
        { title: "SATUAN", key: "satuan_nama" },
        { title: "JENIS OBAT", key: "jenis_obat", sortable: false },
        { title: "CABANG", key: "jumlah_cabang", sortable: false },
        { title: "RANGE HARGA", key: "range_harga", sortable: false },
        { title: "STATUS", key: "status", sortable: false },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
      ],

      detailHeaders: [
        { title: "Cabang", key: "toko_nama" },
        { title: "Supplier", key: "supplier_nama" },
        { title: "Harga Jual", key: "harga_jual" },
        { title: "Harga Beli", key: "harga_beli" },
        { title: "Stok Awal", key: "stok_awal" },
        { title: "Stok Minimum", key: "stok_minimum" },
        { title: "Fee Dokter", key: "fee_dokter" },
        { title: "Fee Beautician", key: "fee_beautician" },
      ],

      produk: [],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    produkForTable() {
      return this.produk.map((item) => this.mapProdukForTable(item));
    },
  },

  mounted() {
    this.fetchProduk();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    async fetchProduk() {
      this.loading = true;

      try {
        const response = await produkService.getAll({
          search: this.search || "",
          page: this.page,
          per_page: this.itemsPerPage,
        });

        const rows = this.extractRows(response);
        const meta = this.extractMeta(response);

        this.produk = rows;
        this.totalItems = Number(meta.total || rows.length || 0);

        if (meta.current_page) {
          this.page = Number(meta.current_page);
        }

        if (meta.per_page) {
          this.itemsPerPage = Number(meta.per_page);
        }
      } catch (error) {
        console.error(error);

        this.produk = [];
        this.totalItems = 0;

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data produk"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    queueFetchProduk() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchProduk();
      }, 100);
    },

    handlePageChange(value) {
      this.page = Number(value || 1);
      this.queueFetchProduk();
    },

    handleItemsPerPageChange(value) {
      this.itemsPerPage = Number(value || 10);
      this.page = 1;
      this.queueFetchProduk();
    },

    handleSearch() {
      this.page = 1;
      this.fetchProduk();
    },

    handleClearSearch() {
      this.search = "";
      this.page = 1;
      this.fetchProduk();
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

    mapProdukForTable(item) {
      const tokoConfigs = this.getHargaTokoList(item);

      const hargaList = tokoConfigs
        .map((config) => Number(config.harga_jual || 0))
        .filter((harga) => harga >= 0);

      const minHarga = hargaList.length ? Math.min(...hargaList) : 0;
      const maxHarga = hargaList.length ? Math.max(...hargaList) : 0;

      return {
        id: item.id,
        legacy_id: item.legacy_id ?? null,
        kode: item.kode ?? "-",
        kode_accurate: item.kode_accurate ?? "-",
        nama: item.nama ?? "-",

        tempat_nama: this.getRelationName(
          item.tempat_produk || item.tempatProduk,
          "nama_tempat_produk",
        ),
        satuan_nama: this.getRelationName(item.satuan, "nama", "nama_satuan"),
        kategori_produk_nama: this.getRelationName(
          item.kategori,
          "nama_kategori_produk",
        ),
        golongan_produk_nama: this.getRelationName(
          item.golongan,
          "nama_golongan_produk",
        ),

        is_obat_resep: item.is_obat_resep ?? 0,
        is_obat_bebas: item.is_obat_bebas ?? 0,
        is_delete: item.is_delete ?? 0,

        jumlah_cabang: tokoConfigs.length,
        range_harga: tokoConfigs.length
          ? minHarga === maxHarga
            ? this.formatRupiah(minHarga)
            : `${this.formatRupiah(minHarga)} - ${this.formatRupiah(maxHarga)}`
          : "-",

        raw: item,
      };
    },

    getHargaTokoList(item) {
      const relation =
        item.harga_toko ||
        item.hargaToko ||
        item.toko_configs ||
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

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    detailProduk(item) {
      const raw = item.raw || item;

      const configs = this.getHargaTokoList(raw).map((config) => ({
        id: config.id,
        toko_id: config.toko_id,
        toko_nama:
          config.toko?.nama_toko ||
          config.toko?.nama ||
          config.toko_nama ||
          "-",

        supplier_id: config.supplier_id,
        supplier_nama:
          config.supplier?.nama ||
          config.supplier?.nama_supplier ||
          config.supplier?.nama_suplier ||
          config.supplier_nama ||
          "-",

        harga_jual: Number(config.harga_jual || 0),
        harga_beli: Number(config.harga_beli || 0),
        stok_awal: Number(config.stok_awal || 0),
        stok_minimum: Number(config.stok_minimum || 0),
        fee_dokter: Number(config.fee_dokter || 0),
        fee_beautician: Number(config.fee_beautician || 0),
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

    async deleteProduk() {
      if (!this.selectedItem?.id) {
        this.showSnackbar("Data produk tidak valid", "error");
        return;
      }

      this.loadingDelete = true;

      try {
        await produkService.delete(this.selectedItem.id);

        this.showSnackbar("Data produk berhasil dihapus", "success");

        this.deleteDialog = false;
        this.selectedItem = null;

        await this.fetchProduk();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menghapus data produk"),
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
.detail-dialog-card {
  overflow: hidden;
}

.detail-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px;
  flex-wrap: wrap;
  background: linear-gradient(
    135deg,
    rgba(25, 118, 210, 0.08),
    rgba(76, 175, 80, 0.06)
  );
}

.detail-field {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  height: 100%;
  background: #ffffff;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
}

.detail-mini-label {
  font-size: 12px;
  opacity: 0.78;
  margin-bottom: 4px;
}

.detail-mini-value {
  font-size: 18px;
  font-weight: 700;
}
</style>

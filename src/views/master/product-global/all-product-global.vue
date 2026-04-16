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
          placeholder="Cari produk..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 260px"
        />
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="produkForTable"
          :search="search"
          item-value="id"
          density="compact"
        >
          <template v-slot:item.jenis_obat="{ item }">
            <div class="d-flex ga-1 flex-wrap">
              <v-chip
                v-if="item.is_obat_resep"
                size="small"
                color="primary"
                variant="tonal"
              >
                Resep
              </v-chip>

              <v-chip
                v-if="item.is_obat_bebas"
                size="small"
                color="success"
                variant="tonal"
              >
                Bebas
              </v-chip>

              <span v-if="!item.is_obat_resep && !item.is_obat_bebas">-</span>
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              size="small"
              :color="item.is_delete ? 'error' : 'success'"
              variant="tonal"
            >
              {{ item.is_delete ? "Deleted" : "Aktif" }}
            </v-chip>
          </template>

          <template v-slot:item.action="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                :to="'/master/product-global/edit/' + item.id"
              >
                Edit
              </v-btn>

              <v-btn
                color="info"
                size="small"
                prepend-icon="mdi-eye"
                @click="detailProduk(item)"
              >
                Detail
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDetail" max-width="900">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Detail Produk
        </v-card-title>

        <v-divider />

        <v-card-text>
          <pre class="mb-0">{{ formattedDetail }}</pre>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="dialogDetail = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "AllProduk",

  data() {
    return {
      search: "",
      dialogDetail: false,
      selectedItem: null,

      breadcrumbs: [
        { title: "Master", disabled: true },
        {
          title: "Produk ",
          disabled: false,
          to: "/master/product-global",
        },
      ],

      tokoOptions: [
        { id: 1, nama: "Malang" },
        { id: 2, nama: "Surabaya" },
        { id: 3, nama: "Bandung" },
        { id: 4, nama: "Sidoarjo" },
        { id: 5, nama: "Bekasi" },
        { id: 6, nama: "Medan" },
        { id: 7, nama: "Depok" },
        { id: 8, nama: "Yogyakarta" },
        { id: 9, nama: "Jakarta" },
      ],

      supplierOptions: [
        { id: 1, nama: "PT Maju Jaya" },
        { id: 2, nama: "CV Sumber Rejeki" },
        { id: 3, nama: "PT Berkah Abadi" },
      ],

      tempatOptions: [
        { id: 1, nama: "Gudang Klinik" },
        { id: 2, nama: "Apotek" },
        { id: 3, nama: "Display FO" },
      ],

      satuanOptions: [
        { id: 1, nama: "Pcs" },
        { id: 2, nama: "Botol" },
        { id: 3, nama: "Tube" },
        { id: 4, nama: "Box" },
      ],

      kategoriProdukOptions: [
        { id: 1, nama: "Skincare" },
        { id: 2, nama: "Obat" },
        { id: 3, nama: "Bahan Treatment" },
      ],

      golonganProdukOptions: [
        { id: 1, nama: "Basic" },
        { id: 2, nama: "Premium" },
        { id: 3, nama: "Medical" },
      ],

      headers: [
        { title: "KODE", key: "kode" },
        { title: "KODE ACCURATE", key: "kode_accurate" },
        { title: "NAMA PRODUK", key: "nama" },
        { title: "KATEGORI", key: "kategori_produk_nama" },
        { title: "GOLONGAN", key: "golongan_produk_nama" },
        { title: "SATUAN", key: "satuan_nama" },
        { title: "JENIS OBAT", key: "jenis_obat", sortable: false },
        { title: "CABANG", key: "jumlah_cabang" },
        { title: "RANGE HARGA", key: "range_harga" },
        { title: "STATUS", key: "status" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      produk: [
        {
          id: 1,
          legacy_id: 101,
          kode: "PRD001",
          kode_accurate: "PRD001",
          nama: "ACNE NIGHT CREAM",
          tempat_id: 1,
          satuan_id: 3,
          kategori_produk_id: 1,
          golongan_produk_id: 2,
          is_obat_resep: 0,
          is_obat_bebas: 1,
          is_delete: 0,
          sort_order: 1,
          toko_configs: [
            {
              id: 1,
              toko_id: 1,
              supplier_id: 1,
              harga_jual: 150000,
              harga_beli: 80000,
              stok_awal: 20,
              stok_minimum: 5,
              fee_dokter: 10000,
              fee_beautician: 5000,
              is_delete: 0,
              sort_order: 1,
            },
            {
              id: 2,
              toko_id: 2,
              supplier_id: 2,
              harga_jual: 165000,
              harga_beli: 85000,
              stok_awal: 15,
              stok_minimum: 5,
              fee_dokter: 10000,
              fee_beautician: 5000,
              is_delete: 0,
              sort_order: 2,
            },
          ],
        },
        {
          id: 2,
          legacy_id: 102,
          kode: "PRD002",
          kode_accurate: "PRD002",
          nama: "FACIAL WASH PREMIUM",
          tempat_id: 2,
          satuan_id: 2,
          kategori_produk_id: 1,
          golongan_produk_id: 2,
          is_obat_resep: 0,
          is_obat_bebas: 1,
          is_delete: 0,
          sort_order: 2,
          toko_configs: [
            {
              id: 3,
              toko_id: 1,
              supplier_id: 1,
              harga_jual: 120000,
              harga_beli: 65000,
              stok_awal: 30,
              stok_minimum: 8,
              fee_dokter: 0,
              fee_beautician: 3000,
              is_delete: 0,
              sort_order: 1,
            },
          ],
        },
      ],
    };
  },

  computed: {
    produkForTable() {
      return this.produk.map((item) => {
        const activeConfigs = item.toko_configs.filter(
          (config) => Number(config.is_delete) === 0,
        );

        const hargaList = activeConfigs.map((config) =>
          Number(config.harga_jual || 0),
        );

        const minHarga = hargaList.length ? Math.min(...hargaList) : 0;
        const maxHarga = hargaList.length ? Math.max(...hargaList) : 0;

        return {
          ...item,
          tempat_nama: this.getOptionName(this.tempatOptions, item.tempat_id),
          satuan_nama: this.getOptionName(this.satuanOptions, item.satuan_id),
          kategori_produk_nama: this.getOptionName(
            this.kategoriProdukOptions,
            item.kategori_produk_id,
          ),
          golongan_produk_nama: this.getOptionName(
            this.golonganProdukOptions,
            item.golongan_produk_id,
          ),
          jumlah_cabang: activeConfigs.length,
          range_harga:
            minHarga === maxHarga
              ? this.formatRupiah(minHarga)
              : `${this.formatRupiah(minHarga)} - ${this.formatRupiah(maxHarga)}`,
        };
      });
    },

    formattedDetail() {
      return JSON.stringify(this.selectedItem, null, 2);
    },
  },

  methods: {
    getOptionName(options, id) {
      const item = options.find((row) => Number(row.id) === Number(id));
      return item ? item.nama : "-";
    },

    getTokoName(tokoId) {
      return this.getOptionName(this.tokoOptions, tokoId);
    },

    getSupplierName(supplierId) {
      return this.getOptionName(this.supplierOptions, supplierId);
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    detailProduk(item) {
      this.selectedItem = {
        ...item,
        toko_configs: item.toko_configs.map((config) => ({
          ...config,
          toko_nama: this.getTokoName(config.toko_id),
          supplier_nama: this.getSupplierName(config.supplier_id),
        })),
      };

      this.dialogDetail = true;
    },
  },
};
</script>

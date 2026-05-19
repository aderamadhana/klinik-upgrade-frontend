<template>
  <div class="mt-3">
    <div class="section-head mb-4">
      <div>
        <div class="section-title">Penjualan</div>
        <div class="section-subtitle">
          Tambahkan produk atau obat yang dijual ke pasien
        </div>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-plus"
        :disabled="!activeTokoId"
        @click="addItem"
      >
        Tambah Produk
      </v-btn>
    </div>

    <v-alert
      v-if="!activeTokoId"
      type="warning"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-4"
    >
      Cabang belum terpilih. Data produk akan muncul setelah cabang aktif
      tersedia.
    </v-alert>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <div
      v-for="(item, index) in penjualanItems"
      :key="item.__key || `penjualan-${index}`"
      class="item-box mb-4"
    >
      <v-row density="comfortable">
        <v-col cols="12" md="4">
          <v-autocomplete
            :model-value="item.produk_id"
            :items="produkOptions"
            item-title="text"
            item-value="id"
            label="Produk"
            :placeholder="
              activeTokoId
                ? 'Cari / pilih produk'
                : 'Pilih cabang terlebih dahulu'
            "
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-pill"
            :loading="loadingProduk"
            :disabled="!activeTokoId"
            clearable
            hide-details="auto"
            menu-icon="mdi-chevron-down"
            @update:modelValue="onProdukChange(index, $event)"
          >
            <template #message>
              Data produk difilter berdasarkan cabang aktif.
            </template>

            <template #no-data>
              <div class="pa-4 text-body-2 text-medium-emphasis">
                Tidak ada produk pada cabang aktif.
              </div>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            :model-value="formatRupiah(item.harga)"
            label="Harga"
            variant="outlined"
            density="comfortable"
            readonly
            hide-details="auto"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            :model-value="item.jumlah"
            label="Qty"
            type="number"
            min="1"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            @update:modelValue="updateItem(index, 'jumlah', toNumber($event))"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            :model-value="formatRupiah(getItemSubtotal(item))"
            label="Subtotal"
            readonly
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="12" md="1" class="d-flex justify-end align-center">
          <v-btn
            color="error"
            variant="text"
            prepend-icon="mdi-delete"
            :disabled="penjualanItems.length === 1"
            @click="removeItem(index)"
          >
            Hapus
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div class="total-box">
      <div class="total-box__label">Total Penjualan</div>
      <div class="total-box__value">
        Rp {{ formatNumberSafe(displayTotalPenjualan) }}
      </div>
    </div>
  </div>
</template>

<script>
import referenceService from "@/services/referenceService";

export default {
  name: "PenjualanSection",

  props: {
    form: {
      type: Object,
      required: true,
    },
    obatList: {
      type: Array,
      default: () => [],
    },
    totalPenjualan: {
      type: Number,
      default: 0,
    },
    formatNumber: {
      type: Function,
      default: null,
    },
    getSubtotal: {
      type: Function,
      default: null,
    },
  },

  emits: ["update-field", "update-item"],

  data() {
    return {
      loadingProduk: false,
      errorMessage: "",
      apiProdukList: [],
      fetchTimer: null,
    };
  },

  computed: {
    activeTokoId() {
      return (
        this.form?.toko_id ||
        this.form?.tokoId ||
        localStorage.getItem("selected_toko_id") ||
        null
      );
    },

    penjualanItems() {
      return this.form?.penjualan?.items || [];
    },

    rawProdukList() {
      return this.apiProdukList.length ? this.apiProdukList : this.obatList;
    },

    produkOptions() {
      return this.rawProdukList.map((item) => this.mapProdukOption(item));
    },

    displayTotalPenjualan() {
      return this.penjualanItems.reduce((total, item) => {
        return total + this.getItemSubtotal(item);
      }, 0);
    },
  },

  watch: {
    activeTokoId: {
      immediate: true,
      handler(value, oldValue) {
        if (
          String(value || "") === String(oldValue || "") &&
          oldValue !== undefined
        ) {
          return;
        }

        if (!value) {
          this.apiProdukList = [];
          this.errorMessage = "";
          this.clearSelectedProduk();
          return;
        }

        this.queueFetchProduk();
      },
    },
  },

  mounted() {
    this.ensureSingleDefaultItem();
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    makeEmptyItem() {
      return {
        __key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        produk_toko_id: null,
        produk_id: null,
        obat_id: null,
        produk_nama: "",
        nama_produk: "",
        harga: 0,
        jumlah: 1,
      };
    },

    ensureSingleDefaultItem() {
      if (!this.form.penjualan) {
        this.form.penjualan = { items: [] };
      }

      if (!Array.isArray(this.form.penjualan.items)) {
        this.form.penjualan.items = [];
      }

      const normalizedItems = this.form.penjualan.items.map((item) =>
        this.normalizeItem(item),
      );

      const filledItems = normalizedItems.filter(
        (item) => !this.isEmptyItem(item),
      );

      if (filledItems.length > 0) {
        this.form.penjualan.items = filledItems;
      } else {
        this.form.penjualan.items = [this.makeEmptyItem()];
      }

      this.syncPenjualan();
    },

    normalizeItem(item) {
      return {
        __key:
          item?.__key || `${Date.now()}-${Math.random().toString(16).slice(2)}`,

        produk_toko_id:
          item?.produk_toko_id ||
          item?.master_produk_toko_id ||
          item?.obat_toko_id ||
          item?.toko_produk_id ||
          null,

        produk_id:
          item?.produk_id || item?.obat_id || item?.master_produk_id || null,

        obat_id:
          item?.obat_id || item?.produk_id || item?.master_produk_id || null,

        produk_nama:
          item?.produk_nama || item?.nama_produk || item?.nama_obat || "",
        nama_produk:
          item?.nama_produk || item?.produk_nama || item?.nama_obat || "",

        harga: Number(item?.harga || item?.harga_jual || 0),
        jumlah: Number(item?.jumlah || 1),
      };
    },

    isEmptyItem(item) {
      return (
        !item.produk_id &&
        !item.obat_id &&
        !item.produk_nama &&
        !item.nama_produk &&
        Number(item.harga || 0) === 0
      );
    },

    queueFetchProduk() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchProdukByToko();
      }, 150);
    },

    async fetchProdukByToko() {
      if (!this.activeTokoId) {
        this.apiProdukList = [];
        return;
      }

      this.loadingProduk = true;
      this.errorMessage = "";

      try {
        const rows = await referenceService.produkByToko({
          toko_id: this.activeTokoId,
        });

        this.apiProdukList = Array.isArray(rows) ? rows : [];
        this.clearUnavailableProduk();
      } catch (error) {
        this.apiProdukList = [];
        this.errorMessage =
          error.response?.data?.message ||
          "Gagal mengambil data produk berdasarkan cabang.";
      } finally {
        this.loadingProduk = false;
      }
    },

    mapProdukOption(item) {
      const produkTokoId =
        item.produk_toko_id ||
        item.master_produk_toko_id ||
        item.obat_toko_id ||
        item.toko_produk_id ||
        item.id ||
        null;

      const produkId =
        item.produk_id ||
        item.obat_id ||
        item.master_produk_id ||
        item.produk?.id ||
        item.master_produk?.id ||
        item.new_id ||
        null;

      const nama =
        item.nama ||
        item.nama_produk ||
        item.nama_obat ||
        item.produk_nama ||
        item.obat_nama ||
        item.label ||
        item.title ||
        item.text ||
        "-";

      const kode =
        item.kode || item.kode_produk || item.kode_obat || item.sku || "";

      const harga = Number(
        item.harga ||
          item.harga_jual ||
          item.harga_produk ||
          item.price ||
          item.harga_toko ||
          0,
      );

      const satuan =
        item.satuan?.nama_satuan ||
        item.satuan_nama ||
        item.nama_satuan ||
        item.satuan ||
        "";

      const stok = item.stok ?? item.stock ?? item.qty_stock ?? null;

      const detail = [
        kode,
        satuan,
        stok !== null && stok !== undefined ? `Stok: ${stok}` : "",
      ]
        .filter(Boolean)
        .join(" • ");

      return {
        ...item,

        id: produkTokoId,
        value: produkTokoId,

        produk_toko_id: produkTokoId,
        produk_id: produkId,
        obat_id: produkId,

        nama,
        kode,
        harga,
        satuan,
        stok,

        text: detail ? `${nama} - ${detail}` : nama,
      };
    },

    findProdukOption(id) {
      return this.produkOptions.find((item) => {
        return String(item.value) === String(id);
      });
    },

    onProdukChange(index, value) {
      const selected = value ? this.findProdukOption(value) : null;

      if (!selected) {
        this.replaceItem(index, this.makeEmptyItem());
        this.syncPenjualan();
        return;
      }

      const current = this.penjualanItems[index] || this.makeEmptyItem();

      this.replaceItem(index, {
        ...current,

        produk_toko_id: selected.produk_toko_id || selected.value || null,
        produk_id: selected.produk_id || null,
        obat_id: selected.produk_id || null,

        produk_nama: selected.nama || "",
        nama_produk: selected.nama || "",

        harga: Number(selected.harga || 0),
        jumlah: Number(current.jumlah || 1),
      });

      this.syncPenjualan();
    },

    updateItem(index, field, value) {
      if (field === "harga") {
        return;
      }

      const current = this.penjualanItems[index] || this.makeEmptyItem();

      const updated = {
        ...current,
        [field]: value,
      };

      if (field === "jumlah") {
        updated.jumlah = Number(value || 1);

        if (updated.jumlah <= 0) {
          updated.jumlah = 1;
        }
      }

      this.replaceItem(index, updated);
      this.syncPenjualan();

      this.$emit("update-item", {
        index,
        field,
        value,
      });
    },

    replaceItem(index, item) {
      this.form.penjualan.items.splice(index, 1, this.normalizeItem(item));
    },

    addItem() {
      this.form.penjualan.items.push(this.makeEmptyItem());
      this.syncPenjualan();
    },

    removeItem(index) {
      if (this.form.penjualan.items.length <= 1) {
        this.replaceItem(0, this.makeEmptyItem());
        this.syncPenjualan();
        return;
      }

      this.form.penjualan.items.splice(index, 1);
      this.syncPenjualan();
    },

    clearSelectedProduk() {
      this.form.penjualan.items = [this.makeEmptyItem()];
      this.syncPenjualan();
    },

    clearUnavailableProduk() {
      if (!this.apiProdukList.length) return;

      let changed = false;

      this.form.penjualan.items = this.form.penjualan.items.map((item) => {
        const selectedValue = item.produk_toko_id || item.produk_id;

        if (!selectedValue) return item;

        const exists = this.produkOptions.some((produk) => {
          return (
            String(produk.produk_toko_id) === String(item.produk_toko_id) ||
            String(produk.produk_id) === String(item.produk_id)
          );
        });

        if (!exists) {
          changed = true;
          return this.makeEmptyItem();
        }

        return item;
      });

      const filledItems = this.form.penjualan.items.filter(
        (item) => !this.isEmptyItem(item),
      );

      if (filledItems.length > 0) {
        this.form.penjualan.items = filledItems;
        changed = true;
      }

      if (changed) {
        this.syncPenjualan();
      }
    },

    syncPenjualan() {
      const payload = {
        total: this.displayTotalPenjualan,
        items: this.form.penjualan.items.map((item) => ({
          produk_toko_id: item.produk_toko_id || null,

          produk_id: item.produk_id || null,
          obat_id: item.obat_id || item.produk_id || null,

          produk_nama: item.produk_nama || "",
          nama_produk: item.nama_produk || item.produk_nama || "",

          harga: Number(item.harga || 0),
          jumlah: Number(item.jumlah || 1),
          subtotal: this.getItemSubtotal(item),
        })),
      };

      this.$emit("update-field", {
        field: "penjualan",
        value: payload,
      });
    },

    getItemSubtotal(item) {
      if (typeof this.getSubtotal === "function") {
        return Number(this.getSubtotal(item) || 0);
      }

      const harga = Number(item.harga || 0);
      const jumlah = Number(item.jumlah || 0);

      return harga * jumlah;
    },

    toNumber(value) {
      return Number(value || 0);
    },

    formatNumberSafe(value) {
      if (typeof this.formatNumber === "function") {
        return this.formatNumber(value || 0);
      }

      return Number(value || 0).toLocaleString("id-ID");
    },

    formatRupiah(value) {
      return `Rp ${this.formatNumberSafe(value || 0)}`;
    },
  },
};
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.item-box {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 16px;
  background: #fff;
}

.total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.total-box__label {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
}

.total-box__value {
  font-size: 22px;
  font-weight: 800;
  color: #0284c7;
}
</style>

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
            :model-value="item.produk_toko_id"
            :items="produkOptions"
            item-title="label_simple"
            item-value="produk_toko_id"
            :item-props="getProdukItemProps"
            :custom-filter="filterProduk"
            label="Produk"
            :placeholder="
              activeTokoId
                ? 'Ketik nama produk'
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
            auto-select-first
            @update:modelValue="onProdukChange(index, $event)"
            @click:clear="onProdukChange(index, null)"
          >
            <template #message>
              Produk kosong tetap tampil, tetapi tidak bisa dipilih.
            </template>

            <template #no-data>
              <div class="pa-3 text-body-2 text-medium-emphasis">
                Produk tidak ditemukan.
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
            :max="item.stok_tersedia || undefined"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            :disabled="!item.produk_toko_id"
            @update:modelValue="updateItem(index, 'jumlah', toNumber($event))"
          >
            <template #details>
              <span
                v-if="item.produk_toko_id"
                class="text-caption text-medium-emphasis"
              >
                Maks: {{ formatStock(item.stok_tersedia) }}
              </span>
            </template>
          </v-text-field>
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
            icon="mdi-delete-outline"
            :disabled="penjualanItems.length === 1"
            @click="removeItem(index)"
          />
        </v-col>
      </v-row>
    </div>

    <div class="total-box">
      <div>
        <div class="total-box__label">Total Penjualan</div>
        <div class="total-box__subtitle">
          Total dari seluruh produk yang dipilih
        </div>
      </div>

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
      selectedProdukOptions: {},
    };
  },

  computed: {
    activeTokoId() {
      return (
        this.form?.toko_id ||
        this.form?.tokoId ||
        this.getLocalStorageValue([
          "selected_toko_id",
          "selected_cabang_id",
          "toko_id",
          "cabang_id",
        ]) ||
        this.getLocalStorageObjectValue([
          "selected_toko",
          "selected_cabang",
          "toko",
          "cabang",
        ])
      );
    },

    penjualanItems() {
      return this.form?.penjualan?.items || [];
    },

    rawProdukList() {
      return this.apiProdukList.length ? this.apiProdukList : this.obatList;
    },

    produkOptions() {
      const rows = this.rawProdukList.map((item) => this.mapProdukOption(item));

      this.penjualanItems.forEach((item) => {
        const selected = this.getSelectedProdukForOptions(item);

        if (!selected?.produk_toko_id) return;

        const exists = rows.some((row) => {
          return String(row.produk_toko_id) === String(selected.produk_toko_id);
        });

        if (!exists) {
          rows.unshift(selected);
        }
      });

      const unique = [];
      const seen = new Set();

      rows.forEach((row) => {
        if (!row.produk_toko_id) return;

        const key = String(row.produk_toko_id);

        if (seen.has(key)) return;

        seen.add(key);
        unique.push(row);
      });

      return unique;
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
          this.selectedProdukOptions = {};
          this.clearSelectedProduk();
          return;
        }

        this.queueFetchProduk();
      },
    },
  },

  mounted() {
    this.ensureSingleDefaultItem();
    this.cacheSelectedProdukFromItems();

    if (this.activeTokoId) {
      this.queueFetchProduk();
    }
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
        tempat_produk_id: null,
        produk_nama: "",
        nama_produk: "",
        kode_produk: "",
        harga: 0,
        jumlah: 1,
        stok_tersedia: 0,
        stok_akhir: 0,
        stok_reserved: 0,
        stok_minimum: 0,
        status_stok: "",
      };
    },

    ensureSingleDefaultItem() {
      if (!this.form.penjualan) {
        this.form.penjualan = { items: [], total: 0 };
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

      this.form.penjualan.items = filledItems.length
        ? filledItems
        : [this.makeEmptyItem()];

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
          item?.value ||
          null,

        produk_id:
          item?.produk_id ||
          item?.obat_id ||
          item?.master_produk_id ||
          item?.produk?.id ||
          item?.master_produk?.id ||
          null,

        obat_id:
          item?.obat_id ||
          item?.produk_id ||
          item?.master_produk_id ||
          item?.produk?.id ||
          item?.master_produk?.id ||
          null,

        tempat_produk_id:
          item?.tempat_produk_id ||
          item?.tempat_id ||
          item?.produk?.tempat_produk_id ||
          item?.produk?.tempat_id ||
          null,

        produk_nama:
          item?.produk_nama ||
          item?.nama_produk ||
          item?.nama_obat ||
          item?.nama ||
          "",

        nama_produk:
          item?.nama_produk ||
          item?.produk_nama ||
          item?.nama_obat ||
          item?.nama ||
          "",

        kode_produk:
          item?.kode_produk || item?.kode_accurate || item?.kode || "",

        harga: Number(item?.harga || item?.harga_jual || 0),
        jumlah: Number(item?.jumlah || 1),

        stok_tersedia: Number(item?.stok_tersedia || 0),
        stok_akhir: Number(item?.stok_akhir || 0),
        stok_reserved: Number(item?.stok_reserved || 0),
        stok_minimum: Number(item?.stok_minimum || 0),
        status_stok: item?.status_stok || "",
      };
    },

    isEmptyItem(item) {
      return (
        !item.produk_toko_id &&
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
        const response = await referenceService.produkByToko({
          toko_id: this.activeTokoId,
        });

        const rows = this.extractProdukRows(response);

        this.apiProdukList = rows;

        if (!rows.length) {
          this.errorMessage = "Tidak ada produk aktif pada cabang ini.";
        }

        this.clearUnavailableProduk();
      } catch (error) {
        this.apiProdukList = [];
        this.errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Gagal mengambil data produk berdasarkan cabang.";
      } finally {
        this.loadingProduk = false;
      }
    },

    extractProdukRows(response) {
      if (Array.isArray(response)) {
        return response;
      }

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      if (Array.isArray(response?.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response?.result)) {
        return response.result;
      }

      return [];
    },

    mapProdukOption(item) {
      const produkTokoId =
        item.produk_toko_id ||
        item.master_produk_toko_id ||
        item.obat_toko_id ||
        item.toko_produk_id ||
        item.value ||
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
        item.kode_accurate ||
        item.kode ||
        item.kode_produk ||
        item.kode_obat ||
        item.sku ||
        "-";

      const harga = Number(
        item.harga_jual ||
          item.harga ||
          item.harga_produk ||
          item.price ||
          item.harga_toko ||
          0,
      );

      const stokTersedia = Number(
        item.stok_tersedia ??
          item.stok_akhir ??
          item.stok_awal ??
          item.stok ??
          item.stock ??
          item.qty_stock ??
          0,
      );

      const stokAkhir = Number(
        item.stok_akhir ??
          item.stok_tersedia ??
          item.stok_awal ??
          item.stok ??
          item.stock ??
          item.qty_stock ??
          0,
      );

      const stokReserved = Number(item.stok_reserved || 0);
      const stokMinimum = Number(item.stok_minimum || 0);

      const isStokHabis =
        Number(item.is_stok_habis || 0) === 1 || stokTersedia <= 0;

      const isStokMinimum =
        Number(item.is_stok_minimum || 0) === 1 ||
        (stokTersedia > 0 && stokMinimum > 0 && stokTersedia <= stokMinimum);

      let statusStok = item.status_stok || "TERSEDIA";

      if (isStokHabis) {
        statusStok = "HABIS";
      } else if (isStokMinimum) {
        statusStok = "STOK MINIMUM";
      }

      const disabled =
        item.disabled === true ||
        Number(item.disabled || 0) === 1 ||
        stokTersedia <= 0;

      const labelSimple = stokTersedia <= 0 ? `${nama} (kosong)` : `${nama}`;

      return {
        ...item,

        id: produkTokoId,
        value: produkTokoId,

        produk_toko_id: produkTokoId,
        produk_id: produkId,
        obat_id: produkId,

        tempat_produk_id:
          item.tempat_produk_id ||
          item.tempat_id ||
          item.produk?.tempat_produk_id ||
          item.produk?.tempat_id ||
          1,

        nama,
        kode,
        kode_accurate: item.kode_accurate || kode,

        harga,
        harga_jual: harga,
        harga_beli: Number(item.harga_beli || item.harga_beli_terakhir || 0),

        stok_tersedia: stokTersedia,
        stok_akhir: stokAkhir,
        stok_reserved: stokReserved,
        stok_minimum: stokMinimum,

        is_stok_habis: isStokHabis ? 1 : 0,
        is_stok_minimum: isStokMinimum ? 1 : 0,
        status_stok: statusStok,

        disabled,

        label_simple: labelSimple,
        label_dropdown: labelSimple,
        text: labelSimple,

        item_props: {
          disabled,
          title: labelSimple,
        },

        search_text: [kode, nama, statusStok, stokTersedia]
          .filter(Boolean)
          .join(" "),
      };
    },

    filterProduk(value, query, item) {
      const keyword = String(query || "")
        .toLowerCase()
        .trim();

      if (!keyword) {
        return true;
      }

      const row = this.getProdukRaw(item);

      const searchable = [
        row.nama,
        row.nama_produk,
        row.produk_nama,
        row.kode,
        row.kode_accurate,
        row.kode_produk,
        row.label_simple,
        row.search_text,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    },

    getProdukRaw(option) {
      if (!option) {
        return {};
      }

      return option.raw || option || {};
    },

    getProdukItemProps(item) {
      const row = this.getProdukRaw(item);

      return {
        disabled: this.isProdukDisabled(row),
        title: row.label_simple || row.nama || "-",
      };
    },

    isProdukDisabled(item) {
      const row = this.getProdukRaw(item);

      return Number(row.stok_tersedia || 0) <= 0 || row.disabled === true;
    },

    getSelectedProdukForOptions(item) {
      const selectedValue = item?.produk_toko_id || item?.value || null;

      if (!selectedValue) {
        return null;
      }

      const cached = this.selectedProdukOptions[String(selectedValue)];

      if (cached) {
        return this.mapProdukOption(cached);
      }

      if (item?.produk_nama || item?.nama_produk) {
        return this.mapProdukOption({
          produk_toko_id: item.produk_toko_id,
          produk_id: item.produk_id,
          obat_id: item.obat_id,
          nama: item.produk_nama || item.nama_produk,
          kode_accurate: item.kode_produk,
          harga_jual: item.harga,
          tempat_produk_id: item.tempat_produk_id,
          stok_tersedia: item.stok_tersedia,
          stok_akhir: item.stok_akhir,
          stok_reserved: item.stok_reserved,
          stok_minimum: item.stok_minimum,
          status_stok: item.status_stok,
        });
      }

      return null;
    },

    cacheSelectedProdukFromItems() {
      this.penjualanItems.forEach((item) => {
        const selected = this.getSelectedProdukForOptions(item);

        if (selected?.produk_toko_id) {
          this.selectedProdukOptions[String(selected.produk_toko_id)] =
            selected;
        }
      });
    },

    findProdukOption(value) {
      return this.produkOptions.find((item) => {
        return (
          String(item.value) === String(value) ||
          String(item.produk_toko_id) === String(value)
        );
      });
    },

    onProdukChange(index, value) {
      const current = this.penjualanItems[index] || this.makeEmptyItem();

      if (!value) {
        if (current.produk_toko_id) {
          delete this.selectedProdukOptions[String(current.produk_toko_id)];
        }

        this.replaceItem(index, this.makeEmptyItem());
        this.syncPenjualan();
        return;
      }

      const selected = this.findProdukOption(value);

      if (!selected) {
        return;
      }

      if (this.isProdukDisabled(selected)) {
        this.errorMessage = `Produk ${selected.nama} tidak bisa dipilih karena stok kosong.`;
        this.replaceItem(index, this.makeEmptyItem());
        this.syncPenjualan();
        return;
      }

      this.selectedProdukOptions[String(selected.produk_toko_id)] = selected;

      this.replaceItem(index, {
        ...current,

        produk_toko_id: selected.produk_toko_id || null,
        produk_id: selected.produk_id || null,
        obat_id: selected.produk_id || null,
        tempat_produk_id: selected.tempat_produk_id || 1,

        produk_nama: selected.nama || "",
        nama_produk: selected.nama || "",
        kode_produk: selected.kode_accurate || selected.kode || "",

        harga: Number(selected.harga_jual || selected.harga || 0),
        jumlah: this.normalizeQty(Number(current.jumlah || 1), selected),

        stok_tersedia: Number(selected.stok_tersedia || 0),
        stok_akhir: Number(selected.stok_akhir || 0),
        stok_reserved: Number(selected.stok_reserved || 0),
        stok_minimum: Number(selected.stok_minimum || 0),
        status_stok: selected.status_stok || "",
      });

      this.errorMessage = "";
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
        updated.jumlah = this.normalizeQty(Number(value || 1), current);
      }

      this.replaceItem(index, updated);
      this.syncPenjualan();

      this.$emit("update-item", {
        index,
        field,
        value: updated[field],
      });
    },

    normalizeQty(qty, item) {
      let normalized = Number(qty || 1);

      if (normalized <= 0) {
        normalized = 1;
      }

      const stokTersedia = Number(item?.stok_tersedia || 0);

      if (stokTersedia > 0 && normalized > stokTersedia) {
        normalized = stokTersedia;
        this.errorMessage = `Qty tidak boleh melebihi stok tersedia (${this.formatStock(stokTersedia)}).`;
      }

      return normalized;
    },

    replaceItem(index, item) {
      this.form.penjualan.items.splice(index, 1, this.normalizeItem(item));
    },

    addItem() {
      if (!this.form.penjualan) {
        this.form.penjualan = { items: [], total: 0 };
      }

      if (!Array.isArray(this.form.penjualan.items)) {
        this.form.penjualan.items = [];
      }

      this.form.penjualan.items.push(this.makeEmptyItem());
      this.syncPenjualan();
    },

    removeItem(index) {
      if (this.form.penjualan.items.length <= 1) {
        this.replaceItem(0, this.makeEmptyItem());
        this.syncPenjualan();
        return;
      }

      const current = this.form.penjualan.items[index];

      if (current?.produk_toko_id) {
        delete this.selectedProdukOptions[String(current.produk_toko_id)];
      }

      this.form.penjualan.items.splice(index, 1);
      this.syncPenjualan();
    },

    clearSelectedProduk() {
      if (!this.form.penjualan) {
        this.form.penjualan = { items: [], total: 0 };
      }

      this.form.penjualan.items = [this.makeEmptyItem()];
      this.syncPenjualan();
    },

    clearUnavailableProduk() {
      if (!this.apiProdukList.length) return;

      const validProdukOptions = this.apiProdukList.map((item) =>
        this.mapProdukOption(item),
      );

      this.form.penjualan.items = this.form.penjualan.items.map((item) => {
        const selectedValue = item.produk_toko_id;

        if (!selectedValue) return item;

        const selected = validProdukOptions.find((produk) => {
          return String(produk.produk_toko_id) === String(selectedValue);
        });

        if (!selected) {
          return item;
        }

        if (this.isProdukDisabled(selected)) {
          delete this.selectedProdukOptions[String(selectedValue)];

          return this.makeEmptyItem();
        }

        return {
          ...item,
          stok_tersedia: Number(selected.stok_tersedia || 0),
          stok_akhir: Number(selected.stok_akhir || 0),
          stok_reserved: Number(selected.stok_reserved || 0),
          stok_minimum: Number(selected.stok_minimum || 0),
          status_stok: selected.status_stok || item.status_stok,
          jumlah: this.normalizeQty(Number(item.jumlah || 1), selected),
        };
      });

      const filledItems = this.form.penjualan.items.filter(
        (item) => !this.isEmptyItem(item),
      );

      this.form.penjualan.items = filledItems.length
        ? filledItems
        : [this.makeEmptyItem()];

      this.syncPenjualan();
    },

    syncPenjualan() {
      if (!this.form.penjualan) {
        this.form.penjualan = { items: [], total: 0 };
      }

      const payload = {
        total: this.displayTotalPenjualan,
        items: this.form.penjualan.items.map((item) => ({
          __key: item.__key,

          produk_toko_id: item.produk_toko_id || null,
          produk_id: item.produk_id || null,
          obat_id: item.obat_id || item.produk_id || null,
          tempat_produk_id: item.tempat_produk_id || 1,

          kode_produk: item.kode_produk || "",
          produk_nama: item.produk_nama || "",
          nama_produk: item.nama_produk || item.produk_nama || "",

          harga: Number(item.harga || 0),
          jumlah: Number(item.jumlah || 1),
          subtotal: this.getItemSubtotal(item),

          stok_tersedia: Number(item.stok_tersedia || 0),
          stok_akhir: Number(item.stok_akhir || 0),
          stok_reserved: Number(item.stok_reserved || 0),
          stok_minimum: Number(item.stok_minimum || 0),
          status_stok: item.status_stok || "",
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

    getLocalStorageValue(keys = []) {
      for (const key of keys) {
        const value = localStorage.getItem(key);

        if (value && value !== "null" && value !== "undefined") {
          return value;
        }
      }

      return null;
    },

    getLocalStorageObjectValue(keys = []) {
      for (const key of keys) {
        const raw = localStorage.getItem(key);

        if (!raw || raw === "null" || raw === "undefined") continue;

        try {
          const obj = JSON.parse(raw);
          const value =
            obj?.id || obj?.toko_id || obj?.cabang_id || obj?.value || null;

          if (value) return value;
        } catch (error) {
          // ignore invalid JSON
        }
      }

      return null;
    },

    toNumber(value) {
      return Number(value || 0);
    },

    formatStock(value) {
      return Number(value || 0).toLocaleString("id-ID", {
        maximumFractionDigits: 4,
      });
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
  gap: 12px;
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

.total-box__subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.total-box__value {
  font-size: 22px;
  font-weight: 800;
  color: #0284c7;
  white-space: nowrap;
}

:deep(.v-list-item--disabled) {
  opacity: 0.55;
}

@media (max-width: 768px) {
  .total-box {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

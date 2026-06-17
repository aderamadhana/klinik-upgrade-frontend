<template>
  <v-card variant="flat" rounded="lg" class="mb-4 border">
    <v-card-text class="pa-4">
      <div
        class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
      >
        <div class="d-flex align-center ga-3">
          <v-avatar color="blue-lighten-5" size="40">
            <v-icon icon="mdi-pill" color="primary" size="22" />
          </v-avatar>

          <div>
            <div class="text-subtitle-1 font-weight-bold">Obat/Produk</div>
            <div class="text-body-2 text-medium-emphasis">
              Produk dari registrasi layanan atau resep dokter
            </div>
          </div>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-plus"
          @click="$emit('add-item')"
        >
          Tambah Obat
        </v-btn>
      </div>

      <v-alert
        v-if="stockErrorMessage"
        type="error"
        variant="tonal"
        density="compact"
        border="start"
        closable
        class="mb-4"
        @click:close="stockErrorMessage = ''"
      >
        {{ stockErrorMessage }}
      </v-alert>

      <div
        v-if="!items || items.length === 0"
        class="d-flex flex-column align-center justify-center text-center pa-8"
      >
        <v-avatar color="grey-lighten-3" size="56" class="mb-3">
          <v-icon size="30" color="grey" icon="mdi-pill-off" />
        </v-avatar>
        <div class="text-subtitle-2 font-weight-bold mb-1">Belum ada obat</div>
        <div class="text-body-2 text-medium-emphasis">
          Produk/obat dari registrasi layanan atau resep dokter akan muncul di
          sini.
        </div>
      </div>

      <v-card
        v-for="(item, index) in items"
        :key="
          item.invoice_item_id ||
          item.registrasi_penjualan_detail_id ||
          `obat-${index}`
        "
        variant="outlined"
        rounded="lg"
        class="mb-3"
      >
        <v-sheet color="grey-lighten-4" class="px-4 py-3">
          <div class="d-flex align-center justify-space-between ga-3">
            <div class="d-flex align-center ga-3 flex-grow-1">
              <v-avatar color="blue-lighten-5" size="36">
                <v-icon icon="mdi-pill" size="20" color="primary" />
              </v-avatar>

              <div class="flex-grow-1">
                <div class="d-flex align-center flex-wrap ga-2">
                  <div class="text-subtitle-2 font-weight-bold">
                    Obat/Produk #{{ index + 1 }}
                  </div>

                  <v-chip
                    v-if="item.nama"
                    size="x-small"
                    variant="tonal"
                    :color="getItemStockColor(item)"
                  >
                    Stok {{ getItemStockText(item) }}
                  </v-chip>

                  <v-chip
                    v-if="getItemStockStatus(item)"
                    size="x-small"
                    variant="tonal"
                    :color="getItemStockColor(item)"
                  >
                    {{ getItemStockStatus(item) }}
                  </v-chip>
                </div>

                <div class="text-caption text-medium-emphasis mt-1">
                  Isi produk, jumlah, diskon, dan aturan pemakaian
                </div>
              </div>
            </div>

            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click.stop="$emit('remove-item', index)"
            />
          </div>
        </v-sheet>

        <v-card-text class="pa-4">
          <v-alert
            v-if="getItemStockError(item)"
            type="error"
            variant="tonal"
            density="compact"
            border="start"
            class="mb-4"
          >
            {{ getItemStockError(item) }}
          </v-alert>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-autocomplete
                :model-value="item.nama"
                :items="normalizedObatList"
                item-title="label_simple"
                item-value="value"
                :item-props="getObatItemProps"
                :custom-filter="filterObat"
                label="Nama Obat/Produk"
                placeholder="Pilih obat atau produk"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-pill"
                hide-details="auto"
                clearable
                menu-icon="mdi-chevron-down"
                auto-select-first
                @update:model-value="selectObat(index, $event)"
                @click:clear="selectObat(index, null)"
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

            <v-col cols="12" sm="4" md="2">
              <v-text-field
                :model-value="item.qty"
                label="Qty"
                type="number"
                min="1"
                :max="getItemStockMax(item)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-counter"
                hide-details="auto"
                :error-messages="getItemQtyError(item)"
                @update:model-value="updateQty(index, $event)"
              />
            </v-col>

            <v-col cols="12" sm="4" md="2">
              <v-text-field
                :model-value="item.unit || getItemUnit(item) || 'pcs'"
                label="Unit"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-package-variant-closed"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" sm="4" md="2">
              <v-sheet
                border
                rounded="lg"
                min-height="48"
                class="h-100 px-3 py-2 d-flex flex-column justify-center"
              >
                <div
                  class="d-flex align-center ga-2 text-caption text-medium-emphasis"
                >
                  <v-icon icon="mdi-cash" size="15" />
                  Harga
                </div>
                <div class="text-body-2 font-weight-bold mt-1">
                  {{ formatCurrency(Number(item.harga || 0)) }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row dense class="mt-1">
            <v-col cols="12" sm="6" md="3">
              <v-select
                :model-value="displayDiskonType(item)"
                :items="diskonTypeList"
                label="Tipe Diskon"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-percent-outline"
                hide-details="auto"
                :readonly="discountReadonly"
                @update:model-value="updateField(index, 'diskon_type', $event)"
              />
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-text-field
                label="Nilai Diskon"
                type="number"
                min="0"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-sale-outline"
                :model-value="displayDiskonValue(item)"
                :prefix="displayDiskonType(item) === 'Rp' ? 'Rp' : ''"
                :suffix="displayDiskonType(item) === '%' ? '%' : ''"
                hide-details="auto"
                :readonly="discountReadonly"
                @update:model-value="updateField(index, 'diskon', $event)"
              />
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-select
                :model-value="item.frekuensi"
                :items="frekuensiList"
                item-title="title"
                item-value="value"
                label="Frekuensi"
                placeholder="Pilih frekuensi"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-clock-outline"
                hide-details="auto"
                clearable
                @update:model-value="updateField(index, 'frekuensi', $event)"
              />
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-select
                :model-value="item.waktu_pakai"
                :items="waktuPakaiList"
                item-title="title"
                item-value="value"
                label="Waktu Pakai"
                placeholder="Pilih waktu"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-white-balance-sunny"
                hide-details="auto"
                clearable
                @update:model-value="updateField(index, 'waktu_pakai', $event)"
              />
            </v-col>
          </v-row>

          <v-row dense class="mt-1">
            <v-col cols="12" md="8">
              <v-sheet
                color="blue-grey-lighten-5"
                rounded="lg"
                border
                min-height="64"
                class="h-100 px-3 py-2"
              >
                <div
                  class="d-flex align-center ga-2 text-caption text-medium-emphasis"
                >
                  <v-icon icon="mdi-clipboard-text-outline" size="15" />
                  Ringkasan Aturan Pakai
                </div>
                <div class="text-body-2 font-weight-medium mt-2">
                  {{ aturanPakaiText(item) }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="4">
              <v-sheet
                color="blue-lighten-5"
                rounded="lg"
                border
                min-height="64"
                class="h-100 px-3 py-2 d-flex flex-column justify-center"
              >
                <div class="d-flex align-center ga-2 text-caption text-primary">
                  <v-icon icon="mdi-calculator" size="15" />
                  Subtotal
                </div>
                <div class="text-subtitle-1 font-weight-bold text-primary mt-1">
                  {{ formatCurrency(displaySubtotal(item)) }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row dense class="mt-1">
            <v-col cols="12">
              <v-textarea
                :model-value="item.penggunaan"
                label="Instruksi Pemakaian"
                placeholder="Contoh: diminum setelah makan"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-note-text-outline"
                hide-details="auto"
                rows="2"
                auto-grow
                @update:model-value="updateField(index, 'penggunaan', $event)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "PembayaranObatCard",

  props: {
    items: {
      type: Array,
      default: () => [],
    },
    obatList: {
      type: Array,
      default: () => [],
    },
    diskonTypeList: {
      type: Array,
      default: () => ["%", "Rp"],
    },
    frekuensiList: {
      type: Array,
      default: () => [],
    },
    waktuPakaiList: {
      type: Array,
      default: () => [],
    },
    formatCurrency: {
      type: Function,
      default: (value) => value,
    },
    getSubtotal: {
      type: Function,
      default: () => 0,
    },
    discountReadonly: {
      type: Boolean,
      default: false,
    },
    getDisplaySubtotal: {
      type: Function,
      default: null,
    },
    getVoucherDiscountType: {
      type: Function,
      default: null,
    },
    getVoucherDiscountValue: {
      type: Function,
      default: null,
    },
  },

  emits: ["add-item", "remove-item", "update-item-field", "fill-item"],

  data() {
    return {
      stockErrorMessage: "",
    };
  },

  computed: {
    normalizedObatList() {
      const rows = this.obatList.map((item) => this.normalizeObatOption(item));
      const selectedRows = (this.items || [])
        .filter((item) => item?.nama)
        .map((item) => this.normalizeObatOption(item));

      const unique = [];
      const seen = new Set();

      [...rows, ...selectedRows].forEach((item) => {
        if (!item?.value) return;

        const key = String(item.value).toLowerCase();

        if (seen.has(key)) return;

        seen.add(key);
        unique.push(item);
      });

      return unique;
    },
  },

  methods: {
    updateField(index, field, value) {
      this.$emit("update-item-field", {
        index,
        field,
        value,
      });
    },

    updateFields(index, payload = {}) {
      Object.entries(payload).forEach(([field, value]) => {
        this.updateField(index, field, value);
      });
    },

    updateQty(index, value) {
      const item = this.items?.[index] || {};
      const maxQty = this.getItemStockMax(item);
      let qty = Number(value || 1);

      if (!Number.isFinite(qty) || qty < 1) {
        qty = 1;
      }

      if (maxQty !== undefined && qty > maxQty) {
        qty = maxQty;
        this.stockErrorMessage = `Qty tidak boleh melebihi stok tersedia (${this.formatStock(maxQty)}).`;
      }

      this.updateField(index, "qty", qty);
    },

    selectObat(index, value) {
      if (!value) {
        this.updateFields(index, {
          nama: "",
          produk_toko_id: null,
          master_produk_toko_id: null,
          produk_id: null,
          obat_id: null,
          master_produk_id: null,
          tempat_produk_id: null,
          stock_produk_toko_id: null,
          stok_tersedia: null,
          stok_akhir: null,
          stok_reserved: null,
          stok_minimum: null,
          status_stok: "",
        });
        return;
      }

      const selected = this.findObatOption(value);

      if (selected && this.isObatDisabled(selected)) {
        this.stockErrorMessage = `Produk ${selected.title || selected.nama || value} tidak bisa dipilih karena stok kosong.`;

        this.updateFields(index, {
          nama: "",
          produk_toko_id: null,
          master_produk_toko_id: null,
          produk_id: null,
          obat_id: null,
          master_produk_id: null,
          tempat_produk_id: null,
          stock_produk_toko_id: null,
          stok_tersedia: null,
          stok_akhir: null,
          stok_reserved: null,
          stok_minimum: null,
          status_stok: "",
        });
        return;
      }

      const nama = selected?.title || value;

      this.updateField(index, "nama", nama);

      if (selected) {
        this.updateFields(index, {
          produk_toko_id: selected.produk_toko_id || null,
          master_produk_toko_id: selected.produk_toko_id || null,
          produk_id: selected.produk_id || null,
          obat_id: selected.produk_id || null,
          master_produk_id: selected.produk_id || null,
          tempat_produk_id: selected.tempat_produk_id || null,
          stock_produk_toko_id: selected.stock_produk_toko_id || null,
          stok_tersedia: selected.stok_terbaca
            ? Number(selected.stok_tersedia || 0)
            : null,
          stok_akhir: selected.stok_akhir,
          stok_reserved: selected.stok_reserved,
          stok_minimum: selected.stok_minimum,
          status_stok: selected.status_stok || "",
          unit: selected.unit || null,
        });
      }

      this.stockErrorMessage = "";

      this.$nextTick(() => {
        this.$emit("fill-item", index);
      });
    },

    normalizeObatOption(item = {}) {
      const raw = this.getOptionRaw(item);
      const produk = raw?.produk || raw?.master_produk || {};
      const produkToko =
        raw?.produk_toko ||
        raw?.produkToko ||
        raw?.master_produk_toko ||
        raw?.masterProdukToko ||
        raw?.stock_produk_toko ||
        raw?.stockProdukToko ||
        {};

      const title = this.pickFirstText([
        raw?.title,
        raw?.label,
        raw?.nama_produk,
        raw?.produk_nama,
        raw?.nama_obat,
        raw?.nama,
        produk?.nama,
        produk?.nama_produk,
        produk?.nama_obat,
        raw?.text,
        raw?.value,
      ]);

      const value = title;
      const stokRaw = this.resolveStockValue(raw, produkToko, produk);
      const stokTerbaca = stokRaw !== null;
      const stokTersedia = stokTerbaca ? this.toNumber(stokRaw) : null;
      const stokAkhirRaw = this.pickFirstNotEmpty([
        raw?.stok_akhir,
        raw?.stock_akhir,
        produkToko?.stok_akhir,
        produkToko?.stock_akhir,
        produk?.stok_akhir,
        produk?.stock_akhir,
        stokRaw,
      ]);
      const stokAkhir =
        stokAkhirRaw !== null ? this.toNumber(stokAkhirRaw) : null;
      const stokReserved = this.toNumber(
        this.pickFirstNotEmpty([
          raw?.stok_reserved,
          raw?.stock_reserved,
          raw?.reserved_stock,
          produkToko?.stok_reserved,
          produkToko?.stock_reserved,
          0,
        ]),
      );
      const stokMinimum = this.toNumber(
        this.pickFirstNotEmpty([
          raw?.stok_minimum,
          raw?.min_stock,
          raw?.minimum_stock,
          produkToko?.stok_minimum,
          produkToko?.min_stock,
          produk?.stok_minimum,
          produk?.min_stock,
          0,
        ]),
      );

      const isStokHabis = stokTerbaca && stokTersedia <= 0;
      const isStokMinimum =
        stokTerbaca &&
        stokTersedia > 0 &&
        stokMinimum > 0 &&
        stokTersedia <= stokMinimum;

      let statusStok = raw?.status_stok || raw?.status_stock || "";

      if (isStokHabis) {
        statusStok = "HABIS";
      } else if (isStokMinimum) {
        statusStok = "STOK MINIMUM";
      }

      const disabled =
        raw?.disabled === true ||
        Number(raw?.disabled || 0) === 1 ||
        Number(raw?.is_disabled || 0) === 1 ||
        Number(raw?.is_stok_habis || 0) === 1 ||
        isStokHabis;

      const unit =
        raw?.unit ||
        raw?.nama_satuan ||
        raw?.satuan ||
        produk?.satuan?.nama_satuan ||
        produk?.satuan?.nama ||
        produk?.unit ||
        "pcs";

      const kode = this.pickFirstText([
        raw?.kode_accurate,
        raw?.kode_produk,
        raw?.kode_obat,
        raw?.kode,
        produk?.kode_accurate,
        produk?.kode_produk,
        produk?.kode,
      ]);

      const labelSimple = isStokHabis ? `${title} (kosong)` : title;
      const subtitle = stokTerbaca
        ? `Stok: ${this.formatStock(stokTersedia)} ${unit || ""}`.trim()
        : "Stok tidak terbaca";

      return {
        ...raw,
        title,
        value,
        label: title,
        label_simple: labelSimple,
        label_dropdown: labelSimple,
        text: labelSimple,
        subtitle,
        kode,
        produk_toko_id:
          raw?.produk_toko_id ||
          raw?.master_produk_toko_id ||
          raw?.obat_toko_id ||
          raw?.toko_produk_id ||
          produkToko?.id ||
          null,
        produk_id:
          raw?.produk_id ||
          raw?.obat_id ||
          raw?.master_produk_id ||
          raw?.product_id ||
          produk?.id ||
          null,
        tempat_produk_id:
          raw?.tempat_produk_id ||
          raw?.master_tempat_produk_id ||
          raw?.tempat_id ||
          produkToko?.tempat_produk_id ||
          produkToko?.tempat_id ||
          produk?.tempat_produk_id ||
          produk?.tempat_id ||
          null,
        stock_produk_toko_id:
          raw?.stock_produk_toko_id ||
          raw?.stock_id ||
          raw?.stock_produk_id ||
          raw?.stock_produk_toko?.id ||
          raw?.stockProdukToko?.id ||
          produkToko?.stock_produk_toko_id ||
          produkToko?.id ||
          null,
        unit,
        stok_terbaca: stokTerbaca,
        stok_tersedia: stokTersedia,
        stok_akhir: stokAkhir,
        stok_reserved: stokReserved,
        stok_minimum: stokMinimum,
        status_stok: statusStok,
        disabled,
        search_text: [kode, title, labelSimple, statusStok, stokTersedia, unit]
          .filter(
            (value) => value !== null && value !== undefined && value !== "",
          )
          .join(" "),
      };
    },

    resolveStockValue(item = {}, produkToko = {}, produk = {}) {
      return this.pickFirstNotEmpty([
        item?.stok_tersedia,
        item?.stok_available,
        item?.stok_bisa_dijual,
        item?.available_stock,
        item?.stock_available,
        item?.qty_available,
        item?.sisa_stok,
        item?.stok_akhir,
        item?.stock_akhir,
        item?.stok,
        item?.stock,
        item?.qty_stock,
        produkToko?.stok_tersedia,
        produkToko?.stok_available,
        produkToko?.stok_bisa_dijual,
        produkToko?.available_stock,
        produkToko?.stock_available,
        produkToko?.qty_available,
        produkToko?.sisa_stok,
        produkToko?.stok_akhir,
        produkToko?.stock_akhir,
        produkToko?.stok,
        produkToko?.stock,
        produkToko?.qty_stock,
        produk?.stok_tersedia,
        produk?.stok_available,
        produk?.stok_bisa_dijual,
        produk?.available_stock,
        produk?.stock_available,
        produk?.qty_available,
        produk?.sisa_stok,
        produk?.stok_akhir,
        produk?.stock_akhir,
        produk?.stok,
        produk?.stock,
      ]);
    },

    filterObat(value, query, item) {
      const keyword = String(query || "")
        .toLowerCase()
        .trim();

      if (!keyword) return true;

      const row = this.getOptionRaw(item);
      const searchable = [
        row?.title,
        row?.label,
        row?.label_simple,
        row?.nama,
        row?.nama_produk,
        row?.produk_nama,
        row?.nama_obat,
        row?.kode,
        row?.kode_accurate,
        row?.kode_produk,
        row?.status_stok,
        row?.search_text,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    },

    getObatItemProps(item) {
      const row = this.getOptionRaw(item);

      return {
        disabled: this.isObatDisabled(row),
        title:
          row?.label_simple || row?.title || row?.label || row?.nama || "-",
        subtitle: row?.subtitle || "",
      };
    },

    isObatDisabled(item) {
      const row = this.getOptionRaw(item);

      return row?.disabled === true || Number(row?.disabled || 0) === 1;
    },

    findObatOption(value) {
      if (!value) return null;

      return (
        this.normalizedObatList.find(
          (item) => String(item.value) === String(value),
        ) ||
        this.normalizedObatList.find(
          (item) => String(item.title) === String(value),
        ) ||
        null
      );
    },

    findSelectedObatOption(item = {}) {
      const nama = item?.nama || item?.title || item?.label || "";
      const produkTokoId =
        item?.produk_toko_id ||
        item?.master_produk_toko_id ||
        item?.obat_toko_id;
      const produkId =
        item?.produk_id || item?.obat_id || item?.master_produk_id;

      return (
        this.normalizedObatList.find(
          (option) => nama && String(option.value) === String(nama),
        ) ||
        this.normalizedObatList.find(
          (option) => nama && String(option.title) === String(nama),
        ) ||
        this.normalizedObatList.find(
          (option) =>
            produkTokoId &&
            String(option.produk_toko_id || "") === String(produkTokoId),
        ) ||
        this.normalizedObatList.find(
          (option) =>
            produkId && String(option.produk_id || "") === String(produkId),
        ) ||
        null
      );
    },

    getItemStockInfo(item = {}) {
      const option = this.findSelectedObatOption(item) || {};
      const stokRaw = this.pickFirstNotEmpty([
        item?.stok_tersedia,
        item?.stok_available,
        item?.stok_bisa_dijual,
        item?.available_stock,
        item?.stock_available,
        item?.qty_available,
        item?.sisa_stok,
        item?.stok_akhir,
        item?.stock_akhir,
        item?.stok,
        item?.stock,
        option?.stok_tersedia,
      ]);
      const stokTerbaca = stokRaw !== null;
      const stokTersedia = stokTerbaca ? this.toNumber(stokRaw) : null;
      const stokMinimum = this.toNumber(
        this.pickFirstNotEmpty([
          item?.stok_minimum,
          item?.min_stock,
          item?.minimum_stock,
          option?.stok_minimum,
          0,
        ]),
      );
      const statusStok = item?.status_stok || option?.status_stok || "";

      return {
        stok_terbaca: stokTerbaca,
        stok_tersedia: stokTersedia,
        stok_minimum: stokMinimum,
        status_stok: statusStok,
        unit: item?.unit || option?.unit || "pcs",
      };
    },

    getItemStockMax(item = {}) {
      const info = this.getItemStockInfo(item);

      if (!info.stok_terbaca || Number(info.stok_tersedia || 0) <= 0) {
        return undefined;
      }

      return Number(info.stok_tersedia || 0);
    },

    getItemStockText(item = {}) {
      const info = this.getItemStockInfo(item);

      if (!item?.nama) return "-";

      if (!info.stok_terbaca) return "Tidak terbaca";

      return this.formatStock(info.stok_tersedia);
    },

    getItemStockStatus(item = {}) {
      const info = this.getItemStockInfo(item);

      if (!item?.nama || !info.stok_terbaca) return "";

      if (Number(info.stok_tersedia || 0) <= 0) return "Kosong";

      if (
        Number(info.stok_minimum || 0) > 0 &&
        Number(info.stok_tersedia || 0) <= Number(info.stok_minimum || 0)
      ) {
        return "Stok Minimum";
      }

      return info.status_stok &&
        !["TERSEDIA", "AVAILABLE"].includes(
          String(info.status_stok).toUpperCase(),
        )
        ? info.status_stok
        : "";
    },

    getItemStockColor(item = {}) {
      const info = this.getItemStockInfo(item);

      if (!item?.nama) return "blue-grey";

      if (!info.stok_terbaca) return "warning";

      if (Number(info.stok_tersedia || 0) <= 0) return "error";

      if (
        Number(info.stok_minimum || 0) > 0 &&
        Number(info.stok_tersedia || 0) <= Number(info.stok_minimum || 0)
      ) {
        return "warning";
      }

      return "success";
    },

    getItemStockError(item = {}) {
      if (!item?.nama) return "";

      const info = this.getItemStockInfo(item);

      if (!info.stok_terbaca) return "";

      if (Number(info.stok_tersedia || 0) <= 0) {
        return `Stok produk "${item.nama}" kosong.`;
      }

      const qty = this.toNumber(item?.qty || item?.jumlah || 0);

      if (qty > Number(info.stok_tersedia || 0)) {
        return `Qty produk "${item.nama}" melebihi stok tersedia (${this.formatStock(info.stok_tersedia)}).`;
      }

      return "";
    },

    getItemQtyError(item = {}) {
      const error = this.getItemStockError(item);

      if (!error) return "";

      if (String(error).includes("melebihi")) {
        const info = this.getItemStockInfo(item);
        return `Maksimal ${this.formatStock(info.stok_tersedia)}`;
      }

      return error;
    },

    getItemUnit(item = {}) {
      const option = this.findSelectedObatOption(item);

      return option?.unit || "";
    },

    aturanPakaiText(item) {
      const frekuensi = this.findOptionTitle(
        this.frekuensiList,
        item.frekuensi,
      );
      const waktu = this.findOptionTitle(this.waktuPakaiList, item.waktu_pakai);
      return [frekuensi, waktu].filter(Boolean).join(" - ") || "-";
    },

    findOptionTitle(options, value) {
      if (!value) return "";
      const selected = options.find(
        (option) => String(option.value) === String(value),
      );
      return selected?.title || value;
    },

    displayDiskonType(item) {
      if (this.getVoucherDiscountType) {
        const value = this.getVoucherDiscountType(item);

        if (value !== null && value !== undefined && value !== "") {
          return value;
        }
      }

      return item.diskon_type || item.manual_diskon_type || "%";
    },

    displayDiskonValue(item) {
      if (this.getVoucherDiscountValue) {
        const value = this.getVoucherDiscountValue(item);

        if (value !== null && value !== undefined && value !== "") {
          return value;
        }
      }

      return item.diskon || item.manual_diskon || 0;
    },

    displaySubtotal(item) {
      if (this.getDisplaySubtotal) {
        return this.getDisplaySubtotal(item);
      }

      return this.getSubtotal(item);
    },

    getOptionRaw(option) {
      return option?.raw || option || {};
    },

    pickFirstText(values = []) {
      const value = values.find(
        (item) =>
          item !== null && item !== undefined && String(item).trim() !== "",
      );

      return value !== undefined ? String(value).trim() : "-";
    },

    pickFirstNotEmpty(values = []) {
      const value = values.find(
        (item) => item !== null && item !== undefined && item !== "",
      );

      return value === undefined ? null : value;
    },

    toNumber(value) {
      const number = Number(value || 0);

      return Number.isNaN(number) ? 0 : number;
    },

    formatStock(value) {
      return Number(value || 0).toLocaleString("id-ID", {
        maximumFractionDigits: 4,
      });
    },
  },
};
</script>

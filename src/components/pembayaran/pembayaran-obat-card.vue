<template>
  <v-card variant="flat" class="mb-4 border">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-subtitle-1 font-weight-bold">Obat</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Produk dari registrasi layanan
          </div>
        </div>

        <v-btn
          color="primary"
          size="small"
          prepend-icon="mdi-plus"
          @click="$emit('add-item')"
        >
          Tambah Obat
        </v-btn>
      </div>

      <div
        v-if="!items || items.length === 0"
        class="d-flex flex-column align-center justify-center text-center pa-8"
      >
        <v-avatar color="grey-lighten-3" size="56" class="mb-3">
          <v-icon size="30" color="grey" icon="mdi-pill-off" />
        </v-avatar>
        <div class="text-subtitle-2 font-weight-bold mb-1">Belum ada obat</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
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
        class="mb-4"
      >
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar color="primary-lighten-5" size="36">
              <v-icon icon="mdi-pill" size="20" color="primary" />
            </v-avatar>
          </template>
          <div class="text-subtitle-1 font-weight-bold">
            Obat #{{ index + 1 }}
          </div>
          <v-card-subtitle class="text-caption pa-0 mt-1">
            Detail produk, qty, diskon, aturan pakai, dan subtotal
          </v-card-subtitle>

          <template #append>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click.stop="$emit('remove-item', index)"
            />
          </template>
        </v-card-item>

        <v-divider />

        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="5">
              <v-autocomplete
                :model-value="item.nama"
                :items="obatList"
                item-title="title"
                item-value="title"
                label="Nama Obat"
                placeholder="Pilih obat"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-pill"
                hide-details="auto"
                clearable
                @update:model-value="selectObat(index, $event)"
              />
            </v-col>

            <v-col cols="12" sm="4" md="2">
              <v-text-field
                :model-value="item.qty"
                label="Qty"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-counter"
                hide-details="auto"
                @update:model-value="updateField(index, 'qty', $event)"
              />
            </v-col>

            <v-col cols="12" sm="4" md="2">
              <v-text-field
                :model-value="item.unit || 'pcs'"
                label="Unit"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-package-variant-closed"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" sm="4" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div
                  class="d-flex align-center ga-2 text-caption text-medium-emphasis mb-1"
                >
                  <v-icon icon="mdi-cash" size="16" />
                  Harga
                </div>
                <div class="text-body-1 font-weight-bold text-high-emphasis">
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
                density="comfortable"
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
                density="comfortable"
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
                density="comfortable"
                prepend-inner-icon="mdi-clock-outline"
                hide-details="auto"
                clearable
                @update:model-value="updateField(index, 'frekuensi', $event)"
              />
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-sheet
                rounded="lg"
                border
                color="blue-lighten-5"
                class="pa-3 h-100"
              >
                <div
                  class="d-flex align-center ga-2 text-caption text-blue-darken-2 mb-1"
                >
                  <v-icon icon="mdi-calculator" size="16" />
                  Subtotal
                </div>
                <div class="text-body-1 font-weight-black text-blue-darken-4">
                  {{ formatCurrency(displaySubtotal(item)) }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row dense class="mt-1">
            <v-col cols="12" md="4">
              <v-select
                :model-value="item.waktu_pakai"
                :items="waktuPakaiList"
                item-title="title"
                item-value="value"
                label="Waktu Pakai"
                placeholder="Pilih waktu pakai"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-white-balance-sunny"
                hide-details="auto"
                clearable
                @update:model-value="updateField(index, 'waktu_pakai', $event)"
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div
                  class="d-flex align-center ga-2 text-caption text-medium-emphasis mb-1"
                >
                  <v-icon icon="mdi-clipboard-text-outline" size="16" />
                  Ringkasan Aturan Pakai
                </div>
                <div class="text-body-2 font-weight-bold text-high-emphasis">
                  {{ aturanPakaiText(item) }}
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
                density="comfortable"
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
  methods: {
    updateField(index, field, value) {
      this.$emit("update-item-field", {
        index,
        field,
        value,
      });
    },
    selectObat(index, value) {
      this.updateField(index, "nama", value);
      this.$nextTick(() => {
        this.$emit("fill-item", index);
      });
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
  },
};
</script>

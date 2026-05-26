<template>
  <div class="mb-6">
    <v-divider class="mb-5" />

    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-subtitle-1 font-weight-bold">Obat / Produk</div>

      <v-btn
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="mdi-plus"
        @click="addRow"
      >
        Tambah Produk
      </v-btn>
    </div>

    <v-card
      v-for="(item, index) in items"
      :key="`obat-${index}`"
      variant="outlined"
      class="mb-3"
    >
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-autocomplete
              :model-value="item.produk_toko_id"
              :items="options"
              item-title="label"
              item-value="value"
              label="Obat / Produk"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleProductChange(index, $event)"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              :model-value="item.harga"
              label="Harga"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              :model-value="item.jumlah"
              label="Jumlah"
              type="number"
              min="1"
              variant="outlined"
              density="comfortable"
              @update:model-value="updateItem(index, 'jumlah', $event, true)"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              :model-value="item.subtotal"
              label="Total"
              variant="outlined"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12" md="2">
            <div class="d-flex justify-end ga-2">
              <v-btn
                color="error"
                variant="tonal"
                icon="mdi-delete-outline"
                :disabled="items.length === 1"
                @click="removeRow(index)"
              />
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              :model-value="item.frekuensi"
              :items="frekuensiOptions"
              label="Frekuensi"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="updateItem(index, 'frekuensi', $event)"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              :model-value="item.waktu_pakai"
              :items="waktuPakaiOptions"
              label="Waktu Pakai"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="updateItem(index, 'waktu_pakai', $event)"
            />
          </v-col>

          <v-col cols="12" md="5">
            <v-textarea
              :model-value="item.penggunaan"
              label="Penggunaan"
              variant="outlined"
              rows="2"
              auto-grow
              @update:model-value="updateItem(index, 'penggunaan', $event)"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AntrianDokterObatSection",

  props: {
    items: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Array,
      default: () => [],
    },
    frekuensiOptions: {
      type: Array,
      default: () => [],
    },
    waktuPakaiOptions: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["update:items"],

  methods: {
    createEmptyItem() {
      return {
        id: null,
        produk_id: null,
        produk_toko_id: null,
        nama_produk: "",
        harga: 0,
        jumlah: 1,
        subtotal: 0,
        frekuensi: "",
        waktu_pakai: "",
        penggunaan: "",
      };
    },

    emitItems(nextItems) {
      this.$emit("update:items", nextItems);
    },

    addRow() {
      this.emitItems([...this.items, this.createEmptyItem()]);
    },

    removeRow(index) {
      if (this.items.length <= 1) return;

      const nextItems = [...this.items];
      nextItems.splice(index, 1);
      this.emitItems(nextItems);
    },

    handleProductChange(index, value) {
      const selected = this.options.find((item) => item.value === value);
      const nextItems = [...this.items];
      const current = { ...nextItems[index] };

      current.produk_toko_id = value || null;
      current.produk_id = selected?.produk_id || null;
      current.nama_produk = selected?.label || "";
      current.harga = selected?.harga || 0;
      current.jumlah = this.toNumber(current.jumlah) || 1;
      current.subtotal =
        this.toNumber(current.harga) * this.toNumber(current.jumlah);

      nextItems[index] = current;
      this.emitItems(nextItems);
    },

    updateItem(index, field, value, recalculate = false) {
      const nextItems = [...this.items];
      const current = { ...nextItems[index], [field]: value };

      if (recalculate) {
        current.jumlah = this.toNumber(current.jumlah) || 1;
        current.subtotal = this.toNumber(current.harga) * current.jumlah;
      }

      nextItems[index] = current;
      this.emitItems(nextItems);
    },

    toNumber(value) {
      if (typeof value === "number") return value;
      if (value === null || value === undefined || value === "") return 0;

      return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
    },
  },
};
</script>

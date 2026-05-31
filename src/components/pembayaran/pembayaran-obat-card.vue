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
          <v-icon size="30" color="grey">mdi-pill-off</v-icon>
        </v-avatar>

        <div class="text-subtitle-2 font-weight-bold mb-1">
          Belum ada produk
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Produk dari registrasi layanan atau resep dokter akan muncul di sini.
        </div>
      </div>

      <v-card
        v-for="(item, index) in items"
        :key="item.registrasi_penjualan_detail_id || `obat-${index}`"
        variant="outlined"
        class="mb-4"
      >
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="34">
              <v-icon icon="mdi-pill" size="18" />
            </v-avatar>
          </template>

          <div class="text-body-2 font-weight-bold">Obat #{{ index + 1 }}</div>
          <div class="text-caption text-medium-emphasis mt-1">
            Detail produk, qty, diskon, dan instruksi pemakaian
          </div>

          <template #append>
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              @click="$emit('remove-item', index)"
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
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-pill"
                hide-details="auto"
                clearable
                @update:model-value="updateField(index, 'nama', $event, true)"
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
                :model-value="item.unit"
                label="Unit"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-package-variant"
                bg-color="grey-lighten-5"
                readonly
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="4" md="3">
              <v-text-field
                :model-value="formatCurrency(item.harga)"
                label="Harga"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash"
                bg-color="grey-lighten-5"
                readonly
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="4" md="2">
              <v-select
                :model-value="item.diskon_type"
                :items="diskonTypeList"
                label="Tipe Diskon"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-percent-outline"
                bg-color="grey-lighten-5"
                readonly
                hide-details="auto"
                @update:model-value="updateField(index, 'diskon_type', $event)"
              />
            </v-col>

            <v-col cols="12" sm="4" md="3">
              <v-text-field
                :model-value="item.diskon"
                label="Nilai Diskon"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-sale-outline"
                :prefix="item.diskon_type === 'Rp' ? 'Rp' : ''"
                :suffix="item.diskon_type === '%' ? '%' : ''"
                bg-color="grey-lighten-5"
                readonly
                hide-details="auto"
                @update:model-value="updateField(index, 'diskon', $event)"
              />
            </v-col>

            <v-col cols="12" sm="4" md="3">
              <v-text-field
                :model-value="formatCurrency(getSubtotal(item))"
                label="Subtotal"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calculator"
                bg-color="grey-lighten-5"
                readonly
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6" md="2">
              <v-select
                :model-value="item.frekuensi"
                :items="frekuensiList"
                item-title="title"
                item-value="value"
                label="Frekuensi"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-clock-outline"
                hide-details="auto"
                @update:model-value="updateField(index, 'frekuensi', $event)"
              />
            </v-col>

            <v-col cols="12" sm="6" md="2">
              <v-select
                :model-value="item.waktu_pakai"
                :items="waktuPakaiList"
                item-title="title"
                item-value="value"
                label="Waktu Pakai"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-weather-sunny"
                hide-details="auto"
                @update:model-value="updateField(index, 'waktu_pakai', $event)"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                :model-value="item.penggunaan"
                label="Instruksi Pemakaian"
                rows="2"
                auto-grow
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-note-text-outline"
                hide-details="auto"
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
    items: { type: Array, default: () => [] },
    obatList: { type: Array, default: () => [] },
    diskonTypeList: { type: Array, default: () => [] },
    frekuensiList: { type: Array, default: () => [] },
    waktuPakaiList: { type: Array, default: () => [] },
    formatCurrency: { type: Function, required: true },
    getSubtotal: { type: Function, required: true },
  },

  emits: ["add-item", "remove-item", "update-item-field", "fill-item"],

  methods: {
    updateField(index, field, value, shouldFill = false) {
      this.$emit("update-item-field", { index, field, value });

      if (shouldFill) {
        this.$nextTick(() => {
          this.$emit("fill-item", index);
        });
      }
    },
  },
};
</script>

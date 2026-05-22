<template>
  <v-card class="section-card mb-4" variant="flat">
    <v-card-text class="pa-5">
      <div class="section-header-pembayaran">
        <div>
          <div class="section-title-pembayaran">Obat</div>
          <div class="section-subtitle">Produk dari registrasi layanan</div>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-plus"
          class="section-action-btn"
          @click="$emit('add-item')"
        >
          Tambah Obat
        </v-btn>
      </div>

      <div v-if="!items.length" class="empty-section-box">
        Belum ada produk.
      </div>

      <div
        v-for="(item, index) in items"
        :key="item.registrasi_penjualan_detail_id || `obat-${index}`"
        class="entry-card"
      >
        <div class="entry-card-header">
          <div class="entry-card-title">Obat #{{ index + 1 }}</div>

          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            @click="$emit('remove-item', index)"
          >
            <v-icon size="18">mdi-delete-outline</v-icon>
          </v-btn>
        </div>

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
              :prefix="item.diskon_type === 'Rp' ? 'Rp' : ''"
              :suffix="item.diskon_type === '%' ? '%' : ''"
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
              readonly
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              :model-value="item.frekuensi"
              :items="frekuensiList"
              label="Frekuensi"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="updateField(index, 'frekuensi', $event)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              :model-value="item.waktu_pakai"
              :items="waktuPakaiList"
              label="Waktu Pakai"
              variant="outlined"
              density="comfortable"
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
              hide-details="auto"
              @update:model-value="updateField(index, 'penggunaan', $event)"
            />
          </v-col>
        </v-row>
      </div>
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

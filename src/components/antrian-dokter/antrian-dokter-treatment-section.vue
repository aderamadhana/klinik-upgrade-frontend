<template>
  <div class="mb-6">
    <v-divider class="mb-5" />

    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-subtitle-1 font-weight-bold">Treatment</div>

      <v-btn
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="mdi-plus"
        @click="addRow"
      >
        Tambah Treatment
      </v-btn>
    </div>

    <v-card
      v-for="(item, index) in items"
      :key="`treatment-${index}`"
      variant="outlined"
      class="mb-3"
    >
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-autocomplete
              :model-value="item.treatment_toko_id"
              :items="options"
              item-title="label"
              item-value="value"
              label="Nama Treatment"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleTreatmentChange(index, $event)"
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
              :model-value="item.total"
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

          <v-col cols="12">
            <v-switch
              :model-value="item.perlu_tindakan_perawat"
              color="primary"
              hide-details
              inset
              label="Perlu tindakan perawat / lanjut ke Nurse Station"
              @update:model-value="
                updateItem(index, 'perlu_tindakan_perawat', $event)
              "
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AntrianDokterTreatmentSection",

  props: {
    items: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["update:items"],

  methods: {
    createEmptyItem() {
      return {
        id: null,
        treatment_id: null,
        treatment_toko_id: null,
        nama_treatment: "",
        harga: 0,
        jumlah: 1,
        total: 0,
        perlu_tindakan_perawat: false,
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

    handleTreatmentChange(index, value) {
      const selected = this.options.find((item) => item.value === value);
      const nextItems = [...this.items];
      const current = { ...nextItems[index] };

      current.treatment_toko_id = value || null;
      current.treatment_id = selected?.treatment_id || null;
      current.nama_treatment = selected?.label || "";
      current.harga = selected?.harga || 0;
      current.jumlah = this.toNumber(current.jumlah) || 1;
      current.total =
        this.toNumber(current.harga) * this.toNumber(current.jumlah);

      nextItems[index] = current;
      this.emitItems(nextItems);
    },

    updateItem(index, field, value, recalculate = false) {
      const nextItems = [...this.items];
      const current = { ...nextItems[index], [field]: value };

      if (recalculate) {
        current.jumlah = this.toNumber(current.jumlah) || 1;
        current.total = this.toNumber(current.harga) * current.jumlah;
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

<template>
  <v-card class="section-card mb-4" variant="flat">
    <v-card-text class="pa-5">
      <div class="section-header-pembayaran">
        <div>
          <div class="section-title-pembayaran">Treatment</div>
          <div class="section-subtitle">Treatment dari registrasi layanan</div>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-plus"
          class="section-action-btn"
          @click="$emit('add-item')"
        >
          Tambah Treatment
        </v-btn>
      </div>

      <div v-if="!items.length" class="empty-section-box">
        Belum ada treatment.
      </div>

      <div
        v-for="(item, index) in items"
        :key="item.registrasi_treatment_detail_id || `treatment-${index}`"
        class="entry-card"
      >
        <div class="entry-card-header">
          <div class="entry-card-title">Treatment #{{ index + 1 }}</div>

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
              :items="tindakanList"
              item-title="title"
              item-value="title"
              label="Nama Treatment"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-medical-bag"
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

          <v-col cols="12" sm="8" md="5">
            <v-select
              :model-value="item.beautician"
              :items="perawatList"
              item-title="title"
              item-value="title"
              label="Beautician / Perawat"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              clearable
              @update:model-value="updateField(index, 'beautician', $event)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              :model-value="formatCurrency(item.harga)"
              label="Harga"
              variant="outlined"
              density="comfortable"
              readonly
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
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

          <v-col cols="12" sm="6" md="3">
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

          <v-col cols="12" sm="6" md="4">
            <v-text-field
              :model-value="formatCurrency(getSubtotal(item))"
              label="Subtotal"
              readonly
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "PembayaranTreatmentCard",

  props: {
    items: { type: Array, default: () => [] },
    tindakanList: { type: Array, default: () => [] },
    perawatList: { type: Array, default: () => [] },
    diskonTypeList: { type: Array, default: () => [] },
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

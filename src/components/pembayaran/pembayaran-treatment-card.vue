<template>
  <v-card variant="flat" class="mb-4 border">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-subtitle-1 font-weight-bold">Treatment</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Treatment dari registrasi layanan
          </div>
        </div>

        <v-btn
          color="primary"
          size="small"
          prepend-icon="mdi-plus"
          @click="$emit('add-item')"
        >
          Tambah Treatment
        </v-btn>
      </div>

      <div
        v-if="!items || items.length === 0"
        class="d-flex flex-column align-center justify-center text-center pa-8"
      >
        <v-avatar color="grey-lighten-3" size="56" class="mb-3">
          <v-icon size="30" color="grey">
            mdi-face-woman-shimmer-outline
          </v-icon>
        </v-avatar>

        <div class="text-subtitle-2 font-weight-bold mb-1">
          Belum ada treatment
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Treatment dari registrasi layanan atau saran dokter akan muncul di
          sini.
        </div>
      </div>

      <v-card
        v-for="(item, index) in items"
        :key="item.registrasi_treatment_detail_id || `treatment-${index}`"
        variant="outlined"
        class="mb-4"
      >
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="34">
              <v-icon icon="mdi-medical-bag" size="18" />
            </v-avatar>
          </template>

          <div class="text-body-2 font-weight-bold">
            Treatment #{{ index + 1 }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Detail treatment, beautician, qty, diskon, dan subtotal
          </div>

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
                prepend-inner-icon="mdi-counter"
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
                prepend-inner-icon="mdi-account-heart-outline"
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
                prepend-inner-icon="mdi-cash"
                bg-color="grey-lighten-5"
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
                prepend-inner-icon="mdi-percent-outline"
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
                prepend-inner-icon="mdi-sale-outline"
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
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calculator"
                bg-color="grey-lighten-5"
                readonly
                hide-details="auto"
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

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
          <v-icon
            size="30"
            color="grey"
            icon="mdi-face-woman-shimmer-outline"
          />
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
        :key="
          item.invoice_item_id ||
          item.registrasi_treatment_detail_id ||
          `treatment-${index}`
        "
        variant="outlined"
        rounded="lg"
        class="mb-4"
      >
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar color="primary-lighten-5" size="36">
              <v-icon icon="mdi-medical-bag" size="20" color="primary" />
            </v-avatar>
          </template>
          <div class="text-subtitle-1 font-weight-bold">
            Treatment #{{ index + 1 }}
          </div>
          <v-card-subtitle class="text-caption pa-0 mt-1">
            Detail treatment, beautician, qty, diskon, dan subtotal
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
          </v-row>

          <v-row dense class="mt-1">
            <v-col cols="12" sm="6" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div
                  class="d-flex align-center ga-2 text-caption text-medium-emphasis mb-1"
                >
                  <v-icon icon="mdi-cash" size="16" />
                  Harga
                </div>
                <div class="text-body-1 font-weight-bold text-high-emphasis">
                  {{ formatCurrency(item.harga) }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-select
                :model-value="displayDiskonType(item)"
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
                label="Nilai Diskon"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-sale-outline"
                :model-value="displayDiskonValue(item)"
                :prefix="displayDiskonType(item) === 'Rp' ? 'Rp' : ''"
                :suffix="displayDiskonType(item) === '%' ? '%' : ''"
                hide-details="auto"
                @update:model-value="updateField(index, 'diskon', $event)"
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
    updateField(index, field, value, shouldFill = false) {
      this.$emit("update-item-field", { index, field, value });
      if (shouldFill) {
        this.$nextTick(() => {
          this.$emit("fill-item", index);
        });
      }
    },
    displayDiskonType(item) {
      if (this.getVoucherDiscountType) {
        const value = this.getVoucherDiscountType(item);

        if (value !== null && value !== undefined && value !== "") {
          return value;
        }
      }

      return item.diskon_type || "%";
    },

    displayDiskonValue(item) {
      if (this.getVoucherDiscountValue) {
        const value = this.getVoucherDiscountValue(item);

        if (value !== null && value !== undefined && value !== "") {
          return value;
        }
      }

      return item.diskon || 0;
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

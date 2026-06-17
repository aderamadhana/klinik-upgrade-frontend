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
        class="mb-4 overflow-hidden"
      >
        <v-card-item class="px-4 py-3 bg-grey-lighten-5">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="38">
              <v-icon icon="mdi-medical-bag" size="20" />
            </v-avatar>
          </template>

          <div class="text-subtitle-1 font-weight-bold">
            Treatment #{{ index + 1 }}
          </div>

          <v-card-subtitle class="text-caption pa-0 mt-1">
            Pilih treatment, pelaksana, jumlah, dan diskon
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
            <v-col cols="12" lg="5" md="5">
              <v-autocomplete
                :model-value="item.nama"
                :items="tindakanList"
                item-title="title"
                item-value="title"
                label="Nama Treatment"
                placeholder="Pilih treatment"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-medical-bag-outline"
                hide-details="auto"
                clearable
                @update:model-value="updateField(index, 'nama', $event, true)"
              />
            </v-col>

            <v-col cols="12" sm="4" lg="2" md="2">
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

            <v-col cols="12" sm="8" lg="5" md="5">
              <v-autocomplete
                :model-value="resolvePerawatId(item)"
                :items="normalizedPerawatList"
                item-title="title"
                item-value="value"
                label="Nurse / Beautician"
                placeholder="Pilih nurse / beautician"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-heart-outline"
                hide-details="auto"
                clearable
                no-data-text="Data nurse / beautician tidak tersedia"
                @update:model-value="onPerawatChange(index, $event)"
              />
            </v-col>
          </v-row>

          <v-row dense class="mt-2">
            <v-col cols="12" sm="6" lg="3" md="3">
              <v-sheet rounded="lg" border class="pa-3 h-100">
                <div
                  class="d-flex align-center ga-2 text-caption text-medium-emphasis mb-1"
                >
                  <v-icon icon="mdi-cash" size="16" />
                  Harga Satuan
                </div>
                <div class="text-body-1 font-weight-bold text-high-emphasis">
                  {{ formatCurrency(item.harga) }}
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="6" lg="3" md="3">
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

            <v-col cols="12" sm="6" lg="3" md="3">
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

            <v-col cols="12" sm="6" lg="3" md="3">
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
    discountReadonly: { type: Boolean, default: false },
    formatCurrency: { type: Function, required: true },
    getSubtotal: { type: Function, required: true },
    getDisplaySubtotal: { type: Function, default: null },
    getVoucherDiscountType: { type: Function, default: null },
    getVoucherDiscountValue: { type: Function, default: null },
  },

  emits: ["add-item", "remove-item", "update-item-field", "fill-item"],

  computed: {
    normalizedPerawatList() {
      const rows = Array.isArray(this.perawatList)
        ? this.perawatList
        : Array.isArray(this.perawatList?.data)
          ? this.perawatList.data
          : [];

      return rows
        .map((option) => {
          const raw = option?.raw || {};
          const source = {
            ...raw,
            ...option,
          };

          const value = source.value ?? source.id ?? source.karyawan_id ?? null;
          const nama =
            source.nama ||
            source.nama_karyawan ||
            source.label ||
            source.title ||
            "";
          const namaJabatan =
            source.nama_jabatan ||
            source.jabatan_nama ||
            source.subtitle ||
            source.jabatan?.nama_jabatan ||
            source.jabatan?.nama ||
            "";
          const title =
            source.title ||
            [nama, namaJabatan].filter(Boolean).join(" - ") ||
            "";

          return {
            ...source,
            value,
            title,
            nama,
            nama_jabatan: namaJabatan,
          };
        })
        .filter(
          (option) =>
            option.value !== null &&
            option.value !== undefined &&
            option.value !== "" &&
            option.title,
        );
    },
  },

  methods: {
    updateField(index, field, value, shouldFill = false) {
      this.$emit("update-item-field", { index, field, value });

      if (shouldFill) {
        this.$nextTick(() => {
          this.$emit("fill-item", index);
        });
      }
    },

    resolvePerawatId(item) {
      const value = item?.perawat_id ?? item?.beautician_id ?? null;

      if (value === null || value === undefined || value === "") {
        return null;
      }

      const selected = this.normalizedPerawatList.find(
        (option) => String(option.value) === String(value),
      );

      return selected ? selected.value : value;
    },

    onPerawatChange(index, selectedId) {
      const hasValue =
        selectedId !== null && selectedId !== undefined && selectedId !== "";

      const selected = hasValue
        ? this.normalizedPerawatList.find(
            (option) => String(option.value) === String(selectedId),
          )
        : null;

      const resolvedId = selected?.value ?? (hasValue ? selectedId : null);
      const resolvedName =
        selected?.nama ||
        selected?.nama_karyawan ||
        selected?.label ||
        selected?.title ||
        "";
      const resolvedJobCode =
        selected?.kode_jabatan ?? selected?.jabatan_kode ?? "";
      const resolvedJobName =
        selected?.nama_jabatan ??
        selected?.jabatan_nama ??
        selected?.subtitle ??
        "";

      this.updateField(index, "perawat_id", resolvedId);
      this.updateField(index, "beautician_id", resolvedId);
      this.updateField(index, "perawat_nama", resolvedName);
      this.updateField(index, "beautician", resolvedName);
      this.updateField(index, "perawat_jabatan_kode", resolvedJobCode);
      this.updateField(index, "perawat_jabatan_nama", resolvedJobName);
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

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1080"
    persistent
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="rounded-lg" elevation="8">
      <v-sheet color="primary" class="pa-5">
        <div class="d-flex align-start justify-space-between ga-4">
          <div class="d-flex align-start ga-3">
            <v-avatar color="blue-lighten-5" rounded="lg" size="44">
              <v-icon icon="mdi-truck-delivery-outline" color="primary" />
            </v-avatar>

            <div>
              <div class="text-h6 font-weight-bold text-white">
                Penerimaan Stok
              </div>
              <div class="text-body-2 text-blue-lighten-5 mt-1">
                Catat barang masuk, harga beli, harga jual, lalu simpan sebagai
                draft atau langsung posting stok.
              </div>
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            density="comfortable"
            @click="$emit('update:modelValue', false)"
          />
        </div>
      </v-sheet>

      <v-card-text class="pa-5 bg-grey-lighten-5">
        <v-card class="rounded-lg border" elevation="0">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-2 mb-4">
              <v-icon icon="mdi-file-document-outline" color="primary" />
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Informasi Dokumen
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Lengkapi tanggal penerimaan dan data faktur supplier.
                </div>
              </div>
            </div>

            <v-row dense>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="form.tanggal"
                  type="date"
                  label="Tanggal"
                  prepend-inner-icon="mdi-calendar-outline"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-autocomplete
                  v-model="form.supplier_id"
                  :items="supplierOptions"
                  item-title="nama_supplier"
                  item-value="id"
                  label="Supplier"
                  prepend-inner-icon="mdi-store-outline"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details="auto"
                  no-data-text="Supplier tidak ditemukan"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="form.no_faktur_supplier"
                  label="No Faktur Supplier"
                  prepend-inner-icon="mdi-receipt-text-outline"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="form.tanggal_faktur"
                  type="date"
                  label="Tanggal Faktur"
                  prepend-inner-icon="mdi-calendar-check-outline"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="rounded-lg border mt-4" elevation="0">
          <v-card-text class="pa-4 pb-0">
            <div
              class="d-flex align-start justify-space-between ga-3 flex-wrap"
            >
              <div class="d-flex align-center ga-2 mb-4">
                <v-icon icon="mdi-package-variant-closed" color="primary" />

                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Detail Produk Masuk
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Pilih produk, isi qty, harga beli, dan harga jual terbaru.
                  </div>
                </div>
              </div>

              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-plus"
                class="text-none"
                @click="$emit('add-row')"
              >
                Tambah Produk
              </v-btn>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-text class="pa-4">
            <v-alert
              v-if="!detailRows.length"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-4"
            >
              Belum ada produk. Klik Tambah Produk untuk mulai input barang
              masuk.
            </v-alert>

            <v-card
              v-for="(row, index) in detailRows"
              :key="index"
              class="rounded-lg border mb-3"
              elevation="0"
            >
              <v-card-text class="pa-4">
                <div
                  class="d-flex align-center justify-space-between ga-3 mb-3"
                >
                  <div class="d-flex align-center ga-2">
                    <v-chip color="primary" variant="tonal" size="small" label>
                      Produk {{ index + 1 }}
                    </v-chip>
                  </div>

                  <v-btn
                    v-if="detailRows.length > 1"
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    density="comfortable"
                    size="small"
                    @click="$emit('remove-row', index)"
                  />
                </div>

                <v-row dense align="center">
                  <v-col cols="12" md="5">
                    <v-autocomplete
                      v-model="row.produk_toko_id"
                      :items="produkOptions"
                      item-title="label_produk"
                      item-value="produk_toko_id"
                      label="Produk"
                      placeholder="Cari kode / nama produk"
                      prepend-inner-icon="mdi-magnify"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      no-data-text="Produk tidak ditemukan"
                      @update:model-value="$emit('produk-changed', row)"
                    />
                  </v-col>

                  <v-col cols="12" sm="4" md="2">
                    <v-text-field
                      v-model.number="row.qty"
                      type="number"
                      min="0"
                      label="Qty"
                      prepend-inner-icon="mdi-counter"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hide-spin-buttons
                    />
                  </v-col>

                  <v-col cols="12" sm="4" md="2">
                    <v-text-field
                      v-model.number="row.harga_beli"
                      type="number"
                      min="0"
                      label="Harga Beli"
                      prefix="Rp"
                      variant="outlined"
                      density="compact"
                      readonly
                      hide-details="auto"
                      hide-spin-buttons
                    />
                  </v-col>

                  <v-col cols="12" sm="4" md="2">
                    <v-text-field
                      v-model.number="row.harga_jual"
                      type="number"
                      min="0"
                      label="Harga Jual"
                      prefix="Rp"
                      variant="outlined"
                      density="compact"
                      readonly
                      hide-details="auto"
                      hide-spin-buttons
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>

        <v-card class="rounded-lg border mt-4" elevation="0">
          <v-card-text class="pa-4">
            <v-textarea
              v-model="form.catatan"
              label="Catatan"
              placeholder="Tambahkan catatan penerimaan bila diperlukan"
              prepend-inner-icon="mdi-note-text-outline"
              variant="outlined"
              density="compact"
              rows="2"
              auto-grow
              hide-details="auto"
            />
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 justify-end flex-wrap ga-2">
        <v-btn
          variant="text"
          class="text-none"
          :disabled="loading"
          @click="$emit('update:modelValue', false)"
        >
          Batal
        </v-btn>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-content-save-outline"
          class="text-none"
          :loading="loading"
          @click="$emit('submit-draft')"
        >
          Simpan Draft
        </v-btn>

        <v-btn
          color="success"
          variant="elevated"
          prepend-icon="mdi-check-circle-outline"
          class="text-none"
          :loading="loading"
          @click="$emit('submit-post')"
        >
          Simpan & Posting
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "StockPenerimaanDialog",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      required: true,
    },
    supplierOptions: {
      type: Array,
      default: () => [],
    },
    produkOptions: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    formatCurrency: {
      type: Function,
      required: true,
    },
  },

  emits: [
    "update:modelValue",
    "add-row",
    "remove-row",
    "produk-changed",
    "submit-draft",
    "submit-post",
  ],

  computed: {
    detailRows() {
      return this.form && Array.isArray(this.form.details)
        ? this.form.details
        : [];
    },

    totalItems() {
      return this.detailRows.length;
    },

    completedRows() {
      return this.detailRows.filter((row) => {
        return row.produk_toko_id && this.toNumber(row.qty) > 0;
      }).length;
    },

    totalQty() {
      return this.detailRows.reduce((total, row) => {
        return total + this.toNumber(row.qty);
      }, 0);
    },

    totalNominal() {
      return this.detailRows.reduce((total, row) => {
        return total + this.lineSubtotal(row);
      }, 0);
    },
  },

  methods: {
    toNumber(value) {
      const number = Number(value || 0);
      return Number.isFinite(number) ? number : 0;
    },

    lineSubtotal(row) {
      return this.toNumber(row?.qty) * this.toNumber(row?.harga_beli);
    },
  },
};
</script>

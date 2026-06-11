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
              <v-icon icon="mdi-clipboard-edit-outline" color="primary" />
            </v-avatar>

            <div>
              <div class="text-h6 font-weight-bold text-white">
                Penyesuaian Stok
              </div>
              <div class="text-body-2 text-blue-lighten-5 mt-1">
                Gunakan untuk stok awal, koreksi stok, atau hasil opname. Sistem
                akan menghitung selisih otomatis.
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
                  Informasi Penyesuaian
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Tentukan tanggal dan jenis penyesuaian stok.
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

              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="form.jenis_penyesuaian"
                  :items="jenisPenyesuaianOptions"
                  label="Jenis Penyesuaian"
                  prepend-inner-icon="mdi-tune-variant"
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
                    Detail Koreksi Stok
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Pilih produk, isi stok fisik, lalu cek selisih dari stok
                    sistem.
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
              Belum ada produk. Klik Tambah Produk untuk mulai input koreksi
              stok.
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
                  <div class="d-flex align-center ga-2 flex-wrap">
                    <v-chip color="primary" variant="tonal" size="small" label>
                      Produk {{ index + 1 }}
                    </v-chip>

                    <v-chip
                      size="small"
                      label
                      :color="selisihColor(row)"
                      variant="tonal"
                    >
                      Selisih {{ formatNumber(getSelisih(row)) }}
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
                  <v-col cols="12" md="4">
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

                  <v-col cols="12" sm="6" md="2">
                    <v-text-field
                      :model-value="formatNumber(row.stok_sistem)"
                      label="Stok Sistem"
                      prepend-inner-icon="mdi-database-outline"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      readonly
                    />
                  </v-col>

                  <v-col cols="12" sm="6" md="2">
                    <v-text-field
                      v-model.number="row.stok_fisik"
                      type="number"
                      min="0"
                      label="Stok Fisik"
                      prepend-inner-icon="mdi-clipboard-check-outline"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hide-spin-buttons
                    />
                  </v-col>

                  <v-col cols="12" sm="6" md="2">
                    <v-sheet
                      class="rounded-lg border pa-3 bg-grey-lighten-5 h-100 d-flex flex-column justify-center"
                    >
                      <div class="text-caption text-medium-emphasis">
                        Selisih
                      </div>
                      <div class="text-body-2 font-weight-bold">
                        <v-chip
                          size="small"
                          label
                          :color="selisihColor(row)"
                          variant="tonal"
                        >
                          {{ formatNumber(getSelisih(row)) }}
                        </v-chip>
                      </div>
                    </v-sheet>
                  </v-col>

                  <v-col cols="12" sm="6" md="2">
                    <v-text-field
                      v-model="row.keterangan"
                      label="Keterangan"
                      placeholder="Opsional"
                      prepend-inner-icon="mdi-note-outline"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
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
              placeholder="Tambahkan catatan penyesuaian bila diperlukan"
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
  name: "StockPenyesuaianDialog",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      required: true,
    },
    produkOptions: {
      type: Array,
      default: () => [],
    },
    jenisPenyesuaianOptions: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    getSelisih: {
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
        return row.produk_toko_id && this.toNumber(row.stok_fisik) >= 0;
      }).length;
    },

    totalStokSistem() {
      return this.detailRows.reduce((total, row) => {
        return total + this.toNumber(row.stok_sistem);
      }, 0);
    },

    totalStokFisik() {
      return this.detailRows.reduce((total, row) => {
        return total + this.toNumber(row.stok_fisik);
      }, 0);
    },

    totalSelisih() {
      return this.detailRows.reduce((total, row) => {
        return total + this.toNumber(this.getSelisih(row));
      }, 0);
    },
  },

  methods: {
    toNumber(value) {
      const number = Number(value || 0);
      return Number.isFinite(number) ? number : 0;
    },

    selisihColor(row) {
      const selisih = this.toNumber(this.getSelisih(row));

      if (selisih < 0) {
        return "error";
      }

      if (selisih > 0) {
        return "success";
      }

      return "grey";
    },
  },
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1180"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="dialog-title">
        <div>
          <div>Penyesuaian Stok</div>
          <div class="dialog-subtitle">
            Gunakan untuk stok awal, koreksi stok, atau opname.
          </div>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="form.tanggal"
              type="date"
              label="Tanggal"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="form.tempat_produk_id"
              :items="tempatProdukOptions"
              item-title="nama_tempat_produk"
              item-value="id"
              label="Tempat Stok"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="form.jenis_penyesuaian"
              :items="jenisPenyesuaianOptions"
              label="Jenis Penyesuaian"
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>

        <div class="form-section-head">
          <div>
            <div class="section-title">Detail Koreksi Stok</div>
            <div class="section-subtitle">
              Isi stok fisik. Sistem akan menghitung selisih otomatis.
            </div>
          </div>

          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            prepend-icon="mdi-plus"
            @click="$emit('add-row')"
          >
            Tambah Produk
          </v-btn>
        </div>

        <v-table density="compact" class="form-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th style="width: 150px">Stok Sistem</th>
              <th style="width: 150px">Stok Fisik</th>
              <th style="width: 150px">Selisih</th>
              <th style="width: 220px">Keterangan</th>
              <th style="width: 60px"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in form.details" :key="index">
              <td>
                <v-autocomplete
                  v-model="row.produk_toko_id"
                  :items="produkOptions"
                  item-title="label_produk"
                  item-value="produk_toko_id"
                  placeholder="Pilih produk"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="$emit('produk-changed', row)"
                />
              </td>

              <td>
                <v-text-field
                  :model-value="formatNumber(row.stok_sistem)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  readonly
                />
              </td>

              <td>
                <v-text-field
                  v-model.number="row.stok_fisik"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </td>

              <td>
                <v-chip
                  size="small"
                  :color="
                    getSelisih(row) < 0
                      ? 'error'
                      : getSelisih(row) > 0
                        ? 'success'
                        : 'grey'
                  "
                  variant="tonal"
                >
                  {{ formatNumber(getSelisih(row)) }}
                </v-chip>
              </td>

              <td>
                <v-text-field
                  v-model="row.keterangan"
                  placeholder="Opsional"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </td>

              <td class="text-right">
                <v-btn
                  v-if="form.details.length > 1"
                  icon="mdi-delete-outline"
                  size="small"
                  color="error"
                  variant="text"
                  @click="$emit('remove-row', index)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-textarea
          v-model="form.catatan"
          label="Catatan"
          variant="outlined"
          density="compact"
          rows="2"
          class="mt-4"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          Batal
        </v-btn>

        <v-btn
          color="primary"
          variant="tonal"
          :loading="loading"
          @click="$emit('submit-draft')"
        >
          Simpan Draft
        </v-btn>

        <v-btn color="success" :loading="loading" @click="$emit('submit-post')">
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
    tempatProdukOptions: {
      type: Array,
      default: () => [],
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
};
</script>

<style scoped>
.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dialog-subtitle,
.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.form-section-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  margin: 10px 0 12px;
}

.form-table {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .form-section-head {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>

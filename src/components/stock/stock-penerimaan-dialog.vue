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
          <div>Penerimaan Stok</div>
          <div class="dialog-subtitle">
            Catat barang masuk, lalu posting untuk menambah saldo stok.
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
            <v-autocomplete
              v-model="form.supplier_id"
              :items="supplierOptions"
              item-title="nama_supplier"
              item-value="id"
              label="Supplier"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="form.no_faktur_supplier"
              label="No Faktur Supplier"
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>

        <div class="form-section-head">
          <div>
            <div class="section-title">Detail Produk Masuk</div>
            <div class="section-subtitle">
              Pilih produk, isi jumlah, harga beli, dan harga jual terakhir.
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
              <th style="width: 110px">Qty</th>
              <th style="width: 160px">Harga Beli</th>
              <th style="width: 160px">Harga Jual</th>
              <th style="width: 150px">Subtotal</th>
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
                  v-model.number="row.qty"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </td>

              <td>
                <v-text-field
                  v-model.number="row.harga_beli"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </td>

              <td>
                <v-text-field
                  v-model.number="row.harga_jual"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </td>

              <td>
                <strong>
                  {{
                    formatCurrency(
                      Number(row.qty || 0) * Number(row.harga_beli || 0),
                    )
                  }}
                </strong>
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
    tempatProdukOptions: {
      type: Array,
      default: () => [],
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

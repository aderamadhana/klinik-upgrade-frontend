<template>
  <v-card elevation="2" class="mb-5">
    <v-card-text class="pa-6">
      <div class="section-header mb-5">
        <div>
          <div class="section-title">Detail Penjualan Langsung</div>
          <div class="section-subtitle">
            Tambahkan obat atau produk yang dijual langsung kepada pasien
          </div>
        </div>

        <v-chip color="primary" variant="tonal" prepend-icon="mdi-pill">
          Step 6 - Penjualan
        </v-chip>
      </div>

      <v-alert
        type="warning"
        variant="tonal"
        rounded="lg"
        border="start"
        class="mb-5"
      >
        Item penjualan di bagian ini masih bersifat draft awal. Finalisasi harga
        dan tagihan dilakukan setelah proses layanan.
      </v-alert>

      <div class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="primary"> mdi-cart-outline </v-icon>
            Informasi Penjualan
          </div>
          <div class="group-subtitle">
            Pilih produk, jumlah, diskon, serta aturan penggunaan obat atau
            produk
          </div>
        </div>

        <v-row dense class="mb-2">
          <v-col cols="12" md="3">
            <v-text-field
              :model-value="pj.poin"
              label="Poin"
              type="number"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-star-circle-outline"
              hide-details="auto"
              @update:modelValue="
                updateMetaField('poin', normalizeNumber($event))
              "
            />
          </v-col>
        </v-row>

        <div
          v-for="(item, index) in pj.items"
          :key="'penjualan-' + index"
          class="line-item mb-4"
        >
          <div class="line-item__header mb-3">
            <div class="line-item__title">Item Penjualan #{{ index + 1 }}</div>

            <div class="d-flex ga-2">
              <v-btn
                color="warning"
                variant="flat"
                size="small"
                prepend-icon="mdi-plus"
                @click="$emit('add-penjualan-item')"
              >
                Tambah
              </v-btn>

              <v-btn
                color="error"
                variant="flat"
                size="small"
                prepend-icon="mdi-minus"
                :disabled="pj.items.length === 1"
                @click="$emit('remove-penjualan-item', index)"
              >
                Hapus
              </v-btn>
            </div>
          </div>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                :model-value="item.produk_id"
                label="Nama Obat / Produk"
                :items="obatList"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
                @update:modelValue="updateItemField(index, 'produk_id', $event)"
              >
                <template #message>
                  Pilih produk yang akan dijual kepada pasien
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                :model-value="item.harga"
                label="Harga Estimasi"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="
                  updateItemField(index, 'harga', normalizeNumber($event))
                "
              >
                <template #message>
                  Otomatis terisi saat produk dipilih, tetapi tetap bisa diubah
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                :model-value="item.jumlah"
                label="Jumlah"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="
                  updateItemField(index, 'jumlah', normalizeNumber($event, 1))
                "
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                :model-value="item.unit"
                label="Unit"
                :items="unitList"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="updateItemField(index, 'unit', $event)"
              />
            </v-col>

            <v-col cols="12" md="2">
              <div class="summary-mini h-100">
                <div class="summary-mini__label">Produk</div>
                <div class="summary-mini__text">
                  {{
                    getSelectedProdukName(item.produk_id) ||
                    "Belum pilih produk"
                  }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                :model-value="item.diskon_type"
                label="Tipe Diskon"
                :items="diskonTypeList"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="
                  updateItemField(index, 'diskon_type', $event)
                "
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                :model-value="item.diskon_value"
                label="Diskon"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="
                  updateItemField(
                    index,
                    'diskon_value',
                    normalizeNumber($event),
                  )
                "
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                :model-value="item.diskon_referral"
                label="Referral"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="
                  updateItemField(
                    index,
                    'diskon_referral',
                    normalizeNumber($event),
                  )
                "
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                :model-value="
                  'Rp ' + formatNumberLocal(getPenjualanSubtotalLocal(item))
                "
                label="Subtotal Estimasi"
                variant="outlined"
                density="comfortable"
                readonly
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row dense>
            <v-col cols="12" md="3">
              <v-select
                :model-value="item.frekuensi"
                label="Frekuensi"
                :items="frekuensiList"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="updateItemField(index, 'frekuensi', $event)"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                :model-value="item.waktu_pakai"
                label="Waktu Pakai"
                :items="waktuPakaiList"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="
                  updateItemField(index, 'waktu_pakai', $event)
                "
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-textarea
                :model-value="item.penggunaan"
                label="Penggunaan"
                rows="2"
                auto-grow
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="
                  updateItemField(index, 'penggunaan', $event)
                "
              >
                <template #message>
                  Contoh: Oles tipis pada malam hari, hindari area mata
                </template>
              </v-textarea>
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="group-wrap">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="success"> mdi-cash-multiple </v-icon>
            Ringkasan Penjualan
          </div>
          <div class="group-subtitle">
            Total estimasi seluruh item penjualan yang sudah dipilih
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Total Item Penjualan</div>
              <div class="summary-value">
                {{ pj.items.length }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Total Poin</div>
              <div class="summary-value">
                {{ pj.poin || 0 }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Total Estimasi</div>
              <div class="summary-value">
                Rp {{ formatNumberLocal(totalPenjualanLocal) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "PenjualanSection",
  props: {
    form: {
      type: Object,
      required: true,
    },
    rules: {
      type: Object,
      required: true,
    },
    obatList: {
      type: Array,
      default: () => [],
    },
    unitList: {
      type: Array,
      default: () => [],
    },
    diskonTypeList: {
      type: Array,
      default: () => [],
    },
    frekuensiList: {
      type: Array,
      default: () => [],
    },
    waktuPakaiList: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    "update-penjualan-meta",
    "update-penjualan-item",
    "add-penjualan-item",
    "remove-penjualan-item",
  ],
  computed: {
    pj() {
      return (
        this.form?.penjualan || {
          poin: 0,
          items: [
            {
              produk_id: null,
              harga: 0,
              jumlah: 1,
              unit: "PCS",
              diskon_type: "%",
              diskon_value: 0,
              diskon_referral: 0,
              frekuensi: "",
              waktu_pakai: "",
              penggunaan: "",
            },
          ],
        }
      );
    },

    totalPenjualanLocal() {
      return this.pj.items.reduce((sum, item) => {
        return sum + this.getPenjualanSubtotalLocal(item);
      }, 0);
    },
  },
  methods: {
    updateMetaField(field, value) {
      this.$emit("update-penjualan-meta", { field, value });
    },

    updateItemField(index, field, value) {
      this.$emit("update-penjualan-item", { index, field, value });
    },

    normalizeNumber(value, fallback = 0) {
      const num = Number(value);
      return Number.isNaN(num) ? fallback : num;
    },

    formatNumberLocal(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    getDiskonAmount(base, type, value) {
      const numericBase = Number(base || 0);
      const numericValue = Number(value || 0);

      if (type === "%") {
        return (numericBase * numericValue) / 100;
      }

      return numericValue;
    },

    getPenjualanSubtotalLocal(item) {
      const base = Number(item.harga || 0) * Number(item.jumlah || 0);
      const diskon = this.getDiskonAmount(
        base,
        item.diskon_type,
        item.diskon_value,
      );
      const referral = Number(item.diskon_referral || 0);

      return Math.max(base - diskon - referral, 0);
    },

    getSelectedProdukName(produkId) {
      const item = this.obatList.find((x) => x.id === produkId);
      return item ? item.nama : "";
    },
  },
};
</script>

<style scoped>
.penjualan-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.group-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 20px;
  background: #fff;
}

.group-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.group-subtitle {
  font-size: 13px;
  color: #6b7280;
}

.line-item {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: #fcfcfd;
}

.line-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.line-item__title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.summary-box {
  height: 100%;
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.summary-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

.summary-mini {
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 12px;
  background: #f8fafc;
}

.summary-mini__label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.summary-mini__text {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.5;
}

.h-100 {
  height: 100%;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .group-wrap {
    padding: 16px;
  }
}
</style>

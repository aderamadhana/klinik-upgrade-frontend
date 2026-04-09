<template>
  <v-card elevation="2" class="mb-5">
    <v-card-text class="pa-6">
      <div class="section-header mb-5">
        <div>
          <div class="section-title">Detail Treatment</div>
          <div class="section-subtitle">
            Tambahkan tindakan treatment yang akan dijalani pasien
          </div>
        </div>

        <v-chip color="primary" variant="tonal" prepend-icon="mdi-spa">
          Step 5 - Treatment
        </v-chip>
      </div>

      <v-alert
        type="warning"
        variant="tonal"
        rounded="lg"
        border="start"
        class="mb-5"
      >
        Nominal di bagian ini masih bersifat estimasi awal. Finalisasi harga
        dilakukan pada tahap layanan atau tagihan.
      </v-alert>

      <div class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="primary">
              mdi-clipboard-list-outline
            </v-icon>
            Informasi Treatment
          </div>
          <div class="group-subtitle">
            Pilih tindakan, beautician, jumlah, dan estimasi nominal treatment
          </div>
        </div>

        <div
          v-for="(item, index) in form.treatment.items"
          :key="'treatment-' + index"
          class="line-item mb-4"
        >
          <div class="line-item__header mb-3">
            <div class="line-item__title">Treatment #{{ index + 1 }}</div>

            <div class="d-flex ga-2">
              <v-btn
                color="warning"
                variant="flat"
                size="small"
                prepend-icon="mdi-plus"
                @click="$emit('add-treatment-item')"
              >
                Tambah
              </v-btn>

              <v-btn
                color="error"
                variant="flat"
                size="small"
                prepend-icon="mdi-minus"
                :disabled="form.treatment.items.length === 1"
                @click="$emit('remove-treatment-item', index)"
              >
                Hapus
              </v-btn>
            </div>
          </div>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                :model-value="item.tindakan_id"
                label="Tindakan"
                :items="tindakanList"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
                @update:modelValue="
                  updateItemField(index, 'tindakan_id', $event)
                "
              >
                <template #message>
                  Pilih treatment yang akan dijalani pasien
                </template>
              </v-select>
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
              >
                <template #message> Minimal 1 </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                :model-value="item.beautician_id"
                label="Beautician"
                :items="perawatList"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details="auto"
                @update:modelValue="
                  updateItemField(index, 'beautician_id', $event)
                "
              />
            </v-col>

            <v-col cols="12" md="3">
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
                  Otomatis terisi saat tindakan dipilih, tapi tetap bisa diubah
                </template>
              </v-text-field>
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
                :model-value="'Rp ' + formatNumber(getTreatmentSubtotal(item))"
                label="Subtotal Estimasi"
                variant="outlined"
                density="comfortable"
                readonly
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <div class="summary-mini h-100">
                <div class="summary-mini__label">Ringkasan</div>
                <div class="summary-mini__text">
                  {{
                    getSelectedTreatmentName(item.tindakan_id) ||
                    "Belum pilih tindakan"
                  }}
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="group-wrap">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="success"> mdi-cash-register </v-icon>
            Ringkasan Treatment
          </div>
          <div class="group-subtitle">
            Total estimasi seluruh treatment yang sudah dipilih
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Total Item Treatment</div>
              <div class="summary-value">
                {{ form.treatment.items.length }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Total Estimasi</div>
              <div class="summary-value">
                Rp {{ formatNumber(totalTreatment) }}
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
  name: "TreatmentSection",
  props: {
    form: {
      type: Object,
      required: true,
    },
    rules: {
      type: Object,
      required: true,
    },
    tindakanList: {
      type: Array,
      default: () => [],
    },
    perawatList: {
      type: Array,
      default: () => [],
    },
    diskonTypeList: {
      type: Array,
      default: () => [],
    },
    totalTreatment: {
      type: Number,
      default: 0,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
    getTreatmentSubtotal: {
      type: Function,
      required: true,
    },
  },
  emits: [
    "update-treatment-meta",
    "update-treatment-item",
    "add-treatment-item",
    "remove-treatment-item",
  ],
  methods: {
    updateMetaField(field, value) {
      this.$emit("update-treatment-meta", { field, value });
    },

    updateItemField(index, field, value) {
      this.$emit("update-treatment-item", { index, field, value });
    },

    normalizeNumber(value, fallback = 0) {
      const num = Number(value);
      return Number.isNaN(num) ? fallback : num;
    },

    getSelectedTreatmentName(tindakanId) {
      const item = this.tindakanList.find((x) => x.id === tindakanId);
      return item ? item.nama : "";
    },
  },
};
</script>

<style scoped>
.treatment-card {
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

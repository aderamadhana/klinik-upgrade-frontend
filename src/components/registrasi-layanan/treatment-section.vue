<template>
  <div class="mt-3">
    <div class="section-head mb-4">
      <div>
        <div class="section-title">Treatment</div>
        <div class="section-subtitle">
          Tambahkan tindakan yang akan diberikan ke pasien
        </div>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-plus"
        @click="$emit('add-item')"
      >
        Tambah Treatment
      </v-btn>
    </div>

    <div
      v-for="(item, index) in safeItems"
      :key="'treatment-' + index"
      class="item-box mb-4"
    >
      <v-row dense>
        <v-col cols="12" md="4">
          <v-select
            :model-value="item.tindakan_id"
            :items="tindakanList"
            item-title="nama"
            item-value="id"
            label="Treatment"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateItem(index, 'tindakan_id', $event)"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            :model-value="item.harga"
            label="Harga"
            type="number"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateItem(index, 'harga', toNumber($event))"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            :model-value="item.jumlah"
            label="Qty"
            type="number"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateItem(index, 'jumlah', toNumber($event))"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-select
            :model-value="item.diskon_type"
            :items="['%', 'Rp']"
            label="Tipe Diskon"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateItem(index, 'diskon_type', $event)"
          />
        </v-col>

        <v-col cols="6" md="2">
          <v-text-field
            :model-value="item.diskon_value"
            label="Diskon"
            type="number"
            variant="outlined"
            density="comfortable"
            @update:modelValue="
              updateItem(index, 'diskon_value', toNumber($event))
            "
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            :model-value="item.diskon_referral"
            label="Diskon Referral"
            type="number"
            variant="outlined"
            density="comfortable"
            @update:modelValue="
              updateItem(index, 'diskon_referral', toNumber($event))
            "
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            :model-value="formatRupiah(getSubtotal(item))"
            label="Subtotal"
            readonly
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6" class="d-flex justify-end align-center">
          <v-btn
            color="error"
            variant="text"
            prepend-icon="mdi-delete"
            @click="$emit('remove-item', index)"
          >
            Hapus
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div class="total-box">
      <div class="total-box__label">Total Treatment</div>
      <div class="total-box__value">
        Rp {{ formatNumber(totalTreatment || 0) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TreatmentSection",
  props: {
    form: {
      type: Object,
      required: true,
    },
    tindakanList: {
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
    getSubtotal: {
      type: Function,
      required: true,
    },
  },
  emits: ["update-item", "add-item", "remove-item"],
  computed: {
    safeItems() {
      return this.form?.treatment?.items || [];
    },
  },
  methods: {
    updateItem(index, field, value) {
      this.$emit("update-item", { index, field, value });
    },
    toNumber(value) {
      return Number(value || 0);
    },
    formatRupiah(value) {
      return `Rp ${this.formatNumber(value || 0)}`;
    },
  },
};
</script>

<style scoped>
.section-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.section-head {
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
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.item-box {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 16px;
  background: #fff;
}

.total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.total-box__label {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
}

.total-box__value {
  font-size: 22px;
  font-weight: 800;
  color: #16a34a;
}
</style>

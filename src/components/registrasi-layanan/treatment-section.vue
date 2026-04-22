<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-5"
    >
      FO menentukan detail treatment pada tahap ini. Keputusan masuk nurse
      station diambil setelah item treatment sudah dipilih.
    </v-alert>

    <v-expand-transition>
      <div v-if="!layananState.ada_treatment" class="group-wrap mb-5">
        <div class="group-head mb-3">
          <div class="group-title">
            <v-icon class="mr-2" color="warning"> mdi-alert-outline </v-icon>
            Treatment Belum Diaktifkan
          </div>
          <div class="group-subtitle">
            Aktifkan layanan treatment di tahap pilih layanan jika memang
            dibutuhkan pada kunjungan ini.
          </div>
        </div>
      </div>
    </v-expand-transition>

    <template v-if="layananState.ada_treatment">
      <div class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="primary"> mdi-spa-outline </v-icon>
            Routing Treatment
          </div>
          <div class="group-subtitle">
            Tentukan apakah treatment ini perlu diteruskan ke perawat /
            beautician setelah item treatment dipilih
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="6">
            <v-select
              :model-value="localTreatment.perlu_tindakan_perawat"
              label="Perlu Tindakan Perawat"
              placeholder="Pilih keputusan"
              :items="perawatDecisionOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-heart-outline"
              hide-details="auto"
              @update:modelValue="updatePerawatFlag"
            />
          </v-col>

          <v-col cols="12" md="6">
            <div class="summary-box h-100">
              <div class="summary-label">Preview Routing</div>
              <div class="summary-value">
                {{ routingLabel }}
              </div>
              <div class="summary-helper mt-2">
                {{ routingDescription }}
              </div>
            </div>
          </v-col>
        </v-row>

        <v-expand-transition>
          <div
            v-if="localTreatment.perlu_tindakan_perawat === true"
            class="mt-4"
          >
            <v-alert type="warning" variant="tonal" rounded="lg" border="start">
              Setelah tahap sebelumnya selesai, visit ini akan membentuk task ke
              <strong>Antrian Tindakan</strong>.
            </v-alert>
          </div>
        </v-expand-transition>

        <v-expand-transition>
          <div
            v-if="localTreatment.perlu_tindakan_perawat === false"
            class="mt-4"
          >
            <v-alert type="success" variant="tonal" rounded="lg" border="start">
              Treatment tetap berada di jalur dokter / pelayanan medis dan tidak
              diteruskan ke nurse station.
            </v-alert>
          </div>
        </v-expand-transition>
      </div>

      <div class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="primary">
              mdi-format-list-bulleted
            </v-icon>
            Daftar Treatment
          </div>
          <div class="group-subtitle">
            Tambahkan treatment yang akan dikerjakan pada kunjungan ini
          </div>
        </div>

        <div class="table-head d-none d-md-grid mb-3">
          <div>Nama Tindakan</div>
          <div>Harga</div>
          <div>Jumlah</div>
          <div>Total</div>
          <div>Aksi</div>
        </div>

        <div
          v-for="(item, index) in localTreatment.items"
          :key="item.__key"
          class="item-row mb-3"
        >
          <v-row dense>
            <v-col cols="12" md="4">
              <v-autocomplete
                :model-value="item.tindakan_id"
                label="Nama Tindakan"
                placeholder="Pilih treatment"
                :items="tindakanOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="onTindakanChange(index, $event)"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                :model-value="item.harga"
                label="Harga"
                type="number"
                min="0"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:modelValue="updateItemField(index, 'harga', $event)"
              />
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
                @update:modelValue="updateItemField(index, 'jumlah', $event)"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                :model-value="item.total"
                label="Total"
                variant="outlined"
                density="comfortable"
                readonly
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="2">
              <div class="action-wrap">
                <v-btn
                  color="warning"
                  variant="flat"
                  icon="mdi-plus"
                  @click="addItem"
                />
                <v-btn
                  color="error"
                  variant="flat"
                  icon="mdi-minus"
                  :disabled="localTreatment.items.length === 1"
                  @click="removeItem(index)"
                />
              </div>
            </v-col>

            <v-col cols="12">
              <v-textarea
                :model-value="item.catatan"
                label="Catatan Tindakan"
                placeholder="Opsional"
                variant="outlined"
                density="comfortable"
                rows="2"
                auto-grow
                hide-details="auto"
                @update:modelValue="updateItemField(index, 'catatan', $event)"
              />
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="success">
              mdi-clipboard-text-outline
            </v-icon>
            Ringkasan Treatment
          </div>
          <div class="group-subtitle">
            Preview hasil input treatment sebelum masuk ringkasan akhir
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Jumlah Item</div>
              <div class="summary-value">{{ treatmentCount }} item</div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Routing</div>
              <div class="summary-value">
                {{ routingLabel }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="summary-box">
              <div class="summary-label">Total Treatment</div>
              <div class="summary-value text-success">
                Rp {{ formatCurrency(totalTreatment) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-expand-transition>
        <div
          v-if="validationMessages.length"
          class="group-wrap validation-wrap"
        >
          <div class="group-head mb-3">
            <div class="group-title text-error">
              <v-icon class="mr-2" color="error">
                mdi-alert-circle-outline
              </v-icon>
              Yang masih harus dilengkapi
            </div>
          </div>

          <div class="validation-list">
            <div
              v-for="(message, index) in validationMessages"
              :key="index"
              class="validation-item"
            >
              {{ message }}
            </div>
          </div>
        </div>
      </v-expand-transition>
    </template>
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
    formatNumber: {
      type: Function,
      required: false,
      default: null,
    },
  },
  emits: ["update-treatment"],
  data() {
    return {
      localTreatment: this.normalizeTreatmentState(this.form?.treatment),
    };
  },
  computed: {
    layananState() {
      return {
        ada_konsultasi: false,
        channel_konsultasi: "",
        ada_treatment: false,
        ada_penjualan: false,
        ...(this.form?.layanan || {}),
      };
    },
    perawatDecisionOptions() {
      return [
        { title: "Tidak", value: false },
        { title: "Ya", value: true },
      ];
    },
    tindakanOptions() {
      return this.tindakanList.map((item) => ({
        title: this.resolveTindakanTitle(item),
        value: this.resolveTindakanValue(item),
        raw: item,
      }));
    },
    totalTreatment() {
      return (this.localTreatment.items || []).reduce((sum, item) => {
        return sum + Number(item.total || 0);
      }, 0);
    },
    treatmentCount() {
      return (this.localTreatment.items || []).filter(
        (item) => item.tindakan_id,
      ).length;
    },
    routingLabel() {
      if (this.localTreatment.perlu_tindakan_perawat === true) {
        return "Masuk Nurse Station";
      }

      if (this.localTreatment.perlu_tindakan_perawat === false) {
        return "Tetap di Jalur Dokter";
      }

      return "Belum ditentukan";
    },
    routingDescription() {
      if (this.localTreatment.perlu_tindakan_perawat === true) {
        return "Task treatment akan diteruskan ke perawat / beautician.";
      }

      if (this.localTreatment.perlu_tindakan_perawat === false) {
        return "Treatment tidak membentuk task ke nurse station.";
      }

      return "Pilih setelah item treatment sudah jelas.";
    },
    validationMessages() {
      const messages = [];

      if (!this.layananState.ada_treatment) {
        return messages;
      }

      const activeItems = (this.localTreatment.items || []).filter(
        (item) => item.tindakan_id,
      );

      if (activeItems.length === 0) {
        messages.push("Minimal satu treatment harus dipilih.");
      }

      if (this.localTreatment.perlu_tindakan_perawat === null) {
        messages.push("Field 'Perlu Tindakan Perawat' belum dipilih.");
      }

      (this.localTreatment.items || []).forEach((item, index) => {
        if (!item.tindakan_id) return;

        if (Number(item.harga || 0) <= 0) {
          messages.push(`Harga pada baris ${index + 1} harus lebih dari 0.`);
        }

        if (Number(item.jumlah || 0) <= 0) {
          messages.push(`Jumlah pada baris ${index + 1} harus lebih dari 0.`);
        }
      });

      return messages;
    },
  },
  watch: {
    "form.treatment": {
      immediate: true,
      deep: true,
      handler(value) {
        this.localTreatment = this.normalizeTreatmentState(value);
      },
    },
  },
  methods: {
    getDefaultItem() {
      return {
        __key: this.generateKey(),
        tindakan_id: null,
        nama_tindakan: "",
        harga: 0,
        jumlah: 1,
        total: 0,
        catatan: "",
      };
    },

    getDefaultTreatment() {
      return {
        perlu_tindakan_perawat: null,
        items: [this.getDefaultItem()],
      };
    },

    normalizeTreatmentState(value) {
      const base = this.getDefaultTreatment();
      const source = value || {};

      const items =
        Array.isArray(source.items) && source.items.length
          ? source.items.map((item) => this.normalizeItem(item))
          : [this.getDefaultItem()];

      return {
        perlu_tindakan_perawat:
          typeof source.perlu_tindakan_perawat === "boolean"
            ? source.perlu_tindakan_perawat
            : null,
        items,
      };
    },

    normalizeItem(item = {}) {
      const normalized = {
        __key: item.__key || this.generateKey(),
        tindakan_id: item.tindakan_id ?? null,
        nama_tindakan: item.nama_tindakan || "",
        harga: this.toNumber(item.harga),
        jumlah: this.toNumber(item.jumlah || 1),
        total: 0,
        catatan: item.catatan || "",
      };

      normalized.total = normalized.harga * normalized.jumlah;
      return normalized;
    },

    generateKey() {
      return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    },

    emitTreatment() {
      const payload = JSON.parse(JSON.stringify(this.localTreatment));
      this.$emit("update-treatment", payload);
    },

    updatePerawatFlag(value) {
      this.localTreatment.perlu_tindakan_perawat = value;
      this.emitTreatment();
    },

    addItem() {
      this.localTreatment.items.push(this.getDefaultItem());
      this.emitTreatment();
    },

    removeItem(index) {
      if (this.localTreatment.items.length === 1) {
        this.localTreatment.items = [this.getDefaultItem()];
        this.emitTreatment();
        return;
      }

      this.localTreatment.items.splice(index, 1);
      this.emitTreatment();
    },

    onTindakanChange(index, tindakanId) {
      const selected = this.tindakanOptions.find(
        (item) => item.value === tindakanId,
      );

      const currentItem = this.localTreatment.items[index];

      if (!selected) {
        currentItem.tindakan_id = null;
        currentItem.nama_tindakan = "";
        currentItem.harga = 0;
        currentItem.jumlah = 1;
        currentItem.total = 0;
        this.emitTreatment();
        return;
      }

      const raw = selected.raw || {};
      currentItem.tindakan_id = tindakanId;
      currentItem.nama_tindakan = selected.title;
      currentItem.harga = this.resolveHargaTindakan(raw);
      currentItem.jumlah = Number(currentItem.jumlah || 1);
      currentItem.total = currentItem.harga * currentItem.jumlah;

      this.emitTreatment();
    },

    updateItemField(index, field, value) {
      const currentItem = this.localTreatment.items[index];

      if (field === "harga" || field === "jumlah") {
        currentItem[field] = this.toNumber(value);
        if (field === "jumlah" && currentItem[field] <= 0) {
          currentItem[field] = 1;
        }
        currentItem.total =
          this.toNumber(currentItem.harga) * this.toNumber(currentItem.jumlah);
      } else {
        currentItem[field] = value;
      }

      this.emitTreatment();
    },

    resolveTindakanTitle(item) {
      return item.nama_tindakan || item.nama || item.text || item.label || "-";
    },

    resolveTindakanValue(item) {
      return item.id ?? item.new_id ?? item.value ?? null;
    },

    resolveHargaTindakan(item) {
      return this.toNumber(
        item.harga ??
          item.harga_jual ??
          item.harga_treatment ??
          item.tarif ??
          item.price ??
          0,
      );
    },

    toNumber(value) {
      if (typeof value === "number") return value;
      if (value === null || value === undefined || value === "") return 0;

      return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
    },

    formatCurrency(value) {
      if (typeof this.formatNumber === "function") {
        return this.formatNumber(value || 0);
      }

      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },
  },
};
</script>

<style scoped>
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

.table-head {
  display: grid;
  grid-template-columns: 4fr 2fr 2fr 2fr 1fr;
  gap: 12px;
  padding: 0 4px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.item-row {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;
}

.action-wrap {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
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

.summary-helper {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.validation-wrap {
  border-color: rgba(var(--v-theme-error), 0.25);
  background: rgba(var(--v-theme-error), 0.03);
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.validation-item {
  font-size: 13px;
  color: #b91c1c;
}

.text-success {
  color: #16a34a;
}

.text-error {
  color: #dc2626;
}

.h-100 {
  height: 100%;
}

@media (max-width: 768px) {
  .group-wrap {
    padding: 16px;
  }

  .item-row {
    padding: 14px;
  }

  .action-wrap {
    justify-content: flex-start;
    padding-top: 4px;
  }
}
</style>

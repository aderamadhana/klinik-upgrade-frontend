<template>
  <div class="mt-3">
    <v-alert type="info" density="comfortable" border="start" class="mb-4">
      FO menentukan detail treatment pada tahap ini. Routing ke dokter atau
      nurse station ditentukan otomatis berdasarkan item treatment yang dipilih.
    </v-alert>

    <v-expand-transition>
      <v-card
        v-if="!layananState.ada_treatment"
        variant="flat"
        class="border mb-4"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="warning" size="42">
              <v-icon size="22">mdi-alert-outline</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Treatment Belum Diaktifkan
              </div>
              <div class="text-caption text-medium-emphasis">
                Aktifkan layanan treatment di tahap pilih layanan jika memang
                dibutuhkan pada kunjungan ini.
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <template v-if="layananState.ada_treatment">
      <v-card variant="flat" class="border mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="d-flex align-center ga-3">
              <v-avatar color="success" size="42">
                <v-icon size="22">mdi-spa</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Daftar Treatment
                </div>
                <div class="text-caption text-medium-emphasis">
                  Tambahkan treatment yang akan dikerjakan pada kunjungan ini
                </div>
              </div>
            </div>

            <v-btn
              color="success"
              variant="flat"
              prepend-icon="mdi-plus"
              :disabled="!activeTokoId"
              @click="addItem"
            >
              Tambah Treatment
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="!activeTokoId"
        type="warning"
        density="comfortable"
        border="start"
        class="mb-4"
      >
        Cabang belum terpilih. Data treatment akan muncul setelah cabang aktif
        tersedia.
      </v-alert>

      <v-alert
        v-if="errorMessage"
        type="error"
        density="comfortable"
        border="start"
        class="mb-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-card
        v-for="(item, index) in localTreatment.items"
        :key="item.__key"
        variant="outlined"
        class="mb-3"
      >
        <v-card-text class="pa-3">
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3"
          >
            <div class="d-flex align-center ga-2">
              <v-chip color="success" size="small" class="font-weight-medium">
                Treatment {{ index + 1 }}
              </v-chip>

              <v-chip
                v-if="item.treatment_toko_id || item.tindakan_id"
                color="primary"
                size="small"
              >
                Rp {{ formatCurrency(item.total || 0) }}
              </v-chip>
            </div>

            <v-btn
              color="error"
              size="small"
              prepend-icon="mdi-delete-outline"
              :disabled="localTreatment.items.length === 1"
              @click="removeItem(index)"
            >
              Hapus
            </v-btn>
          </div>

          <v-row dense>
            <v-col cols="12" md="4">
              <v-autocomplete
                :model-value="item.treatment_toko_id || item.tindakan_id"
                label="Nama Tindakan"
                :placeholder="
                  activeTokoId
                    ? 'Cari / pilih treatment'
                    : 'Pilih cabang terlebih dahulu'
                "
                :items="tindakanOptions"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-list-bulleted"
                :loading="loadingTreatment"
                :disabled="!activeTokoId"
                clearable
                hide-details="auto"
                menu-icon="mdi-chevron-down"
                @update:modelValue="onTindakanChange(index, $event)"
              >
                <template #message>
                  Data treatment difilter berdasarkan cabang aktif.
                </template>

                <template #no-data>
                  <div class="pa-4 text-body-2 text-medium-emphasis">
                    Tidak ada treatment pada cabang aktif.
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="12" sm="6" md="2">
              <v-text-field
                :model-value="formatRupiah(item.harga)"
                label="Harga"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash"
                readonly
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6" md="2">
              <v-text-field
                :model-value="item.jumlah"
                label="Jumlah"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-counter"
                hide-details="auto"
                @update:modelValue="updateItemField(index, 'jumlah', $event)"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="formatRupiah(item.total)"
                label="Total"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calculator-variant-outline"
                readonly
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card color="success" class="mt-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="d-flex align-center ga-3">
              <v-avatar color="success" variant="flat" size="42">
                <v-icon size="22">mdi-cash-multiple</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Total Treatment
                </div>
                <div class="text-caption text-medium-emphasis text-white">
                  Total dari seluruh treatment yang dipilih
                </div>
              </div>
            </div>

            <div class="text-h5 font-weight-bold">
              Rp {{ formatCurrency(totalTreatment) }}
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-expand-transition>
        <v-card
          v-if="validationMessages.length"
          variant="flat"
          class="border mt-4"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar color="error" size="38">
                <v-icon size="20">mdi-alert-circle-outline</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-2 font-weight-bold text-error">
                  Yang masih harus dilengkapi
                </div>
                <div class="text-caption text-medium-emphasis">
                  Lengkapi data berikut sebelum melanjutkan.
                </div>
              </div>
            </div>

            <div class="d-flex flex-column ga-2">
              <v-alert
                v-for="(message, index) in validationMessages"
                :key="index"
                type="warning"
                density="compact"
                border="start"
              >
                {{ message }}
              </v-alert>
            </div>
          </v-card-text>
        </v-card>
      </v-expand-transition>
    </template>
  </div>
</template>
<script>
import referenceService from "@/services/referenceService";

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
      loadingTreatment: false,
      errorMessage: "",
      apiTreatmentList: [],
      localTreatment: this.normalizeTreatmentState(this.form?.treatment),
      fetchTimer: null,
      isHydrating: false,
    };
  },

  computed: {
    activeTokoId() {
      return (
        this.form?.toko_id ||
        this.form?.tokoId ||
        localStorage.getItem("selected_toko_id") ||
        null
      );
    },

    layananState() {
      return {
        ada_konsultasi: false,
        channel_konsultasi: "",
        ada_treatment: false,
        ada_penjualan: false,
        route_treatment: "",
        ...(this.form?.layanan || {}),
      };
    },

    rawTreatmentList() {
      return this.apiTreatmentList.length
        ? this.apiTreatmentList
        : this.tindakanList;
    },

    tindakanOptions() {
      return this.rawTreatmentList.map((item) => this.mapTreatmentOption(item));
    },

    selectedItems() {
      return (this.localTreatment.items || []).filter(
        (item) => item.tindakan_id,
      );
    },

    totalTreatment() {
      return (this.localTreatment.items || []).reduce((sum, item) => {
        return sum + Number(item.total || 0);
      }, 0);
    },

    treatmentCount() {
      return this.selectedItems.length;
    },

    needNurseStation() {
      return this.selectedItems.some((item) => item.perlu_tindakan_perawat);
    },

    routeTreatment() {
      if (!this.treatmentCount) {
        return "";
      }

      return this.needNurseStation ? "nurse_station" : "dokter";
    },

    validationMessages() {
      const messages = [];

      if (!this.layananState.ada_treatment) {
        return messages;
      }

      const activeItems = this.selectedItems;

      if (activeItems.length === 0) {
        messages.push("Minimal satu treatment harus dipilih.");
      }

      (this.localTreatment.items || []).forEach((item, index) => {
        if (!item.tindakan_id) return;

        if (Number(item.harga || 0) < 0) {
          messages.push(
            `Harga pada baris ${index + 1} tidak boleh kurang dari 0.`,
          );
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
        if (this.isHydrating) return;

        this.localTreatment = this.normalizeTreatmentState(value);
      },
    },

    activeTokoId: {
      immediate: true,
      handler(value, oldValue) {
        if (
          String(value || "") === String(oldValue || "") &&
          oldValue !== undefined
        ) {
          return;
        }

        if (!value) {
          this.apiTreatmentList = [];
          this.clearSelectedTreatment();
          return;
        }

        this.queueFetchTreatment();
      },
    },
  },

  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    getDefaultItem() {
      return {
        __key: this.generateKey(),
        treatment_toko_id: null,
        tindakan_id: null,
        treatment_id: null,
        nama_tindakan: "",
        treatment_nama: "",
        harga: 0,
        jumlah: 1,
        total: 0,
        perlu_tindakan_perawat: false,
        route_treatment: "",
      };
    },

    getDefaultTreatment() {
      return {
        perlu_tindakan_perawat: false,
        route_treatment: "",
        total: 0,
        items: [this.getDefaultItem()],
      };
    },

    normalizeTreatmentState(value) {
      const source = value || {};

      const items =
        Array.isArray(source.items) && source.items.length
          ? source.items.map((item) => this.normalizeItem(item))
          : [this.getDefaultItem()];

      return {
        perlu_tindakan_perawat: Boolean(source.perlu_tindakan_perawat),
        route_treatment: source.route_treatment || "",
        total: Number(source.total || 0),
        items,
      };
    },

    normalizeItem(item = {}) {
      const normalized = {
        __key: item.__key || this.generateKey(),

        treatment_toko_id:
          item.treatment_toko_id ??
          item.master_treatment_toko_id ??
          item.tindakan_toko_id ??
          item.toko_treatment_id ??
          null,

        tindakan_id:
          item.tindakan_id ??
          item.treatment_id ??
          item.master_treatment_id ??
          null,

        treatment_id:
          item.treatment_id ??
          item.tindakan_id ??
          item.master_treatment_id ??
          null,

        nama_tindakan:
          item.nama_tindakan ||
          item.tindakan_nama ||
          item.treatment_nama ||
          item.nama_treatment ||
          item.nama ||
          "",

        treatment_nama:
          item.treatment_nama ||
          item.nama_tindakan ||
          item.tindakan_nama ||
          item.nama_treatment ||
          item.nama ||
          "",

        harga: this.toNumber(item.harga || item.harga_treatment || 0),
        jumlah: this.toNumber(item.jumlah || 1),
        total: 0,

        perlu_tindakan_perawat: Boolean(
          item.perlu_tindakan_perawat ||
          item.is_tindakan_perawat ||
          item.perlu_perawat ||
          item.route_treatment === "nurse_station",
        ),

        route_treatment: item.route_treatment || "",
      };

      normalized.total = normalized.harga * normalized.jumlah;

      return normalized;
    },

    generateKey() {
      return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    },

    queueFetchTreatment() {
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }

      this.fetchTimer = setTimeout(() => {
        this.fetchTreatmentByToko();
      }, 150);
    },

    async fetchTreatmentByToko() {
      if (!this.activeTokoId) {
        this.apiTreatmentList = [];
        return;
      }

      this.loadingTreatment = true;
      this.errorMessage = "";

      try {
        const rows = await referenceService.treatmentByToko({
          toko_id: this.activeTokoId,
        });

        this.apiTreatmentList = Array.isArray(rows) ? rows : [];
        this.clearUnavailableTreatment();
      } catch (error) {
        this.apiTreatmentList = [];
        this.errorMessage =
          error.response?.data?.message ||
          "Gagal mengambil data treatment berdasarkan cabang.";
      } finally {
        this.loadingTreatment = false;
      }
    },

    mapTreatmentOption(item) {
      const treatmentTokoId =
        item.treatment_toko_id ??
        item.master_treatment_toko_id ??
        item.tindakan_toko_id ??
        item.toko_treatment_id ??
        item.id ??
        null;

      const treatmentId =
        item.treatment_id ??
        item.master_treatment_id ??
        item.treatment?.id ??
        item.master_treatment?.id ??
        item.new_id ??
        item.id ??
        null;

      const nama =
        item.title ||
        item.label ||
        item.nama_treatment ||
        item.nama ||
        item.treatment_nama ||
        item.nama_tindakan ||
        item.text ||
        "-";

      const harga = this.toNumber(
        item.harga ??
          item.harga_jual ??
          item.harga_treatment ??
          item.tarif ??
          item.price ??
          item.harga_toko ??
          0,
      );

      const perluPerawat = Boolean(
        item.perlu_tindakan_perawat ||
        item.is_tindakan_perawat ||
        item.perlu_perawat ||
        item.route_treatment === "nurse_station",
      );

      return {
        ...item,
        value: treatmentTokoId,
        title: nama,

        treatment_toko_id: treatmentTokoId,
        treatment_id: treatmentId,

        harga,
        perlu_tindakan_perawat: perluPerawat,
        route_treatment: perluPerawat ? "nurse_station" : "dokter",
      };
    },

    findTreatmentOption(id) {
      return this.tindakanOptions.find(
        (item) => String(item.value) === String(id),
      );
    },

    onTindakanChange(index, tindakanValue) {
      const selected = tindakanValue
        ? this.findTreatmentOption(tindakanValue)
        : null;

      const currentItem =
        this.localTreatment.items[index] || this.getDefaultItem();

      if (!selected) {
        this.localTreatment.items.splice(index, 1, this.getDefaultItem());
        this.emitTreatment();
        return;
      }

      const updated = {
        ...currentItem,

        treatment_toko_id: selected.treatment_toko_id || selected.value || null,
        tindakan_id: selected.treatment_id || null,
        treatment_id: selected.treatment_id || null,

        nama_tindakan: selected.title,
        treatment_nama: selected.title,

        harga: this.toNumber(selected.harga),
        jumlah: Number(currentItem.jumlah || 1),

        perlu_tindakan_perawat: Boolean(selected.perlu_tindakan_perawat),
        route_treatment: selected.route_treatment || "",
      };

      updated.total = updated.harga * updated.jumlah;

      this.localTreatment.items.splice(index, 1, updated);
      this.emitTreatment();
    },

    updateItemField(index, field, value) {
      const currentItem = this.localTreatment.items[index];

      if (!currentItem) return;

      if (field === "harga") {
        return;
      }

      if (field === "jumlah") {
        currentItem.jumlah = this.toNumber(value);

        if (currentItem.jumlah <= 0) {
          currentItem.jumlah = 1;
        }

        currentItem.total =
          this.toNumber(currentItem.harga) * this.toNumber(currentItem.jumlah);
      } else {
        currentItem[field] = value;
      }

      this.emitTreatment();
    },

    addItem() {
      this.localTreatment.items.push(this.getDefaultItem());
      this.emitTreatment();
    },

    removeItem(index) {
      if (this.localTreatment.items.length <= 1) {
        this.localTreatment.items = [this.getDefaultItem()];
        this.emitTreatment();
        return;
      }

      this.localTreatment.items.splice(index, 1);
      this.emitTreatment();
    },

    clearSelectedTreatment() {
      this.localTreatment.items = [this.getDefaultItem()];
      this.emitTreatment();
    },

    clearUnavailableTreatment() {
      if (!this.apiTreatmentList.length) return;

      let changed = false;

      this.localTreatment.items = this.localTreatment.items.map((item) => {
        if (!item.tindakan_id) return item;

        const exists = this.tindakanOptions.some(
          (treatment) => String(treatment.value) === String(item.tindakan_id),
        );

        if (!exists) {
          changed = true;
          return this.getDefaultItem();
        }

        return item;
      });

      if (changed) {
        this.emitTreatment();
      }
    },

    emitTreatment() {
      const payload = {
        perlu_tindakan_perawat: this.needNurseStation,
        route_treatment: this.routeTreatment,
        total: this.totalTreatment,
        items: this.localTreatment.items.map((item) => ({
          treatment_toko_id: item.treatment_toko_id || null,

          tindakan_id: item.tindakan_id,
          treatment_id: item.treatment_id || item.tindakan_id,

          nama_tindakan: item.nama_tindakan,
          tindakan_nama: item.nama_tindakan,
          treatment_nama: item.treatment_nama || item.nama_tindakan,

          harga: Number(item.harga || 0),
          jumlah: Number(item.jumlah || 1),
          total: Number(item.total || 0),

          perlu_tindakan_perawat: Boolean(item.perlu_tindakan_perawat),
          route_treatment: item.route_treatment || "",
        })),
      };

      this.isHydrating = true;
      this.$emit("update-treatment", payload);

      this.$nextTick(() => {
        this.isHydrating = false;
      });
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

    formatRupiah(value) {
      return `Rp ${this.formatCurrency(value || 0)}`;
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

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.section-title::before {
  content: "☰";
  font-size: 18px;
  color: #2563eb;
  margin-right: 10px;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.table-head {
  display: grid;
  grid-template-columns: 4fr 2fr 2fr 2fr 1fr;
  gap: 12px;
  padding: 0 4px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.item-row {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
  background: #f8fafc;
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
  color: #0284c7;
}

.validation-wrap {
  border-color: #fecaca;
  background: #fff7f7;
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.validation-item {
  color: #b91c1c;
  font-size: 13px;
}

@media (max-width: 768px) {
  .group-wrap {
    padding: 16px;
  }

  .section-head {
    flex-direction: column;
  }
}
</style>

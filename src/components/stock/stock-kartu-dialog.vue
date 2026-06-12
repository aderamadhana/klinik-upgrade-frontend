<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1180"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="lg" max-height="88vh" class="overflow-hidden">
      <v-sheet color="primary" class="pa-4">
        <div class="d-flex align-start justify-space-between ga-4 flex-wrap">
          <div class="d-flex align-center ga-3">
            <v-avatar size="44" color="white" rounded="lg">
              <v-icon
                icon="mdi-clipboard-list-outline"
                color="primary"
                size="26"
              />
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold text-white">
                Kartu Stok
              </div>
              <div class="text-body-2 text-white">
                {{ item?.kode_produk || "-" }} · {{ item?.nama_produk || "-" }}
              </div>
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-chip
              v-if="rows?.length"
              size="small"
              color="white"
              variant="flat"
              class="font-weight-medium"
            >
              {{ rows.length }} mutasi
            </v-chip>

            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              @click="$emit('update:modelValue', false)"
            />
          </div>
        </div>
      </v-sheet>

      <v-card-text class="pa-4">
        <v-card class="rounded-lg border mb-4" elevation="0">
          <v-card-text class="pa-4">
            <div
              class="d-flex align-start justify-space-between ga-3 flex-wrap mb-4"
            >
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Filter Periode
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Pilih rentang tanggal untuk menampilkan histori mutasi stok
                  produk.
                </div>
              </div>
            </div>

            <v-row dense align="center">
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="tanggalAwal"
                  type="date"
                  label="Tanggal Awal"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  prepend-inner-icon="mdi-calendar-start"
                  @update:model-value="$emit('update:tanggalAwal', $event)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="tanggalAkhir"
                  type="date"
                  label="Tanggal Akhir"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  prepend-inner-icon="mdi-calendar-end"
                  @update:model-value="$emit('update:tanggalAkhir', $event)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-magnify"
                  :loading="loading"
                  block
                  @click="$emit('fetch')"
                >
                  Tampilkan
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-progress-linear v-if="loading" indeterminate color="primary" />
        </v-card>

        <v-card class="rounded-lg border" elevation="0">
          <v-card-text class="pa-4">
            <div
              class="d-flex align-start justify-space-between ga-3 flex-wrap"
            >
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Riwayat Mutasi Stok
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Menampilkan stok masuk, keluar, adjustment, stok sebelum, dan
                  stok sesudah.
                </div>
              </div>

              <v-chip color="primary" variant="tonal" size="small">
                {{ rows?.length || 0 }} data
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-data-table
            :headers="headers"
            :items="rows"
            :loading="loading"
            density="comfortable"
            item-value="id"
            fixed-header
            height="420"
            :items-per-page="-1"
            no-data-text="Belum ada mutasi stok pada periode ini"
          >
            <template #bottom />

            <template #item.tanggal="{ item }">
              <span class="text-high-emphasis">
                {{ formatDateTime(item.tanggal) }}
              </span>
            </template>

            <template #item.tipe_mutasi="{ item }">
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.tipe_mutasi || "-" }}
              </v-chip>
            </template>

            <template #item.qty_masuk="{ item }">
              <span class="font-weight-bold text-success">
                {{ formatNumber(item.qty_masuk) }}
              </span>
            </template>

            <template #item.qty_keluar="{ item }">
              <span class="font-weight-bold text-error">
                {{ formatNumber(item.qty_keluar) }}
              </span>
            </template>

            <template #item.qty_adjustment="{ item }">
              <span class="text-high-emphasis">
                {{ formatNumber(item.qty_adjustment) }}
              </span>
            </template>

            <template #item.stok_sebelum="{ item }">
              <span class="text-high-emphasis">
                {{ formatNumber(item.stok_sebelum) }}
              </span>
            </template>

            <template #item.stok_sesudah="{ item }">
              <span class="font-weight-bold text-high-emphasis">
                {{ formatNumber(item.stok_sesudah) }}
              </span>
            </template>
          </v-data-table>
        </v-card>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 justify-end">
        <v-btn
          variant="outlined"
          color="secondary"
          prepend-icon="mdi-close"
          @click="$emit('update:modelValue', false)"
        >
          Tutup
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "StockKartuDialog",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: null,
    },
    rows: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    tanggalAwal: {
      type: String,
      default: "",
    },
    tanggalAkhir: {
      type: String,
      default: "",
    },
    formatDateTime: {
      type: Function,
      required: true,
    },
    formatNumber: {
      type: Function,
      required: true,
    },
  },

  emits: [
    "update:modelValue",
    "update:tanggalAwal",
    "update:tanggalAkhir",
    "fetch",
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

.dialog-subtitle {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}
</style>

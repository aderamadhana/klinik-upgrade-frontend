<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="right"
    temporary
    width="520"
    class="pa-0"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card flat rounded="0" class="h-100 d-flex flex-column">
      <!-- HEADER -->
      <v-card-item class="px-5 py-4 border-b">
        <template #prepend>
          <v-avatar color="success" size="42">
            <v-icon icon="mdi-ticket-percent-outline" />
          </v-avatar>
        </template>

        <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
          Pilih Voucher / Promo
        </v-card-title>

        <v-card-subtitle class="text-body-2 pa-0 mt-1">
          Voucher yang muncul sudah sesuai item transaksi
        </v-card-subtitle>

        <template #append>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="$emit('update:modelValue', false)"
          />
        </template>
      </v-card-item>

      <!-- BODY -->
      <v-card-text class="pa-5 flex-grow-1 overflow-y-auto bg-grey-lighten-5">
        <!-- SEARCH -->
        <v-card flat class="pa-4 mb-4 border">
          <div class="d-flex align-center ga-3">
            <v-text-field
              :model-value="promoCode"
              placeholder="Cari nama voucher"
              variant="outlined"
              density="comfortable"
              hide-details
              prepend-inner-icon="mdi-magnify"
              clearable
              @update:model-value="$emit('update-promo-code', $event)"
            />

            <v-btn
              color="success"
              variant="flat"
              height="48"
              prepend-icon="mdi-check"
              @click="$emit('apply-promo-code')"
            >
              Terapkan
            </v-btn>
          </div>
        </v-card>

        <!-- ACTION INFO -->
        <div class="d-flex align-center justify-space-between mb-4">
          <v-chip
            size="small"
            color="primary"
            prepend-icon="mdi-ticket-confirmation-outline"
          >
            {{ totalVoucher }} Voucher tersedia
          </v-chip>

          <v-btn
            size="small"
            variant="text"
            color="error"
            prepend-icon="mdi-refresh"
            @click="$emit('reset-promo')"
          >
            Reset Semua
          </v-btn>
        </div>

        <!-- SEARCH RESULT -->
        <template v-if="keyword">
          <v-card flat class="border mb-4">
            <v-card-item class="px-4 py-3 border-b">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="text-subtitle-2 font-weight-bold">
                  Hasil Pencarian Voucher
                </div>

                <v-chip size="x-small">
                  {{ filteredAllPromoList.length }}
                </v-chip>
              </div>
            </v-card-item>

            <v-card-text class="pa-4">
              <v-alert
                v-if="!filteredAllPromoList.length"
                type="info"
                density="compact"
                text="Voucher tidak ditemukan."
              />

              <v-card
                v-for="promo in filteredAllPromoList"
                :key="`search-${promo.jenis_voucher_id}-${promo.id}`"
                flat
                class="pa-4 mb-3 border"
                :class="
                  isPromoSelected(promo) ? 'bg-green-lighten-5' : 'bg-white'
                "
              >
                <div class="d-flex align-start justify-space-between ga-3">
                  <div class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-bold mb-1">
                      {{ getPromoTitle(promo) }}
                    </div>

                    <div class="text-body-2 text-medium-emphasis mb-3">
                      {{ getPromoDescription(promo) }}
                    </div>

                    <div class="d-flex flex-wrap ga-2">
                      <v-chip size="x-small" color="primary">
                        {{ getPromoTypeLabel(promo) }}
                      </v-chip>

                      <v-chip size="x-small">
                        Kuota: {{ getPromoKuota(promo) }}
                      </v-chip>

                      <v-chip
                        v-if="promo.is_bisa_digabung_promo"
                        size="x-small"
                        color="success"
                      >
                        Bisa digabung
                      </v-chip>
                    </div>
                  </div>

                  <v-btn
                    :color="isPromoSelected(promo) ? 'error' : 'success'"
                    :variant="isPromoSelected(promo) ? 'tonal' : 'flat'"
                    size="small"
                    min-width="84"
                    @click="$emit('toggle-promo', promo)"
                  >
                    {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
                  </v-btn>
                </div>
              </v-card>
            </v-card-text>
          </v-card>
        </template>

        <!-- GROUP LIST -->
        <template v-else>
          <v-card
            v-for="group in promoGroups"
            :key="group.key"
            flat
            class="border mb-4"
          >
            <v-card-item class="px-4 py-3 border-b bg-white">
              <div class="d-flex align-center justify-space-between w-100">
                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    {{ group.title }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Pilih voucher yang sesuai kebutuhan transaksi
                  </div>
                </div>

                <v-chip size="x-small">
                  {{ group.items.length }}
                </v-chip>
              </div>
            </v-card-item>

            <v-card-text class="pa-4">
              <v-alert
                v-if="!group.items.length"
                type="info"
                density="compact"
                :text="group.emptyText"
              />

              <v-card
                v-for="promo in group.items"
                :key="`${group.key}-${promo.id}`"
                flat
                class="pa-4 mb-3 border"
                :class="
                  isPromoSelected(promo) ? 'bg-green-lighten-5' : 'bg-white'
                "
              >
                <div class="d-flex align-start justify-space-between ga-3">
                  <div class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-bold mb-1">
                      {{ getPromoTitle(promo) }}
                    </div>

                    <div class="text-body-2 text-medium-emphasis mb-3">
                      {{ getPromoDescription(promo) }}
                    </div>

                    <div class="d-flex flex-wrap ga-2">
                      <v-chip size="x-small" color="primary">
                        {{ getPromoTypeLabel(promo) }}
                      </v-chip>

                      <v-chip size="x-small">
                        Kuota: {{ getPromoKuota(promo) }}
                      </v-chip>

                      <v-chip
                        v-if="promo.is_bisa_digabung_promo"
                        size="x-small"
                        color="success"
                      >
                        Bisa digabung
                      </v-chip>
                    </div>
                  </div>

                  <v-btn
                    :color="isPromoSelected(promo) ? 'error' : 'success'"
                    :variant="isPromoSelected(promo) ? 'tonal' : 'flat'"
                    size="small"
                    min-width="84"
                    @click="$emit('toggle-promo', promo)"
                  >
                    {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
                  </v-btn>
                </div>
              </v-card>
            </v-card-text>
          </v-card>
        </template>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "PembayaranPromoDrawer",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    promoCode: {
      type: String,
      default: "",
    },
    promoTreatmentList: {
      type: Array,
      default: () => [],
    },
    promoProductList: {
      type: Array,
      default: () => [],
    },
    promoBundlingList: {
      type: Array,
      default: () => [],
    },
    promoValueList: {
      type: Array,
      default: () => [],
    },
    isPromoSelected: {
      type: Function,
      required: true,
    },
  },

  emits: [
    "update:modelValue",
    "update-promo-code",
    "apply-promo-code",
    "toggle-promo",
    "reset-promo",
  ],

  computed: {
    totalVoucher() {
      return this.allPromoList.length;
    },

    keyword() {
      return String(this.promoCode || "")
        .trim()
        .toLowerCase();
    },

    allPromoList() {
      return [
        ...this.promoProductList,
        ...this.promoTreatmentList,
        ...this.promoBundlingList,
        ...this.promoValueList,
      ];
    },

    filteredAllPromoList() {
      return this.filterPromo(this.allPromoList);
    },

    promoGroups() {
      return [
        {
          key: "produk",
          title: "Promo Produk",
          items: this.promoProductList,
          emptyText: "Tidak ada voucher produk yang cocok.",
        },
        {
          key: "treatment",
          title: "Promo Treatment",
          items: this.promoTreatmentList,
          emptyText: "Tidak ada voucher treatment yang cocok.",
        },
        {
          key: "bundling",
          title: "Promo Bundling",
          items: this.promoBundlingList,
          emptyText: "Tidak ada voucher bundling yang cocok.",
        },
        {
          key: "value",
          title: "Promo Value",
          items: this.promoValueList,
          emptyText: "Tidak ada voucher value yang cocok.",
        },
      ];
    },
  },

  methods: {
    filterPromo(list) {
      if (!this.keyword) return list;

      return list.filter((promo) => {
        const text = [
          promo.nama,
          promo.nama_voucher,
          promo.kode,
          promo.deskripsi,
          promo.desc,
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(this.keyword);
      });
    },

    getPromoTitle(promo) {
      return promo.nama || promo.nama_voucher || "-";
    },

    getPromoDescription(promo) {
      if (promo.desc) return promo.desc;
      if (promo.deskripsi) return promo.deskripsi;

      const mode =
        promo.mode ||
        promo.tipe_diskon_kode ||
        (promo.tipe_diskon === "nominal" ? "Rp" : "%");

      const value = Number(promo.value || promo.total_diskon || 0);

      if (mode === "Rp") {
        return `Diskon Rp ${value.toLocaleString("id-ID")}`;
      }

      return `Diskon ${value}%`;
    },

    getPromoKuota(promo) {
      return promo.kuota || promo.qty_generate || "Tidak Terbatas";
    },

    getPromoTypeLabel(promo) {
      const id = Number(promo.jenis_voucher_id || promo.jenis_id || 0);

      const map = {
        1: "Treatment",
        2: "Produk",
        3: "Bundling",
        4: "Value",
      };

      return map[id] || "Promo";
    },
  },
};
</script>

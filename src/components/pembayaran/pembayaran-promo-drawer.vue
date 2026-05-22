<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="right"
    temporary
    width="480"
    class="promo-drawer"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="promo-drawer-header clean">
      <div>
        <div class="promo-drawer-title">Pilih Voucher / Promo</div>
        <div class="promo-drawer-subtitle">
          Voucher yang muncul sudah sesuai item transaksi
        </div>
      </div>

      <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <div class="promo-drawer-body clean">
      <div class="promo-search-wrap">
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
          @click="$emit('apply-promo-code')"
        >
          Terapkan
        </v-btn>
      </div>

      <div class="promo-action-row">
        <v-chip size="small" variant="tonal" color="primary">
          {{ totalVoucher }} Voucher tersedia
        </v-chip>

        <v-btn
          size="small"
          variant="text"
          color="error"
          @click="$emit('reset-promo')"
        >
          Reset Semua
        </v-btn>
      </div>

      <template v-if="keyword">
        <div class="promo-group-clean">
          <div class="promo-group-header">
            <div class="promo-group-title-clean">Hasil Pencarian Voucher</div>
            <v-chip size="x-small" variant="tonal">
              {{ filteredAllPromoList.length }}
            </v-chip>
          </div>

          <div v-if="!filteredAllPromoList.length" class="promo-empty-state">
            Voucher tidak ditemukan.
          </div>

          <div
            v-for="promo in filteredAllPromoList"
            :key="`search-${promo.jenis_voucher_id}-${promo.id}`"
            class="promo-card-clean"
            :class="{ selected: isPromoSelected(promo) }"
          >
            <div class="promo-card-title-clean">
              {{ getPromoTitle(promo) }}
            </div>

            <div class="promo-card-desc-clean">
              {{ getPromoDescription(promo) }}
            </div>

            <div class="promo-meta-row">
              <v-chip size="x-small" color="primary" variant="tonal">
                {{ getPromoTypeLabel(promo) }}
              </v-chip>

              <v-chip size="x-small" variant="tonal">
                Kuota: {{ getPromoKuota(promo) }}
              </v-chip>
            </div>

            <v-btn
              :color="isPromoSelected(promo) ? 'error' : 'success'"
              variant="flat"
              size="small"
              class="promo-select-btn"
              @click="$emit('toggle-promo', promo)"
            >
              {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
            </v-btn>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="group in promoGroups"
          :key="group.key"
          class="promo-group-clean"
        >
          <div class="promo-group-header">
            <div class="promo-group-title-clean">{{ group.title }}</div>
            <v-chip size="x-small" variant="tonal">
              {{ group.items.length }}
            </v-chip>
          </div>

          <div v-if="!group.items.length" class="promo-empty-state">
            {{ group.emptyText }}
          </div>

          <div
            v-for="promo in group.items"
            :key="`${group.key}-${promo.id}`"
            class="promo-card-clean"
            :class="{ selected: isPromoSelected(promo) }"
          >
            <div class="promo-card-title-clean">
              {{ getPromoTitle(promo) }}
            </div>

            <div class="promo-card-desc-clean">
              {{ getPromoDescription(promo) }}
            </div>

            <div class="promo-meta-row">
              <v-chip size="x-small" variant="tonal">
                Kuota: {{ getPromoKuota(promo) }}
              </v-chip>

              <v-chip
                v-if="promo.is_bisa_digabung_promo"
                size="x-small"
                color="success"
                variant="tonal"
              >
                Bisa digabung
              </v-chip>
            </div>

            <v-btn
              :color="isPromoSelected(promo) ? 'error' : 'success'"
              variant="flat"
              size="small"
              class="promo-select-btn"
              @click="$emit('toggle-promo', promo)"
            >
              {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
            </v-btn>
          </div>
        </div>
      </template>
    </div>
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

<template>
  <v-card variant="flat" class="mb-4 border">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-subtitle-1 font-weight-bold">Voucher & Promo</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Voucher yang muncul sudah disesuaikan dengan produk/treatment
          </div>
        </div>

        <v-avatar color="success" variant="tonal" size="40">
          <v-icon icon="mdi-ticket-percent-outline" size="22" />
        </v-avatar>
      </div>

      <v-card
        color="green-lighten-5"
        variant="flat"
        class="pa-4 cursor-pointer border border-success"
        @click="$emit('open-promo')"
      >
        <div class="d-flex align-center ga-3">
          <v-avatar color="success" variant="tonal" size="42">
            <v-icon icon="mdi-ticket-percent-outline" size="22" />
          </v-avatar>

          <div class="flex-grow-1">
            <div class="text-subtitle-2 font-weight-bold text-green-darken-4">
              Pilih Voucher / Promo
            </div>
            <div class="text-body-2 text-green-darken-2 mt-1">
              Buka daftar promo eligible untuk transaksi ini
            </div>
          </div>

          <v-icon icon="mdi-chevron-right" color="success" size="26" />
        </div>
      </v-card>

      <div v-if="appliedPromos && appliedPromos.length" class="mt-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-subtitle-2 font-weight-bold">Promo yang dipilih</div>
          <v-chip size="small" color="success" variant="tonal">
            {{ appliedPromos.length }} Promo
          </v-chip>
        </div>

        <v-card variant="outlined">
          <v-list density="compact" class="py-0">
            <template
              v-for="(promo, index) in appliedPromos"
              :key="getPromoKey(promo, index)"
            >
              <v-list-item class="py-3">
                <template #prepend>
                  <v-avatar color="success" variant="tonal" size="36">
                    <v-icon icon="mdi-ticket-confirmation-outline" size="20" />
                  </v-avatar>
                </template>

                <v-list-item-title
                  class="text-body-2 font-weight-bold text-high-emphasis"
                >
                  {{ getPromoName(promo) }}
                </v-list-item-title>

                <v-list-item-subtitle
                  class="text-caption mt-1 text-medium-emphasis"
                >
                  {{ getPromoDescription(promo) }}
                  <span class="mx-1">•</span>
                  Potongan:
                  <strong>{{ formatCurrency(getPromoAmount(promo)) }}</strong>
                </v-list-item-subtitle>

                <template #append>
                  <v-btn
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    color="error"
                    @click.stop="$emit('remove-promo', promo)"
                  />
                </template>
              </v-list-item>

              <v-divider v-if="index < appliedPromos.length - 1" />
            </template>
          </v-list>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "PembayaranPromoCard",
  props: {
    appliedPromos: {
      type: Array,
      default: () => [],
    },
    diskonSubtotal: {
      type: Object,
      required: true,
    },
    diskonTypeList: {
      type: Array,
      default: () => [],
    },
    format: {
      type: Function,
      default: null,
    },
    formatCurrency: {
      type: Function,
      required: true,
    },
    getPromoAmount: {
      type: Function,
      required: true,
    },
  },
  emits: ["open-promo", "remove-promo", "update-diskon-subtotal"],
  methods: {
    getPromoKey(promo, index) {
      return String(
        promo?.id ||
          promo?.voucher_id ||
          promo?.master_voucher_diskon_id ||
          promo?.kode_voucher ||
          promo?.kode ||
          promo?.code ||
          index,
      );
    },
    getPromoName(promo) {
      return (
        promo?.nama ||
        promo?.nama_voucher ||
        promo?.label ||
        promo?.kode_voucher ||
        "Voucher"
      );
    },
    getPromoDescription(promo) {
      return promo?.desc || promo?.deskripsi || "Promo transaksi";
    },
  },
};
</script>

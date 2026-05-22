<template>
  <v-card class="section-card mb-4" variant="flat">
    <v-card-text class="pa-5">
      <div class="section-header-pembayaran mb-4">
        <div>
          <div class="section-title-pembayaran">Voucher & Promo</div>
          <div class="section-subtitle">
            Voucher yang muncul sudah disesuaikan dengan produk/treatment
          </div>
        </div>
      </div>

      <div class="promo-trigger" @click="$emit('open-promo')">
        <div class="promo-icon-wrap">
          <v-icon size="24">mdi-ticket-percent-outline</v-icon>
        </div>

        <div class="promo-copy">
          <div class="promo-title">Pilih Voucher / Promo</div>
          <div class="promo-subtitle">
            Buka daftar promo eligible untuk transaksi ini
          </div>
        </div>

        <div class="promo-arrow">
          <v-icon>mdi-chevron-right</v-icon>
        </div>
      </div>

      <div v-if="appliedPromos.length" class="selected-promo-wrap mt-4">
        <div class="selected-promo-title">Promo yang dipilih</div>

        <div class="selected-promo-list">
          <div
            v-for="(promo, index) in appliedPromos"
            :key="promo.id"
            class="selected-promo-card"
          >
            <div class="selected-promo-content">
              <div class="selected-promo-name">
                {{ promo.nama || promo.nama_voucher }}
              </div>

              <div class="selected-promo-desc">
                {{ promo.desc || promo.deskripsi }} • Potongan:
                {{ formatCurrency(getPromoAmount(promo)) }}
              </div>
            </div>

            <v-btn
              icon
              size="small"
              variant="text"
              color="error"
              @click="$emit('remove-promo', index)"
            >
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <v-row dense class="mt-4">
        <v-col cols="12" md="4">
          <v-select
            :model-value="diskonSubtotal.type"
            :items="diskonTypeList"
            label="Tipe Diskon Subtotal"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            @update:model-value="
              $emit('update-diskon-subtotal', {
                field: 'type',
                value: $event,
              })
            "
          />
        </v-col>

        <v-col cols="12" md="8">
          <v-text-field
            :model-value="diskonSubtotal.value"
            label="Nilai Diskon Subtotal"
            type="number"
            variant="outlined"
            density="comfortable"
            :prefix="diskonSubtotal.type === 'Rp' ? 'Rp' : ''"
            :suffix="diskonSubtotal.type === '%' ? '%' : ''"
            hide-details="auto"
            @update:model-value="
              $emit('update-diskon-subtotal', {
                field: 'value',
                value: $event,
              })
            "
          />
        </v-col>
      </v-row>
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
};
</script>

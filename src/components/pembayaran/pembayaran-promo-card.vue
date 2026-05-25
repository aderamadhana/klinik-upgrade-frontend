<template>
  <v-card variant="flat" class="mb-4 border">
    <v-card-text class="pa-5">
      <!-- Header -->
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

      <!-- Promo Trigger -->
      <v-card
        variant="tonal"
        color="success"
        class="pa-4 cursor-pointer"
        @click="$emit('open-promo')"
      >
        <div class="d-flex align-center ga-3">
          <v-avatar color="success" variant="flat" size="44">
            <v-icon icon="mdi-ticket-percent-outline" size="24" />
          </v-avatar>

          <div class="flex-grow-1">
            <div class="text-subtitle-2 font-weight-bold text-high-emphasis">
              Pilih Voucher / Promo
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Buka daftar promo eligible untuk transaksi ini
            </div>
          </div>

          <v-icon icon="mdi-chevron-right" size="26" />
        </div>
      </v-card>

      <!-- Selected Promos -->
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
              :key="`${promo.id || promo.kode_voucher || index}`"
            >
              <v-list-item class="py-3">
                <template #prepend>
                  <v-avatar color="success" variant="tonal" size="36">
                    <v-icon icon="mdi-ticket-confirmation-outline" size="20" />
                  </v-avatar>
                </template>

                <v-list-item-title class="text-body-2 font-weight-bold">
                  {{ promo.nama || promo.nama_voucher }}
                </v-list-item-title>

                <v-list-item-subtitle class="text-caption mt-1">
                  {{ promo.desc || promo.deskripsi || "Promo transaksi" }}
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
                    @click.stop="$emit('remove-promo', index)"
                  />
                </template>
              </v-list-item>

              <v-divider v-if="index < appliedPromos.length - 1" />
            </template>
          </v-list>
        </v-card>
      </div>

      <!-- Diskon Subtotal -->
      <!-- <v-row dense class="mt-4">
        <v-col cols="12" md="4">
          <v-select
            :model-value="diskonSubtotal.type"
            :items="diskonTypeList"
            label="Tipe Diskon Subtotal"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            prepend-inner-icon="mdi-percent-outline"
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
            prepend-inner-icon="mdi-cash-minus"
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
      </v-row> -->
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

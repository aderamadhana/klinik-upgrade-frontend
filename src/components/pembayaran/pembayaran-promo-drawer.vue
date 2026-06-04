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
      <v-card-item class="px-5 py-4 border-b bg-white">
        <template #prepend>
          <v-avatar color="success" size="42">
            <v-icon icon="mdi-ticket-percent-outline" />
          </v-avatar>
        </template>

        <v-card-title
          class="text-subtitle-1 font-weight-bold pa-0 text-grey-darken-4"
        >
          Pilih Voucher / Promo
        </v-card-title>
        <v-card-subtitle class="text-body-2 pa-0 mt-1 text-grey-darken-1">
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

      <v-card-text class="pa-5 flex-grow-1 overflow-y-auto bg-grey-lighten-5">
        <v-card flat class="pa-4 mb-4 border bg-white">
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
              class="text-none font-weight-bold"
              @click="$emit('apply-promo-code')"
            >
              Terapkan
            </v-btn>
          </div>
        </v-card>

        <div class="d-flex align-center justify-space-between mb-4">
          <v-chip
            size="small"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-ticket-confirmation-outline"
            class="font-weight-medium"
          >
            {{ totalVoucher }} Voucher tersedia
          </v-chip>

          <v-btn
            size="small"
            variant="text"
            color="error"
            prepend-icon="mdi-refresh"
            class="text-none"
            @click="$emit('reset-promo')"
          >
            Reset Semua
          </v-btn>
        </div>

        <template v-if="keyword">
          <v-card flat class="border mb-4 bg-white">
            <v-card-item class="px-4 py-3 border-b bg-white">
              <div class="d-flex align-center justify-space-between w-100">
                <div>
                  <div
                    class="text-subtitle-2 font-weight-bold text-grey-darken-4"
                  >
                    Hasil Pencarian Voucher
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    Voucher yang sesuai dengan kata kunci pencarian
                  </div>
                </div>

                <v-chip size="x-small" variant="tonal">
                  {{ filteredAllPromoList.length }}
                </v-chip>
              </div>
            </v-card-item>

            <v-card-text class="pa-4">
              <div
                v-if="!filteredAllPromoList.length"
                class="d-flex flex-column align-center justify-center text-center pa-8"
              >
                <v-avatar color="grey-lighten-3" size="56" class="mb-3">
                  <v-icon size="30" color="grey">
                    mdi-ticket-percent-outline
                  </v-icon>
                </v-avatar>
                <div
                  class="text-subtitle-2 font-weight-bold mb-1 text-grey-darken-4"
                >
                  Voucher tidak ditemukan
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  Coba gunakan kata kunci lain atau pilih voucher dari daftar
                  promo.
                </div>
              </div>

              <template v-else>
                <v-card
                  v-for="promo in filteredAllPromoList"
                  :key="`search-${promo.jenis_voucher_id || promo.jenis_id || 'promo'}-${promo.id}`"
                  flat
                  class="pa-4 mb-3 border"
                  :class="promoCardClass(promo)"
                >
                  <div class="d-flex align-start justify-space-between ga-3">
                    <div class="flex-grow-1">
                      <div :class="promoTitleClass(promo)">
                        {{ getPromoTitle(promo) }}
                      </div>

                      <div :class="promoDescriptionClass(promo)">
                        {{ getPromoDescription(promo) }}
                      </div>

                      <div class="d-flex flex-wrap ga-2">
                        <v-chip
                          size="x-small"
                          color="success"
                          variant="tonal"
                          class="font-weight-medium"
                        >
                          {{ getPromoTypeLabel(promo) }}
                        </v-chip>
                        <v-chip
                          size="x-small"
                          color="grey"
                          variant="tonal"
                          class="font-weight-medium"
                        >
                          Kuota: {{ getPromoKuota(promo) }}
                        </v-chip>
                        <v-chip
                          v-if="promo.is_bisa_digabung_promo"
                          size="x-small"
                          color="success"
                          variant="flat"
                          class="font-weight-medium"
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
                      class="text-none font-weight-bold"
                      @click="$emit('toggle-promo', promo)"
                    >
                      {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
                    </v-btn>
                  </div>
                </v-card>
              </template>
            </v-card-text>
          </v-card>
        </template>

        <template v-else>
          <v-card
            v-for="group in promoGroups"
            :key="group.key"
            flat
            class="border mb-4 bg-white"
          >
            <v-card-item class="px-4 py-3 border-b bg-white">
              <div class="d-flex align-center justify-space-between w-100">
                <div>
                  <div
                    class="text-subtitle-2 font-weight-bold text-grey-darken-4"
                  >
                    {{ group.title }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    Pilih voucher yang sesuai kebutuhan transaksi
                  </div>
                </div>

                <v-chip
                  size="x-small"
                  :color="group.items.length ? 'success' : 'grey'"
                  variant="tonal"
                >
                  {{ group.items.length }}
                </v-chip>
              </div>
            </v-card-item>

            <v-card-text class="pa-4">
              <div
                v-if="!group.items.length"
                class="d-flex flex-column align-center justify-center text-center pa-8"
              >
                <v-avatar color="grey-lighten-3" size="56" class="mb-3">
                  <v-icon size="30" color="grey">
                    {{ group.emptyIcon }}
                  </v-icon>
                </v-avatar>
                <div
                  class="text-subtitle-2 font-weight-bold mb-1 text-grey-darken-4"
                >
                  {{ group.emptyTitle }}
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  {{ group.emptySubtitle }}
                </div>
              </div>

              <template v-else>
                <v-card
                  v-for="promo in group.items"
                  :key="`${group.key}-${promo.id}`"
                  flat
                  class="pa-4 mb-3 border"
                  :class="promoCardClass(promo)"
                >
                  <div class="d-flex align-start justify-space-between ga-3">
                    <div class="flex-grow-1">
                      <div :class="promoTitleClass(promo)">
                        {{ getPromoTitle(promo) }}
                      </div>

                      <div :class="promoDescriptionClass(promo)">
                        {{ getPromoDescription(promo) }}
                      </div>

                      <div class="d-flex flex-wrap ga-2">
                        <v-chip
                          size="x-small"
                          color="success"
                          variant="tonal"
                          class="font-weight-medium"
                        >
                          {{ getPromoTypeLabel(promo) }}
                        </v-chip>
                        <v-chip
                          size="x-small"
                          color="grey"
                          variant="tonal"
                          class="font-weight-medium"
                        >
                          Kuota: {{ getPromoKuota(promo) }}
                        </v-chip>
                        <v-chip
                          v-if="promo.is_bisa_digabung_promo"
                          size="x-small"
                          color="success"
                          variant="flat"
                          class="font-weight-medium"
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
                      class="text-none font-weight-bold"
                      @click="$emit('toggle-promo', promo)"
                    >
                      {{ isPromoSelected(promo) ? "Batal" : "Pilih" }}
                    </v-btn>
                  </div>
                </v-card>
              </template>
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
          emptyTitle: "Tidak ada voucher produk",
          emptySubtitle:
            "Voucher produk akan muncul jika sesuai dengan produk pada transaksi.",
          emptyIcon: "mdi-ticket-percent-outline",
        },
        {
          key: "treatment",
          title: "Promo Treatment",
          items: this.promoTreatmentList,
          emptyTitle: "Tidak ada voucher treatment",
          emptySubtitle:
            "Voucher treatment akan muncul jika sesuai dengan treatment pada transaksi.",
          emptyIcon: "mdi-ticket-percent-outline",
        },
        {
          key: "bundling",
          title: "Promo Bundling",
          items: this.promoBundlingList,
          emptyTitle: "Tidak ada voucher bundling",
          emptySubtitle:
            "Voucher bundling akan muncul jika kombinasi produk dan treatment sesuai.",
          emptyIcon: "mdi-ticket-percent-outline",
        },
        {
          key: "value",
          title: "Promo Value",
          items: this.promoValueList,
          emptyTitle: "Tidak ada voucher value",
          emptySubtitle:
            "Voucher value akan muncul jika nominal transaksi memenuhi syarat.",
          emptyIcon: "mdi-ticket-percent-outline",
        },
      ];
    },
  },
  methods: {
    filterPromo(list) {
      if (!this.keyword) {
        return list;
      }

      return list.filter((promo) => {
        const text = [
          promo.nama,
          promo.nama_voucher,
          promo.kode,
          promo.kode_voucher,
          promo.deskripsi,
          promo.desc,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(this.keyword);
      });
    },
    promoCardClass(promo) {
      if (this.isPromoSelected(promo)) {
        return "bg-green-lighten-4 border-success";
      }

      return "bg-green-lighten-5 border-success";
    },
    promoTitleClass(promo) {
      return this.isPromoSelected(promo)
        ? "text-subtitle-2 font-weight-bold mb-1 text-green-darken-4"
        : "text-subtitle-2 font-weight-bold mb-1 text-green-darken-3";
    },
    promoDescriptionClass(promo) {
      return this.isPromoSelected(promo)
        ? "text-body-2 text-green-darken-3 mb-3"
        : "text-body-2 text-green-darken-2 mb-3";
    },
    getPromoTitle(promo) {
      return promo.nama || promo.nama_voucher || promo.kode_voucher || "-";
    },
    getPromoDescription(promo) {
      const raw =
        promo?.raw || promo?.voucher || promo?.master_voucher_diskon || {};

      const mode = String(
        promo?.mode ||
          promo?.tipe_diskon_kode ||
          promo?.diskon_tipe ||
          promo?.tipe_diskon ||
          raw?.tipe_diskon ||
          "",
      )
        .toLowerCase()
        .trim();

      const value = this.toPromoNumber(
        promo?.value ??
          promo?.total_diskon ??
          promo?.diskon_nilai ??
          promo?.nilai_diskon ??
          raw?.total_diskon ??
          raw?.diskon_nilai ??
          raw?.nilai_diskon ??
          0,
      );

      const max = this.toPromoNumber(
        promo?.total_diskon_maksimal ??
          promo?.diskon_maksimal ??
          promo?.maksimal_diskon ??
          promo?.max_diskon ??
          promo?.maximum_discount ??
          promo?.max_discount ??
          promo?.max_nominal ??
          promo?.maksimal_potongan ??
          raw?.total_diskon_maksimal ??
          raw?.diskon_maksimal ??
          raw?.maksimal_diskon ??
          raw?.max_diskon ??
          raw?.maximum_discount ??
          raw?.max_discount ??
          raw?.max_nominal ??
          raw?.maksimal_potongan ??
          0,
      );

      if (mode === "rp" || mode === "nominal") {
        return `Diskon Rp ${value.toLocaleString("id-ID")}`;
      }

      if (value > 0 && max > 0) {
        return `Diskon ${value}% maks Rp ${max.toLocaleString("id-ID")}`;
      }

      if (value > 0) {
        return `Diskon ${value}%`;
      }

      return promo?.desc || promo?.deskripsi || "Promo transaksi";
    },
    toPromoNumber(value) {
      if (value === null || value === undefined || value === "") return 0;
      if (typeof value === "number") return Number.isFinite(value) ? value : 0;

      let text = String(value).trim();
      if (!text || text.toLowerCase() === "null") return 0;

      text = text.replace(/[^\d,.-]/g, "");

      const hasComma = text.includes(",");
      const hasDot = text.includes(".");

      if (hasComma && hasDot) {
        text =
          text.lastIndexOf(",") > text.lastIndexOf(".")
            ? text.replace(/\./g, "").replace(",", ".")
            : text.replace(/,/g, "");
      } else if (hasComma) {
        text = text.replace(",", ".");
      } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(text)) {
        text = text.replace(/\./g, "");
      }

      const number = Number(text);
      return Number.isFinite(number) ? number : 0;
    },
    getPromoKuota(promo) {
      if (
        promo.is_unlimited_generate === 1 ||
        promo.is_unlimited_generate === true
      ) {
        return "Tidak Terbatas";
      }

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

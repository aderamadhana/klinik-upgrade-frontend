<template>
  <v-card variant="outlined" class="mb-5">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div>
          <div class="text-subtitle-2 font-weight-bold">
            Pasien treatment ingin sekalian konsultasi?
          </div>

          <div class="text-body-2 text-medium-emphasis mt-1">
            Jika diaktifkan, form SOAP akan muncul. Karena pasien mengambil
            treatment, biaya konsultasi otomatis Rp 0.
          </div>
        </div>

        <v-switch
          :model-value="modelValue"
          color="primary"
          hide-details
          inset
          label="Sekalian konsultasi"
          @update:model-value="$emit('update:modelValue', $event)"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "AntrianDokterKonsultasiOption",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue"],
};
</script>

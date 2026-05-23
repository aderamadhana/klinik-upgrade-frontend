<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">{{ title }}</v-card-title>

      <v-card-text>{{ message }}</v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          Batal
        </v-btn>

        <v-btn :color="color" :loading="loading" @click="$emit('confirm')">
          Ya, lanjutkan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "StockConfirmDialog",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "primary",
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue", "confirm"],
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="620"
    @update:model-value="updateDialog"
  >
    <v-card rounded="lg" class="overflow-hidden">
      <v-sheet color="error" class="pa-5">
        <div class="d-flex align-start justify-space-between ga-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="white" rounded="lg" size="44">
              <v-icon :icon="icon" color="error" size="26" />
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold text-white">
                {{ title }}
              </div>
              <div class="text-body-2 text-white">
                {{ subtitle }}
              </div>
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            :disabled="loading"
            @click="closeDialog"
          />
        </div>
      </v-sheet>

      <v-card-text class="pa-5">
        <v-card variant="outlined" rounded="lg">
          <v-card-text class="pa-4">
            <div class="d-flex align-start ga-3">
              <v-avatar color="error" variant="tonal" size="42">
                <v-icon icon="mdi-alert-circle-outline" color="error" />
              </v-avatar>

              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  {{ question }}
                </div>
                <div class="text-body-2 text-medium-emphasis mt-1">
                  Pastikan data yang dipilih sudah benar sebelum melanjutkan.
                </div>
              </div>
            </div>

            <v-alert
              color="error"
              variant="tonal"
              rounded="lg"
              density="comfortable"
              class="mt-4"
            >
              <template #prepend>
                <v-icon icon="mdi-alert-outline" />
              </template>

              <div class="font-weight-bold">
                {{ itemTitle || "-" }}
              </div>

              <div class="text-body-2 mt-1">
                {{ warningText }}
              </div>

              <div v-if="itemSubtitle" class="text-caption mt-2">
                {{ itemSubtitle }}
              </div>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 justify-end">
        <v-btn
          color="secondary"
          variant="outlined"
          :disabled="loading"
          @click="closeDialog"
        >
          {{ cancelText }}
        </v-btn>

        <v-btn
          color="error"
          variant="flat"
          :loading="loading"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmDeleteDialog",

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Konfirmasi Hapus",
    },
    subtitle: {
      type: String,
      default: "Data akan dihapus secara soft delete.",
    },
    question: {
      type: String,
      default: "Yakin ingin menghapus data ini?",
    },
    itemTitle: {
      type: String,
      default: "-",
    },
    itemSubtitle: {
      type: String,
      default: "",
    },
    warningText: {
      type: String,
      default: "Data akan dihapus secara soft delete.",
    },
    confirmText: {
      type: String,
      default: "Hapus",
    },
    cancelText: {
      type: String,
      default: "Batal",
    },
    icon: {
      type: String,
      default: "mdi-delete-alert-outline",
    },
  },

  emits: ["update:modelValue", "confirm", "cancel"],

  methods: {
    updateDialog(value) {
      if (this.loading) return;
      this.$emit("update:modelValue", value);
    },

    closeDialog() {
      if (this.loading) return;

      this.$emit("cancel");
      this.$emit("update:modelValue", false);
    },
  },
};
</script>

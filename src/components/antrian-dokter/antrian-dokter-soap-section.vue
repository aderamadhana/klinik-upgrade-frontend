<template>
  <div class="mb-6">
    <v-divider class="mb-5" />

    <div class="text-subtitle-1 font-weight-bold mb-3">SOAP</div>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-text class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-3">
              Subjective (S)
            </div>

            <v-select
              :model-value="form.subjective_selected"
              :items="subjectiveOptions"
              label="Pilih Subjective"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              closable-chips
              class="mb-3"
              @update:model-value="updateField('subjective_selected', $event)"
            />

            <v-textarea
              :model-value="form.subjective_lainnya"
              label="Subjective Lainnya"
              variant="outlined"
              rows="4"
              auto-grow
              @update:model-value="updateField('subjective_lainnya', $event)"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-text class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-3">
              Objective (O)
            </div>

            <v-textarea
              :model-value="form.objective"
              label="Objective"
              variant="outlined"
              rows="8"
              auto-grow
              @update:model-value="updateField('objective', $event)"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-text class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-3">
              Assessment (A)
            </div>

            <v-select
              :model-value="form.assessment_selected"
              :items="diagnosaOptions"
              label="Pilih Diagnosa"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              closable-chips
              class="mb-3"
              @update:model-value="updateField('assessment_selected', $event)"
            />

            <v-textarea
              :model-value="form.assessment_lainnya"
              label="Assessment Lainnya"
              variant="outlined"
              rows="3"
              auto-grow
              @update:model-value="updateField('assessment_lainnya', $event)"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-text class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-3">Plan (P)</div>

            <v-textarea
              :model-value="form.plan"
              label="Plan"
              variant="outlined"
              rows="3"
              auto-grow
              class="mb-3"
              @update:model-value="updateField('plan', $event)"
            />

            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  :model-value="form.next_date_konsultasi"
                  label="Next Date Konsultasi"
                  variant="outlined"
                  type="date"
                  density="comfortable"
                  @update:model-value="
                    updateField('next_date_konsultasi', $event)
                  "
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "AntrianDokterSoapSection",

  props: {
    form: {
      type: Object,
      required: true,
    },
    subjectiveOptions: {
      type: Array,
      default: () => [],
    },
    diagnosaOptions: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["update:form"],

  methods: {
    updateField(field, value) {
      this.$emit("update:form", {
        ...this.form,
        [field]: value,
      });
    },
  },
};
</script>

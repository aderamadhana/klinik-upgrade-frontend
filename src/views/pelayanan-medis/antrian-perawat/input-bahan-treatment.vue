<template>
  <div class="pa-4">
    <div
      class="d-flex flex-column flex-md-row justify-space-between align-start ga-4 mb-4"
    >
      <div>
        <div class="text-h5 font-weight-bold text-grey-darken-4">
          Input Bahan Treatment
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Catat realisasi pemakaian bahan sesuai treatment yang dikerjakan.
        </div>
      </div>

      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-arrow-left"
        :disabled="loading || saving"
        @click="goBack"
      >
        Kembali
      </v-btn>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="comfortable"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card rounded="lg" elevation="0" border class="mb-4">
      <v-card-text class="pa-4 pa-md-5">
        <div
          class="d-flex flex-column flex-md-row justify-space-between align-start ga-3 mb-4"
        >
          <div>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
              Ringkasan Treatment
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Pastikan pasien dan treatment sudah sesuai sebelum menyimpan.
            </div>
          </div>

          <v-chip
            :color="summaryStatusColor"
            variant="tonal"
            size="small"
            class="font-weight-bold"
          >
            {{ summary.status || "Draft" }}
          </v-chip>
        </div>

        <v-skeleton-loader v-if="loading" type="article" />

        <v-row v-else dense>
          <v-col
            v-for="item in summaryCards"
            :key="item.label"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              variant="tonal"
              color="grey-lighten-4"
              rounded="lg"
              height="100%"
            >
              <v-card-text class="pa-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ item.label }}
                </div>
                <div class="text-body-2 font-weight-bold text-grey-darken-4">
                  {{ item.value }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card rounded="lg" elevation="0" border>
      <v-card-title
        class="d-flex flex-column flex-md-row justify-space-between align-start ga-3 pa-4 pa-md-5"
      >
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            Daftar Bahan per Treatment
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Qty awal mengikuti template bahan treatment dan jumlah treatment.
          </div>
        </div>

        <v-chip
          color="primary"
          variant="tonal"
          size="small"
          class="font-weight-bold"
        >
          {{ totalFilledItems }}/{{ totalItems }} item terisi
        </v-chip>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4 pa-md-5">
        <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
          Simpan hanya setelah bahan benar-benar dipakai. Sistem akan menyimpan
          nama bahan, qty default, qty terpakai, satuan, perawat, dan tanggal
          pengisian.
        </v-alert>

        <v-skeleton-loader v-if="loading" type="list-item-three-line@4" />

        <v-alert
          v-else-if="!treatments.length"
          type="warning"
          variant="tonal"
          density="comfortable"
        >
          Template bahan treatment belum tersedia untuk treatment pada
          registrasi ini. Lengkapi master bahan treatment terlebih dahulu.
        </v-alert>

        <v-expansion-panels
          v-else
          v-model="openedPanels"
          multiple
          variant="accordion"
        >
          <v-expansion-panel
            v-for="(treatment, treatmentIndex) in treatments"
            :key="
              treatment.treatment_detail_id || treatment.id || treatmentIndex
            "
            rounded="lg"
            elevation="0"
            class="border mb-3"
          >
            <v-expansion-panel-title>
              <div
                class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center ga-3 w-100 pr-3"
              >
                <div class="d-flex align-start ga-3">
                  <v-avatar color="orange-lighten-5" size="40" rounded="lg">
                    <span class="text-orange-darken-2 font-weight-black"
                      >T</span
                    >
                  </v-avatar>

                  <div>
                    <div
                      class="text-body-1 font-weight-bold text-grey-darken-4"
                    >
                      {{ treatment.nama || "Treatment" }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                      Qty treatment: {{ treatment.jumlah || 1 }} •
                      {{ treatment.items.length }} item bahan
                    </div>
                  </div>
                </div>

                <v-chip
                  :color="
                    getTreatmentFilledCount(treatment) > 0 ? 'success' : 'grey'
                  "
                  variant="tonal"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ getTreatmentFilledCount(treatment) }}/{{
                    treatment.items.length
                  }}
                  terisi
                </v-chip>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-table density="comfortable" class="border rounded-lg">
                <thead>
                  <tr>
                    <th class="text-left font-weight-bold">Nama Bahan</th>
                    <th
                      class="text-right font-weight-bold"
                      style="width: 130px"
                    >
                      Qty Default
                    </th>
                    <th class="text-left font-weight-bold" style="width: 180px">
                      Qty Terpakai
                    </th>
                    <th class="text-left font-weight-bold" style="width: 110px">
                      Satuan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, itemIndex) in treatment.items"
                    :key="`${treatment.treatment_detail_id}-${item.master_treatment_perawat_bahan_id}-${item.perawat_bahan_id}-${itemIndex}`"
                  >
                    <td>
                      <div
                        class="text-body-2 font-weight-medium text-grey-darken-4"
                      >
                        {{ item.nama_bahan }}
                      </div>
                    </td>
                    <td class="text-right">
                      <span class="text-body-2 text-medium-emphasis">
                        {{ formatQty(item.jumlah_default) }}
                      </span>
                    </td>
                    <td>
                      <v-text-field
                        v-model="item.jumlah_terpakai"
                        type="number"
                        min="0"
                        step="0.01"
                        variant="outlined"
                        density="compact"
                        hide-details
                        :disabled="!canEdit || saving"
                      />
                    </td>
                    <td>
                      <span class="text-body-2 font-weight-bold">
                        {{ item.satuan || "-" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider />

      <v-card-actions
        class="d-flex flex-column flex-md-row justify-space-between align-stretch align-md-center ga-3 pa-4"
      >
        <div class="text-body-2 text-medium-emphasis">
          {{ totalFilledItems }}/{{ totalItems }} item bahan sudah memiliki qty
          terpakai.
        </div>

        <div class="d-flex ga-2 justify-end">
          <v-btn
            variant="text"
            color="secondary"
            :disabled="loading || saving || !canEdit"
            @click="resetQty"
          >
            Reset
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            :loading="saving"
            :disabled="loading || !canEdit || !treatments.length"
            @click="saveChanges"
          >
            Simpan Perubahan
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import antrianPerawatService from "@/services/pelayanan-medis/antrianPerawatService";

export default {
  name: "InputBahanTreatment",

  data() {
    return {
      loading: false,
      saving: false,
      errorMessage: "",
      openedPanels: [0],
      summary: {},
      treatments: [],
      initialTreatments: [],
      snackbar: {
        show: false,
        color: "success",
        text: "",
      },
    };
  },

  computed: {
    registrationId() {
      return this.$route.params.id;
    },

    canEdit() {
      return Boolean(this.summary?.can_edit);
    },

    summaryCards() {
      return [
        { label: "Nama Pasien", value: this.summary.pasien || "-" },
        { label: "No. RM", value: this.summary.no_rm || "-" },
        { label: "Cabang", value: this.summary.cabang || "-" },
        {
          label: "Tanggal Kunjungan",
          value: this.summary.tanggal_kunjungan || "-",
        },
        {
          label: "Jumlah Treatment",
          value: `${this.summary.total_treatment || 0} treatment`,
        },
        {
          label: "Jumlah Item Bahan",
          value: `${this.summary.total_bahan || 0} item`,
        },
        { label: "Perawat", value: this.summary.perawat || "-" },
        { label: "Channel", value: this.summary.channel || "-" },
      ];
    },

    summaryStatusColor() {
      const status = String(this.summary.status || "").toLowerCase();

      if (status === "lengkap") return "success";
      if (status === "sebagian") return "warning";
      return "grey";
    },

    totalItems() {
      return this.treatments.reduce((total, treatment) => {
        return total + (treatment.items?.length || 0);
      }, 0);
    },

    totalFilledItems() {
      return this.treatments.reduce((total, treatment) => {
        return (
          total +
          (treatment.items || []).filter(
            (item) => Number(item.jumlah_terpakai || 0) > 0,
          ).length
        );
      }, 0);
    },
  },

  created() {
    this.loadData();
  },

  methods: {
    async loadData() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await antrianPerawatService.getBahanTreatment(
          this.registrationId,
        );
        const data = response?.data || response || {};

        this.summary = data.summary || {};
        this.treatments = this.normalizeTreatments(data.treatments || []);
        this.initialTreatments = JSON.parse(JSON.stringify(this.treatments));
        this.openedPanels = this.treatments.length ? [0] : [];
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil data bahan treatment.",
        );
      } finally {
        this.loading = false;
      }
    },

    normalizeTreatments(treatments) {
      return treatments.map((treatment) => ({
        ...treatment,
        items: (treatment.items || []).map((item) => ({
          ...item,
          jumlah_default: Number(item.jumlah_default || 0),
          jumlah_terpakai: Number(item.jumlah_terpakai || 0),
        })),
      }));
    },

    getTreatmentFilledCount(treatment) {
      return (treatment.items || []).filter(
        (item) => Number(item.jumlah_terpakai || 0) > 0,
      ).length;
    },

    resetQty() {
      this.treatments = JSON.parse(JSON.stringify(this.initialTreatments));
    },

    buildPayloadItems() {
      return this.treatments.flatMap((treatment) => {
        return (treatment.items || []).map((item) => ({
          id: item.id || null,
          treatment_detail_id: Number(item.treatment_detail_id),
          master_treatment_perawat_bahan_id: Number(
            item.master_treatment_perawat_bahan_id,
          ),
          perawat_bahan_id: Number(item.perawat_bahan_id),
          jumlah_terpakai: Number(item.jumlah_terpakai || 0),
        }));
      });
    },

    async saveChanges() {
      if (!this.canEdit || this.saving) return;

      if (!this.totalItems) {
        this.showSnackbar(
          "Tidak ada bahan treatment untuk disimpan.",
          "warning",
        );
        return;
      }

      if (!this.totalFilledItems) {
        this.showSnackbar(
          "Isi minimal satu qty bahan yang benar-benar terpakai.",
          "error",
        );
        return;
      }

      const perawatId = Number(this.summary.perawat_id || 0);
      if (!perawatId) {
        this.showSnackbar("Perawat penanggung jawab belum tersedia.", "error");
        return;
      }

      this.saving = true;
      this.errorMessage = "";

      try {
        const response = await antrianPerawatService.saveBahanTreatment(
          this.registrationId,
          {
            tanggal_pengisian: new Date().toISOString(),
            perawat_id: perawatId,
            items: this.buildPayloadItems(),
          },
        );

        const data = response?.data || response || {};
        this.summary = data.summary || this.summary;
        this.treatments = this.normalizeTreatments(data.treatments || []);
        this.initialTreatments = JSON.parse(JSON.stringify(this.treatments));

        this.showSnackbar(
          response?.message || "Bahan treatment berhasil disimpan.",
          "success",
        );
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal menyimpan bahan treatment.",
        );
      } finally {
        this.saving = false;
      }
    },

    formatQty(value) {
      const numberValue = Number(value || 0);
      return numberValue.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },

    getErrorMessage(error, fallback) {
      const response = error?.response?.data;

      if (response?.message) return response.message;

      const errors = response?.errors;
      if (errors && typeof errors === "object") {
        const firstKey = Object.keys(errors)[0];
        const firstError = errors[firstKey];

        if (Array.isArray(firstError) && firstError.length) {
          return firstError[0];
        }
      }

      return error?.message || fallback;
    },

    goBack() {
      this.$router.back();
    },
  },
};
</script>

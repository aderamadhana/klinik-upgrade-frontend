<template>
  <v-card variant="outlined" rounded="lg" class="mb-5">
    <v-card-text class="pa-4">
      <div class="d-flex align-start justify-space-between flex-wrap ga-4">
        <div class="d-flex align-start ga-3">
          <v-avatar size="48" color="primary">
            <v-icon size="26">mdi-account-heart-outline</v-icon>
          </v-avatar>

          <div>
            <div class="d-flex align-center flex-wrap ga-2 mb-1">
              <div class="text-subtitle-1 font-weight-bold">
                {{ patient.nama_pasien || "-" }}
              </div>

              <v-chip
                size="x-small"
                color="primary"
                prepend-icon="mdi-card-account-details-outline"
              >
                {{ patient.no_rm || "-" }}
              </v-chip>
            </div>

            <div class="text-caption text-medium-emphasis mb-2">
              No Registrasi:
              <span class="font-weight-medium text-high-emphasis">
                {{ patient.kode_registrasi || "-" }}
              </span>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                v-for="chip in serviceChips"
                :key="chip.label"
                :color="chip.color"
                :prepend-icon="chip.icon"
                size="small"
              >
                {{ chip.label }}
              </v-chip>
            </div>
          </div>
        </div>

        <div class="d-flex align-center ga-2 flex-wrap">
          <v-chip
            size="small"
            :color="channelChip.color"
            :prepend-icon="channelChip.icon"
          >
            {{ channelChip.label }}
          </v-chip>
        </div>
      </div>

      <v-divider class="my-4" />

      <v-row dense>
        <v-col cols="12" sm="6" md="3">
          <v-sheet border rounded="lg" class="pa-3 h-100">
            <div class="d-flex align-start ga-2">
              <v-icon size="18" class="text-medium-emphasis mt-1">
                mdi-calendar-month-outline
              </v-icon>

              <div>
                <div class="text-caption text-medium-emphasis">
                  Tanggal Kunjungan
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ patient.tanggal_kunjungan || "-" }}
                </div>
              </div>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-sheet border rounded="lg" class="pa-3 h-100">
            <div class="d-flex align-start ga-2">
              <v-icon size="18" class="text-medium-emphasis mt-1">
                mdi-clock-outline
              </v-icon>

              <div>
                <div class="text-caption text-medium-emphasis">
                  Waktu Kunjungan
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ patient.waktu_kunjungan || "-" }}
                </div>
              </div>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-sheet border rounded="lg" class="pa-3 h-100">
            <div class="d-flex align-start ga-2">
              <v-icon size="18" class="text-medium-emphasis mt-1">
                mdi-hospital-building
              </v-icon>

              <div>
                <div class="text-caption text-medium-emphasis">Klinik</div>
                <div class="text-body-2 font-weight-bold">
                  {{ patient.klinik || "-" }}
                </div>
              </div>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-sheet border rounded="lg" class="pa-3 h-100">
            <div class="d-flex align-start ga-2">
              <v-icon size="18" class="text-medium-emphasis mt-1">
                mdi-doctor
              </v-icon>

              <div>
                <div class="text-caption text-medium-emphasis">Dokter</div>
                <div class="text-body-2 font-weight-bold">
                  {{ patient.dokter || "-" }}
                </div>
              </div>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-sheet border rounded="lg" class="pa-3 h-100">
            <div class="d-flex align-start ga-2">
              <v-icon size="18" class="text-medium-emphasis mt-1">
                mdi-phone-outline
              </v-icon>

              <div>
                <div class="text-caption text-medium-emphasis">No. HP</div>
                <div class="text-body-2 font-weight-bold">
                  {{ patient.no_hp || "-" }}
                </div>
              </div>
            </div>
          </v-sheet>
        </v-col>
      </v-row>

      <v-sheet border rounded="lg" class="pa-3 mt-4">
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <div>
            <div class="text-body-2 font-weight-bold">Aksi Pelayanan</div>
            <div class="text-caption text-medium-emphasis">
              Pilih tindakan lanjutan untuk pasien ini
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-btn
              color="secondary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-clipboard-text-outline"
              @click="$emit('pengkajian-awal')"
            >
              Pengkajian Awal
            </v-btn>

            <v-btn
              color="info"
              size="small"
              prepend-icon="mdi-face-recognition"
              @click="$emit('skin-analyzer')"
            >
              Skin Analyzer
            </v-btn>
          </div>
        </div>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "AntrianDokterPasienCard",

  props: {
    patient: {
      type: Object,
      required: true,
    },
    channelChip: {
      type: Object,
      required: true,
    },
    serviceChips: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["pengkajian-awal"],
};
</script>

<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-5"
    >
      Pilih minimal satu layanan. Jika konsultasi dipilih, tentukan juga channel
      konsultasinya.
    </v-alert>

    <div class="group-wrap mb-5">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="primary">
            mdi-clipboard-list-outline
          </v-icon>
          Jenis Layanan
        </div>
        <div class="group-subtitle">
          Aktifkan layanan yang dibutuhkan pada kunjungan ini
        </div>
      </div>

      <v-row dense>
        <v-col cols="12" md="4">
          <div
            class="service-box"
            :class="{ 'service-box--active': form.layanan.ada_konsultasi }"
            @click="toggleService('ada_konsultasi')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-stethoscope</v-icon>
              <v-checkbox
                :model-value="form.layanan.ada_konsultasi"
                color="primary"
                hide-details
                @click.stop
                @update:modelValue="
                  updateLayananField('ada_konsultasi', $event)
                "
              />
            </div>

            <div class="service-box__title">Konsultasi</div>
            <div class="service-box__desc">
              Digunakan jika pasien akan melakukan konsultasi dokter
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <div
            class="service-box"
            :class="{ 'service-box--active': form.layanan.ada_treatment }"
            @click="toggleService('ada_treatment')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-spa</v-icon>
              <v-checkbox
                :model-value="form.layanan.ada_treatment"
                color="primary"
                hide-details
                @click.stop
                @update:modelValue="updateLayananField('ada_treatment', $event)"
              />
            </div>

            <div class="service-box__title">Treatment</div>
            <div class="service-box__desc">
              Digunakan jika pasien akan menjalani tindakan atau treatment
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <div
            class="service-box"
            :class="{ 'service-box--active': form.layanan.ada_penjualan }"
            @click="toggleService('ada_penjualan')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-pill</v-icon>
              <v-checkbox
                :model-value="form.layanan.ada_penjualan"
                color="primary"
                hide-details
                @click.stop
                @update:modelValue="updateLayananField('ada_penjualan', $event)"
              />
            </div>

            <div class="service-box__title">Penjualan Langsung</div>
            <div class="service-box__desc">
              Digunakan jika ada penjualan obat atau produk tanpa treatment
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-expand-transition>
      <div v-if="form.layanan.ada_konsultasi" class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="primary"> mdi-access-point </v-icon>
            Channel Konsultasi
          </div>
          <div class="group-subtitle">
            Tentukan metode konsultasi yang dipakai pasien
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="6">
            <div
              class="channel-box"
              :class="{
                'channel-box--active':
                  form.layanan.channel_konsultasi === 'offline',
              }"
              @click="updateLayananField('channel_konsultasi', 'offline')"
            >
              <div class="channel-box__icon">
                <v-icon color="primary">mdi-hospital-building</v-icon>
              </div>
              <div>
                <div class="channel-box__title">Offline</div>
                <div class="channel-box__desc">
                  Pasien datang langsung dan konsultasi di klinik
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div
              class="channel-box"
              :class="{
                'channel-box--active':
                  form.layanan.channel_konsultasi === 'online',
              }"
              @click="updateLayananField('channel_konsultasi', 'online')"
            >
              <div class="channel-box__icon">
                <v-icon color="primary">mdi-video-outline</v-icon>
              </div>
              <div>
                <div class="channel-box__title">Online</div>
                <div class="channel-box__desc">
                  Pasien konsultasi jarak jauh melalui media online
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>

    <div class="group-wrap">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="success">
            mdi-clipboard-text-outline
          </v-icon>
          Ringkasan Pilihan
        </div>
        <div class="group-subtitle">
          Preview layanan yang sudah dipilih pada registrasi ini
        </div>
      </div>

      <v-row dense>
        <v-col cols="12" md="4">
          <div class="summary-box">
            <div class="summary-label">Konsultasi</div>
            <div class="summary-value">
              {{
                form.layanan.ada_konsultasi
                  ? `Ya (${form.layanan.channel_konsultasi || "channel belum dipilih"})`
                  : "Tidak"
              }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <div class="summary-box">
            <div class="summary-label">Treatment</div>
            <div class="summary-value">
              {{ form.layanan.ada_treatment ? "Ya" : "Tidak" }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <div class="summary-box">
            <div class="summary-label">Penjualan Langsung</div>
            <div class="summary-value">
              {{ form.layanan.ada_penjualan ? "Ya" : "Tidak" }}
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  name: "PilihLayanan",
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
  emits: ["update-layanan-field"],
  methods: {
    updateLayananField(field, value) {
      this.$emit("update-layanan-field", { field, value });
    },

    toggleService(field) {
      const currentValue = this.form.layanan[field];
      const newValue = !currentValue;

      this.$emit("update-layanan-field", {
        field,
        value: newValue,
      });

      if (field === "ada_konsultasi" && !newValue) {
        this.$emit("update-layanan-field", {
          field: "channel_konsultasi",
          value: "",
        });
      }

      if (
        field === "ada_konsultasi" &&
        newValue &&
        !this.form.layanan.channel_konsultasi
      ) {
        this.$emit("update-layanan-field", {
          field: "channel_konsultasi",
          value: "offline",
        });
      }
    },
  },
};
</script>

<style scoped>
.layanan-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.group-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 20px;
  background: #fff;
}

.group-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.group-subtitle {
  font-size: 13px;
  color: #6b7280;
}

.service-box {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 18px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.service-box:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.service-box--active {
  border-color: rgba(var(--v-theme-primary), 0.45);
  background: rgba(var(--v-theme-primary), 0.05);
}

.service-box__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.service-box__title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.service-box__desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.channel-box {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  min-height: 100%;
}

.channel-box:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.channel-box--active {
  border-color: rgba(var(--v-theme-primary), 0.45);
  background: rgba(var(--v-theme-primary), 0.05);
}

.channel-box__icon {
  flex: 0 0 auto;
}

.channel-box__title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.channel-box__desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.summary-box {
  height: 100%;
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.summary-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .group-wrap {
    padding: 16px;
  }
}
</style>

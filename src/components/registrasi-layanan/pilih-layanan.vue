<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-5"
    >
      Pilih layanan yang dibutuhkan pada kunjungan ini. Jika konsultasi dipilih,
      tentukan juga channel konsultasinya.
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
            :class="{ 'service-box--active': layananState.ada_konsultasi }"
            @click="toggleService('ada_konsultasi')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-stethoscope</v-icon>
              <v-checkbox
                :model-value="layananState.ada_konsultasi"
                color="primary"
                hide-details
                @click.stop
                @update:modelValue="
                  handleServiceChange('ada_konsultasi', $event)
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
            :class="{ 'service-box--active': layananState.ada_treatment }"
            @click="toggleService('ada_treatment')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-spa</v-icon>
              <v-checkbox
                :model-value="layananState.ada_treatment"
                color="primary"
                hide-details
                @click.stop
                @update:modelValue="
                  handleServiceChange('ada_treatment', $event)
                "
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
            :class="{ 'service-box--active': layananState.ada_penjualan }"
            @click="toggleService('ada_penjualan')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-pill</v-icon>
              <v-checkbox
                :model-value="layananState.ada_penjualan"
                color="primary"
                hide-details
                @click.stop
                @update:modelValue="
                  handleServiceChange('ada_penjualan', $event)
                "
              />
            </div>

            <div class="service-box__title">Penjualan Produk</div>
            <div class="service-box__desc">
              Digunakan jika ada penjualan obat atau produk pada kunjungan ini
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-expand-transition>
      <div v-if="layananState.ada_konsultasi" class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="primary">mdi-access-point</v-icon>
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
                  layananState.channel_konsultasi === 'offline',
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
                  layananState.channel_konsultasi === 'online',
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

    <v-expand-transition>
      <div v-if="warningOnlineTreatment" class="mb-5">
        <v-alert type="warning" variant="tonal" rounded="lg" border="start">
          Konsultasi online dipilih bersamaan dengan treatment. Pastikan alurnya
          memang sesuai operasional klinik.
        </v-alert>
      </div>
    </v-expand-transition>

    <div class="group-wrap mb-5">
      <div class="group-head mb-4">
        <div class="group-title">
          <v-icon class="mr-2" color="success">
            mdi-clipboard-text-outline
          </v-icon>
          Ringkasan Pilihan
        </div>
        <div class="group-subtitle">
          Preview layanan yang dipilih pada registrasi ini
        </div>
      </div>

      <v-row dense>
        <v-col cols="12" md="6">
          <div class="summary-box">
            <div class="summary-label">Layanan Aktif</div>

            <div class="summary-row">
              <span>Konsultasi</span>
              <strong>{{
                layananState.ada_konsultasi ? "Ya" : "Tidak"
              }}</strong>
            </div>

            <div class="summary-row">
              <span>Channel Konsultasi</span>
              <strong>{{
                formatChannel(layananState.channel_konsultasi)
              }}</strong>
            </div>

            <div class="summary-row">
              <span>Treatment</span>
              <strong>{{ layananState.ada_treatment ? "Ya" : "Tidak" }}</strong>
            </div>

            <div class="summary-row">
              <span>Penjualan Produk</span>
              <strong>{{ layananState.ada_penjualan ? "Ya" : "Tidak" }}</strong>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="summary-box">
            <div class="summary-label">Preview Alur Awal</div>

            <div class="summary-row">
              <span>Tahap Berikutnya</span>
              <strong>{{ nextFlowLabel }}</strong>
            </div>

            <div class="summary-row">
              <span>Treatment Routing</span>
              <strong>Ditentukan di form treatment</strong>
            </div>

            <div class="summary-row">
              <span>Status Pilihan</span>
              <strong
                :class="
                  validationMessages.length ? 'text-error' : 'text-success'
                "
              >
                {{
                  validationMessages.length ? "Belum lengkap" : "Siap lanjut"
                }}
              </strong>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-expand-transition>
      <div v-if="validationMessages.length" class="group-wrap validation-wrap">
        <div class="group-head mb-3">
          <div class="group-title text-error">
            <v-icon class="mr-2" color="error">mdi-alert-circle-outline</v-icon>
            Yang masih harus dilengkapi
          </div>
        </div>

        <div class="validation-list">
          <div
            v-for="(message, index) in validationMessages"
            :key="index"
            class="validation-item"
          >
            {{ message }}
          </div>
        </div>
      </div>
    </v-expand-transition>
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
  computed: {
    layananState() {
      return {
        ada_konsultasi: false,
        channel_konsultasi: "",
        ada_treatment: false,
        ada_penjualan: false,
        ...(this.form?.layanan || {}),
      };
    },
    hasAnyService() {
      return (
        this.layananState.ada_konsultasi ||
        this.layananState.ada_treatment ||
        this.layananState.ada_penjualan
      );
    },
    validationMessages() {
      const messages = [];

      if (!this.hasAnyService) {
        messages.push("Pilih minimal satu layanan.");
      }

      if (
        this.layananState.ada_konsultasi &&
        !this.layananState.channel_konsultasi
      ) {
        messages.push("Channel konsultasi wajib dipilih.");
      }

      return messages;
    },
    warningOnlineTreatment() {
      return (
        this.layananState.ada_konsultasi &&
        this.layananState.channel_konsultasi === "online" &&
        this.layananState.ada_treatment
      );
    },
    nextFlowLabel() {
      if (this.layananState.ada_konsultasi) {
        return "Masuk ke form konsultasi";
      }

      if (this.layananState.ada_treatment) {
        return "Masuk ke form treatment";
      }

      if (this.layananState.ada_penjualan) {
        return "Masuk ke form penjualan";
      }

      return "-";
    },
  },
  methods: {
    updateLayananField(field, value) {
      this.$emit("update-layanan-field", { field, value });
    },

    handleServiceChange(field, value) {
      this.updateLayananField(field, value);

      if (field === "ada_konsultasi" && !value) {
        this.updateLayananField("channel_konsultasi", "");
      }
    },

    toggleService(field) {
      const currentValue = Boolean(this.layananState[field]);
      this.handleServiceChange(field, !currentValue);
    },

    formatChannel(value) {
      if (!value) return "-";
      if (value === "offline") return "Offline";
      if (value === "online") return "Online";
      return value;
    },
  },
};
</script>

<style scoped>
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
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px dashed #dbe3ef;
}

.summary-row:last-child {
  border-bottom: none;
}

.validation-wrap {
  border-color: rgba(var(--v-theme-error), 0.25);
  background: rgba(var(--v-theme-error), 0.03);
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.validation-item {
  font-size: 13px;
  color: #b91c1c;
}

.text-success {
  color: #16a34a;
}

.text-error {
  color: #dc2626;
}

@media (max-width: 768px) {
  .group-wrap {
    padding: 16px;
  }

  .summary-row {
    flex-direction: column;
    gap: 6px;
  }
}
</style>

<template>
  <div class="mt-3">
    <v-alert
      type="info"
      variant="tonal"
      rounded="lg"
      border="start"
      class="mb-5"
    >
      Pilih satu atau lebih layanan yang dibutuhkan pada kunjungan ini.
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
          Konsultasi, treatment, dan penjualan produk bisa dipilih bersamaan
        </div>
      </div>

      <v-row density="comfortable">
        <v-col cols="12" md="4">
          <div
            class="service-box"
            :class="{ 'service-box--active': localLayanan.ada_konsultasi }"
            role="button"
            tabindex="0"
            @click="toggleService('ada_konsultasi')"
            @keyup.enter="toggleService('ada_konsultasi')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-stethoscope</v-icon>

              <v-icon
                :color="localLayanan.ada_konsultasi ? 'success' : 'grey'"
                size="26"
              >
                {{
                  localLayanan.ada_konsultasi
                    ? "mdi-check-circle"
                    : "mdi-checkbox-blank-circle-outline"
                }}
              </v-icon>
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
            :class="{ 'service-box--active': localLayanan.ada_treatment }"
            role="button"
            tabindex="0"
            @click="toggleService('ada_treatment')"
            @keyup.enter="toggleService('ada_treatment')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-spa</v-icon>

              <v-icon
                :color="localLayanan.ada_treatment ? 'success' : 'grey'"
                size="26"
              >
                {{
                  localLayanan.ada_treatment
                    ? "mdi-check-circle"
                    : "mdi-checkbox-blank-circle-outline"
                }}
              </v-icon>
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
            :class="{ 'service-box--active': localLayanan.ada_penjualan }"
            role="button"
            tabindex="0"
            @click="toggleService('ada_penjualan')"
            @keyup.enter="toggleService('ada_penjualan')"
          >
            <div class="service-box__top">
              <v-icon color="primary">mdi-pill</v-icon>

              <v-icon
                :color="localLayanan.ada_penjualan ? 'success' : 'grey'"
                size="26"
              >
                {{
                  localLayanan.ada_penjualan
                    ? "mdi-check-circle"
                    : "mdi-checkbox-blank-circle-outline"
                }}
              </v-icon>
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
      <div v-if="localLayanan.ada_konsultasi" class="group-wrap mb-5">
        <div class="group-head mb-4">
          <div class="group-title">
            <v-icon class="mr-2" color="primary"> mdi-access-point </v-icon>
            Channel Konsultasi
          </div>

          <div class="group-subtitle">
            Tentukan metode konsultasi yang dipakai pasien
          </div>
        </div>

        <v-row density="comfortable">
          <v-col cols="12" md="6">
            <div
              class="channel-box"
              :class="{
                'channel-box--active':
                  localLayanan.channel_konsultasi === 'offline',
              }"
              role="button"
              tabindex="0"
              @click="setChannel('offline')"
              @keyup.enter="setChannel('offline')"
            >
              <div class="channel-box__icon">
                <v-icon color="primary">mdi-hospital-building</v-icon>
              </div>

              <div class="channel-box__body">
                <div class="channel-box__title">Offline</div>
                <div class="channel-box__desc">
                  Pasien datang langsung dan konsultasi di klinik
                </div>
              </div>

              <v-icon
                :color="
                  localLayanan.channel_konsultasi === 'offline'
                    ? 'success'
                    : 'grey'
                "
                size="24"
              >
                {{
                  localLayanan.channel_konsultasi === "offline"
                    ? "mdi-check-circle"
                    : "mdi-checkbox-blank-circle-outline"
                }}
              </v-icon>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div
              class="channel-box"
              :class="{
                'channel-box--active':
                  localLayanan.channel_konsultasi === 'online',
              }"
              role="button"
              tabindex="0"
              @click="setChannel('online')"
              @keyup.enter="setChannel('online')"
            >
              <div class="channel-box__icon">
                <v-icon color="primary">mdi-video-outline</v-icon>
              </div>

              <div class="channel-box__body">
                <div class="channel-box__title">Online</div>
                <div class="channel-box__desc">
                  Pasien konsultasi jarak jauh melalui media online
                </div>
              </div>

              <v-icon
                :color="
                  localLayanan.channel_konsultasi === 'online'
                    ? 'success'
                    : 'grey'
                "
                size="24"
              >
                {{
                  localLayanan.channel_konsultasi === "online"
                    ? "mdi-check-circle"
                    : "mdi-checkbox-blank-circle-outline"
                }}
              </v-icon>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>

    <v-expand-transition>
      <div v-if="validationMessages.length" class="group-wrap validation-wrap">
        <div class="group-head mb-3">
          <div class="group-title text-error">
            <v-icon class="mr-2" color="error">
              mdi-alert-circle-outline
            </v-icon>
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

  emits: ["update-field"],

  data() {
    return {
      localLayanan: {
        ada_konsultasi: false,
        channel_konsultasi: "",
        ada_treatment: false,
        ada_penjualan: false,
        route_treatment: "",
      },
    };
  },

  computed: {
    validationMessages() {
      const messages = [];

      if (
        !this.localLayanan.ada_konsultasi &&
        !this.localLayanan.ada_treatment &&
        !this.localLayanan.ada_penjualan
      ) {
        messages.push("Minimal pilih satu layanan.");
      }

      if (
        this.localLayanan.ada_konsultasi &&
        !this.localLayanan.channel_konsultasi
      ) {
        messages.push("Channel konsultasi wajib dipilih.");
      }

      return messages;
    },
  },

  watch: {
    "form.layanan": {
      immediate: true,
      deep: true,
      handler(value) {
        const next = this.normalizeLayanan(value);

        if (!this.isSameLayanan(next, this.localLayanan)) {
          this.localLayanan = next;
        }
      },
    },
  },

  methods: {
    normalizeLayanan(value = {}) {
      return {
        ada_konsultasi: Boolean(value?.ada_konsultasi),
        channel_konsultasi: value?.channel_konsultasi || "",
        ada_treatment: Boolean(value?.ada_treatment),
        ada_penjualan: Boolean(value?.ada_penjualan),
        route_treatment: value?.route_treatment || "",
      };
    },

    isSameLayanan(a, b) {
      return (
        Boolean(a?.ada_konsultasi) === Boolean(b?.ada_konsultasi) &&
        String(a?.channel_konsultasi || "") ===
          String(b?.channel_konsultasi || "") &&
        Boolean(a?.ada_treatment) === Boolean(b?.ada_treatment) &&
        Boolean(a?.ada_penjualan) === Boolean(b?.ada_penjualan) &&
        String(a?.route_treatment || "") === String(b?.route_treatment || "")
      );
    },

    toggleService(field) {
      const next = {
        ...this.localLayanan,
        [field]: !this.localLayanan[field],
      };

      if (field === "ada_konsultasi" && !next.ada_konsultasi) {
        next.channel_konsultasi = "";
      }

      if (field === "ada_treatment" && !next.ada_treatment) {
        next.route_treatment = "";
      }

      this.localLayanan = next;
      this.emitLayanan();
    },

    setChannel(channel) {
      this.localLayanan = {
        ...this.localLayanan,
        channel_konsultasi: channel,
      };

      this.emitLayanan();
    },

    emitLayanan() {
      this.$emit("update-field", {
        field: "layanan",
        value: {
          ada_konsultasi: Boolean(this.localLayanan.ada_konsultasi),
          channel_konsultasi: this.localLayanan.channel_konsultasi || "",
          ada_treatment: Boolean(this.localLayanan.ada_treatment),
          ada_penjualan: Boolean(this.localLayanan.ada_penjualan),
          route_treatment: this.localLayanan.route_treatment || "",
        },
      });
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
  color: #475569;
}

.service-box {
  height: 100%;
  min-height: 128px;
  border: 1px solid #dbe4f0;
  border-radius: 18px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: 0.18s ease;
  user-select: none;
}

.service-box:hover {
  border-color: #93c5fd;
  background: #f8fbff;
}

.service-box--active {
  border-color: #60a5fa;
  background: #eff6ff;
}

.service-box__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  color: #475569;
  line-height: 1.4;
}

.channel-box {
  height: 100%;
  min-height: 78px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: 0.18s ease;
  user-select: none;
}

.channel-box:hover {
  border-color: #93c5fd;
  background: #f8fbff;
}

.channel-box--active {
  border-color: #60a5fa;
  background: #eff6ff;
}

.channel-box__icon {
  width: 34px;
  display: flex;
  justify-content: center;
}

.channel-box__body {
  flex: 1;
}

.channel-box__title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 5px;
}

.channel-box__desc {
  font-size: 13px;
  color: #475569;
}

.validation-wrap {
  border-color: #fecaca;
  background: #fff7f7;
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

@media (max-width: 768px) {
  .group-wrap {
    padding: 16px;
  }
}
</style>

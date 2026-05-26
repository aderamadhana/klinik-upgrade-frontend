<template>
  <div class="mt-3">
    <v-card variant="flat" class="border mb-4">
      <v-card-text class="pa-4">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
        >
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="42">
              <v-icon size="22">mdi-clipboard-list-outline</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">Jenis Layanan</div>
              <div class="text-caption text-medium-emphasis">
                Pilih layanan yang dibutuhkan pasien.
              </div>
            </div>
          </div>

          <v-chip
            :color="
              localLayanan.ada_konsultasi ||
              localLayanan.ada_treatment ||
              localLayanan.ada_penjualan
                ? 'success'
                : 'warning'
            "
            variant="tonal"
            size="small"
            class="font-weight-medium"
          >
            <v-icon start size="16">
              {{
                localLayanan.ada_konsultasi ||
                localLayanan.ada_treatment ||
                localLayanan.ada_penjualan
                  ? "mdi-check-circle-outline"
                  : "mdi-alert-circle-outline"
              }}
            </v-icon>
            {{
              localLayanan.ada_konsultasi ||
              localLayanan.ada_treatment ||
              localLayanan.ada_penjualan
                ? "Layanan dipilih"
                : "Belum ada layanan"
            }}
          </v-chip>
        </div>

        <v-row dense>
          <v-col cols="12" md="4">
            <v-card
              :color="localLayanan.ada_konsultasi ? 'primary' : undefined"
              :variant="localLayanan.ada_konsultasi ? 'tonal' : 'outlined'"
              hover
              rounded="lg"
              role="button"
              tabindex="0"
              @click="toggleService('ada_konsultasi')"
              @keyup.enter="toggleService('ada_konsultasi')"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between ga-3">
                  <v-avatar color="primary" variant="tonal" size="42">
                    <v-icon size="22">mdi-stethoscope</v-icon>
                  </v-avatar>

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

                <div class="text-subtitle-2 font-weight-bold mt-4">
                  Konsultasi
                </div>

                <div class="text-caption text-medium-emphasis mt-1">
                  Konsultasi dokter, online, SPPG, SPKK, atau jenis konsultasi
                  lain.
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card
              :color="localLayanan.ada_treatment ? 'success' : undefined"
              :variant="localLayanan.ada_treatment ? 'tonal' : 'outlined'"
              hover
              rounded="lg"
              role="button"
              tabindex="0"
              @click="toggleService('ada_treatment')"
              @keyup.enter="toggleService('ada_treatment')"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between ga-3">
                  <v-avatar color="success" variant="tonal" size="42">
                    <v-icon size="22">mdi-spa</v-icon>
                  </v-avatar>

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

                <div class="text-subtitle-2 font-weight-bold mt-4">
                  Treatment
                </div>

                <div class="text-caption text-medium-emphasis mt-1">
                  Pasien menjalani tindakan atau treatment.
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card
              :color="localLayanan.ada_penjualan ? 'info' : undefined"
              :variant="localLayanan.ada_penjualan ? 'tonal' : 'outlined'"
              hover
              rounded="lg"
              role="button"
              tabindex="0"
              @click="toggleService('ada_penjualan')"
              @keyup.enter="toggleService('ada_penjualan')"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between ga-3">
                  <v-avatar color="info" variant="tonal" size="42">
                    <v-icon size="22">mdi-pill</v-icon>
                  </v-avatar>

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

                <div class="text-subtitle-2 font-weight-bold mt-4">
                  Penjualan Produk
                </div>

                <div class="text-caption text-medium-emphasis mt-1">
                  Pasien membeli produk atau obat.
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-expand-transition>
      <v-card
        v-if="localLayanan.ada_konsultasi"
        variant="flat"
        class="border mb-4"
      >
        <v-card-text class="pa-4">
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
          >
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="tonal" size="42">
                <v-icon size="22">mdi-account-voice</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Pilih Jenis Konsultasi
                </div>
                <div class="text-caption text-medium-emphasis">
                  Pilihan mengikuti master mapping yang aktif.
                </div>
              </div>
            </div>

            <v-chip color="primary" variant="tonal" size="small">
              {{ konsultasiMappingOptions.length }} opsi tersedia
            </v-chip>
          </div>

          <v-alert
            v-if="!konsultasiMappingOptions.length"
            type="warning"
            variant="tonal"
            density="comfortable"
            border="start"
          >
            Belum ada mapping konsultasi aktif.
          </v-alert>

          <template v-else>
            <div
              v-for="group in konsultasiGroups"
              :key="group.key"
              class="mb-4"
            >
              <div class="d-flex align-center ga-2 mb-3">
                <v-icon size="18" color="primary">
                  {{ group.icon }}
                </v-icon>

                <div class="text-subtitle-2 font-weight-bold">
                  {{ group.title }}
                </div>
              </div>

              <v-row dense>
                <v-col
                  v-for="mapping in group.items"
                  :key="mapping.id || mapping.source_code"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card
                    :color="
                      localLayanan.konsultasi_source_code ===
                      mapping.source_code
                        ? 'primary'
                        : undefined
                    "
                    :variant="
                      localLayanan.konsultasi_source_code ===
                      mapping.source_code
                        ? 'tonal'
                        : 'outlined'
                    "
                    hover
                    rounded="lg"
                    role="button"
                    tabindex="0"
                    @click="selectKonsultasiMapping(mapping)"
                    @keyup.enter="selectKonsultasiMapping(mapping)"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex align-start ga-3">
                        <v-avatar color="primary" variant="tonal" size="38">
                          <v-icon size="20">
                            {{ getKonsultasiIcon(mapping) }}
                          </v-icon>
                        </v-avatar>

                        <div class="flex-grow-1">
                          <div class="text-body-2 font-weight-bold">
                            {{
                              mapping.source_name ||
                              mapping.nama_accurate ||
                              mapping.source_code
                            }}
                          </div>

                          <div class="text-caption text-medium-emphasis mt-1">
                            Biaya default
                          </div>

                          <div class="text-body-2 font-weight-bold mt-1">
                            Rp {{ formatNumber(mapping.default_harga || 0) }}
                          </div>
                        </div>

                        <v-icon
                          :color="
                            localLayanan.konsultasi_source_code ===
                            mapping.source_code
                              ? 'success'
                              : 'grey'
                          "
                          size="24"
                        >
                          {{
                            localLayanan.konsultasi_source_code ===
                            mapping.source_code
                              ? "mdi-check-circle"
                              : "mdi-checkbox-blank-circle-outline"
                          }}
                        </v-icon>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <v-expand-transition>
      <v-card
        v-if="localLayanan.ada_penjualan"
        variant="flat"
        class="border mb-4"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="info" variant="tonal" size="42">
                <v-icon size="22">mdi-cart-arrow-down</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Opsi Penjualan
                </div>
                <div class="text-caption text-medium-emphasis">
                  Tandai jika transaksi berasal dari pembelian online.
                </div>
              </div>
            </div>

            <v-switch
              v-model="localLayanan.is_pembelian_online"
              color="primary"
              density="compact"
              hide-details
              inset
              @update:model-value="emitLayanan"
            >
              <template #label>
                <span class="text-body-2 font-weight-medium">
                  Pembelian Online
                </span>
              </template>
            </v-switch>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <v-expand-transition>
      <v-card v-if="validationMessages.length" variant="flat" class="border">
        <v-card-text class="pa-4">
          <div class="d-flex flex-column ga-2">
            <v-alert
              v-for="(message, index) in validationMessages"
              :key="index"
              type="warning"
              variant="tonal"
              density="compact"
              border="start"
            >
              {{ message }}
            </v-alert>
          </div>
        </v-card-text>
      </v-card>
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

    accurateMappingList: {
      type: Array,
      default: () => [],
    },

    selectedKonsultasiMapping: {
      type: Object,
      default: null,
    },
  },

  emits: ["update-field", "update-layanan-field"],

  data() {
    return {
      localLayanan: {
        ada_konsultasi: false,
        channel_konsultasi: "",
        konsultasi_source_code: null,
        konsultasi_source_name: null,
        konsultasi_mapping_id: null,
        ada_treatment: false,
        ada_penjualan: false,
        route_treatment: "",
        is_pembelian_online: false,
      },
    };
  },

  computed: {
    activeMappings() {
      return (this.accurateMappingList || [])
        .filter((item) => {
          if (!item) return false;

          return (
            !this.toBoolean(item.is_delete) &&
            this.toBoolean(item.is_active !== undefined ? item.is_active : true)
          );
        })
        .sort((a, b) => {
          const sortA = Number(a.sort_order || 0);
          const sortB = Number(b.sort_order || 0);

          if (sortA !== sortB) return sortA - sortB;

          const idA = Number(a.id || 0);
          const idB = Number(b.id || 0);

          if (idA !== idB) return idA - idB;

          return String(a.source_name || "").localeCompare(
            String(b.source_name || ""),
          );
        });
    },

    konsultasiMappingOptions() {
      return this.activeMappings.filter((item) => {
        return this.normalizeSourceType(item.source_type) === "konsultasi";
      });
    },

    offlineKonsultasiOptions() {
      return this.konsultasiMappingOptions.filter((item) => {
        return !this.isOnlineSourceCode(item.source_code);
      });
    },

    onlineKonsultasiOptions() {
      return this.konsultasiMappingOptions.filter((item) => {
        return this.isOnlineSourceCode(item.source_code);
      });
    },

    konsultasiGroups() {
      const groups = [];

      if (this.offlineKonsultasiOptions.length) {
        groups.push({
          key: "offline",
          title: "Konsultasi Offline",
          icon: "mdi-hospital-building",
          items: this.offlineKonsultasiOptions,
        });
      }

      if (this.onlineKonsultasiOptions.length) {
        groups.push({
          key: "online",
          title: "Konsultasi Online",
          icon: "mdi-video-outline",
          items: this.onlineKonsultasiOptions,
        });
      }

      return groups;
    },

    pembelianOnlineMapping() {
      return (
        this.activeMappings.find((item) => {
          return (
            this.normalizeSourceType(item.source_type) === "pembelian" &&
            String(item.source_code || "").toUpperCase() === "PEMBELIAN_ONLINE"
          );
        }) || null
      );
    },

    selectedKonsultasiMappingLocal() {
      return this.getMappingBySourceCode(
        this.localLayanan.konsultasi_source_code,
      );
    },

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
        !this.localLayanan.konsultasi_source_code
      ) {
        messages.push("Jenis konsultasi wajib dipilih.");
      }

      if (
        this.localLayanan.ada_konsultasi &&
        this.localLayanan.konsultasi_source_code &&
        !this.selectedKonsultasiMappingLocal
      ) {
        messages.push(
          `Mapping konsultasi ${this.localLayanan.konsultasi_source_code} tidak ditemukan.`,
        );
      }

      if (
        this.localLayanan.ada_konsultasi &&
        this.selectedKonsultasiMappingLocal &&
        this.toBoolean(
          this.selectedKonsultasiMappingLocal.is_send_to_accurate,
        ) &&
        !this.selectedKonsultasiMappingLocal.kode_accurate
      ) {
        messages.push(
          `Kode Accurate ${this.selectedKonsultasiMappingLocal.source_code} belum diisi.`,
        );
      }

      if (
        this.localLayanan.is_pembelian_online &&
        !this.pembelianOnlineMapping
      ) {
        messages.push("Mapping PEMBELIAN_ONLINE belum tersedia.");
      }

      if (
        this.localLayanan.is_pembelian_online &&
        this.pembelianOnlineMapping &&
        this.toBoolean(this.pembelianOnlineMapping.is_send_to_accurate) &&
        !this.pembelianOnlineMapping.kode_accurate
      ) {
        messages.push("Kode Accurate PEMBELIAN_ONLINE belum diisi.");
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

    konsultasiMappingOptions: {
      immediate: true,
      deep: true,
      handler() {
        this.ensureDefaultKonsultasiMapping();
      },
    },
  },

  methods: {
    normalizeSourceType(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    },

    normalizeLayanan(value = {}) {
      const adaKonsultasi = Boolean(value?.ada_konsultasi);

      let konsultasiSourceCode =
        value?.konsultasi_source_code ||
        value?.source_code_konsultasi ||
        value?.selected_konsultasi_source_code ||
        null;

      if (!adaKonsultasi) {
        konsultasiSourceCode = null;
      }

      const selectedMapping = this.getMappingBySourceCode(konsultasiSourceCode);

      let channelKonsultasi =
        value?.channel_konsultasi ||
        this.getKonsultasiChannel(selectedMapping) ||
        "";

      if (!adaKonsultasi) {
        channelKonsultasi = "";
      }

      if (adaKonsultasi && konsultasiSourceCode && !channelKonsultasi) {
        channelKonsultasi = this.isOnlineSourceCode(konsultasiSourceCode)
          ? "online"
          : "offline";
      }

      return {
        ada_konsultasi: adaKonsultasi,
        channel_konsultasi: channelKonsultasi,
        konsultasi_source_code: konsultasiSourceCode,
        konsultasi_source_name:
          selectedMapping?.source_name || value?.konsultasi_source_name || null,
        konsultasi_mapping_id:
          selectedMapping?.id || value?.konsultasi_mapping_id || null,
        ada_treatment: Boolean(value?.ada_treatment),
        ada_penjualan: Boolean(value?.ada_penjualan),
        route_treatment: value?.route_treatment || "",
        is_pembelian_online: Boolean(value?.is_pembelian_online),
      };
    },

    isSameLayanan(a, b) {
      return (
        Boolean(a?.ada_konsultasi) === Boolean(b?.ada_konsultasi) &&
        String(a?.channel_konsultasi || "") ===
          String(b?.channel_konsultasi || "") &&
        String(a?.konsultasi_source_code || "") ===
          String(b?.konsultasi_source_code || "") &&
        String(a?.konsultasi_source_name || "") ===
          String(b?.konsultasi_source_name || "") &&
        String(a?.konsultasi_mapping_id || "") ===
          String(b?.konsultasi_mapping_id || "") &&
        Boolean(a?.ada_treatment) === Boolean(b?.ada_treatment) &&
        Boolean(a?.ada_penjualan) === Boolean(b?.ada_penjualan) &&
        String(a?.route_treatment || "") === String(b?.route_treatment || "") &&
        Boolean(a?.is_pembelian_online) === Boolean(b?.is_pembelian_online)
      );
    },

    toBoolean(value) {
      return value === true || value === 1 || value === "1";
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("id-ID");
    },

    getMappingBySourceCode(sourceCode) {
      if (!sourceCode) return null;

      return (
        this.activeMappings.find((item) => {
          return (
            String(item.source_code || "").toUpperCase() ===
            String(sourceCode || "").toUpperCase()
          );
        }) || null
      );
    },

    isOnlineSourceCode(sourceCode) {
      return String(sourceCode || "")
        .toUpperCase()
        .includes("ONLINE");
    },

    getKonsultasiChannel(mapping) {
      const sourceCode = mapping?.source_code || "";

      if (!sourceCode) return "";

      return this.isOnlineSourceCode(sourceCode) ? "online" : "offline";
    },

    getKonsultasiIcon(mapping) {
      const sourceCode = String(mapping?.source_code || "").toUpperCase();

      if (sourceCode.includes("ONLINE")) return "mdi-video-outline";
      if (sourceCode.includes("SPPG")) return "mdi-account-heart-outline";
      if (sourceCode.includes("SPKK")) return "mdi-doctor";

      return "mdi-hospital-building";
    },

    ensureDefaultKonsultasiMapping() {
      if (!this.localLayanan.ada_konsultasi) return;

      if (this.localLayanan.konsultasi_source_code) return;

      const firstMapping =
        this.offlineKonsultasiOptions[0] ||
        this.onlineKonsultasiOptions[0] ||
        this.konsultasiMappingOptions[0];

      if (!firstMapping) return;

      this.selectKonsultasiMapping(firstMapping);
    },

    toggleService(field) {
      const next = {
        ...this.localLayanan,
        [field]: !this.localLayanan[field],
      };

      if (field === "ada_konsultasi") {
        if (!next.ada_konsultasi) {
          next.channel_konsultasi = "";
          next.konsultasi_source_code = null;
          next.konsultasi_source_name = null;
          next.konsultasi_mapping_id = null;
        } else {
          const firstMapping =
            this.offlineKonsultasiOptions[0] ||
            this.onlineKonsultasiOptions[0] ||
            this.konsultasiMappingOptions[0];

          if (firstMapping) {
            next.channel_konsultasi = this.getKonsultasiChannel(firstMapping);
            next.konsultasi_source_code = firstMapping.source_code;
            next.konsultasi_source_name = firstMapping.source_name;
            next.konsultasi_mapping_id = firstMapping.id;
          }
        }
      }

      if (field === "ada_treatment" && !next.ada_treatment) {
        next.route_treatment = "";
      }

      if (field === "ada_penjualan" && !next.ada_penjualan) {
        next.is_pembelian_online = false;
      }

      this.localLayanan = this.normalizeLayanan(next);
      this.emitLayanan();
    },

    selectKonsultasiMapping(mapping) {
      if (!mapping) return;

      this.localLayanan = this.normalizeLayanan({
        ...this.localLayanan,
        ada_konsultasi: true,
        channel_konsultasi: this.getKonsultasiChannel(mapping),
        konsultasi_source_code: mapping.source_code,
        konsultasi_source_name: mapping.source_name,
        konsultasi_mapping_id: mapping.id,
      });

      this.emitLayanan();
    },

    emitLayanan() {
      const selectedMapping = this.getMappingBySourceCode(
        this.localLayanan.konsultasi_source_code,
      );

      const payload = {
        ada_konsultasi: Boolean(this.localLayanan.ada_konsultasi),
        channel_konsultasi: this.localLayanan.channel_konsultasi || "",
        konsultasi_source_code:
          selectedMapping?.source_code ||
          this.localLayanan.konsultasi_source_code ||
          null,
        konsultasi_source_name:
          selectedMapping?.source_name ||
          this.localLayanan.konsultasi_source_name ||
          null,
        konsultasi_mapping_id:
          selectedMapping?.id ||
          this.localLayanan.konsultasi_mapping_id ||
          null,
        ada_treatment: Boolean(this.localLayanan.ada_treatment),
        ada_penjualan: Boolean(this.localLayanan.ada_penjualan),
        route_treatment: this.localLayanan.route_treatment || "",
        is_pembelian_online: Boolean(this.localLayanan.is_pembelian_online),
      };

      this.$emit("update-field", {
        field: "layanan",
        value: payload,
      });

      this.$emit("update-layanan-field", {
        field: "layanan",
        value: payload,
      });
    },
  },
};
</script>

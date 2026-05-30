<template>
  <div class="mt-3">
    <v-alert type="info" rounded="lg" border="start" class="mb-5">
      Pilih satu atau lebih layanan yang dibutuhkan pada kunjungan ini.
    </v-alert>

    <v-card variant="outlined" class="mb-4">
      <v-card-text class="pa-4">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="primary" size="42">
            <v-icon size="22">mdi-clipboard-list-outline</v-icon>
          </v-avatar>

          <div>
            <div class="text-subtitle-1 font-weight-bold">Jenis Layanan</div>
            <div class="text-caption text-medium-emphasis">
              Tentukan layanan utama pasien pada kunjungan ini.
            </div>
          </div>
        </div>

        <v-row dense>
          <v-col cols="12" md="4">
            <v-card
              variant="outlined"
              class="service-card h-100"
              :class="{ 'service-card--active': localLayanan.ada_konsultasi }"
              role="button"
              tabindex="0"
              @click="toggleService('ada_konsultasi')"
              @keyup.enter="toggleService('ada_konsultasi')"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between ga-3">
                  <v-avatar color="primary" size="42">
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
              variant="outlined"
              class="service-card h-100"
              :class="{ 'service-card--active': localLayanan.ada_treatment }"
              role="button"
              tabindex="0"
              @click="toggleService('ada_treatment')"
              @keyup.enter="toggleService('ada_treatment')"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between ga-3">
                  <v-avatar color="primary" size="42">
                    <v-icon size="22">mdi-face-woman-shimmer-outline</v-icon>
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
                  Digunakan jika pasien menjalani tindakan atau treatment.
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card
              variant="outlined"
              class="service-card h-100"
              :class="{ 'service-card--active': localLayanan.ada_penjualan }"
              role="button"
              tabindex="0"
              @click="toggleService('ada_penjualan')"
              @keyup.enter="toggleService('ada_penjualan')"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between ga-3">
                  <v-avatar color="primary" size="42">
                    <v-icon size="22">mdi-cart-outline</v-icon>
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
                  Digunakan jika ada penjualan obat atau produk.
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
        variant="outlined"
        class="mb-4"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="primary" size="42">
              <v-icon size="22">mdi-format-list-checks</v-icon>
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Jenis Konsultasi
              </div>
              <div class="text-caption text-medium-emphasis">
                Pilih jenis konsultasi dari master mapping Accurate yang aktif.
              </div>
            </div>
          </div>

          <template v-if="konsultasiGroups.length">
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
                  md="4"
                >
                  <v-card
                    variant="outlined"
                    class="mapping-card h-100"
                    :class="{
                      'mapping-card--active':
                        String(
                          localLayanan.konsultasi_source_code || '',
                        ).toUpperCase() ===
                        String(mapping.source_code || '').toUpperCase(),
                    }"
                    role="button"
                    tabindex="0"
                    @click="selectKonsultasiMapping(mapping)"
                    @keyup.enter="selectKonsultasiMapping(mapping)"
                  >
                    <v-card-text class="pa-4">
                      <div
                        class="d-flex align-start justify-space-between ga-3"
                      >
                        <v-avatar color="primary" size="38">
                          <v-icon size="20">
                            {{ getKonsultasiIcon(mapping) }}
                          </v-icon>
                        </v-avatar>

                        <v-icon
                          :color="
                            String(
                              localLayanan.konsultasi_source_code || '',
                            ).toUpperCase() ===
                            String(mapping.source_code || '').toUpperCase()
                              ? 'success'
                              : 'grey'
                          "
                          size="24"
                        >
                          {{
                            String(
                              localLayanan.konsultasi_source_code || "",
                            ).toUpperCase() ===
                            String(mapping.source_code || "").toUpperCase()
                              ? "mdi-check-circle"
                              : "mdi-checkbox-blank-circle-outline"
                          }}
                        </v-icon>
                      </div>

                      <div class="text-subtitle-2 font-weight-bold mt-3">
                        {{ getMappingTitle(mapping) }}
                      </div>

                      <div class="text-caption text-medium-emphasis mt-1">
                        {{ mapping.source_code || "-" }}
                      </div>

                      <div class="text-body-2 font-weight-bold mt-2">
                        Rp {{ formatNumber(mapping.default_harga || 0) }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </template>

          <v-alert v-else type="warning" border="start" density="comfortable">
            Master mapping konsultasi belum tersedia atau belum aktif.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <v-expand-transition>
      <v-card v-if="localLayanan.ada_penjualan" variant="outlined" class="mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="info" size="42">
                <v-icon size="22">mdi-cart-arrow-down</v-icon>
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Opsi Penjualan
                </div>
                <div class="text-caption text-medium-emphasis">
                  Aktifkan hanya jika transaksi ini benar-benar berasal dari
                  pembelian online.
                </div>
              </div>
            </div>

            <v-switch
              :model-value="localLayanan.is_pembelian_online"
              color="primary"
              density="compact"
              hide-details
              inset
              @update:model-value="updatePembelianOnline"
            >
              <template #label>
                <span class="text-body-2 font-weight-medium">
                  Pembelian Online
                </span>
              </template>
            </v-switch>
          </div>

          <v-alert
            v-if="localLayanan.is_pembelian_online && !pembelianOnlineMapping"
            type="warning"
            density="compact"
            border="start"
            class="mt-3"
          >
            Mapping Accurate PEMBELIAN_ONLINE belum tersedia atau belum aktif.
          </v-alert>

          <v-alert
            v-if="localLayanan.is_pembelian_online && pembelianOnlineMapping"
            type="success"
            density="compact"
            border="start"
            class="mt-3"
          >
            Mapping pembelian online:
            {{
              pembelianOnlineMapping.source_name ||
              pembelianOnlineMapping.source_code
            }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <v-expand-transition>
      <v-card
        v-if="validationMessages.length"
        variant="outlined"
        class="border-warning"
      >
        <v-card-text class="pa-4">
          <div class="d-flex flex-column ga-2">
            <v-alert
              v-for="(message, index) in validationMessages"
              :key="index"
              type="warning"
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
        konsultasi_kode_accurate: null,
        konsultasi_nama_accurate: null,

        ada_treatment: false,
        ada_penjualan: false,
        route_treatment: "",

        is_pembelian_online: false,
        pembelian_online_source_code: null,
        pembelian_online_source_name: null,
        pembelian_online_mapping_id: null,
        pembelian_online_kode_accurate: null,
        pembelian_online_nama_accurate: null,
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

    pembelianOnlineMapping() {
      return this.getMappingBySourceCode("PEMBELIAN_ONLINE");
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
        this.localLayanan.is_pembelian_online &&
        !this.pembelianOnlineMapping
      ) {
        messages.push("Mapping Accurate PEMBELIAN_ONLINE belum tersedia.");
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

    toBoolean(value) {
      return (
        value === true ||
        value === 1 ||
        value === "1" ||
        String(value).toLowerCase() === "true"
      );
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

    getMappingTitle(mapping) {
      return (
        mapping?.source_name ||
        mapping?.nama_accurate ||
        mapping?.source_code ||
        "-"
      );
    },

    normalizeLayanan(value = {}) {
      const adaKonsultasi = Boolean(value?.ada_konsultasi);
      const adaPenjualan = Boolean(value?.ada_penjualan);

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

      const isPembelianOnline = adaPenjualan
        ? Boolean(value?.is_pembelian_online)
        : false;

      const pembelianMapping = isPembelianOnline
        ? this.pembelianOnlineMapping
        : null;

      return {
        ada_konsultasi: adaKonsultasi,
        channel_konsultasi: channelKonsultasi,

        konsultasi_source_code: adaKonsultasi
          ? selectedMapping?.source_code || konsultasiSourceCode
          : null,
        konsultasi_source_name: adaKonsultasi
          ? selectedMapping?.source_name ||
            value?.konsultasi_source_name ||
            null
          : null,
        konsultasi_mapping_id: adaKonsultasi
          ? selectedMapping?.id || value?.konsultasi_mapping_id || null
          : null,
        konsultasi_kode_accurate: adaKonsultasi
          ? selectedMapping?.kode_accurate ||
            value?.konsultasi_kode_accurate ||
            null
          : null,
        konsultasi_nama_accurate: adaKonsultasi
          ? selectedMapping?.nama_accurate ||
            value?.konsultasi_nama_accurate ||
            null
          : null,

        ada_treatment: Boolean(value?.ada_treatment),
        ada_penjualan: adaPenjualan,
        route_treatment: value?.route_treatment || "",

        is_pembelian_online: isPembelianOnline,
        pembelian_online_source_code: isPembelianOnline
          ? pembelianMapping?.source_code ||
            value?.pembelian_online_source_code ||
            "PEMBELIAN_ONLINE"
          : null,
        pembelian_online_source_name: isPembelianOnline
          ? pembelianMapping?.source_name ||
            value?.pembelian_online_source_name ||
            "Pembelian Online"
          : null,
        pembelian_online_mapping_id: isPembelianOnline
          ? pembelianMapping?.id || value?.pembelian_online_mapping_id || null
          : null,
        pembelian_online_kode_accurate: isPembelianOnline
          ? pembelianMapping?.kode_accurate ||
            value?.pembelian_online_kode_accurate ||
            null
          : null,
        pembelian_online_nama_accurate: isPembelianOnline
          ? pembelianMapping?.nama_accurate ||
            value?.pembelian_online_nama_accurate ||
            null
          : null,
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
        String(a?.konsultasi_kode_accurate || "") ===
          String(b?.konsultasi_kode_accurate || "") &&
        String(a?.konsultasi_nama_accurate || "") ===
          String(b?.konsultasi_nama_accurate || "") &&
        Boolean(a?.ada_treatment) === Boolean(b?.ada_treatment) &&
        Boolean(a?.ada_penjualan) === Boolean(b?.ada_penjualan) &&
        String(a?.route_treatment || "") === String(b?.route_treatment || "") &&
        Boolean(a?.is_pembelian_online) === Boolean(b?.is_pembelian_online) &&
        String(a?.pembelian_online_source_code || "") ===
          String(b?.pembelian_online_source_code || "") &&
        String(a?.pembelian_online_source_name || "") ===
          String(b?.pembelian_online_source_name || "") &&
        String(a?.pembelian_online_mapping_id || "") ===
          String(b?.pembelian_online_mapping_id || "") &&
        String(a?.pembelian_online_kode_accurate || "") ===
          String(b?.pembelian_online_kode_accurate || "") &&
        String(a?.pembelian_online_nama_accurate || "") ===
          String(b?.pembelian_online_nama_accurate || "")
      );
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
          next.konsultasi_kode_accurate = null;
          next.konsultasi_nama_accurate = null;
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
            next.konsultasi_kode_accurate = firstMapping.kode_accurate || null;
            next.konsultasi_nama_accurate = firstMapping.nama_accurate || null;
          }
        }
      }

      if (field === "ada_treatment" && !next.ada_treatment) {
        next.route_treatment = "";
      }

      if (field === "ada_penjualan" && !next.ada_penjualan) {
        next.is_pembelian_online = false;
        next.pembelian_online_source_code = null;
        next.pembelian_online_source_name = null;
        next.pembelian_online_mapping_id = null;
        next.pembelian_online_kode_accurate = null;
        next.pembelian_online_nama_accurate = null;
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
        konsultasi_kode_accurate: mapping.kode_accurate || null,
        konsultasi_nama_accurate: mapping.nama_accurate || null,
      });

      this.emitLayanan();
    },

    updatePembelianOnline(value) {
      this.localLayanan = this.normalizeLayanan({
        ...this.localLayanan,
        is_pembelian_online: Boolean(value),
      });

      this.emitLayanan();
    },

    emitLayanan() {
      const selectedMapping = this.getMappingBySourceCode(
        this.localLayanan.konsultasi_source_code,
      );

      const pembelianMapping = this.localLayanan.is_pembelian_online
        ? this.pembelianOnlineMapping
        : null;

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
        konsultasi_kode_accurate:
          selectedMapping?.kode_accurate ||
          this.localLayanan.konsultasi_kode_accurate ||
          null,
        konsultasi_nama_accurate:
          selectedMapping?.nama_accurate ||
          this.localLayanan.konsultasi_nama_accurate ||
          null,

        ada_treatment: Boolean(this.localLayanan.ada_treatment),
        ada_penjualan: Boolean(this.localLayanan.ada_penjualan),
        route_treatment: this.localLayanan.route_treatment || "",

        is_pembelian_online: Boolean(this.localLayanan.is_pembelian_online),
        pembelian_online_source_code: this.localLayanan.is_pembelian_online
          ? pembelianMapping?.source_code ||
            this.localLayanan.pembelian_online_source_code ||
            "PEMBELIAN_ONLINE"
          : null,
        pembelian_online_source_name: this.localLayanan.is_pembelian_online
          ? pembelianMapping?.source_name ||
            this.localLayanan.pembelian_online_source_name ||
            "Pembelian Online"
          : null,
        pembelian_online_mapping_id: this.localLayanan.is_pembelian_online
          ? pembelianMapping?.id ||
            this.localLayanan.pembelian_online_mapping_id ||
            null
          : null,
        pembelian_online_kode_accurate: this.localLayanan.is_pembelian_online
          ? pembelianMapping?.kode_accurate ||
            this.localLayanan.pembelian_online_kode_accurate ||
            null
          : null,
        pembelian_online_nama_accurate: this.localLayanan.is_pembelian_online
          ? pembelianMapping?.nama_accurate ||
            this.localLayanan.pembelian_online_nama_accurate ||
            null
          : null,
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

<style scoped>
.service-card,
.mapping-card {
  cursor: pointer;
  transition: 0.16s ease;
  background: #ffffff;
}

.service-card:hover,
.mapping-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.service-card--active,
.mapping-card--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.border-warning {
  border-color: rgb(var(--v-theme-warning)) !important;
}
</style>

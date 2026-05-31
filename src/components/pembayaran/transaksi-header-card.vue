<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-text class="pa-5">
      <div class="d-flex align-start justify-space-between ga-4 mb-4">
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            Informasi Transaksi
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Data pasien, kunjungan, dan klasifikasi transaksi kasir
          </div>
        </div>

        <v-avatar color="primary" variant="tonal" size="42">
          <v-icon icon="mdi-file-document-outline" size="22" />
        </v-avatar>
      </div>

      <v-card variant="outlined" class="mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-start ga-3">
            <v-avatar color="primary" variant="tonal" size="34">
              <v-icon icon="mdi-account-circle-outline" size="18" />
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Data Pasien & Kunjungan
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Informasi pasien, dokter, dan registrasi
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field
                :model-value="displayTanggal"
                label="Tanggal"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="header.kode_registrasi"
                label="Kode Registrasi"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-barcode"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="header.pasien_nama"
                label="Pasien"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="header.pasien_no_rm"
                label="No. RM"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-card-account-details-outline"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="header.pasien_no_hp"
                label="No. HP / WA"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-phone"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="header.poin"
                label="Poin"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-star-circle-outline"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="header.dokter_nama"
                label="Dokter"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-stethoscope"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="header.perawat_nama"
                label="Perawat"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-heart-outline"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card variant="outlined" class="mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-start ga-3">
            <v-avatar color="primary" variant="tonal" size="34">
              <v-icon icon="mdi-tune-variant" size="18" />
            </v-avatar>

            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Klasifikasi Transaksi
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Dipakai untuk laporan kasir dan integrasi pembayaran
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-select
                :model-value="header.jenis_transaksi_id"
                :items="jenisTransaksiList"
                item-title="title"
                item-value="value"
                label="Jenis Transaksi"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-tag-outline"
                hide-details="auto"
                :loading="loadingReference"
                @update:model-value="updateJenisTransaksi"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                :model-value="header.sumber_informasi_id"
                :items="sumberInformasiList"
                item-title="title"
                item-value="value"
                label="Sumber Informasi"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-source-branch"
                hide-details="auto"
                :loading="loadingReference"
                @update:model-value="updateSumberInformasi"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                :model-value="header.catatan"
                label="Catatan Tambahan"
                variant="outlined"
                density="comfortable"
                rows="2"
                auto-grow
                prepend-inner-icon="mdi-note-text-outline"
                hide-details="auto"
                @update:model-value="updateField('catatan', $event)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="tonal" size="36">
                <v-icon icon="mdi-account-edit-outline" size="18" />
              </v-avatar>

              <div>
                <div class="text-body-2 font-weight-bold">
                  Perbarui Data Pasien
                </div>
                <div class="text-caption text-medium-emphasis">
                  Fitur ini belum aktif pada halaman pembayaran
                </div>
              </div>
            </div>

            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-pencil-outline"
              disabled
            >
              Perbarui
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "TransaksiHeaderCard",

  props: {
    header: {
      type: Object,
      required: true,
    },
    jenisTransaksiList: {
      type: Array,
      default: () => [],
    },
    sumberInformasiList: {
      type: Array,
      default: () => [],
    },
    loadingReference: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update-header-field"],

  computed: {
    displayTanggal() {
      return this.formatTanggal(this.header.tanggal);
    },
  },

  methods: {
    formatTanggal(value) {
      if (!value) return "";

      const rawValue = String(value).trim();

      if (!rawValue) return "";

      if (rawValue.includes("T") || rawValue.endsWith("Z")) {
        const normalizedValue = rawValue.replace(/(\.\d{3})\d+(Z?)$/, "$1$2");
        const parsedDate = new Date(normalizedValue);

        if (!Number.isNaN(parsedDate.getTime())) {
          const day = String(parsedDate.getDate()).padStart(2, "0");
          const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
          const year = parsedDate.getFullYear();

          return `${day}/${month}/${year}`;
        }
      }

      const dateOnlyMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

      if (dateOnlyMatch) {
        return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
      }

      return rawValue;
    },

    updateField(field, value) {
      this.$emit("update-header-field", { field, value });
    },

    updateJenisTransaksi(value) {
      const selected = this.jenisTransaksiList.find(
        (item) => Number(item.value) === Number(value),
      );

      this.updateField("jenis_transaksi_id", Number(value || 0));
      this.updateField("jenis_transaksi", selected?.title || "Umum");
      this.updateField("jenis_transaksi_kode", selected?.kode || null);
    },

    updateSumberInformasi(value) {
      const selected = this.sumberInformasiList.find(
        (item) => Number(item.value) === Number(value),
      );

      this.updateField("sumber_informasi_id", selected?.id || value || null);
      this.updateField("sumber", selected?.title || null);
      this.updateField("sumber_informasi_kode", selected?.kode || null);
    },
  },
};
</script>

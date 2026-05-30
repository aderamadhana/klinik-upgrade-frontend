<template>
  <v-card variant="flat" class="mb-4 border">
    <v-card-text class="pa-5">
      <!-- HEADER -->
      <div class="d-flex align-center justify-space-between mb-5">
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            Informasi Transaksi
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Data transaksi diambil dari registrasi layanan
          </div>
        </div>

        <v-avatar color="primary" size="42">
          <v-icon icon="mdi-file-document-outline" size="22" />
        </v-avatar>
      </div>

      <!-- INFO UTAMA -->
      <v-card variant="outlined" class="mb-4">
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar color="primary" size="34">
              <v-icon icon="mdi-account-circle-outline" size="18" />
            </v-avatar>
          </template>

          <v-card-title class="text-body-2 font-weight-bold pa-0">
            Data Pasien & Kunjungan
          </v-card-title>

          <v-card-subtitle class="text-caption pa-0 mt-1">
            Informasi pasien, dokter, dan registrasi
          </v-card-subtitle>
        </v-card-item>

        <v-divider />

        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field
                :model-value="header.tanggal"
                label="Tanggal"
                type="date"
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
                :model-value="header.sumber"
                label="Sumber Kedatangan"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-source-branch"
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

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="header.jenis_transaksi"
                label="Kategori Transaksi"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-tag-outline"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="header.poin"
                label="Poin"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-star-circle-outline"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- AKSI PASIEN -->
      <v-card color="primary" class="mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between ga-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="flat" size="38">
                <v-icon icon="mdi-account-edit-outline" size="20" />
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
              variant="flat"
              size="small"
              prepend-icon="mdi-pencil-outline"
              disabled
            >
              Perbarui
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- CATATAN -->
      <v-textarea
        :model-value="header.catatan"
        label="Catatan Tambahan"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-note-text-outline"
        rows="2"
        auto-grow
        hide-details="auto"
        @update:model-value="updateField('catatan', $event)"
      />
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
  },

  emits: ["update-header-field"],

  methods: {
    updateField(field, value) {
      this.$emit("update-header-field", { field, value });
    },
  },
};
</script>

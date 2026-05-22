<template>
  <v-card class="section-card mb-4" variant="flat">
    <v-card-text class="pa-5">
      <div class="section-header-pembayaran mb-4">
        <div>
          <div class="section-title-pembayaran">Informasi Transaksi</div>
          <div class="section-subtitle">
            Data transaksi diambil dari registrasi layanan
          </div>
        </div>
      </div>

      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field
            :model-value="header.tanggal"
            label="Tanggal"
            type="date"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-calendar"
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
            hide-details="auto"
            readonly
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            :model-value="header.pasien_no_rm"
            label="No. RM"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-card-account-details-outline"
            hide-details="auto"
            readonly
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            :model-value="header.poin"
            label="Poin"
            type="number"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-star-circle-outline"
            hide-details="auto"
            readonly
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            :model-value="header.jenis_transaksi"
            label="Kategori Transaksi"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            readonly
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            :model-value="header.sumber"
            label="Sumber Kedatangan"
            variant="outlined"
            density="comfortable"
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
            hide-details="auto"
            readonly
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-btn
            color="primary"
            variant="tonal"
            size="default"
            block
            class="action-main-btn"
            disabled
          >
            Perbarui Data Pasien
          </v-btn>
        </v-col>

        <v-col cols="12">
          <v-text-field
            :model-value="header.catatan"
            label="Catatan Tambahan"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-note-text-outline"
            hide-details="auto"
            @update:model-value="updateField('catatan', $event)"
          />
        </v-col>
      </v-row>
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

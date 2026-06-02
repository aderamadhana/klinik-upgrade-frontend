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
              <v-select
                :model-value="header.jenis_transaksi_id"
                :items="normalizedJenisTransaksiList"
                :loading="loadingReference"
                item-title="title"
                item-value="value"
                label="Kategori Transaksi"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-tag-outline"
                hide-details="auto"
                @update:model-value="updateJenisTransaksi"
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

            <v-col cols="12" md="4">
              <v-text-field
                :model-value="displayVoucher"
                label="Voucher"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-ticket-percent-outline"
                bg-color="grey-lighten-5"
                hide-details="auto"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- TRANSAKSI KHUSUS -->
      <v-card v-if="isSpecialTransaction" variant="outlined" class="mb-4">
        <v-card-item class="px-4 py-3">
          <template #prepend>
            <v-avatar
              :color="isDepositTransaction ? 'warning' : 'info'"
              size="34"
            >
              <v-icon
                :icon="
                  isDepositTransaction
                    ? 'mdi-wallet-outline'
                    : 'mdi-alert-circle-outline'
                "
                size="18"
              />
            </v-avatar>
          </template>
          <v-card-title class="text-body-2 font-weight-bold pa-0">
            Detail Transaksi Khusus
          </v-card-title>
          <v-card-subtitle class="text-caption pa-0 mt-1">
            Field ini wajib diisi untuk transaksi selain umum
          </v-card-subtitle>
        </v-card-item>

        <v-divider />

        <v-card-text class="pa-4">
          <v-alert
            v-if="isDepositTransaction && hasProdukItem"
            type="warning"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            Transaksi deposit tidak boleh memiliki item produk/obat. Hapus item
            produk sebelum submit.
          </v-alert>

          <v-row dense>
            <v-col cols="12" md="6" v-if="isDepositTransaction">
              <v-autocomplete
                :model-value="header.referensi_dokter_id"
                :items="dokterList"
                item-title="title"
                item-value="id"
                label="Referensi Dokter"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-doctor"
                hide-details="auto"
                clearable
                @update:model-value="updateField('referensi_dokter_id', $event)"
              />
            </v-col>

            <v-col cols="12" md="6" v-if="isDepositTransaction">
              <v-select
                :model-value="header.deposit_expired_option_id"
                :items="normalizedDepositExpiredOptionList"
                item-title="title"
                item-value="id"
                label="Masa Berlaku Deposit"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-timer-outline"
                hide-details="auto"
                clearable
                @update:model-value="updateDepositExpiredOption"
              />
            </v-col>

            <v-col cols="12" md="6" v-if="isDepositTransaction">
              <v-text-field
                :model-value="header.deposit_expired_at"
                label="Tanggal Expired Deposit"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-clock"
                hide-details="auto"
                :readonly="!isCustomExpiredDate"
                @update:model-value="updateField('deposit_expired_at', $event)"
              />
            </v-col>

            <v-col cols="12" :md="isDepositTransaction ? 6 : 12">
              <v-textarea
                :model-value="header.catatan"
                :label="
                  isDepositTransaction
                    ? 'Catatan Deposit'
                    : 'Catatan Transaksi Khusus'
                "
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-note-text-outline"
                rows="2"
                auto-grow
                hide-details="auto"
                @update:model-value="updateField('catatan', $event)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- CATATAN -->
      <v-textarea
        v-if="!isSpecialTransaction"
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
    jenisTransaksiList: {
      type: Array,
      default: () => [],
    },
    sumberInformasiList: {
      type: Array,
      default: () => [],
    },
    depositExpiredOptionList: {
      type: Array,
      default: () => [],
    },
    dokterList: {
      type: Array,
      default: () => [],
    },
    loadingReference: {
      type: Boolean,
      default: false,
    },
    hasProdukItem: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update-header-field"],
  computed: {
    displayTanggal() {
      const value = this.header.tanggal || this.header.tanggal_kunjungan || "";
      if (!value) return "-";

      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-");
        return `${day}/${month}/${year}`;
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    },
    displayVoucher() {
      const value = this.header.voucher_label || this.header.voucher_nama || "";
      if (value && value !== "-") return value;

      const count = Number(this.header.voucher_count || 0);
      if (count > 0) return `${count} voucher eligible`;

      return "Tidak ada voucher";
    },
    normalizedJenisTransaksiList() {
      if (this.jenisTransaksiList.length) {
        return this.jenisTransaksiList;
      }

      return [
        { title: "Umum", value: 0 },
        { title: "Endorse / Fasilitas Karyawan", value: 1 },
        { title: "EliteGlowbal", value: 2 },
        { title: "Owner", value: 3 },
        { title: "Deposit", value: 4 },
      ];
    },
    normalizedDepositExpiredOptionList() {
      if (this.depositExpiredOptionList.length) {
        return this.depositExpiredOptionList;
      }

      return [
        { id: 1, title: "1 Bulan", jumlah_hari: 30 },
        { id: 2, title: "3 Bulan", jumlah_hari: 90 },
        { id: 3, title: "6 Bulan", jumlah_hari: 180 },
        { id: 4, title: "9 Bulan", jumlah_hari: 270 },
        { id: 5, title: "12 Bulan", jumlah_hari: 365 },
        { id: 6, title: "Custom Tanggal", jumlah_hari: 0, kode: "CUSTOM" },
      ];
    },
    selectedJenisTransaksi() {
      return this.normalizedJenisTransaksiList.find(
        (item) =>
          Number(item.value) === Number(this.header.jenis_transaksi_id || 0),
      );
    },
    isSpecialTransaction() {
      return Number(this.header.jenis_transaksi_id || 0) !== 0;
    },
    isDepositTransaction() {
      return Number(this.header.jenis_transaksi_id || 0) === 4;
    },
    selectedExpiredOption() {
      return this.normalizedDepositExpiredOptionList.find(
        (item) =>
          Number(item.id) ===
          Number(this.header.deposit_expired_option_id || 0),
      );
    },
    isCustomExpiredDate() {
      const option = this.selectedExpiredOption;
      if (!option) return true;

      return (
        String(option.kode || option.code || "").toUpperCase() === "CUSTOM" ||
        Number(option.jumlah_hari || option.days || 0) <= 0
      );
    },
  },
  methods: {
    updateField(field, value) {
      this.$emit("update-header-field", { field, value });
    },
    updateJenisTransaksi(value) {
      const selected = this.normalizedJenisTransaksiList.find(
        (item) => Number(item.value) === Number(value),
      );

      this.updateField("jenis_transaksi_id", Number(value || 0));
      this.updateField("jenis_transaksi", selected?.title || "Umum");
      this.updateField("jenis_transaksi_kode", selected?.kode || null);

      if (Number(value || 0) !== 4) {
        this.updateField("referensi_dokter_id", null);
        this.updateField("deposit_expired_option_id", null);
        this.updateField("deposit_expired_at", null);
      }
    },
    updateDepositExpiredOption(value) {
      const selected = this.normalizedDepositExpiredOptionList.find(
        (item) => Number(item.id) === Number(value),
      );

      this.updateField("deposit_expired_option_id", value || null);

      if (!selected) {
        this.updateField("deposit_expired_at", null);
        return;
      }

      const isCustom =
        String(selected.kode || selected.code || "").toUpperCase() ===
          "CUSTOM" || Number(selected.jumlah_hari || selected.days || 0) <= 0;

      if (isCustom) {
        this.updateField("deposit_expired_at", null);
        return;
      }

      const expired = new Date();
      expired.setDate(
        expired.getDate() + Number(selected.jumlah_hari || selected.days || 0),
      );
      this.updateField(
        "deposit_expired_at",
        expired.toISOString().slice(0, 10),
      );
    },
  },
};
</script>

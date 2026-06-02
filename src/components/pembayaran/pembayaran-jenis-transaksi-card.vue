<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-text class="pa-4">
      <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4">
        <div>
          <div class="text-subtitle-1 font-weight-bold">Jenis Transaksi</div>
          <div class="text-body-2 text-medium-emphasis">
            Tentukan perlakuan transaksi sebelum pembayaran diselesaikan
          </div>
        </div>

        <v-chip :color="selectedChip.color" variant="tonal" size="small">
          {{ selectedChip.text }}
        </v-chip>
      </div>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            :model-value="localValue.jenis_transaksi"
            :items="jenisTransaksiItems"
            item-title="title"
            item-value="value"
            label="Jenis Transaksi"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :disabled="disabled"
            @update:model-value="onJenisTransaksiChange"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-textarea
            :model-value="localValue.catatan_pembayaran"
            label="Catatan"
            variant="outlined"
            density="compact"
            hide-details="auto"
            rows="2"
            auto-grow
            :disabled="disabled"
            :rules="catatanRules"
            :placeholder="
              isSpecialTransaction
                ? 'Wajib diisi untuk transaksi khusus'
                : 'Opsional'
            "
            @update:model-value="updateField('catatan_pembayaran', $event)"
          />
        </v-col>
      </v-row>

      <v-alert
        v-if="isSpecialTransaction && !isDeposit"
        type="info"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        Transaksi khusus wajib memiliki catatan. Backend tetap akan menolak
        submit jika catatan kosong.
      </v-alert>

      <template v-if="isDeposit">
        <v-divider class="my-4" />

        <div class="text-subtitle-2 font-weight-bold mb-3">
          Pengaturan Deposit Treatment
        </div>

        <v-alert
          v-if="hasProduk"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          Transaksi deposit tidak boleh memiliki item produk/obat. Hapus item
          produk sebelum submit.
        </v-alert>

        <v-alert
          v-if="!hasTreatment"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          Transaksi deposit wajib memiliki minimal satu item treatment.
        </v-alert>

        <v-row dense>
          <v-col cols="12" md="4">
            <v-autocomplete
              :model-value="localValue.referensi_dokter_id"
              :items="dokterItems"
              item-title="title"
              item-value="value"
              label="Referensi Dokter"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
              :disabled="disabled"
              :rules="depositRules"
              @update:model-value="updateField('referensi_dokter_id', $event)"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              :model-value="localValue.deposit_expired_option_id"
              :items="depositExpiredItems"
              item-title="title"
              item-value="value"
              label="Masa Berlaku Deposit"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
              :disabled="disabled"
              :rules="depositRules"
              @update:model-value="onExpiredOptionChange"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              :model-value="localValue.deposit_expired_at"
              label="Tanggal Expired"
              type="date"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :disabled="disabled || !isCustomExpired"
              :rules="depositRules"
              @update:model-value="updateField('deposit_expired_at', $event)"
            />
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "PembayaranJenisTransaksiCard",

  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    jenisTransaksi: {
      type: Array,
      default: () => [],
    },
    depositExpiredOptions: {
      type: Array,
      default: () => [],
    },
    dokterOptions: {
      type: Array,
      default: () => [],
    },
    hasProduk: {
      type: Boolean,
      default: false,
    },
    hasTreatment: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue", "change"],

  computed: {
    localValue() {
      return {
        jenis_transaksi: 0,
        catatan_pembayaran: "",
        referensi_dokter_id: null,
        deposit_expired_option_id: null,
        deposit_expired_at: null,
        ...(this.modelValue || {}),
      };
    },

    jenisTransaksiItems() {
      const fallback = [
        { value: 0, title: "Umum" },
        { value: 1, title: "Endorse / Fasilitas Karyawan" },
        { value: 2, title: "EliteGlowbal" },
        { value: 3, title: "Owner" },
        { value: 4, title: "Deposit" },
      ];

      const source = this.jenisTransaksi.length
        ? this.jenisTransaksi
        : fallback;

      return source.map((item) => ({
        value: Number(item.id ?? item.value ?? item.jenis_transaksi ?? 0),
        title:
          item.nama_jenis_transaksi ??
          item.nama ??
          item.title ??
          item.text ??
          "-",
      }));
    },

    depositExpiredItems() {
      const fallback = [
        { value: 1, title: "1 Bulan", jumlah_hari: 30 },
        { value: 2, title: "3 Bulan", jumlah_hari: 90 },
        { value: 3, title: "6 Bulan", jumlah_hari: 180 },
        { value: 4, title: "9 Bulan", jumlah_hari: 270 },
        { value: 5, title: "12 Bulan", jumlah_hari: 365 },
        { value: 6, title: "Custom Tanggal", jumlah_hari: 0, kode: "CUSTOM" },
      ];

      const source = this.depositExpiredOptions.length
        ? this.depositExpiredOptions
        : fallback;

      return source.map((item) => ({
        value: Number(item.id ?? item.value),
        title: item.nama ?? item.title ?? item.text ?? "-",
        jumlah_hari: Number(item.jumlah_hari ?? 0),
        kode: item.kode ?? item.kode_expired ?? null,
      }));
    },

    dokterItems() {
      return this.dokterOptions.map((item) => ({
        value: Number(item.id ?? item.value ?? item.karyawan_id),
        title: item.nama ?? item.title ?? item.text ?? item.label ?? "-",
      }));
    },

    selectedJenisTransaksi() {
      return Number(this.localValue.jenis_transaksi || 0);
    },

    isSpecialTransaction() {
      return this.selectedJenisTransaksi !== 0;
    },

    isDeposit() {
      return this.selectedJenisTransaksi === 4;
    },

    selectedExpiredOption() {
      return this.depositExpiredItems.find(
        (item) =>
          Number(item.value) ===
          Number(this.localValue.deposit_expired_option_id),
      );
    },

    isCustomExpired() {
      if (!this.isDeposit) return false;
      if (!this.selectedExpiredOption) return false;

      return (
        Number(this.selectedExpiredOption.jumlah_hari || 0) <= 0 ||
        String(this.selectedExpiredOption.kode || "").toUpperCase() === "CUSTOM"
      );
    },

    selectedChip() {
      if (this.isDeposit) {
        return { color: "warning", text: "Deposit" };
      }

      if (this.isSpecialTransaction) {
        return { color: "info", text: "Khusus" };
      }

      return { color: "success", text: "Umum" };
    },

    catatanRules() {
      return [
        (v) =>
          !this.isSpecialTransaction ||
          !!String(v || "").trim() ||
          "Catatan wajib diisi",
      ];
    },

    depositRules() {
      return [(v) => !this.isDeposit || !!v || "Field ini wajib diisi"];
    },
  },

  methods: {
    emitValue(nextValue) {
      this.$emit("update:modelValue", nextValue);
      this.$emit("change", nextValue);
    },

    updateField(field, value) {
      this.emitValue({
        ...this.localValue,
        [field]: value,
      });
    },

    onJenisTransaksiChange(value) {
      const jenis = Number(value || 0);
      const nextValue = {
        ...this.localValue,
        jenis_transaksi: jenis,
      };

      if (jenis !== 4) {
        nextValue.referensi_dokter_id = null;
        nextValue.deposit_expired_option_id = null;
        nextValue.deposit_expired_at = null;
      }

      this.emitValue(nextValue);
    },

    onExpiredOptionChange(value) {
      const selected = this.depositExpiredItems.find(
        (item) => Number(item.value) === Number(value),
      );

      const nextValue = {
        ...this.localValue,
        deposit_expired_option_id: value,
      };

      if (selected && Number(selected.jumlah_hari || 0) > 0) {
        const d = new Date();
        d.setDate(d.getDate() + Number(selected.jumlah_hari));
        nextValue.deposit_expired_at = d.toISOString().slice(0, 10);
      } else {
        nextValue.deposit_expired_at = null;
      }

      this.emitValue(nextValue);
    },
  },
};
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Voucher Diskon</h1>
        <p class="page-subtitle">
          Ubah informasi voucher, periode, nilai diskon, jumlah penggunaan, dan
          status voucher
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-skeleton-loader v-if="loadingPage" type="article" />

    <v-form
      v-else
      ref="formRef"
      v-model="isFormValid"
      validate-on="submit lazy"
      @submit.prevent="submitForm"
    >
      <v-row>
        <v-col cols="12" lg="8">
          <v-card elevation="1" class="mb-4">
            <v-card-title class="text-h6 font-weight-bold">
              Form Edit Voucher Diskon
            </v-card-title>

            <v-divider />

            <v-card-text>
              <div class="text-subtitle-1 font-weight-bold mb-3">
                Informasi Utama
              </div>

              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="form.nama_voucher"
                    label="Nama Voucher *"
                    placeholder="Contoh: Promo Facial Akhir Bulan"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-ticket-percent-outline"
                    :rules="[rules.required]"
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.kategori_voucher_id"
                    label="Kategori Voucher *"
                    :items="kategoriVoucherOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-ticket-confirmation-outline"
                    :rules="[rules.required]"
                    :loading="loadingMaster"
                    no-data-text="Kategori voucher tidak ditemukan"
                  />
                </v-col>

                <v-col v-if="isDirectMode" cols="12" md="6">
                  <v-text-field
                    v-model="form.kode_voucher"
                    label="Kode Voucher *"
                    placeholder="Contoh: FACIAL25"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-barcode"
                    :rules="[rules.required]"
                    clearable
                    hint="Kode ini dipakai langsung oleh pasien/admin"
                    persistent-hint
                    @update:modelValue="
                      form.kode_voucher = normalizeKodeVoucher($event)
                    "
                  />
                </v-col>

                <v-col cols="12" :md="isDirectMode ? 6 : 12">
                  <v-textarea
                    v-model="form.deskripsi"
                    label="Deskripsi"
                    placeholder="Jelaskan fungsi voucher ini"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-text-box-outline"
                    rows="3"
                    auto-grow
                    clearable
                  />
                </v-col>

                <v-col cols="12">
                  <v-checkbox
                    v-model="form.is_all_toko"
                    label="Voucher berlaku untuk semua cabang"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="form.toko_id"
                    label="Cabang Voucher"
                    :items="tokoOptions"
                    item-title="nama"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-store-outline"
                    :loading="loadingMaster"
                    :disabled="form.is_all_toko"
                    clearable
                    auto-select-first
                    no-data-text="Cabang tidak ditemukan"
                    :custom-filter="filterOption"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.status_voucher"
                    label="Status Voucher *"
                    :items="statusVoucherOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-toggle-switch-outline"
                    :rules="[rules.requiredStatus]"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <div class="text-subtitle-1 font-weight-bold mb-3">
                Jenis dan Template Voucher
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.jenis_voucher_id"
                    label="Jenis Voucher"
                    :items="jenisVoucherOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-format-list-bulleted-type"
                    :loading="loadingMaster"
                    clearable
                    no-data-text="Jenis voucher tidak ditemukan"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.template_voucher_id"
                    label="Template Voucher"
                    :items="templateVoucherOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-image-outline"
                    :loading="loadingMaster"
                    clearable
                    no-data-text="Template voucher tidak ditemukan"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <div class="text-subtitle-1 font-weight-bold mb-3">
                Periode Berlaku
              </div>

              <v-row>
                <v-col cols="12">
                  <v-checkbox
                    v-model="form.is_unlimited_date"
                    label="Tidak ada batas tanggal"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <template v-if="!form.is_unlimited_date">
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.tanggal_mulai"
                      label="Tanggal Mulai *"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar-start"
                      :rules="[rules.required]"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.tanggal_akhir"
                      label="Tanggal Akhir *"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar-end"
                      :rules="[rules.required]"
                    />
                  </v-col>
                </template>

                <v-col cols="12" v-else>
                  <v-alert type="info" rounded="lg">
                    Voucher akan berlaku tanpa batas tanggal.
                  </v-alert>
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <div class="text-subtitle-1 font-weight-bold mb-3">
                Pengaturan Diskon dan Jumlah
              </div>

              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.tipe_diskon"
                    label="Tipe Diskon *"
                    :items="tipeDiskonOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-percent-outline"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.total_diskon"
                    :label="
                      isPercentDiscount
                        ? 'Diskon Persen (%) *'
                        : 'Total Diskon Nominal *'
                    "
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-cash-minus"
                    :rules="diskonRules"
                    :suffix="isPercentDiscount ? '%' : ''"
                    :prefix="isNominalDiscount ? 'Rp' : ''"
                    :hint="
                      isPercentDiscount
                        ? 'Isi persen diskon, maksimal 100'
                        : 'Isi nominal diskon dalam rupiah'
                    "
                    persistent-hint
                  />
                </v-col>

                <v-col v-if="isPercentDiscount" cols="12" md="4">
                  <v-text-field
                    v-model="form.total_diskon_maksimal"
                    label="Maksimal Diskon Nominal *"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-cash-lock"
                    prefix="Rp"
                    :rules="maxDiskonRules"
                    hint="Batas maksimal potongan rupiah untuk diskon persen"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.qty_generate"
                    :label="
                      isGenerateMode
                        ? 'Jumlah Voucher Generate *'
                        : 'Batas Jumlah Penggunaan *'
                    "
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-ticket-confirmation-outline"
                    :rules="qtyGenerateRules"
                    :disabled="isDirectMode && form.is_unlimited_generate"
                    :hint="qtyGenerateHint"
                    persistent-hint
                  />
                </v-col>

                <v-col v-if="isDirectMode" cols="12">
                  <v-checkbox
                    v-model="form.is_unlimited_generate"
                    label="Tidak ada batas jumlah penggunaan"
                    color="primary"
                    hide-details
                  />

                  <v-alert
                    v-if="form.is_unlimited_generate"
                    type="info"
                    density="compact"
                    class="mt-2"
                  >
                    Kode voucher direct bisa digunakan tanpa batas jumlah
                    penggunaan. Nilai jumlah akan disimpan sebagai 0.
                  </v-alert>
                </v-col>

                <v-col cols="12">
                  <v-checkbox
                    v-model="form.is_bisa_digabung_promo"
                    label="Voucher dapat digabung dengan promo lain"
                    color="primary"
                    hide-details
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <div class="text-subtitle-1 font-weight-bold mb-3">
                Pengaturan Tambahan
              </div>

              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.sort_order"
                    label="Sort Order"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-sort-numeric-ascending"
                    hint="Semakin kecil angka, semakin atas urutannya"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12" md="8">
                  <v-alert type="warning" rounded="lg">
                    Jika voucher sudah memiliki konfigurasi item, data item lama
                    tetap dipertahankan saat update.
                  </v-alert>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card elevation="1" class="mb-4">
            <v-card-title class="text-h6 font-weight-bold">
              Ringkasan Voucher
            </v-card-title>

            <v-divider />

            <v-card-text>
              <div class="d-flex flex-column ga-3">
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Nama Voucher
                  </div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ form.nama_voucher || "-" }}
                  </div>
                </div>

                <div v-if="isDirectMode">
                  <div class="text-caption text-medium-emphasis">
                    Kode Voucher
                  </div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ form.kode_voucher || "-" }}
                  </div>
                </div>

                <div class="d-flex flex-wrap ga-2">
                  <v-chip size="small" color="primary">
                    {{ selectedKategoriLabel }}
                  </v-chip>

                  <v-chip size="small" :color="selectedJenisColor">
                    {{ selectedJenisLabel }}
                  </v-chip>

                  <v-chip size="small" color="warning">
                    {{ selectedTokoLabel }}
                  </v-chip>
                </div>

                <v-divider />

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Nilai Diskon
                  </div>
                  <div class="text-h5 font-weight-bold text-success">
                    {{ formattedDiskon }}
                  </div>
                </div>

                <div v-if="isPercentDiscount">
                  <div class="text-caption text-medium-emphasis">
                    Maksimal Diskon
                  </div>
                  <div class="text-subtitle-1 font-weight-bold text-primary">
                    {{ formattedMaxDiskon }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Jumlah Voucher
                  </div>
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ formattedJumlahVoucher }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis">Periode</div>
                  <div class="text-body-1">
                    {{
                      form.is_unlimited_date
                        ? "Tanpa batas tanggal"
                        : formattedPeriode
                    }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Bisa Digabung Promo
                  </div>
                  <div class="text-body-1">
                    {{ form.is_bisa_digabung_promo ? "Ya" : "Tidak" }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis">Status</div>
                  <v-chip size="small" :color="selectedStatusColor">
                    {{ selectedStatusLabel }}
                  </v-chip>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Item Terkonfigurasi
                  </div>
                  <div class="text-body-1">{{ existingItems.length }} item</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card elevation="1">
            <v-card-title class="text-h6 font-weight-bold">
              Preview Voucher
            </v-card-title>

            <v-divider />

            <v-card-text>
              <v-sheet
                rounded="lg"
                border
                class="pa-5"
                color="grey-lighten-5"
                min-height="260"
              >
                <div class="d-flex justify-space-between align-start ga-3 mb-4">
                  <div>
                    <div class="text-overline">Voucher Preview</div>
                    <div class="text-h6 font-weight-bold">
                      {{ form.nama_voucher || "Nama Voucher" }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ selectedTemplateLabel }}
                    </div>
                  </div>

                  <v-chip color="primary">
                    {{ selectedKategoriLabel }}
                  </v-chip>
                </div>

                <v-alert
                  v-if="isDirectMode"
                  type="success"
                  density="compact"
                  class="mb-4"
                >
                  Kode:
                  <strong>{{ form.kode_voucher || "-" }}</strong>
                </v-alert>

                <div class="text-body-2 mb-4">
                  {{
                    form.deskripsi ||
                    "Deskripsi voucher akan tampil di area ini."
                  }}
                </div>

                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-chip size="small" variant="outlined">
                    Cabang: {{ selectedTokoLabel }}
                  </v-chip>

                  <v-chip size="small" variant="outlined">
                    Kategori: {{ selectedKategoriLabel }}
                  </v-chip>

                  <v-chip size="small" variant="outlined">
                    Jenis: {{ selectedJenisLabel }}
                  </v-chip>

                  <v-chip size="small" variant="outlined">
                    {{ formattedJumlahVoucher }}
                  </v-chip>
                </div>

                <div class="text-h4 font-weight-bold mb-1 text-success">
                  {{ formattedDiskon }}
                </div>

                <div
                  v-if="isPercentDiscount"
                  class="text-body-2 text-medium-emphasis mb-2"
                >
                  Maksimal potongan {{ formattedMaxDiskon }}
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  {{
                    form.is_unlimited_date
                      ? "Berlaku tanpa batas tanggal"
                      : formattedPeriode
                  }}
                </div>
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
      <v-btn
        color="secondary"
        variant="outlined"
        size="large"
        :to="'/administrasi/voucher-diskon'"
        :disabled="loading"
      >
        Batal
      </v-btn>

      <v-btn
        color="success"
        variant="flat"
        size="large"
        prepend-icon="mdi-content-save"
        @click="submitForm"
        :loading="loading"
        :disabled="loading"
      >
        Update Voucher
      </v-btn>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import referenceService from "@/services/referenceService";
import voucherDiskonService from "@/services/master/voucherDiskonService";

export default {
  name: "EditVoucherDiskonPage",

  data() {
    return {
      breadcrumbs: [
        {
          title: "Voucher Diskon",
          disabled: false,
          to: "/administrasi/voucher-diskon",
        },
        {
          title: "Edit Voucher Diskon",
          disabled: true,
        },
      ],

      isFormValid: false,
      loading: false,
      loadingPage: false,
      loadingMaster: false,

      form: {
        legacy_id: null,
        kode_voucher: "",
        nama_voucher: "",
        deskripsi: "",
        mode_voucher: "direct",

        toko_id: null,
        is_all_toko: true,

        kategori_voucher_id: null,
        jenis_voucher_id: null,
        template_voucher_id: null,

        is_unlimited_date: false,
        tanggal_mulai: "",
        tanggal_akhir: "",

        tipe_diskon: "percent",
        total_diskon: 0,
        total_diskon_maksimal: 0,

        is_unlimited_generate: false,
        qty_generate: 1,

        is_bisa_digabung_promo: false,
        status_voucher: 1,
        sort_order: 0,
      },

      existingItems: [],

      tokoOptions: [],
      kategoriVoucherOptions: [],
      jenisVoucherOptions: [],
      templateVoucherOptions: [],

      tipeDiskonOptions: [
        { label: "Persen", value: "percent" },
        { label: "Nominal", value: "nominal" },
      ],

      statusVoucherOptions: [
        { label: "Draft", value: 0, color: "warning" },
        { label: "Aktif", value: 1, color: "success" },
        { label: "Nonaktif", value: 2, color: "error" },
      ],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!String(v ?? "").trim() || "Field ini wajib diisi",
        requiredStatus: (v) =>
          (v !== null && v !== undefined && v !== "") ||
          "Field ini wajib diisi",
        nonNegative: (v) =>
          Number(v || 0) >= 0 || "Nilai tidak boleh kurang dari 0",
        minOne: (v) => Number(v || 0) >= 1 || "Minimal 1",
        percentRange: (v) => {
          const val = Number(v || 0);
          return (val >= 0 && val <= 100) || "Persen harus antara 0 sampai 100";
        },
      },
    };
  },

  computed: {
    voucherId() {
      return this.$route.params.id;
    },

    isDirectMode() {
      return this.form.mode_voucher === "direct";
    },

    isGenerateMode() {
      return this.form.mode_voucher === "generate";
    },

    isPercentDiscount() {
      return this.form.tipe_diskon === "percent";
    },

    isNominalDiscount() {
      return this.form.tipe_diskon === "nominal";
    },

    diskonRules() {
      if (this.isPercentDiscount) {
        return [
          this.rules.required,
          this.rules.nonNegative,
          this.rules.percentRange,
        ];
      }

      return [this.rules.required, this.rules.minOne];
    },

    maxDiskonRules() {
      if (!this.isPercentDiscount) {
        return [];
      }

      return [this.rules.required, this.rules.minOne];
    },

    qtyGenerateRules() {
      if (this.isDirectMode && this.form.is_unlimited_generate) {
        return [];
      }

      return [this.rules.required, this.rules.minOne];
    },

    qtyGenerateHint() {
      if (this.isGenerateMode) {
        return "Jumlah kode voucher unik yang akan dibuat otomatis";
      }

      if (this.form.is_unlimited_generate) {
        return "Batas penggunaan tidak dipakai karena opsi tanpa batas aktif";
      }

      return "Jumlah maksimal pemakaian untuk kode voucher direct ini";
    },

    selectedTokoLabel() {
      if (this.form.is_all_toko) {
        return "Semua Cabang";
      }

      const item = this.tokoOptions.find(
        (row) => String(row.id) === String(this.form.toko_id),
      );

      return item ? item.nama : "-";
    },

    selectedKategoriLabel() {
      return this.getOptionLabel(
        this.kategoriVoucherOptions,
        this.form.kategori_voucher_id,
        "Belum memilih kategori",
      );
    },

    selectedJenisLabel() {
      return this.getOptionLabel(
        this.jenisVoucherOptions,
        this.form.jenis_voucher_id,
        "Belum memilih jenis",
      );
    },

    selectedJenisColor() {
      const item = this.findOption(
        this.jenisVoucherOptions,
        this.form.jenis_voucher_id,
      );

      return item?.color || "success";
    },

    selectedTemplateLabel() {
      return this.getOptionLabel(
        this.templateVoucherOptions,
        this.form.template_voucher_id,
        "Belum memilih template",
      );
    },

    selectedStatusLabel() {
      return this.getOptionLabel(
        this.statusVoucherOptions,
        this.form.status_voucher,
      );
    },

    selectedStatusColor() {
      const item = this.statusVoucherOptions.find(
        (row) => Number(row.value) === Number(this.form.status_voucher),
      );

      return item ? item.color : "secondary";
    },

    formattedDiskon() {
      if (!this.form.tipe_diskon) return "Diskon belum diatur";

      if (this.isPercentDiscount) {
        return `${Number(this.form.total_diskon || 0)}%`;
      }

      return this.formatRupiah(this.form.total_diskon);
    },

    formattedMaxDiskon() {
      return this.formatRupiah(this.form.total_diskon_maksimal);
    },

    formattedJumlahVoucher() {
      if (this.isGenerateMode) {
        return `${Number(this.form.qty_generate || 0)} kode dibuat`;
      }

      if (this.form.is_unlimited_generate) {
        return "1 kode, tanpa batas penggunaan";
      }

      return `1 kode, maksimal ${Number(
        this.form.qty_generate || 0,
      )} penggunaan`;
    },

    formattedPeriode() {
      if (!this.form.tanggal_mulai || !this.form.tanggal_akhir) {
        return "Periode belum lengkap";
      }

      return `${this.form.tanggal_mulai} s/d ${this.form.tanggal_akhir}`;
    },

    payload() {
      return this.buildPayload();
    },
  },

  watch: {
    "form.kategori_voucher_id"(value) {
      this.syncModeFromKategori(value);
    },

    "form.mode_voucher"(value) {
      if (value === "direct") {
        if (
          !Number(this.form.qty_generate || 0) &&
          !this.form.is_unlimited_generate
        ) {
          this.form.qty_generate = 1;
        }

        return;
      }

      if (value === "generate") {
        this.form.kode_voucher = "";
        this.form.is_unlimited_generate = false;

        if (!Number(this.form.qty_generate || 0)) {
          this.form.qty_generate = 1;
        }
      }
    },

    "form.tipe_diskon"(value) {
      if (value === "nominal") {
        this.form.total_diskon_maksimal = 0;
      }
    },

    "form.is_all_toko"(value) {
      if (value) {
        this.form.toko_id = null;
      }
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    async initPage() {
      this.loadingPage = true;

      try {
        await this.fetchMasterData();
        await this.fetchDetail();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data voucher"),
          "error",
        );

        this.$router.replace("/administrasi/voucher-diskon");
      } finally {
        this.loadingPage = false;
      }
    },

    async fetchMasterData() {
      this.loadingMaster = true;

      try {
        const [tokoRes, kategoriRes, jenisRes, templateRes] = await Promise.all(
          [
            referenceService.toko(),
            referenceService.voucherDiskonKategori(),
            referenceService.voucherDiskonJenis(),
            referenceService.voucherDiskonTemplate(),
          ],
        );

        this.tokoOptions = this.normalizeToko(tokoRes);
        this.kategoriVoucherOptions =
          this.normalizeVoucherKategori(kategoriRes);
        this.jenisVoucherOptions = this.normalizeVoucherJenis(jenisRes);
        this.templateVoucherOptions =
          this.normalizeVoucherTemplate(templateRes);
      } finally {
        this.loadingMaster = false;
      }
    },

    async fetchDetail() {
      const response = await voucherDiskonService.getById(this.voucherId);
      const detail = this.extractDetail(response);

      if (!detail) {
        throw new Error("Data voucher tidak ditemukan");
      }

      this.form = this.mapDetailToForm(detail);
      this.existingItems = this.normalizeExistingItems(detail.items);

      this.syncModeFromKategori(this.form.kategori_voucher_id);
    },

    extractDetail(response) {
      if (!response) return null;

      if (response.data?.data) return response.data.data;
      if (response.data?.id) return response.data;
      if (response.result?.id) return response.result;
      if (response.id) return response;

      return response.data ?? response.result ?? response;
    },

    mapDetailToForm(detail) {
      const isAllToko = Number(detail.is_all_toko || 0) === 1;
      const isUnlimitedDate = Number(detail.is_unlimited_date || 0) === 1;
      const isUnlimitedGenerate =
        Number(detail.is_unlimited_generate || 0) === 1;

      return {
        legacy_id: detail.legacy_id ?? null,

        kode_voucher: detail.kode_voucher ?? "",
        nama_voucher: detail.nama_voucher ?? detail.nama ?? "",
        deskripsi: detail.deskripsi ?? "",

        mode_voucher: detail.mode_voucher ?? "direct",

        toko_id: isAllToko ? null : (detail.toko_id ?? null),
        is_all_toko: isAllToko,

        kategori_voucher_id: detail.kategori_voucher_id ?? null,
        jenis_voucher_id: detail.jenis_voucher_id ?? null,
        template_voucher_id: detail.template_voucher_id ?? null,

        is_unlimited_date: isUnlimitedDate,
        tanggal_mulai: isUnlimitedDate
          ? ""
          : this.formatInputDate(detail.tanggal_mulai),
        tanggal_akhir: isUnlimitedDate
          ? ""
          : this.formatInputDate(detail.tanggal_akhir),

        tipe_diskon: this.normalizeTipeDiskon(detail.tipe_diskon),
        total_diskon: Number(detail.total_diskon || 0),
        total_diskon_maksimal: Number(detail.total_diskon_maksimal || 0),

        is_unlimited_generate: isUnlimitedGenerate,
        qty_generate: isUnlimitedGenerate
          ? 0
          : Number(detail.qty_generate || 1),

        is_bisa_digabung_promo:
          Number(detail.is_bisa_digabung_promo || 0) === 1,

        status_voucher: Number(detail.status_voucher ?? 0),
        sort_order: Number(detail.sort_order || 0),
      };
    },

    normalizeExistingItems(items) {
      if (!Array.isArray(items)) {
        return [];
      }

      return items
        .filter((item) => Number(item.is_delete || 0) === 0)
        .map((item) => ({
          item_type: item.item_type,
          item_id: item.item_id,
          harga_snapshot:
            item.harga_snapshot === undefined || item.harga_snapshot === null
              ? null
              : Number(item.harga_snapshot),
          tipe_diskon_item: item.tipe_diskon_item || null,
          nilai_diskon_item:
            item.nilai_diskon_item === undefined ||
            item.nilai_diskon_item === null
              ? null
              : Number(item.nilai_diskon_item),
        }))
        .filter((item) => item.item_type && item.item_id);
    },

    normalizeTipeDiskon(value) {
      const tipe = String(value || "").toLowerCase();

      if (["persen", "percent"].includes(tipe)) {
        return "percent";
      }

      if (["rupiah", "nominal"].includes(tipe)) {
        return "nominal";
      }

      return "percent";
    },

    normalizeToko(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          ...item,
          id: item.id ?? item.toko_id ?? item.value,
          nama: item.nama_toko ?? item.nama ?? item.name ?? item.label ?? "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeVoucherKategori(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => {
          const id = item.id ?? item.value;
          const kode = String(item.kode ?? "").toUpperCase();
          const label =
            item.label ??
            item.nama_kategori ??
            item.nama ??
            item.opsi ??
            item.name ??
            "-";

          return {
            ...item,
            id,
            value: id,
            label,
            kode,
          };
        })
        .filter((item) => item.value && item.label);
    },

    normalizeVoucherJenis(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => {
          const id = item.id ?? item.value;
          const kode = String(item.kode ?? "").toUpperCase();
          const label =
            item.label ??
            item.nama_jenis ??
            item.nama ??
            item.opsi ??
            item.name ??
            "-";

          return {
            ...item,
            id,
            value: id,
            label,
            kode,
            color: item.color || this.getJenisColor(kode || label),
            bisa_treatment: this.toBoolean(item.bisa_treatment),
            bisa_produk: this.toBoolean(item.bisa_produk),
          };
        })
        .filter((item) => item.value && item.label);
    },

    normalizeVoucherTemplate(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => {
          const id = item.id ?? item.value;
          const kode = String(item.kode ?? "").toUpperCase();
          const label =
            item.label ?? item.nama_template ?? item.nama ?? item.name ?? "-";

          return {
            ...item,
            id,
            value: id,
            label,
            kode,
            file_url: item.file_url ?? null,
            file_name: item.file_name ?? null,
          };
        })
        .filter((item) => item.value && item.label);
    },

    extractRows(response) {
      const source = response?.data ?? response?.result ?? response ?? [];

      if (Array.isArray(source)) return source;
      if (Array.isArray(source.data)) return source.data;
      if (Array.isArray(source.items)) return source.items;

      return [];
    },

    syncModeFromKategori(kategoriId) {
      const item = this.findOption(this.kategoriVoucherOptions, kategoriId);

      if (!item) return;

      const kode = String(item.kode || "").toUpperCase();
      const label = String(item.label || "").toLowerCase();

      if (kode === "DIRECT" || label.includes("direct")) {
        this.form.mode_voucher = "direct";

        if (
          !Number(this.form.qty_generate || 0) &&
          !this.form.is_unlimited_generate
        ) {
          this.form.qty_generate = 1;
        }

        return;
      }

      if (kode === "GENERATE" || label.includes("generate")) {
        this.form.mode_voucher = "generate";
        this.form.kode_voucher = "";
        this.form.is_unlimited_generate = false;

        if (!Number(this.form.qty_generate || 0)) {
          this.form.qty_generate = 1;
        }
      }
    },

    getJenisColor(value) {
      const text = String(value || "").toUpperCase();

      if (text.includes("TREATMENT")) return "primary";
      if (text.includes("PRODUK") || text.includes("PRODUCT")) return "success";
      if (text.includes("BUNDLING")) return "purple";
      if (text.includes("VALUE")) return "warning";

      return "secondary";
    },

    toBoolean(value) {
      return value === true || value === 1 || value === "1";
    },

    filterOption(itemTitle, queryText, item) {
      const title =
        typeof itemTitle === "string"
          ? itemTitle
          : (item?.raw?.nama ?? item?.raw?.label ?? "");

      const text = String(title || "").toLowerCase();
      const query = String(queryText || "").toLowerCase();

      return text.includes(query);
    },

    formatInputDate(value) {
      if (!value) return "";

      return String(value).slice(0, 10);
    },

    findOption(options, value) {
      return options.find((row) => String(row.value) === String(value));
    },

    getOptionLabel(options, value, fallback = "-") {
      const item = this.findOption(options, value);
      return item ? item.label : fallback;
    },

    normalizeKodeVoucher(value) {
      return String(value || "")
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9-_]/g, "");
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    validateBusinessRule() {
      if (!this.form.kategori_voucher_id) {
        return "Kategori voucher wajib dipilih";
      }

      if (this.isDirectMode && !String(this.form.kode_voucher || "").trim()) {
        return "Kode voucher wajib diisi untuk voucher direct";
      }

      if (!this.form.is_all_toko && !this.form.toko_id) {
        return "Cabang wajib dipilih jika voucher tidak berlaku untuk semua cabang";
      }

      if (!this.form.is_unlimited_date) {
        if (!this.form.tanggal_mulai || !this.form.tanggal_akhir) {
          return "Tanggal mulai dan tanggal akhir wajib diisi";
        }

        if (this.form.tanggal_mulai > this.form.tanggal_akhir) {
          return "Tanggal akhir tidak boleh lebih awal dari tanggal mulai";
        }
      }

      if (this.isPercentDiscount) {
        if (Number(this.form.total_diskon || 0) > 100) {
          return "Diskon persen tidak boleh lebih dari 100";
        }

        if (Number(this.form.total_diskon_maksimal || 0) < 1) {
          return "Maksimal diskon nominal wajib diisi untuk tipe persen";
        }
      }

      if (
        !(this.isDirectMode && this.form.is_unlimited_generate) &&
        Number(this.form.qty_generate || 0) < 1
      ) {
        return this.isGenerateMode
          ? "Jumlah voucher generate minimal 1"
          : "Batas jumlah penggunaan minimal 1";
      }

      return null;
    },

    buildPayload() {
      return {
        legacy_id: this.form.legacy_id,

        kode_voucher: this.isGenerateMode
          ? null
          : this.cleanValue(this.form.kode_voucher),

        nama_voucher: this.cleanValue(this.form.nama_voucher),
        deskripsi: this.cleanValue(this.form.deskripsi),

        mode_voucher: this.form.mode_voucher,

        toko_id: this.form.is_all_toko ? null : this.form.toko_id,
        is_all_toko: this.form.is_all_toko ? 1 : 0,

        kategori_voucher_id: this.form.kategori_voucher_id,
        jenis_voucher_id: this.form.jenis_voucher_id,
        template_voucher_id: this.form.template_voucher_id,

        tipe_diskon: this.form.tipe_diskon,
        total_diskon: Number(this.form.total_diskon || 0),
        total_diskon_maksimal: this.isPercentDiscount
          ? Number(this.form.total_diskon_maksimal || 0)
          : null,

        is_unlimited_generate:
          this.isDirectMode && this.form.is_unlimited_generate ? 1 : 0,

        qty_generate:
          this.isDirectMode && this.form.is_unlimited_generate
            ? 0
            : Number(this.form.qty_generate || 1),

        is_bisa_digabung_promo: this.form.is_bisa_digabung_promo ? 1 : 0,
        is_unlimited_date: this.form.is_unlimited_date ? 1 : 0,

        tanggal_mulai: this.form.is_unlimited_date
          ? null
          : this.form.tanggal_mulai,
        tanggal_akhir: this.form.is_unlimited_date
          ? null
          : this.form.tanggal_akhir,

        status_voucher: Number(this.form.status_voucher ?? 0),
        sort_order: Number(this.form.sort_order || 0),

        items: this.existingItems,
      };
    },

    cleanValue(value) {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      if (typeof value === "string") {
        return value.trim() || null;
      }

      return value;
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      const businessError = this.validateBusinessRule();

      if (businessError) {
        this.showSnackbar(businessError, "error");
        return;
      }

      this.loading = true;

      try {
        await voucherDiskonService.update(this.voucherId, this.payload);

        this.showSnackbar("Voucher diskon berhasil diperbarui", "success");

        this.$router.replace("/administrasi/voucher-diskon");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memperbarui voucher diskon"),
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },

    getErrorMessage(error, fallbackMessage) {
      const response = error?.response?.data;

      if (response?.message) return response.message;
      if (response?.error) return response.error;

      if (response?.errors) {
        const firstKey = Object.keys(response.errors)[0];

        if (firstKey && Array.isArray(response.errors[firstKey])) {
          return response.errors[firstKey][0];
        }
      }

      return fallbackMessage;
    },
  },
};
</script>

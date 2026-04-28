<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Voucher Diskon</h1>
        <p class="page-subtitle">
          Ubah informasi voucher, periode, nilai diskon, dan template voucher
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
        <!-- FORM -->
        <v-col cols="12" lg="8">
          <v-card elevation="1" class="mb-4">
            <v-card-title class="text-h6 font-weight-bold">
              Form Edit Voucher Diskon
            </v-card-title>

            <v-divider />

            <v-card-text>
              <!-- INFORMASI UTAMA -->
              <div class="text-subtitle-1 font-weight-bold mb-3">
                Informasi Utama
              </div>

              <v-row>
                <v-col cols="12">
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

                <v-col cols="12">
                  <v-textarea
                    v-model="form.deskripsi"
                    label="Deskripsi"
                    placeholder="Jelaskan fungsi voucher ini"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-text-box-outline"
                    rows="3"
                    auto-grow
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.toko_id"
                    label="Cabang Voucher *"
                    :items="tokoOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-store-outline"
                    :rules="[rules.required]"
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.kategori_voucher"
                    label="Kategori Voucher *"
                    :items="kategoriVoucherOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-shape-outline"
                    :rules="[rules.required]"
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.jenis_voucher"
                    label="Jenis Voucher *"
                    :items="jenisVoucherOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-format-list-bulleted-type"
                    :rules="[rules.required]"
                    clearable
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- PERIODE -->
              <div class="text-subtitle-1 font-weight-bold mb-3">
                Periode Berlaku
              </div>

              <v-row>
                <v-col cols="12">
                  <v-checkbox
                    v-model="form.tidak_ada_batas_tanggal"
                    label="Tidak ada batas tanggal"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <template v-if="!form.tidak_ada_batas_tanggal">
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
                      v-model="form.tanggal_berakhir"
                      label="Tanggal Berakhir *"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar-end"
                      :rules="[rules.required]"
                    />
                  </v-col>
                </template>

                <v-col cols="12" v-else>
                  <v-alert type="info" variant="tonal">
                    Voucher akan berlaku tanpa batas tanggal.
                  </v-alert>
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- DISKON -->
              <div class="text-subtitle-1 font-weight-bold mb-3">
                Pengaturan Diskon
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
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.total_diskon"
                    :label="
                      form.tipe_diskon === 'Persen'
                        ? 'Total Diskon (%) *'
                        : 'Total Diskon *'
                    "
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-cash-minus"
                    :rules="diskonRules"
                    hint="Untuk persen, isi 0 sampai 100"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.jumlah_voucher"
                    label="Jumlah Voucher *"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-ticket-confirmation-outline"
                    :rules="[rules.required, rules.nonNegative]"
                  />
                </v-col>

                <v-col cols="12">
                  <v-checkbox
                    v-model="form.bisa_digabung_promo"
                    label="Voucher dapat digabung dengan promo lain"
                    color="primary"
                    hide-details
                  />
                </v-col>
              </v-row>

              <v-divider class="my-6" />

              <!-- TEMPLATE -->
              <div class="text-subtitle-1 font-weight-bold mb-3">
                Template Voucher
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.template_voucher"
                    label="Template Voucher *"
                    :items="templateVoucherOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-image-outline"
                    :rules="[rules.required]"
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-alert type="info" variant="tonal">
                    Ringkasan voucher akan otomatis diperbarui di panel kanan.
                  </v-alert>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- SIDEBAR RINGKASAN -->
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

                <div class="d-flex flex-wrap ga-2">
                  <v-chip size="small" variant="tonal" color="primary">
                    {{ selectedKategoriLabel }}
                  </v-chip>
                  <v-chip size="small" variant="tonal" color="success">
                    {{ selectedJenisLabel }}
                  </v-chip>
                  <v-chip size="small" variant="tonal" color="warning">
                    {{ selectedTokoLabel }}
                  </v-chip>
                </div>

                <v-divider />

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Nilai Diskon
                  </div>
                  <div class="text-h5 font-weight-bold">
                    {{ formattedDiskon }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Jumlah Voucher
                  </div>
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ Number(form.jumlah_voucher || 0) }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis">Periode</div>
                  <div class="text-body-1">
                    {{
                      form.tidak_ada_batas_tanggal
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
                    {{ form.bisa_digabung_promo ? "Ya" : "Tidak" }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card elevation="1">
            <v-card-title class="text-h6 font-weight-bold">
              Preview Template
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

                  <v-chip color="primary" variant="tonal">
                    {{ form.tipe_diskon || "Tipe" }}
                  </v-chip>
                </div>

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
                </div>

                <div class="text-h4 font-weight-bold mb-2">
                  {{ formattedDiskon }}
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  {{
                    form.tidak_ada_batas_tanggal
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
      >
        Update Voucher
      </v-btn>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>

    <v-dialog v-model="dialogPreview" max-width="900">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Preview Payload Update
        </v-card-title>

        <v-divider />

        <v-card-text>
          <pre>{{ formattedPayload }}</pre>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="dialogPreview = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
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
      dialogPreview: false,

      form: {
        nama_voucher: "",
        deskripsi: "",
        toko_id: null,
        kategori_voucher: null,
        jenis_voucher: null,
        tidak_ada_batas_tanggal: false,
        tanggal_mulai: "",
        tanggal_berakhir: "",
        tipe_diskon: null,
        total_diskon: 0,
        jumlah_voucher: 0,
        bisa_digabung_promo: false,
        template_voucher: null,
      },

      dummyVouchers: [
        {
          id: 1,
          nama_voucher: "Voucher Member Baru",
          deskripsi: "Diskon khusus untuk member baru",
          toko_id: "JAKARTA SELATAN",
          kategori_voucher: "Direct Voucher",
          jenis_voucher: "Treatment",
          tidak_ada_batas_tanggal: false,
          tanggal_mulai: "2026-04-27",
          tanggal_berakhir: "2026-05-27",
          tipe_diskon: "Persen",
          total_diskon: 10,
          jumlah_voucher: 100,
          bisa_digabung_promo: false,
          template_voucher: "Template Biru",
        },
        {
          id: 2,
          nama_voucher: "Voucher Facial Premium",
          deskripsi: "Potongan untuk treatment facial premium",
          toko_id: "MALANG",
          kategori_voucher: "Generate Voucher",
          jenis_voucher: "Treatment",
          tidak_ada_batas_tanggal: true,
          tanggal_mulai: "",
          tanggal_berakhir: "",
          tipe_diskon: "Nominal",
          total_diskon: 50000,
          jumlah_voucher: 50,
          bisa_digabung_promo: true,
          template_voucher: "Template Gold",
        },
        {
          id: 3,
          nama_voucher: "Bundling Product Mei",
          deskripsi: "Voucher bundling product bulanan",
          toko_id: "SURABAYA",
          kategori_voucher: "Direct Voucher",
          jenis_voucher: "Bundling",
          tidak_ada_batas_tanggal: false,
          tanggal_mulai: "2026-05-01",
          tanggal_berakhir: "2026-05-31",
          tipe_diskon: "Persen",
          total_diskon: 15,
          jumlah_voucher: 200,
          bisa_digabung_promo: true,
          template_voucher: "Template Elegan",
        },
      ],

      tokoOptions: [
        { label: "JAKARTA SELATAN", value: "JAKARTA SELATAN" },
        { label: "MALANG", value: "MALANG" },
        { label: "SURABAYA", value: "SURABAYA" },
        { label: "BANDUNG", value: "BANDUNG" },
        { label: "DEPOK", value: "DEPOK" },
      ],

      kategoriVoucherOptions: [
        { label: "Direct Voucher", value: "Direct Voucher" },
        { label: "Generate Voucher", value: "Generate Voucher" },
      ],

      jenisVoucherOptions: [
        { label: "Treatment", value: "Treatment" },
        { label: "Product", value: "Product" },
        { label: "Bundling", value: "Bundling" },
      ],

      tipeDiskonOptions: [
        { label: "Persen", value: "Persen" },
        { label: "Nominal", value: "Nominal" },
      ],

      templateVoucherOptions: [
        { label: "Template Biru", value: "Template Biru" },
        { label: "Template Gold", value: "Template Gold" },
        { label: "Template Elegan", value: "Template Elegan" },
      ],

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!String(v ?? "").trim() || "Field ini wajib diisi",
        nonNegative: (v) =>
          Number(v || 0) >= 0 || "Nilai tidak boleh kurang dari 0",
        percentRange: (v) => {
          const val = Number(v || 0);
          return (val >= 0 && val <= 100) || "Persen harus antara 0 sampai 100";
        },
      },
    };
  },

  computed: {
    diskonRules() {
      if (this.form.tipe_diskon === "Persen") {
        return [
          this.rules.required,
          this.rules.nonNegative,
          this.rules.percentRange,
        ];
      }

      return [this.rules.required, this.rules.nonNegative];
    },

    selectedTokoLabel() {
      const item = this.tokoOptions.find(
        (row) => row.value === this.form.toko_id,
      );
      return item ? item.label : "-";
    },

    selectedKategoriLabel() {
      const item = this.kategoriVoucherOptions.find(
        (row) => row.value === this.form.kategori_voucher,
      );
      return item ? item.label : "-";
    },

    selectedJenisLabel() {
      const item = this.jenisVoucherOptions.find(
        (row) => row.value === this.form.jenis_voucher,
      );
      return item ? item.label : "-";
    },

    selectedTemplateLabel() {
      const item = this.templateVoucherOptions.find(
        (row) => row.value === this.form.template_voucher,
      );
      return item ? item.label : "Belum memilih template";
    },

    formattedDiskon() {
      if (!this.form.tipe_diskon) return "Diskon belum diatur";

      if (this.form.tipe_diskon === "Persen") {
        return `${Number(this.form.total_diskon || 0)}%`;
      }

      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(this.form.total_diskon || 0));
    },

    formattedPeriode() {
      if (!this.form.tanggal_mulai || !this.form.tanggal_berakhir) {
        return "Periode belum lengkap";
      }

      return `${this.form.tanggal_mulai} s/d ${this.form.tanggal_berakhir}`;
    },

    payload() {
      return {
        id: Number(this.$route.params.id),
        ...this.form,
        tidak_ada_batas_tanggal: this.form.tidak_ada_batas_tanggal ? 1 : 0,
        bisa_digabung_promo: this.form.bisa_digabung_promo ? 1 : 0,
      };
    },

    formattedPayload() {
      return JSON.stringify(this.payload, null, 2);
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    initPage() {
      this.loadingPage = true;

      try {
        const id = Number(this.$route.params.id);
        const detail = this.dummyVouchers.find((item) => item.id === id);

        if (!detail) {
          this.showSnackbar("Data voucher tidak ditemukan", "error");
          this.$router.push("/administrasi/voucher-diskon");
          return;
        }

        this.form = {
          nama_voucher: detail.nama_voucher || "",
          deskripsi: detail.deskripsi || "",
          toko_id: detail.toko_id || null,
          kategori_voucher: detail.kategori_voucher || null,
          jenis_voucher: detail.jenis_voucher || null,
          tidak_ada_batas_tanggal: !!detail.tidak_ada_batas_tanggal,
          tanggal_mulai: detail.tanggal_mulai || "",
          tanggal_berakhir: detail.tanggal_berakhir || "",
          tipe_diskon: detail.tipe_diskon || null,
          total_diskon: Number(detail.total_diskon || 0),
          jumlah_voucher: Number(detail.jumlah_voucher || 0),
          bisa_digabung_promo: !!detail.bisa_digabung_promo,
          template_voucher: detail.template_voucher || null,
        };
      } finally {
        this.loadingPage = false;
      }
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();

      if (!result.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      if (
        !this.form.tidak_ada_batas_tanggal &&
        (!this.form.tanggal_mulai || !this.form.tanggal_berakhir)
      ) {
        this.showSnackbar("Tanggal mulai dan berakhir wajib diisi", "error");
        return;
      }

      if (
        !this.form.tidak_ada_batas_tanggal &&
        this.form.tanggal_mulai > this.form.tanggal_berakhir
      ) {
        this.showSnackbar(
          "Tanggal berakhir tidak boleh lebih awal dari tanggal mulai",
          "error",
        );
        return;
      }

      this.loading = true;

      try {
        console.log("Payload edit voucher diskon:", this.payload);
        this.dialogPreview = true;
        this.showSnackbar("Voucher diskon berhasil diperbarui", "success");
      } catch (error) {
        this.showSnackbar("Gagal memperbarui voucher diskon", "error");
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
  },
};
</script>

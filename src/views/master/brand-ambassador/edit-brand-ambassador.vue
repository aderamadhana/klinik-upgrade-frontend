<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Edit Brand Ambassador</h1>
        <div class="text-body-2 text-medium-emphasis">
          Ubah data brand ambassador
        </div>
      </div>

      <v-btn
        variant="outlined"
        color="secondary"
        :to="'/master/brand-ambassador'"
      >
        Kembali
      </v-btn>
    </div>

    <v-card rounded="lg">
      <v-card-title class="text-h6 font-weight-bold">
        Form Edit Brand Ambassador
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-skeleton-loader v-if="loadingPage" type="article" />

        <template v-else>
          <v-alert type="info" variant="tonal" class="mb-6">
            Ubah data brand ambassador, lalu submit untuk melihat preview
            payload update.
          </v-alert>

          <v-form
            ref="formRef"
            v-model="isValid"
            validate-on="submit lazy"
            @submit.prevent="submitForm"
          >
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.toko_id"
                  label="Cabang / Toko *"
                  placeholder="Pilih cabang"
                  :items="tokoOptions"
                  item-title="nama"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.kode"
                  label="Kode *"
                  placeholder="Contoh: BA001"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.nama"
                  label="Nama *"
                  placeholder="Masukkan nama brand ambassador"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.no_telp"
                  label="No. Telepon"
                  placeholder="Nomor telepon / WhatsApp"
                  variant="outlined"
                  density="comfortable"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  placeholder="Masukkan email"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.email]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.instagram"
                  label="Instagram"
                  placeholder="Contoh: @namaakun"
                  variant="outlined"
                  density="comfortable"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.alamat"
                  label="Alamat"
                  placeholder="Masukkan alamat"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  auto-grow
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.catatan"
                  label="Catatan"
                  placeholder="Masukkan catatan tambahan"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  auto-grow
                  clearable
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end ga-3 mt-6">
              <v-btn
                variant="outlined"
                color="secondary"
                :to="'/master/brand-ambassador'"
              >
                Batal
              </v-btn>

              <v-btn color="success" type="submit"> Update </v-btn>
            </div>
          </v-form>
        </template>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogPreview" max-width="900">
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Preview Payload Update</span>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogPreview = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <pre class="payload-preview">{{ formattedPayload }}</pre>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="dialogPreview = false"
          >
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "EditBrandAmbassador",
  data() {
    return {
      isValid: false,
      loadingPage: false,
      dialogPreview: false,
      payloadPreview: null,

      tokoOptions: [
        { id: 1, nama: "Malang" },
        { id: 2, nama: "Surabaya" },
        { id: 3, nama: "Bandung" },
        { id: 4, nama: "Sidoarjo" },
        { id: 5, nama: "Bekasi" },
        { id: 6, nama: "Medan" },
        { id: 7, nama: "Depok" },
        { id: 8, nama: "Yogyakarta" },
      ],

      dummyBrandAmbassadors: [
        {
          id: 1,
          toko_id: 1,
          kode: "BA001",
          nama: "Alya Putri",
          no_telp: "081234567890",
          email: "alya.putri@mail.com",
          instagram: "@alyaputri",
          alamat: "Jl. Ijen No. 12, Malang",
          catatan: "Fokus campaign skincare premium",
        },
        {
          id: 2,
          toko_id: 2,
          kode: "BA002",
          nama: "Nabila Safa",
          no_telp: "082233445566",
          email: "nabila.safa@mail.com",
          instagram: "@nabilasafa",
          alamat: "Jl. Diponegoro No. 8, Surabaya",
          catatan: "Aktif untuk promo event cabang Surabaya",
        },
        {
          id: 3,
          toko_id: 3,
          kode: "BA003",
          nama: "Raisa Anindya",
          no_telp: "081998877665",
          email: "raisa.anindya@mail.com",
          instagram: "@raisaanindya",
          alamat: "Jl. Braga No. 21, Bandung",
          catatan: "Konten dominan Instagram Reels",
        },
        {
          id: 4,
          toko_id: 7,
          kode: "BA004",
          nama: "Dinda Maharani",
          no_telp: "085712341234",
          email: "dinda.maharani@mail.com",
          instagram: "@dindamaharani",
          alamat: "Jl. Margonda No. 33, Depok",
          catatan: "Diprioritaskan untuk akuisisi member baru",
        },
        {
          id: 5,
          toko_id: 8,
          kode: "BA005",
          nama: "Salsa Kirana",
          no_telp: "081377788899",
          email: "salsa.kirana@mail.com",
          instagram: "@salsakirana",
          alamat: "Jl. Kaliurang No. 15, Yogyakarta",
          catatan: "Kolaborasi campaign treatment seasonal",
        },
      ],

      form: {
        toko_id: null,
        kode: "",
        nama: "",
        no_telp: "",
        email: "",
        instagram: "",
        alamat: "",
        catatan: "",
      },

      rules: {
        required: (v) =>
          (v !== null && v !== undefined && v !== "") || "Wajib diisi",
        email: (v) =>
          !v ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
          "Format email tidak valid",
      },
    };
  },

  computed: {
    formattedPayload() {
      return JSON.stringify(this.payloadPreview, null, 2);
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
        const detail = this.dummyBrandAmbassadors.find(
          (item) => Number(item.id) === id,
        );

        if (!detail) {
          this.$router.push("/master/brand-ambassador");
          return;
        }

        this.form = {
          toko_id: detail.toko_id ?? null,
          kode: detail.kode || "",
          nama: detail.nama || "",
          no_telp: detail.no_telp || "",
          email: detail.email || "",
          instagram: detail.instagram || "",
          alamat: detail.alamat || "",
          catatan: detail.catatan || "",
        };
      } finally {
        this.loadingPage = false;
      }
    },

    buildPayload() {
      return {
        id: Number(this.$route.params.id),
        toko_id: this.form.toko_id,
        kode: this.form.kode,
        nama: this.form.nama,
        no_telp: this.form.no_telp || null,
        email: this.form.email || null,
        instagram: this.form.instagram || null,
        alamat: this.form.alamat || null,
        catatan: this.form.catatan || null,
      };
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();
      if (!result.valid) return;

      const payload = this.buildPayload();

      this.payloadPreview = payload;
      this.dialogPreview = true;

      console.log("Payload edit brand ambassador:", payload);
    },
  },
};
</script>

<style scoped>
.payload-preview {
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}
</style>

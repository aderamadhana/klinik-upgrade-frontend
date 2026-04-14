<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Edit Supplier</h1>
        <div class="text-body-2 text-medium-emphasis">
          Ubah data supplier dan mapping cabang
        </div>
      </div>

      <v-btn variant="outlined" color="secondary" :to="'/master/supplier'">
        Kembali
      </v-btn>
    </div>

    <v-card rounded="lg">
      <v-card-title class="text-h6 font-weight-bold">
        Form Edit Supplier
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-skeleton-loader v-if="loadingPage" type="article" />

        <template v-else>
          <v-alert type="info" variant="tonal" class="mb-6">
            Ubah data supplier, lalu sesuaikan mapping cabang yang menggunakan
            supplier ini.
          </v-alert>

          <v-form
            ref="formRef"
            v-model="isValid"
            validate-on="submit lazy"
            @submit.prevent="submitForm"
          >
            <div class="text-subtitle-1 font-weight-bold mb-3">
              Informasi Utama
            </div>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.kode"
                  label="Kode Supplier *"
                  placeholder="Contoh: SUP001"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.nama"
                  label="Nama Supplier *"
                  placeholder="Masukkan nama supplier / perusahaan"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.kontak_person"
                  label="Kontak Person"
                  placeholder="Masukkan nama PIC"
                  variant="outlined"
                  density="comfortable"
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
                  placeholder="Masukkan email supplier"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.email]"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.kota"
                  label="Kota"
                  placeholder="Masukkan kota supplier"
                  variant="outlined"
                  density="comfortable"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.sort_order"
                  label="Sort Order"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  hint="Semakin kecil angka, semakin atas urutannya"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.alamat"
                  label="Alamat"
                  placeholder="Masukkan alamat supplier"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  auto-grow
                  clearable
                />
              </v-col>
            </v-row>

            <v-divider class="my-6" />

            <div
              class="d-flex justify-space-between align-center mb-3 flex-wrap ga-3"
            >
              <div class="text-subtitle-1 font-weight-bold">Mapping Cabang</div>

              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-plus"
                @click="addTokoMapping"
              >
                Tambah Cabang
              </v-btn>
            </div>

            <v-alert type="info" variant="tonal" class="mb-4">
              Pilih cabang yang menggunakan supplier ini. Centang
              <strong>Default</strong> jika supplier ini menjadi supplier utama
              di cabang tersebut.
            </v-alert>

            <v-card
              v-for="(item, index) in form.toko_mapping"
              :key="index"
              variant="outlined"
              class="mb-4"
            >
              <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-subtitle-2 font-weight-bold">
                  Cabang {{ index + 1 }}
                </span>

                <v-btn
                  v-if="form.toko_mapping.length > 1"
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="removeTokoMapping(index)"
                />
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col cols="12" md="9">
                    <v-select
                      v-model="item.toko_id"
                      label="Toko / Cabang *"
                      placeholder="Pilih toko"
                      :items="tokoOptions"
                      item-title="nama"
                      item-value="id"
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                      clearable
                    />
                  </v-col>

                  <v-col cols="12" md="3" class="d-flex align-center">
                    <v-checkbox
                      v-model="item.is_default"
                      label="Default"
                      color="success"
                      hide-details
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div class="d-flex justify-end ga-3 mt-6">
              <v-btn
                variant="outlined"
                color="secondary"
                :to="'/master/supplier'"
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
  name: "EditSupplier",
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

      dummySuppliers: [
        {
          id: 1,
          kode: "SUP001",
          nama: "PT Sumber Cantik Abadi",
          kontak_person: "Rina",
          no_telp: "081234567890",
          email: "rina@sumbercantik.co.id",
          alamat: "Jl. Mawar No. 10",
          kota: "Malang",
          sort_order: 1,
          toko_mapping: [
            { toko_id: 1, is_default: true },
            { toko_id: 2, is_default: false },
          ],
        },
        {
          id: 2,
          kode: "SUP002",
          nama: "CV Glow Beauty Supply",
          kontak_person: "Andi",
          no_telp: "082233445566",
          email: "andi@glowbeauty.co.id",
          alamat: "Jl. Melati No. 20",
          kota: "Surabaya",
          sort_order: 2,
          toko_mapping: [
            { toko_id: 3, is_default: true },
            { toko_id: 7, is_default: false },
          ],
        },
      ],

      form: {
        kode: "",
        nama: "",
        kontak_person: "",
        no_telp: "",
        email: "",
        alamat: "",
        kota: "",
        sort_order: 0,
        toko_mapping: [
          {
            toko_id: null,
            is_default: false,
          },
        ],
      },

      rules: {
        required: (v) => !!v || "Wajib diisi",
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
        const detail = this.dummySuppliers.find((item) => item.id === id);

        // if (!detail) {
        //   if (this.$toast?.error) {
        //     this.$toast.error("Data supplier tidak ditemukan");
        //   } else {
        //     alert("Data supplier tidak ditemukan");
        //   }

        //   this.$router.push("/master/supplier");
        //   return;
        // }

        this.form = {
          kode: detail.kode || "",
          nama: detail.nama || "",
          kontak_person: detail.kontak_person || "",
          no_telp: detail.no_telp || "",
          email: detail.email || "",
          alamat: detail.alamat || "",
          kota: detail.kota || "",
          sort_order: Number(detail.sort_order || 0),
          toko_mapping: (detail.toko_mapping || []).length
            ? detail.toko_mapping.map((item) => ({
                toko_id: item.toko_id,
                is_default: !!item.is_default,
              }))
            : [
                {
                  toko_id: null,
                  is_default: false,
                },
              ],
        };
      } finally {
        this.loadingPage = false;
      }
    },

    addTokoMapping() {
      this.form.toko_mapping.push({
        toko_id: null,
        is_default: false,
      });
    },

    removeTokoMapping(index) {
      this.form.toko_mapping.splice(index, 1);
    },

    validateTokoMapping() {
      if (!this.form.toko_mapping.length) {
        return "Minimal harus ada 1 cabang";
      }

      const tokoIds = this.form.toko_mapping
        .map((item) => item.toko_id)
        .filter((id) => id !== null && id !== "");

      if (tokoIds.length !== this.form.toko_mapping.length) {
        return "Semua cabang harus dipilih";
      }

      const uniqueTokoIds = new Set(tokoIds);
      if (uniqueTokoIds.size !== tokoIds.length) {
        return "Cabang tidak boleh duplikat";
      }

      return null;
    },

    buildPayload() {
      return {
        id: Number(this.$route.params.id),
        kode: this.form.kode,
        nama: this.form.nama,
        kontak_person: this.form.kontak_person || null,
        no_telp: this.form.no_telp || null,
        email: this.form.email || null,
        alamat: this.form.alamat || null,
        kota: this.form.kota || null,
        sort_order: Number(this.form.sort_order || 0),
        toko_mapping: this.form.toko_mapping.map((item) => ({
          toko_id: item.toko_id,
          is_default: item.is_default ? 1 : 0,
        })),
      };
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();
      if (!result.valid) return;

      const mappingError = this.validateTokoMapping();
      if (mappingError) {
        if (this.$toast?.error) {
          this.$toast.error(mappingError);
        } else {
          alert(mappingError);
        }
        return;
      }

      const payload = this.buildPayload();

      this.payloadPreview = payload;
      this.dialogPreview = true;

      console.log("Payload update supplier:", payload);

      if (this.$toast?.success) {
        this.$toast.success("Validasi form update berhasil");
      }
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

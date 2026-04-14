<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Tambah Supplier</h1>
        <div class="text-body-2 text-medium-emphasis">
          Tambahkan data supplier dan cabang yang menggunakan supplier ini
        </div>
      </div>

      <v-btn variant="outlined" color="secondary" :to="'/master/supplier'">
        Kembali
      </v-btn>
    </div>

    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Form Master Supplier
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
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
                label="Kode *"
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
                placeholder="Nama PIC / contact person"
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
            <div class="text-subtitle-1 font-weight-bold">
              Cabang / Toko yang Menggunakan Supplier
            </div>

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
            Centang <strong>Default</strong> jika supplier ini menjadi supplier
            utama di cabang tersebut.
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
                <v-col cols="12" md="10">
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
                    :loading="loadingMaster"
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="2" class="d-flex align-center">
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

            <v-btn
              color="success"
              type="submit"
              :loading="loadingSave"
              :disabled="loadingSave"
            >
              Simpan
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddSupplier",
  data() {
    return {
      isValid: false,
      loadingMaster: false,
      loadingSave: false,
      tokoOptions: [],
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

  mounted() {
    this.fetchMasterData();
  },

  methods: {
    async fetchMasterData() {
      this.loadingMaster = true;

      try {
        const res = await axios.get("/api/master/toko/options");
        this.tokoOptions = res.data?.data || [];
      } catch (error) {
        console.error(error);

        if (this.$toast?.error) {
          this.$toast.error("Gagal memuat data toko");
        }
      } finally {
        this.loadingMaster = false;
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
        }
        return;
      }

      this.loadingSave = true;

      try {
        await axios.post("/api/master/supplier", this.buildPayload());

        if (this.$toast?.success) {
          this.$toast.success("Data supplier berhasil disimpan");
        }

        this.$router.push("/master/supplier");
      } catch (error) {
        console.error(error);

        const message =
          error?.response?.data?.message || "Gagal menyimpan data supplier";

        if (this.$toast?.error) {
          this.$toast.error(message);
        }
      } finally {
        this.loadingSave = false;
      }
    },
  },
};
</script>

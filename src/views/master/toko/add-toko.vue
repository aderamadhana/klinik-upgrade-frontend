<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Tambah Toko</h1>
        <div class="text-body-2 text-medium-emphasis">
          Tambahkan data toko baru ke sistem
        </div>
      </div>

      <v-btn variant="outlined" color="secondary" :to="'/master/toko'">
        Kembali
      </v-btn>
    </div>

    <v-card rounded="lg">
      <v-card-title class="text-h6 font-weight-bold">
        Form Master Toko
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-alert type="info" variant="tonal" class="mb-6">
          Isi data utama toko terlebih dahulu. Kolom bertanda
          <strong>*</strong> wajib diisi.
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
                label="Kode *"
                placeholder="Contoh: MLG"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode_toko"
                label="Kode Toko *"
                placeholder="Contoh: TKO001"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.nama"
                label="Nama Toko *"
                placeholder="Masukkan nama toko"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.jenis_toko"
                label="Jenis Toko *"
                placeholder="Pilih jenis toko"
                variant="outlined"
                density="comfortable"
                :items="jenisTokoOptions"
                item-title="label"
                item-value="value"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.no_telepon"
                label="No. Telepon"
                placeholder="Masukkan nomor telepon"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.alamat"
                label="Alamat"
                placeholder="Masukkan alamat lengkap toko"
                variant="outlined"
                density="comfortable"
                rows="3"
                auto-grow
                clearable
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="text-subtitle-1 font-weight-bold mb-3">
            Pengaturan Tambahan
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.token_cdn"
                label="Token CDN"
                placeholder="Opsional"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.sort_order"
                label="Sort Order"
                placeholder="Contoh: 1"
                type="number"
                variant="outlined"
                density="comfortable"
                hint="Semakin kecil angka, semakin atas urutannya"
                persistent-hint
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-end ga-3 mt-6">
            <v-btn variant="outlined" color="secondary" :to="'/master/toko'">
              Batal
            </v-btn>

            <v-btn
              color="success"
              type="submit"
              :loading="loading"
              :disabled="loading"
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
  name: "AddToko",
  data() {
    return {
      isValid: false,
      loading: false,
      form: {
        kode: "",
        kode_toko: "",
        nama: "",
        jenis_toko: null,
        no_telepon: "",
        alamat: "",
        token_cdn: "",
        sort_order: 0,
      },
      jenisTokoOptions: [
        { label: "Klinik", value: "klinik" },
        { label: "Cabang", value: "cabang" },
        { label: "Pusat", value: "pusat" },
        { label: "Gudang", value: "gudang" },
      ],
      rules: {
        required: (v) => !!v || "Wajib diisi",
      },
    };
  },
  methods: {
    async submitForm() {
      const result = await this.$refs.formRef.validate();
      if (!result.valid) return;

      this.loading = true;

      try {
        await axios.post("/api/master/toko", {
          kode: this.form.kode,
          kode_toko: this.form.kode_toko,
          nama: this.form.nama,
          jenis_toko: this.form.jenis_toko,
          no_telepon: this.form.no_telepon,
          alamat: this.form.alamat,
          token_cdn: this.form.token_cdn,
          sort_order: Number(this.form.sort_order || 0),
          is_delete: 0,
        });

        if (this.$toast?.success) {
          this.$toast.success("Data toko berhasil disimpan");
        }

        this.$router.push("/master/toko");
      } catch (error) {
        console.error(error);

        const message =
          error?.response?.data?.message || "Gagal menyimpan data toko";

        if (this.$toast?.error) {
          this.$toast.error(message);
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

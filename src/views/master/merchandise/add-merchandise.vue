<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Tambah Merchandise</h1>
        <div class="text-body-2 text-medium-emphasis">
          Input data master reward / merchandise
        </div>
      </div>

      <v-btn variant="outlined" color="secondary" :to="'/master/merchandise'">
        Kembali
      </v-btn>
    </div>

    <v-card rounded="lg">
      <v-card-title class="text-h6 font-weight-bold">
        Form Master Merchandise
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-alert type="info" variant="tonal" class="mb-6">
          Pilih jenis reward terlebih dahulu. Field diskon akan menyesuaikan
          otomatis.
        </v-alert>

        <v-form
          ref="formRef"
          v-model="isValid"
          validate-on="submit lazy"
          @submit.prevent="submitForm"
        >
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode"
                label="Kode *"
                placeholder="Contoh: MRH001"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.nama"
                label="Nama *"
                placeholder="Masukkan nama reward / merchandise"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.jenis_reward"
                label="Jenis Reward *"
                placeholder="Pilih jenis reward"
                :items="jenisRewardOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col
              v-if="form.jenis_reward === 'diskon_persen'"
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="form.nilai_diskon_persen"
                label="Nilai Diskon Persen *"
                placeholder="Contoh: 10"
                type="number"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.percent]"
              />
            </v-col>

            <v-col
              v-if="form.jenis_reward === 'diskon_nominal'"
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="form.nilai_diskon_nominal"
                label="Nilai Diskon Nominal *"
                placeholder="Contoh: 50000"
                type="number"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.nonNegative]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.harga_poin"
                label="Harga Poin *"
                placeholder="Contoh: 100"
                type="number"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.nonNegative]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.stok"
                label="Stok *"
                placeholder="Contoh: 50"
                type="number"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.nonNegativeInteger]"
              />
            </v-col>

            <v-col cols="12" md="4">
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

            <v-col cols="12">
              <v-textarea
                v-model="form.deskripsi"
                label="Deskripsi"
                placeholder="Masukkan deskripsi reward"
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
              :to="'/master/merchandise'"
            >
              Batal
            </v-btn>

            <v-btn color="success" type="submit"> Simpan </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogPreview" max-width="900">
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Preview Payload</span>

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
  name: "Addmerchandise",
  data() {
    return {
      isValid: false,
      dialogPreview: false,
      payloadPreview: null,

      jenisRewardOptions: [
        { label: "Merchandise", value: "merchandise" },
        { label: "Diskon Persen", value: "diskon_persen" },
        { label: "Diskon Nominal", value: "diskon_nominal" },
      ],

      form: {
        kode: "",
        nama: "",
        jenis_reward: null,
        nilai_diskon_persen: null,
        nilai_diskon_nominal: null,
        harga_poin: 0,
        stok: 0,
        deskripsi: "",
        sort_order: 0,
      },

      rules: {
        required: (v) =>
          (v !== null && v !== undefined && v !== "") || "Wajib diisi",
        nonNegative: (v) =>
          v === null ||
          v === "" ||
          Number(v) >= 0 ||
          "Nilai tidak boleh kurang dari 0",
        nonNegativeInteger: (v) => {
          if (v === null || v === "") return "Wajib diisi";
          const val = Number(v);
          return (
            (Number.isInteger(val) && val >= 0) || "Harus bilangan bulat >= 0"
          );
        },
        percent: (v) => {
          if (v === null || v === "") return "Wajib diisi";
          const val = Number(v);
          return (val >= 0 && val <= 100) || "Persen harus antara 0 sampai 100";
        },
      },
    };
  },

  computed: {
    formattedPayload() {
      return JSON.stringify(this.payloadPreview, null, 2);
    },
  },

  watch: {
    "form.jenis_reward"(val) {
      if (val !== "diskon_persen") {
        this.form.nilai_diskon_persen = null;
      }

      if (val !== "diskon_nominal") {
        this.form.nilai_diskon_nominal = null;
      }
    },
  },

  methods: {
    buildPayload() {
      return {
        kode: this.form.kode,
        nama: this.form.nama,
        jenis_reward: this.form.jenis_reward,
        nilai_diskon_persen:
          this.form.jenis_reward === "diskon_persen"
            ? Number(this.form.nilai_diskon_persen || 0)
            : null,
        nilai_diskon_nominal:
          this.form.jenis_reward === "diskon_nominal"
            ? Number(this.form.nilai_diskon_nominal || 0)
            : null,
        harga_poin: Number(this.form.harga_poin || 0),
        stok: Number(this.form.stok || 0),
        deskripsi: this.form.deskripsi || null,
        sort_order: Number(this.form.sort_order || 0),
        is_delete: 0,
      };
    },

    validateBusinessRule() {
      if (this.form.jenis_reward === "diskon_persen") {
        if (
          this.form.nilai_diskon_persen === null ||
          this.form.nilai_diskon_persen === ""
        ) {
          return "Nilai diskon persen wajib diisi";
        }
      }

      if (this.form.jenis_reward === "diskon_nominal") {
        if (
          this.form.nilai_diskon_nominal === null ||
          this.form.nilai_diskon_nominal === ""
        ) {
          return "Nilai diskon nominal wajib diisi";
        }
      }

      return null;
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();
      if (!result.valid) return;

      const ruleError = this.validateBusinessRule();
      if (ruleError) {
        if (this.$toast?.error) {
          this.$toast.error(ruleError);
        } else {
          alert(ruleError);
        }
        return;
      }

      const payload = this.buildPayload();

      this.payloadPreview = payload;
      this.dialogPreview = true;

      console.log("Payload add merchandise:", payload);

      if (this.$toast?.success) {
        this.$toast.success("Validasi form berhasil");
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

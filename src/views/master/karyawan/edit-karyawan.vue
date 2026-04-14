<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Edit Karyawan</h1>
        <div class="text-body-2 text-medium-emphasis">
          Ubah data master karyawan dan penempatannya
        </div>
      </div>

      <v-btn variant="outlined" color="secondary" :to="'/master/karyawan'">
        Kembali
      </v-btn>
    </div>

    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Form Edit Karyawan
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-skeleton-loader v-if="loadingPage" type="article" />

        <v-form
          v-else
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
                placeholder="Contoh: KRY001"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.jabatan_id"
                label="Jabatan *"
                placeholder="Pilih jabatan"
                :items="jabatanOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :loading="loadingMaster"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.nama"
                label="Nama Karyawan *"
                placeholder="Masukkan nama lengkap"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.gender"
                label="Gender"
                placeholder="Pilih gender"
                :items="genderOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.birthday_date"
                label="Tanggal Lahir"
                type="date"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.no_telp"
                label="No. Telepon"
                placeholder="Masukkan no telepon / WhatsApp"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.nik"
                label="NIK"
                placeholder="Masukkan NIK"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.no_ihs"
                label="No. IHS"
                placeholder="Masukkan nomor IHS"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.no_sip_dok"
                label="No. SIP Dokter"
                placeholder="Masukkan nomor SIP"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.foto_karyawan"
                label="Foto Karyawan"
                placeholder="Path / URL foto"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="form.sort_order"
                label="Sort Order"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="3" class="d-flex align-center">
              <v-switch
                v-model="form.is_dokter_spesialis"
                label="Dokter Spesialis"
                color="success"
                inset
                hide-details
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
          </v-row>

          <v-divider class="my-6" />

          <div
            class="d-flex justify-space-between align-center mb-3 flex-wrap ga-3"
          >
            <div class="text-subtitle-1 font-weight-bold">
              Penempatan Karyawan
            </div>

            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-plus"
              @click="addPenempatan"
            >
              Tambah Penempatan
            </v-btn>
          </div>

          <v-alert type="info" variant="tonal" class="mb-4">
            Minimal harus ada 1 penempatan, dan hanya boleh ada 1 penempatan
            utama.
          </v-alert>

          <v-card
            v-for="(item, index) in form.penempatan"
            :key="index"
            variant="outlined"
            class="mb-4"
          >
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-subtitle-2 font-weight-bold">
                Penempatan {{ index + 1 }}
              </span>

              <v-btn
                v-if="form.penempatan.length > 1"
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="removePenempatan(index)"
              />
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="12" md="5">
                  <v-select
                    v-model="item.toko_id"
                    label="Toko *"
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

                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="item.tanggal_mulai"
                    label="Tanggal Mulai"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="item.tanggal_selesai"
                    label="Tanggal Selesai"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>

                <v-col cols="12" md="1" class="d-flex align-center">
                  <v-checkbox
                    v-model="item.is_primary"
                    label="Utama"
                    color="success"
                    hide-details
                    @update:modelValue="setPrimary(index)"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <div class="d-flex justify-end ga-3 mt-6">
            <v-btn
              variant="outlined"
              color="secondary"
              :to="'/master/karyawan'"
            >
              Batal
            </v-btn>

            <v-btn
              color="success"
              type="submit"
              :loading="loadingSave"
              :disabled="loadingSave"
            >
              Update
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
  name: "EditKaryawan",
  data() {
    return {
      isValid: false,
      loadingPage: false,
      loadingMaster: false,
      loadingSave: false,
      jabatanOptions: [],
      tokoOptions: [],
      genderOptions: [
        { label: "Laki-laki", value: "L" },
        { label: "Perempuan", value: "P" },
      ],
      form: {
        kode: "",
        jabatan_id: null,
        nama: "",
        alamat: "",
        foto_karyawan: "",
        no_telp: "",
        nik: "",
        no_ihs: "",
        gender: null,
        birthday_date: "",
        no_sip_dok: "",
        is_dokter_spesialis: false,
        sort_order: 0,
        penempatan: [
          {
            toko_id: null,
            is_primary: true,
            tanggal_mulai: "",
            tanggal_selesai: "",
          },
        ],
      },
      rules: {
        required: (v) => !!v || "Wajib diisi",
      },
    };
  },

  mounted() {
    this.initPage();
  },

  methods: {
    async initPage() {
      this.loadingPage = true;

      try {
        await Promise.all([this.fetchMasterData(), this.fetchDetail()]);
      } catch (error) {
        console.error(error);

        if (this.$toast?.error) {
          this.$toast.error("Gagal memuat data karyawan");
        }
      } finally {
        this.loadingPage = false;
      }
    },

    async fetchMasterData() {
      this.loadingMaster = true;

      try {
        const [jabatanRes, tokoRes] = await Promise.all([
          axios.get("/api/master/jabatan/options"),
          axios.get("/api/master/toko/options"),
        ]);

        this.jabatanOptions = jabatanRes.data?.data || [];
        this.tokoOptions = tokoRes.data?.data || [];
      } finally {
        this.loadingMaster = false;
      }
    },

    async fetchDetail() {
      const id = this.$route.params.id;
      const res = await axios.get(`/api/master/karyawan/${id}`);
      const data = res.data?.data;

      this.form = {
        kode: data?.kode || "",
        jabatan_id: data?.jabatan_id || null,
        nama: data?.nama || "",
        alamat: data?.alamat || "",
        foto_karyawan: data?.foto_karyawan || "",
        no_telp: data?.no_telp || "",
        nik: data?.nik || "",
        no_ihs: data?.no_ihs || "",
        gender: data?.gender || null,
        birthday_date: data?.birthday_date || "",
        no_sip_dok: data?.no_sip_dok || "",
        is_dokter_spesialis: Number(data?.is_dokter_spesialis || 0) === 1,
        sort_order: Number(data?.sort_order || 0),
        penempatan: (data?.penempatan || []).length
          ? data.penempatan.map((item) => ({
              toko_id: item.toko_id,
              is_primary: Number(item.is_primary || 0) === 1,
              tanggal_mulai: item.tanggal_mulai || "",
              tanggal_selesai: item.tanggal_selesai || "",
            }))
          : [
              {
                toko_id: null,
                is_primary: true,
                tanggal_mulai: "",
                tanggal_selesai: "",
              },
            ],
      };
    },

    addPenempatan() {
      this.form.penempatan.push({
        toko_id: null,
        is_primary: false,
        tanggal_mulai: "",
        tanggal_selesai: "",
      });
    },

    removePenempatan(index) {
      this.form.penempatan.splice(index, 1);

      if (
        !this.form.penempatan.some((item) => item.is_primary) &&
        this.form.penempatan.length
      ) {
        this.form.penempatan[0].is_primary = true;
      }
    },

    setPrimary(index) {
      this.form.penempatan = this.form.penempatan.map((item, i) => ({
        ...item,
        is_primary: i === index,
      }));
    },

    validatePenempatan() {
      if (!this.form.penempatan.length) {
        return "Minimal harus ada 1 penempatan";
      }

      const primaryCount = this.form.penempatan.filter(
        (item) => item.is_primary,
      ).length;
      if (primaryCount !== 1) {
        return "Harus ada tepat 1 penempatan utama";
      }

      const tokoIds = this.form.penempatan
        .map((item) => item.toko_id)
        .filter((id) => id !== null && id !== "");

      if (tokoIds.length !== this.form.penempatan.length) {
        return "Semua penempatan harus memilih toko";
      }

      const uniqueTokoIds = new Set(tokoIds);
      if (uniqueTokoIds.size !== tokoIds.length) {
        return "Toko pada penempatan tidak boleh duplikat";
      }

      for (const item of this.form.penempatan) {
        if (item.tanggal_mulai && item.tanggal_selesai) {
          if (item.tanggal_selesai < item.tanggal_mulai) {
            return "Tanggal selesai tidak boleh lebih kecil dari tanggal mulai";
          }
        }
      }

      return null;
    },

    buildPayload() {
      return {
        kode: this.form.kode,
        jabatan_id: this.form.jabatan_id,
        nama: this.form.nama,
        alamat: this.form.alamat || null,
        foto_karyawan: this.form.foto_karyawan || null,
        no_telp: this.form.no_telp || null,
        nik: this.form.nik || null,
        no_ihs: this.form.no_ihs || null,
        gender: this.form.gender || null,
        birthday_date: this.form.birthday_date || null,
        no_sip_dok: this.form.no_sip_dok || null,
        is_dokter_spesialis: this.form.is_dokter_spesialis ? 1 : 0,
        sort_order: Number(this.form.sort_order || 0),
        penempatan: this.form.penempatan.map((item) => ({
          toko_id: item.toko_id,
          is_primary: item.is_primary ? 1 : 0,
          tanggal_mulai: item.tanggal_mulai || null,
          tanggal_selesai: item.tanggal_selesai || null,
        })),
      };
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();
      if (!result.valid) return;

      const penempatanError = this.validatePenempatan();
      if (penempatanError) {
        if (this.$toast?.error) {
          this.$toast.error(penempatanError);
        }
        return;
      }

      this.loadingSave = true;

      try {
        await axios.put(
          `/api/master/karyawan/${this.$route.params.id}`,
          this.buildPayload(),
        );

        if (this.$toast?.success) {
          this.$toast.success("Data karyawan berhasil diupdate");
        }

        this.$router.push("/master/karyawan");
      } catch (error) {
        console.error(error);

        const message =
          error?.response?.data?.message || "Gagal mengupdate data karyawan";

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

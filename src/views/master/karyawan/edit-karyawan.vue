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
                :loading="loadingKode"
                readonly
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.jabatan_id"
                label="Jabatan *"
                placeholder="Cari / pilih jabatan"
                :items="jabatanOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Jabatan tidak ditemukan"
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
                  <v-autocomplete
                    v-model="item.toko_id"
                    label="Toko *"
                    placeholder="Cari / pilih toko"
                    :items="tokoOptions"
                    item-title="nama"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    :rules="[rules.required]"
                    :loading="loadingMaster"
                    clearable
                    auto-select-first
                    no-data-text="Toko tidak ditemukan"
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
import referenceService from "@/services/referenceService";
import karyawanService from "@/services/master/karyawanService";

export default {
  name: "EditKaryawan",

  data() {
    return {
      isValid: false,
      loadingPage: false,
      loadingMaster: false,
      loadingSave: false,
      loadingKode: false,

      kodeTimer: null,
      isInitializing: true,

      originalKode: "",
      originalKodeSignature: "",
      lastGeneratedSignature: "",

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

  watch: {
    "form.jabatan_id"() {
      this.scheduleGenerateKodeOnEdit();
    },

    "form.penempatan": {
      handler() {
        this.scheduleGenerateKodeOnEdit();
      },
      deep: true,
    },
  },

  mounted() {
    this.initPage();
  },

  beforeUnmount() {
    clearTimeout(this.kodeTimer);
  },

  methods: {
    async initPage() {
      this.loadingPage = true;
      this.isInitializing = true;

      try {
        await Promise.all([this.fetchMasterData(), this.fetchDetail()]);

        this.originalKode = this.form.kode;
        this.originalKodeSignature = this.makeKodeSignature(
          this.form.jabatan_id,
          this.getPrimaryTokoId(),
        );
        this.lastGeneratedSignature = this.originalKodeSignature;
      } catch (error) {
        console.error(error);

        const message =
          error?.response?.data?.message || "Gagal memuat data karyawan";

        if (this.$toast?.error) {
          this.$toast.error(message);
        }
      } finally {
        this.isInitializing = false;
        this.loadingPage = false;
      }
    },

    async fetchMasterData() {
      this.loadingMaster = true;

      try {
        const [jabatanRes, tokoRes] = await Promise.all([
          referenceService.jabatan(),
          referenceService.toko(),
        ]);

        this.jabatanOptions = this.normalizeReference(jabatanRes);
        this.tokoOptions = this.normalizeReference(tokoRes);
      } catch (error) {
        console.error(error);

        const message =
          error?.response?.data?.message || "Gagal memuat data master";

        if (this.$toast?.error) {
          this.$toast.error(message);
        }
      } finally {
        this.loadingMaster = false;
      }
    },

    normalizeReference(response) {
      const rows = response?.data ?? response?.result ?? response ?? [];

      if (!Array.isArray(rows)) return [];

      return rows.map((item) => ({
        id: item.id ?? item.new_id ?? item.value,
        nama:
          item.nama ??
          item.name ??
          item.nama_jabatan ??
          item.nama_toko ??
          item.label ??
          "-",
      }));
    },

    async fetchDetail() {
      const id = this.$route.params.id;

      if (!id) {
        throw new Error("ID karyawan tidak ditemukan di route.");
      }

      const res = await karyawanService.getById(id);
      const data = res?.data ?? res?.result ?? res;

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
        birthday_date: this.formatDateInput(data?.birthday_date),
        no_sip_dok: data?.no_sip_dok || "",
        is_dokter_spesialis: Number(data?.is_dokter_spesialis || 0) === 1,
        sort_order: Number(data?.sort_order || 0),
        penempatan: this.mapPenempatan(data?.penempatan),
      };
    },

    mapPenempatan(penempatan) {
      if (!Array.isArray(penempatan) || !penempatan.length) {
        return [
          {
            toko_id: null,
            is_primary: true,
            tanggal_mulai: "",
            tanggal_selesai: "",
          },
        ];
      }

      return penempatan.map((item) => ({
        toko_id: item.toko_id ?? item.toko?.id ?? null,
        is_primary: Number(item.is_primary || 0) === 1,
        tanggal_mulai: this.formatDateInput(item.tanggal_mulai),
        tanggal_selesai: this.formatDateInput(item.tanggal_selesai),
      }));
    },

    formatDateInput(value) {
      if (!value) return "";

      return String(value).substring(0, 10);
    },

    getPrimaryTokoId() {
      const primary = this.form.penempatan.find((item) => item.is_primary);

      if (primary?.toko_id) {
        return primary.toko_id;
      }

      return this.form.penempatan[0]?.toko_id || null;
    },

    makeKodeSignature(jabatanId, tokoId) {
      return `${jabatanId || ""}|${tokoId || ""}`;
    },

    scheduleGenerateKodeOnEdit() {
      if (this.isInitializing) return;

      clearTimeout(this.kodeTimer);

      this.kodeTimer = setTimeout(() => {
        this.generateKodeKaryawanOnEdit();
      }, 300);
    },

    async generateKodeKaryawanOnEdit() {
      const jabatanId = this.form.jabatan_id;
      const tokoId = this.getPrimaryTokoId();

      if (!jabatanId || !tokoId) {
        return;
      }

      const currentSignature = this.makeKodeSignature(jabatanId, tokoId);

      if (currentSignature === this.originalKodeSignature) {
        this.form.kode = this.originalKode;
        this.lastGeneratedSignature = currentSignature;
        return;
      }

      if (currentSignature === this.lastGeneratedSignature) {
        return;
      }

      this.loadingKode = true;

      try {
        const response = await referenceService.karyawanCode({
          jabatan_id: jabatanId,
          toko_id: tokoId,
          exclude_id: this.$route.params.id,
        });

        const kode =
          response?.data?.kode ?? response?.kode ?? response?.data ?? "";

        if (kode) {
          this.form.kode = kode;
          this.lastGeneratedSignature = currentSignature;
        }
      } catch (error) {
        console.error(error);

        const message =
          error?.response?.data?.message || "Gagal membuat kode karyawan";

        if (this.$toast?.error) {
          this.$toast.error(message);
        }
      } finally {
        this.loadingKode = false;
      }
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

      this.scheduleGenerateKodeOnEdit();
    },

    setPrimary(index) {
      this.form.penempatan = this.form.penempatan.map((item, i) => ({
        ...item,
        is_primary: i === index,
      }));

      this.scheduleGenerateKodeOnEdit();
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
        kode: this.cleanValue(this.form.kode),
        jabatan_id: this.form.jabatan_id,
        nama: this.cleanValue(this.form.nama),
        alamat: this.cleanValue(this.form.alamat),
        foto_karyawan: this.cleanValue(this.form.foto_karyawan),
        no_telp: this.cleanValue(this.form.no_telp),
        nik: this.cleanValue(this.form.nik),
        no_ihs: this.cleanValue(this.form.no_ihs),
        gender: this.form.gender || null,
        birthday_date: this.form.birthday_date || null,
        no_sip_dok: this.cleanValue(this.form.no_sip_dok),
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

      if (!result.valid) return;

      const penempatanError = this.validatePenempatan();

      if (penempatanError) {
        if (this.$toast?.error) {
          this.$toast.error(penempatanError);
        }
        return;
      }

      if (!this.form.kode) {
        await this.generateKodeKaryawanOnEdit();
      }

      if (!this.form.kode) {
        if (this.$toast?.error) {
          this.$toast.error("Kode karyawan belum berhasil dibuat");
        }
        return;
      }

      this.loadingSave = true;

      try {
        const id = this.$route.params.id;

        await karyawanService.update(id, this.buildPayload());

        if (this.$toast?.success) {
          this.$toast.success("Data karyawan berhasil diupdate");
        }

        this.$router.replace("/master/karyawan");
      } catch (error) {
        console.error(error);

        const message = this.getErrorMessage(
          error,
          "Gagal mengupdate data karyawan",
        );

        if (this.$toast?.error) {
          this.$toast.error(message);
        }
      } finally {
        this.loadingSave = false;
      }
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

    filterOption(itemTitle, queryText) {
      const text = String(itemTitle || "").toLowerCase();
      const query = String(queryText || "").toLowerCase();

      return text.includes(query);
    },
  },
};
</script>

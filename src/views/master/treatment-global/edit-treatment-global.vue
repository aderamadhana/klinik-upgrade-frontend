<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Treatment</h1>
        <p class="page-subtitle">
          Ubah data treatment global dan konfigurasi per cabang
        </p>
      </div>

      <v-btn
        variant="outlined"
        color="secondary"
        :to="'/master/treatment-global'"
      >
        Kembali
      </v-btn>
    </div>

    <v-card elevation="1">
      <v-card-title class="text-h6 font-weight-bold">
        Form Edit Master Treatment
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-skeleton-loader v-if="loadingPage" type="article" />

        <v-form
          v-else
          ref="formRef"
          v-model="isValid"
          validate-on="submit lazy"
          @submit.prevent="submitForm"
        >
          <div class="text-subtitle-1 font-weight-bold mb-3">
            Informasi Treatment Global
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode"
                label="Kode Treatment *"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode_accurate"
                label="Kode Accurate"
                placeholder="Kode item Accurate global"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.nama"
                label="Nama Treatment *"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.kategori_sales"
                label="Kategori Sales"
                :items="kategoriSalesOptions"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.unit_id"
                label="Unit"
                :items="unitOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.tipe_id"
                label="Tipe Treatment"
                :items="tipeOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.waktu"
                label="Durasi Treatment"
                suffix="menit"
                type="number"
                variant="outlined"
                density="comfortable"
                :rules="[rules.nonNegativeInteger]"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.sort_order"
                label="Sort Order"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4" class="d-flex align-center">
              <v-switch
                v-model="form.is_ppn"
                label="Kena PPN"
                color="success"
                inset
                hide-details
              />
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div
            class="d-flex justify-space-between align-center mb-3 flex-wrap ga-3"
          >
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Konfigurasi Treatment Per Cabang
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Atur harga, status, dan insentif per cabang melalui tombol Atur.
              </div>
            </div>

            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-plus"
              @click="addTokoConfig"
            >
              Tambah Cabang
            </v-btn>
          </div>

          <v-card variant="outlined">
            <v-data-table
              :headers="tokoConfigHeaders"
              :items="form.toko_configs"
              density="compact"
              item-value="toko_id"
            >
              <template v-slot:item.no="{ index }">
                {{ index + 1 }}
              </template>

              <template v-slot:item.toko_id="{ item }">
                {{ getTokoName(item.toko_id) }}
              </template>

              <template v-slot:item.tarif="{ item }">
                {{ formatRupiah(item.tarif) }}
              </template>

              <template v-slot:item.harga_terendah="{ item }">
                {{ formatRupiah(item.harga_terendah) }}
              </template>

              <template v-slot:item.biaya_modal="{ item }">
                {{ formatRupiah(item.biaya_modal) }}
              </template>

              <template v-slot:item.is_active="{ item }">
                <v-chip
                  size="small"
                  :color="item.is_active ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ item.is_active ? "Aktif" : "Nonaktif" }}
                </v-chip>
              </template>

              <template v-slot:item.action="{ index }">
                <div class="d-flex ga-2">
                  <v-btn
                    color="primary"
                    size="small"
                    prepend-icon="mdi-cog"
                    @click="openTokoConfigDialog(index)"
                  >
                    Atur
                  </v-btn>

                  <v-btn
                    color="error"
                    size="small"
                    prepend-icon="mdi-delete"
                    @click="removeTokoConfig(index)"
                  >
                    Hapus
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>

          <div class="d-flex justify-end ga-3 mt-6">
            <v-btn
              variant="outlined"
              color="secondary"
              :to="'/master/treatment-global'"
            >
              Batal
            </v-btn>

            <v-btn color="success" type="submit"> Update </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogTokoConfig" max-width="1100" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h6 font-weight-bold">Atur Konfigurasi Cabang</div>
            <div class="text-body-2 text-medium-emphasis">
              Isi detail treatment untuk cabang terpilih.
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeTokoConfigDialog"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <div class="text-subtitle-2 font-weight-bold mb-3">
            Cabang & Status
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="configDraft.toko_id"
                label="Cabang *"
                :items="tokoOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="6" class="d-flex align-center">
              <v-switch
                v-model="configDraft.is_active"
                label="Aktif di Cabang"
                color="success"
                inset
                hide-details
              />
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-subtitle-2 font-weight-bold mb-3">Harga</div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.tarif"
                label="Tarif Jual *"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.harga_terendah"
                label="Harga Terendah"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.biaya_modal"
                label="Biaya Modal"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-subtitle-2 font-weight-bold mb-3">
            Insentif Dokter
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="configDraft.insentif_use"
                label="Metode Insentif Dokter"
                :items="insentifOptions"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.tarif_dokter"
                label="Tarif Dokter"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.presentase_tarif_dokter"
                label="% Dokter"
                type="number"
                variant="outlined"
                density="comfortable"
                :disabled="configDraft.insentif_use !== 'Percent'"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.flat_tarif_dokter"
                label="Flat Dokter"
                type="number"
                variant="outlined"
                density="comfortable"
                :disabled="configDraft.insentif_use !== 'Flat'"
              />
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-subtitle-2 font-weight-bold mb-3">
            Insentif Dokter Spesialis
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="configDraft.insentif_use_sp"
                label="Metode Insentif Dokter Spesialis"
                :items="insentifOptions"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.presentase_tarif_dokter_sp"
                label="% Dokter SP"
                type="number"
                variant="outlined"
                density="comfortable"
                :disabled="configDraft.insentif_use_sp !== 'Percent'"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.flat_tarif_dokter_sp"
                label="Flat Dokter SP"
                type="number"
                variant="outlined"
                density="comfortable"
                :disabled="configDraft.insentif_use_sp !== 'Flat'"
              />
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-subtitle-2 font-weight-bold mb-3">
            Insentif Beautician & Pengaturan Lain
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.tarif_beautician"
                label="Tarif Beautician"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.sort_order"
                label="Sort Order Cabang"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="closeTokoConfigDialog"
          >
            Batal
          </v-btn>

          <v-btn color="success" @click="saveTokoConfigDialog">
            Simpan Konfigurasi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogPreview" max-width="900">
      <v-card>
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
  name: "EditMasterTreatment",

  data() {
    return {
      isValid: false,
      loadingPage: false,
      dialogPreview: false,
      payloadPreview: null,

      dialogTokoConfig: false,
      editingConfigIndex: null,
      configDraft: {},

      kategoriSalesOptions: ["LOW", "MEDIUM", "HIGH"],
      insentifOptions: ["Flat", "Percent"],

      unitOptions: [
        { id: 1, nama: "Treatment" },
        { id: 7, nama: "Perawatan" },
      ],

      tipeOptions: [
        { id: 1, nama: "Facial" },
        { id: 2, nama: "Laser" },
        { id: 3, nama: "Injection" },
      ],

      tokoOptions: [
        { id: 1, nama: "Malang" },
        { id: 2, nama: "Surabaya" },
        { id: 3, nama: "Bandung" },
        { id: 4, nama: "Sidoarjo" },
        { id: 5, nama: "Bekasi" },
        { id: 6, nama: "Medan" },
        { id: 7, nama: "Depok" },
        { id: 8, nama: "Yogyakarta" },
        { id: 9, nama: "Jakarta" },
      ],

      tokoConfigHeaders: [
        { title: "NO", key: "no", sortable: false },
        { title: "CABANG", key: "toko_id" },
        { title: "TARIF", key: "tarif" },
        { title: "HARGA TERENDAH", key: "harga_terendah" },
        { title: "BIAYA MODAL", key: "biaya_modal" },
        { title: "STATUS", key: "is_active" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      dummyTreatments: [
        {
          id: 1,
          legacy_id: 1,
          kode: "TR-116",
          kode_accurate: "TR-116",
          nama: "FACIAL BARBIE LIGHT",
          kategori_sales: "LOW",
          unit_id: 7,
          tipe_id: 1,
          waktu: 60,
          is_ppn: 1,
          sort_order: 1,
          toko_configs: [
            {
              toko_id: 1,
              harga_terendah: 125000,
              tarif: 245000,
              biaya_modal: 0,
              tarif_dokter: 0,
              tarif_beautician: 12500,
              presentase_tarif_dokter: 0,
              presentase_tarif_dokter_sp: 0,
              flat_tarif_dokter: 0,
              flat_tarif_dokter_sp: 0,
              insentif_use: "Percent",
              insentif_use_sp: "Flat",
              is_active: 1,
              sort_order: 1,
            },
            {
              toko_id: 2,
              harga_terendah: 135000,
              tarif: 265000,
              biaya_modal: 0,
              tarif_dokter: 0,
              tarif_beautician: 15000,
              presentase_tarif_dokter: 0,
              presentase_tarif_dokter_sp: 0,
              flat_tarif_dokter: 0,
              flat_tarif_dokter_sp: 0,
              insentif_use: "Percent",
              insentif_use_sp: "Flat",
              is_active: 1,
              sort_order: 2,
            },
          ],
        },
      ],

      form: {
        legacy_id: null,
        kode: "",
        kode_accurate: "",
        nama: "",
        kategori_sales: null,
        unit_id: null,
        tipe_id: null,
        waktu: 0,
        is_ppn: false,
        sort_order: 0,
        toko_configs: [],
      },

      rules: {
        required: (v) =>
          (v !== null && v !== undefined && v !== "") || "Wajib diisi",
        nonNegative: (v) =>
          Number(v || 0) >= 0 || "Nilai tidak boleh kurang dari 0",
        nonNegativeInteger: (v) => {
          const val = Number(v || 0);
          return (
            (Number.isInteger(val) && val >= 0) || "Harus bilangan bulat >= 0"
          );
        },
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
        const detail = this.dummyTreatments.find(
          (item) => Number(item.id) === id,
        );

        if (!detail) {
          this.$router.push("/master/treatment-global");
          return;
        }

        this.form = {
          legacy_id: detail.legacy_id,
          kode: detail.kode,
          kode_accurate: detail.kode_accurate || "",
          nama: detail.nama,
          kategori_sales: detail.kategori_sales,
          unit_id: detail.unit_id,
          tipe_id: detail.tipe_id,
          waktu: detail.waktu,
          is_ppn: Number(detail.is_ppn) === 1,
          sort_order: detail.sort_order,
          toko_configs: detail.toko_configs.map((item) => ({
            ...item,
            is_active: Number(item.is_active) === 1,
          })),
        };
      } finally {
        this.loadingPage = false;
      }
    },

    createEmptyTokoConfig() {
      return {
        toko_id: null,
        harga_terendah: 0,
        tarif: 0,
        biaya_modal: 0,
        tarif_dokter: 0,
        tarif_beautician: 0,
        presentase_tarif_dokter: 0,
        presentase_tarif_dokter_sp: 0,
        flat_tarif_dokter: 0,
        flat_tarif_dokter_sp: 0,
        insentif_use: "Flat",
        insentif_use_sp: "Flat",
        is_active: true,
        sort_order: 0,
      };
    },

    getTokoName(tokoId) {
      const toko = this.tokoOptions.find(
        (item) => Number(item.id) === Number(tokoId),
      );

      return toko ? toko.nama : "-";
    },

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    addTokoConfig() {
      this.editingConfigIndex = null;
      this.configDraft = this.createEmptyTokoConfig();
      this.dialogTokoConfig = true;
    },

    openTokoConfigDialog(index) {
      this.editingConfigIndex = index;
      this.configDraft = JSON.parse(
        JSON.stringify(this.form.toko_configs[index]),
      );
      this.dialogTokoConfig = true;
    },

    closeTokoConfigDialog() {
      this.dialogTokoConfig = false;
      this.editingConfigIndex = null;
      this.configDraft = {};
    },

    saveTokoConfigDialog() {
      if (!this.configDraft.toko_id) {
        alert("Cabang wajib dipilih");
        return;
      }

      if (Number(this.configDraft.tarif || 0) < 0) {
        alert("Tarif tidak boleh kurang dari 0");
        return;
      }

      const isDuplicate = this.form.toko_configs.some((item, index) => {
        return (
          index !== this.editingConfigIndex &&
          Number(item.toko_id) === Number(this.configDraft.toko_id)
        );
      });

      if (isDuplicate) {
        alert("Cabang tidak boleh duplikat");
        return;
      }

      const savedData = JSON.parse(JSON.stringify(this.configDraft));

      if (this.editingConfigIndex === null) {
        this.form.toko_configs.push(savedData);
      } else {
        this.form.toko_configs.splice(this.editingConfigIndex, 1, savedData);
      }

      this.closeTokoConfigDialog();
    },

    removeTokoConfig(index) {
      this.form.toko_configs.splice(index, 1);
    },

    validateTokoConfig() {
      if (!this.form.toko_configs.length) {
        return "Minimal harus ada 1 konfigurasi cabang";
      }

      const tokoIds = this.form.toko_configs
        .map((item) => item.toko_id)
        .filter((id) => id !== null && id !== "");

      if (tokoIds.length !== this.form.toko_configs.length) {
        return "Semua konfigurasi cabang harus memilih cabang";
      }

      if (new Set(tokoIds).size !== tokoIds.length) {
        return "Cabang tidak boleh duplikat";
      }

      return null;
    },

    buildPayload() {
      return {
        id: Number(this.$route.params.id),
        legacy_id: this.form.legacy_id,
        kode: this.form.kode,
        kode_accurate: this.form.kode_accurate || null,
        nama: this.form.nama,
        kategori_sales: this.form.kategori_sales,
        unit_id: this.form.unit_id,
        tipe_id: this.form.tipe_id,
        waktu: Number(this.form.waktu || 0),
        is_ppn: this.form.is_ppn ? 1 : 0,
        sort_order: Number(this.form.sort_order || 0),
        toko_configs: this.form.toko_configs.map((item) => ({
          toko_id: item.toko_id,
          harga_terendah: Number(item.harga_terendah || 0),
          tarif: Number(item.tarif || 0),
          biaya_modal: Number(item.biaya_modal || 0),
          tarif_dokter: Number(item.tarif_dokter || 0),
          tarif_beautician: Number(item.tarif_beautician || 0),
          presentase_tarif_dokter: Number(item.presentase_tarif_dokter || 0),
          presentase_tarif_dokter_sp: Number(
            item.presentase_tarif_dokter_sp || 0,
          ),
          flat_tarif_dokter: Number(item.flat_tarif_dokter || 0),
          flat_tarif_dokter_sp: Number(item.flat_tarif_dokter_sp || 0),
          insentif_use: item.insentif_use,
          insentif_use_sp: item.insentif_use_sp,
          is_active: item.is_active ? 1 : 0,
          is_delete: 0,
          sort_order: Number(item.sort_order || 0),
        })),
      };
    },

    async submitForm() {
      const result = await this.$refs.formRef.validate();
      if (!result.valid) return;

      const configError = this.validateTokoConfig();
      if (configError) {
        alert(configError);
        return;
      }

      this.payloadPreview = this.buildPayload();
      this.dialogPreview = true;

      console.log("Payload edit treatment:", this.payloadPreview);
    },
  },
};
</script>

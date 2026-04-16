<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tambah Produk Global</h1>
        <p class="page-subtitle">
          Input data produk global dan konfigurasi produk per cabang
        </p>
      </div>

      <v-btn
        variant="outlined"
        color="secondary"
        :to="'/master/product-global'"
      >
        Kembali
      </v-btn>
    </div>

    <v-card elevation="1">
      <v-card-title class="text-h6 font-weight-bold">
        Form Master Produk Global
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-form
          ref="formRef"
          v-model="isValid"
          validate-on="submit lazy"
          @submit.prevent="submitForm"
        >
          <div class="text-subtitle-1 font-weight-bold mb-3">
            Informasi Produk Global
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode"
                label="Kode Produk *"
                placeholder="Contoh: PRD001"
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
                placeholder="Kode item Accurate"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.nama"
                label="Nama Produk *"
                placeholder="Masukkan nama produk"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.tempat_id"
                label="Tempat"
                :items="tempatOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.satuan_id"
                label="Satuan"
                :items="satuanOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.kategori_produk_id"
                label="Kategori Produk"
                :items="kategoriProdukOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="form.golongan_produk_id"
                label="Golongan Produk"
                :items="golonganProdukOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3" class="d-flex align-center">
              <v-switch
                v-model="form.is_obat_resep"
                label="Obat Resep"
                color="primary"
                inset
                hide-details
              />
            </v-col>

            <v-col cols="12" md="3" class="d-flex align-center">
              <v-switch
                v-model="form.is_obat_bebas"
                label="Obat Bebas"
                color="success"
                inset
                hide-details
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
          </v-row>

          <v-divider class="my-6" />

          <div
            class="d-flex justify-space-between align-center mb-3 flex-wrap ga-3"
          >
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Konfigurasi Produk Per Cabang
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Atur supplier, harga, stok, dan fee per cabang melalui tombol
                Atur.
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

              <template v-slot:item.supplier_id="{ item }">
                {{ getSupplierName(item.supplier_id) }}
              </template>

              <template v-slot:item.harga_jual="{ item }">
                {{ formatRupiah(item.harga_jual) }}
              </template>

              <template v-slot:item.harga_beli="{ item }">
                {{ formatRupiah(item.harga_beli) }}
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

              <template #no-data>
                <div class="text-center py-6 text-medium-emphasis">
                  Belum ada konfigurasi cabang. Klik Tambah Cabang untuk mulai
                  mengisi.
                </div>
              </template>
            </v-data-table>
          </v-card>

          <div class="d-flex justify-end ga-3 mt-6">
            <v-btn
              variant="outlined"
              color="secondary"
              :to="'/master/product-global'"
            >
              Batal
            </v-btn>

            <v-btn color="success" type="submit"> Simpan </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogTokoConfig" max-width="1000" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h6 font-weight-bold">Atur Konfigurasi Cabang</div>
            <div class="text-body-2 text-medium-emphasis">
              Isi detail produk untuk cabang terpilih.
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
            Cabang & Supplier
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

            <v-col cols="12" md="6">
              <v-select
                v-model="configDraft.supplier_id"
                label="Supplier Default"
                :items="supplierOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-subtitle-2 font-weight-bold mb-3">Harga</div>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="configDraft.harga_jual"
                label="Harga Jual *"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="configDraft.harga_beli"
                label="Harga Beli"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-subtitle-2 font-weight-bold mb-3">Stok</div>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="configDraft.stok_awal"
                label="Stok Awal"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="configDraft.stok_minimum"
                label="Stok Minimum"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-subtitle-2 font-weight-bold mb-3">
            Fee & Pengaturan Lain
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.fee_dokter"
                label="Fee Dokter"
                type="number"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.fee_beautician"
                label="Fee Beautician"
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
          Preview Payload
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
  name: "AddProdukGlobal",

  data() {
    return {
      isValid: false,
      dialogPreview: false,
      payloadPreview: null,

      dialogTokoConfig: false,
      editingConfigIndex: null,
      configDraft: {},

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

      supplierOptions: [
        { id: 1, nama: "PT Maju Jaya" },
        { id: 2, nama: "CV Sumber Rejeki" },
        { id: 3, nama: "PT Berkah Abadi" },
      ],

      tempatOptions: [
        { id: 1, nama: "Gudang Klinik" },
        { id: 2, nama: "Apotek" },
        { id: 3, nama: "Display FO" },
      ],

      satuanOptions: [
        { id: 1, nama: "Pcs" },
        { id: 2, nama: "Botol" },
        { id: 3, nama: "Tube" },
        { id: 4, nama: "Box" },
      ],

      kategoriProdukOptions: [
        { id: 1, nama: "Skincare" },
        { id: 2, nama: "Obat" },
        { id: 3, nama: "Bahan Treatment" },
      ],

      golonganProdukOptions: [
        { id: 1, nama: "Basic" },
        { id: 2, nama: "Premium" },
        { id: 3, nama: "Medical" },
      ],

      tokoConfigHeaders: [
        { title: "NO", key: "no", sortable: false },
        { title: "CABANG", key: "toko_id" },
        { title: "SUPPLIER", key: "supplier_id" },
        { title: "HARGA JUAL", key: "harga_jual" },
        { title: "HARGA BELI", key: "harga_beli" },
        { title: "STOK AWAL", key: "stok_awal" },
        { title: "STOK MINIMUM", key: "stok_minimum" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      form: {
        legacy_id: null,
        kode: "",
        kode_accurate: "",
        nama: "",
        tempat_id: null,
        satuan_id: null,
        kategori_produk_id: null,
        golongan_produk_id: null,
        is_obat_resep: false,
        is_obat_bebas: false,
        sort_order: 0,
        toko_configs: [],
      },

      rules: {
        required: (v) =>
          (v !== null && v !== undefined && v !== "") || "Wajib diisi",
      },
    };
  },

  computed: {
    formattedPayload() {
      return JSON.stringify(this.payloadPreview, null, 2);
    },
  },

  methods: {
    createEmptyTokoConfig() {
      return {
        toko_id: null,
        supplier_id: null,
        harga_jual: 0,
        harga_beli: 0,
        stok_awal: 0,
        stok_minimum: 0,
        fee_dokter: 0,
        fee_beautician: 0,
        sort_order: 0,
      };
    },

    getOptionName(options, id) {
      const item = options.find((row) => Number(row.id) === Number(id));
      return item ? item.nama : "-";
    },

    getTokoName(tokoId) {
      return this.getOptionName(this.tokoOptions, tokoId);
    },

    getSupplierName(supplierId) {
      return this.getOptionName(this.supplierOptions, supplierId);
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

      if (Number(this.configDraft.harga_jual || 0) < 0) {
        alert("Harga jual tidak boleh kurang dari 0");
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
        legacy_id: this.form.legacy_id,
        kode: this.form.kode,
        kode_accurate: this.form.kode_accurate || null,
        nama: this.form.nama,
        tempat_id: this.form.tempat_id,
        satuan_id: this.form.satuan_id,
        kategori_produk_id: this.form.kategori_produk_id,
        golongan_produk_id: this.form.golongan_produk_id,
        is_obat_resep: this.form.is_obat_resep ? 1 : 0,
        is_obat_bebas: this.form.is_obat_bebas ? 1 : 0,
        is_delete: 0,
        sort_order: Number(this.form.sort_order || 0),
        toko_configs: this.form.toko_configs.map((item) => ({
          toko_id: item.toko_id,
          supplier_id: item.supplier_id,
          harga_jual: Number(item.harga_jual || 0),
          harga_beli: Number(item.harga_beli || 0),
          stok_awal: Number(item.stok_awal || 0),
          stok_minimum: Number(item.stok_minimum || 0),
          fee_dokter: Number(item.fee_dokter || 0),
          fee_beautician: Number(item.fee_beautician || 0),
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

      console.log("Payload add produk global:", this.payloadPreview);
    },
  },
};
</script>

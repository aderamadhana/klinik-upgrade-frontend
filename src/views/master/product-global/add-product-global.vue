<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tambah Produk Global</h1>
        <p class="page-subtitle">
          Input data produk global dan konfigurasi produk per cabang
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
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
                prepend-inner-icon="mdi-barcode"
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
                prepend-inner-icon="mdi-barcode-scan"
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
                prepend-inner-icon="mdi-package-variant"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="form.tempat_id"
                label="Tempat Produk"
                :items="tempatOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker-outline"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Tempat produk tidak ditemukan"
                :custom-filter="filterOption"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="form.satuan_id"
                label="Satuan"
                :items="satuanOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-scale-balance"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Satuan tidak ditemukan"
                :custom-filter="filterOption"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="form.kategori_produk_id"
                label="Kategori Produk"
                :items="kategoriProdukOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-shape-outline"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Kategori produk tidak ditemukan"
                :custom-filter="filterOption"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="form.golongan_produk_id"
                label="Golongan Produk"
                :items="golonganProdukOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-tag-outline"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Golongan produk tidak ditemukan"
                :custom-filter="filterOption"
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
                prepend-inner-icon="mdi-sort-numeric-ascending"
                hint="Semakin kecil angka, semakin atas urutannya"
                persistent-hint
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
                Atur supplier, harga jual, harga beli, stok, dan fee per cabang.
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
              no-data-text="Belum ada konfigurasi cabang"
            >
              <template #item.no="{ index }">
                {{ index + 1 }}
              </template>

              <template #item.toko_id="{ item }">
                {{ getTokoName(item.toko_id) }}
              </template>

              <template #item.supplier_id="{ item }">
                {{ getSupplierName(item.supplier_id) }}
              </template>

              <template #item.harga_jual="{ item }">
                {{ formatRupiah(item.harga_jual) }}
              </template>

              <template #item.harga_beli="{ item }">
                {{ formatRupiah(item.harga_beli) }}
              </template>

              <template #item.stok_awal="{ item }">
                {{ formatNumber(item.stok_awal) }}
              </template>

              <template #item.stok_minimum="{ item }">
                {{ formatNumber(item.stok_minimum) }}
              </template>

              <template #item.action="{ index }">
                <div class="d-flex ga-2">
                  <v-btn
                    color="primary"
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-cog"
                    @click="openTokoConfigDialog(index)"
                  >
                    Atur
                  </v-btn>

                  <v-btn
                    color="error"
                    size="small"
                    variant="tonal"
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

          <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
            <v-btn
              variant="outlined"
              color="secondary"
              :to="'/master/product-global'"
              :disabled="loadingSave"
            >
              Batal
            </v-btn>

            <v-btn
              color="success"
              variant="flat"
              type="submit"
              prepend-icon="mdi-content-save"
              :loading="loadingSave"
              :disabled="loadingSave"
            >
              Simpan Produk
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogTokoConfig" max-width="1000" persistent>
      <v-card rounded="lg">
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
            :disabled="loadingSave"
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
              <v-autocomplete
                v-model="configDraft.toko_id"
                label="Cabang *"
                :items="tokoOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-store-marker-outline"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Cabang tidak ditemukan"
                :custom-filter="filterOption"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="configDraft.supplier_id"
                label="Supplier Default"
                :items="supplierOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-truck-outline"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Supplier tidak ditemukan"
                :custom-filter="filterOption"
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
                prepend-inner-icon="mdi-cash"
                prefix="Rp"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="configDraft.harga_beli"
                label="Harga Beli"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash-multiple"
                prefix="Rp"
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
                prepend-inner-icon="mdi-package-variant-closed"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="configDraft.stok_minimum"
                label="Stok Minimum"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-alert-circle-outline"
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
                prepend-inner-icon="mdi-stethoscope"
                prefix="Rp"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.fee_beautician"
                label="Fee Beautician"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-heart-outline"
                prefix="Rp"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.sort_order"
                label="Sort Order Cabang"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-sort-numeric-ascending"
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

          <v-btn color="success" variant="flat" @click="saveTokoConfigDialog">
            Simpan Konfigurasi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import produkService from "@/services/master/produkService";
import tokoService from "@/services/master/tokoService";
import supplierService from "@/services/master/supplierService";
import referenceService from "@/services/referenceService";

export default {
  name: "AddProdukGlobal",

  data() {
    return {
      isValid: false,
      loadingMaster: false,
      loadingSave: false,

      dialogTokoConfig: false,
      editingConfigIndex: null,
      configDraft: {},

      breadcrumbs: [
        { title: "Master", disabled: true },
        {
          title: "Produk",
          disabled: false,
          to: "/master/product-global",
        },
        { title: "Tambah Produk", disabled: true },
      ],

      tokoOptions: [],
      supplierOptions: [],
      tempatOptions: [],
      satuanOptions: [],
      kategoriProdukOptions: [],
      golonganProdukOptions: [],

      tokoConfigHeaders: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "CABANG", key: "toko_id" },
        { title: "SUPPLIER", key: "supplier_id" },
        { title: "HARGA JUAL", key: "harga_jual" },
        { title: "HARGA BELI", key: "harga_beli" },
        { title: "STOK AWAL", key: "stok_awal" },
        { title: "STOK MINIMUM", key: "stok_minimum" },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
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

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) => !!String(v ?? "").trim() || "Field ini wajib diisi",
      },
    };
  },

  computed: {
    payload() {
      return this.buildPayload();
    },
  },

  mounted() {
    this.fetchMasterData();
  },

  methods: {
    async fetchMasterData() {
      this.loadingMaster = true;

      try {
        const [
          tokoRes,
          supplierRes,
          tempatRes,
          satuanRes,
          kategoriRes,
          golonganRes,
        ] = await Promise.all([
          tokoService.getOptions(),
          supplierService.getAll({ per_page: 1000 }),
          referenceService.tempatProduk(),
          referenceService.satuan(),
          referenceService.kategoriProduk(),
          referenceService.golonganProduk(),
        ]);

        this.tokoOptions = this.normalizeToko(tokoRes);
        this.supplierOptions = this.normalizeSupplier(supplierRes);
        this.tempatOptions = this.normalizeTempatProduk(tempatRes);
        this.satuanOptions = this.normalizeSatuan(satuanRes);
        this.kategoriProdukOptions = this.normalizeKategoriProduk(kategoriRes);
        this.golonganProdukOptions = this.normalizeGolonganProduk(golonganRes);
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat data referensi"),
          "error",
        );
      } finally {
        this.loadingMaster = false;
      }
    },

    normalizeToko(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.toko_id ?? item.value,
          nama: item.nama_toko ?? item.nama ?? item.name ?? item.label ?? "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeSupplier(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.supplier_id ?? item.suplier_id ?? item.value,
          nama:
            item.nama_supplier ??
            item.nama_suplier ??
            item.nama ??
            item.name ??
            item.label ??
            "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeTempatProduk(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.tempat_id ?? item.value,
          nama:
            item.nama_tempat_produk ??
            item.nama_tempat ??
            item.nama ??
            item.label ??
            item.name ??
            "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeKategoriProduk(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.kategori_produk_id ?? item.value,
          nama:
            item.nama_kategori_produk ??
            item.nama_kategori ??
            item.nama ??
            item.label ??
            item.name ??
            "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeGolonganProduk(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.golongan_produk_id ?? item.value,
          nama:
            item.nama_golongan_produk ??
            item.nama_golongan ??
            item.nama ??
            item.label ??
            item.name ??
            "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeSatuan(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.satuan_id ?? item.value,
          nama: item.nama_satuan ?? item.nama ?? item.label ?? item.name ?? "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    extractRows(response) {
      const source = response?.data ?? response?.result ?? response ?? [];

      if (Array.isArray(source)) return source;
      if (Array.isArray(source.data)) return source.data;
      if (Array.isArray(source.items)) return source.items;

      return [];
    },

    filterOption(itemTitle, queryText, item) {
      const title =
        typeof itemTitle === "string"
          ? itemTitle
          : (item?.raw?.nama ?? item?.raw?.label ?? "");

      const text = String(title || "").toLowerCase();
      const query = String(queryText || "").toLowerCase();

      return text.includes(query);
    },

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
      const error = this.validateConfigDraft();

      if (error) {
        this.showSnackbar(error, "error");
        return;
      }

      const savedData = {
        toko_id: this.configDraft.toko_id,
        supplier_id: this.configDraft.supplier_id || null,
        harga_jual: Number(this.configDraft.harga_jual || 0),
        harga_beli: Number(this.configDraft.harga_beli || 0),
        stok_awal: Number(this.configDraft.stok_awal || 0),
        stok_minimum: Number(this.configDraft.stok_minimum || 0),
        fee_dokter: Number(this.configDraft.fee_dokter || 0),
        fee_beautician: Number(this.configDraft.fee_beautician || 0),
        sort_order: Number(this.configDraft.sort_order || 0),
      };

      if (this.editingConfigIndex === null) {
        this.form.toko_configs.push(savedData);
      } else {
        this.form.toko_configs.splice(this.editingConfigIndex, 1, savedData);
      }

      this.closeTokoConfigDialog();
    },

    validateConfigDraft() {
      if (!this.configDraft.toko_id) {
        return "Cabang wajib dipilih";
      }

      const isDuplicate = this.form.toko_configs.some((item, index) => {
        return (
          index !== this.editingConfigIndex &&
          Number(item.toko_id) === Number(this.configDraft.toko_id)
        );
      });

      if (isDuplicate) {
        return "Cabang tidak boleh duplikat";
      }

      const numericFields = [
        { key: "harga_jual", label: "Harga jual" },
        { key: "harga_beli", label: "Harga beli" },
        { key: "stok_awal", label: "Stok awal" },
        { key: "stok_minimum", label: "Stok minimum" },
        { key: "fee_dokter", label: "Fee dokter" },
        { key: "fee_beautician", label: "Fee beautician" },
      ];

      for (const field of numericFields) {
        if (Number(this.configDraft[field.key] || 0) < 0) {
          return `${field.label} tidak boleh kurang dari 0`;
        }
      }

      return null;
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
        kode: this.cleanValue(this.form.kode),
        kode_accurate: this.cleanValue(this.form.kode_accurate),
        nama: this.cleanValue(this.form.nama),
        tempat_id: this.form.tempat_id,
        satuan_id: this.form.satuan_id,
        kategori_produk_id: this.form.kategori_produk_id,
        golongan_produk_id: this.form.golongan_produk_id,
        is_obat_resep: this.form.is_obat_resep ? 1 : 0,
        is_obat_bebas: this.form.is_obat_bebas ? 1 : 0,
        sort_order: Number(this.form.sort_order || 0),

        toko_mapping: this.form.toko_configs.map((item) => ({
          toko_id: item.toko_id,
          supplier_id: item.supplier_id || null,
          harga_jual: Number(item.harga_jual || 0),
          harga_beli: Number(item.harga_beli || 0),
          stok_awal: Number(item.stok_awal || 0),
          stok_minimum: Number(item.stok_minimum || 0),
          fee_dokter: Number(item.fee_dokter || 0),
          fee_beautician: Number(item.fee_beautician || 0),
          sort_order: Number(item.sort_order || 0),
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

      if (!result.valid) {
        this.showSnackbar("Masih ada field yang belum valid", "error");
        return;
      }

      const configError = this.validateTokoConfig();

      if (configError) {
        this.showSnackbar(configError, "error");
        return;
      }

      this.loadingSave = true;

      try {
        await produkService.create(this.payload);

        this.showSnackbar("Data produk berhasil disimpan", "success");

        this.$router.replace("/master/product-global");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menyimpan data produk"),
          "error",
        );
      } finally {
        this.loadingSave = false;
      }
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

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
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
  },
};
</script>

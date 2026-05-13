<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tambah Treatment</h1>
        <p class="page-subtitle">
          Input data treatment global dan konfigurasi per cabang
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card elevation="1">
      <v-card-title class="text-h6 font-weight-bold">
        Form Master Treatment
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
            Informasi Treatment Global
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.kode"
                label="Kode Treatment *"
                placeholder="Contoh: TR-116"
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
                placeholder="Kode item Accurate global"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-barcode-scan"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.nama"
                label="Nama Treatment *"
                placeholder="Masukkan nama treatment"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-stethoscope"
                :rules="[rules.required]"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.kategori_sales"
                label="Kategori Sales"
                :items="kategoriSalesOptions"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-chart-line"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.unit_id"
                label="Unit Treatment"
                :items="unitOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-view-grid-outline"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Unit treatment tidak ditemukan"
                :custom-filter="filterOption"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="form.tipe_id"
                label="Tipe Treatment"
                :items="tipeOptions"
                item-title="nama"
                item-value="id"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-list-bulleted-type"
                :loading="loadingMaster"
                clearable
                auto-select-first
                no-data-text="Tipe treatment tidak ditemukan"
                :custom-filter="filterOption"
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
                prepend-inner-icon="mdi-clock-outline"
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
                prepend-inner-icon="mdi-sort-numeric-ascending"
                hint="Semakin kecil angka, semakin atas urutannya"
                persistent-hint
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
              hide-default-footer
              no-data-text="Belum ada konfigurasi cabang"
            >
              <template #item.no="{ index }">
                {{ index + 1 }}
              </template>

              <template #item.toko_id="{ item }">
                {{ getTokoName(item.toko_id) }}
              </template>

              <template #item.tarif="{ item }">
                <span class="font-weight-bold">
                  {{ formatRupiah(item.tarif) }}
                </span>
              </template>

              <template #item.harga_terendah="{ item }">
                {{ formatRupiah(item.harga_terendah) }}
              </template>

              <template #item.biaya_modal="{ item }">
                {{ formatRupiah(item.biaya_modal) }}
              </template>

              <template #item.is_active="{ item }">
                <v-chip
                  size="small"
                  :color="item.is_active ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ item.is_active ? "Aktif" : "Nonaktif" }}
                </v-chip>
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
              :to="'/master/treatment-global'"
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
              Simpan Treatment
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogTokoConfig" max-width="1100" persistent>
      <v-card rounded="lg">
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
            :disabled="loadingSave"
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
                prepend-inner-icon="mdi-cash"
                prefix="Rp"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.harga_terendah"
                label="Harga Terendah"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash-minus"
                prefix="Rp"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.biaya_modal"
                label="Biaya Modal"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash-multiple"
                prefix="Rp"
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
                prepend-inner-icon="mdi-account-cash-outline"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.tarif_dokter"
                label="Tarif Dokter"
                type="number"
                variant="outlined"
                density="comfortable"
                prefix="Rp"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.presentase_tarif_dokter"
                label="% Dokter"
                type="number"
                variant="outlined"
                density="comfortable"
                suffix="%"
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
                prefix="Rp"
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
                prepend-inner-icon="mdi-account-star-outline"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="configDraft.presentase_tarif_dokter_sp"
                label="% Dokter SP"
                type="number"
                variant="outlined"
                density="comfortable"
                suffix="%"
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
                prefix="Rp"
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
import treatmentService from "@/services/master/treatmentService";
import referenceService from "@/services/referenceService";

export default {
  name: "AddMasterTreatment",

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
        { title: "Treatment", disabled: false, to: "/master/treatment-global" },
        { title: "Tambah Treatment", disabled: true },
      ],

      kategoriSalesOptions: ["LOW", "MEDIUM", "HIGH"],
      insentifOptions: ["Flat", "Percent"],

      unitOptions: [],
      tipeOptions: [],
      tokoOptions: [],

      tokoConfigHeaders: [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "CABANG", key: "toko_id" },
        { title: "TARIF", key: "tarif" },
        { title: "HARGA TERENDAH", key: "harga_terendah" },
        { title: "BIAYA MODAL", key: "biaya_modal" },
        { title: "STATUS", key: "is_active", sortable: false },
        { title: "ACTION", key: "action", sortable: false, align: "end" },
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

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      rules: {
        required: (v) =>
          (v !== null && v !== undefined && v !== "") || "Wajib diisi",
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
        const [tokoRes, unitRes, tipeRes] = await Promise.all([
          referenceService.toko(),
          referenceService.unitTreatment(),
          referenceService.tipeTreatment(),
        ]);

        this.tokoOptions = this.normalizeToko(tokoRes);
        this.unitOptions = this.normalizeUnitTreatment(unitRes);
        this.tipeOptions = this.normalizeTipeTreatment(tipeRes);
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

    normalizeUnitTreatment(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.unit_id ?? item.value,
          nama:
            item.nama_unit_treatment ??
            item.nama_unit ??
            item.nama ??
            item.name ??
            item.label ??
            "-",
        }))
        .filter((item) => item.id && item.nama);
    },

    normalizeTipeTreatment(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.id ?? item.tipe_id ?? item.value,
          nama:
            item.nama_tipe_treatment ??
            item.nama_tipe ??
            item.nama ??
            item.name ??
            item.label ??
            "-",
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
        harga_terendah: Number(this.configDraft.harga_terendah || 0),
        tarif: Number(this.configDraft.tarif || 0),
        biaya_modal: Number(this.configDraft.biaya_modal || 0),
        tarif_dokter: Number(this.configDraft.tarif_dokter || 0),
        tarif_beautician: Number(this.configDraft.tarif_beautician || 0),
        presentase_tarif_dokter: Number(
          this.configDraft.presentase_tarif_dokter || 0,
        ),
        presentase_tarif_dokter_sp: Number(
          this.configDraft.presentase_tarif_dokter_sp || 0,
        ),
        flat_tarif_dokter: Number(this.configDraft.flat_tarif_dokter || 0),
        flat_tarif_dokter_sp: Number(
          this.configDraft.flat_tarif_dokter_sp || 0,
        ),
        insentif_use: this.configDraft.insentif_use || "Flat",
        insentif_use_sp: this.configDraft.insentif_use_sp || "Flat",
        is_active: !!this.configDraft.is_active,
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
        { key: "harga_terendah", label: "Harga terendah" },
        { key: "tarif", label: "Tarif" },
        { key: "biaya_modal", label: "Biaya modal" },
        { key: "tarif_dokter", label: "Tarif dokter" },
        { key: "tarif_beautician", label: "Tarif beautician" },
        { key: "presentase_tarif_dokter", label: "Persentase dokter" },
        { key: "presentase_tarif_dokter_sp", label: "Persentase dokter SP" },
        { key: "flat_tarif_dokter", label: "Flat dokter" },
        { key: "flat_tarif_dokter_sp", label: "Flat dokter SP" },
      ];

      for (const field of numericFields) {
        const value = Number(this.configDraft[field.key] || 0);

        if (value < 0) {
          return `${field.label} tidak boleh kurang dari 0`;
        }
      }

      if (Number(this.configDraft.presentase_tarif_dokter || 0) > 100) {
        return "Persentase dokter tidak boleh lebih dari 100";
      }

      if (Number(this.configDraft.presentase_tarif_dokter_sp || 0) > 100) {
        return "Persentase dokter SP tidak boleh lebih dari 100";
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
        kategori_sales: this.cleanValue(this.form.kategori_sales),
        unit_id: this.form.unit_id,
        tipe_id: this.form.tipe_id,
        waktu: Number(this.form.waktu || 0),
        is_ppn: this.form.is_ppn ? 1 : 0,
        sort_order: Number(this.form.sort_order || 0),

        toko_mapping: this.form.toko_configs.map((item) => ({
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
          insentif_use: item.insentif_use || "Flat",
          insentif_use_sp: item.insentif_use_sp || "Flat",
          is_active: item.is_active ? 1 : 0,
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
        await treatmentService.create(this.payload);

        this.showSnackbar("Data treatment berhasil disimpan", "success");

        this.$router.replace("/master/treatment-global");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menyimpan data treatment"),
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

    formatRupiah(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
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

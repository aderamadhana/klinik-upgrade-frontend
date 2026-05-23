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
                Tambahkan cabang satu per satu atau samakan konfigurasi dari
                cabang sumber.
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap">
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-store-plus-outline"
                :disabled="loadingMaster || !tokoOptions.length"
                @click="addAllTokoConfig"
              >
                Tambah Semua Cabang
              </v-btn>

              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-plus"
                @click="addTokoConfig"
              >
                Tambah Cabang
              </v-btn>
            </div>
          </div>

          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            Alur cepat: isi satu cabang sebagai patokan, klik
            <strong>Tambah Semua Cabang</strong>, lalu gunakan
            <strong>Samakan ke Cabang Lain</strong>. Setelah itu cabang tertentu
            tetap bisa diubah manual lewat tombol Atur.
          </v-alert>

          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <div
                class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4"
              >
                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    Aksi Cepat Konfigurasi
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Gunakan untuk menyamakan harga dan insentif tanpa input
                    berulang.
                  </div>
                </div>

                <div class="d-flex ga-2 flex-wrap">
                  <v-chip color="primary" variant="tonal" size="small">
                    {{ form.toko_configs.length }} / {{ tokoOptions.length }}
                    cabang
                  </v-chip>

                  <v-chip
                    v-if="missingTokoCount > 0"
                    color="warning"
                    variant="tonal"
                    size="small"
                  >
                    {{ missingTokoCount }} belum dikonfigurasi
                  </v-chip>

                  <v-chip
                    v-else-if="tokoOptions.length"
                    color="success"
                    variant="tonal"
                    size="small"
                  >
                    Semua cabang masuk
                  </v-chip>
                </div>
              </div>

              <v-row>
                <v-col cols="12" md="4">
                  <v-autocomplete
                    v-model="bulkSourceTokoId"
                    label="Cabang Sumber"
                    :items="configuredSourceOptions"
                    item-title="nama"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-source-branch"
                    clearable
                    no-data-text="Belum ada cabang yang bisa dijadikan sumber"
                    :disabled="!configuredSourceOptions.length"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="bulkCloneMode"
                    label="Data yang Disamakan"
                    :items="cloneModeOptions"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-content-copy"
                  />
                </v-col>

                <v-col cols="12" md="4" class="d-flex align-center">
                  <v-btn
                    color="success"
                    variant="flat"
                    block
                    prepend-icon="mdi-content-duplicate"
                    :disabled="
                      !bulkSourceTokoId || form.toko_configs.length < 2
                    "
                    @click="bulkApplyFromSource"
                  >
                    Samakan ke Cabang Lain
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

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
                <div class="font-weight-medium">
                  {{ getTokoName(item.toko_id) }}
                </div>
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
                <div class="d-flex ga-2 justify-end">
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
                  Belum ada konfigurasi cabang. Klik Tambah Cabang atau Tambah
                  Semua Cabang untuk mulai mengisi.
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

    <v-dialog v-model="dialogTokoConfig" max-width="1280" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h6 font-weight-bold">Atur Konfigurasi Cabang</div>
            <div class="text-body-2 text-medium-emphasis">
              Isi manual atau salin konfigurasi dari cabang lain.
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

        <v-card-text class="config-modal-body">
          <v-card variant="outlined" class="mb-4">
            <v-card-text class="py-3">
              <div class="text-subtitle-2 font-weight-bold mb-3">
                Salin dari Cabang Lain
              </div>

              <v-row dense>
                <v-col cols="12" md="5">
                  <v-autocomplete
                    v-model="dialogCopySourceTokoId"
                    label="Cabang Sumber"
                    :items="dialogSourceOptions"
                    item-title="nama"
                    item-value="id"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-source-branch"
                    clearable
                    hide-details
                    no-data-text="Belum ada cabang sumber"
                    :disabled="!dialogSourceOptions.length"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="dialogCloneMode"
                    label="Data yang Disalin"
                    :items="cloneModeOptions"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-content-copy"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-btn
                    color="success"
                    variant="flat"
                    block
                    prepend-icon="mdi-content-duplicate"
                    :disabled="!dialogCopySourceTokoId"
                    @click="copySourceToDraft"
                  >
                    Terapkan
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-row dense>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="py-3">
                  <div class="text-subtitle-2 font-weight-bold mb-3">
                    Cabang & Harga
                  </div>

                  <v-row dense>
                    <v-col cols="12" md="8">
                      <v-autocomplete
                        v-model="configDraft.toko_id"
                        label="Cabang *"
                        :items="selectableTokoOptions"
                        item-title="nama"
                        item-value="id"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-store-marker-outline"
                        :loading="loadingMaster"
                        clearable
                        hide-details
                        auto-select-first
                        no-data-text="Cabang tidak ditemukan atau sudah dikonfigurasi"
                        :custom-filter="filterOption"
                      />
                    </v-col>

                    <v-col cols="12" md="4" class="d-flex align-center">
                      <v-switch
                        v-model="configDraft.is_active"
                        label="Aktif"
                        color="success"
                        inset
                        hide-details
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="configDraft.tarif"
                        label="Tarif Jual *"
                        type="number"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-cash"
                        prefix="Rp"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="configDraft.harga_terendah"
                        label="Harga Terendah"
                        type="number"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-cash-minus"
                        prefix="Rp"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="configDraft.biaya_modal"
                        label="Biaya Modal"
                        type="number"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-cash-multiple"
                        prefix="Rp"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="configDraft.tarif_beautician"
                        label="Tarif Beautician"
                        type="number"
                        variant="outlined"
                        density="compact"
                        prefix="Rp"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="configDraft.sort_order"
                        label="Sort Order Cabang"
                        type="number"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-sort-numeric-ascending"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="py-3">
                  <div class="text-subtitle-2 font-weight-bold mb-3">
                    Insentif
                  </div>

                  <v-row dense>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="configDraft.insentif_use"
                        label="Metode Dokter"
                        :items="insentifOptions"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-account-cash-outline"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="configDraft.tarif_dokter"
                        label="Tarif Dokter"
                        type="number"
                        variant="outlined"
                        density="compact"
                        prefix="Rp"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="configDraft.presentase_tarif_dokter"
                        label="% Dokter"
                        type="number"
                        variant="outlined"
                        density="compact"
                        suffix="%"
                        hide-details
                        :disabled="configDraft.insentif_use !== 'Percent'"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="configDraft.flat_tarif_dokter"
                        label="Flat Dokter"
                        type="number"
                        variant="outlined"
                        density="compact"
                        prefix="Rp"
                        hide-details
                        :disabled="configDraft.insentif_use !== 'Flat'"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="configDraft.insentif_use_sp"
                        label="Metode Dokter SP"
                        :items="insentifOptions"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-account-star-outline"
                        hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="configDraft.presentase_tarif_dokter_sp"
                        label="% Dokter SP"
                        type="number"
                        variant="outlined"
                        density="compact"
                        suffix="%"
                        hide-details
                        :disabled="configDraft.insentif_use_sp !== 'Percent'"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="configDraft.flat_tarif_dokter_sp"
                        label="Flat Dokter SP"
                        type="number"
                        variant="outlined"
                        density="compact"
                        prefix="Rp"
                        hide-details
                        :disabled="configDraft.insentif_use_sp !== 'Flat'"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
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

      bulkSourceTokoId: null,
      bulkCloneMode: "price",

      dialogCopySourceTokoId: null,
      dialogCloneMode: "price",

      breadcrumbs: [
        { title: "Master", disabled: true },
        { title: "Treatment", disabled: false, to: "/master/treatment-global" },
        { title: "Tambah Treatment", disabled: true },
      ],

      kategoriSalesOptions: ["LOW", "MEDIUM", "HIGH"],
      insentifOptions: ["Flat", "Percent"],

      cloneModeOptions: [
        { title: "Hanya harga", value: "price" },
        { title: "Harga + insentif", value: "price_incentive" },
        { title: "Harga + insentif + sort order", value: "full_config" },
      ],

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

    missingTokoCount() {
      if (!this.tokoOptions.length) return 0;

      const configuredIds = new Set(
        this.form.toko_configs
          .map((item) => Number(item.toko_id))
          .filter((id) => !!id),
      );

      return this.tokoOptions.filter(
        (item) => !configuredIds.has(Number(item.id)),
      ).length;
    },

    configuredSourceOptions() {
      return this.form.toko_configs
        .filter((item) => item.toko_id)
        .map((item) => ({
          id: item.toko_id,
          nama: `${this.getTokoName(item.toko_id)} - ${this.formatRupiah(
            item.tarif,
          )}`,
        }));
    },

    dialogSourceOptions() {
      const currentTokoId = this.configDraft?.toko_id;

      return this.form.toko_configs
        .filter((item, index) => {
          if (!item.toko_id) return false;
          if (index === this.editingConfigIndex) return false;

          if (currentTokoId && Number(item.toko_id) === Number(currentTokoId)) {
            return false;
          }

          return true;
        })
        .map((item) => ({
          id: item.toko_id,
          nama: `${this.getTokoName(item.toko_id)} - ${this.formatRupiah(
            item.tarif,
          )}`,
        }));
    },

    selectableTokoOptions() {
      const usedIds = new Set(
        this.form.toko_configs
          .filter((item, index) => index !== this.editingConfigIndex)
          .map((item) => Number(item.toko_id))
          .filter((id) => !!id),
      );

      return this.tokoOptions.filter((item) => !usedIds.has(Number(item.id)));
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

    createEmptyTokoConfig(tokoId = null) {
      return {
        toko_id: tokoId,
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
      this.dialogCopySourceTokoId = null;
      this.dialogCloneMode = "price";
      this.dialogTokoConfig = true;
    },

    addAllTokoConfig() {
      if (!this.tokoOptions.length) {
        this.showSnackbar("Data cabang belum tersedia", "error");
        return;
      }

      const configuredIds = new Set(
        this.form.toko_configs
          .map((item) => Number(item.toko_id))
          .filter((id) => !!id),
      );

      const newConfigs = this.tokoOptions
        .filter((toko) => !configuredIds.has(Number(toko.id)))
        .map((toko) => this.createEmptyTokoConfig(toko.id));

      if (!newConfigs.length) {
        this.showSnackbar("Semua cabang sudah masuk konfigurasi", "info");
        return;
      }

      this.form.toko_configs.push(...newConfigs);

      this.showSnackbar(
        `${newConfigs.length} cabang berhasil ditambahkan`,
        "success",
      );
    },

    openTokoConfigDialog(index) {
      this.editingConfigIndex = index;
      this.configDraft = JSON.parse(
        JSON.stringify(this.form.toko_configs[index]),
      );
      this.dialogCopySourceTokoId = null;
      this.dialogCloneMode = "price";
      this.dialogTokoConfig = true;
    },

    closeTokoConfigDialog() {
      this.dialogTokoConfig = false;
      this.editingConfigIndex = null;
      this.configDraft = {};
      this.dialogCopySourceTokoId = null;
      this.dialogCloneMode = "price";
    },

    copySourceToDraft() {
      if (!this.dialogCopySourceTokoId) {
        this.showSnackbar("Pilih cabang sumber terlebih dahulu", "error");
        return;
      }

      const source = this.findConfigByTokoId(this.dialogCopySourceTokoId);

      if (!source) {
        this.showSnackbar("Konfigurasi cabang sumber tidak ditemukan", "error");
        return;
      }

      const currentTokoId = this.configDraft.toko_id;
      const currentStatus = this.configDraft.is_active;

      this.configDraft = this.applyCloneFields(
        this.configDraft,
        source,
        this.dialogCloneMode,
      );

      this.configDraft.toko_id = currentTokoId;
      this.configDraft.is_active = currentStatus;

      this.showSnackbar("Konfigurasi berhasil disalin", "success");
    },

    bulkApplyFromSource() {
      if (!this.bulkSourceTokoId) {
        this.showSnackbar("Pilih cabang sumber terlebih dahulu", "error");
        return;
      }

      const source = this.findConfigByTokoId(this.bulkSourceTokoId);

      if (!source) {
        this.showSnackbar("Konfigurasi cabang sumber tidak ditemukan", "error");
        return;
      }

      let updatedCount = 0;

      this.form.toko_configs = this.form.toko_configs.map((item) => {
        if (Number(item.toko_id) === Number(source.toko_id)) {
          return item;
        }

        updatedCount += 1;

        const currentStatus = item.is_active;

        const updatedItem = this.applyCloneFields(
          item,
          source,
          this.bulkCloneMode,
        );

        updatedItem.toko_id = item.toko_id;
        updatedItem.is_active = currentStatus;

        return updatedItem;
      });

      if (!updatedCount) {
        this.showSnackbar("Tidak ada cabang lain untuk disamakan", "info");
        return;
      }

      this.showSnackbar(
        `${updatedCount} cabang berhasil disamakan dari ${this.getTokoName(
          source.toko_id,
        )}`,
        "success",
      );
    },

    applyCloneFields(target, source, mode = "price") {
      const result = {
        ...target,
        harga_terendah: Number(source.harga_terendah || 0),
        tarif: Number(source.tarif || 0),
        biaya_modal: Number(source.biaya_modal || 0),
      };

      if (mode === "price_incentive" || mode === "full_config") {
        result.tarif_dokter = Number(source.tarif_dokter || 0);
        result.tarif_beautician = Number(source.tarif_beautician || 0);
        result.presentase_tarif_dokter = Number(
          source.presentase_tarif_dokter || 0,
        );
        result.presentase_tarif_dokter_sp = Number(
          source.presentase_tarif_dokter_sp || 0,
        );
        result.flat_tarif_dokter = Number(source.flat_tarif_dokter || 0);
        result.flat_tarif_dokter_sp = Number(source.flat_tarif_dokter_sp || 0);
        result.insentif_use = source.insentif_use || "Flat";
        result.insentif_use_sp = source.insentif_use_sp || "Flat";
      }

      if (mode === "full_config") {
        result.sort_order = Number(source.sort_order || 0);
      }

      return result;
    },

    findConfigByTokoId(tokoId) {
      return this.form.toko_configs.find(
        (item) => Number(item.toko_id) === Number(tokoId),
      );
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
      const removed = this.form.toko_configs[index];

      this.form.toko_configs.splice(index, 1);

      if (
        removed &&
        this.bulkSourceTokoId &&
        Number(removed.toko_id) === Number(this.bulkSourceTokoId)
      ) {
        this.bulkSourceTokoId = null;
      }
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

      if (new Set(tokoIds.map((id) => Number(id))).size !== tokoIds.length) {
        return "Cabang tidak boleh duplikat";
      }

      return null;
    },

    buildPayload() {
      return {
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
<style scoped>
.config-modal-body {
  overflow: visible;
}

.h-100 {
  height: 100%;
}
</style>

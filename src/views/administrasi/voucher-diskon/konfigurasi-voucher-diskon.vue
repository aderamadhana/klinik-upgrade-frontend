<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ currentVoucher.nama }}</h1>
        <p class="page-subtitle">
          Konfigurasi item voucher diskon berdasarkan jenis voucher
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-skeleton-loader v-if="loadingPage" type="article" />

    <template v-else>
      <!-- INFO COMPACT -->
      <v-alert type="info" variant="tonal" density="compact" class="mb-3">
        Item menyesuaikan jenis voucher:
        <strong>Treatment</strong>, <strong>Produk</strong>,
        <strong>Bundling</strong>, atau <strong>Value</strong>.
        <span v-if="isVoucherBundling">
          Diskon bundling dapat diatur per item.
        </span>
        <span v-else>
          Diskon item disembunyikan karena mengikuti nilai voucher utama.
        </span>
      </v-alert>

      <!-- RINGKASAN VOUCHER COMPACT -->
      <v-card variant="flat" class="border mb-3">
        <v-card-text class="pa-4">
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
          >
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="tonal" size="36">
                <v-icon icon="mdi-ticket-percent-outline" size="20" />
              </v-avatar>

              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  Ringkasan Voucher
                </div>
                <div class="text-caption text-medium-emphasis">
                  Nilai voucher dan jumlah item yang berlaku
                </div>
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap">
              <v-chip size="small" color="primary" variant="tonal">
                {{ currentVoucher.mode_label }}
              </v-chip>

              <v-chip size="small" color="purple" variant="tonal">
                {{ currentVoucher.jenis_voucher_label }}
              </v-chip>

              <v-chip
                size="small"
                :color="currentVoucher.is_all_toko ? 'success' : 'warning'"
                variant="tonal"
              >
                {{ currentVoucher.berlaku_label }}
              </v-chip>
            </div>
          </div>

          <v-row dense>
            <v-col cols="12" sm="6" md="3">
              <div class="pa-3 border rounded">
                <div class="text-caption text-medium-emphasis mb-1">
                  Nama Voucher
                </div>
                <div class="text-body-2 font-weight-bold text-truncate">
                  {{ currentVoucher.nama || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="pa-3 border rounded">
                <div class="text-caption text-medium-emphasis mb-1">
                  Nilai Voucher
                </div>
                <div class="text-body-2 font-weight-bold text-success">
                  {{
                    formatDiscountValue(
                      currentVoucher.nilai_voucher,
                      currentVoucher.tipe_diskon,
                    )
                  }}
                </div>
              </div>
            </v-col>

            <v-col v-if="isVoucherBundling" cols="12" sm="6" md="3">
              <div class="pa-3 border rounded">
                <div class="text-caption text-medium-emphasis mb-1">
                  Teralokasi
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{
                    formatDiscountValue(
                      totalAllocatedDiscount,
                      currentVoucher.tipe_diskon,
                    )
                  }}
                </div>
              </div>
            </v-col>

            <v-col v-if="isVoucherBundling" cols="12" sm="6" md="3">
              <div class="pa-3 border rounded">
                <div class="text-caption text-medium-emphasis mb-1">
                  Sisa Alokasi
                </div>
                <div
                  class="text-body-2 font-weight-bold"
                  :class="remainingDiscount < 0 ? 'text-error' : 'text-success'"
                >
                  {{
                    formatDiscountValue(
                      remainingDiscount,
                      currentVoucher.tipe_diskon,
                    )
                  }}
                </div>
              </div>
            </v-col>

            <v-col v-if="!isVoucherBundling" cols="12" sm="6" md="3">
              <div class="pa-3 border rounded">
                <div class="text-caption text-medium-emphasis mb-1">
                  Treatment Terpilih
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ configuredTreatments.length }}
                </div>
              </div>
            </v-col>

            <v-col v-if="!isVoucherBundling" cols="12" sm="6" md="3">
              <div class="pa-3 border rounded">
                <div class="text-caption text-medium-emphasis mb-1">
                  Produk Terpilih
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ configuredProducts.length }}
                </div>
              </div>
            </v-col>
          </v-row>

          <div v-if="isVoucherBundling" class="mt-4">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption text-medium-emphasis">
                Progress alokasi diskon bundling
              </span>
              <span class="text-caption font-weight-bold">
                {{ allocationPercentage }}%
              </span>
            </div>

            <v-progress-linear
              :model-value="allocationPercentageSafe"
              height="8"
              rounded
              :color="remainingDiscount < 0 ? 'error' : 'primary'"
              bg-color="grey-lighten-3"
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- PICKER ITEM -->
      <v-row dense class="mb-3">
        <!-- TREATMENT PICKER -->
        <v-col
          v-if="showTreatmentSection"
          cols="12"
          :md="showProductSection ? 6 : 12"
        >
          <v-card variant="flat" class="border h-100">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="primary" variant="tonal" size="34">
                    <v-icon icon="mdi-stethoscope" size="18" />
                  </v-avatar>

                  <div>
                    <div class="text-subtitle-2 font-weight-bold">
                      Treatment
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ filteredTreatmentOptions.length }} item tersedia
                    </div>
                  </div>
                </div>

                <v-chip size="small" color="primary" variant="tonal">
                  {{ selectedTreatmentIds.length }} dipilih
                </v-chip>
              </div>

              <v-row dense align="center" class="mb-2">
                <v-col cols="12" md="7">
                  <v-text-field
                    v-model="treatmentSearch"
                    placeholder="Cari treatment..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="5">
                  <v-checkbox
                    v-model="selectAllTreatments"
                    label="Pilih semua hasil"
                    hide-details
                    density="compact"
                    color="primary"
                    @update:model-value="toggleSelectAllTreatments"
                  />
                </v-col>
              </v-row>

              <v-sheet height="280" class="overflow-y-auto border rounded">
                <v-list density="compact" class="py-0">
                  <template
                    v-for="item in filteredTreatmentOptions"
                    :key="'treatment-' + item.id"
                  >
                    <v-list-item
                      :active="selectedTreatmentIds.includes(item.id)"
                      color="primary"
                      @click="toggleTreatmentSelection(item.id)"
                    >
                      <template #prepend>
                        <v-checkbox
                          :model-value="selectedTreatmentIds.includes(item.id)"
                          hide-details
                          density="compact"
                          color="primary"
                          @click.stop
                          @update:model-value="
                            toggleTreatmentSelection(item.id)
                          "
                        />
                      </template>

                      <v-list-item-title class="text-body-2 font-weight-medium">
                        {{ item.nama }}
                      </v-list-item-title>

                      <v-list-item-subtitle class="text-caption">
                        {{ formatCurrency(item.tarif_umum) }}
                        <span v-if="item.nama_unit_treatment">
                          • {{ item.nama_unit_treatment }}
                        </span>
                      </v-list-item-subtitle>

                      <template #append>
                        <v-chip size="x-small" variant="outlined">
                          Treatment
                        </v-chip>
                      </template>
                    </v-list-item>

                    <v-divider />
                  </template>

                  <v-list-item v-if="!filteredTreatmentOptions.length">
                    <v-list-item-title class="text-body-2 text-medium-emphasis">
                      Treatment tidak ditemukan
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-sheet>

              <div class="d-flex justify-end mt-3">
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  :disabled="loadingItems"
                  @click="addSelectedTreatments"
                >
                  Tambahkan
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- PRODUCT PICKER -->
        <v-col
          v-if="showProductSection"
          cols="12"
          :md="showTreatmentSection ? 6 : 12"
        >
          <v-card variant="flat" class="border h-100">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="success" variant="tonal" size="34">
                    <v-icon icon="mdi-pill" size="18" />
                  </v-avatar>

                  <div>
                    <div class="text-subtitle-2 font-weight-bold">Produk</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ filteredProductOptions.length }} item tersedia
                    </div>
                  </div>
                </div>

                <v-chip size="small" color="success" variant="tonal">
                  {{ selectedProductIds.length }} dipilih
                </v-chip>
              </div>

              <v-row dense align="center" class="mb-2">
                <v-col cols="12" md="7">
                  <v-text-field
                    v-model="productSearch"
                    placeholder="Cari produk..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>

                <v-col cols="12" md="5">
                  <v-checkbox
                    v-model="selectAllProducts"
                    label="Pilih semua hasil"
                    hide-details
                    density="compact"
                    color="primary"
                    @update:model-value="toggleSelectAllProducts"
                  />
                </v-col>
              </v-row>

              <v-sheet height="280" class="overflow-y-auto border rounded">
                <v-list density="compact" class="py-0">
                  <template
                    v-for="item in filteredProductOptions"
                    :key="'product-' + item.id"
                  >
                    <v-list-item
                      :active="selectedProductIds.includes(item.id)"
                      color="success"
                      @click="toggleProductSelection(item.id)"
                    >
                      <template #prepend>
                        <v-checkbox
                          :model-value="selectedProductIds.includes(item.id)"
                          hide-details
                          density="compact"
                          color="success"
                          @click.stop
                          @update:model-value="toggleProductSelection(item.id)"
                        />
                      </template>

                      <v-list-item-title class="text-body-2 font-weight-medium">
                        {{ item.nama }}
                      </v-list-item-title>

                      <v-list-item-subtitle class="text-caption">
                        {{ formatCurrency(item.harga_jual) }}
                        <span v-if="item.nama_satuan">
                          • {{ item.nama_satuan }}
                        </span>
                      </v-list-item-subtitle>

                      <template #append>
                        <div class="d-flex ga-1 flex-wrap justify-end">
                          <v-chip
                            size="x-small"
                            variant="tonal"
                            :color="getStockColor(item.status_stok)"
                          >
                            {{ item.status_stok || "TERSEDIA" }}
                          </v-chip>

                          <v-chip size="x-small" variant="outlined">
                            Produk
                          </v-chip>
                        </div>
                      </template>
                    </v-list-item>

                    <v-divider />
                  </template>

                  <v-list-item v-if="!filteredProductOptions.length">
                    <v-list-item-title class="text-body-2 text-medium-emphasis">
                      Produk tidak ditemukan
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-sheet>

              <div class="d-flex justify-end mt-3">
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  :disabled="loadingItems"
                  @click="addSelectedProducts"
                >
                  Tambahkan
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ITEM TERPILIH -->
      <v-card variant="flat" class="border">
        <v-card-text class="pa-4">
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-3 mb-3"
          >
            <div class="d-flex align-center ga-3">
              <v-avatar color="warning" variant="tonal" size="34">
                <v-icon icon="mdi-clipboard-list-outline" size="18" />
              </v-avatar>

              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  Item Voucher Terpilih
                </div>
                <div class="text-caption text-medium-emphasis">
                  <span v-if="isVoucherBundling">
                    Atur diskon bundling atau hapus item
                  </span>
                  <span v-else>
                    Review item yang berlaku untuk voucher ini
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap">
              <v-chip
                v-if="showTreatmentSection"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ configuredTreatments.length }} Treatment
              </v-chip>

              <v-chip
                v-if="showProductSection"
                size="small"
                color="success"
                variant="tonal"
              >
                {{ configuredProducts.length }} Produk
              </v-chip>
            </div>
          </div>

          <v-alert
            v-if="!isVoucherBundling"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            Kolom diskon item hanya tersedia untuk voucher Bundling.
          </v-alert>

          <v-tabs
            v-model="activeTab"
            color="primary"
            density="compact"
            class="mb-3"
          >
            <v-tab v-if="showTreatmentSection" value="treatments">
              Treatment
            </v-tab>

            <v-tab v-if="showProductSection" value="products"> Produk </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- TABLE TREATMENT -->
            <v-window-item v-if="showTreatmentSection" value="treatments">
              <v-data-table
                :headers="treatmentTableHeaders"
                :items="configuredTreatments"
                item-value="id"
                density="compact"
                hide-default-footer
                class="border"
              >
                <template #item.no="{ index }">
                  {{ index + 1 }}
                </template>

                <template #item.tarif_umum="{ item }">
                  {{ formatCurrency(item.tarif_umum) }}
                </template>

                <template #item.diskon_item="{ item, index }">
                  <div class="d-flex align-center ga-2">
                    <v-chip size="small" color="primary" variant="tonal">
                      {{
                        formatDiscountValue(
                          item.diskon_item,
                          item.tipe_diskon_item,
                        )
                      }}
                    </v-chip>

                    <v-btn
                      size="small"
                      color="primary"
                      variant="tonal"
                      prepend-icon="mdi-pencil"
                      @click="openDiscountDialog('treatment', item, index)"
                    >
                      Atur
                    </v-btn>
                  </div>
                </template>

                <template #item.action="{ index }">
                  <v-btn
                    size="small"
                    color="error"
                    variant="tonal"
                    prepend-icon="mdi-delete-outline"
                    @click="removeConfiguredItem('treatment', index)"
                  >
                    Hapus
                  </v-btn>
                </template>

                <template #no-data>
                  <div
                    class="text-center py-4 text-body-2 text-medium-emphasis"
                  >
                    Belum ada treatment yang ditambahkan
                  </div>
                </template>
              </v-data-table>
            </v-window-item>

            <!-- TABLE PRODUCT -->
            <v-window-item v-if="showProductSection" value="products">
              <v-data-table
                :headers="productTableHeaders"
                :items="configuredProducts"
                item-value="id"
                density="compact"
                hide-default-footer
                class="border"
              >
                <template #item.no="{ index }">
                  {{ index + 1 }}
                </template>

                <template #item.harga_jual="{ item }">
                  {{ formatCurrency(item.harga_jual) }}
                </template>

                <template #item.status_stok="{ item }">
                  <v-chip
                    size="small"
                    variant="tonal"
                    :color="getStockColor(item.status_stok)"
                  >
                    {{ item.status_stok || "TERSEDIA" }}
                  </v-chip>
                </template>

                <template #item.diskon_item="{ item, index }">
                  <div class="d-flex align-center ga-2">
                    <v-chip size="small" color="primary" variant="tonal">
                      {{
                        formatDiscountValue(
                          item.diskon_item,
                          item.tipe_diskon_item,
                        )
                      }}
                    </v-chip>

                    <v-btn
                      size="small"
                      color="primary"
                      variant="tonal"
                      prepend-icon="mdi-pencil"
                      @click="openDiscountDialog('product', item, index)"
                    >
                      Atur
                    </v-btn>
                  </div>
                </template>

                <template #item.action="{ index }">
                  <v-btn
                    size="small"
                    color="error"
                    variant="tonal"
                    prepend-icon="mdi-delete-outline"
                    @click="removeConfiguredItem('product', index)"
                  >
                    Hapus
                  </v-btn>
                </template>

                <template #no-data>
                  <div
                    class="text-center py-4 text-body-2 text-medium-emphasis"
                  >
                    Belum ada produk yang ditambahkan
                  </div>
                </template>
              </v-data-table>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>

      <!-- ACTION -->
      <div class="d-flex flex-column flex-md-row justify-end ga-2 mt-4">
        <v-btn
          color="secondary"
          variant="outlined"
          :to="'/administrasi/voucher-diskon'"
          :disabled="loadingSave"
        >
          Kembali
        </v-btn>

        <v-btn
          color="success"
          variant="flat"
          prepend-icon="mdi-content-save"
          :loading="loadingSave"
          :disabled="loadingSave"
          @click="saveConfiguration"
        >
          Simpan Konfigurasi
        </v-btn>
      </div>
    </template>

    <!-- DISCOUNT DIALOG -->
    <v-dialog v-model="discountDialog" max-width="480">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div>
            <div class="text-subtitle-1 font-weight-bold">
              Diskon Item Bundling
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ discountItemName }}
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="closeDiscountDialog"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="5">
              <v-select
                v-model="discountForm.tipe_diskon_item"
                label="Tipe Diskon"
                :items="tipeDiskonItemOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-percent-outline"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="7">
              <v-text-field
                v-model="discountForm.diskon_item"
                :label="
                  discountForm.tipe_diskon_item === 'percent'
                    ? 'Nilai Diskon (%)'
                    : 'Nominal Diskon'
                "
                type="number"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-cash-minus"
                :suffix="discountForm.tipe_diskon_item === 'percent' ? '%' : ''"
                :prefix="
                  discountForm.tipe_diskon_item === 'nominal' ? 'Rp' : ''
                "
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="closeDiscountDialog"
          >
            Batal
          </v-btn>

          <v-btn color="primary" variant="flat" @click="saveDiscountDialog">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}

      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import referenceService from "@/services/referenceService";
import voucherDiskonService from "@/services/master/voucherDiskonService";

export default {
  name: "KonfigurasiVoucherDiskonPage",

  data() {
    return {
      loadingPage: false,
      loadingReference: false,
      loadingItems: false,
      loadingSave: false,

      activeTab: "treatments",

      breadcrumbs: [
        {
          title: "Voucher Diskon",
          disabled: false,
          to: "/administrasi/voucher-diskon",
        },
        {
          title: "Konfigurasi Voucher Diskon",
          disabled: true,
        },
      ],

      jenisVoucherOptions: [],

      voucherDetail: null,

      currentVoucher: {
        id: null,
        nama: "-",
        nilai_voucher: 0,
        total_diskon_maksimal: null,
        tipe_diskon: "nominal",
        mode_label: "-",
        berlaku_label: "-",
        is_all_toko: false,
        jenis_voucher_id: null,
        jenis_voucher_label: "-",
        bisa_treatment: false,
        bisa_produk: false,
      },

      selectedTokoId: null,

      tokoOptions: [],
      treatmentOptions: [],
      productOptions: [],

      treatmentSearch: "",
      productSearch: "",

      selectedTreatmentIds: [],
      selectedProductIds: [],

      selectAllTreatments: false,
      selectAllProducts: false,

      configuredTreatments: [],
      configuredProducts: [],

      tipeDiskonItemOptions: [
        { label: "Persen", value: "percent" },
        { label: "Nominal", value: "nominal" },
      ],

      discountDialog: false,
      discountForm: {
        type: null,
        index: null,
        tipe_diskon_item: "nominal",
        diskon_item: 0,
      },
      discountItemName: "",

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    voucherId() {
      return this.$route.params.id;
    },

    selectedJenisVoucher() {
      return this.jenisVoucherOptions.find(
        (row) =>
          Number(row.value) === Number(this.currentVoucher.jenis_voucher_id),
      );
    },

    isVoucherTreatment() {
      return Number(this.currentVoucher.jenis_voucher_id) === 1;
    },

    isVoucherProduk() {
      return Number(this.currentVoucher.jenis_voucher_id) === 2;
    },

    isVoucherBundling() {
      return Number(this.currentVoucher.jenis_voucher_id) === 3;
    },

    isVoucherValue() {
      return Number(this.currentVoucher.jenis_voucher_id) === 4;
    },

    showTreatmentSection() {
      if (this.selectedJenisVoucher) {
        return Boolean(this.selectedJenisVoucher.bisa_treatment);
      }

      return (
        this.isVoucherTreatment || this.isVoucherBundling || this.isVoucherValue
      );
    },

    showProductSection() {
      if (this.selectedJenisVoucher) {
        return Boolean(this.selectedJenisVoucher.bisa_produk);
      }

      return (
        this.isVoucherProduk || this.isVoucherBundling || this.isVoucherValue
      );
    },

    itemPickerColumn() {
      return this.showTreatmentSection && this.showProductSection ? 6 : 12;
    },

    treatmentTableHeaders() {
      const headers = [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "NAMA TREATMENT", key: "nama" },
        { title: "TARIF UMUM", key: "tarif_umum", width: "180px" },
      ];

      if (this.isVoucherBundling) {
        headers.push({
          title: "DISKON ITEM",
          key: "diskon_item",
          sortable: false,
          width: "240px",
        });
      }

      headers.push({
        title: "AKSI",
        key: "action",
        sortable: false,
        width: "120px",
        align: "center",
      });

      return headers;
    },

    productTableHeaders() {
      const headers = [
        { title: "NO", key: "no", sortable: false, width: "70px" },
        { title: "NAMA PRODUK", key: "nama" },
        { title: "HARGA JUAL", key: "harga_jual", width: "180px" },
        { title: "STOK", key: "status_stok", sortable: false, width: "140px" },
      ];

      if (this.isVoucherBundling) {
        headers.push({
          title: "DISKON ITEM",
          key: "diskon_item",
          sortable: false,
          width: "240px",
        });
      }

      headers.push({
        title: "AKSI",
        key: "action",
        sortable: false,
        width: "120px",
        align: "center",
      });

      return headers;
    },

    filteredTreatmentOptions() {
      const query = String(this.treatmentSearch || "").toLowerCase();

      return this.treatmentOptions.filter((item) => {
        const text = [
          item.kode,
          item.nama,
          item.nama_unit_treatment,
          item.nama_tipe_treatment,
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      });
    },

    filteredProductOptions() {
      const query = String(this.productSearch || "").toLowerCase();

      return this.productOptions.filter((item) => {
        const text = [
          item.kode,
          item.nama,
          item.nama_satuan,
          item.nama_kategori_produk,
          item.status_stok,
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      });
    },

    totalAllocatedDiscount() {
      if (!this.isVoucherBundling) {
        return 0;
      }

      const treatmentTotal = this.configuredTreatments.reduce(
        (total, item) => total + Number(item.diskon_item || 0),
        0,
      );

      const productTotal = this.configuredProducts.reduce(
        (total, item) => total + Number(item.diskon_item || 0),
        0,
      );

      return treatmentTotal + productTotal;
    },

    remainingDiscount() {
      if (!this.isVoucherBundling) {
        return Number(this.currentVoucher.nilai_voucher || 0);
      }

      return (
        Number(this.currentVoucher.nilai_voucher || 0) -
        this.totalAllocatedDiscount
      );
    },

    allocationPercentage() {
      if (!this.isVoucherBundling) {
        return 0;
      }

      const total = Number(this.currentVoucher.nilai_voucher || 0);

      if (total <= 0) return 0;

      return Math.round((this.totalAllocatedDiscount / total) * 100);
    },

    allocationPercentageSafe() {
      const value = Number(this.allocationPercentage || 0);

      if (value < 0) return 0;
      if (value > 100) return 100;

      return value;
    },
  },

  watch: {
    treatmentSearch() {
      this.syncSelectAllTreatments();
    },

    productSearch() {
      this.syncSelectAllProducts();
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    async initPage() {
      this.loadingPage = true;

      try {
        await this.fetchReferenceData();
        await this.fetchVoucherDetail();
        await this.fetchAvailableItems();
        this.mapExistingVoucherItems();
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memuat konfigurasi voucher"),
          "error",
        );
      } finally {
        this.loadingPage = false;
      }
    },

    async fetchReferenceData() {
      this.loadingReference = true;

      try {
        const [tokoRes, jenisRes] = await Promise.all([
          referenceService.toko(),
          referenceService.voucherDiskonJenis(),
        ]);

        this.tokoOptions = this.normalizeToko(tokoRes);
        this.jenisVoucherOptions = this.normalizeJenisVoucher(jenisRes);
      } finally {
        this.loadingReference = false;
      }
    },

    async fetchVoucherDetail() {
      const response = await voucherDiskonService.getById(this.voucherId);
      const detail = this.extractDetail(response);

      if (!detail) {
        throw new Error("Data voucher tidak ditemukan");
      }

      this.voucherDetail = detail;

      const tipeDiskon = this.normalizeTipeDiskon(detail.tipe_diskon);
      const isAllToko = Number(detail.is_all_toko || 0) === 1;
      const tokoId = detail.toko_id ?? null;
      const jenisVoucherId = Number(detail.jenis_voucher_id || 3);
      const jenisOption = this.jenisVoucherOptions.find(
        (row) => Number(row.value) === Number(jenisVoucherId),
      );

      this.currentVoucher = {
        id: detail.id,
        nama: detail.nama_voucher || detail.nama || "-",
        nilai_voucher: Number(detail.total_diskon || 0),
        total_diskon_maksimal:
          tipeDiskon === "percent"
            ? Number(
                detail.total_diskon_maksimal || detail.maksimal_diskon || 0,
              )
            : null,
        tipe_diskon: tipeDiskon || "nominal",
        mode_label:
          detail.mode_voucher === "generate"
            ? "Generate Voucher"
            : "Direct Voucher",
        berlaku_label: isAllToko
          ? "Semua Cabang"
          : detail.toko?.nama_toko || detail.toko?.nama || "Cabang Tertentu",
        is_all_toko: isAllToko,
        jenis_voucher_id: jenisVoucherId,
        jenis_voucher_label: this.getJenisVoucherLabel(jenisVoucherId),
        bisa_treatment: jenisOption?.bisa_treatment ?? false,
        bisa_produk: jenisOption?.bisa_produk ?? false,
      };

      this.activeTab = this.showTreatmentSection ? "treatments" : "products";

      if (isAllToko) {
        this.selectedTokoId = this.tokoOptions[0]?.id ?? null;
      } else {
        this.selectedTokoId = tokoId;
      }

      if (!this.selectedTokoId && this.tokoOptions.length) {
        this.selectedTokoId = this.tokoOptions[0].id;
      }
    },

    async fetchAvailableItems() {
      if (!this.selectedTokoId) {
        this.treatmentOptions = [];
        this.productOptions = [];
        return;
      }

      this.loadingItems = true;

      try {
        const treatmentPromise = this.showTreatmentSection
          ? referenceService.treatmentByToko({ toko_id: this.selectedTokoId })
          : Promise.resolve([]);

        const productPromise = this.showProductSection
          ? referenceService.produkByToko({ toko_id: this.selectedTokoId })
          : Promise.resolve([]);

        const [treatmentRes, productRes] = await Promise.all([
          treatmentPromise,
          productPromise,
        ]);

        this.treatmentOptions = this.showTreatmentSection
          ? this.normalizeTreatmentOptions(treatmentRes)
          : [];

        this.productOptions = this.showProductSection
          ? this.normalizeProductOptions(productRes)
          : [];

        this.refreshConfiguredItemsDisplay();
      } finally {
        this.loadingItems = false;
      }
    },

    async handleTokoChange() {
      this.selectedTreatmentIds = [];
      this.selectedProductIds = [];
      this.selectAllTreatments = false;
      this.selectAllProducts = false;

      await this.fetchAvailableItems();
    },

    mapExistingVoucherItems() {
      const items = Array.isArray(this.voucherDetail?.items)
        ? this.voucherDetail.items
        : [];

      const activeItems = items.filter(
        (item) => Number(item.is_delete || 0) === 0,
      );

      this.configuredTreatments = this.showTreatmentSection
        ? activeItems
            .filter((item) => item.item_type === "treatment")
            .map((item) => this.mapExistingTreatmentItem(item))
        : [];

      this.configuredProducts = this.showProductSection
        ? activeItems
            .filter(
              (item) =>
                item.item_type === "produk" || item.item_type === "product",
            )
            .map((item) => this.mapExistingProductItem(item))
        : [];
    },

    mapExistingTreatmentItem(item) {
      const source = this.treatmentOptions.find(
        (row) => Number(row.id) === Number(item.item_id),
      );

      return {
        id: Number(item.item_id),
        nama: source?.nama || `Treatment #${item.item_id}`,
        tarif_umum: Number(item.harga_snapshot ?? source?.tarif_umum ?? 0),
        tipe_diskon_item:
          this.normalizeTipeDiskon(item.tipe_diskon_item) ||
          this.currentVoucher.tipe_diskon,
        diskon_item: this.isVoucherBundling
          ? Number(item.nilai_diskon_item || 0)
          : 0,
      };
    },

    mapExistingProductItem(item) {
      const source = this.productOptions.find(
        (row) => Number(row.id) === Number(item.item_id),
      );

      return {
        id: Number(item.item_id),
        nama: source?.nama || `Produk #${item.item_id}`,
        harga_jual: Number(item.harga_snapshot ?? source?.harga_jual ?? 0),
        status_stok: source?.status_stok || "-",
        tipe_diskon_item:
          this.normalizeTipeDiskon(item.tipe_diskon_item) ||
          this.currentVoucher.tipe_diskon,
        diskon_item: this.isVoucherBundling
          ? Number(item.nilai_diskon_item || 0)
          : 0,
      };
    },

    refreshConfiguredItemsDisplay() {
      if (this.showTreatmentSection) {
        this.configuredTreatments = this.configuredTreatments.map((item) => {
          const source = this.treatmentOptions.find(
            (row) => Number(row.id) === Number(item.id),
          );

          return {
            ...item,
            nama: source?.nama || item.nama,
            tarif_umum: Number(source?.tarif_umum ?? item.tarif_umum ?? 0),
          };
        });
      } else {
        this.configuredTreatments = [];
      }

      if (this.showProductSection) {
        this.configuredProducts = this.configuredProducts.map((item) => {
          const source = this.productOptions.find(
            (row) => Number(row.id) === Number(item.id),
          );

          return {
            ...item,
            nama: source?.nama || item.nama,
            harga_jual: Number(source?.harga_jual ?? item.harga_jual ?? 0),
            status_stok: source?.status_stok || item.status_stok || "-",
          };
        });
      } else {
        this.configuredProducts = [];
      }
    },

    getJenisVoucherLabel(value) {
      const item = this.jenisVoucherOptions.find(
        (row) => Number(row.value) === Number(value),
      );

      return item ? item.label : "-";
    },

    normalizeJenisVoucher(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => {
          const id = item.id ?? item.value;
          const label =
            item.label ??
            item.nama_jenis ??
            item.nama ??
            item.name ??
            item.opsi ??
            "-";

          const kode = String(item.kode ?? "").toUpperCase();

          return {
            ...item,
            id,
            value: id,
            label,
            kode,
            bisa_treatment: this.toBoolean(item.bisa_treatment),
            bisa_produk: this.toBoolean(item.bisa_produk),
          };
        })
        .filter((item) => item.value && item.label);
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

    normalizeTreatmentOptions(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.treatment_id ?? item.id,
          kode: item.kode ?? "-",
          nama:
            item.nama ??
            item.nama_treatment ??
            item.master_treatment_nama ??
            "-",
          tarif_umum: Number(
            item.tarif_umum ??
              item.tarif ??
              item.harga ??
              item.harga_terendah ??
              0,
          ),
          nama_unit_treatment: item.nama_unit_treatment ?? null,
          nama_tipe_treatment: item.nama_tipe_treatment ?? null,
          raw: item,
        }))
        .filter((item) => item.id);
    },

    normalizeProductOptions(response) {
      const rows = this.extractRows(response);

      return rows
        .map((item) => ({
          id: item.produk_id ?? item.id,
          kode: item.kode ?? "-",
          nama:
            item.nama ??
            item.nama_produk ??
            item.nama_obat_bahan ??
            item.master_produk_nama ??
            "-",
          harga_jual: Number(item.harga_jual ?? item.harga ?? 0),
          nama_satuan: item.nama_satuan ?? null,
          nama_kategori_produk: item.nama_kategori_produk ?? null,
          status_stok: item.status_stok ?? "TERSEDIA",
          is_stok_habis: Number(item.is_stok_habis || 0),
          is_stok_minimum: Number(item.is_stok_minimum || 0),
          raw: item,
        }))
        .filter((item) => item.id);
    },

    extractDetail(response) {
      if (!response) return null;

      if (response.data?.data) return response.data.data;
      if (response.data?.id) return response.data;
      if (response.result?.id) return response.result;
      if (response.id) return response;

      return response.data ?? response.result ?? response;
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

    normalizeTipeDiskon(value) {
      const tipe = String(value || "").toLowerCase();

      if (["percent", "persen"].includes(tipe)) {
        return "percent";
      }

      if (["nominal", "rupiah"].includes(tipe)) {
        return "nominal";
      }

      return null;
    },

    toBoolean(value) {
      return value === true || value === 1 || value === "1";
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    formatDiscountValue(value, type) {
      const tipe = this.normalizeTipeDiskon(type);

      if (tipe === "percent") {
        return `${Number(value || 0)}%`;
      }

      return this.formatCurrency(value);
    },

    getStockColor(status) {
      const normalized = String(status || "").toUpperCase();

      if (normalized === "HABIS") return "error";
      if (normalized === "STOK MINIMUM") return "warning";

      return "success";
    },

    toggleTreatmentSelection(id) {
      if (!this.showTreatmentSection) return;

      if (this.selectedTreatmentIds.includes(id)) {
        this.selectedTreatmentIds = this.selectedTreatmentIds.filter(
          (item) => item !== id,
        );
      } else {
        this.selectedTreatmentIds.push(id);
      }

      this.syncSelectAllTreatments();
    },

    toggleProductSelection(id) {
      if (!this.showProductSection) return;

      if (this.selectedProductIds.includes(id)) {
        this.selectedProductIds = this.selectedProductIds.filter(
          (item) => item !== id,
        );
      } else {
        this.selectedProductIds.push(id);
      }

      this.syncSelectAllProducts();
    },

    toggleSelectAllTreatments(value) {
      this.selectedTreatmentIds = value
        ? this.filteredTreatmentOptions.map((item) => item.id)
        : [];
    },

    toggleSelectAllProducts(value) {
      this.selectedProductIds = value
        ? this.filteredProductOptions.map((item) => item.id)
        : [];
    },

    syncSelectAllTreatments() {
      this.selectAllTreatments =
        this.filteredTreatmentOptions.length > 0 &&
        this.filteredTreatmentOptions.every((item) =>
          this.selectedTreatmentIds.includes(item.id),
        );
    },

    syncSelectAllProducts() {
      this.selectAllProducts =
        this.filteredProductOptions.length > 0 &&
        this.filteredProductOptions.every((item) =>
          this.selectedProductIds.includes(item.id),
        );
    },

    addSelectedTreatments() {
      if (!this.showTreatmentSection) {
        this.showSnackbar("Voucher ini bukan jenis Treatment", "warning");
        return;
      }

      if (!this.selectedTreatmentIds.length) {
        this.showSnackbar("Pilih treatment terlebih dahulu", "warning");
        return;
      }

      const existingIds = this.configuredTreatments.map((item) =>
        Number(item.id),
      );

      const newItems = this.treatmentOptions
        .filter(
          (item) =>
            this.selectedTreatmentIds.includes(item.id) &&
            !existingIds.includes(Number(item.id)),
        )
        .map((item) => ({
          id: item.id,
          nama: item.nama,
          tarif_umum: item.tarif_umum,
          tipe_diskon_item: this.currentVoucher.tipe_diskon,
          diskon_item: 0,
        }));

      this.configuredTreatments.push(...newItems);
      this.selectedTreatmentIds = [];
      this.selectAllTreatments = false;

      this.showSnackbar(
        newItems.length
          ? `${newItems.length} treatment berhasil ditambahkan`
          : "Semua treatment terpilih sudah ada di daftar",
        newItems.length ? "success" : "info",
      );
    },

    addSelectedProducts() {
      if (!this.showProductSection) {
        this.showSnackbar("Voucher ini bukan jenis Produk", "warning");
        return;
      }

      if (!this.selectedProductIds.length) {
        this.showSnackbar("Pilih produk terlebih dahulu", "warning");
        return;
      }

      const existingIds = this.configuredProducts.map((item) =>
        Number(item.id),
      );

      const newItems = this.productOptions
        .filter(
          (item) =>
            this.selectedProductIds.includes(item.id) &&
            !existingIds.includes(Number(item.id)),
        )
        .map((item) => ({
          id: item.id,
          nama: item.nama,
          harga_jual: item.harga_jual,
          status_stok: item.status_stok,
          tipe_diskon_item: this.currentVoucher.tipe_diskon,
          diskon_item: 0,
        }));

      this.configuredProducts.push(...newItems);
      this.selectedProductIds = [];
      this.selectAllProducts = false;

      this.showSnackbar(
        newItems.length
          ? `${newItems.length} produk berhasil ditambahkan`
          : "Semua produk terpilih sudah ada di daftar",
        newItems.length ? "success" : "info",
      );
    },

    openDiscountDialog(type, item, index) {
      if (!this.isVoucherBundling) {
        this.showSnackbar(
          "Diskon item hanya bisa diatur untuk voucher Bundling",
          "warning",
        );
        return;
      }

      this.discountForm = {
        type,
        index,
        tipe_diskon_item:
          item.tipe_diskon_item || this.currentVoucher.tipe_diskon || "nominal",
        diskon_item: Number(item.diskon_item || 0),
      };

      this.discountItemName = item.nama || "";
      this.discountDialog = true;
    },

    closeDiscountDialog() {
      this.discountDialog = false;
      this.discountForm = {
        type: null,
        index: null,
        tipe_diskon_item: "nominal",
        diskon_item: 0,
      };
      this.discountItemName = "";
    },

    saveDiscountDialog() {
      if (!this.isVoucherBundling) {
        this.closeDiscountDialog();
        return;
      }

      const value = Number(this.discountForm.diskon_item || 0);
      const tipe = this.normalizeTipeDiskon(this.discountForm.tipe_diskon_item);

      if (!tipe) {
        this.showSnackbar("Tipe diskon item tidak valid", "error");
        return;
      }

      if (value < 0) {
        this.showSnackbar("Diskon item tidak boleh kurang dari 0", "error");
        return;
      }

      if (tipe === "percent" && value > 100) {
        this.showSnackbar("Diskon persen tidak boleh lebih dari 100", "error");
        return;
      }

      const payload = {
        tipe_diskon_item: tipe,
        diskon_item: value,
      };

      if (this.discountForm.type === "treatment") {
        this.configuredTreatments.splice(this.discountForm.index, 1, {
          ...this.configuredTreatments[this.discountForm.index],
          ...payload,
        });
      } else if (this.discountForm.type === "product") {
        this.configuredProducts.splice(this.discountForm.index, 1, {
          ...this.configuredProducts[this.discountForm.index],
          ...payload,
        });
      }

      this.closeDiscountDialog();
      this.showSnackbar("Diskon item berhasil diperbarui");
    },

    removeConfiguredItem(type, index) {
      if (type === "treatment") {
        this.configuredTreatments.splice(index, 1);
      } else if (type === "product") {
        this.configuredProducts.splice(index, 1);
      }

      this.showSnackbar("Item berhasil dihapus");
    },

    validateConfiguration() {
      if (!this.selectedTokoId) {
        return "Cabang referensi item wajib dipilih";
      }
      if (
        this.currentVoucher.tipe_diskon === "percent" &&
        Number(this.currentVoucher.total_diskon_maksimal || 0) < 1
      ) {
        return "Total diskon maksimal voucher persen belum tersedia. Edit voucher terlebih dahulu dan isi maksimal diskon.";
      }
      if (this.showTreatmentSection && !this.showProductSection) {
        if (!this.configuredTreatments.length) {
          return "Minimal pilih 1 treatment untuk voucher jenis Treatment";
        }
      }

      if (this.showProductSection && !this.showTreatmentSection) {
        if (!this.configuredProducts.length) {
          return "Minimal pilih 1 produk untuk voucher jenis Produk";
        }
      }

      if (this.showTreatmentSection && this.showProductSection) {
        const totalItems =
          this.configuredTreatments.length + this.configuredProducts.length;

        if (!totalItems) {
          return "Minimal pilih 1 treatment atau produk untuk voucher ini";
        }
      }

      if (!this.isVoucherBundling) {
        return null;
      }

      const invalidTreatment = this.configuredTreatments.find(
        (item) =>
          Number(item.diskon_item || 0) < 0 ||
          (item.tipe_diskon_item === "percent" &&
            Number(item.diskon_item || 0) > 100),
      );

      if (invalidTreatment) {
        return `Diskon treatment ${invalidTreatment.nama} tidak valid`;
      }

      const invalidProduct = this.configuredProducts.find(
        (item) =>
          Number(item.diskon_item || 0) < 0 ||
          (item.tipe_diskon_item === "percent" &&
            Number(item.diskon_item || 0) > 100),
      );

      if (invalidProduct) {
        return `Diskon produk ${invalidProduct.nama} tidak valid`;
      }

      if (this.remainingDiscount < 0) {
        return "Total alokasi diskon melebihi nilai voucher";
      }

      return null;
    },

    buildItemsPayload() {
      const items = [];

      if (this.showTreatmentSection) {
        const treatmentItems = this.configuredTreatments.map((item) => ({
          item_type: "treatment",
          item_id: item.id,
          harga_snapshot: Number(item.tarif_umum || 0),
          tipe_diskon_item: this.isVoucherBundling
            ? item.tipe_diskon_item || this.currentVoucher.tipe_diskon
            : null,
          nilai_diskon_item: this.isVoucherBundling
            ? Number(item.diskon_item || 0)
            : null,
        }));

        items.push(...treatmentItems);
      }

      if (this.showProductSection) {
        const productItems = this.configuredProducts.map((item) => ({
          item_type: "produk",
          item_id: item.id,
          harga_snapshot: Number(item.harga_jual || 0),
          tipe_diskon_item: this.isVoucherBundling
            ? item.tipe_diskon_item || this.currentVoucher.tipe_diskon
            : null,
          nilai_diskon_item: this.isVoucherBundling
            ? Number(item.diskon_item || 0)
            : null,
        }));

        items.push(...productItems);
      }

      return items;
    },

    buildVoucherUpdatePayload() {
      const detail = this.voucherDetail || {};
      const isAllToko = Number(detail.is_all_toko || 0) === 1;
      const isUnlimitedDate = Number(detail.is_unlimited_date || 0) === 1;
      const isUnlimitedGenerate =
        Number(detail.is_unlimited_generate || 0) === 1;
      const modeVoucher = detail.mode_voucher || "direct";

      return {
        legacy_id: detail.legacy_id ?? null,
        kode_voucher: modeVoucher === "generate" ? null : detail.kode_voucher,
        nama_voucher: detail.nama_voucher,
        deskripsi: detail.deskripsi,
        mode_voucher: modeVoucher,
        toko_id: isAllToko ? null : detail.toko_id,
        is_all_toko: isAllToko ? 1 : 0,
        kategori_voucher_id: detail.kategori_voucher_id,
        jenis_voucher_id: Number(detail.jenis_voucher_id || 3),
        template_voucher_id: detail.template_voucher_id,
        tipe_diskon: this.normalizeTipeDiskon(detail.tipe_diskon),
        total_diskon: Number(detail.total_diskon || 0),
        total_diskon_maksimal:
          this.normalizeTipeDiskon(detail.tipe_diskon) === "percent"
            ? Number(
                detail.total_diskon_maksimal || detail.maksimal_diskon || 0,
              )
            : null,
        is_unlimited_generate:
          modeVoucher === "direct" && isUnlimitedGenerate ? 1 : 0,
        qty_generate:
          modeVoucher === "direct" && isUnlimitedGenerate
            ? 0
            : Number(detail.qty_generate || 1),
        is_bisa_digabung_promo: Number(detail.is_bisa_digabung_promo || 0),
        is_unlimited_date: isUnlimitedDate ? 1 : 0,
        tanggal_mulai: isUnlimitedDate
          ? null
          : this.formatInputDate(detail.tanggal_mulai),
        tanggal_akhir: isUnlimitedDate
          ? null
          : this.formatInputDate(detail.tanggal_akhir),
        status_voucher: Number(detail.status_voucher ?? 0),
        sort_order: Number(detail.sort_order || 0),
        items: this.buildItemsPayload(),
      };
    },

    formatInputDate(value) {
      if (!value) return null;

      return String(value).slice(0, 10);
    },

    async saveConfiguration() {
      const error = this.validateConfiguration();

      if (error) {
        this.showSnackbar(error, "error");
        return;
      }

      this.loadingSave = true;

      try {
        await voucherDiskonService.update(
          this.currentVoucher.id,
          this.buildVoucherUpdatePayload(),
        );

        this.showSnackbar("Konfigurasi voucher berhasil disimpan", "success");

        this.$router.replace("/administrasi/voucher-diskon");
      } catch (error) {
        console.error(error);

        this.showSnackbar(
          this.getErrorMessage(error, "Gagal menyimpan konfigurasi voucher"),
          "error",
        );
      } finally {
        this.loadingSave = false;
      }
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

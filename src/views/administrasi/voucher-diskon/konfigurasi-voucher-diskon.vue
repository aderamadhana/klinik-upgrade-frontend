<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ currentVoucher.nama }}</h1>
        <p class="page-subtitle">
          Konfigurasi item voucher diskon dengan alur yang lebih rapi dan cepat
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-skeleton-loader v-if="loadingPage" type="article" />

    <template v-else>
      <v-alert
        type="info"
        variant="tonal"
        class="mb-4"
        rounded="lg"
        density="comfortable"
      >
        Pilih item treatment atau product yang masuk ke voucher, lalu atur
        diskon per item sesuai alokasi voucher.
      </v-alert>

      <!-- RINGKASAN VOUCHER -->
      <v-card class="section-card mb-4" elevation="1">
        <v-card-text class="pa-0">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon section-icon-primary">
                <v-icon size="18">mdi-ticket-percent-outline</v-icon>
              </div>

              <div>
                <div class="section-title">Ringkasan Voucher</div>
                <div class="section-subtitle">
                  Ringkasan nilai voucher dan progres alokasi diskon
                </div>
              </div>
            </div>
          </div>

          <div class="section-body">
            <v-row>
              <v-col cols="12" md="3">
                <div class="summary-box">
                  <div class="summary-label">Nama Voucher</div>
                  <div class="summary-value text-truncate">
                    {{ currentVoucher.nama }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="summary-box">
                  <div class="summary-label">Nilai Voucher</div>
                  <div class="summary-value">
                    {{ formatCurrency(currentVoucher.nilai_voucher) }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="summary-box">
                  <div class="summary-label">Teralokasi</div>
                  <div class="summary-value">
                    {{ formatCurrency(totalAllocatedDiscount) }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="3">
                <div class="summary-box">
                  <div class="summary-label">Sisa Alokasi</div>
                  <div
                    class="summary-value"
                    :class="
                      remainingDiscount < 0 ? 'text-error' : 'text-success'
                    "
                  >
                    {{ formatCurrency(remainingDiscount) }}
                  </div>
                </div>
              </v-col>
            </v-row>

            <div class="mt-3">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2 text-medium-emphasis">
                  Progress alokasi voucher
                </span>
                <span class="text-body-2 font-weight-medium">
                  {{ allocationPercentage }}%
                </span>
              </div>

              <v-progress-linear
                :model-value="allocationPercentageSafe"
                height="10"
                rounded
                color="primary"
                bg-color="grey-lighten-3"
              />
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- PILIH ITEM -->
      <v-row class="mb-4">
        <!-- TREATMENT -->
        <v-col cols="12" xl="6">
          <v-card class="section-card h-100" elevation="1">
            <v-card-text class="pa-0 fill-height">
              <div class="section-header">
                <div class="section-header-left">
                  <div class="section-icon section-icon-blue">
                    <v-icon size="18">mdi-stethoscope</v-icon>
                  </div>

                  <div>
                    <div class="section-title">Treatment</div>
                    <div class="section-subtitle">
                      Pilih treatment untuk voucher
                    </div>
                  </div>
                </div>

                <v-chip size="small" color="primary" variant="tonal">
                  {{ selectedTreatmentIds.length }} dipilih
                </v-chip>
              </div>

              <div class="section-divider" />

              <div class="section-body">
                <v-text-field
                  v-model="treatmentSearch"
                  placeholder="Cari treatment..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                  class="mb-3"
                />

                <div
                  class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2"
                >
                  <v-checkbox
                    v-model="selectAllTreatments"
                    label="Pilih semua hasil"
                    hide-details
                    density="compact"
                    color="primary"
                    @update:model-value="toggleSelectAllTreatments"
                  />

                  <span class="text-caption text-medium-emphasis">
                    {{ filteredTreatmentOptions.length }} item
                  </span>
                </div>

                <div class="picker-list">
                  <div
                    v-for="item in filteredTreatmentOptions"
                    :key="'treatment-' + item.id"
                    class="picker-item"
                    :class="{ active: selectedTreatmentIds.includes(item.id) }"
                    @click="toggleTreatmentSelection(item.id)"
                  >
                    <div class="d-flex align-center ga-3 flex-grow-1">
                      <v-checkbox
                        :model-value="selectedTreatmentIds.includes(item.id)"
                        hide-details
                        density="compact"
                        color="primary"
                        @click.stop
                        @update:model-value="toggleTreatmentSelection(item.id)"
                      />

                      <div class="picker-content">
                        <div class="picker-title">{{ item.nama }}</div>
                        <div class="picker-subtitle">
                          {{ formatCurrency(item.tarif_umum) }}
                        </div>
                      </div>
                    </div>

                    <v-chip size="x-small" variant="outlined">Treatment</v-chip>
                  </div>

                  <div
                    v-if="!filteredTreatmentOptions.length"
                    class="empty-state"
                  >
                    Treatment tidak ditemukan
                  </div>
                </div>
              </div>

              <div class="section-divider" />

              <div class="section-footer">
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  @click="addSelectedTreatments"
                >
                  Tambahkan
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- PRODUCT -->
        <v-col cols="12" xl="6">
          <v-card class="section-card h-100" elevation="1">
            <v-card-text class="pa-0 fill-height">
              <div class="section-header">
                <div class="section-header-left">
                  <div class="section-icon section-icon-green">
                    <v-icon size="18">mdi-pill</v-icon>
                  </div>

                  <div>
                    <div class="section-title">Product</div>
                    <div class="section-subtitle">
                      Pilih product untuk voucher
                    </div>
                  </div>
                </div>

                <v-chip size="small" color="success" variant="tonal">
                  {{ selectedProductIds.length }} dipilih
                </v-chip>
              </div>

              <div class="section-divider" />

              <div class="section-body">
                <v-text-field
                  v-model="productSearch"
                  placeholder="Cari product..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                  class="mb-3"
                />

                <div
                  class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2"
                >
                  <v-checkbox
                    v-model="selectAllProducts"
                    label="Pilih semua hasil"
                    hide-details
                    density="compact"
                    color="primary"
                    @update:model-value="toggleSelectAllProducts"
                  />

                  <span class="text-caption text-medium-emphasis">
                    {{ filteredProductOptions.length }} item
                  </span>
                </div>

                <div class="picker-list">
                  <div
                    v-for="item in filteredProductOptions"
                    :key="'product-' + item.id"
                    class="picker-item"
                    :class="{ active: selectedProductIds.includes(item.id) }"
                    @click="toggleProductSelection(item.id)"
                  >
                    <div class="d-flex align-center ga-3 flex-grow-1">
                      <v-checkbox
                        :model-value="selectedProductIds.includes(item.id)"
                        hide-details
                        density="compact"
                        color="primary"
                        @click.stop
                        @update:model-value="toggleProductSelection(item.id)"
                      />

                      <div class="picker-content">
                        <div class="picker-title">{{ item.nama }}</div>
                        <div class="picker-subtitle">
                          {{ formatCurrency(item.harga_jual) }}
                        </div>
                      </div>
                    </div>

                    <v-chip size="x-small" variant="outlined">Product</v-chip>
                  </div>

                  <div
                    v-if="!filteredProductOptions.length"
                    class="empty-state"
                  >
                    Product tidak ditemukan
                  </div>
                </div>
              </div>

              <div class="section-divider" />

              <div class="section-footer">
                <v-btn
                  size="small"
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-plus"
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
      <v-card class="section-card" elevation="1">
        <v-card-text class="pa-0">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon section-icon-orange">
                <v-icon size="18">mdi-clipboard-list-outline</v-icon>
              </div>

              <div>
                <div class="section-title">Item Voucher Terpilih</div>
                <div class="section-subtitle">
                  Edit diskon item atau hapus item yang tidak dipakai
                </div>
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap">
              <v-chip size="small" color="primary" variant="tonal">
                {{ configuredTreatments.length }} Treatment
              </v-chip>
              <v-chip size="small" color="success" variant="tonal">
                {{ configuredProducts.length }} Product
              </v-chip>
            </div>
          </div>

          <div class="section-divider" />

          <div class="section-body">
            <v-tabs
              v-model="activeTab"
              color="primary"
              density="comfortable"
              class="mb-4"
            >
              <v-tab value="treatments">Treatments</v-tab>
              <v-tab value="products">Products</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <v-window-item value="treatments">
                <v-data-table
                  :headers="treatmentHeaders"
                  :items="configuredTreatments"
                  item-value="id"
                  density="compact"
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
                        {{ formatCurrency(item.diskon_item) }}
                      </v-chip>

                      <v-btn
                        size="x-small"
                        color="primary"
                        icon="mdi-pencil"
                        @click="openDiscountDialog('treatment', item, index)"
                      />
                    </div>
                  </template>

                  <template #item.action="{ index }">
                    <v-btn
                      size="x-small"
                      color="error"
                      icon="mdi-delete"
                      @click="removeConfiguredItem('treatment', index)"
                    />
                  </template>

                  <template #no-data>
                    <div class="empty-state-table">
                      Belum ada treatment yang ditambahkan
                    </div>
                  </template>
                </v-data-table>
              </v-window-item>

              <v-window-item value="products">
                <v-data-table
                  :headers="productHeaders"
                  :items="configuredProducts"
                  item-value="id"
                  density="compact"
                >
                  <template #item.no="{ index }">
                    {{ index + 1 }}
                  </template>

                  <template #item.harga_jual="{ item }">
                    {{ formatCurrency(item.harga_jual) }}
                  </template>

                  <template #item.diskon_item="{ item, index }">
                    <div class="d-flex align-center ga-2">
                      <v-chip size="small" color="primary" variant="tonal">
                        {{ formatCurrency(item.diskon_item) }}
                      </v-chip>

                      <v-btn
                        size="x-small"
                        color="primary"
                        icon="mdi-pencil"
                        @click="openDiscountDialog('product', item, index)"
                      />
                    </div>
                  </template>

                  <template #item.action="{ index }">
                    <v-btn
                      size="x-small"
                      color="error"
                      icon="mdi-delete"
                      @click="removeConfiguredItem('product', index)"
                    />
                  </template>

                  <template #no-data>
                    <div class="empty-state-table">
                      Belum ada product yang ditambahkan
                    </div>
                  </template>
                </v-data-table>
              </v-window-item>
            </v-window>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex flex-column flex-md-row justify-end ga-3 mt-6">
        <v-btn
          color="secondary"
          variant="outlined"
          :to="'/administrasi/voucher-diskon'"
        >
          Kembali
        </v-btn>

        <v-btn
          color="success"
          variant="flat"
          prepend-icon="mdi-content-save"
          @click="saveConfiguration"
        >
          Simpan Konfigurasi
        </v-btn>
      </div>
    </template>

    <v-dialog v-model="discountDialog" max-width="460">
      <v-card rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h6 font-weight-bold">Diskon Item</div>
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

        <v-card-text>
          <v-text-field
            v-model="discountForm.diskon_item"
            label="Nominal Diskon"
            type="number"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-cash-minus"
            hint="Masukkan nominal diskon untuk item ini"
            persistent-hint
          />
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

          <v-btn color="primary" @click="saveDiscountDialog"> Simpan </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "KonfigurasiVoucherDiskonPage",

  data() {
    return {
      loadingPage: false,
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

      currentVoucher: {
        id: 1,
        nama: "SERBA SERBI 499K FLEK PUDAR",
        nilai_voucher: 266000,
      },

      dummyVouchers: [
        {
          id: 1,
          nama: "SERBA SERBI 499K FLEK PUDAR",
          nilai_voucher: 266000,
        },
        {
          id: 2,
          nama: "VOUCHER FACIAL PREMIUM",
          nilai_voucher: 150000,
        },
      ],

      treatmentSearch: "",
      productSearch: "",
      selectedTreatmentIds: [],
      selectedProductIds: [],
      selectAllTreatments: false,
      selectAllProducts: false,

      treatmentOptions: [
        { id: 1, nama: "MESO GLOW", tarif_umum: 630000 },
        { id: 2, nama: "MESO WHITE DIAMOND", tarif_umum: 620000 },
        { id: 3, nama: "MESO BACK", tarif_umum: 660000 },
        { id: 4, nama: "MESO FACELIFT", tarif_umum: 895000 },
        { id: 5, nama: "MESO SLIM", tarif_umum: 1024500 },
        { id: 6, nama: "SILKPEEL GLOW", tarif_umum: 995000 },
        { id: 7, nama: "SILKPEEL HYPERPIGMENT", tarif_umum: 995000 },
        { id: 8, nama: "SILKPEEL ACNE", tarif_umum: 995000 },
        { id: 9, nama: "SILKPEEL HYDRATE", tarif_umum: 995000 },
        { id: 10, nama: "FACIAL BARBIE LIGHT", tarif_umum: 245000 },
        { id: 11, nama: "PERFECT WHITE PEELING", tarif_umum: 520000 },
      ],

      productOptions: [
        { id: 101, nama: "ACNE BREAKOUT CREAM 1", harga_jual: 45000 },
        { id: 102, nama: "ACNE BREAKOUT CREAM 2", harga_jual: 50000 },
        { id: 103, nama: "ACNE BREAKOUT CREAM 3", harga_jual: 45000 },
        { id: 104, nama: "ACNE DAILY BB CREAM", harga_jual: 85000 },
        { id: 105, nama: "ACNE ZONE NIGHT CREAM", harga_jual: 85000 },
        { id: 106, nama: "ACNE NIGHT PREMIUM", harga_jual: 135000 },
        { id: 107, nama: "ACNE SPOT TREATMENT", harga_jual: 100000 },
        { id: 108, nama: "ANTI ALERGI 1", harga_jual: 80000 },
        { id: 109, nama: "ANTI ALERGI 2", harga_jual: 50000 },
      ],

      configuredTreatments: [
        {
          id: 10,
          nama: "FACIAL BARBIE LIGHT",
          tarif_umum: 245000,
          diskon_item: 100000,
        },
        {
          id: 11,
          nama: "PERFECT WHITE PEELING",
          tarif_umum: 520000,
          diskon_item: 166000,
        },
      ],

      configuredProducts: [],

      treatmentHeaders: [
        { title: "NO", key: "no", sortable: false, width: "5%" },
        { title: "NAMA TREATMENT", key: "nama" },
        { title: "TARIF UMUM", key: "tarif_umum" },
        { title: "DISKON ITEM", key: "diskon_item", sortable: false },
        { title: "AKSI", key: "action", sortable: false, width: "8%" },
      ],

      productHeaders: [
        { title: "NO", key: "no", sortable: false, width: "5%" },
        { title: "NAMA PRODUCT", key: "nama" },
        { title: "HARGA JUAL", key: "harga_jual" },
        { title: "DISKON ITEM", key: "diskon_item", sortable: false },
        { title: "AKSI", key: "action", sortable: false, width: "8%" },
      ],

      discountDialog: false,
      discountForm: {
        type: null,
        index: null,
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
    filteredTreatmentOptions() {
      const keyword = this.treatmentSearch.toLowerCase().trim();

      return this.treatmentOptions.filter((item) => {
        if (!keyword) return true;
        return item.nama.toLowerCase().includes(keyword);
      });
    },

    filteredProductOptions() {
      const keyword = this.productSearch.toLowerCase().trim();

      return this.productOptions.filter((item) => {
        if (!keyword) return true;
        return item.nama.toLowerCase().includes(keyword);
      });
    },

    totalAllocatedDiscount() {
      const treatmentTotal = this.configuredTreatments.reduce(
        (sum, item) => sum + Number(item.diskon_item || 0),
        0,
      );

      const productTotal = this.configuredProducts.reduce(
        (sum, item) => sum + Number(item.diskon_item || 0),
        0,
      );

      return treatmentTotal + productTotal;
    },

    remainingDiscount() {
      return (
        Number(this.currentVoucher.nilai_voucher || 0) -
        this.totalAllocatedDiscount
      );
    },

    allocationPercentage() {
      if (!Number(this.currentVoucher.nilai_voucher || 0)) return 0;
      return Math.round(
        (this.totalAllocatedDiscount /
          Number(this.currentVoucher.nilai_voucher || 1)) *
          100,
      );
    },

    allocationPercentageSafe() {
      if (this.allocationPercentage < 0) return 0;
      if (this.allocationPercentage > 100) return 100;
      return this.allocationPercentage;
    },
  },

  mounted() {
    this.initPage();
  },

  methods: {
    initPage() {
      this.loadingPage = true;

      try {
        const id = Number(this.$route.params.id || 1);
        const found = this.dummyVouchers.find((item) => item.id === id);

        if (found) {
          this.currentVoucher = { ...found };
        }
      } finally {
        this.loadingPage = false;
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    toggleTreatmentSelection(id) {
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
      if (value) {
        this.selectedTreatmentIds = this.filteredTreatmentOptions.map(
          (item) => item.id,
        );
      } else {
        this.selectedTreatmentIds = [];
      }
    },

    toggleSelectAllProducts(value) {
      if (value) {
        this.selectedProductIds = this.filteredProductOptions.map(
          (item) => item.id,
        );
      } else {
        this.selectedProductIds = [];
      }
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
      if (!this.selectedTreatmentIds.length) {
        this.showSnackbar("Pilih treatment terlebih dahulu", "warning");
        return;
      }

      const existingIds = this.configuredTreatments.map((item) => item.id);

      const newItems = this.treatmentOptions
        .filter(
          (item) =>
            this.selectedTreatmentIds.includes(item.id) &&
            !existingIds.includes(item.id),
        )
        .map((item) => ({
          id: item.id,
          nama: item.nama,
          tarif_umum: item.tarif_umum,
          diskon_item: 0,
        }));

      this.configuredTreatments.push(...newItems);
      this.selectedTreatmentIds = [];
      this.selectAllTreatments = false;

      if (newItems.length) {
        this.showSnackbar(`${newItems.length} treatment berhasil ditambahkan`);
      } else {
        this.showSnackbar(
          "Semua treatment terpilih sudah ada di daftar",
          "info",
        );
      }
    },

    addSelectedProducts() {
      if (!this.selectedProductIds.length) {
        this.showSnackbar("Pilih product terlebih dahulu", "warning");
        return;
      }

      const existingIds = this.configuredProducts.map((item) => item.id);

      const newItems = this.productOptions
        .filter(
          (item) =>
            this.selectedProductIds.includes(item.id) &&
            !existingIds.includes(item.id),
        )
        .map((item) => ({
          id: item.id,
          nama: item.nama,
          harga_jual: item.harga_jual,
          diskon_item: 0,
        }));

      this.configuredProducts.push(...newItems);
      this.selectedProductIds = [];
      this.selectAllProducts = false;

      if (newItems.length) {
        this.showSnackbar(`${newItems.length} product berhasil ditambahkan`);
      } else {
        this.showSnackbar("Semua product terpilih sudah ada di daftar", "info");
      }
    },

    openDiscountDialog(type, item, index) {
      this.discountForm = {
        type,
        index,
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
        diskon_item: 0,
      };
      this.discountItemName = "";
    },

    saveDiscountDialog() {
      const value = Number(this.discountForm.diskon_item || 0);

      if (value < 0) {
        this.showSnackbar("Diskon item tidak boleh kurang dari 0", "error");
        return;
      }

      if (this.discountForm.type === "treatment") {
        this.configuredTreatments[this.discountForm.index].diskon_item = value;
      } else if (this.discountForm.type === "product") {
        this.configuredProducts[this.discountForm.index].diskon_item = value;
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

    saveConfiguration() {
      const payload = {
        voucher_id: this.currentVoucher.id,
        voucher_nama: this.currentVoucher.nama,
        nilai_voucher: this.currentVoucher.nilai_voucher,
        treatments: this.configuredTreatments,
        products: this.configuredProducts,
        total_allocated_discount: this.totalAllocatedDiscount,
        remaining_discount: this.remainingDiscount,
      };

      console.log("Payload konfigurasi voucher:", payload);
      this.showSnackbar("Konfigurasi voucher berhasil disimpan");
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
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
};
</script>

<style scoped>
.section-card {
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px 14px;
  flex-wrap: wrap;
}

.section-header-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.section-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.section-icon-primary {
  background: rgba(25, 118, 210, 0.12);
  color: rgb(25, 118, 210);
}

.section-icon-blue {
  background: rgba(33, 150, 243, 0.12);
  color: rgb(33, 150, 243);
}

.section-icon-green {
  background: rgba(76, 175, 80, 0.12);
  color: rgb(76, 175, 80);
}

.section-icon-orange {
  background: rgba(255, 152, 0, 0.12);
  color: rgb(255, 152, 0);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.62);
  margin-top: 2px;
}

.section-divider {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.section-body {
  padding: 16px 20px;
}

.section-footer {
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
}

.summary-box {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 14px 16px;
  height: 100%;
  background: #fff;
}

.summary-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 6px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.picker-list {
  min-height: 320px;
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 2px;
}

.picker-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  transition: all 0.18s ease;
  cursor: pointer;
}

.picker-item:hover {
  border-color: rgba(25, 118, 210, 0.3);
  background: rgba(25, 118, 210, 0.03);
}

.picker-item.active {
  border-color: rgb(25, 118, 210);
  background: rgba(25, 118, 210, 0.06);
}

.picker-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.picker-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.picker-subtitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.62);
}

.empty-state,
.empty-state-table {
  text-align: center;
  color: rgba(0, 0, 0, 0.55);
  padding: 28px 12px;
}
</style>

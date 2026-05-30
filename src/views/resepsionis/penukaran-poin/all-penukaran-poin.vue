<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Penukaran Poin</h1>
        <p class="page-subtitle">
          Proses penukaran poin pasien menjadi merchandise atau voucher reward
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-alert
      v-if="alert.show"
      :type="alert.type"
      density="compact"
      closable
      class="mb-4"
      @click:close="alert.show = false"
    >
      {{ alert.message }}
    </v-alert>

    <v-row dense>
      <!-- KIRI -->
      <v-col cols="12" md="8">
        <!-- DATA PENUKARAN -->
        <v-card variant="flat" class="border mb-4">
          <v-card-text class="pa-4">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
            >
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary" size="40">
                  <v-icon icon="mdi-account-star-outline" size="22" />
                </v-avatar>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Data Penukaran
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Pilih pasien dan tanggal transaksi penukaran poin
                  </div>
                </div>
              </div>

              <v-chip
                color="primary"
                size="small"
                prepend-icon="mdi-calendar-clock"
              >
                {{ form.tanggal }} {{ form.jam }}
              </v-chip>
            </div>

            <v-row dense>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="form.tanggal"
                  label="Tanggal"
                  type="date"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="form.jam"
                  label="Jam"
                  type="time"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-clock-outline"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="selectedPasien"
                  v-model:search="pasienSearch"
                  :items="pasienOptions"
                  item-title="label"
                  item-value="id"
                  label="Pasien"
                  placeholder="Cari nama pasien / No. RM / No. HP"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account-search-outline"
                  :loading="loading.pasien"
                  clearable
                  return-object
                  hide-details="auto"
                  no-data-text="Pasien tidak ditemukan"
                  @update:search="handlePasienSearch"
                  @update:model-value="handlePasienChange"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatNumber(form.akumulasi_poin)"
                  label="Akumulasi Poin"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-star-outline"
                  bg-color="grey-lighten-5"
                  readonly
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatNumber(sisaPoin)"
                  label="Sisa Poin Setelah Penukaran"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-star-check-outline"
                  bg-color="grey-lighten-5"
                  readonly
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-checkbox
                  v-model="form.tanpa_minimal_akumulasi"
                  color="primary"
                  density="compact"
                  hide-details
                  label="Aktifkan penukaran tanpa minimal akumulasi poin"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- RIWAYAT PENUKARAN -->
        <v-expand-transition>
          <v-card v-if="form.pasien_id" variant="flat" class="border mb-4">
            <v-card-text class="pa-4">
              <div
                class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
              >
                <div class="d-flex align-center ga-3">
                  <v-avatar color="info" size="40">
                    <v-icon icon="mdi-history" size="22" />
                  </v-avatar>

                  <div>
                    <div class="text-subtitle-1 font-weight-bold">
                      Riwayat Penukaran Poin
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      Riwayat dummy penukaran poin pasien yang dipilih
                    </div>
                  </div>
                </div>

                <v-chip color="info" size="small">
                  {{ riwayatPenukaranRows.length }} Riwayat
                </v-chip>
              </div>

              <v-data-table
                :headers="riwayatPenukaranHeaders"
                :items="riwayatPenukaranRows"
                item-value="kode"
                density="compact"
                hide-default-footer
                class="border"
              >
                <template #item.kode="{ item }">
                  <div class="text-body-2 font-weight-bold text-primary">
                    {{ item.kode }}
                  </div>
                </template>

                <template #item.merchandise="{ item }">
                  <div class="text-body-2 font-weight-medium">
                    {{ item.merchandise }}
                  </div>

                  <div class="text-caption text-medium-emphasis">
                    Qty: {{ item.qty }}
                  </div>
                </template>

                <template #item.total_poin="{ item }">
                  <div class="text-body-2 font-weight-bold text-end">
                    {{ formatNumber(item.total_poin) }}
                  </div>
                </template>

                <template #item.total_diskon="{ item }">
                  <div class="text-body-2 font-weight-bold text-end">
                    {{ formatCurrency(item.total_diskon) }}
                  </div>
                </template>

                <template #item.status="{ item }">
                  <v-chip
                    size="small"
                    :color="item.status === 'Berhasil' ? 'success' : 'warning'"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>

                <template #no-data>
                  <div class="text-center py-6">
                    <v-avatar color="grey-lighten-3" size="48" class="mb-3">
                      <v-icon icon="mdi-history" size="26" color="grey" />
                    </v-avatar>

                    <div class="text-body-2 text-medium-emphasis">
                      Belum ada riwayat penukaran poin.
                    </div>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- MERCHANDISE -->
        <v-card variant="flat" class="border">
          <v-card-text class="pa-4">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
            >
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary" size="40">
                  <v-icon icon="mdi-gift-outline" size="22" />
                </v-avatar>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    Merchandise / Voucher Reward
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Pilih item yang akan ditukar dengan poin pasien
                  </div>
                </div>
              </div>

              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="addRow"
              >
                Tambah Item
              </v-btn>
            </div>

            <v-alert
              v-if="!rows.length"
              type="info"
              density="compact"
              text="Belum ada merchandise yang dipilih."
            />

            <v-data-table
              v-else
              :headers="headers"
              :items="rows"
              item-value="row_id"
              density="compact"
              hide-default-footer
              class="border"
            >
              <template #item.merchandise_id="{ item, index }">
                <v-autocomplete
                  :model-value="item.merchandise_id"
                  :items="merchandiseOptions"
                  item-title="label"
                  item-value="id"
                  placeholder="Pilih merchandise"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-gift-outline"
                  :loading="loading.merchandise"
                  clearable
                  hide-details
                  no-data-text="Merchandise tidak ditemukan"
                  @update:model-value="handleMerchandiseChange(index, $event)"
                />
              </template>

              <template #item.qty="{ item, index }">
                <v-text-field
                  :model-value="item.qty"
                  type="number"
                  min="1"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="updateQty(index, $event)"
                />
              </template>

              <template #item.harga_poin="{ item }">
                <v-text-field
                  :model-value="formatNumber(item.harga_poin)"
                  variant="outlined"
                  density="compact"
                  bg-color="grey-lighten-5"
                  readonly
                  hide-details
                />
              </template>

              <template #item.diskon_rp="{ item }">
                <v-text-field
                  :model-value="formatCurrency(item.diskon_rp)"
                  variant="outlined"
                  density="compact"
                  bg-color="grey-lighten-5"
                  readonly
                  hide-details
                />
              </template>

              <template #item.subtotal_poin="{ item }">
                <div class="text-body-2 font-weight-bold text-end">
                  {{ formatNumber(item.subtotal_poin) }}
                </div>
              </template>

              <template #item.action="{ index }">
                <div class="d-flex justify-end">
                  <v-btn
                    icon="mdi-delete-outline"
                    color="error"
                    size="small"
                    @click="removeRow(index)"
                  />
                </div>
              </template>

              <template #no-data>
                <div class="text-center py-6">
                  <div class="text-body-2 text-medium-emphasis">
                    Belum ada merchandise yang dipilih.
                  </div>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- KANAN -->
      <v-col cols="12" md="4">
        <v-card variant="flat" class="border mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-4">
              <v-avatar color="warning" size="40">
                <v-icon icon="mdi-star-circle-outline" size="22" />
              </v-avatar>

              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  Ringkasan Poin
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Validasi poin sebelum diproses
                </div>
              </div>
            </div>

            <v-card :color="sisaPoin < 0 ? 'error' : 'warning'" class="mb-4">
              <v-card-text class="pa-4">
                <div class="text-body-2">Sisa Poin</div>

                <div class="text-h4 font-weight-bold">
                  {{ formatNumber(sisaPoin) }}
                </div>
              </v-card-text>
            </v-card>

            <v-card variant="outlined" class="mb-4">
              <v-card-text class="pa-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2 text-medium-emphasis">
                    Akumulasi Poin
                  </span>
                  <strong>{{ formatNumber(form.akumulasi_poin) }}</strong>
                </div>

                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2 text-medium-emphasis">
                    Minimal Poin
                  </span>
                  <strong>{{ formatNumber(minimalPoinRedeem) }}</strong>
                </div>

                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-body-2 text-medium-emphasis">
                    Total Poin Ditukar
                  </span>
                  <strong>{{ formatNumber(totalPoinDitukar) }}</strong>
                </div>

                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-2 text-medium-emphasis">
                    Total Nilai Diskon
                  </span>
                  <strong>{{ formatCurrency(totalDiskonRp) }}</strong>
                </div>
              </v-card-text>
            </v-card>

            <v-alert
              v-if="!form.pasien_id"
              type="warning"
              density="compact"
              class="mb-3"
            >
              Pilih pasien terlebih dahulu.
            </v-alert>

            <v-alert
              v-else-if="isBelowMinimum"
              type="warning"
              density="compact"
              class="mb-3"
            >
              Akumulasi poin pasien belum mencapai minimal penukaran.
            </v-alert>

            <v-alert
              v-else-if="!rows.length"
              type="info"
              density="compact"
              class="mb-3"
            >
              Tambahkan merchandise yang akan ditukar.
            </v-alert>

            <v-alert
              v-else-if="hasIncompleteRows"
              type="warning"
              density="compact"
              class="mb-3"
            >
              Masih ada baris merchandise yang belum lengkap.
            </v-alert>

            <v-alert
              v-else-if="sisaPoin < 0"
              type="error"
              density="compact"
              class="mb-3"
            >
              Poin pasien tidak cukup untuk penukaran ini.
            </v-alert>

            <div class="d-flex flex-column ga-2">
              <v-btn
                color="success"
                variant="flat"
                prepend-icon="mdi-content-save-check-outline"
                :loading="loading.submit"
                :disabled="disableSubmit"
                block
                @click="submit"
              >
                Proses Penukaran
              </v-btn>

              <v-btn
                variant="outlined"
                color="secondary"
                :disabled="loading.submit"
                block
                @click="resetForm"
              >
                Reset Form
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="2500"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import api from "@/plugins/axios";
import referenceService from "@/services/referenceService";

const PENUKARAN_POIN_ENDPOINT = "/administrasi/penukaran-poin";

export default {
  name: "AllPenukaranPoin",

  data() {
    return {
      breadcrumbs: [
        {
          title: "Penukaran Poin",
          disabled: true,
        },
      ],

      minimalPoinRedeem: 50,

      loading: {
        pasien: false,
        merchandise: false,
        submit: false,
      },

      alert: {
        show: false,
        type: "info",
        message: "",
      },

      snackbar: {
        show: false,
        color: "success",
        text: "",
      },

      selectedPasien: null,
      pasienSearch: "",
      pasienSearchTimer: null,

      form: {
        tanggal: "",
        jam: "",
        pasien_id: null,
        pasien_new_id: null,
        pasien_nama: "",
        pasien_no_rm: "",
        pasien_no_hp: "",
        akumulasi_poin: 0,
        tanpa_minimal_akumulasi: false,
      },

      pasienOptions: [],
      merchandiseOptions: [],
      rows: [],
      riwayatPenukaranRows: [],

      headers: [
        {
          title: "Merchandise",
          key: "merchandise_id",
          sortable: false,
          width: "34%",
        },
        {
          title: "Jumlah",
          key: "qty",
          sortable: false,
          width: "12%",
        },
        {
          title: "Harga Poin",
          key: "harga_poin",
          sortable: false,
          width: "18%",
        },
        {
          title: "Diskon (Rp)",
          key: "diskon_rp",
          sortable: false,
          width: "18%",
        },
        {
          title: "Subtotal",
          key: "subtotal_poin",
          sortable: false,
          align: "end",
          width: "12%",
        },
        {
          title: "Aksi",
          key: "action",
          sortable: false,
          align: "end",
          width: "6%",
        },
      ],

      riwayatPenukaranHeaders: [
        {
          title: "Tanggal",
          key: "tanggal",
          sortable: false,
          width: "14%",
        },
        {
          title: "Kode",
          key: "kode",
          sortable: false,
          width: "16%",
        },
        {
          title: "Merchandise",
          key: "merchandise",
          sortable: false,
          width: "30%",
        },
        {
          title: "Poin",
          key: "total_poin",
          sortable: false,
          align: "end",
          width: "12%",
        },
        {
          title: "Diskon",
          key: "total_diskon",
          sortable: false,
          align: "end",
          width: "16%",
        },
        {
          title: "Status",
          key: "status",
          sortable: false,
          width: "12%",
        },
      ],
    };
  },

  computed: {
    totalPoinDitukar() {
      return this.rows.reduce((total, item) => {
        return total + Number(item.subtotal_poin || 0);
      }, 0);
    },

    totalDiskonRp() {
      return this.rows.reduce((total, item) => {
        const qty = Number(item.qty || 0);
        const diskon = Number(item.diskon_rp || 0);

        return total + qty * diskon;
      }, 0);
    },

    sisaPoin() {
      return Number(this.form.akumulasi_poin || 0) - this.totalPoinDitukar;
    },

    isBelowMinimum() {
      if (this.form.tanpa_minimal_akumulasi) return false;
      if (!this.form.pasien_id) return false;

      return Number(this.form.akumulasi_poin || 0) < this.minimalPoinRedeem;
    },

    hasIncompleteRows() {
      return this.rows.some((item) => {
        if (!item.merchandise_id) return true;
        if (Number(item.qty || 0) <= 0) return true;
        if (Number(item.harga_poin || 0) <= 0) return true;

        return false;
      });
    },

    disableSubmit() {
      if (this.loading.submit) return true;
      if (!this.form.pasien_id) return true;
      if (this.isBelowMinimum) return true;
      if (!this.rows.length) return true;
      if (this.hasIncompleteRows) return true;
      if (this.totalPoinDitukar <= 0) return true;
      if (this.sisaPoin < 0) return true;

      return false;
    },
  },

  mounted() {
    this.initForm();
    this.fetchPasien();
    this.fetchMerchandise();
    this.addRow();
  },

  beforeUnmount() {
    if (this.pasienSearchTimer) {
      clearTimeout(this.pasienSearchTimer);
    }
  },

  methods: {
    initForm() {
      this.form.tanggal = this.todayDate();
      this.form.jam = this.currentTime();
    },

    async fetchPasien(search = "") {
      this.loading.pasien = true;

      try {
        const response = await referenceService.pasien({
          search,
          keyword: search,
          q: search,
          per_page: 20,
        });

        const data = Array.isArray(response) ? response : response?.data || [];

        this.pasienOptions = data.map((item) => this.mapPasienOption(item));

        if (this.selectedPasien) {
          const exists = this.pasienOptions.some(
            (item) => item.id === this.selectedPasien.id,
          );

          if (!exists) {
            this.pasienOptions.unshift(this.selectedPasien);
          }
        }
      } catch (error) {
        this.showSnackbar("Gagal memuat data pasien.", "error");
      } finally {
        this.loading.pasien = false;
      }
    },

    async fetchMerchandise() {
      this.loading.merchandise = true;

      try {
        const response = await referenceService.merchandise();

        const data = Array.isArray(response) ? response : response?.data || [];

        this.merchandiseOptions = data.map((item) =>
          this.mapMerchandiseOption(item),
        );
      } catch (error) {
        this.showSnackbar("Gagal memuat data merchandise.", "error");
      } finally {
        this.loading.merchandise = false;
      }
    },

    mapPasienOption(item) {
      const id = item.id || item.new_id || item.pasien_id || null;
      const newId = item.new_id || item.pasien_new_id || item.id || null;
      const nama = item.nama || item.pasien_nama || item.nama_pasien || "-";
      const noRm = item.no_rm || item.no_rekam_medis || item.rm || "-";
      const noHp = item.no_hp || item.hp || item.telepon || "-";

      const poin = Number(
        item.akumulasi_poin ||
          item.sisa_poin ||
          item.total_poin ||
          item.stock_poin ||
          item.poin ||
          0,
      );

      return {
        ...item,
        id,
        new_id: newId,
        nama,
        no_rm: noRm,
        no_hp: noHp,
        akumulasi_poin: poin,
        label: `${noRm} - ${nama} - ${noHp}`,
      };
    },

    mapMerchandiseOption(item) {
      const id = item.id || item.merchandise_id || null;

      const nama =
        item.label ||
        item.nama ||
        item.nama_merchandise ||
        item.nama_barang ||
        item.nama_item ||
        "-";

      const kode =
        item.kode ||
        item.kode_merchandise ||
        item.kode_barang ||
        item.code ||
        "";

      const hargaPoin = Number(
        item.harga_poin ||
          item.poin ||
          item.nilai_poin ||
          item.point ||
          item.harga ||
          0,
      );

      const diskonRp = Number(
        item.diskon_rp ||
          item.nominal_diskon ||
          item.nilai_diskon ||
          item.diskon ||
          item.value_rupiah ||
          item.nilai_diskon_nominal ||
          0,
      );

      return {
        ...item,
        id,
        nama,
        kode,
        harga_poin: hargaPoin,
        diskon_rp: diskonRp,
        label: kode ? `${kode} - ${nama}` : nama,
      };
    },

    handlePasienSearch(value) {
      const keyword = String(value || "").trim();

      if (
        this.selectedPasien &&
        keyword === String(this.selectedPasien.label || "").trim()
      ) {
        return;
      }

      if (this.pasienSearchTimer) {
        clearTimeout(this.pasienSearchTimer);
      }

      this.pasienSearchTimer = setTimeout(() => {
        this.fetchPasien(keyword);
      }, 400);
    },

    handlePasienChange(selected) {
      if (!selected) {
        this.form.pasien_id = null;
        this.form.pasien_new_id = null;
        this.form.pasien_nama = "";
        this.form.pasien_no_rm = "";
        this.form.pasien_no_hp = "";
        this.form.akumulasi_poin = 0;
        this.riwayatPenukaranRows = [];
        return;
      }

      this.selectedPasien = selected;

      this.form.pasien_id = selected.id || null;
      this.form.pasien_new_id = selected.new_id || null;
      this.form.pasien_nama = selected.nama || "";
      this.form.pasien_no_rm = selected.no_rm || "";
      this.form.pasien_no_hp = selected.no_hp || "";
      this.form.akumulasi_poin = Number(selected.akumulasi_poin || 0);

      this.pasienSearch = selected.label || selected.nama || "";

      this.riwayatPenukaranRows = this.generateDummyRiwayatPenukaran(selected);
    },

    generateDummyRiwayatPenukaran(pasien) {
      const pasienId = pasien?.id || 0;

      return [
        {
          tanggal: "2026-05-20",
          kode: `TUKAR-${pasienId}-001`,
          merchandise: "Voucher Diskon Treatment",
          qty: 1,
          total_poin: 50,
          total_diskon: 50000,
          status: "Berhasil",
        },
        {
          tanggal: "2026-04-14",
          kode: `TUKAR-${pasienId}-002`,
          merchandise: "Merchandise MS Glow",
          qty: 2,
          total_poin: 100,
          total_diskon: 0,
          status: "Berhasil",
        },
        {
          tanggal: "2026-03-08",
          kode: `TUKAR-${pasienId}-003`,
          merchandise: "Voucher Produk",
          qty: 1,
          total_poin: 75,
          total_diskon: 75000,
          status: "Berhasil",
        },
      ];
    },

    addRow() {
      this.rows.push({
        row_id: `${Date.now()}-${Math.random()}`,
        merchandise_id: null,
        merchandise_nama: "",
        qty: 1,
        harga_poin: 0,
        diskon_rp: 0,
        subtotal_poin: 0,
      });
    },

    removeRow(index) {
      this.rows.splice(index, 1);
    },

    handleMerchandiseChange(index, value) {
      const selected = this.merchandiseOptions.find(
        (item) => item.id === value,
      );

      const row = this.rows[index];

      if (!row) return;

      row.merchandise_id = value || null;
      row.merchandise_nama = selected?.nama || "";
      row.harga_poin = Number(selected?.harga_poin || 0);
      row.diskon_rp = Number(selected?.diskon_rp || 0);
      row.subtotal_poin = Number(row.qty || 0) * Number(row.harga_poin || 0);
    },

    updateQty(index, value) {
      const row = this.rows[index];

      if (!row) return;

      const qty = Math.max(Number(value || 0), 1);

      row.qty = qty;
      row.subtotal_poin = qty * Number(row.harga_poin || 0);
    },

    async submit() {
      if (this.disableSubmit) return;

      this.loading.submit = true;

      try {
        const payload = {
          tanggal: this.form.tanggal,
          jam: this.form.jam,
          pasien_id: this.form.pasien_id,
          pasien_new_id: this.form.pasien_new_id,
          pasien_nama: this.form.pasien_nama,
          pasien_no_rm: this.form.pasien_no_rm,
          pasien_no_hp: this.form.pasien_no_hp,
          akumulasi_poin: Number(this.form.akumulasi_poin || 0),
          total_poin_ditukar: this.totalPoinDitukar,
          total_diskon_rp: this.totalDiskonRp,
          sisa_poin: this.sisaPoin,
          tanpa_minimal_akumulasi: this.form.tanpa_minimal_akumulasi ? 1 : 0,
          items: this.rows.map((item) => ({
            merchandise_id: item.merchandise_id,
            merchandise_nama: item.merchandise_nama,
            qty: Number(item.qty || 0),
            harga_poin: Number(item.harga_poin || 0),
            diskon_rp: Number(item.diskon_rp || 0),
            subtotal_poin: Number(item.subtotal_poin || 0),
            subtotal_diskon_rp:
              Number(item.qty || 0) * Number(item.diskon_rp || 0),
          })),
        };

        await api.post(PENUKARAN_POIN_ENDPOINT, payload);

        this.showSnackbar("Penukaran poin berhasil diproses.", "success");
        this.resetForm();
      } catch (error) {
        const message =
          error?.response?.data?.message || "Gagal memproses penukaran poin.";

        this.showSnackbar(message, "error");
      } finally {
        this.loading.submit = false;
      }
    },

    resetForm() {
      this.selectedPasien = null;
      this.pasienSearch = "";

      this.form = {
        tanggal: this.todayDate(),
        jam: this.currentTime(),
        pasien_id: null,
        pasien_new_id: null,
        pasien_nama: "",
        pasien_no_rm: "",
        pasien_no_hp: "",
        akumulasi_poin: 0,
        tanpa_minimal_akumulasi: false,
      };

      this.riwayatPenukaranRows = [];
      this.rows = [];
      this.addRow();
    },

    showSnackbar(text, color = "success") {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    todayDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    currentTime() {
      const date = new Date();
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");

      return `${hour}:${minute}`;
    },
  },
};
</script>

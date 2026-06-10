<template>
  <v-container fluid class="pa-4 pa-md-6">
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="8">
        <div class="text-h4 font-weight-bold text-grey-darken-4">
          Riwayat Resep
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Resep yang telah selesai disiapkan oleh Apoteker atau Asisten
          Apoteker.
        </div>
      </v-col>

      <v-col cols="12" md="4" class="d-flex justify-start justify-md-end">
        <div class="text-body-2 text-medium-emphasis">
          Depo / Apotek
          <v-icon size="16" class="mx-1">mdi-chevron-right</v-icon>
          Riwayat Resep
        </div>
      </v-col>
    </v-row>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card variant="outlined" rounded="lg">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Cari invoice, registrasi, pasien, dokter, obat..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="tanggalMulai"
              label="Selesai mulai"
              type="date"
              prepend-inner-icon="mdi-calendar-start"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @click:clear="tanggalMulai = ''"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="tanggalSelesai"
              label="Selesai sampai"
              type="date"
              prepend-inner-icon="mdi-calendar-end"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              :min="tanggalMulai || undefined"
              @click:clear="tanggalSelesai = ''"
            />
          </v-col>

          <v-col cols="12" sm="8" md="2">
            <v-select
              v-model="apotekerId"
              :items="petugasOptions"
              item-title="label"
              item-value="id"
              label="Apoteker / Asisten"
              prepend-inner-icon="mdi-account-tie"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              :loading="petugasLoading"
            />
          </v-col>

          <v-col cols="6" sm="2" md="1">
            <v-select
              v-model="perPage"
              :items="perPageOptions"
              label="Data"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col cols="6" sm="2" md="1" class="d-flex justify-end">
            <v-btn
              color="primary"
              variant="outlined"
              icon="mdi-refresh"
              :loading="loading"
              @click="loadData"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <div
        class="d-flex align-center justify-space-between flex-wrap ga-3 px-4 py-3"
      >
        <div class="d-flex align-center ga-2 font-weight-bold">
          <v-icon color="success">mdi-check-circle-outline</v-icon>
          Resep Selesai
          <v-chip size="small" color="success" variant="tonal">
            {{ total }}
          </v-chip>
        </div>

        <v-btn
          v-if="hasActiveFilter"
          size="small"
          variant="text"
          prepend-icon="mdi-filter-remove-outline"
          @click="resetFilter"
        >
          Reset Filter
        </v-btn>
      </div>

      <v-divider />

      <template v-if="loading">
        <div class="pa-4">
          <v-skeleton-loader type="table-heading, table-row@6" />
        </div>
      </template>

      <div v-else-if="!rows.length" class="text-center py-12 px-4">
        <v-icon size="54" color="grey-lighten-1"> mdi-history </v-icon>
        <div class="text-h6 font-weight-bold mt-3">Belum ada riwayat resep</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Tidak ada resep selesai yang sesuai dengan filter saat ini.
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <v-table hover>
          <thead>
            <tr>
              <th class="text-no-wrap">Waktu Selesai</th>
              <th>Invoice / Registrasi</th>
              <th>Pasien</th>
              <th>Layanan</th>
              <th>Diproses Oleh</th>
              <th class="text-no-wrap">Durasi</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="text-no-wrap">
                <div class="font-weight-bold">
                  {{ formatDate(row.finished_at) }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ formatTime(row.finished_at) }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold text-primary">
                  {{ row.no_invoice || "-" }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ row.kode_registrasi || "-" }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ row.pasien?.nama || "Pasien tidak ditemukan" }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ row.pasien?.no_rm || "Tanpa No. RM" }}
                  <span v-if="row.pasien?.no_hp">
                    • {{ row.pasien.no_hp }}
                  </span>
                </div>
              </td>

              <td>
                <div class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-if="row.konsultasi?.jenis"
                    size="x-small"
                    color="deep-purple"
                    variant="tonal"
                  >
                    Konsultasi
                  </v-chip>

                  <v-chip
                    v-if="Number(row.jumlah_treatment || 0) > 0"
                    size="x-small"
                    color="indigo"
                    variant="tonal"
                  >
                    {{ row.jumlah_treatment }} Treatment
                  </v-chip>

                  <v-chip size="x-small" color="teal" variant="tonal">
                    {{ row.jumlah_produk }} Obat / Produk
                  </v-chip>
                </div>

                <div class="text-caption text-medium-emphasis mt-2">
                  Dokter: {{ row.konsultasi?.dokter || "Belum ditentukan" }}
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ row.petugas?.nama || "Tidak tercatat" }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ row.petugas?.jabatan || "-" }}
                </div>
              </td>

              <td class="text-no-wrap">
                <div class="font-weight-bold">
                  {{ processingDuration(row) }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ formatTime(row.started_at) }}–{{
                    formatTime(row.finished_at)
                  }}
                </div>
              </td>

              <td>
                <div class="d-flex justify-end ga-2 text-no-wrap">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-eye-outline"
                    @click="openDetail(row)"
                  >
                    Detail
                  </v-btn>

                  <v-btn
                    size="small"
                    color="deep-purple"
                    variant="flat"
                    prepend-icon="mdi-printer-outline"
                    :loading="printLoadingId === row.id"
                    @click="printRecipe(row)"
                  >
                    Cetak
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <v-divider />

      <div
        class="d-flex align-center justify-space-between flex-wrap ga-3 px-4 py-3"
      >
        <div class="text-body-2 text-medium-emphasis">
          Menampilkan
          <strong>{{ from || 0 }}–{{ to || 0 }}</strong>
          dari <strong>{{ total }}</strong> data
        </div>

        <v-pagination
          v-model="page"
          :length="lastPage"
          :total-visible="7"
          density="comfortable"
          @update:model-value="loadData"
        />
      </div>
    </v-card>

    <v-dialog v-model="detailDialog" max-width="960">
      <v-card rounded="lg">
        <v-card-title
          class="d-flex align-start justify-space-between flex-wrap ga-3 pa-5"
        >
          <div>
            <div class="text-h6 font-weight-bold">Detail Riwayat Resep</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              {{ selectedRow?.pasien?.nama || "-" }}
              <span class="mx-1">•</span>
              {{ selectedRow?.no_invoice || "-" }}
            </div>
          </div>

          <v-btn icon="mdi-close" variant="text" @click="closeDetail" />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">No. RM</div>
              <div class="text-body-2 font-weight-bold mt-1">
                {{ selectedRow?.pasien?.no_rm || "-" }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Dokter</div>
              <div class="text-body-2 font-weight-bold mt-1">
                {{ selectedRow?.konsultasi?.dokter || "Belum ditentukan" }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Diproses oleh</div>
              <div class="text-body-2 font-weight-bold mt-1">
                {{ selectedRow?.petugas?.nama || "Tidak tercatat" }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ selectedRow?.petugas?.jabatan || "-" }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Waktu proses</div>
              <div class="text-body-2 font-weight-bold mt-1">
                {{ processingDuration(selectedRow) }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ formatDateTime(selectedRow?.started_at) }}
                –
                {{ formatDateTime(selectedRow?.finished_at) }}
              </div>
            </v-col>
          </v-row>

          <v-alert
            v-if="selectedRow?.pasien?.alergi_obat"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <strong>Alergi obat:</strong>
            {{ selectedRow.pasien.alergi_obat }}
          </v-alert>

          <template v-if="selectedRow?.treatment?.length">
            <div class="text-subtitle-1 font-weight-bold mt-5 mb-3">
              Treatment
            </div>

            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Nama Treatment</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="treatment in selectedRow.treatment"
                  :key="treatment.id"
                >
                  <td>
                    <div class="font-weight-bold">
                      {{ treatment.nama }}
                    </div>
                    <div class="text-caption text-medium-emphasis mt-1">
                      {{ treatment.source_label || "-" }}
                    </div>
                  </td>
                  <td class="text-right">
                    {{ formatQty(treatment.qty) }}
                  </td>
                  <td class="text-right font-weight-bold">
                    {{ formatCurrency(treatment.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </template>

          <div class="text-subtitle-1 font-weight-bold mt-5 mb-3">
            Obat / Produk
          </div>

          <v-table density="comfortable">
            <thead>
              <tr>
                <th>Obat / Produk</th>
                <th>Aturan Pakai</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="product in selectedRow?.produk || []"
                :key="product.id"
              >
                <td>
                  <div class="font-weight-bold">
                    {{ product.nama }}
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ product.source_label || "-" }}
                    <span v-if="product.is_saran_dokter"> • Saran dokter </span>
                  </div>
                </td>
                <td>
                  <div class="text-body-2">
                    {{ productUsage(product) }}
                  </div>
                  <div
                    v-if="product.cara_penggunaan"
                    class="text-caption text-medium-emphasis mt-1"
                  >
                    Cara penggunaan: {{ product.cara_penggunaan }}
                  </div>
                </td>
                <td class="text-right">
                  {{ formatQty(product.qty) }}
                  {{ product.satuan || "" }}
                </td>
                <td class="text-right font-weight-bold">
                  {{ formatCurrency(product.subtotal) }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between align-center">
            <div class="text-body-2 text-medium-emphasis">Total invoice</div>
            <div class="text-h6 font-weight-bold">
              {{ formatCurrency(selectedRow?.grand_total) }}
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeDetail"> Tutup </v-btn>
          <v-btn
            color="deep-purple"
            variant="flat"
            prepend-icon="mdi-printer-outline"
            :loading="printLoadingId === selectedRow?.id"
            @click="printRecipe(selectedRow)"
          >
            Cetak Resep
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top right"
      timeout="3500"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false"> Tutup </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import antrianResepService from "@/services/farmasi/antrianResepService";

export default {
  name: "AllRiwayatResep",

  data() {
    return {
      rows: [],
      loading: false,
      printLoadingId: null,
      errorMessage: "",
      search: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      apotekerId: null,
      petugasOptions: [],
      petugasLoading: false,
      page: 1,
      perPage: 10,
      perPageOptions: [10, 15, 25, 50],
      total: 0,
      lastPage: 1,
      from: 0,
      to: 0,
      detailDialog: false,
      selectedRow: null,
      searchTimer: null,
      requestSequence: 0,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },

  computed: {
    hasActiveFilter() {
      return Boolean(
        this.search ||
        this.tanggalMulai ||
        this.tanggalSelesai ||
        this.apotekerId,
      );
    },
  },

  watch: {
    search() {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = window.setTimeout(() => {
        this.page = 1;
        this.loadData();
      }, 400);
    },

    tanggalMulai() {
      if (
        this.tanggalMulai &&
        this.tanggalSelesai &&
        this.tanggalSelesai < this.tanggalMulai
      ) {
        this.tanggalSelesai = this.tanggalMulai;
        return;
      }

      this.page = 1;
      this.loadData();
    },

    tanggalSelesai() {
      this.page = 1;
      this.loadData();
    },

    apotekerId() {
      this.page = 1;
      this.loadData();
    },

    perPage() {
      this.page = 1;
      this.loadData();
    },
  },

  mounted() {
    this.loadPetugas();
    this.loadData();
  },

  beforeUnmount() {
    window.clearTimeout(this.searchTimer);
  },

  methods: {
    async loadData() {
      const requestId = ++this.requestSequence;
      let reloadLastPage = false;

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await antrianResepService.getHistory({
          page: this.page,
          per_page: this.perPage,
          search: this.search?.trim() || undefined,
          tanggal_mulai: this.tanggalMulai || undefined,
          tanggal_selesai: this.tanggalSelesai || undefined,
          apoteker_id: this.apotekerId || undefined,
          toko_id: this.selectedTokoId(),
        });

        if (requestId !== this.requestSequence) {
          return;
        }

        this.rows = Array.isArray(response?.rows) ? response.rows : [];
        this.total = Number(response?.total || 0);
        this.lastPage = Math.max(Number(response?.last_page || 1), 1);
        this.from = Number(response?.from || 0);
        this.to = Number(response?.to || 0);

        if (this.page > this.lastPage) {
          this.page = this.lastPage;
          reloadLastPage = true;
        }
      } catch (error) {
        if (requestId !== this.requestSequence) {
          return;
        }

        this.rows = [];
        this.errorMessage = this.getErrorMessage(
          error,
          "Gagal mengambil riwayat resep.",
        );
      } finally {
        if (requestId === this.requestSequence) {
          this.loading = false;
        }
      }

      if (reloadLastPage && requestId === this.requestSequence) {
        await this.loadData();
      }
    },

    async loadPetugas() {
      this.petugasLoading = true;

      try {
        const response = await antrianResepService.getHistoryPetugas({
          toko_id: this.selectedTokoId(),
        });

        this.petugasOptions = Array.isArray(response?.data)
          ? response.data
          : [];
      } catch {
        this.petugasOptions = [];
      } finally {
        this.petugasLoading = false;
      }
    },

    resetFilter() {
      window.clearTimeout(this.searchTimer);
      this.search = "";
      this.tanggalMulai = "";
      this.tanggalSelesai = "";
      this.apotekerId = null;
      this.page = 1;
      this.loadData();
    },

    openDetail(row) {
      this.selectedRow = row;
      this.detailDialog = true;
    },

    closeDetail() {
      this.detailDialog = false;
      this.selectedRow = null;
    },

    async printRecipe(row) {
      if (!row || Number(row.farmasi_status) !== 2 || this.printLoadingId) {
        return;
      }

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        this.showSnackbar(
          "Popup cetak diblokir browser. Izinkan popup untuk aplikasi ini.",
          "error",
        );
        return;
      }

      printWindow.document.write(
        "<!doctype html><html><head><title>Menyiapkan resep</title></head><body>Menyiapkan cetak resep...</body></html>",
      );
      printWindow.document.close();
      this.printLoadingId = row.id;

      try {
        const blob = await antrianResepService.print(row.id, {
          toko_id: row?.toko?.id || this.selectedTokoId(),
          auto_print: 1,
        });
        const objectUrl = URL.createObjectURL(blob);

        printWindow.location.replace(objectUrl);
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      } catch (error) {
        printWindow.close();
        this.showSnackbar(
          await this.getPrintErrorMessage(
            error,
            "Gagal menyiapkan cetak resep.",
          ),
          "error",
        );
      } finally {
        this.printLoadingId = null;
      }
    },

    processingDuration(row) {
      const start = this.parseDate(row?.started_at);
      const finish = this.parseDate(row?.finished_at);

      if (!start || !finish) {
        return "-";
      }

      const totalMinutes = Math.max(
        0,
        Math.floor((finish.getTime() - start.getTime()) / 60000),
      );
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return hours > 0 ? `${hours} jam ${minutes} menit` : `${minutes} menit`;
    },

    productUsage(product) {
      const frequency = String(product?.frekuensi || "").trim();
      const timing = String(product?.waktu_pakai || "").trim();

      if (frequency && timing) {
        return `${frequency} • ${timing}`;
      }

      return frequency || timing || "Aturan pakai belum diisi";
    },

    selectedTokoId() {
      const directValue = Number(
        localStorage.getItem("selected_toko_id") ||
          localStorage.getItem("selected_cabang_id") ||
          0,
      );

      if (directValue > 0) {
        return directValue;
      }

      for (const key of ["selected_toko", "selected_cabang"]) {
        try {
          const selected = JSON.parse(localStorage.getItem(key) || "null");
          const selectedId = Number(selected?.id || 0);

          if (selectedId > 0) {
            return selectedId;
          }
        } catch {
          // Abaikan localStorage yang tidak valid.
        }
      }

      return undefined;
    },

    formatQty(value) {
      const number = Number(value || 0);

      return Number.isInteger(number)
        ? String(number)
        : number.toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
          });
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    formatDate(value) {
      const date = this.parseDate(value);

      if (!date) {
        return "-";
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    },

    formatTime(value) {
      const date = this.parseDate(value);

      if (!date) {
        return "-";
      }

      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    },

    formatDateTime(value) {
      const date = this.parseDate(value);

      if (!date) {
        return "-";
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    parseDate(value) {
      if (!value) {
        return null;
      }

      const normalized = String(value).includes("T")
        ? value
        : String(value).replace(" ", "T");
      const date = new Date(normalized);

      return Number.isNaN(date.getTime()) ? null : date;
    },

    getErrorMessage(error, fallback) {
      const responseData = error?.response?.data;
      const errors = responseData?.errors;

      if (errors && typeof errors === "object") {
        const firstError = Object.values(errors).flat().find(Boolean);

        if (firstError) {
          return String(firstError);
        }
      }

      return responseData?.message || error?.message || fallback;
    },

    async getPrintErrorMessage(error, fallback) {
      const blob = error?.response?.data;

      if (blob instanceof Blob) {
        try {
          const text = await blob.text();
          const parsed = JSON.parse(text);

          return parsed?.message || fallback;
        } catch {
          return fallback;
        }
      }

      return this.getErrorMessage(error, fallback);
    },

    showSnackbar(message, color = "success") {
      this.snackbar = {
        show: true,
        message,
        color,
      };
    },
  },
};
</script>

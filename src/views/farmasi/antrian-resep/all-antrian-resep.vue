<template>
  <v-container fluid class="pa-4 pa-md-6">
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="8">
        <div class="text-h4 font-weight-bold text-grey-darken-4">
          {{ pageTitle }}
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          {{ pageSubtitle }}
        </div>
      </v-col>

      <v-col cols="12" md="4" class="d-flex justify-start justify-md-end">
        <div class="text-body-2 text-medium-emphasis">
          Depo / Apotek
          <v-icon size="16" class="mx-1">mdi-chevron-right</v-icon>
          {{ pageTitle }}
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
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              label="Cari pasien, no. RM, invoice, dokter, atau obat"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="7" md="3">
            <v-text-field
              v-model="tanggal"
              label="Tanggal lunas"
              type="date"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @click:clear="tanggal = ''"
            />
          </v-col>

          <v-col cols="12" sm="5" md="2">
            <v-select
              v-model="perPage"
              :items="perPageOptions"
              label="Per halaman"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2" class="d-flex justify-start justify-md-end">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              :loading="loading"
              @click="loadData"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-tabs
        v-if="!isHistory"
        v-model="activeStatus"
        color="primary"
        @update:model-value="handleStatusChange"
      >
        <v-tab value="semua">
          <v-icon start>mdi-format-list-bulleted</v-icon>
          Semua
          <v-chip size="x-small" color="primary" class="ml-2">
            {{ summaryTotal }}
          </v-chip>
        </v-tab>

        <v-tab value="menunggu">
          <v-icon start>mdi-clock-outline</v-icon>
          Menunggu
          <v-chip size="x-small" color="primary" class="ml-2">
            {{ summary.menunggu }}
          </v-chip>
        </v-tab>

        <v-tab value="diproses">
          <v-icon start>mdi-progress-clock</v-icon>
          Diproses
          <v-chip size="x-small" color="primary" class="ml-2">
            {{ summary.diproses }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <div
        v-else
        class="d-flex align-center justify-space-between flex-wrap ga-3 px-4 py-3"
      >
        <div class="d-flex align-center ga-2 font-weight-bold">
          <v-icon color="success">mdi-check-circle-outline</v-icon>
          Resep Selesai
          <v-chip size="x-small" color="success">
            {{ summary.selesai }}
          </v-chip>
        </div>
      </div>

      <v-divider />

      <v-card-text class="pa-4">
        <template v-if="loading">
          <v-sheet
            v-for="index in 3"
            :key="index"
            border
            rounded="lg"
            class="pa-4 mb-3"
          >
            <v-skeleton-loader type="heading, paragraph, paragraph, actions" />
          </v-sheet>
        </template>

        <div v-else-if="!rows.length" class="text-center py-12">
          <v-icon size="52" color="grey-lighten-1">mdi-prescription</v-icon>
          <div class="text-h6 font-weight-bold mt-3">Tidak ada data resep</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            {{ emptyMessage }}
          </div>
        </div>

        <template v-else>
          <v-sheet
            v-for="(row, index) in rows"
            :key="row.id"
            border
            rounded="lg"
            class="pa-4 mb-3"
          >
            <v-row align="start">
              <v-col cols="12" sm="2" md="1">
                <v-sheet
                  border
                  rounded="lg"
                  class="d-flex flex-column align-center justify-center pa-3"
                >
                  <div class="text-h4 font-weight-black">
                    {{ queueNumber(index) }}
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ isHistory ? "Resep" : "Antrian" }}
                  </div>
                </v-sheet>
              </v-col>

              <v-col cols="12" sm="7" md="8">
                <div
                  class="text-subtitle-1 font-weight-bold text-grey-darken-4"
                >
                  {{ row.pasien?.nama || "Pasien tidak ditemukan" }}
                </div>

                <div class="text-caption text-medium-emphasis mt-1">
                  {{ row.pasien?.no_rm || "Tanpa No. RM" }}
                  <span class="mx-1">•</span>
                  {{ row.no_invoice || "-" }}
                  <span class="mx-1">•</span>
                  {{ row.kode_registrasi || "-" }}
                </div>

                <v-row dense class="mt-2">
                  <v-col cols="4" sm="3" md="2">
                    <div
                      class="text-caption font-weight-medium text-medium-emphasis"
                    >
                      Waktu
                    </div>
                  </v-col>
                  <v-col cols="8" sm="9" md="10">
                    <div class="text-body-2 font-weight-bold">
                      {{ formatDate(row.tanggal_lunas) }}
                      <span class="mx-1">|</span>
                      {{ formatTime(row.tanggal_lunas) }}
                      <span
                        v-if="!isHistory"
                        class="ml-1"
                        :class="durationTextClass(row.farmasi_status)"
                      >
                        {{ statusDuration(row) }}
                      </span>
                    </div>
                  </v-col>

                  <v-col cols="4" sm="3" md="2">
                    <div
                      class="text-caption font-weight-medium text-medium-emphasis"
                    >
                      Layanan
                    </div>
                  </v-col>
                  <v-col cols="8" sm="9" md="10">
                    <div class="text-body-2 font-weight-bold">
                      {{ serviceLabel(row) }}
                    </div>
                  </v-col>

                  <v-col cols="4" sm="3" md="2">
                    <div
                      class="text-caption font-weight-medium text-medium-emphasis"
                    >
                      Item
                    </div>
                  </v-col>
                  <v-col cols="8" sm="9" md="10">
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip
                        v-if="row.konsultasi?.jenis"
                        size="small"
                        color="deep-purple"
                        variant="tonal"
                        prepend-icon="mdi-doctor"
                      >
                        Konsultasi
                      </v-chip>

                      <v-chip
                        v-if="Number(row.jumlah_treatment || 0) > 0"
                        size="small"
                        color="deep-purple"
                        variant="tonal"
                        prepend-icon="mdi-spa-outline"
                      >
                        {{ row.jumlah_treatment }} Treatment
                      </v-chip>

                      <v-chip
                        size="small"
                        color="teal"
                        variant="tonal"
                        prepend-icon="mdi-pill-multiple"
                      >
                        {{ row.jumlah_produk }} Obat / Produk
                      </v-chip>
                    </div>
                  </v-col>

                  <v-col cols="4" sm="3" md="2">
                    <div
                      class="text-caption font-weight-medium text-medium-emphasis"
                    >
                      Petugas
                    </div>
                  </v-col>
                  <v-col cols="8" sm="9" md="10">
                    <div class="text-body-2 font-weight-bold">
                      Dokter:
                      {{ row.konsultasi?.dokter || "Belum ditentukan" }}
                    </div>
                    <div class="text-body-2 font-weight-bold mt-1">
                      Apoteker:
                      {{ row.petugas?.nama || "Belum dipilih" }}
                      <span
                        v-if="row.petugas?.jabatan"
                        class="text-medium-emphasis"
                      >
                        ({{ row.petugas.jabatan }})
                      </span>
                    </div>
                  </v-col>

                  <v-col cols="4" sm="3" md="2">
                    <div
                      class="text-caption font-weight-medium text-medium-emphasis"
                    >
                      Total
                    </div>
                  </v-col>
                  <v-col cols="8" sm="9" md="10">
                    <div class="text-body-2 font-weight-bold">
                      {{ formatCurrency(row.grand_total) }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12" sm="3" md="3">
                <div class="d-flex flex-column align-stretch ga-2">
                  <v-chip
                    :color="statusColor(row.farmasi_status)"
                    variant="flat"
                    class="align-self-end"
                  >
                    <v-icon start size="16">
                      {{ statusIcon(row.farmasi_status) }}
                    </v-icon>
                    {{ row.farmasi_status_label }}
                  </v-chip>

                  <v-btn
                    :color="
                      Number(row.farmasi_status) === 2
                        ? 'deep-purple'
                        : 'primary'
                    "
                    variant="flat"
                    :prepend-icon="
                      Number(row.farmasi_status) === 2
                        ? 'mdi-printer-outline'
                        : 'mdi-eye-outline'
                    "
                    :loading="
                      Number(row.farmasi_status) === 2
                        ? printLoadingId === row.id
                        : actionLoadingId === row.id
                    "
                    @click="
                      Number(row.farmasi_status) === 2
                        ? printRecipe(row)
                        : openDetail(row)
                    "
                  >
                    {{
                      Number(row.farmasi_status) === 2
                        ? "Cetak Resep"
                        : "Buka Resep"
                    }}
                  </v-btn>

                  <div
                    v-if="isHistory && row.finished_at"
                    class="text-caption text-medium-emphasis text-right mt-1"
                  >
                    Selesai {{ formatDateTime(row.finished_at) }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-sheet>
        </template>
      </v-card-text>

      <v-divider />

      <div
        class="d-flex align-center justify-space-between flex-wrap ga-3 px-4 py-3"
      >
        <div class="text-body-2 text-medium-emphasis">
          Total data:
          <strong class="text-grey-darken-4">{{ total }}</strong>
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

    <v-dialog v-model="detailDialog" max-width="900">
      <v-card rounded="lg">
        <v-card-title
          class="d-flex align-start justify-space-between flex-wrap ga-3 pa-5"
        >
          <div>
            <div class="text-h6 font-weight-bold">Detail Resep</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              {{ selectedDetailRow?.pasien?.nama || "-" }}
              <span class="mx-1">•</span>
              {{ selectedDetailRow?.no_invoice || "-" }}
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
                {{ selectedDetailRow?.pasien?.no_rm || "-" }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">No. HP</div>
              <div class="text-body-2 font-weight-bold mt-1">
                {{ selectedDetailRow?.pasien?.no_hp || "-" }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Dokter</div>
              <div class="text-body-2 font-weight-bold mt-1">
                {{
                  selectedDetailRow?.konsultasi?.dokter || "Belum ditentukan"
                }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Cabang</div>
              <div class="text-body-2 font-weight-bold mt-1">
                {{ selectedDetailRow?.toko?.nama || "-" }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-caption text-medium-emphasis">Diproses Oleh</div>
              <div class="text-body-2 font-weight-bold mt-1">
                {{ selectedDetailRow?.petugas?.nama || "Belum dipilih" }}
              </div>
              <div
                v-if="selectedDetailRow?.petugas?.jabatan"
                class="text-caption text-medium-emphasis mt-1"
              >
                {{ selectedDetailRow.petugas.jabatan }}
              </div>
            </v-col>
          </v-row>

          <v-alert
            v-if="selectedDetailRow?.pasien?.alergi_obat"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <strong>Alergi obat:</strong>
            {{ selectedDetailRow.pasien.alergi_obat }}
          </v-alert>

          <template v-if="selectedDetailRow?.treatment?.length">
            <div class="text-subtitle-1 font-weight-bold mt-5 mb-3">
              Daftar treatment
            </div>

            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Treatment</th>
                  <th>Keterangan</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="treatment in selectedDetailRow.treatment"
                  :key="treatment.id"
                >
                  <td>
                    <div class="font-weight-bold">
                      {{ treatment.nama }}
                    </div>
                    <div class="text-caption text-medium-emphasis mt-1">
                      {{ treatment.source_label || "Treatment invoice" }}
                    </div>
                  </td>
                  <td>
                    <div class="text-body-2">
                      <span v-if="treatment.is_deposit_claim">
                        Klaim deposit treatment
                      </span>
                      <span v-else-if="treatment.is_saran_dokter">
                        Saran dokter
                      </span>
                      <span v-else> Treatment registrasi </span>
                    </div>
                  </td>
                  <td class="text-right">
                    {{ formatQty(treatment.qty) }}
                    {{ treatment.satuan || "Treatment" }}
                  </td>
                  <td class="text-right font-weight-bold">
                    {{ formatCurrency(treatment.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-divider class="my-4" />
          </template>

          <div class="text-subtitle-1 font-weight-bold mt-5 mb-3">
            Daftar obat / produk
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
                v-for="product in selectedDetailRow?.produk || []"
                :key="product.id"
              >
                <td>
                  <div class="font-weight-bold">
                    {{ product.nama }}
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ product.source_label }}
                    <span v-if="product.is_saran_dokter"> • Saran dokter </span>
                  </div>
                </td>
                <td>
                  <div class="text-body-2">
                    {{ productUsage(product) }}
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
              {{ formatCurrency(selectedDetailRow?.grand_total) }}
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="closeDetail"> Tutup </v-btn>
          <v-spacer />
          <v-btn
            v-if="Number(selectedDetailRow?.farmasi_status) === 2"
            color="deep-purple"
            variant="flat"
            prepend-icon="mdi-printer"
            :loading="printLoadingId === selectedDetailRow?.id"
            @click="printRecipe(selectedDetailRow)"
          >
            Cetak Resep
          </v-btn>
          <v-btn
            v-if="!isHistory && selectedDetailRow?.farmasi_status === 0"
            color="primary"
            variant="flat"
            prepend-icon="mdi-play-circle-outline"
            :loading="actionLoadingId === selectedDetailRow?.id"
            @click="openActionFromDetail('start')"
          >
            Proses Resep
          </v-btn>
          <v-btn
            v-else-if="!isHistory && selectedDetailRow?.farmasi_status === 1"
            color="success"
            variant="flat"
            prepend-icon="mdi-check-circle-outline"
            :loading="actionLoadingId === selectedDetailRow?.id"
            @click="openActionFromDetail('finish')"
          >
            Selesaikan Resep
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="actionDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-3 pa-5">
          <v-avatar
            :color="
              selectedAction === 'finish' ? 'green-lighten-5' : 'blue-lighten-5'
            "
            size="42"
          >
            <v-icon
              :color="
                selectedAction === 'finish' ? 'green-darken-2' : 'blue-darken-2'
              "
            >
              {{ selectedAction === "finish" ? "mdi-check" : "mdi-play" }}
            </v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold">
              {{ actionDialogTitle }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ selectedRow?.no_invoice }}
            </div>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <div class="text-body-2">
            {{ actionDialogMessage }}
          </div>

          <v-autocomplete
            v-if="requiresPetugasSelection"
            v-model="selectedPetugasId"
            :items="petugasOptions"
            :loading="petugasLoading"
            item-title="label"
            item-value="id"
            label="Apoteker / Asisten Apoteker"
            placeholder="Pilih petugas yang memproses"
            prepend-inner-icon="mdi-account-cog-outline"
            variant="outlined"
            density="comfortable"
            clearable
            no-data-text="Tidak ada apoteker aktif di cabang ini"
            class="mt-4"
            :error-messages="petugasError ? [petugasError] : []"
            @update:model-value="petugasError = ''"
          />

          <v-alert
            v-else-if="selectedRow?.petugas"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            Diproses oleh
            <strong>{{ selectedRow.petugas.nama }}</strong>
            <span v-if="selectedRow.petugas.jabatan">
              ({{ selectedRow.petugas.jabatan }})
            </span>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeActionDialog"> Batal </v-btn>
          <v-btn
            :color="selectedAction === 'finish' ? 'success' : 'primary'"
            variant="flat"
            :loading="Boolean(actionLoadingId)"
            :disabled="
              petugasLoading || (requiresPetugasSelection && !selectedPetugasId)
            "
            @click="executeAction"
          >
            {{ selectedAction === "finish" ? "Ya, Selesaikan" : "Ya, Mulai" }}
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
  name: "AllAntrianResep",

  props: {
    mode: {
      type: String,
      default: "queue",
    },
  },

  data() {
    return {
      rows: [],
      loading: false,
      actionLoadingId: null,
      printLoadingId: null,
      errorMessage: "",
      search: "",
      tanggal: "",
      activeStatus: "semua",
      page: 1,
      perPage: 10,
      perPageOptions: [5, 10, 15, 25, 50],
      total: 0,
      lastPage: 1,
      from: 0,
      to: 0,
      summary: {
        menunggu: 0,
        diproses: 0,
        selesai: 0,
      },
      actionDialog: false,
      selectedRow: null,
      selectedAction: "start",
      selectedPetugasId: null,
      petugasOptions: [],
      petugasLoading: false,
      petugasError: "",
      detailDialog: false,
      selectedDetailRow: null,
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
    isHistory() {
      return this.mode === "history";
    },

    summaryTotal() {
      return (
        Number(this.summary.menunggu || 0) +
        Number(this.summary.diproses || 0) +
        Number(this.summary.selesai || 0)
      );
    },

    requiresPetugasSelection() {
      return (
        this.selectedAction === "start" ||
        (this.selectedAction === "finish" && !this.selectedRow?.petugas?.id)
      );
    },

    pageTitle() {
      return this.isHistory ? "Riwayat Resep" : "Antrian Resep";
    },

    pageSubtitle() {
      return this.isHistory
        ? "Daftar obat atau produk yang telah selesai disiapkan oleh farmasi."
        : "Pantau pembayaran lunas dengan obat atau produk yang perlu disiapkan.";
    },

    emptyMessage() {
      if (this.isHistory) {
        return "Belum ada resep selesai yang sesuai dengan filter saat ini.";
      }

      if (this.activeStatus === "diproses") {
        return "Belum ada resep yang sedang diproses.";
      }

      if (this.activeStatus === "menunggu") {
        return "Belum ada pembayaran lunas dengan obat atau produk yang menunggu diproses.";
      }

      return "Belum ada pembayaran lunas dengan obat atau produk yang sesuai filter.";
    },

    actionDialogTitle() {
      return this.selectedAction === "finish"
        ? "Selesaikan resep"
        : "Mulai proses resep";
    },

    actionDialogMessage() {
      if (!this.selectedRow) {
        return "";
      }

      return this.selectedAction === "finish"
        ? `Pastikan seluruh obat atau produk untuk ${this.selectedRow.pasien?.nama || "pasien"} sudah disiapkan sebelum menyelesaikan resep.`
        : `Mulai menyiapkan ${this.selectedRow.jumlah_produk} item obat atau produk untuk ${this.selectedRow.pasien?.nama || "pasien"}.`;
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

    tanggal() {
      this.page = 1;
      this.loadData();
    },

    perPage() {
      this.page = 1;
      this.loadData();
    },

    mode: {
      immediate: true,
      handler(value) {
        this.activeStatus = value === "history" ? "selesai" : "semua";
        this.page = 1;

        if (this.$el) {
          this.loadData();
        }
      },
    },
  },

  mounted() {
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
        const response = await antrianResepService.getAll({
          page: this.page,
          per_page: this.perPage,
          search: this.search?.trim() || undefined,
          tanggal: this.tanggal || undefined,
          status: this.isHistory ? "selesai" : this.activeStatus,
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
        this.summary = {
          menunggu: Number(response?.summary?.menunggu || 0),
          diproses: Number(response?.summary?.diproses || 0),
          selesai: Number(response?.summary?.selesai || 0),
        };

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
          "Gagal mengambil data antrian resep.",
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

    handleStatusChange() {
      this.page = 1;
      this.loadData();
    },

    openDetail(row) {
      this.selectedDetailRow = row;
      this.detailDialog = true;
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

    closeDetail() {
      this.detailDialog = false;
      this.selectedDetailRow = null;
    },

    openActionFromDetail(action) {
      if (!this.selectedDetailRow) {
        return;
      }

      const row = this.selectedDetailRow;
      this.detailDialog = false;
      this.selectedDetailRow = null;
      this.openActionDialog(row, action);
    },

    openActionDialog(row, action) {
      this.selectedRow = row;
      this.selectedAction = action;
      this.selectedPetugasId = row?.petugas?.id || null;
      this.petugasOptions = [];
      this.petugasError = "";
      this.actionDialog = true;

      if (this.requiresPetugasSelection) {
        this.loadPetugasOptions(row?.toko?.id || this.selectedTokoId());
      }
    },

    async loadPetugasOptions(tokoId) {
      const normalizedTokoId = Number(tokoId || 0);

      if (normalizedTokoId <= 0) {
        this.petugasError = "Cabang belum dipilih.";
        return;
      }

      this.petugasLoading = true;
      this.petugasError = "";

      try {
        const response = await antrianResepService.getPetugas({
          toko_id: normalizedTokoId,
        });

        this.petugasOptions = Array.isArray(response?.data)
          ? response.data
          : [];

        if (!this.petugasOptions.length) {
          this.petugasError =
            "Tidak ada Apoteker atau Asisten Apoteker aktif pada cabang ini.";
        }
      } catch (error) {
        this.petugasOptions = [];
        this.petugasError = this.getErrorMessage(
          error,
          "Gagal mengambil daftar apoteker.",
        );
      } finally {
        this.petugasLoading = false;
      }
    },

    closeActionDialog() {
      if (this.actionLoadingId) {
        return;
      }

      this.actionDialog = false;
      this.selectedRow = null;
      this.selectedAction = "start";
      this.selectedPetugasId = null;
      this.petugasOptions = [];
      this.petugasError = "";
      this.petugasLoading = false;
    },

    async executeAction() {
      if (!this.selectedRow || this.actionLoadingId) {
        return;
      }

      if (this.requiresPetugasSelection && !this.selectedPetugasId) {
        this.petugasError =
          "Pilih apoteker atau asisten apoteker yang memproses resep.";
        return;
      }

      const rowId = this.selectedRow.id;
      this.actionLoadingId = rowId;

      try {
        const payload = {
          toko_id: this.selectedRow?.toko?.id || this.selectedTokoId(),
        };

        if (this.selectedPetugasId) {
          payload.apoteker_id = Number(this.selectedPetugasId);
        }

        const response =
          this.selectedAction === "finish"
            ? await antrianResepService.finish(rowId, payload)
            : await antrianResepService.start(rowId, payload);

        this.actionDialog = false;
        this.showSnackbar(
          response?.message ||
            (this.selectedAction === "finish"
              ? "Resep berhasil diselesaikan."
              : "Resep mulai diproses."),
          "success",
        );
        this.selectedRow = null;
        this.selectedPetugasId = null;
        this.petugasOptions = [];
        this.petugasError = "";
        await this.loadData();
      } catch (error) {
        this.showSnackbar(
          this.getErrorMessage(error, "Gagal memperbarui status resep."),
          "error",
        );
      } finally {
        this.actionLoadingId = null;
      }
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

    queueNumber(index) {
      const sequence = Number(this.from || 1) + index;
      return String(sequence).padStart(3, "0");
    },

    serviceLabel(row) {
      const services = [];

      if (row?.konsultasi?.jenis) {
        services.push(row.konsultasi.jenis);
      }

      if (Number(row?.jumlah_treatment || 0) > 0) {
        services.push("Treatment");
      }

      if (Number(row?.jumlah_produk || 0) > 0) {
        services.push("Obat / Produk");
      }

      return services.length ? services.join(" • ") : "Layanan tidak ditemukan";
    },

    statusDuration(row) {
      if (!row?.tanggal_lunas) {
        return "";
      }

      const normalized = String(row.tanggal_lunas).includes("T")
        ? row.tanggal_lunas
        : String(row.tanggal_lunas).replace(" ", "T");
      const start = new Date(normalized);

      if (Number.isNaN(start.getTime())) {
        return "";
      }

      const endValue =
        Number(row.farmasi_status) === 2 && row.finished_at
          ? row.finished_at
          : new Date();
      const end =
        endValue instanceof Date
          ? endValue
          : new Date(
              String(endValue).includes("T")
                ? endValue
                : String(endValue).replace(" ", "T"),
            );

      if (Number.isNaN(end.getTime())) {
        return "";
      }

      const minutes = Math.max(
        0,
        Math.floor((end.getTime() - start.getTime()) / 60000),
      );
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      const duration =
        hours > 0
          ? `${hours} jam ${remainingMinutes} menit`
          : `${remainingMinutes} menit`;

      return Number(row.farmasi_status) === 1
        ? `| Diproses ${duration}`
        : `| Menunggu ${duration}`;
    },

    durationTextClass(status) {
      return Number(status) === 1 ? "text-primary" : "text-error";
    },

    productUsage(product) {
      const frequency = String(product?.frekuensi || "").trim();
      const usageTime = String(product?.waktu_pakai || "").trim();
      let instruction = String(product?.instruksi_pemakaian || "").trim();

      const baseParts = [frequency, usageTime].filter(Boolean);

      for (const part of [...baseParts].sort((a, b) => b.length - a.length)) {
        instruction = instruction.replace(
          new RegExp(this.escapeRegExp(part), "gi"),
          " ",
        );
      }

      instruction = instruction
        .replace(/^[\s•|,;/\-–—]+|[\s•|,;/\-–—]+$/g, "")
        .replace(/[\s]*[•|,;/\-–—][\s]*/g, " • ")
        .replace(/(?:\s*•\s*){2,}/g, " • ")
        .replace(/\s+/g, " ")
        .trim();

      const parts = [...baseParts, instruction]
        .map((value) => String(value || "").trim())
        .filter((value, index, values) => {
          if (!value) {
            return false;
          }

          const normalized = this.normalizeUsageText(value);
          return (
            normalized &&
            values.findIndex(
              (candidate) => this.normalizeUsageText(candidate) === normalized,
            ) === index
          );
        });

      return parts.length ? parts.join(" • ") : "Aturan pakai belum diisi";
    },

    normalizeUsageText(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    },

    escapeRegExp(value) {
      return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
        month: "2-digit",
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

    statusColor(status) {
      return (
        {
          0: "warning",
          1: "primary",
          2: "success",
          9: "error",
        }[Number(status)] || "grey"
      );
    },

    statusIcon(status) {
      return (
        {
          0: "mdi-clock-outline",
          1: "mdi-progress-clock",
          2: "mdi-check-circle-outline",
          9: "mdi-cancel",
        }[Number(status)] || "mdi-help-circle-outline"
      );
    },

    async getPrintErrorMessage(error, fallback) {
      const responseData = error?.response?.data;

      if (responseData instanceof Blob) {
        try {
          const content = await responseData.text();
          const parsed = JSON.parse(content);

          return parsed?.message || fallback;
        } catch {
          return fallback;
        }
      }

      return this.getErrorMessage(error, fallback);
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

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Deposit Pasien</h1>
        <p class="page-subtitle">
          Kelola saldo deposit pasien, masa berlaku, dan riwayat claim treatment
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>
    <v-card>
      <v-card-text>
        <!-- SECTION: SALDO DEPOSIT -->
        <div
          class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3 mb-4"
        >
          <div>
            <div class="text-h6 font-weight-bold">Saldo Deposit Pasien</div>
            <div class="text-medium-emphasis text-body-2">
              Cari berdasarkan nomor faktur, nama treatment, dokter, atau
              catatan
            </div>
          </div>

          <div
            class="d-flex align-center ga-2"
            style="min-width: 320px; max-width: 420px; width: 100%"
          >
            <v-text-field
              v-model="searchDeposit"
              placeholder="Cari saldo deposit..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              style="width: 100%"
            />
          </div>
        </div>

        <div class="d-flex justify-space-between align-center mb-3">
          <div class="text-body-2 text-medium-emphasis">
            Menampilkan <strong>{{ filteredSaldoDeposit.length }}</strong> dari
            <strong>{{ saldoDeposit.length }}</strong> data
          </div>

          <v-btn
            v-if="searchDeposit"
            variant="text"
            size="small"
            prepend-icon="mdi-close"
            @click="searchDeposit = ''"
          >
            Reset pencarian
          </v-btn>
        </div>

        <v-data-table
          :headers="depositHeaders"
          :items="filteredSaldoDeposit"
          item-value="id"
          class="elevation-1"
        >
          <template #item.date_created="{ item }">
            {{ formatDate(item.date_created) }}
          </template>

          <template #item.date_exp="{ item }">
            <div class="d-flex align-center ga-2">
              <v-chip
                size="small"
                :color="isExpired(item.date_exp) ? 'error' : 'warning'"
                variant="tonal"
              >
                {{ formatDate(item.date_exp) }}
              </v-chip>

              <v-btn
                v-if="roleId === 1"
                size="small"
                color="warning"
                variant="text"
                icon="mdi-pencil"
                @click="openEditExp(item)"
              />
            </div>
          </template>

          <template #item.action="{ item }">
            <v-btn
              v-if="isExpired(item.date_exp)"
              size="small"
              color="grey"
              variant="flat"
              disabled
            >
              Expired
            </v-btn>

            <v-btn
              v-else
              size="small"
              color="primary"
              variant="flat"
              @click="openClaimDialog(item)"
            >
              Proses Claim
            </v-btn>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="40" class="mb-2">mdi-database-search</v-icon>
              <div class="text-subtitle-1 font-weight-medium">
                Tidak ada data saldo deposit
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Coba ubah kata kunci pencarian Anda
              </div>
            </div>
          </template>
        </v-data-table>

        <v-divider class="my-6" />

        <!-- SECTION: RIWAYAT CLAIM -->
        <div
          class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3 mb-4"
        >
          <div>
            <div class="text-h6 font-weight-bold">Riwayat Claim Deposit</div>
            <div class="text-medium-emphasis text-body-2">
              Cari berdasarkan nomor faktur realisasi, treatment, dokter, atau
              perawat
            </div>
          </div>

          <div
            class="d-flex align-center ga-2"
            style="min-width: 320px; max-width: 420px; width: 100%"
          >
            <v-text-field
              v-model="searchHistory"
              placeholder="Cari riwayat claim..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              style="width: 100%"
            />
          </div>
        </div>

        <div class="d-flex justify-space-between align-center mb-3">
          <div class="text-body-2 text-medium-emphasis">
            Menampilkan <strong>{{ filteredHistoryClaim.length }}</strong> dari
            <strong>{{ historyClaim.length }}</strong> data
          </div>

          <v-btn
            v-if="searchHistory"
            variant="text"
            size="small"
            prepend-icon="mdi-close"
            @click="searchHistory = ''"
          >
            Reset pencarian
          </v-btn>
        </div>

        <v-data-table
          :headers="historyHeaders"
          :items="filteredHistoryClaim"
          item-value="id"
          class="elevation-1"
        >
          <template #item.date_created="{ item }">
            {{ formatDate(item.date_created) }}
          </template>

          <template #item.date_edited="{ item }">
            {{ formatDate(item.date_edited) }}
          </template>

          <template #item.action="{ item }">
            <v-btn
              size="small"
              color="success"
              variant="flat"
              prepend-icon="mdi-printer"
              @click="reprintClaim(item)"
            >
              Reprint Claim
            </v-btn>
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="40" class="mb-2">mdi-file-search</v-icon>
              <div class="text-subtitle-1 font-weight-medium">
                Tidak ada riwayat claim yang cocok
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Periksa kata kunci atau reset pencarian
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog Edit Expired -->
    <v-dialog v-model="editExpDialog" max-width="400">
      <v-card>
        <v-card-title>Edit Tanggal Expired</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="editExpForm.date_exp"
            label="Tanggal Expired"
            type="date"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editExpDialog = false">Batal</v-btn>
          <v-btn color="success" variant="flat" @click="saveExpDate">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Claim -->
    <v-dialog v-model="claimDialog" max-width="700">
      <v-card>
        <v-card-title>Proses Claim Deposit</v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :model-value="selectedDeposit?.nama_treatment || ''"
                label="Nama Treatment"
                variant="outlined"
                density="comfortable"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="claimForm.id_dokter"
                :items="dokterList"
                item-title="nama"
                item-value="new_id"
                label="Dokter Claim Treatment"
                variant="outlined"
                density="comfortable"
                :error-messages="claimErrors.id_dokter"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="claimForm.id_perawat"
                :items="perawatList"
                item-title="nama"
                item-value="new_id"
                label="Perawat Claim Treatment"
                variant="outlined"
                density="comfortable"
                :error-messages="claimErrors.id_perawat"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="claimForm.catatan_treatment"
                label="Catatan Perubahan Treatment"
                variant="outlined"
                density="comfortable"
                rows="3"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="claimDialog = false">Batal</v-btn>
          <v-btn color="success" variant="flat" @click="validateAndOpenConfirm">
            Claim
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Konfirmasi -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title>Konfirmasi Claim Deposit</v-card-title>

        <v-card-text>
          <p class="mb-4">
            Apakah Anda yakin ingin melakukan claim deposit ini? Setelah claim
            diproses, faktur tidak bisa diedit atau dihapus.
            <span class="text-red font-weight-bold">
              ⚠️ Pastikan dokter dan perawat sudah benar.
            </span>
          </p>

          <div v-if="selectedDeposit">
            <div>
              <strong>Treatment:</strong> {{ selectedDeposit.nama_treatment }}
            </div>
            <div><strong>Dokter:</strong> {{ selectedDokterName }}</div>
            <div><strong>Perawat:</strong> {{ selectedPerawatName }}</div>
            <div v-if="claimForm.catatan_treatment">
              <strong>Catatan:</strong> {{ claimForm.catatan_treatment }}
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Batal</v-btn>
          <v-btn color="success" variant="flat" @click="submitClaim">
            Ya, Claim
          </v-btn>
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
  name: "DepositPasienPage",

  data() {
    return {
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Pasien", disabled: false, to: "/administrasi/pasien" },
        { title: "Riwayat", disabled: true },
        { title: "Saldo Deposit", disabled: true },
      ],
      roleId: 1,

      searchDeposit: "",
      searchHistory: "",

      depositHeaders: [
        { title: "NO. FAKTUR DEPOSIT", key: "faktur_pembayaran" },
        { title: "NAMA TREATMENT", key: "nama_treatment" },
        { title: "TANGGAL BELI", key: "date_created" },
        { title: "TANGGAL EXPIRED", key: "date_exp" },
        { title: "DOKTER REFERER", key: "nama_dokter" },
        { title: "CATATAN", key: "catatan" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      historyHeaders: [
        { title: "NO. FAKTUR REALISASI", key: "faktur_realisasi" },
        { title: "NAMA TREATMENT", key: "nama_treatment" },
        { title: "TANGGAL DIBELI", key: "date_created" },
        { title: "TANGGAL CLAIM", key: "date_edited" },
        { title: "DOKTER", key: "claiming_dokter_nama" },
        { title: "PERAWAT", key: "claiming_nb_nama" },
        { title: "ACTION", key: "action", sortable: false },
      ],

      dokterList: [
        { new_id: "D001", nama: "dr. Andi Saputra" },
        { new_id: "D002", nama: "dr. Bunga Lestari" },
        { new_id: "D003", nama: "dr. Candra Wijaya" },
      ],

      perawatList: [
        { new_id: "P001", nama: "Ns. Rina" },
        { new_id: "P002", nama: "Ns. Tika" },
        { new_id: "P003", nama: "Ns. Wahyu" },
      ],

      saldoDeposit: [
        {
          id: 1,
          faktur_pembayaran: "DEP-2026-0001",
          nama_treatment: "Laser Brightening",
          date_created: "2026-03-10",
          date_exp: "2026-04-15",
          nama_dokter: "dr. Andi Saputra",
          catatan: "3x sesi",
        },
        {
          id: 2,
          faktur_pembayaran: "DEP-2026-0002",
          nama_treatment: "Chemical Peeling",
          date_created: "2026-02-11",
          date_exp: "2026-03-15",
          nama_dokter: "dr. Bunga Lestari",
          catatan: "Deposit promo",
        },
        {
          id: 3,
          faktur_pembayaran: "DEP-2026-0003",
          nama_treatment: "Facial Glow",
          date_created: "2026-03-20",
          date_exp: "2026-05-20",
          nama_dokter: "dr. Candra Wijaya",
          catatan: "-",
        },
      ],

      historyClaim: [
        {
          id: 101,
          faktur_realisasi: "CLM-2026-0001",
          nama_treatment: "Microneedling",
          date_created: "2026-02-01",
          date_edited: "2026-02-05",
          claiming_dokter_nama: "dr. Andi Saputra",
          claiming_nb_nama: "Ns. Rina",
        },
        {
          id: 102,
          faktur_realisasi: "CLM-2026-0002",
          nama_treatment: "Facial Detox",
          date_created: "2026-02-14",
          date_edited: "2026-02-20",
          claiming_dokter_nama: "dr. Bunga Lestari",
          claiming_nb_nama: "Ns. Tika",
        },
      ],

      editExpDialog: false,
      claimDialog: false,
      confirmDialog: false,

      selectedDeposit: null,

      editExpForm: {
        id: null,
        date_exp: "",
      },

      claimForm: {
        id_deposit: null,
        id_dokter: "",
        id_perawat: "",
        catatan_treatment: "",
      },

      claimErrors: {
        id_dokter: "",
        id_perawat: "",
      },

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },
    };
  },

  computed: {
    filteredSaldoDeposit() {
      const q = this.normalize(this.searchDeposit).trim();
      if (!q) return this.saldoDeposit;

      return this.saldoDeposit.filter((item) => {
        return [
          item.faktur_pembayaran,
          item.nama_treatment,
          item.nama_dokter,
          item.catatan,
          this.formatDate(item.date_created),
          this.formatDate(item.date_exp),
        ].some((field) => this.normalize(field).includes(q));
      });
    },

    filteredHistoryClaim() {
      const q = this.normalize(this.searchHistory).trim();
      if (!q) return this.historyClaim;

      return this.historyClaim.filter((item) => {
        return [
          item.faktur_realisasi,
          item.nama_treatment,
          item.claiming_dokter_nama,
          item.claiming_nb_nama,
          this.formatDate(item.date_created),
          this.formatDate(item.date_edited),
        ].some((field) => this.normalize(field).includes(q));
      });
    },

    selectedDokterName() {
      return (
        this.dokterList.find((d) => d.new_id === this.claimForm.id_dokter)
          ?.nama || "-"
      );
    },

    selectedPerawatName() {
      return (
        this.perawatList.find((p) => p.new_id === this.claimForm.id_perawat)
          ?.nama || "-"
      );
    },
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return "-";
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(dateString));
    },

    isExpired(dateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expDate = new Date(dateString);
      expDate.setHours(0, 0, 0, 0);

      return expDate < today;
    },

    normalize(value) {
      return String(value || "").toLowerCase();
    },

    openEditExp(item) {
      this.editExpForm = {
        id: item.id,
        date_exp: item.date_exp,
      };
      this.editExpDialog = true;
    },

    saveExpDate() {
      const index = this.saldoDeposit.findIndex(
        (item) => item.id === this.editExpForm.id,
      );

      if (index !== -1) {
        this.saldoDeposit[index].date_exp = this.editExpForm.date_exp;
      }

      this.editExpDialog = false;
      this.showSnackbar("Tanggal expired berhasil diperbarui", "success");
    },

    openClaimDialog(item) {
      this.selectedDeposit = item;
      this.claimForm = {
        id_deposit: item.id,
        id_dokter: "",
        id_perawat: "",
        catatan_treatment: "",
      };
      this.claimErrors = {
        id_dokter: "",
        id_perawat: "",
      };
      this.claimDialog = true;
    },

    validateAndOpenConfirm() {
      this.claimErrors = {
        id_dokter: "",
        id_perawat: "",
      };

      let valid = true;

      if (!this.claimForm.id_dokter) {
        this.claimErrors.id_dokter = "Silakan pilih dokter";
        valid = false;
      }

      if (!this.claimForm.id_perawat) {
        this.claimErrors.id_perawat = "Silakan pilih perawat";
        valid = false;
      }

      if (!valid) return;

      this.claimDialog = false;
      this.confirmDialog = true;
    },

    submitClaim() {
      if (!this.selectedDeposit) return;

      const deposit = this.selectedDeposit;

      this.historyClaim.unshift({
        id: Date.now(),
        faktur_realisasi: `CLM-${new Date().getTime()}`,
        nama_treatment: deposit.nama_treatment,
        date_created: deposit.date_created,
        date_edited: new Date().toISOString().slice(0, 10),
        claiming_dokter_nama: this.selectedDokterName,
        claiming_nb_nama: this.selectedPerawatName,
      });

      this.saldoDeposit = this.saldoDeposit.filter(
        (item) => item.id !== deposit.id,
      );

      this.confirmDialog = false;
      this.selectedDeposit = null;

      this.showSnackbar("Claim deposit berhasil diproses", "success");
    },

    reprintClaim(item) {
      this.showSnackbar(`Dummy reprint untuk ${item.faktur_realisasi}`, "info");
    },

    showSnackbar(text, color = "success") {
      this.snackbar = {
        show: true,
        text,
        color,
      };
    },
  },
};
</script>

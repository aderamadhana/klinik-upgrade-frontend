<template>
  <v-container fluid class="pa-6">
    <div class="page-header">
      <div>
        <h1 class="page-title">Saldo Deposit Pasien</h1>
        <p class="page-subtitle">
          Monitoring saldo deposit treatment, sisa qty, nilai sisa, tanggal
          expired, dan riwayat claim pasien.
        </p>
      </div>

      <div class="top-action-row">
        <v-btn
          variant="tonal"
          color="secondary"
          prepend-icon="mdi-arrow-left"
          class="toolbar-btn"
          @click="goBack"
        >
          Kembali
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          class="toolbar-btn"
          :loading="loading"
          @click="loadData"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-row class="mb-4" dense>
      <v-col cols="12" md="3">
        <v-card class="summary-card">
          <div class="summary-label">Qty Sisa Aktif</div>
          <div class="summary-value">
            {{ formatQty(summary.aktif_qty_sisa) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Dari {{ summary.aktif_count || 0 }} deposit aktif
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="summary-card">
          <div class="summary-label">Nilai Sisa Aktif</div>
          <div class="summary-value">
            {{ formatCurrency(summary.aktif_nilai_sisa) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Saldo deposit yang masih bisa dipakai
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="summary-card">
          <div class="summary-label">Akan Expired</div>
          <div class="summary-value">
            {{ summary.akan_expired_count || 0 }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Dalam 30 hari ke depan
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="summary-card">
          <div class="summary-label">Expired / Habis</div>
          <div class="summary-value">
            {{ (summary.expired_count || 0) + (summary.habis_count || 0) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            Expired {{ summary.expired_count || 0 }} · Habis
            {{ summary.habis_count || 0 }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="main-card mb-4">
      <div class="section-header">Data Pasien</div>

      <v-card-text>
        <div v-if="loading && !patient.id" class="py-2">
          <v-skeleton-loader type="article" />
        </div>

        <v-row v-else dense>
          <v-col cols="12" md="3">
            <div class="patient-detail-item">
              <div class="patient-detail-label">Nama Pasien</div>
              <div class="patient-detail-value">
                {{ patient.nama || "-" }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="patient-detail-item">
              <div class="patient-detail-label">No. RM</div>
              <div class="patient-detail-value">
                {{ patient.no_rm || "-" }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="patient-detail-item">
              <div class="patient-detail-label">No. HP / WA</div>
              <div class="patient-detail-value">
                {{ patient.no_wa || patient.no_hp || patient.no_telp || "-" }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <div class="patient-detail-item">
              <div class="patient-detail-label">Cabang Daftar</div>
              <div class="patient-detail-value">
                {{ patient.toko_nama || "-" }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="main-card">
      <div class="toolbar-wrap">
        <div class="filter-wrap">
          <v-text-field
            v-model="filters.search"
            class="search-field"
            density="compact"
            variant="outlined"
            label="Cari treatment / invoice / cabang"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            @keyup.enter="loadData"
            @click:clear="handleClearSearch"
          />

          <v-select
            v-model="filters.status"
            class="status-field"
            density="compact"
            variant="outlined"
            label="Status"
            :items="statusOptions"
            hide-details
            @update:model-value="loadData"
          />

          <v-btn
            color="primary"
            variant="tonal"
            class="toolbar-btn"
            prepend-icon="mdi-filter"
            :loading="loading"
            @click="loadData"
          >
            Terapkan
          </v-btn>
        </div>

        <div class="action-wrap">
          <v-chip color="primary" variant="tonal" class="badge-chip">
            Total {{ deposits.length }} data
          </v-chip>

          <v-chip color="success" variant="tonal" class="badge-chip">
            Sisa {{ formatCurrency(summary.total_nilai_sisa) }}
          </v-chip>
        </div>
      </div>

      <div class="table-responsive">
        <v-data-table
          :headers="headers"
          :items="deposits"
          :loading="loading"
          item-value="id"
          density="comfortable"
          class="responsive-table"
          hover
        >
          <template #item.nama_treatment="{ item }">
            <div>
              <div class="service-title">
                {{ getRow(item).nama_treatment || "-" }}
              </div>
              <div class="service-sub">
                Invoice {{ getRow(item).no_invoice || "-" }}
              </div>
              <div class="service-sub">
                {{ getRow(item).toko_beli_nama || "-" }}
              </div>
            </div>
          </template>

          <template #item.tanggal_invoice="{ item }">
            <div>
              <div class="date-main">
                {{ getRow(item).tanggal_invoice_formatted || "-" }}
              </div>
              <div class="d-flex align-center ga-1">
                <div class="date-sub">
                  Expired {{ getRow(item).expired_at_formatted || "-" }}
                </div>

                <v-btn
                  icon="mdi-calendar-edit"
                  size="x-small"
                  variant="text"
                  color="primary"
                  title="Edit tanggal expired"
                  :disabled="!canEditExpiredAt(getRow(item))"
                  @click.stop="openExpiredAtDialog(getRow(item))"
                />
              </div>
            </div>
          </template>

          <template #item.qty="{ item }">
            <div class="text-right">
              <div class="amount-main">
                {{ formatQty(getRow(item).qty_sisa) }}
                /
                {{ formatQty(getRow(item).qty_total) }}
              </div>
              <div class="amount-sub">
                Claimed {{ formatQty(getRow(item).qty_claimed) }}
              </div>
            </div>
          </template>

          <template #item.nilai="{ item }">
            <div class="amount-cell">
              <div class="amount-text">
                {{ formatCurrency(getRow(item).nilai_sisa) }}
              </div>
              <div class="amount-sub">
                Total {{ formatCurrency(getRow(item).total_nilai) }}
              </div>
            </div>
          </template>

          <template #item.referensi_dokter="{ item }">
            <div>
              <div class="doctor-name">
                {{ getRow(item).referensi_dokter_nama || "-" }}
              </div>
              <div class="doctor-channel">
                {{ getRow(item).claim_scope_text || "-" }}
              </div>
            </div>
          </template>

          <template #item.status_text="{ item }">
            <v-chip
              :color="getRow(item).status_color"
              variant="tonal"
              size="small"
              class="badge-chip"
            >
              {{ getRow(item).status_text }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="action-cell">
              <v-btn
                size="small"
                variant="tonal"
                color="success"
                class="text-action-btn"
                prepend-icon="mdi-check-decagram"
                :disabled="
                  getRow(item).status_key !== 'aktif' ||
                  Number(getRow(item).qty_sisa || 0) <= 0
                "
                @click="openClaimProcessDialog(getRow(item))"
              >
                Proses Claim
              </v-btn>

              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                class="text-action-btn"
                prepend-icon="mdi-history"
                @click="openClaimDialog(getRow(item))"
              >
                Riwayat
              </v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="empty-state">
              <v-icon size="42" color="grey">mdi-database-off-outline</v-icon>
              <div class="empty-title">Belum ada saldo deposit</div>
              <div class="empty-description">
                Tidak ada data deposit treatment untuk filter yang dipilih.
              </div>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <v-dialog v-model="expiredAtDialog" max-width="560" persistent>
      <v-card class="dialog-card">
        <div class="dialog-title d-flex justify-space-between align-center">
          <div>Edit Tanggal Expired Deposit</div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="expiredAtSubmitting"
            @click="closeExpiredAtDialog"
          />
        </div>

        <v-divider />

        <v-card-text>
          <v-alert
            v-if="expiredAtError"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="expiredAtError = ''"
          >
            {{ expiredAtError }}
          </v-alert>

          <v-alert type="info" variant="tonal" class="mb-4">
            Perubahan ini hanya mengubah masa berlaku saldo deposit yang masih
            tersisa. Data invoice pembelian tetap menjadi histori transaksi.
          </v-alert>

          <v-row dense>
            <v-col cols="12">
              <v-text-field
                label="Treatment"
                :model-value="expiredAtForm.nama_treatment"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Invoice Pembelian"
                :model-value="expiredAtForm.no_invoice"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Tanggal Expired Saat Ini"
                :model-value="expiredAtForm.expired_at_formatted"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="expiredAtForm.expired_at"
                label="Tanggal Expired Baru"
                type="date"
                :min="todayDate"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn
            variant="tonal"
            :disabled="expiredAtSubmitting"
            @click="closeExpiredAtDialog"
          >
            Batal
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            :loading="expiredAtSubmitting"
            @click="submitExpiredAt"
          >
            Simpan Perubahan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="claimDialog" max-width="900">
      <v-card class="dialog-card">
        <div class="dialog-title d-flex justify-space-between align-center">
          <div>Riwayat Claim Deposit</div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="claimDialog = false"
          />
        </div>

        <v-divider />

        <v-card-text>
          <v-row dense class="mb-4">
            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="label-text">Treatment</div>
                <div class="value-text">
                  {{ selectedDeposit.nama_treatment || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="label-text">Invoice Pembelian</div>
                <div class="value-text">
                  {{ selectedDeposit.no_invoice || "-" }}
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="info-box">
                <div class="label-text">Sisa Deposit</div>
                <div class="value-text">
                  {{ formatQty(selectedDeposit.qty_sisa) }}
                  /
                  {{ formatCurrency(selectedDeposit.nilai_sisa) }}
                </div>
              </div>
            </v-col>
          </v-row>

          <v-table density="compact" class="riwayat-table">
            <thead>
              <tr>
                <th>Tanggal Claim</th>
                <th>Invoice</th>
                <th>Cabang</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Nilai Realisasi</th>
                <th>Dokter / Perawat</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!selectedClaims.length">
                <td colspan="6">
                  <div class="empty-state">
                    <v-icon size="36" color="grey">mdi-history</v-icon>
                    <div class="empty-title">Belum ada claim</div>
                    <div class="empty-description">
                      Deposit ini belum pernah digunakan.
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-for="claim in selectedClaims" :key="claim.id">
                <td>{{ claim.claimed_at_formatted || "-" }}</td>
                <td>
                  <div class="invoice-link">
                    {{ claim.no_invoice || "-" }}
                  </div>
                  <div class="invoice-sub">
                    {{ claim.kode_registrasi || "-" }}
                  </div>
                </td>
                <td>{{ claim.toko_claim_nama || "-" }}</td>
                <td class="text-right">
                  {{ formatQty(claim.qty_claim) }}
                </td>
                <td class="text-right">
                  {{ formatCurrency(claim.nilai_realisasi) }}
                </td>
                <td>
                  <div>{{ claim.dokter_nama || "-" }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ claim.perawat_nama || "-" }}
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="claimDialog = false"> Tutup </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="claimProcessDialog" max-width="760" persistent>
      <v-card class="dialog-card">
        <div class="dialog-title d-flex justify-space-between align-center">
          <div>Proses Claim Deposit</div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="claimSubmitting"
            @click="closeClaimProcessDialog"
          />
        </div>

        <v-divider />

        <v-card-text>
          <v-alert
            v-if="claimError"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="claimError = ''"
          >
            {{ claimError }}
          </v-alert>

          <v-row dense>
            <v-col cols="12">
              <v-text-field
                label="Nama Treatment"
                :model-value="claimForm.nama_treatment"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Sisa Qty"
                :model-value="formatQty(claimForm.qty_sisa)"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Nilai Sisa"
                :model-value="formatCurrency(claimForm.nilai_sisa)"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="claimForm.qty_claim"
                label="Qty Claim"
                type="number"
                min="1"
                :max="claimForm.qty_sisa"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Estimasi Nilai Realisasi"
                :model-value="formatCurrency(estimatedClaimValue)"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="claimForm.claim_dokter_id"
                label="Dokter Claim Treatment"
                :items="claimOptions.dokter"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                clearable
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="claimForm.claim_perawat_id"
                label="Perawat Claim Treatment"
                :items="claimOptions.perawat"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                clearable
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="claimForm.catatan"
                label="Catatan Jika Ada Perubahan Treatment Pasien"
                placeholder="Isi catatan untuk treatment pasien"
                variant="outlined"
                density="compact"
                rows="3"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn
            variant="tonal"
            :disabled="claimSubmitting"
            @click="closeClaimProcessDialog"
          >
            Batal
          </v-btn>

          <v-btn
            color="success"
            variant="flat"
            :loading="claimSubmitting"
            @click="submitClaimDeposit"
          >
            Claim
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import pasienService from "@/services/pasienService";

export default {
  name: "SaldoDepositPasien",

  data() {
    return {
      loading: false,
      errorMessage: "",

      patient: {},
      summary: {},
      deposits: [],

      filters: {
        search: "",
        status: "all",
      },

      statusOptions: [
        { title: "Semua", value: "all" },
        { title: "Aktif", value: "aktif" },
        { title: "Akan Expired", value: "akan_expired" },
        { title: "Expired", value: "expired" },
        { title: "Habis", value: "habis" },
        { title: "Batal", value: "batal" },
      ],

      headers: [
        {
          title: "Treatment / Invoice",
          key: "nama_treatment",
          sortable: false,
        },
        { title: "Tanggal", key: "tanggal_invoice", sortable: false },
        { title: "Qty", key: "qty", align: "end", sortable: false },
        { title: "Nilai", key: "nilai", align: "end", sortable: false },
        { title: "Referensi", key: "referensi_dokter", sortable: false },
        { title: "Status", key: "status_text", sortable: false },
        { title: "Aksi", key: "actions", align: "end", sortable: false },
      ],

      claimDialog: false,
      selectedDeposit: {},

      expiredAtDialog: false,
      expiredAtSubmitting: false,
      expiredAtError: "",
      expiredAtForm: {
        deposit_id: null,
        nama_treatment: "",
        no_invoice: "",
        expired_at: "",
        expired_at_formatted: "",
      },

      claimProcessDialog: false,
      claimSubmitting: false,
      claimError: "",

      claimOptions: {
        dokter: [],
        perawat: [],
      },

      claimForm: {
        deposit_id: null,
        nama_treatment: "",
        qty_sisa: 0,
        nilai_sisa: 0,
        qty_claim: 1,
        claim_dokter_id: null,
        claim_perawat_id: null,
        catatan: "",
      },
    };
  },

  computed: {
    patientId() {
      return this.$route.params.id;
    },

    selectedClaims() {
      return Array.isArray(this.selectedDeposit.claims)
        ? this.selectedDeposit.claims
        : [];
    },

    todayDate() {
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset() * 60000;

      return new Date(now.getTime() - timezoneOffset)
        .toISOString()
        .slice(0, 10);
    },

    estimatedClaimValue() {
      const qtySisa = Number(this.claimForm.qty_sisa || 0);
      const nilaiSisa = Number(this.claimForm.nilai_sisa || 0);
      const qtyClaim = Number(this.claimForm.qty_claim || 0);

      if (qtySisa <= 0 || nilaiSisa <= 0 || qtyClaim <= 0) {
        return 0;
      }

      return Math.min(nilaiSisa, (nilaiSisa / qtySisa) * qtyClaim);
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      if (!this.patientId) {
        this.errorMessage = "ID pasien tidak valid.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await pasienService.riwayatSaldoDeposit(
          this.patientId,
          {
            search: this.filters.search || "",
            status: this.filters.status || "all",
          },
        );

        const payload = response && response.data ? response.data : {};

        this.patient = payload.pasien || {};
        this.summary = payload.summary || {};
        this.deposits = Array.isArray(payload.deposits) ? payload.deposits : [];

        const options = payload.claim_options || {};
        this.claimOptions.dokter = Array.isArray(options.dokter)
          ? options.dokter
          : [];
        this.claimOptions.perawat = Array.isArray(options.perawat)
          ? options.perawat
          : [];
      } catch (error) {
        this.errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal mengambil data saldo deposit pasien.";
      } finally {
        this.loading = false;
      }
    },

    handleClearSearch() {
      this.filters.search = "";
      this.loadData();
    },

    openClaimDialog(item) {
      this.selectedDeposit = item || {};
      this.claimDialog = true;
    },

    canEditExpiredAt(item) {
      const row = this.getRow(item);
      const statusKey = String(row.status_key || "").toLowerCase();

      return (
        ["aktif", "expired"].includes(statusKey) &&
        Number(row.qty_sisa || 0) > 0
      );
    },

    openExpiredAtDialog(item) {
      const row = this.getRow(item);

      if (!this.canEditExpiredAt(row)) {
        return;
      }

      this.expiredAtError = "";
      this.expiredAtForm = {
        deposit_id: row.id || null,
        nama_treatment: row.nama_treatment || "",
        no_invoice: row.no_invoice || "-",
        expired_at: row.expired_at || "",
        expired_at_formatted: row.expired_at_formatted || "-",
      };
      this.expiredAtDialog = true;
    },

    closeExpiredAtDialog() {
      if (this.expiredAtSubmitting) {
        return;
      }

      this.expiredAtDialog = false;
      this.expiredAtError = "";
    },

    async submitExpiredAt() {
      this.expiredAtError = "";

      if (!this.expiredAtForm.deposit_id) {
        this.expiredAtError = "Deposit tidak valid.";
        return;
      }

      if (!this.expiredAtForm.expired_at) {
        this.expiredAtError = "Tanggal expired baru wajib diisi.";
        return;
      }

      if (this.expiredAtForm.expired_at < this.todayDate) {
        this.expiredAtError =
          "Tanggal expired baru tidak boleh lebih kecil dari hari ini.";
        return;
      }

      this.expiredAtSubmitting = true;

      try {
        await pasienService.updateSaldoDepositExpiredAt(
          this.patientId,
          this.expiredAtForm.deposit_id,
          {
            expired_at: this.expiredAtForm.expired_at,
          },
        );

        this.expiredAtDialog = false;
        await this.loadData();
      } catch (error) {
        this.expiredAtError =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal mengubah tanggal expired deposit.";
      } finally {
        this.expiredAtSubmitting = false;
      }
    },

    openClaimProcessDialog(item) {
      const row = this.getRow(item);
      const qtySisa = Number(row.qty_sisa || 0);

      this.claimError = "";

      this.claimForm = {
        deposit_id: row.id || null,
        nama_treatment: row.nama_treatment || "",
        qty_sisa: qtySisa,
        nilai_sisa: Number(row.nilai_sisa || 0),
        qty_claim: qtySisa > 0 ? Math.min(1, qtySisa) : 1,
        claim_dokter_id: null,
        claim_perawat_id: null,
        catatan: "",
      };

      this.claimProcessDialog = true;
    },

    closeClaimProcessDialog() {
      if (this.claimSubmitting) {
        return;
      }

      this.claimProcessDialog = false;
      this.claimError = "";
    },

    async submitClaimDeposit() {
      this.claimError = "";

      if (!this.claimForm.deposit_id) {
        this.claimError = "Deposit tidak valid.";
        return;
      }

      const qtyClaim = Number(this.claimForm.qty_claim || 0);
      const qtySisa = Number(this.claimForm.qty_sisa || 0);

      if (qtyClaim <= 0) {
        this.claimError = "Qty claim wajib lebih dari 0.";
        return;
      }

      if (qtyClaim > qtySisa) {
        this.claimError = "Qty claim melebihi sisa deposit.";
        return;
      }

      this.claimSubmitting = true;

      try {
        await pasienService.claimSaldoDeposit(
          this.patientId,
          this.claimForm.deposit_id,
          {
            qty_claim: qtyClaim,
            claim_dokter_id: this.claimForm.claim_dokter_id,
            claim_perawat_id: this.claimForm.claim_perawat_id,
            catatan: this.claimForm.catatan,
            toko_claim_id:
              this.getActiveTokoId() || this.patient.toko_id || null,
          },
        );

        this.claimProcessDialog = false;
        await this.loadData();
      } catch (error) {
        this.claimError =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal memproses claim deposit.";
      } finally {
        this.claimSubmitting = false;
      }
    },

    isClaimDisabled(item) {
      const row = this.getRow(item);

      return row.status_key !== "aktif" || Number(row.qty_sisa || 0) <= 0;
    },

    goBack() {
      this.$router.back();
    },

    getRow(item) {
      return item?.raw || item || {};
    },

    getActiveTokoId() {
      const raw = localStorage.getItem("selected_toko_id");
      const id = Number(raw || 0);

      return id > 0 ? id : null;
    },

    formatCurrency(value) {
      const number = Number(value || 0);

      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(number);
    },

    formatQty(value) {
      const number = Number(value || 0);

      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2,
      }).format(number);
    },
  },
};
</script>

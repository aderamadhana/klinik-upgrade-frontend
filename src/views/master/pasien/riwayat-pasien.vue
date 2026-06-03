<template>
  <div class="patient-history-page">
    <!-- HEADER -->
    <div class="page-header history-page-header">
      <div>
        <div class="d-flex align-center ga-2 mb-2">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            size="small"
            :to="{ path: '/administrasi/pasien' }"
          />
          <div class="text-caption text-medium-emphasis">Master Pasien</div>
        </div>

        <h1 class="page-title">Riwayat Pasien</h1>
        <p class="page-subtitle">
          Ringkasan identitas, benefit, dan riwayat kunjungan pasien
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" class="pa-0" />
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card class="main-card mb-4 overflow-hidden" variant="outlined">
      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-card-text class="pa-4 pa-md-5">
        <div class="hero-layout">
          <div class="hero-profile">
            <v-avatar color="primary" size="64" class="hero-avatar">
              <span>{{ patientInitial }}</span>
            </v-avatar>

            <div class="hero-content">
              <div class="patient-chip-row mb-2">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ patient.noRm }}
                </v-chip>
                <v-chip
                  size="small"
                  :color="patient.gender === 'Perempuan' ? 'pink' : 'blue'"
                  variant="tonal"
                >
                  {{ patient.gender }}
                </v-chip>
                <v-chip size="small" color="grey" variant="tonal">
                  {{ patient.kategori }}
                </v-chip>
              </div>

              <div class="patient-name-main">
                {{ patient.name }}
              </div>

              <div class="patient-subtitle-main">
                {{ patient.birthPlace }}, {{ formatDate(patient.birthDate) }}
                <span v-if="patient.age !== '-'"
                  >• {{ patient.age }} tahun</span
                >
              </div>

              <div class="patient-meta-line mt-3">
                <div class="meta-inline-item">
                  <v-icon icon="mdi-phone" size="16" />
                  <span>{{ patient.phone }}</span>
                </div>
                <div class="meta-inline-item">
                  <v-icon icon="mdi-map-marker-outline" size="16" />
                  <span>{{ patient.address }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hero-actions">
            <v-btn
              color="primary"
              prepend-icon="mdi-clipboard-text-outline"
              class="action-btn-clean"
              :to="{ name: 'Pengkajian Pasien', params: { id: patient.id } }"
            >
              Pengkajian Awal
            </v-btn>

            <v-btn
              variant="outlined"
              color="primary"
              prepend-icon="mdi-wallet-outline"
              class="action-btn-clean"
              :to="{ name: 'Saldo Deposit', params: { id: patient.id } }"
            >
              Saldo Deposit
            </v-btn>

            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="tonal"
                  color="grey"
                  prepend-icon="mdi-dots-horizontal"
                  class="action-btn-clean"
                >
                  Aksi Lainnya
                </v-btn>
              </template>

              <v-list density="comfortable" min-width="250">
                <v-list-item
                  prepend-icon="mdi-card-account-details"
                  title="Cetak Kartu Depan"
                  @click="handlePrintFrontCard"
                />
                <v-list-item
                  prepend-icon="mdi-card-account-details-outline"
                  title="Cetak Kartu Belakang"
                  @click="handlePrintBackCard"
                />
                <v-list-item
                  prepend-icon="mdi-printer-outline"
                  title="Cetak Label Rekam Medis"
                  @click="handlePrintRmLabel"
                />
                <v-list-item
                  prepend-icon="mdi-face-recognition"
                  title="Skin Analyzer"
                  @click="handleSkinAnalyzer"
                />
              </v-list>
            </v-menu>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-row class="mb-4" dense>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="metric-card" variant="outlined">
          <v-card-text>
            <div class="metric-icon bg-blue-soft">
              <v-icon icon="mdi-calendar-check-outline" size="22" />
            </div>
            <div class="metric-label">Total Kunjungan</div>
            <div class="metric-value">{{ formatNumber(totalKunjungan) }}</div>
            <div class="metric-subtitle">Kunjungan tercatat</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="metric-card" variant="outlined">
          <v-card-text>
            <div class="metric-icon bg-green-soft">
              <v-icon icon="mdi-star-circle-outline" size="22" />
            </div>
            <div class="metric-label">Poin Pasien</div>
            <div class="metric-value">{{ formatNumber(patient.points) }}</div>
            <div class="metric-subtitle">
              Nilai {{ formatCurrency(patient.pointsValue) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="metric-card" variant="outlined">
          <v-card-text>
            <div class="metric-icon bg-purple-soft">
              <v-icon icon="mdi-wallet-outline" size="22" />
            </div>
            <div class="metric-label">Saldo Deposit</div>
            <div class="metric-value metric-currency">
              {{ formatCurrency(patient.depositBalance) }}
            </div>
            <div class="metric-subtitle">Sisa saldo aktif</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="metric-card" variant="outlined">
          <v-card-text>
            <div class="metric-icon bg-orange-soft">
              <v-icon icon="mdi-clock-outline" size="22" />
            </div>
            <div class="metric-label">Kunjungan Terakhir</div>
            <div class="metric-value metric-date">
              {{ formatDate(lastVisitDate) }}
            </div>
            <div class="metric-subtitle">Berdasarkan riwayat terbaru</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="importantWarnings.length"
      class="mb-4"
      type="warning"
      variant="tonal"
      border="start"
    >
      <div class="font-weight-bold mb-1">Perlu perhatian</div>
      <div class="text-body-2">
        {{ importantWarnings.join(" • ") }}
      </div>
    </v-alert>

    <v-row class="mb-4" dense>
      <v-col cols="12" lg="4">
        <v-card class="info-card fill-height" variant="outlined">
          <v-card-title class="info-card-title">
            <v-icon icon="mdi-account-box-outline" size="20" />
            Data Utama
          </v-card-title>
          <v-card-text class="pt-0">
            <div class="info-row">
              <span>NIK</span>
              <strong>{{ patient.nik }}</strong>
            </div>
            <div class="info-row">
              <span>Nomor IHS</span>
              <strong>{{ patient.ihsNumber || "-" }}</strong>
            </div>
            <div class="info-row">
              <span>Agama</span>
              <strong>{{ patient.religion }}</strong>
            </div>
            <div class="info-row">
              <span>Pekerjaan</span>
              <strong>{{ patient.job }}</strong>
            </div>
            <div class="info-row">
              <span>Status Pernikahan</span>
              <strong>{{ patient.maritalStatus }}</strong>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="info-card fill-height" variant="outlined">
          <v-card-title class="info-card-title">
            <v-icon icon="mdi-card-account-phone-outline" size="20" />
            Kontak & Alamat
          </v-card-title>
          <v-card-text class="pt-0">
            <div class="info-row">
              <span>No. HP</span>
              <strong>{{ patient.phone }}</strong>
            </div>
            <div class="info-address-box">
              <div class="info-address-label">Alamat Utama</div>
              <div class="info-address-value">{{ patient.address }}</div>
            </div>
            <v-btn
              block
              size="small"
              variant="tonal"
              color="success"
              prepend-icon="mdi-map-marker-outline"
              class="mt-3 action-btn-clean"
              @click="shippingAddressDialog = true"
            >
              Lihat Alamat Pengiriman
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="info-card fill-height" variant="outlined">
          <v-card-title class="info-card-title">
            <v-icon icon="mdi-shield-check-outline" size="20" />
            Status Data
          </v-card-title>
          <v-card-text class="pt-0">
            <div class="status-list">
              <div class="status-item">
                <div>
                  <div class="status-title">Validasi NIK</div>
                  <div class="status-subtitle">
                    {{
                      patient.nikInvalid
                        ? "Perlu diperbaiki"
                        : "Format sudah sesuai"
                    }}
                  </div>
                </div>
                <v-chip
                  size="small"
                  :color="patient.nikInvalid ? 'error' : 'success'"
                  variant="tonal"
                >
                  {{ patient.nikInvalid ? "Invalid" : "Valid" }}
                </v-chip>
              </div>

              <div class="status-item">
                <div>
                  <div class="status-title">Nomor IHS</div>
                  <div class="status-subtitle">
                    {{
                      patient.ihsNumber ? "Sudah tersedia" : "Belum tersedia"
                    }}
                  </div>
                </div>
                <v-chip
                  size="small"
                  :color="patient.ihsNumber ? 'success' : 'warning'"
                  variant="tonal"
                >
                  {{ patient.ihsNumber ? "Terhubung" : "Belum" }}
                </v-chip>
              </div>

              <div class="status-item">
                <div>
                  <div class="status-title">Kategori Pasien</div>
                  <div class="status-subtitle">
                    Status / tipe pasien saat ini
                  </div>
                </div>
                <v-chip size="small" color="primary" variant="tonal">
                  {{ patient.kategori }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="history-card" variant="outlined">
      <v-card-text class="pa-4 pa-md-5">
        <div class="history-section-header">
          <div>
            <div class="section-kicker">Riwayat Klinik</div>
            <div class="section-title-main">Riwayat Kunjungan</div>
            <div class="section-subtitle-main">
              Ditampilkan per kunjungan agar dokter, perawat, tindakan, produk,
              dan catatan lebih mudah dibaca.
            </div>
          </div>

          <div class="history-toolbar">
            <v-text-field
              v-model="search"
              label="Cari riwayat"
              placeholder="Tindakan, dokter, perawat, catatan"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              class="search-field"
              @update:model-value="onSearch"
            />
          </div>
        </div>

        <v-skeleton-loader
          v-if="loading"
          type="list-item-two-line, list-item-two-line, list-item-two-line"
          class="mt-4"
        />

        <template v-else>
          <div v-if="paginatedRiwayat.length" class="history-list">
            <v-expansion-panels variant="accordion" class="history-panels">
              <v-expansion-panel
                v-for="item in paginatedRiwayat"
                :key="item.id"
                elevation="0"
                class="history-panel"
              >
                <v-expansion-panel-title class="history-panel-title">
                  <div class="history-item-header">
                    <div class="history-date-box">
                      <div class="history-day">{{ formatDay(item.tgl) }}</div>
                      <div class="history-month">
                        {{ formatMonth(item.tgl) }}
                      </div>
                    </div>

                    <div class="history-main">
                      <div class="d-flex align-center flex-wrap ga-2 mb-1">
                        <div class="history-title">
                          {{ item.klinik }}
                        </div>
                        <v-chip size="x-small" color="primary" variant="tonal">
                          {{ item.transaksi }}
                        </v-chip>
                      </div>

                      <div class="history-subline">
                        <span>
                          <v-icon icon="mdi-doctor" size="15" />
                          {{ item.dokter }}
                        </span>
                        <span>
                          <v-icon icon="mdi-account-heart-outline" size="15" />
                          {{ item.perawat }}
                        </span>
                      </div>
                    </div>

                    <div class="history-meta">
                      <div class="history-full-date">
                        {{ formatDate(item.tgl) }}
                      </div>
                      <div class="history-count">
                        {{ item.tindakan.length }} tindakan
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                  <v-row dense>
                    <v-col cols="12" md="5">
                      <div class="detail-block detail-block-treatment">
                        <div class="detail-title-row">
                          <div class="detail-title">
                            <v-icon
                              icon="mdi-face-woman-shimmer-outline"
                              size="18"
                            />
                            Tindakan
                          </div>
                          <v-chip
                            size="x-small"
                            variant="tonal"
                            color="primary"
                          >
                            {{ item.tindakan.length }} item
                          </v-chip>
                        </div>

                        <div v-if="item.tindakan.length">
                          <div
                            v-for="(t, idx) in item.tindakan"
                            :key="idx"
                            class="treatment-row"
                          >
                            <div>
                              <div class="treatment-name">{{ t.nama }}</div>
                              <div class="treatment-staff">
                                Pelaksana: {{ t.perawat }}
                              </div>
                            </div>
                            <v-chip size="x-small" variant="outlined">
                              x{{ t.qty }}
                            </v-chip>
                          </div>
                        </div>

                        <div v-else class="detail-empty">
                          Tidak ada tindakan pada kunjungan ini.
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="3">
                      <div class="detail-block">
                        <div class="detail-title">
                          <v-icon icon="mdi-pill" size="18" />
                          Obat / Produk
                        </div>
                        <div class="detail-text">
                          {{ item.obat || "-" }}
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" md="4">
                      <div class="detail-block">
                        <div class="detail-title">
                          <v-icon icon="mdi-note-text-outline" size="18" />
                          Catatan
                        </div>
                        <div class="detail-text">
                          {{ item.catatan || "-" }}
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <div class="pagination-wrapper">
              <div class="pagination-info">
                Menampilkan {{ paginationLabel.start }}–{{
                  paginationLabel.end
                }}
                dari {{ filteredRiwayat.length }} kunjungan
              </div>

              <v-pagination
                v-model="page"
                :length="pageCount"
                :total-visible="6"
                density="comfortable"
              />
            </div>
          </div>

          <v-empty-state
            v-else
            icon="mdi-file-search-outline"
            title="Riwayat tidak ditemukan"
            text="Coba ubah kata kunci pencarian atau periksa kembali data kunjungan."
          />
        </template>
      </v-card-text>
    </v-card>

    <v-dialog v-model="shippingAddressDialog" max-width="520">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title-row">
          <div>
            <div class="dialog-title-main">Alamat Pengiriman</div>
            <div class="dialog-title-sub">
              Alamat yang digunakan untuk pengiriman pasien
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="shippingAddressDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4">
          <div class="shipping-box">
            <v-icon icon="mdi-map-marker-outline" size="22" />
            <div>{{ patient.shippingAddress }}</div>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="outlined" @click="shippingAddressDialog = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "@/services/api";

const defaultPatient = (id = null) => ({
  id,
  noRm: "-",
  name: "-",
  gender: "-",
  kategori: "-",
  birthPlace: "-",
  birthDate: null,
  age: "-",
  nik: "-",
  nikInvalid: false,
  ihsNumber: "",
  religion: "-",
  job: "-",
  maritalStatus: "-",
  phone: "-",
  address: "-",
  shippingAddress: "-",
  points: 0,
  pointsValue: 0,
  depositBalance: 0,
});

export default {
  name: "PatientHistoryImproved",

  data() {
    return {
      breadcrumbs: [
        { title: "Administrasi", disabled: true },
        { title: "Pasien", disabled: false, to: "/administrasi/pasien" },
        { title: "Riwayat", disabled: true },
      ],
      loading: false,
      errorMessage: "",
      search: "",
      page: 1,
      itemsPerPage: 5,
      shippingAddressDialog: false,
      patient: defaultPatient(this.$route.params.id),
      riwayat: [],
    };
  },

  computed: {
    pasienId() {
      return this.$route.params.id;
    },

    patientInitial() {
      const name = String(this.patient.name || "").trim();

      if (!name || name === "-") {
        return "P";
      }

      return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
    },

    importantWarnings() {
      return [
        this.patient.nikInvalid ? "Format NIK pasien belum valid" : null,
        !this.patient.ihsNumber ? "Nomor IHS pasien belum tersedia" : null,
      ].filter(Boolean);
    },

    totalKunjungan() {
      return this.riwayat.length;
    },

    lastVisitDate() {
      if (!this.riwayat.length) {
        return null;
      }

      return this.riwayat[0]?.tgl || null;
    },

    filteredRiwayat() {
      if (!this.search) return this.riwayat;

      const keyword = String(this.search || "")
        .toLowerCase()
        .trim();

      return this.riwayat.filter((item) => {
        const tindakanText = Array.isArray(item.tindakan)
          ? item.tindakan
              .map((t) => `${t.nama || ""} ${t.perawat || ""} ${t.qty || ""}`)
              .join(" ")
              .toLowerCase()
          : "";

        const haystack = [
          item.tgl,
          item.dokter,
          item.perawat,
          item.obat,
          item.catatan,
          item.transaksi,
          item.klinik,
          tindakanText,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(keyword);
      });
    },

    pageCount() {
      return Math.max(
        1,
        Math.ceil(this.filteredRiwayat.length / this.itemsPerPage),
      );
    },

    paginatedRiwayat() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      return this.filteredRiwayat.slice(start, end);
    },

    paginationLabel() {
      if (!this.filteredRiwayat.length) {
        return { start: 0, end: 0 };
      }

      const start = (this.page - 1) * this.itemsPerPage + 1;
      const end = Math.min(
        this.page * this.itemsPerPage,
        this.filteredRiwayat.length,
      );

      return { start, end };
    },
  },

  watch: {
    pasienId() {
      this.loadData();
    },

    page(val) {
      if (val > this.pageCount) {
        this.page = this.pageCount;
      }
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      if (!this.pasienId) {
        this.patient = defaultPatient();
        this.riwayat = [];
        this.errorMessage = "ID pasien tidak valid.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await api.get(
          `/administrasi/pasien/${this.pasienId}/riwayat`,
          {
            params: {
              limit: 100,
            },
          },
        );

        if (!response.data?.status) {
          throw new Error(
            response.data?.message || "Gagal mengambil riwayat pasien.",
          );
        }

        const payload = response.data?.data || {};
        const patient = payload.patient || {};
        const summary = payload.summary || {};
        const riwayat = Array.isArray(payload.riwayat) ? payload.riwayat : [];

        this.patient = this.mapPatient(patient, summary);
        this.riwayat = riwayat.map((item) => this.mapRiwayatItem(item));
        this.page = 1;
      } catch (error) {
        this.errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Gagal mengambil riwayat pasien.";

        this.patient = defaultPatient(this.pasienId);
        this.riwayat = [];

        console.error("Gagal mengambil riwayat pasien:", error);
      } finally {
        this.loading = false;
      }
    },

    mapPatient(patient, summary = {}) {
      const member = patient.member || {};
      const birthDate = patient.tanggal_lahir || null;

      return {
        id: patient.id || this.pasienId,
        noRm: patient.no_rm || "-",
        name: patient.nama || patient.nama_pasien || "-",
        gender:
          patient.jenis_kelamin_text || this.genderText(patient.jenis_kelamin),
        kategori:
          patient.tipe_pasien_text ||
          member.status_text ||
          summary.member_status ||
          "-",
        birthPlace: patient.tempat_lahir || "-",
        birthDate,
        age: this.calculateAge(birthDate),
        nik: patient.no_identitas || "-",
        nikInvalid: this.isNikInvalid(patient.no_identitas),
        ihsNumber: patient.ihs_number || patient.no_ihs || "",
        religion: patient.agama?.nama_agama || patient.agama?.label || "-",
        job:
          patient.pekerjaan?.nama_pekerjaan || patient.pekerjaan?.label || "-",
        maritalStatus: patient.status_pernikahan_text || "-",
        phone: patient.no_hp || patient.no_wa || patient.no_telp || "-",
        address: patient.alamat_detail || patient.alamat || "-",
        shippingAddress:
          patient.alamat_pengiriman ||
          patient.alamat_detail ||
          patient.alamat ||
          "-",
        points: Number(
          member.point_sisa ??
            member.total_point ??
            summary.member_point_sisa ??
            summary.member_total_point ??
            0,
        ),
        pointsValue: Number(
          member.nilai_point ??
            member.point_value ??
            summary.member_point_value ??
            0,
        ),
        depositBalance: Number(summary.deposit_nilai_sisa || 0),
      };
    },

    mapRiwayatItem(item) {
      const items = Array.isArray(item.items) ? item.items : [];

      const treatmentItems = items.filter((detail) =>
        [2, 4].includes(Number(detail.item_type)),
      );

      const productItems = items.filter((detail) =>
        [3].includes(Number(detail.item_type)),
      );

      const tindakan = treatmentItems.map((detail) => ({
        nama: detail.nama_item || "-",
        qty: this.cleanQty(detail.qty),
        perawat: item.perawat?.nama || detail.perawat_nama || "-",
      }));

      const obat = productItems
        .map((detail) => {
          const qty = this.cleanQty(detail.qty);
          const satuan = detail.satuan ? ` ${detail.satuan}` : "";
          return `${detail.nama_item || "-"} x${qty}${satuan}`;
        })
        .join(", ");

      const catatanParts = [
        item.catatan,
        item.soap?.assessment_note
          ? `Assessment: ${item.soap.assessment_note}`
          : null,
        item.soap?.plan_note ? `Plan: ${item.soap.plan_note}` : null,
        item.intake?.keluhan_utama
          ? `Keluhan: ${item.intake.keluhan_utama}`
          : null,
      ].filter(Boolean);

      return {
        id: item.id || item.registrasi_id || item.kode_registrasi,
        tgl: item.tanggal || item.tanggal_kunjungan || null,
        dokter: item.dokter?.nama || "-",
        perawat: item.perawat?.nama || "-",
        tindakan,
        obat: obat || "-",
        catatan: catatanParts.join(" | ") || "-",
        transaksi:
          item.pembayaran?.jenis_transaksi_text ||
          item.status?.text ||
          "Reguler",
        klinik: item.toko?.nama_toko || "-",
      };
    },

    onSearch() {
      this.page = 1;
    },

    formatDate(value) {
      if (!value) return "-";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    },

    formatDay(value) {
      if (!value) return "--";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "--";
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
      }).format(date);
    },

    formatMonth(value) {
      if (!value) return "---";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "---";
      }

      return new Intl.DateTimeFormat("id-ID", {
        month: "short",
      }).format(date);
    },

    formatNumber(value) {
      return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    },

    genderText(value) {
      if (value === "P") return "Perempuan";
      if (value === "L") return "Laki-laki";
      return value || "-";
    },

    calculateAge(value) {
      if (!value) return "-";

      const birthDate = new Date(value);

      if (Number.isNaN(birthDate.getTime())) {
        return "-";
      }

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age -= 1;
      }

      return age;
    },

    isNikInvalid(value) {
      const digits = String(value || "").replace(/\D/g, "");
      return digits.length > 0 && digits.length !== 16;
    },

    cleanQty(value) {
      const numberValue = Number(value || 0);

      if (Number.isInteger(numberValue)) {
        return numberValue;
      }

      return numberValue;
    },

    handlePrintFrontCard() {
      console.log("Cetak kartu depan");
    },

    handlePrintBackCard() {
      console.log("Cetak kartu belakang");
    },

    handlePrintRmLabel() {
      console.log("Cetak label rekam medis");
    },

    handleSkinAnalyzer() {
      console.log("Open skin analyzer");
    },
  },
};
</script>

<style scoped>
.patient-history-page {
  padding: 16px;
}

.history-page-header {
  align-items: flex-start;
}

.main-card,
.metric-card,
.info-card,
.history-card,
.dialog-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px !important;
  box-shadow: none !important;
  background: #ffffff;
}

.hero-layout {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.hero-profile {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1 1 560px;
  min-width: 280px;
}

.hero-avatar {
  flex: 0 0 auto;
  font-size: 20px;
  font-weight: 800;
}

.hero-content {
  min-width: 0;
}

.patient-chip-row,
.patient-meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.patient-name-main {
  color: #111827;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}

.patient-subtitle-main {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.patient-meta-line {
  color: #475569;
  font-size: 13px;
}

.meta-inline-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 520px;
}

.meta-inline-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  flex: 0 0 auto;
  max-width: 420px;
}

.action-btn-clean {
  text-transform: none !important;
  font-weight: 700;
  letter-spacing: 0;
}

.metric-card {
  height: 100%;
}

.metric-card .v-card-text {
  padding: 16px;
}

.metric-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 12px;
}

.bg-blue-soft {
  color: #1d4ed8;
  background: #eff6ff;
}

.bg-green-soft {
  color: #15803d;
  background: #ecfdf3;
}

.bg-purple-soft {
  color: #7e22ce;
  background: #faf5ff;
}

.bg-orange-soft {
  color: #c2410c;
  background: #fff7ed;
}

.metric-label {
  color: #64748b;
  font-size: 12.5px;
  font-weight: 700;
}

.metric-value {
  margin-top: 6px;
  color: #111827;
  font-size: 25px;
  font-weight: 850;
  line-height: 1.15;
}

.metric-currency {
  font-size: 20px;
}

.metric-date {
  font-size: 17px;
  line-height: 1.25;
}

.metric-subtitle {
  margin-top: 5px;
  color: #94a3b8;
  font-size: 12.5px;
}

.info-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-size: 16px;
  font-weight: 800;
  padding: 16px 16px 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span {
  min-width: 125px;
  color: #64748b;
  font-size: 13px;
}

.info-row strong {
  flex: 1;
  color: #111827;
  font-size: 13.5px;
  font-weight: 750;
  line-height: 1.45;
  text-align: right;
  word-break: break-word;
}

.info-address-box {
  padding: 12px;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  background: #f8fafc;
}

.info-address-label {
  margin-bottom: 5px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.info-address-value {
  color: #111827;
  font-size: 13.5px;
  font-weight: 650;
  line-height: 1.55;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  background: #f8fafc;
}

.status-title {
  color: #111827;
  font-size: 13.5px;
  font-weight: 750;
}

.status-subtitle {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
}

.history-section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.section-kicker {
  margin-bottom: 4px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.section-title-main {
  color: #111827;
  font-size: 20px;
  font-weight: 850;
  line-height: 1.25;
}

.section-subtitle-main {
  margin-top: 5px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.history-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-field {
  width: 360px;
  max-width: 100%;
}

.history-list {
  margin-top: 8px;
}

.history-panels {
  background: transparent !important;
}

.history-panel {
  margin-bottom: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 12px !important;
  background: #ffffff;
}

.history-panel-title {
  padding: 14px 16px !important;
}

.history-item-header {
  width: 100%;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.history-date-box {
  width: 52px;
  min-height: 58px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.history-day {
  color: #111827;
  font-size: 18px;
  font-weight: 850;
  line-height: 1;
}

.history-month {
  margin-top: 5px;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
}

.history-main {
  min-width: 0;
}

.history-title {
  color: #111827;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.3;
}

.history-subline {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 12.8px;
}

.history-subline span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.history-meta {
  text-align: right;
}

.history-full-date {
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.history-count {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.detail-block {
  min-height: 100%;
  padding: 14px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #f8fafc;
}

.detail-block-treatment {
  background: #ffffff;
}

.detail-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: #374151;
  font-size: 12.5px;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.detail-title-row .detail-title {
  margin-bottom: 0;
}

.treatment-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
}

.treatment-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.treatment-name {
  color: #111827;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.35;
}

.treatment-staff {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.detail-text {
  color: #111827;
  font-size: 13.5px;
  line-height: 1.65;
  white-space: pre-line;
}

.detail-empty {
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
  background: #f8fafc;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.pagination-info {
  color: #64748b;
  font-size: 13px;
}

.dialog-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
}

.dialog-title-main {
  color: #111827;
  font-size: 18px;
  font-weight: 800;
}

.dialog-title-sub {
  margin-top: 3px;
  color: #64748b;
  font-size: 12.5px;
}

.shipping-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #f8fafc;
  color: #111827;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 1264px) {
  .hero-actions {
    justify-content: flex-start;
    max-width: none;
  }
}

@media (max-width: 960px) {
  .history-item-header {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .history-meta {
    grid-column: 2 / 3;
    text-align: left;
  }

  .history-full-date {
    white-space: normal;
  }

  .info-row {
    flex-direction: column;
    gap: 4px;
  }

  .info-row span {
    min-width: 0;
  }

  .info-row strong {
    text-align: left;
  }
}

@media (max-width: 600px) {
  .patient-history-page {
    padding: 12px;
  }

  .page-title {
    font-size: 22px;
  }

  .hero-profile {
    flex-direction: column;
  }

  .patient-name-main {
    font-size: 22px;
  }

  .hero-actions,
  .hero-actions .v-btn {
    width: 100%;
  }

  .hero-actions .v-btn {
    justify-content: flex-start;
  }

  .search-field,
  .history-toolbar {
    width: 100%;
  }

  .history-section-header {
    align-items: stretch;
  }

  .history-item-header {
    grid-template-columns: 1fr;
  }

  .history-date-box {
    width: 100%;
    min-height: 46px;
    flex-direction: row;
    gap: 6px;
  }

  .history-meta {
    grid-column: auto;
  }

  .pagination-wrapper {
    align-items: flex-start;
  }
}
</style>

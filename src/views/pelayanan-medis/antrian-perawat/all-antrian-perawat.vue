<template>
  <div>
    <div class="page-header d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="page-title">Antrian Perawat</h1>
        <p class="page-subtitle">
          Kelola antrian pasien yang menunggu tindakan perawat atau beautician
        </p>
      </div>

      <v-breadcrumbs :items="breadcrumbs" divider="/" />
    </div>

    <v-card class="main-card">
      <div class="section-header">Daftar Antrian Perawat</div>

      <v-card-text class="pa-5">
        <div class="toolbar-wrap mb-5">
          <div class="d-flex flex-wrap gap-2 align-center">
            <v-chip color="success" variant="tonal" prepend-icon="mdi-refresh">
              Auto Refresh 30 detik
            </v-chip>
          </div>

          <div class="toolbar-filter">
            <v-text-field
              v-model="search"
              placeholder="Cari no RM, nama pasien, tindakan, dokter, petugas..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="filter-search"
            />

            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="comfortable"
              hide-details
              class="filter-select"
            />

            <v-select
              v-model="filterPetugas"
              :items="petugasOptions"
              label="Petugas"
              variant="outlined"
              density="comfortable"
              hide-details
              class="filter-select"
            />
          </div>
        </div>

        <v-row class="mb-2">
          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Total Antrian</div>
                <div class="summary-value">{{ summary.total }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Menunggu</div>
                <div class="summary-value">{{ summary.menunggu }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Diproses</div>
                <div class="summary-value">{{ summary.diproses }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card class="summary-card">
              <v-card-text>
                <div class="summary-label">Selesai</div>
                <div class="summary-value">{{ summary.selesai }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :loading="loading"
          item-value="id"
          class="table-section"
          loading-text="Memuat data antrian perawat..."
          no-data-text="Data antrian perawat tidak ditemukan"
        >
          <template #item.no="{ item }">
            {{ item.no }}
          </template>

          <template #item.pasien="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ item.nama_pasien }}</span>
              <span class="text-caption text-medium-emphasis">
                {{ item.no_rm }} • {{ item.no_hp }}
              </span>
            </div>
          </template>

          <template #item.tanggal="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">
                {{ item.tanggal_kunjungan }}
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ item.nama_tindakan }}
              </span>
            </div>
          </template>

          <template #item.keterangan="{ item }">
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                size="small"
                :color="item.cppt ? 'indigo' : 'indigo'"
                variant="tonal"
                class="badge-chip badge-chip--cppt"
              >
                {{ item.cppt ? "CPPT sudah diinput" : "CPPT belum diinput" }}
              </v-chip>

              <v-chip
                size="small"
                :color="item.before_after ? 'cyan-darken-1' : 'cyan-darken-1'"
                variant="tonal"
                class="badge-chip badge-chip--before-after"
              >
                {{
                  item.before_after
                    ? "Before/After sudah diinput"
                    : "Before/After belum diinput"
                }}
              </v-chip>

              <v-chip
                size="small"
                :color="
                  item.bahan_treatment ? 'orange-darken-1' : 'orange-darken-1'
                "
                variant="tonal"
                class="badge-chip badge-chip--bahan"
              >
                {{
                  item.bahan_treatment
                    ? "Bahan Treatment sudah diinput"
                    : "Bahan Treatment belum diinput"
                }}
              </v-chip>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              variant="flat"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.aksi="{ item }">
            <div class="action-group">
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-stethoscope"
                class="action-btn"
                @click="goToInputCppt(item)"
              >
                CPPT
              </v-btn>

              <v-btn
                size="small"
                color="success"
                variant="tonal"
                prepend-icon="mdi-camera"
                class="action-btn"
                @click="goToInputBeforeAfter(item)"
              >
                Before/After
              </v-btn>

              <v-btn
                size="small"
                color="warning"
                variant="tonal"
                prepend-icon="mdi-flask"
                class="action-btn"
                @click="goToInputBahanTreatment(item)"
              >
                Bahan Treatment
              </v-btn>

              <v-btn
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete-outline"
                class="action-btn"
                @click="confirmDelete(item)"
              >
                Hapus
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogDelete" max-width="420">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">Konfirmasi Hapus</v-card-title>

        <v-card-text class="pt-2">
          <div class="mb-2">Data antrian perawat ini akan dihapus.</div>

          <div v-if="selectedItem" class="delete-dialog-info">
            <div><strong>Pasien:</strong> {{ selectedItem.nama_pasien }}</div>
            <div><strong>No. RM:</strong> {{ selectedItem.no_rm }}</div>
            <div>
              <strong>No. Antrian:</strong> {{ selectedItem.nomor_antrian }}
            </div>
            <div>
              <strong>Tindakan:</strong> {{ selectedItem.nama_tindakan }}
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="dialogDelete = false"
          >
            Batal
          </v-btn>

          <v-btn color="error" :loading="deleteLoading" @click="deleteItem">
            Ya, Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "AllAntrianPerawat",
  data() {
    return {
      loading: false,
      isFetching: false,
      autoRefreshInterval: null,
      refreshIntervalMs: 30000,

      search: "",
      filterStatus: "Semua",
      filterPetugas: "Semua",

      dialogDelete: false,
      deleteLoading: false,
      selectedItem: null,

      breadcrumbs: [
        { title: "Home", disabled: false, href: "/" },
        { title: "Pelayanan Medis", disabled: true },
        { title: "Antrian Perawat", disabled: true },
      ],

      statusOptions: ["Semua", "Menunggu", "Diproses", "Selesai"],
      petugasOptions: ["Semua", "Perawat", "Beautician"],

      headers: [
        { title: "No", key: "no", sortable: false },
        { title: "Pasien", key: "pasien", sortable: false },
        { title: "Tanggal", key: "tanggal", sortable: false },
        { title: "Keterangan", key: "keterangan", sortable: false },
        { title: "Status", key: "status", sortable: false },
        { title: "Aksi", key: "aksi", sortable: false, align: "end" },
      ],

      items: [
        {
          id: 1,
          nomor_antrian: "P-001",
          nama_pasien: "ADE RAMADHANA PRATAMA",
          no_rm: "B20240101001",
          no_hp: "6281234567890",
          tanggal_kunjungan: "2026-04-23",
          waktu_kunjungan: "09:15",
          nama_tindakan: "Facial Acne",
          qty: 1,
          harga: 250000,
          dokter: "Dr. Rayi Vialita Poetri",
          petugas: "Beautician",
          cppt: false,
          before_after: false,
          bahan_treatment: false,
        },
        {
          id: 2,
          nomor_antrian: "P-002",
          nama_pasien: "TIARA THERESIA",
          no_rm: "B20240214012",
          no_hp: "6282233344455",
          tanggal_kunjungan: "2026-04-22",
          waktu_kunjungan: "09:40",
          nama_tindakan: "Laser Toning",
          qty: 1,
          harga: 450000,
          dokter: "Dr. Rayi Vialita Poetri",
          petugas: "Perawat",
          cppt: false,
          before_after: false,
          bahan_treatment: false,
        },
        {
          id: 3,
          nomor_antrian: "P-003",
          nama_pasien: "SULISTIANA WATI",
          no_rm: "B20231107088",
          no_hp: "6281119998877",
          tanggal_kunjungan: "2026-04-20",
          waktu_kunjungan: "10:05",
          nama_tindakan: "Infus Whitening",
          qty: 1,
          harga: 350000,
          dokter: "Dr. Fajar Nugroho",
          petugas: "Perawat",
          cppt: true,
          before_after: false,
          bahan_treatment: false,
        },
        {
          id: 4,
          nomor_antrian: "P-004",
          nama_pasien: "SILATUL AZIZAH",
          no_rm: "B20250112007",
          no_hp: "6285767788990",
          tanggal_kunjungan: "2026-04-19",
          waktu_kunjungan: "10:30",
          nama_tindakan: "Chemical Peeling",
          qty: 1,
          harga: 300000,
          dokter: "Dr. Fajar Nugroho",
          petugas: "Beautician",
          cppt: true,
          before_after: true,
          bahan_treatment: true,
        },
      ],
    };
  },

  computed: {
    normalizedItems() {
      return this.items.map((item) => ({
        ...item,
        status: this.getCalculatedStatus(item),
      }));
    },

    filteredItems() {
      return this.normalizedItems
        .filter((item) => {
          const keyword = this.search.toLowerCase();

          const matchSearch =
            !keyword ||
            String(item.nomor_antrian).toLowerCase().includes(keyword) ||
            String(item.nama_pasien).toLowerCase().includes(keyword) ||
            String(item.no_rm).toLowerCase().includes(keyword) ||
            String(item.no_hp).toLowerCase().includes(keyword) ||
            String(item.nama_tindakan).toLowerCase().includes(keyword) ||
            String(item.dokter).toLowerCase().includes(keyword) ||
            String(item.petugas).toLowerCase().includes(keyword);

          const matchStatus =
            this.filterStatus === "Semua" || item.status === this.filterStatus;

          const matchPetugas =
            this.filterPetugas === "Semua" ||
            item.petugas === this.filterPetugas;

          return matchSearch && matchStatus && matchPetugas;
        })
        .map((item, index) => ({
          ...item,
          no: index + 1,
        }));
    },

    summary() {
      return {
        total: this.normalizedItems.length,
        menunggu: this.normalizedItems.filter((x) => x.status === "Menunggu")
          .length,
        diproses: this.normalizedItems.filter((x) => x.status === "Diproses")
          .length,
        selesai: this.normalizedItems.filter((x) => x.status === "Selesai")
          .length,
      };
    },
  },

  methods: {
    async loadData({ silent = false } = {}) {
      if (this.isFetching) return;

      this.isFetching = true;
      if (!silent) this.loading = true;

      try {
        // const response = await this.$axios.get('/pelayanan-medis/antrian-perawat');
        // this.items = response.data?.data || [];
        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch (error) {
        console.error("Gagal memuat data antrian perawat:", error);
      } finally {
        this.loading = false;
        this.isFetching = false;
      }
    },

    startAutoRefresh() {
      this.stopAutoRefresh();
      this.autoRefreshInterval = setInterval(() => {
        this.loadData({ silent: true });
      }, this.refreshIntervalMs);
    },

    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },

    getCalculatedStatus(item) {
      const hasCppt = Boolean(item.cppt);
      const hasBeforeAfter = Boolean(item.before_after);
      const hasBahanTreatment = Boolean(item.bahan_treatment);

      if (hasCppt && hasBeforeAfter && hasBahanTreatment) {
        return "Selesai";
      }

      if (hasCppt || hasBeforeAfter || hasBahanTreatment) {
        return "Diproses";
      }

      return "Menunggu";
    },

    getStatusColor(status) {
      const colors = {
        Menunggu: "grey",
        Diproses: "info",
        Selesai: "success",
      };

      return colors[status] || "secondary";
    },

    goToInputCppt(item) {
      this.$router.push(
        `/pelayanan-medis/antrian-perawat/${item.id}/input-cppt`,
      );
    },

    goToInputBeforeAfter(item) {
      this.$router.push(
        `/pelayanan-medis/antrian-perawat/${item.id}/input-before-after`,
      );
    },

    goToInputBahanTreatment(item) {
      this.$router.push(
        `/pelayanan-medis/antrian-perawat/${item.id}/input-bahan-treatment`,
      );
    },

    confirmDelete(item) {
      this.selectedItem = { ...item };
      this.dialogDelete = true;
    },

    async deleteItem() {
      if (!this.selectedItem) return;

      this.deleteLoading = true;

      try {
        // await this.$axios.delete(`/pelayanan-medis/antrian-perawat/${this.selectedItem.id}`);
        this.items = this.items.filter(
          (row) => row.id !== this.selectedItem.id,
        );

        this.dialogDelete = false;
        this.selectedItem = null;
      } catch (error) {
        console.error("Gagal menghapus data antrian perawat:", error);
      } finally {
        this.deleteLoading = false;
      }
    },
  },

  mounted() {
    this.loadData();
    this.startAutoRefresh();
  },

  beforeUnmount() {
    this.stopAutoRefresh();
  },

  beforeDestroy() {
    this.stopAutoRefresh();
  },
};
</script>

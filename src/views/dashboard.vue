<template>
  <div class="dashboard-page">
    <div class="dashboard-title-row">
      <div>
        <h1 class="dashboard-title">Dashboard</h1>
        <div class="dashboard-subtitle">
          Ringkasan aktivitas sesuai user login, role aktif, cabang, dan periode
        </div>
      </div>

      <div class="dashboard-filter-row">
        <v-text-field
          v-model="filter.date_from"
          type="date"
          density="compact"
          variant="outlined"
          hide-details
          class="date-filter"
          label="Dari"
          @change="fetchSummary"
        />

        <v-text-field
          v-model="filter.date_to"
          type="date"
          density="compact"
          variant="outlined"
          hide-details
          class="date-filter"
          label="Sampai"
          @change="fetchSummary"
        />
      </div>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card
      class="dashboard-hero"
      :class="currentDashboard.themeClass"
      elevation="0"
    >
      <div class="hero-content">
        <div class="hero-user-row">
          <v-avatar class="hero-user-avatar" size="68">
            {{ userInitial }}
          </v-avatar>

          <div class="hero-user-info">
            <div class="hero-date">
              {{ currentDateText }}
            </div>

            <h2 class="hero-greeting">
              Selamat datang,
              <span>{{ userName }}</span>
            </h2>

            <div class="hero-context-row">
              <div class="hero-context-chip">
                <v-icon size="16">mdi-account-key-outline</v-icon>
                <span>{{ displayRoleName }}</span>
              </div>

              <div class="hero-context-chip">
                <v-icon size="16">mdi-storefront-outline</v-icon>
                <span>{{ selectedTokoName }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-workspace-card">
          <div class="workspace-icon">
            <v-icon size="22">{{ currentDashboard.icon }}</v-icon>
          </div>

          <div>
            <div class="workspace-title">
              {{ currentDashboard.title }}
            </div>
            <div class="workspace-subtitle">
              {{ currentDashboard.subtitle }}
            </div>
          </div>
        </div>

        <div class="hero-action-row">
          <v-btn
            color="white"
            variant="flat"
            class="hero-primary-btn"
            :prepend-icon="currentDashboard.primaryAction.icon"
            @click="goTo(currentDashboard.primaryAction.to)"
          >
            {{ currentDashboard.primaryAction.label }}
          </v-btn>

          <v-btn
            color="white"
            variant="tonal"
            class="hero-secondary-btn"
            prepend-icon="mdi-refresh"
            :disabled="loading"
            @click="fetchSummary"
          >
            {{ loading ? "Memuat Data" : "Refresh Data" }}
          </v-btn>
        </div>
      </div>

      <div class="hero-ornament">
        <v-icon>{{ currentDashboard.heroIcon }}</v-icon>
      </div>
    </v-card>

    <div class="report-head">
      <div>
        <div class="report-title">Report</div>
        <div class="report-subtitle">
          Data real sesuai role, cabang aktif, dan periode terpilih
        </div>
      </div>

      <v-chip
        color="primary"
        variant="tonal"
        size="small"
        class="font-weight-bold"
      >
        {{ selectedTokoName }}
      </v-chip>
    </div>

    <v-row>
      <v-col
        v-for="stat in displayStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="report-card" elevation="0">
          <div class="report-card-icon" :class="stat.iconClass">
            <v-icon size="28">{{ stat.icon }}</v-icon>
          </div>

          <div class="report-card-label">{{ stat.title }}</div>

          <div class="report-card-value">
            <v-progress-circular
              v-if="loading"
              indeterminate
              size="26"
              width="3"
            />
            <span v-else>{{ stat.value }}</span>
          </div>

          <div class="report-card-desc">{{ stat.description }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="quick-panel" elevation="0">
      <div class="quick-panel-head">
        <div>
          <div class="quick-title">Akses Cepat</div>
          <div class="quick-subtitle">
            Menu utama yang paling relevan untuk user ini
          </div>
        </div>

        <v-icon color="primary" size="24">mdi-lightning-bolt-outline</v-icon>
      </div>

      <v-row>
        <v-col
          v-for="action in currentDashboard.quickActions"
          :key="action.label"
          cols="12"
          sm="6"
          md="3"
        >
          <v-btn
            block
            variant="tonal"
            :color="action.color"
            class="quick-btn"
            :prepend-icon="action.icon"
            @click="goTo(action.to)"
          >
            {{ action.label }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import dashboardService from "@/services/dashboardService";

const dashboardConfigs = {
  administrator: {
    title: "Pusat Kontrol Sistem Klinik",
    subtitle:
      "Kontrol master data, user, cabang, akses sistem, dan kesiapan operasional.",
    icon: "mdi-shield-crown-outline",
    heroIcon: "mdi-view-dashboard-edit-outline",
    themeClass: "theme-admin",
    primaryAction: {
      label: "Kelola Master",
      icon: "mdi-database-cog-outline",
      to: "/master/pasien",
    },
    stats: [
      {
        key: "master_data",
        title: "Master Data",
        description: "Pasien, produk, dan treatment",
        icon: "mdi-database-outline",
        iconClass: "icon-blue",
      },
      {
        key: "user_aktif",
        title: "User Aktif",
        description: "User aktif di sistem",
        icon: "mdi-account-group-outline",
        iconClass: "icon-purple",
      },
      {
        key: "cabang",
        title: "Cabang",
        description: "Entity/cabang aktif",
        icon: "mdi-storefront-outline",
        iconClass: "icon-cyan",
      },
      {
        key: "audit",
        title: "Audit",
        description: "Aktivitas sistem periode ini",
        icon: "mdi-file-search-outline",
        iconClass: "icon-orange",
      },
    ],
    quickActions: [
      {
        label: "Master Pasien",
        icon: "mdi-account-injury-outline",
        color: "primary",
        to: "/master/pasien",
      },
      {
        label: "Master Karyawan",
        icon: "mdi-account-tie-outline",
        color: "indigo",
        to: "/master/karyawan",
      },
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
      {
        label: "Registrasi",
        icon: "mdi-clipboard-list-outline",
        color: "purple",
        to: "/resepsionis/registrasi-layanan",
      },
    ],
  },

  superuser: {
    title: "Superuser Control Room",
    subtitle: "Pantau modul penting dan pastikan transaksi berjalan stabil.",
    icon: "mdi-account-supervisor-circle-outline",
    heroIcon: "mdi-monitor-dashboard",
    themeClass: "theme-superuser",
    primaryAction: {
      label: "Buka Pembayaran",
      icon: "mdi-cash-register",
      to: "/kasir/pembayaran",
    },
    stats: [
      {
        key: "transaksi",
        title: "Transaksi",
        description: "Status transaksi lintas cabang",
        icon: "mdi-receipt-text-outline",
        iconClass: "icon-blue",
      },
      {
        key: "registrasi",
        title: "Registrasi",
        description: "Layanan masuk periode ini",
        icon: "mdi-clipboard-list-outline",
        iconClass: "icon-purple",
      },
      {
        key: "pelayanan",
        title: "Pelayanan",
        description: "Dokter, treatment, dan perawat",
        icon: "mdi-doctor",
        iconClass: "icon-cyan",
      },
      {
        key: "stok",
        title: "Stok",
        description: "Produk menipis/habis",
        icon: "mdi-package-variant-closed",
        iconClass: "icon-orange",
      },
    ],
    quickActions: [
      {
        label: "Registrasi",
        icon: "mdi-clipboard-plus-outline",
        color: "purple",
        to: "/resepsionis/registrasi-layanan",
      },
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
      {
        label: "Pasien",
        icon: "mdi-account-injury-outline",
        color: "primary",
        to: "/master/pasien",
      },
      {
        label: "Produk",
        icon: "mdi-package-variant-closed",
        color: "orange",
        to: "/master/produk",
      },
    ],
  },

  it: {
    title: "IT Monitoring Center",
    subtitle:
      "Pantau stabilitas aplikasi, audit log, user access, error, dan integrasi.",
    icon: "mdi-laptop-account",
    heroIcon: "mdi-console-network-outline",
    themeClass: "theme-it",
    primaryAction: {
      label: "Cek Audit Log",
      icon: "mdi-file-search-outline",
      to: "/system/audit-logs",
    },
    stats: [
      {
        key: "error_log",
        title: "Error Log",
        description: "Issue teknis yang perlu dicek",
        icon: "mdi-alert-circle-outline",
        iconClass: "icon-red",
      },
      {
        key: "user_login",
        title: "User Login",
        description: "Aktivitas akses sistem",
        icon: "mdi-login-variant",
        iconClass: "icon-blue",
      },
      {
        key: "audit_trail",
        title: "Audit Trail",
        description: "Perubahan data penting",
        icon: "mdi-file-document-alert-outline",
        iconClass: "icon-cyan",
      },
      {
        key: "integrasi",
        title: "Integrasi",
        description: "Pending/gagal sinkronisasi",
        icon: "mdi-cloud-sync-outline",
        iconClass: "icon-green",
      },
    ],
    quickActions: [
      {
        label: "Audit Logs",
        icon: "mdi-file-search-outline",
        color: "cyan",
        to: "/system/audit-logs",
      },
      {
        label: "Master User",
        icon: "mdi-account-cog-outline",
        color: "blue",
        to: "/master/user",
      },
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
      {
        label: "Registrasi",
        icon: "mdi-clipboard-list-outline",
        color: "purple",
        to: "/resepsionis/registrasi-layanan",
      },
    ],
  },

  management: {
    title: "Executive Clinic Overview",
    subtitle:
      "Lihat transaksi, kunjungan, performa cabang, dan indikator layanan.",
    icon: "mdi-chart-box-outline",
    heroIcon: "mdi-chart-areaspline",
    themeClass: "theme-management",
    primaryAction: {
      label: "Lihat Pembayaran",
      icon: "mdi-finance",
      to: "/kasir/pembayaran",
    },
    stats: [
      {
        key: "revenue",
        title: "Revenue",
        description: "Pendapatan lunas periode ini",
        icon: "mdi-cash-multiple",
        iconClass: "icon-green",
        format: "currency",
      },
      {
        key: "visit",
        title: "Visit",
        description: "Jumlah kunjungan pasien",
        icon: "mdi-account-multiple-check-outline",
        iconClass: "icon-blue",
      },
      {
        key: "aov",
        title: "AOV",
        description: "Rata-rata transaksi lunas",
        icon: "mdi-chart-line",
        iconClass: "icon-purple",
        format: "currency",
      },
      {
        key: "cabang_aktif",
        title: "Cabang Aktif",
        description: "Cabang dengan transaksi lunas",
        icon: "mdi-store-check-outline",
        iconClass: "icon-cyan",
      },
    ],
    quickActions: [
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
      {
        label: "Registrasi",
        icon: "mdi-clipboard-list-outline",
        color: "blue",
        to: "/resepsionis/registrasi-layanan",
      },
      {
        label: "Pasien",
        icon: "mdi-account-injury-outline",
        color: "purple",
        to: "/master/pasien",
      },
      {
        label: "Produk",
        icon: "mdi-package-variant-closed",
        color: "orange",
        to: "/master/produk",
      },
    ],
  },

  front_office: {
    title: "Front Office Service Desk",
    subtitle:
      "Kelola registrasi layanan, data pasien, bukti konsultasi online, dan alur pasien.",
    icon: "mdi-clipboard-account-outline",
    heroIcon: "mdi-account-plus-outline",
    themeClass: "theme-fo",
    primaryAction: {
      label: "Registrasi Layanan",
      icon: "mdi-clipboard-plus-outline",
      to: "/resepsionis/registrasi-layanan",
    },
    stats: [
      {
        key: "registrasi",
        title: "Registrasi",
        description: "Layanan masuk periode ini",
        icon: "mdi-clipboard-list-outline",
        iconClass: "icon-purple",
      },
      {
        key: "antrian_dokter",
        title: "Antrian Dokter",
        description: "Pasien menunggu dokter",
        icon: "mdi-doctor",
        iconClass: "icon-blue",
      },
      {
        key: "antrian_perawat",
        title: "Antrian Perawat",
        description: "Pasien menunggu tindakan",
        icon: "mdi-account-heart-outline",
        iconClass: "icon-cyan",
      },
      {
        key: "belum_bayar",
        title: "Belum Bayar",
        description: "Perlu diarahkan ke kasir",
        icon: "mdi-cash-clock",
        iconClass: "icon-orange",
      },
    ],
    quickActions: [
      {
        label: "Entry Registrasi",
        icon: "mdi-clipboard-plus-outline",
        color: "purple",
        to: "/resepsionis/registrasi-layanan/add",
      },
      {
        label: "List Registrasi",
        icon: "mdi-format-list-bulleted",
        color: "blue",
        to: "/resepsionis/registrasi-layanan",
      },
      {
        label: "Data Pasien",
        icon: "mdi-account-injury-outline",
        color: "teal",
        to: "/master/pasien",
      },
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
    ],
  },

  dokter: {
    title: "Doctor Workspace",
    subtitle:
      "Kelola konsultasi, assessment, SOAP, subjective, diagnosa, dan treatment pasien.",
    icon: "mdi-doctor",
    heroIcon: "mdi-stethoscope",
    themeClass: "theme-dokter",
    primaryAction: {
      label: "Antrian Dokter",
      icon: "mdi-account-clock-outline",
      to: "/pelayanan-medis/antrian-dokter",
    },
    stats: [
      {
        key: "antrian_dokter",
        title: "Menunggu",
        description: "Pasien menunggu konsultasi",
        icon: "mdi-account-clock-outline",
        iconClass: "icon-blue",
      },
      {
        key: "soap_draft",
        title: "SOAP Draft",
        description: "Catatan belum selesai",
        icon: "mdi-file-document-edit-outline",
        iconClass: "icon-orange",
      },
      {
        key: "konsultasi_selesai",
        title: "Selesai",
        description: "Konsultasi selesai periode ini",
        icon: "mdi-check-decagram-outline",
        iconClass: "icon-green",
      },
      {
        key: "treatment",
        title: "Treatment",
        description: "Registrasi dengan treatment",
        icon: "mdi-face-woman-shimmer-outline",
        iconClass: "icon-cyan",
      },
    ],
    quickActions: [
      {
        label: "Antrian Dokter",
        icon: "mdi-account-clock-outline",
        color: "blue",
        to: "/pelayanan-medis/antrian-dokter",
      },
      {
        label: "Riwayat Pasien",
        icon: "mdi-history",
        color: "teal",
        to: "/master/pasien",
      },
      {
        label: "Registrasi",
        icon: "mdi-clipboard-list-outline",
        color: "purple",
        to: "/resepsionis/registrasi-layanan",
      },
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
    ],
  },

  apoteker: {
    title: "Apotek & Produk Control",
    subtitle: "Pantau resep, produk, stok, mutasi, dan kesiapan obat.",
    icon: "mdi-pill",
    heroIcon: "mdi-medication-outline",
    themeClass: "theme-apotek",
    primaryAction: {
      label: "Cek Produk",
      icon: "mdi-package-variant-closed",
      to: "/master/produk",
    },
    stats: [
      {
        key: "resep",
        title: "Resep",
        description: "Resep/obat perlu proses",
        icon: "mdi-prescription",
        iconClass: "icon-green",
      },
      {
        key: "stok_menipis",
        title: "Stok Menipis",
        description: "Produk perlu perhatian",
        icon: "mdi-package-variant-remove",
        iconClass: "icon-orange",
      },
      {
        key: "mutasi",
        title: "Mutasi",
        description: "Pergerakan produk",
        icon: "mdi-swap-horizontal-bold",
        iconClass: "icon-cyan",
      },
      {
        key: "produk_habis",
        title: "Produk Habis",
        description: "Tidak siap dijual",
        icon: "mdi-alert-box-outline",
        iconClass: "icon-red",
      },
    ],
    quickActions: [
      {
        label: "Master Produk",
        icon: "mdi-package-variant-closed",
        color: "green",
        to: "/master/produk",
      },
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "teal",
        to: "/kasir/pembayaran",
      },
      {
        label: "Pasien",
        icon: "mdi-account-injury-outline",
        color: "blue",
        to: "/master/pasien",
      },
      {
        label: "Registrasi",
        icon: "mdi-clipboard-list-outline",
        color: "purple",
        to: "/resepsionis/registrasi-layanan",
      },
    ],
  },

  branch_accounting: {
    title: "Branch Accounting Desk",
    subtitle:
      "Validasi pembayaran, metode bayar, invoice lunas, dan kontrol kas cabang.",
    icon: "mdi-calculator-variant-outline",
    heroIcon: "mdi-cash-register",
    themeClass: "theme-accounting",
    primaryAction: {
      label: "Data Pembayaran",
      icon: "mdi-cash-register",
      to: "/kasir/pembayaran",
    },
    stats: [
      {
        key: "invoice_lunas",
        title: "Invoice Lunas",
        description: "Transaksi selesai dibayar",
        icon: "mdi-receipt-text-check-outline",
        iconClass: "icon-green",
      },
      {
        key: "invoice_belum_lunas",
        title: "Belum Lunas",
        description: "Perlu validasi kasir",
        icon: "mdi-receipt-clock-outline",
        iconClass: "icon-orange",
      },
      {
        key: "metode_bayar",
        title: "Metode Bayar",
        description: "Baris metode bayar periode ini",
        icon: "mdi-credit-card-multiple-outline",
        iconClass: "icon-blue",
      },
      {
        key: "selisih",
        title: "Selisih",
        description: "Sisa tagihan/perlu pengecekan",
        icon: "mdi-scale-balance",
        iconClass: "icon-red",
      },
    ],
    quickActions: [
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
      {
        label: "Registrasi",
        icon: "mdi-clipboard-list-outline",
        color: "blue",
        to: "/resepsionis/registrasi-layanan",
      },
      {
        label: "Pasien",
        icon: "mdi-account-injury-outline",
        color: "orange",
        to: "/master/pasien",
      },
      {
        label: "Produk",
        icon: "mdi-package-variant-closed",
        color: "teal",
        to: "/master/produk",
      },
    ],
  },

  security: {
    title: "Security Front Monitoring",
    subtitle: "Pantau kedatangan pasien, antrian masuk, dan flow awal ke FO.",
    icon: "mdi-shield-account-outline",
    heroIcon: "mdi-security",
    themeClass: "theme-security",
    primaryAction: {
      label: "Lihat Antrian",
      icon: "mdi-account-clock-outline",
      to: "/antrian",
    },
    stats: [
      {
        key: "pasien_hadir",
        title: "Pasien Hadir",
        description: "Kedatangan periode ini",
        icon: "mdi-account-check-outline",
        iconClass: "icon-blue",
      },
      {
        key: "antrian",
        title: "Antrian",
        description: "Menunggu layanan",
        icon: "mdi-account-clock-outline",
        iconClass: "icon-cyan",
      },
      {
        key: "jam_ramai",
        title: "Jam Ramai",
        description: "Jumlah pasien pada jam terpadat",
        icon: "mdi-clock-alert-outline",
        iconClass: "icon-orange",
      },
      {
        key: "catatan",
        title: "Catatan",
        description: "Aktivitas sistem periode ini",
        icon: "mdi-note-text-outline",
        iconClass: "icon-green",
      },
    ],
    quickActions: [
      {
        label: "Antrian",
        icon: "mdi-account-clock-outline",
        color: "blue",
        to: "/antrian",
      },
      {
        label: "Input Antrian",
        icon: "mdi-account-plus-outline",
        color: "teal",
        to: "/antrian-input",
      },
      {
        label: "Display Antrian",
        icon: "mdi-monitor",
        color: "orange",
        to: "/antrian-display",
      },
      {
        label: "Registrasi",
        icon: "mdi-clipboard-list-outline",
        color: "purple",
        to: "/resepsionis/registrasi-layanan",
      },
    ],
  },

  sp: {
    title: "Sales Promotion Workspace",
    subtitle:
      "Kelola follow-up pasien, promo, voucher, campaign, dan dukungan penjualan.",
    icon: "mdi-bullhorn-outline",
    heroIcon: "mdi-sale-outline",
    themeClass: "theme-sp",
    primaryAction: {
      label: "Lihat Pasien",
      icon: "mdi-account-search-outline",
      to: "/master/pasien",
    },
    stats: [
      {
        key: "follow_up",
        title: "Follow-up",
        description: "Pasien baru untuk follow-up",
        icon: "mdi-phone-outgoing-outline",
        iconClass: "icon-pink",
      },
      {
        key: "promo",
        title: "Promo",
        description: "Campaign voucher aktif",
        icon: "mdi-sale-outline",
        iconClass: "icon-purple",
      },
      {
        key: "voucher",
        title: "Voucher",
        description: "Voucher aktif periode ini",
        icon: "mdi-ticket-percent-outline",
        iconClass: "icon-orange",
      },
      {
        key: "lead",
        title: "Lead",
        description: "Pasien baru periode ini",
        icon: "mdi-account-star-outline",
        iconClass: "icon-blue",
      },
    ],
    quickActions: [
      {
        label: "Data Pasien",
        icon: "mdi-account-search-outline",
        color: "pink",
        to: "/master/pasien",
      },
      {
        label: "Registrasi",
        icon: "mdi-clipboard-plus-outline",
        color: "purple",
        to: "/resepsionis/registrasi-layanan",
      },
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
      {
        label: "Voucher",
        icon: "mdi-ticket-percent-outline",
        color: "orange",
        to: "/master/voucher-diskon",
      },
    ],
  },

  default: {
    title: "Clinic Operation Dashboard",
    subtitle:
      "Ringkasan umum aktivitas klinik berdasarkan role dan cabang aktif.",
    icon: "mdi-view-dashboard-outline",
    heroIcon: "mdi-hospital-building",
    themeClass: "theme-default",
    primaryAction: {
      label: "Lihat Registrasi",
      icon: "mdi-clipboard-list-outline",
      to: "/resepsionis/registrasi-layanan",
    },
    stats: [
      {
        key: "registrasi",
        title: "Registrasi",
        description: "Aktivitas layanan",
        icon: "mdi-clipboard-list-outline",
        iconClass: "icon-blue",
      },
      {
        key: "antrian",
        title: "Antrian",
        description: "Pasien dalam proses",
        icon: "mdi-account-clock-outline",
        iconClass: "icon-cyan",
      },
      {
        key: "transaksi",
        title: "Pembayaran",
        description: "Transaksi kasir",
        icon: "mdi-cash-register",
        iconClass: "icon-green",
      },
      {
        key: "audit_trail",
        title: "Notifikasi",
        description: "Perlu perhatian",
        icon: "mdi-bell-outline",
        iconClass: "icon-orange",
      },
    ],
    quickActions: [
      {
        label: "Registrasi",
        icon: "mdi-clipboard-list-outline",
        color: "primary",
        to: "/resepsionis/registrasi-layanan",
      },
      {
        label: "Pembayaran",
        icon: "mdi-cash-register",
        color: "green",
        to: "/kasir/pembayaran",
      },
      {
        label: "Pasien",
        icon: "mdi-account-injury-outline",
        color: "blue",
        to: "/master/pasien",
      },
      {
        label: "Produk",
        icon: "mdi-package-variant-closed",
        color: "orange",
        to: "/master/produk",
      },
    ],
  },
};

export default {
  name: "DashboardView",

  data() {
    const today = new Date().toISOString().slice(0, 10);

    return {
      user: {},
      selectedRole: null,
      selectedToko: null,
      loading: false,
      errorMessage: "",
      summary: {
        cards: {},
      },
      filter: {
        date_from: today,
        date_to: today,
      },
    };
  },

  computed: {
    currentDateText() {
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date());
    },

    userName() {
      return (
        this.extractValue(this.user, [
          "nama_karyawan",
          "nama",
          "name",
          "username",
          "email",
        ]) || "User"
      );
    },

    userInitial() {
      return this.userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
    },

    roleName() {
      return (
        this.extractValue(this.selectedRole, [
          "nama_role",
          "role_name",
          "kode_role",
          "name",
          "title",
          "role",
        ]) ||
        this.extractValue(this.user, [
          "nama_role",
          "role_name",
          "kode_role",
          "role",
          "selected_role",
        ]) ||
        "Dashboard"
      );
    },

    displayRoleName() {
      return this.toTitleCase(this.roleName);
    },

    selectedTokoId() {
      const direct =
        localStorage.getItem("selected_toko_id") ||
        localStorage.getItem("selected_cabang_id");

      if (direct) {
        return direct;
      }

      return (
        this.extractValue(this.selectedToko, [
          "id",
          "toko_id",
          "new_id",
          "value",
        ]) || null
      );
    },

    selectedTokoName() {
      return (
        this.extractValue(this.selectedToko, [
          "nama_toko",
          "toko_nama",
          "nama",
          "name",
          "kode_toko",
        ]) ||
        this.extractValue(this.user, [
          "toko_nama",
          "nama_toko",
          "cabang",
          "branch",
        ]) ||
        "Semua Cabang"
      );
    },

    roleKey() {
      const role = this.normalizeText(this.roleName);

      if (role.includes("front office") || role === "fo") {
        return "front_office";
      }

      if (role.includes("branch accounting") || role.includes("accounting")) {
        return "branch_accounting";
      }

      if (role.includes("dokter") || role.includes("doctor")) {
        return "dokter";
      }

      if (
        role.includes("apoteker") ||
        role.includes("apotek") ||
        role.includes("apotik")
      ) {
        return "apoteker";
      }

      if (role.includes("management") || role.includes("manager")) {
        return "management";
      }

      if (role === "it" || role.includes("information technology")) {
        return "it";
      }

      if (role.includes("security")) {
        return "security";
      }

      if (role === "sp" || role.includes("sales promotion")) {
        return "sp";
      }

      if (role.includes("superuser") || role.includes("sudo")) {
        return "superuser";
      }

      if (role.includes("administrator") || role.includes("admin")) {
        return "administrator";
      }

      return "default";
    },

    currentDashboard() {
      return dashboardConfigs[this.roleKey] || dashboardConfigs.default;
    },

    displayStats() {
      return this.currentDashboard.stats.map((stat) => {
        const rawValue = this.summary.cards?.[stat.key] ?? 0;

        return {
          ...stat,
          value: this.formatValue(rawValue, stat.format),
        };
      });
    },
  },

  created() {
    this.refreshStorageContext();
    this.fetchSummary();
  },

  mounted() {
    window.addEventListener("storage", this.handleContextChanged);
    window.addEventListener("focus", this.handleContextChanged);
  },

  beforeUnmount() {
    window.removeEventListener("storage", this.handleContextChanged);
    window.removeEventListener("focus", this.handleContextChanged);
  },

  methods: {
    handleContextChanged() {
      this.refreshStorageContext();
      this.fetchSummary();
    },

    refreshStorageContext() {
      this.user = this.readStorage("user") || {};
      this.selectedRole = this.readStorage("selected_role");
      this.selectedToko = this.readStorage("selected_toko");
    },

    async fetchSummary() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await dashboardService.summary({
          date_from: this.filter.date_from,
          date_to: this.filter.date_to,
          toko_id: this.selectedTokoId,
          role: this.roleKey,
        });

        this.summary = response.data || { cards: {} };
      } catch (error) {
        this.summary = { cards: {} };
        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Gagal mengambil data dashboard";
      } finally {
        this.loading = false;
      }
    },

    readStorage(key) {
      const value = localStorage.getItem(key);

      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    },

    extractValue(source, fields) {
      if (!source) {
        return null;
      }

      if (typeof source === "string" || typeof source === "number") {
        return String(source);
      }

      if (typeof source !== "object") {
        return null;
      }

      for (const field of fields) {
        const value = source[field];

        if (!value) {
          continue;
        }

        if (typeof value === "object") {
          const nestedValue = this.extractValue(value, fields);

          if (nestedValue) {
            return nestedValue;
          }
        }

        return String(value);
      }

      return null;
    },

    normalizeText(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    },

    toTitleCase(value) {
      const text = String(value || "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!text) {
        return "Dashboard";
      }

      return text
        .split(" ")
        .map((word) => {
          if (word.length <= 2) {
            return word.toUpperCase();
          }

          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
    },

    formatValue(value, format) {
      const numberValue = Number(value || 0);

      if (format === "currency") {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(numberValue);
      }

      return new Intl.NumberFormat("id-ID").format(numberValue);
    },

    goTo(path) {
      if (!path || this.$route.path === path) {
        return;
      }

      this.$router.push(path).catch(() => {});
    },
  },
};
</script>

<style scoped>
.dashboard-page {
  padding-bottom: 24px;
}

.dashboard-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.dashboard-title {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.dashboard-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.dashboard-filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.date-filter {
  width: 170px;
}

.dashboard-hero {
  position: relative;
  width: 100%;
  min-height: 330px;
  padding: 34px 36px;
  overflow: hidden;
  color: #ffffff;
  border-radius: 22px !important;
  background: linear-gradient(135deg, #0f172a 0%, #0369a1 52%, #0d9488 100%);
}

.dashboard-hero::before {
  content: "";
  position: absolute;
  top: -95px;
  right: -70px;
  width: 290px;
  height: 290px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
}

.dashboard-hero::after {
  content: "";
  position: absolute;
  bottom: -130px;
  left: 26%;
  width: 300px;
  height: 300px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 850px;
}

.hero-user-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-user-avatar {
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  background: rgba(255, 255, 255, 0.18);
  font-size: 22px;
  font-weight: 900;
  backdrop-filter: blur(10px);
}

.hero-user-info {
  min-width: 0;
}

.hero-date {
  color: rgba(255, 255, 255, 0.82);
  font-size: 12.5px;
  font-weight: 700;
}

.hero-greeting {
  margin: 6px 0 0;
  color: #ffffff;
  font-size: 39px;
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.hero-greeting span {
  color: #ffffff;
}

.hero-context-row {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.hero-context-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 7px 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.hero-workspace-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  max-width: 720px;
  margin-top: 28px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.workspace-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.workspace-title {
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.35;
}

.workspace-subtitle {
  margin-top: 4px;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 13px;
  line-height: 1.6;
}

.hero-action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.hero-primary-btn,
.hero-secondary-btn {
  min-height: 40px;
  text-transform: none !important;
  font-weight: 850;
  letter-spacing: 0;
}

.hero-primary-btn {
  color: #111827 !important;
}

.hero-secondary-btn {
  color: #ffffff !important;
}

.hero-ornament {
  position: absolute;
  right: 54px;
  bottom: 36px;
  z-index: 1;
  color: rgba(255, 255, 255, 0.2);
  line-height: 1;
}

.hero-ornament .v-icon {
  width: 140px;
  height: 140px;
  font-size: 140px;
}

.report-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin: 22px 0 14px;
}

.report-title {
  color: #111827;
  font-size: 20px;
  font-weight: 850;
}

.report-subtitle {
  margin-top: 3px;
  color: #64748b;
  font-size: 13px;
}

.report-card {
  min-height: 178px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 18px !important;
  background: #ffffff;
  box-shadow: none !important;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.report-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08) !important;
  transform: translateY(-2px);
}

.report-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin-bottom: 16px;
  border-radius: 16px;
}

.report-card-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.report-card-value {
  min-height: 31px;
  margin-top: 8px;
  color: #111827;
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
}

.report-card-desc {
  margin-top: 8px;
  color: #6b7280;
  font-size: 12.5px;
  line-height: 1.45;
}

.quick-panel {
  margin-top: 18px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 18px !important;
  background: #ffffff;
  box-shadow: none !important;
}

.quick-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.quick-title {
  color: #111827;
  font-size: 18px;
  font-weight: 850;
}

.quick-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.quick-btn {
  min-height: 42px;
  justify-content: flex-start;
  text-transform: none !important;
  font-weight: 800;
  letter-spacing: 0;
}

.icon-blue {
  color: #2563eb;
  background: #eff6ff;
}

.icon-purple {
  color: #7c3aed;
  background: #f5f3ff;
}

.icon-cyan {
  color: #0891b2;
  background: #ecfeff;
}

.icon-green {
  color: #16a34a;
  background: #f0fdf4;
}

.icon-orange {
  color: #ea580c;
  background: #fff7ed;
}

.icon-red {
  color: #dc2626;
  background: #fef2f2;
}

.icon-pink {
  color: #db2777;
  background: #fdf2f8;
}

.theme-admin {
  background: linear-gradient(135deg, #1e3a8a 0%, #4f46e5 55%, #7c3aed 100%);
}

.theme-superuser {
  background: linear-gradient(135deg, #312e81 0%, #7c3aed 52%, #db2777 100%);
}

.theme-it {
  background: linear-gradient(135deg, #0f172a 0%, #0369a1 54%, #0d9488 100%);
}

.theme-management {
  background: linear-gradient(135deg, #064e3b 0%, #2563eb 52%, #7c3aed 100%);
}

.theme-fo {
  background: linear-gradient(135deg, #6d28d9 0%, #ec4899 55%, #f97316 100%);
}

.theme-dokter {
  background: linear-gradient(135deg, #075985 0%, #0d9488 52%, #14b8a6 100%);
}

.theme-apotek {
  background: linear-gradient(135deg, #166534 0%, #0d9488 52%, #06b6d4 100%);
}

.theme-accounting {
  background: linear-gradient(135deg, #92400e 0%, #ea580c 52%, #16a34a 100%);
}

.theme-security {
  background: linear-gradient(135deg, #334155 0%, #475569 52%, #0f766e 100%);
}

.theme-sp {
  background: linear-gradient(135deg, #9d174d 0%, #c026d3 52%, #f97316 100%);
}

.theme-default {
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 52%, #0d9488 100%);
}

@media (max-width: 960px) {
  .dashboard-hero {
    min-height: auto;
    padding: 28px;
  }

  .hero-greeting {
    font-size: 30px;
  }

  .hero-ornament {
    display: none;
  }
}

@media (max-width: 600px) {
  .dashboard-title-row,
  .dashboard-filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .date-filter {
    width: 100%;
  }

  .dashboard-title {
    font-size: 24px;
  }

  .dashboard-hero,
  .report-card,
  .quick-panel {
    border-radius: 14px !important;
  }

  .dashboard-hero {
    padding: 22px;
  }

  .hero-user-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-greeting {
    font-size: 26px;
  }

  .hero-action-row .v-btn {
    width: 100%;
  }

  .report-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    app
    width="270"
    class="sidebar"
  >
    <!-- Logo Area -->
    <div class="sidebar-header">
      <div class="logo-wrapper">
        <img :src="logo" alt="MS Glow" class="logo-img" />
      </div>
      <div class="logo-divider"></div>
    </div>

    <!-- Navigation List -->
    <v-list density="comfortable" nav class="sidebar-nav">
      <template v-for="(item, i) in menu" :key="i">
        <!-- HEADER -->
        <div v-if="item.header" class="menu-section-header">
          <span class="header-line"></span>
          <span class="header-text">{{ item.header }}</span>
          <span class="header-line"></span>
        </div>

        <!-- NORMAL ITEM -->
        <v-list-item
          v-else-if="!item.children"
          :to="item.to"
          class="nav-item"
          rounded="xl"
          active-class="nav-item--active"
        >
          <template #prepend>
            <div class="icon-wrap">
              <v-icon size="18">{{ item.icon }}</v-icon>
            </div>
          </template>
          <v-list-item-title class="nav-label">{{
            item.title
          }}</v-list-item-title>
        </v-list-item>

        <!-- GROUP LEVEL 1 -->
        <v-list-group v-else :value="item.title" class="nav-group">
          <template #activator="{ props }">
            <v-list-item v-bind="props" class="nav-item" rounded="xl">
              <template #prepend>
                <div class="icon-wrap">
                  <v-icon size="18">{{ item.icon }}</v-icon>
                </div>
              </template>
              <v-list-item-title class="nav-label">{{
                item.title
              }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- LEVEL 2 -->
          <template v-for="(child, j) in item.children" :key="j">
            <!-- LEVEL 2 NORMAL -->
            <v-list-item
              v-if="!child.children"
              :to="child.to"
              class="nav-item nav-item--l2"
              rounded="xl"
              active-class="nav-item--active"
            >
              <template #prepend>
                <div class="l2-bullet">
                  <span class="bullet-dot"></span>
                </div>
              </template>
              <v-list-item-title class="nav-label">{{
                child.title
              }}</v-list-item-title>
            </v-list-item>

            <!-- LEVEL 2 GROUP -->
            <v-list-group v-else :value="child.title" class="nav-group-l2">
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  class="nav-item nav-item--l2"
                  rounded="xl"
                >
                  <template #prepend>
                    <div class="l2-bullet">
                      <span class="bullet-dot"></span>
                    </div>
                  </template>
                  <v-list-item-title class="nav-label">{{
                    child.title
                  }}</v-list-item-title>
                </v-list-item>
              </template>

              <!-- LEVEL 3 -->
              <v-list-item
                v-for="(sub, k) in child.children"
                :key="k"
                :to="sub.to"
                class="nav-item nav-item--l3"
                rounded="xl"
                active-class="nav-item--active"
              >
                <template #prepend>
                  <div class="l3-bullet">
                    <span class="bullet-dash"></span>
                  </div>
                </template>
                <v-list-item-title class="nav-label">{{
                  sub.title
                }}</v-list-item-title>
              </v-list-item>
            </v-list-group>
          </template>
        </v-list-group>
      </template>
    </v-list>

    <!-- Bottom user info -->
    <template #append>
      <div class="sidebar-footer">
        <div class="footer-divider"></div>
        <div class="footer-content">
          <div class="footer-avatar">IT</div>
          <div class="footer-info">
            <div class="footer-name">IT JKS</div>
            <div class="footer-role">Administrator</div>
          </div>
          <v-icon size="16" color="#6b7280">mdi-chevron-right</v-icon>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
  },
  data() {
    return {
      logo: new URL("@/assets/logowebsitenew.png", import.meta.url).href,
      menu: [
        {
          title: "Dashboard",
          icon: "mdi-view-dashboard-outline",
          to: "/dashboard",
        },
        {
          title: "Nomor Antrian",
          icon: "mdi-timer-sand-empty",
          to: "/antrian",
        },

        // ================= MASTER =================
        { header: "MASTER" },

        {
          title: "Administrasi",
          icon: "mdi-file-document-outline",
          children: [
            { title: "Dokter & Beautician", to: "/administrasi/dokter" },
            {
              title: "Pasien & Non Pasien",
              children: [{ title: "Data Pasien", to: "/administrasi/pasien" }],
            },
            { title: "Supplier", to: "/administrasi/supplier" },
            { title: "Jadwal Dokter", to: "/administrasi/jadwal-dokter" },
            {
              title: "Jadwal Nurse & Beautician",
              to: "/administrasi/jadwal-nurse",
            },
            { title: "Treatment", to: "/administrasi/treatment" },
            { title: "Stock Apotek", to: "/administrasi/stock-apotek" },
            { title: "Merchandise", to: "/administrasi/merchandise" },
            { title: "Voucher Diskon", to: "/administrasi/voucher" },
          ],
        },

        // ================= RESEPSIONIS =================
        { header: "Menu Resepsionis" },

        {
          title: "Resepsionis",
          icon: "mdi-account-voice",
          children: [
            {
              title: "Pendaftaran Pasien Baru",
              to: "/resepsionis/daftar-baru",
            },
            { title: "Daftar Konsultasi", to: "/resepsionis/konsultasi" },
            {
              title: "Daftar Konsultasi Online",
              to: "/resepsionis/konsultasi-online",
            },
            { title: "Daftar Treatment", to: "/resepsionis/treatment" },
            {
              title: "Pembayaran Recipe",
              to: "/resepsionis/pembayaran-recipe",
            },
            { title: "Penjualan Langsung", to: "/resepsionis/penjualan" },
            { title: "Penukaran Poin", to: "/resepsionis/poin" },
            { title: "Booking", to: "/resepsionis/booking" },
          ],
        },

        // ================= DOKTER =================
        { header: "Menu Dokter" },

        {
          title: "Konsultasi",
          icon: "mdi-stethoscope",
          children: [
            { title: "List Konsultasi", to: "/dokter/list-konsultasi" },
            { title: "List Konsultasi Online", to: "/dokter/list-online" },
            { title: "List Konsultasi Selesai", to: "/dokter/list-selesai" },
            {
              title: "List Konsultasi Online Selesai",
              to: "/dokter/list-online-selesai",
            },
          ],
        },
        {
          title: "Perawatan",
          icon: "mdi-hospital-box",
          children: [{ title: "List Perawatan", to: "/dokter/list-perawatan" }],
        },

        // ================= PERAWAT =================
        { header: "Menu Perawat" },

        {
          title: "Nurse Station",
          icon: "mdi-doctor",
          children: [
            { title: "List Tindakan Perawat", to: "/perawat/tindakan" },
          ],
        },

        // ================= BOOKING =================
        { header: "Menu Booking" },

        {
          title: "Booking",
          icon: "mdi-calendar-month",
          children: [
            { title: "List Booking", to: "/booking/list" },
            { title: "List Booking Selesai", to: "/booking/selesai" },
          ],
        },

        // ================= DEPO =================
        { header: "Menu Depo / Apotek" },

        {
          title: "Depo/Apotek",
          icon: "mdi-flask-outline",
          children: [
            { title: "Resep Dokter Selesai", to: "/apotek/resep-selesai" },
          ],
        },

        // ================= KASIR =================
        { header: "Menu Kasir" },

        {
          title: "Kasir Pembayaran",
          icon: "mdi-cash-register",
          children: [
            { title: "Pembayaran", to: "/kasir/pembayaran" },
            { title: "List Pembayaran Selesai", to: "/kasir/selesai" },
          ],
        },

        // ================= TRANSAKSI =================
        { header: "Menu Transaksi" },

        {
          title: "Data Transaksi",
          icon: "mdi-swap-horizontal",
          children: [
            { title: "Data Tr Semua", to: "/transaksi/semua" },
            { title: "Data Tr Poin", to: "/transaksi/poin" },
          ],
        },

        // ================= WHATSAPP =================
        { header: "Menu WhatsApp" },

        {
          title: "WhatsApp Logs",
          icon: "mdi-whatsapp",
          children: [{ title: "Kirim Undian", to: "/wa/undian" }],
        },

        // ================= ACCURATE =================
        { header: "Settlement Accurate" },

        {
          title: "Report Accurate",
          icon: "mdi-alpha-a-circle",
          children: [
            { title: "Upload Faktur Umum", to: "/accurate/faktur-umum" },
            {
              title: "Upload Faktur EliteGlobal",
              to: "/accurate/faktur-elite",
            },
            { title: "Upload Faktur Owner", to: "/accurate/faktur-owner" },
            { title: "Upload Faktur Deposit", to: "/accurate/faktur-deposit" },
            {
              title: "Upload Faktur Realisasi Deposit",
              to: "/accurate/faktur-realisasi",
            },
            { title: "Upload STO", to: "/accurate/sto" },
          ],
        },

        // ================= LAPORAN =================
        { header: "Menu Laporan" },

        {
          title: "Pelaporan",
          icon: "mdi-file-chart-outline",
          children: [
            { title: "Insentif Dokter", to: "/laporan/insentif-dokter" },
            {
              title: "Insentif Nurse/Beautician",
              to: "/laporan/insentif-nurse",
            },
            {
              title: "Insentif Apoteker / Asisten Apoteker",
              to: "/laporan/insentif-apoteker",
            },
            { title: "Data Laporan Detail", to: "/laporan/detail" },
            { title: "Data Laporan Pemasukan", to: "/laporan/pemasukan" },
            { title: "Data Laporan Treatment", to: "/laporan/treatment" },
            { title: "Data Laporan Obat", to: "/laporan/obat" },
            {
              title: "Pasien Treatment Terbanyak",
              to: "/laporan/top-treatment",
            },
            { title: "Top Nominal Terbanyak", to: "/laporan/top-nominal" },
            { title: "Data Tindakan Terlaris", to: "/laporan/terlaris" },
          ],
        },

        // ================= USER =================
        { header: "Menu User" },

        {
          title: "Users",
          icon: "mdi-account-multiple",
          to: "/users",
        },
      ],
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap");

/* === BASE === */
.sidebar {
  background: #2c3136 !important;
  border-right: none !important;
  font-family: "Plus Jakarta Sans", sans-serif;
}

/* Custom scrollbar */
.sidebar :deep(.v-navigation-drawer__content) {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4b5563 transparent;
}

.sidebar :deep(.v-navigation-drawer__content::-webkit-scrollbar) {
  width: 4px;
}

.sidebar :deep(.v-navigation-drawer__content::-webkit-scrollbar-track) {
  background: transparent;
}

.sidebar :deep(.v-navigation-drawer__content::-webkit-scrollbar-thumb) {
  background: #4b5563;
  border-radius: 99px;
}

.sidebar :deep(.v-navigation-drawer__content::-webkit-scrollbar-thumb:hover) {
  background: #2c3136;
}

/* === HEADER === */
.sidebar-header {
  padding: 20px 20px 0;
  background: #2c3136;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0 16px;
}

.logo-img {
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: contain;
  display: block;
}

.logo-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 0;
}

/* === NAV === */
.sidebar-nav {
  padding: 8px 10px !important;
}

.nav-item {
  color: #ced4da !important;
  min-height: 42px !important;
  margin-bottom: 2px !important;
  transition: all 0.18s ease !important;
  padding: 0 10px !important;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.07) !important;
  color: #ffffff !important;
}

.nav-item:hover .icon-wrap {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.nav-item--active {
  background: #2563eb !important;
  color: #ffffff !important;
}

.nav-item--active .icon-wrap {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-item--active .nav-label {
  color: #ffffff !important;
  font-weight: 600;
}

/* === ICON === */
.icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.07);
  color: #adb5bd;
  margin-right: 10px;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

/* === LABEL === */
.nav-label {
  font-size: 13.5px !important;
  font-weight: 500 !important;
  letter-spacing: 0.1px;
}

/* === SECTION HEADER === */
.menu-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 10px 4px;
}

.header-line {
  display: none;
}

.header-text {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #6c757d;
  white-space: nowrap;
  text-transform: uppercase;
}

/* === LEVEL 2 === */
.nav-item--l2 {
  padding-left: 16px !important;
}

.l2-bullet {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
  position: relative;
}

.l2-bullet::before {
  content: "";
  position: absolute;
  left: 11px;
  top: -14px;
  bottom: -2px;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.bullet-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4b5563;
  border: 1.5px solid #6b7280;
  transition: all 0.2s;
}

.nav-item--l2:hover .bullet-dot {
  background: #60a5fa;
  border-color: #60a5fa;
}

.nav-item--active .bullet-dot {
  background: white;
  border-color: white;
}

/* === LEVEL 3 === */
.nav-item--l3 {
  padding-left: 28px !important;
}

.l3-bullet {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.bullet-dash {
  width: 10px;
  height: 1.5px;
  background: #4b5563;
  border-radius: 2px;
  transition: all 0.2s;
}

.nav-item--l3:hover .bullet-dash {
  background: #60a5fa;
  width: 14px;
}

.nav-item--l3.nav-item--active .bullet-dash {
  background: white;
  width: 14px;
}

/* === GROUP overrides === */
.nav-group :deep(.v-list-group__items) {
  padding: 0 !important;
}

.nav-group-l2 :deep(.v-list-group__items) {
  padding: 0 !important;
}

/* Chevron color */
:deep(.v-list-group__header .v-list-item__append .v-icon) {
  color: #ced4da !important;
  font-size: 18px !important;
  opacity: 1 !important;
}

/* === FOOTER === */
.sidebar-footer {
  padding: 0 10px 16px;
}

.footer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 12px;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.18s;
}

.footer-content:hover {
  background: rgba(255, 255, 255, 0.07);
}

.footer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.footer-info {
  flex: 1;
  min-width: 0;
}

.footer-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.3;
}

.footer-role {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.3;
}
</style>

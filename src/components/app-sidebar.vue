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
    <v-list
      density="comfortable"
      nav
      class="sidebar-nav"
      :opened="openedValues"
      @update:opened="onUpdateOpened"
    >
      <template v-for="(item, i) in menu" :key="item.key || `menu-${i}`">
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
          :class="{
            'nav-item--active': isRouteActive(item.to),
            'nav-item--active-l1': isRouteActive(item.to),
          }"
          rounded="xl"
        >
          <template #prepend>
            <div class="icon-wrap">
              <v-icon size="18">{{ item.icon }}</v-icon>
            </div>
          </template>

          <v-list-item-title class="nav-label">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>

        <!-- GROUP LEVEL 1 -->
        <v-list-group v-else :value="item.key" class="nav-group">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              class="nav-item"
              :class="{
                'nav-item--active': hasActiveChild(item.children),
                'nav-item--open-l1': hasActiveChild(item.children),
              }"
              rounded="xl"
            >
              <template #prepend>
                <div class="icon-wrap">
                  <v-icon size="18">{{ item.icon }}</v-icon>
                </div>
              </template>

              <v-list-item-title class="nav-label">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </template>

          <!-- LEVEL 2 -->
          <template
            v-for="(child, j) in item.children"
            :key="child.key || `${item.key}-child-${j}`"
          >
            <!-- LEVEL 2 NORMAL -->
            <v-list-item
              v-if="!child.children"
              :to="child.to"
              class="nav-item nav-item--l2"
              :class="{
                'nav-item--active': isRouteActive(child.to),
                'nav-item--active-l2': isRouteActive(child.to),
              }"
              rounded="xl"
            >
              <template #prepend>
                <div class="l2-bullet">
                  <span class="bullet-dot"></span>
                </div>
              </template>

              <v-list-item-title class="nav-label">
                {{ child.title }}
              </v-list-item-title>
            </v-list-item>

            <!-- LEVEL 2 GROUP -->
            <v-list-group v-else :value="child.key" class="nav-group-l2">
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  class="nav-item nav-item--l2"
                  :class="{
                    'nav-item--active': hasActiveChild(child.children),
                    'nav-item--open-l2': hasActiveChild(child.children),
                  }"
                  rounded="xl"
                >
                  <template #prepend>
                    <div class="l2-bullet">
                      <span class="bullet-dot"></span>
                    </div>
                  </template>

                  <v-list-item-title class="nav-label">
                    {{ child.title }}
                  </v-list-item-title>
                </v-list-item>
              </template>

              <!-- LEVEL 3 -->
              <v-list-item
                v-for="(sub, k) in child.children"
                :key="sub.key || `${child.key}-sub-${k}`"
                :to="sub.to"
                class="nav-item nav-item--l3"
                :class="{
                  'nav-item--active': isRouteActive(sub.to),
                  'nav-item--active-l3': isRouteActive(sub.to),
                }"
                rounded="xl"
              >
                <template #prepend>
                  <div class="l3-bullet">
                    <span class="bullet-dash"></span>
                  </div>
                </template>

                <v-list-item-title class="nav-label">
                  {{ sub.title }}
                </v-list-item-title>
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
  name: "AppSidebar",

  props: {
    modelValue: Boolean,
  },

  emits: ["update:modelValue"],

  data() {
    return {
      logo: new URL("@/assets/logowebsitenew.png", import.meta.url).href,
      manualOpened: [],

      menu: [
        {
          key: "dashboard",
          title: "Dashboard",
          icon: "mdi-view-dashboard-outline",
          to: "/dashboard",
        },
        {
          key: "antrian",
          title: "Nomor Antrian",
          icon: "mdi-timer-sand-empty",
          to: "/antrian",
        },

        { header: "MASTER" },

        {
          key: "administrasi",
          title: "Administrasi",
          icon: "mdi-file-document-outline",
          children: [
            {
              key: "administrasi-dokter",
              title: "Dokter & Beautician",
              to: "/administrasi/dokter",
            },
            {
              key: "administrasi-pasien-group",
              title: "Pasien & Non Pasien",
              children: [
                {
                  key: "administrasi-pasien",
                  title: "Data Pasien",
                  to: "/administrasi/pasien",
                },
              ],
            },
            {
              key: "administrasi-supplier",
              title: "Supplier",
              to: "/administrasi/supplier",
            },
            {
              key: "administrasi-jadwal-dokter",
              title: "Jadwal Dokter",
              to: "/administrasi/jadwal-dokter",
            },
            {
              key: "administrasi-jadwal-nurse",
              title: "Jadwal Nurse & Beautician",
              to: "/administrasi/jadwal-nurse",
            },
            {
              key: "administrasi-treatment",
              title: "Treatment",
              to: "/administrasi/treatment",
            },
            {
              key: "administrasi-stock-apotek",
              title: "Stock Apotek",
              to: "/administrasi/stock-apotek",
            },
            {
              key: "administrasi-merchandise",
              title: "Merchandise",
              to: "/administrasi/merchandise",
            },
            {
              key: "administrasi-voucher",
              title: "Voucher Diskon",
              to: "/administrasi/voucher",
            },
          ],
        },

        { header: "Menu Resepsionis" },

        {
          key: "resepsionis",
          title: "Resepsionis",
          icon: "mdi-account-voice",
          children: [
            {
              key: "resepsionis-daftar-baru",
              title: "Pendaftaran Pasien Baru",
              to: "/resepsionis/daftar-baru",
            },
            {
              key: "resepsionis-konsultasi",
              title: "Daftar Konsultasi",
              to: "/resepsionis/konsultasi",
            },
            {
              key: "resepsionis-konsultasi-online",
              title: "Daftar Konsultasi Online",
              to: "/resepsionis/konsultasi-online",
            },
            {
              key: "resepsionis-treatment",
              title: "Daftar Treatment",
              to: "/resepsionis/treatment",
            },
            {
              key: "resepsionis-pembayaran-recipe",
              title: "Pembayaran Recipe",
              to: "/resepsionis/pembayaran-recipe",
            },
            {
              key: "resepsionis-penjualan",
              title: "Penjualan Langsung",
              to: "/resepsionis/penjualan",
            },
            {
              key: "resepsionis-poin",
              title: "Penukaran Poin",
              to: "/resepsionis/poin",
            },
            {
              key: "resepsionis-booking",
              title: "Booking",
              to: "/resepsionis/booking",
            },
          ],
        },

        { header: "Menu Dokter" },

        {
          key: "konsultasi",
          title: "Konsultasi",
          icon: "mdi-stethoscope",
          children: [
            {
              key: "dokter-list-konsultasi",
              title: "List Konsultasi",
              to: "/dokter/list-konsultasi",
            },
            {
              key: "dokter-list-online",
              title: "List Konsultasi Online",
              to: "/dokter/list-online",
            },
            {
              key: "dokter-list-selesai",
              title: "List Konsultasi Selesai",
              to: "/dokter/list-selesai",
            },
            {
              key: "dokter-list-online-selesai",
              title: "List Konsultasi Online Selesai",
              to: "/dokter/list-online-selesai",
            },
          ],
        },
        {
          key: "perawatan",
          title: "Perawatan",
          icon: "mdi-hospital-box",
          children: [
            {
              key: "dokter-list-perawatan",
              title: "List Perawatan",
              to: "/dokter/list-perawatan",
            },
          ],
        },

        { header: "Menu Perawat" },

        {
          key: "nurse-station",
          title: "Nurse Station",
          icon: "mdi-doctor",
          children: [
            {
              key: "perawat-tindakan",
              title: "List Tindakan Perawat",
              to: "/perawat/tindakan",
            },
          ],
        },

        { header: "Menu Booking" },

        {
          key: "booking",
          title: "Booking",
          icon: "mdi-calendar-month",
          children: [
            {
              key: "booking-list",
              title: "List Booking",
              to: "/booking/list",
            },
            {
              key: "booking-selesai",
              title: "List Booking Selesai",
              to: "/booking/selesai",
            },
          ],
        },

        { header: "Menu Depo / Apotek" },

        {
          key: "apotek",
          title: "Depo/Apotek",
          icon: "mdi-flask-outline",
          children: [
            {
              key: "apotek-resep-selesai",
              title: "Resep Dokter Selesai",
              to: "/apotek/resep-selesai",
            },
          ],
        },

        { header: "Menu Kasir" },

        {
          key: "kasir",
          title: "Kasir Pembayaran",
          icon: "mdi-cash-register",
          children: [
            {
              key: "kasir-pembayaran",
              title: "Pembayaran",
              to: "/kasir/pembayaran",
            },
            {
              key: "kasir-selesai",
              title: "List Pembayaran Selesai",
              to: "/kasir/selesai",
            },
          ],
        },

        { header: "Menu Transaksi" },

        {
          key: "transaksi",
          title: "Data Transaksi",
          icon: "mdi-swap-horizontal",
          children: [
            {
              key: "transaksi-semua",
              title: "Data Tr Semua",
              to: "/transaksi/semua",
            },
            {
              key: "transaksi-poin",
              title: "Data Tr Poin",
              to: "/transaksi/poin",
            },
          ],
        },

        { header: "Menu WhatsApp" },

        {
          key: "whatsapp",
          title: "WhatsApp Logs",
          icon: "mdi-whatsapp",
          children: [
            {
              key: "wa-undian",
              title: "Kirim Undian",
              to: "/wa/undian",
            },
          ],
        },

        { header: "Settlement Accurate" },

        {
          key: "accurate",
          title: "Report Accurate",
          icon: "mdi-alpha-a-circle",
          children: [
            {
              key: "accurate-faktur-umum",
              title: "Upload Faktur Umum",
              to: "/accurate/faktur-umum",
            },
            {
              key: "accurate-faktur-elite",
              title: "Upload Faktur EliteGlobal",
              to: "/accurate/faktur-elite",
            },
            {
              key: "accurate-faktur-owner",
              title: "Upload Faktur Owner",
              to: "/accurate/faktur-owner",
            },
            {
              key: "accurate-faktur-deposit",
              title: "Upload Faktur Deposit",
              to: "/accurate/faktur-deposit",
            },
            {
              key: "accurate-faktur-realisasi",
              title: "Upload Faktur Realisasi Deposit",
              to: "/accurate/faktur-realisasi",
            },
            {
              key: "accurate-sto",
              title: "Upload STO",
              to: "/accurate/sto",
            },
          ],
        },

        { header: "Menu Laporan" },

        {
          key: "laporan",
          title: "Pelaporan",
          icon: "mdi-file-chart-outline",
          children: [
            {
              key: "laporan-insentif-dokter",
              title: "Insentif Dokter",
              to: "/laporan/insentif-dokter",
            },
            {
              key: "laporan-insentif-nurse",
              title: "Insentif Nurse/Beautician",
              to: "/laporan/insentif-nurse",
            },
            {
              key: "laporan-insentif-apoteker",
              title: "Insentif Apoteker / Asisten Apoteker",
              to: "/laporan/insentif-apoteker",
            },
            {
              key: "laporan-detail",
              title: "Data Laporan Detail",
              to: "/laporan/detail",
            },
            {
              key: "laporan-pemasukan",
              title: "Data Laporan Pemasukan",
              to: "/laporan/pemasukan",
            },
            {
              key: "laporan-treatment",
              title: "Data Laporan Treatment",
              to: "/laporan/treatment",
            },
            {
              key: "laporan-obat",
              title: "Data Laporan Obat",
              to: "/laporan/obat",
            },
            {
              key: "laporan-top-treatment",
              title: "Pasien Treatment Terbanyak",
              to: "/laporan/top-treatment",
            },
            {
              key: "laporan-top-nominal",
              title: "Top Nominal Terbanyak",
              to: "/laporan/top-nominal",
            },
            {
              key: "laporan-terlaris",
              title: "Data Tindakan Terlaris",
              to: "/laporan/terlaris",
            },
          ],
        },

        { header: "Menu User" },

        {
          key: "users",
          title: "Users",
          icon: "mdi-account-multiple",
          to: "/users",
        },
      ],
    };
  },

  computed: {
    activeOpenGroups() {
      const opened = [];

      this.menu.forEach((item) => {
        if (!item.children) return;

        if (this.hasActiveChild(item.children)) {
          opened.push(item.key);
        }

        item.children.forEach((child) => {
          if (child.children && this.hasActiveChild(child.children)) {
            opened.push(child.key);
            opened.push(item.key);
          }
        });
      });

      return [...new Set(opened)];
    },

    openedValues() {
      return [...new Set([...this.manualOpened, ...this.activeOpenGroups])];
    },
  },

  watch: {
    "$route.path"() {
      this.cleanManualOpened();
    },
  },

  mounted() {
    this.cleanManualOpened();
  },

  methods: {
    normalizePath(path) {
      if (!path) return "/";

      const cleanPath = String(path)
        .split("?")[0]
        .split("#")[0]
        .replace(/\/+$/, "");

      return cleanPath || "/";
    },

    isRouteActive(targetPath) {
      const currentPath = this.normalizePath(this.$route.path);
      const basePath = this.normalizePath(targetPath);

      if (basePath === "/") {
        return currentPath === "/";
      }

      return currentPath === basePath || currentPath.startsWith(`${basePath}/`);
    },

    hasActiveChild(children = []) {
      return children.some((child) => {
        if (child.children) {
          return this.hasActiveChild(child.children);
        }

        return this.isRouteActive(child.to);
      });
    },

    onUpdateOpened(values) {
      this.manualOpened = values.filter(
        (value) => !this.activeOpenGroups.includes(value),
      );
    },

    cleanManualOpened() {
      this.manualOpened = this.manualOpened.filter((value) => {
        return !this.activeOpenGroups.includes(value);
      });
    },
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

/* === ACTIVE BASE === */
.nav-item--active {
  color: #ffffff !important;
}

.nav-item--active .nav-label {
  color: #ffffff !important;
  font-weight: 600;
}

/* === LEVEL 1: item aktif asli (mis. Dashboard, Users) === */
.nav-item--active-l1 {
  background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%) !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.nav-item--active-l1 .icon-wrap {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

/* === LEVEL 1: parent terbuka karena ada child aktif === */
.nav-item--open-l1 {
  background: rgba(37, 99, 235, 0.16) !important;
  color: #bfdbfe !important;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.nav-item--open-l1 .icon-wrap {
  background: rgba(37, 99, 235, 0.2);
  color: #93c5fd;
}

.nav-item--open-l1 .nav-label {
  color: #dbeafe !important;
}

.nav-item--open-l1 :deep(.v-list-item__append .v-icon) {
  color: #93c5fd !important;
}

/* === LEVEL 2: item aktif === */
.nav-item--active-l2 {
  background: rgba(14, 165, 233, 0.2) !important;
  color: #e0f2fe !important;
  border-left: 3px solid #38bdf8;
}

.nav-item--active-l2 .bullet-dot {
  background: #38bdf8;
  border-color: #7dd3fc;
}

/* === LEVEL 2: group terbuka karena ada level 3 aktif === */
.nav-item--open-l2 {
  background: rgba(56, 189, 248, 0.12) !important;
  color: #bae6fd !important;
}

.nav-item--open-l2 .bullet-dot {
  background: #7dd3fc;
  border-color: #bae6fd;
}

.nav-item--open-l2 .nav-label {
  color: #bae6fd !important;
}

.nav-item--open-l2 :deep(.v-list-item__append .v-icon) {
  color: #7dd3fc !important;
}

/* === LEVEL 3: item aktif === */
.nav-item--active-l3 {
  background: rgba(16, 185, 129, 0.18) !important;
  color: #d1fae5 !important;
  border-left: 3px solid #34d399;
}

.nav-item--active-l3 .bullet-dash {
  background: #34d399;
  width: 14px;
}
</style>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    app
    width="270"
    class="sidebar"
  >
    <div class="sidebar-header">
      <div class="logo-wrapper">
        <img :src="logo" alt="MS Glow" class="logo-img" />
      </div>
      <div class="logo-divider"></div>
    </div>

    <v-list
      density="comfortable"
      nav
      class="sidebar-nav"
      :opened="openedValues"
      @update:opened="onUpdateOpened"
    >
      <template v-for="(item, i) in visibleMenu" :key="item.key || `menu-${i}`">
        <div v-if="item.header" class="menu-section-header">
          <span class="header-line"></span>
          <span class="header-text">{{ item.header }}</span>
          <span class="header-line"></span>
        </div>

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

          <template
            v-for="(child, j) in item.children"
            :key="child.key || `${item.key}-child-${j}`"
          >
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

    <template #append>
      <div class="sidebar-footer">
        <div class="footer-divider"></div>

        <div class="footer-content">
          <div class="footer-avatar">{{ currentUserInitialComputed }}</div>

          <div class="footer-info">
            <div class="footer-name">{{ currentUserName }}</div>
            <div class="footer-role">{{ currentRoleLabel }}</div>
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
    currentRole: {
      type: String,
      default: "administrator",
    },
    currentUserName: {
      type: String,
      default: "IT JKS",
    },
    currentUserInitial: {
      type: String,
      default: "IT",
    },
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
          roles: ["all"],
        },
        {
          key: "antrian",
          title: "Nomor Antrian",
          icon: "mdi-timer-sand-empty",
          to: "/antrian",
          roles: ["all"],
        },

        {
          header: "MASTER DATA",
          key: "header-master-data",
          roles: ["administrator", "sudo", "it", "management", "front office"],
        },
        {
          key: "master-data",
          title: "Master Data",
          icon: "mdi-database-outline",
          roles: ["administrator", "sudo", "it", "management", "front office"],
          children: [
            {
              key: "master-toko",
              title: "Toko",
              to: "/master/toko",
              roles: ["administrator", "sudo", "it", "management"],
            },
            {
              key: "master-karyawan",
              title: "Karyawan",
              to: "/master/karyawan",
              roles: ["administrator", "sudo", "it", "management"],
            },
            {
              key: "master-pasien",
              title: "Pasien",
              to: "/master/pasien",
              roles: ["administrator", "sudo", "it", "management"],
            },
            {
              key: "master-supplier",
              title: "Supplier",
              to: "/master/supplier",
              roles: ["administrator", "sudo", "it", "management"],
            },
            {
              key: "master-brand-ambassador",
              title: "Brand Ambassador",
              to: "/master/brand-ambassador",
              roles: ["administrator", "sudo", "it", "management"],
            },
            {
              key: "master-treatment-global",
              title: "Treatment Global",
              to: "/master/treatment-global",
              roles: ["sudo"], // superadmin only
            },
            {
              key: "master-product-global",
              title: "Product Global",
              to: "/master/product-global",
              roles: ["sudo"], // superadmin only
            },
            {
              key: "master-merchandise",
              title: "Merchandise",
              to: "/master/merchandise",
              roles: ["administrator", "sudo", "it", "management"],
            },
          ],
        },

        {
          header: "OPERASIONAL KLINIK",
          key: "header-operasional-klinik",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "sp",
            "apoteker",
          ],
        },
        // {
        //   key: "operasional-klinik",
        //   title: "Operasional Klinik",
        //   icon: "mdi-hospital-building",
        //   roles: [
        //     "administrator",
        //     "sudo",
        //     "it",
        //     "management",
        //     "sp",
        //     "apoteker",
        //   ],
        //   children: [
        //     {
        //       key: "operasional-jadwal-dokter",
        //       title: "Jadwal Dokter",
        //       to: "/operasional/jadwal-dokter",
        //       roles: ["administrator", "sudo", "it", "management"],
        //     },
        //     {
        //       key: "operasional-jadwal-nurse",
        //       title: "Jadwal Nurse & Beautician",
        //       to: "/operasional/jadwal-nurse",
        //       roles: ["administrator", "sudo", "it", "management", "sp"],
        //     },
        //     {
        //       key: "operasional-treatment-klinik",
        //       title: "Treatment Klinik",
        //       to: "/operasional/treatment-klinik",
        //       roles: ["administrator", "sudo", "it", "management"],
        //     },
        //     {
        //       key: "operasional-stock-apotek",
        //       title: "Stock Apotek",
        //       to: "/operasional/stock-apotek",
        //       roles: ["administrator", "sudo", "it", "management", "apoteker"],
        //     },
        //   ],
        // },

        // {
        //   header: "PROMO & CONTENT",
        //   key: "header-promo-content",
        //   roles: ["administrator", "sudo", "it", "management"],
        // },
        // {
        //   key: "promo-content",
        //   title: "Promo & Content",
        //   icon: "mdi-bullhorn-outline",
        //   roles: ["administrator", "sudo", "it", "management"],
        //   children: [
        //     {
        //       key: "promo-voucher-diskon",
        //       title: "Voucher Diskon",
        //       to: "/promo/voucher",
        //       roles: ["administrator", "sudo", "it", "management"],
        //     },
        //     {
        //       key: "content-banner-upload",
        //       title: "Banner Upload",
        //       to: "/content/banner-upload",
        //       roles: ["administrator", "sudo", "it", "management"],
        //     },
        //     {
        //       key: "content-news-upload",
        //       title: "News Upload",
        //       to: "/content/news-upload",
        //       roles: ["administrator", "sudo", "it", "management"],
        //     },
        //     {
        //       key: "content-promo-upload",
        //       title: "Promo Upload",
        //       to: "/content/promo-upload",
        //       roles: ["administrator", "sudo", "it", "management"],
        //     },
        //     {
        //       key: "content-dashboard-upload",
        //       title: "Upload Content Dashboard",
        //       to: "/content/dashboard-upload",
        //       roles: ["administrator", "sudo", "it", "management"],
        //     },
        //   ],
        // },
        {
          header: "ADMINISTRASI",
          key: "header-administrasi",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "sp",
            "apoteker",
          ],
        },
        {
          key: "administrasi",
          title: "Administrasi",
          icon: "mdi-cog-outline",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "sp",
            "apoteker",
          ],
          children: [
            // {
            //   key: "administrasi-supplier",
            //   title: "Supplier",
            //   to: "/administrasi/supplier",
            //   roles: ["administrator", "sudo", "it", "management"],
            // },
            {
              key: "administrasi-jadwal-dokter",
              title: "Jadwal Dokter",
              to: "/administrasi/jadwal-dokter",
              roles: ["administrator", "sudo", "it", "management"],
            },
            {
              key: "administrasi-jadwal-nurse",
              title: "Jadwal Nurse & Beautician",
              to: "/administrasi/jadwal-nurse",
              roles: ["administrator", "sudo", "it", "management", "sp"],
            },
            // {
            //   key: "administrasi-treatment-klinik",
            //   title: "Treatment Klinik",
            //   to: "/administrasi/treatment-klinik",
            //   roles: ["administrator", "sudo", "it", "management"],
            // },
            {
              key: "administrasi-stock-apotek",
              title: "Stock Apotek",
              to: "/administrasi/stock-apotek",
              roles: ["administrator", "sudo", "it", "management", "apoteker"],
            },
            {
              key: "administrasi-voucher-diskon",
              title: "Voucher Diskon",
              to: "/administrasi/voucher-diskon",
              roles: ["administrator", "sudo", "it", "management"],
            },
          ],
        },
        {
          header: "PENGATURAN SISTEM",
          key: "header-pengaturan-sistem",
          roles: ["administrator", "sudo", "it"],
        },
        {
          key: "pengaturan-sistem",
          title: "Pengaturan Sistem",
          icon: "mdi-cog-outline",
          roles: ["administrator", "sudo", "it"],
          children: [
            {
              key: "pengaturan-whatsapp",
              title: "Pengaturan WhatsApp",
              to: "/pengaturan/whatsapp",
              roles: ["administrator", "sudo", "it"],
            },
          ],
        },
        {
          header: "MENU RESEPSIONIS",
          key: "header-resepsionis",
          roles: ["administrator", "sudo", "it", "management", "front office"],
        },

        {
          key: "resepsionis",
          title: "Resepsionis",
          icon: "mdi-account-voice",
          roles: ["administrator", "sudo", "it", "management", "front office"],
          children: [
            {
              key: "resepsionis-daftar-baru",
              title: "Pendaftaran Pasien Baru",
              to: "/resepsionis/daftar-baru",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "front office",
              ],
            },
            {
              key: "registrasi-layanan",
              title: "Registrasi Layanan",
              to: "/resepsionis/registrasi-layanan",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "front office",
              ],
            },
            // {
            //   key: "resepsionis-pembayaran-recipe",
            //   title: "Pembayaran Recipe",
            //   to: "/resepsionis/pembayaran-recipe",
            //   roles: [
            //     "administrator",
            //     "sudo",
            //     "it",
            //     "management",
            //     "front office",
            //   ],
            // },
            {
              key: "resepsionis-booking",
              title: "Daftar Booking",
              to: "/resepsionis/booking",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "front office",
              ],
            },
            {
              key: "resepsionis-poin",
              title: "Penukaran Poin",
              to: "/resepsionis/poin",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "front office",
              ],
            },
          ],
        },

        {
          header: "PELAYANAN MEDIS",
          key: "header-pelayanan-medis",
          roles: ["administrator", "sudo", "it", "management", "dokter", "sp"],
        },
        {
          key: "pelayanan-medis",
          title: "Pelayanan Medis",
          icon: "mdi-stethoscope",
          roles: ["administrator", "sudo", "it", "management", "dokter", "sp"],
          children: [
            {
              key: "medis-antrian-dokter",
              title: "Antrian Dokter",
              to: "/pelayanan-medis/antrian-dokter",
              roles: ["administrator", "sudo", "it", "management", "dokter"],
            },
            {
              key: "medis-antrian-perawat",
              title: "Antrian Perawat",
              to: "/pelayanan-medis/antrian-perawat",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "dokter",
                "sp",
              ],
            },
            {
              key: "medis-riwayat",
              title: "Riwayat Pelayanan",
              to: "/pelayanan-medis/riwayat-pelayanan",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "dokter",
                "sp",
              ],
            },
          ],
        },

        {
          header: "NURSE STATION",
          key: "header-nurse-station",
          roles: ["administrator", "sudo", "it", "management", "sp"],
        },
        // {
        //   key: "nurse-station",
        //   title: "Nurse Station",
        //   icon: "mdi-medical-bag",
        //   roles: ["administrator", "sudo", "it", "management", "sp"],
        //   children: [
        //     {
        //       key: "nurse-station-antrian",
        //       title: "Antrian Perawat",
        //       to: "/nurse-station/antrian-perawat",
        //       roles: ["administrator", "sudo", "it", "management", "sp"],
        //     },
        //     {
        //       key: "nurse-station-riwayat",
        //       title: "Riwayat Tindakan Perawat",
        //       to: "/nurse-station/riwayat",
        //       roles: ["administrator", "sudo", "it", "management", "sp"],
        //     },
        //   ],
        // },

        {
          header: "FARMASI",
          key: "header-farmasi",
          roles: ["administrator", "sudo", "it", "management", "apoteker"],
        },
        {
          key: "farmasi",
          title: "Farmasi / Depo",
          icon: "mdi-flask-outline",
          roles: ["administrator", "sudo", "it", "management", "apoteker"],
          children: [
            {
              key: "farmasi-antrian-resep",
              title: "Antrian Resep",
              to: "/farmasi/antrian-resep",
              roles: ["administrator", "sudo", "it", "management", "apoteker"],
            },
            {
              key: "farmasi-riwayat-resep",
              title: "Riwayat Resep",
              to: "/farmasi/riwayat-resep",
              roles: ["administrator", "sudo", "it", "management", "apoteker"],
            },
          ],
        },

        {
          header: "KASIR",
          key: "header-kasir",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "front office",
            "branch accounting",
          ],
        },
        {
          key: "kasir",
          title: "Kasir",
          icon: "mdi-cash-register",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "front office",
            "branch accounting",
          ],
          children: [
            {
              key: "kasir-daftar-pembayaran",
              title: "Daftar Pembayaran",
              to: "/kasir/daftar-pembayaran",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "front office",
                "branch accounting",
              ],
            },
            {
              key: "kasir-pembayaran-resep",
              title: "Pembayaran Resep",
              to: "/kasir/pembayaran-resep",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "front office",
                "branch accounting",
              ],
            },
            {
              key: "kasir-riwayat",
              title: "Riwayat Pembayaran",
              to: "/kasir/riwayat-pembayaran",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "front office",
                "branch accounting",
              ],
            },
          ],
        },

        // {
        //   header: "MENU TRANSAKSI",
        //   key: "header-transaksi",
        //   roles: [
        //     "administrator",
        //     "sudo",
        //     "it",
        //     "management",
        //     "branch accounting",
        //   ],
        // },

        // {
        //   key: "transaksi",
        //   title: "Data Transaksi",
        //   icon: "mdi-swap-horizontal",
        //   roles: [
        //     "administrator",
        //     "sudo",
        //     "it",
        //     "management",
        //     "branch accounting",
        //   ],
        //   children: [
        //     {
        //       key: "transaksi-semua",
        //       title: "Data Tr Semua",
        //       to: "/transaksi/semua",
        //       roles: [
        //         "administrator",
        //         "sudo",
        //         "it",
        //         "management",
        //         "branch accounting",
        //       ],
        //     },
        //     {
        //       key: "transaksi-poin",
        //       title: "Data Tr Poin",
        //       to: "/transaksi/poin",
        //       roles: [
        //         "administrator",
        //         "sudo",
        //         "it",
        //         "management",
        //         "branch accounting",
        //       ],
        //     },
        //   ],
        // },

        {
          header: "MENU WHATSAPP",
          key: "header-whatsapp",
          roles: ["administrator", "sudo", "it", "management"],
        },

        {
          key: "whatsapp",
          title: "WhatsApp Logs",
          icon: "mdi-whatsapp",
          roles: ["administrator", "sudo", "it", "management"],
          children: [
            {
              key: "wa-undian",
              title: "Kirim Undian",
              to: "/wa/undian",
              roles: ["administrator", "sudo", "it", "management"],
            },
          ],
        },

        {
          header: "SETTLEMENT ACCURATE",
          key: "header-accurate",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "branch accounting",
          ],
        },

        {
          key: "accurate",
          title: "Report Accurate",
          icon: "mdi-alpha-a-circle",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "branch accounting",
          ],
          children: [
            {
              key: "accurate-faktur-umum",
              title: "Upload Faktur Umum",
              to: "/accurate/faktur-umum",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "accurate-faktur-elite",
              title: "Upload Faktur EliteGlobal",
              to: "/accurate/faktur-elite",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "accurate-faktur-owner",
              title: "Upload Faktur Owner",
              to: "/accurate/faktur-owner",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "accurate-faktur-deposit",
              title: "Upload Faktur Deposit",
              to: "/accurate/faktur-deposit",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "accurate-faktur-realisasi",
              title: "Upload Faktur Realisasi Deposit",
              to: "/accurate/faktur-realisasi",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "accurate-sto",
              title: "Upload STO",
              to: "/accurate/sto",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
          ],
        },

        {
          header: "MENU LAPORAN",
          key: "header-laporan",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "branch accounting",
          ],
        },

        {
          key: "laporan",
          title: "Pelaporan",
          icon: "mdi-file-chart-outline",
          roles: [
            "administrator",
            "sudo",
            "it",
            "management",
            "branch accounting",
          ],
          children: [
            {
              key: "laporan-insentif-dokter",
              title: "Insentif Dokter",
              to: "/laporan/insentif-dokter",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-insentif-nurse",
              title: "Insentif Nurse/Beautician",
              to: "/laporan/insentif-nurse",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-insentif-apoteker",
              title: "Insentif Apoteker / Asisten Apoteker",
              to: "/laporan/insentif-apoteker",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-detail",
              title: "Data Laporan Detail",
              to: "/laporan/detail",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-pemasukan",
              title: "Data Laporan Pemasukan",
              to: "/laporan/pemasukan",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-treatment",
              title: "Data Laporan Treatment",
              to: "/laporan/treatment",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-obat",
              title: "Data Laporan Obat",
              to: "/laporan/obat",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-top-treatment",
              title: "Pasien Treatment Terbanyak",
              to: "/laporan/top-treatment",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-top-nominal",
              title: "Top Nominal Terbanyak",
              to: "/laporan/top-nominal",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
            {
              key: "laporan-terlaris",
              title: "Data Tindakan Terlaris",
              to: "/laporan/terlaris",
              roles: [
                "administrator",
                "sudo",
                "it",
                "management",
                "branch accounting",
              ],
            },
          ],
        },

        {
          header: "MENU USER",
          key: "header-users",
          roles: ["administrator", "sudo", "it"],
        },

        {
          key: "users",
          title: "Users",
          icon: "mdi-account-multiple",
          to: "/users",
          roles: ["administrator", "sudo", "it"],
        },
      ],
    };
  },

  computed: {
    normalizedCurrentRole() {
      return this.normalizeRole(this.currentRole);
    },

    currentUserInitialComputed() {
      const value = (this.currentUserInitial || "").trim();
      if (value) return value.toUpperCase();

      return (
        this.currentUserName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase() || "US"
      );
    },

    currentRoleLabel() {
      const map = {
        all: "All Role",
        administrator: "Administrator",
        dokter: "Dokter",
        front_office: "Front Office",
        apoteker: "Apoteker",
        branch_accounting: "Branch Accounting",
        security: "Security",
        sudo: "Sudo",
        sp: "SP",
        it: "IT",
        management: "Management",
      };

      return map[this.normalizedCurrentRole] || this.currentRole;
    },

    visibleMenu() {
      return this.filterMenuByRole(this.menu);
    },

    activeOpenGroups() {
      const opened = [];

      this.visibleMenu.forEach((item) => {
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
    currentRole() {
      this.cleanManualOpened();
    },
  },

  mounted() {
    this.cleanManualOpened();
  },

  methods: {
    normalizeRole(role) {
      return String(role || "all")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
    },

    normalizeRoles(roles = []) {
      return roles.map((role) => this.normalizeRole(role));
    },

    isAllowed(item) {
      if (!item.roles || item.roles.length === 0) return true;

      const roles = this.normalizeRoles(item.roles);

      if (roles.includes("all")) return true;
      if (this.normalizedCurrentRole === "all") return true;

      return roles.includes(this.normalizedCurrentRole);
    },

    filterMenuByRole(items = []) {
      const result = [];

      items.forEach((item) => {
        if (item.header) {
          if (this.isAllowed(item)) {
            result.push({ ...item });
          }
          return;
        }

        if (!item.children) {
          if (this.isAllowed(item)) {
            result.push({ ...item });
          }
          return;
        }

        const filteredChildren = this.filterMenuByRole(item.children);

        if (this.isAllowed(item) || filteredChildren.length > 0) {
          result.push({
            ...item,
            children: filteredChildren,
          });
        }
      });

      return result.filter((item, index, arr) => {
        if (!item.header) return true;

        const nextItem = arr[index + 1];
        return !!nextItem && !nextItem.header;
      });
    },

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

.sidebar {
  background: #2c3136 !important;
  border-right: none !important;
  font-family: "Plus Jakarta Sans", sans-serif;
}

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

.nav-label {
  font-size: 13.5px !important;
  font-weight: 500 !important;
  letter-spacing: 0.1px;
}

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

.nav-group :deep(.v-list-group__items) {
  padding: 0 !important;
}

.nav-group-l2 :deep(.v-list-group__items) {
  padding: 0 !important;
}

:deep(.v-list-group__header .v-list-item__append .v-icon) {
  color: #ced4da !important;
  font-size: 18px !important;
  opacity: 1 !important;
}

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

.nav-item--active {
  color: #ffffff !important;
}

.nav-item--active .nav-label {
  color: #ffffff !important;
  font-weight: 600;
}

.nav-item--active-l1 {
  background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%) !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.nav-item--active-l1 .icon-wrap {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

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

.nav-item--active-l2 {
  background: rgba(14, 165, 233, 0.2) !important;
  color: #e0f2fe !important;
  border-left: 3px solid #38bdf8;
}

.nav-item--active-l2 .bullet-dot {
  background: #38bdf8;
  border-color: #7dd3fc;
}

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

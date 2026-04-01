const administrasiRoutes = [
  {
    path: "/administrasi",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "dokter",
        name: "Dokter",
        component: () =>
          import("@/views/administrasi/dokter-dan-beautician/all-dokter.vue"),
      },
      {
        path: "dokter/add",
        name: "Tambah Dokter",
        component: () =>
          import("@/views/administrasi/dokter-dan-beautician/add-dokter.vue"),
      },
      {
        path: "pasien",
        name: "Pasien",
        component: () => import("@/views/administrasi/pasien/all-pasien.vue"),
      },
      {
        path: "pasien/riwayat/:id",
        name: "Riwayat Pasien",
        component: () =>
          import("@/views/administrasi/pasien/riwayat-pasien.vue"),
      },
      {
        path: "pasien/riwayat/pengkajian-awal/:id",
        name: "Pengkajian Pasien",
        component: () =>
          import("@/views/administrasi/pasien/pengkajian-awal.vue"),
      },
      {
        path: "pasien/riwayat/saldo-deposit/:id",
        name: "Saldo Deposit",
        component: () =>
          import("@/views/administrasi/pasien/saldo-deposit.vue"),
      },
      {
        path: "supplier",
        name: "Supplier",
        component: () =>
          import("@/views/administrasi/supplier/all-supplier.vue"),
      },
      {
        path: "jadwal-dokter",
        name: "Jadwal Dokter",
        component: () =>
          import("@/views/administrasi/jadwal-dokter/all-jadwal-dokter.vue"),
      },
      {
        path: "jadwal-nurse",
        name: "Jadwal Nurse dan Beautician",
        component: () =>
          import("@/views/administrasi/jadwal-nurse-dan-beautician/all-jadwal-nurse-dan-beautician.vue"),
      },
      {
        path: "treatment",
        name: "Treatment",
        component: () =>
          import("@/views/administrasi/treatment/all-treatment.vue"),
      },
      {
        path: "stock-apotek",
        name: "Stock Apotek",
        component: () =>
          import("@/views/administrasi/stock-apotek/all-stock-apotek.vue"),
      },
      {
        path: "merchandise",
        name: "Merchandise",
        component: () =>
          import("@/views/administrasi/merchandise/all-merchandise.vue"),
      },
      {
        path: "voucher",
        name: "Voucher Diskon",
        component: () =>
          import("@/views/administrasi/voucher-diskon/all-voucher-diskon.vue"),
      },
    ],
  },
];

export default administrasiRoutes;

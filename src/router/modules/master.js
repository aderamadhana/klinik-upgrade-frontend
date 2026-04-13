const masterRoutes = [
  {
    path: "/master",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "toko",
        name: "Master Toko",
        component: () => import("@/views/master/toko/all-toko.vue"),
      },

      // START MASTER KARYAWAN
      {
        path: "karyawan",
        name: "Master Karyawan",
        component: () => import("@/views/master/karyawan/all-karyawan.vue"),
      },
      {
        path: "karyawan/add",
        name: "Tambah Karyawan",
        component: () => import("@/views/master/karyawan/add-karyawan.vue"),
      },
      // END MASTER KARYAWAN

      {
        path: "pasien",
        name: "Master Pasien",
        component: () => import("@/views/master/pasien/all-pasien.vue"),
      },
      {
        path: "pasien/riwayat/:id",
        name: "Riwayat Pasien",
        component: () => import("@/views/master/pasien/riwayat-pasien.vue"),
      },
      {
        path: "pasien/riwayat/pengkajian-awal/:id",
        name: "Pengkajian Pasien",
        component: () => import("@/views/master/pasien/pengkajian-awal.vue"),
      },
      {
        path: "pasien/riwayat/saldo-deposit/:id",
        name: "Saldo Deposit",
        component: () => import("@/views/master/pasien/saldo-deposit.vue"),
      },
      {
        path: "supplier",
        name: "Master Supplier",
        component: () => import("@/views/master/supplier/all-supplier.vue"),
      },
      {
        path: "brand-ambassador",
        name: "Master Brand Ambassador",
        component: () =>
          import("@/views/master/brand-ambassador/all-brand-ambassador.vue"),
      },
      {
        path: "merchandise",
        name: "Master Merchandise",
        component: () =>
          import("@/views/master/merchandise/all-merchandise.vue"),
      },
      {
        path: "product-global",
        name: "Master Product Global",
        component: () =>
          import("@/views/master/product-global/all-product-global.vue"),
      },
      {
        path: "treatment-global",
        name: "Master Treatment Global",
        component: () =>
          import("@/views/master/treatment-global/all-treatment-global.vue"),
      },
    ],
  },
];

export default masterRoutes;

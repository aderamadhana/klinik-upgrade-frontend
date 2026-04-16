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
      {
        path: "toko/add",
        name: "Tambah Toko",
        component: () => import("@/views/master/toko/add-toko.vue"),
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
      {
        path: "karyawan/edit/:id",
        name: "Edit Karyawan",
        component: () => import("@/views/master/karyawan/edit-karyawan.vue"),
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

      // START MASTER SUPPLIER
      {
        path: "supplier",
        name: "Master Supplier",
        component: () => import("@/views/master/supplier/all-supplier.vue"),
      },
      {
        path: "supplier/add",
        name: "Tambah Supplier",
        component: () => import("@/views/master/supplier/add-supplier.vue"),
      },
      {
        path: "supplier/edit/:id",
        name: "Edit Supplier",
        component: () => import("@/views/master/supplier/edit-supplier.vue"),
      },
      // END MASTER SUPPLIER

      // START MASTER BRAND AMBASSADOR
      {
        path: "brand-ambassador",
        name: "Master Brand Ambassador",
        component: () =>
          import("@/views/master/brand-ambassador/all-brand-ambassador.vue"),
      },
      {
        path: "brand-ambassador/add",
        name: "Tambah Brand Ambassador",
        component: () =>
          import("@/views/master/brand-ambassador/add-brand-ambassador.vue"),
      },
      {
        path: "brand-ambassador/edit/:id",
        name: "Edit Brand Ambassador",
        component: () =>
          import("@/views/master/brand-ambassador/edit-brand-ambassador.vue"),
      },
      // END MASTER BRAND AMBASSADOR

      // START MASTER MERCHANDISE
      {
        path: "merchandise",
        name: "Master Merchandise",
        component: () =>
          import("@/views/master/merchandise/all-merchandise.vue"),
      },
      {
        path: "merchandise/add",
        name: "Tambah Merchandise",
        component: () =>
          import("@/views/master/merchandise/add-merchandise.vue"),
      },
      {
        path: "merchandise/edit/:id",
        name: "Edit Merchandise",
        component: () =>
          import("@/views/master/merchandise/edit-merchandise.vue"),
      },
      // END MASTER MERCHANDISE

      {
        path: "product-global",
        name: "Master Product Global",
        component: () =>
          import("@/views/master/product-global/all-product-global.vue"),
      },
      {
        path: "product-global/add",
        name: "Add Product Global",
        component: () =>
          import("@/views/master/product-global/add-product-global.vue"),
      },
      {
        path: "product-global/edit/:id",
        name: "Edit Product Global",
        component: () =>
          import("@/views/master/product-global/edit-product-global.vue"),
      },

      {
        path: "treatment-global",
        name: "Master Treatment Global",
        component: () =>
          import("@/views/master/treatment-global/all-treatment-global.vue"),
      },
      {
        path: "treatment-global/add",
        name: "Tambah Treatment Global",
        component: () =>
          import("@/views/master/treatment-global/add-treatment-global.vue"),
      },
      {
        path: "treatment-global/edit/:id",
        name: "Edit Treatment Global",
        component: () =>
          import("@/views/master/treatment-global/edit-treatment-global.vue"),
      },
    ],
  },
];

export default masterRoutes;

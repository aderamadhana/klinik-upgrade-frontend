const administrasiRoutes = [
  {
    path: "/administrasi",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
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
        path: "voucher-diskon",
        name: "Voucher Diskon",
        component: () =>
          import("@/views/administrasi/voucher-diskon/all-voucher-diskon.vue"),
      },
    ],
  },
];

export default administrasiRoutes;

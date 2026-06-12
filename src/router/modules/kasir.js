const kasirRoutes = [
  {
    path: "/kasir",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "daftar-pembayaran",
        name: "Pembayaran Layanan",
        component: () =>
          import("@/views/kasir-pembayaran/pembayaran/all-pembayaran.vue"),
      },
      {
        path: "riwayat-pembayaran",
        name: "Riwayat Pembayaran",
        component: () =>
          import("@/views/kasir-pembayaran/pembayaran/riwayat-pembayaran.vue"),
      },
      {
        path: "daftar-pembayaran/:id/proses-pembayaran",
        name: "Proses Pembayaran Layanan",
        component: () =>
          import("@/views/kasir-pembayaran/pembayaran/proses-pembayaran.vue"),
      },
    ],
  },
];

export default kasirRoutes;

const kasirRoutes = [
  {
    path: "/kasir",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "pembayaran",
        name: "Pembayaran Layanan",
        component: () =>
          import("@/views/kasir-pembayaran/pembayaran/all-pembayaran.vue"),
      },
    ],
  },
];

export default kasirRoutes;

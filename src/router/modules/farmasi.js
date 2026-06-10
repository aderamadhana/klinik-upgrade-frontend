const farmasiRoutes = [
  {
    path: "/farmasi",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "antrian-resep",
        name: "Antrian Resep",
        component: () =>
          import("@/views/farmasi/antrian-resep/all-antrian-resep.vue"),
      },
      {
        path: "riwayat-resep",
        name: "Riwayat Resep",
        component: () =>
          import("@/views/farmasi/antrian-resep/all-riwayat-resep.vue"),
      },
    ],
  },
];

export default farmasiRoutes;

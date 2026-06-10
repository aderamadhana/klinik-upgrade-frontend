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
        props: {
          mode: "queue",
        },
      },
      {
        path: "riwayat-resep",
        name: "Riwayat Resep",
        component: () =>
          import("@/views/farmasi/antrian-resep/all-antrian-resep.vue"),
        props: {
          mode: "history",
        },
      },
    ],
  },
];

export default farmasiRoutes;

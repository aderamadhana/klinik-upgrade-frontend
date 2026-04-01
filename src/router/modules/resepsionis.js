const resepsionisRoutes = [
  {
    path: "/resepsionis",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "daftar-baru",
        name: "Daftar Baru",
        component: () =>
          import("@/views/resepsionis/pendaftaran-pasien-baru.vue"),
      },
      {
        path: "konsultasi",
        name: "Daftar Konsultasi",
        component: () =>
          import("@/views/resepsionis/daftar-konsultasi/form-daftar-konsultasi.vue"),
      },
      {
        path: "konsultasi-online",
        name: "Daftar Konsultasi Online",
        component: () =>
          import("@/views/resepsionis/daftar-konsultasi-online/form-daftar-konsultasi-online.vue"),
      },
    ],
  },
];

export default resepsionisRoutes;

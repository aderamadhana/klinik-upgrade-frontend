const resepsionisRoutes = [
  {
    path: "/resepsionis",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "registrasi-layanan/add",
        name: "Tambah Layanan",
        component: () =>
          import("@/views/resepsionis/add-registrasi-layanan.vue"),
      },
      {
        path: "registrasi-layanan",
        name: "Registrasi Layanan",
        component: () =>
          import("@/views/resepsionis/all-registrasi-layanan.vue"),
      },
      // {
      //   path: "detail-registrasi-layanan",
      //   name: "Detail Registrasi Layanan",
      //   component: () =>
      //     import("@/views/resepsionis/detail-registrasi-layanan.vue"),
      // },
      // {
      //   path: "proses-layanan",
      //   name: "Proses Layanan",
      //   component: () => import("@/views/resepsionis/proses-layanan.vue"),
      // },
      // {
      //   path: "finalisasi-layanan",
      //   name: "Finalisasi Layanan",
      //   component: () => import("@/views/resepsionis/finalisasi-layanan.vue"),
      // },
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

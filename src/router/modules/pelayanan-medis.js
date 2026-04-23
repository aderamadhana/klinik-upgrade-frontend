const pelayananMedisRoutes = [
  {
    path: "/pelayanan-medis",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "riwayat-pelayanan",
        name: "Riwayat Pelayanan",
        component: () =>
          import("@/views/pelayanan-medis/riwayat-pelayanan/all-riwayat-pelayanan.vue"),
      },

      {
        path: "antrian-dokter",
        name: "Antrian Dokter",
        component: () =>
          import("@/views/pelayanan-medis/antrian-dokter/all-antrian-dokter.vue"),
      },
      {
        path: "antrian-dokter/:id/proses-antrian-dokter",
        name: "Proses Antrian Dokter",
        component: () =>
          import("@/views/pelayanan-medis/antrian-dokter/proses-antrian-dokter.vue"),
      },
      {
        path: "antrian-dokter/:id/isi-pengkajian-awal",
        name: "Isi Pengkajian Awal",
        component: () =>
          import("@/views/pelayanan-medis/antrian-dokter/isi-pengkajian-awal.vue"),
      },

      {
        path: "antrian-perawat",
        name: "Antrian Perawat",
        component: () =>
          import("@/views/pelayanan-medis/antrian-perawat/all-antrian-perawat.vue"),
      },
      {
        path: "antrian-perawat/:id/input-cppt",
        name: "Input CPPT",
        component: () =>
          import("@/views/pelayanan-medis/antrian-perawat/input-cppt.vue"),
      },
      {
        path: "antrian-perawat/:id/input-before-after",
        name: "Input Before After",
        component: () =>
          import("@/views/pelayanan-medis/antrian-perawat/input-before-after.vue"),
      },
      {
        path: "antrian-perawat/:id/input-bahan-treatment",
        name: "Input Bahan Treatment",
        component: () =>
          import("@/views/pelayanan-medis/antrian-perawat/input-bahan-treatment.vue"),
      },
    ],
  },
];

export default pelayananMedisRoutes;

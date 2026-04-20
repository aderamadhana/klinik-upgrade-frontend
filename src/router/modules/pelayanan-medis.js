const pelayananMedisRoutes = [
  {
    path: "/pelayanan-medis",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "antrian-konsultasi",
        name: "Antrian Konsultasi",
        component: () =>
          import("@/views/pelayanan-medis/antrian-konsultasi/all-antrian-konsultasi.vue"),
      },
      {
        path: "antrian-konsultasi/:id/isi-soap",
        name: "Isi SOAP",
        component: () =>
          import("@/views/pelayanan-medis/antrian-konsultasi/isi-soap.vue"),
      },
      {
        path: "antrian-konsultasi/:id/isi-pengkajian-awal",
        name: "Isi Pengkajian Awal",
        component: () =>
          import("@/views/pelayanan-medis/antrian-konsultasi/isi-pengkajian-awal.vue"),
      },

      {
        path: "antrian-tindakan",
        name: "Antrian Tindakan",
        component: () =>
          import("@/views/pelayanan-medis/antrian-tindakan/all-antrian-tindakan.vue"),
      },
      {
        path: "antrian-tindakan/:id/form-tindakan",
        name: "Isi SOAP",
        component: () =>
          import("@/views/pelayanan-medis/antrian-tindakan/form-tindakan.vue"),
      },

      {
        path: "riwayat-pelayanan",
        name: "Riwayat Pelayanan",
        component: () =>
          import("@/views/pelayanan-medis/riwayat-pelayanan/all-riwayat-pelayanan.vue"),
      },
    ],
  },
];

export default pelayananMedisRoutes;

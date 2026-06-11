const laporanRoutes = [
  {
    path: "/laporan",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "insentif-dokter",
        name: "Laporan Insentif Dokter",
        component: () =>
          import("@/views/laporan/insentif-dokter/laporan-insentif-dokter.vue"),
      },
      {
        path: "insentif-nurse-beautician",
        alias: ["/laporan/insentif-nurse", "/laporan/insentif-beautician"],
        name: "Laporan Insentif Nurse Beautician",
        component: () =>
          import("@/views/laporan/insentif-nurse-beautician/laporan-insentif-nurse-beautician.vue"),
      },
      {
        path: "insentif-apoteker",
        alias: ["/laporan/insentif-apotek", "/laporan/insentif-farmasi"],
        name: "Laporan Insentif Apoteker",
        component: () =>
          import("@/views/laporan/insentif-apoteker/laporan-insentif-apoteker.vue"),
      },
      {
        path: "detail-pasien",
        alias: [
          "/laporan/data-laporan-detail-pasien",
          "/laporan/laporan-detail-pasien",
        ],
        name: "Data Laporan Detail Pasien",
        component: () =>
          import("@/views/laporan/detail-pasien/data-laporan-detail-pasien.vue"),
      },
      {
        path: "pemasukan-umum",
        alias: [
          "/laporan/data-laporan-pemasukan-umum",
          "/laporan/laporan-pemasukan-umum",
          "/laporan/pemasukan",
          "/laporan/data-laporan-pemasukan",
        ],
        name: "Data Laporan Pemasukan",
        component: () =>
          import("@/views/laporan/pemasukan-umum/data-laporan-pemasukan-umum.vue"),
      },
      {
        path: "treatment",
        alias: [
          "/laporan/data-laporan-treatment",
          "/laporan/laporan-treatment",
        ],
        name: "Data Laporan Treatment",
        component: () =>
          import("@/views/laporan/treatment/data-laporan-treatment.vue"),
      },
      {
        path: "obat",
        alias: [
          "/laporan/produk",
          "/laporan/data-laporan-obat",
          "/laporan/laporan-obat",
          "/laporan/data-laporan-produk",
          "/laporan/laporan-produk",
        ],
        name: "Data Laporan Obat Produk",
        component: () => import("@/views/laporan/obat/data-laporan-obat.vue"),
      },
      {
        path: "pasien-treatment-terbanyak",
        alias: [
          "/laporan/data-pasien-treatment-terbanyak",
          "/laporan/laporan-pasien-treatment-terbanyak",
        ],
        name: "Data Pasien Treatment Terbanyak",
        component: () =>
          import("@/views/laporan/pasien-treatment-terbanyak/data-pasien-treatment-terbanyak.vue"),
      },
      {
        path: "top-pasien-nominal-terbanyak",
        alias: [
          "/laporan/data-top-pasien-nominal-terbanyak",
          "/laporan/laporan-top-pasien-nominal-terbanyak",
          "/laporan/pasien-nominal-terbanyak",
          "/laporan/top-nominal-pasien",
        ],
        name: "Data Top Pasien Nominal Terbanyak",
        component: () =>
          import("@/views/laporan/top-pasien-nominal-terbanyak/data-top-pasien-nominal-terbanyak.vue"),
      },
      {
        path: "tindakan-terlaris",
        alias: [
          "/laporan/data-laporan-tindakan-terlaris",
          "/laporan/laporan-tindakan-terlaris",
          "/laporan/treatment-terlaris",
          "/laporan/tindakan-terlaris",
        ],
        name: "Data Laporan Tindakan Terlaris",
        component: () =>
          import("@/views/laporan/tindakan-terlaris/data-laporan-tindakan-terlaris.vue"),
      },
    ],
  },
];

export default laporanRoutes;

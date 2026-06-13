const laporanBelumTersedia = () =>
  import("@/views/laporan/laporan-belum-tersedia.vue");

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
      {
        path: "treatment-tidak-laku",
        name: "Data Treatment Tidak Laku",
        component: laporanBelumTersedia,
        meta: {
          title: "Data Treatment Tidak Laku",
        },
      },
      {
        path: "pasien-paling-sering-belanja",
        name: "Pasien Paling Sering Belanja",
        component: laporanBelumTersedia,
        meta: {
          title: "Pasien Paling Sering Belanja",
        },
      },
      {
        path: "detail-treatment",
        name: "Data Laporan Detail Treatment",
        component: laporanBelumTersedia,
        meta: {
          title: "Data Laporan Detail Treatment",
        },
      },
      {
        path: "pasien-terakhir-transaksi",
        name: "Data Pasien Terakhir Transaksi",
        component: laporanBelumTersedia,
        meta: {
          title: "Data Pasien Terakhir Transaksi",
        },
      },
      {
        path: "pembayaran-fo",
        name: "Data Laporan Pembayaran FO",
        component: laporanBelumTersedia,
        meta: {
          title: "Data Laporan Pembayaran FO",
        },
      },
      {
        path: "jumlah-peningkatan-pasien",
        name: "Data Laporan Jumlah Peningkatan Pasien",
        component: laporanBelumTersedia,
        meta: {
          title: "Data Laporan Jumlah Peningkatan Pasien",
        },
      },
      {
        path: "produk-resep-dokter",
        name: "Data Laporan Produk Resep Dokter",
        component: laporanBelumTersedia,
        meta: {
          title: "Data Laporan Produk Resep Dokter",
        },
      },
      {
        path: "referral-treatment-staff",
        name: "Laporan Referral Treatment Staff",
        component: laporanBelumTersedia,
        meta: {
          title: "Laporan Referral Treatment Staff",
        },
      },
      {
        path: "referral-product-staff",
        name: "Laporan Referral Product Staff",
        component: laporanBelumTersedia,
        meta: {
          title: "Laporan Referral Product Staff",
        },
      },
      {
        path: "redeem-referral-ba",
        name: "Laporan Redeem Referral BA",
        component: laporanBelumTersedia,
        meta: {
          title: "Laporan Redeem Referral BA",
        },
      },
      {
        path: "belum-realisasi-deposit",
        name: "Data Laporan Belum Realisasi Deposit",
        component: laporanBelumTersedia,
        meta: {
          title: "Data Laporan Belum Realisasi Deposit",
        },
      },
      {
        path: "bahan-treatment",
        name: "Laporan Bahan Treatment",
        component: laporanBelumTersedia,
        meta: {
          title: "Laporan Bahan Treatment",
        },
      },
    ],
  },
];

export default laporanRoutes;

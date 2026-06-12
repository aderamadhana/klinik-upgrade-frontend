const reportToAccurateRoutes = [
  {
    path: "/report-to-accurate",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "settlement-umum",
        name: "Settlement Accurate Umum",
        component: () =>
          import("@/views/report-to-accurate/settlement-umum.vue"),
      },
      {
        path: "settlement-elite-glowbal",
        name: "Settlement Accurate EliteGlowbal",
        component: () =>
          import("@/views/report-to-accurate/settlement-elite-glowbal.vue"),
      },
      {
        path: "settlement-owner",
        name: "Settlement Accurate Owner",
        component: () =>
          import("@/views/report-to-accurate/settlement-owner.vue"),
      },
      {
        path: "settlement-deposit",
        name: "Faktur Deposit Accurate",
        component: () =>
          import("@/views/report-to-accurate/settlement-deposit.vue"),
      },
      {
        path: "settlement-realisasi",
        name: "Faktur Realisasi Deposit Accurate",
        component: () =>
          import("@/views/report-to-accurate/settlement-deposit-realization.vue"),
      },
      {
        path: "settlement-sto",
        name: "STO Accurate",
        component: () =>
          import("@/views/report-to-accurate/settlement-sto.vue"),
      },
    ],
  },
];

export default reportToAccurateRoutes;

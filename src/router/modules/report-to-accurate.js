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
    ],
  },
];

export default reportToAccurateRoutes;

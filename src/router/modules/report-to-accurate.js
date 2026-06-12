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
    ],
  },
];

export default reportToAccurateRoutes;

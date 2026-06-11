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
    ],
  },
];

export default reportToAccurateRoutes;

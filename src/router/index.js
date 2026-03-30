import { createRouter, createWebHistory } from "vue-router";

import Login from "@/views/login.vue";
import NotFound from "@/components/pages/not-found.vue";
import administrasiRoutes from "./modules/administrasi";

const routes = [
  ...administrasiRoutes,
  {
    path: "/",
    name: "Login",
    component: Login,
  },

  {
    path: "/dashboard",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/dashboard.vue"),
      },
    ],
  },

  {
    path: "/antrian",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "",
        name: "Antrian",
        component: () => import("@/views/antrian.vue"),
      },
      {
        path: "input",
        name: "Antrian Input",
        component: () => import("@/views/antrian-input.vue"),
      },
      {
        path: "display",
        name: "Antrian Display",
        component: () => import("@/views/antrian-display.vue"),
      },
    ],
  },

  {
    path: "/antrian/input",
    name: "Antrian Input",
    component: () => import("@/views/antrian-input.vue"),
  },

  {
    path: "/antrian/display",
    name: "Antrian Display",
    component: () => import("@/views/antrian-display.vue"),
  },

  {
    path: "/not-found",
    component: () => NotFound,
  },

  // Optional: fallback 404
  {
    path: "/:pathMatch(.*)*",
    redirect: "/not-found",
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});

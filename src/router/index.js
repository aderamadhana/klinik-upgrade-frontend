import { createRouter, createWebHistory } from "vue-router";

import Login from "@/views/login.vue";
import NotFound from "@/components/pages/not-found.vue";
import administrasiRoutes from "./modules/administrasi";
import resepsionisRoutes from "./modules/resepsionis";
import masterRoutes from "./modules/master";
import kasirRoutes from "./modules/kasir";
import pelayananMedisRoutes from "./modules/pelayanan-medis";

const routes = [
  ...masterRoutes,
  ...administrasiRoutes,
  ...resepsionisRoutes,
  ...kasirRoutes,
  ...pelayananMedisRoutes,
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login.vue"),
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

      {
        path: "change-password",
        name: "Change Password",
        component: () => import("@/views/change-password.vue"),
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
  // {
  //   path: "/:pathMatch(.*)*",
  //   redirect: "/not-found",
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("access_token");

  const publicPages = ["/login", "/not-found"];
  const isPublicPage = publicPages.includes(to.path);

  if (!token && !isPublicPage) {
    return next("/login");
  }

  if (token && to.path === "/login") {
    return next("/dashboard");
  }

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const mustChangePassword = Number(user?.must_change_password || 0) === 1;

  if (
    token &&
    mustChangePassword &&
    to.path !== "/change-password" &&
    !isPublicPage
  ) {
    return next("/change-password");
  }

  next();
});

export default router;

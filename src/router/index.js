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
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login.vue"),
  },
  {
    path: "/system",
    component: () => import("@/layouts/main-layout.vue"),
    children: [
      {
        path: "audit-logs",
        name: "audit-logs",
        component: () => import("@/views/system/audit-logs/all-audit-logs.vue"),
      },
    ],
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

function safeParseJson(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function clearAuthStorage() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("token_expires_at");
  localStorage.removeItem("last_activity_at");
  localStorage.removeItem("must_change_password");

  localStorage.removeItem("user");
  localStorage.removeItem("access");

  localStorage.removeItem("selected_toko_id");
  localStorage.removeItem("selected_toko");
  localStorage.removeItem("selected_role_id");
  localStorage.removeItem("selected_role");
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("access_token");

  const publicPages = ["/", "/login", "/not-found"];
  const isPublicPage = publicPages.includes(to.path);

  if (!token && !isPublicPage) {
    return next("/login");
  }

  if (!token && isPublicPage) {
    return next();
  }

  const user = safeParseJson(localStorage.getItem("user"), null);
  const mustChangePasswordStorage = Number(
    localStorage.getItem("must_change_password") || 0,
  );

  const mustChangePassword =
    mustChangePasswordStorage === 1 ||
    Number(user?.must_change_password || 0) === 1;

  const lastActivityAt = Number(localStorage.getItem("last_activity_at") || 0);
  const idleLimitMs = 4 * 60 * 60 * 1000; // 4 jam

  if (token && lastActivityAt && Date.now() - lastActivityAt > idleLimitMs) {
    clearAuthStorage();
    return next("/login");
  }

  if (token && to.path === "/login") {
    if (mustChangePassword) {
      return next("/change-password");
    }

    return next("/dashboard");
  }

  if (
    token &&
    mustChangePassword &&
    to.path !== "/change-password" &&
    !isPublicPage
  ) {
    return next("/change-password");
  }

  if (token && to.path === "/") {
    if (mustChangePassword) {
      return next("/change-password");
    }

    return next("/dashboard");
  }

  return next();
});

export default router;

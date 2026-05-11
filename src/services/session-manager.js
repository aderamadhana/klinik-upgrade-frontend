import {
  getToken,
  getLastActivityAt,
  markActivity,
  isTokenExpiringSoon,
  clearAuthData,
} from "@/services/token.service";

import { refreshAccessToken } from "@/services/api";

const ACTIVITY_EVENTS = [
  "click",
  "keydown",
  "mousemove",
  "scroll",
  "touchstart",
];

const IDLE_LIMIT_MS = 4 * 60 * 60 * 1000; // 4 jam
const CHECK_INTERVAL_MS = 60 * 1000; // cek tiap 1 menit
const REFRESH_BEFORE_MS = 5 * 60 * 1000; // refresh 5 menit sebelum expired

let activityTimer = null;
let interval = null;

function debounceActivity() {
  clearTimeout(activityTimer);

  activityTimer = setTimeout(() => {
    markActivity();
  }, 500);
}

function logoutToLogin() {
  clearAuthData();

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export function initSessionManager() {
  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, debounceActivity, { passive: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      markActivity();
    }
  });

  interval = setInterval(async () => {
    const token = getToken();

    if (!token) return;

    const idleDuration = Date.now() - getLastActivityAt();

    if (idleDuration > IDLE_LIMIT_MS) {
      logoutToLogin();
      return;
    }

    if (isTokenExpiringSoon(REFRESH_BEFORE_MS)) {
      try {
        await refreshAccessToken();
      } catch (error) {
        logoutToLogin();
      }
    }
  }, CHECK_INTERVAL_MS);
}

export function destroySessionManager() {
  ACTIVITY_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, debounceActivity);
  });

  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

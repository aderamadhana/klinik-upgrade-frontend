const TOKEN_KEY = "access_token";
const EXPIRES_AT_KEY = "token_expires_at";
const USER_KEY = "auth_user";
const LAST_ACTIVITY_KEY = "last_activity_at";

export function setAuthData(payload) {
  const data = payload?.data || payload;

  if (!data?.access_token) return;

  const expiresIn = Number(data.expires_in || 3600);
  const expiresAt = data.expires_at
    ? Number(data.expires_at) * 1000
    : Date.now() + expiresIn * 1000;

  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getExpiresAt() {
  return Number(localStorage.getItem(EXPIRES_AT_KEY) || 0);
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function markActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function getLastActivityAt() {
  return Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
}

export function isTokenExpiringSoon(bufferMs = 5 * 60 * 1000) {
  const expiresAt = getExpiresAt();

  if (!expiresAt) return false;

  return expiresAt - Date.now() <= bufferMs;
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

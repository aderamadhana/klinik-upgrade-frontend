import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function getSelectedTokoId() {
  const directTokoId =
    localStorage.getItem("selected_toko_id") ||
    localStorage.getItem("selected_cabang_id");

  if (directTokoId) {
    return directTokoId;
  }

  try {
    const selectedToko = JSON.parse(localStorage.getItem("selected_toko"));
    if (selectedToko?.id) {
      return selectedToko.id;
    }
  } catch (error) {
    // ignore invalid localStorage JSON
  }

  try {
    const selectedCabang = JSON.parse(localStorage.getItem("selected_cabang"));
    if (selectedCabang?.id) {
      return selectedCabang.id;
    }
  } catch (error) {
    // ignore invalid localStorage JSON
  }

  return null;
}

/**
 * REQUEST INTERCEPTOR
 * Otomatis menambahkan token dan toko aktif ke setiap request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const selectedTokoId = getSelectedTokoId();

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (selectedTokoId) {
      config.headers["X-Toko-Id"] = selectedTokoId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * RESPONSE INTERCEPTOR
 * Handle error global, terutama 401 Unauthorized
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

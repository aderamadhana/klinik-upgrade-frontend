import api from "@/plugins/axios";

const authService = {
  async login(payload) {
    const response = await api.post("/login", payload);
    return response.data;
  },

  async changePassword(payload) {
    const response = await api.post("/change-password", payload);
    return response.data;
  },

  logout() {
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
    window.location.href = "/login";
  },

  getToken() {
    return localStorage.getItem("access_token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },
};

export default authService;

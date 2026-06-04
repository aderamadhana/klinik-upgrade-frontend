import api from "@/plugins/axios";

const BASE_URL = "/dashboard";

const dashboardService = {
  async summary(params = {}) {
    const response = await api.get(`${BASE_URL}/summary`, { params });
    return response.data;
  },
};

export default dashboardService;

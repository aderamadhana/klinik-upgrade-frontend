import api from "@/plugins/axios";

const ENDPOINT = "/laporan/pembayaran-fo";

function parseFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].replace(/"/g, ""));

  const normalMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return normalMatch?.[1] || fallback;
}

export default {
  async kasir(params = {}) {
    const response = await api.get(`${ENDPOINT}/kasir`, { params });
    return response.data;
  },

  async summary(params = {}) {
    const response = await api.get(`${ENDPOINT}/summary`, { params });
    return response.data;
  },

  async exportReport({ format, ...params }) {
    const response = await api.get(`${ENDPOINT}/export/${format}`, {
      params,
      responseType: "blob",
    });

    const extension = format === "pdf" ? "pdf" : "xlsx";
    const fallback = `laporan-pembayaran-fo.${extension}`;

    return {
      blob: response.data,
      filename: parseFilename(
        response.headers?.["content-disposition"],
        fallback,
      ),
      contentType: response.headers?.["content-type"],
    };
  },
};

import api from "@/plugins/axios";

const ENDPOINT = "/laporan/pemasukan-umum";

function parseFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1].replace(/"/g, ""));
  }

  const normalMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (normalMatch?.[1]) {
    return normalMatch[1];
  }

  return fallback;
}

export default {
  async summary(params = {}) {
    const response = await api.get(`${ENDPOINT}/summary`, { params });
    return response.data;
  },

  async exportReport({ jenis, format = "pdf", ...params }) {
    const normalizedFormat = String(format).toLowerCase();
    const extension = normalizedFormat === "excel" ? "xlsx" : "pdf";

    const response = await api.get(`${ENDPOINT}/export/${jenis}`, {
      params: {
        ...params,
        format: normalizedFormat,
      },
      responseType: "blob",
    });

    return {
      blob: response.data,
      filename: parseFilename(
        response.headers?.["content-disposition"],
        `laporan-pemasukan-${jenis}.${extension}`,
      ),
      contentType: response.headers?.["content-type"] || response.data?.type,
    };
  },
};

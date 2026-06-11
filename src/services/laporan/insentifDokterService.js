import api from "@/plugins/axios";

const ENDPOINT = "/laporan/insentif-dokter";

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
  async dokter(params = {}) {
    const response = await api.get(`${ENDPOINT}/dokter`, { params });
    return response.data;
  },

  async summary(params = {}) {
    const response = await api.get(`${ENDPOINT}/summary`, { params });
    return response.data;
  },

  async exportReport({ kategori, jenis, format, ...params }) {
    const response = await api.get(
      `${ENDPOINT}/export/${kategori}/${jenis}/${format}`,
      {
        params,
        responseType: "blob",
      },
    );

    const fallback = `laporan-insentif-dokter-${kategori}-${jenis}.${
      format === "excel" ? "xls" : "html"
    }`;

    return {
      blob: response.data,
      filename: parseFilename(
        response.headers?.["content-disposition"],
        fallback,
      ),
      contentType: response.headers?.["content-type"] || response.data?.type,
    };
  },
};

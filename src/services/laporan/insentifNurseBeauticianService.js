import api from "@/plugins/axios";

const ENDPOINT = "/laporan/insentif-nurse-beautician";

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
  async staff(params = {}) {
    const response = await api.get(`${ENDPOINT}/staff`, { params });
    return response.data;
  },

  async summary(params = {}) {
    const response = await api.get(`${ENDPOINT}/summary`, { params });
    return response.data;
  },

  async exportReport({ jenis, format, ...params }) {
    const response = await api.get(`${ENDPOINT}/export/${jenis}/${format}`, {
      params,
      responseType: "blob",
    });

    const fallback = `laporan-insentif-nurse-beautician-${jenis}.${
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

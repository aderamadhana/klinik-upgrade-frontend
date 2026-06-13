import api from "@/plugins/axios";

const ENDPOINT = "/laporan/detail-pasien";
const PDF_MIME = "application/pdf";
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function parseFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1].replace(/"/g, ""));
  }

  const normalMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return normalMatch?.[1] || fallback;
}

async function normalizeBlobError(error) {
  const blob = error?.response?.data;

  if (blob instanceof Blob) {
    try {
      const text = await blob.text();
      const payload = JSON.parse(text);
      throw new Error(payload?.message || payload?.error || "Export gagal.");
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new Error("Export gagal diproses oleh server.");
      }
      throw parseError;
    }
  }

  throw error;
}

export default {
  async summary(params = {}) {
    const response = await api.get(`${ENDPOINT}/summary`, { params });
    return response.data;
  },

  async exportReport({ format, ...params }) {
    try {
      const response = await api.get(`${ENDPOINT}/export/${format}`, {
        params,
        responseType: "blob",
      });

      const expectedMime = format === "excel" ? XLSX_MIME : PDF_MIME;
      const contentType =
        response.headers?.["content-type"] || response.data?.type || "";

      if (!contentType.toLowerCase().includes(expectedMime.toLowerCase())) {
        const text = await response.data.text();

        try {
          const payload = JSON.parse(text);
          throw new Error(
            payload?.message || payload?.error || "Export gagal.",
          );
        } catch (error) {
          if (error instanceof SyntaxError) {
            throw new Error(
              format === "excel"
                ? "Backend belum menghasilkan file Excel XLSX yang valid."
                : "Backend belum menghasilkan file PDF yang valid.",
            );
          }
          throw error;
        }
      }

      const fallback = `laporan-detail-pasien.${
        format === "excel" ? "xlsx" : "pdf"
      }`;

      return {
        blob: response.data,
        filename: parseFilename(
          response.headers?.["content-disposition"],
          fallback,
        ),
        contentType,
      };
    } catch (error) {
      return normalizeBlobError(error);
    }
  },
};

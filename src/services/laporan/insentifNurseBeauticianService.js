import api from "@/plugins/axios";

const ENDPOINT = "/laporan/insentif-nurse-beautician";
const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PDF_CONTENT_TYPE = "application/pdf";

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

function ensureExportExtension(filename, format) {
  const expectedExtension = format === "excel" ? ".xlsx" : ".pdf";
  const safeFilename = String(filename || "").trim();

  if (!safeFilename) {
    return `laporan-insentif-nurse${expectedExtension}`;
  }

  const withoutKnownExtension = safeFilename.replace(
    /\.(xlsx?|pdf|html?)$/i,
    "",
  );

  return `${withoutKnownExtension}${expectedExtension}`;
}

function validateExportResponse(format, contentType) {
  const normalizedContentType = String(contentType || "").toLowerCase();

  if (
    format === "excel" &&
    !normalizedContentType.includes(XLSX_CONTENT_TYPE)
  ) {
    throw new Error(
      "Backend masih mengirim format Excel lama. Pastikan controller memakai PhpSpreadsheet dan MIME XLSX.",
    );
  }

  if (format === "pdf" && !normalizedContentType.includes(PDF_CONTENT_TYPE)) {
    throw new Error(
      "Backend tidak mengirim file PDF. Pastikan export PDF memakai Dompdf.",
    );
  }
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

    const contentType =
      response.headers?.["content-type"] || response.data?.type || "";

    validateExportResponse(format, contentType);

    const fallback = `laporan-insentif-nurse-${jenis}.${
      format === "excel" ? "xlsx" : "pdf"
    }`;

    const parsedFilename = parseFilename(
      response.headers?.["content-disposition"],
      fallback,
    );

    return {
      blob: response.data,
      filename: ensureExportExtension(parsedFilename, format),
      contentType,
    };
  },
};

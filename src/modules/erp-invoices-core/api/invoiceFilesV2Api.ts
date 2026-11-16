import axiosInstance from "@/core/api/axiosInstance";

/**
 * Client file đính kèm hóa đơn qua API V2 (`/api/v2/invoices/:id/attachments`).
 * Dùng axios instance V1 (cùng JWT); độc lập với `src/v2` để V1 gỡ không kéo theo V2.
 */

export interface InvoiceFilePolicy {
  maxFileBytes: number;
  maxFilesPerRequest: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
}

export interface InvoiceFileV2 {
  id: string;
  category: string;
  /** PDF chính của hóa đơn (hiện nhãn "PDF gốc") */
  isOriginal: boolean;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  origin: "V2" | "LEGACY";
  createdAt: string;
}

export interface InvoiceFilesV2Result {
  items: InvoiceFileV2[];
  policy: InvoiceFilePolicy | null;
  categories: string[];
}

const base = (invoiceId: string) => `/api/v2/invoices/${invoiceId}/attachments`;

export const invoiceFilesV2Api = {
  list: async (invoiceId: string): Promise<InvoiceFilesV2Result> => {
    const { data } = await axiosInstance.get(base(invoiceId));
    return {
      items: data?.items ?? [],
      policy: data?.extraData?.policy ?? null,
      categories: data?.extraData?.categories ?? [],
    };
  },

  upload: async (
    invoiceId: string,
    files: File[],
    category?: string,
  ): Promise<InvoiceFileV2[]> => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file, file.name));
    if (category) form.append("category", category);
    const { data } = await axiosInstance.post(base(invoiceId), form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
    });
    return data?.data ?? [];
  },

  remove: async (invoiceId: string, attachmentId: string): Promise<void> => {
    await axiosInstance.delete(`${base(invoiceId)}/${attachmentId}`);
  },

  downloadUrl: async (
    invoiceId: string,
    attachmentId: string,
    inline = false,
  ): Promise<{ url: string; expiresIn: number }> => {
    const { data } = await axiosInstance.get(
      `${base(invoiceId)}/${attachmentId}/download-url`,
      { params: inline ? { inline: true } : undefined },
    );
    return data.data;
  },

  /** Tải tất cả file chưa xóa của hóa đơn thành một zip. */
  downloadZip: async (invoiceId: string): Promise<Blob> => {
    const { data } = await axiosInstance.get(`${base(invoiceId)}/zip`, {
      responseType: "blob",
      timeout: 120_000,
    });
    return data as Blob;
  },
};

import { useMutation } from "@tanstack/react-query";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import type { Direction } from "./invoiceXmlUpload.type";

/** Tải lại XML của hóa đơn theo chiều đã chọn; server chạy nền và trả về thông điệp tiến trình */
export function useBulkDownloadXmlMutation() {
  return useMutation({
    mutationFn: (direction: Direction) =>
      erpInvoicesCoreApi.bulkDownloadXml({ direction }),
  });
}

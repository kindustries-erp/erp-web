import type { DrawerAuditLogItem } from "@/shared/components/StandardFormDrawer";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { formatTaxInvoiceStatus } from "../../atoms/invoice-status-badge";

export { formatTaxInvoiceStatus };

export function createClientId(): string {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildInvoiceAuditItems(
  detailInvoice: ErpInvoice,
  t: any,
): DrawerAuditLogItem[] {
  const auditItems: DrawerAuditLogItem[] = [];

  if (detailInvoice.createdAt) {
    auditItems.push({
      id: "created",
      actionType: "CREATE",
      actionLabel: t("Đồng bộ / Khởi tạo hóa đơn"),
      timestamp: detailInvoice.createdAt,
      message: `Hóa đơn số ${detailInvoice.invoiceNo} (Ký hiệu: ${detailInvoice.serialNo || "—"})`,
    });
  }

  if (detailInvoice.validatedAt) {
    auditItems.push({
      id: "validated",
      actionType: "APPROVE",
      actionLabel: t("Kiểm duyệt hợp lệ"),
      timestamp: detailInvoice.validatedAt,
      message: t("Hóa đơn đã được kiểm tra tính hợp lý, hợp lệ."),
    });
  }

  if (detailInvoice.postingDate) {
    auditItems.push({
      id: "posted",
      actionType: "SYNC",
      actionLabel: t("Hạch toán sổ cái"),
      timestamp: detailInvoice.postingDate,
      message: `Đã ghi nhận bút toán kế toán mã #${detailInvoice.journalEntryId || ""}`,
    });
  }

  return auditItems;
}

import type { DrawerAuditLogItem } from "@/shared/components/drawer/DrawerAuditTimeline";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";
import type { AuditLogEntry } from "@/modules/system/api/usersCoreApi";

export const normPlate = (v?: string | null) =>
  (v ?? "").replace(/[^0-9a-zA-Z]/g, "").toUpperCase();

export function duplicateFieldsChanged(
  form: Partial<CreateGarageCashflowVoucherDto>,
  voucher: GarageCashflowVoucher,
): boolean {
  return (
    Number(form.amount) !== Number(voucher.amount) ||
    (form.transDate || "") !== (voucher.transDate || "").slice(0, 10) ||
    (form.caseId || "") !== (voucher.caseId || "") ||
    normPlate(form.licensePlate) !== normPlate(voucher.licensePlate)
  );
}

import { computeAuditDiffs } from "./GarageCashflowDrawer.state";

export function buildBaselineCashflowAuditItems(
  voucher: GarageCashflowVoucher | null,
  t: (key: string, fallback?: string) => string,
  currentUserEmail?: string,
): DrawerAuditLogItem[] {
  if (!voucher) return [];
  const items: DrawerAuditLogItem[] = [];

  const rawActor = voucher.createdBy || currentUserEmail;
  const isEmail = rawActor && rawActor.includes("@");
  const actorName =
    rawActor || t("garage:cashflowDrawer.systemActor", "Hệ thống");
  const actorEmail = isEmail ? rawActor : undefined;

  // 1. Tạo phiếu
  if (voucher.createdAt || voucher.transDate) {
    const isReceipt = voucher.voucherType === "RECEIPT";
    items.push({
      id: "baseline-created",
      actionType: "CREATE",
      actionLabel: isReceipt
        ? t("garage:cashflowDrawer.auditCreatedReceipt", "Khởi tạo phiếu thu")
        : t("garage:cashflowDrawer.auditCreatedPayment", "Khởi tạo phiếu chi"),
      actorName,
      actorEmail,
      timestamp: voucher.createdAt || voucher.transDate,
      message: `${t("Mã phiếu:")} ${voucher.voucherCode} • ${t("Số tiền:")} ${Number(voucher.amount).toLocaleString("vi-VN")} đ`,
    });
  }

  // 2. Liên kết vụ việc dịch vụ
  if (voucher.caseId || voucher.case) {
    const c = voucher.case;
    const plate = voucher.licensePlate || c?.bienSoXe;
    const partner = voucher.partnerName || c?.khachHangName;
    const desc = [
      c?.soChungTu ? `Phiếu DV: ${c.soChungTu}` : `Case: #${voucher.caseId}`,
      plate ? `• ${plate}` : "",
      partner ? `(${partner})` : "",
    ]
      .filter(Boolean)
      .join(" ");
    items.push({
      id: "baseline-linked-case",
      actionType: "SYNC",
      actionLabel: t(
        "garage:cashflowDrawer.auditLinkedCase",
        "Liên kết vụ việc dịch vụ",
      ),
      timestamp: voucher.createdAt || voucher.transDate,
      message: desc,
    });
  }

  // 3. Đối soát ngân hàng / quỹ tiền mặt
  if (voucher.erpBankTransactionId || voucher.erpCashVoucherId) {
    const isBank = Boolean(voucher.erpBankTransactionId);
    items.push({
      id: "baseline-linked-fin",
      actionType: "SYNC",
      actionLabel: isBank
        ? t(
            "garage:cashflowDrawer.auditLinkedBank",
            "Đối soát giao dịch ngân hàng",
          )
        : t(
            "garage:cashflowDrawer.auditLinkedCash",
            "Liên kết chứng từ tiền mặt",
          ),
      timestamp: voucher.createdAt || voucher.transDate,
      message: isBank
        ? `Số tham chiếu sao kê: #${voucher.erpBankTransaction?.referenceNumber || voucher.referenceNumber || voucher.erpBankTransactionId}`
        : `Chứng từ tiền mặt: #${voucher.erpCashVoucher?.referenceNumber || voucher.erpCashVoucherId}`,
    });
  }

  // 4. Cập nhật gần nhất (nếu có updatedAt khác biệt > 1s)
  if (voucher.updatedAt && voucher.createdAt) {
    const diffMs =
      new Date(voucher.updatedAt).getTime() -
      new Date(voucher.createdAt).getTime();
    if (diffMs > 1000) {
      items.push({
        id: "baseline-updated",
        actionType: "EDIT",
        actionLabel: t(
          "garage:cashflowDrawer.auditUpdated",
          "Cập nhật phiếu gần nhất",
        ),
        timestamp: voucher.updatedAt,
        message: t(
          "garage:cashflowDrawer.auditUpdatedDesc",
          "Phiếu thu/chi đã được chỉnh sửa thông tin hoặc đối soát lại công nợ.",
        ),
      });
    }
  }

  return items;
}

export function mapAuditLogEntryToDrawerItem(
  entry: AuditLogEntry,
  t: (key: string, fallback?: string) => string,
): DrawerAuditLogItem {
  const normAction = (entry.actionType || "").toUpperCase();
  let actionLabel = entry.actionType;
  if (normAction.includes("CREATE")) {
    actionLabel = t("garage:cashflowDrawer.auditCreated", "Khởi tạo phiếu");
  } else if (normAction.includes("UPDATE") || normAction.includes("EDIT")) {
    actionLabel = t("garage:cashflowDrawer.auditUpdated", "Cập nhật phiếu");
  } else if (normAction.includes("DELETE")) {
    actionLabel = t("garage:cashflowDrawer.auditDeleted", "Xóa phiếu");
  }

  return {
    id: entry.id,
    actionType: entry.actionType,
    actionLabel,
    actorName:
      entry.actorEmail ||
      entry.actorUserId ||
      t("garage:cashflowDrawer.systemActor", "Hệ thống"),
    actorEmail: entry.actorEmail || undefined,
    timestamp: entry.createdAt,
    message: entry.message || undefined,
    diffs: computeAuditDiffs(entry.beforeSnapshot, entry.afterSnapshot, t),
  };
}

export function mergeAuditItems(
  baseline: DrawerAuditLogItem[],
  remoteAuditLogs: AuditLogEntry[] | undefined,
  t: (key: string, fallback?: string) => string,
): DrawerAuditLogItem[] {
  if (!remoteAuditLogs?.length) return baseline;
  const remoteItems = remoteAuditLogs.map((e) =>
    mapAuditLogEntryToDrawerItem(e, t),
  );
  const combined = [...remoteItems];
  for (const b of baseline) {
    const shouldAdd =
      (b.actionType === "CREATE" &&
        !combined.some((c) => c.actionType === "CREATE")) ||
      (b.actionType === "SYNC" &&
        !combined.some((c) => c.message === b.message));
    if (shouldAdd) combined.push(b);
  }
  return combined.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

import {
  DrawerModal,
  DrawerField,
  DrawerSection,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { StatusBadge } from "@/shared/components/badges";
import { normalizeDate, money } from "@/shared/utils/format";
import {
  getDocNo,
  getPartner,
  inventoryStatusLabel,
} from "@/modules/operational/utils/operationalHelpers";
import { useT } from "@/core/i18n";
import type {
  OperationalDocument,
  OperationalDocumentType,
} from "@/modules/operational/api/operationalApi";
import type { ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";

interface OperationalDetailDrawerProps {
  open: boolean;
  detailDocument: OperationalDocument | null;
  detailLoading: boolean;
  detailError: string | null;
  rootDocumentType: OperationalDocumentType | null;
  poReceipts: ErpPoReceipt[];
  onClose: () => void;
}

/**
 * Drawer xem chi tiết chứng từ (non-purchase variant).
 * Extracted từ OperationalListPage.tsx (dòng 2029–2183).
 */
export function OperationalDetailDrawer({
  open,
  detailDocument,
  detailLoading,
  detailError,
  rootDocumentType,
  poReceipts,
  onClose,
}: OperationalDetailDrawerProps) {
  const t = useT();

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("Chi tiết chứng từ")}
      subtitle={
        detailDocument
          ? `${getDocNo(detailDocument)} — ${getPartner(detailDocument)}`
          : t("Chi tiết chứng từ operational")
      }
      bodyClassName="space-y-4"
    >
      {detailError ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {detailError}
        </div>
      ) : null}

      {detailLoading ? (
        <div className="space-y-6">
          <DrawerSection title={t("Thông tin chính")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </DrawerSection>
          <DrawerSection title={t("Dòng chi tiết")}>
            <div className="space-y-3">
              <Skeleton className="h-[72px] w-full" />
              <Skeleton className="h-[72px] w-full" />
              <Skeleton className="h-[72px] w-full" />
            </div>
          </DrawerSection>
        </div>
      ) : detailDocument ? (
        <>
          <DrawerSection title={t("Thông tin chính")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DrawerField label={t("Số chứng từ")}>
                <div>{getDocNo(detailDocument)}</div>
              </DrawerField>
              <DrawerField label={t("Đối tác / Nội dung")}>
                <div>{getPartner(detailDocument)}</div>
              </DrawerField>
              <DrawerField label={t("Ngày chứng từ")}>
                <div>{normalizeDate(detailDocument.document_date) || "—"}</div>
              </DrawerField>
              <DrawerField label={t("Đến hạn / Kỳ sau")}>
                <div>
                  {normalizeDate(detailDocument.due_date) || "—"}
                  {detailDocument.next_due_date
                    ? ` / ${normalizeDate(detailDocument.next_due_date)}`
                    : ""}
                </div>
              </DrawerField>
              <DrawerField label={t("Trạng thái")}>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={detailDocument.status} />
                  <StatusBadge status={detailDocument.payment_status} />
                </div>
              </DrawerField>
              <DrawerField label={t("Kho")}>
                <div>
                  {inventoryStatusLabel(detailDocument.inventory_status)}
                </div>
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection
            title={`${t("Dòng chi tiết")} (${detailDocument.lines?.length || 0})`}
          >
            {detailDocument.lines?.length ? (
              <div className="space-y-2">
                {detailDocument.lines.map((line, index) => (
                  <div
                    key={
                      line.id ||
                      `${index}-${line.item_code || line.description || "line"}`
                    }
                    className="rounded-xl border border-border p-3 text-sm"
                  >
                    <div className="font-medium">
                      {line.item_name ||
                        line.description ||
                        `${t("Dòng")} ${index + 1}`}
                    </div>
                    <div className="text-xs text-[color:var(--muted-fg)] mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>{line.item_code || "—"}</span>
                      <span>·</span>
                      <span>
                        {t("SL")}{" "}
                        {Number(line.qty || 0).toLocaleString("vi-VN")}
                      </span>
                      <span>·</span>
                      <span>
                        {t("Thành tiền")}{" "}
                        {money(
                          line.amount ||
                            Number(line.qty || 0) *
                              Number(line.unit_price || 0),
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[color:var(--muted-fg)]">
                {t("Chưa có dòng chi tiết.")}
              </div>
            )}
          </DrawerSection>

          {rootDocumentType === "purchase_orders" ? (
            <DrawerSection title={t("Lịch sử nhập kho")}>
              {poReceipts.length ? (
                <div className="space-y-3">
                  {poReceipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="rounded-xl border border-border p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">{receipt.receiptNo}</div>
                        <div className="text-xs text-[color:var(--muted-fg)]">
                          {normalizeDate(receipt.receiptDate) || "—"} ·{" "}
                          {receipt.status || "—"}
                        </div>
                      </div>
                      {receipt.remarks ? (
                        <div className="mt-1 text-xs text-[color:var(--muted-fg)]">
                          {receipt.remarks}
                        </div>
                      ) : null}
                      <div className="mt-2 space-y-1">
                        {(receipt.lines || []).map((line, idx) => (
                          <div
                            key={line.id || `${receipt.id}-${idx}`}
                            className="text-xs text-[color:var(--muted-fg)]"
                          >
                            {t("Dòng")} {line.lineNo || idx + 1}: {t("nhận")}{" "}
                            {Number(line.qtyReceived || 0).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            {t("đơn vị")}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[color:var(--muted-fg)]">
                  {t("Chưa có lần nhập kho nào cho PO này.")}
                </div>
              )}
            </DrawerSection>
          ) : null}
        </>
      ) : null}
    </DrawerModal>
  );
}

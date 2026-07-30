import {
  DrawerField,
  DrawerSection,
  DrawerModal,
} from "@/shared/components/DrawerModal";
import { type SinvoiceDraft } from "@/modules/accounting/api/sinvoiceDraftApi";
import { formatMoney } from "@/modules/accounting/utils/journalEntryUtils";

interface Props {
  open: boolean;
  onClose: () => void;
  draft: SinvoiceDraft | null;
}

export function SinvoiceDraftDrawer({ open, onClose, draft }: Props) {
  if (!draft) return null;

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={`Chi tiết Hóa đơn nháp: ${draft.documentNo || "-"}`}
      actions={[
        {
          label: "Đóng",
          onClick: onClose,
          variant: "outline" as const,
        },
      ]}
    >
      <div className="flex flex-col gap-6">
        <DrawerSection title="THÔNG TIN CHUNG">
          <div className="space-y-4">
            <DrawerField label="Ngày tạo">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {draft.createdAt
                  ? new Date(draft.createdAt).toLocaleString("vi-VN")
                  : "—"}
              </div>
            </DrawerField>

            <DrawerField label="Mã chứng từ">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {draft.documentNo || "—"}
              </div>
            </DrawerField>

            <DrawerField label="Khách hàng">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {draft.buyerName || "—"}
              </div>
            </DrawerField>

            <DrawerField label="Mã số thuế">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {draft.buyerTaxCode || "—"}
              </div>
            </DrawerField>

            <DrawerField label="Loại tiền">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {draft.responsePayload?.currencyCode || "VND"}
              </div>
            </DrawerField>
          </div>
        </DrawerSection>

        <DrawerSection title="CHI TIẾT TÀI CHÍNH">
          <div className="space-y-4">
            <DrawerField label="Tổng tiền trước thuế">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {formatMoney(
                  Number(draft.totalAmount || 0) - Number(draft.vatAmount || 0),
                )}
              </div>
            </DrawerField>

            <DrawerField label="Tiền thuế">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {formatMoney(draft.vatAmount)}
              </div>
            </DrawerField>

            <DrawerField label="Tổng tiền">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {formatMoney(draft.totalAmount)}
              </div>
            </DrawerField>

            <DrawerField label="Trạng thái">
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {draft.status === "DRAFT" ? "Bản nháp" : draft.status}
              </div>
            </DrawerField>
          </div>
        </DrawerSection>
      </div>
    </DrawerModal>
  );
}

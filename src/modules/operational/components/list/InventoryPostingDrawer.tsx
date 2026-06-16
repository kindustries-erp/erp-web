import {
  DrawerModal,
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";
import { useOperationalFlowStore } from "@/modules/operational/hooks/useOperationalFlowStore";
import {
  getDocNo,
  getPartner,
} from "@/modules/operational/utils/operationalHelpers";

interface InventoryPostingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

/**
 * Drawer nhập/xuất kho theo dòng chứng từ.
 * Extracted từ OperationalListPage.tsx (dòng 2185–2263).
 */
export function InventoryPostingDrawer({
  open,
  onClose,
  onSubmit,
}: InventoryPostingDrawerProps) {
  const t = useT();
  const {
    postingDocument,
    postingDocumentType,
    postingLoading,
    postingLineForms,
    postingNotes,
    setPostingState,
  } = useOperationalFlowStore();

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={
        postingDocumentType === "purchase_orders"
          ? t("Nhập kho theo dòng")
          : t("Xuất kho theo dòng")
      }
      subtitle={
        postingDocument
          ? `${getDocNo(postingDocument)} — ${getPartner(postingDocument)}`
          : t("Chọn số lượng theo từng dòng chứng từ")
      }
      actions={[
        {
          label: postingLoading ? t("Đang post...") : t("Xác nhận post kho"),
          primary: true,
          loading: postingLoading,
          onClick: onSubmit,
        },
      ]}
    >
      <DrawerSection title={t("Số lượng theo dòng")}>
        <div className="space-y-3">
          {postingLineForms.length === 0 ? (
            <div className="text-sm text-[color:var(--muted-fg)]">
              {t("Chứng từ không có dòng vật tư/phụ tùng hợp lệ.")}
            </div>
          ) : (
            postingLineForms.map((line) => (
              <div
                key={line.line_id}
                className="rounded-xl border border-border p-3 space-y-2"
              >
                <div className="text-sm font-medium">{line.line_name}</div>
                <div className="text-xs text-[color:var(--muted-fg)]">
                  {t("Tối đa có thể post:")}{" "}
                  {Number(line.max_qty || 0).toLocaleString("vi-VN")}
                </div>
                <input
                  type="number"
                  min={0}
                  max={line.max_qty}
                  step={1}
                  className={inputCls}
                  value={line.requested_qty}
                  onChange={(event) => {
                    const value = Number(event.target.value || 0);
                    setPostingState({
                      postingLineForms: postingLineForms.map((item) =>
                        item.line_id === line.line_id
                          ? {
                              ...item,
                              requested_qty: Math.max(
                                0,
                                Math.min(item.max_qty, value),
                              ),
                            }
                          : item,
                      ),
                    });
                  }}
                />
              </div>
            ))
          )}
        </div>
        <DrawerField label={t("Ghi chú post kho")}>
          <input
            className={inputCls}
            value={postingNotes}
            onChange={(event) =>
              setPostingState({ postingNotes: event.target.value })
            }
            placeholder={t("Ghi chú nhập/xuất kho")}
          />
        </DrawerField>
      </DrawerSection>
    </DrawerModal>
  );
}

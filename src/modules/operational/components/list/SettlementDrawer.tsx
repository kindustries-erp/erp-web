import { useMemo } from "react";
import {
  DrawerModal,
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { useOperationalFlowStore } from "@/modules/operational/hooks/useOperationalFlowStore";
import { getDocNo } from "@/modules/operational/utils/operationalHelpers";
import { money, normalizeDate } from "@/shared/utils/format";

interface SettlementDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onRemoveLink: (linkId: string) => void;
}

/**
 * Drawer liên kết phiếu dòng tiền (cấn trừ công nợ).
 * Extracted từ OperationalListPage.tsx (dòng 2265–cuối).
 */
export function SettlementDrawer({
  open,
  onClose,
  onSave,
  onRemoveLink,
}: SettlementDrawerProps) {
  const t = useT();
  const {
    rootDocument,
    settlementLoading,
    settlementError,
    voucherLoading,
    paymentLinks,
    voucherOptions,
    settlementForm,
    setSettlementState,
  } = useOperationalFlowStore();

  const selectedVoucher = useMemo(
    () =>
      voucherOptions.find(
        (voucher) => voucher.id === settlementForm.payment_voucher_id,
      ),
    [voucherOptions, settlementForm.payment_voucher_id],
  );

  const voucherSelectOptions = useMemo(
    () =>
      voucherOptions.map((voucher) => ({
        value: voucher.id,
        label: `${voucher.voucher_no} — ${money(voucher.amount)}`,
      })),
    [voucherOptions],
  );

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("Liên kết phiếu dòng tiền")}
      subtitle={
        rootDocument
          ? `${getDocNo(rootDocument)} — ${t("Còn mở")} ${money(rootDocument.open_amount)}`
          : t("Liên kết thanh toán cho chứng từ operational")
      }
      actions={[
        {
          label: settlementLoading ? t("Đang lưu...") : t("Lưu liên kết"),
          primary: true,
          loading: settlementLoading,
          onClick: onSave,
        },
      ]}
    >
      <DrawerSection title={t("Thông tin cấn trừ")}>
        <DrawerField label={t("Phiếu dòng tiền")} required>
          <Combobox
            options={voucherSelectOptions}
            value={settlementForm.payment_voucher_id}
            onChange={(value) => {
              const voucher = voucherOptions.find((item) => item.id === value);
              setSettlementState({
                settlementForm: {
                  ...settlementForm,
                  payment_voucher_id: value,
                  applied_amount: voucher
                    ? Math.min(
                        Number(rootDocument?.open_amount || 0),
                        Number(voucher.amount || 0),
                      )
                    : settlementForm.applied_amount,
                },
              });
            }}
            placeholder={
              voucherLoading ? t("Đang tải...") : t("Chọn phiếu dòng tiền")
            }
            className="w-full"
          />
        </DrawerField>
        {selectedVoucher ? (
          <div className="rounded-lg bg-[color:var(--muted)] px-3 py-2 text-xs text-[color:var(--muted-fg)]">
            {selectedVoucher.voucher_no} — {money(selectedVoucher.amount)} —{" "}
            {selectedVoucher.status}
          </div>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DrawerField label={t("Ngày cấn trừ")} required>
            <DatePicker
              value={settlementForm.applied_date}
              onChange={(value) =>
                setSettlementState({
                  settlementForm: {
                    ...settlementForm,
                    applied_date: value,
                  },
                })
              }
              className="w-full"
            />
          </DrawerField>
          <DrawerField label={t("Số tiền cấn trừ")} required>
            <input
              type="number"
              min={0}
              step={1000}
              className={inputCls}
              value={settlementForm.applied_amount}
              onChange={(event) =>
                setSettlementState({
                  settlementForm: {
                    ...settlementForm,
                    applied_amount: Number(event.target.value || 0),
                  },
                })
              }
            />
          </DrawerField>
        </div>
        <DrawerField label={t("Ghi chú")}>
          <input
            className={inputCls}
            value={settlementForm.notes}
            onChange={(event) =>
              setSettlementState({
                settlementForm: {
                  ...settlementForm,
                  notes: event.target.value,
                },
              })
            }
            placeholder={t("Ghi chú cấn trừ")}
          />
        </DrawerField>
      </DrawerSection>

      {settlementError ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {settlementError}
        </div>
      ) : null}

      <DrawerSection title={t("Liên kết hiện có")}>
        {paymentLinks.length === 0 ? (
          <div className="text-sm text-[color:var(--muted-fg)]">
            {t("Chưa có liên kết thanh toán.")}
          </div>
        ) : (
          <div className="space-y-2">
            {paymentLinks.map((link) => {
              const voucher = voucherOptions.find(
                (item) => item.id === link.payment_voucher_id,
              );
              return (
                <div
                  key={link.id}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm">
                      {voucher?.voucher_no || link.payment_voucher_id}
                    </div>
                    <div className="text-xs text-[color:var(--muted-fg)]">
                      {normalizeDate(link.applied_date) || "—"} —{" "}
                      {money(link.applied_amount)}
                    </div>
                    {link.notes ? (
                      <div className="text-xs text-[color:var(--muted-fg)]">
                        {link.notes}
                      </div>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => onRemoveLink(link.id)}
                    disabled={settlementLoading}
                  >
                    {t("Gỡ liên kết")}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DrawerSection>
    </DrawerModal>
  );
}

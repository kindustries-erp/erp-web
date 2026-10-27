import React, { useMemo } from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2LinkSelectionModal } from "@/v2/shared/components/molecules/v2-link-selection-modal";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";
import type { NetOffSide } from "./bankNetOff.helper";
import { buildBankNetOffColumns } from "./bankNetOff.columns";
import {
  useV2BankNetOffPicker,
  type NetOffView,
} from "./useV2BankNetOffPicker";
import "./invoice-link-selection.locale";

export interface V2BankNetOffSelectionModalProps {
  open: boolean;
  onClose: () => void;
  /** PAYMENT cho hóa đơn mua vào, RECEIPT cho hóa đơn bán ra */
  side: NetOffSide;
  /** Hóa đơn đang cấn trừ: dùng để lấy gợi ý khớp */
  invoiceId?: string;
  existingTxnIds?: string[];
  onSelect: (items: { id: string; amount: number }[]) => void;
}

/** Ba tab loại trừ nhau; gợi ý chỉ hiện khi có hóa đơn */
const TABS: { view: NetOffView; labelKey: string }[] = [
  { view: "BANK", labelKey: "v2.invoiceLinkSelection.bank.source.bank" },
  { view: "CASH", labelKey: "v2.invoiceLinkSelection.bank.source.cash" },
  { view: "SUGGEST", labelKey: "v2.invoiceLinkSelection.bank.suggest.toggle" },
];

/** Modal chọn nhiều giao dịch sao kê hoặc sổ quỹ để cấn trừ, nhập số tiền từng dòng rồi xác nhận một lần */
export function V2BankNetOffSelectionModal({
  open,
  onClose,
  side,
  invoiceId,
  existingTxnIds = [],
  onSelect,
}: V2BankNetOffSelectionModalProps) {
  const { t } = useV2Translation();
  const picker = useV2BankNetOffPicker({
    open,
    side,
    invoiceId,
    existingTxnIds,
    onSelect,
    onClose,
  });

  const columns = useMemo(() => buildBankNetOffColumns(t, picker), [t, picker]);

  return (
    <V2LinkSelectionModal
      open={open}
      onClose={onClose}
      title={t("v2.invoiceLinkSelection.bank.title")}
      footerActions={
        <V2Button
          type="button"
          variant="primary"
          disabled={picker.count === 0}
          onClick={picker.confirm}
        >
          {picker.count === 0
            ? t("v2.invoiceLinkSelection.bank.confirm")
            : `${t("v2.invoiceLinkSelection.bank.confirm")} (${picker.count})`}
        </V2Button>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
          {TABS.map((tab) => {
            if (tab.view === "SUGGEST" && !picker.hasSuggestions) return null;
            const active = picker.view === tab.view;
            return (
              <V2Button
                key={tab.view}
                type="button"
                variant={active ? "pill-tab" : "ghost"}
                size="pill-sm"
                aria-pressed={active}
                onClick={() => picker.setView(tab.view)}
              >
                {t(tab.labelKey)}
              </V2Button>
            );
          })}
        </div>
        <V2Text as="span" className="font-mono text-xs text-muted-fg ">
          {picker.count === 0
            ? t("v2.invoiceLinkSelection.bank.nothingSelected")
            : t("v2.invoiceLinkSelection.bank.summary", {
                count: picker.count,
                total: formatAmount(picker.selectedTotal),
              })}
        </V2Text>
      </div>

      <V2StandardTable<BankTransactionLinkDto>
        tableId={
          picker.suggestionsOnly
            ? "v2-invoice-link-netoff-suggestions"
            : `v2-invoice-link-netoff-${picker.source.toLowerCase()}`
        }
        // Gợi ý: danh sách đầy đủ phía client; sao kê/sổ quỹ: phân trang phía server
        mode={picker.suggestionsOnly ? "client" : "server"}
        items={picker.rows}
        total={picker.suggestionsOnly ? undefined : picker.totalRows}
        initialQuery={{ page: picker.page, pageSize: picker.pageSize }}
        onQueryChange={picker.onTableQueryChange}
        columns={columns}
        getRowKey={(row) => row.id}
        enableRowSelection
        selectedKeys={picker.selectedKeys}
        onSelectionChange={picker.setSelectedKeys}
        loading={picker.loading}
        emptyLabel={
          picker.failed
            ? t("v2.invoiceLinkSelection.bank.loadError")
            : t("v2.invoiceLinkSelection.bank.empty")
        }
      />
    </V2LinkSelectionModal>
  );
}

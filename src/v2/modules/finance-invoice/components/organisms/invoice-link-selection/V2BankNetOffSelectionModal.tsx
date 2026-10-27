import React, { useMemo } from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2SearchInput } from "@/v2/shared/components/molecules/v2-search-input";
import { V2TablePagination } from "@/v2/shared/components/molecules/v2-table-pagination";
import { V2LinkSelectionModal } from "@/v2/shared/components/molecules/v2-link-selection-modal";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import { buildBankNetOffColumns } from "./bankNetOff.columns";
import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";
import type { NetOffSide } from "./bankNetOff.helper";
import { useV2BankNetOffPicker } from "./useV2BankNetOffPicker";
import "./invoice-link-selection.locale";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

export interface V2BankNetOffSelectionModalProps {
  open: boolean;
  onClose: () => void;
  /** PAYMENT cho hóa đơn mua vào, RECEIPT cho hóa đơn bán ra */
  side: NetOffSide;
  existingTxnIds?: string[];
  onSelect: (items: { id: string; amount: number }[]) => void;
}

/** Modal chọn nhiều giao dịch sao kê để cấn trừ, nhập số tiền từng dòng rồi xác nhận một lần */
export function V2BankNetOffSelectionModal({
  open,
  onClose,
  side,
  existingTxnIds = [],
  onSelect,
}: V2BankNetOffSelectionModalProps) {
  const { t } = useV2Translation();
  const picker = useV2BankNetOffPicker({
    open,
    side,
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
      <div className="flex items-center justify-between gap-3">
        <V2SearchInput
          value={picker.search}
          onChange={picker.setSearch}
          placeholder={t("v2.invoiceLinkSelection.bank.searchPlaceholder")}
        />
        <V2Text
          as="span"
          className="whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300"
        >
          {picker.count === 0
            ? t("v2.invoiceLinkSelection.bank.nothingSelected")
            : t("v2.invoiceLinkSelection.bank.summary", {
                count: picker.count,
                total: formatAmount(picker.selectedTotal),
              })}
        </V2Text>
      </div>
      <V2StandardTable<BankTransactionLinkDto>
        tableId="v2-invoice-link-bank-transactions"
        mode="client"
        items={picker.rows}
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
      <V2TablePagination
        page={picker.page}
        pageSize={picker.pageSize}
        total={picker.totalRows}
        onPageChange={picker.setPage}
        onPageSizeChange={picker.setPageSize}
      />
    </V2LinkSelectionModal>
  );
}

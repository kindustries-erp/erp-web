import { useMemo } from "react";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import toast from "react-hot-toast";

const renderCopyableText = (text: string | null | undefined) => {
  if (!text) return null;
  return (
    <Tooltip content={<div className="whitespace-pre-wrap">{text}</div>}>
      <div
        className="w-full line-clamp-2 break-words whitespace-normal cursor-pointer hover:opacity-80 active:opacity-50"
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text);
          toast.success("Đã sao chép");
        }}
      >
        {text}
      </div>
    </Tooltip>
  );
};

interface UsePartnerTransactionsColumnsProps {
  tableState: any;
  items: any[];
  fetchColumnOptions: (args: {
    columnKey: string;
    search?: string;
    pageParam?: number;
    filtersStr?: string;
  }) => Promise<any>;
  setDetailTransactionId: (id: string | null) => void;
  t: (key: string, options?: any) => string;
}

export function usePartnerTransactionsColumns({
  tableState,
  items,
  fetchColumnOptions,
  setDetailTransactionId,
  t,
}: UsePartnerTransactionsColumnsProps) {
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items,
        fetchOptions: fetchColumnOptions,
      }),
    [tableState, items, fetchColumnOptions],
  );

  const columns: DataTableColumn<any>[] = useMemo(() => {
    return [
      // 1. STT (40px, căn giữa)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "w-[40px] min-w-[40px] text-center",
        className:
          "w-[40px] min-w-[40px] text-center font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },

      // 2. Tài khoản / Sổ quỹ
      {
        key: "account",
        header: headerFilter(
          "account",
          t("bankStatement.columns.account", { defaultValue: "Tài khoản" }),
          {
            showBlankOption: true,
          },
        ),
        size: 140,
        minSize: 110,
        enableResizing: true,
        cell: (row) => {
          const text =
            row.sourceType === "BANK"
              ? row.bankAccount?.bankName
                ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
                : ""
              : row.cashBook?.name || "";
          return renderCopyableText(text);
        },
      },

      // 3. Ngày giao dịch
      {
        key: "transDate",
        dataIndex: "transDate",
        header: headerFilter.date(
          "transDate",
          t("bankStatement.columns.transDate", { defaultValue: "Ngày GD" }),
        ),
        size: 120,
        minSize: 100,
        enableResizing: true,
        cell: (row) => <TableDateCell date={row.transDate} />,
      },

      // 4. Số tham chiếu / Mã GD
      {
        key: "referenceNumber",
        header: headerFilter(
          "referenceNumber",
          t("bankStatement.columns.referenceNumber", {
            defaultValue: "Mã giao dịch",
          }),
          { showBlankOption: true },
        ),
        size: 180,
        minSize: 130,
        enableResizing: true,
        cell: (row) => {
          if (!row.referenceNumber) return "—";
          return (
            <TableText
              text={row.referenceNumber}
              onDrawerClick={(e) => {
                e.stopPropagation();
                setDetailTransactionId(row.id);
              }}
              tooltip={true}
              enableCopy={true}
              textClassName="font-medium text-primary hover:text-primary/80 cursor-pointer break-words whitespace-normal"
            />
          );
        },
      },

      // 5. Nội dung giao dịch
      {
        key: "description",
        dataIndex: "description",
        header: headerFilter(
          "description",
          t("bankStatement.columns.description", {
            defaultValue: "Nội dung giao dịch",
          }),
          { showBlankOption: true },
        ),
        size: 320,
        minSize: 200,
        enableResizing: true,
        cell: (row) => renderCopyableText(row.description),
      },

      // 6. Tiền vào (Thu)
      {
        key: "thu",
        header: headerFilter.amount(
          "thu",
          t("bankStatement.columns.thu", { defaultValue: "Tiền vào (Thu)" }),
        ),
        size: 140,
        minSize: 110,
        enableResizing: true,
        className: "text-right",
        cell: (row) => {
          const credit = parseFloat(row.creditAmount) || 0;
          if (credit > 0)
            return (
              <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{money(credit)}
              </span>
            );
          return null;
        },
      },

      // 7. Tiền ra (Chi)
      {
        key: "chi",
        header: headerFilter.amount(
          "chi",
          t("bankStatement.columns.chi", { defaultValue: "Tiền ra (Chi)" }),
        ),
        size: 140,
        minSize: 110,
        enableResizing: true,
        className: "text-right",
        cell: (row) => {
          const debit = parseFloat(row.debitAmount) || 0;
          if (debit > 0)
            return (
              <span className="font-mono text-xs font-semibold text-[#ea580c] dark:text-orange-400 tabular-nums">
                {money(debit)}
              </span>
            );
          return null;
        },
      },

      // 8. Số dư
      {
        key: "balance",
        dataIndex: "balance",
        header: headerFilter.amount(
          "balance",
          t("bankStatement.columns.balance", { defaultValue: "Số dư" }),
        ),
        size: 140,
        minSize: 110,
        enableResizing: true,
        className: "text-right font-medium",
        cell: (row) => (
          <span className="font-mono text-xs tabular-nums text-foreground">
            {money(row.balance)}
          </span>
        ),
      },

      // 9. Đã cấn trừ (Sạch bóng class blue -> indigo/neutral)
      {
        key: "netOffAmount",
        header: headerFilter.amount(
          "netOffAmount",
          t("bankStatement.columns.netOffAmount", {
            defaultValue: "Đã cấn trừ",
          }),
        ),
        className:
          "text-right bg-indigo-50/30 dark:bg-indigo-950/20 border-l border-border",
        headerClassName:
          "text-center bg-indigo-50/30 dark:bg-indigo-950/20 border-l border-border",
        size: 140,
        minSize: 110,
        enableResizing: true,
        cell: (row) => {
          const netOff = parseFloat(row.netOffAmount) || 0;
          if (netOff === 0) return "--";
          return (
            <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {money(netOff)}
            </span>
          );
        },
      },

      // 10. Còn lại
      {
        key: "remainingAmount",
        header: headerFilter.amount(
          "remainingAmount",
          t("bankStatement.columns.remainingAmount", {
            defaultValue: "Còn lại",
          }),
        ),
        className:
          "text-right font-semibold bg-indigo-50/30 dark:bg-indigo-950/20",
        headerClassName: "text-center bg-indigo-50/30 dark:bg-indigo-950/20",
        size: 140,
        minSize: 110,
        enableResizing: true,
        cell: (row) => {
          const credit = parseFloat(row.creditAmount) || 0;
          const debit = parseFloat(row.debitAmount) || 0;
          const amount = credit > 0 ? credit : debit;
          const netOff = parseFloat(row.netOffAmount) || 0;
          const remaining = amount - netOff;
          if (remaining === 0)
            return (
              <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                0
              </span>
            );
          return (
            <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
              {money(remaining)}
            </span>
          );
        },
      },

      // 11. Đối tượng HĐ
      {
        key: "invoiceSubject",
        header: headerFilter(
          "invoiceSubject",
          t("bankStatement.columns.invoiceSubject", {
            defaultValue: "Đối tượng HĐ",
          }),
          { showBlankOption: true },
        ),
        size: 200,
        minSize: 150,
        enableResizing: true,
        cell: (row) => {
          let subject = row.invoiceSubject;
          if (!subject && row.invoiceNetOffs && row.invoiceNetOffs.length > 0) {
            const subjects = row.invoiceNetOffs
              .map((link: any) => {
                const inv = link.invoice || link.erpInvoice || {};
                const name =
                  inv.direction === "IN" ? inv.sellerName : inv.buyerName;
                const taxCode =
                  inv.direction === "IN" ? inv.sellerTaxCode : inv.buyerTaxCode;
                return taxCode && name ? `${taxCode} - ${name}` : name;
              })
              .filter(Boolean);
            if (subjects.length > 0) {
              subject = Array.from(new Set(subjects)).join(", ");
            }
          }
          return renderCopyableText(subject);
        },
      },

      // 12. Chi nhánh
      {
        key: "branch",
        header: headerFilter(
          "branch",
          t("thietlap.columns.branch", { defaultValue: "Chi nhánh" }),
          {
            showBlankOption: true,
          },
        ),
        size: 150,
        minSize: 120,
        enableResizing: true,
        cell: (row) => renderCopyableText(row.branch?.name || ""),
      },
    ];
  }, [headerFilter, setDetailTransactionId, t]);

  return { columns };
}

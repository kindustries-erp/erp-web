import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (
    selectedVouchers: {
      id: string;
      amount: number;
      maxAmount?: number;
      txn?: any;
    }[],
  ) => void;
  existingVoucherIds?: string[];
  excludeTxnIds?: string[];
}

function NetOffInput({
  initialValue,
  maxAmount,
  onChange,
}: {
  initialValue: number | "";
  maxAmount: number;
  onChange: (val: number) => void;
}) {
  const [val, setVal] = useState<string | number>(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    let numericVal = Number(val);
    if (numericVal > maxAmount) numericVal = maxAmount;
    if (numericVal < 0) numericVal = 0;
    setVal(numericVal);
    onChange(numericVal);
  };

  return (
    <input
      className="w-full text-right h-8 border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
      type="number"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
    />
  );
}

export function VoucherNetoffSelectionModal({
  open,
  onClose,
  onSelect,
  existingVoucherIds = [],
  excludeTxnIds = [],
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    existingVoucherIds || [],
  );
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );
  const [maxAmounts, setMaxAmounts] = useState<Record<string, number>>({});
  const [selectedTxns, setSelectedTxns] = useState<Record<string, any>>({});

  const tableState = useTableColumnState(`voucher-netoff-selection-table`);
  const sortBy = tableState.sorts[0]?.replace("-", "") || "transDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "DESC" : "ASC";

  const { data, isLoading } = useQuery({
    queryKey: [
      "bank-transactions-for-netoff",
      page,
      pageSize,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        page,
        pageSize,
        sortBy,
        sortOrder,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      }),
    enabled: open,
  });

  const vouchers = (data?.items || []).filter((v: any) => {
    if (existingVoucherIds.includes(v.id)) return false;
    if (excludeTxnIds.includes(v.id)) return false;
    const credit = parseFloat(v.creditAmount) || 0;
    const debit = parseFloat(v.debitAmount) || 0;
    const amount = credit > 0 ? credit : debit;
    const netOff = parseFloat(v.netOffAmount) || 0;
    const remaining = amount - netOff;
    return remaining > 0;
  });

  // Clear selections when modal closes or opens
  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setNetOffAmounts({});
      setMaxAmounts({});
      setSelectedTxns({});
    }
  }, [open]);

  const handleSelect = (v: any, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, v.id]);
      const credit = parseFloat(v.creditAmount) || 0;
      const debit = parseFloat(v.debitAmount) || 0;
      const amount = credit > 0 ? credit : debit;
      const netOff = parseFloat(v.netOffAmount) || 0;
      const remaining = amount - netOff;

      setNetOffAmounts((prev) => ({
        ...prev,
        [v.id]: remaining > 0 ? remaining : 0,
      }));
      setMaxAmounts((prev) => ({ ...prev, [v.id]: remaining }));
      setSelectedTxns((prev) => ({ ...prev, [v.id]: v }));
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== v.id));
      setNetOffAmounts((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
      setMaxAmounts((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
      setSelectedTxns((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
    }
  };

  const handleAmountChange = (v: any, val: number) => {
    setNetOffAmounts((prev) => ({ ...prev, [v.id]: val }));
  };

  const handleSubmit = () => {
    onSelect(
      selectedIds.map((id) => ({
        id,
        amount: netOffAmounts[id] || 0,
        maxAmount: maxAmounts[id],
        txn: selectedTxns[id],
      })),
    );
    onClose();
  };

  const fetchColumnOptions = async ({
    columnKey,
    search,
    pageParam,
    filtersStr,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    return bankStatementApi.getColumnOptions(
      columnKey,
      search,
      pageParam,
      20,
      filtersStr,
    );
  };

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
    setPage(1);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
    setPage(1);
  };

  const renderHeaderFilter = (key: string, label: string) => {
    return (
      <TableColumnHeaderFilter
        title={label}
        align="center"
        className="w-full justify-center"
        sortState={getSortState(key)}
        onSortChange={(state) => handleSortChange(key, state)}
        searchValue={tableState.columnSearch[key] || ""}
        onSearchChange={(val) => handleSearchChange(key, val)}
        selectedFilters={tableState.columnFilters[key] || []}
        onFilterChange={(vals) => handleFilterChange(key, vals)}
        columnKey={key}
        allFilters={tableState.columnFilters}
        fetchOptions={fetchColumnOptions}
        queryKeyPrefix={`voucher-netoff-selection-column-options`}
      />
    );
  };

  const columns: any[] = [
    {
      key: "selection",
      header: "",
      size: 50,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(c: any) => handleSelect(row, !!c)}
            />
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "transDate",
      dataIndex: "transDate",
      header: renderHeaderFilter("transDate", t("date", "Ngày")),
      cell: (row: any) => formatGMT7(row.transDate, "date"),
      size: 120,
      sortable: false,
    },
    {
      key: "description",
      dataIndex: "description",
      header: renderHeaderFilter("description", t("description", "Diễn giải")),
      size: 300,
      cell: (row: any) => (
        <div className="whitespace-pre-wrap line-clamp-2">
          {row.description || "—"}
        </div>
      ),
    },
    {
      key: "source",
      header: renderHeaderFilter("source", t("source", "Nguồn")),
      size: 150,
      cell: (row: any) => {
        return row.sourceType === "BANK"
          ? row.bankAccount?.bankName
            ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
            : ""
          : row.cashBook?.name || "";
      },
    },
    {
      key: "thu",
      header: renderHeaderFilter("thu", "Thu"),
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        if (credit > 0)
          return (
            <span className="text-emerald-600 font-medium">
              +{money(credit)}
            </span>
          );
        return null;
      },
      className: "text-right",
      size: 130,
      sortable: false,
    },
    {
      key: "chi",
      header: renderHeaderFilter("chi", "Chi"),
      cell: (row: any) => {
        const debit = parseFloat(row.debitAmount) || 0;
        if (debit > 0)
          return (
            <span className="text-[#ea580c] font-medium">{money(debit)}</span>
          );
        return null;
      },
      className: "text-right",
      size: 130,
      sortable: false,
    },
    {
      key: "netOffAmount",
      header: renderHeaderFilter("netOffAmount", "Đã cấn trừ"),
      className: "text-right",
      headerClassName: "text-center",
      size: 130,
      cell: (row: any) => {
        const netOff = parseFloat(row.netOffAmount) || 0;
        if (netOff === 0) return "--";
        return (
          <span className="text-blue-600 font-medium">{money(netOff)}</span>
        );
      },
    },
    {
      key: "remainingAmount",
      header: renderHeaderFilter("remainingAmount", "Còn lại"),
      className: "text-right font-semibold",
      headerClassName: "text-center",
      size: 130,
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = amount - netOff;
        if (remaining === 0)
          return <span className="text-emerald-600 font-medium">0</span>;
        return (
          <span className="text-slate-700 font-medium">{money(remaining)}</span>
        );
      },
    },
    {
      key: "currentNetOff",
      header: renderHeaderFilter("currentNetOff", t("netOffAmount", "Cấn trừ")),
      className: "text-right",
      headerClassName: "text-center",
      size: 150,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        if (!isSelected) return null;
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = amount - netOff;

        return (
          <NetOffInput
            initialValue={
              netOffAmounts[row.id] !== undefined ? netOffAmounts[row.id] : ""
            }
            maxAmount={remaining}
            onChange={(val: number) => handleAmountChange(row, val)}
          />
        );
      },
    },
  ];

  const summaryRow = useMemo(() => {
    if (!vouchers || vouchers.length === 0) return undefined;

    const totalDebit = vouchers.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.debitAmount) || 0),
      0,
    );
    const totalCredit = vouchers.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.creditAmount) || 0),
      0,
    );

    const totalAlreadyNetOff = vouchers.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = vouchers.reduce(
      (acc: number, curr: any) =>
        acc +
        (Math.max(
          parseFloat(curr.creditAmount) || 0,
          parseFloat(curr.debitAmount) || 0,
        ) -
          (parseFloat(curr.netOffAmount) || 0)),
      0,
    );

    const totalCurrentNetOff = Object.values(netOffAmounts).reduce(
      (sum: number, val) => sum + Number(val || 0),
      0,
    );

    return {
      transDate: null,
      thu:
        totalCredit > 0 ? (
          <span className="text-emerald-600 font-medium">
            +{money(totalCredit)}
          </span>
        ) : (
          money(0)
        ),
      chi:
        totalDebit > 0 ? (
          <span className="text-[#ea580c] font-medium">
            {money(totalDebit)}
          </span>
        ) : (
          money(0)
        ),
      netOffAmount:
        totalAlreadyNetOff === 0 ? (
          "--"
        ) : (
          <span className="text-blue-600 font-medium">
            {money(totalAlreadyNetOff)}
          </span>
        ),
      remainingAmount:
        totalRemaining === 0 ? (
          <span className="text-emerald-600 font-medium">0</span>
        ) : (
          <span className="text-slate-700 font-medium">
            {money(totalRemaining)}
          </span>
        ),
      currentNetOff:
        totalCurrentNetOff === 0 ? (
          "--"
        ) : (
          <span className="text-orange-600 font-bold">
            {money(totalCurrentNetOff)}
          </span>
        ),
    };
  }, [vouchers, netOffAmounts]);

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("selectVoucherToNetoff", "Chọn phiếu thu/chi để cấn trừ")}
      panelClassName="w-full md:w-[95vw] lg:w-[1200px] xl:w-[1200px]"
      actions={[
        {
          label: t("cancel", "Hủy"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: t("confirm", "Xác nhận"),
          primary: true,
          disabled: selectedIds.length === 0,
          onClick: handleSubmit,
        },
      ]}
    >
      <div className="flex flex-col h-full min-h-[500px]">
        <StandardTable
          tableId="voucher-netoff-selection-table"
          items={vouchers}
          columns={columns}
          getRowKey={(row: any) => row.id}
          variant="spreadsheet"
          enableColumnResizing={true}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          total={data?.total || 0}
          totalPages={data?.totalPages || 0}
          onPage={setPage}
          onPageSize={setPageSize}
          summaryRow={summaryRow}
          minWidth={1000}
        />
      </div>
    </DrawerModal>
  );
}

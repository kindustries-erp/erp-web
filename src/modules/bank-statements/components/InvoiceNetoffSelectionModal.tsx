import React, { useState, useMemo, useEffect } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useQuery } from "@tanstack/react-query";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { useT } from "@/core/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (
    selectedInvoices: {
      id: string;
      amount: number;
      maxAmount?: number;
      invoice?: any;
    }[],
  ) => void;
  existingInvoiceIds?: string[];
  maxAvailableAmount?: number;
  direction?: "IN" | "OUT";
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
      className="w-full text-right h-8 border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
      type="number"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
    />
  );
}

export function InvoiceNetoffSelectionModal({
  open,
  onClose,
  onSelect,
  existingInvoiceIds = [],
  maxAvailableAmount,
  direction,
}: Props) {
  const t = useT();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );
  const [maxAmounts, setMaxAmounts] = useState<Record<string, number>>({});
  const [selectedInvoices, setSelectedInvoices] = useState<Record<string, any>>(
    {},
  );

  const tableState = useTableColumnState(`invoice-netoff-selection-table`);
  const sortBy = tableState.sorts[0]?.replace("-", "") || "invoiceDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "desc" : "asc";

  const { data, isLoading } = useQuery({
    queryKey: [
      "invoices-for-netoff",
      page,
      pageSize,
      direction,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: () =>
      erpInvoicesCoreApi.list({
        page,
        pageSize,
        direction,
        sort_by: sortBy,
        sort_order: sortOrder,
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

  const invoices = useMemo(() => {
    return (data?.items || []).filter((inv: any) => {
      if (existingInvoiceIds.includes(inv.id)) return false;
      const total = parseFloat(inv.totalAmount) || 0;
      const netOff = Array.isArray(inv.voucherNetOffs)
        ? inv.voucherNetOffs.reduce(
            (sum: number, n: any) => sum + (parseFloat(n.netOffAmount) || 0),
            0,
          )
        : 0;
      const remaining = total - netOff;
      return remaining > 0;
    });
  }, [data?.items, existingInvoiceIds]);

  // Reset selections when modal closes or opens
  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setNetOffAmounts({});
      setMaxAmounts({});
      setSelectedInvoices({});
    }
  }, [open]);

  const handleSelect = (inv: any, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, inv.id]);
      const total = parseFloat(inv.totalAmount) || 0;
      const netOff = Array.isArray(inv.voucherNetOffs)
        ? inv.voucherNetOffs.reduce(
            (sum: number, n: any) => sum + (parseFloat(n.netOffAmount) || 0),
            0,
          )
        : 0;
      const remaining = total - netOff;
      const initialNetOff =
        maxAvailableAmount && maxAvailableAmount < remaining
          ? maxAvailableAmount
          : remaining;

      setNetOffAmounts((prev) => ({
        ...prev,
        [inv.id]: initialNetOff > 0 ? initialNetOff : 0,
      }));
      setMaxAmounts((prev) => ({ ...prev, [inv.id]: remaining }));
      setSelectedInvoices((prev) => ({ ...prev, [inv.id]: inv }));
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== inv.id));
      setNetOffAmounts((prev) => {
        const next = { ...prev };
        delete next[inv.id];
        return next;
      });
      setMaxAmounts((prev) => {
        const next = { ...prev };
        delete next[inv.id];
        return next;
      });
      setSelectedInvoices((prev) => {
        const next = { ...prev };
        delete next[inv.id];
        return next;
      });
    }
  };

  const handleAmountChange = (inv: any, val: number) => {
    setNetOffAmounts((prev) => ({ ...prev, [inv.id]: val }));
  };

  const handleSubmit = () => {
    onSelect(
      selectedIds.map((id) => ({
        id,
        amount: netOffAmounts[id] || 0,
        maxAmount: maxAmounts[id],
        invoice: selectedInvoices[id],
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
    const res = await erpInvoicesCoreApi.getInvoiceColumnOptions(
      columnKey,
      search,
      pageParam,
      20,
      filtersStr,
      direction,
    );
    return {
      items: (res?.items || []).map((x: any) =>
        typeof x === "object"
          ? { label: x.label || x.name || x.value, value: x.value }
          : { label: String(x), value: String(x) },
      ),
      total: res?.total || 0,
      next: pageParam < (res?.totalPages || 0) ? pageParam + 1 : null,
    };
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
        queryKeyPrefix={`invoice-netoff-selection-column-options`}
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
      key: "direction",
      header: renderHeaderFilter("direction", t("Loại HĐ")),
      size: 90,
      cell: (row: any) => (
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
            row.direction === "IN"
              ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          }`}
        >
          {row.direction === "IN" ? "Đầu vào" : "Đầu ra"}
        </span>
      ),
    },
    {
      key: "invoiceNo",
      header: renderHeaderFilter("invoiceNo", t("Số HĐ")),
      size: 130,
      cell: (row: any) => (
        <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
          {row.invoiceNo} {row.serialNo ? `(${row.serialNo})` : ""}
        </div>
      ),
    },
    {
      key: "invoiceDate",
      header: renderHeaderFilter("invoiceDate", t("Ngày HĐ")),
      size: 110,
      cell: (row: any) => formatGMT7(row.invoiceDate, "date"),
    },
    {
      key: "partner",
      header: renderHeaderFilter("sellerName", t("Đối tác / Đơn vị")),
      size: 260,
      cell: (row: any) => (
        <div
          className="truncate text-xs"
          title={row.sellerName || row.buyerName || "—"}
        >
          <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {row.direction === "IN" ? row.sellerName : row.buyerName || "—"}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            MST:{" "}
            {row.direction === "IN"
              ? row.sellerTaxCode
              : row.buyerTaxCode || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "totalAmount",
      header: renderHeaderFilter("totalAmount", t("Tổng tiền")),
      className: "text-right font-mono",
      size: 130,
      cell: (row: any) => money(row.totalAmount || 0),
    },
    {
      key: "netOffAmount",
      header: renderHeaderFilter("netOffAmount", t("Đã cấn trừ")),
      className: "text-right font-mono",
      size: 130,
      cell: (row: any) => {
        const netOff = Array.isArray(row.voucherNetOffs)
          ? row.voucherNetOffs.reduce(
              (sum: number, n: any) => sum + (parseFloat(n.netOffAmount) || 0),
              0,
            )
          : 0;
        if (netOff === 0) return "--";
        return (
          <span className="text-blue-600 font-medium">{money(netOff)}</span>
        );
      },
    },
    {
      key: "remainingAmount",
      header: renderHeaderFilter("remainingAmount", t("Còn lại")),
      className: "text-right font-semibold font-mono",
      size: 130,
      cell: (row: any) => {
        const total = parseFloat(row.totalAmount) || 0;
        const netOff = Array.isArray(row.voucherNetOffs)
          ? row.voucherNetOffs.reduce(
              (sum: number, n: any) => sum + (parseFloat(n.netOffAmount) || 0),
              0,
            )
          : 0;
        const remaining = total - netOff;
        return (
          <span className="text-slate-800 dark:text-slate-200">
            {money(remaining)}
          </span>
        );
      },
    },
    {
      key: "currentNetOff",
      header: renderHeaderFilter("currentNetOff", t("Số tiền cấn trừ")),
      className: "text-right",
      headerClassName: "text-center",
      size: 150,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        if (!isSelected) return null;
        const total = parseFloat(row.totalAmount) || 0;
        const netOff = Array.isArray(row.voucherNetOffs)
          ? row.voucherNetOffs.reduce(
              (sum: number, n: any) => sum + (parseFloat(n.netOffAmount) || 0),
              0,
            )
          : 0;
        const remaining = total - netOff;

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

  const totalCurrentNetOff = useMemo(() => {
    return Object.values(netOffAmounts).reduce(
      (sum, val) => sum + Number(val || 0),
      0,
    );
  }, [netOffAmounts]);

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("Chọn hóa đơn để cấn trừ")}
      panelClassName="w-full md:w-[95vw] lg:w-[1250px] xl:w-[1300px]"
      actions={[
        {
          label: t("Hủy"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: `${t("Xác nhận ghép nối")} (${selectedIds.length})`,
          primary: true,
          disabled: selectedIds.length === 0 || totalCurrentNetOff <= 0,
          onClick: handleSubmit,
        },
      ]}
    >
      <div className="flex flex-col h-full min-h-[500px] gap-3">
        {maxAvailableAmount !== undefined && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs">
            <span className="text-slate-500">
              Số tiền khả dụng trên giao dịch:{" "}
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                {money(maxAvailableAmount)}
              </strong>
            </span>
            <span className="text-slate-500">
              Tổng số tiền đã chọn cấn trừ:{" "}
              <strong className="font-mono text-emerald-600">
                {money(totalCurrentNetOff)}
              </strong>
            </span>
          </div>
        )}

        <StandardTable
          tableId="invoice-netoff-selection-table"
          items={invoices}
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
          minWidth={1050}
        />
      </div>
    </DrawerModal>
  );
}

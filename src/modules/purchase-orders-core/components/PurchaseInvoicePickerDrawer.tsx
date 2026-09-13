import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useQuery } from "@tanstack/react-query";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Badge } from "@/shared/components/ui/badge";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (invoiceIds: string[]) => void;
  alreadyLinkedIds?: string[];
  purchaseOrderId: string;
}

export function PurchaseInvoicePickerDrawer({
  open,
  onClose,
  onConfirm,
  alreadyLinkedIds = [],
  purchaseOrderId,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const tableState = useTableColumnState(`purchase-invoice-picker-table`);
  const sortBy = tableState.sorts[0]?.replace("-", "") || "invoiceDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "desc" : "asc";

  const { data, isLoading } = useQuery({
    queryKey: [
      "purchase-invoice-picker",
      page,
      pageSize,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
      purchaseOrderId,
    ],
    queryFn: () =>
      erpInvoicesCoreApi.list({
        page,
        pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        direction: "IN",
        unlinked_po_id: purchaseOrderId,
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

  const invoices = (data?.items || []).filter(
    (inv) => !alreadyLinkedIds.includes(inv.id),
  );

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
    }
  }, [open]);

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(invoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSubmit = () => {
    onConfirm(selectedIds);
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
      "IN",
    );
    return {
      items: res.items.map((i: any) =>
        typeof i === "object"
          ? { label: i.label || i.name || i.value, value: i.value }
          : { label: String(i), value: String(i) },
      ),
      total: res.total,
      next: res.page < res.totalPages ? res.page + 1 : null,
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
        queryKeyPrefix={`purchase-invoice-picker-column-options`}
      />
    );
  };

  const allSelected =
    invoices.length > 0 && selectedIds.length === invoices.length;

  const columns: any[] = [
    {
      key: "selection",
      header: (
        <div className="flex justify-center">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(c: any) => handleSelectAll(!!c)}
          />
        </div>
      ),
      size: 50,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(c: any) => handleSelect(row.id, !!c)}
            />
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "invoiceNo",
      dataIndex: "invoiceNo",
      header: renderHeaderFilter("invoiceNo", t("Số HĐ")),
      size: 150,
      cell: (row: any) => (
        <span className="font-medium text-slate-800">{row.invoiceNo}</span>
      ),
    },
    {
      key: "invoiceDate",
      dataIndex: "invoiceDate",
      header: renderHeaderFilter("invoiceDate", t("Ngày HĐ")),
      cell: (row: any) => formatGMT7(row.invoiceDate, "date"),
      size: 120,
    },
    {
      key: "sellerName",
      dataIndex: "sellerName",
      header: renderHeaderFilter("sellerName", t("Nhà cung cấp")),
      size: 300,
      cell: (row: any) => (
        <div className="whitespace-pre-wrap line-clamp-2">
          {row.sellerName || "—"}
        </div>
      ),
    },
    {
      key: "totalAmount",
      header: renderHeaderFilter("totalAmount", t("Tổng tiền")),
      cell: (row: any) => (
        <span className="text-emerald-600 font-medium">
          {money(row.totalAmount)}
        </span>
      ),
      className: "text-right tabular-nums",
      size: 130,
    },
    {
      key: "status",
      header: renderHeaderFilter("status", t("Trạng thái")),
      cell: (row: any) => (
        <Badge variant={row.status === "VALID" ? "default" : "secondary"}>
          {t(row.status || "—")}
        </Badge>
      ),
      className: "text-center",
      size: 120,
    },
  ];

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("Chọn hóa đơn liên kết")}
      panelClassName="w-full md:w-[95vw] lg:w-[1100px] xl:w-[1100px]"
      actions={[
        {
          label: t("Hủy"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: t("Xác nhận"),
          primary: true,
          disabled: selectedIds.length === 0,
          onClick: handleSubmit,
        },
      ]}
    >
      <div className="flex flex-col h-full min-h-[500px]">
        <StandardTable
          tableId="purchase-invoice-picker-table"
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
          minWidth={900}
        />
      </div>
    </DrawerModal>
  );
}

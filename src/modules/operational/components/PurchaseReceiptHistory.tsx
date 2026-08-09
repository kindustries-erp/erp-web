import { useState, useMemo, useEffect } from "react";
import { useT } from "@/core/i18n";
import { type ErpPoReceipt } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { DataTable } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { FilterButton } from "@/shared/components/FilterPanel";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useVoucherClientFilter } from "@/modules/inventory-core/hooks/useVoucherClientFilter";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

export function PurchaseReceiptHistory({
  receipts,
}: {
  receipts: ErpPoReceipt[];
}) {
  const t = useT();
  const grDrawer = useGrDrawer();
  const [viewingReceiptId, setViewingReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (viewingReceiptId) {
      void grDrawer.openDetail(viewingReceiptId, true);
    }
  }, [viewingReceiptId]);

  useEffect(() => {
    if (!grDrawer.open) {
      setViewingReceiptId(null);
    }
  }, [grDrawer.open]);

  const { listHook, processedLines, buildFilterOptions } =
    useVoucherClientFilter({
      tableId: "purchase-receipt-history-table",
      lines: receipts,
      isOpen: true,
      getCode: (line) => line.receiptNo || "",
      getName: () => "",
      customSort: (a, b, field, isDesc) => {
        if (field === "date") {
          const dtA = a.createdAt || a.receiptDate || "";
          const dtB = b.createdAt || b.receiptDate || "";
          return isDesc ? dtB.localeCompare(dtA) : dtA.localeCompare(dtB);
        }
        if (field === "totalQty") {
          const qtyA =
            a.lines?.reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0) ||
            0;
          const qtyB =
            b.lines?.reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0) ||
            0;
          return isDesc ? qtyB - qtyA : qtyA - qtyB;
        }
        return null;
      },
    });

  const totalQty = useMemo(() => {
    return processedLines.reduce((sum, receipt) => {
      const receiptTotal =
        receipt.lines?.reduce(
          (acc, l) => acc + Number(l.qtyReceived || 0),
          0,
        ) || 0;
      return sum + receiptTotal;
    }, 0);
  }, [processedLines]);

  const makeFilterHeader = (
    key: string,
    title: string,
    source: any[],
    opts?: { hideFilter?: boolean; hideFooter?: boolean; dateRangeSlot?: any },
  ) => (
    <TableColumnHeaderFilter
      title={title}
      sortState={
        listHook.sorts.includes(key)
          ? "asc"
          : listHook.sorts.includes(`-${key}`)
            ? "desc"
            : "none"
      }
      onSortChange={(state) => listHook.setSort(key, state)}
      searchValue={listHook.columnSearch[key] || ""}
      onSearchChange={(val) => listHook.setColumnSearch(key, val)}
      selectedFilters={listHook.columnFilters[key] || []}
      onFilterChange={(vals) => listHook.setColumnFilter(key, vals)}
      align="center"
      columnKey={key}
      allFilters={listHook.columnFilters}
      hideFilter={opts?.hideFilter}
      hideFooter={opts?.hideFooter}
      dateRangeSlot={opts?.dateRangeSlot}
      fetchOptions={
        opts?.hideFilter ? undefined : buildFilterOptions(key as any, source)
      }
      isActive={
        !!listHook.columnFilters[key]?.length || !!listHook.columnSearch[key]
      }
    />
  );

  const columns = [
    {
      key: "index",
      header: "#",
      size: 40,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_: any, idx: number) => (
        <span className="text-muted-foreground">{idx}</span>
      ),
    },
    {
      key: "date",
      size: 130,
      enableResizing: true,
      header: makeFilterHeader("date", t("Ngày"), receipts, {
        hideFilter: true,
        hideFooter: true,
        dateRangeSlot: ({ close }: any) => {
          const val = listHook.columnSearch["date"] || "";
          const [from = "", to = ""] = val.split("|");
          return (
            <DateRangeColumnSlot
              dateFrom={from}
              dateTo={to}
              onChange={(f, t) => {
                const next = f || t ? `${f}|${t}` : "";
                listHook.setColumnSearch("date", next);
              }}
              onClose={close}
            />
          );
        },
      }),
      className: "text-right",
      cell: (receipt: ErpPoReceipt) => {
        const dt = receipt.createdAt || receipt.receiptDate;
        return <TableDateCell date={dt} className="justify-end w-full" />;
      },
    },
    {
      key: "receiptNo",
      size: 200,
      enableResizing: true,
      header: makeFilterHeader("receiptNo", t("Số phiếu"), receipts),
      cell: (receipt: ErpPoReceipt) => (
        <TableText
          text={receipt.receiptNo || ""}
          tooltip={true}
          enableCopy={true}
          onDrawerClick={(e) => {
            e.stopPropagation();
            setViewingReceiptId(receipt.id);
          }}
        />
      ),
    },
    {
      key: "totalQty",
      size: 150,
      enableResizing: true,
      header: makeFilterHeader("totalQty", t("SL Nhập"), receipts, {
        hideFilter: true,
      }),
      headerClassName: "text-right",
      className: "text-right",
      cell: (receipt: ErpPoReceipt) => {
        const qty =
          receipt.lines?.reduce(
            (sum, l) => sum + Number(l.qtyReceived || 0),
            0,
          ) || 0;
        return (
          <span className="font-medium tabular-nums text-emerald-600">
            {qty.toLocaleString("vi-VN")}
          </span>
        );
      },
    },
  ];

  const clearFilterBtn =
    listHook.activeFilterCount > 0 ? (
      <FilterButton
        activeCount={listHook.activeFilterCount}
        onClick={() => {}}
        className="h-8 py-1.5 ml-2"
        onClear={listHook.resetFilters}
      />
    ) : null;

  return (
    <DrawerSection
      title={
        <span>
          {t("Lịch sử nhập kho")} ({processedLines.length}/{receipts.length})
        </span>
      }
      titleExtra={clearFilterBtn}
    >
      <div className="w-full">
        <DataTable
          items={processedLines}
          getRowKey={(receipt) => receipt.id}
          variant="spreadsheet"
          emptyLabel={t("Chưa có lịch sử nhập")}
          containerClassName="max-h-[300px] overflow-y-auto"
          columns={columns as any}
          summaryRow={{
            receiptNo: (
              <div className="text-right w-full font-semibold px-3">
                {t("Tổng cộng")}:
              </div>
            ),
            totalQty: (
              <div className="text-right font-bold text-primary tabular-nums px-3">
                {totalQty.toLocaleString("vi-VN")}
              </div>
            ),
          }}
        />
        <GrFormDrawer drawer={grDrawer} />
      </div>
    </DrawerSection>
  );
}

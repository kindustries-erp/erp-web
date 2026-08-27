import React, { useMemo } from "react";
import type { TFunction } from "i18next";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { ErpInvoiceItemRow } from "../../../api/erpInvoicesCoreApi";
import type { useErpInvoiceItemsList } from "../../../hooks/useErpInvoiceItemsList";

export interface UseItemColumnsOptions {
  direction: "IN" | "OUT";
  t: TFunction<any, any>;
  listHook: ReturnType<typeof useErpInvoiceItemsList>;
  getSortState: (key: string) => "asc" | "desc" | "none";
  fetchColumnOptions: (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => Promise<{
    items: { label: string; value: string }[];
    total: number;
    next: number | null;
  }>;
  handleOpenInternal: (inv: any, mode?: "view" | "edit", tab?: string) => void;
}

export function useItemColumns({
  direction,
  t,
  listHook,
  getSortState,
  fetchColumnOptions,
  handleOpenInternal,
}: UseItemColumnsOptions): DataTableColumn<ErpInvoiceItemRow>[] {
  return useMemo(
    () => [
      // 1. Cột STT: 40px, 1-based, text-center
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: ErpInvoiceItemRow, idx: number) => (
          <span className="w-full block text-center text-xs text-muted-foreground">
            {(listHook.page - 1) * listHook.pageSize + idx + 1}
          </span>
        ),
      },

      // 2. Cột Mã HĐ / Số HĐ
      {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.invoiceNo", "Số hóa đơn")}
            columnKey="invoiceNo"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("invoiceNo")}
            onSortChange={(s) => listHook.setSort("invoiceNo", s)}
            searchValue={listHook.columnSearch["invoiceNo"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("invoiceNo", v)}
            selectedFilters={listHook.columnFilters["invoiceNo"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("invoiceNo", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["invoiceNo"]?.length}
            align="center"
          />
        ),
        size: 130,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => (
          <TableText
            text={row.invoiceNo}
            enableCopy
            tooltip
            onDetailClick={(e) => {
              e.stopPropagation();
              handleOpenInternal(
                { id: row.invoiceId, invoiceNo: row.invoiceNo },
                "view",
              );
            }}
          />
        ),
      },

      // 3. Ký hiệu
      {
        key: "serialNo",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.serialNo", "Ký hiệu")}
            columnKey="serialNo"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("serialNo")}
            onSortChange={(s) => listHook.setSort("serialNo", s)}
            searchValue={listHook.columnSearch["serialNo"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("serialNo", v)}
            selectedFilters={listHook.columnFilters["serialNo"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("serialNo", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["serialNo"]?.length}
            align="center"
          />
        ),
        size: 100,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.serialNo || "—"}
          </span>
        ),
      },

      // 4. Ngày HĐ
      {
        key: "invoiceDate",
        className: "text-center",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.invoiceDate", "Ngày HĐ")}
            sortState={getSortState("invoiceDate")}
            onSortChange={(s) => listHook.setSort("invoiceDate", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(listHook.dateFrom || listHook.dateTo)}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={listHook.dateFrom || ""}
                dateTo={listHook.dateTo || ""}
                onChange={(from, to) => listHook.setDateRange(from, to)}
                onClose={close}
              />
            )}
          />
        ),
        size: 110,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => (
          <TableDateCell
            date={row.invoiceDate}
            className="justify-center w-full"
          />
        ),
      },

      // 5. Đối tác (Người bán hoặc Người mua)
      {
        key: "partner",
        header: (
          <TableColumnHeaderFilter
            title={
              direction === "OUT"
                ? t("columns.buyerName", "Người mua")
                : t("columns.sellerName", "Người bán")
            }
            columnKey="partner"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("partner")}
            onSortChange={(s) => listHook.setSort("partner", s)}
            searchValue={listHook.columnSearch["partner"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("partner", v)}
            selectedFilters={listHook.columnFilters["partner"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("partner", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["partner"]?.length}
            align="center"
          />
        ),
        size: 220,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => {
          const partnerName =
            direction === "OUT"
              ? row.buyerName || row.buyerPersonalName
              : row.sellerName;
          return <TableText text={partnerName || "—"} tooltip />;
        },
      },

      // 6. Mã số thuế
      {
        key: "taxCode",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.taxCode", "Mã số thuế")}
            columnKey="taxCode"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("taxCode")}
            onSortChange={(s) => listHook.setSort("taxCode", s)}
            searchValue={listHook.columnSearch["taxCode"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("taxCode", v)}
            selectedFilters={listHook.columnFilters["taxCode"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("taxCode", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["taxCode"]?.length}
            align="center"
          />
        ),
        size: 130,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => {
          const taxCode =
            direction === "OUT"
              ? row.buyerTaxCode || row.buyerCccd
              : row.sellerTaxCode;
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {taxCode || "—"}
            </span>
          );
        },
      },

      // 7. Mã hàng / SKU
      {
        key: "itemCode",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.itemCode", "Mã hàng")}
            columnKey="itemCode"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("itemCode")}
            onSortChange={(s) => listHook.setSort("itemCode", s)}
            searchValue={listHook.columnSearch["itemCode"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("itemCode", v)}
            selectedFilters={listHook.columnFilters["itemCode"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("itemCode", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["itemCode"]?.length}
            align="center"
          />
        ),
        size: 120,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => (
          <span className="font-mono text-xs font-medium">
            {row.itemCode || "—"}
          </span>
        ),
      },

      // 8. Diễn giải / Tên hàng hóa, dịch vụ
      {
        key: "description",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.description", "Diễn giải / Hàng hóa")}
            columnKey="description"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("description")}
            onSortChange={(s) => listHook.setSort("description", s)}
            searchValue={listHook.columnSearch["description"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("description", v)}
            selectedFilters={listHook.columnFilters["description"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("description", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["description"]?.length}
            align="center"
          />
        ),
        size: 260,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => (
          <TableText text={row.description || "—"} tooltip />
        ),
      },

      // 9. ĐVT
      {
        key: "unit",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.unit", "ĐVT")}
            columnKey="unit"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("unit")}
            onSortChange={(s) => listHook.setSort("unit", s)}
            searchValue={listHook.columnSearch["unit"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("unit", v)}
            selectedFilters={listHook.columnFilters["unit"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("unit", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["unit"]?.length}
            align="center"
          />
        ),
        size: 80,
        enableResizing: true,
        className: "text-center",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-center text-xs text-muted-foreground">
            {row.unit || "—"}
          </span>
        ),
      },

      // 10. Số lượng
      {
        key: "quantity",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.quantity", "Số lượng")}
            sortState={getSortState("quantity")}
            onSortChange={(s) => listHook.setSort("quantity", s)}
            searchValue={listHook.columnSearch["quantity"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("quantity", v)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            isActive={!!listHook.columnSearch["quantity"]}
            align="center"
          />
        ),
        size: 90,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums text-xs font-medium">
            {row.quantity !== null && row.quantity !== undefined
              ? Number(row.quantity).toLocaleString("vi-VN")
              : "—"}
          </span>
        ),
      },

      // 11. Đơn giá
      {
        key: "unitPrice",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.unitPrice", "Đơn giá")}
            sortState={getSortState("unitPrice")}
            onSortChange={(s) => listHook.setSort("unitPrice", s)}
            searchValue={listHook.columnSearch["unitPrice"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("unitPrice", v)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            isActive={!!listHook.columnSearch["unitPrice"]}
            align="center"
          />
        ),
        size: 110,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums text-xs">
            {row.unitPrice !== null && row.unitPrice !== undefined
              ? `${Number(row.unitPrice).toLocaleString("vi-VN")} đ`
              : "—"}
          </span>
        ),
      },

      // 12. Tiền trước thuế
      {
        key: "preVatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.preVatAmount", "Tiền trước thuế")}
            sortState={getSortState("preVatAmount")}
            onSortChange={(s) => listHook.setSort("preVatAmount", s)}
            searchValue={listHook.columnSearch["preVatAmount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("preVatAmount", v)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            isActive={!!listHook.columnSearch["preVatAmount"]}
            align="center"
          />
        ),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums font-medium text-xs">
            {Number(row.preVatAmount).toLocaleString("vi-VN")} đ
          </span>
        ),
      },

      // 13. Thuế suất VAT
      {
        key: "vatRate",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.vatRate", "Thuế suất")}
            columnKey="vatRate"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("vatRate")}
            onSortChange={(s) => listHook.setSort("vatRate", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={listHook.columnFilters["vatRate"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("vatRate", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["vatRate"]?.length}
            align="center"
          />
        ),
        size: 90,
        enableResizing: true,
        className: "text-center",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {row.vatRate ? `${row.vatRate}` : "—"}
          </span>
        ),
      },

      // 14. Tiền thuế VAT
      {
        key: "vatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.vatAmount", "Tiền thuế")}
            sortState={getSortState("vatAmount")}
            onSortChange={(s) => listHook.setSort("vatAmount", s)}
            searchValue={listHook.columnSearch["vatAmount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("vatAmount", v)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            isActive={!!listHook.columnSearch["vatAmount"]}
            align="center"
          />
        ),
        size: 120,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums text-xs">
            {Number(row.vatAmount).toLocaleString("vi-VN")} đ
          </span>
        ),
      },

      // 15. Chiết khấu
      {
        key: "discountAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.discountAmount", "Chiết khấu")}
            sortState={getSortState("discountAmount")}
            onSortChange={(s) => listHook.setSort("discountAmount", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            isActive={false}
            align="center"
          />
        ),
        size: 110,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums text-xs">
            {Number(row.discountAmount || 0) !== 0
              ? `${Number(row.discountAmount).toLocaleString("vi-VN")} đ`
              : "—"}
          </span>
        ),
      },

      // 16. Tổng tiền thanh toán
      {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.totalAmount", "Tổng tiền")}
            sortState={getSortState("totalAmount")}
            onSortChange={(s) => listHook.setSort("totalAmount", s)}
            searchValue={listHook.columnSearch["totalAmount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("totalAmount", v)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            isActive={!!listHook.columnSearch["totalAmount"]}
            align="center"
          />
        ),
        size: 135,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums font-semibold text-primary text-xs">
            {Number(row.totalAmount).toLocaleString("vi-VN")} đ
          </span>
        ),
      },

      // 17. Phân loại dòng
      {
        key: "invoiceSubcategory",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.subcategory", "Phân loại")}
            columnKey="invoiceSubcategory"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("invoiceSubcategory")}
            onSortChange={(s) => listHook.setSort("invoiceSubcategory", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={listHook.columnFilters["invoiceSubcategory"] || []}
            onFilterChange={(v) =>
              listHook.setColumnFilter("invoiceSubcategory", v)
            }
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["invoiceSubcategory"]?.length}
            align="center"
          />
        ),
        size: 110,
        enableResizing: true,
        className: "text-center",
        cell: (row: ErpInvoiceItemRow) => (
          <div className="w-full flex justify-center">
            <Badge
              variant={
                row.invoiceSubcategory === "DISCOUNT"
                  ? "destructive"
                  : row.invoiceSubcategory === "PROMOTION"
                    ? "secondary"
                    : "outline"
              }
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {row.invoiceSubcategory === "DISCOUNT"
                ? "Chiết khấu"
                : row.invoiceSubcategory === "PROMOTION"
                  ? "Khuyến mại"
                  : "Thường"}
            </Badge>
          </div>
        ),
      },

      // 18. Trạng thái HĐ
      {
        key: "status",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.status", "Trạng thái")}
            columnKey="status"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("status")}
            onSortChange={(s) => listHook.setSort("status", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={listHook.columnFilters["status"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("status", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["status"]?.length}
            align="center"
          />
        ),
        size: 110,
        enableResizing: true,
        className: "text-center",
        cell: (row: ErpInvoiceItemRow) => (
          <div className="w-full flex justify-center">
            <Badge
              variant={
                row.status === "CONFIRMED"
                  ? "default"
                  : row.status === "DRAFT"
                    ? "secondary"
                    : "destructive"
              }
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {row.status === "CONFIRMED"
                ? "Đã duyệt"
                : row.status === "DRAFT"
                  ? "Nháp"
                  : "Đã hủy"}
            </Badge>
          </div>
        ),
      },

      // 19. Ghi sổ
      {
        key: "postingStatus",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.postingStatus", "Ghi sổ")}
            columnKey="postingStatus"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("postingStatus")}
            onSortChange={(s) => listHook.setSort("postingStatus", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={listHook.columnFilters["postingStatus"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("postingStatus", v)}
            fetchOptions={fetchColumnOptions}
            isActive={!!listHook.columnFilters["postingStatus"]?.length}
            align="center"
          />
        ),
        size: 100,
        enableResizing: true,
        className: "text-center",
        cell: (row: ErpInvoiceItemRow) => (
          <div className="w-full flex justify-center">
            <Badge
              variant={row.postingStatus === "POSTED" ? "default" : "outline"}
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {row.postingStatus === "POSTED" ? "Đã ghi sổ" : "Chưa ghi sổ"}
            </Badge>
          </div>
        ),
      },
    ],
    [
      listHook.page,
      listHook.pageSize,
      listHook.sorts,
      listHook.columnFilters,
      listHook.columnSearch,
      listHook.dateFrom,
      listHook.dateTo,
      direction,
      t,
      getSortState,
      fetchColumnOptions,
      handleOpenInternal,
    ],
  );
}

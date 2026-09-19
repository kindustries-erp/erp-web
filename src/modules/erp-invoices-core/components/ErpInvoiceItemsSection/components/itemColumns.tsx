import React, { useMemo } from "react";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import type { TFunction } from "i18next";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { CopyButton } from "@/shared/components/CopyButton";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { ErpInvoiceItemRow } from "../../../api/erpInvoicesCoreApi";
import type { useErpInvoiceItemsList } from "../../../hooks/useErpInvoiceItemsList";
import { formatAmtOption } from "../../ErpInvoicesTab/utils";
import { TaxInvoiceStatusBadge } from "../../ErpInvoicesTab/components/cells/InvoiceStatusBadge";

export const formatQtyOption = (val: string | number) => {
  const n = Number(val || 0);
  if (isNaN(n)) return String(val);
  return n.toLocaleString("vi-VN");
};

export const formatVatRate = (val?: number | string | null): string => {
  if (val == null || val === "") return "—";
  const num = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(num)) return String(val);
  const rate = Math.abs(num) <= 1 ? Math.round(num * 10000) / 100 : num;
  return `${rate}%`;
};

const formatDateCell = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.slice(0, 10).split("-");
    return `${d}-${m}-${y}`;
  }
  try {
    return format(new Date(dateStr), "dd-MM-yyyy");
  } catch {
    return dateStr;
  }
};

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
  branches?: { label: string; value: string }[];
}

export function useItemColumns({
  direction,
  t,
  listHook,
  getSortState,
  fetchColumnOptions,
  handleOpenInternal,
  branches = [],
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
            {idx}
          </span>
        ),
      },

      // 2. Ngày HĐ (100px, nằm bên trái cột Số HĐ giống tab Hóa đơn)
      {
        key: "invoiceDate",
        className: "text-center",
        headerClassName: "text-center",
        header: (
          <TableColumnHeaderFilter
            title={t("invoiceDate", "Ngày HĐ")}
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
        size: 100,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => (
          <span className="text-center w-full block text-xs">
            {formatDateCell(row.invoiceDate)}
          </span>
        ),
      },

      // 3. Cột Số HĐ + Ký hiệu (120px cho Bán ra, 180px cho Mua vào)
      {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title={t("invoiceNo", "Số / Ký hiệu HĐ")}
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
            enableSelectAllMatching={true}
            showBlankOption={true}
            isActive={
              !!listHook.columnFilters["invoiceNo"]?.length ||
              !!listHook.columnSearch["invoiceNo"]
            }
            align="center"
          />
        ),
        size: direction === "OUT" ? 120 : 180,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => {
          const invoiceNo = row.invoiceNo?.trim() || "";
          const serialNo = row.serialNo?.trim() || "";

          if (!invoiceNo && !serialNo) {
            return <span className="text-muted-foreground">—</span>;
          }

          const handleOpenDetail = (e: React.MouseEvent) => {
            e.stopPropagation();
            handleOpenInternal(
              {
                id: row.invoiceId,
                invoiceNo: row.invoiceNo,
                serialNo: row.serialNo,
              },
              "view",
            );
          };

          return (
            <div className="flex items-center gap-1.5 w-full min-w-0 py-0.5 leading-none">
              <Tooltip content="Xem chi tiết hóa đơn">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-transparent hover:text-primary transition-all focus:ring-0 focus-visible:ring-0 focus:outline-none"
                  onClick={handleOpenDetail}
                  aria-label="Xem chi tiết hóa đơn"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>

              <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
                <div className="flex items-center gap-1 min-w-0 group/invno">
                  <Tooltip content={invoiceNo ? `Số HĐ: ${invoiceNo}` : "—"}>
                    <span
                      className="truncate text-[11px] font-semibold text-primary leading-tight select-text cursor-pointer hover:underline"
                      onClick={handleOpenDetail}
                    >
                      {invoiceNo || "—"}
                    </span>
                  </Tooltip>
                  {invoiceNo && (
                    <CopyButton
                      value={invoiceNo}
                      tooltip="Copy Số HĐ"
                      copiedTooltip="Đã copy"
                      toastMessage="Đã copy Số HĐ"
                      toastId="item-invoice-no-copy"
                      iconClassName="w-2.5 h-2.5"
                      className="h-3.5 w-3.5 p-0 opacity-0 group-hover/invno:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    />
                  )}
                </div>

                {serialNo && (
                  <div className="flex items-center gap-1 min-w-0 group/serial">
                    <Tooltip content={`Ký hiệu: ${serialNo}`}>
                      <span className="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text">
                        {serialNo}
                      </span>
                    </Tooltip>
                    <CopyButton
                      value={serialNo}
                      tooltip="Copy Ký hiệu"
                      copiedTooltip="Đã copy"
                      toastMessage="Đã copy Ký hiệu HĐ"
                      toastId="item-invoice-serial-copy"
                      iconClassName="w-2.5 h-2.5"
                      className="h-3 w-3 p-0 opacity-0 group-hover/serial:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        },
      },

      // 4. Đối tác + MST (250px, gom 2 dòng giống tab Hóa đơn)
      {
        key: "partner",
        header: (
          <TableColumnHeaderFilter
            title={
              direction === "IN"
                ? t("seller", "Bên bán / MST")
                : t("buyer", "Bên mua / MST")
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
            enableSelectAllMatching={true}
            showBlankOption={true}
            isActive={
              !!listHook.columnFilters["partner"]?.length ||
              !!listHook.columnSearch["partner"]
            }
            align="center"
          />
        ),
        size: 250,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => {
          const partnerName =
            direction === "OUT"
              ? row.buyerName?.trim() || row.buyerPersonalName?.trim() || ""
              : row.sellerName?.trim() || "";
          const taxCode =
            direction === "OUT"
              ? row.buyerTaxCode?.trim() || row.buyerCccd?.trim()
              : row.sellerTaxCode?.trim();
          const taxPrefix =
            direction === "OUT" && row.buyerCccd ? "CCCD: " : "MST: ";

          if (!partnerName && !taxCode) {
            return <span className="text-muted-foreground">—</span>;
          }

          return (
            <div className="flex items-center gap-1.5 w-full min-w-0 py-0.5 leading-none">
              <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
                <div className="flex items-center gap-1 min-w-0 group/pname">
                  <Tooltip content={partnerName || "—"}>
                    <span className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight select-text">
                      {partnerName || "—"}
                    </span>
                  </Tooltip>
                  {partnerName && partnerName !== "—" && (
                    <CopyButton
                      value={partnerName}
                      tooltip="Copy tên"
                      copiedTooltip="Đã copy"
                      toastMessage="Đã copy tên đối tác"
                      toastId="item-partner-name-copy"
                      iconClassName="w-2.5 h-2.5"
                      className="h-3.5 w-3.5 p-0 opacity-0 group-hover/pname:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    />
                  )}
                </div>
                {taxCode && (
                  <div className="flex items-center gap-1 min-w-0 group/tax">
                    <Tooltip content={`${taxPrefix}${taxCode}`}>
                      <span className="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text">
                        <span className="text-slate-400 font-sans mr-0.5">
                          {taxPrefix}
                        </span>
                        {taxCode}
                      </span>
                    </Tooltip>
                    <CopyButton
                      value={taxCode}
                      tooltip="Copy MST"
                      copiedTooltip="Đã copy"
                      toastMessage="Đã copy MST"
                      toastId="item-partner-tax-copy"
                      iconClassName="w-2.5 h-2.5"
                      className="h-3 w-3 p-0 opacity-0 group-hover/tax:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        },
      },

      // 5. Mã hàng / SKU (130px)
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
            enableSelectAllMatching={true}
            showBlankOption={true}
            isActive={
              !!listHook.columnFilters["itemCode"]?.length ||
              !!listHook.columnSearch["itemCode"]
            }
            align="center"
          />
        ),
        size: 130,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => (
          <span className="font-mono text-xs font-medium">
            {row.itemCode || "—"}
          </span>
        ),
      },

      // 6. Diễn giải / Tên hàng hóa, dịch vụ (250px)
      {
        key: "description",
        header: (
          <TableColumnHeaderFilter
            title={t("description", "Diễn giải")}
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
            enableSelectAllMatching={true}
            showBlankOption={true}
            isActive={
              !!listHook.columnFilters["description"]?.length ||
              !!listHook.columnSearch["description"]
            }
            align="center"
          />
        ),
        size: 250,
        enableResizing: true,
        cell: (row: ErpInvoiceItemRow) => (
          <TableText text={row.description || "—"} tooltip />
        ),
      },

      // 7. ĐVT (80px)
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
            enableSelectAllMatching={true}
            showBlankOption={true}
            isActive={
              !!listHook.columnFilters["unit"]?.length ||
              !!listHook.columnSearch["unit"]
            }
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

      // 8. Số lượng (90px)
      {
        key: "quantity",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.quantity", "Số lượng")}
            columnKey="quantity"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("quantity")}
            onSortChange={(s) => listHook.setSort("quantity", s)}
            searchValue={listHook.columnSearch["quantity"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("quantity", v)}
            selectedFilters={listHook.columnFilters["quantity"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("quantity", v)}
            fetchOptions={fetchColumnOptions}
            formatOptionLabel={formatQtyOption}
            enableSelectAllMatching={true}
            isActive={
              !!listHook.columnFilters["quantity"]?.length ||
              !!listHook.columnSearch["quantity"]
            }
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

      // 9. Đơn giá (110px)
      {
        key: "unitPrice",
        header: (
          <TableColumnHeaderFilter
            title={t("columns.unitPrice", "Đơn giá")}
            columnKey="unitPrice"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("unitPrice")}
            onSortChange={(s) => listHook.setSort("unitPrice", s)}
            searchValue={listHook.columnSearch["unitPrice"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("unitPrice", v)}
            selectedFilters={listHook.columnFilters["unitPrice"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("unitPrice", v)}
            fetchOptions={fetchColumnOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
            isActive={
              !!listHook.columnFilters["unitPrice"]?.length ||
              !!listHook.columnSearch["unitPrice"]
            }
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

      // 10. Trước GTGT (160px)
      {
        key: "preVatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("preVatAmount", "Trước GTGT")}
            columnKey="preVatAmount"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("preVatAmount")}
            onSortChange={(s) => listHook.setSort("preVatAmount", s)}
            searchValue={listHook.columnSearch["preVatAmount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("preVatAmount", v)}
            selectedFilters={listHook.columnFilters["preVatAmount"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("preVatAmount", v)}
            fetchOptions={fetchColumnOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
            isActive={
              !!listHook.columnFilters["preVatAmount"]?.length ||
              !!listHook.columnSearch["preVatAmount"]
            }
            align="center"
          />
        ),
        size: 160,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums font-medium text-xs">
            {Number(row.preVatAmount).toLocaleString("vi-VN")} đ
          </span>
        ),
      },

      // 11. Tiền thuế VAT (160px)
      {
        key: "vatAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("vatAmount", "Thuế GTGT")}
            columnKey="vatAmount"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("vatAmount")}
            onSortChange={(s) => listHook.setSort("vatAmount", s)}
            searchValue={listHook.columnSearch["vatAmount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("vatAmount", v)}
            selectedFilters={listHook.columnFilters["vatAmount"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("vatAmount", v)}
            fetchOptions={fetchColumnOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
            isActive={
              !!listHook.columnFilters["vatAmount"]?.length ||
              !!listHook.columnSearch["vatAmount"]
            }
            align="center"
          />
        ),
        size: 160,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums text-xs">
            {Number(row.vatAmount).toLocaleString("vi-VN")} đ
          </span>
        ),
      },

      // 12. Chiết khấu (160px)
      {
        key: "discountAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("discountAmount", "Chiết khấu")}
            columnKey="discountAmount"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("discountAmount")}
            onSortChange={(s) => listHook.setSort("discountAmount", s)}
            searchValue={listHook.columnSearch["discountAmount"] || ""}
            onSearchChange={(v) =>
              listHook.setColumnSearch("discountAmount", v)
            }
            selectedFilters={listHook.columnFilters["discountAmount"] || []}
            onFilterChange={(v) =>
              listHook.setColumnFilter("discountAmount", v)
            }
            fetchOptions={fetchColumnOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
            showBlankOption={true}
            isActive={
              !!listHook.columnFilters["discountAmount"]?.length ||
              !!listHook.columnSearch["discountAmount"]
            }
            align="center"
          />
        ),
        size: 160,
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

      // 13. Thuế suất VAT (110px, formatted xx%, nằm bên phải cột Chiết khấu)
      {
        key: "vatRate",
        header: (
          <TableColumnHeaderFilter
            title={t("vatRate", "Thuế suất GTGT")}
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
            formatOptionLabel={formatVatRate}
            enableSelectAllMatching={true}
            showBlankOption={true}
            isActive={!!listHook.columnFilters["vatRate"]?.length}
            align="center"
          />
        ),
        size: 110,
        enableResizing: true,
        className: "text-center",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {formatVatRate(row.vatRate)}
          </span>
        ),
      },

      // 14. Tổng tiền thanh toán (160px)
      {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("totalAmount", "Thành tiền")}
            columnKey="totalAmount"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("totalAmount")}
            onSortChange={(s) => listHook.setSort("totalAmount", s)}
            searchValue={listHook.columnSearch["totalAmount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("totalAmount", v)}
            selectedFilters={listHook.columnFilters["totalAmount"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("totalAmount", v)}
            fetchOptions={fetchColumnOptions}
            formatOptionLabel={formatAmtOption}
            enableSelectAllMatching={true}
            isActive={
              !!listHook.columnFilters["totalAmount"]?.length ||
              !!listHook.columnSearch["totalAmount"]
            }
            align="center"
          />
        ),
        size: 160,
        enableResizing: true,
        className: "text-right",
        cell: (row: ErpInvoiceItemRow) => (
          <span className="w-full block text-right tabular-nums font-semibold text-primary text-xs">
            {Number(row.totalAmount).toLocaleString("vi-VN")} đ
          </span>
        ),
      },

      // 15. Trạng thái (GDT) (150px)
      {
        key: "taxInvoiceStatus",
        header: (
          <TableColumnHeaderFilter
            title={t("taxInvoiceStatus", "Trạng thái (GDT)")}
            columnKey="taxInvoiceStatus"
            queryKeyPrefix={`invoice-item-options-${direction}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("taxInvoiceStatus")}
            onSortChange={(s) => listHook.setSort("taxInvoiceStatus", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={listHook.columnFilters["taxInvoiceStatus"] || []}
            onFilterChange={(v) =>
              listHook.setColumnFilter("taxInvoiceStatus", v)
            }
            filterOptions={[
              { label: "Mới", value: "1" },
              { label: "Thay thế", value: "2" },
              { label: "Điều chỉnh", value: "3" },
              { label: "Bị thay thế", value: "4" },
              { label: "Bị điều chỉnh", value: "5" },
              { label: "Bị hủy", value: "6" },
            ]}
            isActive={!!listHook.columnFilters["taxInvoiceStatus"]?.length}
            align="center"
          />
        ),
        size: 150,
        enableResizing: true,
        className: "text-center",
        cell: (row: ErpInvoiceItemRow) => (
          <div className="w-full flex justify-center">
            <TaxInvoiceStatusBadge status={row.taxInvoiceStatus} />
          </div>
        ),
      },

      // 16. Chi nhánh (120px)
      {
        key: "branchId",
        header: (
          <TableColumnHeaderFilter
            title={t("branch", "Chi nhánh")}
            columnKey="branchId"
            queryKeyPrefix={`invoice-item-options-branch-${branches.length}`}
            allFilters={listHook.columnFilters}
            sortState={getSortState("branchId")}
            onSortChange={(s) => listHook.setSort("branchId", s)}
            searchValue={listHook.columnSearch["branchId"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("branchId", v)}
            selectedFilters={listHook.columnFilters["branchId"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("branchId", v)}
            fetchOptions={async ({ search }: { search: string }) => {
              const options = branches.map((b) => {
                const parts = b.label.split(" — ");
                const label = parts.length > 1 ? parts[1] : b.label;
                return { label, value: b.value };
              });
              const filtered = options.filter((o) =>
                o.label.toLowerCase().includes(search.toLowerCase()),
              );
              return { items: filtered, total: filtered.length, next: null };
            }}
            showBlankOption={true}
            enableSelectAllMatching={true}
            isActive={
              !!listHook.columnFilters["branchId"]?.length ||
              !!listHook.columnSearch["branchId"]
            }
            align="center"
          />
        ),
        size: 120,
        enableResizing: true,
        className: "text-center text-xs",
        cell: (row: ErpInvoiceItemRow) => {
          if (row.branchName) return row.branchName;
          if (!row.branchId) return "—";
          const branch = branches.find((b) => b.value === row.branchId);
          if (!branch) return row.branchId;
          const parts = branch.label.split(" — ");
          return parts.length > 1 ? parts[1] : branch.label;
        },
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
      branches,
      getSortState,
      fetchColumnOptions,
      handleOpenInternal,
    ],
  );
}

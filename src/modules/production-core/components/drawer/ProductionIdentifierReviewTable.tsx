import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Sparkles,
  FileSpreadsheet,
  Download,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Popover } from "@/core/components/ui/Popover";
import { cn } from "@/shared/utils";
import { DrawerSection, inputCls } from "@/shared/components/DrawerModal";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import {
  DataTable,
  createColumnHeaderFilter,
  filterClientItems,
  getDefaultPageSize,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { ProductionIdentifierExcelImportModal } from "./ProductionIdentifierExcelImportModal";

export interface ProductionIdentifier {
  id?: string;
  vinNo: string;
  engineNo: string;
  serialNo: string; // Số serial xe (Optional - theo tem xe)
  internalSerialNo: string; // Số serial nội bộ quản lý ERP (Tự động sinh)
  lotNo: string;
  notes: string;
  attributes: Array<{ key: string; value: string }>;
  isExisting?: boolean; // Xe đã được ghi nhận xuất xưởng trước đó
  originalVinNo?: string;
  originalEngineNo?: string;
  originalSerialNo?: string;
  originalInternalSerialNo?: string;
  originalNotes?: string;
}

export interface ProductionIdentifierRowItem extends ProductionIdentifier {
  id: string;
  originalIndex: number;
  isValid: boolean;
  status: "COMPLETED" | "READY" | "PENDING";
  statusText: string;
  hasDuplicate: boolean;
  isVinDupe: boolean;
  isEngDupe: boolean;
  isSerDupe: boolean;
  isISerDupe: boolean;
  isExistingClearedVin?: boolean;
  isExistingClearedEng?: boolean;
  isExistingClearedSer?: boolean;
  isExistingClearedISer?: boolean;
  isIncompleteNewVin?: boolean;
  isIncompleteNewEng?: boolean;
  isIncompleteNewSer?: boolean;
  isIncompleteNewISer?: boolean;
}

export type TrackingPolicy = "NONE" | "SERIAL" | "LOT" | "VEHICLE" | "CUSTOM";

/** Sinh mã serial nội bộ ngẫu nhiên/tuần tự theo SKU, ngày tháng (YYMMDD), mã Lệnh SX (orderSuffix) và STT */
export function generateInternalSerial(
  skuPrefix: string = "FG",
  index: number = 1,
  orderSuffix: string = "",
): string {
  const cleanSku = (skuPrefix || "ITEM").replace(/[^a-zA-Z0-9_-]/g, "");
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yy}${mm}${dd}`;

  const cleanOrder = orderSuffix
    ? orderSuffix.replace(/[^a-zA-Z0-9]/g, "").slice(-4)
    : "";
  const padIndex = String(index).padStart(3, "0");

  if (cleanOrder) {
    return `SN-${cleanSku}-${dateStr}-${cleanOrder}-${padIndex}`;
  }
  return `SN-${cleanSku}-${dateStr}-${padIndex}`;
}

export function emptyIdentifier(
  defaultInternalSerial: string = "",
  isExisting: boolean = false,
): ProductionIdentifier {
  return {
    vinNo: "",
    engineNo: "",
    serialNo: "",
    internalSerialNo: defaultInternalSerial,
    lotNo: "",
    notes: "",
    attributes: [],
    isExisting,
  };
}

export function makeIdentifierRows(
  qty: number,
  skuPrefix: string = "FG",
  orderSuffix: string = "",
): ProductionIdentifier[] {
  const length = Math.max(1, Math.floor(qty));
  return Array.from({ length }, (_, i) =>
    emptyIdentifier(
      generateInternalSerial(skuPrefix, i + 1, orderSuffix),
      false,
    ),
  );
}

export function isIdentifierValid(
  id: ProductionIdentifier,
  policy: TrackingPolicy,
): boolean {
  if (policy === "VEHICLE") {
    return (
      !!id.vinNo?.trim() &&
      !!id.engineNo?.trim() &&
      !!id.serialNo?.trim() &&
      !!id.internalSerialNo?.trim()
    );
  }
  if (policy === "SERIAL") {
    return !!id.serialNo?.trim() || !!id.internalSerialNo?.trim();
  }
  if (policy === "LOT") {
    return !!id.lotNo?.trim();
  }
  return true;
}

export function identifiersAllValid(
  ids: ProductionIdentifier[],
  policy: TrackingPolicy,
): boolean {
  if (policy === "NONE") return true;
  return ids.length > 0 && ids.every((id) => isIdentifierValid(id, policy));
}

export function findVehicleDuplicate(
  ids: ProductionIdentifier[],
): string | null {
  const vins = new Set<string>();
  const engines = new Set<string>();
  const serials = new Set<string>();
  const internalSerials = new Set<string>();

  for (const id of ids) {
    const vin = id.vinNo?.trim().toUpperCase();
    if (vin) {
      if (vins.has(vin)) return "Số khung (VIN) bị trùng trong danh sách";
      vins.add(vin);
    }

    const eng = id.engineNo?.trim().toUpperCase();
    if (eng) {
      if (engines.has(eng)) return "Số máy bị trùng trong danh sách";
      engines.add(eng);
    }

    const ser = id.serialNo?.trim().toUpperCase();
    if (ser) {
      if (serials.has(ser)) return "Số Serial xe bị trùng trong danh sách";
      serials.add(ser);
    }

    const iser = id.internalSerialNo?.trim().toUpperCase();
    if (iser) {
      if (internalSerials.has(iser))
        return "Số Serial nội bộ bị trùng trong danh sách";
      internalSerials.add(iser);
    }
  }
  return null;
}

interface EditableCellProps {
  value: string;
  hasError?: boolean;
  errorMessage?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (val: string) => void;
  className?: string;
}

function EditableCell({
  value,
  hasError,
  errorMessage,
  placeholder,
  disabled,
  onChange,
  className,
}: EditableCellProps) {
  const [localVal, setLocalVal] = useState(value || "");

  useEffect(() => {
    setLocalVal(value || "");
  }, [value]);

  const handleBlur = () => {
    if (localVal !== value) {
      onChange(localVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="w-full relative group">
      <input
        type="text"
        disabled={disabled}
        value={localVal}
        placeholder={placeholder}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          inputCls,
          "h-7 text-xs font-mono font-medium transition-all w-full",
          "focus:ring-1 focus:ring-primary/40 focus:border-primary/60",
          hasError
            ? "border-destructive bg-destructive/5 text-destructive focus:ring-destructive/30"
            : "border-transparent bg-transparent hover:border-border hover:bg-surface focus:bg-surface focus:border-border",
          disabled && "opacity-60 cursor-not-allowed bg-muted/40",
          className,
        )}
      />
      {hasError && errorMessage && (
        <span className="hidden group-hover:block absolute left-1 -bottom-5 z-30 bg-destructive text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

interface ProductionIdentifierReviewTableProps {
  policy: TrackingPolicy;
  identifiers: ProductionIdentifier[];
  onChange: (index: number, updated: ProductionIdentifier) => void;
  onSetIdentifiers: (updated: ProductionIdentifier[]) => void;
  disabled?: boolean;
  skuPrefix?: string;
  orderSuffix?: string;
  requiredQty?: number;
  itemName?: string;
}

export function ProductionIdentifierReviewTable({
  policy,
  identifiers,
  onChange,
  onSetIdentifiers,
  disabled = false,
  skuPrefix = "FG",
  orderSuffix = "",
}: ProductionIdentifierReviewTableProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);

  // Table Column State & Pagination
  const tableId = "production-identifier-declare-table";
  const tableState = useTableColumnState(tableId);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);

  // Popover state for internal serial generation
  const unproducedRows = useMemo(
    () => identifiers.filter((r) => !r.isExisting),
    [identifiers],
  );
  const remainingUnproducedCount = unproducedRows.length;
  const [genPopoverOpen, setGenPopoverOpen] = useState(false);
  const [genCount, setGenCount] = useState<number>(
    remainingUnproducedCount > 0 ? remainingUnproducedCount : 1,
  );

  useEffect(() => {
    if (remainingUnproducedCount > 0) {
      setGenCount(remainingUnproducedCount);
    }
  }, [remainingUnproducedCount]);

  // Excel Modal state
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  // Pre-calculate duplicate sets for high-performance cell validation
  const duplicates = useMemo(() => {
    const vinCounts = new Map<string, number>();
    const engCounts = new Map<string, number>();
    const serCounts = new Map<string, number>();
    const iSerCounts = new Map<string, number>();

    identifiers.forEach((id) => {
      const vin = id.vinNo?.trim().toUpperCase();
      if (vin) vinCounts.set(vin, (vinCounts.get(vin) || 0) + 1);

      const eng = id.engineNo?.trim().toUpperCase();
      if (eng) engCounts.set(eng, (engCounts.get(eng) || 0) + 1);

      const ser = id.serialNo?.trim().toUpperCase();
      if (ser) serCounts.set(ser, (serCounts.get(ser) || 0) + 1);

      const iSer = id.internalSerialNo?.trim().toUpperCase();
      if (iSer) iSerCounts.set(iSer, (iSerCounts.get(iSer) || 0) + 1);
    });

    const getDupes = (map: Map<string, number>) => {
      const s = new Set<string>();
      map.forEach((count, key) => {
        if (count > 1) s.add(key);
      });
      return s;
    };

    return {
      vins: getDupes(vinCounts),
      engines: getDupes(engCounts),
      serials: getDupes(serCounts),
      internalSerials: getDupes(iSerCounts),
    };
  }, [identifiers]);

  // Indexed rows for filtering, validation & accurate original indexing
  const indexedRows = useMemo<ProductionIdentifierRowItem[]>(() => {
    return identifiers.map((row, originalIndex) => {
      const vinUpper = row.vinNo?.trim().toUpperCase();
      const engUpper = row.engineNo?.trim().toUpperCase();
      const serUpper = row.serialNo?.trim().toUpperCase();
      const iSerUpper = row.internalSerialNo?.trim().toUpperCase();

      const isVinDupe = !!(vinUpper && duplicates.vins.has(vinUpper));
      const isEngDupe = !!(engUpper && duplicates.engines.has(engUpper));
      const isSerDupe = !!(serUpper && duplicates.serials.has(serUpper));
      const isISerDupe = !!(
        iSerUpper && duplicates.internalSerials.has(iSerUpper)
      );
      const hasDuplicate = isVinDupe || isEngDupe || isSerDupe || isISerDupe;

      const isValid = isIdentifierValid(row, policy);

      const isExisting = !!row.isExisting;
      const isExistingClearedVin = isExisting && !row.vinNo?.trim();
      const isExistingClearedEng = isExisting && !row.engineNo?.trim();
      const isExistingClearedSer = isExisting && !row.serialNo?.trim();
      const isExistingClearedISer = isExisting && !row.internalSerialNo?.trim();

      const isIncompleteNewVin =
        !isExisting &&
        !row.vinNo?.trim() &&
        (!!row.engineNo?.trim() ||
          !!row.serialNo?.trim() ||
          !!row.internalSerialNo?.trim());
      const isIncompleteNewEng =
        !isExisting &&
        !row.engineNo?.trim() &&
        (!!row.vinNo?.trim() ||
          !!row.serialNo?.trim() ||
          !!row.internalSerialNo?.trim());
      const isIncompleteNewSer =
        !isExisting &&
        !row.serialNo?.trim() &&
        (!!row.vinNo?.trim() ||
          !!row.engineNo?.trim() ||
          !!row.internalSerialNo?.trim());
      const isIncompleteNewISer =
        !isExisting &&
        !row.internalSerialNo?.trim() &&
        (!!row.vinNo?.trim() ||
          !!row.engineNo?.trim() ||
          !!row.serialNo?.trim());

      const status: "COMPLETED" | "READY" | "PENDING" = isExisting
        ? "COMPLETED"
        : isValid
          ? "READY"
          : "PENDING";

      const statusText = isExisting
        ? t("Đã xuất xưởng")
        : isValid
          ? t("Sẵn sàng")
          : t("Chưa khai báo");

      return {
        ...row,
        id: row.id || `row-${originalIndex}`,
        originalIndex,
        isValid,
        status,
        statusText,
        hasDuplicate,
        isVinDupe,
        isEngDupe,
        isSerDupe,
        isISerDupe,
        isExistingClearedVin,
        isExistingClearedEng,
        isExistingClearedSer,
        isExistingClearedISer,
        isIncompleteNewVin,
        isIncompleteNewEng,
        isIncompleteNewSer,
        isIncompleteNewISer,
      };
    });
  }, [identifiers, policy, duplicates, t]);

  const completedCount = useMemo(
    () => indexedRows.filter((r) => r.isValid).length,
    [indexedRows],
  );

  // Universal Client-side Filtering & Sorting via filterClientItems
  const filteredRows = useMemo(
    () => filterClientItems(indexedRows, tableState),
    [indexedRows, tableState],
  );

  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Handle individual cell editing
  const handleCellEdit = useCallback(
    (
      originalIndex: number,
      field: keyof ProductionIdentifier,
      value: string,
    ) => {
      const currentRow = identifiers[originalIndex];
      if (!currentRow) return;
      const updated: ProductionIdentifier = {
        ...currentRow,
        [field]: value,
      };
      if (
        policy === "SERIAL" &&
        (field === "internalSerialNo" || field === "serialNo")
      ) {
        updated.internalSerialNo = value;
        updated.serialNo = value;
      }
      onChange(originalIndex, updated);
    },
    [identifiers, policy, onChange],
  );

  // 1-line Column Header Filter Builder (Client-side auto extract options)
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: indexedRows,
        defaultAlign: "center",
      }),
    [tableState, indexedRows],
  );

  // Columns definition following /standardize-table
  const columns = useMemo<
    DataTableColumn<ProductionIdentifierRowItem>[]
  >(() => {
    const cols: DataTableColumn<ProductionIdentifierRowItem>[] = [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center font-mono text-muted-foreground text-xs">
            {idx}
          </span>
        ),
      },
      {
        key: "status",
        header: headerFilter("status", t("Trạng thái")),
        size: 135,
        enableResizing: true,
        cell: (row: ProductionIdentifierRowItem) => {
          if (row.status === "COMPLETED") {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{t("Đã xuất xưởng")}</span>
              </span>
            );
          }
          if (row.status === "READY") {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                <Sparkles className="w-3 h-3 text-primary shrink-0" />
                <span>{t("Sẵn sàng")}</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border whitespace-nowrap">
              <span>{t("Chưa khai báo")}</span>
            </span>
          );
        },
      },
    ];

    if (policy === "VEHICLE") {
      cols.push(
        {
          key: "vinNo",
          header: headerFilter("vinNo", t("Số khung (VIN) *")),
          size: 185,
          enableResizing: true,
          cell: (row: ProductionIdentifierRowItem) => {
            const hasError =
              row.isVinDupe ||
              row.isExistingClearedVin ||
              row.isIncompleteNewVin ||
              (!row.isExisting && !row.vinNo?.trim());
            const errorMessage = row.isVinDupe
              ? t("Trùng lặp trong danh sách")
              : row.isExistingClearedVin
                ? t("Xe đã ghi nhận không được để trống Số khung")
                : !row.vinNo?.trim()
                  ? t("Thiếu Số khung")
                  : undefined;

            return (
              <EditableCell
                value={row.vinNo}
                hasError={hasError}
                errorMessage={errorMessage}
                placeholder={t("Nhập số VIN...")}
                disabled={disabled}
                onChange={(val) =>
                  handleCellEdit(row.originalIndex, "vinNo", val)
                }
              />
            );
          },
        },
        {
          key: "engineNo",
          header: headerFilter("engineNo", t("Số máy *")),
          size: 175,
          enableResizing: true,
          cell: (row: ProductionIdentifierRowItem) => {
            const hasError =
              row.isEngDupe ||
              row.isExistingClearedEng ||
              row.isIncompleteNewEng ||
              (!row.isExisting && !row.engineNo?.trim());
            const errorMessage = row.isEngDupe
              ? t("Trùng lặp trong danh sách")
              : row.isExistingClearedEng
                ? t("Xe đã ghi nhận không được để trống Số máy")
                : !row.engineNo?.trim()
                  ? t("Thiếu Số máy")
                  : undefined;

            return (
              <EditableCell
                value={row.engineNo}
                hasError={hasError}
                errorMessage={errorMessage}
                placeholder={t("Nhập số máy...")}
                disabled={disabled}
                onChange={(val) =>
                  handleCellEdit(row.originalIndex, "engineNo", val)
                }
              />
            );
          },
        },
        {
          key: "serialNo",
          header: headerFilter("serialNo", t("Số Serial xe *")),
          size: 165,
          enableResizing: true,
          cell: (row: ProductionIdentifierRowItem) => {
            const hasError =
              row.isSerDupe ||
              row.isExistingClearedSer ||
              row.isIncompleteNewSer ||
              (!row.isExisting && !row.serialNo?.trim());
            const errorMessage = row.isSerDupe
              ? t("Trùng lặp số Serial")
              : !row.serialNo?.trim()
                ? t("Thiếu Số Serial xe")
                : undefined;

            return (
              <EditableCell
                value={row.serialNo}
                hasError={hasError}
                errorMessage={errorMessage}
                placeholder={t("Theo tem xe...")}
                disabled={disabled}
                onChange={(val) =>
                  handleCellEdit(row.originalIndex, "serialNo", val)
                }
              />
            );
          },
        },
        {
          key: "internalSerialNo",
          header: headerFilter("internalSerialNo", t("Số Serial nội bộ *")),
          size: 215,
          enableResizing: true,
          cell: (row: ProductionIdentifierRowItem) => {
            const hasError =
              row.isISerDupe ||
              row.isExistingClearedISer ||
              row.isIncompleteNewISer ||
              (!row.isExisting && !row.internalSerialNo?.trim());
            const errorMessage = row.isISerDupe
              ? t("Trùng lặp Serial nội bộ")
              : !row.internalSerialNo?.trim()
                ? t("Thiếu Serial nội bộ")
                : undefined;

            return (
              <EditableCell
                value={row.internalSerialNo}
                hasError={hasError}
                errorMessage={errorMessage}
                placeholder={t("Tự động sinh hoặc nhập...")}
                disabled={disabled}
                onChange={(val) =>
                  handleCellEdit(row.originalIndex, "internalSerialNo", val)
                }
              />
            );
          },
        },
      );
    } else if (policy === "SERIAL") {
      cols.push(
        {
          key: "serialNo",
          header: headerFilter("serialNo", t("Số Serial (*)")),
          size: 240,
          enableResizing: true,
          cell: (row: ProductionIdentifierRowItem) => (
            <EditableCell
              value={row.serialNo || row.internalSerialNo}
              hasError={row.isSerDupe || (!row.isExisting && !row.isValid)}
              errorMessage={
                row.isSerDupe ? t("Trùng lặp Số Serial") : t("Thiếu Số Serial")
              }
              placeholder={t("Nhập số Serial...")}
              disabled={disabled}
              onChange={(val) =>
                handleCellEdit(row.originalIndex, "serialNo", val)
              }
            />
          ),
        },
        {
          key: "internalSerialNo",
          header: headerFilter("internalSerialNo", t("Số Serial nội bộ")),
          size: 220,
          enableResizing: true,
          cell: (row: ProductionIdentifierRowItem) => (
            <EditableCell
              value={row.internalSerialNo}
              placeholder={t("Tự động sinh...")}
              disabled={disabled}
              onChange={(val) =>
                handleCellEdit(row.originalIndex, "internalSerialNo", val)
              }
            />
          ),
        },
      );
    } else if (policy === "LOT") {
      cols.push({
        key: "lotNo",
        header: headerFilter("lotNo", t("Số Lô (*)")),
        size: 220,
        enableResizing: true,
        cell: (row: ProductionIdentifierRowItem) => (
          <EditableCell
            value={row.lotNo}
            hasError={!row.isExisting && !row.isValid}
            errorMessage={t("Thiếu Số Lô")}
            placeholder={t("Nhập số Lô...")}
            disabled={disabled}
            onChange={(val) => handleCellEdit(row.originalIndex, "lotNo", val)}
          />
        ),
      });
    }

    cols.push({
      key: "notes",
      header: headerFilter("notes", t("Ghi chú")),
      size: 190,
      enableResizing: true,
      cell: (row: ProductionIdentifierRowItem) => (
        <EditableCell
          value={row.notes}
          placeholder={t("Ghi chú đơn vị...")}
          disabled={disabled}
          onChange={(val) => handleCellEdit(row.originalIndex, "notes", val)}
        />
      ),
    });

    return cols;
  }, [policy, headerFilter, t, disabled, handleCellEdit]);

  // Handle Confirmed Generation of Internal Serials via Popover
  const handleConfirmGenerateSerials = () => {
    const targetQty = Math.max(
      1,
      Math.min(genCount || 1, remainingUnproducedCount),
    );
    let count = 0;
    const updated = identifiers.map((row, idx) => {
      if (row.isExisting) return row;
      if (count < targetQty) {
        count++;
        const genSerial = generateInternalSerial(
          skuPrefix,
          idx + 1,
          orderSuffix,
        );
        return {
          ...row,
          internalSerialNo: genSerial,
          ...(policy === "SERIAL" ? { serialNo: genSerial } : {}),
        };
      }
      return row;
    });
    onSetIdentifiers(updated);
    setGenPopoverOpen(false);
    showToast({
      title: t(`Đã tự động tạo Số Serial cho ${count} dòng`),
      variant: "success",
    });
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const cleanSku = (skuPrefix || "ITEM").replace(/[^a-zA-Z0-9_-]/g, "");

    let headers: string[];
    let sampleRows: any[][];
    let fileName: string;

    if (policy === "VEHICLE") {
      headers = [
        "Số khung (VIN) (*)",
        "Số máy (*)",
        "Số Serial xe (*)",
        "Số Serial nội bộ (*)",
        "Ghi chú",
      ];
      sampleRows = [
        headers,
        [
          `VIN-${cleanSku}-0001`,
          `ENG-${cleanSku}-0001`,
          `SER-001`,
          `SN-${cleanSku}-0001`,
          "Xe tiêu chuẩn",
        ],
        [
          `VIN-${cleanSku}-0002`,
          `ENG-${cleanSku}-0002`,
          `SER-002`,
          `SN-${cleanSku}-0002`,
          "",
        ],
      ];
      fileName = `Mau_Khai_Bao_Xe_${cleanSku}.xlsx`;
    } else if (policy === "SERIAL") {
      headers = ["Số Serial phụ tùng (*)", "Ghi chú"];
      sampleRows = [
        headers,
        [`SN-${cleanSku}-0001`, "Hàng mới"],
        [`SN-${cleanSku}-0002`, ""],
      ];
      fileName = `Mau_Khai_Bao_Serial_${cleanSku}.xlsx`;
    } else {
      headers = ["Số Lô (*)", "Ghi chú"];
      sampleRows = [headers, [`LOT-2026-01`, ""], [`LOT-2026-02`, ""]];
      fileName = `Mau_Khai_Bao_Lo_${cleanSku}.xlsx`;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sampleRows);
    ws["!cols"] = headers.map(() => ({ wch: 25 }));
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Khai_Bao");
    XLSX.writeFile(wb, fileName);

    showToast({
      title: t("Đã tải file Excel mẫu thành công"),
      variant: "success",
    });
  };

  // Handle Confirmed Excel Import from Modal
  const handleConfirmExcelImport = (
    importedRows: Partial<ProductionIdentifier>[],
  ) => {
    const updated = [...identifiers];
    let importIdx = 0;
    for (
      let i = 0;
      i < updated.length && importIdx < importedRows.length;
      i++
    ) {
      if (updated[i].isExisting) continue;
      const item = importedRows[importIdx];
      updated[i] = {
        ...updated[i],
        ...(item.vinNo ? { vinNo: item.vinNo } : {}),
        ...(item.engineNo ? { engineNo: item.engineNo } : {}),
        ...(item.serialNo ? { serialNo: item.serialNo } : {}),
        ...(item.internalSerialNo
          ? { internalSerialNo: item.internalSerialNo }
          : {
              internalSerialNo:
                updated[i].internalSerialNo ||
                generateInternalSerial(skuPrefix, i + 1, orderSuffix),
            }),
        ...(item.lotNo ? { lotNo: item.lotNo } : {}),
        ...(item.notes ? { notes: item.notes } : {}),
      };
      importIdx++;
    }
    onSetIdentifiers(updated);
  };

  if (policy === "NONE") return null;

  const totalCount = identifiers.length;

  const sectionTitle = (
    <div className="flex items-center gap-2">
      <span>
        {policy === "VEHICLE"
          ? t("Thông tin định danh xe xuất xưởng")
          : policy === "SERIAL"
            ? t("Danh sách mã Serial phụ tùng / kho")
            : t("Danh sách mã Lô thành phẩm")}
      </span>
      <Tooltip
        content={
          policy === "VEHICLE"
            ? `${t("Đã khai báo")} ${completedCount} / ${totalCount} ${t("xe theo kế hoạch sản xuất")}`
            : `${t("Đã khai báo")} ${completedCount} / ${totalCount} ${t("dòng theo kế hoạch sản xuất")}`
        }
      >
        <span className="font-mono font-semibold text-xs text-muted-foreground hover:text-foreground cursor-help underline decoration-dotted underline-offset-2">
          ({completedCount} / {totalCount})
        </span>
      </Tooltip>
      {tableState.activeFilterCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            tableState.resetFilters();
            setPage(1);
          }}
          className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full lowercase first-letter:uppercase tracking-normal font-sans"
        >
          <span>
            {t("Xóa bộ lọc")} ({tableState.activeFilterCount})
          </span>
        </button>
      )}
    </div>
  );

  // Popover content for internal serial generation
  const genPopoverContent = (
    <div className="p-3.5 space-y-3 w-[290px]">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{t("Sinh Serial nội bộ tự động")}</span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          {t("Còn lại")}: {remainingUnproducedCount}
        </Badge>
      </div>

      <div>
        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
          {t("Số lượng cần sinh mã:")}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={Math.max(1, remainingUnproducedCount)}
            value={genCount}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setGenCount(
                isNaN(val)
                  ? 1
                  : Math.max(1, Math.min(val, remainingUnproducedCount)),
              );
            }}
            className={cn(
              inputCls,
              "h-7 text-xs font-mono font-semibold text-center w-20",
            )}
          />
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => setGenCount(1)}
            >
              1
            </Button>
            {remainingUnproducedCount > 1 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px]"
                onClick={() => setGenCount(remainingUnproducedCount)}
              >
                {t("Tất cả")} ({remainingUnproducedCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded border border-border/60">
        <span className="font-semibold">{t("Mẫu mã")}: </span>
        <span className="font-mono text-foreground break-all">
          {generateInternalSerial(skuPrefix, 1, orderSuffix)}
        </span>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => setGenPopoverOpen(false)}
        >
          {t("Hủy")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="primary"
          className="h-7 text-xs gap-1"
          disabled={remainingUnproducedCount <= 0}
          onClick={handleConfirmGenerateSerials}
        >
          <Sparkles className="w-3 h-3" />
          <span>{t("Xác nhận sinh")}</span>
        </Button>
      </div>
    </div>
  );

  // Standard App Button Action Header (Main Action = Import Excel, Popover = Auto Gen, Dropdown = Template)
  const titleExtra = (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {!disabled && (
        <div className="inline-flex items-stretch rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExcelModalOpen(true)}
            className="h-7 rounded-none px-2.5 text-xs font-semibold gap-1.5 text-foreground hover:bg-surface-hover transition-colors"
            title={t("Nhập dữ liệu từ file Excel")}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t("Nhập từ file Excel")}</span>
          </Button>
          <div className="w-[1px] bg-border my-1" />
          <Popover
            open={genPopoverOpen}
            onOpenChange={setGenPopoverOpen}
            content={genPopoverContent}
            align="end"
            side="bottom"
          >
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-xs font-semibold gap-1.5 text-foreground hover:bg-surface-hover transition-colors"
              title={
                policy === "VEHICLE"
                  ? t("Sinh Serial nội bộ")
                  : t("Tự động sinh mã")
              }
            >
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                {policy === "VEHICLE"
                  ? t("Sinh Serial nội bộ")
                  : t("Tự động sinh mã")}
              </span>
            </Button>
          </Popover>
          <div className="w-[1px] bg-border my-1" />
          <ActionDropdown
            items={[
              {
                label:
                  policy === "VEHICLE"
                    ? t("Tải file mẫu Excel xe")
                    : t("Tải file mẫu Excel phụ tùng"),
                icon: <Download className="w-4 h-4 text-emerald-600" />,
                onClick: handleDownloadTemplate,
              },
            ]}
            align="end"
            customTrigger={
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-none text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      <DrawerSection
        title={sectionTitle}
        titleExtra={titleExtra}
        collapsible={true}
        defaultCollapsed={false}
        className="!mt-0"
      >
        <DataTable
          tableId={tableId}
          variant="spreadsheet"
          items={paginatedRows}
          columns={columns}
          emptyLabel={t("Không có dòng nào phù hợp với bộ lọc")}
          enableColumnResizing={true}
          containerClassName="max-h-[calc(100vh-380px)] overflow-y-auto"
          page={currentPage}
          pageSize={pageSize}
          total={totalItems}
          totalPages={totalPages}
          onPage={(p) => setPage(p)}
          onPageSize={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          pageSizeOptions={[20, 50, 100, 200]}
        />
      </DrawerSection>

      {/* Standard Excel Import Modal with Append Notice & Validation */}
      <ProductionIdentifierExcelImportModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        policy={policy}
        skuPrefix={skuPrefix}
        orderSuffix={orderSuffix}
        remainingQty={remainingUnproducedCount}
        onConfirmImport={handleConfirmExcelImport}
      />
    </>
  );
}

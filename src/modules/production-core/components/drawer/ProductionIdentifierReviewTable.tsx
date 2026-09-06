import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Sparkles, FileSpreadsheet, Download, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
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
  hasDuplicate: boolean;
  isVinDupe: boolean;
  isEngDupe: boolean;
  isSerDupe: boolean;
  isISerDupe: boolean;
  isExistingClearedVin?: boolean;
  isExistingClearedEng?: boolean;
  isIncompleteNewVin?: boolean;
  isIncompleteNewEng?: boolean;
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
    return !!id.vinNo?.trim() && !!id.engineNo?.trim();
  }
  if (policy === "SERIAL") {
    return !!(id.internalSerialNo?.trim() || id.serialNo?.trim());
  }
  if (policy === "LOT") return !!id.lotNo?.trim();
  return true;
}

export function identifiersAllValid(
  ids: ProductionIdentifier[],
  policy: TrackingPolicy,
): boolean {
  if (policy === "NONE") return true;
  return ids.every((x) => isIdentifierValid(x, policy));
}

export function findVehicleDuplicate(ids: ProductionIdentifier[]) {
  const seenVin = new Set<string>();
  const seenEngine = new Set<string>();
  const seenVehicleSerial = new Set<string>();
  const seenInternalSerial = new Set<string>();

  for (const row of ids) {
    const vin = row.vinNo?.trim().toUpperCase();
    const engine = row.engineNo?.trim().toUpperCase();
    const vSerial = row.serialNo?.trim().toUpperCase();
    const iSerial = row.internalSerialNo?.trim().toUpperCase();

    if (vin) {
      if (seenVin.has(vin)) return "Số khung (VIN) bị trùng trong danh sách";
      seenVin.add(vin);
    }
    if (engine) {
      if (seenEngine.has(engine)) return "Số máy bị trùng trong danh sách";
      seenEngine.add(engine);
    }
    if (vSerial) {
      if (seenVehicleSerial.has(vSerial))
        return "Số Serial xe bị trùng trong danh sách";
      seenVehicleSerial.add(vSerial);
    }
    if (iSerial) {
      if (seenInternalSerial.has(iSerial))
        return "Số Serial nội bộ bị trùng trong danh sách";
      seenInternalSerial.add(iSerial);
    }
  }
  return null;
}

export interface ProductionIdentifierReviewTableProps {
  policy: TrackingPolicy;
  identifiers: ProductionIdentifier[];
  onChange: (index: number, val: ProductionIdentifier) => void;
  onSetIdentifiers: (rows: ProductionIdentifier[]) => void;
  requiredQty?: number;
  skuPrefix?: string;
  orderSuffix?: string;
  itemName?: string;
  disabled?: boolean;
}

interface EditableCellProps {
  value: string;
  hasError?: boolean;
  errorMessage?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}

const EditableCell = React.memo(function EditableCell({
  value,
  hasError = false,
  errorMessage,
  placeholder,
  className,
  inputClassName,
  disabled = false,
  onChange,
}: EditableCellProps) {
  const [localVal, setLocalVal] = useState(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      onChange(localVal);
    }
  };

  return (
    <div className={cn("w-full py-0.5", className)}>
      <input
        value={localVal}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          inputCls,
          "w-full text-xs h-7 font-mono font-medium",
          inputClassName,
          hasError &&
            "border-destructive focus-visible:ring-destructive bg-destructive/5",
        )}
      />
      {hasError && errorMessage && (
        <span className="text-[10px] text-destructive block mt-0.5 font-medium leading-tight">
          {errorMessage}
        </span>
      )}
    </div>
  );
});

export function ProductionIdentifierReviewTable({
  policy,
  identifiers,
  onChange,
  onSetIdentifiers,
  skuPrefix = "FG",
  orderSuffix = "",
  disabled = false,
}: ProductionIdentifierReviewTableProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tableId = "production-identifier-declare-table";
  const tableState = useTableColumnState(tableId);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);

  // Track internal duplicate sets
  const duplicates = useMemo(() => {
    const vinCounts = new Map<string, number>();
    const engineCounts = new Map<string, number>();
    const serialCounts = new Map<string, number>();
    const internalSerialCounts = new Map<string, number>();

    identifiers.forEach((row) => {
      const vin = row.vinNo?.trim().toUpperCase();
      const eng = row.engineNo?.trim().toUpperCase();
      const ser = row.serialNo?.trim().toUpperCase();
      const iSer = row.internalSerialNo?.trim().toUpperCase();

      if (vin) vinCounts.set(vin, (vinCounts.get(vin) || 0) + 1);
      if (eng) engineCounts.set(eng, (engineCounts.get(eng) || 0) + 1);
      if (ser) serialCounts.set(ser, (serialCounts.get(ser) || 0) + 1);
      if (iSer)
        internalSerialCounts.set(
          iSer,
          (internalSerialCounts.get(iSer) || 0) + 1,
        );
    });

    return {
      vins: new Set(
        Array.from(vinCounts.entries())
          .filter(([, count]) => count > 1)
          .map(([k]) => k),
      ),
      engines: new Set(
        Array.from(engineCounts.entries())
          .filter(([, count]) => count > 1)
          .map(([k]) => k),
      ),
      serials: new Set(
        Array.from(serialCounts.entries())
          .filter(([, count]) => count > 1)
          .map(([k]) => k),
      ),
      internalSerials: new Set(
        Array.from(internalSerialCounts.entries())
          .filter(([, count]) => count > 1)
          .map(([k]) => k),
      ),
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

      const isIncompleteNewVin =
        !isExisting && !row.vinNo?.trim() && !!row.engineNo?.trim();
      const isIncompleteNewEng =
        !isExisting && !!row.vinNo?.trim() && !row.engineNo?.trim();

      return {
        ...row,
        id: row.id || `row-${originalIndex}`,
        originalIndex,
        isValid,
        hasDuplicate,
        isVinDupe,
        isEngDupe,
        isSerDupe,
        isISerDupe,
        isExistingClearedVin,
        isExistingClearedEng,
        isIncompleteNewVin,
        isIncompleteNewEng,
      };
    });
  }, [identifiers, policy, duplicates]);

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
              row.isIncompleteNewVin;
            const errorMessage = row.isVinDupe
              ? t("Trùng lặp trong danh sách")
              : row.isExistingClearedVin
                ? t("Xe đã ghi nhận không được để trống Số khung")
                : row.isIncompleteNewVin
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
              row.isIncompleteNewEng;
            const errorMessage = row.isEngDupe
              ? t("Trùng lặp trong danh sách")
              : row.isExistingClearedEng
                ? t("Xe đã ghi nhận không được để trống Số máy")
                : row.isIncompleteNewEng
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
          header: headerFilter("serialNo", t("Số Serial xe")),
          size: 150,
          enableResizing: true,
          cell: (row: ProductionIdentifierRowItem) => (
            <EditableCell
              value={row.serialNo}
              hasError={row.isSerDupe}
              errorMessage={t("Trùng lặp trong danh sách")}
              placeholder={t("Tùy chọn (tem xe)...")}
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
          size: 185,
          enableResizing: true,
          className: "bg-primary/5",
          cell: (row: ProductionIdentifierRowItem) => (
            <EditableCell
              value={row.internalSerialNo}
              hasError={row.isISerDupe}
              errorMessage={t("Trùng lặp trong danh sách")}
              placeholder={t("Tự sinh theo kho...")}
              inputClassName="text-primary font-medium"
              disabled={disabled}
              onChange={(val) =>
                handleCellEdit(row.originalIndex, "internalSerialNo", val)
              }
            />
          ),
        },
      );
    } else if (policy === "SERIAL") {
      cols.push({
        key: "internalSerialNo",
        header: headerFilter("internalSerialNo", t("Số Serial phụ tùng *")),
        size: 220,
        enableResizing: true,
        cell: (row: ProductionIdentifierRowItem) => (
          <EditableCell
            value={row.internalSerialNo || row.serialNo}
            hasError={row.isISerDupe}
            errorMessage={t("Trùng lặp trong danh sách")}
            placeholder={t("Nhập hoặc tự sinh Serial...")}
            disabled={disabled}
            onChange={(val) =>
              handleCellEdit(row.originalIndex, "internalSerialNo", val)
            }
          />
        ),
      });
    } else if (policy === "LOT") {
      cols.push({
        key: "lotNo",
        header: headerFilter("lotNo", t("Số Lô *")),
        size: 200,
        enableResizing: true,
        cell: (row: ProductionIdentifierRowItem) => (
          <EditableCell
            value={row.lotNo}
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
      size: 180,
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

  // Auto-generate Internal Serials
  const handleAutoGenerateInternalSerials = () => {
    const updated = identifiers.map((row, idx) => ({
      ...row,
      internalSerialNo: generateInternalSerial(skuPrefix, idx + 1, orderSuffix),
    }));
    onSetIdentifiers(updated);
    showToast({
      title: t("Đã tự động tạo/làm mới Số Serial nội bộ cho tất cả các dòng"),
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
        "Số Serial xe (tùy chọn)",
        "Số Serial nội bộ",
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
          "",
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

  // Import from Excel into the fixed array length (qtyToProduce)
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const updated = [...identifiers];
        let importIdx = 0;

        data.forEach((row: any) => {
          const vin =
            row["Số khung (VIN) (*)"] ||
            row["Số khung (VIN)"] ||
            row["Số khung"] ||
            row["VIN"] ||
            row["vinNo"] ||
            "";

          const engine =
            row["Số máy (*)"] ||
            row["Số máy"] ||
            row["Engine No"] ||
            row["engineNo"] ||
            "";

          const vSerial =
            row["Số Serial xe (tùy chọn)"] ||
            row["Số Serial xe"] ||
            row["Serial xe"] ||
            "";

          const iSerial =
            row["Số Serial nội bộ"] ||
            row["Serial nội bộ"] ||
            row["Số Serial phụ tùng (*)"] ||
            row["Số Serial"] ||
            row["Serial"] ||
            "";

          const lot = row["Số Lô (*)"] || row["Số Lô"] || row["lotNo"] || "";
          const note = row["Ghi chú"] || row["Notes"] || "";

          if (importIdx < updated.length) {
            const current = updated[importIdx];
            if (policy === "VEHICLE" && (vin || engine)) {
              updated[importIdx] = {
                ...current,
                vinNo: String(vin).trim(),
                engineNo: String(engine).trim(),
                serialNo: vSerial
                  ? String(vSerial).trim()
                  : current.isExisting
                    ? current.serialNo
                    : "",
                internalSerialNo: iSerial
                  ? String(iSerial).trim()
                  : current.internalSerialNo ||
                    generateInternalSerial(
                      skuPrefix,
                      importIdx + 1,
                      orderSuffix,
                    ),
                notes: note ? String(note).trim() : current.notes,
              };
              importIdx++;
            } else if (policy === "SERIAL" && (iSerial || vSerial)) {
              updated[importIdx] = {
                ...current,
                internalSerialNo: String(iSerial || vSerial).trim(),
                serialNo: String(vSerial || iSerial).trim(),
                notes: note ? String(note).trim() : current.notes,
              };
              importIdx++;
            } else if (policy === "LOT" && lot) {
              updated[importIdx] = {
                ...current,
                lotNo: String(lot).trim(),
                notes: note ? String(note).trim() : current.notes,
              };
              importIdx++;
            }
          }
        });

        if (importIdx > 0) {
          onSetIdentifiers(updated);
          showToast({
            title: `${t("Đã nhập")} ${importIdx} ${t("dòng từ file Excel")}`,
            variant: "success",
          });
        } else {
          showToast({
            title: t("Không tìm thấy dữ liệu hợp lệ trong file Excel"),
            variant: "default",
          });
        }
      } catch {
        showToast({
          title: t("Lỗi đọc file Excel"),
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
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

  // Standard App Button Action Header (Main Action = Import Excel, Dropdown = Auto Gen & Download Template)
  const titleExtra = (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {!disabled && (
        <div className="inline-flex items-stretch rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 rounded-none px-2.5 text-xs font-semibold gap-1.5 text-foreground hover:bg-surface-hover transition-colors"
            title={t("Nhập dữ liệu từ file Excel")}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t("Nhập từ file Excel")}</span>
          </Button>
          <div className="w-[1px] bg-border my-1" />
          <ActionDropdown
            items={[
              {
                label:
                  policy === "VEHICLE"
                    ? t("Sinh Serial nội bộ")
                    : t("Tự động sinh mã"),
                icon: <Sparkles className="w-4 h-4 text-primary" />,
                onClick: handleAutoGenerateInternalSerials,
              },
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
    <DrawerSection
      title={sectionTitle}
      titleExtra={titleExtra}
      collapsible={true}
      defaultCollapsed={false}
      className="!mt-0"
    >
      {/* Hidden File Input for Excel Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleImportExcel}
      />

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
  );
}

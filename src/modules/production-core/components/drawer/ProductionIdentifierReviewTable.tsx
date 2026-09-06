import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Sparkles,
  ClipboardList,
  FileSpreadsheet,
  Download,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/utils";
import { DrawerSection, inputCls } from "@/shared/components/DrawerModal";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { EmptyState } from "@/shared/components/EmptyState";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";

export interface ProductionIdentifier {
  vinNo: string;
  engineNo: string;
  serialNo: string; // Số serial xe (Optional - theo tem xe)
  internalSerialNo: string; // Số serial nội bộ quản lý ERP (Tự động sinh)
  lotNo: string;
  notes: string;
  attributes: Array<{ key: string; value: string }>;
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
): ProductionIdentifier {
  return {
    vinNo: "",
    engineNo: "",
    serialNo: "",
    internalSerialNo: defaultInternalSerial,
    lotNo: "",
    notes: "",
    attributes: [],
  };
}

export function makeIdentifierRows(
  qty: number,
  skuPrefix: string = "FG",
  orderSuffix: string = "",
): ProductionIdentifier[] {
  const length = Math.max(1, Math.floor(qty));
  return Array.from({ length }, (_, i) =>
    emptyIdentifier(generateInternalSerial(skuPrefix, i + 1, orderSuffix)),
  );
}

export function isIdentifierValid(
  id: ProductionIdentifier,
  policy: TrackingPolicy,
): boolean {
  if (policy === "VEHICLE") {
    return !!id.vinNo.trim() && !!id.engineNo.trim();
  }
  if (policy === "SERIAL") {
    return !!(id.internalSerialNo?.trim() || id.serialNo?.trim());
  }
  if (policy === "LOT") return !!id.lotNo.trim();
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

export function parseVehicleBulkInput(
  input: string,
  policy: TrackingPolicy = "VEHICLE",
  skuPrefix: string = "FG",
  orderSuffix: string = "",
): ProductionIdentifier[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      const cleanParts = parts.map((p) => (p ?? "").trim());

      if (policy === "VEHICLE") {
        const vinNo = cleanParts[0] ?? "";
        const engineNo = cleanParts[1] ?? "";
        const serialNo = cleanParts[2] ?? "";
        const internalSerialNo =
          cleanParts[3] ||
          generateInternalSerial(skuPrefix, index + 1, orderSuffix);
        const notes = cleanParts[4] ?? "";

        if (!vinNo || !engineNo) {
          throw new Error(
            `Dòng ${index + 1}: Số khung (VIN) và Số máy là bắt buộc.`,
          );
        }

        return {
          vinNo,
          engineNo,
          serialNo,
          internalSerialNo,
          lotNo: "",
          notes,
          attributes: [],
        };
      }

      if (policy === "SERIAL") {
        const serialNo = cleanParts[0] ?? "";
        const notes = cleanParts[1] ?? "";
        if (!serialNo) {
          throw new Error(`Dòng ${index + 1}: Số Serial là bắt buộc.`);
        }
        return {
          vinNo: "",
          engineNo: "",
          serialNo: "",
          internalSerialNo: serialNo,
          lotNo: "",
          notes,
          attributes: [],
        };
      }

      if (policy === "LOT") {
        const lotNo = cleanParts[0] ?? "";
        const notes = cleanParts[1] ?? "";
        if (!lotNo) {
          throw new Error(`Dòng ${index + 1}: Số Lô là bắt buộc.`);
        }
        return {
          vinNo: "",
          engineNo: "",
          serialNo: "",
          internalSerialNo: "",
          lotNo,
          notes,
          attributes: [],
        };
      }

      return emptyIdentifier(
        generateInternalSerial(skuPrefix, index + 1, orderSuffix),
      );
    });
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

interface IdentifierTableRowProps {
  originalIndex: number;
  row: ProductionIdentifier;
  policy: TrackingPolicy;
  disabled?: boolean;
  onChange: (index: number, val: ProductionIdentifier) => void;
  isVinDupe?: boolean;
  isEngDupe?: boolean;
  isSerDupe?: boolean;
  isISerDupe?: boolean;
}

const IdentifierTableRow = React.memo(function IdentifierTableRow({
  originalIndex,
  row,
  policy,
  disabled = false,
  onChange,
  isVinDupe = false,
  isEngDupe = false,
  isSerDupe = false,
  isISerDupe = false,
}: IdentifierTableRowProps) {
  const t = useT();
  const [localRow, setLocalRow] = useState<ProductionIdentifier>(row);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync internal state when external prop row changes (bulk paste, Excel import, auto-gen)
  useEffect(() => {
    setLocalRow(row);
  }, [row]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const triggerChange = useCallback(
    (updated: ProductionIdentifier) => {
      setLocalRow(updated);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        onChange(originalIndex, updated);
      }, 300);
    },
    [originalIndex, onChange],
  );

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      onChange(originalIndex, localRow);
    }
  };

  const hasRowError = isVinDupe || isEngDupe || isSerDupe || isISerDupe;

  return (
    <TableRow
      className={cn(
        "hover:bg-muted/30 transition-colors border-b border-border/70",
        hasRowError && "bg-red-50/40 dark:bg-red-950/20",
      )}
    >
      {/* First Column: STT (Standard 40px, Absolutely Centered) */}
      <TableCell className="w-[40px] min-w-[40px] p-0 text-center border-r border-border tabular-nums font-mono text-muted-foreground text-xs">
        <span className="w-full block text-center">{originalIndex + 1}</span>
      </TableCell>

      {policy === "VEHICLE" && (
        <>
          {/* VIN */}
          <TableCell className="py-1 px-2 border-r border-border">
            <input
              value={localRow.vinNo}
              onChange={(e) =>
                triggerChange({
                  ...localRow,
                  vinNo: e.target.value,
                })
              }
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                inputCls,
                "w-full text-xs h-7 font-mono font-medium",
                isVinDupe &&
                  "border-destructive focus-visible:ring-destructive bg-destructive/5",
              )}
              placeholder="Nhập số VIN..."
            />
            {isVinDupe && (
              <span className="text-[10px] text-destructive block mt-0.5 font-medium">
                {t("Trùng lặp trong danh sách")}
              </span>
            )}
          </TableCell>

          {/* Engine No */}
          <TableCell className="py-1 px-2 border-r border-border">
            <input
              value={localRow.engineNo}
              onChange={(e) =>
                triggerChange({
                  ...localRow,
                  engineNo: e.target.value,
                })
              }
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                inputCls,
                "w-full text-xs h-7 font-mono font-medium",
                isEngDupe &&
                  "border-destructive focus-visible:ring-destructive bg-destructive/5",
              )}
              placeholder="Nhập số máy..."
            />
            {isEngDupe && (
              <span className="text-[10px] text-destructive block mt-0.5 font-medium">
                {t("Trùng lặp trong danh sách")}
              </span>
            )}
          </TableCell>

          {/* Vehicle Serial (Optional) */}
          <TableCell className="py-1 px-2 border-r border-border">
            <input
              value={localRow.serialNo}
              onChange={(e) =>
                triggerChange({
                  ...localRow,
                  serialNo: e.target.value,
                })
              }
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                inputCls,
                "w-full text-xs h-7 font-mono",
                isSerDupe &&
                  "border-destructive focus-visible:ring-destructive bg-destructive/5",
              )}
              placeholder="Tùy chọn (tem xe)..."
            />
            {isSerDupe && (
              <span className="text-[10px] text-destructive block mt-0.5 font-medium">
                {t("Trùng lặp trong danh sách")}
              </span>
            )}
          </TableCell>

          {/* Internal Serial (Auto-generated / ERP) */}
          <TableCell className="py-1 px-2 border-r border-border bg-primary/5">
            <input
              value={localRow.internalSerialNo}
              onChange={(e) =>
                triggerChange({
                  ...localRow,
                  internalSerialNo: e.target.value,
                })
              }
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                inputCls,
                "w-full text-xs h-7 font-mono font-medium text-primary",
                isISerDupe &&
                  "border-destructive focus-visible:ring-destructive bg-destructive/5",
              )}
              placeholder="Tự sinh theo kho..."
            />
            {isISerDupe && (
              <span className="text-[10px] text-destructive block mt-0.5 font-medium">
                {t("Trùng lặp trong danh sách")}
              </span>
            )}
          </TableCell>
        </>
      )}

      {policy === "SERIAL" && (
        <TableCell className="py-1 px-2.5 border-r border-border">
          <input
            value={localRow.internalSerialNo || localRow.serialNo}
            onChange={(e) =>
              triggerChange({
                ...localRow,
                internalSerialNo: e.target.value,
                serialNo: e.target.value,
              })
            }
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              inputCls,
              "w-full text-xs h-7 font-mono font-medium",
              isISerDupe &&
                "border-destructive focus-visible:ring-destructive bg-destructive/5",
            )}
            placeholder="Nhập hoặc tự sinh Serial..."
          />
          {isISerDupe && (
            <span className="text-[10px] text-destructive block mt-0.5 font-medium">
              {t("Trùng lặp trong danh sách")}
            </span>
          )}
        </TableCell>
      )}

      {policy === "LOT" && (
        <TableCell className="py-1 px-2.5 border-r border-border">
          <input
            value={localRow.lotNo}
            onChange={(e) =>
              triggerChange({
                ...localRow,
                lotNo: e.target.value,
              })
            }
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(inputCls, "w-full text-xs h-7 font-mono font-medium")}
            placeholder="Nhập số Lô..."
          />
        </TableCell>
      )}

      {/* Notes */}
      <TableCell className="py-1 px-2">
        <input
          value={localRow.notes}
          onChange={(e) =>
            triggerChange({
              ...localRow,
              notes: e.target.value,
            })
          }
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(inputCls, "w-full text-xs h-7")}
          placeholder="Ghi chú đơn vị..."
        />
      </TableCell>
    </TableRow>
  );
});

export function ProductionIdentifierReviewTable({
  policy,
  identifiers,
  onChange,
  onSetIdentifiers,
  requiredQty = 1,
  skuPrefix = "FG",
  orderSuffix = "",
  disabled = false,
}: ProductionIdentifierReviewTableProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Quick Filter & Pagination State
  const [filterTab, setFilterTab] = useState<
    "ALL" | "INCOMPLETE" | "DUPLICATES"
  >("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

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

  // Indexed rows for filtering & accurate original indexing
  const indexedRows = useMemo(() => {
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

      return {
        row,
        originalIndex,
        isValid,
        hasDuplicate,
        isVinDupe,
        isEngDupe,
        isSerDupe,
        isISerDupe,
      };
    });
  }, [identifiers, policy, duplicates]);

  const completedCount = useMemo(
    () => indexedRows.filter((r) => r.isValid).length,
    [indexedRows],
  );
  const incompleteCount = identifiers.length - completedCount;
  const duplicateRowsCount = useMemo(
    () => indexedRows.filter((r) => r.hasDuplicate).length,
    [indexedRows],
  );

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (filterTab === "INCOMPLETE") {
      return indexedRows.filter((r) => !r.isValid);
    }
    if (filterTab === "DUPLICATES") {
      return indexedRows.filter((r) => r.hasDuplicate);
    }
    return indexedRows;
  }, [indexedRows, filterTab]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const displayedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Auto-generate Internal Serials (Refresh only internalSerialNo, preserve VIN/Engine/Serial)
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

  // Bulk paste submit
  const handleApplyBulkPaste = () => {
    if (!bulkText.trim()) {
      setIsBulkPasteOpen(false);
      return;
    }

    try {
      const parsed = parseVehicleBulkInput(
        bulkText,
        policy,
        skuPrefix,
        orderSuffix,
      );
      if (parsed.length === 0) {
        setIsBulkPasteOpen(false);
        return;
      }
      onSetIdentifiers(parsed);
      setBulkText("");
      setIsBulkPasteOpen(false);
      showToast({
        title: `${t("Đã trích xuất thành công")} ${parsed.length} ${t("dòng định danh")}`,
        variant: "success",
      });
    } catch (err: any) {
      showToast({
        title: err.message || t("Lỗi định dạng dữ liệu dán nhanh"),
        variant: "destructive",
      });
    }
  };

  // Import from Excel
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

        const newRows: ProductionIdentifier[] = [];
        data.forEach((row: any, idx: number) => {
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
            generateInternalSerial(skuPrefix, idx + 1, orderSuffix);

          const lot = row["Số Lô (*)"] || row["Số Lô"] || row["lotNo"] || "";
          const note = row["Ghi chú"] || row["Notes"] || "";

          if (policy === "VEHICLE" && (vin || engine)) {
            newRows.push({
              vinNo: String(vin).trim(),
              engineNo: String(engine).trim(),
              serialNo: String(vSerial).trim(),
              internalSerialNo: String(iSerial).trim(),
              lotNo: "",
              notes: String(note).trim(),
              attributes: [],
            });
          } else if (policy === "SERIAL" && iSerial) {
            newRows.push({
              vinNo: "",
              engineNo: "",
              serialNo: "",
              internalSerialNo: String(iSerial).trim(),
              lotNo: "",
              notes: String(note).trim(),
              attributes: [],
            });
          } else if (policy === "LOT" && lot) {
            newRows.push({
              vinNo: "",
              engineNo: "",
              serialNo: "",
              internalSerialNo: "",
              lotNo: String(lot).trim(),
              notes: String(note).trim(),
              attributes: [],
            });
          }
        });

        if (newRows.length > 0) {
          onSetIdentifiers(newRows);
          showToast({
            title: `${t("Đã nhập")} ${newRows.length} ${t("dòng từ file Excel")}`,
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

  return (
    <div className="space-y-3">
      {/* Hidden File Input for Excel Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleImportExcel}
      />

      {/* Bulk Paste Dialog Section */}
      {isBulkPasteOpen && (
        <div className="p-4 bg-muted/40 border rounded-xl space-y-3 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {policy === "VEHICLE"
                ? t(
                    "Dán nhanh danh sách xe (Mỗi dòng 1 xe, cách nhau Tab hoặc dấu phẩy)",
                  )
                : t("Dán nhanh danh sách Serial (Mỗi mã 1 dòng)")}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => setIsBulkPasteOpen(false)}
            >
              {t("Đóng")}
            </Button>
          </div>

          <div className="text-[11px] text-muted-foreground bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border space-y-1">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {policy === "VEHICLE"
                ? t(
                    "Thứ tự cột: Số khung (VIN) *, Số máy *, [Serial xe], [Serial nội bộ], [Ghi chú]",
                  )
                : t("Thứ tự cột: Số Serial *, [Ghi chú]")}
            </p>
          </div>

          <textarea
            className={`${inputCls} min-h-[110px] font-mono text-xs`}
            placeholder={
              policy === "VEHICLE"
                ? `VIN-001, ENG-001\nVIN-002, ENG-002, SER-002, SN-002, Xe đỏ`
                : `SN-001\nSN-002, Hàng mới`
            }
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBulkPasteOpen(false)}
            >
              {t("Hủy")}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleApplyBulkPaste}
              disabled={!bulkText.trim()}
            >
              {t("Áp dụng")}
            </Button>
          </div>
        </div>
      )}

      {/* Main Review Table Section */}
      <DrawerSection
        title={
          policy === "VEHICLE"
            ? t("Thông tin định danh xe xuất xưởng (Số khung / Số máy)")
            : policy === "SERIAL"
              ? t("Danh sách mã Serial phụ tùng / kho")
              : t("Danh sách mã Lô thành phẩm")
        }
        titleExtra={
          !disabled ? (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs font-semibold gap-1 text-primary border-primary/30 hover:bg-primary/5"
                onClick={handleAutoGenerateInternalSerials}
                title={
                  policy === "VEHICLE"
                    ? t(
                        "Tự động sinh/điền lại cột Số Serial nội bộ (giữ nguyên Số khung và Số máy đã nhập)",
                      )
                    : t("Tự động sinh mã Serial phụ tùng")
                }
              >
                <Sparkles className="w-3.5 h-3.5" />
                {policy === "VEHICLE"
                  ? t("Sinh Serial nội bộ")
                  : t("Tự động sinh mã")}
              </Button>

              {/* Action Dropdown */}
              <ActionDropdown
                align="end"
                items={[
                  {
                    groupLabel: t("TỰ ĐỘNG & HÀNG LOẠT"),
                    items: [
                      {
                        label:
                          policy === "VEHICLE"
                            ? t("Sinh Serial nội bộ")
                            : t("Tự động sinh mã"),
                        icon: <Sparkles className="w-4 h-4 text-primary" />,
                        onClick: handleAutoGenerateInternalSerials,
                      },
                      {
                        label: t("Dán nhanh hàng loạt"),
                        icon: <ClipboardList className="w-4 h-4" />,
                        onClick: () => setIsBulkPasteOpen(true),
                      },
                    ],
                  },
                  {
                    groupLabel: t("EXCEL"),
                    items: [
                      {
                        label:
                          policy === "VEHICLE"
                            ? t("Tải file mẫu Excel xe")
                            : t("Tải file mẫu Excel phụ tùng"),
                        icon: <Download className="w-4 h-4 text-emerald-600" />,
                        onClick: handleDownloadTemplate,
                      },
                      {
                        label: t("Nhập từ file Excel"),
                        icon: (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        ),
                        onClick: () => fileInputRef.current?.click(),
                      },
                    ],
                  },
                ]}
                customTrigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-semibold gap-1"
                  >
                    <span>{t("Thao tác")}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                }
              />
            </div>
          ) : undefined
        }
      >
        {identifiers.length === 0 ? (
          <EmptyState
            size="sm"
            message={t("Chưa có dòng định danh nào")}
            description={t(
              "Dữ liệu định danh sẽ tự động sinh theo Số lượng hoàn thành đợt này.",
            )}
            className="border border-dashed rounded-lg py-8 bg-muted/10 my-1"
          />
        ) : (
          <div className="space-y-2">
            {/* Quick Filter Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
              <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab("ALL");
                    setPage(1);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all font-medium",
                    filterTab === "ALL"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t("Tất cả")} ({identifiers.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterTab("INCOMPLETE");
                    setPage(1);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1",
                    filterTab === "INCOMPLETE"
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300",
                  )}
                >
                  <span>{t("Chưa đủ thông tin")}</span>
                  {incompleteCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-bold font-mono">
                      {incompleteCount}
                    </span>
                  )}
                </button>

                {duplicateRowsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTab("DUPLICATES");
                      setPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1",
                      filterTab === "DUPLICATES"
                        ? "bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-red-700 dark:hover:text-red-300",
                    )}
                  >
                    <span>{t("Trùng lặp")}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 text-[10px] font-bold font-mono">
                      {duplicateRowsCount}
                    </span>
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-mono text-[11px]">
                  {t("Đã điền:")}{" "}
                  <strong className="text-foreground">{completedCount}</strong>{" "}
                  / {requiredQty}
                </span>
                {completedCount === requiredQty && (
                  <Badge
                    variant="outline"
                    className="gap-1 text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {t("Đã khớp đủ")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Standardized Spreadsheet Table Container (No Double Border) */}
            <div className="border border-border/70 rounded-xl overflow-hidden bg-surface shadow-xs">
              <div className="max-h-[360px] overflow-y-auto relative">
                <Table className="w-full table-fixed border-collapse text-xs">
                  <TableHeader className="sticky top-0 z-30 table-header-glass bg-muted/90 backdrop-blur-sm border-b border-border shadow-xs">
                    <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
                      {/* First Column: STT 40px Absolutely Centered */}
                      <TableHead className="sticky top-0 z-20 w-[40px] min-w-[40px] p-0 text-center border-r border-border font-semibold">
                        <span className="w-full block text-center">#</span>
                      </TableHead>

                      {policy === "VEHICLE" && (
                        <>
                          <TableHead className="sticky top-0 z-20 min-w-[150px] border-r border-border py-2 px-2.5 font-semibold">
                            {t("Số khung (VIN)")}{" "}
                            <span className="text-red-500">*</span>
                          </TableHead>
                          <TableHead className="sticky top-0 z-20 min-w-[140px] border-r border-border py-2 px-2.5 font-semibold">
                            {t("Số máy")}{" "}
                            <span className="text-red-500">*</span>
                          </TableHead>
                          <TableHead className="sticky top-0 z-20 min-w-[125px] border-r border-border py-2 px-2 font-semibold">
                            {t("Số Serial xe")}
                          </TableHead>
                          <TableHead className="sticky top-0 z-20 min-w-[140px] border-r border-border py-2 px-2 bg-primary/5 font-semibold">
                            <span className="flex items-center gap-1 text-primary">
                              <Sparkles className="w-3 h-3" />
                              {t("Số Serial nội bộ")}
                            </span>
                          </TableHead>
                        </>
                      )}

                      {policy === "SERIAL" && (
                        <TableHead className="sticky top-0 z-20 min-w-[200px] border-r border-border py-2 px-2.5 font-semibold">
                          {t("Số Serial phụ tùng")}{" "}
                          <span className="text-red-500">*</span>
                        </TableHead>
                      )}

                      {policy === "LOT" && (
                        <TableHead className="sticky top-0 z-20 min-w-[160px] border-r border-border py-2 px-2.5 font-semibold">
                          {t("Số Lô")} <span className="text-red-500">*</span>
                        </TableHead>
                      )}

                      <TableHead className="sticky top-0 z-20 min-w-[140px] py-2 px-2 font-semibold">
                        {t("Ghi chú")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {displayedRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={policy === "VEHICLE" ? 6 : 3}
                          className="text-center py-8 text-muted-foreground text-xs"
                        >
                          {t("Không có dòng nào phù hợp với bộ lọc")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedRows.map((item) => (
                        <IdentifierTableRow
                          key={item.originalIndex}
                          originalIndex={item.originalIndex}
                          row={item.row}
                          policy={policy}
                          disabled={disabled}
                          onChange={onChange}
                          isVinDupe={item.isVinDupe}
                          isEngDupe={item.isEngDupe}
                          isSerDupe={item.isSerDupe}
                          isISerDupe={item.isISerDupe}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Standard Pagination Footer */}
              <div className="p-2.5 bg-muted/40 border-t border-border flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {t("Hiển thị:")}{" "}
                    <strong className="font-mono">
                      {filteredRows.length > 0
                        ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(
                            currentPage * pageSize,
                            filteredRows.length,
                          )}`
                        : "0"}
                    </strong>{" "}
                    /{" "}
                    <strong className="font-mono">{filteredRows.length}</strong>{" "}
                    {t("dòng")}
                  </span>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-7 text-xs border border-border rounded-md bg-background px-1.5 py-0 font-medium font-mono shadow-2xs"
                  >
                    <option value={20}>20 / {t("trang")}</option>
                    <option value={50}>50 / {t("trang")}</option>
                    <option value={100}>100 / {t("trang")}</option>
                    <option value={500}>500 / {t("trang")}</option>
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs font-medium"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      {t("Trước")}
                    </Button>
                    <span className="px-2 font-mono text-xs font-semibold">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs font-medium"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      {t("Sau")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DrawerSection>
    </div>
  );
}

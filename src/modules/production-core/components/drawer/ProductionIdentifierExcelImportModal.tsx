import React, { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  FileText,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import type {
  ProductionIdentifier,
  TrackingPolicy,
} from "./ProductionIdentifierReviewTable";

export interface ProductionIdentifierExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  policy: TrackingPolicy;
  skuPrefix?: string;
  orderSuffix?: string;
  remainingQty: number;
  onConfirmImport: (importedRows: Partial<ProductionIdentifier>[]) => void;
}

export function ProductionIdentifierExcelImportModal({
  open,
  onClose,
  policy,
  remainingQty,
  onConfirmImport,
}: ProductionIdentifierExcelImportModalProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<Partial<ProductionIdentifier>[]>(
    [],
  );
  const [parsingError, setParsingError] = useState<string>("");

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFileName("");
      setParsedRows([]);
      setParsingError("");
      onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsingError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        if (!rawData || rawData.length === 0) {
          setParsingError(
            t(
              "File Excel không có dữ liệu hoặc định dạng bảng tính không hợp lệ",
            ),
          );
          setParsedRows([]);
          return;
        }

        const extracted: Partial<ProductionIdentifier>[] = [];

        rawData.forEach((row: any) => {
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
            row["Số Serial xe (*)"] ||
            row["Số Serial xe (tùy chọn)"] ||
            row["Số Serial xe"] ||
            row["Serial xe"] ||
            row["vehicleSerialNo"] ||
            "";

          const iSerial =
            row["Số Serial nội bộ (*)"] ||
            row["Số Serial nội bộ"] ||
            row["Serial nội bộ"] ||
            row["Số Serial phụ tùng (*)"] ||
            row["Số Serial"] ||
            row["Serial"] ||
            row["internalSerialNo"] ||
            "";

          const lot = row["Số Lô (*)"] || row["Số Lô"] || row["lotNo"] || "";
          const note = row["Ghi chú"] || row["Notes"] || "";

          if (policy === "VEHICLE") {
            if (vin || engine || vSerial || iSerial) {
              extracted.push({
                vinNo: String(vin).trim(),
                engineNo: String(engine).trim(),
                serialNo: vSerial ? String(vSerial).trim() : "",
                internalSerialNo: iSerial ? String(iSerial).trim() : "",
                notes: note ? String(note).trim() : "",
              });
            }
          } else if (policy === "SERIAL") {
            if (iSerial || vSerial) {
              const serialVal = String(iSerial || vSerial).trim();
              extracted.push({
                serialNo: serialVal,
                internalSerialNo: serialVal,
                notes: note ? String(note).trim() : "",
              });
            }
          } else if (policy === "LOT") {
            if (lot) {
              extracted.push({
                lotNo: String(lot).trim(),
                notes: note ? String(note).trim() : "",
              });
            }
          } else {
            if (note || iSerial) {
              extracted.push({
                notes: String(note || iSerial).trim(),
              });
            }
          }
        });

        if (extracted.length === 0) {
          setParsingError(
            t(
              "Không tìm thấy cột thông tin phù hợp với chính sách định danh trong file Excel",
            ),
          );
        }
        setParsedRows(extracted);
      } catch (err: any) {
        setParsingError(
          err?.message ||
            t("Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng tệp"),
        );
        setParsedRows([]);
      }
    };

    reader.readAsBinaryString(file);
    // Reset file input value to allow selecting same file again if needed
    e.target.value = "";
  };

  // Sliced rows to import based on remaining qty
  const validCount = parsedRows.length;
  const isOverflow = validCount > remainingQty;
  const importableCount = Math.min(validCount, remainingQty);
  const rowsToImport = useMemo(
    () => parsedRows.slice(0, remainingQty),
    [parsedRows, remainingQty],
  );

  const handleConfirm = () => {
    if (rowsToImport.length === 0) return;
    onConfirmImport(rowsToImport);
    showToast({
      title: t(
        `Đã nạp thành công ${rowsToImport.length} dòng từ file Excel (Chế độ Append)`,
      ),
      variant: "success",
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                {t("Nhập dữ liệu định danh từ file Excel")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("Nạp thông tin Số khung, Số máy, Serial từ file Excel")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Append Mode Notice Banner */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex items-start gap-3">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-foreground mb-0.5">
                {t("Chế độ Nạp Nối Tiếp (Append Mode):")}
              </p>
              <p className="text-muted-foreground">
                {t(
                  "Dữ liệu từ file Excel sẽ được nạp nối tiếp vào các dòng mới chưa sản xuất. Toàn bộ các dòng đã xuất xưởng trước đó được bảo toàn nguyên vẹn 100%.",
                )}
              </p>
            </div>
          </div>

          {/* File Upload Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-5 text-center cursor-pointer transition-colors bg-surface hover:bg-surface-hover flex flex-col items-center justify-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            {fileName ? (
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{fileName}</span>
                <Badge variant="outline" className="text-[10px] ml-1">
                  {validCount} {t("dòng")}
                </Badge>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t("Nhấn để chọn file Excel hoặc CSV")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("Hỗ trợ định dạng .xlsx, .xls, .csv")}
                </p>
              </div>
            )}
          </div>

          {/* Parsing Error */}
          {parsingError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{parsingError}</span>
            </div>
          )}

          {/* Validation & Stats when rows are parsed */}
          {validCount > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-border bg-surface">
                  <div className="text-muted-foreground text-[11px]">
                    {t("Số lượng cần khai báo còn lại")}
                  </div>
                  <div className="text-sm font-semibold font-mono text-foreground mt-0.5">
                    {remainingQty} {t("đơn vị")}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-surface">
                  <div className="text-muted-foreground text-[11px]">
                    {t("Số dòng tìm thấy trong file")}
                  </div>
                  <div className="text-sm font-semibold font-mono text-foreground mt-0.5 flex items-center gap-1.5">
                    <span>{validCount}</span>
                    {validCount <= remainingQty ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Overflow Warning */}
              {isOverflow && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-semibold">
                      {t("Cảnh báo vượt số lượng:")}{" "}
                    </span>
                    {t(
                      `File Excel chứa ${validCount} dòng, vượt quá số lượng sản xuất còn lại (${remainingQty} dòng). Hệ thống sẽ chỉ nạp đúng ${importableCount} dòng đầu tiên để đảm bảo kế hoạch.`,
                    )}
                  </div>
                </div>
              )}

              {/* Mini Preview Table */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {t("Xem trước dữ liệu sẽ nạp")} (
                  {Math.min(5, rowsToImport.length)} / {rowsToImport.length}{" "}
                  {t("dòng")}):
                </div>
                <div className="border border-border rounded-lg overflow-x-auto max-h-[140px] text-xs">
                  <table className="w-full border-collapse">
                    <thead className="bg-muted/70 sticky top-0 border-b border-border">
                      <tr className="text-[11px] text-muted-foreground">
                        <th className="p-1.5 text-center w-8">#</th>
                        {policy === "VEHICLE" && (
                          <>
                            <th className="p-1.5 text-left font-medium">VIN</th>
                            <th className="p-1.5 text-left font-medium">
                              Số máy
                            </th>
                            <th className="p-1.5 text-left font-medium">
                              Serial xe
                            </th>
                            <th className="p-1.5 text-left font-medium">
                              Serial nội bộ
                            </th>
                          </>
                        )}
                        {policy === "SERIAL" && (
                          <th className="p-1.5 text-left font-medium">
                            Số Serial
                          </th>
                        )}
                        {policy === "LOT" && (
                          <th className="p-1.5 text-left font-medium">Số Lô</th>
                        )}
                        <th className="p-1.5 text-left font-medium">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono">
                      {rowsToImport.slice(0, 5).map((r, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="p-1.5 text-center text-muted-foreground text-[11px]">
                            {i + 1}
                          </td>
                          {policy === "VEHICLE" && (
                            <>
                              <td className="p-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                                {r.vinNo || "—"}
                              </td>
                              <td className="p-1.5 text-foreground">
                                {r.engineNo || "—"}
                              </td>
                              <td className="p-1.5 text-muted-foreground">
                                {r.serialNo || "—"}
                              </td>
                              <td className="p-1.5 text-primary font-medium">
                                {r.internalSerialNo || "—"}
                              </td>
                            </>
                          )}
                          {policy === "SERIAL" && (
                            <td className="p-1.5 text-foreground">
                              {r.serialNo || "—"}
                            </td>
                          )}
                          {policy === "LOT" && (
                            <td className="p-1.5 text-foreground">
                              {r.lotNo || "—"}
                            </td>
                          )}
                          <td className="p-1.5 font-sans text-muted-foreground truncate max-w-[120px]">
                            {r.notes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
          >
            {t("Hủy bỏ")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={rowsToImport.length === 0}
            onClick={handleConfirm}
            className="gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {t("Đồng ý nạp")} {rowsToImport.length} {t("dòng")}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

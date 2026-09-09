import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  ClipboardList,
  FileSpreadsheet,
  Download,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
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
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { EmptyState } from "@/shared/components/EmptyState";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import {
  goodsReceiptsCoreApi,
  type ErpGrDeclaredSerial,
} from "../api/goodsReceiptsCoreApi";

interface GoodsReceiptSerialDrawerProps {
  open: boolean;
  onClose: () => void;
  viewOnly?: boolean;
  itemId?: string;
  itemSku?: string;
  itemName?: string;
  trackingPolicyCode?: string;
  trackingPolicyName?: string;
  requiredQty: number;
  receiptDate?: string;
  initialSerials?: ErpGrDeclaredSerial[];
  onSaveSerials: (serials: ErpGrDeclaredSerial[]) => void;
}

export function GoodsReceiptSerialDrawer({
  open,
  onClose,
  viewOnly = false,
  itemId,
  itemSku = "",
  itemName = "",
  trackingPolicyCode = "SERIAL",
  trackingPolicyName = "Theo Serial Number",
  requiredQty,
  receiptDate,
  initialSerials = [],
  onSaveSerials,
}: GoodsReceiptSerialDrawerProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"view" | "edit">(viewOnly ? "view" : "edit");
  const [serials, setSerials] = useState<ErpGrDeclaredSerial[]>([]);
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [dbDuplicates, setDbDuplicates] = useState<string[]>([]);

  const isVehicle = trackingPolicyCode === "VEHICLE";

  useEffect(() => {
    if (open) {
      setMode(viewOnly ? "view" : "edit");
      setSerials(
        initialSerials && initialSerials.length > 0
          ? initialSerials.map((s) => ({
              ...s,
              vinNo: s.vinNo || s.attributes?.vinNo || "",
              engineNo: s.engineNo || s.attributes?.engineNo || "",
              serialNo:
                s.serialNo ||
                s.attributes?.serialNo ||
                s.attributes?.vehicleSerialNo ||
                "",
              internalSerialNo:
                s.internalSerialNo || s.attributes?.internalSerialNo || "",
              notes: s.notes || "",
            }))
          : [],
      );
      setDbDuplicates([]);
      setIsBulkPasteOpen(false);
      setBulkText("");
    }
  }, [open, viewOnly, initialSerials]);

  // Internal duplicates detection for all key fields
  const internalDuplicates = useMemo(() => {
    const vinCounts = new Map<string, number>();
    const engCounts = new Map<string, number>();
    const serCounts = new Map<string, number>();
    const iSerCounts = new Map<string, number>();

    serials.forEach((s) => {
      const vin = s.vinNo?.trim().toUpperCase();
      if (vin) vinCounts.set(vin, (vinCounts.get(vin) || 0) + 1);

      const eng = s.engineNo?.trim().toUpperCase();
      if (eng) engCounts.set(eng, (engCounts.get(eng) || 0) + 1);

      const ser = s.serialNo?.trim().toUpperCase();
      if (ser) serCounts.set(ser, (serCounts.get(ser) || 0) + 1);

      const iSer = s.internalSerialNo?.trim().toUpperCase();
      if (iSer) iSerCounts.set(iSer, (iSerCounts.get(iSer) || 0) + 1);
    });

    const getDupes = (map: Map<string, number>) => {
      const set = new Set<string>();
      map.forEach((count, key) => {
        if (count > 1) set.add(key);
      });
      return set;
    };

    return {
      vins: getDupes(vinCounts),
      engines: getDupes(engCounts),
      serials: getDupes(serCounts),
      internalSerials: getDupes(iSerCounts),
    };
  }, [serials]);

  // Handle single serial field update
  const handleUpdateSerial = (
    index: number,
    field: keyof ErpGrDeclaredSerial,
    value: string,
  ) => {
    setSerials((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Add empty row (limited to requiredQty)
  const handleAddRow = () => {
    if (serials.length >= requiredQty) {
      showToast({
        title: t(
          "inventory.maxSerialsReached",
          `Đã đạt số lượng tối đa cần khai báo (${requiredQty} mã)`,
        ),
        variant: "default",
      });
      return;
    }

    const nextIdx = serials.length + 1;
    const cleanSku = (itemSku || "ITEM").replace(/[^a-zA-Z0-9_-]/g, "");
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;
    const padIndex = String(nextIdx).padStart(3, "0");

    if (isVehicle) {
      setSerials((prev) => [
        ...prev,
        {
          vinNo: "",
          engineNo: "",
          serialNo: "",
          internalSerialNo: `SN-${cleanSku}-${dateStr}-${padIndex}`,
          notes: "",
        },
      ]);
    } else {
      setSerials((prev) => [...prev, { serialNo: "", notes: "" }]);
    }
  };

  // Remove row
  const handleRemoveRow = (index: number) => {
    setSerials((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all
  const handleClearAll = () => {
    setSerials([]);
    setDbDuplicates([]);
  };

  // Auto generate serials / vehicle attributes (OVERWRITE current list with exact requiredQty)
  const handleAutoGenerate = async () => {
    const qty = Math.max(1, requiredQty);
    const cleanSku = (itemSku || "ITEM").replace(/[^a-zA-Z0-9_-]/g, "");
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;

    if (isVehicle) {
      const newRows: ErpGrDeclaredSerial[] = Array.from(
        { length: qty },
        (_, i) => {
          const pad = String(i + 1).padStart(3, "0");
          return {
            vinNo: `VIN-${cleanSku}-${dateStr}-${pad}`,
            engineNo: `ENG-${cleanSku}-${dateStr}-${pad}`,
            serialNo: `SER-${cleanSku}-${dateStr}-${pad}`,
            internalSerialNo: `SN-${cleanSku}-${dateStr}-${pad}`,
            notes: "",
            attributes: {
              vinNo: `VIN-${cleanSku}-${dateStr}-${pad}`,
              engineNo: `ENG-${cleanSku}-${dateStr}-${pad}`,
              vehicleSerialNo: `SER-${cleanSku}-${dateStr}-${pad}`,
              internalSerialNo: `SN-${cleanSku}-${dateStr}-${pad}`,
            },
          };
        },
      );
      setSerials(newRows);
      setDbDuplicates([]);
      showToast({
        title: t(
          "inventory.serialsGenerated",
          `Đã tự động sinh ${newRows.length} bộ thông tin xe (Số khung, Số máy, Serial xe, Serial nội bộ)`,
        ),
        variant: "success",
      });
      return;
    }

    if (!itemId) {
      showToast({
        title: t(
          "inventory.warnings.selectItemFirst",
          "Vui lòng chọn item trước khi sinh mã",
        ),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const res = await goodsReceiptsCoreApi.autoGeneratePreview({
        itemId,
        qty,
        receiptDate,
      });

      const newRows: ErpGrDeclaredSerial[] = (res.serials || [])
        .slice(0, qty)
        .map((sn) => ({
          serialNo: sn,
          notes: "",
        }));

      setSerials(newRows);
      setDbDuplicates([]);
      showToast({
        title: t(
          "inventory.serialsGenerated",
          `Đã tự động sinh ${newRows.length} mã serial (ghi đè)`,
        ),
        variant: "success",
      });
    } catch (err: any) {
      showToast({
        title:
          err?.response?.data?.message ||
          t("inventory.errors.generatingSerials", "Lỗi khi sinh mã serial"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const prefix = itemSku ? itemSku.replace(/[^a-zA-Z0-9_-]/g, "") : "ITEM";

    let headers: string[];
    let sampleRows: any[][];
    let fileName: string;

    if (isVehicle) {
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
          `VIN-${prefix}-00001`,
          `ENG-${prefix}-00001`,
          `SER-${prefix}-00001`,
          `SN-${prefix}-00001`,
          "Xe tiêu chuẩn",
        ],
        [
          `VIN-${prefix}-00002`,
          `ENG-${prefix}-00002`,
          `SER-${prefix}-00002`,
          `SN-${prefix}-00002`,
          "",
        ],
      ];
      fileName = `Mau_Khai_Bao_Xe_${prefix}.xlsx`;
    } else {
      headers = ["Số serial (*)", "Ghi chú"];
      sampleRows = [
        headers,
        [`SN-${prefix}-00001`, "Hàng mới 100%"],
        [`SN-${prefix}-00002`, ""],
        [`SN-${prefix}-00003`, ""],
      ];
      fileName = `Mau_Khai_Bao_Serial_${prefix}.xlsx`;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sampleRows);
    ws["!cols"] = headers.map(() => ({ wch: 25 }));
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Khai_Bao");
    XLSX.writeFile(wb, fileName);

    showToast({
      title: t(
        "inventory.templateDownloaded",
        "Đã tải file Excel mẫu thành công",
      ),
      variant: "success",
    });
  };

  // Bulk paste submit
  const handleApplyBulkPaste = () => {
    if (!bulkText.trim()) {
      setIsBulkPasteOpen(false);
      return;
    }

    const lines = bulkText
      .split(/[\r\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setIsBulkPasteOpen(false);
      return;
    }

    const newRows: ErpGrDeclaredSerial[] = [];
    lines.forEach((line) => {
      const cols = line.includes("\t")
        ? line.split("\t").map((c) => c.trim())
        : line.includes(",")
          ? line.split(",").map((c) => c.trim())
          : [line];

      if (isVehicle) {
        if (cols.length >= 4) {
          newRows.push({
            vinNo: cols[0],
            engineNo: cols[1],
            serialNo: cols[2],
            internalSerialNo: cols[3],
            notes: cols[4] || "",
            attributes: {
              vinNo: cols[0],
              engineNo: cols[1],
              vehicleSerialNo: cols[2],
              internalSerialNo: cols[3],
            },
          });
        } else if (cols.length === 2) {
          newRows.push({
            vinNo: cols[0],
            engineNo: cols[1],
            serialNo: "",
            internalSerialNo: "",
            notes: "",
          });
        } else {
          newRows.push({
            vinNo: cols[0],
            engineNo: "",
            serialNo: "",
            internalSerialNo: "",
            notes: "",
          });
        }
      } else {
        newRows.push({
          serialNo: cols[0],
          notes: cols[1] || "",
        });
      }
    });

    const maxAllowed = Math.max(0, requiredQty - serials.length);
    const validRows = maxAllowed > 0 ? newRows.slice(0, maxAllowed) : newRows;

    setSerials((prev) => [...prev, ...validRows]);
    setBulkText("");
    setIsBulkPasteOpen(false);
    showToast({
      title: t("inventory.serialsAdded", `Đã thêm ${validRows.length} dòng`),
      variant: "success",
    });
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

        const newRows: ErpGrDeclaredSerial[] = [];
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
            row["internalSerialNo"] ||
            "";

          const generalSerial =
            row["Số serial (*)"] ||
            row["Số serial"] ||
            row["Serial"] ||
            row["Serial No"] ||
            row["Mã Serial"] ||
            row["serial_no"] ||
            Object.values(row)[0];

          const note = row["Ghi chú"] || row["Notes"] || "";

          if (isVehicle) {
            if (vin || engine || vSerial || iSerial) {
              newRows.push({
                vinNo: String(vin || "").trim(),
                engineNo: String(engine || "").trim(),
                serialNo: String(vSerial || generalSerial || "").trim(),
                internalSerialNo: String(iSerial || "").trim(),
                notes: note ? String(note).trim() : null,
                attributes: {
                  vinNo: String(vin || "").trim(),
                  engineNo: String(engine || "").trim(),
                  vehicleSerialNo: String(
                    vSerial || generalSerial || "",
                  ).trim(),
                  internalSerialNo: String(iSerial || "").trim(),
                },
              });
            }
          } else {
            if (generalSerial && String(generalSerial).trim()) {
              newRows.push({
                serialNo: String(generalSerial).trim(),
                notes: note ? String(note).trim() : null,
              });
            }
          }
        });

        if (newRows.length > 0) {
          const maxAllowed = Math.max(0, requiredQty - serials.length);
          const limitedRows =
            maxAllowed > 0 ? newRows.slice(0, maxAllowed) : newRows;

          setSerials((prev) => {
            const combined =
              prev.length === 0 ? limitedRows : [...prev, ...limitedRows];
            return combined;
          });
          showToast({
            title: t(
              "inventory.excelImported",
              `Đã nhập ${limitedRows.length} dòng từ file Excel`,
            ),
            variant: "success",
          });
        } else {
          showToast({
            title: t(
              "inventory.noSerialsInExcel",
              "Không tìm thấy dữ liệu phù hợp trong file Excel",
            ),
            variant: "default",
          });
        }
      } catch {
        showToast({
          title: t("inventory.excelReadError", "Lỗi đọc file Excel"),
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  // Save / Validate
  const handleSave = async () => {
    if (isVehicle) {
      if (serials.length === 0 && requiredQty > 0) {
        showToast({
          title: t(
            "inventory.noSerialsEntered",
            "Chưa có thông tin xe nào được khai báo",
          ),
          variant: "destructive",
        });
        return;
      }

      // Validate 4 required fields for VEHICLE
      for (let i = 0; i < serials.length; i++) {
        const row = serials[i];
        const missing: string[] = [];
        if (!row.vinNo?.trim()) missing.push(t("Số khung (VIN)"));
        if (!row.engineNo?.trim()) missing.push(t("Số máy"));
        if (!row.serialNo?.trim()) missing.push(t("Số Serial xe"));
        if (!row.internalSerialNo?.trim()) missing.push(t("Số Serial nội bộ"));

        if (missing.length > 0) {
          showToast({
            title: t(
              `Dòng #${i + 1} còn thiếu: ${missing.join(", ")} (Bắt buộc đủ 4 trường)`,
            ),
            variant: "destructive",
          });
          return;
        }
      }

      // Check duplicates
      if (
        internalDuplicates.vins.size > 0 ||
        internalDuplicates.engines.size > 0 ||
        internalDuplicates.serials.size > 0 ||
        internalDuplicates.internalSerials.size > 0
      ) {
        const dupMessages: string[] = [];
        if (internalDuplicates.vins.size > 0)
          dupMessages.push(t("Số khung (VIN)"));
        if (internalDuplicates.engines.size > 0) dupMessages.push(t("Số máy"));
        if (internalDuplicates.serials.size > 0)
          dupMessages.push(t("Số Serial xe"));
        if (internalDuplicates.internalSerials.size > 0)
          dupMessages.push(t("Số Serial nội bộ"));

        showToast({
          title: t(
            `Có thông tin bị trùng lặp trong danh sách: ${dupMessages.join(", ")}`,
          ),
          variant: "destructive",
        });
        return;
      }

      // Check against DB
      try {
        setIsValidating(true);
        const checkList = serials
          .map((s) => s.serialNo?.trim())
          .filter(Boolean) as string[];

        if (checkList.length > 0) {
          const valRes = await goodsReceiptsCoreApi.validateSerials({
            itemId,
            serials: checkList,
          });

          if (!valRes.valid && valRes.dbDuplicates?.length > 0) {
            setDbDuplicates(valRes.dbDuplicates);
            showToast({
              title: t(
                "inventory.dbDuplicatesFound",
                `Phát hiện ${valRes.dbDuplicates.length} mã serial xe đã tồn tại trong kho: ${valRes.dbDuplicates.join(", ")}`,
              ),
              variant: "destructive",
            });
            return;
          }
        }

        setDbDuplicates([]);
        const formattedRows: ErpGrDeclaredSerial[] = serials.map((r) => ({
          serialNo: r.serialNo.trim(),
          vinNo: r.vinNo?.trim() || null,
          engineNo: r.engineNo?.trim() || null,
          internalSerialNo: r.internalSerialNo?.trim() || null,
          notes: r.notes?.trim() || null,
          attributes: {
            vinNo: r.vinNo?.trim() || "",
            engineNo: r.engineNo?.trim() || "",
            vehicleSerialNo: r.serialNo?.trim() || "",
            internalSerialNo: r.internalSerialNo?.trim() || "",
          },
        }));

        onSaveSerials(formattedRows);
        showToast({
          title: t(
            "inventory.serialsSaved",
            "Đã lưu đầy đủ thông tin định danh xe",
          ),
          variant: "success",
        });
        onClose();
      } catch (err: any) {
        showToast({
          title:
            err?.response?.data?.message ||
            t("inventory.validationError", "Lỗi kiểm tra dữ liệu"),
          variant: "destructive",
        });
      } finally {
        setIsValidating(false);
      }
      return;
    }

    // Default Non-Vehicle Flow
    const validRows = serials.filter((s) => s.serialNo && s.serialNo.trim());
    if (validRows.length === 0 && requiredQty > 0) {
      showToast({
        title: t(
          "inventory.noSerialsEntered",
          "Chưa có mã serial nào được nhập",
        ),
        variant: "destructive",
      });
      return;
    }

    if (internalDuplicates.serials.size > 0) {
      showToast({
        title: t(
          "inventory.internalDuplicatesFound",
          "Có mã Serial bị trùng lặp trong danh sách, vui lòng kiểm tra lại",
        ),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsValidating(true);
      const valRes = await goodsReceiptsCoreApi.validateSerials({
        itemId,
        serials: validRows.map((s) => s.serialNo.trim()),
      });

      if (!valRes.valid && valRes.dbDuplicates?.length > 0) {
        setDbDuplicates(valRes.dbDuplicates);
        showToast({
          title: t(
            "inventory.dbDuplicatesFound",
            `Phát hiện ${valRes.dbDuplicates.length} mã serial đã tồn tại trong kho: ${valRes.dbDuplicates.join(", ")}`,
          ),
          variant: "destructive",
        });
        return;
      }

      setDbDuplicates([]);
      onSaveSerials(validRows);
      showToast({
        title: t("inventory.serialsSaved", "Đã lưu danh sách mã Serial"),
        variant: "success",
      });
      onClose();
    } catch (err: any) {
      showToast({
        title:
          err?.response?.data?.message ||
          t("inventory.validationError", "Lỗi kiểm tra trùng lặp serial"),
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const isComplete = serials.length === requiredQty;
  const isOver = serials.length > requiredQty;
  const isMaxReached = serials.length >= requiredQty;

  const actions =
    mode === "edit"
      ? [
          {
            label: t("common.cancel", "Hủy"),
            onClick: onClose,
          },
          {
            label: isValidating
              ? t("common.validating", "Đang kiểm tra...")
              : t("common.save", "Lưu"),
            primary: true,
            onClick: handleSave,
          },
        ]
      : [{ label: t("common.close", "Đóng"), onClick: onClose }];

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={viewOnly ? undefined : () => setMode("edit")}
      title={
        isVehicle
          ? t(
              "Khai báo Định danh Xe (Số khung, Số máy, Serial)",
              "Khai báo Định danh Xe",
            )
          : t("inventory.serialDrawer.title", "Khai báo Serial / Mã định danh")
      }
      subtitle={`${itemSku} — ${itemName}`}
      titleExtra={
        <Badge
          variant={
            isComplete ? "default" : isOver ? "destructive" : "secondary"
          }
          className="ml-2"
        >
          {isComplete && <CheckCircle2 className="w-3 h-3 mr-1" />}
          {!isComplete && <AlertTriangle className="w-3 h-3 mr-1" />}
          {serials.length}/{requiredQty}{" "}
          {isVehicle ? t("xe") : t("inventory.serialsCount", "mã")}
        </Badge>
      }
      layout="1-column"
      size={isVehicle ? "xl" : "lg"}
      confirmOnClose={mode === "edit"}
      actions={actions}
      leftPanel={
        <div className="flex flex-col gap-5">
          {/* Hidden File Input for Excel Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImportExcel}
          />

          {/* Summary section */}
          <DrawerSection
            title={t("inventory.lineInfoSection", "Thông tin dòng hàng")}
          >
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label={t("inventory.fields.sku", "Mã SKU")}>
                <div className="font-semibold text-sm">{itemSku || "—"}</div>
              </DrawerField>
              <DrawerField
                label={t("inventory.fields.itemName", "Tên hàng hóa")}
              >
                <div className="font-medium text-sm">{itemName || "—"}</div>
              </DrawerField>
              <DrawerField
                label={t(
                  "inventory.fields.trackingPolicy",
                  "Chính sách theo dõi",
                )}
              >
                <Badge variant="outline" className="font-medium">
                  {trackingPolicyName || trackingPolicyCode}
                </Badge>
              </DrawerField>
              <DrawerField
                label={t(
                  "inventory.fields.requiredQty",
                  "Số lượng cần khai báo",
                )}
              >
                <div className="text-sm font-bold text-primary">
                  {requiredQty} {t("inventory.units", "đơn vị")}
                </div>
              </DrawerField>
            </div>
          </DrawerSection>

          {/* Bulk Paste Modal Section */}
          {isBulkPasteOpen && mode === "edit" && (
            <div className="p-4 bg-muted/40 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {isVehicle
                    ? t(
                        "Dán nhanh danh sách xe (Mỗi dòng: Số khung [tab/phẩy] Số máy [tab/phẩy] Serial xe [tab/phẩy] Serial nội bộ)",
                      )
                    : t(
                        "inventory.bulkPasteTitle",
                        "Dán nhanh danh sách Serial (Mỗi mã 1 dòng hoặc cách nhau dấu phẩy)",
                      )}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs"
                  onClick={() => setIsBulkPasteOpen(false)}
                >
                  {t("common.close", "Đóng")}
                </Button>
              </div>
              <textarea
                className={`${inputCls} min-h-[120px] font-mono text-xs`}
                placeholder={
                  isVehicle
                    ? `VIN-001\tENG-001\tSER-001\tSN-001\nVIN-002\tENG-002\tSER-002\tSN-002`
                    : `SN-001\nSN-002\nSN-003`
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
                  {t("common.cancel", "Hủy")}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleApplyBulkPaste}
                >
                  {t("common.apply", "Áp dụng")}
                </Button>
              </div>
            </div>
          )}

          {/* Serials Table Section */}
          <DrawerSection
            title={
              isVehicle
                ? t("Danh sách định danh xe xuất xưởng")
                : t(
                    "inventory.serialListSection",
                    "Danh sách mã Serial / Định danh",
                  )
            }
            titleExtra={
              mode === "edit" ? (
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-semibold gap-1"
                    disabled={isMaxReached}
                    onClick={handleAddRow}
                    title={
                      isMaxReached
                        ? t("Đã đạt số lượng tối đa cần khai báo")
                        : undefined
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t("common.addRow", "Thêm dòng")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-semibold gap-1 text-primary border-primary/30 hover:bg-primary/5"
                    disabled={isGenerating}
                    onClick={handleAutoGenerate}
                    title={t(
                      "Tự động sinh đúng số lượng cần khai báo (ghi đè danh sách hiện tại)",
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGenerating
                      ? t("common.generating", "Đang sinh...")
                      : isVehicle
                        ? t("Tự động sinh mã xe")
                        : t("inventory.autoGenerateBtn", "Tự động sinh mã")}
                  </Button>

                  {/* Grouped Actions Dropdown */}
                  <ActionDropdown
                    align="end"
                    items={[
                      {
                        groupLabel: t("TỰ ĐỘNG & HÀNG LOẠT"),
                        items: [
                          {
                            label: isVehicle
                              ? t("Tự động sinh mã xe")
                              : t("Tự động sinh mã"),
                            icon: <Sparkles className="w-4 h-4 text-primary" />,
                            onClick: handleAutoGenerate,
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
                            label: isVehicle
                              ? t("Tải file mẫu Excel xe")
                              : t("Tải file mẫu Excel"),
                            icon: (
                              <Download className="w-4 h-4 text-emerald-600" />
                            ),
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
                      ...(serials.length > 0
                        ? [
                            {
                              groupLabel: t("KHÁC"),
                              items: [
                                {
                                  label: t("Xóa toàn bộ"),
                                  icon: <Trash2 className="w-4 h-4" />,
                                  variant: "danger" as const,
                                  onClick: handleClearAll,
                                },
                              ],
                            },
                          ]
                        : []),
                    ]}
                    customTrigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold gap-1"
                      >
                        <span>{t("common.actions", "Thao tác")}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    }
                  />
                </div>
              ) : undefined
            }
          >
            {serials.length === 0 ? (
              <EmptyState
                size="sm"
                message={
                  isVehicle
                    ? t("Chưa có thông tin xe nào được khai báo")
                    : t(
                        "inventory.noSerialsTitle",
                        "Chưa có mã Serial nào được khai báo",
                      )
                }
                description={t(
                  "inventory.noSerialsHint",
                  "Hãy bấm 'Thêm dòng', 'Tự động sinh mã' hoặc 'Dán nhanh' để bắt đầu.",
                )}
                className="border border-dashed rounded-lg py-8 bg-muted/10 my-1"
              />
            ) : (
              <div className="border rounded-lg overflow-hidden bg-surface shadow-panel">
                <div className="max-h-[380px] overflow-y-auto relative">
                  <Table className="w-full table-fixed border-collapse text-xs">
                    <TableHeader className="sticky top-0 z-30 table-header-glass bg-muted/80 backdrop-blur-sm border-b border-border shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)]">
                      <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
                        <TableHead className="sticky top-0 bg-transparent z-20 w-[40px] min-w-[40px] text-center border-r border-border py-2 px-3">
                          #
                        </TableHead>

                        {isVehicle ? (
                          <>
                            <TableHead className="sticky top-0 bg-transparent z-20 min-w-[170px] border-r border-border py-2 px-3">
                              {t("Số khung (VIN) *")}
                            </TableHead>
                            <TableHead className="sticky top-0 bg-transparent z-20 min-w-[160px] border-r border-border py-2 px-3">
                              {t("Số máy *")}
                            </TableHead>
                            <TableHead className="sticky top-0 bg-transparent z-20 min-w-[150px] border-r border-border py-2 px-3">
                              {t("Số Serial xe *")}
                            </TableHead>
                            <TableHead className="sticky top-0 bg-transparent z-20 min-w-[180px] border-r border-border py-2 px-3">
                              {t("Số Serial nội bộ *")}
                            </TableHead>
                          </>
                        ) : (
                          <TableHead className="sticky top-0 bg-transparent z-20 min-w-[220px] border-r border-border py-2 px-3">
                            {t(
                              "inventory.fields.serialNo",
                              "Số Serial / Mã định danh *",
                            )}
                          </TableHead>
                        )}

                        <TableHead className="sticky top-0 bg-transparent z-20 min-w-[150px] border-r border-border py-2 px-3">
                          {t("inventory.fields.notes", "Ghi chú")}
                        </TableHead>
                        {mode === "edit" && (
                          <TableHead className="sticky top-0 bg-muted z-20 w-[55px] text-center border-r border-border py-2 px-3">
                            {t("common.delete", "Xóa")}
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serials.map((row, idx) => {
                        const trimmedVin = row.vinNo?.trim().toUpperCase();
                        const trimmedEng = row.engineNo?.trim().toUpperCase();
                        const trimmedSn = row.serialNo?.trim().toUpperCase();
                        const trimmedISn = row.internalSerialNo
                          ?.trim()
                          .toUpperCase();

                        const isVinDupe =
                          trimmedVin && internalDuplicates.vins.has(trimmedVin);
                        const isEngDupe =
                          trimmedEng &&
                          internalDuplicates.engines.has(trimmedEng);
                        const isSerDupe =
                          trimmedSn &&
                          internalDuplicates.serials.has(trimmedSn);
                        const isISerDupe =
                          trimmedISn &&
                          internalDuplicates.internalSerials.has(trimmedISn);

                        const isDbDupe =
                          trimmedSn &&
                          dbDuplicates.some(
                            (d) => d.toUpperCase() === trimmedSn,
                          );

                        const hasAnyError =
                          isVinDupe ||
                          isEngDupe ||
                          isSerDupe ||
                          isISerDupe ||
                          isDbDupe;

                        return (
                          <TableRow
                            key={idx}
                            className={cn(
                              "hover:bg-surface-hover transition-colors",
                              hasAnyError && "bg-red-50/50 dark:bg-red-950/20",
                            )}
                          >
                            <TableCell className="py-2 px-3 text-center text-muted-foreground border-r border-border tabular-nums">
                              {idx + 1}
                            </TableCell>

                            {isVehicle ? (
                              <>
                                {/* VIN */}
                                <TableCell className="py-1.5 px-3 border-r border-border">
                                  {mode === "edit" ? (
                                    <div>
                                      <input
                                        className={`${inputCls} h-8 font-mono text-xs ${
                                          isVinDupe || !row.vinNo?.trim()
                                            ? "border-destructive/80 focus-visible:ring-destructive"
                                            : ""
                                        }`}
                                        placeholder={t("Nhập số VIN...")}
                                        value={row.vinNo || ""}
                                        onChange={(e) =>
                                          handleUpdateSerial(
                                            idx,
                                            "vinNo",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      {isVinDupe && (
                                        <span className="text-[10px] text-destructive block mt-0.5">
                                          {t("Trùng lặp VIN")}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
                                      {row.vinNo || "—"}
                                    </span>
                                  )}
                                </TableCell>

                                {/* Engine No */}
                                <TableCell className="py-1.5 px-3 border-r border-border">
                                  {mode === "edit" ? (
                                    <div>
                                      <input
                                        className={`${inputCls} h-8 font-mono text-xs ${
                                          isEngDupe || !row.engineNo?.trim()
                                            ? "border-destructive/80 focus-visible:ring-destructive"
                                            : ""
                                        }`}
                                        placeholder={t("Nhập số máy...")}
                                        value={row.engineNo || ""}
                                        onChange={(e) =>
                                          handleUpdateSerial(
                                            idx,
                                            "engineNo",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      {isEngDupe && (
                                        <span className="text-[10px] text-destructive block mt-0.5">
                                          {t("Trùng lặp số máy")}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="font-mono font-medium">
                                      {row.engineNo || "—"}
                                    </span>
                                  )}
                                </TableCell>

                                {/* Vehicle Serial No */}
                                <TableCell className="py-1.5 px-3 border-r border-border">
                                  {mode === "edit" ? (
                                    <div>
                                      <input
                                        className={`${inputCls} h-8 font-mono text-xs ${
                                          isSerDupe ||
                                          isDbDupe ||
                                          !row.serialNo?.trim()
                                            ? "border-destructive/80 focus-visible:ring-destructive"
                                            : ""
                                        }`}
                                        placeholder={t("Nhập Serial xe...")}
                                        value={row.serialNo || ""}
                                        onChange={(e) =>
                                          handleUpdateSerial(
                                            idx,
                                            "serialNo",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      {isSerDupe && (
                                        <span className="text-[10px] text-destructive block mt-0.5">
                                          {t("Trùng lặp Serial")}
                                        </span>
                                      )}
                                      {isDbDupe && (
                                        <span className="text-[10px] text-destructive block mt-0.5">
                                          {t("Đã tồn tại trong kho")}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="font-mono font-medium">
                                      {row.serialNo || "—"}
                                    </span>
                                  )}
                                </TableCell>

                                {/* Internal Serial No */}
                                <TableCell className="py-1.5 px-3 border-r border-border bg-primary/5">
                                  {mode === "edit" ? (
                                    <div>
                                      <input
                                        className={`${inputCls} h-8 font-mono text-xs ${
                                          isISerDupe ||
                                          !row.internalSerialNo?.trim()
                                            ? "border-destructive/80 focus-visible:ring-destructive"
                                            : ""
                                        }`}
                                        placeholder={t("Serial nội bộ...")}
                                        value={row.internalSerialNo || ""}
                                        onChange={(e) =>
                                          handleUpdateSerial(
                                            idx,
                                            "internalSerialNo",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      {isISerDupe && (
                                        <span className="text-[10px] text-destructive block mt-0.5">
                                          {t("Trùng lặp Serial nội bộ")}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="font-mono font-medium text-primary">
                                      {row.internalSerialNo || "—"}
                                    </span>
                                  )}
                                </TableCell>
                              </>
                            ) : (
                              /* Non-vehicle Single Serial Field */
                              <TableCell className="py-1.5 px-3 border-r border-border">
                                {mode === "edit" ? (
                                  <div>
                                    <input
                                      className={`${inputCls} h-8 font-mono text-xs ${
                                        isSerDupe ||
                                        isDbDupe ||
                                        !row.serialNo?.trim()
                                          ? "border-destructive/80 focus-visible:ring-destructive"
                                          : ""
                                      }`}
                                      placeholder={t(
                                        "inventory.serialPlaceholder",
                                        "Nhập số serial...",
                                      )}
                                      value={row.serialNo}
                                      onChange={(e) =>
                                        handleUpdateSerial(
                                          idx,
                                          "serialNo",
                                          e.target.value,
                                        )
                                      }
                                    />
                                    {isSerDupe && (
                                      <span className="text-[10px] text-destructive block mt-0.5">
                                        {t(
                                          "inventory.duplicateInList",
                                          "Trùng lặp trong danh sách",
                                        )}
                                      </span>
                                    )}
                                    {isDbDupe && (
                                      <span className="text-[10px] text-destructive block mt-0.5">
                                        {t(
                                          "inventory.alreadyInStock",
                                          "Đã tồn tại trong kho (IN_STOCK)",
                                        )}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="font-mono font-medium">
                                    {row.serialNo || "—"}
                                  </span>
                                )}
                              </TableCell>
                            )}

                            {/* Notes */}
                            <TableCell className="py-1.5 px-3 border-r border-border">
                              {mode === "edit" ? (
                                <input
                                  className={`${inputCls} h-8 text-xs`}
                                  placeholder={t(
                                    "inventory.notesPlaceholder",
                                    "Ghi chú nếu có...",
                                  )}
                                  value={row.notes || ""}
                                  onChange={(e) =>
                                    handleUpdateSerial(
                                      idx,
                                      "notes",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                <span className="text-muted-foreground">
                                  {row.notes || "—"}
                                </span>
                              )}
                            </TableCell>

                            {/* Actions / Delete */}
                            {mode === "edit" && (
                              <TableCell className="py-1.5 px-3 text-center border-r border-border">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveRow(idx)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Footer summary */}
                <div className="p-2.5 bg-muted border-t border-border shadow-[0_-2px_6px_rgba(0,0,0,0.04)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {t("inventory.totalDeclared", "Tổng số lượng khai báo:")}
                    </span>
                    <span className="font-bold tabular-nums">
                      {serials.length} / {requiredQty}
                    </span>
                  </div>
                  <div>
                    {isComplete && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("inventory.qtyMatched", "Đã đủ số lượng")}
                      </span>
                    )}
                    {!isComplete && !isOver && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {t(
                          "inventory.missingSerials",
                          `Còn thiếu ${requiredQty - serials.length} ${isVehicle ? "xe" : "mã"}`,
                        )}
                      </span>
                    )}
                    {isOver && (
                      <span className="text-destructive font-medium">
                        {t(
                          "inventory.exceededSerials",
                          `Vượt quá ${serials.length - requiredQty} so với SL nhận`,
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DrawerSection>
        </div>
      }
    />
  );
}

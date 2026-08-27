import React from "react";
import {
  PlayCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ListChecks,
  Settings2,
  AlertCircle,
} from "lucide-react";
import { DrawerSection, inputCls } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DataTable } from "@/shared/components/DataTable";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import type { ErpProductionOrder } from "../../api/productionCoreApi";

const VALID_COLORS = ["DEN", "TRANG", "DO", "XANH", "XAM", "BAC"];
const COLOR_NAMES: Record<string, string> = {
  DEN: "ĐEN",
  TRANG: "TRẮNG",
  DO: "ĐỎ",
  XANH: "XANH",
  XAM: "XÁM",
  BAC: "BẠC",
};

export interface ProductionIdentifier {
  vinNo: string;
  engineNo: string;
  serialNo: string;
  colorCode: string;
  lotNo: string;
  notes: string;
  attributes: Array<{ key: string; value: string }>;
}

export type TrackingPolicy = "NONE" | "SERIAL" | "LOT" | "VEHICLE" | "CUSTOM";

export function emptyIdentifier(): ProductionIdentifier {
  return {
    vinNo: "",
    engineNo: "",
    serialNo: "",
    colorCode: "",
    lotNo: "",
    notes: "",
    attributes: [],
  };
}

export function makeIdentifierRows(qty: number): ProductionIdentifier[] {
  return Array.from({ length: Math.max(1, Math.floor(qty)) }, emptyIdentifier);
}

export function isIdentifierValid(
  id: ProductionIdentifier,
  policy: TrackingPolicy,
): boolean {
  if (policy === "VEHICLE") {
    return (
      !!id.vinNo.trim() &&
      !!id.engineNo.trim() &&
      !!id.serialNo.trim() &&
      !!id.colorCode.trim() &&
      VALID_COLORS.includes(id.colorCode.trim())
    );
  }
  if (policy === "SERIAL") return !!id.serialNo.trim();
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
  const seenSerial = new Set<string>();
  for (const row of ids) {
    const vin = row.vinNo.trim().toUpperCase();
    const engine = row.engineNo.trim().toUpperCase();
    const serial = row.serialNo.trim().toUpperCase();
    if (serial) {
      if (seenSerial.has(serial)) return "Số Seri bị trùng trong danh sách";
      seenSerial.add(serial);
    }
    if (vin) {
      if (seenVin.has(vin)) return "Số VIN bị trùng trong danh sách";
      seenVin.add(vin);
    }
    if (engine) {
      if (seenEngine.has(engine)) return "Số máy bị trùng trong danh sách";
      seenEngine.add(engine);
    }
  }
  return null;
}

export function parseVehicleBulkInput(input: string): ProductionIdentifier[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      const serialNo = (parts[0] ?? "").trim();
      const vinNo = (parts[1] ?? "").trim();
      const engineNo = (parts[2] ?? "").trim();
      const colorCode = (parts[3] ?? "").trim();
      const notes = (parts[4] ?? "").trim();

      if (!serialNo || !colorCode) {
        throw new Error(`Dòng ${index + 1}: Số seri và Mã màu là bắt buộc.`);
      }
      if (!VALID_COLORS.includes(colorCode)) {
        throw new Error(
          `Dòng ${index + 1}: Mã màu '${colorCode}' không hợp lệ.`,
        );
      }

      return {
        vinNo,
        engineNo,
        serialNo,
        colorCode,
        lotNo: "",
        notes,
        attributes: [],
      };
    });
}

function ValidColorsPopover() {
  const colorData = VALID_COLORS.map((c) => ({
    code: c,
    name: COLOR_NAMES[c] || c,
  }));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
        >
          xem mã màu hợp lệ
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          className="z-[9999] bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-[300px] overflow-auto w-[280px]"
        >
          <h4 className="font-semibold text-xs mb-2 text-foreground">
            Bảng Mã Màu Hợp Lệ
          </h4>
          <DataTable
            items={colorData}
            columns={[
              {
                key: "code",
                header: "Mã",
                dataIndex: "code",
                className: "w-[80px] font-mono font-semibold text-primary",
              },
              {
                key: "name",
                header: "Tên Màu",
                dataIndex: "name",
                cell: (item: any) => (
                  <span className="font-medium text-foreground">
                    {item.name}
                  </span>
                ),
              },
            ]}
            variant="spreadsheet"
            getRowKey={(r) => r.code}
            emptyLabel="Không có màu"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function IdentifierTable({
  policy,
  identifiers,
  onChange,
}: {
  policy: TrackingPolicy;
  identifiers: ProductionIdentifier[];
  onChange: (index: number, val: ProductionIdentifier) => void;
}) {
  if (policy === "NONE") return null;
  return (
    <div className="mt-3 space-y-2">
      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <ListChecks className="h-4 w-4 text-primary" />
        {policy === "VEHICLE" &&
          "Thông tin định danh xe xuất xưởng (VIN / Số máy)"}
        {policy === "SERIAL" && "Số serial từng đơn vị"}
        {policy === "LOT" && "Số lô từng đơn vị"}
        {policy === "CUSTOM" && "Định danh tùy chỉnh"}
      </h4>
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm max-h-[300px] overflow-y-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-muted/60 text-muted-foreground border-b border-border sticky top-0 backdrop-blur z-10">
            <tr>
              <th className="px-2 py-1.5 text-left font-semibold w-8">#</th>
              {policy === "VEHICLE" && (
                <>
                  <th className="px-2 py-1.5 text-left font-semibold">
                    Số Seri <span className="text-red-500">*</span>
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold">
                    Số VIN <span className="text-red-500">*</span>
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold">
                    Số máy <span className="text-red-500">*</span>
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold min-w-[120px]">
                    Mã Màu <span className="text-red-500">*</span>
                  </th>
                </>
              )}
              {policy === "SERIAL" && (
                <th className="px-2 py-1.5 text-left font-semibold">
                  Số Serial <span className="text-red-500">*</span>
                </th>
              )}
              {policy === "LOT" && (
                <th className="px-2 py-1.5 text-left font-semibold">
                  Số Lô <span className="text-red-500">*</span>
                </th>
              )}
              <th className="px-2 py-1.5 text-left font-semibold">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {identifiers.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/30">
                <td className="px-2 py-1 text-muted-foreground font-mono">
                  {idx + 1}
                </td>
                {policy === "VEHICLE" && (
                  <>
                    <td className="px-1 py-1 w-[100px]">
                      <input
                        value={item.serialNo}
                        onChange={(e) =>
                          onChange(idx, { ...item, serialNo: e.target.value })
                        }
                        className={cn(inputCls, "w-full text-xs h-7 font-mono")}
                        placeholder="Số seri"
                      />
                    </td>
                    <td className="px-1 py-1 w-[100px]">
                      <input
                        value={item.vinNo}
                        onChange={(e) =>
                          onChange(idx, { ...item, vinNo: e.target.value })
                        }
                        className={cn(inputCls, "w-full text-xs h-7 font-mono")}
                        placeholder="Số VIN"
                      />
                    </td>
                    <td className="px-1 py-1 w-[100px]">
                      <input
                        value={item.engineNo}
                        onChange={(e) =>
                          onChange(idx, { ...item, engineNo: e.target.value })
                        }
                        className={cn(inputCls, "w-full text-xs h-7 font-mono")}
                        placeholder="Số máy"
                      />
                    </td>
                    <td className="px-1 py-1 min-w-[120px]">
                      <Combobox
                        value={item.colorCode}
                        onChange={(val) =>
                          onChange(idx, { ...item, colorCode: val })
                        }
                        options={VALID_COLORS.map((c) => ({
                          value: c,
                          label: `${c} — ${COLOR_NAMES[c] || c}`,
                        }))}
                        placeholder="— Chọn màu —"
                        allowClear
                      />
                    </td>
                  </>
                )}
                {policy === "SERIAL" && (
                  <td className="px-1 py-1 w-[140px]">
                    <input
                      value={item.serialNo}
                      onChange={(e) =>
                        onChange(idx, { ...item, serialNo: e.target.value })
                      }
                      className={cn(inputCls, "w-full text-xs h-7 font-mono")}
                      placeholder="Serial"
                    />
                  </td>
                )}
                {policy === "LOT" && (
                  <td className="px-1 py-1 w-[140px]">
                    <input
                      value={item.lotNo}
                      onChange={(e) =>
                        onChange(idx, { ...item, lotNo: e.target.value })
                      }
                      className={cn(inputCls, "w-full text-xs h-7 font-mono")}
                      placeholder="Số Lô"
                    />
                  </td>
                )}
                <td className="px-1 py-1">
                  <input
                    value={item.notes}
                    onChange={(e) =>
                      onChange(idx, { ...item, notes: e.target.value })
                    }
                    className={cn(inputCls, "w-full text-xs h-7")}
                    placeholder="Ghi chú đơn vị..."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmtQty(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export interface ProductionOrderExecutionTabProps {
  order: ErpProductionOrder | null;
  saving: boolean;
  onStartAll: () => Promise<void>;
  onCompleteOne: () => Promise<void>;
  onBatchComplete: () => Promise<void>;
  batchCompleteQty: string;
  setBatchCompleteQty: (qty: string) => void;
  showBatchDialog: boolean;
  setShowBatchDialog: (show: boolean) => void;
  vehicleBulkInput: string;
  setVehicleBulkInput: (val: string) => void;
  applyVehicleBulkInput: () => void;
  identifiers: ProductionIdentifier[];
  setIdentifiers: React.Dispatch<React.SetStateAction<ProductionIdentifier[]>>;
  handleIdentifierChange: (index: number, val: ProductionIdentifier) => void;
  trackingPolicy: TrackingPolicy;
  needsIdentifiers: boolean;
}

export function ProductionOrderExecutionTab({
  order,
  saving,
  onStartAll,
  onCompleteOne,
  onBatchComplete,
  batchCompleteQty,
  setBatchCompleteQty,
  showBatchDialog,
  setShowBatchDialog,
  vehicleBulkInput,
  setVehicleBulkInput,
  applyVehicleBulkInput,
  identifiers,
  setIdentifiers,
  handleIdentifierChange,
  trackingPolicy,
  needsIdentifiers,
}: ProductionOrderExecutionTabProps) {
  const t = useT();

  const qtyToProduce = Number(order?.qtyToProduce ?? 0);
  const qtyProduced = Number(order?.qtyProduced ?? 0);
  const remaining = Math.max(0, qtyToProduce - qtyProduced);

  const isDraft = order?.status === "DRAFT";
  const isConfirmed = order?.status === "CONFIRMED";
  const isInProgress = order?.status === "IN_PROGRESS";
  const isCompleted = order?.status === "COMPLETED";
  const isCancelled = order?.status === "CANCELLED";

  const progressPct =
    qtyToProduce > 0
      ? Math.min(100, Math.round((qtyProduced / qtyToProduce) * 100))
      : 0;

  const unitRows =
    qtyToProduce > 0 && qtyToProduce <= 50
      ? Array.from({ length: Math.floor(qtyToProduce) }, (_, i) => {
          const idx = i + 1;
          const isDone = idx <= qtyProduced;
          const isCurrent =
            isInProgress && !isDone && idx === Math.floor(qtyProduced) + 1;
          return { idx, isDone, isCurrent };
        })
      : [];

  return (
    <div className="space-y-4">
      {/* Section 1: Tiến trình & Hành động sản xuất */}
      <DrawerSection
        title={t("Tiến trình & Thực thi sản xuất")}
        collapsible
        defaultCollapsed={false}
      >
        {/* Progress header bar */}
        <div className="rounded-xl border border-border/80 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-foreground flex items-center gap-1.5">
              <span>{t("Tiến độ hoàn thành")}</span>
              <span className="text-muted-foreground font-normal">
                ({fmtQty(qtyProduced)} / {fmtQty(qtyToProduce)} {t("đơn vị")})
              </span>
            </span>
            <span
              className={cn(
                "font-bold font-mono text-sm",
                isCompleted
                  ? "text-emerald-700 dark:text-emerald-400"
                  : isInProgress
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-amber-700 dark:text-amber-400",
              )}
            >
              {progressPct}%
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out rounded-full",
                isCompleted
                  ? "bg-emerald-500"
                  : isInProgress
                    ? "bg-blue-600"
                    : "bg-amber-500",
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Status: DRAFT */}
        {isDraft && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 dark:bg-amber-950/30 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                {t("Lệnh sản xuất đang ở trạng thái Nháp (DRAFT)")}
              </h5>
              <p className="text-xs text-amber-800/90 dark:text-amber-400">
                {t(
                  "Vui lòng kiểm tra định mức BOM và bấm 'Xác nhận lệnh' để hệ thống tự động giữ chỗ nguyên vật liệu và mở khóa tiến trình sản xuất.",
                )}
              </p>
            </div>
          </div>
        )}

        {/* Status: CONFIRMED -> Bắt đầu sản xuất */}
        {isConfirmed && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/30 p-4">
              <PlayCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  {t("Giai đoạn 1: Bắt đầu sản xuất & Xuất kho NVL")}
                </h5>
                <p className="text-xs text-blue-800/90 dark:text-blue-400">
                  {t(
                    "Thao tác này sẽ tự động sinh Phiếu xuất kho NVL (XK-...) theo định mức đã duyệt và chuyển trạng thái sang Đang sản xuất (IN_PROGRESS).",
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartAll}
              disabled={saving}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border border-amber-300 bg-amber-500 hover:bg-amber-600 px-4 py-3.5 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50",
              )}
            >
              <span className="flex items-center gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-5 w-5" />
                )}
                {saving
                  ? t("Đang xử lý xuất kho NVL...")
                  : t("Bắt đầu sản xuất tất cả")}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Status: IN_PROGRESS -> Thực thi hoàn thành sản xuất */}
        {isInProgress && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                {t("Số lượng còn lại cần nghiệm thu")}:{" "}
                <span className="font-bold text-foreground text-sm">
                  {fmtQty(remaining)} {t("đơn vị")}
                </span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setBatchCompleteQty(remaining > 0 ? String(remaining) : "1");
                  setIdentifiers(
                    makeIdentifierRows(remaining > 0 ? remaining : 1),
                  );
                  setShowBatchDialog(true);
                }}
                disabled={saving || remaining <= 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t("Hoàn thành hàng loạt")}</span>
              </button>
            </div>

            {/* Batch Complete Dialog / Card */}
            {showBatchDialog && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 space-y-4 shadow-sm animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-300">
                    {t("Số lượng hoàn thành đợt này")}:
                  </span>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    max={remaining}
                    value={batchCompleteQty}
                    onChange={(e) => setBatchCompleteQty(e.target.value)}
                    className={cn(
                      inputCls,
                      "w-28 text-right font-bold text-sm",
                    )}
                    placeholder="Số lượng"
                    disabled={saving}
                  />
                </div>

                {trackingPolicy === "VEHICLE" && (
                  <div className="space-y-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                        {t("Nhập dữ liệu định danh hàng loạt (Bulk Parser)")}
                      </label>
                      <ValidColorsPopover />
                    </div>

                    <div className="text-[11px] text-muted-foreground bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {t(
                          "Quy tắc định dạng copy/paste (mỗi dòng 1 xe, cách nhau bởi dấu phẩy hoặc Tab Excel):",
                        )}
                      </p>
                      <p className="font-mono text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-1 rounded">
                        Số Seri, Số VIN, Số máy, Mã màu, Ghi chú
                      </p>
                    </div>

                    <textarea
                      value={vehicleBulkInput}
                      onChange={(e) => setVehicleBulkInput(e.target.value)}
                      disabled={saving}
                      rows={4}
                      className={cn(
                        inputCls,
                        "w-full font-mono text-xs bg-white dark:bg-slate-900 resize-none",
                      )}
                      placeholder={
                        "SER001,VIN001,ENG001,DEN,Giao khách hàng VIP\nSER002,VIN002,ENG002,DO,Chờ nghiệm thu"
                      }
                    />

                    <button
                      type="button"
                      onClick={applyVehicleBulkInput}
                      disabled={saving || !vehicleBulkInput.trim()}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <ListChecks className="h-3.5 w-3.5 text-primary" />
                      {t("Trích xuất dữ liệu vào danh sách bên dưới")}
                    </button>
                  </div>
                )}

                {needsIdentifiers && (
                  <IdentifierTable
                    policy={trackingPolicy}
                    identifiers={identifiers}
                    onChange={handleIdentifierChange}
                  />
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onBatchComplete}
                    disabled={
                      saving ||
                      !Number(batchCompleteQty) ||
                      Number(batchCompleteQty) <= 0 ||
                      Number(batchCompleteQty) > remaining ||
                      (needsIdentifiers &&
                        !identifiersAllValid(identifiers, trackingPolicy))
                    }
                    className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {saving
                      ? t("Đang ghi nhận nhập kho...")
                      : t("Xác nhận hoàn thành")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBatchDialog(false)}
                    disabled={saving}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {t("Huỷ")}
                  </button>
                </div>
              </div>
            )}

            {/* Unit-by-unit listing when small batch and not showing dialog */}
            {!showBatchDialog && unitRows.length > 0 && (
              <div className="space-y-3">
                {needsIdentifiers && (
                  <IdentifierTable
                    policy={trackingPolicy}
                    identifiers={identifiers.slice(0, 1)}
                    onChange={handleIdentifierChange}
                  />
                )}

                <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm max-h-[300px] overflow-y-auto">
                  {unitRows.map(({ idx, isDone, isCurrent }) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2 text-xs transition-colors",
                        isDone
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "bg-card",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-blue-500 bg-blue-100 animate-pulse" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-border bg-muted" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            isDone
                              ? "text-emerald-800 dark:text-emerald-300 font-semibold"
                              : "text-muted-foreground",
                          )}
                        >
                          {t("Đơn vị")} #{idx}
                        </span>
                      </div>

                      {isDone && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {t("Đã sản xuất")}
                        </span>
                      )}

                      {isCurrent && !saving && (
                        <button
                          type="button"
                          onClick={onCompleteOne}
                          disabled={
                            needsIdentifiers &&
                            !identifiersAllValid(
                              identifiers.slice(0, 1),
                              trackingPolicy,
                            )
                          }
                          className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-colors"
                        >
                          {t("Hoàn thành đơn vị này")}
                        </button>
                      )}

                      {isCurrent && saving && (
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status: COMPLETED */}
        {isCompleted && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <h5 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                {t("Lệnh sản xuất đã hoàn thành 100%")}
              </h5>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-400">
                {`${t("Đã nhập kho đủ")} ${fmtQty(qtyProduced)} / ${fmtQty(qtyToProduce)} ${t("đơn vị thành phẩm.")}`}
              </p>
            </div>
          </div>
        )}

        {/* Status: CANCELLED */}
        {isCancelled && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/70 dark:bg-red-950/30 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <h5 className="text-sm font-semibold text-red-900 dark:text-red-300">
                {t("Lệnh sản xuất đã bị hủy")}
              </h5>
              <p className="text-xs text-red-800/90 dark:text-red-400">
                {t("Các giữ chỗ tồn kho và nguyên vật liệu đã được hoàn trả.")}
              </p>
            </div>
          </div>
        )}
      </DrawerSection>

      {/* Section 2: Kết quả & Định danh đã xuất xưởng */}
      <DrawerSection
        title={t("Danh sách thành phẩm đã xuất xưởng")}
        collapsible
        defaultCollapsed={false}
      >
        {(
          (trackingPolicy === "VEHICLE"
            ? order?.producedVehicles
            : order?.producedSerials) ?? []
        ).length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm max-h-[350px] overflow-y-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/60 text-muted-foreground border-b border-border sticky top-0 backdrop-blur z-10">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold w-10">#</th>
                  {trackingPolicy === "VEHICLE" && (
                    <>
                      <th className="px-2 py-2 text-left font-semibold font-mono">
                        Số VIN
                      </th>
                      <th className="px-2 py-2 text-left font-semibold font-mono">
                        {t("Số máy")}
                      </th>
                      <th className="px-2 py-2 text-left font-semibold font-mono">
                        {t("Số Serial")}
                      </th>
                    </>
                  )}
                  {trackingPolicy === "SERIAL" && (
                    <th className="px-2 py-2 text-left font-semibold font-mono">
                      {t("Serial")}
                    </th>
                  )}
                  {trackingPolicy === "LOT" && (
                    <th className="px-2 py-2 text-left font-semibold font-mono">
                      {t("Số lô")}
                    </th>
                  )}
                  <th className="px-2 py-2 text-left font-semibold">
                    {t("Thuộc tính mở rộng")}
                  </th>
                  <th className="px-2 py-2 text-left font-semibold">
                    {t("Ghi chú")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(
                  (trackingPolicy === "VEHICLE"
                    ? order?.producedVehicles
                    : order?.producedSerials) ?? []
                ).map((item: any, i: number) => {
                  let entries: Array<{ key: string; value: string }> = [];
                  if (item.attributes) {
                    if (Array.isArray(item.attributes)) {
                      entries = item.attributes;
                    } else if (typeof item.attributes === "object") {
                      entries = Object.entries(item.attributes).map(
                        ([k, v]) => ({
                          key: k,
                          value: String(v),
                        }),
                      );
                    }
                  }

                  return (
                    <tr key={item.id || i} className="hover:bg-muted/30">
                      <td className="px-2 py-2 text-muted-foreground font-mono">
                        {i + 1}
                      </td>
                      {trackingPolicy === "VEHICLE" && (
                        <>
                          <td className="px-2 py-2 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                            {item.vin || item.vinNo || "—"}
                          </td>
                          <td className="px-2 py-2 font-mono font-medium text-blue-700 dark:text-blue-400">
                            {item.engineNo || "—"}
                          </td>
                          <td className="px-2 py-2 font-mono font-medium">
                            {item.serialNo || "—"}
                          </td>
                        </>
                      )}
                      {trackingPolicy === "SERIAL" && (
                        <td className="px-2 py-2 font-mono font-medium text-blue-600">
                          {item.serialNo || "—"}
                        </td>
                      )}
                      {trackingPolicy === "LOT" && (
                        <td className="px-2 py-2 font-mono font-medium text-blue-600">
                          {item.lotNo || "—"}
                        </td>
                      )}
                      <td className="px-2 py-2 text-muted-foreground">
                        {entries.length > 0 ? (
                          <ul className="flex flex-col gap-1">
                            {entries.map((entry, idx) => (
                              <li
                                key={idx}
                                className="flex gap-1.5 items-start"
                              >
                                <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                <span>
                                  <span className="font-semibold text-foreground">
                                    {entry.key}:
                                  </span>{" "}
                                  {entry.value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {item.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic px-3 py-4 text-center">
            {t("Chưa có định danh thành phẩm nào được ghi nhận.")}
          </div>
        )}
      </DrawerSection>
    </div>
  );
}

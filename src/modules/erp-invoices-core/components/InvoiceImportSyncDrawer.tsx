import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { DatePicker } from "@/shared/components/DatePicker";
import { Combobox } from "@/shared/components/Combobox";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

import { toast } from "react-hot-toast";
import {
  format,
  isValid,
  addDays,
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInDays,
} from "date-fns";
import {
  useInvoiceXmlUpload,
  type Direction,
} from "../hooks/useInvoiceXmlUpload";
import { usePortalSync } from "../hooks/usePortalSync";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

import { UploadDropzone } from "./xml-upload/UploadDropzone";
import { UploadFileList } from "./xml-upload/UploadFileList";
import { ImportResultSummary } from "./xml-upload/ImportResultSummary";
import { ImportResultTables } from "./xml-upload/ImportResultTables";
import { ImportPreviewModal } from "./xml-upload/ImportPreviewModal";
import { InvoiceDetailWrapper } from "./InvoiceDetailWrapper";
import { GdtPortalAuthDrawer } from "./GdtPortalAuthDrawer";
import { KeyRound } from "lucide-react";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: (dir: "IN" | "OUT") => void;
  initialDirection: "IN" | "OUT";
}

export function InvoiceImportSyncDrawer({
  open,
  onClose,
  onImported,
  initialDirection,
}: Props) {
  const { t } = useTranslation("erpInvoices");
  const canEditInvoice = useHasPermission("invoices", "update");

  const presetOptions = useMemo(() => {
    const options = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 2; year--) {
      for (let month = 12; month >= 1; month--) {
        options.push({
          value: `month-${month}-${year}`,
          label: `${month}/${year}`,
        });
      }
    }
    return options;
  }, []);

  const [method, setMethod] = useState<"GDT" | "XML">("GDT");
  const [configOpen, setConfigOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [bulkXmlLoading, setBulkXmlLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const xml = useInvoiceXmlUpload((_importId, dir) => onImported(dir));
  const portal = usePortalSync();

  useEffect(() => {
    if (portal.needsRelogin && canEditInvoice) {
      setConfigOpen(true);
    }
  }, [portal.needsRelogin, canEditInvoice]);

  useEffect(() => {
    if (open) {
      setDirection(initialDirection);
      xml.setDirection(initialDirection);
    }
  }, [open, initialDirection]);

  function handleDirectionChange(d: Direction) {
    if (xml.step === "importing" || portal.loading) return; // Prevent change during loading
    setDirection(d);
    xml.setDirection(d);
    portal.clearResult();
    xml.handleReset();
  }

  function handleMethodChange(m: "GDT" | "XML") {
    if (xml.step === "importing" || portal.loading) return; // Prevent change during loading
    setMethod(m);
  }

  const handlePresetChange = (val: string) => {
    setSelectedPreset(val);
    if (!val) return;
    if (val.startsWith("month-")) {
      const parts = val.split("-");
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const d = new Date(y, m, 1);
      portal.setDateFrom(format(startOfMonth(d), "yyyy-MM-dd"));
      portal.setDateTo(format(endOfMonth(d), "yyyy-MM-dd"));
    }
  };

  const [showDrawerConfirm, setShowDrawerConfirm] = useState(false);

  function handleClose() {
    if (method === "XML" && xml.step === "select" && xml.files.length > 0) {
      setShowDrawerConfirm(true);
      return;
    }
    doClose();
  }

  function doClose() {
    xml.handleReset();
    portal.clearResult();
    onClose();
  }

  const handleSync = async () => {
    const type = direction === "IN" ? "purchase" : "sold";
    const res = await portal.sync(type);
    if (res) onImported(direction);
  };

  const handleBulkXml = async () => {
    try {
      setBulkXmlLoading(true);
      const res = await erpInvoicesCoreApi.bulkDownloadXml({
        direction,
      });
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || "Lỗi tải lại XML");
    } finally {
      setBulkXmlLoading(false);
    }
  };

  const actions = [];
  if (method === "XML") {
    if (xml.step === "select") {
      actions.push({
        label: t("actionCancel", "Hủy"),
        variant: "outline" as const,
        onClick: handleClose,
      });
      actions.push({
        label: t("importActionPreview", {
          count: xml.files.length,
          defaultValue: `Xem trước & Import (${xml.files.length} file)`,
        }),
        icon: <Upload className="w-4 h-4" />,
        onClick: () => setShowPreview(true),
        disabled: xml.files.length === 0,
      });
    } else if (xml.step === "result" && xml.result) {
      actions.push({
        label: t("importActionMore", "Import thêm"),
        variant: "outline" as const,
        onClick: xml.handleReset,
      });
      if (xml.result.created > 0) {
        actions.push({
          label: t("importActionViewCreated", "Xem hóa đơn vừa tạo"),
          icon: <ExternalLink className="w-4 h-4" />,
          variant: "secondary" as const,
          onClick: handleClose,
        });
      }
      actions.push({
        label: t("actionClose", "Đóng"),
        onClick: handleClose,
      });
    }
  } else {
    actions.push({
      label: "Đóng",
      onClick: handleClose,
      variant: "outline" as const,
    });
  }

  return (
    <DrawerModal
      open={open}
      onClose={handleClose}
      title="Đồng bộ hóa đơn"
      icon={<RefreshCw className="w-5 h-5" />}
      actions={actions}
      panelClassName="min-[1024px]:w-[640px]"
    >
      <div className="flex flex-col h-full">
        {/* Selection Dropdowns — extend full-width, breaking out of body p-[18px] */}
        <div className="flex items-center gap-3 px-[18px] py-3 border-b border-border shrink-0 -mx-[18px] -mt-[18px] mb-4">
          <div className="flex-1">
            <Combobox
              options={[
                { value: "IN", label: t("inbound", "Hóa đơn mua vào") },
                { value: "OUT", label: t("outbound", "Hóa đơn bán ra") },
              ]}
              value={direction}
              onChange={(v) => handleDirectionChange(v as Direction)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Combobox
              options={[
                { value: "GDT", label: "Từ hệ thống GDT" },
                { value: "XML", label: "Tải file từ máy tính" },
              ]}
              value={method}
              onChange={(v) => handleMethodChange(v as "GDT" | "XML")}
              className="w-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {method === "GDT" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                {(() => {
                  const dFrom = portal.dateFrom
                    ? parseISO(portal.dateFrom)
                    : null;

                  const dateToMin = portal.dateFrom;
                  const dateToMax =
                    dFrom && isValid(dFrom)
                      ? format(addDays(dFrom, 30), "yyyy-MM-dd")
                      : undefined;

                  return (
                    <div className="flex items-center gap-3">
                      <Combobox
                        options={presetOptions}
                        value={selectedPreset}
                        onChange={handlePresetChange}
                        placeholder="Chọn nhanh kỳ..."
                        className="flex-1"
                      />
                      <DatePicker
                        value={portal.dateFrom}
                        onChange={(val) => {
                          portal.setDateFrom(val);
                          setSelectedPreset("");
                          if (val) {
                            const newDFrom = parseISO(val);
                            if (isValid(newDFrom)) {
                              if (!portal.dateTo) {
                                portal.setDateTo(
                                  format(addDays(newDFrom, 30), "yyyy-MM-dd"),
                                );
                              } else {
                                const currDTo = parseISO(portal.dateTo);
                                if (isValid(currDTo)) {
                                  const diff = differenceInDays(
                                    currDTo,
                                    newDFrom,
                                  );
                                  if (diff < 0 || diff > 30) {
                                    portal.setDateTo(
                                      format(
                                        addDays(newDFrom, 30),
                                        "yyyy-MM-dd",
                                      ),
                                    );
                                  }
                                }
                              }
                            }
                          }
                        }}
                        placeholder="Từ ngày"
                        className="flex-1"
                      />
                      <DatePicker
                        value={portal.dateTo}
                        onChange={(val) => {
                          portal.setDateTo(val);
                          setSelectedPreset("");
                        }}
                        placeholder="Đến ngày"
                        className="flex-1"
                        minDate={dateToMin}
                        maxDate={dateToMax}
                      />
                    </div>
                  );
                })()}

                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    {canEditInvoice && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfigOpen(true)}
                        className="gap-1.5"
                      >
                        <KeyRound className="h-4 w-4 text-primary" />
                        Đăng nhập Cổng Thuế
                      </Button>
                    )}
                    <div
                      title={
                        !portal.token && !portal.hasPassword
                          ? "Vui lòng cấu hình tài khoản Cổng thuế trước"
                          : ""
                      }
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkXml}
                        disabled={
                          bulkXmlLoading ||
                          portal.loading ||
                          (!portal.token && !portal.hasPassword)
                        }
                        className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${bulkXmlLoading ? "animate-spin" : ""}`}
                        />
                        {bulkXmlLoading ? "Đang xử lý..." : "Tải lại XML"}
                      </Button>
                    </div>
                  </div>

                  <div
                    title={
                      !portal.token && !portal.hasPassword
                        ? "Vui lòng cấu hình tài khoản Cổng thuế trước"
                        : ""
                    }
                  >
                    <Button
                      onClick={handleSync}
                      disabled={
                        portal.loading ||
                        bulkXmlLoading ||
                        (!portal.token && !portal.hasPassword)
                      }
                      className="gap-2 w-36 justify-center disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${portal.loading ? "animate-spin" : ""}`}
                      />
                      {portal.loading ? "Đang xử lý..." : "Bắt đầu đồng bộ"}
                    </Button>
                  </div>
                </div>
              </div>

              {portal.result && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 space-y-1">
                  <div className="font-semibold mb-2">Đồng bộ thành công</div>
                  {portal.result.note ? (
                    <div className="text-sm">{portal.result.note}</div>
                  ) : (
                    <>
                      <div>
                        •{" "}
                        <span className="font-semibold">
                          {portal.result.imported}
                        </span>{" "}
                        hóa đơn mới
                      </div>
                      <div>
                        • Bỏ qua{" "}
                        <span className="font-semibold">
                          {portal.result.skipped}
                        </span>{" "}
                        hóa đơn trùng
                      </div>
                      <div>
                        • Xếp hàng tải nền{" "}
                        <span className="font-semibold">
                          {portal.result.xmlDownloadQueued}
                        </span>{" "}
                        file XML
                      </div>
                    </>
                  )}
                  {portal.result.errors && portal.result.errors.length > 0 && (
                    <div className="text-red-600 flex items-center gap-1 mt-2">
                      <XCircle className="h-4 w-4" />
                      {portal.result.errors.length} lỗi
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {method === "XML" && (
            <div className="space-y-4 h-full">
              {/* STEP 1 — SELECT */}
              {xml.step === "select" && (
                <div className="flex flex-col gap-4">
                  <UploadDropzone
                    dragging={xml.dragging}
                    onDragOver={xml.onDragOver}
                    onDragLeave={xml.onDragLeave}
                    onDrop={xml.onDrop}
                    onFilesSelected={xml.addFiles}
                  />

                  <UploadFileList files={xml.files} onRemove={xml.removeFile} />

                  {xml.importError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {xml.importError}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 — IMPORTING */}
              {xml.step === "importing" && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-foreground">
                    {t("importProcessing", {
                      count: xml.files.length,
                      defaultValue: `Đang xử lý ${xml.files.length} file XML...`,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {t(
                      "importProcessingSubtext",
                      "Hệ thống đang parse và tạo hóa đơn. Vui lòng chờ.",
                    )}
                  </p>
                </div>
              )}

              {/* STEP 3 — RESULT */}
              {xml.step === "result" && xml.result && (
                <div className="flex flex-col gap-5">
                  <ImportResultSummary result={xml.result} />
                  <ImportResultTables
                    result={xml.result}
                    onOpenInvoice={(id) => setViewInvoiceId(id)}
                  />
                  {xml.result.created === 0 &&
                    xml.result.skipped.length === 0 &&
                    xml.result.errors.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t("importNoData", "Không có file nào được xử lý.")}
                      </p>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <GdtPortalAuthDrawer
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onSuccess={() => portal.refreshConfig()}
      />
      <ImportPreviewModal
        open={showPreview}
        files={xml.files}
        direction={xml.direction || "IN"}
        onConfirm={(selectedFiles, manualMatches) => {
          setShowPreview(false);
          xml.handleImport(selectedFiles, manualMatches);
        }}
        onCancel={() => setShowPreview(false)}
      />
      <InvoiceDetailWrapper
        invoiceId={viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
      />
      <ConfirmModal
        open={showDrawerConfirm}
        title="Đóng mà không lưu?"
        message="Thay đổi của bạn sẽ không được lưu."
        confirmLabel="Đóng"
        cancelLabel="Tiếp tục chỉnh sửa"
        danger={true}
        zIndex={1000}
        onConfirm={() => {
          setShowDrawerConfirm(false);
          doClose();
        }}
        onCancel={() => setShowDrawerConfirm(false)}
      />
    </DrawerModal>
  );
}

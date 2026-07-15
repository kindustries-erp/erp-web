import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Settings,
  CheckCircle2,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  EyeOff,
} from "lucide-react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { DatePicker } from "@/shared/components/DatePicker";
import { Combobox } from "@/shared/components/Combobox";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

import {
  useInvoiceXmlUpload,
  type Direction,
} from "../hooks/useInvoiceXmlUpload";
import { usePortalSync } from "../hooks/usePortalSync";

import { UploadDropzone } from "./xml-upload/UploadDropzone";
import { UploadFileList } from "./xml-upload/UploadFileList";
import { ImportResultSummary } from "./xml-upload/ImportResultSummary";
import { ImportResultTables } from "./xml-upload/ImportResultTables";

function TokenConfigDrawer({
  open,
  onClose,
  token,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  token: string;
  onSave: (t: string) => void;
}) {
  const [draft, setDraft] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (open) setDraft(token);
  }, [open, token]);

  const handleClose = () => {
    if (draft !== token) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <DrawerModal
        open={open}
        onClose={handleClose}
        title="Cấu hình Portal GDT"
        panelClassName="min-[1024px]:w-[480px]"
        actions={[
          {
            label: "Đóng",
            onClick: handleClose,
            variant: "outline" as const,
          },
          {
            label: "Lưu token",
            primary: true,
            onClick: () => {
              onSave(draft);
              onClose();
            },
          },
        ]}
      >
        <div className="space-y-4 p-1">
          <p className="text-sm text-muted-foreground">
            Nhập Bearer token đã đăng nhập vào hệ thống{" "}
            <span className="font-medium">hoadondientu.gdt.gov.vn</span>. Token
            được lưu trong trình duyệt và dùng để đồng bộ hóa đơn.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Bearer Token
            </label>
            <div className="relative">
              {showToken ? (
                <textarea
                  className="w-full h-32 rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 resize-none pr-10"
                  placeholder="eyJhbGciOiJ..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              ) : (
                <input
                  type="password"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                  placeholder="eyJhbGciOiJ..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              )}
              <button
                type="button"
                className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {draft && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Token đã nhập ({draft.length} ký tự)
            </p>
          )}
        </div>
      </DrawerModal>

      <ConfirmModal
        open={showConfirm}
        title="Đóng mà không lưu?"
        message="Thay đổi của bạn sẽ không được lưu."
        confirmLabel="Đóng"
        cancelLabel="Tiếp tục chỉnh sửa"
        danger={true}
        zIndex={1000}
        onConfirm={() => {
          setShowConfirm(false);
          onClose();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

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

  const [method, setMethod] = useState<"GDT" | "XML">("GDT");
  const [configOpen, setConfigOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>(initialDirection);

  const xml = useInvoiceXmlUpload((_importId, dir) => onImported(dir));
  const portal = usePortalSync();

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

  const actions = [];
  if (method === "XML") {
    if (xml.step === "select") {
      actions.push({
        label: t("actionCancel", "Hủy"),
        variant: "outline" as const,
        onClick: handleClose,
      });
      actions.push({
        label: t("importActionStart", {
          count: xml.files.length,
          defaultValue: `Bắt đầu Import (${xml.files.length} file)`,
        }),
        icon: <Upload className="w-4 h-4" />,
        onClick: xml.handleImport,
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
      panelClassName="min-[1024px]:w-[520px]"
    >
      <div className="flex flex-col h-full">
        {/* Selection Dropdowns */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border shrink-0 mt-[-1rem]">
          <div className="flex-1">
            <Combobox
              options={[
                { value: "IN", label: t("inbound", "Hóa đơn mua vào") },
                { value: "OUT", label: t("outbound", "Hóa đơn bán ra") }
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
                { value: "XML", label: "Tải file từ máy tính" }
              ]}
              value={method}
              onChange={(v) => handleMethodChange(v as "GDT" | "XML")}
              className="w-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {method === "GDT" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <DatePicker
                    value={portal.dateFrom}
                    onChange={portal.setDateFrom}
                    placeholder="Từ ngày"
                    className="flex-1"
                  />
                  <DatePicker
                    value={portal.dateTo}
                    onChange={portal.setDateTo}
                    placeholder="Đến ngày"
                    className="flex-1"
                  />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfigOpen(true)}
                    className="gap-1.5"
                  >
                    <Settings className="h-4 w-4" />
                    Cấu hình token
                  </Button>

                  <Button
                    onClick={handleSync}
                    disabled={portal.loading}
                    className="gap-2 w-36 justify-center"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${portal.loading ? "animate-spin" : ""}`}
                    />
                    {portal.loading ? "Đang xử lý..." : "Bắt đầu đồng bộ"}
                  </Button>
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
                  <ImportResultTables result={xml.result} />
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

      <TokenConfigDrawer
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        token={portal.token}
        onSave={portal.setToken}
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

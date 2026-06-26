import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Skeleton } from "@/shared/components/Skeleton";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import {
  emptyGiLine,
  isMoLinkedGiLocked,
  type UseGiDrawerReturn,
  type GiLineForm,
} from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { useUIStore } from "@/core/config/uiStore";
import { GoodsIssuePrintTemplate } from "@/shared/components/print-templates/GoodsIssuePrintTemplate";
import { DatePicker } from "@/shared/components/DatePicker";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

interface GiFormDrawerProps {
  drawer: UseGiDrawerReturn;
}

export function GiFormDrawer({ drawer }: GiFormDrawerProps) {
  const t = useT();

  const {
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,
    saving,
    customerOptions,
    setCustomerSearch,
    fetchNextCustomers,
    loadingCustomers,
    itemOptions,
    setItemSearch,
    fetchNextItems,
    loadingItems,
    vehicleOptions,
    moOptions,
    close,
    handleSave,
    setViewOnly,
  } = drawer;

  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const canUpdate = useHasPermission("goods_issues", "update");

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PhieuXuatKho_${editing?.issueNo || "New"}`,
  });
  const { data: companyProfile } = useCompanyProfile();

  const ISSUE_TYPE_OPTIONS = [
    { value: "SALE", label: "SALE — " + t("Xuất bán") },
    { value: "PRODUCTION", label: "PRODUCTION — " + t("Xuất sản xuất") },
    { value: "OTHER", label: "OTHER — " + t("Xuất khác") },
  ];

  const STATUS_OPTIONS = [
    { value: "DRAFT", label: t("Nháp") },
    { value: "POSTED", label: t("Đã vào sổ") },
    { value: "CANCELLED", label: t("Đã hủy") },
  ];
  const moLinkedLocked = isMoLinkedGiLocked(editing);

  // Derive actions
  const actions = [];
  if (viewOnly) {
    if (editing && editing.status !== "DRAFT") {
      actions.push({
        label: t("common.print"),
        onClick: handlePrint,
        variant: "secondary" as const,
        disabled: loading,
      });
    }
    actions.push({
      label: t("Đóng"),
      onClick: close,
      variant: "outline" as const,
    });
  } else if (editing) {
    if (editing.status === "DRAFT") {
      actions.push({
        label: t("Hủy"),
        onClick: close,
        variant: "ghost" as const,
        disabled: saving,
      });
      actions.push({
        label: saving ? t("Đang lưu...") : t("Lưu nháp"),
        onClick: () => handleSave("DRAFT"),
        variant: "secondary" as const,
        loading: saving,
        disabled: saving,
      });
      actions.push({
        label: saving ? t("Đang cập nhật...") : t("Cập nhật"),
        onClick: () => handleSave("POSTED"),
        loading: saving,
        disabled: saving || !form.lines.length,
      });
    } else {
      actions.push({
        label: t("Đóng"),
        onClick: close,
        variant: "outline" as const,
      });
    }
  } else {
    actions.push({
      label: t("Hủy"),
      onClick: close,
      variant: "ghost" as const,
      disabled: saving,
    });
    actions.push({
      label: saving ? t("Đang lưu...") : t("Lưu nháp"),
      onClick: () => handleSave("DRAFT"),
      variant: "secondary" as const,
      loading: saving,
      disabled: saving,
    });
    actions.push({
      label: saving ? t("Đang tạo...") : t("Tạo mới"),
      onClick: () => handleSave("POSTED"),
      loading: saving,
      disabled: saving || !form.lines.length,
    });
  }

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={viewOnly ? "view" : editing ? "edit" : "create"}
        onClose={close}
        onToggleEdit={
          viewOnly &&
          editing &&
          canUpdate &&
          !moLinkedLocked &&
          !["POSTED", "CANCELLED", "VOIDED"].includes(editing.status || "DRAFT")
            ? () => setViewOnly(false)
            : undefined
        }
        title={
          editing
            ? viewOnly
              ? t("Phiếu xuất kho")
              : t("Sửa xuất kho")
            : t("Tạo phiếu xuất kho")
        }
        subtitle={
          <div className="flex items-center gap-2">
            <span>{editing?.issueNo ?? t("Xuất kho")}</span>
            {editing?.status === "DRAFT" && (
              <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                {t("Nháp")}
              </span>
            )}
            {editing?.status === "CANCELLED" && (
              <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                {t("Đã hủy")}
              </span>
            )}
          </div>
        }
        actions={actions}
        rightPanelTitle={t("Thông tin chung")}
        leftPanel={
          <>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {saveError}
              </div>
            )}
            {editing?.productionOrderId && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {t(
                  "Phiếu xuất kho gắn lệnh sản xuất đang bị khóa sửa. Chỉ được xem trạng thái hiện tại.",
                )}
              </div>
            )}

            {loading ? (
              <DrawerSection title={t("Dòng xuất kho")}>
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </DrawerSection>
            ) : (
              <DrawerSection
                title={t("Dòng xuất kho") + " (" + form.lines.length + ")"}
              >
                <DocumentLineTable
                  data={form.lines}
                  getRowKey={(_, idx) => idx}
                  viewOnly={viewOnly}
                  disabled={viewOnly}
                  onAddLine={() =>
                    setForm((f) => ({
                      ...f,
                      lines: [...f.lines, emptyGiLine()],
                    }))
                  }
                  onRemoveLine={(idx) =>
                    setForm((f) => ({
                      ...f,
                      lines: f.lines.filter((_, i) => i !== idx),
                    }))
                  }
                  columns={[
                    {
                      key: "index",
                      header: "#",
                      width: 40,
                      align: "center",
                      cell: (_, idx) => (
                        <span className="text-muted-foreground">{idx + 1}</span>
                      ),
                    },
                    {
                      key: "itemId",
                      header: t("Hàng hóa"),
                      minWidth: 200,
                      cell: (line, idx) => (
                        <Combobox
                          options={itemOptions}
                          value={line.itemId}
                          disabled={viewOnly}
                          placeholder={t("Chọn hàng hóa")}
                          searchPlaceholder={t("Tìm SKU / tên")}
                          onSearch={setItemSearch}
                          onScrollBottom={fetchNextItems}
                          loading={loadingItems}
                          onChange={(v) => {
                            const found = itemOptions.find(
                              (o) => o.value === v,
                            );
                            setForm((f) => {
                              const lines = [...f.lines];
                              lines[idx] = {
                                ...lines[idx],
                                itemId: v || "",
                                itemName: found?.label ?? "",
                              };
                              return { ...f, lines };
                            });
                          }}
                        />
                      ),
                    },
                    {
                      key: "qtyIssued",
                      header: t("Số lượng"),
                      width: 140,
                      cell: (line, idx) => (
                        <input
                          type="number"
                          className={cn(inputCls, "w-full")}
                          value={line.qtyIssued}
                          disabled={viewOnly}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((f) => {
                              const lines = [...f.lines];
                              lines[idx] = { ...lines[idx], qtyIssued: v };
                              return { ...f, lines };
                            });
                          }}
                        />
                      ),
                    },
                    {
                      key: "unitCost",
                      header: t("Đơn giá"),
                      width: 140,
                      cell: (line, idx) => (
                        <input
                          type="number"
                          className={cn(inputCls, "w-full")}
                          value={line.unitCost}
                          disabled={viewOnly}
                          placeholder={t("Tùy chọn")}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((f) => {
                              const lines = [...f.lines];
                              lines[idx] = { ...lines[idx], unitCost: v };
                              return { ...f, lines };
                            });
                          }}
                        />
                      ),
                    },
                    ...(vehicleOptions.length > 0
                      ? [
                          {
                            key: "vehicle",
                            header: t("Xe") + " (" + t("tùy chọn") + ")",
                            minWidth: 160,
                            cell: (line: GiLineForm, idx: number) => (
                              <Combobox
                                options={vehicleOptions}
                                value={line.vehicleId}
                                disabled={viewOnly}
                                placeholder={t("Chọn xe...")}
                                onChange={(v) => {
                                  setForm((f) => {
                                    const lines = [...f.lines];
                                    lines[idx] = {
                                      ...lines[idx],
                                      vehicleId: v || "",
                                    };
                                    return { ...f, lines };
                                  });
                                }}
                              />
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
              </DrawerSection>
            )}
          </>
        }
        rightPanel={
          loading ? (
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              <DrawerField label={t("Số phiếu xuất")} required>
                <input
                  className={inputCls}
                  value={form.issueNo}
                  disabled={viewOnly || !!editing}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, issueNo: e.target.value }))
                  }
                  placeholder="GI-YYYYMMDD-001"
                />
              </DrawerField>
              <DrawerField label={t("Ngày xuất")} required>
                <DatePicker
                  value={form.issueDate ? form.issueDate.slice(0, 10) : ""}
                  disabled={viewOnly}
                  onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))}
                />
              </DrawerField>
              <DrawerField label={t("Loại xuất")} required>
                <Combobox
                  options={ISSUE_TYPE_OPTIONS}
                  value={form.issueType}
                  disabled={viewOnly}
                  allowClear={false}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, issueType: v || "SALE" }))
                  }
                />
              </DrawerField>
              {form.issueType !== "PRODUCTION" && (
                <DrawerField label={t("Khách hàng")}>
                  <Combobox
                    options={customerOptions}
                    value={form.customerId}
                    disabled={viewOnly}
                    placeholder={t("Chọn khách hàng")}
                    searchPlaceholder={t("Tìm khách hàng")}
                    onSearch={setCustomerSearch}
                    onScrollBottom={fetchNextCustomers}
                    loading={loadingCustomers}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, customerId: v || "" }))
                    }
                  />
                </DrawerField>
              )}
              {form.issueType === "PRODUCTION" && (
                <DrawerField label={t("Lệnh sản xuất")}>
                  <Combobox
                    options={moOptions}
                    value={form.productionOrderId}
                    disabled={viewOnly}
                    placeholder={t("Chọn lệnh sản xuất")}
                    searchPlaceholder={t("Tìm MO")}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, productionOrderId: v || "" }))
                    }
                  />
                </DrawerField>
              )}
              <DrawerField label={t("Trạng thái")}>
                <Combobox
                  options={STATUS_OPTIONS}
                  value={form.status}
                  disabled={viewOnly}
                  allowClear={false}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, status: v || "DRAFT" }))
                  }
                />
              </DrawerField>
              <DrawerField label={t("Ghi chú")}>
                <textarea
                  className={`${inputCls} min-h-[60px] resize-y`}
                  value={form.remarks}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                />
              </DrawerField>
            </>
          )
        }
      />
      <div className="hidden">
        <GoodsIssuePrintTemplate
          ref={printRef}
          companyProfile={companyProfile}
          data={{
            issueNo: editing?.issueNo || form.issueNo || "...",
            issueDate:
              editing?.issueDate || form.issueDate || new Date().toISOString(),
            customerName:
              customerOptions.find((o) => o.value === form.customerId)?.label ||
              "",
            remarks: form.remarks,
            lines: form.lines.map((l) => {
              const foundOption = itemOptions.find((o) => o.value === l.itemId);
              let itemCode = l.itemId;
              let itemName = l.itemName || "";
              if (foundOption && foundOption.label.includes(" — ")) {
                const parts = foundOption.label.split(" — ");
                itemCode = parts[0];
                itemName = parts.slice(1).join(" — ");
              }
              return {
                itemId: l.itemId,
                itemCode,
                itemName,
                qtyIssued: l.qtyIssued,
                unitCost: l.unitCost,
              };
            }),
          }}
        />
      </div>
    </>
  );
}

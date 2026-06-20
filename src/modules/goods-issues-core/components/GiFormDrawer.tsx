import { Plus } from "lucide-react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import {
  emptyGiLine,
  type UseGiDrawerReturn,
} from "@/modules/goods-issues-core/hooks/useGiDrawer";

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
    handleSave,
    setViewOnly,
  } = drawer;

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

  // Derive actions
  const actions = [];
  if (viewOnly) {
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
    <StandardFormDrawer
      open={open}
      mode={viewOnly ? "view" : editing ? "edit" : "create"}
      onClose={close}
      onToggleEdit={
        viewOnly &&
        editing &&
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
              {form.lines.map((line, idx) => {
                if (viewOnly && Number(line.qtyIssued) <= 0) return null;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-muted/10 p-3 mb-2 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("Dòng")} {idx + 1}
                      </span>
                      {!viewOnly && (
                        <button
                          type="button"
                          className="text-xs text-red-500 hover:underline"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              lines: f.lines.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          {t("Xóa")}
                        </button>
                      )}
                    </div>
                    <DrawerField label={t("Hàng hóa")}>
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
                          const found = itemOptions.find((o) => o.value === v);
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
                    </DrawerField>
                    <div className="flex gap-2">
                      <DrawerField label={t("Số lượng")}>
                        <input
                          type="number"
                          className={cn(inputCls, "w-28")}
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
                      </DrawerField>
                      <DrawerField label={t("Đơn giá")}>
                        <input
                          type="number"
                          className={cn(inputCls, "w-28")}
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
                      </DrawerField>
                    </div>
                    {vehicleOptions.length > 0 && (
                      <DrawerField label={t("Xe") + " (" + t("tùy chọn") + ")"}>
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
                      </DrawerField>
                    )}
                  </div>
                );
              })}
              {!viewOnly && (
                <button
                  type="button"
                  className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      lines: [...f.lines, emptyGiLine()],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("Thêm dòng hàng")}
                </button>
              )}
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
              <input
                type="date"
                className={inputCls}
                value={form.issueDate}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((f) => ({ ...f, issueDate: e.target.value }))
                }
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
  );
}

import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/Skeleton";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DataTable } from "@/shared/components/DataTable";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { useMemo, useState } from "react";
import type { UseIaDrawerReturn } from "@/modules/inventory-adjustments/hooks/useIaDrawer";
import { useT } from "@/core/i18n";
import { useEffect } from "react";
import { ImportExcelModal } from "@/shared/components/ImportExcelModal";
import {
  downloadInventoryTemplate,
  parseExcelFile,
} from "@/shared/utils/excelUtils";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import { useUIStore } from "@/core/config/uiStore";
import { DatePicker } from "@/shared/components/DatePicker";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import toast from "react-hot-toast";
function fmtQty(value?: string | number | null) {
  if (!value && value !== 0) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value ?? "0");
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

interface IaFormDrawerProps {
  drawer: UseIaDrawerReturn;
}

export function IaFormDrawer({ drawer }: IaFormDrawerProps) {
  const {
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,

    saving,
    itemsDict,
    itemOptions,
    setItemSearch,
    fetchNextItems,
    loadingItems,

    close,
    handleSave,
    setViewOnly,
  } = drawer;

  const [detailSearch, setDetailSearch] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredLines = useMemo(() => {
    if (!detailSearch) return form.lines;
    const lower = detailSearch.toLowerCase();
    return form.lines.filter((l) => {
      const code =
        l.itemId && itemsDict[l.itemId]
          ? itemsDict[l.itemId].sku?.toLowerCase()
          : "";
      const name = l.itemName?.toLowerCase() || "";
      const qty = l.qtyAdjusted?.toString() || "";
      return (
        code?.includes(lower) || name?.includes(lower) || qty?.includes(lower)
      );
    });
  }, [form.lines, detailSearch, itemsDict]);

  const filteredTotalAmount = useMemo(
    () =>
      filteredLines.reduce(
        (sum, line) =>
          sum + Number(line.qtyAdjusted) * Number(line.unitCost || 0),
        0,
      ),
    [filteredLines],
  );

  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const canUpdate = useHasPermission("inventory_adjustments", "update");

  const t = useT();

  const actions =
    viewOnly || loading
      ? [
          {
            label: t("Đóng"),
            onClick: close,
            variant: "outline" as const,
            disabled: loading,
          },
        ]
      : [
          {
            label: t("Hủy"),
            onClick: close,
            variant: "outline" as const,
            disabled: saving,
          },
          {
            label: t("Lưu nháp"),
            onClick: () => void handleSave("DRAFT"),
            variant: "secondary" as const,
            loading: saving,
            disabled: saving,
          },
          {
            label: editing ? t("Cập nhật") : t("Tạo mới"),
            onClick: () => void handleSave("POSTED"),
            primary: true,
            loading: saving,
            disabled: saving,
          },
        ];

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={viewOnly ? "view" : editing ? "edit" : "create"}
        collapsibleRightPanel={true}
        onClose={close}
        onToggleEdit={
          viewOnly &&
          editing &&
          canUpdate &&
          !["CANCELLED", "POSTED"].includes(editing.status || "DRAFT")
            ? () => setViewOnly(false)
            : undefined
        }
        title={
          editing
            ? viewOnly
              ? t("Phiếu điều chỉnh")
              : t("Sửa điều chỉnh")
            : t("Tạo phiếu điều chỉnh")
        }
        subtitle={
          <div className="flex items-center gap-2">
            <span>{editing?.adjustmentNo ?? t("Điều chỉnh kho")}</span>
            {editing?.status === "DRAFT" && (
              <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                {t("Nháp")}
              </span>
            )}
            {editing?.status === "POSTED" && (
              <span className="inline-flex rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                {t("Đã vào sổ")}
              </span>
            )}
            {editing?.status === "CANCELLED" && (
              <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                {t("Đã hủy")}
              </span>
            )}
          </div>
        }
        rightPanelTitle={t("Thông tin chung")}
        actions={actions}
        loading={loading}
        error={saveError}
        leftPanel={
          <>
            {loading ? (
              <DrawerSection title={t("Chi tiết")}>
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </DrawerSection>
            ) : (
              <DrawerSection
                title={
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:justify-between pr-4 mt-2 sm:mt-0 uppercase">
                    <span className="shrink-0 mb-2 sm:mb-0 text-sm font-semibold text-gray-700">
                      {t("CHI TIẾT")} (
                      {detailSearch
                        ? `${filteredLines.length}/${form.lines.length}`
                        : form.lines.length}
                      )
                    </span>
                    <div className="w-full sm:w-64 relative font-normal text-sm">
                      <SearchInput
                        className="w-full"
                        placeholder={t("Tìm mã/tên, SL...")}
                        value={detailSearch}
                        onChange={setDetailSearch}
                      />
                    </div>
                  </div>
                }
                titleExtra={
                  <span className="text-foreground font-semibold shrink-0 uppercase text-sm">
                    {t("Tổng")}:{" "}
                    {Number(filteredTotalAmount).toLocaleString("vi-VN")} VND
                  </span>
                }
              >
                <DataTable
                  items={filteredLines}
                  getRowKey={(item: any) => String(form.lines.indexOf(item))}
                  variant="spreadsheet"
                  emptyLabel={t("Không có dữ liệu")}
                  containerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
                  summaryRow={{
                    itemName: (
                      <div className="text-right w-full font-semibold">
                        {t("Tổng")}:
                      </div>
                    ),
                    qtyAdjusted: (
                      <div className="text-center font-semibold">
                        {fmtQty(
                          filteredLines
                            .reduce(
                              (sum, l) => sum + Number(l.qtyAdjusted || 0),
                              0,
                            )
                            .toString(),
                        )}
                      </div>
                    ),
                    amount: (
                      <div className="text-center font-semibold text-emerald-600">
                        {Number(filteredTotalAmount).toLocaleString("vi-VN")}
                      </div>
                    ),
                  }}
                  columns={[
                    {
                      key: "index",
                      header: "#",
                      size: 40,
                      headerClassName: "text-center w-[40px] min-w-[40px]",
                      className: "text-center w-[40px] min-w-[40px]",
                      cell: (_: any, i: number) => (
                        <span className="text-muted-foreground">{i + 1}</span>
                      ),
                    },
                    {
                      key: "item_code",
                      header: t("Mã linh kiện"),
                      minSize: 140,
                      headerClassName: "w-[140px] min-w-[140px]",
                      className: "w-[140px] min-w-[140px]",
                      cell: (line: any) => {
                        const itemCode =
                          line.itemCode ||
                          (line.itemId && itemsDict[line.itemId]
                            ? itemsDict[line.itemId].sku
                            : "—");
                        return (
                          <span className="font-medium text-foreground">
                            {itemCode}
                          </span>
                        );
                      },
                    },
                    {
                      key: "itemName",
                      header: t("Linh kiện / Tên hàng"),
                      minSize: 260,
                      headerClassName: "w-[260px] min-w-[260px]",
                      className: "w-[260px] min-w-[260px]",
                      cell: (line: any) => {
                        if (viewOnly || editing?.status === "POSTED") {
                          const nameParts = line.itemName?.split(" — ");
                          const name =
                            nameParts && nameParts.length > 1
                              ? nameParts[1]
                              : line.itemName || "—";
                          return (
                            <div
                              className={cn(
                                "font-medium truncate max-w-[260px]",
                                "text-foreground",
                              )}
                              title={name}
                            >
                              {name}
                            </div>
                          );
                        }
                        return (
                          <Combobox
                            options={itemOptions}
                            value={line.itemId}
                            fallbackLabel={line.itemName}
                            disabled={viewOnly || editing?.status === "POSTED"}
                            placeholder={t("Chọn linh kiện từ danh mục")}
                            searchPlaceholder={t("Tìm mã / tên linh kiện")}
                            onSearch={setItemSearch}
                            onScrollBottom={fetchNextItems}
                            loading={loadingItems}
                            onChange={(v) => {
                              const found = itemOptions.find(
                                (o) => o.value === v,
                              );
                              setForm((f) => {
                                const lines = [...f.lines];
                                const actualIndex = form.lines.findIndex(
                                  (fl) => fl === line,
                                );
                                if (actualIndex > -1) {
                                  lines[actualIndex] = {
                                    ...lines[actualIndex],
                                    itemId: v || "",
                                    itemCode:
                                      found?.label?.split(" — ")[0] || "",
                                    itemName: found?.label ?? "",
                                  };
                                }
                                return { ...f, lines };
                              });
                            }}
                          />
                        );
                      },
                    },
                    {
                      key: "qtyAdjusted",
                      header: t("SL Điều chỉnh"),
                      minSize: 140,
                      headerClassName: "text-center w-[140px] min-w-[140px]",
                      className: "text-center w-[140px] min-w-[140px]",
                      cell: (line: any) => {
                        if (viewOnly || editing?.status === "POSTED") {
                          const val = Number(line.qtyAdjusted);
                          return (
                            <div
                              className={cn(
                                "font-medium",
                                val > 0
                                  ? "text-emerald-600"
                                  : val < 0
                                    ? "text-red-600"
                                    : "",
                              )}
                            >
                              {val > 0 ? "+" : ""}
                              {fmtQty(val)}
                            </div>
                          );
                        }
                        return (
                          <input
                            type="number"
                            className={cn(
                              inputCls,
                              "w-28 flex-shrink-0 text-right mx-auto",
                            )}
                            placeholder={`(+/-) SL`}
                            value={line.qtyAdjusted ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setForm((f) => {
                                const lines = [...f.lines];
                                const actualIndex = form.lines.findIndex(
                                  (fl) => fl === line,
                                );
                                if (actualIndex > -1) {
                                  lines[actualIndex] = {
                                    ...lines[actualIndex],
                                    qtyAdjusted: v,
                                  };
                                }
                                return { ...f, lines };
                              });
                            }}
                          />
                        );
                      },
                    },
                    {
                      key: "unitCost",
                      header: t("Đơn giá"),
                      minSize: 140,
                      headerClassName: "text-center w-[140px] min-w-[140px]",
                      className: "text-center w-[140px] min-w-[140px]",
                      cell: (line: any) => {
                        if (viewOnly || editing?.status === "POSTED") {
                          return (
                            <div className="font-medium">
                              {fmtQty(line.unitCost)}
                            </div>
                          );
                        }
                        return (
                          <input
                            type="number"
                            min={0}
                            className={cn(
                              inputCls,
                              "w-28 flex-shrink-0 text-right mx-auto",
                            )}
                            placeholder={`Đơn giá`}
                            value={line.unitCost ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setForm((f) => {
                                const lines = [...f.lines];
                                const actualIndex = form.lines.findIndex(
                                  (fl) => fl === line,
                                );
                                if (actualIndex > -1) {
                                  lines[actualIndex] = {
                                    ...lines[actualIndex],
                                    unitCost: v,
                                  };
                                }
                                return { ...f, lines };
                              });
                            }}
                          />
                        );
                      },
                    },
                    {
                      key: "amount",
                      header: t("Thành tiền"),
                      minSize: 140,
                      headerClassName: "text-center w-[140px] min-w-[140px]",
                      className: "text-center w-[140px] min-w-[140px]",
                      cell: (line: any) => {
                        const amount =
                          Number(line.qtyAdjusted || 0) *
                          Number(line.unitCost || 0);
                        return (
                          <div className="font-medium text-foreground">
                            {amount.toLocaleString("vi-VN")}
                          </div>
                        );
                      },
                    },
                  ]}
                  actionsColumn={
                    !viewOnly && editing?.status !== "POSTED"
                      ? {
                          header: "",
                          cell: (item: any) => (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => {
                                setForm((f) => ({
                                  ...f,
                                  lines: f.lines.filter((l) => l !== item),
                                }));
                              }}
                            >
                              ✕
                            </Button>
                          ),
                        }
                      : undefined
                  }
                />
                {!viewOnly && editing?.status !== "POSTED" && (
                  <div className="mt-4 flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          lines: [
                            ...f.lines,
                            {
                              itemId: "",
                              itemCode: "",
                              itemName: "",
                              qtyAdjusted: "",
                              unitCost: "",
                            },
                          ],
                        }));
                      }}
                    >
                      + {t("Thêm dòng")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsImportOpen(true)}
                    >
                      {t("Nhập từ Excel")}
                    </Button>
                  </div>
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
              <Skeleton className="h-20 w-full" />
            </>
          ) : (
            <>
              <DrawerField label={t("Số phiếu")}>
                <input
                  className={inputCls}
                  placeholder={t("Tự động nếu để trống")}
                  value={form.adjustmentNo}
                  disabled={viewOnly || editing?.status === "POSTED"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, adjustmentNo: e.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label={t("Ngày điều chỉnh")}>
                <DatePicker
                  value={
                    form.adjustmentDate ? form.adjustmentDate.slice(0, 10) : ""
                  }
                  disabled={viewOnly || editing?.status === "POSTED"}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, adjustmentDate: v }))
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
      <ImportExcelModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onDownloadTemplate={async () => {
          const headers = ["Mã linh kiện", "Số lượng điều chỉnh", "Đơn giá"];
          let refItems: any[] = [];
          try {
            const res = await basicMastersApi.list({
              entities: "inventoryItems",
              limit: 5000,
            });
            refItems = (res.items.inventoryItems || []).map((item: any) => ({
              sku: item.sku || "",
              name: item.itemName || "",
            }));
          } catch (e) {
            console.error("Failed to fetch reference items", e);
          }
          downloadInventoryTemplate(
            headers,
            "Template_DieuChinhKho.xlsx",
            refItems,
          );
        }}
        onUpload={async (file, overwrite) => {
          try {
            const data = await parseExcelFile(file);
            let skipped = 0;
            const newLines: any[] = [];

            let allItems: any[] = [];
            try {
              const res = await basicMastersApi.list({
                entities: "inventoryItems",
                limit: 5000,
              });
              allItems = res.items.inventoryItems || [];
            } catch (e) {
              console.error("Failed to fetch items for upload lookup", e);
            }

            const skuToId: Record<string, string> = {};
            const idToName: Record<string, string> = {};
            const idToSku: Record<string, string> = {};
            allItems.forEach((item: any) => {
              if (item.sku) {
                skuToId[item.sku.toLowerCase()] = item.id;
                idToName[item.id] = item.itemName;
                idToSku[item.id] = item.sku;
              }
            });

            data.forEach((row: any) => {
              const sku = row["Mã linh kiện"]?.toString().trim();
              const qty = row["Số lượng điều chỉnh"]?.toString().trim();
              const price = row["Đơn giá"]?.toString().trim();

              if (!sku) return;

              const itemId = skuToId[sku.toLowerCase()];
              if (itemId) {
                newLines.push({
                  itemId,
                  itemCode: idToSku[itemId] || "",
                  itemName: idToName[itemId] || "",
                  qtyAdjusted: qty || "",
                  unitCost: price || "",
                });
              } else {
                skipped++;
              }
            });

            if (skipped > 0) {
              toast.error(
                `Đã bỏ qua ${skipped} dòng chứa mã linh kiện không tồn tại.`,
              );
            }

            setForm((f) => {
              const filteredOldLines = overwrite
                ? []
                : f.lines.filter((l: any) => l.itemId);
              return { ...f, lines: [...filteredOldLines, ...newLines] };
            });
            setIsImportOpen(false);
          } catch {
            toast.error("Lỗi khi đọc file Excel");
          }
        }}
      />
    </>
  );
}

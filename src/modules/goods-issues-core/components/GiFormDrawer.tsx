import { cn } from "@/shared/utils";
import { fmtQty } from "@/shared/utils/format";
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
} from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { useUIStore } from "@/core/config/uiStore";
import { GoodsIssuePrintTemplate } from "@/shared/components/print-templates/GoodsIssuePrintTemplate";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ImportExcelModal } from "@/shared/components/ImportExcelModal";
import {
  downloadInventoryTemplate,
  parseExcelFile,
} from "@/shared/utils/excelUtils";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import toast from "react-hot-toast";
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
    soOptions,
    handleSoChange,
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

  const isLineViewOnly = viewOnly || form.issueType === "SALE";

  const [serialDetails, setSerialDetails] = useState<
    Record<string, InventorySerialRow>
  >({});
  const [isImportOpen, setIsImportOpen] = useState(false);
  useEffect(() => {
    let active = true;
    const sIds = form.lines.map((l) => l.serialId).filter(Boolean);
    if (sIds.length > 0) {
      inventoryCoreApi
        .listSerials({ ids: sIds, pageSize: 1000 })
        .then((res) => {
          if (active) {
            const map: Record<string, InventorySerialRow> = {};
            res.items.forEach((s) => {
              map[s.id] = s;
            });
            setSerialDetails(map);
          }
        })
        .catch(console.error);
    } else {
      setSerialDetails({});
    }
    return () => {
      active = false;
    };
  }, [form.lines]);

  const canUpdate = useHasPermission("goods_issues", "update");

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PhieuXuatKho_${editing?.issueNo || "New"}`,
  });
  const { data: companyProfile } = useCompanyProfile();

  const ISSUE_TYPE_OPTIONS = [
    { value: "SALE", label: t("Xuất bán") },
    { value: "OTHER", label: t("Xuất khác") },
  ];

  const moLinkedLocked = isMoLinkedGiLocked(editing);
  const isAdmin = useHasPermission("*", "*");

  // Derive actions
  const actions =
    viewOnly || loading
      ? [
          ...(editing && editing.status !== "DRAFT" && isAdmin
            ? [
                {
                  label: t("common.print"),
                  onClick: handlePrint,
                  variant: "secondary" as const,
                  disabled: loading,
                },
              ]
            : []),
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
          ...(editing?.status === "POSTED"
            ? []
            : [
                {
                  label: t("Lưu nháp"),
                  onClick: () => void handleSave("DRAFT"),
                  variant: "secondary" as const,
                  loading: saving,
                  disabled: saving,
                },
              ]),
          {
            label: editing ? t("Cập nhật") : t("Tạo mới"),
            onClick: () =>
              void handleSave(
                editing?.status === "POSTED" ? undefined : "POSTED",
              ),
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
        onClose={close}
        onToggleEdit={
          viewOnly &&
          editing &&
          canUpdate &&
          !moLinkedLocked &&
          !["CANCELLED", "VOIDED"].includes(editing.status || "DRAFT")
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
            ) : form.issueType === "SALE" && !form.salesOrderId ? (
              <DrawerSection title={t("Dòng xuất kho")}>
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                  {t("Vui lòng chọn Đơn bán hàng để xem chi tiết xuất kho.")}
                </div>
              </DrawerSection>
            ) : (
              <DrawerSection
                title={t("Dòng xuất kho") + " (" + form.lines.length + ")"}
                titleExtra={
                  !viewOnly &&
                  form.issueType !== "SALE" &&
                  editing?.status !== "POSTED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsImportOpen(true)}
                    >
                      {t("Nhập từ Excel")}
                    </Button>
                  ) : undefined
                }
              >
                <DocumentLineTable
                  data={form.lines}
                  getRowKey={(_, idx) => idx}
                  viewOnly={viewOnly || form.issueType === "SALE"}
                  disabled={
                    viewOnly ||
                    form.issueType === "SALE" ||
                    editing?.status === "POSTED"
                  }
                  tableContainerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
                  footer={
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-3 text-right font-semibold"
                      ></td>
                      <td
                        className={cn(
                          "px-3 py-3 font-semibold text-center",
                          viewOnly ? "text-red-600" : "",
                        )}
                      >
                        {fmtQty(
                          form.lines
                            .reduce(
                              (sum, line) =>
                                sum +
                                (line.itemId ? Number(line.qtyIssued || 0) : 0),
                              0,
                            )
                            .toString(),
                        )}
                      </td>
                      <td
                        className="px-3 py-3"
                        colSpan={
                          vehicleOptions.length > 0
                            ? viewOnly || form.issueType === "SALE"
                              ? 2
                              : 3
                            : viewOnly || form.issueType === "SALE"
                              ? 1
                              : 2
                        }
                      ></td>
                    </tr>
                  }
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
                      key: "itemCode",
                      header: t("Mã vật tư"),
                      minWidth: isLineViewOnly ? 140 : 200,
                      cell: (line, idx) => {
                        if (isLineViewOnly) {
                          const code = line.itemName?.split(" — ")[0] || "—";
                          return <span>{code}</span>;
                        }
                        return (
                          <Combobox
                            options={itemOptions}
                            value={line.itemId}
                            fallbackLabel={line.itemName}
                            disabled={isLineViewOnly}
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
                        );
                      },
                    },
                    {
                      key: "itemName",
                      header: t("Tên vật tư"),
                      minWidth: 200,
                      cell: (line) => {
                        const nameParts = line.itemName?.split(" — ");
                        const name =
                          nameParts && nameParts.length > 1
                            ? nameParts[1]
                            : line.itemName || "—";
                        return (
                          <div
                            className={cn(
                              "font-medium truncate max-w-[200px]",
                              isLineViewOnly
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                            title={name}
                          >
                            {name}
                          </div>
                        );
                      },
                    },
                    {
                      key: "tracking",
                      header: t("Serials / Số khung"),
                      minWidth: 250,
                      cell: (line) => {
                        if (!line.serialId) {
                          return (
                            <span className="text-[11px] text-muted-foreground">
                              —
                            </span>
                          );
                        }
                        const s = serialDetails[line.serialId];
                        if (!s) {
                          return (
                            <span className="text-[11px] text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        return (
                          <div className="flex flex-col text-[13px] py-1">
                            <span className="font-mono text-gray-900">
                              {s.vinNo || s.serialNo || s.id.substring(0, 8)}
                            </span>
                            {s.engineNo && (
                              <span className="text-gray-500 text-[11px]">
                                Số máy: {s.engineNo}
                              </span>
                            )}
                          </div>
                        );
                      },
                    },
                    {
                      key: "qtyIssued",
                      header: t("Số lượng"),
                      minWidth: 140,
                      align: isLineViewOnly ? "center" : "left",
                      cell: (line, idx) => {
                        const qty = line.itemId ? line.qtyIssued : "0";
                        if (isLineViewOnly) {
                          return Number(qty) > 0 ? (
                            <div className="font-medium text-red-600">
                              {fmtQty(qty)}
                            </div>
                          ) : (
                            <div className="text-center font-medium text-muted-foreground">
                              0
                            </div>
                          );
                        }
                        return (
                          <input
                            type="number"
                            className={cn(
                              inputCls,
                              "w-full text-right",
                              !line.itemId && "bg-muted text-muted-foreground",
                            )}
                            value={qty}
                            disabled={
                              isLineViewOnly ||
                              editing?.status === "POSTED" ||
                              !line.itemId
                            }
                            onChange={(e) => {
                              const v = e.target.value;
                              setForm((f) => {
                                const lines = [...f.lines];
                                lines[idx] = { ...lines[idx], qtyIssued: v };
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
                      minWidth: 140,
                      align: isLineViewOnly ? "right" : "left",
                      cell: (line, idx) => {
                        if (isLineViewOnly) {
                          return line.unitCost ? (
                            <span className="text-muted-foreground">
                              {fmtQty(line.unitCost)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          );
                        }
                        return (
                          <input
                            type="number"
                            className={cn(inputCls, "w-full text-right")}
                            value={line.unitCost}
                            disabled={
                              isLineViewOnly || editing?.status === "POSTED"
                            }
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
                        );
                      },
                    },
                    /*
                    ...(vehicleOptions.length > 0
                      ? [
                          {
                            key: "vehicle",
                            header: t("Xe") + " (" + t("tùy chọn") + ")",
                            minWidth: 160,
                            cell: (line: GiLineForm, idx: number) => {
                              if (viewOnly) {
                                const vName = vehicleOptions.find(
                                  (v) => v.value === line.vehicleId,
                                )?.label;
                                return (
                                  <span className="text-muted-foreground">
                                    {vName || "—"}
                                  </span>
                                );
                              }
                              return (
                                <Combobox
                                  options={vehicleOptions}
                                  value={line.vehicleId}
                                  disabled={
                                    viewOnly || editing?.status === "POSTED"
                                  }
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
                              );
                            },
                          },
                        ]
                      : []),
                    */
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
                  disabled={viewOnly || editing?.status === "POSTED"}
                  onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))}
                />
              </DrawerField>
              <DrawerField label={t("Loại xuất")} required>
                <Combobox
                  options={ISSUE_TYPE_OPTIONS}
                  value={form.issueType}
                  disabled={viewOnly || editing !== null}
                  allowClear={false}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, issueType: v || "SALE" }))
                  }
                />
              </DrawerField>
              {form.issueType !== "PRODUCTION" && (
                <DrawerField label={t("Đơn bán hàng")}>
                  <Combobox
                    options={soOptions}
                    value={form.salesOrderId}
                    disabled={
                      viewOnly || editing?.status === "POSTED" || !!editing
                    }
                    placeholder={t("Chọn đơn bán hàng")}
                    searchPlaceholder={t("Tìm Đơn bán hàng")}
                    allowClear={true}
                    onChange={(v) => handleSoChange(v || "")}
                  />
                </DrawerField>
              )}
              {form.issueType === "PRODUCTION" && (
                <DrawerField label={t("Lệnh sản xuất")}>
                  <Combobox
                    options={moOptions}
                    value={form.productionOrderId}
                    disabled={viewOnly || editing?.status === "POSTED"}
                    placeholder={t("Chọn lệnh sản xuất")}
                    searchPlaceholder={t("Tìm MO")}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, productionOrderId: v || "" }))
                    }
                  />
                </DrawerField>
              )}

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
              form.issueType !== "PRODUCTION"
                ? soOptions.find((o) => o.value === form.salesOrderId)?.label ||
                  ""
                : "",
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
      <ImportExcelModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onDownloadTemplate={async () => {
          const headers = [
            "Mã vật tư",
            "Số lượng",
            "Đơn giá",
            "Serials/Số khung",
          ];
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
          downloadInventoryTemplate(headers, "Template_XuatKho.xlsx", refItems);
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
            allItems.forEach((item: any) => {
              if (item.sku) {
                skuToId[item.sku.toLowerCase()] = item.id;
                idToName[item.id] = item.itemName;
              }
            });

            data.forEach((row: any) => {
              const sku = row["Mã vật tư"]?.toString().trim();
              const qty = row["Số lượng"]?.toString().trim();
              const price = row["Đơn giá"]?.toString().trim();

              if (!sku) return;

              const itemId = skuToId[sku.toLowerCase()];
              if (itemId) {
                newLines.push({
                  itemId,
                  itemName: idToName[itemId] || "",
                  qtyIssued: qty || "",
                  unitCost: price || "",
                  serialId: "",
                  vehicleId: "",
                });
              } else {
                skipped++;
              }
            });

            if (skipped > 0) {
              toast.error(
                `Đã bỏ qua ${skipped} dòng chứa mã vật tư không tồn tại.`,
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

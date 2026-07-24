/**
 * GrFormDrawer — Goods Receipt form drawer (StandardFormDrawer layout).
 * Reusable in ErpWarehousePage, PurchaseOrderListPage, and any other page.
 *
 * Requires a `useGrDrawer()` instance to be passed in as props so the caller
 * fully controls open/close/save state.
 */
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { useT } from "@/core/i18n";
import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { useUIStore } from "@/core/config/uiStore";
import { GoodsReceiptPrintTemplate } from "@/shared/components/print-templates/GoodsReceiptPrintTemplate";
import { DatePicker } from "@/shared/components/DatePicker";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ImportExcelModal } from "@/shared/components/ImportExcelModal";
import {
  downloadInventoryTemplate,
  parseExcelFile,
} from "@/shared/utils/excelUtils";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import toast from "react-hot-toast";
function fmtQty(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value ?? "0";
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

interface GrFormDrawerProps {
  drawer: UseGrDrawerReturn;
}

export function GrFormDrawer({ drawer }: GrFormDrawerProps) {
  const {
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,
    saving,
    poDetail,
    poOptions,
    itemsDict,
    close,
    handleSave,
    setViewOnly,
  } = drawer;

  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const canUpdate = useHasPermission("goods_receipts", "update");
  const isAdmin = useHasPermission("*", "*");

  const t = useT();
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PhieuNhapKho_${editing?.receiptNo || "New"}`,
  });
  const { data: companyProfile } = useCompanyProfile();
  const [isImportOpen, setIsImportOpen] = useState(false);

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
        onClose={close}
        onToggleEdit={
          viewOnly &&
          editing &&
          canUpdate &&
          !["CANCELLED", "VOIDED"].includes(editing.status || "DRAFT")
            ? () => setViewOnly(false)
            : undefined
        }
        title={
          editing
            ? viewOnly
              ? t("Phiếu nhập kho")
              : t("Sửa nhập kho")
            : t("Tạo phiếu nhập kho")
        }
        subtitle={
          <div className="flex items-center gap-2">
            <span>{editing?.receiptNo ?? t("Nhập kho")}</span>
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
                  <Skeleton className="h-10 w-full" />
                </div>
              </DrawerSection>
            ) : (
              <DrawerSection
                title={t("Chi tiết") + " (" + form.lines.length + ")"}
                titleExtra={
                  !viewOnly && poDetail && editing?.status !== "POSTED" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] px-2 leading-none text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            lines: f.lines.map((l) => ({
                              ...l,
                              qtyReceived: "",
                            })),
                          }))
                        }
                      >
                        {t("Đặt lại")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] px-2 leading-none"
                        onClick={() => {
                          setForm((f) => {
                            let newLines: Array<{
                              purchaseOrderLineId: string;
                              productionOrderMaterialId: string;
                              itemId: string;
                              itemName: string;
                              qtyReceived: string;
                              unitCost: string;
                            }> = [];
                            if (poDetail && poDetail.lines) {
                              newLines = poDetail.lines.map((poLine) => {
                                const ordered = Number(poLine.qtyOrdered ?? 0);
                                const received = Number(
                                  poLine.qtyReceived ?? 0,
                                );
                                const remaining = Math.max(
                                  0,
                                  ordered - received,
                                );
                                return {
                                  purchaseOrderLineId: poLine.id ?? "",
                                  productionOrderMaterialId: "",
                                  itemId: poLine.itemId ?? "",
                                  itemName: poLine.itemName ?? "",
                                  qtyReceived:
                                    remaining > 0 ? remaining.toString() : "",
                                  unitCost: poLine.unitPrice ?? "",
                                };
                              });
                            }
                            return { ...f, lines: newLines };
                          });
                        }}
                      >
                        {t("Nhập hết")}
                      </Button>
                    </div>
                  ) : undefined
                }
              >
                {poDetail ? (
                  <DocumentLineTable
                    data={poDetail.lines || []}
                    getRowKey={(line) => line.id || ""}
                    viewOnly={true}
                    tableContainerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
                    footer={
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-3 text-right font-semibold"
                        ></td>
                        <td className="px-3 py-3 text-center font-semibold text-emerald-600">
                          {viewOnly
                            ? `+${fmtQty(form.lines.reduce((sum, l) => sum + Number(l.qtyReceived || 0), 0).toString())}`
                            : fmtQty(
                                form.lines
                                  .reduce(
                                    (sum, l) =>
                                      sum + Number(l.qtyReceived || 0),
                                    0,
                                  )
                                  .toString(),
                              )}
                        </td>
                      </tr>
                    }
                    columns={[
                      {
                        key: "index",
                        header: "#",
                        width: 40,
                        align: "center",
                        cell: (_, idx) => (
                          <span className="text-muted-foreground">
                            {idx + 1}
                          </span>
                        ),
                      },
                      {
                        key: "itemCode",
                        header: t("Mã linh kiện"),
                        minWidth: 140,
                        cell: (poLine) => {
                          const itemCode =
                            poLine.itemId && itemsDict[poLine.itemId]
                              ? itemsDict[poLine.itemId].sku
                              : "—";
                          return <span>{itemCode}</span>;
                        },
                      },
                      {
                        key: "itemName",
                        header: t("Tên linh kiện"),
                        minWidth: 260,
                        cell: (poLine) => {
                          const itemName =
                            poLine.itemName ||
                            (poLine.itemId && itemsDict[poLine.itemId]
                              ? itemsDict[poLine.itemId].itemName
                              : "") ||
                            poLine.description ||
                            poLine.itemId ||
                            "—";
                          return (
                            <div
                              className="font-medium text-foreground truncate max-w-[260px]"
                              title={itemName}
                            >
                              {itemName}
                            </div>
                          );
                        },
                      },
                      {
                        key: "ordered",
                        header: t("Đã đặt"),
                        minWidth: 100,
                        align: "center",
                        cell: (poLine) => (
                          <div className="font-medium text-foreground">
                            {Number(poLine.qtyOrdered ?? 0).toLocaleString(
                              "vi-VN",
                            )}
                          </div>
                        ),
                      },
                      {
                        key: "remaining",
                        header: t("Còn lại"),
                        minWidth: 100,
                        align: "center",
                        cell: (poLine) => {
                          const ordered = Number(poLine.qtyOrdered ?? 0);
                          const received = Number(poLine.qtyReceived ?? 0);
                          const remaining = Math.max(0, ordered - received);
                          return (
                            <div className="font-medium text-amber-600">
                              {remaining.toLocaleString("vi-VN")}
                            </div>
                          );
                        },
                      },
                      {
                        key: "qtyInput",
                        header: t("SL Nhập"),
                        minWidth: 140,
                        align: "center",
                        cell: (poLine) => {
                          const lineIdx = form.lines.findIndex(
                            (l) => l.purchaseOrderLineId === poLine.id,
                          );
                          const currentLine =
                            lineIdx >= 0 ? form.lines[lineIdx] : null;

                          if (!viewOnly) {
                            const ordered = Number(poLine.qtyOrdered ?? 0);
                            const received = Number(poLine.qtyReceived ?? 0);
                            const remaining = Math.max(0, ordered - received);
                            return (
                              <input
                                type="number"
                                min={0}
                                max={remaining}
                                className={cn(
                                  inputCls,
                                  "w-28 flex-shrink-0 text-right mx-auto",
                                )}
                                placeholder={`Max ${remaining}`}
                                value={currentLine?.qtyReceived ?? ""}
                                disabled={
                                  viewOnly || editing?.status === "POSTED"
                                }
                                onChange={(e) => {
                                  const qty = e.target.value;
                                  setForm((f) => {
                                    const lines = [...f.lines];
                                    if (lineIdx >= 0) {
                                      lines[lineIdx] = {
                                        ...lines[lineIdx],
                                        qtyReceived: qty,
                                      };
                                    } else {
                                      lines.push({
                                        purchaseOrderLineId: poLine.id ?? "",
                                        productionOrderMaterialId: "",
                                        itemId: poLine.itemId ?? "",
                                        itemName: poLine.itemName ?? "",
                                        qtyReceived: qty,
                                        unitCost: poLine.unitPrice ?? "",
                                      });
                                    }
                                    return { ...f, lines };
                                  });
                                }}
                              />
                            );
                          }
                          return currentLine &&
                            Number(currentLine.qtyReceived) > 0 ? (
                            <div className="font-medium text-emerald-600">
                              +{fmtQty(currentLine.qtyReceived)}
                            </div>
                          ) : null;
                        },
                      },
                    ]}
                  />
                ) : form.receiptType === "OTHER" && !viewOnly ? (
                  <DocumentLineTable
                    data={form.lines}
                    getRowKey={(_, i) => i}
                    tableContainerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
                    footer={
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-3 text-right font-semibold"
                        ></td>
                        <td className="px-3 py-3 text-center font-semibold text-emerald-600">
                          {fmtQty(
                            form.lines
                              .reduce(
                                (sum, l) => sum + Number(l.qtyReceived || 0),
                                0,
                              )
                              .toString(),
                          )}
                        </td>
                        <td className="px-3 py-3"></td>
                      </tr>
                    }
                    columns={[
                      {
                        key: "index",
                        header: "#",
                        width: 40,
                        align: "center",
                        cell: (_, i) => (
                          <span className="text-muted-foreground">{i + 1}</span>
                        ),
                      },
                      {
                        key: "itemCode",
                        header: t("Mã linh kiện"),
                        minWidth: 140,
                        cell: (line) => {
                          const itemCode =
                            line.itemId && itemsDict[line.itemId]
                              ? itemsDict[line.itemId].sku
                              : "—";
                          return <span>{itemCode}</span>;
                        },
                      },
                      {
                        key: "itemName",
                        header: t("Tên linh kiện"),
                        minWidth: 260,
                        cell: (line, i) => {
                          return (
                            <input
                              type="text"
                              className={inputCls}
                              placeholder={t("Nhập tên linh kiện")}
                              value={line.itemName}
                              disabled={
                                viewOnly || editing?.status === "POSTED"
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((f) => {
                                  const lines = [...f.lines];
                                  lines[i] = { ...lines[i], itemName: val };
                                  return { ...f, lines };
                                });
                              }}
                            />
                          );
                        },
                      },
                      {
                        key: "qtyInput",
                        header: t("SL Nhập"),
                        minWidth: 140,
                        align: "center",
                        cell: (line, i) => {
                          return (
                            <input
                              type="number"
                              min={0}
                              className={cn(
                                inputCls,
                                "w-28 flex-shrink-0 text-right mx-auto",
                              )}
                              placeholder={`Nhập SL`}
                              value={line.qtyReceived ?? ""}
                              onChange={(e) => {
                                const qty = e.target.value;
                                setForm((f) => {
                                  const lines = [...f.lines];
                                  lines[i] = { ...lines[i], qtyReceived: qty };
                                  return { ...f, lines };
                                });
                              }}
                            />
                          );
                        },
                      },
                      {
                        key: "actions",
                        header: "",
                        minWidth: 50,
                        align: "center",
                        cell: (_, i) => {
                          return (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              disabled={
                                viewOnly || editing?.status === "POSTED"
                              }
                              onClick={() => {
                                setForm((f) => {
                                  const lines = [...f.lines];
                                  lines.splice(i, 1);
                                  return { ...f, lines };
                                });
                              }}
                            >
                              ✕
                            </Button>
                          );
                        },
                      },
                    ]}
                  />
                ) : viewOnly ? (
                  <DocumentLineTable
                    data={form.lines.filter((l) => Number(l.qtyReceived) > 0)}
                    getRowKey={(_, i) => i}
                    viewOnly={true}
                    tableContainerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
                    footer={
                      <tr>
                        <td
                          colSpan={form.receiptType === "PO" ? 5 : 3}
                          className="px-3 py-3 text-right font-semibold"
                        ></td>
                        <td className="px-3 py-3 text-center font-semibold text-emerald-600">
                          +
                          {fmtQty(
                            form.lines
                              .reduce(
                                (sum, l) => sum + Number(l.qtyReceived || 0),
                                0,
                              )
                              .toString(),
                          )}
                        </td>
                        {!viewOnly && <td className="px-3 py-3"></td>}
                      </tr>
                    }
                    columns={[
                      {
                        key: "index",
                        header: "#",
                        width: 40,
                        align: "center",
                        cell: (_, i) => (
                          <span className="text-muted-foreground">{i + 1}</span>
                        ),
                      },
                      {
                        key: "itemCode",
                        header: t("Mã linh kiện"),
                        minWidth: 140,
                        cell: (line) => {
                          const itemCode =
                            line.itemId && itemsDict[line.itemId]
                              ? itemsDict[line.itemId].sku
                              : "—";
                          return <span>{itemCode}</span>;
                        },
                      },
                      {
                        key: "itemName",
                        header: t("Tên linh kiện"),
                        minWidth: 260,
                        cell: (line) => {
                          const itemName =
                            line.itemName ||
                            (line.itemId && itemsDict[line.itemId]
                              ? itemsDict[line.itemId].itemName
                              : "") ||
                            line.itemId ||
                            "—";
                          return (
                            <div
                              className="font-medium text-foreground truncate max-w-[260px]"
                              title={itemName}
                            >
                              {itemName}
                            </div>
                          );
                        },
                      },
                      ...(form.receiptType === "PO"
                        ? [
                            {
                              key: "ordered",
                              header: t("Đã đặt"),
                              minWidth: 100,
                              align: "center" as const,
                              cell: () => "—",
                            },
                            {
                              key: "remaining",
                              header: t("Còn lại"),
                              minWidth: 100,
                              align: "center" as const,
                              cell: () => "—",
                            },
                          ]
                        : []),
                      {
                        key: "qtyReceived",
                        header: t("SL Nhập"),
                        minWidth: 140,
                        align: "center",
                        cell: (line) => (
                          <div className="font-medium text-emerald-600">
                            +{fmtQty(line.qtyReceived)}
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-center text-muted-foreground space-y-4">
                    <p>{t("Chọn PO để hiện danh sách hàng cần nhận.")}</p>
                    {form.receiptType === "OTHER" && !viewOnly && (
                      <div className="flex justify-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setForm((f) => ({
                              ...f,
                              lines: [
                                ...f.lines,
                                {
                                  purchaseOrderLineId: "",
                                  productionOrderMaterialId: "",
                                  itemId: "",
                                  itemName: "",
                                  qtyReceived: "",
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
                  value={form.receiptNo}
                  disabled={viewOnly || editing?.status === "POSTED"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, receiptNo: e.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label={t("Ngày nhập")}>
                <DatePicker
                  value={form.receiptDate ? form.receiptDate.slice(0, 10) : ""}
                  disabled={viewOnly || editing?.status === "POSTED"}
                  onChange={(v) => setForm((f) => ({ ...f, receiptDate: v }))}
                />
              </DrawerField>
              <DrawerField label={t("Loại nhập")}>
                <Combobox
                  options={[
                    { label: t("Đơn mua hàng"), value: "PO" },
                    { label: t("Nhập khác"), value: "OTHER" },
                  ]}
                  value={form.receiptType}
                  onChange={(val) => {
                    if (val === "PO") {
                      setForm((f) => ({ ...f, receiptType: "PO", lines: [] }));
                    } else if (val === "OTHER") {
                      setForm((f) => ({
                        ...f,
                        receiptType: "OTHER",
                        purchaseOrderId: "",
                        lines: [],
                      }));
                    }
                  }}
                  disabled={viewOnly || editing !== null}
                  allowClear={false}
                />
              </DrawerField>

              {form.receiptType === "PO" && (
                <DrawerField label={t("Đơn mua hàng (PO)")}>
                  <Combobox
                    options={poOptions}
                    value={form.purchaseOrderId}
                    disabled={viewOnly || editing !== null}
                    placeholder={t("Chọn PO...")}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, purchaseOrderId: v, lines: [] }))
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
        <GoodsReceiptPrintTemplate
          ref={printRef}
          companyProfile={companyProfile}
          data={{
            receiptNo: editing?.receiptNo || form.receiptNo || "...",
            receiptDate:
              editing?.receiptDate ||
              form.receiptDate ||
              new Date().toISOString(),
            supplierName: "",
            poNo:
              poOptions.find((o) => o.value === form.purchaseOrderId)?.label ||
              "",
            remarks: form.remarks,
            lines: form.lines.map((l) => {
              const dictItem = itemsDict[l.itemId];
              return {
                itemId: l.itemId,
                itemCode: dictItem?.sku || l.itemId,
                itemName: l.itemName || dictItem?.itemName || "",
                qtyReceived: l.qtyReceived,
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
            "Mã linh kiện",
            "Tên linh kiện",
            "Số lượng",
            "Đơn giá",
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
          downloadInventoryTemplate(headers, "Template_NhapKho.xlsx", refItems);
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
              const sku = row["Mã linh kiện"]?.toString().trim();
              const qty = row["Số lượng"]?.toString().trim();
              const price = row["Đơn giá"]?.toString().trim();

              if (!sku) return;

              const itemId = skuToId[sku.toLowerCase()];
              if (itemId) {
                newLines.push({
                  purchaseOrderLineId: "",
                  productionOrderMaterialId: "",
                  itemId,
                  itemName: idToName[itemId] || "",
                  qtyReceived: qty || "",
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

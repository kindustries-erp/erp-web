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
import { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { useUIStore } from "@/core/config/uiStore";
import { GoodsReceiptPrintTemplate } from "@/shared/components/print-templates/GoodsReceiptPrintTemplate";
import { DatePicker } from "@/shared/components/DatePicker";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

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
    moDetail,
    moOptions,
    itemsDict,
    supplierOptions,
    setSupplierSearch,
    fetchNextSuppliers,
    loadingSuppliers,
    close,
    handleSave,
    setViewOnly,
  } = drawer;

  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const canUpdate = useHasPermission("goods_receipts", "update");

  const t = useT();
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PhieuNhapKho_${editing?.receiptNo || "New"}`,
  });
  const { data: companyProfile } = useCompanyProfile();

  const actions =
    viewOnly || loading
      ? [
          ...(editing && editing.status !== "DRAFT"
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
          !["POSTED", "CANCELLED", "VOIDED"].includes(editing.status || "DRAFT")
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
                  !viewOnly && (poDetail || moDetail) ? (
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
                            } else if (moDetail && moDetail.lines) {
                              // In a real scenario, this would be moDetail.finishedGoods or similar
                              // Assuming moDetail has some output lines for finished goods
                              // If the MO produces a single item, we construct a single line
                              newLines = [
                                {
                                  purchaseOrderLineId: "",
                                  productionOrderMaterialId: "",
                                  itemId: moDetail.finishedGoodItemId ?? "",
                                  itemName: moDetail.finishedGoodItemName ?? "",
                                  qtyReceived:
                                    moDetail.qtyToProduce?.toString() ?? "",
                                  unitCost: "",
                                },
                              ];
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
                ) : moDetail ? (
                  <DocumentLineTable
                    data={[moDetail]}
                    getRowKey={(line) => line.id || ""}
                    viewOnly={true}
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
                        header: t("Mã TP"),
                        minWidth: 140,
                        cell: (mo) => {
                          const itemCode =
                            mo.finishedGoodItemId &&
                            itemsDict[mo.finishedGoodItemId]
                              ? itemsDict[mo.finishedGoodItemId].sku
                              : "—";
                          return <span>{itemCode}</span>;
                        },
                      },
                      {
                        key: "itemName",
                        header: t("Tên thành phẩm"),
                        minWidth: 260,
                        cell: (mo) => {
                          const itemName =
                            mo.finishedGoodItemName ||
                            mo.finishedGoodItemId ||
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
                        key: "planned",
                        header: t("Kế hoạch"),
                        minWidth: 100,
                        align: "center",
                        cell: (mo) => (
                          <div className="font-medium text-foreground">
                            {Number(mo.qtyToProduce ?? 0).toLocaleString(
                              "vi-VN",
                            )}
                          </div>
                        ),
                      },
                      {
                        key: "qtyInput",
                        header: t("SL Nhập"),
                        minWidth: 140,
                        align: "center",
                        cell: (mo) => {
                          const lineIdx = form.lines.findIndex(
                            (l) => l.itemId === mo.finishedGoodItemId,
                          );
                          const currentLine =
                            lineIdx >= 0 ? form.lines[lineIdx] : null;

                          if (!viewOnly) {
                            return (
                              <input
                                type="number"
                                min={0}
                                className={cn(
                                  inputCls,
                                  "w-28 flex-shrink-0 text-right mx-auto",
                                )}
                                placeholder={`Nhập SL`}
                                value={currentLine?.qtyReceived ?? ""}
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
                                        purchaseOrderLineId: "",
                                        productionOrderMaterialId: "",
                                        itemId: mo.finishedGoodItemId ?? "",
                                        itemName: mo.finishedGoodItemName ?? "",
                                        qtyReceived: qty,
                                        unitCost: "",
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
                ) : viewOnly ? (
                  <DocumentLineTable
                    data={form.lines.filter((l) => Number(l.qtyReceived) > 0)}
                    getRowKey={(_, i) => i}
                    viewOnly={true}
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
                          const itemName = line.itemName || line.itemId || "—";
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
                        cell: () => "—",
                      },
                      {
                        key: "remaining",
                        header: t("Còn lại"),
                        minWidth: 100,
                        align: "center",
                        cell: () => "—",
                      },
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
                  <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-center text-muted-foreground">
                    {t("Chọn PO/MO để hiện danh sách hàng cần nhận.")}
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
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, receiptNo: e.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label={t("Ngày nhập")}>
                <DatePicker
                  value={form.receiptDate ? form.receiptDate.slice(0, 10) : ""}
                  disabled={viewOnly}
                  onChange={(v) => setForm((f) => ({ ...f, receiptDate: v }))}
                />
              </DrawerField>
              <DrawerField label={t("Đơn mua hàng (PO)")}>
                <Combobox
                  options={poOptions}
                  value={form.purchaseOrderId}
                  disabled={viewOnly || !!form.productionOrderId}
                  placeholder={t("Chọn PO...")}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, purchaseOrderId: v, lines: [] }))
                  }
                />
              </DrawerField>
              <DrawerField label={t("Lệnh sản xuất (MO)")}>
                <Combobox
                  options={moOptions}
                  value={form.productionOrderId}
                  disabled={viewOnly || !!form.purchaseOrderId}
                  placeholder={t("Chọn MO...")}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, productionOrderId: v, lines: [] }))
                  }
                />
              </DrawerField>
              <DrawerField label={t("Nhà cung cấp")}>
                <Combobox
                  options={supplierOptions}
                  value={form.supplierId}
                  disabled={viewOnly || !!form.purchaseOrderId}
                  placeholder={t("Chọn NCC")}
                  searchPlaceholder={t("Tìm kiếm...")}
                  onSearch={setSupplierSearch}
                  onScrollBottom={fetchNextSuppliers}
                  loading={loadingSuppliers}
                  onChange={(v) => setForm((f) => ({ ...f, supplierId: v }))}
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
        <GoodsReceiptPrintTemplate
          ref={printRef}
          companyProfile={companyProfile}
          data={{
            receiptNo: editing?.receiptNo || form.receiptNo || "...",
            receiptDate:
              editing?.receiptDate ||
              form.receiptDate ||
              new Date().toISOString(),
            supplierName:
              supplierOptions.find((o) => o.value === form.supplierId)?.label ||
              "",
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
    </>
  );
}

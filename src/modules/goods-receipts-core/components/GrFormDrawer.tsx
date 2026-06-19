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
    supplierOptions,
    setSupplierSearch,
    fetchNextSuppliers,
    loadingSuppliers,
    close,
    handleSave,
    setViewOnly,
  } = drawer;

  const actions =
    viewOnly || loading
      ? [
          {
            label: "Đóng",
            onClick: close,
            variant: "outline" as const,
            disabled: loading,
          },
        ]
      : [
          {
            label: "Hủy",
            onClick: close,
            variant: "outline" as const,
            disabled: saving,
          },
          {
            label: "Lưu nháp",
            onClick: () => void handleSave("DRAFT"),
            variant: "secondary" as const,
            loading: saving,
            disabled: saving,
          },
          {
            label: editing ? "Cập nhật" : "Tạo mới",
            onClick: () => void handleSave("POSTED"),
            primary: true,
            loading: saving,
            disabled: saving,
          },
        ];

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
            ? "Phiếu nhập kho"
            : "Sửa nhập kho"
          : "Tạo phiếu nhập kho"
      }
      subtitle={
        <div className="flex items-center gap-2">
          <span>{editing?.receiptNo ?? "Nhập kho"}</span>
          {editing?.status === "DRAFT" && (
            <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
              Nháp
            </span>
          )}
          {editing?.status === "CANCELLED" && (
            <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
              Đã hủy
            </span>
          )}
        </div>
      }
      rightPanelTitle="Thông tin chung"
      actions={actions}
      loading={loading}
      error={saveError}
      leftPanel={
        <>
          {loading ? (
            <DrawerSection title="Chi tiết">
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </DrawerSection>
          ) : (
            <DrawerSection
              title={`Chi tiết (${form.lines.length})`}
              titleExtra={
                !viewOnly && poDetail ? (
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
                      Đặt lại
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[11px] px-2 leading-none"
                      onClick={() => {
                        setForm((f) => {
                          const newLines = (poDetail.lines || []).map(
                            (poLine) => {
                              const ordered = Number(poLine.qtyOrdered ?? 0);
                              const received = Number(poLine.qtyReceived ?? 0);
                              const remaining = Math.max(0, ordered - received);
                              return {
                                purchaseOrderLineId: poLine.id ?? "",
                                itemId: poLine.itemId ?? "",
                                itemName: poLine.itemName ?? "",
                                qtyReceived:
                                  remaining > 0 ? remaining.toString() : "",
                                unitCost: poLine.unitPrice ?? "",
                              };
                            },
                          );
                          return { ...f, lines: newLines };
                        });
                      }}
                    >
                      Nhập hết
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
                        <span className="text-muted-foreground">{idx + 1}</span>
                      ),
                    },
                    {
                      key: "itemCode",
                      header: "Mã linh kiện",
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
                      header: "Tên linh kiện",
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
                      header: "Đã đặt",
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
                      header: "Còn lại",
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
                      header: "SL Nhập",
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
                      header: "Mã linh kiện",
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
                      header: "Tên linh kiện",
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
                      header: "Đã đặt",
                      minWidth: 100,
                      align: "center",
                      cell: () => "—",
                    },
                    {
                      key: "remaining",
                      header: "Còn lại",
                      minWidth: 100,
                      align: "center",
                      cell: () => "—",
                    },
                    {
                      key: "qtyReceived",
                      header: "SL Nhập",
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
                  Chọn PO để hiện danh sách hàng cần nhận.
                </div>
              )}
            </DrawerSection>
          )}
        </>
      }
      rightPanel={
        loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1 min-w-[280px]">
            <DrawerField label="Số phiếu">
              <input
                className={inputCls}
                placeholder="Tự động nếu để trống"
                value={form.receiptNo}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((f) => ({ ...f, receiptNo: e.target.value }))
                }
              />
            </DrawerField>
            <DrawerField label="Ngày nhập">
              <input
                type="date"
                className={inputCls}
                value={form.receiptDate}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((f) => ({ ...f, receiptDate: e.target.value }))
                }
              />
            </DrawerField>
            <DrawerField label="Đơn mua hàng (PO)">
              <Combobox
                options={poOptions}
                value={form.purchaseOrderId}
                disabled={viewOnly}
                placeholder="Chọn PO..."
                onChange={(v) =>
                  setForm((f) => ({ ...f, purchaseOrderId: v, lines: [] }))
                }
              />
            </DrawerField>
            <DrawerField label="Nhà cung cấp">
              <Combobox
                options={supplierOptions}
                value={form.supplierId}
                disabled={viewOnly || !!form.purchaseOrderId}
                placeholder="Chọn NCC"
                searchPlaceholder="Tìm kiếm..."
                onSearch={setSupplierSearch}
                onScrollBottom={fetchNextSuppliers}
                loading={loadingSuppliers}
                onChange={(v) => setForm((f) => ({ ...f, supplierId: v }))}
              />
            </DrawerField>
            <DrawerField label="Ghi chú">
              <textarea
                className={`${inputCls} min-h-[60px] resize-y`}
                value={form.remarks}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remarks: e.target.value }))
                }
              />
            </DrawerField>
          </div>
        )
      }
    />
  );
}

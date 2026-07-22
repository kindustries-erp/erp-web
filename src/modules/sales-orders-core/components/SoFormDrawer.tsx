import React, { useState } from "react";
import { useT } from "@/core/i18n";
import toast from "react-hot-toast";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerSection,
  inputCls,
  DrawerRow,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import type {
  ErpSalesOrder,
  CreateSoPayload,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import { salesOrdersCoreApi } from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { SerialPicker } from "./SerialPicker";
import { DeliveryConfirmModal } from "./DeliveryConfirmModal";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { SoSelectedSerialsTable } from "./SoSelectedSerialsTable";
import { Button } from "@/shared/components/ui/Button";

const SO_STATUS_MAP: Record<string, { label: string; colorClass: string }> = {
  DRAFT: {
    label: "Nháp",
    colorClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  CONFIRMED: {
    label: "Đã chốt",
    colorClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  RESERVED: {
    label: "Đã giữ hàng",
    colorClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PARTIAL_RESERVED: {
    label: "Giữ 1 phần",
    colorClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  DELIVERING: {
    label: "Đang giao",
    colorClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  PARTIAL_DELIVERING: {
    label: "Giao 1 phần",
    colorClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  DELIVERED: {
    label: "Đã giao",
    colorClass: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    colorClass: "bg-red-100 text-red-800 border-red-200",
  },
};

export interface SoLineForm {
  id?: string;
  itemId: string;
  itemName: string;
  qtyOrdered: string;
  unitPrice: string;
  amount: string;
  selectedSerialIds?: string[];
}

export interface SoForm {
  soNo: string;
  customerId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: string;
  remarks: string;
  lines: SoLineForm[];
}

export const emptyLine = (): SoLineForm => ({
  itemId: "",
  itemName: "",
  qtyOrdered: "1",
  unitPrice: "0",
  amount: "0",
  selectedSerialIds: [],
});

export const emptyForm = (): SoForm => ({
  soNo: "",
  customerId: "",
  orderDate: new Date().toISOString().slice(0, 10),
  expectedDeliveryDate: "",
  status: "DRAFT",
  remarks: "",
  lines: [emptyLine()],
});

export function buildForm(so: ErpSalesOrder): SoForm {
  return {
    soNo: so.soNo ?? "",
    customerId: so.customerId ?? "",
    orderDate: so.orderDate ? so.orderDate.slice(0, 10) : "",
    expectedDeliveryDate: so.expectedDeliveryDate
      ? so.expectedDeliveryDate.slice(0, 10)
      : "",
    status: so.status ?? "DRAFT",
    remarks: so.remarks ?? "",
    lines: so.lines?.length
      ? so.lines.map((line: any) => ({
          id: line.id,
          itemId: line.itemId ?? "",
          itemName: line.itemName ?? "",
          qtyOrdered: line.qtyOrdered ?? "1",
          unitPrice: line.unitPrice ?? "0",
          amount: line.amount ?? "0",
          selectedSerialIds: line.selectedSerialIds || line.serialIds || [],
        }))
      : [emptyLine()],
  };
}

export function calcAmount(qtyOrdered: string, unitPrice: string) {
  const qty = Number(qtyOrdered || 0);
  const price = Number(unitPrice || 0);
  if (Number.isNaN(qty) || Number.isNaN(price)) return "0";
  return (qty * price).toFixed(3);
}

export function toPayload(form: SoForm): CreateSoPayload {
  return {
    soNo: form.soNo.trim(),
    customerId: form.customerId || undefined,
    orderDate: form.orderDate,
    expectedDeliveryDate: form.expectedDeliveryDate || undefined,
    status: form.status || "DRAFT",
    remarks: form.remarks.trim() || undefined,
    lines: form.lines.map((line) => ({
      itemId: line.itemId || undefined,
      itemName: line.itemName || undefined,
      qtyOrdered: line.qtyOrdered,
      unitPrice: line.unitPrice || undefined,
      amount: calcAmount(line.qtyOrdered, line.unitPrice),
      serialIds: line.selectedSerialIds?.length
        ? line.selectedSerialIds
        : undefined,
    })),
  };
}

function fmtMoney(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export interface SoFormDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: DrawerMode;
  editing: ErpSalesOrder | null;
  form: SoForm;
  setForm: React.Dispatch<React.SetStateAction<SoForm>>;
  drawerLoading: boolean;
  saving: boolean;
  saveError: string | null;
  handleSave: (overrideStatus?: string) => void;

  customerOptions: Array<{ value: string; label: string }>;
  setCustomerSearch: (search: string) => void;
  fetchNextCustomers: () => void;
  loadingCustomers: boolean;

  itemOptions: Array<{ value: string; label: string; original?: any }>;
  setItemSearch: (search: string) => void;
  fetchNextItems: () => void;
  loadingItems: boolean;

  addLine: () => void;
  removeLine: (index: number) => void;
  updateLine: (index: number, patch: Partial<SoLineForm>) => void;

  onToggleEdit?: () => void;
  onRefresh?: () => void;
  /** Pending tag IDs for Option B create flow */
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
}

export function SoFormDrawer({
  open,
  onClose,
  mode,
  editing,
  form,
  setForm,
  drawerLoading,
  saving,
  saveError,
  handleSave,

  customerOptions,
  setCustomerSearch,
  fetchNextCustomers,
  loadingCustomers,

  itemOptions,
  setItemSearch,
  fetchNextItems,
  loadingItems,

  addLine,
  removeLine,
  updateLine,
  onToggleEdit,
  onRefresh,
  pendingTagIds = [],
  onPendingTagsChange,
}: SoFormDrawerProps) {
  const t = useT();
  const giDrawer = useGiDrawer();
  const viewOnly = mode === "view";
  const isEditing = mode === "edit";
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [isConfirmingBulk, setIsConfirmingBulk] = useState(false);

  const isSoDraft = form.status === "DRAFT";
  const isSoLocked = ![
    "DRAFT",
    "CONFIRMED",
    "RESERVED",
    "PARTIAL_RESERVED",
  ].includes(form.status);

  const canConfirmDelivery =
    viewOnly &&
    editing &&
    (editing.status === "DELIVERING" ||
      editing.status === "PARTIAL_DELIVERING");
  const serialIdsToConfirm =
    editing?.lines?.flatMap(
      (l: any) => l.selectedSerialIds || l.serialIds || [],
    ) || [];

  const allSelectedSerialIds = React.useMemo(
    () => form.lines.flatMap((l) => l.selectedSerialIds || []).filter(Boolean),
    [form.lines],
  );

  const handleBulkConfirmDelivery = async () => {
    if (!editing?.id) return;
    if (
      !window.confirm(
        t("Bạn có chắc chắn muốn xác nhận giao hàng cho toàn bộ đơn hàng này?"),
      )
    )
      return;
    setIsConfirmingBulk(true);
    try {
      await salesOrdersCoreApi.confirmAllDelivery(editing.id);
      toast.success(t("Đã xác nhận giao hàng thành công"));
      onClose();
      // Call onRefresh to trigger grid update
      onRefresh?.();
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || t("Xác nhận giao hàng thất bại"),
      );
    } finally {
      setIsConfirmingBulk(false);
    }
  };

  const onSaveValidated = (overrideStatus?: string) => {
    // Validate serials count
    for (let i = 0; i < form.lines.length; i++) {
      const line = form.lines[i];
      const matchedItem = itemOptions.find(
        (o) => o.value === line.itemId,
      )?.original;
      const trackingPolicyId = matchedItem?.trackingPolicyId || "NONE";

      if (trackingPolicyId !== "NONE") {
        const selectedCount = line.selectedSerialIds?.length || 0;
        const qty = Number(line.qtyOrdered || 0);
        if (selectedCount !== qty) {
          toast.error(
            `Dòng ${i + 1}: Số lượng Serial/Số khung đã chọn (${selectedCount}) phải bằng với Số lượng mua (${qty})`,
          );
          return;
        }
      }
    }
    handleSave(overrideStatus);
  };

  const drawerActions = viewOnly
    ? [
        {
          label: t("Đóng"),
          onClick: onClose,
          variant: "outline" as const,
          disabled: saving,
        },
        ...(canConfirmDelivery
          ? [
              {
                label: t("Xác nhận giao hàng"),
                variant: "secondary" as const,
                align: "left" as const,
                onClick: () => {
                  if (serialIdsToConfirm.length > 0) {
                    setDeliveryModalOpen(true);
                  } else {
                    handleBulkConfirmDelivery();
                  }
                },
                disabled: saving || isConfirmingBulk,
              },
            ]
          : []),
      ]
    : isEditing && form.status !== "DRAFT"
      ? [
          {
            label: t("Hủy"),
            onClick: onClose,
            variant: "outline" as const,
            disabled: saving,
          },
          {
            label: t("Lưu thay đổi"),
            primary: true,
            onClick: () => onSaveValidated(),
            disabled: saving,
          },
        ]
      : [
          {
            label: t("Hủy"),
            onClick: onClose,
            variant: "outline" as const,
            disabled: saving,
          },
          {
            label: isEditing ? t("Lưu Nháp") : t("Tạo Nháp"),
            variant: "outline" as const,
            onClick: () => onSaveValidated("DRAFT"),
            disabled: saving,
          },
          {
            label: isEditing ? t("Xác nhận") : t("Tạo Mới"),
            primary: true,
            onClick: () => onSaveValidated("CONFIRMED"),
            disabled: saving,
          },
        ];

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={mode}
        onClose={onClose}
        onToggleEdit={onToggleEdit}
        title={
          viewOnly
            ? t("Xem đơn bán hàng")
            : isEditing
              ? t("Cập nhật đơn bán hàng")
              : t("Tạo đơn bán hàng")
        }
        titleExtra={
          form.status ? (
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                SO_STATUS_MAP[form.status]?.colorClass ||
                "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {t(SO_STATUS_MAP[form.status]?.label || form.status)}
            </span>
          ) : null
        }
        subtitle={editing ? editing.soNo : t("Thông tin chung & dòng hàng")}
        actions={drawerActions}
        error={saveError}
        loading={drawerLoading}
        leftPanel={
          <div className="space-y-4">
            <DrawerSection
              title={
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:justify-between pr-4 mt-2 sm:mt-0">
                  <span className="shrink-0 mb-2 sm:mb-0">
                    {t("Chi tiết")} ({form.lines.length})
                  </span>
                </div>
              }
            >
              <DocumentLineTable
                data={form.lines}
                getRowKey={(_, idx) => String(idx)}
                viewOnly={viewOnly}
                variant={viewOnly || !isSoDraft ? "spreadsheet" : "default"}
                onAddLine={isSoDraft && !viewOnly ? addLine : undefined}
                onRemoveLine={isSoDraft && !viewOnly ? removeLine : undefined}
                columns={
                  [
                    {
                      key: "item",
                      header: t("Item"),
                      minWidth: 240,
                      cell: (line: any, idx: number) => {
                        if (viewOnly || !isSoDraft) {
                          const matched = itemOptions.find(
                            (opt) => opt.value === line.itemId,
                          );
                          const displayItemName = matched
                            ? matched.label.split(" — ").slice(1).join(" — ")
                            : line.itemName || line.itemId || "—";
                          return (
                            <span className="font-medium">
                              {displayItemName}
                            </span>
                          );
                        }
                        return (
                          <Combobox
                            value={line.itemId}
                            onChange={(value) => {
                              const matched = itemOptions.find(
                                (opt) => opt.value === value,
                              );
                              updateLine(idx, {
                                itemId: value,
                                itemName:
                                  matched?.label
                                    .split(" — ")
                                    .slice(1)
                                    .join(" — ") || "",
                              });
                            }}
                            options={itemOptions}
                            placeholder={t("Chọn inventory item")}
                            onSearch={setItemSearch}
                            onScrollBottom={fetchNextItems}
                            loading={loadingItems}
                            fallbackLabel={line.itemName}
                          />
                        );
                      },
                    },
                    viewOnly || isSoLocked
                      ? null
                      : {
                          key: "tracking",
                          header: t("Serials / Số khung"),
                          minWidth: 180,
                          cell: (line: any, idx: number) => {
                            const matchedItem = itemOptions.find(
                              (o) => o.value === line.itemId,
                            )?.original;
                            const hasSerials =
                              line.selectedSerialIds &&
                              line.selectedSerialIds.length > 0;
                            const trackingPolicyId =
                              matchedItem?.trackingPolicyId || "NONE";

                            if (
                              !line.itemId ||
                              (!hasSerials && trackingPolicyId === "NONE")
                            ) {
                              return (
                                <span className="text-[11px] font-medium bg-gray-100/50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md">
                                  Không quản lý Serial
                                </span>
                              );
                            }

                            if (viewOnly || isSoLocked) {
                              if (!hasSerials) {
                                return (
                                  <span className="text-[12px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                    Chưa chọn Serial / Số khung
                                  </span>
                                );
                              }
                              return (
                                <div className="flex items-center gap-2 py-1">
                                  <span className="text-[12px] font-medium bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md text-blue-700">
                                    {line.selectedSerialIds?.length || 0} Serial
                                    / Số khung đã chọn
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div className="flex items-center min-h-[36px] py-1">
                                <SerialPicker
                                  itemId={line.itemId}
                                  trackingPolicyId={trackingPolicyId}
                                  value={line.selectedSerialIds || []}
                                  onChange={(ids) => {
                                    const updates: Partial<SoLineForm> = {
                                      selectedSerialIds: ids,
                                    };
                                    if (isSoDraft) {
                                      updates.qtyOrdered = String(
                                        ids.length || 1,
                                      );
                                    }
                                    updateLine(idx, updates);
                                  }}
                                  disabled={isSoLocked}
                                  readOnly={isSoLocked}
                                />
                              </div>
                            );
                          },
                        },
                    {
                      key: "qty",
                      header: t("Số lượng"),
                      minWidth: 90,
                      cell: (line: any, idx: number) => {
                        if (viewOnly || !isSoDraft) {
                          return <span>{line.qtyOrdered}</span>;
                        }
                        return (
                          <input
                            value={line.qtyOrdered}
                            onChange={(e) =>
                              updateLine(idx, { qtyOrdered: e.target.value })
                            }
                            className={inputCls}
                            placeholder="1"
                          />
                        );
                      },
                    },
                    {
                      key: "unitPrice",
                      header: t("Đơn giá"),
                      minWidth: 100,
                      cell: (line: any, idx: number) => {
                        if (viewOnly || !isSoDraft) {
                          return <span>{fmtMoney(line.unitPrice)}</span>;
                        }
                        return (
                          <input
                            value={line.unitPrice}
                            onChange={(e) =>
                              updateLine(idx, { unitPrice: e.target.value })
                            }
                            className={inputCls}
                            placeholder="0"
                          />
                        );
                      },
                    },
                    {
                      key: "amount",
                      header: t("Thành tiền"),
                      minWidth: 100,
                      cell: (line: any) => (
                        <span className="font-semibold text-primary">
                          {fmtMoney(line.amount)}
                        </span>
                      ),
                    },
                  ].filter(Boolean) as any
                }
                rowClassName={(row: any) =>
                  `group ${row.status === "DELETED" ? "opacity-50" : ""}`
                }
              />
            </DrawerSection>

            {allSelectedSerialIds.length > 0 && (
              <DrawerSection title={t("Danh sách Serial/Xe đã chọn")}>
                <SoSelectedSerialsTable serialIds={allSelectedSerialIds} />
              </DrawerSection>
            )}
          </div>
        }
        rightPanel={
          <div className="flex flex-col gap-3">
            <DrawerSection title={t("Thông tin chung")}>
              <div className="flex flex-col gap-3">
                {viewOnly || !!editing ? (
                  <DrawerRow label="Mã đơn hàng" value={form.soNo || "—"} />
                ) : (
                  <DrawerField label="Mã đơn hàng" required>
                    <input
                      value={form.soNo}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, soNo: e.target.value }))
                      }
                      className={inputCls}
                      placeholder={t("VD: SO-2410-001")}
                    />
                  </DrawerField>
                )}
                {viewOnly || !isSoDraft ? (
                  <DrawerRow
                    label="Khách hàng"
                    value={
                      customerOptions.find((c) => c.value === form.customerId)
                        ?.label ||
                      editing?.customerName ||
                      form.customerId ||
                      "—"
                    }
                  />
                ) : (
                  <DrawerField label="Khách hàng" required>
                    <Combobox
                      value={form.customerId}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, customerId: value }))
                      }
                      options={customerOptions}
                      placeholder={t("Chọn khách hàng")}
                      onSearch={setCustomerSearch}
                      onScrollBottom={fetchNextCustomers}
                      loading={loadingCustomers}
                      fallbackLabel={editing?.customerName || ""}
                    />
                  </DrawerField>
                )}
                {viewOnly || isSoLocked ? (
                  <DrawerRow
                    label={t("Ngày đặt")}
                    value={form.orderDate || "—"}
                  />
                ) : (
                  <DrawerField label={t("Ngày đặt")} required>
                    <DatePicker
                      className={inputCls}
                      value={form.orderDate}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, orderDate: v }))
                      }
                    />
                  </DrawerField>
                )}
                {viewOnly ? (
                  <DrawerRow
                    label={t("Ngày giao dự kiến")}
                    value={form.expectedDeliveryDate || "—"}
                  />
                ) : (
                  <DrawerField label={t("Ngày giao dự kiến")}>
                    <DatePicker
                      className={inputCls}
                      value={form.expectedDeliveryDate}
                      placeholder={t("Chọn ngày giao")}
                      onChange={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          expectedDeliveryDate: v,
                        }))
                      }
                    />
                  </DrawerField>
                )}
                {viewOnly ? (
                  <DrawerRow
                    label={t("Ghi chú")}
                    value={
                      <span className="whitespace-pre-wrap text-right inline-block max-w-[250px]">
                        {form.remarks || "—"}
                      </span>
                    }
                  />
                ) : (
                  <DrawerField label={t("Ghi chú")}>
                    <textarea
                      value={form.remarks}
                      className={inputCls}
                      rows={3}
                      placeholder={t("Ghi chú đơn bán hàng")}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                    />
                  </DrawerField>
                )}
                <DrawerField label={t("Thẻ nhãn")}>
                  {editing ? (
                    <EntityTagSelector
                      entityType="erp_sales_order"
                      entityId={editing.id}
                      readOnly={viewOnly}
                    />
                  ) : !viewOnly ? (
                    <EntityTagSelector
                      entityType="erp_sales_order"
                      entityId="__pending__"
                      readOnly={false}
                      pendingMode
                      pendingTagIds={pendingTagIds}
                      onPendingChange={onPendingTagsChange}
                    />
                  ) : null}
                </DrawerField>
              </div>
            </DrawerSection>

            {editing?.goodsIssues?.length ? (
              <DrawerSection title="Phiếu xuất kho liên kết">
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Số phiếu</th>
                        <th className="px-3 py-2">Ngày xuất</th>
                        <th className="px-3 py-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editing.goodsIssues.map((gi: any) => (
                        <tr key={gi.id} className="border-t border-border">
                          <td className="px-3 py-2 text-primary font-medium">
                            <Button
                              variant="link"
                              onClick={(e) => {
                                e.preventDefault();
                                giDrawer.openDetail(gi.id);
                              }}
                              className="text-primary hover:underline"
                            >
                              {gi.issueNo}
                            </Button>
                          </td>
                          <td className="px-3 py-2">
                            {gi.issueDate
                              ? new Date(gi.issueDate).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${gi.status === "POSTED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {gi.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DrawerSection>
            ) : null}
          </div>
        }
      />
      <DeliveryConfirmModal
        open={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        serialIds={serialIdsToConfirm}
        onConfirmSuccess={() => {
          setDeliveryModalOpen(false);
          onClose();
          onRefresh?.();
        }}
      />
      <GiFormDrawer drawer={giDrawer} />
    </>
  );
}

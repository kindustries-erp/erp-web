import React, { useState } from "react";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import type {
  ErpSalesOrder,
  CreateSoPayload,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { SerialPicker } from "./SerialPicker";
import { DeliveryConfirmModal } from "./DeliveryConfirmModal";

export interface SoLineForm {
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
          itemId: line.itemId ?? "",
          itemName: line.itemName ?? "",
          qtyOrdered: line.qtyOrdered ?? "1",
          unitPrice: line.unitPrice ?? "0",
          amount: line.amount ?? "0",
          selectedSerialIds: line.serialIds || [],
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

function fmtQty(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
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
  pendingTagIds = [],
  onPendingTagsChange,
}: SoFormDrawerProps) {
  const t = useT();
  const viewOnly = mode === "view";
  const isEditing = mode === "edit";
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);

  const canConfirmDelivery =
    viewOnly &&
    editing &&
    (editing.status === "DELIVERED" || editing.status === "PARTIAL_DELIVERED");
  const serialIdsToConfirm =
    editing?.lines?.flatMap((l: any) => l.serialIds || []) || [];

  const drawerActions = viewOnly
    ? [
        {
          label: t("Đóng"),
          onClick: onClose,
          variant: "outline" as const,
          disabled: saving,
        },
        ...(canConfirmDelivery && serialIdsToConfirm.length > 0
          ? [
              {
                label: t("Xác nhận giao hàng"),
                primary: true,
                onClick: () => setDeliveryModalOpen(true),
                disabled: saving,
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
            onClick: () => handleSave(),
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
            onClick: () => handleSave("DRAFT"),
            disabled: saving,
          },
          {
            label: isEditing ? t("Xác nhận") : t("Tạo Mới"),
            primary: true,
            onClick: () => handleSave("CONFIRMED"),
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
          form.status === "DRAFT" && (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
              {t("Nháp")}
            </span>
          )
        }
        subtitle={editing ? editing.soNo : t("Thông tin chung & dòng hàng")}
        actions={drawerActions}
        rightPanelTitle={t("Thông tin chung")}
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
                onAddLine={addLine}
                onRemoveLine={removeLine}
                columns={[
                  {
                    key: "item",
                    header: t("Item"),
                    minWidth: 240,
                    cell: (line, idx) => (
                      <Combobox
                        value={line.itemId}
                        readOnly={viewOnly || !!editing}
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
                    ),
                  },
                  {
                    key: "tracking",
                    header: t("Serials / Số khung"),
                    minWidth: 180,
                    cell: (line, idx) => {
                      const matchedItem = itemOptions.find(
                        (o) => o.value === line.itemId,
                      )?.original;
                      const hasSerials =
                        line.selectedSerialIds &&
                        line.selectedSerialIds.length > 0;

                      if (
                        !line.itemId ||
                        (!hasSerials &&
                          (!matchedItem ||
                            !matchedItem.trackingPolicyId ||
                            matchedItem.trackingPolicyId === "NONE"))
                      ) {
                        return (
                          <span className="text-[11px] text-muted-foreground">
                            —
                          </span>
                        );
                      }
                      return (
                        <div className="flex items-center min-h-[36px] py-1">
                          <SerialPicker
                            itemId={line.itemId}
                            trackingPolicyId={
                              matchedItem?.trackingPolicyId || "UNKNOWN"
                            }
                            value={line.selectedSerialIds || []}
                            onChange={(ids) => {
                              updateLine(idx, {
                                selectedSerialIds: ids,
                                qtyOrdered: String(ids.length || 1), // auto update qty
                              });
                            }}
                            disabled={viewOnly || !!editing}
                            readOnly={viewOnly || !!editing}
                          />
                        </div>
                      );
                    },
                  },
                  {
                    key: "qty",
                    header: t("Số lượng"),
                    minWidth: 90,
                    cell: (line, idx) => (
                      <input
                        value={line.qtyOrdered}
                        readOnly={viewOnly || !!editing}
                        onChange={(e) =>
                          updateLine(idx, { qtyOrdered: e.target.value })
                        }
                        className={inputCls}
                        placeholder="1"
                      />
                    ),
                  },
                  {
                    key: "unitPrice",
                    header: t("Đơn giá"),
                    minWidth: 100,
                    cell: (line, idx) => (
                      <input
                        value={line.unitPrice}
                        readOnly={viewOnly || !!editing}
                        onChange={(e) =>
                          updateLine(idx, { unitPrice: e.target.value })
                        }
                        className={inputCls}
                        placeholder="0"
                      />
                    ),
                  },
                  {
                    key: "amount",
                    header: t("Thành tiền"),
                    minWidth: 100,
                    cell: (line) => (
                      <div
                        className={`${inputCls} flex items-center bg-muted/40`}
                      >
                        {fmtMoney(line.amount)}
                      </div>
                    ),
                  },
                ]}
              />
            </DrawerSection>

            {editing?.lines?.length ? (
              <DrawerSection title="Trạng thái reserve/deliver hiện tại">
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2 text-right">Ordered</th>
                        <th className="px-3 py-2 text-right">Reserved</th>
                        <th className="px-3 py-2 text-right">Delivered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editing.lines.map((line, idx) => (
                        <tr
                          key={line.id ?? idx}
                          className="border-t border-border"
                        >
                          <td className="px-3 py-2">
                            {line.itemName || line.itemId || "—"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {fmtQty(line.qtyOrdered)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {fmtQty(line.qtyReserved)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {fmtQty(line.qtyDelivered)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DrawerSection>
            ) : null}

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
                            <a
                              href={`/app/inventory/goods-issues`}
                              className="hover:underline"
                            >
                              {gi.giNo}
                            </a>
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
        rightPanel={
          <div className="flex flex-col gap-3">
            <DrawerField label="Mã đơn hàng" required>
              <input
                value={form.soNo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, soNo: e.target.value }))
                }
                readOnly={viewOnly || !!editing}
                className={inputCls}
                placeholder={t("VD: SO-2410-001")}
              />
            </DrawerField>
            <DrawerField label="Khách hàng">
              <Combobox
                value={form.customerId}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, customerId: value }))
                }
                options={customerOptions}
                placeholder={t("Chọn khách hàng")}
                readOnly={viewOnly}
                onSearch={setCustomerSearch}
                onScrollBottom={fetchNextCustomers}
                loading={loadingCustomers}
              />
            </DrawerField>
            <DrawerField label={t("Ngày đặt")} required>
              <DatePicker
                className={inputCls}
                value={form.orderDate}
                disabled={viewOnly}
                onChange={(v) => setForm((prev) => ({ ...prev, orderDate: v }))}
              />
            </DrawerField>
            <DrawerField label={t("Ngày giao")}>
              <DatePicker
                className={inputCls}
                value={form.expectedDeliveryDate}
                disabled={viewOnly}
                placeholder={t("Chọn ngày giao")}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, expectedDeliveryDate: v }))
                }
              />
            </DrawerField>
            <DrawerField label="Ghi chú">
              <textarea
                value={form.remarks}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                readOnly={viewOnly}
                className={`${inputCls} min-h-[88px]`}
                placeholder={t("Ghi chú đơn bán hàng")}
              />
            </DrawerField>
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
        }
      />
      <DeliveryConfirmModal
        open={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        serialIds={serialIdsToConfirm}
        onConfirmSuccess={() => {
          // Just reload the page or trigger a refresh
          window.location.reload();
        }}
      />
    </>
  );
}

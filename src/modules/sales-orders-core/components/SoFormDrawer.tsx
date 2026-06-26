import React from "react";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import type {
  ErpSalesOrder,
  CreateSoPayload,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";

export interface SoLineForm {
  itemId: string;
  itemName: string;
  qtyOrdered: string;
  unitPrice: string;
  amount: string;
}

export interface SoForm {
  soNo: string;
  customerId: string;
  orderDate: string;
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
});

export const emptyForm = (): SoForm => ({
  soNo: "",
  customerId: "",
  orderDate: new Date().toISOString().slice(0, 10),
  status: "DRAFT",
  remarks: "",
  lines: [emptyLine()],
});

export function buildForm(so: ErpSalesOrder): SoForm {
  return {
    soNo: so.soNo ?? "",
    customerId: so.customerId ?? "",
    orderDate: so.orderDate ? so.orderDate.slice(0, 10) : "",
    status: so.status ?? "DRAFT",
    remarks: so.remarks ?? "",
    lines: so.lines?.length
      ? so.lines.map((line) => ({
          itemId: line.itemId ?? "",
          itemName: line.itemName ?? "",
          qtyOrdered: line.qtyOrdered ?? "1",
          unitPrice: line.unitPrice ?? "0",
          amount: line.amount ?? "0",
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
    status: form.status || "DRAFT",
    remarks: form.remarks.trim() || undefined,
    lines: form.lines.map((line) => ({
      itemId: line.itemId || undefined,
      itemName: line.itemName || undefined,
      qtyOrdered: line.qtyOrdered,
      unitPrice: line.unitPrice || undefined,
      amount: calcAmount(line.qtyOrdered, line.unitPrice),
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
  handleSave: () => void;

  customerOptions: Array<{ value: string; label: string }>;
  setCustomerSearch: (search: string) => void;
  fetchNextCustomers: () => void;
  loadingCustomers: boolean;

  itemOptions: Array<{ value: string; label: string }>;
  setItemSearch: (search: string) => void;
  fetchNextItems: () => void;
  loadingItems: boolean;

  addLine: () => void;
  removeLine: (index: number) => void;
  updateLine: (index: number, patch: Partial<SoLineForm>) => void;

  onToggleEdit?: () => void;
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
}: SoFormDrawerProps) {
  const t = useT();
  const viewOnly = mode === "view";
  const isEditing = mode === "edit";

  const drawerActions = [
    {
      label: t("Hủy"),
      onClick: onClose,
      variant: "outline" as const,
      disabled: saving,
    },
    {
      label: viewOnly ? t("Đóng") : isEditing ? t("Cập nhật") : t("Tạo mới"),
      onClick: viewOnly ? onClose : handleSave,
      primary: true,
      disabled: saving || viewOnly,
    },
  ];

  return (
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
      subtitle={editing ? editing.soNo : t("Thông tin chung & dòng hàng")}
      actions={drawerActions}
      panelClassName="min-[1024px]:min-w-[1100px] min-[1280px]:min-w-[1280px]"
      error={saveError}
      loading={drawerLoading}
      leftPanel={
        <div className="space-y-6">
          <DrawerSection title={t("Dòng hàng")}>
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
                            matched?.label.split(" — ").slice(1).join(" — ") ||
                            "",
                        });
                      }}
                      options={itemOptions}
                      placeholder={t("Chọn inventory item")}
                      onSearch={setItemSearch}
                      onScrollBottom={fetchNextItems}
                      loading={loadingItems}
                    />
                  ),
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
        </div>
      }
      rightPanel={
        <DrawerSection title={t("Thông tin chung")}>
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
            <DrawerField label="Ngày đơn" required>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, orderDate: e.target.value }))
                }
                readOnly={viewOnly}
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Trạng thái">
              <input
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
                readOnly={viewOnly}
                className={inputCls}
                placeholder="DRAFT"
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
          </div>
        </DrawerSection>
      }
    />
  );
}

import { useEffect, useMemo, useState } from "react";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  getBusinessPartnersPagedApi,
  type BusinessPartner,
} from "@/modules/partners/api/partnerApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import {
  operationalApi,
  type CreateOperationalPayload,
  type OperationalDocument,
  type OperationalVariant,
  type OperationalLine,
} from "../api/operationalApi";
import { extractApiError } from "@/shared/utils/apiError";

interface LineDraft {
  tempId: string;
  line_type: string;
  item_code: string;
  item_name: string;
  description: string;
  qty: string;
  unit_price: string;
  amount: string;
  notes: string;
}

interface Props {
  variant: Extract<OperationalVariant, "sales" | "purchase" | "expenses">;
  open: boolean;
  editing: OperationalDocument | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const variantTitle: Record<Props["variant"], string> = {
  sales: "Bán hàng / Đơn sửa xe",
  purchase: "Mua hàng",
  expenses: "Chi phí vận hành",
};

const invoiceOptions = [
  { value: "NO_INVOICE", label: "Chưa có hóa đơn" },
  { value: "HAS_INVOICE", label: "Đã có hóa đơn" },
  { value: "NOT_REQUIRED", label: "Không yêu cầu" },
];

const salesStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Hủy" },
];

const purchaseStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "RECEIVED", label: "Đã nhận" },
  { value: "CANCELLED", label: "Hủy" },
];

const expenseStatusOptions = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Xác nhận" },
  { value: "CANCELLED", label: "Hủy" },
];

const recurrenceOptions = [
  { value: "ONE_TIME", label: "Một lần" },
  { value: "MONTHLY", label: "Hàng tháng" },
  { value: "QUARTERLY", label: "Hàng quý" },
  { value: "YEARLY", label: "Hàng năm" },
];

const lineTypeOptions = [
  { value: "SERVICE", label: "Dịch vụ" },
  { value: "PRODUCT", label: "Hàng hóa" },
  { value: "PART", label: "Phụ tùng" },
  { value: "EXPENSE", label: "Chi phí" },
];

const today = () => new Date().toISOString().slice(0, 10);
const newTempId = () =>
  `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function emptyLine(variant: Props["variant"]): LineDraft {
  return {
    tempId: newTempId(),
    line_type: variant === "expenses" ? "EXPENSE" : "SERVICE",
    item_code: "",
    item_name: "",
    description: "",
    qty: variant === "expenses" ? "1" : "1",
    unit_price: "0",
    amount: "0",
    notes: "",
  };
}

function toLineDraft(
  line: OperationalLine,
  variant: Props["variant"],
): LineDraft {
  return {
    tempId: newTempId(),
    line_type:
      line.line_type || (variant === "expenses" ? "EXPENSE" : "SERVICE"),
    item_code: line.item_code || "",
    item_name: line.item_name || "",
    description: line.description || "",
    qty: String(line.qty ?? 1),
    unit_price: String(line.unit_price ?? 0),
    amount: String(line.amount ?? 0),
    notes: line.notes || "",
  };
}

export function OperationalFormDrawer({
  variant,
  open,
  editing,
  onClose,
  onSaved,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [partnerOptions, setPartnerOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [docNo, setDocNo] = useState("");
  const [branchId, setBranchId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [partnerNameSnapshot, setPartnerNameSnapshot] = useState("");
  const [title, setTitle] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [serviceAdvisorName, setServiceAdvisorName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [documentDate, setDocumentDate] = useState(today());
  const [expectedDate, setExpectedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState("NO_INVOICE");
  const [status, setStatus] = useState("DRAFT");
  const [recurrenceType, setRecurrenceType] = useState("ONE_TIME");
  const [recurrenceInterval, setRecurrenceInterval] = useState("1");
  const [recurrenceStartDate, setRecurrenceStartDate] = useState("");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [autoGenerateNext, setAutoGenerateNext] = useState(false);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine(variant)]);

  const statusOptions = useMemo(() => {
    if (variant === "sales") return salesStatusOptions;
    if (variant === "purchase") return purchaseStatusOptions;
    return expenseStatusOptions;
  }, [variant]);

  useEffect(() => {
    getBranchesApi()
      .then((branches) => {
        setBranchOptions(
          (branches ?? []).map((branch) => ({
            value: branch.id,
            label: branch.code
              ? `${branch.code} — ${branch.name}`
              : branch.name,
          })),
        );
      })
      .catch(() => setBranchOptions([]));
  }, []);

  useEffect(() => {
    const partnerRole = variant === "sales" ? "CUSTOMER" : "VENDOR";
    getBusinessPartnersPagedApi({ page: 1, pageSize: 200, partnerType: partnerRole })
      .then((res) => {
        setPartnerOptions(
          (res.items || []).map((p: BusinessPartner) => ({
            value: p.id,
            label: p.code ? `${p.code} — ${p.name}` : p.name,
          })),
        );
      })
      .catch(() => setPartnerOptions([]));
  }, [variant]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (!editing) {
      setDocNo("");
      setBranchId("");
      setPartnerId("");
      setPartnerNameSnapshot("");
      setTitle("");
      setVehiclePlate("");
      setVehicleVin("");
      setVehicleModel("");
      setServiceAdvisorName("");
      setExpenseCategory("");
      setDocumentDate(today());
      setExpectedDate("");
      setDueDate("");
      setInvoiceStatus("NO_INVOICE");
      setStatus("DRAFT");
      setRecurrenceType("ONE_TIME");
      setRecurrenceInterval("1");
      setRecurrenceStartDate("");
      setRecurrenceEndDate("");
      setNextDueDate("");
      setAutoGenerateNext(false);
      setNotes("");
      setLines([emptyLine(variant)]);
      return;
    }

    setDocNo(
      editing.order_no || editing.purchase_no || editing.expense_no || "",
    );
    setBranchId(editing.branch_id || "");
    setPartnerId(
      variant === "sales"
        ? editing.customer_id || ""
        : editing.supplier_id || "",
    );
    setPartnerNameSnapshot(
      editing.customer_name_snapshot || editing.supplier_name_snapshot || "",
    );
    setTitle(editing.title || "");
    setVehiclePlate(editing.vehicle_plate || "");
    setVehicleVin((editing as any).vehicle_vin || "");
    setVehicleModel((editing as any).vehicle_model || "");
    setServiceAdvisorName((editing as any).service_advisor_name || "");
    setExpenseCategory(editing.expense_category || "");
    setDocumentDate((editing.document_date || today()).slice(0, 10));
    setExpectedDate(
      (
        (editing as any).expected_delivery_date ||
        (editing as any).expected_receipt_date ||
        ""
      ).slice(0, 10),
    );
    setDueDate((editing.due_date || "").slice(0, 10));
    setInvoiceStatus(editing.invoice_status || "NO_INVOICE");
    setStatus(editing.status || "DRAFT");
    setRecurrenceType(editing.recurrence_type || "ONE_TIME");
    setRecurrenceInterval(String((editing as any).recurrence_interval ?? 1));
    setRecurrenceStartDate(
      String((editing as any).recurrence_start_date || "").slice(0, 10),
    );
    setRecurrenceEndDate(
      String((editing as any).recurrence_end_date || "").slice(0, 10),
    );
    setNextDueDate(String(editing.next_due_date || "").slice(0, 10));
    setAutoGenerateNext(Boolean(editing.auto_generate_next));
    setNotes(editing.notes || "");
    setLines(
      editing.lines?.length
        ? editing.lines.map((line) => toLineDraft(line, variant))
        : [emptyLine(variant)],
    );
  }, [open, editing, variant]);

  const totalAmount = useMemo(() => {
    return lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  }, [lines]);

  function setLine<K extends keyof LineDraft>(
    idx: number,
    key: K,
    value: LineDraft[K],
  ) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
        const next = { ...line, [key]: value };
        const qty = Number(next.qty || 0);
        const unit = Number(next.unit_price || 0);
        if (key === "qty" || key === "unit_price") {
          next.amount = String(qty * unit);
        }
        return next;
      }),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine(variant)]);
  }

  function removeLine(idx: number) {
    setLines((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [emptyLine(variant)];
    });
  }

  async function handleSubmit() {
    if (!documentDate) {
      setError("Ngày chứng từ là bắt buộc.");
      return;
    }
    if (variant === "sales" && !partnerId && !partnerNameSnapshot.trim()) {
      setError("Vui lòng chọn khách hàng hoặc nhập tên snapshot.");
      return;
    }
    if ((variant === "purchase" || variant === "expenses") && !partnerId) {
      setError("Vui lòng chọn nhà cung cấp.");
      return;
    }
    if (!lines.length) {
      setError("Phải có ít nhất 1 dòng chứng từ.");
      return;
    }

    const payload: CreateOperationalPayload = {
      document_date: documentDate,
      due_date: dueDate || undefined,
      branch_id: branchId || undefined,
      invoice_status: invoiceStatus,
      status,
      total_amount: totalAmount,
      notes: notes.trim() || undefined,
      lines: lines.map((line, idx) => ({
        line_no: idx + 1,
        line_type: line.line_type || undefined,
        item_code: line.item_code.trim() || undefined,
        item_name: line.item_name.trim() || undefined,
        description: line.description.trim() || undefined,
        qty: Number(line.qty || 0),
        unit_price: Number(line.unit_price || 0),
        amount: Number(line.amount || 0),
        notes: line.notes.trim() || undefined,
      })),
    };

    if (variant === "sales") {
      Object.assign(payload, {
        order_no: docNo || undefined,
        customer_id: partnerId || undefined,
        customer_name_snapshot: partnerNameSnapshot.trim() || undefined,
        vehicle_plate: vehiclePlate.trim() || undefined,
        vehicle_vin: vehicleVin.trim() || undefined,
        vehicle_model: vehicleModel.trim() || undefined,
        service_advisor_name: serviceAdvisorName.trim() || undefined,
        expected_delivery_date: expectedDate || undefined,
        source_system: "ERP",
      });
    }

    if (variant === "purchase") {
      Object.assign(payload, {
        purchase_no: docNo || undefined,
        supplier_id: partnerId || undefined,
        supplier_name_snapshot: partnerNameSnapshot.trim() || undefined,
        expected_receipt_date: expectedDate || undefined,
        recurrence_type: recurrenceType,
        recurrence_interval: Number(recurrenceInterval || 1),
        recurrence_start_date: recurrenceStartDate || undefined,
        recurrence_end_date: recurrenceEndDate || undefined,
        next_due_date: nextDueDate || undefined,
        auto_generate_next: autoGenerateNext,
      });
    }

    if (variant === "expenses") {
      Object.assign(payload, {
        expense_no: docNo || undefined,
        supplier_id: partnerId || undefined,
        supplier_name_snapshot: partnerNameSnapshot.trim() || undefined,
        title: title.trim() || undefined,
        expense_category: expenseCategory.trim() || undefined,
        recurrence_type: recurrenceType,
        recurrence_interval: Number(recurrenceInterval || 1),
        recurrence_start_date: recurrenceStartDate || undefined,
        recurrence_end_date: recurrenceEndDate || undefined,
        next_due_date: nextDueDate || undefined,
        auto_generate_next: autoGenerateNext,
      });
    }

    setSaving(true);
    setError(null);
    try {
      if (variant === "sales") {
        if (editing) await operationalApi.updateSales(editing.id, payload);
        else await operationalApi.createSales(payload);
      } else if (variant === "purchase") {
        if (editing) await operationalApi.updatePurchase(editing.id, payload);
        else await operationalApi.createPurchase(payload);
      } else {
        if (editing) await operationalApi.updateExpense(editing.id, payload);
        else await operationalApi.createExpense(payload);
      }
      await onSaved();
      onClose();
    } catch (e) {
      setError(extractApiError(e, "Không thể lưu chứng từ."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      panelClassName={
        variant === "purchase"
          ? "min-[1024px]:min-w-[1120px]"
          : "min-[1024px]:min-w-[920px]"
      }
      title={
        editing
          ? `Cập nhật ${variantTitle[variant]}`
          : `Tạo mới ${variantTitle[variant]}`
      }
      subtitle={
        editing ? `Mã: ${docNo || editing.id}` : "Nhập thông tin chứng từ"
      }
      actions={[
        { label: "Hủy", onClick: onClose },
        {
          label: editing ? "Lưu thay đổi" : "Tạo mới",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: handleSubmit,
        },
      ]}
    >
      <div className="space-y-4">
        <div className="space-y-4">
          <DrawerSection title="Thông tin chung">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
              <DrawerField label="Số chứng từ">
                <input
                  className={inputCls}
                  value={docNo}
                  onChange={(e) => setDocNo(e.target.value)}
                />
              </DrawerField>
              <DrawerField label="Chi nhánh">
                <Combobox
                  options={branchOptions}
                  value={branchId}
                  onChange={(v) => setBranchId(v || "")}
                />
              </DrawerField>
              <DrawerField
                label={variant === "sales" ? "Khách hàng" : "Nhà cung cấp"}
              >
                <Combobox
                  options={partnerOptions}
                  value={partnerId}
                  onChange={(v) => setPartnerId(v || "")}
                />
              </DrawerField>
              {variant !== "purchase" && (
                <DrawerField label="Tên snapshot">
                  <input
                    className={inputCls}
                    value={partnerNameSnapshot}
                    onChange={(e) => setPartnerNameSnapshot(e.target.value)}
                  />
                </DrawerField>
              )}
              <DrawerField label="Ngày chứng từ" required>
                <input
                  type="date"
                  className={inputCls}
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                />
              </DrawerField>
              {variant !== "purchase" && (
                <DrawerField label="Ngày đến hạn">
                  <input
                    type="date"
                    className={inputCls}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </DrawerField>
              )}
              {variant !== "purchase" && (
                <DrawerField label="Trạng thái hóa đơn">
                  <Combobox
                    options={invoiceOptions}
                    value={invoiceStatus}
                    onChange={(v) => setInvoiceStatus(v || "NO_INVOICE")}
                    allowClear={false}
                  />
                </DrawerField>
              )}
              <DrawerField label="Trạng thái">
                <Combobox
                  options={statusOptions}
                  value={status}
                  onChange={(v) => setStatus(v || "DRAFT")}
                  allowClear={false}
                />
              </DrawerField>

              {variant === "sales" && (
                <>
                  <DrawerField label="Biển số xe">
                    <input
                      className={inputCls}
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                    />
                  </DrawerField>
                  <DrawerField label="VIN">
                    <input
                      className={inputCls}
                      value={vehicleVin}
                      onChange={(e) => setVehicleVin(e.target.value)}
                    />
                  </DrawerField>
                  <DrawerField label="Model xe">
                    <input
                      className={inputCls}
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                    />
                  </DrawerField>
                  <DrawerField label="Cố vấn dịch vụ">
                    <input
                      className={inputCls}
                      value={serviceAdvisorName}
                      onChange={(e) => setServiceAdvisorName(e.target.value)}
                    />
                  </DrawerField>
                  <DrawerField label="Ngày giao dự kiến">
                    <input
                      type="date"
                      className={inputCls}
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                    />
                  </DrawerField>
                </>
              )}

              {(variant === "purchase" || variant === "expenses") && (
                <>
                  {variant === "purchase" && (
                    <DrawerField label="Ngày nhận dự kiến">
                      <input
                        type="date"
                        className={inputCls}
                        value={expectedDate}
                        onChange={(e) => setExpectedDate(e.target.value)}
                      />
                    </DrawerField>
                  )}
                  {variant === "expenses" && (
                    <>
                      <DrawerField label="Tiêu đề">
                        <input
                          className={inputCls}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </DrawerField>
                      <DrawerField label="Nhóm chi phí">
                        <input
                          className={inputCls}
                          value={expenseCategory}
                          onChange={(e) => setExpenseCategory(e.target.value)}
                          placeholder="VD: UTILITY"
                        />
                      </DrawerField>
                    </>
                  )}
                  {variant === "expenses" && (
                    <>
                      <DrawerField label="Chu kỳ">
                        <Combobox
                          options={recurrenceOptions}
                          value={recurrenceType}
                          onChange={(v) => setRecurrenceType(v || "ONE_TIME")}
                          allowClear={false}
                        />
                      </DrawerField>
                      <DrawerField label="Khoảng lặp">
                        <input
                          type="number"
                          min={1}
                          className={inputCls}
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(e.target.value)}
                        />
                      </DrawerField>
                      <DrawerField label="Bắt đầu">
                        <input
                          type="date"
                          className={inputCls}
                          value={recurrenceStartDate}
                          onChange={(e) => setRecurrenceStartDate(e.target.value)}
                        />
                      </DrawerField>
                      <DrawerField label="Kết thúc">
                        <input
                          type="date"
                          className={inputCls}
                          value={recurrenceEndDate}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        />
                      </DrawerField>
                      <DrawerField label="Kỳ tiếp theo">
                        <input
                          type="date"
                          className={inputCls}
                          value={nextDueDate}
                          onChange={(e) => setNextDueDate(e.target.value)}
                        />
                      </DrawerField>
                      <DrawerField label="Tự sinh kỳ sau">
                        <Checkbox
                          checked={autoGenerateNext}
                          onCheckedChange={(v) => setAutoGenerateNext(!!v)}
                        />
                      </DrawerField>
                    </>
                  )}
                </>
              )}

              <DrawerField label="Ghi chú">
                <textarea
                  className={`${inputCls} min-h-[84px]`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </DrawerField>
            </div>
          </DrawerSection>
        </div>

        <div className="space-y-4">
          <DrawerSection title="Dòng chứng từ">
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div
                  key={line.tempId}
                  className="rounded-lg border border-[color:var(--border)] p-3 space-y-2 overflow-x-auto"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Dòng {idx + 1}
                    </div>
                    {lines.length > 1 && (
                      <button
                        className="text-xs text-red-500 hover:underline whitespace-nowrap"
                        onClick={() => removeLine(idx)}
                      >
                        Xóa dòng này
                      </button>
                    )}
                  </div>
                  <div className="flex min-w-[1100px] items-start gap-3">
                    <DrawerField label="Loại dòng">
                      <Combobox
                        options={lineTypeOptions}
                        value={line.line_type}
                        onChange={(v) =>
                          setLine(idx, "line_type", v || "SERVICE")
                        }
                        allowClear={false}
                      />
                    </DrawerField>
                    <DrawerField label="Mã hàng/dịch vụ">
                      <input
                        className={inputCls}
                        value={line.item_code}
                        onChange={(e) =>
                          setLine(idx, "item_code", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Tên hàng/dịch vụ">
                      <input
                        className={inputCls}
                        value={line.item_name}
                        onChange={(e) =>
                          setLine(idx, "item_name", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Mô tả">
                      <input
                        className={inputCls}
                        value={line.description}
                        onChange={(e) =>
                          setLine(idx, "description", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Số lượng">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputCls}
                        value={line.qty}
                        onChange={(e) => setLine(idx, "qty", e.target.value)}
                      />
                    </DrawerField>
                    <DrawerField label="Đơn giá">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputCls}
                        value={line.unit_price}
                        onChange={(e) =>
                          setLine(idx, "unit_price", e.target.value)
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Thành tiền">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputCls}
                        value={line.amount}
                        onChange={(e) => setLine(idx, "amount", e.target.value)}
                      />
                    </DrawerField>
                    <DrawerField label="Ghi chú dòng">
                      <input
                        className={inputCls}
                        value={line.notes}
                        onChange={(e) => setLine(idx, "notes", e.target.value)}
                      />
                    </DrawerField>
                  </div>

                </div>
              ))}
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={addLine}
              >
                + Thêm dòng
              </button>
            </div>
          </DrawerSection>

          <DrawerSection title="Tổng tiền">
            <div className="text-sm font-semibold">
              {Number(totalAmount || 0).toLocaleString("vi-VN")} VND
            </div>
          </DrawerSection>
        </div>
      </div>

      {error && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-3">
          {error}
        </div>
      )}
    </DrawerModal>
  );
}

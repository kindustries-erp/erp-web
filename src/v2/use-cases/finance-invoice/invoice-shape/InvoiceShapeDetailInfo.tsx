import * as React from "react";
import { V2NumberInput } from "@/v2/shared/components/atoms/v2-number-input";
import { V2Switch } from "@/v2/shared/components/atoms/v2-switch";
import { V2Textarea } from "@/v2/shared/components/atoms/v2-textarea";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
import {
  DrawerField,
  DrawerRow,
} from "@/v2/shared/components/molecules/v2-drawer-field";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { BRANCHES, formatMoney } from "./invoiceShape.data";
import type { FakeInvoice } from "./invoiceShape.data";

interface Props {
  form: FakeInvoice;
  editing: boolean;
  onChange: (patch: Partial<FakeInvoice>) => void;
}

/** Tab Thông tin: xem bằng DrawerRow, sửa bằng các ô nhập V2 */
export const InvoiceShapeDetailInfo: React.FC<Props> = ({
  form,
  editing,
  onChange,
}) => {
  const branch = BRANCHES.find((b) => b.value === form.branchId)?.label;
  if (!editing) {
    return (
      <DrawerSection title="Thông tin chung">
        <div className="grid gap-2 sm:grid-cols-2">
          <DrawerRow
            label="Số hóa đơn"
            value={`${form.serialNo}-${form.invoiceNo}`}
            copyable
          />
          <DrawerRow label="Ngày lập" value={form.invoiceDate} />
          <DrawerRow label="Đối tác" value={form.partner} />
          <DrawerRow label="Mã số thuế" value={form.taxCode} copyable />
          <DrawerRow label="Chi nhánh" value={branch} />
          <DrawerRow label="Tiền trước thuế" value={formatMoney(form.preVat)} />
          <DrawerRow label="Thuế GTGT" value={formatMoney(form.vat)} />
          <DrawerRow
            label="Tổng thanh toán"
            value={formatMoney(form.preVat + form.vat)}
          />
          <DrawerRow label="Ghi chú" value={form.note || "—"} />
        </div>
      </DrawerSection>
    );
  }
  return (
    <DrawerSection title="Thông tin chung">
      <div className="grid gap-3 sm:grid-cols-2">
        <DrawerField label="Ngày lập" required>
          <V2DatePicker
            value={form.invoiceDate}
            onValueChange={(value) =>
              onChange({ invoiceDate: value ?? form.invoiceDate })
            }
          />
        </DrawerField>
        <DrawerField label="Chi nhánh">
          <V2Combobox
            options={BRANCHES}
            value={form.branchId}
            onValueChange={(value) =>
              onChange({ branchId: value ?? form.branchId })
            }
          />
        </DrawerField>
        <DrawerField label="Tiền trước thuế (₫)">
          <V2NumberInput
            value={form.preVat}
            min={0}
            onValueChange={(value) => onChange({ preVat: value ?? 0 })}
          />
        </DrawerField>
        <DrawerField label="Thuế GTGT (₫)">
          <V2NumberInput
            value={form.vat}
            min={0}
            onValueChange={(value) => onChange({ vat: value ?? 0 })}
          />
        </DrawerField>
        <DrawerField label="Trạng thái hạch toán">
          <V2Switch
            label="Đã hạch toán"
            checked={form.posting === "POSTED"}
            onCheckedChange={(on) =>
              onChange({ posting: on ? "POSTED" : "UNPOSTED" })
            }
          />
        </DrawerField>
        <DrawerField label="Ghi chú" className="sm:col-span-2">
          <V2Textarea
            value={form.note}
            placeholder="Nhập ghi chú..."
            onChange={(event) => onChange({ note: event.target.value })}
          />
        </DrawerField>
      </div>
    </DrawerSection>
  );
};

import React from "react";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  PARTNER_KIND_OPTS,
  CURRENCY_OPTS,
  PARTNER_ROLE_OPTS,
} from "@/modules/partners/constants";

export function PartnerDrawer({
  drawerOpen,
  closeDrawer,
  isDirty,
  editing,
  saving,
  handleSave,
  form,
  setField,
  contactRows,
  setContactField,
  removeContactRow,
  addContactRow,
  bankRows,
  setBankField,
  removeBankRow,
  addBankRow,
  saveError,
  stackOffset = 0,
  zIndex,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  return (
    <DrawerModal
      open={drawerOpen}
      onClose={closeDrawer}
      confirmOnClose={isDirty && !editing}
      title={editing ? "Chỉnh sửa đối tác" : "Thêm đối tác mới"}
      subtitle={editing ? editing.name : "Điền thông tin bên dưới"}
      panelClassName="partner-drawer-panel !w-[800px] !max-w-[calc(100vw-40px)]" // Make it wide
      bodyClassName="partner-drawer-body"
      stackOffset={stackOffset}
      zIndex={zIndex || 600}
      actions={[
        { label: "Hủy", onClick: closeDrawer },
        {
          label: editing ? "Lưu thay đổi" : "Thêm mới",
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: handleSave,
        },
      ]}
    >
      <div className="partner-drawer-grid grid grid-cols-1 gap-4">
        <MainInfoCard {...{ form, setField }} />
        <ContactsCard
          {...{ contactRows, setContactField, removeContactRow, addContactRow }}
        />
        <BanksCard {...{ bankRows, setBankField, removeBankRow, addBankRow }} />
        <RoleCard {...{ form, setField }} />
      </div>
      {saveError && (
        <div className="mt-4 text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
          {saveError}
        </div>
      )}
    </DrawerModal>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MainInfoCard({ form, setField }: any) {
  return (
    <div className="partner-card partner-card-main border border-border rounded-lg p-4 bg-surface">
      <DrawerSection title="Thông tin đối tác">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-3">
          <DrawerField label="Mã đối tác" required>
            <input
              type="text"
              className={inputCls}
              value={form.code}
              onChange={(e) => setField("code", e.target.value)}
              placeholder="VD: KH001"
            />
          </DrawerField>
          <DrawerField label="Tên đối tác" required>
            <input
              type="text"
              className={inputCls}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Tên đầy đủ"
            />
          </DrawerField>
          <DrawerField label="Tên hiển thị">
            <input
              type="text"
              className={inputCls}
              value={form.display_name}
              onChange={(e) => setField("display_name", e.target.value)}
              placeholder="Tên ngắn gọn (tùy chọn)"
            />
          </DrawerField>
          <DrawerField label="Loại đối tác">
            <Combobox
              options={PARTNER_KIND_OPTS}
              value={form.partner_kind}
              onChange={(v) => setField("partner_kind", v || "ORGANIZATION")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label="Mã số thuế">
            <input
              type="text"
              className={inputCls}
              value={form.tax_code}
              onChange={(e) => setField("tax_code", e.target.value)}
              placeholder="0123456789"
            />
          </DrawerField>
          <DrawerField label="Điện thoại">
            <input
              type="text"
              className={inputCls}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="0912 345 678"
            />
          </DrawerField>
          <DrawerField label="Email">
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="contact@example.com"
            />
          </DrawerField>
          <div className="md:col-span-2 xl:col-span-3">
            <DrawerField label="Địa chỉ">
              <input
                type="text"
                className={inputCls}
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Địa chỉ đầy đủ"
              />
            </DrawerField>
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <DrawerField label="Ghi chú">
              <textarea
                className={inputCls}
                rows={2}
                value={form.note}
                onChange={(e) => setField("note", e.target.value)}
              />
            </DrawerField>
          </div>
          <DrawerField label="Trạng thái">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) => setField("is_active", v === true)}
              />
              <span className="text-xs text-foreground">Đang hoạt động</span>
            </label>
          </DrawerField>
        </div>
      </DrawerSection>
    </div>
  );
}

function ContactsCard({
  contactRows,
  setContactField,
  removeContactRow,
  addContactRow,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  return (
    <div className="partner-card partner-card-contact border border-border rounded-lg p-4 bg-surface mt-4">
      <DrawerSection title={`Liên hệ (${contactRows.length})`}>
        <div className="partner-sublist space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {contactRows.map((row: any, idx: number) => (
            <div
              key={row.tempId}
              className="partner-subitem border-b border-border pb-4 last:border-b-0 last:pb-0"
            >
              <div className="partner-subitem-head flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Liên hệ {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeContactRow(idx)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Xóa
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                <DrawerField label="Họ và tên">
                  <input
                    type="text"
                    className={inputCls}
                    value={row.full_name}
                    onChange={(e) =>
                      setContactField(idx, "full_name", e.target.value)
                    }
                    placeholder="Tên người liên hệ"
                  />
                </DrawerField>
                <DrawerField label="Chức vụ">
                  <input
                    type="text"
                    className={inputCls}
                    value={row.position}
                    onChange={(e) =>
                      setContactField(idx, "position", e.target.value)
                    }
                    placeholder="VD: Kế toán trưởng"
                  />
                </DrawerField>
                <DrawerField label="Điện thoại">
                  <input
                    type="text"
                    className={inputCls}
                    value={row.phone}
                    onChange={(e) =>
                      setContactField(idx, "phone", e.target.value)
                    }
                    placeholder="0912 345 678"
                  />
                </DrawerField>
                <DrawerField label="Email">
                  <input
                    type="email"
                    className={inputCls}
                    value={row.email}
                    onChange={(e) =>
                      setContactField(idx, "email", e.target.value)
                    }
                    placeholder="contact@example.com"
                  />
                </DrawerField>
              </div>
              <div className="partner-check-row flex gap-4 mt-2">
                <Check
                  checked={row.is_default_receiver}
                  onChange={(v: boolean) =>
                    setContactField(idx, "is_default_receiver", v)
                  }
                  label="Người nhận mặc định"
                />
                <Check
                  checked={row.is_default_payer}
                  onChange={(v: boolean) =>
                    setContactField(idx, "is_default_payer", v)
                  }
                  label="Người trả mặc định"
                />
                <Check
                  checked={row.is_active}
                  onChange={(v: boolean) =>
                    setContactField(idx, "is_active", v)
                  }
                  label="Đang hoạt động"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="partner-add-line mt-2 text-xs text-primary hover:text-primary/80"
          onClick={addContactRow}
        >
          + Thêm liên hệ
        </button>
      </DrawerSection>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BanksCard({ bankRows, setBankField, removeBankRow, addBankRow }: any) {
  return (
    <div className="partner-card partner-card-bank border border-border rounded-lg p-4 bg-surface mt-4">
      <DrawerSection title={`Tài khoản ngân hàng (${bankRows.length})`}>
        <div className="partner-sublist space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {bankRows.map((row: any, idx: number) => (
            <div
              key={row.tempId}
              className="partner-subitem border-b border-border pb-4 last:border-b-0 last:pb-0"
            >
              <div className="partner-subitem-head flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tài khoản {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeBankRow(idx)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Xóa
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                <DrawerField label="Tên ngân hàng">
                  <input
                    type="text"
                    className={inputCls}
                    value={row.bank_name}
                    onChange={(e) =>
                      setBankField(idx, "bank_name", e.target.value)
                    }
                    placeholder="VD: Vietcombank"
                  />
                </DrawerField>
                <DrawerField label="Số tài khoản">
                  <input
                    type="text"
                    className={inputCls}
                    value={row.account_number}
                    onChange={(e) =>
                      setBankField(idx, "account_number", e.target.value)
                    }
                    placeholder="0071001xxx"
                  />
                </DrawerField>
                <DrawerField label="Chủ tài khoản">
                  <input
                    type="text"
                    className={inputCls}
                    value={row.account_holder}
                    onChange={(e) =>
                      setBankField(idx, "account_holder", e.target.value)
                    }
                  />
                </DrawerField>
                <DrawerField label="Tiền tệ">
                  <Combobox
                    options={CURRENCY_OPTS}
                    value={row.currency}
                    onChange={(v) => setBankField(idx, "currency", v || "VND")}
                    allowClear={false}
                  />
                </DrawerField>
              </div>
              <div className="partner-check-row flex gap-4 mt-2">
                <Check
                  checked={row.is_default}
                  onChange={(v: boolean) => setBankField(idx, "is_default", v)}
                  label="Tài khoản mặc định"
                />
                <Check
                  checked={row.is_active}
                  onChange={(v: boolean) => setBankField(idx, "is_active", v)}
                  label="Đang hoạt động"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="partner-add-line mt-2 text-xs text-primary hover:text-primary/80"
          onClick={addBankRow}
        >
          + Thêm tài khoản ngân hàng
        </button>
      </DrawerSection>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RoleCard({ form, setField }: any) {
  return (
    <div className="partner-card partner-card-role border border-border rounded-lg p-4 bg-surface mt-4">
      <DrawerSection title="Vai trò đối tác">
        <div className="grid grid-cols-1 gap-x-3">
          <DrawerField label="Tạo / cập nhật vai trò">
            <Check
              checked={form.role_enabled}
              onChange={(v: boolean) => setField("role_enabled", v)}
              label="Lưu vai trò cho đối tác này"
            />
          </DrawerField>
          <DrawerField label="Vai trò">
            <Combobox
              options={PARTNER_ROLE_OPTS}
              value={form.role}
              onChange={(v) => setField("role", v || "CUSTOMER")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label="Trạng thái vai trò">
            <Check
              checked={form.role_is_active}
              onChange={(v: boolean) => setField("role_is_active", v)}
              label="Đang hoạt động"
            />
          </DrawerField>
        </div>
      </DrawerSection>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Check({ checked, onChange, label }: any) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <span className="text-xs text-foreground">{label}</span>
    </label>
  );
}

import React from "react";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stackOffset = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  zIndex,
}: any) {
  const mode = editing ? "edit" : "create";

  return (
    <StandardFormDrawer
      open={drawerOpen}
      onClose={closeDrawer}
      mode={mode}
      title={editing ? "Chỉnh sửa đối tác" : "Thêm đối tác mới"}
      subtitle={editing ? editing.name : "Điền thông tin bên dưới"}
      size="xl"
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
      error={saveError}
      leftPanel={
        <div className="flex flex-col gap-6">
          <ContactsCard
            {...{
              contactRows,
              setContactField,
              removeContactRow,
              addContactRow,
            }}
          />
          <BanksCard
            {...{ bankRows, setBankField, removeBankRow, addBankRow }}
          />
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-6">
          <MainInfoCard {...{ form, setField }} />
          <RoleCard {...{ form, setField }} />
        </div>
      }
    />
  );
}

function MainInfoCard({ form, setField }: any) {
  return (
    <div className="flex flex-col gap-3">
      <DrawerSection title="Thông tin đối tác">
        <div className="grid grid-cols-1 gap-x-3">
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
          <DrawerField label="Địa chỉ">
            <input
              type="text"
              className={inputCls}
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Địa chỉ đầy đủ"
            />
          </DrawerField>
          <DrawerField label="Ghi chú">
            <textarea
              className={inputCls}
              rows={2}
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
            />
          </DrawerField>
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
}: any) {
  return (
    <DrawerSection title={`Liên hệ (${contactRows.length})`}>
      <DocumentLineTable
        data={contactRows}
        getRowKey={(row: any) => row.tempId}
        onAddLine={addContactRow}
        onRemoveLine={removeContactRow}
        columns={[
          {
            key: "full_name",
            header: "Họ và tên",
            minWidth: 150,
            cell: (row: any, idx: number) => (
              <input
                type="text"
                className={inputCls}
                value={row.full_name}
                onChange={(e) =>
                  setContactField(idx, "full_name", e.target.value)
                }
                placeholder="Tên người liên hệ"
              />
            ),
          },
          {
            key: "position",
            header: "Chức vụ",
            minWidth: 120,
            cell: (row: any, idx: number) => (
              <input
                type="text"
                className={inputCls}
                value={row.position}
                onChange={(e) =>
                  setContactField(idx, "position", e.target.value)
                }
                placeholder="Chức vụ"
              />
            ),
          },
          {
            key: "phone",
            header: "Điện thoại",
            minWidth: 120,
            cell: (row: any, idx: number) => (
              <input
                type="text"
                className={inputCls}
                value={row.phone}
                onChange={(e) => setContactField(idx, "phone", e.target.value)}
                placeholder="0912 345 678"
              />
            ),
          },
          {
            key: "email",
            header: "Email",
            minWidth: 150,
            cell: (row: any, idx: number) => (
              <input
                type="email"
                className={inputCls}
                value={row.email}
                onChange={(e) => setContactField(idx, "email", e.target.value)}
                placeholder="Email"
              />
            ),
          },
          {
            key: "settings",
            header: "Cài đặt",
            minWidth: 150,
            cell: (row: any, idx: number) => (
              <div className="flex flex-col gap-1 py-1">
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
            ),
          },
        ]}
      />
    </DrawerSection>
  );
}

function BanksCard({ bankRows, setBankField, removeBankRow, addBankRow }: any) {
  return (
    <DrawerSection title={`Tài khoản ngân hàng (${bankRows.length})`}>
      <DocumentLineTable
        data={bankRows}
        getRowKey={(row: any) => row.tempId}
        onAddLine={addBankRow}
        onRemoveLine={removeBankRow}
        columns={[
          {
            key: "bank_name",
            header: "Tên ngân hàng",
            minWidth: 150,
            cell: (row: any, idx: number) => (
              <input
                type="text"
                className={inputCls}
                value={row.bank_name}
                onChange={(e) => setBankField(idx, "bank_name", e.target.value)}
                placeholder="VD: Vietcombank"
              />
            ),
          },
          {
            key: "account_number",
            header: "Số tài khoản",
            minWidth: 140,
            cell: (row: any, idx: number) => (
              <input
                type="text"
                className={inputCls}
                value={row.account_number}
                onChange={(e) =>
                  setBankField(idx, "account_number", e.target.value)
                }
                placeholder="0071001xxx"
              />
            ),
          },
          {
            key: "account_holder",
            header: "Chủ tài khoản",
            minWidth: 150,
            cell: (row: any, idx: number) => (
              <input
                type="text"
                className={inputCls}
                value={row.account_holder}
                onChange={(e) =>
                  setBankField(idx, "account_holder", e.target.value)
                }
              />
            ),
          },
          {
            key: "currency",
            header: "Tiền tệ",
            minWidth: 100,
            cell: (row: any, idx: number) => (
              <Combobox
                options={CURRENCY_OPTS}
                value={row.currency}
                onChange={(v) => setBankField(idx, "currency", v || "VND")}
                allowClear={false}
              />
            ),
          },
          {
            key: "settings",
            header: "Cài đặt",
            minWidth: 150,
            cell: (row: any, idx: number) => (
              <div className="flex flex-col gap-1 py-1">
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
            ),
          },
        ]}
      />
    </DrawerSection>
  );
}

function RoleCard({ form, setField }: any) {
  return (
    <div className="flex flex-col gap-3">
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

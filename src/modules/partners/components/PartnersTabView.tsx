import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/Button";
import {
  PARTNER_KIND_OPTS,
  CURRENCY_OPTS,
  PARTNER_ROLE_OPTS,
} from "@/modules/partners/constants";
import { PageHeader, StatusBadge } from "./shared";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";

export function PartnersTabView(p: any) {
  const {
    t,
    openNew,
    searchInput,
    handleSearchInput,
    items,
    loading,
    fetchError,
    kindLabel,
    openEdit,
    setDeleteTarget,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    handlePageSize,
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
    deleteTarget,
    deleting,
    handleDelete,
  } = p;

  const columns: DataTableColumn<BusinessPartner>[] = [
    {
      key: "code",
      header: t("doitac.headers.code"),
      cell: (bp) => bp.code,
      className:
        "font-mono font-semibold text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
    },
    {
      key: "name",
      header: t("doitac.headers.name"),
      cell: (bp) => bp.name,
      className: "font-medium text-left",
      headerClassName: "text-center",
    },
    {
      key: "kind",
      header: t("doitac.headers.kind"),
      cell: (bp) => kindLabel(bp.partner_kind),
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
    },
    {
      key: "tax_code",
      header: t("doitac.headers.taxCode"),
      cell: (bp) => bp.tax_code || "—",
      className: "font-mono text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
    },
    {
      key: "phone",
      header: t("doitac.headers.phone"),
      cell: (bp) => bp.phone || "—",
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
    },
    {
      key: "status",
      header: t("doitac.headers.status"),
      className: "text-center",
      headerClassName: "text-center",
      cell: (bp) => (
        <div className="flex justify-center w-full">
          <StatusBadge active={bp.is_active} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("doitac.title")}
        desc={t("doitac.desc")}
        onAdd={openNew}
      />
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(bp) => bp.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={680}
        filters={
          <SearchInput
            placeholder="Tìm mã, tên hoặc MST..."
            value={searchInput}
            onChange={handleSearchInput}
            className="max-w-[280px]"
          />
        }
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
        actionsColumn={{
          cell: (bp) => (
            <ActionDropdown
              items={[
                {
                  label: t("common.edit"),
                  onClick: () => openEdit(bp),
                },
                {
                  label: t("common.delete"),
                  onClick: () => setDeleteTarget(bp),
                  variant: "danger",
                },
              ]}
            />
          ),
        }}
      />
      <PartnerDrawer
        {...{
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
        }}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa đối tác?"
        message={`Bạn có chắc muốn xóa đối tác "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function PartnerDrawer({
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
}: any) {
  return (
    <DrawerModal
      open={drawerOpen}
      onClose={closeDrawer}
      confirmOnClose={isDirty && !editing}
      title={editing ? "Chỉnh sửa đối tác" : "Thêm đối tác mới"}
      subtitle={editing ? editing.name : "Điền thông tin bên dưới"}
      panelClassName="partner-drawer-panel"
      bodyClassName="partner-drawer-body"
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
      <div className="partner-drawer-grid">
        <MainInfoCard {...{ form, setField }} />
        <ContactsCard
          {...{ contactRows, setContactField, removeContactRow, addContactRow }}
        />
        <BanksCard {...{ bankRows, setBankField, removeBankRow, addBankRow }} />
        <RoleCard {...{ form, setField }} />
      </div>
      {saveError && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
          {saveError}
        </div>
      )}
    </DrawerModal>
  );
}

function MainInfoCard({ form, setField }: any) {
  return (
    <div className="partner-card partner-card-main">
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
}: any) {
  return (
    <div className="partner-card partner-card-contact">
      <DrawerSection title={`Liên hệ (${contactRows.length})`}>
        <div className="partner-sublist">
          {}
          {contactRows.map((row: any, idx: number) => (
            <div key={row.tempId} className="partner-subitem">
              <div className="partner-subitem-head">
                <span>Liên hệ {idx + 1}</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="p-0 h-auto font-normal text-red-600 hover:text-red-700"
                  onClick={() => removeContactRow(idx)}
                >
                  Xóa
                </Button>
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
              <div className="partner-check-row">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full mt-3 border-dashed"
          onClick={addContactRow}
        >
          + Thêm liên hệ
        </Button>
      </DrawerSection>
    </div>
  );
}

function BanksCard({ bankRows, setBankField, removeBankRow, addBankRow }: any) {
  return (
    <div className="partner-card partner-card-bank">
      <DrawerSection title={`Tài khoản ngân hàng (${bankRows.length})`}>
        <div className="partner-sublist">
          {}
          {bankRows.map((row: any, idx: number) => (
            <div key={row.tempId} className="partner-subitem">
              <div className="partner-subitem-head">
                <span>Tài khoản {idx + 1}</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="p-0 h-auto font-normal text-red-600 hover:text-red-700"
                  onClick={() => removeBankRow(idx)}
                >
                  Xóa
                </Button>
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
              <div className="partner-check-row">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full mt-3 border-dashed"
          onClick={addBankRow}
        >
          + Thêm tài khoản ngân hàng
        </Button>
      </DrawerSection>
    </div>
  );
}

function RoleCard({ form, setField }: any) {
  return (
    <div className="partner-card partner-card-role">
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

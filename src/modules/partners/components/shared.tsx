import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import type { ActiveTab } from "@/modules/partners/types";

export function StatusBadge({ active }: { active: boolean }) {
  const t = useT();
  return (
    <span className={`text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium ${active ? "bg-approve-bg text-approve-fg" : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]"}`}>
      {active ? t("status.active") : t("status.inactive")}
    </span>
  );
}

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-[5px] justify-end">
      <button title="Chỉnh sửa" onClick={onEdit} className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"><IconEdit /></button>
      <button title="Xóa" onClick={onDelete} className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"><IconTrash /></button>
    </div>
  );
}

export function PageHeader({ onAdd, title, desc }: { onAdd: () => void; title: string; desc: string }) {
  const t = useT();
  return (
    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-[color:var(--muted-fg)] mt-[2px]">{desc}</div>
      </div>
      <button
        onClick={onAdd}
        className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
      >
        <IconPlus /> {t("common.addNew")}
      </button>
    </div>
  );
}

export function TabHeader({
  active,
  onChange,
}: {
  active: ActiveTab;
  onChange: (t: ActiveTab) => void;
}) {
  const t = useT();
  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "partners", label: t("doitac.tabs.partners") },
    { key: "contacts", label: t("doitac.tabs.contacts") },
    { key: "bankaccounts", label: t("doitac.tabs.bankAccounts") },
    { key: "roles", label: t("doitac.tabs.roles") },
  ];
  return (
    <div className="flex gap-1 mb-5 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "px-4 py-[9px] text-xs font-medium cursor-pointer border-b-2 -mb-px transition-colors",
            active === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-[color:var(--muted-fg)] hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function IconPlus() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
export function IconEdit() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
export function IconTrash() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
}

import React from "react";
import { useT } from "@/core/i18n";
import { Button } from "@/shared/components/ui/Button";
export { extractApiError } from "@/shared/utils/apiError";

// ── Shared UI ─────────────────────────────────────────────────────────────────
export function SectionHeader({
  onAdd,
}: {
  title?: string;
  desc?: string;
  icon?: React.ReactNode;
  onAdd: () => void;
}) {
  const t = useT();
  return (
    <div className="flex justify-end mb-4">
      <BtnPrimary type="button" onClick={onAdd}>
        <IconPlus /> {t("common.addNew")}
      </BtnPrimary>
    </div>
  );
}

export function TagCell({
  active,
  isDefault,
}: {
  active: boolean;
  isDefault?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex gap-[4px] flex-wrap">
      {isDefault && (
        <span className="text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium bg-[#e8f0fd] text-[#2a6dd9]">
          {t("status.default")}
        </span>
      )}
      <span
        className={`text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium ${active ? "bg-approve-bg text-approve-fg" : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]"}`}
      >
        {active ? t("status.active") : t("status.inactive")}
      </span>
    </div>
  );
}

export function ActionCell({
  onDefault,
  onToggle,
  onDelete,
  isDefault,
}: {
  onDefault?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  isDefault?: boolean;
}) {
  return (
    <div className="flex gap-[6px] items-center">
      {onDefault && !isDefault && (
        <Button
          title="Đặt mặc định"
          onClick={onDefault}
          variant="outline"
          size="sm"
          className="text-[10px] h-6 px-2"
        >
          Mặc định
        </Button>
      )}
      {onToggle && (
        <Button
          title="Bật/Tắt"
          onClick={onToggle}
          variant="ghost"
          size="icon-sm"
        >
          <IconToggle />
        </Button>
      )}
      {onDelete && (
        <Button
          title="Xóa"
          onClick={onDelete}
          variant="ghost"
          size="icon-sm"
          className="hover:text-down-fg"
        >
          <IconTrash />
        </Button>
      )}
    </div>
  );
}

export function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[color:var(--muted-fg)] block mb-[5px]">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Btn({
  children,
  type,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <Button type={type} onClick={onClick} variant="secondary">
      {children}
    </Button>
  );
}

export function BtnPrimary({
  children,
  type,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <Button type={type} onClick={onClick} variant="primary">
      {children}
    </Button>
  );
}

export function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
      {msg}
    </div>
  );
}

export function IconPlus() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconEdit() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function IconToggle() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="1" y="5" width="22" height="14" rx="7" />
      <circle cx="16" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export function IconTrash() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

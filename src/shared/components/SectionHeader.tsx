import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { IconPlus } from "@/shared/components/icons";

interface SectionHeaderProps {
  title: string;
  desc: string;
  onAdd: () => void;
  addLabel?: string;
}

/**
 * Header tiêu chuẩn cho các tab trong trang Thiết lập.
 * Gồm tiêu đề, mô tả và nút Thêm mới.
 */
export function SectionHeader({ title, desc, onAdd, addLabel = "Thêm mới" }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-[color:var(--muted-fg)] mt-[2px]">{desc}</div>
      </div>
      <BtnPrimary type="button" onClick={onAdd}>
        <IconPlus /> {addLabel}
      </BtnPrimary>
    </div>
  );
}

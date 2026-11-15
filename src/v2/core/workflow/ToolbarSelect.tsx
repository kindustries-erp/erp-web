import { V2Combobox } from "@/v2/shared/components";

/** Một lựa chọn của ô chọn sơ đồ/luồng; `description` hiện là dòng phụ trong danh sách. */
export interface WorkflowCanvasOption {
  value: string;
  label: string;
  description?: string;
}

interface ToolbarSelectProps {
  options: WorkflowCanvasOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
  /** Khung fullscreen của canvas: danh sách portal vào đây để không bị ẩn khi toàn màn hình. */
  portalContainer?: HTMLElement | null;
}

/** Ô chọn của toolbar: `V2Combobox` không có ô tìm kiếm, không cho bỏ chọn. */
export function ToolbarSelect({
  options,
  value,
  onChange,
  label,
  className,
  portalContainer,
}: ToolbarSelectProps) {
  return (
    <V2Combobox
      options={options}
      value={value}
      onValueChange={(next) => next !== null && onChange(next)}
      searchable={false}
      aria-label={label}
      className={className}
      portalContainer={portalContainer}
    />
  );
}

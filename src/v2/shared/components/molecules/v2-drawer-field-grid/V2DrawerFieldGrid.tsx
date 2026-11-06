import { DrawerField } from "../v2-drawer-field/DrawerField";
import type { V2DrawerFieldGridProps } from "./V2DrawerFieldGrid.type";

/**
 * Lưới trường chuẩn của drawer V2: mỗi ô là một `DrawerField`.
 * Dùng chung cho form phiếu nhập, đầu đề đề nghị và đầu đơn mua.
 */
export function V2DrawerFieldGrid({
  fields,
  columns = 2,
}: V2DrawerFieldGridProps) {
  const gridClass =
    columns === 1 ? "grid gap-3 grid-cols-1" : "grid gap-3 sm:grid-cols-2";

  return (
    <div className={gridClass}>
      {fields.map((field) => (
        <DrawerField
          key={field.key}
          label={field.label}
          required={field.required}
          error={field.error}
          className={columns === 1 ? undefined : field.className}
        >
          {field.render()}
        </DrawerField>
      ))}
    </div>
  );
}

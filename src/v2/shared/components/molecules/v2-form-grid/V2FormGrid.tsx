import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2FormField } from "../v2-form-field";
import type { V2FormGridProps, V2FormFieldConfig } from "./V2FormGrid.type";

export function V2FormGrid<
  T extends Record<string, any> = Record<string, any>,
>({
  fields,
  values,
  onChange,
  viewing = false,
  className,
  gridClassName = "grid grid-cols-1 md:grid-cols-2 gap-4",
}: V2FormGridProps<T>) {
  const currentMode = viewing ? "view" : "edit";

  const visibleFields = React.useMemo(() => {
    return fields.filter((f) =>
      f.visible ? f.visible(values, currentMode) : true,
    );
  }, [fields, values, currentMode]);

  return (
    <div className={cn(gridClassName, className)}>
      {visibleFields.map((field) => {
        const val = values[field.name];
        const isFieldDisabled =
          typeof field.disabled === "function"
            ? field.disabled(values)
            : field.disabled;
        const helper =
          typeof field.helperText === "function"
            ? field.helperText(values)
            : field.helperText;
        const err =
          typeof field.error === "function" ? field.error(values) : field.error;

        const handleFieldChange = (newVal: any) => {
          onChange?.(field.name, newVal);
        };

        const renderViewProp = field.renderView
          ? (props: any, displayVal: string) =>
              field.renderView!(props, displayVal, values)
          : undefined;

        const renderEditProp = field.renderEdit
          ? (props: any) => field.renderEdit!(props, handleFieldChange, values)
          : undefined;

        const colSpanClass =
          field.colSpan === 2 ? "col-span-1 md:col-span-2" : undefined;

        return (
          <div key={field.name} className={cn(colSpanClass, field.className)}>
            <V2FormField
              name={field.name}
              label={field.label}
              type={field.type}
              value={val}
              onChange={handleFieldChange}
              viewing={viewing}
              required={field.required}
              disabled={isFieldDisabled}
              readOnly={field.readOnly}
              placeholder={field.placeholder}
              options={field.options}
              copyable={field.copyable}
              uppercase={field.uppercase}
              decimals={field.decimals}
              min={field.min}
              max={field.max}
              rows={field.rows}
              prefixSlot={field.prefixSlot}
              suffixSlot={field.suffixSlot}
              actionSlot={field.actionSlot}
              helperText={helper}
              error={err}
              viewMode={field.viewMode}
              orientation={field.orientation}
              renderView={renderViewProp}
              renderEdit={renderEditProp}
            />
          </div>
        );
      })}
    </div>
  );
}

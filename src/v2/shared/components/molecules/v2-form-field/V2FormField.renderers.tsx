import * as React from "react";
import {
  V2Input,
  V2NumberInput,
  V2Switch,
  V2Textarea,
} from "@/v2/shared/components/atoms";
import {
  V2Combobox,
  V2DatePicker,
  V2MultiCombobox,
  V2RadioCardGroup,
  V2ReadValue,
} from "@/v2/shared/components/molecules";
import { cn } from "@/v2/shared/utils/cn";
import { V2FormFieldType, type V2FormFieldProps } from "./V2FormField.type";

export function renderEditControl(props: V2FormFieldProps): React.ReactNode {
  const {
    type = V2FormFieldType.TEXT,
    value,
    onChange,
    onBlur,
    disabled,
    readOnly,
  } = props;

  switch (type) {
    case V2FormFieldType.TEXT:
      return (
        <V2Input
          type={props.inputType || "text"}
          value={value ?? ""}
          onChange={(e) => {
            const val = props.uppercase
              ? e.target.value.toUpperCase()
              : e.target.value;
            onChange?.(val);
          }}
          onBlur={onBlur}
          placeholder={props.placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(props.uppercase && "font-mono uppercase")}
        />
      );

    case V2FormFieldType.NUMBER:
      return (
        <V2NumberInput
          value={
            typeof value === "number"
              ? value
              : value !== undefined &&
                  value !== null &&
                  value !== "" &&
                  !isNaN(Number(value))
                ? Number(value)
                : null
          }
          onValueChange={(val) => onChange?.(val ?? null)}
          onBlur={onBlur}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          decimals={props.decimals ?? 0}
          disabled={disabled}
        />
      );

    case V2FormFieldType.TEXTAREA:
      return (
        <V2Textarea
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          rows={props.rows ?? 3}
          placeholder={props.placeholder}
          disabled={disabled}
          readOnly={readOnly}
        />
      );

    case V2FormFieldType.SELECT:
      return (
        <V2Combobox
          options={props.options || []}
          value={value ? String(value) : null}
          onValueChange={(val) => onChange?.(val ?? "")}
          placeholder={props.placeholder}
          searchable={props.searchable ?? true}
          clearable={props.clearable ?? false}
          disabled={disabled}
        />
      );

    case V2FormFieldType.MULTI_SELECT:
      return (
        <V2MultiCombobox
          options={props.options || []}
          value={Array.isArray(value) ? value : []}
          onValueChange={(val) => onChange?.(val)}
          placeholder={props.placeholder}
          searchable={props.searchable ?? true}
          clearable={props.clearable ?? false}
          disabled={disabled}
        />
      );

    case V2FormFieldType.DATE:
      return (
        <V2DatePicker
          value={value ? String(value) : null}
          onValueChange={(val) => onChange?.(val ?? "")}
          placeholder={props.placeholder}
          clearable={props.clearable ?? false}
          disabled={disabled}
        />
      );

    case V2FormFieldType.SWITCH:
      return (
        <V2Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange?.(checked)}
          label={props.label || ""}
          disabled={disabled}
        />
      );

    case V2FormFieldType.RADIO:
      return (
        <V2RadioCardGroup
          name={props.name || "form-radio"}
          ariaLabel={props.label || props.name || "form-radio"}
          options={props.options || []}
          value={value ? String(value) : ""}
          onValueChange={(val) => onChange?.(val)}
        />
      );

    case V2FormFieldType.CUSTOM:
      return props.render ? props.render(props) : null;

    default:
      return null;
  }
}

export function renderViewControl(
  props: V2FormFieldProps,
  displayValue: string,
  shouldCopy: boolean,
): React.ReactNode {
  if (props.type === V2FormFieldType.CUSTOM && props.render) {
    return props.render(props);
  }
  return <V2ReadValue value={displayValue} copy={shouldCopy} />;
}

import * as React from "react";
import { V2CopyButton, V2Text } from "@/v2/shared/components/atoms";
import {
  DrawerField,
  DrawerRow,
} from "@/v2/shared/components/molecules/v2-drawer-field";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import {
  buildOptionMap,
  resolveDisplayValue,
  resolveShouldCopy,
} from "./V2FormField.helper";
import { renderEditControl, renderViewControl } from "./V2FormField.renderers";
import {
  V2FieldOrientation,
  V2FormFieldType,
  V2FormFieldViewMode,
  type V2FormFieldProps,
} from "./V2FormField.type";

/** Universal Form Field cho ERP Web V2: ROW (DrawerRow), STACK, INLINE, BOX */
export function V2FormField<V = any>(props: V2FormFieldProps<V>) {
  const { t } = useV2Translation();
  const {
    viewing = false,
    viewMode,
    orientation,
    options,
    type = V2FormFieldType.TEXT,
    value,
    emptyDisplay,
    switchLabels,
    copyable,
    inputType,
    uppercase,
    prefixSlot,
    suffixSlot,
    actionSlot,
    noWrapper = false,
    label,
    required,
    error,
    helperText,
    className,
    labelClassName,
    valueClassName,
  } = props;

  const effectiveEmpty = emptyDisplay ?? t("v2.form.empty", "—");
  const effectiveSwitchLabels = React.useMemo(
    () => ({
      on: switchLabels?.on ?? t("v2.form.active", "Hoạt động"),
      off: switchLabels?.off ?? t("v2.form.inactive", "Ngưng hoạt động"),
    }),
    [switchLabels?.off, switchLabels?.on, t],
  );

  const optionMap = React.useMemo(() => buildOptionMap(options), [options]);
  const displayValue = React.useMemo(
    () =>
      resolveDisplayValue(
        type,
        value,
        optionMap,
        effectiveEmpty,
        effectiveSwitchLabels,
      ),
    [type, value, optionMap, effectiveEmpty, effectiveSwitchLabels],
  );
  const shouldCopy = React.useMemo(
    () => resolveShouldCopy(copyable, type, inputType, uppercase),
    [copyable, type, inputType, uppercase],
  );

  // --- Chế độ xem (Viewing Mode) ---
  if (viewing) {
    if (type === V2FormFieldType.CUSTOM && props.render) {
      return <>{props.render(props)}</>;
    }
    if (viewMode === V2FormFieldViewMode.BOX) {
      return (
        <DrawerField
          label={label}
          required={required}
          className={className}
          labelClassName={labelClassName}
        >
          {renderViewControl(props, displayValue, shouldCopy)}
        </DrawerField>
      );
    }

    const isStack =
      viewMode === V2FormFieldViewMode.STACK ||
      orientation === V2FieldOrientation.VERTICAL;

    if (!noWrapper && label && isStack) {
      return (
        <DrawerField
          label={label}
          className={className}
          labelClassName={labelClassName}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-2 py-1",
              valueClassName,
            )}
          >
            <V2Text
              variant="body-sm"
              weight="medium"
              className="text-foreground select-text"
            >
              {displayValue}
            </V2Text>
            {shouldCopy && displayValue !== emptyDisplay && (
              <V2CopyButton
                value={typeof value === "string" ? value : displayValue}
              />
            )}
          </div>
        </DrawerField>
      );
    }

    if (!noWrapper && label && viewMode !== V2FormFieldViewMode.INLINE) {
      return (
        <DrawerRow
          label={label}
          value={displayValue}
          copyable={shouldCopy}
          copyText={typeof value === "string" ? value : displayValue}
          multiline={type === V2FormFieldType.TEXTAREA ? true : undefined}
          className={className}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      );
    }

    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <V2Text
          variant="body-sm"
          weight="medium"
          className={cn("text-foreground select-text", valueClassName)}
        >
          {displayValue}
        </V2Text>
        {shouldCopy && displayValue !== emptyDisplay && (
          <V2CopyButton
            value={typeof value === "string" ? value : displayValue}
          />
        )}
      </div>
    );
  }

  // --- Chế độ nhập (Editing / Create Mode) ---
  const control = renderEditControl(props);
  const hasSlots = Boolean(prefixSlot || suffixSlot || actionSlot);

  const wrappedControl = hasSlots ? (
    <div className="flex items-center gap-2 w-full">
      {prefixSlot && <div className="shrink-0">{prefixSlot}</div>}
      <div className="flex-1 min-w-0">{control}</div>
      {suffixSlot && <div className="shrink-0">{suffixSlot}</div>}
      {actionSlot && <div className="shrink-0">{actionSlot}</div>}
    </div>
  ) : (
    control
  );

  if (noWrapper) return <>{wrappedControl}</>;

  return (
    <DrawerField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      className={className}
      labelClassName={labelClassName}
    >
      {wrappedControl}
    </DrawerField>
  );
}

import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { isObjectDifferent } from "./useV2Form.helper";
import type {
  UseV2FormOptions,
  UseV2FormReturn,
  V2FieldBindingProps,
  V2FormMode,
} from "./useV2Form.type";

export function useV2Form<T extends Record<string, any>>(
  options: UseV2FormOptions<T>,
): UseV2FormReturn<T> {
  const { t } = useV2Translation();
  const {
    initialValues,
    validate,
    onSubmit,
    mode: initialMode = "edit",
    showErrorToast = true,
    errorToastTitle,
  } = options;

  const resolvedToastTitle =
    errorToastTitle ?? t("v2.form.missingInfo", "Thiếu thông tin");

  const initialRef = React.useRef<T>(
    typeof initialValues === "function" ? initialValues() : initialValues,
  );

  const [values, setValuesState] = React.useState<T>(initialRef.current);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>(
    {},
  );
  const [touched, setTouched] = React.useState<
    Partial<Record<keyof T, boolean>>
  >({});
  const [mode, setMode] = React.useState<V2FormMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isDirty = React.useMemo(
    () => isObjectDifferent(values, initialRef.current),
    [values],
  );

  const isValid = React.useMemo(
    () => Object.values(errors).filter(Boolean).length === 0,
    [errors],
  );

  const setFieldValue = React.useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) =>
        prev[field] ? { ...prev, [field]: undefined } : prev,
      );
    },
    [],
  );

  const setFieldError = React.useCallback(
    (field: keyof T, error?: string | null) => {
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    },
    [],
  );

  const setFieldTouched = React.useCallback(
    (field: keyof T, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [field]: isTouched }));
    },
    [],
  );

  const handleBlur = React.useCallback(
    (field: keyof T) => {
      setFieldTouched(field, true);
      if (validate) {
        const errs: Partial<Record<keyof T, string>> = validate(values) ?? {};
        setFieldError(field, errs[field]);
      }
    },
    [validate, values, setFieldError, setFieldTouched],
  );

  const setValues = React.useCallback(
    (updater: Partial<T> | ((prev: T) => T)) => {
      setValuesState((prev) =>
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater },
      );
    },
    [],
  );

  const reset = React.useCallback((newInitial?: T) => {
    const next = newInitial ?? initialRef.current;
    if (newInitial) initialRef.current = newInitial;
    setValuesState(next);
    setErrors({});
    setTouched({});
  }, []);

  const validateForm = React.useCallback(() => {
    if (!validate) return true;
    const errs: Partial<Record<keyof T, string>> = validate(values) ?? {};
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  }, [validate, values]);

  const handleSubmit = React.useCallback(
    async (e?: React.FormEvent): Promise<boolean> => {
      if (e?.preventDefault) e.preventDefault();
      const errs: Partial<Record<keyof T, string>> =
        (validate ? validate(values) : null) ?? {};
      const activeErrors = Object.entries(errs).filter(([, msg]) =>
        Boolean(msg),
      );

      if (activeErrors.length > 0) {
        setErrors(errs);
        const touchedMap: Partial<Record<keyof T, boolean>> = {};
        activeErrors.forEach(([key]) => {
          touchedMap[key as keyof T] = true;
        });
        setTouched((prev) => ({ ...prev, ...touchedMap }));

        if (showErrorToast) {
          useV2ToastStore.getState().showToast({
            variant: "destructive",
            title: resolvedToastTitle,
            description: activeErrors[0][1] as string,
          });
        }
        return false;
      }

      if (onSubmit) {
        try {
          setIsSubmitting(true);
          await onSubmit(values);
          return true;
        } finally {
          setIsSubmitting(false);
        }
      }
      return true;
    },
    [onSubmit, resolvedToastTitle, showErrorToast, validate, values],
  );

  const register = React.useCallback(
    <K extends keyof T>(
      field: K,
      config?: Partial<V2FieldBindingProps<T[K]>>,
    ): V2FieldBindingProps<T[K]> => ({
      name: String(field),
      value: values[field],
      onChange: (val: T[K]) => setFieldValue(field, val),
      onBlur: () => handleBlur(field),
      error: errors[field],
      touched: Boolean(touched[field]),
      viewing: mode === "view",
      disabled: config?.disabled,
      ...config,
    }),
    [errors, handleBlur, mode, setFieldValue, touched, values],
  );

  return {
    values,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
    mode,
    setMode,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    handleBlur,
    reset,
    validateForm,
    handleSubmit,
    register,
  };
}

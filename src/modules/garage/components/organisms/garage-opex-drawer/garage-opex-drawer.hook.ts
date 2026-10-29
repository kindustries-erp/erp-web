import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { garageOpexApi } from "@/modules/garage/api/garageOpexApi";
import type { RecurringApplyScope } from "../../OpexRecurringConfirmModal";
import type { GarageOpexDrawerProps } from "./garage-opex-drawer.type";
import { extractOpexFormData } from "./garage-opex-drawer.helper";
import {
  submitOpexForm,
  submitRecurringScope,
} from "./garage-opex-drawer.mutations";
import { useOpexOptions } from "./garage-opex-drawer.options";
import { useOpexFormFields } from "./garage-opex-form.state";

export function useGarageOpexDrawer({
  open,
  onClose,
  isCreate = false,
  id,
  initialData,
  initialCostGroup,
  onSuccess,
}: GarageOpexDrawerProps) {
  const { t } = useTranslation("garage");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const state = useOpexFormFields(currentYear, currentMonth, t);
  const {
    periodYear,
    periodMonth,
    setPeriodMonth,
    costGroup,
    categoryKey,
    categoryName,
    amount,
    ojAmount,
    note,
    isRecurring,
    untilYear,
    untilMonth,
    setLoading,
    setShowConfirmModal,
    applyFormData,
  } = state;

  const fetchDetail = useCallback(
    async (recordId: string) => {
      setLoading(true);
      try {
        const data = await garageOpexApi.getById(recordId);
        applyFormData(extractOpexFormData(data, currentYear));
      } catch (err: any) {
        toast.error(err?.message || "Không thể tải chi tiết chi phí");
      } finally {
        setLoading(false);
      }
    },
    [applyFormData, currentYear, setLoading],
  );

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      applyFormData(extractOpexFormData(initialData, currentYear));
      if (isCreate) setPeriodMonth(initialData.periodMonth || currentMonth);
    } else if (isCreate) {
      const defaultKey =
        initialCostGroup === "FINANCIAL" ? "LAI_VAY" : "NHAN_SU";
      const defaultLabel =
        initialCostGroup === "FINANCIAL"
          ? t("opex.categories.LAI_VAY", "Chi phí lãi vay")
          : t("opex.categories.NHAN_SU", "Nhân sự");
      applyFormData(
        extractOpexFormData(
          {
            categoryKey: defaultKey,
            categoryName: defaultLabel,
          },
          currentYear,
        ),
      );
      setPeriodMonth(currentMonth);
    } else if (id) {
      void fetchDetail(id);
    }
  }, [
    open,
    isCreate,
    initialData,
    initialCostGroup,
    id,
    currentYear,
    currentMonth,
    applyFormData,
    fetchDetail,
    setPeriodMonth,
    t,
  ]);

  const isVoucherSourced = Boolean(initialData?.sourceCashflowVoucherId);
  const isReadOnlyRecord = Boolean(
    initialData?.isAutoCalculated ||
    initialData?.isReadOnly ||
    isVoucherSourced ||
    id?.startsWith("auto-"),
  );

  const handleSave = async () => {
    if (isReadOnlyRecord) return;
    setLoading(true);
    try {
      await submitOpexForm({
        id: id || initialData?.id,
        isCreate,
        periodYear,
        periodMonth,
        categoryKey,
        categoryName,
        amount,
        ojAmount,
        note,
        isRecurring,
        untilYear,
        untilMonth,
        t,
        onSuccess,
        onClose,
        setShowConfirmModal,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRecurringScope = async (scope: RecurringApplyScope) => {
    const targetId = id || initialData?.id;
    if (!targetId) return;
    setLoading(true);
    try {
      const ok = await submitRecurringScope(targetId, scope, {
        amount,
        ojAmount,
        categoryKey,
        categoryName,
        note,
        isRecurring,
        untilYear,
        untilMonth,
        onSuccess,
        onClose,
      });
      if (ok) setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const options = useOpexOptions(currentYear, costGroup, t);

  return {
    ...state,
    isReadOnlyRecord,
    isVoucherSourced,
    handleSave,
    handleConfirmRecurringScope,
    ...options,
    t,
  };
}

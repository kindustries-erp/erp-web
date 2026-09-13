import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { readVietnameseCurrency } from "@/shared/utils/format";
import {
  budgetApi,
  type OperatingExpenseItem,
  type CostGroupType,
} from "../api/budgetApi";
import {
  BudgetRecurringConfirmModal,
  type RecurringApplyScope,
} from "./BudgetRecurringConfirmModal";
import { RefreshCw, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export const COST_GROUPS: Array<{
  key: CostGroupType;
  labelKey: string;
  defaultLabel: string;
}> = [
  {
    key: "OPEX",
    labelKey: "costGroups.OPEX",
    defaultLabel: "Chi phí vận hành (OPEX)",
  },
  {
    key: "COGS",
    labelKey: "costGroups.COGS",
    defaultLabel: "Chi phí giá vốn (COGS)",
  },
  {
    key: "COMMISSION",
    labelKey: "costGroups.COMMISSION",
    defaultLabel: "Hoa hồng & Bán hàng (Commission)",
  },
];

export const CATEGORY_PRESETS: Array<{
  key: string;
  group: CostGroupType;
  labelKey: string;
  defaultName: string;
  badge?: string;
}> = [
  // 1. Nhóm Chi phí vận hành (OPEX)
  {
    key: "NHAN_SU_LUONG",
    group: "OPEX",
    labelKey: "categories.NHAN_SU_LUONG",
    defaultName: "Nhân sự & Tiền lương",
  },
  {
    key: "THUE_MAT_BANG",
    group: "OPEX",
    labelKey: "categories.THUE_MAT_BANG",
    defaultName: "Thuê văn phòng / Mặt bằng",
  },
  {
    key: "DIEN_NUOC_NET",
    group: "OPEX",
    labelKey: "categories.DIEN_NUOC_NET",
    defaultName: "Điện, Nước & Viễn thông",
  },
  {
    key: "DUNG_CU_VP",
    group: "OPEX",
    labelKey: "categories.DUNG_CU_VP",
    defaultName: "Dụng cụ & Văn phòng phẩm",
  },
  {
    key: "PHAN_MEM_IT",
    group: "OPEX",
    labelKey: "categories.PHAN_MEM_IT",
    defaultName: "Phần mềm, Server & IT",
  },
  {
    key: "BAO_TRI",
    group: "OPEX",
    labelKey: "categories.BAO_TRI",
    defaultName: "Bảo trì & Sửa chữa",
  },
  {
    key: "KHAU_HAO",
    group: "OPEX",
    labelKey: "categories.KHAU_HAO",
    defaultName: "Khấu hao tài sản & Thiết bị",
  },
  {
    key: "CONG_TAC_PHI",
    group: "OPEX",
    labelKey: "categories.CONG_TAC_PHI",
    defaultName: "Công tác phí & Tiếp khách",
  },
  {
    key: "KHAC",
    group: "OPEX",
    labelKey: "categories.KHAC",
    defaultName: "Chi phí vận hành khác",
  },

  // 2. Nhóm Chi phí giá vốn (COGS)
  {
    key: "THAU_PHU_GIA_CONG",
    group: "COGS",
    labelKey: "categories.THAU_PHU_GIA_CONG",
    defaultName: "Thuê ngoài & Gia công phụ trợ",
    badge: "Giá vốn",
  },
  {
    key: "VAN_CHUYEN_LOGISTICS",
    group: "COGS",
    labelKey: "categories.VAN_CHUYEN_LOGISTICS",
    defaultName: "Vận chuyển, Giao nhận & Logistics",
    badge: "Giá vốn",
  },
  {
    key: "CHI_PHI_TRUC_TIEP_KHAC",
    group: "COGS",
    labelKey: "categories.CHI_PHI_TRUC_TIEP_KHAC",
    defaultName: "Chi phí trực tiếp khác",
    badge: "Giá vốn",
  },

  // 3. Nhóm Hoa hồng & Bán hàng (COMMISSION)
  {
    key: "HOA_HONG_KINH_DOANH",
    group: "COMMISSION",
    labelKey: "categories.HOA_HONG_KINH_DOANH",
    defaultName: "Hoa hồng kinh doanh / Sale",
    badge: "Bán hàng",
  },
  {
    key: "MARKETING_QC",
    group: "COMMISSION",
    labelKey: "categories.MARKETING_QC",
    defaultName: "Marketing & Quảng cáo",
    badge: "Bán hàng",
  },
  {
    key: "CHIET_KHAU_TM",
    group: "COMMISSION",
    labelKey: "categories.CHIET_KHAU_TM",
    defaultName: "Chiết khấu thương mại & Khuyến mãi",
    badge: "Bán hàng",
  },
  {
    key: "HOA_HONG_KHAC",
    group: "COMMISSION",
    labelKey: "categories.HOA_HONG_KHAC",
    defaultName: "Thưởng & Hoa hồng khác",
    badge: "Bán hàng",
  },
];

interface BudgetDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  setMode: (mode: "view" | "edit") => void;
  isCreate?: boolean;
  id?: string | null;
  initialData?: OperatingExpenseItem | null;
  onSuccess?: () => void;
}

export function BudgetDrawer({
  open,
  onClose,
  mode,
  setMode,
  isCreate = false,
  id,
  initialData,
  onSuccess,
}: BudgetDrawerProps) {
  const { t } = useTranslation("budget");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [costGroup, setCostGroup] = useState<CostGroupType>("OPEX");
  const [categoryKey, setCategoryKey] = useState<string>("NHAN_SU_LUONG");
  const [title, setTitle] = useState<string>("Nhân sự & Tiền lương");
  const [totalAmount, setTotalAmount] = useState<string>("0");
  const [paymentStatus, setPaymentStatus] = useState<string>("UNPAID");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [untilMonth, setUntilMonth] = useState<number>(12);
  const [untilYear, setUntilYear] = useState<number>(currentYear);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const getGroupByCatKey = (catKey?: string | null): CostGroupType => {
    if (!catKey) return "OPEX";
    const preset = CATEGORY_PRESETS.find((p) => p.key === catKey);
    if (preset) return preset.group;
    if (
      catKey === "THAU_PHU_GIA_CONG" ||
      catKey === "VAN_CHUYEN_LOGISTICS" ||
      catKey === "CHI_PHI_TRUC_TIEP_KHAC" ||
      catKey === "HOA_HONG_TRUC_TIEP"
    ) {
      return "COGS";
    }
    if (
      catKey.startsWith("HOA_HONG_") ||
      catKey === "MARKETING_QC" ||
      catKey === "CHIET_KHAU_TM"
    ) {
      return "COMMISSION";
    }
    return "OPEX";
  };

  const fetchDetail = async (recordId: string) => {
    setLoading(true);
    try {
      const data = await budgetApi.getById(recordId);
      const pYear =
        data.periodYear ||
        (data.documentDate
          ? new Date(data.documentDate).getFullYear()
          : currentYear);
      const pMonth =
        data.periodMonth ||
        (data.documentDate
          ? new Date(data.documentDate).getMonth() + 1
          : currentMonth);

      setPeriodYear(pYear);
      setPeriodMonth(pMonth);
      const group =
        (data.costGroup as CostGroupType) ||
        getGroupByCatKey(data.categoryKey || data.expenseCategory);
      setCostGroup(group);
      setCategoryKey(
        data.categoryKey || data.expenseCategory || "NHAN_SU_LUONG",
      );
      setTitle(data.title || data.expenseCategory || "");
      setTotalAmount(String(data.totalAmount || data.amount || 0));
      setPaymentStatus(data.paymentStatus || "UNPAID");
      setNotes(data.notes || "");

      if (
        data.recurrenceType === "MONTHLY" ||
        data.recurrenceType === "monthly"
      ) {
        setIsRecurring(true);
        setUntilYear(data.recurrenceUntilYear || currentYear);
        setUntilMonth(data.recurrenceUntilMonth || 12);
      } else {
        setIsRecurring(false);
        setUntilYear(currentYear);
        setUntilMonth(12);
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải chi tiết khoản chi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (isCreate) {
        if (initialData) {
          // Pre-populate data from source item for DUPLICATE / CLONE
          const pYear = initialData.periodYear || currentYear;
          const pMonth = initialData.periodMonth || currentMonth;
          setPeriodYear(pYear);
          setPeriodMonth(pMonth);
          const group =
            (initialData.costGroup as CostGroupType) ||
            getGroupByCatKey(
              initialData.categoryKey || initialData.expenseCategory,
            );
          setCostGroup(group);
          setCategoryKey(
            initialData.categoryKey ||
              initialData.expenseCategory ||
              "NHAN_SU_LUONG",
          );
          setTitle(initialData.title || initialData.expenseCategory || "");
          setTotalAmount(
            String(initialData.totalAmount || initialData.amount || 0),
          );
          setPaymentStatus(initialData.paymentStatus || "UNPAID");
          setNotes(initialData.notes || "");

          if (
            initialData.recurrenceType === "MONTHLY" ||
            initialData.recurrenceType === "monthly"
          ) {
            setIsRecurring(true);
            setUntilYear(initialData.recurrenceUntilYear || currentYear);
            setUntilMonth(initialData.recurrenceUntilMonth || 12);
          } else {
            setIsRecurring(false);
            setUntilYear(currentYear);
            setUntilMonth(12);
          }
        } else {
          setPeriodYear(currentYear);
          setPeriodMonth(currentMonth);
          setCostGroup("OPEX");
          setCategoryKey("NHAN_SU_LUONG");
          setTitle(t("categories.NHAN_SU_LUONG", "Nhân sự & Tiền lương"));
          setTotalAmount("0");
          setPaymentStatus("UNPAID");
          setNotes("");
          setIsRecurring(false);
          setUntilYear(currentYear);
          setUntilMonth(12);
        }
      } else if (initialData) {
        const pYear = initialData.periodYear || currentYear;
        const pMonth = initialData.periodMonth || currentMonth;
        setPeriodYear(pYear);
        setPeriodMonth(pMonth);
        const group =
          (initialData.costGroup as CostGroupType) ||
          getGroupByCatKey(
            initialData.categoryKey || initialData.expenseCategory,
          );
        setCostGroup(group);
        setCategoryKey(
          initialData.categoryKey ||
            initialData.expenseCategory ||
            "NHAN_SU_LUONG",
        );
        setTitle(initialData.title || initialData.expenseCategory || "");
        setTotalAmount(
          String(initialData.totalAmount || initialData.amount || 0),
        );
        setPaymentStatus(initialData.paymentStatus || "UNPAID");
        setNotes(initialData.notes || "");

        if (
          initialData.recurrenceType === "MONTHLY" ||
          initialData.recurrenceType === "monthly"
        ) {
          setIsRecurring(true);
          setUntilYear(initialData.recurrenceUntilYear || currentYear);
          setUntilMonth(initialData.recurrenceUntilMonth || 12);
        } else {
          setIsRecurring(false);
          setUntilYear(currentYear);
          setUntilMonth(12);
        }
      } else if (id) {
        void fetchDetail(id);
      }
    }
  }, [open, isCreate, initialData, id, currentYear, currentMonth, t]);

  const handleCostGroupChange = (newGroupStr: string) => {
    const newGroup = newGroupStr as CostGroupType;
    setCostGroup(newGroup);
    const matchingPresets = CATEGORY_PRESETS.filter(
      (p) => p.group === newGroup,
    );
    if (matchingPresets.length > 0) {
      const first = matchingPresets[0];
      setCategoryKey(first.key);
      setTitle(t(`budget.${first.labelKey}`, first.defaultName));
    }
  };

  const handleCategoryChange = (key: string) => {
    setCategoryKey(key);
    const preset = CATEGORY_PRESETS.find((p) => p.key === key);
    if (preset) {
      setTitle(t(`budget.${preset.labelKey}`, preset.defaultName));
    }
  };

  const handleSave = async () => {
    const numAmount = Number(totalAmount.replace(/[^0-9.-]+/g, ""));

    if (isNaN(numAmount) || numAmount < 0) {
      toast.error(
        t("invalidAmount", "Số tiền phải là số hợp lệ và lớn hơn hoặc bằng 0"),
      );
      return;
    }

    if (!title.trim()) {
      toast.error(
        t("missingTitle", "Vui lòng nhập nội dung / diễn giải khoản chi"),
      );
      return;
    }

    // If editing an existing recurring series, open confirm scope modal (Google Calendar style)
    if (!isCreate && isRecurring) {
      setShowConfirmModal(true);
      return;
    }

    setLoading(true);
    try {
      if (isCreate) {
        await budgetApi.create({
          periodYear: Number(periodYear),
          periodMonth: Number(periodMonth),
          costGroup,
          categoryKey,
          expenseCategory: categoryKey,
          title: title.trim(),
          totalAmount: numAmount,
          paymentStatus,
          notes: notes.trim() || undefined,
          recurrenceType: isRecurring ? "MONTHLY" : "ONE_TIME",
          recurrenceUntilYear: isRecurring ? Number(untilYear) : undefined,
          recurrenceUntilMonth: isRecurring ? Number(untilMonth) : undefined,
        });
        toast.success(
          isRecurring
            ? t(
                "createRecurringSuccess",
                "Đã tạo khoản chi và phát sinh định kỳ đến {{month}}/{{year}}",
                { month: untilMonth, year: untilYear },
              )
            : t("createSuccess", "Đã thêm khoản chi phí mới"),
        );
      } else if (id || initialData?.id) {
        const targetId = id || initialData!.id;
        await budgetApi.update(targetId, {
          periodYear: Number(periodYear),
          periodMonth: Number(periodMonth),
          costGroup,
          categoryKey,
          expenseCategory: categoryKey,
          title: title.trim(),
          totalAmount: numAmount,
          paymentStatus,
          notes: notes.trim() || undefined,
          recurrenceType: isRecurring ? "MONTHLY" : "ONE_TIME",
          recurrenceUntilYear: isRecurring ? Number(untilYear) : undefined,
          recurrenceUntilMonth: isRecurring ? Number(untilMonth) : undefined,
        });
        toast.success(t("updateSuccess", "Đã cập nhật khoản chi phí"));
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu khoản chi phí");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRecurringScope = async (scope: RecurringApplyScope) => {
    const numAmount = Number(totalAmount.replace(/[^0-9.-]+/g, ""));
    const targetId = id || initialData?.id;
    if (!targetId) return;

    setLoading(true);
    try {
      const res = await budgetApi.applyRecurring(targetId, {
        applyScope: scope,
        amount: numAmount,
        costGroup,
        categoryKey,
        title: title.trim(),
        notes: notes.trim() || undefined,
        recurrenceType: isRecurring ? "MONTHLY" : "ONE_TIME",
        untilYear: isRecurring ? Number(untilYear) : undefined,
        untilMonth: isRecurring ? Number(untilMonth) : undefined,
      });

      if (scope === "this") {
        toast.success(
          t("applyScopeThisSuccess", "Đã cập nhật chi phí cho phiếu tháng này"),
        );
      } else {
        toast.success(
          t(
            "applyScopeFutureSuccess",
            "Đã cập nhật chuỗi chi phí định kỳ ({{count}} kỳ)",
            { count: res.total },
          ),
        );
      }

      setShowConfirmModal(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể áp dụng thay đổi định kỳ");
    } finally {
      setLoading(false);
    }
  };

  const isView = mode === "view" && !isCreate;
  const isEditing = mode === "edit" || isCreate;
  const isDuplicate = isCreate && Boolean(initialData);

  const drawerTitle = isDuplicate
    ? t("drawer.duplicateTitle", "Nhân đôi khoản chi phí")
    : isCreate
      ? t("drawer.createTitle", "Thêm khoản chi vận hành")
      : isView
        ? t("drawer.viewTitle", "Chi tiết khoản chi vận hành")
        : t("drawer.editTitle", "Chỉnh sửa khoản chi vận hành");

  const monthOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: `${t("monthLabel", "Tháng")} ${i + 1}`,
      })),
    [t],
  );

  const yearOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        value: String(currentYear - 2 + i),
        label: `${t("yearLabel", "Năm")} ${currentYear - 2 + i}`,
      })),
    [currentYear, t],
  );

  const untilYearOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        value: String(currentYear + i),
        label: `${t("yearLabel", "Năm")} ${currentYear + i}`,
      })),
    [currentYear, t],
  );

  const costGroupOptions: ComboboxOption[] = useMemo(
    () =>
      COST_GROUPS.map((g) => ({
        value: g.key,
        label: t(`budget.${g.labelKey}`, g.defaultLabel),
      })),
    [t],
  );

  const categoryOptions: ComboboxOption[] = useMemo(
    () =>
      CATEGORY_PRESETS.filter((p) => p.group === costGroup).map((p) => ({
        value: p.key,
        label: t(`budget.${p.labelKey}`, p.defaultName),
      })),
    [costGroup, t],
  );

  const paymentStatusOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "UNPAID", label: t("paymentUnpaid", "Chưa thanh toán") },
      { value: "PARTIAL", label: t("paymentPartial", "Thanh toán 1 phần") },
      { value: "PAID", label: t("paymentPaid", "Đã thanh toán") },
    ],
    [t],
  );

  const numAmount = Number(totalAmount.replace(/[^0-9.-]+/g, "")) || 0;

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={mode}
        onClose={onClose}
        onToggleEdit={!isCreate && isView ? () => setMode("edit") : undefined}
        title={drawerTitle}
        layout="1-column"
        size="md"
        confirmOnClose={isEditing}
        actions={
          isEditing
            ? [
                {
                  label: t("actionCancel", "Hủy"),
                  onClick: onClose,
                  disabled: loading,
                },
                {
                  label: loading
                    ? t("saving", "Đang lưu...")
                    : isCreate
                      ? t("createExpense", "Tạo khoản chi")
                      : t("actionSave", "Lưu thay đổi"),
                  primary: true,
                  onClick: handleSave,
                  loading,
                  disabled: loading,
                },
              ]
            : [
                {
                  label: t("close", "Đóng"),
                  onClick: onClose,
                },
              ]
        }
        leftPanel={
          <div className="flex flex-col gap-4">
            {/* Section 1: Thông tin chi phí */}
            <DrawerSection
              title={t("drawer.sectionInfo", "Thông tin chi phí")}
              collapsible
              defaultCollapsed={false}
            >
              {/* Kỳ báo cáo: Năm + Tháng */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <DrawerField label={t("drawer.periodMonth", "Tháng")}>
                  <Combobox
                    options={monthOptions}
                    value={String(periodMonth)}
                    onChange={(val) => val && setPeriodMonth(Number(val))}
                    disabled={isView || loading}
                    allowClear={false}
                    placeholder={t("monthLabel", "Chọn tháng")}
                  />
                </DrawerField>

                <DrawerField label={t("drawer.periodYear", "Năm")}>
                  <Combobox
                    options={yearOptions}
                    value={String(periodYear)}
                    onChange={(val) => val && setPeriodYear(Number(val))}
                    disabled={isView || loading}
                    allowClear={false}
                    placeholder={t("yearLabel", "Chọn năm")}
                  />
                </DrawerField>
              </div>

              {/* 1. Nhóm chi phí (Cost Group Dropdown) */}
              <DrawerField
                label={t("drawer.costGroupLabel", "Nhóm chi phí (*)")}
              >
                <Combobox
                  options={costGroupOptions}
                  value={costGroup}
                  onChange={(val) => val && handleCostGroupChange(val)}
                  disabled={isView || loading}
                  allowClear={false}
                  placeholder={t(
                    "drawer.selectCostGroup",
                    "— Chọn nhóm chi phí —",
                  )}
                />
              </DrawerField>

              {/* 2. Chi tiết loại chi phí (Filtered by Cost Group) */}
              <DrawerField
                label={t(
                  "drawer.categoryKeyLabel",
                  "Loại chi phí chi tiết (*)",
                )}
              >
                <Combobox
                  options={categoryOptions}
                  value={categoryKey}
                  onChange={(val) => val && handleCategoryChange(val)}
                  disabled={isView || loading}
                  allowClear={false}
                  placeholder={t(
                    "drawer.selectCategory",
                    "— Chọn loại chi phí —",
                  )}
                />
              </DrawerField>

              {/* Tên / Diễn giải chi tiết */}
              <DrawerField
                label={t("drawer.titleLabel", "Nội dung / Diễn giải (*)")}
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t(
                    "drawer.titlePlaceholder",
                    "Nhập mô tả chi tiết khoản chi...",
                  )}
                  disabled={isView || loading}
                  className={inputCls}
                />
              </DrawerField>

              {/* Số tiền (VND) kèm Format & Số bằng chữ */}
              <DrawerField label={t("drawer.amountLabel", "Số tiền (VND) (*)")}>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  disabled={isView || loading}
                  className={`${inputCls} tabular-nums text-right font-semibold`}
                  placeholder="0"
                  min="0"
                  step="1000"
                />
                {numAmount > 0 && (
                  <div className="mt-1.5 px-2.5 py-1.5 rounded-md bg-muted/40 border border-border/60 flex flex-col gap-0.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">
                        Định dạng số:
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {numAmount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic font-medium leading-tight pt-0.5">
                      Bằng chữ:{" "}
                      <span className="text-foreground font-semibold">
                        {readVietnameseCurrency(numAmount)}
                      </span>
                    </p>
                  </div>
                )}
              </DrawerField>

              {/* Trạng thái thanh toán */}
              <DrawerField
                label={t("drawer.paymentStatusLabel", "Trạng thái thanh toán")}
              >
                <Combobox
                  options={paymentStatusOptions}
                  value={paymentStatus}
                  onChange={(val) => val && setPaymentStatus(val)}
                  disabled={isView || loading}
                  allowClear={false}
                  placeholder={t("allPayment", "Chọn trạng thái thanh toán")}
                />
              </DrawerField>

              {/* Ghi chú */}
              <DrawerField label={t("drawer.notesLabel", "Ghi chú")}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t(
                    "drawer.notesPlaceholder",
                    "Ghi chú bổ sung nếu có...",
                  )}
                  disabled={isView || loading}
                  className={`${inputCls} min-h-[80px] resize-y`}
                  rows={3}
                />
              </DrawerField>
            </DrawerSection>

            {/* Section 2: Phát sinh định kỳ lặp lại (Google Calendar style) */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  <span>
                    {t("drawer.sectionRecurring", "Phát sinh chi phí định kỳ")}
                  </span>
                </div>
              }
              collapsible
              defaultCollapsed={false}
            >
              <div className="flex flex-col gap-3">
                {/* Toggle Enable Recurring */}
                <div
                  onClick={() =>
                    !isView && !loading && setIsRecurring(!isRecurring)
                  }
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer border border-border/60"
                >
                  <Checkbox
                    checked={isRecurring}
                    onCheckedChange={(checked) =>
                      setIsRecurring(Boolean(checked))
                    }
                    disabled={isView || loading}
                    id="budget-recurring-checkbox"
                  />
                  <div className="flex flex-col select-none">
                    <label
                      htmlFor="budget-recurring-checkbox"
                      className="text-xs font-semibold text-foreground cursor-pointer"
                    >
                      {t(
                        "drawer.enableRecurring",
                        "Lặp lại định kỳ hàng tháng",
                      )}
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {t(
                        "drawer.enableRecurringDesc",
                        "Tự động áp dụng và đồng bộ số tiền cho các kỳ tháng tiếp theo",
                      )}
                    </span>
                  </div>
                </div>

                {/* Recurring Details (when enabled) */}
                {isRecurring && (
                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {t(
                          "drawer.recurringConfigHeader",
                          "Cấu hình chu kỳ & thời hạn lặp lại",
                        )}
                      </span>
                    </div>

                    {/* Chu kỳ lặp lại (Hàng tháng) */}
                    <DrawerField
                      label={t("drawer.recurrenceType", "Chu kỳ lặp lại")}
                    >
                      <input
                        type="text"
                        value={t("cycleMonthly", "Hàng tháng")}
                        disabled
                        className={`${inputCls} bg-muted/60 text-muted-foreground font-medium text-xs`}
                      />
                    </DrawerField>

                    {/* Áp dụng đến tháng / năm */}
                    <div className="grid grid-cols-2 gap-3">
                      <DrawerField
                        label={t("drawer.untilMonth", "Áp dụng đến Tháng")}
                      >
                        <Combobox
                          options={monthOptions}
                          value={String(untilMonth)}
                          onChange={(val) => val && setUntilMonth(Number(val))}
                          disabled={isView || loading}
                          allowClear={false}
                          placeholder={t("monthLabel", "Chọn tháng")}
                        />
                      </DrawerField>

                      <DrawerField
                        label={t("drawer.untilYear", "Năm kết thúc")}
                      >
                        <Combobox
                          options={untilYearOptions}
                          value={String(untilYear)}
                          onChange={(val) => val && setUntilYear(Number(val))}
                          disabled={isView || loading}
                          allowClear={false}
                          placeholder={t("yearLabel", "Chọn năm")}
                        />
                      </DrawerField>
                    </div>
                  </div>
                )}
              </div>
            </DrawerSection>
          </div>
        }
      />

      {/* Confirmation Modal when saving recurring changes */}
      <BudgetRecurringConfirmModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRecurringScope}
        loading={loading}
        currentPeriod={{ month: periodMonth, year: periodYear }}
        untilPeriod={{ month: untilMonth, year: untilYear }}
        amount={Number(totalAmount.replace(/[^0-9.-]+/g, "")) || 0}
        title={title}
      />
    </>
  );
}

export default BudgetDrawer;

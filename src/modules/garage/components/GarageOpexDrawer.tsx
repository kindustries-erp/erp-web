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
  garageOpexApi,
  type GarageOpexItem,
} from "@/modules/garage/api/garageOpexApi";
import {
  OpexRecurringConfirmModal,
  type RecurringApplyScope,
} from "./OpexRecurringConfirmModal";
import { RefreshCw, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export type CostGroupType = "OPEX" | "COGS" | "COMMISSION";

const COST_GROUPS: Array<{
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
    defaultLabel: "Hoa hồng (Commission)",
  },
];

const CATEGORY_PRESETS: Array<{
  key: string;
  group: CostGroupType;
  labelKey: string;
  defaultName: string;
  badge?: string;
}> = [
  // 1. Nhóm Chi phí vận hành (OPEX)
  {
    key: "NHAN_SU",
    group: "OPEX",
    labelKey: "categories.NHAN_SU",
    defaultName: "Nhân sự",
  },
  {
    key: "THUE_MAT_BANG",
    group: "OPEX",
    labelKey: "categories.THUE_MAT_BANG",
    defaultName: "Thuê mặt bằng & điện nước",
  },
  {
    key: "DIEN_NUOC",
    group: "OPEX",
    labelKey: "categories.DIEN_NUOC",
    defaultName: "Điện nước",
  },
  {
    key: "VAT_TU_TIEU_HAO",
    group: "OPEX",
    labelKey: "categories.VAT_TU_TIEU_HAO",
    defaultName: "Vật tư tiêu hao",
  },
  {
    key: "BAO_TRI",
    group: "OPEX",
    labelKey: "categories.BAO_TRI",
    defaultName: "Bảo trì",
  },
  {
    key: "KHAU_HAO",
    group: "OPEX",
    labelKey: "categories.KHAU_HAO",
    defaultName: "Khấu hao máy móc & thiết bị",
  },
  {
    key: "KHAC",
    group: "OPEX",
    labelKey: "categories.KHAC",
    defaultName: "Khác",
  },

  // 2. Nhóm Chi phí giá vốn (COGS)
  {
    key: "HOA_HONG_TRUC_TIEP",
    group: "COGS",
    labelKey: "categories.HOA_HONG_TRUC_TIEP",
    defaultName: "Hoa hồng trực tiếp DV (Tính vào Giá vốn)",
    badge: "Giá vốn",
  },
  {
    key: "CHI_PHI_TRUC_TIEP_KHAC",
    group: "COGS",
    labelKey: "categories.CHI_PHI_TRUC_TIEP_KHAC",
    defaultName: "Chi phí trực tiếp khác (Tính vào Giá vốn)",
    badge: "Giá vốn",
  },

  // 3. Nhóm Hoa hồng (Commission)
  {
    key: "HOA_HONG_SALE",
    group: "COMMISSION",
    labelKey: "categories.HOA_HONG_SALE",
    defaultName: "Hoa hồng cho Sale",
    badge: "Hoa hồng",
  },
  {
    key: "HOA_HONG_DV",
    group: "COMMISSION",
    labelKey: "categories.HOA_HONG_DV",
    defaultName: "Hoa hồng cho DV",
    badge: "Hoa hồng",
  },
];

interface GarageOpexDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  setMode: (mode: "view" | "edit") => void;
  isCreate?: boolean;
  id?: string | null;
  initialData?: GarageOpexItem | null;
  onSuccess?: () => void;
}

export function GarageOpexDrawer({
  open,
  onClose,
  mode,
  setMode,
  isCreate = false,
  id,
  initialData,
  onSuccess,
}: GarageOpexDrawerProps) {
  const { t } = useTranslation("garage");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [costGroup, setCostGroup] = useState<CostGroupType>("OPEX");
  const [categoryKey, setCategoryKey] = useState<string>("NHAN_SU");
  const [categoryName, setCategoryName] = useState<string>("Nhân sự");
  const [amount, setAmount] = useState<string>("0");
  const [ojAmount, setOjAmount] = useState<string>("0");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceType, setRecurrenceType] = useState<string>("monthly");
  const [untilMonth, setUntilMonth] = useState<number>(12);
  const [untilYear, setUntilYear] = useState<number>(currentYear);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const getGroupByCatKey = (catKey: string): CostGroupType => {
    const preset = CATEGORY_PRESETS.find((p) => p.key === catKey);
    if (preset) return preset.group;
    if (
      catKey === "HOA_HONG_TRUC_TIEP" ||
      catKey === "CHI_PHI_TRUC_TIEP_KHAC"
    ) {
      return "COGS";
    }
    if (catKey.startsWith("HOA_HONG_")) {
      return "COMMISSION";
    }
    return "OPEX";
  };

  const fetchDetail = async (recordId: string) => {
    setLoading(true);
    try {
      const data = await garageOpexApi.getById(recordId);
      setPeriodYear(data.periodYear);
      setPeriodMonth(data.periodMonth);
      const group = getGroupByCatKey(data.categoryKey);
      setCostGroup(group);
      setCategoryKey(data.categoryKey);
      setCategoryName(data.categoryName);
      setAmount(String(data.amount || 0));
      setOjAmount(String(data.ojAmount || 0));
      setNote(data.note || "");
      if (data.recurrenceType === "monthly") {
        setIsRecurring(true);
        setRecurrenceType("monthly");
        setUntilYear(data.recurrenceUntilYear || currentYear);
        setUntilMonth(data.recurrenceUntilMonth || 12);
      } else {
        setIsRecurring(false);
        setUntilYear(currentYear);
        setUntilMonth(12);
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải chi tiết chi phí");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (isCreate) {
        if (initialData) {
          // Pre-populate data from source item for DUPLICATE / CLONE
          setPeriodYear(initialData.periodYear || currentYear);
          setPeriodMonth(initialData.periodMonth || currentMonth);
          const group = getGroupByCatKey(initialData.categoryKey);
          setCostGroup(group);
          setCategoryKey(initialData.categoryKey);
          setCategoryName(initialData.categoryName);
          setAmount(String(initialData.amount || 0));
          setOjAmount(String(initialData.ojAmount || 0));
          setNote(initialData.note || "");
          if (initialData.recurrenceType === "monthly") {
            setIsRecurring(true);
            setRecurrenceType("monthly");
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
          setCategoryKey("NHAN_SU");
          setCategoryName(t("opex.categories.NHAN_SU", "Nhân sự"));
          setAmount("0");
          setOjAmount("0");
          setNote("");
          setIsRecurring(false);
          setRecurrenceType("monthly");
          setUntilYear(currentYear);
          setUntilMonth(12);
        }
      } else if (initialData) {
        setPeriodYear(initialData.periodYear);
        setPeriodMonth(initialData.periodMonth);
        const group = getGroupByCatKey(initialData.categoryKey);
        setCostGroup(group);
        setCategoryKey(initialData.categoryKey);
        setCategoryName(initialData.categoryName);
        setAmount(String(initialData.amount || 0));
        setOjAmount(String(initialData.ojAmount || 0));
        setNote(initialData.note || "");
        if (initialData.recurrenceType === "monthly") {
          setIsRecurring(true);
          setRecurrenceType("monthly");
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
      setCategoryName(t(`opex.${first.labelKey}`, first.defaultName));
    }
  };

  const handleCategoryChange = (key: string) => {
    setCategoryKey(key);
    const preset = CATEGORY_PRESETS.find((p) => p.key === key);
    if (preset) {
      setCategoryName(t(`opex.${preset.labelKey}`, preset.defaultName));
    }
  };

  const handleSave = async () => {
    const numAmount = Number(amount.replace(/[^0-9.-]+/g, ""));
    const numOjAmount = Number(ojAmount.replace(/[^0-9.-]+/g, "")) || 0;

    if (isNaN(numAmount) || numAmount < 0) {
      toast.error(
        t(
          "opex.invalidAmount",
          "Số tiền phải là số hợp lệ và lớn hơn hoặc bằng 0",
        ),
      );
      return;
    }

    if (isNaN(numOjAmount) || numOjAmount < 0) {
      toast.error(
        t(
          "opex.invalidOjAmount",
          "Số tiền tính cho OJ phải là số hợp lệ và lớn hơn hoặc bằng 0",
        ),
      );
      return;
    }

    if (numOjAmount > numAmount) {
      toast.error(
        t(
          "opex.ojAmountExceedsTotal",
          "Số tiền tính cho OJ không được vượt quá tổng số tiền chi phí",
        ),
      );
      return;
    }

    if (!categoryName.trim()) {
      toast.error(
        t(
          "opex.missingCategoryName",
          "Vui lòng nhập nội dung / diễn giải chi phí",
        ),
      );
      return;
    }

    // If editing and recurring is active, open confirm scope modal (Google Calendar style)
    if (!isCreate && isRecurring) {
      setShowConfirmModal(true);
      return;
    }

    // Direct save (Create or non-recurring Edit)
    setLoading(true);
    try {
      if (isCreate) {
        await garageOpexApi.create({
          periodYear: Number(periodYear),
          periodMonth: Number(periodMonth),
          categoryKey,
          categoryName: categoryName.trim(),
          amount: numAmount,
          ojAmount: numOjAmount,
          note: note.trim() || undefined,
          recurrenceType: isRecurring ? recurrenceType : undefined,
          recurrenceUntilYear: isRecurring ? Number(untilYear) : undefined,
          recurrenceUntilMonth: isRecurring ? Number(untilMonth) : undefined,
        });
        toast.success(
          isRecurring
            ? t(
                "opex.createRecurringSuccess",
                "Đã tạo chi phí và phát sinh định kỳ đến {{month}}/{{year}}",
                { month: untilMonth, year: untilYear },
              )
            : t("opex.createSuccess", "Đã thêm chi phí vận hành mới"),
        );
      } else if (id || initialData?.id) {
        const targetId = id || initialData!.id;
        await garageOpexApi.update(targetId, {
          periodYear: Number(periodYear),
          periodMonth: Number(periodMonth),
          categoryKey,
          categoryName: categoryName.trim(),
          amount: numAmount,
          ojAmount: numOjAmount,
          note: note.trim() || undefined,
          recurrenceType: isRecurring ? recurrenceType : undefined,
          recurrenceUntilYear: isRecurring ? Number(untilYear) : undefined,
          recurrenceUntilMonth: isRecurring ? Number(untilMonth) : undefined,
        });
        toast.success(t("opex.updateSuccess", "Đã cập nhật chi phí vận hành"));
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu chi phí vận hành");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRecurringScope = async (scope: RecurringApplyScope) => {
    const numAmount = Number(amount.replace(/[^0-9.-]+/g, ""));
    const numOjAmount = Number(ojAmount.replace(/[^0-9.-]+/g, "")) || 0;
    const targetId = id || initialData?.id;
    if (!targetId) return;

    setLoading(true);
    try {
      const res = await garageOpexApi.applyRecurring(targetId, {
        applyScope: scope,
        amount: numAmount,
        ojAmount: numOjAmount,
        categoryKey,
        categoryName: categoryName.trim(),
        note: note.trim() || undefined,
        recurrenceType: isRecurring ? recurrenceType : undefined,
        untilYear: isRecurring ? Number(untilYear) : undefined,
        untilMonth: isRecurring ? Number(untilMonth) : undefined,
      });

      if (scope === "this") {
        toast.success(
          t(
            "opex.applyScopeThisSuccess",
            "Đã cập nhật chi phí cho phiếu tháng này",
          ),
        );
      } else {
        toast.success(
          t(
            "opex.applyScopeFutureSuccess",
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
    ? t("opex.drawer.duplicateTitle", "Nhân đôi chi phí vận hành")
    : isCreate
      ? t("opex.drawer.createTitle", "Thêm chi phí vận hành")
      : isView
        ? t("opex.drawer.viewTitle", "Chi tiết chi phí vận hành")
        : t("opex.drawer.editTitle", "Chỉnh sửa chi phí vận hành");

  const monthOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: `${t("pnl.monthLabel", "Tháng")} ${i + 1}`,
      })),
    [t],
  );

  const yearOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        value: String(currentYear - 2 + i),
        label: `${t("pnl.yearLabel", "Năm")} ${currentYear - 2 + i}`,
      })),
    [currentYear, t],
  );

  const untilYearOptions: ComboboxOption[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        value: String(currentYear + i),
        label: `${t("pnl.yearLabel", "Năm")} ${currentYear + i}`,
      })),
    [currentYear, t],
  );

  const costGroupOptions: ComboboxOption[] = useMemo(
    () =>
      COST_GROUPS.map((g) => ({
        value: g.key,
        label: t(`opex.${g.labelKey}`, g.defaultLabel),
      })),
    [t],
  );

  const categoryOptions: ComboboxOption[] = useMemo(
    () =>
      CATEGORY_PRESETS.filter((p) => p.group === costGroup).map((p) => ({
        value: p.key,
        label: t(`opex.${p.labelKey}`, p.defaultName),
      })),
    [costGroup, t],
  );

  const numAmount = Number(amount.replace(/[^0-9.-]+/g, "")) || 0;
  const numOjAmount = Number(ojAmount.replace(/[^0-9.-]+/g, "")) || 0;

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
                  label: t("opex.drawer.cancel", "Hủy"),
                  onClick: onClose,
                  disabled: loading,
                },
                {
                  label: loading
                    ? t("common.saving", "Đang lưu...")
                    : isCreate
                      ? t("opex.drawer.create", "Tạo chi phí")
                      : t("opex.drawer.save", "Lưu thay đổi"),
                  primary: true,
                  onClick: handleSave,
                  loading,
                  disabled: loading,
                },
              ]
            : [
                {
                  label: t("common.close", "Đóng"),
                  onClick: onClose,
                },
              ]
        }
        leftPanel={
          <div className="flex flex-col gap-4">
            {/* Section 1: Thông tin chi phí */}
            <DrawerSection
              title={t("opex.drawer.sectionInfo", "Thông tin chi phí")}
              collapsible
              defaultCollapsed={false}
            >
              {/* Kỳ báo cáo: Năm + Tháng */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <DrawerField label={t("opex.drawer.periodMonth", "Tháng")}>
                  <Combobox
                    options={monthOptions}
                    value={String(periodMonth)}
                    onChange={(val) => val && setPeriodMonth(Number(val))}
                    disabled={isView || loading}
                    allowClear={false}
                    placeholder={t("pnl.monthLabel", "Chọn tháng")}
                  />
                </DrawerField>

                <DrawerField label={t("opex.drawer.periodYear", "Năm")}>
                  <Combobox
                    options={yearOptions}
                    value={String(periodYear)}
                    onChange={(val) => val && setPeriodYear(Number(val))}
                    disabled={isView || loading}
                    allowClear={false}
                    placeholder={t("pnl.yearLabel", "Chọn năm")}
                  />
                </DrawerField>
              </div>

              {/* 1. Nhóm chi phí (Cost Group Dropdown) */}
              <DrawerField
                label={t("opex.drawer.costGroupLabel", "Nhóm chi phí (*)")}
              >
                <Combobox
                  options={costGroupOptions}
                  value={costGroup}
                  onChange={(val) => val && handleCostGroupChange(val)}
                  disabled={isView || loading}
                  allowClear={false}
                  placeholder={t(
                    "opex.drawer.selectCostGroup",
                    "— Chọn nhóm chi phí —",
                  )}
                />
              </DrawerField>

              {/* 2. Chi tiết loại chi phí (Filtered by Cost Group) */}
              <DrawerField
                label={t(
                  "opex.drawer.categoryKeyLabel",
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
                    "opex.drawer.selectCategory",
                    "— Chọn loại chi phí —",
                  )}
                />
              </DrawerField>

              {/* Tên / Diễn giải chi tiết */}
              <DrawerField
                label={t(
                  "opex.drawer.categoryNameLabel",
                  "Nội dung / Diễn giải (*)",
                )}
              >
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder={t(
                    "opex.drawer.categoryNamePlaceholder",
                    "Nhập mô tả chi tiết...",
                  )}
                  disabled={isView || loading}
                  className={inputCls}
                />
              </DrawerField>

              {/* Số tiền (VND) kèm Format & Số bằng chữ */}
              <DrawerField
                label={t("opex.drawer.amountLabel", "Số tiền (VND) (*)")}
              >
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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

              {/* Phân bổ chi phí tính riêng cho OJ */}
              <div className="my-1 p-3 rounded-lg border border-border/80 bg-muted/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    {t(
                      "opex.drawer.ojAmountLabel",
                      "Số tiền tính cho OJ (VND)",
                    )}
                  </span>
                  {!isView && !loading && numAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => setOjAmount(String(numAmount))}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      {t("opex.drawer.set100Oj", "100% tính cho OJ")}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={ojAmount}
                  onChange={(e) => setOjAmount(e.target.value)}
                  disabled={isView || loading}
                  className={`${inputCls} tabular-nums text-right font-semibold`}
                  placeholder="0"
                  min="0"
                  step="1000"
                />
                <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                  <span>
                    {t(
                      "opex.drawer.ojAmountHint",
                      "Phần chi phí trong khoản này được ghi nhận riêng cho OJ (Omoda/Jaecoo)",
                    )}
                  </span>
                  {numOjAmount > 0 && numAmount > 0 && (
                    <span className="font-semibold font-mono text-foreground">
                      {((numOjAmount / numAmount) * 100).toFixed(1)}% khoản chi
                    </span>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              <DrawerField label={t("opex.drawer.noteLabel", "Ghi chú")}>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t(
                    "opex.drawer.notePlaceholder",
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
                    {t(
                      "opex.drawer.sectionRecurring",
                      "Phát sinh chi phí định kỳ",
                    )}
                  </span>
                </div>
              }
              collapsible
              defaultCollapsed={false}
            >
              <div className="flex flex-col gap-3">
                {/* Toggle Enable Recurring using shared Checkbox component */}
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
                    id="recurring-checkbox"
                  />
                  <div className="flex flex-col select-none">
                    <label
                      htmlFor="recurring-checkbox"
                      className="text-xs font-semibold text-foreground cursor-pointer"
                    >
                      {t(
                        "opex.drawer.enableRecurring",
                        "Lặp lại định kỳ hàng tháng",
                      )}
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {t(
                        "opex.drawer.enableRecurringDesc",
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
                          "opex.drawer.recurringConfigHeader",
                          "Cấu hình chu kỳ & thời hạn lặp lại",
                        )}
                      </span>
                    </div>

                    {/* Chu kỳ lặp lại (Hàng tháng) */}
                    <DrawerField
                      label={t("opex.drawer.recurrenceType", "Chu kỳ lặp lại")}
                    >
                      <input
                        type="text"
                        value={t("opex.drawer.monthlyLabel", "Hàng tháng")}
                        disabled
                        className={`${inputCls} bg-muted/60 text-muted-foreground font-medium text-xs`}
                      />
                    </DrawerField>

                    {/* Áp dụng đến tháng / năm */}
                    <div className="grid grid-cols-2 gap-3">
                      <DrawerField
                        label={t("opex.drawer.untilMonth", "Áp dụng đến Tháng")}
                      >
                        <Combobox
                          options={monthOptions}
                          value={String(untilMonth)}
                          onChange={(val) => val && setUntilMonth(Number(val))}
                          disabled={isView || loading}
                          allowClear={false}
                          placeholder={t("pnl.monthLabel", "Chọn tháng")}
                        />
                      </DrawerField>

                      <DrawerField
                        label={t("opex.drawer.untilYear", "Năm kết thúc")}
                      >
                        <Combobox
                          options={untilYearOptions}
                          value={String(untilYear)}
                          onChange={(val) => val && setUntilYear(Number(val))}
                          disabled={isView || loading}
                          allowClear={false}
                          placeholder={t("pnl.yearLabel", "Chọn năm")}
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
      <OpexRecurringConfirmModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRecurringScope}
        loading={loading}
        currentPeriod={{ month: periodMonth, year: periodYear }}
        untilPeriod={{ month: untilMonth, year: untilYear }}
        amount={Number(amount.replace(/[^0-9.-]+/g, "")) || 0}
        categoryName={categoryName}
      />
    </>
  );
}

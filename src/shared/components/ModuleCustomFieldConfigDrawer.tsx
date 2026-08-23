import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit2,
  Settings,
  Tag,
  X,
  Layers,
  Power,
  PowerOff,
  Loader2,
  FileText,
  Landmark,
  Network,
} from "lucide-react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import {
  moduleConfigApi,
  type ModuleKey,
  type ModuleCategory,
  type ModuleAttributeDef,
  type ModuleAttributeFieldType,
  type ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";

const FIELD_TYPE_OPTIONS: ComboboxOption[] = [
  { value: "TEXT", label: "Văn bản (Text Input)" },
  { value: "NUMBER", label: "Số (Number Input)" },
  { value: "SELECT", label: "Danh sách chọn (Combobox)" },
  { value: "DATE", label: "Ngày tháng (Date Picker)" },
  { value: "CHECKBOX", label: "Đúng / Sai (Checkbox)" },
];

export interface ModuleCustomFieldConfigContentProps {
  moduleKey: ModuleKey;
  isOpen?: boolean;
}

export function ModuleCustomFieldConfigContent({
  moduleKey,
  isOpen = true,
}: ModuleCustomFieldConfigContentProps) {
  const t = useT();
  const queryClient = useQueryClient();

  // Query categories + attributes scoped by moduleKey
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["module-config-categories", moduleKey],
    queryFn: () => moduleConfigApi.getCategories(moduleKey),
    enabled: isOpen && !!moduleKey,
  });

  // State: Category Form (Create / Edit)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ModuleCategory | null>(
    null,
  );
  const [catCode, setCatCode] = useState("");
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [deleteCatTarget, setDeleteCatTarget] = useState<ModuleCategory | null>(
    null,
  );

  // State: Attribute Form (Create / Edit)
  const [addingAttrForCatId, setAddingAttrForCatId] = useState<string | null>(
    null,
  );
  const [editingAttr, setEditingAttr] = useState<ModuleAttributeDef | null>(
    null,
  );
  const [attrCode, setAttrCode] = useState("");
  const [attrName, setAttrName] = useState("");
  const [attrFieldType, setAttrFieldType] =
    useState<ModuleAttributeFieldType>("TEXT");
  const [attrRequired, setAttrRequired] = useState(false);
  const [attrOptions, setAttrOptions] = useState<ModuleAttributeOption[]>([]);
  const [newOptionKey, setNewOptionKey] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [deleteAttrTarget, setDeleteAttrTarget] =
    useState<ModuleAttributeDef | null>(null);

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (payload: {
      code: string;
      name: string;
      description?: string;
    }) =>
      moduleConfigApi.createCategory({
        moduleKey,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", moduleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(t("moduleConfig.catCreated", "Tạo danh mục thành công"));
      resetCatForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.catCreateError", "Lỗi tạo danh mục"),
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      moduleConfigApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", moduleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(
        t("moduleConfig.catUpdated", "Cập nhật danh mục thành công"),
      );
      resetCatForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.catUpdateError", "Lỗi cập nhật danh mục"),
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: moduleConfigApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", moduleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(t("moduleConfig.catDeleted", "Xóa danh mục thành công"));
      setDeleteCatTarget(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.catDeleteDeleteError", "Lỗi xóa danh mục"),
      );
    },
  });

  const createAttrMutation = useMutation({
    mutationFn: moduleConfigApi.createAttributeDef,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", moduleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(t("moduleConfig.attrCreated", "Tạo thuộc tính thành công"));
      resetAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.attrCreateError", "Lỗi tạo thuộc tính"),
      );
    },
  });

  const updateAttrMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      moduleConfigApi.updateAttributeDef(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", moduleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(
        t("moduleConfig.attrUpdated", "Cập nhật thuộc tính thành công"),
      );
      resetAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.attrUpdateError", "Lỗi cập nhật thuộc tính"),
      );
    },
  });

  const deleteAttrMutation = useMutation({
    mutationFn: moduleConfigApi.deleteAttributeDef,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", moduleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(t("moduleConfig.attrDeleted", "Xóa thuộc tính thành công"));
      setDeleteAttrTarget(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.attrDeleteError", "Lỗi xóa thuộc tính"),
      );
    },
  });

  // Handlers for Category
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatCode("");
    setCatName("");
    setCatDescription("");
    setIsCreatingCategory(true);
  };

  const openEditCategory = (cat: ModuleCategory) => {
    setIsCreatingCategory(false);
    setEditingCategory(cat);
    setCatCode(cat.code);
    setCatName(cat.name);
    setCatDescription(cat.description || "");
  };

  const resetCatForm = () => {
    setIsCreatingCategory(false);
    setEditingCategory(null);
    setCatCode("");
    setCatName("");
    setCatDescription("");
  };

  const handleToggleCategoryActive = (cat: ModuleCategory) => {
    const nextActive = !cat.isActive;
    updateCategoryMutation.mutate({
      id: cat.id,
      payload: { isActive: nextActive },
    });
  };

  const handleSaveCategory = () => {
    const trimmedCode = catCode.trim().toUpperCase();
    const trimmedName = catName.trim();

    if (!trimmedCode || !trimmedName) {
      toast.error(
        t(
          "moduleConfig.catValidation",
          "Vui lòng nhập đầy đủ mã và tên danh mục",
        ),
      );
      return;
    }

    const isDuplicate = categories.some(
      (c) =>
        c.code.toUpperCase() === trimmedCode &&
        (!editingCategory || c.id !== editingCategory.id),
    );
    if (isDuplicate) {
      toast.error(
        t(
          "moduleConfig.catCodeDuplicate",
          `Mã danh mục "${trimmedCode}" đã tồn tại. Vui lòng chọn mã khác.`,
        ),
      );
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        payload: {
          code: trimmedCode,
          name: trimmedName,
          description: catDescription.trim() || undefined,
        },
      });
    } else {
      createCategoryMutation.mutate({
        code: trimmedCode,
        name: trimmedName,
        description: catDescription.trim() || undefined,
      });
    }
  };

  // Handlers for Attribute
  const openCreateAttr = (categoryId: string) => {
    setEditingAttr(null);
    setAddingAttrForCatId(categoryId);
    setAttrCode("");
    setAttrName("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const openEditAttr = (attr: ModuleAttributeDef) => {
    setAddingAttrForCatId(null);
    setEditingAttr(attr);
    setAttrCode(attr.code);
    setAttrName(attr.name);
    setAttrFieldType(attr.fieldType);
    setAttrRequired(attr.isRequired || false);
    setAttrOptions(attr.options || []);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const resetAttrForm = () => {
    setAddingAttrForCatId(null);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const handleAddOption = () => {
    const key = newOptionKey.trim().toUpperCase();
    const label = newOptionLabel.trim();

    if (!key || !label) {
      toast.error(
        t(
          "moduleConfig.optionRequired",
          "Vui lòng nhập cả Mã (Key) và Tên hiển thị (Label)",
        ),
      );
      return;
    }

    if (attrOptions.some((o) => o.value === key)) {
      toast.error(
        t(
          "moduleConfig.optionKeyDuplicate",
          `Mã option "${key}" đã tồn tại. Vui lòng chọn mã khác.`,
        ),
      );
      return;
    }

    setAttrOptions([...attrOptions, { value: key, label }]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const handleRemoveOption = (index: number) => {
    setAttrOptions(attrOptions.filter((_, i) => i !== index));
  };

  const handleToggleAttrActive = (attr: ModuleAttributeDef) => {
    const nextActive = !attr.isActive;
    updateAttrMutation.mutate({
      id: attr.id,
      payload: { isActive: nextActive },
    });
  };

  const handleSaveAttribute = () => {
    const targetCatId = addingAttrForCatId || editingAttr?.categoryId;
    if (!targetCatId) return;

    const trimmedCode = attrCode.trim().toLowerCase();
    const trimmedName = attrName.trim();

    if (!trimmedCode || !trimmedName) {
      toast.error(
        t(
          "moduleConfig.attrValidation",
          "Vui lòng nhập đầy đủ mã và tên thuộc tính",
        ),
      );
      return;
    }

    const currentCat = categories.find((c) => c.id === targetCatId);
    const existingDefs = currentCat?.attributeDefs || [];
    const isDuplicate = existingDefs.some(
      (d) =>
        d.code.toLowerCase() === trimmedCode &&
        (!editingAttr || d.id !== editingAttr.id),
    );
    if (isDuplicate) {
      toast.error(
        t(
          "moduleConfig.attrCodeDuplicate",
          `Mã thuộc tính "${trimmedCode}" đã tồn tại trong danh mục này.`,
        ),
      );
      return;
    }

    if (attrFieldType === "SELECT" && attrOptions.length === 0) {
      toast.error(
        t(
          "moduleConfig.selectOptionsRequired",
          "Kiểu Combobox yêu cầu ít nhất 1 option lựa chọn.",
        ),
      );
      return;
    }

    if (editingAttr) {
      updateAttrMutation.mutate({
        id: editingAttr.id,
        payload: {
          code: trimmedCode,
          name: trimmedName,
          fieldType: attrFieldType,
          isRequired: attrRequired,
          options: attrFieldType === "SELECT" ? attrOptions : null,
        },
      });
    } else {
      createAttrMutation.mutate({
        categoryId: targetCatId,
        code: trimmedCode,
        name: trimmedName,
        fieldType: attrFieldType,
        isRequired: attrRequired,
        options: attrFieldType === "SELECT" ? attrOptions : undefined,
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 pb-6">
        {/* Header Description Section */}
        <DrawerSection
          title={t("moduleConfig.overviewSection", "Thông tin chung")}
          collapsible
          defaultCollapsed={false}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>
              {t(
                "moduleConfig.desc",
                "Định nghĩa danh mục và các trường thuộc tính mở rộng cho phân hệ này.",
              )}
            </p>
            {!isCreatingCategory && !editingCategory && (
              <Button
                size="sm"
                variant="primary"
                onClick={openCreateCategory}
                className="flex items-center gap-1 text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("moduleConfig.addCategory", "Thêm danh mục")}
              </Button>
            )}
          </div>
        </DrawerSection>

        {/* Category Form Section (Create / Edit Category) */}
        {(isCreatingCategory || editingCategory) && (
          <DrawerSection
            title={
              editingCategory
                ? t("moduleConfig.editCategory", "Chỉnh sửa danh mục")
                : t("moduleConfig.newCategory", "Tạo danh mục mới")
            }
            collapsible
            defaultCollapsed={false}
          >
            <div className="flex flex-col gap-3 p-3 bg-surface/60 rounded-xl border border-border/70">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DrawerField
                  label={t("moduleConfig.catCode", "Mã danh mục")}
                  required
                >
                  <input
                    type="text"
                    className={inputCls}
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    placeholder="VD: CAR, ACC, GENERAL"
                  />
                </DrawerField>
                <DrawerField
                  label={t("moduleConfig.catName", "Tên danh mục")}
                  required
                >
                  <input
                    type="text"
                    className={inputCls}
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="VD: Xe điện, Phụ kiện..."
                  />
                </DrawerField>
              </div>
              <DrawerField label={t("moduleConfig.catDescription", "Mô tả")}>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về danh mục..."
                />
              </DrawerField>
              <div className="flex items-center justify-end gap-2 mt-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={resetCatForm}
                  disabled={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                >
                  {t("common.cancel", "Hủy")}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveCategory}
                  disabled={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                >
                  {createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : null}
                  {editingCategory
                    ? t("common.save", "Lưu")
                    : t("common.create", "Tạo mới")}
                </Button>
              </div>
            </div>
          </DrawerSection>
        )}

        {/* Loading & Error states */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">
              {t("common.loading", "Đang tải cấu hình...")}
            </span>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs">
            {t(
              "moduleConfig.loadError",
              "Không thể tải danh sách cấu hình danh mục & thuộc tính.",
            )}
          </div>
        )}

        {/* List Categories & Attributes Section */}
        {!isLoading && categories.length === 0 && !isCreatingCategory && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border border-dashed border-border rounded-xl p-6">
            <Layers className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-xs font-medium">
              {t(
                "moduleConfig.noCategories",
                "Chưa có danh mục nào được định nghĩa.",
              )}
            </p>
            <p className="text-[11px] opacity-70 mt-1">
              {t(
                "moduleConfig.noCategoriesHint",
                "Bấm 'Thêm danh mục' ở trên để bắt đầu cấu hình.",
              )}
            </p>
          </div>
        )}

        {categories.map((cat) => {
          const defs = cat.attributeDefs || [];
          const isAddingAttr = addingAttrForCatId === cat.id;

          return (
            <DrawerSection
              key={cat.id}
              title={`${cat.name} (${cat.code})`}
              collapsible
              defaultCollapsed={false}
            >
              <div className="flex flex-col gap-3">
                {/* Category Header Controls */}
                <div className="flex items-center justify-between p-2.5 bg-surface/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant={cat.isActive ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {cat.isActive
                        ? t("common.active", "Đang dùng")
                        : t("common.inactive", "Ngừng dùng")}
                    </Badge>
                    {cat.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {cat.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip
                      content={
                        cat.isActive
                          ? t("common.deactivate", "Ngừng hoạt động")
                          : t("common.activate", "Kích hoạt lại")
                      }
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() => handleToggleCategoryActive(cat)}
                      >
                        {cat.isActive ? (
                          <Power className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </Tooltip>
                    <Tooltip content={t("common.edit", "Chỉnh sửa")}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() => openEditCategory(cat)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </Tooltip>
                    <Tooltip content={t("common.delete", "Xóa danh mục")}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteCatTarget(cat)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                {/* Attribute Form (Inside Category) */}
                {(isAddingAttr ||
                  (editingAttr && editingAttr.categoryId === cat.id)) && (
                  <div className="p-3 bg-surface/80 rounded-xl border border-primary/30 flex flex-col gap-3 mt-1 shadow-sm">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        {editingAttr
                          ? t("moduleConfig.editAttr", "Chỉnh sửa thuộc tính")
                          : t("moduleConfig.addAttr", "Thêm thuộc tính")}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6"
                        onClick={resetAttrForm}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DrawerField
                        label={t("moduleConfig.attrCode", "Mã thuộc tính")}
                        required
                      >
                        <input
                          type="text"
                          className={inputCls}
                          value={attrCode}
                          onChange={(e) => setAttrCode(e.target.value)}
                          placeholder="VD: color, battery_type"
                          disabled={
                            !!editingAttr && (editingAttr.usageCount || 0) > 0
                          }
                        />
                      </DrawerField>

                      <DrawerField
                        label={t("moduleConfig.attrName", "Tên hiển thị")}
                        required
                      >
                        <input
                          type="text"
                          className={inputCls}
                          value={attrName}
                          onChange={(e) => setAttrName(e.target.value)}
                          placeholder="VD: Màu sắc, Loại pin..."
                        />
                      </DrawerField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DrawerField
                        label={t("moduleConfig.attrFieldType", "Kiểu dữ liệu")}
                        required
                      >
                        <Combobox
                          value={attrFieldType}
                          onChange={(val) =>
                            setAttrFieldType(val as ModuleAttributeFieldType)
                          }
                          options={FIELD_TYPE_OPTIONS}
                          placeholder="Chọn kiểu dữ liệu"
                          disabled={
                            !!editingAttr && (editingAttr.usageCount || 0) > 0
                          }
                        />
                      </DrawerField>

                      <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                          id={`attr-req-${cat.id}`}
                          checked={attrRequired}
                          onCheckedChange={(checked) =>
                            setAttrRequired(Boolean(checked))
                          }
                        />
                        <label
                          htmlFor={`attr-req-${cat.id}`}
                          className="text-xs text-foreground cursor-pointer select-none font-medium"
                        >
                          {t(
                            "moduleConfig.isRequired",
                            "Bắt buộc nhập (Required)",
                          )}
                        </label>
                      </div>
                    </div>

                    {/* SELECT Options builder */}
                    {attrFieldType === "SELECT" && (
                      <div className="p-3 bg-surface/50 rounded-lg border border-border/60 flex flex-col gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {t(
                            "moduleConfig.selectOptionsTitle",
                            "Danh sách tùy chọn (Options)",
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className={inputCls}
                            value={newOptionKey}
                            onChange={(e) => setNewOptionKey(e.target.value)}
                            placeholder="Mã (Key, VD: RED)"
                          />
                          <input
                            type="text"
                            className={inputCls}
                            value={newOptionLabel}
                            onChange={(e) => setNewOptionLabel(e.target.value)}
                            placeholder="Tên (Label, VD: Màu đỏ)"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleAddOption}
                            className="shrink-0 text-xs"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            {t("common.add", "Thêm")}
                          </Button>
                        </div>

                        {attrOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {attrOptions.map((opt, idx) => (
                              <Badge
                                key={opt.value}
                                variant="secondary"
                                className="text-xs py-1 px-2 flex items-center gap-1.5"
                              >
                                <span>{opt.label}</span>
                                <span className="text-[10px] opacity-60">
                                  ({opt.value})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx)}
                                  className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 mt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={resetAttrForm}
                        disabled={
                          createAttrMutation.isPending ||
                          updateAttrMutation.isPending
                        }
                      >
                        {t("common.cancel", "Hủy")}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSaveAttribute}
                        disabled={
                          createAttrMutation.isPending ||
                          updateAttrMutation.isPending
                        }
                      >
                        {createAttrMutation.isPending ||
                        updateAttrMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : null}
                        {editingAttr
                          ? t("common.save", "Lưu")
                          : t("common.create", "Tạo mới")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Attribute List */}
                <div className="flex flex-col gap-1.5 mt-1">
                  {defs.length === 0 && !isAddingAttr && (
                    <div className="p-3 text-center text-muted-foreground text-xs bg-surface/30 rounded-lg border border-dashed border-border/60">
                      {t(
                        "moduleConfig.noAttrs",
                        "Chưa có thuộc tính nào trong danh mục này.",
                      )}
                    </div>
                  )}

                  {defs.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/60 text-xs hover:border-border transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono shrink-0"
                        >
                          {attr.fieldType}
                        </Badge>
                        <span className="font-medium text-foreground truncate">
                          {attr.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                          ({attr.code})
                        </span>
                        {attr.isRequired && (
                          <Badge
                            variant="destructive"
                            className="text-[9px] px-1 py-0"
                          >
                            {t("moduleConfig.requiredBadge", "Bắt buộc")}
                          </Badge>
                        )}
                        {!attr.isActive && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0"
                          >
                            {t("common.inactive", "Ngừng dùng")}
                          </Badge>
                        )}
                        {(attr.usageCount || 0) > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0 text-muted-foreground"
                          >
                            {attr.usageCount}{" "}
                            {t("moduleConfig.used", "đang dùng")}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Tooltip
                          content={
                            attr.isActive
                              ? t("common.deactivate", "Ngừng hoạt động")
                              : t("common.activate", "Kích hoạt lại")
                          }
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => handleToggleAttrActive(attr)}
                          >
                            {attr.isActive ? (
                              <Power className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <PowerOff className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Button>
                        </Tooltip>
                        <Tooltip content={t("common.edit", "Chỉnh sửa")}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => openEditAttr(attr)}
                          >
                            <Edit2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </Tooltip>
                        <Tooltip content={t("common.delete", "Xóa thuộc tính")}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteAttrTarget(attr)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}

                  {!isAddingAttr &&
                    (!editingAttr || editingAttr.categoryId !== cat.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openCreateAttr(cat.id)}
                        className="w-full text-xs text-primary hover:text-primary hover:bg-primary/5 border border-dashed border-primary/30 mt-1 flex items-center justify-center gap-1 h-8"
                      >
                        <Plus className="w-3 h-3" />
                        {t("moduleConfig.addAttr", "Thêm thuộc tính")}
                      </Button>
                    )}
                </div>
              </div>
            </DrawerSection>
          );
        })}
      </div>

      {/* Delete Category Modal */}
      <ConfirmModal
        open={!!deleteCatTarget}
        title={t("moduleConfig.deleteCatTitle", "Xóa danh mục")}
        message={t(
          "moduleConfig.deleteCatMsg",
          `Bạn có chắc chắn muốn xóa danh mục "${deleteCatTarget?.name}"? Nếu có dữ liệu đang sử dụng, hệ thống sẽ yêu cầu chuyển sang Ngừng hoạt động.`,
        )}
        onConfirm={() => {
          if (deleteCatTarget) {
            deleteCategoryMutation.mutate(deleteCatTarget.id);
          }
        }}
        onCancel={() => setDeleteCatTarget(null)}
      />

      {/* Delete Attribute Modal */}
      <ConfirmModal
        open={!!deleteAttrTarget}
        title={t("moduleConfig.deleteAttrTitle", "Xóa thuộc tính")}
        message={t(
          "moduleConfig.deleteAttrMsg",
          `Bạn có chắc chắn muốn xóa thuộc tính "${deleteAttrTarget?.name}"? Nếu đã có dữ liệu sử dụng, vui lòng chuyển sang trạng thái Ngừng hoạt động.`,
        )}
        onConfirm={() => {
          if (deleteAttrTarget) {
            deleteAttrMutation.mutate(deleteAttrTarget.id);
          }
        }}
        onCancel={() => setDeleteAttrTarget(null)}
      />
    </>
  );
}

export interface ModuleCustomFieldConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  mode?: "unified" | "single";
  moduleKey?: ModuleKey | null;
  moduleLabel?: string;
  initialTab?: ModuleKey | string;
}

export function ModuleCustomFieldConfigDrawer({
  open,
  onClose,
  mode = "single",
  moduleKey = "BOM",
  moduleLabel,
  initialTab,
}: ModuleCustomFieldConfigDrawerProps) {
  const t = useT();

  const [activeTab, setActiveTab] = useState<string>(() => {
    return (
      (initialTab as string) || (moduleKey ? String(moduleKey) : "INVOICE")
    );
  });

  useEffect(() => {
    if (open) {
      if (initialTab) {
        setActiveTab(String(initialTab));
      } else if (moduleKey) {
        setActiveTab(String(moduleKey));
      } else {
        setActiveTab("INVOICE");
      }
    }
  }, [open, initialTab, moduleKey]);

  if (mode === "unified") {
    const tabs: DrawerTopTabItem[] = [
      {
        key: "INVOICE",
        label: t("moduleConfig.tabInvoice", "Hóa đơn"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <ModuleCustomFieldConfigContent
            moduleKey="INVOICE"
            isOpen={open && activeTab === "INVOICE"}
          />
        ),
      },
      {
        key: "BANK_TXN",
        label: t("moduleConfig.tabBankTxn", "Sao kê ngân hàng"),
        icon: <Landmark className="w-3.5 h-3.5" />,
        content: (
          <ModuleCustomFieldConfigContent
            moduleKey="BANK_TXN"
            isOpen={open && activeTab === "BANK_TXN"}
          />
        ),
      },
      {
        key: "BOM",
        label: t("moduleConfig.tabBom", "Định mức (BOM)"),
        icon: <Network className="w-3.5 h-3.5" />,
        content: (
          <ModuleCustomFieldConfigContent
            moduleKey="BOM"
            isOpen={open && activeTab === "BOM"}
          />
        ),
      },
    ];

    return (
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        icon={<Settings className="w-5 h-5 text-primary" />}
        title={t("moduleConfig.title", "Cấu hình trường tùy chỉnh")}
        subtitle={t(
          "moduleConfig.subtitleUnified",
          "Quản lý danh mục & các thuộc tính động cấu hình theo từng phân hệ",
        )}
        layout="1-column"
        size="lg"
        zIndex={410}
        tabs={tabs}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
      />
    );
  }

  // Single module mode
  const effectiveModuleKey: ModuleKey = (moduleKey as ModuleKey) || "BOM";
  const titleText = moduleLabel
    ? `${t("moduleConfig.title", "Cấu hình trường tùy chỉnh")} — ${moduleLabel}`
    : t("moduleConfig.title", "Cấu hình trường tùy chỉnh");

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      icon={<Settings className="w-5 h-5 text-primary" />}
      title={titleText}
      subtitle={t(
        "moduleConfig.subtitle",
        "Quản lý danh mục & các thuộc tính động cấu hình",
      )}
      layout="1-column"
      size="md"
      zIndex={410}
      leftPanel={
        <ModuleCustomFieldConfigContent
          moduleKey={effectiveModuleKey}
          isOpen={open}
        />
      }
    />
  );
}

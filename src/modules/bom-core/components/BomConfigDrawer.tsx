import { useState } from "react";
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
  AlertCircle,
} from "lucide-react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
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
  bomConfigApi,
  type BomCategory,
  type BomAttributeDef,
  type BomAttributeFieldType,
  type BomAttributeOption,
} from "../api/bomConfigApi";

interface BomConfigDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FIELD_TYPE_OPTIONS: ComboboxOption[] = [
  { value: "TEXT", label: "Văn bản (Text Input)" },
  { value: "NUMBER", label: "Số (Number Input)" },
  { value: "SELECT", label: "Danh sách chọn (Combobox)" },
  { value: "DATE", label: "Ngày tháng (Date Picker)" },
  { value: "CHECKBOX", label: "Đúng / Sai (Checkbox)" },
];

export function BomConfigDrawer({ open, onClose }: BomConfigDrawerProps) {
  const t = useT();
  const queryClient = useQueryClient();

  // Query categories + attributes
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bom-config-categories"],
    queryFn: () => bomConfigApi.getCategories(),
    enabled: open,
  });

  // State: Category Form (Create / Edit)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BomCategory | null>(
    null,
  );
  const [catCode, setCatCode] = useState("");
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [deleteCatTarget, setDeleteCatTarget] = useState<BomCategory | null>(
    null,
  );

  // State: Attribute Form (Create / Edit)
  const [addingAttrForCatId, setAddingAttrForCatId] = useState<string | null>(
    null,
  );
  const [editingAttr, setEditingAttr] = useState<BomAttributeDef | null>(null);
  const [attrCode, setAttrCode] = useState("");
  const [attrName, setAttrName] = useState("");
  const [attrFieldType, setAttrFieldType] =
    useState<BomAttributeFieldType>("TEXT");
  const [attrRequired, setAttrRequired] = useState(false);
  const [attrOptions, setAttrOptions] = useState<BomAttributeOption[]>([]);
  const [newOptionKey, setNewOptionKey] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [deleteAttrTarget, setDeleteAttrTarget] =
    useState<BomAttributeDef | null>(null);

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: bomConfigApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bom-config-categories"] });
      toast.success(t("bomConfig.catCreated", "Tạo danh mục thành công"));
      resetCatForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("bomConfig.catCreateError", "Lỗi tạo danh mục"),
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      bomConfigApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bom-config-categories"] });
      toast.success(t("bomConfig.catUpdated", "Cập nhật danh mục thành công"));
      resetCatForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("bomConfig.catUpdateError", "Lỗi cập nhật danh mục"),
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: bomConfigApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bom-config-categories"] });
      toast.success(t("bomConfig.catDeleted", "Xóa danh mục thành công"));
      setDeleteCatTarget(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("bomConfig.catDeleteError", "Lỗi xóa danh mục"),
      );
    },
  });

  const createAttrMutation = useMutation({
    mutationFn: bomConfigApi.createAttributeDef,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bom-config-categories"] });
      toast.success(t("bomConfig.attrCreated", "Tạo thuộc tính thành công"));
      resetAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("bomConfig.attrCreateError", "Lỗi tạo thuộc tính"),
      );
    },
  });

  const updateAttrMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      bomConfigApi.updateAttributeDef(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bom-config-categories"] });
      toast.success(
        t("bomConfig.attrUpdated", "Cập nhật thuộc tính thành công"),
      );
      resetAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("bomConfig.attrUpdateError", "Lỗi cập nhật thuộc tính"),
      );
    },
  });

  const deleteAttrMutation = useMutation({
    mutationFn: bomConfigApi.deleteAttributeDef,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bom-config-categories"] });
      toast.success(t("bomConfig.attrDeleted", "Xóa thuộc tính thành công"));
      setDeleteAttrTarget(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("bomConfig.attrDeleteError", "Lỗi xóa thuộc tính"),
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

  const openEditCategory = (cat: BomCategory) => {
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

  const handleToggleCategoryActive = (cat: BomCategory) => {
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
        t("bomConfig.catValidation", "Vui lòng nhập đầy đủ mã và tên danh mục"),
      );
      return;
    }

    // Client-side unique code check
    const isDuplicate = categories.some(
      (c) =>
        c.code.toUpperCase() === trimmedCode &&
        (!editingCategory || c.id !== editingCategory.id),
    );
    if (isDuplicate) {
      toast.error(
        t(
          "bomConfig.catCodeDuplicate",
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

  const openEditAttr = (attr: BomAttributeDef) => {
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

  const handleToggleAttrActive = (attr: BomAttributeDef) => {
    const nextActive = !attr.isActive;
    updateAttrMutation.mutate({
      id: attr.id,
      payload: { isActive: nextActive },
    });
  };

  const handleAddOption = () => {
    const key = newOptionKey.trim().toUpperCase();
    const label = newOptionLabel.trim();

    if (!key || !label) {
      toast.error(
        t(
          "bomConfig.optionValidation",
          "Vui lòng nhập cả Mã/Key và Tên hiển thị cho option",
        ),
      );
      return;
    }

    if (attrOptions.some((o) => o.value.toUpperCase() === key)) {
      toast.error(
        t(
          "bomConfig.optionKeyExists",
          `Mã option (Key) "${key}" đã tồn tại. Vui lòng nhập mã khác.`,
        ),
      );
      return;
    }

    setAttrOptions([...attrOptions, { label, value: key }]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const handleRemoveOption = (index: number) => {
    setAttrOptions(attrOptions.filter((_, i) => i !== index));
  };

  const handleSaveAttr = (categoryId: string) => {
    const trimmedCode = attrCode.trim().toLowerCase();
    const trimmedName = attrName.trim();

    if (!trimmedCode || !trimmedName) {
      toast.error(
        t(
          "bomConfig.attrValidation",
          "Vui lòng nhập đầy đủ mã và tên thuộc tính",
        ),
      );
      return;
    }

    // Client-side unique attribute code check per category
    const cat = categories.find((c) => c.id === categoryId);
    const existingDefs = cat?.attributeDefs || [];
    const isDuplicate = existingDefs.some(
      (d) =>
        d.code.toLowerCase() === trimmedCode &&
        (!editingAttr || d.id !== editingAttr.id),
    );
    if (isDuplicate) {
      toast.error(
        t(
          "bomConfig.attrCodeDuplicate",
          `Mã thuộc tính "${trimmedCode}" đã tồn tại trong danh mục này.`,
        ),
      );
      return;
    }

    if (attrFieldType === "SELECT" && attrOptions.length === 0) {
      toast.error(
        t(
          "bomConfig.selectOptionValidation",
          "Vui lòng thêm ít nhất 1 option cho kiểu Combobox",
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
          options: attrFieldType === "SELECT" ? attrOptions : undefined,
          isRequired: attrRequired,
        },
      });
    } else {
      createAttrMutation.mutate({
        categoryId,
        code: trimmedCode,
        name: trimmedName,
        fieldType: attrFieldType,
        options: attrFieldType === "SELECT" ? attrOptions : undefined,
        isRequired: attrRequired,
      });
    }
  };

  const getFieldTypeLabel = (type: BomAttributeFieldType) => {
    switch (type) {
      case "TEXT":
        return "Văn bản (Text)";
      case "NUMBER":
        return "Số (Number)";
      case "SELECT":
        return "Combobox";
      case "DATE":
        return "Ngày tháng";
      case "CHECKBOX":
        return "Checkbox";
      default:
        return type;
    }
  };

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        layout="1-column"
        size="md"
        icon={<Settings className="w-5 h-5 text-muted-foreground" />}
        title={t("bomConfig.title", "Cấu hình BOM")}
        subtitle={t(
          "bomConfig.subtitle",
          "Quản lý danh mục và thuộc tính động cho định mức vật tư",
        )}
        loading={isLoading}
        error={isError ? t("common.loadError", "Lỗi tải dữ liệu") : null}
        actions={[
          {
            label: t("common.close", "Đóng"),
            onClick: onClose,
          },
        ]}
        leftPanel={
          <div className="flex flex-col gap-6 pb-6">
            {/* 1. Top Section: Quản lý danh mục */}
            <DrawerSection
              title={t("bomConfig.categorySection", "Danh mục BOM")}
              titleExtra={
                !isCreatingCategory &&
                !editingCategory && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-7 text-xs"
                    onClick={openCreateCategory}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t("bomConfig.addCategory", "Thêm danh mục")}
                  </Button>
                )
              }
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {t("bomConfig.totalCategories", "Tổng số danh mục:")}{" "}
                    <strong className="text-foreground font-semibold">
                      {categories.length}
                    </strong>
                  </span>
                </div>

                {/* Inline Category Form */}
                {(isCreatingCategory || editingCategory) && (
                  <div className="p-4 rounded-xl border border-border bg-card shadow-sm mt-1">
                    <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                      <span className="text-xs font-bold text-foreground">
                        {editingCategory
                          ? t("bomConfig.editCatTitle", "Cập nhật danh mục")
                          : t("bomConfig.createCatTitle", "Tạo danh mục mới")}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={resetCatForm}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <DrawerField
                        label={t("bomConfig.catCode", "Mã danh mục")}
                        required
                      >
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="VD: CAR, PART, ELEC..."
                          value={catCode}
                          onChange={(e) =>
                            setCatCode(e.target.value.toUpperCase())
                          }
                        />
                      </DrawerField>
                      <DrawerField
                        label={t("bomConfig.catName", "Tên danh mục")}
                        required
                      >
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="VD: Xe hơi, Phụ tùng..."
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                        />
                      </DrawerField>
                    </div>
                    <DrawerField label={t("bomConfig.catDesc", "Mô tả")}>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Mô tả danh mục (tùy chọn)"
                        value={catDescription}
                        onChange={(e) => setCatDescription(e.target.value)}
                      />
                    </DrawerField>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetCatForm}
                      >
                        {t("common.cancel", "Hủy")}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={
                          createCategoryMutation.isPending ||
                          updateCategoryMutation.isPending
                        }
                        onClick={handleSaveCategory}
                      >
                        {(createCategoryMutation.isPending ||
                          updateCategoryMutation.isPending) && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        )}
                        {t("common.save", "Lưu")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* Empty State */}
            {categories.length === 0 &&
              !isCreatingCategory &&
              !editingCategory && (
                <div className="text-center py-10 border border-dashed rounded-xl border-border bg-card/40">
                  <Layers className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2.5" />
                  <p className="text-sm font-medium text-foreground">
                    {t(
                      "bomConfig.noCategories",
                      "Chưa có danh mục cấu hình nào",
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {t(
                      "bomConfig.noCategoriesSub",
                      "Tạo danh mục (vd: Xe hơi, Phụ tùng) để bắt đầu thêm các thuộc tính động cho BOM.",
                    )}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3.5 gap-1.5 text-xs"
                    onClick={openCreateCategory}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t("bomConfig.addFirstCat", "Tạo danh mục đầu tiên")}
                  </Button>
                </div>
              )}

            {/* 2. Category Sections with Attributes */}
            {categories.map((cat) => {
              const defs = cat.attributeDefs || [];
              const isAddingAttr = addingAttrForCatId === cat.id;
              const catInUse = defs.some((d) => (d.usageCount || 0) > 0);

              return (
                <DrawerSection
                  key={cat.id}
                  title={
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{cat.name}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {cat.code}
                      </Badge>
                      {!cat.isActive && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 text-muted-foreground"
                        >
                          Ngừng áp dụng
                        </Badge>
                      )}
                    </div>
                  }
                  titleExtra={
                    <div className="flex items-center gap-1">
                      {/* Toggle Category Active / Inactive */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title={
                          cat.isActive
                            ? t("common.deactivate", "Ngừng áp dụng")
                            : t("common.activate", "Áp dụng lại")
                        }
                        onClick={() => handleToggleCategoryActive(cat)}
                      >
                        {cat.isActive ? (
                          <Power className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </Button>

                      {/* Edit Category */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title={t("common.edit", "Sửa danh mục")}
                        onClick={() => openEditCategory(cat)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Delete Category */}
                      {catInUse ? (
                        <Tooltip
                          content={t(
                            "bomConfig.catInUseTooltip",
                            "Danh mục có thuộc tính đang sử dụng trong BOM, không thể xóa. Bạn có thể Ngừng áp dụng.",
                          )}
                        >
                          <span className="inline-block cursor-not-allowed">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled
                              className="h-7 w-7 p-0 opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </span>
                        </Tooltip>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          title={t("common.delete", "Xóa danh mục")}
                          onClick={() => setDeleteCatTarget(cat)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {/* Add Attribute Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs font-medium gap-1 ml-1"
                        onClick={() => openCreateAttr(cat.id)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t("bomConfig.addAttr", "Thêm thuộc tính")}
                      </Button>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-3">
                    {/* Add Attribute Form for this category */}
                    {isAddingAttr && (
                      <div className="p-4 rounded-xl border border-border bg-card shadow-sm mb-2">
                        <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            {t("bomConfig.newAttrTitle", "Thêm thuộc tính mới")}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={resetAttrForm}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                          <DrawerField
                            label={t("bomConfig.attrCode", "Mã thuộc tính")}
                            required
                          >
                            <input
                              type="text"
                              className={inputCls}
                              placeholder="vd: mau_sac, phien_ban"
                              value={attrCode}
                              onChange={(e) =>
                                setAttrCode(e.target.value.toLowerCase())
                              }
                            />
                          </DrawerField>
                          <DrawerField
                            label={t("bomConfig.attrName", "Tên thuộc tính")}
                            required
                          >
                            <input
                              type="text"
                              className={inputCls}
                              placeholder="vd: Màu sắc, Phiên bản"
                              value={attrName}
                              onChange={(e) => setAttrName(e.target.value)}
                            />
                          </DrawerField>
                          <DrawerField
                            label={t("bomConfig.attrType", "Kiểu dữ liệu")}
                            required
                          >
                            <Combobox
                              options={FIELD_TYPE_OPTIONS}
                              value={attrFieldType}
                              onChange={(v) =>
                                setAttrFieldType(v as BomAttributeFieldType)
                              }
                            />
                          </DrawerField>
                        </div>

                        {/* Options Input for SELECT */}
                        {attrFieldType === "SELECT" && (
                          <div className="p-3 rounded-lg bg-muted/40 border border-border mb-3">
                            <span className="text-xs font-semibold text-foreground mb-2 block">
                              {t(
                                "bomConfig.optionsList",
                                "Danh sách Options cho Combobox:",
                              )}
                            </span>

                            {/* Tags list */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {attrOptions.map((opt, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="gap-1.5 py-1 px-2 text-xs border border-border"
                                >
                                  <span className="font-mono font-semibold text-[11px] text-foreground">
                                    [{opt.value}]
                                  </span>
                                  <span>{opt.label}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(idx)}
                                    className="hover:text-destructive p-0.5 ml-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                              {attrOptions.length === 0 && (
                                <span className="text-xs text-muted-foreground italic">
                                  {t(
                                    "bomConfig.noOptionsYet",
                                    "Chưa có option nào",
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Option inputs: Key + Label */}
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  className={inputCls}
                                  placeholder="Mã key (vd: RED, BLUE)..."
                                  value={newOptionKey}
                                  onChange={(e) =>
                                    setNewOptionKey(
                                      e.target.value.toUpperCase(),
                                    )
                                  }
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  className={inputCls}
                                  placeholder="Tên hiển thị (vd: Màu đỏ)..."
                                  value={newOptionLabel}
                                  onChange={(e) =>
                                    setNewOptionLabel(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddOption();
                                    }
                                  }}
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="secondary"
                                  className="w-full h-8 text-xs font-medium"
                                  onClick={handleAddOption}
                                >
                                  {t("bomConfig.addOptionBtn", "Thêm option")}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="attr-required-new"
                              checked={attrRequired}
                              onCheckedChange={(c) => setAttrRequired(!!c)}
                            />
                            <label
                              htmlFor="attr-required-new"
                              className="text-xs font-medium cursor-pointer select-none text-foreground"
                            >
                              {t("bomConfig.isRequired", "Bắt buộc nhập")}
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={resetAttrForm}
                            >
                              {t("common.cancel", "Hủy")}
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={createAttrMutation.isPending}
                              onClick={() => handleSaveAttr(cat.id)}
                            >
                              {createAttrMutation.isPending && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              )}
                              {t("common.save", "Lưu thuộc tính")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attributes List */}
                    {defs.length === 0 && !isAddingAttr && (
                      <div className="text-center py-5 text-xs text-muted-foreground italic bg-muted/20 rounded-lg border border-dashed border-border">
                        {t(
                          "bomConfig.noAttrsInCategory",
                          "Chưa có thuộc tính nào cho danh mục này.",
                        )}
                      </div>
                    )}

                    {defs.map((def) => {
                      const isEditingThis = editingAttr?.id === def.id;
                      const inUse = (def.usageCount || 0) > 0;

                      if (isEditingThis) {
                        return (
                          <div
                            key={def.id}
                            className="p-4 rounded-xl border border-border bg-card shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Edit2 className="w-3.5 h-3.5" />
                                {t("bomConfig.editAttrTitle", "Sửa thuộc tính")}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={resetAttrForm}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                              <DrawerField
                                label={t("bomConfig.attrCode", "Mã thuộc tính")}
                                required
                              >
                                <input
                                  type="text"
                                  className={inputCls}
                                  disabled={inUse}
                                  value={attrCode}
                                  onChange={(e) =>
                                    setAttrCode(e.target.value.toLowerCase())
                                  }
                                />
                              </DrawerField>
                              <DrawerField
                                label={t(
                                  "bomConfig.attrName",
                                  "Tên thuộc tính",
                                )}
                                required
                              >
                                <input
                                  type="text"
                                  className={inputCls}
                                  value={attrName}
                                  onChange={(e) => setAttrName(e.target.value)}
                                />
                              </DrawerField>
                              <DrawerField
                                label={t("bomConfig.attrType", "Kiểu dữ liệu")}
                                required
                              >
                                <Combobox
                                  options={FIELD_TYPE_OPTIONS}
                                  value={attrFieldType}
                                  disabled={inUse}
                                  onChange={(v) =>
                                    setAttrFieldType(v as BomAttributeFieldType)
                                  }
                                />
                              </DrawerField>
                            </div>

                            {/* Options Input for SELECT */}
                            {attrFieldType === "SELECT" && (
                              <div className="p-3 rounded-lg bg-muted/40 border border-border mb-3">
                                <span className="text-xs font-semibold text-foreground mb-2 block">
                                  {t(
                                    "bomConfig.optionsList",
                                    "Danh sách Options cho Combobox:",
                                  )}
                                </span>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {attrOptions.map((opt, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="gap-1.5 py-1 px-2 text-xs border border-border"
                                    >
                                      <span className="font-mono font-semibold text-[11px] text-foreground">
                                        [{opt.value}]
                                      </span>
                                      <span>{opt.label}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(idx)}
                                        className="hover:text-destructive p-0.5 ml-0.5"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                                  <div className="sm:col-span-2">
                                    <input
                                      type="text"
                                      className={inputCls}
                                      placeholder="Mã key (vd: RED, BLUE)..."
                                      value={newOptionKey}
                                      onChange={(e) =>
                                        setNewOptionKey(
                                          e.target.value.toUpperCase(),
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <input
                                      type="text"
                                      className={inputCls}
                                      placeholder="Tên hiển thị (vd: Màu đỏ)..."
                                      value={newOptionLabel}
                                      onChange={(e) =>
                                        setNewOptionLabel(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleAddOption();
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="sm:col-span-1">
                                    <Button
                                      size="sm"
                                      type="button"
                                      variant="secondary"
                                      className="w-full h-8 text-xs font-medium"
                                      onClick={handleAddOption}
                                    >
                                      {t(
                                        "bomConfig.addOptionBtn",
                                        "Thêm option",
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="attr-required-edit"
                                  checked={attrRequired}
                                  onCheckedChange={(c) => setAttrRequired(!!c)}
                                />
                                <label
                                  htmlFor="attr-required-edit"
                                  className="text-xs font-medium cursor-pointer select-none text-foreground"
                                >
                                  {t("bomConfig.isRequired", "Bắt buộc nhập")}
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={resetAttrForm}
                                >
                                  {t("common.cancel", "Hủy")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  disabled={updateAttrMutation.isPending}
                                  onClick={() => handleSaveAttr(cat.id)}
                                >
                                  {updateAttrMutation.isPending && (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                  )}
                                  {t("common.save", "Cập nhật")}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={def.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors gap-2"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {def.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[11px] font-mono py-0"
                              >
                                {def.code}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-[10px] py-0"
                              >
                                {getFieldTypeLabel(def.fieldType)}
                              </Badge>
                              {def.isRequired && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 text-amber-600 border-amber-600/30"
                                >
                                  Bắt buộc
                                </Badge>
                              )}
                              {!def.isActive && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] py-0 text-muted-foreground"
                                >
                                  Ngừng áp dụng
                                </Badge>
                              )}
                              {inUse && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 text-blue-600 border-blue-600/30"
                                >
                                  Đang dùng ({def.usageCount} BOM)
                                </Badge>
                              )}
                            </div>

                            {/* Select options badges */}
                            {def.fieldType === "SELECT" &&
                              def.options &&
                              def.options.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> Options:
                                  </span>
                                  {def.options.map((opt, oIdx) => (
                                    <span
                                      key={oIdx}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] rounded bg-muted text-foreground border border-border font-medium"
                                    >
                                      <span className="font-mono text-[10px] text-muted-foreground">
                                        [{opt.value}]
                                      </span>
                                      <span>{opt.label}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                            {/* Toggle Active/Inactive */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title={
                                def.isActive
                                  ? t("common.deactivate", "Ngừng áp dụng")
                                  : t("common.activate", "Áp dụng lại")
                              }
                              onClick={() => handleToggleAttrActive(def)}
                            >
                              {def.isActive ? (
                                <Power className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </Button>

                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title={t("common.edit", "Sửa")}
                              onClick={() => openEditAttr(def)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            {/* Delete Button */}
                            {inUse ? (
                              <Tooltip
                                content={t(
                                  "bomConfig.inUseTooltip",
                                  `Thuộc tính đang được sử dụng trong ${def.usageCount} BOM, không thể xóa. Bạn có thể Ngừng áp dụng.`,
                                )}
                              >
                                <span className="inline-block cursor-not-allowed">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled
                                    className="h-7 w-7 p-0 opacity-40"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </span>
                              </Tooltip>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                title={t("common.delete", "Xóa")}
                                onClick={() => setDeleteAttrTarget(def)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DrawerSection>
              );
            })}
          </div>
        }
      />

      {/* Confirm Delete Category Modal */}
      <ConfirmModal
        open={!!deleteCatTarget}
        title={t("bomConfig.confirmDeleteCatTitle", "Xác nhận xóa danh mục")}
        message={
          deleteCatTarget
            ? t(
                "bomConfig.confirmDeleteCatMsg",
                `Bạn có chắc chắn muốn xóa danh mục "${deleteCatTarget.name}" (${deleteCatTarget.code})? Hành động này sẽ xóa cả các thuộc tính bên trong nếu chưa được sử dụng.`,
              )
            : ""
        }
        confirmLabel={t("common.delete", "Xóa")}
        cancelLabel={t("common.cancel", "Hủy")}
        onConfirm={() => {
          if (deleteCatTarget) {
            deleteCategoryMutation.mutate(deleteCatTarget.id);
          }
        }}
        onCancel={() => setDeleteCatTarget(null)}
        loading={deleteCategoryMutation.isPending}
        danger
      />

      {/* Confirm Delete Attribute Modal */}
      <ConfirmModal
        open={!!deleteAttrTarget}
        title={t("bomConfig.confirmDeleteAttrTitle", "Xác nhận xóa thuộc tính")}
        message={
          deleteAttrTarget
            ? t(
                "bomConfig.confirmDeleteAttrMsg",
                `Bạn có chắc chắn muốn xóa thuộc tính "${deleteAttrTarget.name}" (${deleteAttrTarget.code})?`,
              )
            : ""
        }
        confirmLabel={t("common.delete", "Xóa")}
        cancelLabel={t("common.cancel", "Hủy")}
        onConfirm={() => {
          if (deleteAttrTarget) {
            deleteAttrMutation.mutate(deleteAttrTarget.id);
          }
        }}
        onCancel={() => setDeleteAttrTarget(null)}
        loading={deleteAttrMutation.isPending}
        danger
      />
    </>
  );
}

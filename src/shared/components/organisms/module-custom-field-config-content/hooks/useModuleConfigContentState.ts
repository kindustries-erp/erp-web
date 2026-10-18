import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  moduleConfigApi,
  resolveAttrName,
  type ModuleAttributeDef,
  type ModuleAttributeFieldType,
  type ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";
import { getFieldTypeOptions } from "@/shared/constants/customFields";
import type { ComboboxOption } from "@/shared/components/Combobox";

export function useModuleConfigContentState({
  activeModuleKey,
  isOpen,
  initialAttrCode,
  onDirtyChange,
  locale,
  t,
}: {
  activeModuleKey: string;
  isOpen: boolean;
  initialAttrCode?: string | null;
  onDirtyChange?: (isDirty: boolean) => void;
  locale: string;
  t: (key: string, fallback: string) => string;
}) {
  const queryClient = useQueryClient();
  const fieldTypeOptions = useMemo(() => getFieldTypeOptions(t), [t]);

  const { data: globalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", activeModuleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(activeModuleKey),
    enabled: isOpen && !!activeModuleKey,
  });

  const systemDefs = useMemo(
    () => globalDefs.filter((d) => Boolean(d.isSystem)),
    [globalDefs],
  );
  const customDefs = useMemo(
    () => globalDefs.filter((d) => !d.isSystem),
    [globalDefs],
  );

  const [isAddingAttr, setIsAddingAttr] = useState(false);
  const [editingAttr, setEditingAttr] = useState<ModuleAttributeDef | null>(
    null,
  );
  const [attrCode, setAttrCode] = useState("");
  const [attrName, setAttrName] = useState("");
  const [attrNameEn, setAttrNameEn] = useState("");
  const [attrNames, setAttrNames] = useState<Record<string, string>>({
    vi: "",
    en: "",
  });
  const [attrParentAttrCode, setAttrParentAttrCode] = useState("");
  const [attrFieldType, setAttrFieldType] =
    useState<ModuleAttributeFieldType>("TEXT");
  const [attrRequired, setAttrRequired] = useState(false);
  const [attrOptions, setAttrOptions] = useState<ModuleAttributeOption[]>([]);
  const [deleteAttrTarget, setDeleteAttrTarget] =
    useState<ModuleAttributeDef | null>(null);
  const [cancelConfirmTarget, setCancelConfirmTarget] = useState<
    "attr" | { type: "module"; nextKey: string } | null
  >(null);

  const isAttrDirty = useMemo(() => {
    if (isAddingAttr) {
      return Boolean(
        attrCode.trim() !== "" ||
        attrName.trim() !== "" ||
        attrNameEn.trim() !== "" ||
        attrParentAttrCode.trim() !== "" ||
        attrRequired ||
        attrFieldType !== "TEXT" ||
        attrOptions.length > 0,
      );
    }
    if (editingAttr) {
      const origOpts = editingAttr.options || [];
      const optsChanged =
        JSON.stringify(attrOptions) !== JSON.stringify(origOpts);
      return (
        attrCode.trim() !== (editingAttr.code || "") ||
        attrName.trim() !== (editingAttr.name || "") ||
        attrNameEn.trim() !== (editingAttr.nameEn || "") ||
        attrParentAttrCode.trim() !== (editingAttr.parentAttrCode || "") ||
        attrFieldType !== (editingAttr.fieldType || "TEXT") ||
        attrRequired !== Boolean(editingAttr.isRequired) ||
        optsChanged
      );
    }
    return false;
  }, [
    isAddingAttr,
    editingAttr,
    attrCode,
    attrName,
    attrNameEn,
    attrParentAttrCode,
    attrFieldType,
    attrRequired,
    attrOptions,
  ]);

  useEffect(() => {
    onDirtyChange?.(
      Boolean(isAddingAttr || editingAttr !== null || isAttrDirty),
    );
  }, [isAddingAttr, editingAttr, isAttrDirty, onDirtyChange]);

  const parentSelectAttrOptions: ComboboxOption[] = useMemo(() => {
    const candidateDefs = globalDefs.filter(
      (d) =>
        d.fieldType === "SELECT" &&
        !d.isDeleted &&
        d.code !== attrCode &&
        (!editingAttr || d.id !== editingAttr.id) &&
        !d.parentAttrCode,
    );
    return [
      {
        value: "",
        label: t(
          "moduleConfig.noParentAttr",
          "— Không phụ thuộc (Thuộc tính độc lập) —",
        ),
      },
      ...candidateDefs.map((d) => ({
        value: d.code,
        label: `${resolveAttrName(d, activeModuleKey, locale, t)} (${d.code})`,
        code: d.code,
      })),
    ];
  }, [globalDefs, attrCode, editingAttr, activeModuleKey, locale, t]);

  const effectiveParentAttrDef = useMemo(() => {
    if (!attrParentAttrCode) return null;
    return globalDefs.find(
      (d) => d.code === attrParentAttrCode && !d.isDeleted,
    );
  }, [globalDefs, attrParentAttrCode]);

  const parentCategoryOptions: ComboboxOption[] = useMemo(() => {
    if (!effectiveParentAttrDef?.options) return [];
    return effectiveParentAttrDef.options.map((opt) => ({
      value: opt.value,
      label: `${opt.label} (${opt.value})`,
      code: opt.value,
    }));
  }, [effectiveParentAttrDef]);

  const openCreateAttr = () => {
    setIsAddingAttr(true);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrNameEn("");
    setAttrNames({ vi: "", en: "" });
    setAttrParentAttrCode("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
  };

  const openEditAttr = (attr: ModuleAttributeDef) => {
    setEditingAttr(attr);
    setIsAddingAttr(false);
    setAttrCode(attr.code);
    setAttrName(attr.name);
    setAttrNameEn(attr.nameEn || "");
    setAttrNames({ vi: attr.name || "", en: attr.nameEn || "" });
    setAttrParentAttrCode(attr.parentAttrCode || "");
    setAttrFieldType(attr.fieldType);
    setAttrRequired(Boolean(attr.isRequired));
    setAttrOptions(attr.options || []);
  };

  const closeAttrForm = () => {
    setIsAddingAttr(false);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrNameEn("");
    setAttrNames({ vi: "", en: "" });
    setAttrParentAttrCode("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
  };

  useEffect(() => {
    if (isOpen && initialAttrCode && globalDefs.length > 0) {
      const found = globalDefs.find(
        (d) => d.code.toLowerCase() === initialAttrCode.toLowerCase(),
      );
      if (found && editingAttr?.id !== found.id) {
        openEditAttr(found);
      }
    }
  }, [isOpen, initialAttrCode, globalDefs]);

  useEffect(() => {
    closeAttrForm();
  }, [activeModuleKey]);

  const createAttrMutation = useMutation({
    mutationFn: (dto: any) => moduleConfigApi.createAttributeDef(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
      });
      toast.success(
        t("moduleConfig.createAttrSuccess", "Thêm thuộc tính thành công"),
      );
      closeAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          t("moduleConfig.createAttrError", "Không thể thêm thuộc tính"),
      );
    },
  });

  const updateAttrMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      moduleConfigApi.updateAttributeDef(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
      });
      toast.success(
        t("moduleConfig.updateAttrSuccess", "Cập nhật thuộc tính thành công"),
      );
      closeAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          t("moduleConfig.updateAttrError", "Không thể cập nhật thuộc tính"),
      );
    },
  });

  const deleteAttrMutation = useMutation({
    mutationFn: (id: string) => moduleConfigApi.deleteAttributeDef(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
      });
      toast.success(
        t("moduleConfig.deleteAttrSuccess", "Xóa thuộc tính thành công"),
      );
      setDeleteAttrTarget(null);
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          t("moduleConfig.deleteAttrError", "Không thể xóa thuộc tính"),
      );
      setDeleteAttrTarget(null);
    },
  });

  const handleSaveAttribute = async () => {
    const trimmedCode = attrCode.trim().toLowerCase();
    const trimmedName = (attrNames.vi || attrName).trim();
    const trimmedNameEn = (attrNames.en || attrNameEn).trim();

    if (!trimmedCode) {
      toast.error(
        t("moduleConfig.attrCodeRequired", "Vui lòng nhập mã thuộc tính"),
      );
      return;
    }
    if (!trimmedName) {
      toast.error(
        t("moduleConfig.attrNameRequired", "Vui lòng nhập tên hiển thị"),
      );
      return;
    }
    if (attrFieldType === "SELECT" && attrOptions.length === 0) {
      toast.error(
        t(
          "moduleConfig.selectOptionsRequired",
          "Kiểu SELECT cần ít nhất 1 tùy chọn",
        ),
      );
      return;
    }

    const currentFieldType = editingAttr?.isSystem
      ? editingAttr.fieldType
      : attrFieldType;
    const finalParentAttrCode =
      currentFieldType === "SELECT" && attrParentAttrCode.trim()
        ? attrParentAttrCode.trim()
        : null;

    if (editingAttr) {
      await updateAttrMutation.mutateAsync({
        id: editingAttr.id,
        dto: {
          code: editingAttr.isSystem ? editingAttr.code : trimmedCode,
          name: trimmedName,
          nameEn: trimmedNameEn || undefined,
          parentAttrCode: finalParentAttrCode,
          fieldType: currentFieldType,
          isRequired: attrRequired,
          options: currentFieldType === "SELECT" ? attrOptions : undefined,
        },
      });
    } else {
      await createAttrMutation.mutateAsync({
        isGlobal: true,
        moduleKeyGlobal: activeModuleKey,
        code: trimmedCode,
        name: trimmedName,
        nameEn: trimmedNameEn || undefined,
        parentAttrCode: finalParentAttrCode,
        fieldType: attrFieldType,
        isRequired: attrRequired,
        options: attrFieldType === "SELECT" ? attrOptions : undefined,
        isActive: true,
      });
    }
  };

  const handleToggleAttrActive = async (attr: ModuleAttributeDef) => {
    try {
      await moduleConfigApi.updateAttributeDef(attr.id, {
        isActive: !attr.isActive,
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      toast.success(
        attr.isActive
          ? t("common.deactivated", "Đã ngừng hoạt động")
          : t("common.activated", "Đã kích hoạt lại"),
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          t("common.updateFailed", "Cập nhật thất bại"),
      );
    }
  };

  return {
    systemDefs,
    customDefs,
    fieldTypeOptions,
    isAddingAttr,
    editingAttr,
    attrCode,
    setAttrCode,
    attrName,
    setAttrName,
    attrNameEn,
    setAttrNameEn,
    attrNames,
    setAttrNames,
    attrFieldType,
    setAttrFieldType,
    attrRequired,
    setAttrRequired,
    attrParentAttrCode,
    setAttrParentAttrCode,
    attrOptions,
    setAttrOptions,
    deleteAttrTarget,
    setDeleteAttrTarget,
    cancelConfirmTarget,
    setCancelConfirmTarget,
    isAttrDirty,
    parentSelectAttrOptions,
    parentCategoryOptions,
    openCreateAttr,
    openEditAttr,
    closeAttrForm,
    createAttrMutation,
    updateAttrMutation,
    deleteAttrMutation,
    handleSaveAttribute,
    handleToggleAttrActive,
  };
}

import React, { useState } from "react";
import { useTagsMutations } from "@/modules/tags/hooks/useTags";
import { SysTag } from "@/modules/tags/api/tagsApi";
import { useUIStore } from "@/core/config/uiStore";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";

interface TagFormModalProps {
  tag: SysTag | null;
  initialMode?: DrawerMode;
  onClose: () => void;
}

export function TagFormModal({
  tag,
  initialMode = "create",
  onClose,
}: TagFormModalProps) {
  const [mode, setMode] = useState<DrawerMode>(initialMode);
  const isEditing = mode === "edit";
  const viewOnly = mode === "view";
  const isCreate = mode === "create";
  const { showToast } = useUIStore();
  const { createTag, updateTag } = useTagsMutations();

  const [name, setName] = useState(tag?.name || "");
  const [color, setColor] = useState(tag?.color || "#e2e8f0");
  const [description, setDescription] = useState(tag?.description || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (isEditing && tag) {
        await updateTag({ id: tag.id, data: { name, color, description } });
        showToast({
          title: "Thành công",
          description: "Đã cập nhật thẻ",
          variant: "success",
        });
      } else {
        await createTag({ name, color, description });
        showToast({
          title: "Thành công",
          description: "Đã tạo thẻ mới",
          variant: "success",
        });
      }
      onClose();
    } catch (err) {
      const error = err as Error;
      showToast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StandardFormDrawer
      open={true}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode("edit")}
      title={isCreate ? "Thêm thẻ mới" : "Chi tiết thẻ"}
      loading={submitting}
      layout="1-column"
      actions={
        viewOnly
          ? [
              {
                label: "Đóng",
                variant: "outline",
                onClick: onClose,
              },
            ]
          : [
              {
                label: "Hủy",
                variant: "outline",
                onClick: onClose,
              },
              {
                label: "Lưu",
                onClick: handleSubmit,
                primary: true,
                loading: submitting,
              },
            ]
      }
      leftPanel={
        <DrawerSection title="THÔNG TIN THẺ">
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Tên thẻ" required>
              <input
                className={inputCls}
                value={name}
                disabled={viewOnly}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Quan trọng, Khẩn cấp"
                autoFocus={!viewOnly}
              />
            </DrawerField>

            <DrawerField label="Màu sắc">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color || "#6b7280"}
                  disabled={viewOnly}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 p-1 rounded cursor-pointer border border-[color:var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {!viewOnly && (
                  <button
                    type="button"
                    onClick={() => setColor("")}
                    className="text-xs text-[color:var(--color-secondary-text)] hover:text-red-500"
                  >
                    Xóa màu
                  </button>
                )}
              </div>
            </DrawerField>
          </div>

          <DrawerField label="Mô tả">
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={description}
              disabled={viewOnly}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả (không bắt buộc)"
            />
          </DrawerField>
        </DrawerSection>
      }
    />
  );
}

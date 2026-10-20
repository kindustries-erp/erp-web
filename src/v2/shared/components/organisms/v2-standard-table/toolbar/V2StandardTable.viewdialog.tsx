import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Checkbox, Input } from "@/v2/shared/ui";
import type { V2ViewSubmitInput } from "../hooks/V2StandardTable.views.hook";

export interface V2ViewDialogColumn {
  key: string;
  label: string;
  canHide: boolean;
}

export interface V2ViewConfigDialogProps {
  mode: "create" | "edit";
  initialName: string;
  columns: V2ViewDialogColumn[];
  initialVisibleKeys: string[];
  isNameTaken: (name: string) => boolean;
  onSubmit: (input: V2ViewSubmitInput) => void;
  onClose: () => void;
}

/** Tạo/sửa chế độ xem: tên (bắt buộc, không trùng) + cột hiển thị (ít nhất 1) */
export const V2ViewConfigDialog: React.FC<V2ViewConfigDialogProps> = ({
  mode,
  initialName,
  columns,
  initialVisibleKeys,
  isNameTaken,
  onSubmit,
  onClose,
}) => {
  const { t } = useV2Translation();
  const [name, setName] = React.useState(initialName);
  const [visible, setVisible] = React.useState(
    () => new Set(initialVisibleKeys),
  );
  const [submitted, setSubmitted] = React.useState(false);

  const trimmed = name.trim();
  const nameError = !trimmed
    ? t("v2.table.viewNameRequired", "Vui lòng nhập tên chế độ xem")
    : isNameTaken(trimmed)
      ? t("v2.table.viewNameDuplicate", "Tên chế độ xem đã tồn tại")
      : null;
  const visibleKeys = columns
    .filter((c) => !c.canHide || visible.has(c.key))
    .map((c) => c.key);
  const columnsError =
    visibleKeys.length === 0
      ? t("v2.table.viewColumnsRequired", "Chọn ít nhất 1 cột")
      : null;

  const setColumn = (key: string, checked: boolean) =>
    setVisible((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });

  const submit = () => {
    setSubmitted(true);
    if (nameError || columnsError) return;
    onSubmit({ name: trimmed, visibleKeys });
  };

  const title =
    mode === "create"
      ? t("v2.table.createViewTitle", "Tạo chế độ xem")
      : t("v2.table.editViewTitle", "Sửa chế độ xem");

  return (
    <V2Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title={title}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <V2Button variant="outline" size="sm" onClick={onClose}>
            {t("v2.common.cancel", "Hủy")}
          </V2Button>
          <V2Button variant="primary" size="sm" onClick={submit}>
            {t("v2.common.save", "Lưu")}
          </V2Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="v2-view-name">
            <V2Text variant="label" required>
              {t("v2.table.viewNameLabel", "Tên chế độ xem")}
            </V2Text>
          </label>
          <Input
            id="v2-view-name"
            value={name}
            placeholder={t(
              "v2.table.viewNamePlaceholder",
              "Nhập tên chế độ xem",
            )}
            aria-invalid={submitted && Boolean(nameError)}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
          {submitted && nameError && (
            <V2Text as="p" variant="helper" color="destructive" role="alert">
              {nameError}
            </V2Text>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <V2Text variant="label">
              {t("v2.table.viewColumnsLabel", "Cột hiển thị")}
            </V2Text>
            <div className="flex gap-1">
              <V2Button
                variant="ghost"
                size="xs"
                onClick={() => setVisible(new Set(columns.map((c) => c.key)))}
              >
                {t("v2.table.selectAllColumns", "Chọn tất cả")}
              </V2Button>
              <V2Button
                variant="ghost"
                size="xs"
                onClick={() => setVisible(new Set())}
              >
                {t("v2.table.clearAllColumns", "Bỏ chọn tất cả")}
              </V2Button>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {columns.map((column) => (
              <li key={column.key}>
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={!column.canHide || visible.has(column.key)}
                    disabled={!column.canHide}
                    onCheckedChange={(value) =>
                      setColumn(column.key, value === true)
                    }
                  />
                  <span className="truncate">{column.label}</span>
                </label>
              </li>
            ))}
          </ul>
          {submitted && columnsError && (
            <V2Text as="p" variant="helper" color="destructive" role="alert">
              {columnsError}
            </V2Text>
          )}
        </div>
      </div>
    </V2Modal>
  );
};

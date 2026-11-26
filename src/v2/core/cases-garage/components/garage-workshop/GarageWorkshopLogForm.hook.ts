import * as React from "react";
import {
  stagesOf,
  toLocalInput,
  toLogSubmit,
  validateLogForm,
  type WorkshopLogFormValue,
  type WorkshopLogKind,
  type WorkshopLogSubmit,
  type WorkshopLogView,
} from "../../workshop";

const EMPTY: WorkshopLogFormValue = {
  kind: "STAGE",
  stage: "",
  note: "",
  workerId: null,
  workerName: "",
  startedAt: "",
  endedAt: "",
};

const fromLog = (log: WorkshopLogView): WorkshopLogFormValue => ({
  kind: log.kind,
  stage: log.stage ?? "",
  note: log.note ?? "",
  workerId: log.workerId,
  workerName: log.workerName ?? "",
  startedAt: toLocalInput(log.startedAt),
  endedAt: toLocalInput(log.endedAt),
});

export interface GarageWorkshopLogFormParams {
  status: string;
  /** Dòng đang sửa; null là tạo mới. */
  editing: WorkshopLogView | null;
  onSubmit: (value: WorkshopLogSubmit) => Promise<unknown> | void;
  /** Người làm điền sẵn cho dòng mới; chỉ điền khi ô đang trống. */
  defaultWorker?: { workerId: string | null; workerName: string } | null;
}

/** State form ghi tiến độ: tạo công đoạn/ghi chú mới hoặc sửa một dòng; reset sau khi lưu thành công. */
export function useGarageWorkshopLogForm({
  status,
  editing,
  onSubmit,
  defaultWorker,
}: GarageWorkshopLogFormParams) {
  const [value, setValue] = React.useState<WorkshopLogFormValue>(EMPTY);
  const [errorKey, setErrorKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    setValue(editing ? fromLog(editing) : EMPTY);
    setErrorKey(null);
  }, [editing]);

  // Dòng mới: điền người đăng nhập khi danh sách nhân viên đã tải và ô người làm còn trống.
  const defaultId = defaultWorker?.workerId ?? null;
  const defaultName = defaultWorker?.workerName ?? "";
  React.useEffect(() => {
    if (editing || (!defaultId && !defaultName)) return;
    setValue((v) =>
      v.workerId || v.workerName
        ? v
        : { ...v, workerId: defaultId, workerName: defaultName },
    );
  }, [editing, defaultId, defaultName]);

  const patch = React.useCallback(
    (p: Partial<WorkshopLogFormValue>) => setValue((v) => ({ ...v, ...p })),
    [],
  );
  const setKind = (kind: WorkshopLogKind) => patch({ kind, stage: "" });
  const isEditing = Boolean(editing);
  /** Chỉ dòng STAGE đã đóng mới sửa được giờ kết thúc. */
  const canEditEnd = Boolean(
    editing && editing.kind === "STAGE" && editing.endedAt,
  );

  const submit = async () => {
    const err = validateLogForm(value);
    setErrorKey(err);
    if (err) return;
    const payload = toLogSubmit(value);
    // Sửa dòng: chỉ gửi giờ khi người dùng đổi, tránh cắt giây gốc khi chỉ sửa mô tả/người làm.
    const original = editing ? fromLog(editing) : null;
    const changed = (k: "startedAt" | "endedAt") =>
      !original || value[k] !== original[k];
    try {
      await onSubmit({
        ...payload,
        startedAt: changed("startedAt") ? payload.startedAt : undefined,
        endedAt: canEditEnd && changed("endedAt") ? payload.endedAt : undefined,
      });
    } catch {
      // Lỗi đã được báo ở tầng gọi (toast); giữ nguyên dữ liệu để người dùng sửa lại.
      return;
    }
    // Lưu xong: xóa nội dung, giữ loại và người làm để ghi tiếp nhanh.
    if (!isEditing) {
      setValue((v) => ({
        ...EMPTY,
        kind: v.kind,
        workerId: v.workerId,
        workerName: v.workerName,
      }));
    }
  };

  return {
    value,
    patch,
    setKind,
    stages: stagesOf(status),
    errorKey,
    isEditing,
    canEditEnd,
    submit,
  };
}

import * as React from "react";
import type { WorkshopLogSubmit, WorkshopLogView } from "../../workshop";

export interface GarageWorkshopDrawerParams {
  open: boolean;
  onCreate: (value: WorkshopLogSubmit) => Promise<unknown>;
  onUpdate: (logId: string, value: WorkshopLogSubmit) => Promise<unknown>;
  onRemove: (logId: string) => Promise<unknown>;
}

/** State drawer: dòng nhật ký đang sửa và dòng chờ xác nhận xóa; đóng drawer thì xóa cả hai. */
export function useGarageWorkshopDrawer({
  open,
  onCreate,
  onUpdate,
  onRemove,
}: GarageWorkshopDrawerParams) {
  const [editing, setEditing] = React.useState<WorkshopLogView | null>(null);
  const [removing, setRemoving] = React.useState<WorkshopLogView | null>(null);

  React.useEffect(() => {
    if (!open) {
      setEditing(null);
      setRemoving(null);
    }
  }, [open]);

  const submit = async (value: WorkshopLogSubmit) => {
    if (editing) {
      await onUpdate(editing.id, value);
      setEditing(null);
      return;
    }
    await onCreate(value);
  };

  const confirmRemove = async () => {
    if (!removing) return;
    const target = removing;
    setRemoving(null);
    if (editing?.id === target.id) setEditing(null);
    await onRemove(target.id).catch(() => undefined);
  };

  return {
    editing,
    startEdit: setEditing,
    cancelEdit: () => setEditing(null),
    removing,
    askRemove: setRemoving,
    cancelRemove: () => setRemoving(null),
    confirmRemove,
    submit,
  };
}

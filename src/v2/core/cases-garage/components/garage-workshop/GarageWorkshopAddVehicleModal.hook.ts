import * as React from "react";
import {
  WORKSHOP_NEW_CANDIDATE,
  allowedTrackStatuses,
  toTrackSubmit,
  type WorkshopCandidateView,
  type WorkshopCaseStatus,
  type WorkshopTrackSubmit,
} from "../../workshop";

export interface GarageWorkshopAddVehicleParams {
  open: boolean;
  search: string;
  candidates: WorkshopCandidateView[];
  canChangeStatus: boolean;
  onSubmit: (value: WorkshopTrackSubmit) => Promise<unknown>;
  onClose: () => void;
}

type Selected = WorkshopCandidateView | "new" | null;

/** State hộp thoại thêm xe: xe đã chọn (hoặc tạo mới), trạng thái, tên khách; mở lại thì làm mới. */
export function useGarageWorkshopAddVehicle({
  open,
  search,
  candidates,
  canChangeStatus,
  onSubmit,
  onClose,
}: GarageWorkshopAddVehicleParams) {
  const [selected, setSelected] = React.useState<Selected>(null);
  const [status, setStatus] = React.useState<WorkshopCaseStatus>("INTAKE");
  const [customerName, setCustomerName] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setSelected(null);
    setStatus("INTAKE");
    setCustomerName("");
  }, [open]);

  const pick = (id: string) => {
    if (id === WORKSHOP_NEW_CANDIDATE) {
      setSelected("new");
      setStatus("INTAKE");
      return;
    }
    const found = candidates.find((c) => c.id === id);
    if (!found) return;
    setSelected(found);
    setStatus(found.status);
  };

  const selectedValue =
    selected === "new" ? WORKSHOP_NEW_CANDIDATE : (selected?.id ?? null);
  const allowed = selected
    ? allowedTrackStatuses(selected, canChangeStatus)
    : new Set<WorkshopCaseStatus>();
  const current = selected && selected !== "new" ? selected : null;

  const submit = async () => {
    if (!selected) return;
    try {
      await onSubmit(toTrackSubmit(selected, status, search, customerName));
    } catch {
      // Lỗi đã báo bằng toast ở tầng gọi; giữ hộp thoại để chọn lại.
      return;
    }
    onClose();
  };

  return {
    selected,
    selectedValue,
    isNew: selected === "new",
    current,
    status,
    setStatus,
    allowed,
    customerName,
    setCustomerName,
    pick,
    submit,
    /** Xe KGara đổi trạng thái: chỉ đổi ở ERP. */
    overridesKgara: Boolean(
      current && current.origin === "KGARA_SYNC" && status !== current.status,
    ),
    lockedStatus: Boolean(current && !canChangeStatus),
  };
}

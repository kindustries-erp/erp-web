import { V2RadioCardGroup, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  WORKSHOP_NEW_CANDIDATE,
  normalizeNewPlate,
  statusConfigOf,
  type WorkshopCandidateView,
} from "../../workshop";

export interface GarageWorkshopCandidatePickerProps {
  search: string;
  candidates: WorkshopCandidateView[];
  loading?: boolean;
  /** Có quyền `garage:create`: hiện lựa chọn tạo xe mới theo biển số đã gõ. */
  canCreate: boolean;
  value: string | null;
  onChange: (id: string) => void;
}

/** Danh sách xe khớp biển số để chọn một; xe đã trên bảng bị khóa; cuối danh sách là "tạo xe mới". */
export function GarageWorkshopCandidatePicker({
  search,
  candidates,
  loading,
  canCreate,
  value,
  onChange,
}: GarageWorkshopCandidatePickerProps) {
  const { t } = useV2Translation();
  const plate = normalizeNewPlate(search);
  const k = (key: string) => `v2.garageCases.workshop.add.${key}`;

  if (plate.replace(/[^A-Z0-9]/g, "").length < 2) {
    return (
      <V2Text variant="body-sm" color="muted">
        {t(k("typeHint"), "Nhập ít nhất 2 ký tự biển số để tìm xe.")}
      </V2Text>
    );
  }
  if (loading && !candidates.length) {
    return (
      <V2Text variant="body-sm" color="muted">
        {t(k("searching"), "Đang tìm xe…")}
      </V2Text>
    );
  }

  const options = candidates.map((c) => {
    const s = statusConfigOf(c.status);
    const parts = [
      c.customerName,
      c.vehicleName,
      t(s.labelKey, s.defaultLabel),
      c.origin === "KGARA_SYNC"
        ? t(k("originKgara"), "KGara")
        : t(k("originNative"), "Nhập ở ERP"),
      c.onBoard ? t(k("onBoard"), "Đã có trên bảng") : null,
    ];
    return {
      value: c.id,
      label: c.licensePlate || c.caseCode,
      description: parts.filter(Boolean).join(" · "),
      disabled: c.onBoard,
    };
  });
  if (canCreate) {
    options.push({
      value: WORKSHOP_NEW_CANDIDATE,
      label: t(k("newOption"), {
        defaultValue: "Tạo xe mới {{plate}}",
        plate,
      }),
      description: t(
        k("newOptionHint"),
        "Xe chưa có trong hệ thống: tạo vụ việc mới theo biển số này",
      ),
      disabled: false,
    });
  }

  if (!options.length) {
    return (
      <V2Text variant="body-sm" color="muted" data-testid="workshop-add-none">
        {t(
          k("noneNoCreate"),
          "Không tìm thấy xe. Cần quyền tạo vụ việc garage để thêm xe mới.",
        )}
      </V2Text>
    );
  }

  return (
    <V2RadioCardGroup
      name="workshop-candidate"
      className="[&>div]:min-h-11"
      ariaLabel={t(k("pickVehicle"), "Chọn xe")}
      options={options}
      value={value ?? ""}
      onValueChange={onChange}
    />
  );
}

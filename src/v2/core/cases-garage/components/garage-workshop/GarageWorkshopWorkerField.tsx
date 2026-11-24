import { DrawerField, V2AutocompleteInput } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { WorkshopWorkerOption } from "../../workshop";

export interface WorkshopWorkerValue {
  workerId: string | null;
  workerName: string;
}

export interface GarageWorkshopWorkerFieldProps extends WorkshopWorkerValue {
  workers: WorkshopWorkerOption[];
  loading?: boolean;
  onSearch?: (q: string) => void;
  onChange: (value: WorkshopWorkerValue) => void;
}

/**
 * Ô "Người làm": gõ tên, gợi ý nhân viên hiện ngay bên dưới để chọn nhanh (gắn nhân viên);
 * tên không có trong danh sách thì giữ như nhập tay (không gắn nhân viên).
 */
export function GarageWorkshopWorkerField({
  workerId,
  workerName,
  workers,
  loading,
  onSearch,
  onChange,
}: GarageWorkshopWorkerFieldProps) {
  const { t } = useV2Translation();
  const label = t("v2.garageCases.workshop.form.worker", "Người làm");
  const linked = workers.find((w) => w.id === workerId);
  const helper = workerId
    ? t("v2.garageCases.workshop.form.workerLinked", {
        defaultValue: "Nhân viên {{code}}",
        code: linked?.code ?? "",
      })
    : workerName.trim()
      ? t(
          "v2.garageCases.workshop.form.workerFree",
          "Tên nhập tay (không gắn nhân viên)",
        )
      : undefined;

  return (
    <DrawerField label={label} helperText={helper}>
      <V2AutocompleteInput
        aria-label={label}
        value={workerName}
        placeholder={t(
          "v2.garageCases.workshop.form.workerTypePlaceholder",
          "Gõ tên để chọn nhân viên hoặc nhập tên",
        )}
        options={workers.map((w) => ({
          value: w.id,
          label: w.fullName,
          description: [w.code, w.jobTitle].filter(Boolean).join(" · "),
        }))}
        loading={loading}
        onSearchChange={onSearch}
        onChange={(text) => onChange({ workerId: null, workerName: text })}
        onSelect={(o) => onChange({ workerId: o.value, workerName: o.label })}
      />
    </DrawerField>
  );
}

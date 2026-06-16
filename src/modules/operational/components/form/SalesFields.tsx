import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { useT } from "@/core/i18n";

interface SalesFieldsProps {
  vehiclePlate: string;
  vehicleVin: string;
  vehicleModel: string;
  serviceAdvisorName: string;
  expectedDate: string;
  disabled?: boolean;
  onVehiclePlate: (v: string) => void;
  onVehicleVin: (v: string) => void;
  onVehicleModel: (v: string) => void;
  onServiceAdvisorName: (v: string) => void;
  onExpectedDate: (v: string) => void;
}

/**
 * Các field đặc thù của variant "sales" trong form chứng từ.
 * Extracted từ OperationalFormDrawer.tsx (dòng 1157–1201).
 */
export function SalesFields({
  vehiclePlate,
  vehicleVin,
  vehicleModel,
  serviceAdvisorName,
  expectedDate,
  disabled,
  onVehiclePlate,
  onVehicleVin,
  onVehicleModel,
  onServiceAdvisorName,
  onExpectedDate,
}: SalesFieldsProps) {
  const t = useT();
  return (
    <>
      <DrawerField label={t("Biển số xe")}>
        <input
          className={inputCls}
          value={vehiclePlate}
          disabled={disabled}
          onChange={(e) => onVehiclePlate(e.target.value)}
        />
      </DrawerField>
      <DrawerField label="VIN">
        <input
          className={inputCls}
          value={vehicleVin}
          disabled={disabled}
          onChange={(e) => onVehicleVin(e.target.value)}
        />
      </DrawerField>
      <DrawerField label={t("Model xe")}>
        <input
          className={inputCls}
          value={vehicleModel}
          disabled={disabled}
          onChange={(e) => onVehicleModel(e.target.value)}
        />
      </DrawerField>
      <DrawerField label={t("Cố vấn dịch vụ")}>
        <input
          className={inputCls}
          value={serviceAdvisorName}
          disabled={disabled}
          onChange={(e) => onServiceAdvisorName(e.target.value)}
        />
      </DrawerField>
      <DrawerField label={t("Ngày giao dự kiến")}>
        <DatePicker
          className={inputCls}
          value={expectedDate?.slice(0, 10) || ""}
          disabled={disabled}
          onChange={onExpectedDate}
        />
      </DrawerField>
    </>
  );
}

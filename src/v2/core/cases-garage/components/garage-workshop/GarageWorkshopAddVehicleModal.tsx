import {
  DrawerField,
  V2Button,
  V2Input,
  V2Modal,
  V2SearchInput,
  V2Stack,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type {
  WorkshopCandidateView,
  WorkshopTrackSubmit,
} from "../../workshop";
import { useGarageWorkshopAddVehicle } from "./GarageWorkshopAddVehicleModal.hook";
import { GarageWorkshopCandidatePicker } from "./GarageWorkshopCandidatePicker";
import { GarageWorkshopTrackStatusPicker } from "./GarageWorkshopTrackStatusPicker";

export interface GarageWorkshopAddVehicleModalProps {
  open: boolean;
  search: string;
  onSearchChange: (q: string) => void;
  candidates: WorkshopCandidateView[];
  candidatesLoading?: boolean;
  /** `garage:create`: cho tạo xe chưa có. */
  canCreate: boolean;
  /** `garage:update`: cho đổi trạng thái xe có sẵn khi đưa vào bảng. */
  canChangeStatus: boolean;
  submitting?: boolean;
  onSubmit: (value: WorkshopTrackSubmit) => Promise<unknown>;
  onClose: () => void;
}

const FIELD_TEXT = "text-base md:text-sm";

/**
 * Hộp thoại "Thêm xe vào bảng": tìm biển số, chọn xe có sẵn (giữ hoặc đổi trạng thái) hoặc tạo xe mới,
 * rồi đưa vào bảng tiến độ.
 */
export function GarageWorkshopAddVehicleModal(
  props: GarageWorkshopAddVehicleModalProps,
) {
  const { t } = useV2Translation();
  const m = useGarageWorkshopAddVehicle(props);
  const k = (key: string) => `v2.garageCases.workshop.add.${key}`;
  const helper = m.lockedStatus
    ? t(k("lockedStatus"), "Cần quyền sửa vụ việc garage để đổi trạng thái.")
    : m.overridesKgara
      ? t(k("overrideHint"), "Chỉ đổi trên ERP, trạng thái ở KGara giữ nguyên.")
      : undefined;

  return (
    <V2Modal
      open={props.open}
      onOpenChange={(next) => !next && props.onClose()}
      size="md"
      title={t(k("title"), "Thêm xe vào bảng")}
      description={t(
        k("description"),
        "Tìm theo biển số, chọn xe rồi chọn trạng thái trên bảng.",
      )}
      footer={
        <V2Stack className="w-full flex-row justify-end gap-2">
          <V2Button
            variant="outline"
            className="min-h-11"
            onClick={props.onClose}
          >
            {t("v2.common.cancel", "Hủy")}
          </V2Button>
          <V2Button
            variant="primary"
            className="min-h-11"
            disabled={!m.selected}
            isLoading={props.submitting}
            onClick={() => void m.submit()}
          >
            {t(k("submit"), "Đưa vào bảng")}
          </V2Button>
        </V2Stack>
      }
    >
      <V2Stack gap="md" data-testid="workshop-add-modal">
        <DrawerField label={t(k("plate"), "Biển số")}>
          <V2SearchInput
            value={props.search}
            onChange={props.onSearchChange}
            debounceMs={300}
            placeholder={t(k("platePlaceholder"), "Ví dụ: 51G-123.45")}
          />
        </DrawerField>
        <GarageWorkshopCandidatePicker
          search={props.search}
          candidates={props.candidates}
          loading={props.candidatesLoading}
          canCreate={props.canCreate}
          value={m.selectedValue}
          onChange={m.pick}
        />
        {m.isNew ? (
          <DrawerField label={t(k("customer"), "Tên khách (không bắt buộc)")}>
            <V2Input
              aria-label={t(k("customer"), "Tên khách (không bắt buộc)")}
              className={FIELD_TEXT}
              value={m.customerName}
              onChange={(e) => m.setCustomerName(e.target.value)}
            />
          </DrawerField>
        ) : null}
        {m.selected ? (
          <GarageWorkshopTrackStatusPicker
            value={m.status}
            onChange={m.setStatus}
            allowed={m.allowed}
            current={m.current?.status}
            helperText={helper}
          />
        ) : null}
      </V2Stack>
    </V2Modal>
  );
}

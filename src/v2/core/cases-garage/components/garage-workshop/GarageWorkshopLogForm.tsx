import {
  DrawerField,
  V2Button,
  V2Stack,
  V2TabBar,
  V2TabBarVariant,
  V2Text,
  V2Textarea,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  WORKSHOP_FORM_ERROR_DEFAULTS,
  type WorkshopLogSubmit,
  type WorkshopLogView,
  type WorkshopWorkerOption,
} from "../../workshop";
import { useGarageWorkshopLogForm } from "./GarageWorkshopLogForm.hook";
import { GarageWorkshopStagePicker } from "./GarageWorkshopStagePicker";
import { GarageWorkshopTimeFields } from "./GarageWorkshopTimeFields";
import { GarageWorkshopWorkerField } from "./GarageWorkshopWorkerField";

export interface GarageWorkshopLogFormProps {
  /** Status v2 hiện tại của xe: quyết định danh sách công đoạn. */
  status: string;
  editing: WorkshopLogView | null;
  workers: WorkshopWorkerOption[];
  workersLoading?: boolean;
  onWorkerSearch?: (q: string) => void;
  saving?: boolean;
  onSubmit: (value: WorkshopLogSubmit) => Promise<unknown> | void;
  onCancelEdit?: () => void;
  /** Người làm mặc định cho dòng mới (người đăng nhập nếu có trong danh sách). */
  defaultWorker?: { workerId: string | null; workerName: string } | null;
}

/** Font 16px trên mobile để iOS Safari không tự phóng to. */
const FIELD_TEXT = "text-base md:text-sm";

/** Form ghi tiến độ cho nhân viên xưởng: chọn công đoạn hoặc ghi chú, người làm, mô tả, giờ bắt đầu (sửa tay). */
export function GarageWorkshopLogForm(props: GarageWorkshopLogFormProps) {
  const { t } = useV2Translation();
  const f = useGarageWorkshopLogForm(props);

  return (
    <V2Stack gap="sm" data-testid="workshop-log-form">
      {f.isEditing ? (
        <V2Text variant="label" color="primary">
          {t(
            "v2.garageCases.workshop.form.editing",
            "Đang sửa một dòng nhật ký",
          )}
        </V2Text>
      ) : (
        <V2TabBar
          variant={V2TabBarVariant.SUB}
          stretch
          activeTabKey={f.value.kind}
          onTabChange={(k) => f.setKind(k as "STAGE" | "NOTE")}
          tabs={[
            {
              key: "STAGE",
              label: t(
                "v2.garageCases.workshop.form.kindStage",
                "Đổi công đoạn",
              ),
            },
            {
              key: "NOTE",
              label: t("v2.garageCases.workshop.form.kindNote", "Ghi chú"),
            },
          ]}
        />
      )}

      {f.value.kind === "STAGE" && !f.isEditing ? (
        <GarageWorkshopStagePicker
          stages={f.stages}
          value={f.value.stage}
          onChange={(stage) => f.patch({ stage })}
        />
      ) : null}

      <GarageWorkshopWorkerField
        workerId={f.value.workerId}
        workerName={f.value.workerName}
        workers={props.workers}
        loading={props.workersLoading}
        onSearch={props.onWorkerSearch}
        onChange={f.patch}
      />

      <DrawerField
        label={t("v2.garageCases.workshop.form.note", "Mô tả công việc")}
        required={f.value.kind === "NOTE"}
      >
        <V2Textarea
          rows={3}
          className={FIELD_TEXT}
          value={f.value.note}
          placeholder={t(
            "v2.garageCases.workshop.form.notePlaceholder",
            "Ví dụ: đã tháo cản trước",
          )}
          onChange={(e) => f.patch({ note: e.target.value })}
        />
      </DrawerField>

      <GarageWorkshopTimeFields
        startedAt={f.value.startedAt}
        endedAt={f.value.endedAt}
        showEnd={f.canEditEnd}
        showHint={!f.isEditing}
        onChange={f.patch}
      />

      {f.errorKey ? (
        <V2Text variant="body-sm" color="destructive" role="alert">
          {t(
            f.errorKey,
            WORKSHOP_FORM_ERROR_DEFAULTS[f.errorKey] ?? f.errorKey,
          )}
        </V2Text>
      ) : null}

      <V2Stack className="flex-row gap-2">
        {f.isEditing ? (
          <V2Button
            variant="outline"
            className="min-h-11 flex-1"
            onClick={props.onCancelEdit}
          >
            {t("v2.garageCases.workshop.form.cancelEdit", "Hủy sửa")}
          </V2Button>
        ) : null}
        <V2Button
          variant="primary"
          className="min-h-11 flex-1"
          isLoading={props.saving}
          onClick={() => void f.submit()}
        >
          {f.isEditing
            ? t("v2.garageCases.workshop.form.saveEdit", "Lưu thay đổi")
            : t("v2.garageCases.workshop.form.save", "Lưu tiến độ")}
        </V2Button>
      </V2Stack>
    </V2Stack>
  );
}

import { Wrench } from "lucide-react";
import {
  DrawerSection,
  V2ConfirmModal,
  V2Stack,
  V2StandardDrawer,
  V2Text,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type {
  WorkshopCaseStatus,
  WorkshopCaseView,
  WorkshopLogSubmit,
  WorkshopLogView,
  WorkshopWorkerOption,
} from "../../workshop";
import { useGarageWorkshopDrawer } from "./GarageWorkshopDrawer.hook";
import { GarageWorkshopDrawerSummary } from "./GarageWorkshopDrawerSummary";
import { GarageWorkshopLogForm } from "./GarageWorkshopLogForm";
import { GarageWorkshopTimeline } from "./GarageWorkshopTimeline";

export interface GarageWorkshopDrawerProps {
  open: boolean;
  item: WorkshopCaseView | null;
  logs: WorkshopLogView[];
  logsLoading?: boolean;
  now: Date;
  /** Quyền `garage_workshop:update`: không có thì chỉ xem nhật ký. */
  canEdit: boolean;
  workers: WorkshopWorkerOption[];
  workersLoading?: boolean;
  onWorkerSearch?: (q: string) => void;
  saving?: boolean;
  onCreate: (value: WorkshopLogSubmit) => Promise<unknown>;
  onUpdate: (logId: string, value: WorkshopLogSubmit) => Promise<unknown>;
  onRemove: (logId: string) => Promise<unknown>;
  onClose: () => void;
  /** Người làm điền sẵn cho dòng mới. */
  defaultWorker?: { workerId: string | null; workerName: string } | null;
  /** Bỏ xe khỏi bảng (trang mở hộp xác nhận); không truyền thì ẩn nút. */
  onUntrack?: () => void;
  /** Quyền `garage:update` để đổi trạng thái trong drawer. */
  canMoveStatus?: boolean;
  /** Đổi trạng thái (trang hỏi xác nhận khi cần); không truyền thì ẩn ô Trạng thái. */
  onChangeStatus?: (status: WorkshopCaseStatus) => void;
}

/** Drawer cập nhật tiến độ một xe: trạng thái hiện tại, form ghi công đoạn/ghi chú, nhật ký có sửa/xóa. */
export function GarageWorkshopDrawer(props: GarageWorkshopDrawerProps) {
  const { t } = useV2Translation();
  const d = useGarageWorkshopDrawer(props);
  const item = props.item;
  const plate = item?.licensePlate || item?.caseCode || "";

  return (
    <>
      <V2StandardDrawer
        open={props.open && Boolean(item)}
        onClose={props.onClose}
        size="sm"
        icon={<Wrench className="h-5 w-5" />}
        title={t("v2.garageCases.workshop.drawer.title", {
          defaultValue: plate,
          plate,
        })}
        subtitle={[item?.customerName, item?.caseCode]
          .filter(Boolean)
          .join(" · ")}
        loading={props.logsLoading}
      >
        {item ? (
          <V2Stack gap="md" className="p-1" data-testid="workshop-drawer">
            <GarageWorkshopDrawerSummary
              item={item}
              now={props.now}
              canEdit={props.canEdit}
              canMoveStatus={props.canMoveStatus}
              onChangeStatus={props.onChangeStatus}
              onUntrack={props.onUntrack}
            />

            {props.canEdit ? (
              <DrawerSection
                title={t(
                  "v2.garageCases.workshop.drawer.update",
                  "Cập nhật tiến độ",
                )}
                collapsible={false}
              >
                <GarageWorkshopLogForm
                  status={item.status}
                  editing={d.editing}
                  workers={props.workers}
                  workersLoading={props.workersLoading}
                  onWorkerSearch={props.onWorkerSearch}
                  saving={props.saving}
                  onSubmit={d.submit}
                  onCancelEdit={d.cancelEdit}
                  defaultWorker={props.defaultWorker}
                />
              </DrawerSection>
            ) : (
              <V2Text variant="body-sm" color="muted">
                {t(
                  "v2.garageCases.workshop.drawer.readOnly",
                  "Bạn chỉ có quyền xem tiến độ.",
                )}
              </V2Text>
            )}

            <DrawerSection
              title={t(
                "v2.garageCases.workshop.drawer.timeline",
                "Nhật ký tiến độ",
              )}
              collapsible={false}
            >
              <GarageWorkshopTimeline
                logs={props.logs}
                now={props.now}
                canEdit={props.canEdit}
                editingId={d.editing?.id}
                onEdit={d.startEdit}
                onRemove={d.askRemove}
              />
            </DrawerSection>
          </V2Stack>
        ) : null}
      </V2StandardDrawer>

      <V2ConfirmModal
        open={Boolean(d.removing)}
        variant="danger"
        title={t(
          "v2.garageCases.workshop.log.removeTitle",
          "Xóa dòng nhật ký?",
        )}
        message={t(
          "v2.garageCases.workshop.log.removeMessage",
          "Dòng nhật ký sẽ bị ẩn khỏi tiến độ xe. Tiếp tục?",
        )}
        confirmLabel={t("v2.garageCases.workshop.log.remove", "Xóa")}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        onConfirm={d.confirmRemove}
        onCancel={d.cancelRemove}
        onOpenChange={(next) => !next && d.cancelRemove()}
        // Mở trên drawer V2 (z-index 50+): cùng quy ước các drawer khác.
        className="z-[700]"
        overlayClassName="z-[699]"
      />
    </>
  );
}

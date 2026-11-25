import {
  GarageWorkshopAddVehicleModal,
  GarageWorkshopDrawer,
} from "@/v2/core/cases-garage";
import { V2ConfirmModal } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { useGarageWorkshopProgress } from "../hooks/useGarageWorkshopProgress";
import type { useGarageWorkshopTracking } from "../hooks/useGarageWorkshopTracking";
import type { useWorkshopStatusChange } from "../hooks/useWorkshopStatusChange";
import { GarageWorkshopCancelConfirm } from "./GarageWorkshopProgressPage.cancel";

export interface GarageWorkshopDialogsProps {
  vm: ReturnType<typeof useGarageWorkshopProgress>;
  tr: ReturnType<typeof useGarageWorkshopTracking>;
  sc: ReturnType<typeof useWorkshopStatusChange>;
}

/** Drawer cập nhật tiến độ, hộp thoại thêm xe, xác nhận bỏ xe khỏi bảng và xác nhận Hủy xe. */
export function GarageWorkshopDialogs({
  vm,
  tr,
  sc,
}: GarageWorkshopDialogsProps) {
  const { t } = useV2Translation();
  const plate =
    tr.untrackTarget?.licensePlate || tr.untrackTarget?.caseCode || "";
  const selected = vm.selected;

  return (
    <>
      <GarageWorkshopDrawer
        open={Boolean(selected)}
        item={selected}
        logs={vm.logs}
        logsLoading={vm.logsLoading}
        now={vm.now}
        canEdit={vm.canEdit}
        workers={vm.workers}
        workersLoading={vm.workersLoading}
        onWorkerSearch={vm.setWorkerSearch}
        defaultWorker={vm.defaultWorker}
        saving={vm.saving}
        onCreate={vm.create}
        onUpdate={vm.update}
        onRemove={vm.remove}
        onClose={vm.close}
        onUntrack={selected ? () => tr.askUntrack(selected) : undefined}
        canMoveStatus={vm.canMoveStatus}
        onChangeStatus={
          selected ? (status) => sc.request(selected, status) : undefined
        }
      />
      <GarageWorkshopCancelConfirm
        target={sc.cancelTarget}
        onConfirm={sc.confirmCancel}
        onCancel={sc.dismissCancel}
      />
      <GarageWorkshopAddVehicleModal
        open={tr.addOpen}
        search={tr.search}
        onSearchChange={tr.setSearch}
        candidates={tr.candidates}
        candidatesLoading={tr.candidatesLoading}
        canCreate={tr.canCreate}
        canChangeStatus={tr.canChangeStatus}
        submitting={tr.submitting}
        onSubmit={tr.submit}
        onClose={tr.closeAdd}
      />
      <V2ConfirmModal
        open={Boolean(tr.untrackTarget)}
        variant="danger"
        title={t("v2.garageCases.workshop.untrack.title", {
          defaultValue: "Bỏ xe {{plate}} khỏi bảng?",
          plate,
        })}
        message={t(
          "v2.garageCases.workshop.untrack.message",
          "Xe không còn hiện trên bảng tiến độ.",
        )}
        confirmLabel={t(
          "v2.garageCases.workshop.untrack.confirm",
          "Bỏ khỏi bảng",
        )}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        onConfirm={() => {
          vm.close();
          void tr.confirmUntrack();
        }}
        onCancel={tr.cancelUntrack}
        onOpenChange={(next) => !next && tr.cancelUntrack()}
        // Mở trên drawer V2 (z-index 50+): cùng quy ước các drawer khác.
        className="z-[700]"
        overlayClassName="z-[699]"
      />
    </>
  );
}

import { Plus, RefreshCw, Wrench } from "lucide-react";
import {
  GarageWorkshopBoard,
  GarageWorkshopMobileList,
} from "@/v2/core/cases-garage";
import {
  V2Button,
  V2EmptyState,
  V2PageLayout,
  V2SearchInput,
  V2Stack,
  V2Text,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useGarageWorkshopProgress } from "../hooks/useGarageWorkshopProgress";
import { useGarageWorkshopTracking } from "../hooks/useGarageWorkshopTracking";
import { useWorkshopStatusChange } from "../hooks/useWorkshopStatusChange";
import { GarageWorkshopDialogs } from "./GarageWorkshopProgressPage.dialogs";

export type GarageWorkshopLayout = "desktop" | "mobile";

export interface GarageWorkshopProgressPageProps {
  /** External id KGara của chi nhánh đang chọn (header `x-kgara-branch-id`); thiếu thì báo chọn chi nhánh. */
  kgaraBranchId?: string;
}

const k = (key: string) => `v2.garageCases.workshop.${key}`;

/** Thân trang dùng chung trên `V2PageLayout`; desktop hiện board Kanban, mobile hiện tab status + thẻ. */
export function GarageWorkshopProgressPageBody({
  kgaraBranchId,
  layout,
}: GarageWorkshopProgressPageProps & { layout: GarageWorkshopLayout }) {
  const { t } = useV2Translation();
  const vm = useGarageWorkshopProgress(kgaraBranchId);
  const tr = useGarageWorkshopTracking(kgaraBranchId, vm.openById);
  const sc = useWorkshopStatusChange(vm.moveStatus);
  const isDesktop = layout === "desktop";

  const content = !vm.hasBranch ? (
    <V2EmptyState
      title={t(
        k("noBranch"),
        "Chọn chi nhánh có liên kết KGara để xem tiến độ xưởng.",
      )}
    />
  ) : vm.isError ? (
    <V2Text variant="body" color="destructive">
      {t(k("loadError"), "Không tải được tiến độ xưởng.")}
    </V2Text>
  ) : vm.boardEmpty ? (
    <V2EmptyState
      title={t(k("emptyBoard"), "Chưa có xe trên bảng")}
      description={t(
        k("emptyBoardHint"),
        "Bấm “Thêm xe vào bảng” để chọn xe theo biển số.",
      )}
    />
  ) : isDesktop ? (
    <V2Stack grow className="min-h-0">
      <GarageWorkshopBoard
        items={vm.items}
        now={vm.now}
        canMoveStatus={vm.canMoveStatus}
        onMoveStatus={sc.request}
        onInvalidMove={sc.invalid}
        onOpen={vm.open}
      />
    </V2Stack>
  ) : (
    <GarageWorkshopMobileList items={vm.items} now={vm.now} onOpen={vm.open} />
  );

  return (
    <V2PageLayout
      data-testid={`garage-workshop-${layout}`}
      title={t(k("title"), "Tiến độ xưởng")}
      icon={<Wrench className="h-5 w-5" />}
      desc={
        vm.isLoading
          ? t(
              k("subtitle"),
              "Theo dõi từng xe theo trạng thái và công đoạn trong ngày",
            )
          : t(k("vehicles"), {
              defaultValue: String(vm.items.length),
              count: vm.items.length,
            })
      }
      actions={
        <V2Stack className="flex-row gap-2">
          {tr.canAdd ? (
            <V2Button
              variant="primary"
              size="sm"
              className="min-h-11"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={tr.openAdd}
            >
              {t(k("addVehicle"), "Thêm xe vào bảng")}
            </V2Button>
          ) : null}
          <V2Button
            variant="outline"
            size="sm"
            className="min-h-11"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={vm.refetch}
            disabled={!vm.hasBranch}
            aria-label={t(k("refresh"), "Làm mới")}
          >
            {isDesktop ? t(k("refresh"), "Làm mới") : null}
          </V2Button>
        </V2Stack>
      }
      middleContent={
        <V2SearchInput
          value={vm.search}
          onChange={vm.setSearch}
          placeholder={t(
            k("searchPlaceholder"),
            "Tìm biển số, mã phiếu, khách, người làm",
          )}
          className={isDesktop ? "max-w-md" : "w-full"}
        />
      }
    >
      <V2Stack grow className="min-h-0 overflow-auto pb-4">
        {content}
      </V2Stack>
      <GarageWorkshopDialogs vm={vm} tr={tr} sc={sc} />
    </V2PageLayout>
  );
}

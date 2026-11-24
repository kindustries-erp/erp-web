import * as React from "react";
import {
  V2EmptyState,
  V2Stack,
  V2TabBar,
  V2TabBarVariant,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  WORKSHOP_STATUSES,
  casesOfStatus,
  type WorkshopCaseStatus,
  type WorkshopCaseView,
} from "../../workshop";
import { GarageWorkshopCard } from "./GarageWorkshopCard";

export interface GarageWorkshopMobileListProps<C extends WorkshopCaseView> {
  items: C[];
  now: Date;
  onOpen: (item: C) => void;
  /** Status mở sẵn; mặc định "Đang làm" (việc xưởng theo dõi nhiều nhất). */
  defaultStatus?: WorkshopCaseStatus;
}

/** Mobile: thanh chọn status (kèm số xe) và danh sách thẻ xe một cột; chạm thẻ để cập nhật tiến độ. */
export function GarageWorkshopMobileList<C extends WorkshopCaseView>({
  items,
  now,
  onOpen,
  defaultStatus = "IN_PROGRESS",
}: GarageWorkshopMobileListProps<C>) {
  const { t } = useV2Translation();
  const [status, setStatus] = React.useState<WorkshopCaseStatus>(defaultStatus);
  const visible = React.useMemo(
    () => casesOfStatus(items, status),
    [items, status],
  );
  const tabs = WORKSHOP_STATUSES.map((s) => ({
    key: s.key,
    label: t(s.labelKey, s.defaultLabel),
    badgeCount: items.filter((c) => c.status === s.key).length,
  }));

  return (
    <V2Stack gap="sm" data-testid="workshop-mobile-list">
      <V2TabBar
        variant={V2TabBarVariant.PILL}
        tabs={tabs}
        activeTabKey={status}
        onTabChange={(k) => setStatus(k as WorkshopCaseStatus)}
        ariaLabel={t("v2.garageCases.workshop.title", "Tiến độ xưởng")}
      />
      {visible.length ? (
        <V2Stack gap="xs" className="pb-[env(safe-area-inset-bottom)]">
          {visible.map((item) => (
            <GarageWorkshopCard
              key={item.id}
              item={item}
              now={now}
              onOpen={() => onOpen(item)}
            />
          ))}
        </V2Stack>
      ) : (
        <V2EmptyState
          title={t("v2.garageCases.workshop.emptyLane", "Không có xe")}
        />
      )}
    </V2Stack>
  );
}

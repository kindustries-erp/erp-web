import { Timer } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { clockTone, formatDuration, minutesSince } from "../../workshop";

export interface GarageWorkshopClockProps {
  /** Bắt đầu công đoạn đang mở (ISO); null thì không hiện. */
  startedAt: string | null;
  /** Thời điểm hiện tại (từ `useNowTick` của cha để mọi thẻ nhích cùng lúc). */
  now: Date;
  className?: string;
}

const TONE_CLASS = {
  normal: "text-muted-fg",
  warn: "text-warning",
  danger: "text-destructive",
} as const;

/** Thời gian đã trôi qua của công đoạn đang mở; đổi màu sau 8 giờ (cảnh báo) và 24 giờ (nghiêm trọng). */
export function GarageWorkshopClock({
  startedAt,
  now,
  className,
}: GarageWorkshopClockProps) {
  const { t } = useV2Translation();
  const minutes = minutesSince(startedAt, now);
  if (minutes === null) return null;
  const tone = clockTone(minutes);

  return (
    <V2Text
      as="span"
      variant="caption"
      weight={tone === "normal" ? "medium" : "semibold"}
      className={cn(
        "inline-flex items-center gap-1",
        TONE_CLASS[tone],
        className,
      )}
      data-testid="workshop-clock"
      data-tone={tone}
    >
      <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {t("v2.garageCases.workshop.card.stageFor", "Công đoạn đã")}{" "}
      {formatDuration(minutes, t)}
    </V2Text>
  );
}

import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2LoadingVariant,
  V2LoadingSize,
  V2LoadingTextPosition,
  type IndicatorProps,
  type V2LoadingProps,
} from "./V2Loading.type";
import { TailSpinIndicator } from "./indicators/TailSpin";
import { ThreeDotsIndicator } from "./indicators/ThreeDots";
import { PulseBarsIndicator } from "./indicators/PulseBars";
import { RippleIndicator } from "./indicators/Ripple";
import { OrbitIndicator } from "./indicators/Orbit";
import { GridIndicator } from "./indicators/Grid";
import { SupercarRoadIndicator } from "./indicators/SupercarRoad";

const VARIANT_MAP: Record<V2LoadingVariant, React.FC<IndicatorProps>> = {
  [V2LoadingVariant.SUPERCAR_ROAD]: SupercarRoadIndicator,
  [V2LoadingVariant.TAIL_SPIN]: TailSpinIndicator,
  [V2LoadingVariant.THREE_DOTS]: ThreeDotsIndicator,
  [V2LoadingVariant.PULSE_BARS]: PulseBarsIndicator,
  [V2LoadingVariant.RINGS]: RippleIndicator,
  [V2LoadingVariant.ORBIT]: OrbitIndicator,
  [V2LoadingVariant.GRID]: GridIndicator,
};

export const V2Loading = React.forwardRef<HTMLDivElement, V2LoadingProps>(
  (
    {
      variant = V2LoadingVariant.SUPERCAR_ROAD,
      size = V2LoadingSize.MD,
      color,
      text,
      textPosition = V2LoadingTextPosition.BOTTOM,
      fullscreen = false,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const IndicatorComponent =
      VARIANT_MAP[variant as V2LoadingVariant] ?? SupercarRoadIndicator;
    const computedAriaLabel =
      ariaLabel ?? (typeof text === "string" ? text : "Đang tải");

    const isHorizontal = textPosition === V2LoadingTextPosition.RIGHT;

    return (
      <div
        ref={ref}
        role="status"
        aria-label={computedAriaLabel}
        className={cn(
          "inline-flex items-center justify-center text-primary",
          isHorizontal ? "flex-row gap-3" : "flex-col gap-2.5",
          fullscreen &&
            "fixed inset-0 z-50 flex h-screen w-screen bg-background/80 backdrop-blur-sm",
          className,
        )}
        {...props}
      >
        <IndicatorComponent size={size} color={color} />
        {text && (
          <span className="text-xs font-medium text-muted-foreground select-none animate-pulse">
            {text}
          </span>
        )}
      </div>
    );
  },
);

V2Loading.displayName = "V2Loading";

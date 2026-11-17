import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Loading } from "./V2Loading";
import {
  V2LoadingVariant,
  V2LoadingSize,
  type V2LoadingVariantType,
  type V2LoadingSizeType,
} from "./V2Loading.type";

export interface V2PageFallbackProps {
  variant?: V2LoadingVariantType;
  size?: V2LoadingSizeType;
  text?: React.ReactNode;
  className?: string;
}

export const V2PageFallback: React.FC<V2PageFallbackProps> = ({
  variant = V2LoadingVariant.SUPERCAR_ROAD,
  size = V2LoadingSize.LG,
  text,
  className,
}) => {
  const { t } = useV2Translation();
  const label = text ?? t("v2.common.loadingPage", "Đang tải trang...");

  return (
    <div
      className={cn(
        "flex h-full min-h-[300px] w-full flex-1 items-center justify-center p-6 text-primary animate-in fade-in duration-200 select-none",
        className,
      )}
    >
      <V2Loading
        variant={variant}
        size={size}
        text={label}
        className="scale-105"
      />
    </div>
  );
};

V2PageFallback.displayName = "V2PageFallback";

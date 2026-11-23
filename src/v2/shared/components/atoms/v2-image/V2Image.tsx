import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ImageProps } from "./V2Image.type";

/**
 * V2Image Atom Component
 * Component hiển thị hình ảnh chuẩn hóa trong Design System V2.
 * Hỗ trợ lazy-loading, fallback tự động khi ảnh lỗi, tuân thủ a11y và không dùng thẻ img trần trong module.
 */
export const V2Image = React.forwardRef<HTMLImageElement, V2ImageProps>(
  (
    {
      src,
      alt,
      fallbackSrc,
      fallbackIcon,
      loading = "lazy",
      className,
      containerClassName,
      onError,
      ...props
    },
    ref,
  ) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      setHasError(false);
    }, [src]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true);
      onError?.(e);
    };

    if ((!src || hasError) && fallbackIcon) {
      return (
        <div
          data-testid="v2-image-fallback-icon"
          className={cn(
            "flex items-center justify-center shrink-0",
            containerClassName || className,
          )}
        >
          {fallbackIcon}
        </div>
      );
    }

    const effectiveSrc =
      hasError && fallbackSrc ? fallbackSrc : src || undefined;

    if (!effectiveSrc) {
      return null;
    }

    return (
      <img
        ref={ref}
        src={effectiveSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        data-testid="v2-image"
        className={cn(
          "inline-block shrink-0 transition-opacity duration-150",
          className,
        )}
        {...props}
      />
    );
  },
);

V2Image.displayName = "V2Image";

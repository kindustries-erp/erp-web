import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import { V2ButtonProps } from "./V2Button.type";

export const V2Button = React.forwardRef<HTMLButtonElement, V2ButtonProps>(
  (
    {
      children,
      className,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    if (asChild) {
      return (
        <Button
          ref={ref}
          asChild
          disabled={isDisabled}
          className={cn(fullWidth && "w-full", className)}
          {...props}
        >
          {children}
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          fullWidth && "w-full",
          isLoading && "cursor-wait",
          className,
        )}
        {...props}
      >
        {isLoading && (
          <Loader2
            className={cn(
              "h-3.5 w-3.5 animate-spin",
              (children || loadingText) && "mr-1.5",
            )}
            aria-hidden="true"
          />
        )}
        {!isLoading && leftIcon && (
          <span
            className={cn("inline-flex shrink-0", children && "mr-1.5")}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && rightIcon && (
          <span
            className={cn("inline-flex shrink-0", children && "ml-1.5")}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </Button>
    );
  },
);
V2Button.displayName = "V2Button";

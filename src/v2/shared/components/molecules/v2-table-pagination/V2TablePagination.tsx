import * as React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2TablePaginationDesktop } from "./V2TablePagination.desktop";
import { V2TablePaginationMobile } from "./V2TablePagination.mobile";
import {
  V2TablePaginationVariant,
  type V2TablePaginationProps,
} from "./V2TablePagination.type";

export const V2TablePagination = React.memo(function V2TablePagination(
  props: V2TablePaginationProps,
) {
  const { isMobile } = useViewport();
  const mode =
    props.variant && props.variant !== V2TablePaginationVariant.AUTO
      ? props.variant
      : isMobile
        ? V2TablePaginationVariant.MOBILE
        : V2TablePaginationVariant.DESKTOP;

  return mode === V2TablePaginationVariant.MOBILE ? (
    <V2TablePaginationMobile {...props} />
  ) : (
    <V2TablePaginationDesktop {...props} />
  );
});

import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2StandardTableDesktop } from "./desktop/V2StandardTable.desktop";
import { V2StandardTableMobile } from "./mobile/V2StandardTable.mobile";
import type { V2StandardTableProps } from "./V2StandardTable.type";

export function V2StandardTable<T>(props: V2StandardTableProps<T>) {
  const { isMobile } = useViewport();
  return isMobile ? (
    <V2StandardTableMobile {...props} />
  ) : (
    <V2StandardTableDesktop {...props} />
  );
}

import { useMemo, useSyncExternalStore } from "react";
import { subscribeV2Url } from "@/v2/shared/utils/v2Url";

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

/** Query string hiện tại, tự cập nhật khi V2 đổi URL hoặc người dùng bấm Back/Forward */
export function useV2SearchParams(): URLSearchParams {
  const search = useSyncExternalStore(
    subscribeV2Url,
    getSnapshot,
    getServerSnapshot,
  );
  return useMemo(() => new URLSearchParams(search), [search]);
}

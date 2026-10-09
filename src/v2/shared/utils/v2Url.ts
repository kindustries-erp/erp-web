/** Sự kiện phát ra mỗi khi V2 đổi query string, để các hook cùng tab nhận biết (popstate chỉ bắn khi bấm Back/Forward) */
export const V2_URL_CHANGE_EVENT = "v2:urlchange";

export type V2UrlWriteMode = "push" | "replace";

export const readV2SearchParams = (): URLSearchParams =>
  new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  );

/** Sửa query string hiện tại, giữ nguyên đường dẫn và hash. Không làm gì nếu kết quả không đổi */
export const updateV2SearchParams = (
  mutate: (params: URLSearchParams) => void,
  mode: V2UrlWriteMode = "replace",
): void => {
  if (typeof window === "undefined") return;
  const params = readV2SearchParams();
  mutate(params);
  const text = params.toString();
  const nextSearch = text ? `?${text}` : "";
  if (nextSearch === window.location.search) return;
  const url = `${window.location.pathname}${nextSearch}${window.location.hash}`;
  if (mode === "push") window.history.pushState(window.history.state, "", url);
  else window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(V2_URL_CHANGE_EVENT));
};

export const subscribeV2Url = (listener: () => void): (() => void) => {
  window.addEventListener("popstate", listener);
  window.addEventListener(V2_URL_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(V2_URL_CHANGE_EVENT, listener);
  };
};

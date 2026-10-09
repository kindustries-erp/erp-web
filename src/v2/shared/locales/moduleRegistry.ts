import { v2Vi } from "./vi";

type Dictionary = Record<string, unknown>;
type Locale = "vi" | "en";

export interface V2ModuleLocale {
  vi: Dictionary;
  en: Dictionary;
}

const registry: Record<Locale, Record<string, Dictionary>> = { vi: {}, en: {} };

/** Đi theo đường dẫn khóa trong một từ điển lồng nhau; `undefined` nếu không có */
export const walkV2Dictionary = (
  dictionary: unknown,
  parts: string[],
): unknown => {
  let current: unknown = dictionary;
  for (const part of parts) {
    if (current === null || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = (current as Dictionary)[part];
  }
  return current;
};

/**
 * Module đăng ký bộ khóa riêng dưới `v2.<namespace>.*`, ví dụ `v2.invoice.title`.
 * Không được trùng namespace của từ điển chung (`common`, `table`, `drawer`...).
 * Đăng ký lại cùng namespace sẽ ghi đè (an toàn với hot reload).
 */
export const registerV2ModuleLocale = (
  namespace: string,
  locale: V2ModuleLocale,
): void => {
  if (namespace in v2Vi.v2) {
    throw new Error(
      `V2 locale namespace "${namespace}" trùng với từ điển chung của V2`,
    );
  }
  registry.vi[namespace] = locale.vi;
  registry.en[namespace] = locale.en;
};

/** Tra khóa dạng `v2.<namespace>.<đường dẫn>` trong các bộ khóa module đã đăng ký */
export const lookupV2ModuleKey = (locale: Locale, key: string): unknown => {
  const [root, namespace, ...path] = key.split(".");
  if (root !== "v2" || !namespace || path.length === 0) return undefined;
  return walkV2Dictionary(registry[locale][namespace], path);
};

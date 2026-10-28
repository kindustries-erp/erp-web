import { registerV2ModuleLocale } from "@/v2/shared/locales";
import { traceabilityLocaleEn } from "./traceability.locale.en";
import { traceabilityLocaleVi } from "./traceability.locale.vi";

/** Nhãn sơ đồ chứng từ liên kết, đăng ký dưới namespace `v2.traceability.*` */
registerV2ModuleLocale("traceability", {
  vi: traceabilityLocaleVi,
  en: traceabilityLocaleEn,
});

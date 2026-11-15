import { registerV2ModuleLocale } from "@/v2/shared/locales";
import { loansEn } from "./locales/loans.en";
import { loansVi } from "./locales/loans.vi";

registerV2ModuleLocale("loans", {
  vi: loansVi,
  en: loansEn,
});

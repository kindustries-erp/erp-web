import { registerV2ModuleLocale } from "@/v2/shared/locales";
import { aiHubEn } from "./locales/aiHub.en";
import { aiHubVi } from "./locales/aiHub.vi";

registerV2ModuleLocale("aiHub", { vi: aiHubVi, en: aiHubEn });

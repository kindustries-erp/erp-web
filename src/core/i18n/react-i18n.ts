import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import { budgetVi } from "@/core/locale/accounting/budget/vi";
import { budgetEn } from "@/core/locale/accounting/budget/en";
import { erpInvoicesVi } from "@/core/locale/accounting/erpInvoices/vi";
import { erpInvoicesEn } from "@/core/locale/accounting/erpInvoices/en";
import { garageVi } from "@/core/locale/garage/garage/vi";
import { garageEn } from "@/core/locale/garage/garage/en";
import { vinfastPartsVi } from "@/core/locale/inventory/vinfastParts/vi";
import { vinfastPartsEn } from "@/core/locale/inventory/vinfastParts/en";
import { dashboardVi } from "@/core/locale/accounting/dashboard/vi";
import { dashboardEn } from "@/core/locale/accounting/dashboard/en";

import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";

const getLang = () => (useAppStore.getState().locale === "en" ? "en" : "vi");

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      budget: budgetVi,
      erpInvoices: erpInvoicesVi,
      garage: garageVi,
      vinfastParts: vinfastPartsVi,
      dashboard: dashboardVi,
    },
    en: {
      budget: budgetEn,
      erpInvoices: erpInvoicesEn,
      garage: garageEn,
      vinfastParts: vinfastPartsEn,
      dashboard: dashboardEn,
    },
  },
  lng: getLang(),
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

// Đồng bộ ban đầu: V1 locale là nguồn chân lý chính cho toàn bộ app
const initialV1Locale = useAppStore.getState().locale;
if (useV2LocaleStore.getState().locale !== initialV1Locale) {
  useV2LocaleStore.setState({ locale: initialV1Locale });
}

// 1. Khi useAppStore (V1) đổi locale -> đổi i18n và đồng bộ sang useV2LocaleStore
useAppStore.subscribe((state, prev) => {
  if (state.locale !== prev.locale) {
    void i18n.changeLanguage(state.locale === "en" ? "en" : "vi");
    if (useV2LocaleStore.getState().locale !== state.locale) {
      useV2LocaleStore.getState().setLocale(state.locale);
    }
  }
});

// 2. Khi useV2LocaleStore (V2) đổi locale -> đồng bộ sang useAppStore và i18n
useV2LocaleStore.subscribe((state, prev) => {
  if (state.locale !== prev.locale) {
    if (useAppStore.getState().locale !== state.locale) {
      useAppStore.getState().setLocale(state.locale);
    }
    void i18n.changeLanguage(state.locale === "en" ? "en" : "vi");
  }
});

export default i18n;

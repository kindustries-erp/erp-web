import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import { budgetVi } from "@/core/locale/accounting/budget/vi";
import { budgetEn } from "@/core/locale/accounting/budget/en";
import { erpInvoicesVi } from "@/core/locale/accounting/erpInvoices/vi";
import { erpInvoicesEn } from "@/core/locale/accounting/erpInvoices/en";
import { garageVi } from "@/core/locale/garage/garage/vi";
import { garageEn } from "@/core/locale/garage/garage/en";

const getLang = () => (useAppStore.getState().locale === "en" ? "en" : "vi");

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      budget: budgetVi,
      erpInvoices: erpInvoicesVi,
      garage: garageVi,
    },
    en: {
      budget: budgetEn,
      erpInvoices: erpInvoicesEn,
      garage: garageEn,
    },
  },
  lng: getLang(),
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

useAppStore.subscribe((state, prev) => {
  if (state.locale !== prev.locale) {
    void i18n.changeLanguage(state.locale === "en" ? "en" : "vi");
  }
});

export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { erpInvoicesVi } from "@/modules/erp-invoices-core/locales/vi";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      erpInvoices: erpInvoicesVi,
    },
  },
  lng: "vi", // Default language
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;

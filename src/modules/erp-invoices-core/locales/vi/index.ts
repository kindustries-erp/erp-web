/** Chuỗi tiếng Việt của module hóa đơn, tách theo nhóm màn hình */
import { erpInvoicesViPage } from "./page";
import { erpInvoicesViActions } from "./actions";
import { erpInvoicesViBulk } from "./bulk";
import { erpInvoicesViSettlement } from "./settlement";
import { erpInvoicesViNetoff } from "./netoff";
import { erpInvoicesViLookup } from "./lookup";
import { erpInvoicesViDrawers } from "./drawers";

export const erpInvoicesVi = {
  ...erpInvoicesViPage,
  ...erpInvoicesViActions,
  ...erpInvoicesViBulk,
  ...erpInvoicesViSettlement,
  ...erpInvoicesViNetoff,
  ...erpInvoicesViLookup,
  ...erpInvoicesViDrawers,
};

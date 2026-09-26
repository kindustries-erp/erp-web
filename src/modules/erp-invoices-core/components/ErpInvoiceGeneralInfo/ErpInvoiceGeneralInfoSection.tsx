import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import type { ErpInvoiceGeneralInfoSectionProps } from "./types";
import { ErpInvoiceGeneralInfoEdit } from "./ErpInvoiceGeneralInfoEdit";
import { ErpInvoiceGeneralInfoView } from "./ErpInvoiceGeneralInfoView";

export const ErpInvoiceGeneralInfoSection = React.memo(
  function ErpInvoiceGeneralInfoSection(
    props: ErpInvoiceGeneralInfoSectionProps,
  ) {
    const {
      invoice,
      form,
      editMode = false,
      direction = "IN",
      invoiceId,
    } = props;

    const effectiveDirection = direction || invoice?.direction || "IN";
    const isInvoiceIn = effectiveDirection === "IN";

    const { data: branchOptions = [] } = useQuery({
      queryKey: ["branches-options"],
      queryFn: getBranchOptionsApi,
      staleTime: 5 * 60 * 1000,
    });

    const partnerName = (
      isInvoiceIn
        ? invoice?.sellerName || form?.sellerName
        : invoice?.buyerName ||
          form?.buyerName ||
          (invoice as any)?.buyerPersonalName
    )?.trim();

    const partnerTaxCode = (
      isInvoiceIn
        ? invoice?.sellerTaxCode || form?.sellerTaxCode
        : invoice?.buyerTaxCode ||
          form?.buyerTaxCode ||
          invoice?.buyerCccd ||
          (invoice as any)?.buyerPersonalTaxCode
    )?.trim();

    const branchId =
      form?.branchId || invoice?.branchId || (invoice as any)?.branch?.id || "";
    const branchObj = (invoice as any)?.branch;
    const matchedOption = branchOptions.find((o) => o.value === branchId);

    const branchLabel = useMemo(() => {
      if (branchObj?.name) return branchObj.name;
      if (branchObj?.branchName) return branchObj.branchName;
      if (matchedOption?.label) {
        return matchedOption.label.split(" — ")[1] || matchedOption.label;
      }
      if (branchId && !branchId.includes("-")) {
        return branchId;
      }
      return "—";
    }, [branchObj, matchedOption, branchId]);

    const invoiceDate = invoice?.invoiceDate || form?.invoiceDate || "";
    const serialNo = invoice?.serialNo || form?.serialNo || "";
    const invoiceNo = invoice?.invoiceNo || form?.invoiceNo || "";
    const notes = (
      form?.notes ||
      form?.description ||
      invoice?.description ||
      invoice?.notes ||
      ""
    )?.trim();
    const effectiveInvoiceId = invoiceId ?? invoice?.id ?? null;

    if (editMode) {
      return (
        <ErpInvoiceGeneralInfoEdit
          {...props}
          partnerName={partnerName}
          partnerTaxCode={partnerTaxCode}
          branchOptions={branchOptions}
          effectiveInvoiceId={effectiveInvoiceId}
          effectiveDirection={effectiveDirection}
          invoiceNo={invoiceNo}
        />
      );
    }

    return (
      <ErpInvoiceGeneralInfoView
        {...props}
        partnerName={partnerName}
        partnerTaxCode={partnerTaxCode}
        branchLabel={branchLabel}
        invoiceDate={invoiceDate}
        serialNo={serialNo}
        invoiceNo={invoiceNo}
        notes={notes}
        effectiveInvoiceId={effectiveInvoiceId}
        effectiveDirection={effectiveDirection}
      />
    );
  },
);

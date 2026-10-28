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

    const branchIds: string[] = (form?.branchIds as string[] | undefined)
      ?.length
      ? (form?.branchIds as string[])
      : invoice?.branchIds?.length
        ? invoice.branchIds
        : [
            form?.branchId ||
              invoice?.branchId ||
              (invoice as any)?.branch?.id ||
              "",
          ].filter(Boolean);

    const branchLabel = useMemo(() => {
      if (branchIds.length === 0) return "—";
      const names = branchIds.map((id) => {
        const option = branchOptions.find((o) => o.value === id);
        if (option?.label) return option.label.split(" — ")[1] || option.label;
        return id;
      });
      return names.join(", ");
    }, [branchIds, branchOptions]);

    const invoiceDate = invoice?.invoiceDate || form?.invoiceDate || "";
    const serialNo = invoice?.serialNo || form?.serialNo || "";
    const invoiceNo = invoice?.invoiceNo || form?.invoiceNo || "";
    // Ghi chú = trường notes (bulk-edit và form). Không lấy description (diễn giải/tên hàng).
    const notes = (form?.notes ?? invoice?.notes ?? "").trim();
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

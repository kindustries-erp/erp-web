import { useState, useEffect, useMemo } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { garageApi } from "@/modules/garage/api/garageApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import {
  useCreateGarageCashflow,
  useUpdateGarageCashflow,
} from "@/modules/garage/hooks/useGarageCashflowQuery";
import type {
  GarageCashflowFormDrawerProps,
  GarageCashflowFormData,
  CaseOptionItem,
  BankTxnOptionItem,
} from "./GarageCashflowFormDrawer.type";

const DEFAULT_FORM: GarageCashflowFormData = {
  settlementType: "RECEIPT",
  amount: 0,
  paymentMethod: "BANK_TRANSFER",
  transDate: new Date().toISOString().split("T")[0],
  partnerName: "",
  receiptNumber: "",
  note: "",
};

export function useGarageCashflowFormDrawer(
  props: GarageCashflowFormDrawerProps,
) {
  const {
    open,
    onClose,
    mode = "create",
    initialData,
    fixedCaseId,
    suggestedAmount,
    defaultType,
    onSuccess,
  } = props;

  const [formData, setFormData] =
    useState<GarageCashflowFormData>(DEFAULT_FORM);
  const queryClient = useQueryClient();

  const createMutation = useCreateGarageCashflow();
  const updateMutation = useUpdateGarageCashflow();

  // Reset form khi drawer mở
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setFormData({
        id: initialData.id,
        settlementType: initialData.settlementType,
        amount: Number(initialData.amount || 0),
        paymentMethod: initialData.paymentMethod || "BANK_TRANSFER",
        transDate: initialData.transDate
          ? String(initialData.transDate).split("T")[0]
          : new Date().toISOString().split("T")[0],
        partnerName: initialData.partnerName || "",
        receiptNumber: initialData.receiptNumber || "",
        bankTransactionId: initialData.bankTransactionId || undefined,
        caseId: initialData.caseId || fixedCaseId || undefined,
        note: initialData.note || "",
      });
    } else {
      setFormData({
        ...DEFAULT_FORM,
        settlementType: defaultType || "RECEIPT",
        amount: suggestedAmount || 0,
        caseId: fixedCaseId || undefined,
        transDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [open, initialData, fixedCaseId, suggestedAmount, defaultType]);

  // Load danh sách Phiếu Dịch Vụ khi drawer mở
  const { data: casesData } = useQuery({
    queryKey: ["garage-cashflow-cases-options"],
    queryFn: async () => {
      const res = await garageApi.getCases("", 1, 60, "");
      return res?.data?.items || res?.items || res?.data || [];
    },
    enabled: open,
    staleTime: 60 * 1000,
  });

  // Load danh sách Sao Kê Ngân Hàng gần đây
  const { data: bankData } = useQuery({
    queryKey: ["garage-cashflow-bank-options"],
    queryFn: async () => {
      const res = await bankStatementApi.getTransactions({
        page: 1,
        pageSize: 40,
      });
      return res?.items || res?.data?.items || res?.data || [];
    },
    enabled: open,
    staleTime: 60 * 1000,
  });

  const caseOptions = useMemo<CaseOptionItem[]>(() => {
    if (!Array.isArray(casesData)) return [];
    return casesData.map((c: any) => ({
      id: c.id,
      soChungTu: c.soChungTu || c.code || "---",
      bienSoXe: c.bienSoXe || c.licensePlate,
      tenKhachHang: c.khachHangName || c.customerName,
      tienCoThue: Number(c.tienCoThue || c.totalAmount || 0),
      tienDaThanhToan: Number(c.tienDaThanhToan || c.paidAmount || 0),
      tienConPhaiThanhToan: Number(
        c.tienConPhaiThanhToan || c.remainingAmount || 0,
      ),
    }));
  }, [casesData]);

  const bankTxnOptions = useMemo<BankTxnOptionItem[]>(() => {
    if (!Array.isArray(bankData)) return [];
    return bankData.map((b: any) => ({
      id: b.id,
      transDate: b.transDate ? String(b.transDate).split("T")[0] : "",
      amount: Number(b.creditAmount || b.debitAmount || b.amount || 0),
      description: b.description || b.content || "",
      correspondentName: b.correspondentName || "",
    }));
  }, [bankData]);

  const selectedCase = useMemo(() => {
    const targetId = formData.caseId || fixedCaseId;
    return caseOptions.find((c) => c.id === targetId);
  }, [caseOptions, formData.caseId, fixedCaseId]);

  const selectedBankTxn = useMemo(() => {
    return bankTxnOptions.find((b) => b.id === formData.bankTransactionId);
  }, [bankTxnOptions, formData.bankTransactionId]);

  const handleChange = (field: keyof GarageCashflowFormData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!formData.amount || formData.amount <= 0) return;

    if (mode === "edit" && formData.id) {
      await updateMutation.mutateAsync({
        id: formData.id,
        payload: {
          settlementType: formData.settlementType,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          transDate: formData.transDate,
          partnerName: formData.partnerName,
          receiptNumber: formData.receiptNumber,
          bankTransactionId: formData.bankTransactionId,
          caseId: formData.caseId,
          note: formData.note,
        },
      });
    } else {
      await createMutation.mutateAsync({
        caseId: formData.caseId,
        settlementType: formData.settlementType,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        transDate: formData.transDate,
        partnerName: formData.partnerName,
        receiptNumber: formData.receiptNumber,
        bankTransactionId: formData.bankTransactionId,
        note: formData.note,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["garage-cashflow"] });
    queryClient.invalidateQueries({ queryKey: ["garage-cases"] });
    onSuccess?.();
    onClose();
  };

  return {
    formData,
    handleChange,
    caseOptions,
    bankTxnOptions,
    selectedCase,
    selectedBankTxn,
    isSubmitting,
    handleSubmit,
    isReadOnly: mode === "view",
  };
}

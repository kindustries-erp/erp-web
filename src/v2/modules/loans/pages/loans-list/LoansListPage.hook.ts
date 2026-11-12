import { useState } from "react";
import { useV2ModuleTabState } from "@/v2/shared/hooks/useV2ModuleTabState";
import { useLoansListQuery, type LoansQueryParams } from "../../api";
import { LoanItem, LoanStatus } from "@/v2/core/loans";

const LOAN_TAB_KEYS = ["simulator", "projection", "list"];

export function useLoansListPage() {
  const { activeTab, setActiveTab } = useV2ModuleTabState({
    tabKeys: LOAN_TAB_KEYS,
    defaultTab: "simulator",
  });
  const [queryParams, setQueryParams] = useState<LoansQueryParams>({
    page: 1,
    pageSize: 20,
    search: "",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanItem | null>(null);
  const [detailLoanId, setDetailLoanId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [paymentModalLoan, setPaymentModalLoan] = useState<LoanItem | null>(
    null,
  );

  const listQuery = useLoansListQuery(queryParams);

  const loans = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;

  const handleCreate = () => {
    setEditingLoan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (loan: LoanItem) => {
    setEditingLoan(loan);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setDetailLoanId(id);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setDetailLoanId(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLoan(null);
  };

  const handleOpenPaymentModal = (loan: LoanItem) => {
    setPaymentModalLoan(loan);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalLoan(null);
  };

  const handleSearchChange = (search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilterChange = (status?: LoanStatus) => {
    setQueryParams((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page,
      pageSize: pageSize ?? prev.pageSize,
    }));
  };

  return {
    activeTab,
    setActiveTab,
    queryParams,
    loans,
    total,
    isLoading: listQuery.isLoading,
    isFormOpen,
    editingLoan,
    detailLoanId,
    isDetailOpen,
    paymentModalLoan,
    handleCreate,
    handleEdit,
    handleOpenDetail,
    handleCloseDetail,
    handleCloseForm,
    handleOpenPaymentModal,
    handleClosePaymentModal,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageChange,
  };
}

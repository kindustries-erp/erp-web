import { useState } from "react";
import { useLoansListQuery, type LoansQueryParams } from "../../api";
import { LoanItem, LoanStatus } from "@/v2/core/loans";

export function useLoansListPage() {
  const [activeTab, setActiveTab] = useState<
    "simulator" | "projection" | "list"
  >("simulator");
  const [queryParams, setQueryParams] = useState<LoansQueryParams>({
    page: 1,
    pageSize: 20,
    search: "",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanItem | null>(null);
  const [detailLoanId, setDetailLoanId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    handleCreate,
    handleEdit,
    handleOpenDetail,
    handleCloseDetail,
    handleCloseForm,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageChange,
  };
}

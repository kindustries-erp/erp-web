export const budgetEn = {
  pageTitle: "Operating Expenses",
  pageDesc:
    "Manage company-wide operating expenses, recurring items, and cashflow forecast",
  colIndex: "#",
  colPeriod: "Period",
  colCostGroup: "Cost Group",
  colCategoryKey: "Expense Category",
  colDocNo: "Expense No",
  colTitle: "Description",
  colCategory: "Category",
  colType: "Type",
  colCycle: "Cycle",
  colRecurrenceUntil: "End Period",
  colDocDate: "Expense Date",
  colNextDueDate: "Due Date",
  colAmount: "Amount",
  colPaymentStatus: "Payment",
  colStatus: "Status",
  colNotes: "Notes",
  colSupplier: "Supplier / Partner",

  // Toolbar Tabs
  tabs: {
    all: "All",
    opex: "OPEX",
    cogs: "COGS",
    commission: "Commission",
  },

  // Cost Groups
  costGroups: {
    OPEX: "OPEX",
    COGS: "COGS",
    COMMISSION: "Commission",
  },

  // Categories
  categories: {
    NHAN_SU_LUONG: "HR & Salaries",
    THUE_MAT_BANG: "Office / Premises Rent",
    DIEN_NUOC_NET: "Utilities & Telecom",
    DUNG_CU_VP: "Office Supplies",
    PHAN_MEM_IT: "Software, Server & IT",
    BAO_TRI: "Maintenance & Repairs",
    KHAU_HAO: "Asset Depreciation",
    CONG_TAC_PHI: "Travel & Entertainment",
    KHAC: "Other Operating Expenses",
    THAU_PHU_GIA_CONG: "Outsourcing & Subcontracting",
    VAN_CHUYEN_LOGISTICS: "Freight & Logistics",
    CHI_PHI_TRUC_TIEP_KHAC: "Other Direct Costs",
    HOA_HONG_KINH_DOANH: "Sales Commission",
    MARKETING_QC: "Marketing & Ads",
    CHIET_KHAU_TM: "Commercial Discount",
    HOA_HONG_KHAC: "Other Commission & Bonus",
  },

  // Drawer
  drawer: {
    createTitle: "Add Operating Expense",
    viewTitle: "Operating Expense Details",
    editTitle: "Edit Operating Expense",
    duplicateTitle: "Duplicate Expense",
    sectionInfo: "Expense Information",
    periodMonth: "Month",
    periodYear: "Year",
    costGroupLabel: "Cost Group (*)",
    selectCostGroup: "— Select Cost Group —",
    categoryKeyLabel: "Detailed Category (*)",
    selectCategory: "— Select Category —",
    titleLabel: "Description (*)",
    titlePlaceholder: "Enter detailed expense description...",
    amountLabel: "Amount (VND) (*)",
    paymentStatusLabel: "Payment Status",
    notesLabel: "Notes",
    notesPlaceholder: "Additional notes if any...",
    sectionRecurring: "Recurring Expense",
    enableRecurring: "Repeat monthly",
    enableRecurringDesc:
      "Automatically generate and sync amount for future months",
    recurringConfigHeader: "Recurrence Configuration",
    recurrenceType: "Recurrence Cycle",
    untilMonth: "Apply Until Month",
    untilYear: "End Year",
  },

  // Recurring Modal
  recurringModal: {
    title: "Apply Recurring Changes",
    desc: "This expense belongs to a monthly recurring series. Please select the scope of your changes:",
    scopeThis: "Only this month's record",
    scopeThisDesc:
      "Only change the current month's record. Other months remain unchanged.",
    scopeThisAndFuture: "This and all future records",
    scopeThisAndFutureDesc:
      "Update from {{from}} to {{to}} (total of {{count}} recurring periods).",
    category: "Expense",
    newAmount: "New Amount",
    confirmApply: "Confirm Apply",
  },

  // Actions
  actionView: "View details",
  actionEdit: "Edit",
  actionDuplicate: "Duplicate",
  actionDelete: "Delete",
  actionAdd: "Add",
  actionSave: "Save changes",
  actionCancel: "Cancel",
  close: "Close",
  saving: "Saving...",
  createExpense: "Add Expense",

  // Alerts & Messages
  deleteSuccess: "Expense deleted successfully",
  deleteError: "Failed to delete expense",
  createSuccess: "Operating expense created successfully",
  createRecurringSuccess:
    "Created expense with recurring series until {{month}}/{{year}}",
  updateSuccess: "Operating expense updated successfully",
  applyScopeThisSuccess: "Updated expense for current period",
  applyScopeFutureSuccess:
    "Updated recurring expense series ({{count}} periods)",
  invalidAmount: "Amount must be a valid number greater than or equal to 0",
  missingTitle: "Please enter a valid expense description",

  confirmDeleteTitle: "Confirm Delete Expense",
  confirmDeleteDesc:
    "Are you sure you want to delete this expense? This action cannot be undone.",

  emptyList: "No operating expenses found.",
  emptyListHint: "Click 'Add Expense' to create a new operating expense.",

  cycleOneTime: "One-time",
  cycleMonthly: "Monthly",
  cycleQuarterly: "Quarterly",
  cycleYearly: "Yearly",

  statusDraft: "Draft",
  statusConfirmed: "Confirmed",
  statusCancelled: "Cancelled",

  paymentUnpaid: "Unpaid",
  paymentPartial: "Partial",
  paymentPaid: "Paid",

  allPayment: "All Payment Statuses",
  allCycle: "All Cycles",
  monthLabel: "Month",
  yearLabel: "Year",
  countSuffix: "expenses",
  summaryTotal: "Total",

  // Action Groups
  groupTraCuu: "SEARCH",
  groupThaoTac: "ACTIONS",
};

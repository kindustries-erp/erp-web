export const accountsEn = {
  title: "Chart of Accounts",
  description: "Accounting chart of accounts and hierarchy management",
  code: "Account Code",
  name: "Account Name",
  type: "Account Type",
  parent: "Parent Account",
  status: "Status",
  index: "#",
  createdAt: "Created At",

  // Types
  asset: "Asset",
  liability: "Liability",
  equity: "Equity",
  revenue: "Revenue",
  expense: "Expense",
  other: "Other",
  ASSET: "Asset",
  LIABILITY: "Liability",
  EQUITY: "Equity",
  REVENUE: "Revenue",
  EXPENSE: "Expense",
  OTHER: "Other",

  // Status
  active: "Active",
  inactive: "Inactive",

  // Table & Filters
  searchPlaceholder: "Search by account code or name...",
  typePlaceholder: "Filter by account type",
  statusPlaceholder: "Filter by status",
  allTypes: "All Types",
  allStatuses: "All Statuses",
  noData: "No accounts found",
  noDataDesc: "Try adjusting your search filters or add a new account",

  // Actions
  actions: {
    create: "Add New Account",
    edit: "Edit",
    delete: "Delete Account",
    viewDetail: "Detail",
  },

  // Drawer
  drawer: {
    titleCreate: "Add New Accounting Account",
    titleEdit: "Edit Accounting Account",
    titleView: "Account Detail: {code}",
    subtitle: "Accounting account detailed information",
    sectionGeneral: "Basic Information",
    sectionSettings: "Status & Settings",
    codeLabel: "Account Code",
    codePlaceholder: "E.g. 1111, 1121...",
    nameLabel: "Account Name",
    namePlaceholder: "E.g. Cash in VND...",
    typeLabel: "Account Type",
    typePlaceholder: "Select account type...",
    parentLabel: "Parent Account",
    parentPlaceholder: "Select parent account (if any)...",
    parentNone: "None (Root Level 1 Account)",
    statusLabel: "Status",
    statusActive: "Active",
    statusInactive: "Inactive",
    codeRequired: "Account code is required",
    nameRequired: "Account name is required",
    typeRequired: "Account type is required",
  },

  // Toasts & Dialogs
  toast: {
    createSuccess: "Account created successfully",
    updateSuccess: "Account updated successfully",
    deleteSuccess: "Account deleted successfully",
    saveError: "Failed to save account",
    deleteError: "Failed to delete account",
  },
  confirm: {
    deleteTitle: "Confirm Delete Account",
    deleteMessage:
      'Are you sure you want to delete account "{code} - {name}"? This action cannot be undone.',
    deleteConfirm: "Delete Account",
    deleteCancel: "Cancel",
  },
};

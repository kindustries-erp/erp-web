# Remove Dead UI Tables and Orphaned Pages

## Context
Identified dead UI code that was no longer rendered or imported, specifically `TxTable` and several orphaned pages (`GeneralJournal`, `Departments`, `PartnerLedgerPage`).

## Execution
- Deleted `src/shared/components/TxTable.tsx`
- Deleted `src/pages/GeneralJournal.tsx`
- Deleted `src/pages/Departments.tsx`
- Deleted `src/modules/finance/components/PartnerLedgerPage/`
- Verified builds and linting.

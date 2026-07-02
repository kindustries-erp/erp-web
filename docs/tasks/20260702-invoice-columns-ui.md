# Update Invoice Column UI

## Changes
- Extracted XML and PDF attachment icons from `invoiceNo` column into a separate `attachments` column for better visibility.
- Implemented global "Khôi phục độ rộng" button on `StandardTable.tsx`'s actions header to reset column sizes without reloading the page.
- Added visual styling (`bg-blue-50/50`, `border-l border-blue-200`) to internal ERP data columns (`netOffAmount`, `remainingAmount`) in `ErpInvoicesTab` to distinguish them from tax-synced data.

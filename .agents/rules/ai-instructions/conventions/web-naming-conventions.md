# Web Naming Conventions (ERP Web)

## Files

- Page: `ErpInvoicePage.tsx`, `SettingsBranch.tsx`
- API client: `<domain>Api.ts` hoặc `<domain>CoreApi.ts`
- Hook: `use<Domain>List`, `use<Domain>Form`, `use<Domain>Page`
- Types: `<domain>.ts`
- Component: `<Domain>ListTable`, `<Domain>Drawer`

## Hooks

- Query hook: `useErpInvoicesList`
- Form hook: `useErpInvoiceForm`
- Page orchestration hook: `usePurchaseOrderPage`
- Tránh tên mơ hồ như `useData`, `useStuff`

## Components

- Generic UI ở `src/shared/components/*`
- Domain component ở `src/modules/<domain>/components/*`
- Tên phải phản ánh role: `ListTable`, `Drawer`, `Filters`, `Kpis`, `UploadModal`

## Query / API naming

- API methods: `list`, `detail`, `create`, `update`, `remove`, `importXml`
- Query key nên bám domain + intent

## Notes

- Dùng tên đã tồn tại rộng trong repo trước khi invent tên mới.

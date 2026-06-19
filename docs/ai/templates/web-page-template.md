# Web Page Template (ERP Web)

## Khi dùng

Dùng khi thêm page mới trong `src/pages/*`.

## Page responsibility

Page chỉ orchestration:

- `<PageLayout>`
- query hooks
- action wiring
- render domain components

Không nhồi business-heavy transform, submit mapping dài, hoặc domain text generic vào page.

## Shape tối thiểu

```text
src/pages/ErpExamplePage.tsx
src/modules/example/api/exampleApi.ts
src/modules/example/hooks/useExamplePage.ts
src/modules/example/components/ExampleListTable.tsx
src/modules/example/components/ExampleDrawer.tsx
src/modules/example/types/example.ts
```

## Checklist

1. Tạo task file trước
2. Xác nhận DB/API prerequisite
3. Tạo API client / types / query hook
4. Tạo domain components
5. Page dùng `<PageLayout>` làm root wrapper
6. Route wiring + permission note rõ
7. Chạy `bun run lint:check`
8. Chạy `bunx tsc --noEmit`
9. Chạy `bun run test`
10. Chạy `bun run build`

## Mẫu page tối thiểu

```tsx
export function ErpExamplePage() {
  const page = useExamplePage();

  return (
    <PageLayout title="Example">
      <ExampleListTable items={page.items} />
    </PageLayout>
  );
}
```

## Anti-patterns

- Page vừa fetch vừa map business sâu vừa submit mutation inline
- Shared component chứa label/logic quá domain-specific
- Tạo page mới mà không note route/permission impact

# Web Domain Module Template

## Khi dùng
Dùng khi tạo domain mới trong `src/modules/<domain>/...`.

## Folder shape tối thiểu
```text
src/modules/<domain>/
  api/
    <domain>Api.ts
  hooks/
    use<Domain>List.ts
  components/
    <Domain>ListTable.tsx
  types/
    <domain>.ts
```

## Boundary chuẩn
- `api/`: request/response contract
- `hooks/`: query/mutation + orchestration nhẹ
- `components/`: domain UI
- `types/`: local domain types/options
- `utils/`: pure transform/helper khi bắt đầu lặp lại

## Decision rules
- Nếu logic generic thật: cân nhắc `src/shared/*`
- Nếu text/flow bám ERP domain: giữ ở `src/modules/<domain>/*`
- Nếu hook quá lớn: tách query hook và interaction hook

## Checklist
1. Xác nhận API contract
2. Thêm types trước
3. Thêm api client
4. Thêm hooks
5. Thêm components
6. Page chỉ compose, không copy business logic vào `src/pages/*`

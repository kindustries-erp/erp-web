# API: GET /auth/profile

Trả về toàn bộ thông tin của user đang đăng nhập trong một lần gọi duy nhất: profile, thông tin nhân viên, quyền theo role, quyền tùy chỉnh riêng, và bảng quyền tổng hợp hiệu lực.

## Endpoint

```
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

## Response Structure

```json
{
  "profile": { ... },
  "employee": { ... },
  "rolePermissions": [ ... ],
  "customPermissions": [ ... ],
  "effectivePermissions": [ ... ]
}
```

---

## Các field chi tiết

### `profile`

Thông tin cơ bản của Directus user đang đăng nhập.

```json
{
  "profile": {
    "id": "uuid-directus-user",
    "email": "user@example.com",
    "first_name": "Nguyen",
    "last_name": "Van A",
    "role": {
      "id": "uuid-role",
      "name": "Kế toán",
      "icon": "supervised_user_circle",
      "description": "Nhóm kế toán nội bộ"
    }
  }
}
```

| Field | Type | Mô tả |
|---|---|---|
| `id` | `string` | Directus user UUID |
| `email` | `string` | Email đăng nhập |
| `first_name` | `string` | Họ |
| `last_name` | `string` | Tên |
| `role` | `object \| null` | Thông tin Role được gán. `null` nếu user chưa có role |
| `role.id` | `string` | UUID của Role |
| `role.name` | `string` | Tên Role |
| `role.icon` | `string` | Icon Material |
| `role.description` | `string \| null` | Mô tả Role |

---

### `employee`

Bản ghi nhân viên (`gw_employees`) tương ứng với user, kèm department và position đã expand.

```json
{
  "employee": {
    "id": "uuid-employee",
    "full_name": "Nguyen Van A",
    "phone": "0901234567",
    "directus_user_id": "uuid-directus-user",
    "department_id": {
      "id": "uuid-dept",
      "name": "Phòng Kế toán"
    },
    "position_id": {
      "id": "uuid-pos",
      "name": "Kế toán viên"
    }
  }
}
```

> `null` nếu user chưa được liên kết với bản ghi nhân viên nào.

---

### `rolePermissions`

Danh sách quyền được định nghĩa **cho Role** của user, group theo collection.

```json
{
  "rolePermissions": [
    {
      "collection": "gw_employees",
      "actions": ["read", "create"],
      "details": [
        {
          "action": "read",
          "fields": ["*"],
          "permissions": null,
          "validation": null
        },
        {
          "action": "create",
          "fields": ["full_name", "phone", "department_id"],
          "permissions": null,
          "validation": null
        }
      ]
    }
  ]
}
```

| Field | Type | Mô tả |
|---|---|---|
| `collection` | `string` | Tên collection trong Directus |
| `actions` | `string[]` | Danh sách các action được phép: `read`, `create`, `update`, `delete`, `share` |
| `details[].action` | `string` | Tên action |
| `details[].fields` | `string[] \| null` | Các field được phép truy cập. `["*"]` = tất cả |
| `details[].permissions` | `object \| null` | Row-level filter (Directus permission filter) |
| `details[].validation` | `object \| null` | Validation rule khi write |

> Mảng rỗng `[]` nếu Role chưa được cấu hình Policy hoặc user không có Role.

---

### `customPermissions`

Danh sách quyền được gán **riêng cho cá nhân user** (không phụ thuộc Role), group theo collection. Cấu trúc giống hệt `rolePermissions`.

```json
{
  "customPermissions": [
    {
      "collection": "gw_payment_vouchers",
      "actions": ["read", "update"],
      "details": [
        {
          "action": "read",
          "fields": ["*"],
          "permissions": null,
          "validation": null
        },
        {
          "action": "update",
          "fields": ["status"],
          "permissions": null,
          "validation": null
        }
      ]
    }
  ]
}
```

> Mảng rỗng `[]` nếu user chưa được gán Custom Policy.

---

### `effectivePermissions`

**Bảng quyền tổng hợp hiệu lực**, là kết quả merge của `rolePermissions` và `customPermissions`. Đây là field frontend nên dùng để kiểm tra quyền thực tế của user.

```json
{
  "effectivePermissions": [
    {
      "collection": "gw_employees",
      "actions": ["read", "create", "update"],
      "details": [
        {
          "action": "read",
          "fields": ["*"],
          "permissions": null,
          "validation": null,
          "source": "role"
        },
        {
          "action": "create",
          "fields": ["full_name", "phone"],
          "permissions": null,
          "validation": null,
          "source": "role"
        },
        {
          "action": "update",
          "fields": ["phone"],
          "permissions": null,
          "validation": null,
          "source": "custom"
        }
      ]
    }
  ]
}
```

| Field | Type | Mô tả |
|---|---|---|
| `collection` | `string` | Tên collection |
| `actions` | `string[]` | Tất cả actions hiệu lực trên collection này |
| `details[].source` | `"role" \| "custom"` | Nguồn gốc của quyền này |

#### Luật merge

| Tình huống | Kết quả |
|---|---|
| Role có `read`, custom không có `read` | Giữ `read` từ role (`source: "role"`) |
| Role không có `update`, custom có `update` | Thêm `update` từ custom (`source: "custom"`) |
| Role có `read` với `fields: ["*"]`, custom có `read` với `fields: ["name"]` | **Custom thắng** — `read` với `fields: ["name"]`, `source: "custom"` |
| Role có `read`, custom có `write` (cùng collection) | Giữ **cả hai** — user có đủ `read` và `write` |

> Nguyên tắc: key merge là `collection + action`. Cùng key → custom override role. Khác key → cộng dồn.

---

## Ví dụ sử dụng ở Frontend

```typescript
const { effectivePermissions } = await getProfileApi();

// Kiểm tra nhanh user có quyền read gw_employees không
const empPerms = effectivePermissions.find(p => p.collection === 'gw_employees');
const canRead   = empPerms?.actions.includes('read')   ?? false;
const canCreate = empPerms?.actions.includes('create') ?? false;

// Lấy fields được phép cho action cụ thể
const updateDetail = empPerms?.details.find(d => d.action === 'update');
const allowedFields = updateDetail?.fields ?? [];
```

---

## Error Responses

| HTTP | Mô tả |
|---|---|
| `401 Unauthorized` | Thiếu hoặc sai `access_token` |
| `500 Internal Server Error` | Lỗi kết nối Directus |

---

## Ghi chú kỹ thuật

- **Employee data** được fetch bằng `userToken` — Directus tự enforce row-level permission.
- **Role info, Role permissions, Custom permissions** được fetch bằng `DIRECTUS_ADMIN_TOKEN` — vì user thông thường không có quyền đọc `/roles`, `/access`, `/permissions`.
- Role info và Role access record được fetch **song song** (`Promise.all`) để tối ưu latency.
- Nếu bất kỳ bước phụ nào lỗi (employee, role, custom perms), endpoint vẫn trả về thành công với field tương ứng là `null` hoặc `[]`.

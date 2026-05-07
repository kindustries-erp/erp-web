# Hệ thống ERP

Ứng dụng quản trị doanh nghiệp xây dựng bằng React 18 + TypeScript + Vite + Tailwind CSS.

---

## Khuyến nghị

> **Nên chạy app bằng Docker (Cách 3) cho môi trường production.** Docker đảm bảo môi trường nhất quán, không phụ thuộc vào Node.js cài trên máy, và phục vụ bản build tối ưu qua nginx.

---

## Cấu hình biến môi trường

Trước khi chạy app ở bất kỳ cách nào, tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Sau đó mở `.env` và điền các giá trị phù hợp (xem chú thích trong `.env.example`).

> File `.env` **không được** commit lên git. Chỉ commit `.env.example`.

---

## Yêu cầu

| Công cụ                 | Phiên bản tối thiểu    |
| ----------------------- | ---------------------- |
| Node.js                 | 18+                    |
| npm                     | 9+                     |
| Docker & Docker Compose | (nếu chạy bằng Docker) |

---

## Cách 1 — Chạy môi trường dev (local)

```bash
# 1. Tạo file .env
cp .env.example .env

# 2. Cài dependencies
npm install

# 3. Khởi động dev server
npm run dev
```

Truy cập tại: **http://localhost:5173**

---

## Cách 2 — Build và preview (production)

```bash
# 1. Tạo file .env
cp .env.example .env

# 2. Cài dependencies
npm install

# 3. Build
npm run build

# 4. Preview bản build
npm run preview
```

Truy cập tại: **http://localhost:4173**

---

## Cách 3 — Chạy bằng Docker ✅ Khuyến nghị

```bash
# 1. Tạo file .env
cp .env.example .env

# 2. Build image và khởi động container
docker compose up --build -d
```

Truy cập tại: **http://localhost:88080**

Dừng container:

```bash
docker compose down
```

---

## Cấu trúc thư mục chính

```
src/
  components/    # UI components dùng chung (Sidebar, Topbar, TabBar, ...)
  pages/         # Các trang chính (Dashboard, TienMat, TienGui, ...)
  store/         # Zustand stores (appStore, transactionStore, ...)
  lib/           # Tiện ích (i18n, chart setup, utils)
  types/         # TypeScript types
```

| Công cụ                 | Phiên bản tối thiểu    |
| ----------------------- | ---------------------- |
| Node.js                 | 18+                    |
| npm                     | 9+                     |
| Docker & Docker Compose | (nếu chạy bằng Docker) |

---

## Cách 1 — Chạy môi trường dev (local)

```bash
# 1. Cài dependencies
npm install

# 2. Khởi động dev server
npm run dev
```

Truy cập tại: **http://localhost:5173**

---

## Cách 2 — Build và preview (production)

```bash
# 1. Cài dependencies
npm install

# 2. Build
npm run build

# 3. Preview bản build
npm run preview
```

Truy cập tại: **http://localhost:4173**

---

## Cách 3 — Chạy bằng Docker

```bash
# Build image và khởi động container
docker compose up --build -d
```

Truy cập tại: **http://localhost:88080**

Dừng container:

```bash
docker compose down
```

---

## Cấu trúc thư mục chính

```
src/
  components/    # UI components dùng chung (Sidebar, Topbar, TabBar, ...)
  pages/         # Các trang chính (Dashboard, TienMat, TienGui, ...)
  store/         # Zustand stores (appStore, transactionStore, ...)
  lib/           # Tiện ích (i18n, chart setup, utils)
  types/         # TypeScript types
```

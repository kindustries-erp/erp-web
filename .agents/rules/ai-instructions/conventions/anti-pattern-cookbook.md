# Anti-Pattern Cookbook

## Frontend

### 1. Fat page

Page chứa fetch, mapping business, mutation payload shaping, và render detail nặng cùng một chỗ.

**Fix:** tách hook + domain components.

### 2. Shared component bị nhiễm domain

Component generic trong `src/shared/*` nhưng chứa label/flow ERP-specific.

**Fix:** chuyển về `src/modules/<domain>/*`.

### 3. Duplicate API client / hook

Tạo API client hoặc hook mới mà domain đã có thứ tương đương.

**Fix:** reuse-first, chỉ tạo mới nếu boundary khác thật.

### 4. Route wiring không được ghi nhận

Có page mới nhưng task không ghi route key, permission, hay dependency API.

**Fix:** bắt buộc note routing + permission impact trong task.

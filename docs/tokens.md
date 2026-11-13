# Token thiết kế v1

Mọi khối lõi (`style.css`, kiểu inline của nút / callout trong `src/markup.ts`) chỉ dùng các biến dưới đây. Giá trị mặc định nằm trong `:where(:root)` của `style.css` (layer `ecx-content`, độ ưu tiên 0) nên **bất kỳ khai báo nào của theme cũng thắng**.

- **Theme** chỉ điền giá trị — không viết CSS cho từng khối.
- **Plugin / khối của bên thứ ba** chỉ dùng token (không màu / cỡ cố định) → tự hợp mọi theme.
- Màu "không cố định" (muted, surface, border) mặc định trộn từ `currentColor` → đúng cả trên nền tối (ảnh bìa, section tối).

## Bảng token

| Nhóm | Token | Mặc định |
|---|---|---|
| Màu | `--ecx-color-primary` / `-primary-fg` | `var(--primary, #2563eb)` / `#fff` |
| | `--ecx-color-accent` / `-accent-fg` | `#f59e0b` / `#18181b` |
| | `--ecx-color-text` / `--ecx-color-background` | `#18181b` / `#fff` (lõi không tự áp cho `body`) |
| | `--ecx-color-muted` | `var(--ecx-muted, currentColor 65%)` |
| | `--ecx-color-surface` | `var(--ecx-surface, currentColor 5%)` |
| | `--ecx-color-border` | `var(--ecx-border, currentColor 16%)` |
| | `--ecx-color-link` | `var(--ecx-accent, var(--ecx-color-primary))` |
| | `--ecx-color-info` / `-success` / `-warning` / `-danger` | primary / `#15803d` / `#b45309` / `#b91c1c` (đạt AA trên nền trắng) |
| | `--ecx-color-white` / `-black`, `--ecx-color-code-bg` / `-code-fg` | `#fff` / `#111`, `#18181b` / `#f4f4f5` |
| Chữ | `--ecx-font-family-body` / `-heading` / `-mono` | system-ui / = body / ui-monospace |
| | `--ecx-font-size-xs` … `-4xl` | .75 / .875 / 1 / 1.25 / 1.5 / 2 / 2.75 / 3.5 rem |
| | `--ecx-line-height-body` / `-heading` | 1.65 / 1.2 |
| | `--ecx-font-weight-heading`, `--ecx-letter-spacing-heading` | 700, -.015em |
| Khoảng cách | `--ecx-spacing-xs` … `-3xl` | .25 / .5 / 1 / 1.5 / 2.5 / 4 / 6 rem |
| | `--ecx-flow` (nhịp giữa các khối) | 1.5em |
| Hình | `--ecx-radius-sm` / `-md` / `-lg` / `-xl` / `-pill` | 4 / 8 / 12 / 16 / 999 px |
| | `--ecx-border-width` | 1px |
| | `--ecx-shadow-sm` … `-xl` | trùng giá trị mặc định của `style.shadow` |
| Nút | `--ecx-button-padding` / `-radius` / `-font-weight` | .6em 1.2em / radius-md / 600 |
| Ô nhập | `--ecx-input-height` / `-padding` / `-radius` / `-border` | 2.75rem / .625rem .875rem / 10px / color-border |
| Focus | `--ecx-focus-ring` / `--ecx-focus-offset` | `2px solid var(--ecx-color-link)` / 2px |
| Chuyển động | `--ecx-motion-duration` / `-ease` / `-distance` | .18s / cubic-bezier(.2,.7,.3,1) / 28px |

Tên cũ vẫn được đọc (theme cũ không vỡ): `--primary`, `--ecx-accent`, `--ecx-muted`, `--ecx-surface`, `--ecx-border`, `--ecx-code-bg`, `--ecx-code-fg`, `--ecx-button-bg`, `--ecx-button-fg`, `--ecx-button-secondary-bg`, `--ecx-input-bg`, `--cms-button-*`.

## Theme điền giá trị thế nào

1. **`theme.json › styles`** (người dùng sửa được trong Thiết kế): `colors` → `--ecx-color-<tên>`, `fonts` → `--ecx-font-family-<tên>`, `fontSizes`, `spacing`, `shadows`, `gradients`. Đặt tên màu theo vai trò ở bảng trên (`primary`, `accent`, `text`, `background`, `muted`, `surface`, `border`, `success`…) để trang dựng bằng khối không mất màu khi đổi theme.
2. **CSS của theme** cho token chưa có nhóm preset (bo góc, nút, ô nhập, focus, chuyển động): `:root { --ecx-button-radius: 10px; --ecx-radius-lg: 16px; }`.
3. Không đặt `--primary` khi đã có preset `primary` (`--ecx-color-primary` đọc `--primary` → hai biến trỏ vòng).

## Quy tắc cho plugin

- Màu, cỡ, bo góc, bóng, thời gian: chỉ `var(--ecx-…)`; giá trị dự phòng (fallback) được phép.
- CSS của plugin đặt trong `:where()` hoặc `@layer` để theme ghi đè được.
- Tôn trọng `prefers-reduced-motion`.

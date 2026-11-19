/**
 * CSS riêng của khối (tab Nâng cao): người dùng viết quy tắc với từ khoá `selector` (= chính khối), ví dụ
 *   selector { box-shadow: 0 4px 12px #0002 }   selector:hover { opacity: .8 }   selector img { border-radius: 8px }
 * hoặc chỉ các khai báo trần (`color: red; margin: 0`). Mỗi quy tắc bị buộc nằm trong khối (bộ chọn phải bắt đầu bằng `selector`),
 * chỉ nhận @media; khai báo / giá trị nguy hiểm bị bỏ từng cái một (không bỏ cả đoạn) và được báo lại cho người soạn.
 * Mục tiêu bảo mật: tác giả quyền thấp không dùng CSS riêng để: tải tài nguyên ngoài lạ (@import, url() lạ), chạy mã (expression,
 * javascript:, behavior, -moz-binding), thoát khỏi thẻ <style> (`<`), phủ kín trang (position: fixed) hoặc tác động ngoài khối.
 */
export declare const CUSTOM_CSS_MAX = 4000;
export interface CustomCssResult {
    /** CSS đã lọc, bộ chọn đã thay `selector` bằng `scope`. Rỗng nếu không còn gì dùng được. */
    css: string;
    /** Lý do từng phần bị bỏ (cho người soạn) — mỗi lý do một lần. */
    dropped: string[];
}
/** Lọc và gắn phạm vi. `scope` là bộ chọn của khối do mã gọi đưa vào (vd `.ecx-s-abc.ecx-s-abc`). */
export declare function scopeCustomCss(raw: unknown, scope: string): CustomCssResult;
/** Chuỗi hợp lệ để lưu: cắt dài, bỏ khoảng trắng thừa; rỗng → undefined. (Việc lọc nguy hiểm làm lúc sinh CSS và báo ở trình soạn.) */
export declare function normalizeCustomCss(v: unknown): string | undefined;

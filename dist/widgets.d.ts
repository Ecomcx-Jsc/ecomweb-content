/**
 * 1.23: khối "widget" của lõi (Icon Box, Image Box, Icon List, Counter, Testimonial, Progress Bar) — markup dựng MỘT lần ở đây
 * thành cây phần tử (khoá props kiểu React); website (theme-sdk) và khung soạn (TextEditor) chỉ đổi cây ra React → hai nơi vẽ y hệt.
 * Chỉ dùng token --ecx-* (style.css); không JS, trừ số đếm của Counter (website thay `client: "counter"` bằng component đếm khi cuộn tới).
 */
/** Tập icon cố định (24×24, nét 2, lucide). Chỉ nhận tên trong bảng — không nhận SVG tuỳ ý (chống XSS). Khối `icon` dùng chung. */
export declare const ICON_PATHS: Record<string, string>;
export declare const ICON_NAMES: readonly string[];
/** Phần tử của cây markup. `field` = chữ lấy từ thuộc tính đó (khung soạn gõ trực tiếp); `slot: "media"` = chỗ chọn ảnh khi soạn. */
export interface WidgetEl {
    tag: string;
    className?: string;
    props?: Record<string, string | number | boolean | undefined>;
    style?: Record<string, string | number>;
    children?: Array<WidgetEl | string>;
    field?: string;
    slot?: "media";
    /** Website thay phần tử này bằng component trình duyệt (đếm số khi cuộn tới). */
    client?: "counter";
}
export declare const WIDGET_BLOCKS: readonly ["iconBox", "imageBox", "iconList", "counter", "testimonial", "progressBar"];
type Attrs = Record<string, any>;
/** SVG của icon (trang trí: aria-hidden). Tên lạ → icon mặc định. */
/** Class của danh sách icon (dùng chung website và khung soạn). */
export declare function iconListClass(a: Record<string, any>): string;
export declare function iconEl(name: unknown, fallback?: string, stroke?: unknown): WidgetEl;
/** Số chữ thập phân của Counter (theo giá trị đầu / cuối, tối đa 3). */
export declare const counterDecimals: (a: Attrs) => number;
/** Viết số của Counter: dấu nhóm nghìn theo `separator` (none | , | . | space); dấu thập phân "," khi nhóm bằng ".", còn lại ".". */
export declare function formatCounter(value: number, decimals: number, separator: unknown): string;
/** Cây markup của khối widget; null = không phải khối widget / không có gì để vẽ. `editing` = khung soạn (giữ ô chữ rỗng, chỗ chọn ảnh). */
export declare function widgetMarkup(type: string, a?: Attrs, editing?: boolean): WidgetEl | null;
export type CountdownUnit = "d" | "h" | "m" | "s";
/**
 * 1.26 Ô của khối đếm ngược (website và khung soạn dùng chung): còn `leftMs` → các ô số + nhãn.
 * Ẩn ngày thì giờ cộng dồn cả ngày; ẩn giây thì bỏ ô giây. Nhãn: nhãn riêng của khối > nhãn theo ngôn ngữ (`units`).
 */
export declare function countdownParts(a: Record<string, unknown>, leftMs: number, units?: Partial<Record<CountdownUnit, string>>): Array<{
    u: CountdownUnit;
    value: string;
    label: string;
}>;
export {};

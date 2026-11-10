/**
 * Vỏ markup của khối — MỘT nguồn cho website (theme-sdk) và trình soạn (canvas): thẻ, class, style.
 * Hàm thuần, đồng bộ, không phụ thuộc React: bên dùng tự đổ nội dung (chữ đã vẽ / ProseMirror) vào trong vỏ.
 * Đổi markup ở đây là cả hai nơi đổi theo, nên không thể lệch nhau.
 */
export interface BlockShell {
    tag: string;
    className?: string;
    /** Khoá camelCase như React `style`. */
    style?: Record<string, string | number>;
    /** Thuộc tính HTML cố định của vỏ (vd role, aria-hidden). */
    attrs?: Record<string, string>;
}
type Attrs = Record<string, any>;
/** `text-align` chỉ ghi khi khác mặc định (left) — website không in thừa. */
export declare function alignStyle(attrs?: Attrs): Record<string, string> | undefined;
/** Vỏ của khối lõi; `null` = khối này chưa có vỏ dùng chung (mỗi bên tự vẽ như cũ). `parent` cần cho `column` (đọc `stack` của `columns`). */
export declare function blockShell(type: string, attrs?: Attrs, parent?: {
    type: string;
    attrs?: Attrs;
}): BlockShell | null;
/**
 * 1.20: class độ rộng của khối (`ecx-align-wide|full` + `alignwide|alignfull` như WP để theme viết CSS quen tay).
 * Ảnh đã gắn trong vỏ của nó. Giá trị lạ / khối không hỗ trợ → không có class (website và canvas cùng gọi).
 */
export declare function widthClass(type: string, attrs?: Attrs): string | undefined;
/** Các phần bên trong khối bìa: ảnh (khi không cố định), lớp phủ và nền cố định — cả hai bên vẽ y như nhau. */
export declare function coverParts(attrs?: Attrs): {
    src: string;
    fixed: boolean;
    overlay?: string;
    opacity: number;
};
/** Vỏ ngoài của nút đứng riêng (không nằm trong khối "buttons"): đoạn `<p>` căn lề. */
export declare function buttonWrapShell(attrs?: Attrs): BlockShell;
/** Dòng nguồn của trích dẫn (`<cite>` sau nội dung) — website có, canvas phải có. */
export declare const blockCitation: (attrs?: Attrs) => string | undefined;
/** `rel` của liên kết: giá trị người viết đặt (nofollow, sponsored, ugc…) + luôn noopener noreferrer khi mở tab mới. Website và trình soạn dùng chung. */
export declare function linkRel(rel: unknown, target: unknown): string | undefined;
export {};

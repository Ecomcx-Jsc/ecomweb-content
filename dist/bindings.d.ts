/**
 * Gắn dữ liệu (1.15): `attrs.bindings` — thuộc tính của khối lấy giá trị từ một nguồn lúc hiển thị (tiêu đề bài, trường meta,
 * thuộc tính sản phẩm của plugin…) thay vì chữ gõ tay: `{ content: { source: "core/post", args: { field: "title" } } }`.
 * Khoá khối: `attrs.lock` `{ move, remove }`, `attrs.templateLock` của khối chứa. Máy chủ chạy cùng quy tắc (ContentFormat.cs).
 */
export interface Binding {
    /** Tên nguồn "nhóm/tên" (core/post, core/post-meta, core/site, tên-plugin/nguồn). */
    source: string;
    args?: Record<string, string | number | boolean>;
}
/** Chuẩn hoá `attrs.bindings`: tối đa 10 thuộc tính, nguồn đúng dạng, tham số là chữ (≤ 200 ký tự) / số / đúng-sai. */
export declare function normalizeBindings(v: unknown): Record<string, Binding> | undefined;
/** `attrs.lock`: chỉ giữ cờ bật. */
export declare function normalizeLock(v: unknown): {
    move?: true;
    remove?: true;
} | undefined;
/** `attrs.templateLock` của khối chứa: all | insert | contentOnly | none (khối con thoát khoá của khối ngoài). */
export declare function normalizeTemplateLock(v: unknown): "all" | "insert" | "contentOnly" | "none" | undefined;

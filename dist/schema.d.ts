/**
 * Mô tả thuộc tính của khối / định dạng chữ — dùng cho khối lõi dưới đây và cho khối của plugin (defineBlock).
 * Giá trị sai kiểu được ép về đúng kiểu nếu được (số dạng chuỗi → số), không ép được thì bỏ (= giá trị mặc định).
 * `null` và "không có" là một: thuộc tính null không được lưu.
 */
export type AttrType = "string" | "number" | "integer" | "boolean" | "url" | "json";
export interface AttrSpec {
    type: AttrType;
    /** Giá trị khi không có — trình soạn và website dùng chung. */
    default?: unknown;
    /** Chỉ nhận các giá trị này. */
    enum?: readonly unknown[];
    /** Số: kẹp trong [min, max]. */
    min?: number;
    max?: number;
}
export interface NodeSpec {
    attrs?: Record<string, AttrSpec>;
}
/** Loại ô của khối formField (form cơ bản của lõi). consent = ô đồng ý (bắt buộc tick khi required). */
export declare const FORM_FIELD_KINDS: readonly ["text", "email", "tel", "textarea", "select", "radio", "checkbox", "consent", "number", "date"];
/**
 * Khối lõi trong nội dung soạn thảo (khối `richtext`). Thuộc tính không có trong danh sách vẫn được giữ nguyên
 * (plugin có thể thêm thuộc tính vào khối lõi) — chỉ thuộc tính có mô tả mới được kiểm kiểu.
 */
export declare const CORE_NODES: Record<string, NodeSpec>;
/** Tên ô của form: chữ thường, số, gạch dưới — khoá trong bài gửi. */
export declare const FORM_FIELD_NAME: RegExp;
/** Khối động: nội dung lấy theo ngữ cảnh lúc hiển thị (website, trang, bài trong vòng lặp). */
export declare const DYNAMIC_NODES: readonly ["siteTitle", "siteLogo", "siteTagline", "navigation", "search", "languageSwitcher", "copyright", "postTitle", "postContent", "postExcerpt", "featuredImage", "postDate", "postAuthor", "postTerms", "comments", "readMore", "commentsCount", "avatar", "queryTotal", "termList", "pageList", "archives", "loginout", "queryTitle", "termDescription", "breadcrumbs", "postNavigation", "query", "postTemplate", "pagination", "queryEmpty", "templatePart", "syncedPattern"];
export declare const CORE_MARKS: Record<string, NodeSpec>;
/** Ép giá trị theo mô tả. Trả về undefined = bỏ thuộc tính (dùng mặc định). */
export declare function coerceAttr(spec: AttrSpec, value: unknown): unknown;
/** Chuẩn hoá bộ thuộc tính: ép kiểu thuộc tính có mô tả, giữ nguyên thuộc tính khác, bỏ null. Rỗng → undefined. */
export declare function normalizeAttrs(attrs: unknown, spec?: Record<string, AttrSpec>): Record<string, unknown> | undefined;
/** 1.20: khối có `align: "wide" | "full"` (ảnh có sẵn từ trước, cùng class). Trình soạn hiện nút "Độ rộng" cho các khối này. */
export declare const WIDE_BLOCKS: readonly string[];

export interface ControlSpec {
    type: "number" | "color" | "length" | "enum" | "boolean" | "string" | "url" | "textarea" | "datetime";
    default?: unknown;
    /** enum: giá trị cho phép ([a-z0-9-]); `{ value, label }` để có nhãn (nhận "%khoá%", 1.23). */
    options?: readonly (string | {
        value: string;
        label?: string;
    })[];
    /** string / textarea: độ dài tối đa (mặc định 200 / 5000). */
    maxLength?: number;
    /** number: khoảng cho phép. */
    min?: number;
    max?: number;
    /**
     * "{{WRAPPER}}", "{{WRAPPER}} <bộ chọn con>" hoặc "{{WRAPPER}}:<pseudo>…" (vd `{{WRAPPER}}:hover`, `{{WRAPPER}}:is(img)`, 1.24)
     * → "thuộc-tính: … {{VALUE}} …" (một khai báo / bộ chọn).
     */
    css?: Record<string, string>;
    /** 1.24: giá trị theo khổ màn hình `{ base, tablet, mobile }` (một giá trị trần = base) → media query như `style`. */
    responsive?: boolean;
    /** 1.24 (chỉ giao diện): mục chứa ô trong tab Kiểu dáng; `state` = ô của trạng thái rê chuột / đang mở (thẻ Thường / Rê chuột như Elementor). */
    section?: string;
    state?: "hover" | "active";
    /** 1.24 (chỉ giao diện): bước của ô số. */
    step?: number;
}
export interface BlockControls {
    /** Mã duy nhất "slug-plugin/tên". */
    id: string;
    /** Loại khối áp dụng; "*" = mọi khối. */
    blocks: readonly string[] | "*";
    attributes: Record<string, ControlSpec>;
}
/** Kiểm khai báo của plugin (lỗi lập trình → ném lỗi sớm, lúc đăng ký). */
export declare function defineBlockControls<T extends BlockControls>(c: T): T;
/** Giá trị người dùng → chuỗi CSS an toàn (number/color/length/enum) hoặc giá trị đã kiểm của kiểu chỉ có ô (không an toàn cho CSS/HTML thô), undefined = bỏ. */
export declare function controlValue(s: ControlSpec, v: unknown): string | undefined;
/** Giá trị của một mục enum (chuỗi hoặc { value, label }). */
export declare const optionValue: (o: string | {
    value: string;
}) => string;
/** Class (`ecx-c-…`, băm theo CSS → cùng giá trị = cùng class) + CSS của khối; null khi không có gì để vẽ. */
export declare function controlsCss(list: readonly BlockControls[], type: string, attrs: Record<string, unknown>): {
    cls: string;
    css: string;
} | null;

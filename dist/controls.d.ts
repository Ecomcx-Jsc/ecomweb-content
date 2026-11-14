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
    /** "{{WRAPPER}}" hoặc "{{WRAPPER}} <bộ chọn con>" → "thuộc-tính: … {{VALUE}} …" (nhiều khai báo cách nhau dấu phẩy không được — một khai báo / bộ chọn). */
    css?: Record<string, string>;
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

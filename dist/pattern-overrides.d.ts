export declare const OVERRIDE_KEY: RegExp;
export interface Overridable {
    key: string;
    type: string;
    attrs: string[];
    values: Record<string, string>;
}
/** Các khối cho phép sửa riêng trong mẫu (theo thứ tự xuất hiện): khoá, loại, thuộc tính sửa được, giá trị hiện có. */
export declare function patternOverridables(doc: unknown): Overridable[];
/** Áp phần sửa riêng vào bản sao của mẫu (không sửa đầu vào). Khoá lạ / thuộc tính ngoài danh sách / giá trị không phải chữ bị bỏ. */
export declare function applyPatternOverrides<T>(doc: T, overrides: unknown): T;

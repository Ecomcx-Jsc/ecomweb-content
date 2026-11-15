/**
 * Ô điều khiển khai CSS của plugin (như `selectors` của Elementor) — dùng chung cho khung soạn và website:
 * plugin khai một lần (file dùng chung admin + frontend), core kiểm giá trị và sinh CSS theo class băm của khối.
 *
 *   export const tilt = defineBlockControls({ id: "acme/tilt", blocks: "*", attributes: {
 *     acmeRotate: { type: "number", min: -45, max: 45, css: { "{{WRAPPER}}": "rotate: {{VALUE}}deg" } },
 *     acmeShadowColor: { type: "color", css: { "{{WRAPPER}} img": "filter: drop-shadow(0 4px 12px {{VALUE}})" } },
 *   } });
 *
 * Giá trị do người dùng nhập luôn qua kiểm kiểu (số trong khoảng, màu / độ dài / preset như `style`, enum trong danh sách);
 * mẫu CSS do plugin viết bị từ chối nếu có `{ } ; < @ \` hoặc url( / expression( / import. Không hợp lệ → bỏ, không chèn.
 * Kiểu chỉ có ô (không sinh CSS, 1.23): boolean, string, url, textarea, datetime — plugin đọc giá trị qua controlValue.
 */
import { type BlockStyle } from "./style.js";
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
/** Nhóm thuộc tính kiểu dáng một phần cho chỉnh (giao diện hiện đúng các nhóm này, theo thứ tự). */
export type PartProp = "typography" | "color" | "background" | "border" | "radius" | "shadow" | "padding" | "margin" | "size" | "iconSize";
/**
 * 1.26: một PHẦN của khối (Khung, Icon, Tiêu đề, Mô tả, Nút…) — mỗi phần có bộ kiểu dáng riêng (BlockStyle), như bộ khối lớn
 * chia tab Kiểu thành mục theo phần. Lưu ở `attrs.parts[tên] = { style, hover, hidden }`; CSS sinh chung class với ô điều khiển (controlsCss).
 */
export interface PartSpec {
    /** Nhãn (chữ hoặc "%khoá%" — admin dịch theo plugin). */
    label: string;
    /** Bộ chọn của phần: "{{WRAPPER}}" (cả khối) hoặc "{{WRAPPER}} <con>". */
    selector: string;
    /** Nhóm thuộc tính hiện ở bảng. */
    props: readonly PartProp[];
    /** Có thẻ "Rê chuột": true = rê lên CẢ khối (vd icon đổi màu khi rê thẻ); "self" = rê lên chính phần (vd tiêu đề mục, nút). */
    hover?: boolean | "self";
    /** Có thẻ "Đang mở / đang chọn": bộ chọn của phần ở trạng thái đó (vd "{{WRAPPER}} .ecx-details[open] > summary"). */
    active?: string;
    /** Có công tắc "Hiện": tắt → phần bị ẩn (display: none) trên website và khung soạn. */
    toggle?: boolean;
}
export interface BlockControls {
    /** Mã duy nhất "slug-plugin/tên". */
    id: string;
    /** Loại khối áp dụng; "*" = mọi khối. */
    blocks: readonly string[] | "*";
    attributes: Record<string, ControlSpec>;
    /** 1.26: các phần của khối (xem PartSpec). */
    parts?: Record<string, PartSpec>;
    /** 1.26: các phần thay hẳn Kiểu chữ / Màu chung của cả khối (khối ghép nhiều phần: hộp icon, accordion…); không đặt = phần chỉ là phần phụ (vd chữ tô sáng của tiêu đề). */
    partsOnly?: boolean;
}
/** Giá trị đã lưu của một phần. */
export interface PartValue {
    style?: BlockStyle;
    hover?: BlockStyle;
    active?: BlockStyle;
    hidden?: true;
}
/** Kiểm giá trị `attrs.parts` (dữ liệu người dùng): chỉ phần có tên hợp lệ, kiểu qua normalizeStyle. */
export declare function normalizeParts(v: unknown): Record<string, PartValue> | undefined;
/** Các phần của loại khối (lõi + plugin), theo thứ tự khai. */
export declare function partsFor(list: readonly BlockControls[], type: string): Array<[string, PartSpec]>;
/** Kiểm khai báo của plugin (lỗi lập trình → ném lỗi sớm, lúc đăng ký). */
export declare function defineBlockControls<T extends BlockControls>(c: T): T;
/** Giá trị người dùng → chuỗi CSS an toàn (number/color/length/enum) hoặc giá trị đã kiểm của kiểu chỉ có ô (không an toàn cho CSS/HTML thô), undefined = bỏ. */
export declare function controlValue(s: ControlSpec, v: unknown): string | undefined;
/** Giá trị của một mục enum (chuỗi hoặc { value, label }). */
export declare const optionValue: (o: string | {
    value: string;
}) => string;
/**
 * Class (`ecx-c-…`, băm theo CSS → cùng giá trị = cùng class) + CSS của khối; null khi không có gì để vẽ.
 * `self`: kiểu của các phần nhắm chính phần tử khối (`{{WRAPPER}}` / `{{WRAPPER}}:is(a)`) — renderer gỡ inline trùng như với attrs.style.
 */
export declare function controlsCss(list: readonly BlockControls[], type: string, attrs: Record<string, unknown>): {
    cls: string;
    css: string;
    self?: BlockStyle;
} | null;

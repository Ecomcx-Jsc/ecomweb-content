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
import { BREAKPOINTS, DEVICES, colorCss, spacingValue } from "./style.js";
import { isSafeUrl } from "./url.js";
/** Kiểu được khai `css` (giá trị đã chuẩn hoá thành token CSS an toàn). */
const CSS_TYPES = new Set(["number", "color", "length", "enum"]);
const ATTR = /^[a-zA-Z][a-zA-Z0-9_]{0,40}$/;
// Hậu tố bộ chọn: con cháu (bắt đầu bằng khoảng trắng) hoặc pseudo-class gắn liền (`:hover`, `:is(img)`, 1.24)
const SUFFIX = /^((\s+|:)[\w\s.#>:+~*()\-\[\]="',]{1,120})?$/;
// Thuộc tính CSS thường hoặc biến tuỳ biến (`--x: {{VALUE}}`, 1.23) — giá trị vẫn qua kiểm kiểu như mọi khai báo
const DECL = /^([a-z][a-z-]{1,40}|--[a-z0-9][a-z0-9-]{0,40})\s*:\s*(.{1,200})$/;
const BAD = /[{};<@\\]|url\(|expression\(|import/i;
const okSel = (sel) => sel.startsWith("{{WRAPPER}}") && SUFFIX.test(sel.slice(11)) && !BAD.test(sel.slice(11));
const okDecl = (d) => DECL.test(d) && !BAD.test(d.replaceAll("{{VALUE}}", "")) && d.includes("{{VALUE}}");
/** Kiểm khai báo của plugin (lỗi lập trình → ném lỗi sớm, lúc đăng ký). */
export function defineBlockControls(c) {
    for (const [name, s] of Object.entries(c.attributes)) {
        if (!ATTR.test(name))
            throw new Error(`[controls] ${c.id}: tên thuộc tính không hợp lệ "${name}"`);
        if (s.css && Object.keys(s.css).length && !CSS_TYPES.has(s.type))
            throw new Error(`[controls] ${c.id}.${name}: kiểu "${s.type}" không sinh CSS`);
        for (const [sel, decl] of Object.entries(s.css ?? {})) {
            if (!okSel(sel))
                throw new Error(`[controls] ${c.id}.${name}: bộ chọn không hợp lệ "${sel}"`);
            if (!okDecl(decl))
                throw new Error(`[controls] ${c.id}.${name}: khai báo CSS không hợp lệ "${decl}"`);
        }
    }
    return c;
}
/** Giá trị người dùng → chuỗi CSS an toàn (number/color/length/enum) hoặc giá trị đã kiểm của kiểu chỉ có ô (không an toàn cho CSS/HTML thô), undefined = bỏ. */
export function controlValue(s, v) {
    if (v === undefined || v === null || v === "")
        return undefined;
    switch (s.type) {
        case "number": {
            const n = typeof v === "number" ? v : typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : NaN;
            if (!Number.isFinite(n) || (s.min !== undefined && n < s.min) || (s.max !== undefined && n > s.max))
                return undefined;
            return String(Math.round(n * 1000) / 1000);
        }
        case "color": return colorCss(v);
        case "length": return spacingValue(v);
        case "enum": return typeof v === "string" && /^[a-z0-9-]{1,40}$/.test(v) && s.options?.some((o) => optionValue(o) === v) ? v : undefined;
        case "boolean": return v === true || v === "true" ? "true" : undefined;
        case "string":
        case "textarea": {
            // Có ký tự điều khiển → bỏ (textarea vẫn nhận xuống dòng / tab)
            if (typeof v !== "string" || v.length > (s.maxLength ?? (s.type === "string" ? 200 : 5000)))
                return undefined;
            const bad = s.type === "string" ? /[\u0000-\u001f\u007f]/ : /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
            return bad.test(v) ? undefined : v;
        }
        case "url": return typeof v === "string" && v.length <= 2048 && !/[\s"'<>`\\]/.test(v) && isSafeUrl(v) ? v : undefined;
        case "datetime": {
            // ISO 8601 có ngày + giờ (vd 2026-11-20T09:00, …Z, …+07:00) → chuỗi gốc
            if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/.test(v))
                return undefined;
            return Number.isNaN(Date.parse(v)) ? undefined : v;
        }
    }
}
/** Giá trị của một mục enum (chuỗi hoặc { value, label }). */
export const optionValue = (o) => (typeof o === "string" ? o : o.value);
const applies = (c, type) => c.blocks === "*" || c.blocks.includes(type);
/** Giá trị theo khổ: ô `responsive` nhận `{ base, tablet, mobile }` hoặc một giá trị trần (= base). */
function perDevice(s, v) {
    if (s.responsive && v && typeof v === "object" && !Array.isArray(v))
        return DEVICES.filter((d) => d in v).map((d) => [d, v[d]]);
    return [["base", v]];
}
/** Các khai báo CSS (khổ, bộ chọn hậu tố, khai báo) của một khối; rỗng = khối không có giá trị nào hợp lệ. */
function declarations(list, type, attrs) {
    const out = [];
    for (const c of list) {
        if (!applies(c, type))
            continue;
        for (const [name, s] of Object.entries(c.attributes)) {
            if (!CSS_TYPES.has(s.type) || attrs[name] === undefined)
                continue;
            for (const [d, raw] of perDevice(s, attrs[name])) {
                const v = controlValue(s, raw);
                if (v === undefined)
                    continue;
                for (const [sel, decl] of Object.entries(s.css ?? {})) {
                    if (!okSel(sel) || !okDecl(decl))
                        continue;
                    out.push([d, sel.slice(11), decl.replaceAll("{{VALUE}}", v)]);
                }
            }
        }
    }
    return out;
}
/** Class (`ecx-c-…`, băm theo CSS → cùng giá trị = cùng class) + CSS của khối; null khi không có gì để vẽ. */
export function controlsCss(list, type, attrs) {
    const decls = declarations(list, type, attrs);
    if (!decls.length)
        return null;
    // Khổ base băm như trước 1.24 → class của nội dung cũ không đổi
    const key = JSON.stringify(decls.map(([d, sel, decl]) => (d === "base" ? [sel, decl] : [d, sel, decl])));
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    const cls = `ecx-c-${h.toString(36)}`;
    const media = { base: "", tablet: `@media (max-width:${BREAKPOINTS.tablet}px)`, mobile: `@media (max-width:${BREAKPOINTS.mobile}px)` };
    let css = "";
    for (const d of DEVICES) {
        const bySel = new Map();
        for (const [dd, sel, decl] of decls)
            if (dd === d)
                bySel.set(sel, [...(bySel.get(sel) ?? []), decl]);
        const rules = [...bySel].map(([sel, ds]) => `.${cls}.${cls}${sel}{${ds.join(";")}}`).join("");
        if (rules)
            css += d === "base" ? rules : `${media[d]}{${rules}}`;
    }
    return { cls, css };
}

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
 */
import { colorCss, spacingValue } from "./style.js";
const ATTR = /^[a-zA-Z][a-zA-Z0-9_]{0,40}$/;
const SUFFIX = /^(\s+[\w\s.#>:+~*()\-\[\]="',]{1,120})?$/;
const DECL = /^([a-z][a-z-]{1,40})\s*:\s*(.{1,200})$/;
const BAD = /[{};<@\\]|url\(|expression\(|import/i;
const okSel = (sel) => sel.startsWith("{{WRAPPER}}") && SUFFIX.test(sel.slice(11)) && !BAD.test(sel.slice(11));
const okDecl = (d) => DECL.test(d) && !BAD.test(d.replaceAll("{{VALUE}}", "")) && d.includes("{{VALUE}}");
/** Kiểm khai báo của plugin (lỗi lập trình → ném lỗi sớm, lúc đăng ký). */
export function defineBlockControls(c) {
    for (const [name, s] of Object.entries(c.attributes)) {
        if (!ATTR.test(name))
            throw new Error(`[controls] ${c.id}: tên thuộc tính không hợp lệ "${name}"`);
        for (const [sel, decl] of Object.entries(s.css ?? {})) {
            if (!okSel(sel))
                throw new Error(`[controls] ${c.id}.${name}: bộ chọn không hợp lệ "${sel}"`);
            if (!okDecl(decl))
                throw new Error(`[controls] ${c.id}.${name}: khai báo CSS không hợp lệ "${decl}"`);
        }
    }
    return c;
}
/** Giá trị người dùng → chuỗi CSS an toàn, hoặc undefined (bỏ). */
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
        case "enum": return typeof v === "string" && /^[a-z0-9-]{1,40}$/.test(v) && s.options?.includes(v) ? v : undefined;
    }
}
const applies = (c, type) => c.blocks === "*" || c.blocks.includes(type);
/** Các khai báo CSS (bộ chọn hậu tố → khai báo) của một khối; rỗng = khối không có giá trị nào hợp lệ. */
function declarations(list, type, attrs) {
    const out = [];
    for (const c of list) {
        if (!applies(c, type))
            continue;
        for (const [name, s] of Object.entries(c.attributes)) {
            const v = controlValue(s, attrs[name]);
            if (v === undefined)
                continue;
            for (const [sel, decl] of Object.entries(s.css ?? {})) {
                if (!okSel(sel) || !okDecl(decl))
                    continue;
                out.push([sel.slice(11), decl.replaceAll("{{VALUE}}", v)]);
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
    const key = JSON.stringify(decls);
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    const cls = `ecx-c-${h.toString(36)}`;
    const bySel = new Map();
    for (const [sel, d] of decls)
        bySel.set(sel, [...(bySel.get(sel) ?? []), d]);
    const css = [...bySel].map(([sel, ds]) => `.${cls}.${cls}${sel}{${ds.join(";")}}`).join("");
    return { cls, css };
}

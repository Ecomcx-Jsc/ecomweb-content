/**
 * Kiểu dáng của khối (`attrs.style`, mọi khối): khoảng cách, cỡ chữ, màu, viền, ẩn theo khổ màn hình.
 * Giá trị theo khổ: `{ base, tablet, mobile }` (tablet ≤ 1024px, mobile ≤ 640px). Giá trị là preset của theme
 * (`lg`, `primary` → biến CSS `--ecx-spacing-lg`, `--ecx-color-primary`) hoặc giá trị CSS đã kiểm (độ dài, màu).
 * Chỉ nhận giá trị trong danh sách → không chèn được CSS tuỳ ý. Máy chủ chạy cùng quy tắc (ContentFormat.cs).
 */
export const BREAKPOINTS = { tablet: 1024, mobile: 640 };
export const DEVICES = ["base", "tablet", "mobile"];
const SIDES = ["top", "right", "bottom", "left"];
const LENGTH = /^(0|-?\d{1,4}(\.\d{1,3})?(px|rem|em|%|vw|vh))$/;
const PRESET = /^([a-z][a-z0-9-]{0,30}|[1-9]x[sl])$/;
const COLOR = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/]{1,40}\))$/i;
const WEIGHTS = ["300", "400", "500", "600", "700", "800", "900"];
const ALIGNS = ["left", "center", "right", "justify"];
const BORDER_STYLES = ["solid", "dashed", "dotted"];
const HIDE = ["desktop", "tablet", "mobile"];
const FONT_STYLES = ["normal", "italic"];
const DECORATIONS = ["none", "underline", "line-through"];
const TRANSFORMS = ["none", "uppercase", "lowercase", "capitalize"];
const preset = (v) => (typeof v === "string" && PRESET.test(v) ? v : undefined);
const DIRECTIONS = ["row", "column"];
const JUSTIFY = ["start", "center", "end", "between"];
const ALIGN_ITEMS = ["start", "center", "end", "stretch"];
const RATIOS = ["1/1", "4/3", "3/2", "16/9", "21/9", "3/4", "2/3", "9/16"];
/** Hiệu ứng khi cuộn tới có sẵn ở lõi (keyframes `ecx-in-<mã>` trong style.css). Plugin thêm mã khác. */
export const MOTION_IN = ["fade", "slide-up", "slide-down", "slide-left", "slide-right", "zoom-in", "zoom-out", "blur-in"];
/** Hiệu ứng khi rê chuột có sẵn ở lõi. */
export const MOTION_HOVER = ["lift", "grow", "brighten", "glow"];
const MOTION_DURATIONS = { fast: 300, normal: 600, slow: 1000 };
const MOTION_ID = /^[a-z][a-z0-9-]{0,39}$/;
const columns = (v) => {
    const n = typeof v === "number" ? v : typeof v === "string" && /^\d{1,2}$/.test(v) ? Number(v) : NaN;
    return Number.isInteger(n) && n >= 1 && n <= 12 ? n : undefined;
};
/** Tách tham số CSS theo dấu phẩy ngoài ngoặc: "90deg, rgb(1,2,3) 0%, #fff" → 3 phần. */
function splitArgs(s) {
    const out = [];
    let depth = 0, cur = "";
    for (const ch of s) {
        if (ch === "(")
            depth++;
        if (ch === ")")
            depth--;
        if (ch === "," && depth === 0) {
            out.push(cur.trim());
            cur = "";
        }
        else
            cur += ch;
        if (depth < 0)
            return [];
    }
    out.push(cur.trim());
    return out;
}
const STOP = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/]{1,40}\))(\s+\d{1,3}%)?$/i;
const LINEAR_DIR = /^(\d{1,3}deg|to (top|bottom|left|right)( (top|bottom|left|right))?)$/;
const RADIAL_SHAPE = /^(circle|ellipse)( at center)?$/;
/** Gradient: preset hoặc linear/radial-gradient(hướng?, 2–6 điểm màu hex/rgb/hsl kèm %) — dạng chuẩn hoá khoảng trắng. */
export function normalizeGradient(v) {
    if (typeof v !== "string")
        return undefined;
    const t = v.trim();
    if (PRESET.test(t))
        return t;
    const m = /^(linear|radial)-gradient\((.{1,400})\)$/i.exec(t);
    if (!m)
        return undefined;
    const kind = m[1].toLowerCase();
    const args = splitArgs(m[2]).map((a) => a.replace(/\s+/g, " "));
    if (!args.length || args.some((a) => !a))
        return undefined;
    const head = kind === "linear" ? LINEAR_DIR.test(args[0]) : RADIAL_SHAPE.test(args[0]);
    const stops = head ? args.slice(1) : args;
    if (stops.length < 2 || stops.length > 6 || !stops.every((x) => STOP.test(x)))
        return undefined;
    return `${kind}-gradient(${args.join(", ")})`;
}
/** Bóng: preset hoặc none (giá trị tuỳ ý chỉ khai báo được ở preset của theme). */
const shadow = (v) => (v === "none" ? "none" : preset(v));
function layout(v) {
    if (!isObj(v) || (v.type !== "flex" && v.type !== "grid"))
        return undefined;
    const out = { type: v.type };
    if (v.type === "flex") {
        const d = responsive(v.direction, oneOf(DIRECTIONS));
        if (d)
            out.direction = d;
    }
    const j = responsive(v.justify, oneOf(JUSTIFY));
    if (j)
        out.justify = j;
    const a = responsive(v.align, oneOf(ALIGN_ITEMS));
    if (a)
        out.align = a;
    if (v.type === "flex" && typeof v.wrap === "boolean")
        out.wrap = v.wrap;
    if (v.type === "grid") {
        const c = responsive(v.columns, columns);
        if (c)
            out.columns = c;
        const w = size(v.minColumnWidth);
        if (w)
            out.minColumnWidth = w;
    }
    return out;
}
function hover(v) {
    if (!isObj(v))
        return undefined;
    const out = {};
    const c = group(v.color, { text: color, background: color });
    if (c)
        out.color = c;
    const b = group(v.border, { color });
    if (b)
        out.border = b;
    const sh = shadow(v.shadow);
    if (sh)
        out.shadow = sh;
    if (v.lift === true)
        out.lift = true;
    return Object.keys(out).length ? out : undefined;
}
function motion(v) {
    if (!isObj(v))
        return undefined;
    const out = {};
    if (typeof v.in === "string" && v.in !== "none" && MOTION_ID.test(v.in)) {
        out.in = v.in;
        const d = oneOf(Object.keys(MOTION_DURATIONS))(v.duration);
        if (d && d !== "normal")
            out.duration = d;
        const n = typeof v.delay === "number" ? v.delay : typeof v.delay === "string" && /^\d{1,4}$/.test(v.delay) ? Number(v.delay) : NaN;
        if (Number.isInteger(n) && n > 0 && n <= 3000)
            out.delay = n;
        if (v.repeat === true)
            out.repeat = true;
        if (v.stagger === true)
            out.stagger = true;
    }
    const h = oneOf(MOTION_HOVER)(v.hover);
    if (h)
        out.hover = h;
    return Object.keys(out).length ? out : undefined;
}
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const size = (v) => (typeof v === "string" && (LENGTH.test(v) || PRESET.test(v)) ? v : undefined);
const color = (v) => (typeof v === "string" && (COLOR.test(v.trim()) || PRESET.test(v)) ? v.trim() : undefined);
const oneOf = (list) => (v) => (typeof v === "string" && list.includes(v) ? v : undefined);
const lineHeight = (v) => {
    const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
    return Number.isFinite(n) && n >= 0.5 && n <= 4 ? Math.round(n * 100) / 100 : undefined;
};
function box(v) {
    if (typeof v === "string")
        return size(v);
    if (!isObj(v))
        return undefined;
    const out = {};
    for (const s of SIDES) {
        const x = size(v[s]);
        if (x !== undefined)
            out[s] = x;
    }
    return Object.keys(out).length ? out : undefined;
}
/** Giá trị theo khổ: nhận cả dạng gọn (một giá trị = base). */
function responsive(v, fn) {
    const src = isObj(v) && DEVICES.some((d) => d in v) ? v : { base: v };
    const out = {};
    for (const d of DEVICES) {
        const x = fn(src[d]);
        if (x !== undefined)
            out[d] = x;
    }
    return Object.keys(out).length ? out : undefined;
}
function group(v, fields) {
    if (!isObj(v))
        return undefined;
    const out = {};
    for (const k of Object.keys(fields)) {
        const x = fields[k](v[k]);
        if (x !== undefined)
            out[k] = x;
    }
    return Object.keys(out).length ? out : undefined;
}
/** Chuẩn hoá `attrs.style`: giữ đúng thứ tự khoá, bỏ giá trị không hợp lệ. Rỗng → undefined. */
export function normalizeStyle(v) {
    if (!isObj(v))
        return undefined;
    const out = {};
    const set = (k, x) => { if (x !== undefined)
        out[k] = x; };
    set("padding", responsive(v.padding, box));
    set("margin", responsive(v.margin, box));
    set("gap", responsive(v.gap, size));
    set("width", responsive(v.width, size));
    set("maxWidth", responsive(v.maxWidth, size));
    set("minHeight", responsive(v.minHeight, size));
    set("fontFamily", preset(v.fontFamily));
    set("fontSize", responsive(v.fontSize, size));
    set("lineHeight", responsive(v.lineHeight, lineHeight));
    set("letterSpacing", responsive(v.letterSpacing, size));
    set("fontWeight", oneOf(WEIGHTS)(typeof v.fontWeight === "number" ? String(v.fontWeight) : v.fontWeight));
    set("fontStyle", oneOf(FONT_STYLES)(v.fontStyle));
    set("textDecoration", oneOf(DECORATIONS)(v.textDecoration));
    set("textTransform", oneOf(TRANSFORMS)(v.textTransform));
    set("textAlign", responsive(v.textAlign, oneOf(ALIGNS)));
    set("color", group(v.color, { text: color, background: color }));
    set("border", group(v.border, { width: size, style: oneOf(BORDER_STYLES), color }));
    set("radius", size(v.radius));
    if (Array.isArray(v.hide)) {
        const h = HIDE.filter((d) => v.hide.includes(d));
        if (h.length)
            out.hide = [...h];
    }
    set("layout", layout(v.layout));
    set("gradient", normalizeGradient(v.gradient));
    set("shadow", shadow(v.shadow));
    set("aspectRatio", oneOf(RATIOS)(v.aspectRatio));
    if (isObj(v.position) && v.position.type === "sticky") {
        const top = size(v.position.top);
        set("position", top ? { type: "sticky", top } : { type: "sticky" });
    }
    set("hover", hover(v.hover));
    set("motion", motion(v.motion));
    return Object.keys(out).length ? out : undefined;
}
// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------
const lit = (v) => v === "auto" || v === "0" || LENGTH.test(v);
const spacing = (v) => (lit(v) ? v : `var(--ecx-spacing-${v})`);
const fontSize = (v) => (lit(v) ? v : `var(--ecx-font-size-${v})`);
const colorValue = (v) => (COLOR.test(v) ? v : `var(--ecx-color-${v}, ${v})`);
function boxDecl(prop, v) {
    if (typeof v === "string")
        return [`${prop}:${spacing(v)}`];
    return SIDES.filter((s) => v[s] !== undefined).map((s) => `${prop}-${s}:${spacing(v[s])}`);
}
/** Khai báo CSS cho từng khổ màn hình. */
function declarations(style) {
    const out = { base: [], tablet: [], mobile: [] };
    for (const d of DEVICES) {
        const p = style.padding?.[d];
        if (p !== undefined)
            out[d].push(...boxDecl("padding", p));
        const m = style.margin?.[d];
        if (m !== undefined)
            out[d].push(...boxDecl("margin", m));
        const g = style.gap?.[d];
        if (g !== undefined)
            out[d].push(`gap:${spacing(g)}`);
        const w = style.width?.[d];
        if (w !== undefined)
            out[d].push(`width:${spacing(w)}`);
        const mw = style.maxWidth?.[d];
        if (mw !== undefined)
            out[d].push(`max-width:${spacing(mw)}`);
        const mh = style.minHeight?.[d];
        if (mh !== undefined)
            out[d].push(`min-height:${spacing(mh)}`);
        const fs = style.fontSize?.[d];
        if (fs !== undefined)
            out[d].push(`font-size:${fontSize(fs)}`);
        const lh = style.lineHeight?.[d];
        if (lh !== undefined)
            out[d].push(`line-height:${lh}`);
        const ls = style.letterSpacing?.[d];
        if (ls !== undefined)
            out[d].push(`letter-spacing:${lit(ls) ? ls : `var(--ecx-letter-spacing-${ls})`}`);
        const ta = style.textAlign?.[d];
        if (ta !== undefined)
            out[d].push(`text-align:${ta}`);
    }
    if (style.fontFamily)
        out.base.push(`font-family:var(--ecx-font-family-${style.fontFamily}, inherit)`);
    if (style.fontWeight)
        out.base.push(`font-weight:${style.fontWeight}`);
    if (style.fontStyle)
        out.base.push(`font-style:${style.fontStyle}`);
    if (style.textDecoration)
        out.base.push(`text-decoration:${style.textDecoration}`);
    if (style.textTransform)
        out.base.push(`text-transform:${style.textTransform}`);
    if (style.color?.text)
        out.base.push(`color:${colorValue(style.color.text)}`);
    if (style.color?.background)
        out.base.push(`background:${colorValue(style.color.background)}`);
    if (style.border?.width || style.border?.style || style.border?.color)
        out.base.push(`border:${style.border.width ? spacing(style.border.width) : "1px"} ${style.border.style ?? "solid"} ${style.border.color ? colorValue(style.border.color) : "currentColor"}`);
    if (style.radius)
        out.base.push(`border-radius:${spacing(style.radius)}`);
    // 1.15: bố cục, nền chuyển màu, bóng, tỉ lệ, ghim
    const l = style.layout;
    if (l?.type === "flex") {
        out.base.push("display:flex", `flex-wrap:${l.wrap === false ? "nowrap" : "wrap"}`);
        if (!l.direction?.base)
            out.base.push("flex-direction:row");
        if (style.gap === undefined)
            out.base.push("gap:var(--ecx-block-gap, 1rem)");
    }
    else if (l?.type === "grid") {
        out.base.push("display:grid");
        if (!l.columns?.base)
            out.base.push(`grid-template-columns:repeat(auto-fill,minmax(min(${l.minColumnWidth ? spacing(l.minColumnWidth) : "12rem"},100%),1fr))`);
        if (style.gap === undefined)
            out.base.push("gap:var(--ecx-block-gap, 1rem)");
    }
    for (const d of DEVICES) {
        const dir = l?.direction?.[d];
        if (dir)
            out[d].push(`flex-direction:${dir}`);
        const j = l?.justify?.[d];
        if (j)
            out[d].push(`justify-content:${JUSTIFY_CSS[j]}`);
        const a = l?.align?.[d];
        if (a)
            out[d].push(`align-items:${ALIGN_CSS[a]}`);
        const c = l?.columns?.[d];
        if (c)
            out[d].push(`grid-template-columns:repeat(${c},minmax(0,1fr))`);
    }
    if (style.gradient)
        out.base.push(`background:${gradientValue(style.gradient)}`);
    if (style.shadow)
        out.base.push(`box-shadow:${shadowValue(style.shadow)}`);
    if (style.aspectRatio)
        out.base.push(`aspect-ratio:${style.aspectRatio}`, "object-fit:cover");
    if (style.position)
        out.base.push("position:sticky", `top:${style.position.top ? spacing(style.position.top) : "0"}`, "z-index:10");
    if (style.hover)
        out.base.push("transition:color .2s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease,transform .2s ease");
    return out;
}
const JUSTIFY_CSS = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" };
const ALIGN_CSS = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
/** Bóng có sẵn (theme ghi đè bằng preset cùng tên). */
const SHADOWS = {
    sm: "0 1px 2px rgb(0 0 0 / .08)", md: "0 4px 12px rgb(0 0 0 / .1)", lg: "0 12px 32px rgb(0 0 0 / .14)", xl: "0 24px 64px rgb(0 0 0 / .18)",
};
const shadowValue = (v) => (v === "none" ? "none" : `var(--ecx-shadow-${v}${SHADOWS[v] ? `, ${SHADOWS[v]}` : ""})`);
const gradientValue = (v) => (PRESET.test(v) ? `var(--ecx-gradient-${v})` : v);
/** Khai báo khi rê chuột. */
function hoverDeclarations(h) {
    const out = [];
    if (h.color?.text)
        out.push(`color:${colorValue(h.color.text)}`);
    if (h.color?.background)
        out.push(`background:${colorValue(h.color.background)}`);
    if (h.border?.color)
        out.push(`border-color:${colorValue(h.border.color)}`);
    if (h.shadow)
        out.push(`box-shadow:${shadowValue(h.shadow)}`);
    if (h.lift)
        out.push("transform:translateY(-2px)");
    return out;
}
/** Độ dài / preset khoảng cách hợp lệ → giá trị CSS (preset thành biến); không hợp lệ → undefined. Dùng cho thuộc tính khối như chiều cao khoảng trống. */
export function spacingValue(v) {
    const x = size(v);
    return x === undefined ? undefined : spacing(x);
}
/** Màu hợp lệ (hex/rgb/hsl hoặc preset) → giá trị CSS; không hợp lệ → undefined. */
export function colorCss(v) {
    const x = color(v);
    return x === undefined ? undefined : colorValue(x);
}
const EASE = "var(--ecx-motion-ease, cubic-bezier(.2, .7, .3, 1))";
const HOVER_FX = {
    lift: "transform:translateY(-4px);box-shadow:0 12px 24px rgb(0 0 0 / .12)",
    grow: "transform:scale(1.04)",
    brighten: "filter:brightness(1.08)",
    glow: "box-shadow:0 0 28px color-mix(in srgb, var(--ecx-accent, var(--primary, #2563eb)) 45%, transparent)",
};
/**
 * CSS chuyển động của một khối (chỉ cho class riêng của khối — Global Styles không dùng, vì trạng thái ẩn cần class `ecx-in` + `is-in`).
 * Hiệu ứng cuộn: trạng thái ẩn chỉ áp khi `html.ecx-js` (script observer đã chạy) VÀ phần tử có class `ecx-in` → không có JS
 * hoặc renderer cũ không gắn class thì nội dung vẫn hiện;
 * `is-in` do script đặt khi khối vào màn hình. `animation-fill-mode: backwards` để sau khi chạy xong khối trả về trạng thái tự nhiên.
 */
export function motionCss(style, cls) {
    const m = style.motion;
    if (!m)
        return "";
    const sel = `.${cls}.${cls}`;
    let css = "";
    if (m.in) {
        const dur = MOTION_DURATIONS[m.duration ?? "normal"];
        const delay = m.delay ?? 0;
        const name = `ecx-in-${m.in}`;
        if (m.stagger) {
            css += `html.ecx-js ${sel}.ecx-in:not(.is-in)>*{opacity:0}`;
            css += `${sel}.is-in>*{animation:${name} ${dur}ms ${EASE} calc(${delay}ms + var(--ecx-i, 0) * var(--ecx-stagger-step, 80ms)) backwards}`;
        }
        else {
            css += `html.ecx-js ${sel}.ecx-in:not(.is-in){opacity:0}`;
            css += `${sel}.is-in{animation:${name} ${dur}ms ${EASE} ${delay}ms backwards}`;
        }
    }
    if (m.hover) {
        // Giữ cả các thuộc tính chuyển của hover cũ (style.hover) để hai loại hover dùng chung một khối không mất hiệu ứng
        const props = ["transform", "box-shadow", "filter", ...(style.hover ? ["color", "background", "border-color"] : [])];
        css += `${sel}{transition:${props.map((p) => `${p} .25s ${EASE}`).join(",")}}`;
        css += `@media (hover:hover){${sel}:hover{${HOVER_FX[m.hover]}}}`;
    }
    const calm = [m.in ? `${sel}.is-in,${sel}.is-in>*{animation:none}` : "", m.hover ? `${sel}{transition:none}${sel}:hover{transform:none}` : ""].join("");
    if (calm)
        css += `@media (prefers-reduced-motion:reduce){${calm}}`;
    return css;
}
/** Class thêm vào phần tử của khối để script observer tìm thấy (`ecx-in`, `ecx-in-repeat`); không có hiệu ứng cuộn → "". */
export function motionClasses(style) {
    const m = style?.motion;
    return m?.in ? (m.repeat ? "ecx-in ecx-in-repeat" : "ecx-in") : "";
}
/** Tên class ổn định theo nội dung style (cùng kiểu dáng → cùng class). */
export function styleClass(style) {
    let h = 0x811c9dc5;
    const s = JSON.stringify(style);
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return `ecx-s-${h.toString(36)}`;
}
/** CSS của một kiểu dáng: `.cls.cls{…}` + media query cho tablet / mobile + ẩn theo khổ + :hover. Rỗng → "". */
export function styleCss(style, cls = styleClass(style)) {
    return ruleCss(`.${cls}.${cls}`, style) + motionCss(style, cls);
}
/**
 * CSS của một kiểu dáng cho bộ chọn bất kỳ (danh sách cách nhau dấu phẩy) — dùng cho kiểu của từng khối và Global Styles
 * (kiểu mặc định theo loại khối / phần tử). Bộ chọn do mã gọi đưa vào, không lấy từ dữ liệu người dùng.
 */
export function ruleCss(selector, style) {
    const sel = selector;
    const each = (suffix) => sel.split(",").map((x) => `${x.trim()}${suffix}`).join(",");
    const d = declarations(style);
    let css = d.base.length ? `${sel}{${d.base.join(";")}}` : "";
    if (d.tablet.length)
        css += `@media (max-width:${BREAKPOINTS.tablet}px){${sel}{${d.tablet.join(";")}}}`;
    if (d.mobile.length)
        css += `@media (max-width:${BREAKPOINTS.mobile}px){${sel}{${d.mobile.join(";")}}}`;
    for (const h of style.hide ?? []) {
        const q = h === "desktop" ? `(min-width:${BREAKPOINTS.tablet + 1}px)` : h === "tablet" ? `(min-width:${BREAKPOINTS.mobile + 1}px) and (max-width:${BREAKPOINTS.tablet}px)` : `(max-width:${BREAKPOINTS.mobile}px)`;
        css += `@media ${q}{${sel}{display:none!important}}`;
    }
    if (style.hover) {
        const hv = hoverDeclarations(style.hover);
        if (hv.length)
            css += `${each(":hover")}{${hv.join(";")}}`;
    }
    // Hàng ngang / lưới: khoảng cách do gap lo — bỏ lề dọc của khối con (lề luồng văn bản làm lệch hàng)
    if (style.layout)
        css += `${each(" > *")}{margin-block:0}`;
    return css;
}
/** Gom CSS cho cả một cây nội dung: trả về css (mỗi class một lần) — website và trình soạn dùng chung. */
export function collectStyles(styles) {
    const seen = new Map();
    for (const s of styles) {
        const cls = styleClass(s);
        if (!seen.has(cls))
            seen.set(cls, styleCss(s, cls));
    }
    return [...seen.values()].join("");
}
// ---------------------------------------------------------------------------
// Thuộc tính chung của khối (1.10): biến thể kiểu, neo, class riêng
// ---------------------------------------------------------------------------
const ANCHOR = /^[A-Za-z][\w-]{0,63}$/;
const CLASS_TOKEN = /^-?[_a-zA-Z][\w-]{0,40}$/;
/** Biến thể kiểu (`blockStyle`): tên preset → class `ecx-is-<tên>`. */
export function normalizeBlockStyleName(v) {
    return typeof v === "string" && /^[a-z][a-z0-9-]{0,30}$/.test(v) ? v : undefined;
}
/** Neo (`anchor`) → id của phần tử. */
export function normalizeAnchor(v) {
    return typeof v === "string" && ANCHOR.test(v.trim()) ? v.trim() : undefined;
}
/** Class CSS riêng (`className`): tối đa 5 class hợp lệ, cách nhau bởi dấu cách. */
export function normalizeClassName(v) {
    if (typeof v !== "string")
        return undefined;
    const tokens = v.split(/\s+/).filter(Boolean).filter((t) => CLASS_TOKEN.test(t)).slice(0, 5);
    return tokens.length ? [...new Set(tokens)].join(" ") : undefined;
}
/** Biến thể có sẵn của lõi (CSS trong style.css); theme thêm bằng theme.json › blockStyles. */
export const CORE_BLOCK_STYLES = {
    table: ["stripes"],
    image: ["rounded", "circle"],
    blockquote: ["plain"],
    horizontalRule: ["dots", "wide"],
    button: ["pill"],
    group: ["card"],
};
/** Bộ chọn của khối lõi trên website (markup của renderer) — Global Styles theo loại khối. */
export const BLOCK_SELECTORS = {
    paragraph: "p", heading: "h1,h2,h3,h4,h5,h6", bulletList: "ul", orderedList: "ol", blockquote: "blockquote", codeBlock: "pre",
    preformatted: ".ecx-pre", horizontalRule: "hr", image: ".ecx-image", gallery: ".ecx-gallery", table: ".ecx-table table", group: ".ecx-group",
    columns: ".ecx-columns", column: ".ecx-column", buttons: ".ecx-buttons-group", button: ".ecx-button", spacer: ".ecx-spacer", callout: ".ecx-callout",
    cover: ".ecx-cover", mediaText: ".ecx-media-text", pullquote: ".ecx-pullquote", details: ".ecx-details", accordion: ".ecx-accordion", countdown: ".ecx-countdown", rating: ".ecx-rating", socialLinks: ".ecx-social", form: ".ecx-form-blocks",
    siteTitle: ".ecx-site-title", siteTagline: ".ecx-site-tagline", navigation: ".ecx-navigation", postTitle: ".ecx-post-title", postExcerpt: ".ecx-post-excerpt",
    postDate: ".ecx-post-date", featuredImage: ".ecx-featured-image", query: ".ecx-query",
};
/** Bộ chọn của phần tử — Global Styles theo phần tử. */
export const ELEMENT_SELECTORS = {
    link: "a", button: ".ecx-button", heading: "h1,h2,h3,h4,h5,h6", h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6", caption: "figcaption",
};
const FLUID = /^clamp\(\s*-?[\d.]+(px|rem|em|vw|vh|%)?\s*,\s*[\d.\s+\-*()a-z%]{1,60},\s*-?[\d.]+(px|rem|em|vw|vh|%)?\s*\)$/;
const FONT = /^[\w\s"',.\-]{1,200}$/;
const presetSize = (v) => (typeof v === "string" && (LENGTH.test(v.trim()) || FLUID.test(v.trim())) ? v.trim() : undefined);
const presetColor = (v) => (typeof v === "string" && COLOR.test(v.trim()) ? v.trim() : undefined);
const presetFont = (v) => (typeof v === "string" && FONT.test(v.trim()) ? v.trim() : undefined);
const presetGradient = (v) => { const g = normalizeGradient(v); return g && !PRESET.test(g) ? g : undefined; };
const SHADOW_LAYER = /^(inset )?(-?\d{1,3}(\.\d{1,2})?(px|rem|em)? ){2,3}(-?\d{1,3}(\.\d{1,2})?(px|rem|em)? )?(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/]{1,40}\))$/i;
const presetShadow = (v) => {
    if (typeof v !== "string")
        return undefined;
    const layers = splitArgs(v.trim()).map((x) => x.replace(/\s+/g, " "));
    return layers.length >= 1 && layers.length <= 3 && layers.every((x) => SHADOW_LAYER.test(x)) ? layers.join(", ") : undefined;
};
/** Kiểu dáng theo tên (khối / phần tử): tên trong danh sách, kiểu chuẩn hoá như attrs.style. */
function styleMap(v, names) {
    if (!isObj(v))
        return undefined;
    const out = {};
    for (const [k, x] of Object.entries(v)) {
        if (!(k in names))
            continue;
        const st = normalizeStyle(x);
        if (st)
            out[k] = st;
    }
    return Object.keys(out).length ? out : undefined;
}
/** Chuẩn hoá preset: tên preset hợp lệ, giá trị đã kiểm (màu hex/rgb/hsl, độ dài hoặc clamp(), danh sách phông không có ; { }). */
export function normalizePresets(v) {
    const out = {};
    if (!isObj(v))
        return out;
    const pick = (key, fn) => {
        const src = v[key];
        if (!isObj(src))
            return;
        const r = {};
        for (const [k, x] of Object.entries(src)) {
            const value = isObj(x) ? x.value : x;
            const ok = /^([a-z][a-z0-9-]{0,30}|[1-9]x[sl])$/.test(k) ? fn(value) : undefined;
            if (ok !== undefined)
                r[k] = ok;
        }
        if (Object.keys(r).length)
            out[key] = r;
    };
    pick("colors", presetColor);
    pick("fontSizes", presetSize);
    pick("spacing", presetSize);
    pick("fonts", presetFont);
    pick("gradients", presetGradient);
    pick("shadows", presetShadow);
    const blocks = styleMap(v.blocks, BLOCK_SELECTORS);
    if (blocks)
        out.blocks = blocks;
    const elements = styleMap(v.elements, ELEMENT_SELECTORS);
    if (elements)
        out.elements = elements;
    if (isObj(v.layout)) {
        const layout = {};
        for (const k of ["contentWidth", "wideWidth"]) {
            const x = presetSize(v.layout[k]);
            if (x && !x.startsWith("-"))
                layout[k] = x;
        }
        if (Object.keys(layout).length)
            out.layout = layout;
    }
    return out;
}
/** Gộp preset theo thứ tự (sau đè trước): theme → bản sửa của quản trị viên. */
export function mergePresets(...list) {
    const out = {};
    for (const p of list.map(normalizePresets))
        for (const k of Object.keys(p))
            out[k] = { ...out[k], ...p[k] };
    return out;
}
/** Biến CSS của preset: `--ecx-color-*`, `--ecx-font-size-*`, `--ecx-spacing-*`, `--ecx-font-family-*`. */
export function presetCss(presets, selector = ":root") {
    const p = normalizePresets(presets);
    const decl = [
        ...Object.entries(p.colors ?? {}).map(([k, v]) => `--ecx-color-${k}:${v}`),
        ...Object.entries(p.fontSizes ?? {}).map(([k, v]) => `--ecx-font-size-${k}:${v}`),
        ...Object.entries(p.spacing ?? {}).map(([k, v]) => `--ecx-spacing-${k}:${v}`),
        ...Object.entries(p.fonts ?? {}).map(([k, v]) => `--ecx-font-family-${k}:${v}`),
        ...Object.entries(p.gradients ?? {}).map(([k, v]) => `--ecx-gradient-${k}:${v}`),
        ...Object.entries(p.shadows ?? {}).map(([k, v]) => `--ecx-shadow-${k}:${v}`),
        ...(p.layout?.contentWidth ? [`--ecx-content-width:${p.layout.contentWidth}`] : []),
        ...(p.layout?.wideWidth ? [`--ecx-wide-width:${p.layout.wideWidth}`] : []),
    ];
    let css = decl.length ? `${selector}{${decl.join(";")}}` : "";
    // Global Styles: :where() giữ độ ưu tiên thấp → kiểu riêng của từng khối (.ecx-s-…) luôn thắng
    // :not(.ecx-doc-title): ô tiêu đề bài của trình soạn nằm trong vùng nội dung nhưng trên website tiêu đề ở ngoài → không mang kiểu nội dung
    const scoped = (sel) => sel.split(",").map((x) => `:where(.ecx-content) ${x.trim()}:where(:not(.ecx-doc-title))`).join(",");
    for (const [name, st] of Object.entries(p.elements ?? {}))
        css += ruleCss(scoped(ELEMENT_SELECTORS[name]), st);
    for (const [name, st] of Object.entries(p.blocks ?? {}))
        css += ruleCss(scoped(BLOCK_SELECTORS[name]), st);
    return css;
}

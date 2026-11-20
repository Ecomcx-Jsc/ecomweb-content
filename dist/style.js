import { normalizeCustomCss, scopeCustomCss } from "./custom-css.js";
/**
 * Kiểu dáng của khối (`attrs.style`, mọi khối): khoảng cách, cỡ chữ, màu, viền, ẩn theo khổ màn hình.
 * Giá trị theo khổ: `{ base, tablet, mobile }` (tablet ≤ 1024px, mobile ≤ 640px). Giá trị là preset của theme
 * (`lg`, `primary` → biến CSS `--ecx-spacing-lg`, `--ecx-color-primary`) hoặc giá trị CSS đã kiểm (độ dài, màu).
 * Chỉ nhận giá trị trong danh sách → không chèn được CSS tuỳ ý. Máy chủ chạy cùng quy tắc (ContentFormat.cs).
 */
export const BREAKPOINTS = { tablet: 1024, mobile: 640 };
export const DEVICES = ["base", "tablet", "mobile"];
export const DIVIDER_SHAPES = ["wave", "curve", "tilt", "triangle", "zigzag", "arrow", "stairs", "ripple", "mountains"];
export const OVERLAY_BLENDS = ["multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
const hasBgFx = (bg) => !!(bg?.image && ((bg.imageOpacity ?? 100) < 100 || bg.imageBlur || bg.imageBlend));
const hasOverlay = (bg) => !!(bg && (bg.overlay || bg.overlayGradient || bg.overlayImage || hasBgFx(bg)));
const SIDES = ["top", "right", "bottom", "left"];
const CORNERS = ["topLeft", "topRight", "bottomRight", "bottomLeft"];
const LENGTH = /^(0|-?\d{1,4}(\.\d{1,3})?(px|rem|em|%|vw|vh))$/;
const PRESET = /^([a-z][a-z0-9-]{0,30}|[1-9]x[sl])$/;
/** Màu của website kèm độ đậm: `primary/40` = màu chính 40% (còn lại trong suốt) — nền mờ nhìn xuyên được ảnh phía sau. */
const PRESET_ALPHA = /^([a-z][a-z0-9-]{0,30})\/([1-9]\d?)$/;
const COLOR = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/]{1,40}\))$/i;
const WEIGHTS = ["300", "400", "500", "600", "700", "800", "900"];
const ALIGNS = ["left", "center", "right", "justify"];
const BORDER_STYLES = ["solid", "dashed", "dotted"];
const HIDE = ["desktop", "tablet", "mobile"];
const FONT_STYLES = ["normal", "italic"];
const DECORATIONS = ["none", "underline", "line-through"];
const TRANSFORMS = ["none", "uppercase", "lowercase", "capitalize"];
const preset = (v) => (typeof v === "string" && PRESET.test(v) ? v : undefined);
// 1.26: thêm hướng đảo và dàn đều quanh / đều nhau
const DIRECTIONS = ["row", "column", "row-reverse", "column-reverse"];
const JUSTIFY = ["start", "center", "end", "between", "around", "evenly"];
const ALIGN_ITEMS = ["start", "center", "end", "stretch"];
const RATIOS = ["1/1", "4/3", "3/2", "16/9", "21/9", "3/4", "2/3", "9/16"];
/** Hiệu ứng khi cuộn tới có sẵn ở lõi (keyframes `ecx-in-<mã>` trong style.css). Plugin thêm mã khác. */
export const MOTION_IN = ["fade", "slide-up", "slide-down", "slide-left", "slide-right", "zoom-in", "zoom-out", "blur-in", "flip-x", "flip-y", "rotate-in", "bounce-in", "reveal-up", "reveal-left"];
/** 1.31: nhịp chạy (easing) của hiệu ứng vào, hiệu ứng lặp liên tục và thị sai (parallax) khi cuộn. */
export const MOTION_EASE = ["smooth", "snappy", "bounce", "linear"];
export const MOTION_LOOP = ["float", "pulse", "spin", "swing"];
export const MOTION_PARALLAX = ["slow", "fast", "reverse"];
/** Hiệu ứng khi rê chuột có sẵn ở lõi. */
export const MOTION_HOVER = ["lift", "grow", "brighten", "glow", "rotate", "tilt", "gray", "shrink"];
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
const int = (min, max) => (v) => {
    const n = typeof v === "number" ? v : typeof v === "string" && /^-?\d{1,5}$/.test(v.trim()) ? Number(v) : NaN;
    return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};
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
    const e = oneOf(MOTION_EASE)(v.ease);
    if (out.in && e && e !== "smooth")
        out.ease = e;
    const lp = oneOf(MOTION_LOOP)(v.loop);
    if (lp)
        out.loop = lp;
    const px = oneOf(MOTION_PARALLAX)(v.parallax);
    if (px && !out.in && !lp)
        out.parallax = px;
    return Object.keys(out).length ? out : undefined;
}
/** Địa chỉ video nền: đường dẫn trong site hoặc https, đuôi mp4 / webm / ogg / m4v / mov. */
function bgVideoUrl(v) {
    const u = typeof v === "string" ? v.trim() : "";
    return /^(\/(?!\/)|https:\/\/)[^\s"'()\\<>]{1,1000}$/.test(u) && /\.(mp4|webm|ogv|ogg|m4v|mov)(\?[^#]*)?(#.*)?$/i.test(u) ? u : undefined;
}
/** Video nền của khối (từ style.background.video đã chuẩn hoá); không có → null. */
export function blockBgVideo(style) {
    return normalizeStyle(style)?.background?.video ?? null;
}
export const PLACE_TYPES = ["relative", "absolute", "fixed"];
export const TRANSFORM_ORIGINS = ["top left", "top", "top right", "left", "center", "right", "bottom left", "bottom", "bottom right"];
const numIn = (min, max) => (v) => {
    const n = typeof v === "number" ? v : typeof v === "string" && /^-?\d{1,4}(\.\d{1,3})?$/.test(v.trim()) ? Number(v) : NaN;
    return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
};
const BG_URL = /^(\/(?!\/)|https:\/\/)[^\s"'()\\<>]{1,1000}$/;
const BG_SIZES = ["cover", "contain", "auto"];
const bgUrl = (v) => (typeof v === "string" && BG_URL.test(v.trim()) ? v.trim() : undefined);
const bgPosition = (v) => {
    const m = typeof v === "string" ? /^(\d{1,3})% (\d{1,3})%$/.exec(v.trim()) : null;
    return m && Number(m[1]) <= 100 && Number(m[2]) <= 100 ? `${Number(m[1])}% ${Number(m[2])}%` : undefined;
};
function textShadow(v) {
    if (!isObj(v))
        return undefined;
    const x = int(-50, 50)(v.x), y = int(-50, 50)(v.y), blur = int(0, 50)(v.blur), c = color(v.color);
    return x !== undefined && y !== undefined && blur !== undefined && c ? { x, y, blur, color: c } : undefined;
}
function dividerOne(v) {
    if (!isObj(v))
        return undefined;
    const shape = oneOf(DIVIDER_SHAPES)(v.shape), c = color(v.color);
    if (!shape || !c)
        return undefined;
    const h = int(10, 300)(v.height);
    return { shape, color: c, ...(h !== undefined && h !== DIVIDER_HEIGHT && { height: h }), ...(v.flip === true && { flip: true }) };
}
function dividers(v) {
    if (!isObj(v))
        return undefined;
    const top = dividerOne(v.top), bottom = dividerOne(v.bottom);
    return top || bottom ? { ...(top && { top }), ...(bottom && { bottom }) } : undefined;
}
const DIVIDER_HEIGHT = 80;
/** Hình đường chia: vẽ trong khung 1200 × 100, phần tô nằm phía dưới (đường chia dưới); đường chia trên lật dọc. */
function zigzagPath() { let d = "M0 100V40"; for (let x = 0; x < 1200; x += 60)
    d += `L${x + 30} 0L${x + 60} 40`; return `${d}V100Z`; }
export const DIVIDER_PATHS = {
    wave: "M0 50C200 0 400 0 600 50S1000 100 1200 50V100H0Z",
    curve: "M0 100Q600 -100 1200 100Z",
    tilt: "M0 100L1200 0V100Z",
    triangle: "M0 100L600 0L1200 100Z",
    zigzag: zigzagPath(),
    arrow: "M0 100V60H540L600 0L660 60H1200V100Z",
    stairs: "M0 100V80H240V60H480V40H720V20H960V0H1200V100Z",
    ripple: "M0 60C150 20 300 100 450 60S750 20 900 60 1050 100 1200 60V100H0Z",
    mountains: "M0 100L200 30L360 70L600 0L820 60L1000 20L1200 80V100Z",
};
const dividerImage = (d, top) => {
    const m = `${d.flip ? -1 : 1} 0 0 ${top ? -1 : 1} ${d.flip ? 1200 : 0} ${top ? 100 : 0}`;
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 100' preserveAspectRatio='none'%3E%3Cpath transform='matrix(${m})' d='${DIVIDER_PATHS[d.shape]}'/%3E%3C/svg%3E")`;
};
/** CSS đường chia: một ::after phủ kín khối; mỗi đường là một lớp nền (màu) cắt bằng mặt nạ hình. */
function dividerCss(div) {
    const L = [["top", div.top], ["bottom", div.bottom]].filter((x) => !!x[1]);
    const h = (d) => `${d.height ?? DIVIDER_HEIGHT}px`;
    const join = (f) => L.map(([s, d]) => f(s, d)).join(",");
    const bgc = join((_, d) => `linear-gradient(${colorValue(d.color)},${colorValue(d.color)})`);
    const size = join((_, d) => `100% ${h(d)}`), pos = join((s) => s), rep = join(() => "no-repeat"), img = join((s, d) => dividerImage(d, s === "top"));
    return `content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:${bgc};background-size:${size};background-position:${pos};background-repeat:${rep};-webkit-mask-image:${img};mask-image:${img};-webkit-mask-size:${size};mask-size:${size};-webkit-mask-position:${pos};mask-position:${pos};-webkit-mask-repeat:${rep};mask-repeat:${rep}`;
}
function background(v) {
    if (!isObj(v))
        return undefined;
    const out = {};
    const bgc = responsive(v.color, color);
    if (bgc)
        out.color = bgc;
    const image = responsive(v.image, bgUrl);
    if (image)
        out.image = image;
    const sz = responsive(v.size, oneOf(BG_SIZES));
    if (sz)
        out.size = sz;
    const pos = responsive(v.position, bgPosition);
    if (pos)
        out.position = pos;
    if (v.repeat === true)
        out.repeat = true;
    if (v.fixed === true)
        out.fixed = true;
    const vid = bgVideoUrl(v.video);
    if (vid)
        out.video = vid;
    const ov = color(v.overlay), og = normalizeGradient(v.overlayGradient), oi = bgUrl(v.overlayImage);
    if (ov)
        out.overlay = ov;
    if (og)
        out.overlayGradient = og;
    if (oi)
        out.overlayImage = oi;
    const int = (x, max) => { const n = typeof x === "number" ? x : typeof x === "string" && /^\d{1,3}$/.test(x) ? Number(x) : NaN; return Number.isInteger(n) && n >= 0 && n <= max ? n : undefined; };
    if (image) {
        const io = int(v.imageOpacity, 100);
        if (io !== undefined && io < 100)
            out.imageOpacity = io;
        const ib = int(v.imageBlur, 40);
        if (ib)
            out.imageBlur = ib;
        const iBlend = oneOf(OVERLAY_BLENDS)(v.imageBlend);
        if (iBlend)
            out.imageBlend = iBlend;
    }
    if (ov || og || oi) {
        const blend = oneOf(OVERLAY_BLENDS)(v.overlayBlend);
        if (blend)
            out.overlayBlend = blend;
        const n = typeof v.overlayOpacity === "number" ? v.overlayOpacity : typeof v.overlayOpacity === "string" && /^\d{1,3}$/.test(v.overlayOpacity) ? Number(v.overlayOpacity) : NaN;
        if (Number.isInteger(n) && n >= 0 && n <= 100)
            out.overlayOpacity = n;
    }
    return Object.keys(out).length ? out : undefined;
}
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const size = (v) => (typeof v === "string" && (LENGTH.test(v) || PRESET.test(v)) ? v : undefined);
const color = (v) => (typeof v === "string" && (COLOR.test(v.trim()) || PRESET.test(v) || PRESET_ALPHA.test(v.trim())) ? v.trim() : undefined);
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
function corners(v) {
    if (typeof v === "string")
        return size(v);
    if (!isObj(v))
        return undefined;
    const out = {};
    for (const c of CORNERS) {
        const x = size(v[c]);
        if (x !== undefined)
            out[c] = x;
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
    set("textShadow", textShadow(v.textShadow));
    set("writingMode", oneOf(["vertical"])(v.writingMode));
    if (isObj(v.place) && PLACE_TYPES.includes(String(v.place.type))) {
        const pl = { type: v.place.type };
        for (const k of ["top", "right", "bottom", "left"]) {
            const r = responsive(v.place[k], size);
            if (r)
                pl[k] = r;
        }
        set("place", pl);
    }
    if (isObj(v.transform)) {
        const tr = {};
        const t = v.transform;
        const rot = responsive(t.rotate, numIn(-360, 360));
        if (rot)
            tr.rotate = rot;
        const sc = responsive(t.scale, numIn(0.1, 3));
        if (sc)
            tr.scale = sc;
        const sx = responsive(t.skewX, numIn(-60, 60));
        if (sx)
            tr.skewX = sx;
        const sy = responsive(t.skewY, numIn(-60, 60));
        if (sy)
            tr.skewY = sy;
        const x = responsive(t.x, size);
        if (x)
            tr.x = x;
        const y = responsive(t.y, size);
        if (y)
            tr.y = y;
        if (typeof t.origin === "string" && TRANSFORM_ORIGINS.includes(t.origin) && t.origin !== "center")
            tr.origin = t.origin;
        if (Object.keys(tr).length)
            set("transform", tr);
    }
    {
        const bb = typeof v.backdropBlur === "string" && /^([0-9]|[1-3][0-9]|40)(\.\d)?px$/.test(v.backdropBlur.trim()) ? v.backdropBlur.trim() : undefined;
        set("backdropBlur", bb);
    }
    set("color", group(v.color, { text: color, background: color }));
    const bw = isObj(v.border) ? box(v.border.width) : undefined, bo = group(v.border, { style: oneOf(BORDER_STYLES), color });
    set("border", bw !== undefined || bo ? { ...(bw !== undefined && { width: bw }), ...bo } : undefined);
    set("radius", corners(v.radius));
    if (Array.isArray(v.hide)) {
        const h = HIDE.filter((d) => v.hide.includes(d));
        if (h.length)
            out.hide = [...h];
    }
    set("layout", layout(v.layout));
    set("gradient", normalizeGradient(v.gradient));
    set("textGradient", normalizeGradient(v.textGradient));
    set("link", group(v.link, { color, hover: color }));
    set("shadow", shadow(v.shadow));
    set("aspectRatio", oneOf(RATIOS)(v.aspectRatio));
    if (isObj(v.position) && v.position.type === "sticky") {
        const top = size(v.position.top);
        set("position", top ? { type: "sticky", top } : { type: "sticky" });
    }
    set("hover", hover(v.hover));
    set("motion", motion(v.motion));
    set("background", background(v.background));
    set("divider", dividers(v.divider));
    set("zIndex", int(-1, 9999)(v.zIndex));
    set("grow", int(0, 10)(v.grow));
    set("order", responsive(v.order, int(-10, 10)));
    set("customCss", normalizeCustomCss(v.customCss));
    if (isObj(v.schedule)) {
        const iso = (x) => { const t = typeof x === "string" ? Date.parse(x) : NaN; return Number.isFinite(t) && t > 0 && t < 4102444800000 ? new Date(t).toISOString() : undefined; };
        const from = iso(v.schedule.from), until = iso(v.schedule.until);
        if (from || until)
            set("schedule", { ...(from ? { from } : {}), ...(until ? { until } : {}) });
    }
    if (v.audience === "guest" || v.audience === "user")
        set("audience", v.audience);
    return Object.keys(out).length ? out : undefined;
}
// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------
const lit = (v) => v === "auto" || v === "0" || LENGTH.test(v);
const spacing = (v) => (lit(v) ? v : `var(--ecx-spacing-${v})`);
const fontSize = (v) => (lit(v) ? v : `var(--ecx-font-size-${v})`);
const colorValue = (v) => {
    if (COLOR.test(v))
        return v;
    const m = PRESET_ALPHA.exec(v);
    return m ? `color-mix(in srgb, var(--ecx-color-${m[1]}, ${m[1]}) ${m[2]}%, transparent)` : `var(--ecx-color-${v}, ${v})`;
};
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
        const od = style.order?.[d];
        if (od !== undefined)
            out[d].push(`order:${od}`);
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
    if (style.textShadow)
        out.base.push(`text-shadow:${style.textShadow.x}px ${style.textShadow.y}px ${style.textShadow.blur}px ${colorValue(style.textShadow.color)}`);
    if (style.writingMode)
        out.base.push("writing-mode:vertical-rl", "text-orientation:mixed");
    if (style.background?.video)
        out.base.push("position:relative", "isolation:isolate", "overflow:hidden");
    if (style.backdropBlur)
        out.base.push(`backdrop-filter:blur(${style.backdropBlur})`, `-webkit-backdrop-filter:blur(${style.backdropBlur})`);
    if (style.color?.text)
        out.base.push(`color:${colorValue(style.color.text)}`);
    if (style.color?.background)
        out.base.push(`background:${colorValue(style.color.background)}`);
    if (style.border?.width || style.border?.style || style.border?.color) {
        const w = style.border.width;
        out.base.push(`border:${typeof w === "string" ? spacing(w) : "1px"} ${style.border.style ?? "solid"} ${style.border.color ? colorValue(style.border.color) : "currentColor"}`);
        if (w && typeof w === "object")
            out.base.push(`border-width:${SIDES.map((x) => (w[x] ? spacing(w[x]) : "0")).join(" ")}`);
    }
    const r = style.radius;
    if (r)
        out.base.push(`border-radius:${typeof r === "string" ? spacing(r) : CORNERS.map((x) => (r[x] ? spacing(r[x]) : "0")).join(" ")}`);
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
    if (style.textGradient)
        out.base.push(`background:${gradientValue(style.textGradient)}`, "-webkit-background-clip:text", "background-clip:text", "-webkit-text-fill-color:transparent");
    if (style.shadow)
        out.base.push(`box-shadow:${shadowValue(style.shadow)}`);
    if (style.aspectRatio)
        out.base.push(`aspect-ratio:${style.aspectRatio}`, "object-fit:cover");
    // Định vị tuỳ ý (không dùng chung với ghim khi cuộn): kiểu + khoảng lệch theo khổ (khổ nhỏ kế thừa khổ lớn)
    if (style.place && !style.position) {
        out.base.push(`position:${style.place.type}`);
        for (const d of DEVICES)
            for (const side of ["top", "right", "bottom", "left"]) {
                const v = style.place[side]?.[d];
                if (v !== undefined)
                    out[d].push(`${side}:${spacing(v)}`);
            }
        if (style.zIndex === undefined && style.place.type !== "relative")
            out.base.push("z-index:1");
    }
    // Biến đổi: mỗi khổ phát CẢ chuỗi transform (CSS không trộn từng phần giữa các khổ) với giá trị kế thừa từ khổ lớn hơn
    if (style.transform) {
        const t = style.transform;
        const eff = (r, d) => (r ? (d === "mobile" ? r.mobile ?? r.tablet ?? r.base : d === "tablet" ? r.tablet ?? r.base : r.base) : undefined);
        for (const d of DEVICES) {
            const touched = [t.rotate, t.scale, t.skewX, t.skewY, t.x, t.y].some((r) => r?.[d] !== undefined);
            if (!touched)
                continue;
            const x = eff(t.x, d), y = eff(t.y, d), rot = eff(t.rotate, d), sc = eff(t.scale, d), sx = eff(t.skewX, d), sy = eff(t.skewY, d);
            const parts = [x !== undefined || y !== undefined ? `translate(${x !== undefined ? spacing(x) : "0"},${y !== undefined ? spacing(y) : "0"})` : "", rot ? `rotate(${rot}deg)` : "", sc !== undefined && sc !== 1 ? `scale(${sc})` : "", sx || sy ? `skew(${sx ?? 0}deg,${sy ?? 0}deg)` : ""].filter(Boolean);
            out[d].push(`transform:${parts.length ? parts.join(" ") : "none"}`);
        }
        if (t.origin)
            out.base.push(`transform-origin:${t.origin}`);
    }
    if (style.position)
        out.base.push("position:sticky", `top:${style.position.top ? spacing(style.position.top) : "0"}`, `z-index:${style.zIndex ?? 10}`);
    else if (style.zIndex !== undefined)
        out.base.push(...(hasOverlay(style.background) || style.place ? [] : ["position:relative"]), `z-index:${style.zIndex}`); // đã định vị (place) → không ép relative đè absolute / fixed
    if (style.grow !== undefined)
        out.base.push(`flex-grow:${style.grow}`);
    // 1.22: ảnh nền — sau background (màu / chuyển màu) để không bị thuộc tính gộp ghi đè; chuyển màu phủ lên ảnh
    const bg = style.background;
    const fx = hasBgFx(bg);
    if (bg) {
        for (const d of DEVICES) {
            const dc = bg.color?.[d];
            if (dc)
                out[d].push(`background-color:${colorValue(dc)}`);
            const img = fx ? undefined : bg.image?.[d];
            if (img)
                out[d].push(`background-image:${style.gradient ? `${gradientValue(style.gradient)},` : ""}url("${img}")`);
            const sz = bg.size?.[d];
            if (sz && !fx)
                out[d].push(`background-size:${sz}`);
            const pos = bg.position?.[d];
            if (pos && !fx)
                out[d].push(`background-position:${pos}`);
        }
        if (bg.image && !fx) {
            if (!bg.size?.base)
                out.base.push("background-size:cover");
            if (!bg.position?.base)
                out.base.push("background-position:50% 50%");
            out.base.push(`background-repeat:${bg.repeat ? "repeat" : "no-repeat"}`);
            // Cố định khi cuộn: điện thoại (iOS) không hỗ trợ và giật → cuộn bình thường trên khổ nhỏ
            if (bg.fixed) {
                out.base.push("background-attachment:fixed");
                out.tablet.push("background-attachment:scroll");
            }
        }
        if (hasOverlay(bg)) {
            out.base.push("isolation:isolate");
            if (!style.position)
                out.base.push("position:relative");
        }
    }
    if (style.divider && !hasOverlay(style.background))
        out.base.push("isolation:isolate", ...(style.position ? [] : ["position:relative"]));
    if (style.hover)
        out.base.push("transition:color .2s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease,transform .2s ease");
    return out;
}
const JUSTIFY_CSS = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around", evenly: "space-evenly" };
const ALIGN_CSS = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
/** Bóng có sẵn (theme ghi đè bằng preset cùng tên). */
const SHADOWS = {
    sm: "0 1px 2px rgb(0 0 0 / .08)", md: "0 4px 12px rgb(0 0 0 / .1)", lg: "0 12px 32px rgb(0 0 0 / .14)", xl: "0 24px 64px rgb(0 0 0 / .18)",
};
const shadowValue = (v) => (v === "none" ? "none" : `var(--ecx-shadow-${v}${SHADOWS[v] ? `, ${SHADOWS[v]}` : ""})`);
const gradientValue = (v) => (PRESET.test(v) ? `var(--ecx-gradient-${v})` : v);
/** Khai báo khi rê chuột. */
function hoverDeclarations(h, strong) {
    const imp = strong ? "!important" : "";
    const out = [];
    // strong (kiểu của từng khối / phần): !important — nút có màu nền-chữ nội tuyến (style="color:…") sẽ thắng luật :hover nếu không ép. Global Styles giữ độ ưu tiên thấp
    if (h.color?.text)
        out.push(`color:${colorValue(h.color.text)}${imp}`);
    if (h.color?.background)
        out.push(`background:${colorValue(h.color.background)}${imp}`);
    if (h.border?.color)
        out.push(`border-color:${colorValue(h.border.color)}${imp}`);
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
    glow: "box-shadow:0 0 28px color-mix(in srgb, var(--ecx-accent, var(--primary, #1a597b)) 45%, transparent)",
    rotate: "transform:rotate(3deg)",
    tilt: "transform:perspective(800px) rotateX(4deg) rotateY(-6deg) scale(1.02)",
    gray: "filter:grayscale(0)",
    shrink: "transform:scale(.96)",
};
const EASES = { smooth: "cubic-bezier(.2, .7, .3, 1)", snappy: "cubic-bezier(.7, 0, .2, 1)", bounce: "cubic-bezier(.34, 1.56, .64, 1)", linear: "linear" };
const PARALLAX_PX = { slow: "-40px", fast: "-120px", reverse: "60px" };
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
    // Hiệu ứng lặp dùng chung thuộc tính `animation` với hiệu ứng vào → gộp thành một danh sách. Thị sai đứng riêng (normalize bỏ nó khi có vào / lặp).
    const loop = m.loop ? `ecx-loop-${m.loop} ${m.loop === "spin" ? "12s linear" : m.loop === "pulse" ? "2.4s ease-in-out" : "4s ease-in-out"} infinite` : "";
    const anim = (first) => [first, loop].filter(Boolean).join(",");
    if (!m.in && loop)
        css += `${sel}{animation:${loop}}`;
    if (m.parallax)
        css += `@supports (animation-timeline:view()){${sel}{--ecx-px:${PARALLAX_PX[m.parallax]};animation:ecx-parallax linear both;animation-timeline:view()}}`;
    if (m.in) {
        const dur = MOTION_DURATIONS[m.duration ?? "normal"];
        const delay = m.delay ?? 0;
        const name = `ecx-in-${m.in}`;
        const ease = m.ease ? EASES[m.ease] : EASE;
        if (m.stagger) {
            css += `html.ecx-js ${sel}.ecx-in:not(.is-in)>*{opacity:0}`;
            css += `${sel}.is-in>*{animation:${name} ${dur}ms ${ease} calc(${delay}ms + var(--ecx-i, 0) * var(--ecx-stagger-step, 80ms)) backwards}`;
            if (loop)
                css += `${sel}{animation:${loop}}`;
        }
        else {
            css += `html.ecx-js ${sel}.ecx-in:not(.is-in){opacity:0}`;
            css += `${sel}.is-in{animation:${anim(`${name} ${dur}ms ${ease} ${delay}ms backwards`)}}`;
            if (loop)
                css += `${sel}:not(.is-in){animation:${loop}}`;
        }
    }
    if (m.hover) {
        // Giữ cả các thuộc tính chuyển của hover cũ (style.hover) để hai loại hover dùng chung một khối không mất hiệu ứng
        const props = ["transform", "box-shadow", "filter", ...(style.hover ? ["color", "background", "border-color"] : [])];
        css += `${sel}{transition:${props.map((p) => `${p} .25s ${EASE}`).join(",")}}`;
        css += `@media (hover:hover){${sel}:hover{${HOVER_FX[m.hover]}}}`;
    }
    if (m.hover === "gray")
        css += `${sel}{filter:grayscale(1)}`;
    const calm = [m.loop || m.parallax ? `${sel}{animation:none}` : "", m.in ? `${sel}.is-in,${sel}.is-in>*{animation:none}` : "", m.hover ? `${sel}{transition:none}${sel}:hover{transform:none}` : ""].join("");
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
    return ruleCss(`.${cls}.${cls}`, style, true) + motionCss(style, cls) + scopeCustomCss(style.customCss, `.${cls}.${cls}`).css;
}
/**
 * CSS của một kiểu dáng cho bộ chọn bất kỳ (danh sách cách nhau dấu phẩy) — dùng cho kiểu của từng khối và Global Styles
 * (kiểu mặc định theo loại khối / phần tử). Bộ chọn do mã gọi đưa vào, không lấy từ dữ liệu người dùng.
 */
export function ruleCss(selector, style, strongHover = false) {
    const sel = selector;
    const each = (suffix) => sel.split(",").map((x) => `${x.trim()}${suffix}`).join(",");
    const d = declarations(style);
    let css = d.base.length ? `${sel}{${d.base.join(";")}}` : "";
    // Khối absolute: khối cha trực tiếp thành điểm neo (position:relative) trừ khi cha tự định vị bằng quy tắc mạnh hơn (độ ưu tiên 0)
    if (style.place?.type === "absolute" && !style.position)
        css += `:where(:has(>${sel.split(",")[0].trim()})){position:relative}`;
    if (d.tablet.length)
        css += `@media (max-width:${BREAKPOINTS.tablet}px){${sel}{${d.tablet.join(";")}}}`;
    if (d.mobile.length)
        css += `@media (max-width:${BREAKPOINTS.mobile}px){${sel}{${d.mobile.join(";")}}}`;
    for (const h of style.hide ?? []) {
        const q = h === "desktop" ? `(min-width:${BREAKPOINTS.tablet + 1}px)` : h === "tablet" ? `(min-width:${BREAKPOINTS.mobile + 1}px) and (max-width:${BREAKPOINTS.tablet}px)` : `(max-width:${BREAKPOINTS.mobile}px)`;
        css += `@media ${q}{${sel}{display:none!important}}`;
    }
    if (style.hover) {
        const hv = hoverDeclarations(style.hover, strongHover);
        if (hv.length)
            css += `${each(":hover")}{${hv.join(";")}}`;
    }
    if (style.link?.color)
        css += `${each(" a")}{color:${colorValue(style.link.color)}}`;
    if (style.link?.hover)
        css += `${each(" a:hover")}{color:${colorValue(style.link.hover)}}`;
    // Lớp phủ ảnh nền: ::before nằm giữa nền và nội dung (z-index -1 trong ngữ cảnh isolation của khối)
    const bgo = style.background;
    const fxOn = hasBgFx(bgo);
    if (fxOn) {
        // Ảnh nền có hiệu ứng: lớp ::before riêng (mờ / làm mờ / hoà trộn) nằm dưới nội dung; lớp phủ chuyển sang ::after
        const b = bgo;
        const layer = (d) => {
            const img = b.image?.[d], sz = b.size?.[d], pos = b.position?.[d];
            return [img ? `background-image:url("${img}")` : "", sz ? `background-size:${sz}` : "", pos ? `background-position:${pos}` : ""].filter(Boolean).join(";");
        };
        const blur = b.imageBlur ?? 0;
        const baseDecl = `content:"";position:absolute;inset:${blur ? `-${blur * 2}px` : "0"};z-index:-1;pointer-events:none;border-radius:inherit;${layer("base")};${b.size?.base ? "" : "background-size:cover;"}${b.position?.base ? "" : "background-position:50% 50%;"}background-repeat:${b.repeat ? "repeat" : "no-repeat"};${b.fixed ? "background-attachment:fixed;" : ""}${(b.imageOpacity ?? 100) < 100 ? `opacity:${(b.imageOpacity ?? 100) / 100};` : ""}${blur ? `filter:blur(${blur}px);` : ""}${b.imageBlend ? `mix-blend-mode:${b.imageBlend};` : ""}`;
        css += `${each("::before")}{${baseDecl.replace(/;$/, "")}}`;
        if (blur)
            css += `${sel}{overflow:hidden}`;
        const t = layer("tablet"), m = layer("mobile");
        if (t)
            css += `@media (max-width:${BREAKPOINTS.tablet}px){${each("::before")}{${t}}}`;
        if (m)
            css += `@media (max-width:${BREAKPOINTS.mobile}px){${each("::before")}{${m}}}`;
    }
    if (bgo && (bgo.overlay || bgo.overlayGradient || bgo.overlayImage)) {
        // Lớp phủ: màu (nền) + chuyển màu / ảnh xếp trên; hoà trộn với nền bằng mix-blend-mode
        const layers = [bgo.overlayImage ? `url("${bgo.overlayImage}")` : "", bgo.overlayGradient ? gradientValue(bgo.overlayGradient) : ""].filter(Boolean).join(",");
        css += `${each(fxOn ? "::after" : "::before")}{content:"";position:absolute;inset:0;${bgo.overlay ? `${layers ? "background-color" : "background"}:${colorValue(bgo.overlay)};` : ""}${layers ? `background-image:${layers};` : ""}${bgo.overlayImage ? "background-size:cover;background-position:center;background-repeat:no-repeat;" : ""}${bgo.overlayBlend ? `mix-blend-mode:${bgo.overlayBlend};` : ""}opacity:${(bgo.overlayOpacity ?? 50) / 100};pointer-events:none;z-index:-1;border-radius:inherit}`;
    }
    if (style.divider)
        css += `${each("::after")}{${dividerCss(style.divider)}}`;
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
    button: ["pill"],
    group: ["card"],
};
/** Bộ chọn của khối lõi trên website (markup của renderer) — Global Styles theo loại khối. */
export const BLOCK_SELECTORS = {
    paragraph: "p", heading: "h1,h2,h3,h4,h5,h6", bulletList: "ul", orderedList: "ol", blockquote: "blockquote", codeBlock: "pre",
    image: ".ecx-image", gallery: ".ecx-gallery", table: ".ecx-table table", group: ".ecx-group",
    columns: ".ecx-columns", column: ".ecx-column", buttons: ".ecx-buttons-group", button: ".ecx-button", spacer: ".ecx-spacer",
    cover: ".ecx-cover", details: ".ecx-details", accordion: ".ecx-accordion", countdown: ".ecx-countdown", lottie: ".ecx-lottie", socialLinks: ".ecx-social", form: ".ecx-form-blocks",
    iconBox: ".ecx-icon-box", imageBox: ".ecx-image-box", imageOverlay: ".ecx-image-overlay", iconList: ".ecx-icon-list", counter: ".ecx-counter", testimonial: ".ecx-testimonial", progressBar: ".ecx-progress", map: ".ecx-map",
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
/** Khối có đang trong lịch hiển thị không (không đặt lịch → luôn hiện). Hết hạn = `until` đã qua; chưa tới = `from` chưa tới. */
export function scheduleVisible(style, now = Date.now()) {
    const sc = style?.schedule;
    if (!sc)
        return true;
    if (sc.from && now < Date.parse(sc.from))
        return false;
    if (sc.until && now >= Date.parse(sc.until))
        return false;
    return true;
}

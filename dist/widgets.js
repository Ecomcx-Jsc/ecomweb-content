import { encodeSafe, safeUrl } from "./url.js";
/**
 * 1.23: khối "widget" của lõi (Icon Box, Image Box, Icon List, Counter, Testimonial, Progress Bar) — markup dựng MỘT lần ở đây
 * thành cây phần tử (khoá props kiểu React); website (theme-sdk) và khung soạn (TextEditor) chỉ đổi cây ra React → hai nơi vẽ y hệt.
 * Chỉ dùng token --ecx-* (style.css); không JS, trừ số đếm của Counter (website thay `client: "counter"` bằng component đếm khi cuộn tới).
 */
/** Tập icon cố định (24×24, nét 2, lucide). Chỉ nhận tên trong bảng — không nhận SVG tuỳ ý (chống XSS). Khối `icon` dùng chung. */
export const ICON_PATHS = {
    check: "M20 6 9 17l-5-5",
    x: "M18 6 6 18M6 6l12 12",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
    arrowRight: "M5 12h14M12 5l7 7-7 7",
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
    mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
    mapPin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
    info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01",
    alert: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    externalLink: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
};
export const ICON_NAMES = Object.keys(ICON_PATHS);
/** Kính lúp của khối Tìm kiếm (không nằm trong bảng icon chọn được). */
export const SEARCH_ICON_PATH = "M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z";
export const WIDGET_BLOCKS = ["iconBox", "imageBox", "iconList", "counter", "testimonial", "progressBar", "map"];
const str = (v) => (typeof v === "string" ? v : "");
/** SVG của icon (trang trí: aria-hidden). Tên lạ → icon mặc định. */
/** Class của danh sách icon (dùng chung website và khung soạn). */
export function iconListClass(a) {
    const cols = a.layout === "inline" ? 1 : Math.min(4, Math.max(1, Math.round(Number(a.columns)) || 1));
    return cls("ecx-icon-list", a.layout === "inline" && "is-inline", cols > 1 && `is-cols-${cols}`, (a.iconAlign === "center" || a.iconAlign === "bottom") && `is-icon-${a.iconAlign}`, (a.iconStyle === "circle" || a.iconStyle === "square") && `has-icon-${a.iconStyle}`);
}
/** Class của khối Tab (dùng chung website và khung soạn). */
export function tabsClass(a) {
    return cls("ecx-tabs", a.orientation === "vertical" && "is-vertical", a.mobileAccordion === true && "has-mobile-accordion", (a.iconPosition === "right" || a.iconPosition === "top") && `has-icon-${a.iconPosition}`, a.iconOnly === true && "is-icon-only");
}
/** Class của khối Form (dùng chung website và khung soạn): cỡ ô nhập sm | md | lg (md = mặc định, không thêm class). */
export const formSizeClass = (a) => (a.inputSize === "sm" || a.inputSize === "lg" ? `is-size-${a.inputSize}` : "");
export const formClass = (a) => cls("ecx-form-blocks", formSizeClass(a));
export function iconEl(name, fallback = "star", stroke) {
    const d = ICON_PATHS[str(name)] ?? ICON_PATHS[fallback];
    return {
        tag: "svg", className: "ecx-widget-icon",
        props: { viewBox: "0 0 24 24", width: 24, height: 24, fill: "none", stroke: "currentColor", strokeWidth: Math.min(4, Math.max(0.5, Number(stroke) || 2)), strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" },
        children: [{ tag: "path", props: { d } }],
    };
}
/** Chữ từ thuộc tính: rỗng thì bỏ (website), trừ khi đang soạn (ô gõ luôn có để người dùng điền). */
function text(tag, className, a, field, editing, wrapHref) {
    const v = str(a[field]);
    if (!v && !editing)
        return null;
    const inner = { tag: "span", field, children: [v] };
    return { tag, className, children: [wrapHref ? { tag: "a", props: { href: wrapHref }, children: [inner] } : inner] };
}
const level = (a) => `h${Math.min(6, Math.max(2, Number(a.level) || 3))}`;
const href = (a) => (a.href ? safeUrl(a.href, "") || undefined : undefined);
const alignCss = (a) => (a.textAlign && a.textAlign !== "left" ? { textAlign: String(a.textAlign) } : undefined);
const cls = (...c) => c.filter((x) => typeof x === "string" && x).join(" ");
const kids = (...c) => c.filter(Boolean);
/** Ảnh của hộp: ảnh từ thư viện mang sẵn srcset (JPEG + WebP) và kích thước như khối image → responsive, không nhảy layout. */
function boxImage(a) {
    const src = a.src ? safeUrl(a.src, "") : "";
    if (!src)
        return null;
    const sizes = "(max-width: 768px) 100vw, 33vw";
    const tag = { tag: "img", props: { src, srcSet: str(a.srcset) || undefined, sizes: a.srcset ? sizes : undefined, alt: str(a.alt), width: Number(a.width) || undefined, height: Number(a.height) || undefined, loading: "lazy", decoding: "async" } };
    return a.webpSrcset ? { tag: "picture", children: [{ tag: "source", props: { type: "image/webp", srcSet: str(a.webpSrcset), sizes } }, tag] } : tag;
}
/** Địa chỉ khung bản đồ: host cố định, địa chỉ mã hoá trong `q` (không nhận URL do người dùng dán). Rỗng → null. */
export function mapEmbedUrl(a) {
    const address = str(a.address).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200);
    if (!address)
        return null;
    const zoom = Math.min(20, Math.max(1, Math.round(Number(a.zoom)) || 14));
    return `https://www.google.com/maps?q=${encodeSafe(address)}&z=${zoom}&t=${a.mapType === "satellite" ? "k" : "m"}&output=embed`;
}
/** Số chữ thập phân của Counter (theo giá trị đầu / cuối, tối đa 3). */
export const counterDecimals = (a) => Number.isFinite(Number(a.decimals)) && a.decimals !== undefined && a.decimals !== null && a.decimals !== "" ? Math.min(3, Math.max(0, Math.round(Number(a.decimals)))) : Math.min(3, Math.max(...[a.start, a.end].map((v) => (String(Number(v) || 0).split(".")[1] ?? "").length)));
/** Viết số của Counter: dấu nhóm nghìn theo `separator` (none | , | . | space); dấu thập phân "," khi nhóm bằng ".", còn lại ".". */
export function formatCounter(value, decimals, separator) {
    const sep = separator === "," || separator === "." ? separator : separator === "space" ? " " : "";
    const [int, frac] = Math.abs(value).toFixed(decimals).split(".");
    const grouped = sep ? int.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : int;
    return (value < 0 ? "-" : "") + grouped + (frac ? (sep === "." ? "," : ".") + frac : "");
}
/** Cây markup của khối widget; null = không phải khối widget / không có gì để vẽ. `editing` = khung soạn (giữ ô chữ rỗng, chỗ chọn ảnh). */
export function widgetMarkup(type, a = {}, editing = false) {
    switch (type) {
        case "iconBox": {
            const link = href(a);
            const mode = a.linkMode === "box" || a.linkMode === "button" ? a.linkMode : "title";
            const pos = a.position === "left" || a.position === "right" ? a.position : "top";
            const media = a.media === "number" || a.media === "none" || a.media === "image" ? a.media : "icon";
            const img = media === "image" ? boxImage(a) : null;
            const valign = pos !== "top" && (a.verticalAlign === "center" || a.verticalAlign === "bottom") ? a.verticalAlign : null;
            const style = a.iconStyle === "circle" || a.iconStyle === "square" ? a.iconStyle : null;
            const hover = a.hover === "grow" || a.hover === "flip" ? a.hover : null;
            const mediaEl = media === "none" ? null
                // Ảnh: không dùng khung tròn / vuông của icon (bo góc ảnh đặt ở phần "Icon / ảnh"); đang soạn mà chưa có ảnh → ô chọn ảnh
                : media === "image" ? (img || editing ? { tag: "span", className: "ecx-icon-box-icon is-image", slot: img ? undefined : "media", children: kids(img) } : null)
                    : media === "number" ? (str(a.number) || editing ? { tag: "span", className: cls("ecx-icon-box-icon is-number", style && `is-${style}`), children: [{ tag: "span", field: "number", children: [str(a.number)] }] } : null)
                        : { tag: "span", className: cls("ecx-icon-box-icon", style && `is-${style}`), children: [iconEl(a.icon)] };
            // Nút "Xem thêm": chữ riêng, trống = chữ mặc định do renderer điền (ngôn ngữ của trang) — ở đây để trống là "→"
            const more = mode === "button" && (link || editing) ? { tag: "span", className: "ecx-icon-box-more", children: [link && !editing ? { tag: "a", props: { href: link }, children: [{ tag: "span", field: "buttonText", children: [str(a.buttonText) || "→"] }] } : { tag: "span", field: "buttonText", children: [str(a.buttonText)] }] } : null;
            // Cả hộp là liên kết: thẻ <a> bọc ngoài (tiêu đề không còn link riêng — không lồng <a>); khi đang soạn vẫn là <div>
            const boxLink = mode === "box" && link && !editing;
            return {
                tag: boxLink ? "a" : "div", className: cls("ecx-icon-box", `is-${pos}`, valign && `is-v-${valign}`, a.fullHeight === true && "is-full-height", hover && `has-hover-${hover}`, boxLink && "is-link"), style: alignCss(a),
                props: boxLink ? { href: link } : undefined,
                children: kids(mediaEl, { tag: "div", className: "ecx-icon-box-body", children: kids(text(level(a), "ecx-icon-box-title", a, "title", editing, mode === "title" ? link : undefined), text("p", "ecx-icon-box-text", a, "text", editing), more) }),
            };
        }
        case "imageBox": {
            const img = boxImage(a);
            return {
                tag: "div", className: "ecx-image-box", style: alignCss(a),
                children: kids(img || editing ? { tag: "figure", className: "ecx-image-box-media", slot: img ? undefined : "media", children: kids(img) } : null, { tag: "div", className: "ecx-image-box-body", children: kids(text(level(a), "ecx-image-box-title", a, "title", editing, href(a)), text("p", "ecx-image-box-text", a, "text", editing)) }),
            };
        }
        case "iconList": {
            const items = (Array.isArray(a.items) ? a.items : []).filter((it) => it && typeof it.text === "string" && it.text);
            if (!items.length && !editing)
                return null;
            return {
                tag: "ul", className: iconListClass(a),
                children: items.map((it) => {
                    const label = { tag: "span", children: [it.text] };
                    const body = it.icon === "none" ? [label] : [iconEl(ICON_PATHS[str(it.icon)] ? it.icon : a.icon, "check", a.stroke), label];
                    const link = it.href ? safeUrl(it.href, "") : "";
                    return { tag: "li", children: link ? [{ tag: "a", props: { href: link }, children: body }] : body };
                }),
            };
        }
        case "counter": {
            const dec = counterDecimals(a);
            const end = Number(a.end ?? 100) || 0;
            return {
                tag: "div", className: "ecx-counter", style: alignCss(a),
                children: kids({
                    tag: "p", className: "ecx-counter-number",
                    children: kids(a.prefix ? { tag: "span", className: "ecx-counter-prefix", children: [str(a.prefix)] } : null, {
                        tag: "span", className: "ecx-counter-value", client: "counter", children: [formatCounter(end, dec, a.separator)],
                        props: { "data-start": Number(a.start) || 0, "data-end": end, "data-decimals": dec, "data-separator": str(a.separator) || "none", "data-duration": Math.max(0, Number(a.duration ?? 2000) || 0) },
                    }, a.suffix ? { tag: "span", className: "ecx-counter-suffix", children: [str(a.suffix)] } : null),
                }, text(["div", "h2", "h3", "h4", "h5", "h6"].includes(a.titleTag) ? a.titleTag : "p", "ecx-counter-title", a, "title", editing)),
            };
        }
        case "testimonial": {
            const src = a.src ? safeUrl(a.src, "") : "";
            const stars = Math.min(5, Math.max(0, Math.round(Number(a.rating)) || 0));
            const name = text("cite", "ecx-testimonial-name", a, "name", editing), role = text("span", "ecx-testimonial-role", a, "role", editing);
            return {
                tag: "figure", className: cls("ecx-testimonial", (a.variant === "plain" || a.variant === "bubble") && `is-${a.variant}`), style: alignCss(a),
                children: kids(a.quoteMark === true ? { tag: "span", className: "ecx-testimonial-mark", props: { "aria-hidden": "true" }, children: ["\u201C"] } : null, stars > 0 ? {
                    tag: "span", className: "ecx-testimonial-rating", props: { role: "img", "aria-label": `${stars}/5` },
                    children: [1, 2, 3, 4, 5].map((n) => ({ tag: "span", className: n <= stars ? "is-on" : "is-off", props: { "aria-hidden": "true" }, children: ["\u2605"] })),
                } : null, { tag: "blockquote", className: "ecx-testimonial-quote", children: kids(text("p", undefined, a, "quote", editing)) }, src || name || role ? {
                    tag: "figcaption", className: "ecx-testimonial-author",
                    children: kids(src ? { tag: "img", className: "ecx-testimonial-avatar", props: { src, alt: str(a.alt), width: 48, height: 48, loading: "lazy", decoding: "async" } } : null, name || role ? { tag: "span", className: "ecx-testimonial-meta", children: kids(name, role) } : null),
                } : null),
            };
        }
        case "map": {
            const src = mapEmbedUrl(a);
            const height = Math.min(1000, Math.max(150, Math.round(Number(a.height)) || 360));
            if (!src)
                return editing ? { tag: "div", className: "ecx-map is-empty", style: { minHeight: `${height}px` }, children: [{ tag: "span", className: "ecx-map-address", field: "address", children: [str(a.address)] }] } : null;
            return {
                tag: "div", className: "ecx-map",
                children: [{ tag: "iframe", props: { src, title: str(a.title) || str(a.address), loading: "lazy", referrerPolicy: "no-referrer-when-downgrade", allowFullScreen: true }, style: { height: `${height}px` } }],
            };
        }
        case "progressBar": {
            const max = Math.max(1, Math.round(Number(a.max ?? 100) || 100));
            const dec = Math.min(2, Math.max(0, Math.round(Number(a.decimals)) || 0));
            const value = Math.min(max, Math.max(0, Number((Number(a.value ?? 50) || 0).toFixed(dec))));
            const pct = Math.round((value / max) * 1000) / 10;
            const label = str(a.label);
            const shown = `${str(a.prefix)}${value.toFixed(dec)}${a.suffix === undefined ? "%" : str(a.suffix)}`;
            const ease = ["ease", "linear", "ease-in", "ease-out", "ease-in-out"].includes(a.easing) ? String(a.easing) : null;
            const vars = {};
            const pos = a.textPosition === "inside" || a.textPosition === "below" ? a.textPosition : "above";
            const valueEl = a.showValue !== false ? { tag: "span", className: "ecx-progress-value", props: { "aria-hidden": "true" }, children: [shown] } : null;
            const head = label || editing || valueEl ? { tag: "div", className: "ecx-progress-head", children: kids(text("span", "ecx-progress-label", a, "label", editing), valueEl) } : null;
            const dur = Number(a.duration);
            if (Number.isFinite(dur) && a.duration !== undefined)
                vars["--ecx-progress-duration"] = `${Math.min(10000, Math.max(0, Math.round(dur)))}ms`;
            if (ease)
                vars["--ecx-progress-ease"] = ease;
            // `ecx-in`: script chuyển động của website (IntersectionObserver, bỏ qua khi giảm chuyển động) đặt `is-in` → thanh chạy từ 0 (CSS)
            return {
                tag: "div", className: cls("ecx-progress", a.animate !== false && "ecx-in", pos !== "above" && `is-text-${pos}`),
                style: Object.keys(vars).length ? vars : undefined,
                children: kids(pos === "above" ? head : null, {
                    tag: "div", className: "ecx-progress-track", props: { role: "progressbar", "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": max, "aria-label": str(a.ariaLabel) || label || shown },
                    children: [{ tag: "div", className: "ecx-progress-bar", style: { width: `${pct}%` }, children: pos === "inside" ? kids(head) : undefined }],
                }, pos === "below" ? head : null),
            };
        }
        default: return null;
    }
}
/**
 * 1.26 Ô của khối đếm ngược (website và khung soạn dùng chung): còn `leftMs` → các ô số + nhãn.
 * Ẩn ngày thì giờ cộng dồn cả ngày; ẩn giây thì bỏ ô giây. Nhãn: nhãn riêng của khối > nhãn theo ngôn ngữ (`units`).
 */
/** Múi giờ chọn được cho đếm ngược (mốc nhập theo giờ tường của múi giờ đó, không theo máy người xem). */
export const COUNTDOWN_ZONES = ["Asia/Ho_Chi_Minh", "Asia/Bangkok", "Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Asia/Kolkata", "Asia/Dubai", "Europe/London", "Europe/Paris", "Europe/Moscow", "America/New_York", "America/Chicago", "America/Los_Angeles", "Australia/Sydney", "UTC"];
const zoneOffsetMs = (tz, ms) => {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(ms);
    const g = (t) => Number(p.find((x) => x.type === t)?.value);
    return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second")) - Math.floor(ms / 1000) * 1000;
};
/** Mốc đếm ngược (ms). Có `timezone` và mốc không kèm độ lệch (`2026-12-01T09:00`) → giờ tường của múi giờ đó; còn lại như Date.parse. Sai → NaN. */
export function countdownTarget(a) {
    const t = String(a.target ?? "");
    const tz = typeof a.timezone === "string" && COUNTDOWN_ZONES.includes(a.timezone) ? a.timezone : undefined;
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(t);
    if (!tz || !m)
        return Date.parse(t);
    const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0));
    let ms = wall;
    for (let i = 0; i < 2; i++)
        ms = wall - zoneOffsetMs(tz, ms);
    return ms;
}
/** Giờ tường `YYYY-MM-DDTHH:mm` của một thời điểm ở múi giờ `tz` (đổi qua lại khi người dùng đổi múi giờ). */
export function wallInZone(ms, tz) {
    const w = new Date(ms + zoneOffsetMs(tz, ms)).toISOString();
    return w.slice(0, 16);
}
export function countdownParts(a, leftMs, units = {}) {
    const s = Math.max(0, Math.floor(leftMs / 1000));
    const days = a.showDays !== false;
    const all = [
        ["d", Math.floor(s / 86400), a.daysLabel], ["h", days ? Math.floor(s / 3600) % 24 : Math.floor(s / 3600), a.hoursLabel],
        ["m", Math.floor(s / 60) % 60, a.minutesLabel], ["s", s % 60, a.secondsLabel],
    ];
    return all
        .filter(([u]) => (u !== "d" || days) && (u !== "s" || a.showSeconds !== false))
        .map(([u, n, own]) => ({ u, value: a.pad === false ? String(n) : String(n).padStart(2, "0"), label: (typeof own === "string" && own) || units[u] || u }));
}

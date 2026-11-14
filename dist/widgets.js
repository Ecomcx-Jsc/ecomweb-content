import { safeUrl } from "./url.js";
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
export const WIDGET_BLOCKS = ["iconBox", "imageBox", "iconList", "counter", "testimonial", "progressBar"];
const str = (v) => (typeof v === "string" ? v : "");
/** SVG của icon (trang trí: aria-hidden). Tên lạ → icon mặc định. */
export function iconEl(name, fallback = "star") {
    const d = ICON_PATHS[str(name)] ?? ICON_PATHS[fallback];
    return {
        tag: "svg", className: "ecx-widget-icon",
        props: { viewBox: "0 0 24 24", width: 24, height: 24, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" },
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
const kids = (...c) => c.filter(Boolean);
/** Số chữ thập phân của Counter (theo giá trị đầu / cuối, tối đa 3). */
export const counterDecimals = (a) => Math.min(3, Math.max(...[a.start, a.end].map((v) => (String(Number(v) || 0).split(".")[1] ?? "").length)));
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
            return {
                tag: "div", className: `ecx-icon-box is-${a.position === "left" ? "left" : "top"}`, style: alignCss(a),
                children: [
                    { tag: "span", className: "ecx-icon-box-icon", children: [iconEl(a.icon)] },
                    { tag: "div", className: "ecx-icon-box-body", children: kids(text(level(a), "ecx-icon-box-title", a, "title", editing, link), text("p", "ecx-icon-box-text", a, "text", editing)) },
                ],
            };
        }
        case "imageBox": {
            const src = a.src ? safeUrl(a.src, "") : "";
            // Ảnh từ thư viện mang sẵn srcset (JPEG + WebP) và kích thước như khối image → responsive, không nhảy layout
            const sizes = "(max-width: 768px) 100vw, 33vw";
            const tag = src ? { tag: "img", props: { src, srcSet: str(a.srcset) || undefined, sizes: a.srcset ? sizes : undefined, alt: str(a.alt), width: Number(a.width) || undefined, height: Number(a.height) || undefined, loading: "lazy", decoding: "async" } } : null;
            const img = tag && a.webpSrcset ? { tag: "picture", children: [{ tag: "source", props: { type: "image/webp", srcSet: str(a.webpSrcset), sizes } }, tag] } : tag;
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
                tag: "ul", className: `ecx-icon-list${a.layout === "inline" ? " is-inline" : ""}`,
                children: items.map((it) => {
                    const body = [iconEl(ICON_PATHS[str(it.icon)] ? it.icon : a.icon, "check"), { tag: "span", children: [it.text] }];
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
                }, text("p", "ecx-counter-title", a, "title", editing)),
            };
        }
        case "testimonial": {
            const src = a.src ? safeUrl(a.src, "") : "";
            const name = text("cite", "ecx-testimonial-name", a, "name", editing), role = text("span", "ecx-testimonial-role", a, "role", editing);
            return {
                tag: "figure", className: "ecx-testimonial", style: alignCss(a),
                children: kids({ tag: "blockquote", className: "ecx-testimonial-quote", children: kids(text("p", undefined, a, "quote", editing)) }, src || name || role ? {
                    tag: "figcaption", className: "ecx-testimonial-author",
                    children: kids(src ? { tag: "img", className: "ecx-testimonial-avatar", props: { src, alt: str(a.alt), width: 48, height: 48, loading: "lazy", decoding: "async" } } : null, name || role ? { tag: "span", className: "ecx-testimonial-meta", children: kids(name, role) } : null),
                } : null),
            };
        }
        case "progressBar": {
            const v = Math.min(100, Math.max(0, Math.round(Number(a.value ?? 50) || 0)));
            const label = str(a.label);
            // `ecx-in`: script chuyển động của website (IntersectionObserver, bỏ qua khi giảm chuyển động) đặt `is-in` → thanh chạy từ 0 (CSS)
            return {
                tag: "div", className: "ecx-progress ecx-in",
                children: kids(label || editing || a.showValue !== false ? {
                    tag: "div", className: "ecx-progress-head",
                    children: kids(text("span", "ecx-progress-label", a, "label", editing), a.showValue !== false ? { tag: "span", className: "ecx-progress-value", props: { "aria-hidden": "true" }, children: [`${v}%`] } : null),
                } : null, {
                    tag: "div", className: "ecx-progress-track", props: { role: "progressbar", "aria-valuenow": v, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": label || `${v}%` },
                    children: [{ tag: "div", className: "ecx-progress-bar", style: { width: `${v}%` } }],
                }),
            };
        }
        default: return null;
    }
}

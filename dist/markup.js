import { colorCss, spacingValue } from "./style.js";
import { embedInfo } from "./embed.js";
import { safeUrl } from "./url.js";
const cls = (...parts) => parts.filter(Boolean).join(" ") || undefined;
/** `text-align` chỉ ghi khi khác mặc định (left) — website không in thừa. */
export function alignStyle(attrs) {
    return attrs?.textAlign && attrs.textAlign !== "left" ? { textAlign: String(attrs.textAlign) } : undefined;
}
const num = (v, fallback) => (Number(v) > 0 ? Number(v) : fallback);
/** Vỏ của khối lõi; `null` = khối này chưa có vỏ dùng chung (mỗi bên tự vẽ như cũ). `parent` cần cho `column` (đọc `stack` của `columns`). */
export function blockShell(type, attrs = {}, parent) {
    switch (type) {
        case "paragraph": return { tag: "p", style: alignStyle(attrs) };
        case "heading": return { tag: `h${Math.min(6, Math.max(1, Number(attrs.level) || 2))}`, style: alignStyle(attrs) };
        case "blockquote": return { tag: "blockquote" };
        case "columns": {
            const stack = attrs.stack !== false;
            const align = attrs.verticalAlign === "center" ? "center" : attrs.verticalAlign === "bottom" ? "flex-end" : "flex-start";
            return {
                tag: "div",
                className: cls("ecx-columns cms-columns", attrs.verticalAlign && `ecx-columns-${attrs.verticalAlign} cms-columns-${attrs.verticalAlign}`),
                style: { display: "flex", flexWrap: stack ? "wrap" : "nowrap", gap: "1.5rem", alignItems: align },
            };
        }
        case "column": {
            const stack = parent?.attrs?.stack !== false;
            return { tag: "div", className: "ecx-column cms-column", style: { flex: `${num(attrs.width, 1)} 1 0`, minWidth: stack ? "min(100%, 14rem)" : 0 } };
        }
        case "group": {
            const bg = colorCss(attrs.background), fg = colorCss(attrs.textColor);
            const pad = PADDING[attrs.padding] ?? (bg ? PADDING.medium : undefined);
            return { tag: "div", className: cls("ecx-group cms-group", attrs.padding && `ecx-group-${attrs.padding} cms-group-${attrs.padding}`), style: compact({ background: bg, color: fg, padding: pad, borderRadius: bg ? 12 : undefined }) };
        }
        case "callout": {
            const tone = calloutTone(attrs);
            return {
                tag: "div", className: cls("ecx-callout cms-callout", `ecx-callout-${tone} cms-callout-${tone}`), attrs: { role: "note" },
                style: { borderLeft: `4px solid ${TONES[tone]}`, background: `color-mix(in srgb, ${TONES[tone]} 8%, transparent)`, padding: "0.75rem 1rem", borderRadius: 8 },
            };
        }
        case "buttons": return { tag: "div", className: cls("ecx-buttons-group", attrs.align && `is-${attrs.align}`) };
        case "button": {
            const variant = buttonVariant(attrs);
            const look = variant === "outline"
                ? { border: "1px solid var(--ecx-button-bg, var(--cms-button-bg, var(--primary, currentColor)))", color: "var(--ecx-button-bg, var(--cms-button-bg, var(--primary, inherit)))" }
                : variant === "secondary"
                    ? { background: "var(--ecx-button-secondary-bg, var(--cms-button-secondary-bg, rgba(127,127,127,.15)))", color: "inherit" }
                    : { background: "var(--ecx-button-bg, var(--cms-button-bg, var(--primary, #18181b)))", color: "var(--ecx-button-fg, var(--cms-button-fg, #fff))" };
            return {
                tag: "a", className: cls("ecx-button cms-button", `ecx-button-${variant} cms-button-${variant}`),
                style: { display: "inline-block", padding: "0.6em 1.2em", borderRadius: 8, textDecoration: "none", fontWeight: 600, lineHeight: 1.2, ...look },
            };
        }
        case "spacer": return { tag: "div", className: "ecx-spacer", style: { height: spacingValue(attrs.height ?? "lg") ?? "1.5rem" }, attrs: { "aria-hidden": "true" } };
        case "cover": {
            const src = attrs.src ? String(attrs.src) : "";
            return {
                tag: "div", className: cls("ecx-cover", attrs.contentAlign && attrs.contentAlign !== "center" && `is-${attrs.contentAlign}`, attrs.fixed && src && "is-fixed"),
                style: compact({ minHeight: spacingValue(attrs.minHeight ?? "400px"), backgroundImage: attrs.fixed && src ? `url("${safeUrl(src, "").replace(/["\\()]/g, encodeURIComponent)}")` : undefined }),
            };
        }
        case "mediaText": {
            const width = Math.min(80, Math.max(20, Number(attrs.width) || 50));
            return { tag: "div", className: cls("ecx-media-text", attrs.position === "right" && "is-right", attrs.verticalAlign && attrs.verticalAlign !== "center" && `is-${attrs.verticalAlign}`, attrs.stack !== false && "is-stack"), style: { "--ecx-media-width": `${width}%` } };
        }
        case "image": return { tag: "figure", className: cls("ecx-image cms-image", attrs.align && `ecx-align-${attrs.align} align${attrs.align}`, attrs.mediaId && `ecx-image-${attrs.mediaId} cms-image-${attrs.mediaId}`) };
        case "gallery": {
            const cols = Math.min(6, Math.max(1, Number(attrs.columns) || 3));
            return { tag: "figure", className: cls("ecx-gallery cms-gallery", `ecx-gallery-columns-${cols} columns-${cols}`), style: { display: "grid", gap: 8, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` } };
        }
        case "pullquote": return { tag: "figure", className: "ecx-pullquote" };
        case "customHtml": return { tag: "div", className: "ecx-html" };
        case "embed": {
            const info = embedInfo(attrs.url);
            if (!info)
                return null;
            return {
                tag: "figure", className: cls("ecx-embed cms-embed", `ecx-embed-${info.provider} cms-embed-${info.provider}`),
                style: compact({ maxWidth: info.maxWidth, marginLeft: info.maxWidth ? "auto" : undefined, marginRight: info.maxWidth ? "auto" : undefined }),
            };
        }
        default: return null;
    }
}
const PADDING = { none: "0", small: "0.75rem", medium: "1.5rem", large: "3rem" };
const TONES = { info: "#2563eb", success: "#16a34a", warning: "#d97706", danger: "#dc2626" };
const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const calloutTone = (a) => (TONES[a.tone] ? a.tone : "info");
const buttonVariant = (a) => (a.variant === "secondary" || a.variant === "outline" ? a.variant : "primary");
/** Các phần bên trong khối bìa: ảnh (khi không cố định), lớp phủ và nền cố định — cả hai bên vẽ y như nhau. */
export function coverParts(attrs = {}) {
    const src = attrs.src ? String(attrs.src) : "";
    return { src, fixed: !!attrs.fixed && !!src, overlay: colorCss(attrs.overlay) ?? (src ? "#000" : undefined), opacity: Math.min(100, Math.max(0, Number(attrs.opacity ?? 50))) / 100 };
}
/** Vỏ ngoài của nút đứng riêng (không nằm trong khối "buttons"): đoạn `<p>` căn lề. */
export function buttonWrapShell(attrs = {}) {
    return { tag: "p", className: cls("ecx-buttons cms-buttons", attrs.align && `ecx-buttons-${attrs.align} cms-buttons-${attrs.align}`), style: attrs.align ? { textAlign: String(attrs.align) } : undefined };
}
/** Dòng nguồn của trích dẫn (`<cite>` sau nội dung) — website có, canvas phải có. */
export const blockCitation = (attrs) => (attrs?.citation ? String(attrs.citation) : undefined);
/** `rel` của liên kết: giá trị người viết đặt (nofollow, sponsored, ugc…) + luôn noopener noreferrer khi mở tab mới. Website và trình soạn dùng chung. */
export function linkRel(rel, target) {
    const set = new Set(String(rel ?? "").toLowerCase().split(/\s+/).filter((x) => /^[a-z-]+$/.test(x)));
    if (target === "_blank") {
        set.add("noopener");
        set.add("noreferrer");
    }
    return set.size ? [...set].join(" ") : undefined;
}

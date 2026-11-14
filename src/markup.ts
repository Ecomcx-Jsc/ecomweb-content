import { colorCss, spacingValue } from "./style.js";
import { embedInfo } from "./embed.js";
import { safeUrl } from "./url.js";
import { WIDE_BLOCKS } from "./schema.js";
/**
 * Vỏ markup của khối — MỘT nguồn cho website (theme-sdk) và trình soạn (canvas): thẻ, class, style.
 * Hàm thuần, đồng bộ, không phụ thuộc React: bên dùng tự đổ nội dung (chữ đã vẽ / ProseMirror) vào trong vỏ.
 * Đổi markup ở đây là cả hai nơi đổi theo, nên không thể lệch nhau.
 */
export interface BlockShell {
  tag: string;
  className?: string;
  /** Khoá camelCase như React `style`. */
  style?: Record<string, string | number>;
  /** Thuộc tính HTML cố định của vỏ (vd role, aria-hidden). */
  attrs?: Record<string, string>;
}

type Attrs = Record<string, any>;

const cls = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ") || undefined;

/** `text-align` chỉ ghi khi khác mặc định (left) — website không in thừa. */
export function alignStyle(attrs?: Attrs): Record<string, string> | undefined {
  return attrs?.textAlign && attrs.textAlign !== "left" ? { textAlign: String(attrs.textAlign) } : undefined;
}

const num = (v: unknown, fallback: number) => (Number(v) > 0 ? Number(v) : fallback);

/** Vỏ của khối lõi; `null` = khối này chưa có vỏ dùng chung (mỗi bên tự vẽ như cũ). `parent` cần cho `column` (đọc `stack` của `columns`). */
export function blockShell(type: string, attrs: Attrs = {}, parent?: { type: string; attrs?: Attrs }): BlockShell | null {
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
        style: { display: "flex", flexWrap: stack ? "wrap" : "nowrap", gap: "var(--ecx-columns-gap, 1.5rem)", alignItems: align },
      };
    }
    case "column": {
      const stack = parent?.attrs?.stack !== false;
      return { tag: "div", className: "ecx-column cms-column", style: { flex: `${num(attrs.width, 1)} 1 0`, minWidth: stack ? "min(100%, 14rem)" : 0 } };
    }
    case "group": {
      const bg = colorCss(attrs.background), fg = colorCss(attrs.textColor);
      const pad = PADDING[attrs.padding as string] ?? (bg ? PADDING.medium : undefined);
      return { tag: "div", className: cls("ecx-group cms-group", attrs.padding && `ecx-group-${attrs.padding} cms-group-${attrs.padding}`, attrs.constrained === true && "ecx-is-constrained"), style: compact({ background: bg, color: fg, padding: pad, borderRadius: bg && attrs.align !== "full" ? 12 : undefined }) };
    }
    case "callout": {
      const tone = calloutTone(attrs);
      return {
        tag: "div", className: cls("ecx-callout cms-callout", `ecx-callout-${tone} cms-callout-${tone}`), attrs: { role: "note" },
        style: { borderLeft: `4px solid ${TONES[tone]}`, background: `color-mix(in srgb, ${TONES[tone]} 8%, transparent)`, padding: "0.75rem 1rem", borderRadius: "var(--ecx-radius-md, 8px)" },
      };
    }
    case "buttons": return { tag: "div", className: cls("ecx-buttons-group", attrs.align && `is-${attrs.align}`) };
    case "button": {
      const variant = buttonVariant(attrs);
      // 1.24: --ecx-btn-color / --ecx-btn-bg = ô Kiểu dáng của từng nút (core-controls.ts), trống thì như cũ theo token
      const look: Record<string, string> = variant === "outline"
        ? { border: "var(--ecx-border-width, 1px) solid var(--ecx-btn-color, var(--ecx-button-bg, var(--cms-button-bg, var(--ecx-color-primary, currentColor))))", color: "var(--ecx-btn-color, var(--ecx-button-bg, var(--cms-button-bg, var(--ecx-color-primary, inherit))))", background: "var(--ecx-btn-bg, transparent)" }
        : variant === "secondary"
          ? { background: "var(--ecx-btn-bg, var(--ecx-button-secondary-bg, var(--cms-button-secondary-bg, color-mix(in srgb, currentColor 12%, transparent))))", color: "var(--ecx-btn-color, inherit)" }
          : { background: "var(--ecx-btn-bg, var(--ecx-button-bg, var(--cms-button-bg, var(--ecx-color-primary, #2563eb))))", color: "var(--ecx-btn-color, var(--ecx-button-fg, var(--cms-button-fg, var(--ecx-color-primary-fg, #fff))))" };
      return {
        tag: "a", className: cls("ecx-button cms-button", `ecx-button-${variant} cms-button-${variant}`),
        // Token (style.css › :root) — theme đổi bằng biến; inline giữ màu nút thắng CSS link của theme
        style: { display: "inline-block", padding: "var(--ecx-button-padding, 0.6em 1.2em)", borderRadius: "var(--ecx-button-radius, 8px)", textDecoration: "none", fontWeight: "var(--ecx-button-font-weight, 600)", lineHeight: 1.2, ...look },
      };
    }
    case "spacer": return { tag: "div", className: "ecx-spacer", style: { height: spacingValue(attrs.height ?? "lg") ?? "1.5rem" }, attrs: { "aria-hidden": "true" } };
    case "cover": {
      const src = attrs.src ? String(attrs.src) : "";
      return {
        tag: "div", className: cls("ecx-cover", attrs.contentAlign && attrs.contentAlign !== "center" && `is-${attrs.contentAlign}`, attrs.fixed && src && "is-fixed", attrs.constrained === true && "ecx-is-constrained"),
        style: compact({ minHeight: spacingValue(attrs.minHeight ?? "400px"), backgroundImage: attrs.fixed && src ? `url("${safeUrl(src, "").replace(/["\\()]/g, encodeURIComponent)}")` : undefined, backgroundPosition: attrs.fixed && src ? focalPoint(attrs.focal) : undefined }),
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
      if (!info) return null;
      return {
        tag: "figure", className: cls("ecx-embed cms-embed", `ecx-embed-${info.provider} cms-embed-${info.provider}`),
        style: compact({ maxWidth: info.maxWidth, marginLeft: info.maxWidth ? "auto" : undefined, marginRight: info.maxWidth ? "auto" : undefined }),
      };
    }
    default: return null;
  }
}

const PADDING: Record<string, string> = { none: "0", small: "0.75rem", medium: "1.5rem", large: "3rem" };
const TONES: Record<string, string> = { info: "var(--ecx-color-info, #2563eb)", success: "var(--ecx-color-success, #15803d)", warning: "var(--ecx-color-warning, #b45309)", danger: "var(--ecx-color-danger, #b91c1c)" };
const compact = (o: Record<string, string | number | undefined>): Record<string, string | number> => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Record<string, string | number>;
const calloutTone = (a: Attrs) => (TONES[a.tone as string] ? (a.tone as string) : "info");
const buttonVariant = (a: Attrs) => (a.variant === "secondary" || a.variant === "outline" ? (a.variant as string) : "primary");

/**
 * 1.20: class độ rộng của khối (`ecx-align-wide|full` + `alignwide|alignfull` như WP để theme viết CSS quen tay).
 * Ảnh đã gắn trong vỏ của nó. Giá trị lạ / khối không hỗ trợ → không có class (website và canvas cùng gọi).
 */
export function widthClass(type: string, attrs?: Attrs): string | undefined {
  const a = attrs?.align;
  return (a === "wide" || a === "full") && type !== "image" && WIDE_BLOCKS.includes(type) ? `ecx-align-${a} align${a}` : undefined;
}

/** Điểm lấy nét "x% y%" (0–100) của ảnh bìa (1.24, attrs.focal); sai → undefined (giữa). */
export function focalPoint(v: unknown): string | undefined {
  const m = typeof v === "string" ? /^(\d{1,3})% (\d{1,3})%$/.exec(v.trim()) : null;
  return m && Number(m[1]) <= 100 && Number(m[2]) <= 100 ? `${Number(m[1])}% ${Number(m[2])}%` : undefined;
}

/**
 * Các phần bên trong khối bìa: ảnh (khi không cố định), lớp phủ và nền cố định — cả hai bên vẽ y như nhau.
 * 1.24: ảnh và lớp phủ mang kiểu inline phủ kín khối (CSS `img { height: auto }` của theme không làm ảnh co lại), điểm lấy nét `focal`.
 */
export function coverParts(attrs: Attrs = {}): { src: string; fixed: boolean; overlay?: string; opacity: number; imgStyle: Record<string, string | number>; overlayStyle: Record<string, string | number> } {
  const src = attrs.src ? String(attrs.src) : "";
  const overlay = colorCss(attrs.overlay) ?? (src ? "#000" : undefined);
  const opacity = Math.min(100, Math.max(0, Number(attrs.opacity ?? 50))) / 100;
  return {
    src, fixed: !!attrs.fixed && !!src, overlay, opacity,
    imgStyle: { position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", margin: 0, objectFit: "cover", objectPosition: focalPoint(attrs.focal) ?? "50% 50%" },
    overlayStyle: { position: "absolute", inset: 0, background: overlay ?? "transparent", opacity },
  };
}

/** Vỏ ngoài của nút đứng riêng (không nằm trong khối "buttons"): đoạn `<p>` căn lề. */
export function buttonWrapShell(attrs: Attrs = {}): BlockShell {
  return { tag: "p", className: cls("ecx-buttons cms-buttons", attrs.align && `ecx-buttons-${attrs.align} cms-buttons-${attrs.align}`), style: attrs.align ? { textAlign: String(attrs.align) } : undefined };
}

/** Dòng nguồn của trích dẫn (`<cite>` sau nội dung) — website có, canvas phải có. */
export const blockCitation = (attrs?: Attrs): string | undefined => (attrs?.citation ? String(attrs.citation) : undefined);

/** `rel` của liên kết: giá trị người viết đặt (nofollow, sponsored, ugc…) + luôn noopener noreferrer khi mở tab mới. Website và trình soạn dùng chung. */
export function linkRel(rel: unknown, target: unknown): string | undefined {
  const set = new Set(String(rel ?? "").toLowerCase().split(/\s+/).filter((x) => /^[a-z-]+$/.test(x)));
  if (target === "_blank") { set.add("noopener"); set.add("noreferrer"); }
  return set.size ? [...set].join(" ") : undefined;
}

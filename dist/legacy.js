const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v) => (typeof v === "string" ? v : undefined);
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : undefined);
/** Thuộc tính chung giữ lại khi đổi loại khối (kiểu dáng, neo, class, ẩn theo khổ…). */
const COMMON = ["style", "blockStyle", "className", "anchor", "lock", "metadata", "customName"];
const common = (a) => Object.fromEntries(COMMON.filter((k) => a[k] !== undefined).map((k) => [k, a[k]]));
const text = (t) => ({ type: "text", text: t });
const para = (t, marks) => (t ? { type: "paragraph", content: [marks ? { ...text(t), marks } : text(t)] } : { type: "paragraph" });
const kids = (n) => (Array.isArray(n.content) ? n.content : []);
const node = (type, attrs, content) => {
    const out = { type };
    const a = Object.fromEntries(Object.entries(attrs).filter(([, v]) => v !== undefined));
    if (Object.keys(a).length)
        out.attrs = a;
    if (content)
        out.content = content;
    return out;
};
const TONE_BG = { info: "#e8f1f6", success: "#e8f5ee", warning: "#fff4e0", danger: "#fdecea" };
/** Chú thích (mark `footnote`) theo thứ tự xuất hiện trong cả tài liệu — khối footnotes cũ tự liệt kê chúng. */
function collectNotes(list, out) {
    for (const n of list) {
        if (!isObj(n))
            continue;
        for (const m of Array.isArray(n.marks) ? n.marks : [])
            if (isObj(m) && m.type === "footnote" && isObj(m.attrs) && str(m.attrs.note))
                out.push(str(m.attrs.note));
        collectNotes(kids(n), out);
    }
}
/** Đặt dấu ☐ / ☑ vào đầu chữ của đoạn đầu mục việc. */
function prefixFirstParagraph(content, mark) {
    const i = content.findIndex((c) => isObj(c) && c.type === "paragraph");
    if (i < 0)
        return [para(mark.trim()), ...content];
    const p = content[i];
    return content.map((c, j) => (j === i ? { ...p, content: [text(mark), ...kids(p)] } : c));
}
function upgradeList(list, parent, notes) {
    const out = [];
    for (const n of list) {
        if (!isObj(n) || typeof n.type !== "string") {
            out.push(n);
            continue;
        }
        const a = isObj(n.attrs) ? n.attrs : {};
        const inner = (p) => upgradeList(kids(n), p, notes);
        switch (n.type) {
            case "horizontalRule": {
                const w = num(String(a.hrWidth ?? "").replace("%", ""));
                out.push(node("spacer", { ...common(a), height: "md", line: true,
                    lineStyle: ["solid", "dashed", "dotted", "double"].includes(String(a.hrStyle)) ? a.hrStyle : undefined,
                    lineWeight: (() => { const x = num(String(a.hrWeight ?? "").replace("px", "")); return x && x >= 1 && x <= 12 ? Math.round(x) : undefined; })(),
                    lineWidth: typeof a.hrWidth === "string" && a.hrWidth.endsWith("%") && w && w >= 5 && w <= 100 ? Math.round(w) : undefined,
                    lineColor: str(a.hrColor) }));
                break;
            }
            case "youtube":
                out.push(node("video", { ...common(a), align: a.align, src: a.src }));
                break;
            case "mediaText": {
                const w = Math.min(80, Math.max(20, num(a.width) ?? 50));
                const media = node("column", { width: w }, [node("image", { src: a.src, alt: a.alt, mediaId: a.mediaId })]);
                const body = node("column", { width: 100 - w }, inner("column"));
                out.push(node("columns", { ...common(a), align: a.align, stack: a.stack === false ? false : undefined,
                    verticalAlign: ["top", "center", "bottom"].includes(String(a.verticalAlign)) ? a.verticalAlign : "center" }, a.position === "right" ? [body, media] : [media, body]));
                break;
            }
            case "callout": {
                const tone = TONE_BG[String(a.tone)] ? String(a.tone) : "info";
                const style = isObj(a.style) ? a.style : {};
                const color = isObj(style.color) ? style.color : {};
                const title = str(a.title)?.trim();
                out.push(node("group", { ...common(a), padding: "medium", style: { ...style, color: { ...color, background: color.background ?? TONE_BG[tone] }, radius: style.radius ?? "8px" } }, [...(title ? [para(title, [{ type: "bold" }])] : []), ...inner("group")]));
                break;
            }
            case "pullquote": {
                // Khối cũ là khối chữ (con là chữ trần); blockquote là khối chứa → bọc chữ trần vào một đoạn
                const kidsOf = inner("blockquote");
                const inline = kidsOf.length > 0 && kidsOf.every((c) => isObj(c) && (c.type === "text" || c.type === "hardBreak"));
                out.push(node("blockquote", { ...common(a), citation: a.citation, quoteAlign: "center" }, inline ? [{ type: "paragraph", content: kidsOf }] : kidsOf));
                break;
            }
            case "preformatted":
                out.push(node("codeBlock", common(a), kids(n)));
                break;
            case "taskList":
                out.push(node("bulletList", { ...common(a), listMarker: "none" }, kids(n).map((it) => {
                    if (!isObj(it))
                        return it;
                    const ia = isObj(it.attrs) ? it.attrs : {};
                    return node("listItem", {}, prefixFirstParagraph(upgradeList(kids(it), "listItem", notes), ia.checked === true ? "☑ " : "☐ "));
                })));
                break;
            case "rating": {
                const max = Math.min(10, Math.max(1, Math.round(num(a.max) ?? 5)));
                const v = Math.min(max, Math.max(0, Math.round(num(a.value) ?? 5)));
                const label = str(a.label)?.trim();
                out.push(node("paragraph", common(a), [text("★".repeat(v) + "☆".repeat(max - v) + (label ? ` ${label}` : ""))]));
                break;
            }
            case "footnotes": {
                if (!notes.length)
                    break;
                const title = str(a.title)?.trim();
                if (title)
                    out.push(para(title, [{ type: "bold" }]));
                out.push(node("orderedList", common(a), notes.map((t) => node("listItem", {}, [para(t)]))));
                break;
            }
            case "pageBreak": break;
            case "details": {
                const d = { ...n, content: inner("details") };
                out.push(parent === "accordion" ? d : node("accordion", {}, [d]));
                break;
            }
            case "testimonial":
                out.push(parent === "testimonials" ? n : node("testimonials", { columns: 1 }, [n]));
                break;
            default:
                out.push(Array.isArray(n.content) ? { ...n, content: inner(n.type) } : n);
        }
    }
    return out;
}
/** Nâng cây thô bản 1 → bản 2. Đầu vào là `{ version, blocks }` chưa chuẩn hoá; trả bản mới (không sửa đầu vào). */
export function upgradeLegacyContent(raw) {
    if (!Array.isArray(raw.blocks))
        return raw;
    return { ...raw, blocks: raw.blocks.map((b) => {
            if (!isObj(b) || b.type !== "richtext" || !isObj(b.data) || !Array.isArray(b.data.content))
                return b;
            const notes = [];
            collectNotes(b.data.content, notes);
            return { ...b, data: { ...b.data, content: upgradeList(b.data.content, "doc", notes) } };
        }) };
}
/** Loại khối cũ đã bỏ ở định dạng 2 (báo cáo của công cụ chuyển đổi dùng). */
export const LEGACY_TYPES = ["horizontalRule", "youtube", "mediaText", "callout", "pullquote", "preformatted", "taskList", "taskItem", "rating", "footnotes", "pageBreak"];

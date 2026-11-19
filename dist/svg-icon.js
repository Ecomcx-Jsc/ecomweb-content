/**
 * Icon SVG riêng (người dùng dán mã hoặc chọn file .svg): lọc theo danh sách cho phép rồi lưu dạng giá trị `svg:<mã đã lọc>` ở thuộc tính icon.
 * Không dùng DOM (chạy ở máy chủ, trình duyệt, kiểm thử). Giá trị lưu LUÔN được lọc lại lúc vẽ (parseSvgIcon) — kẻ sửa nội dung bằng tay
 * cũng không đưa được script / sự kiện / liên kết ngoài vào trang.
 *
 * Cho phép: svg g path circle ellipse rect line polyline polygon; thuộc tính hình học + fill / stroke (màu bất kỳ → currentColor để ăn theo màu chữ,
 * "none" giữ nguyên), transform đơn giản. Cấm: script, style, use, image, foreignObject, mọi on*, href, url(…), id / class.
 */
export const SVG_ICON_PREFIX = "svg:";
export const SVG_ICON_MAX = 8000;
const MAX_ELEMENTS = 200;
const TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]);
const GEOM = new Set(["d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "x2", "y1", "y2", "width", "height", "points"]);
const PAINT = new Set(["fill", "stroke"]);
const KEEP = new Set(["stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "fill-rule", "clip-rule", "opacity", "fill-opacity", "stroke-opacity", "transform"]);
const NUMERIC = /^[-+0-9eE.,\s]+$/;
const PATHD = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/;
const TRANSFORM = /^[a-zA-Z0-9(),.\s+-]{1,120}$/;
const ENUM = { "stroke-linecap": ["butt", "round", "square"], "stroke-linejoin": ["miter", "round", "bevel", "arcs", "miter-clip"], "fill-rule": ["nonzero", "evenodd"], "clip-rule": ["nonzero", "evenodd"] };
function cleanAttr(tag, name, raw) {
    const v = raw.trim();
    if (v.length > 4000)
        return undefined;
    if (name === "viewBox")
        return tag === "svg" && /^[-0-9.\s,]{3,60}$/.test(v) && v.split(/[\s,]+/).filter(Boolean).length === 4 ? v : undefined;
    if (PAINT.has(name))
        return v === "none" ? "none" : /^(none|transparent)$/i.test(v) ? "none" : /url\(/i.test(v) ? undefined : "currentColor";
    if (name === "d")
        return tag === "path" && PATHD.test(v) ? v : undefined;
    if (name === "points")
        return (tag === "polyline" || tag === "polygon") && NUMERIC.test(v) ? v : undefined;
    if (GEOM.has(name))
        return NUMERIC.test(v) || /^-?[0-9.]+%?$/.test(v) ? v : undefined;
    if (name === "transform")
        return TRANSFORM.test(v) && !/url|javascript|expression/i.test(v) ? v : undefined;
    if (ENUM[name])
        return ENUM[name].includes(v) ? v : undefined;
    if (KEEP.has(name))
        return /^[-0-9.eE]+$/.test(v) ? v : undefined;
    return undefined;
}
/** Lọc một đoạn mã SVG → cây an toàn; null nếu không phải SVG dùng được. */
export function parseSvgIcon(source) {
    const text = source.replace(/<!--[\s\S]*?-->/g, "").replace(/<\?[\s\S]*?\?>/g, "").replace(/<!DOCTYPE[^>]*>/gi, "").trim();
    if (!text || text.length > 60_000 || !/<svg[\s>]/i.test(text))
        return null;
    const re = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g;
    const stack = [];
    let rootNode = null;
    let count = 0;
    let skip = 0; // đang trong thẻ bị cấm (vd <style>, <script>): bỏ cả ruột
    let m;
    while ((m = re.exec(text))) {
        const closing = m[1] === "/", tag = m[2].toLowerCase(), selfClose = m[4] === "/";
        if (skip) {
            if (!closing && !selfClose)
                skip++;
            else if (closing)
                skip--;
            continue;
        }
        if (closing) {
            if (stack.length && stack[stack.length - 1].tag === tag)
                stack.pop();
            continue;
        }
        if (!TAGS.has(tag)) {
            if (!selfClose)
                skip = 1;
            continue;
        }
        if (++count > MAX_ELEMENTS)
            return null;
        const props = {};
        for (const a of m[3].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
            const key = a[1] === "viewBox" || a[1].toLowerCase() === "viewbox" ? "viewBox" : a[1].toLowerCase();
            const val = cleanAttr(tag, key, a[2] ?? a[3] ?? "");
            if (val !== undefined)
                props[key] = val;
        }
        const node = { tag, props, children: [] };
        if (!rootNode) {
            if (tag !== "svg")
                return null;
            rootNode = node;
        }
        else if (stack.length)
            stack[stack.length - 1].children.push(node);
        else
            return null;
        if (!selfClose)
            stack.push(node);
    }
    if (!rootNode)
        return null;
    let viewBox = rootNode.props.viewBox;
    if (!viewBox) {
        const w = parseFloat(rootNode.props.width ?? ""), h = parseFloat(rootNode.props.height ?? "");
        viewBox = w > 0 && h > 0 ? `0 0 ${w} ${h}` : "0 0 24 24";
    }
    // hình thiếu thuộc tính bắt buộc (vd path không có d hợp lệ) bị bỏ
    const REQUIRED = { path: ["d"], circle: ["r"], ellipse: ["rx", "ry"], rect: ["width", "height"], line: ["x1", "y1", "x2", "y2"], polyline: ["points"], polygon: ["points"] };
    const prune = (n) => { n.children = n.children.filter((c) => !(REQUIRED[c.tag] ?? []).some((k) => !(k in c.props))); n.children.forEach(prune); };
    prune(rootNode);
    const root = {};
    for (const k of ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"])
        if (rootNode.props[k])
            root[k] = rootNode.props[k];
    const hasShape = (n) => ["path", "circle", "ellipse", "rect", "line", "polyline", "polygon"].includes(n.tag) || n.children.some(hasShape);
    if (!rootNode.children.some(hasShape))
        return null;
    return { viewBox, root, children: rootNode.children };
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
function serialize(n) {
    const attrs = Object.entries(n.props).map(([k, v]) => ` ${k}="${esc(v)}"`).join("");
    return n.children.length ? `<${n.tag}${attrs}>${n.children.map(serialize).join("")}</${n.tag}>` : `<${n.tag}${attrs}/>`;
}
/** Mã SVG gọn đã lọc (dùng làm giá trị lưu và làm ảnh mặt nạ). */
export function svgIconMarkup(icon) {
    const root = Object.entries(icon.root).map(([k, v]) => ` ${k}="${esc(v)}"`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}"${root}>${icon.children.map(serialize).join("")}</svg>`;
}
/** Từ mã người dùng dán → giá trị lưu `svg:…`, hoặc null (không phải SVG dùng được / quá lớn). */
export function toSvgIconValue(source) {
    const icon = parseSvgIcon(source);
    if (!icon)
        return null;
    const markup = svgIconMarkup(icon);
    return markup.length <= SVG_ICON_MAX ? SVG_ICON_PREFIX + markup : null;
}
export const isSvgIconValue = (v) => typeof v === "string" && v.startsWith(SVG_ICON_PREFIX);
/** Giá trị lưu → icon đã lọc lại (an toàn lúc vẽ). */
export const svgIconOf = (v) => (isSvgIconValue(v) && v.length <= SVG_ICON_MAX + 8 ? parseSvgIcon(v.slice(SVG_ICON_PREFIX.length)) : null);
/** Ảnh `data:` của icon (làm mặt nạ cho icon cạnh chữ). */
export function svgIconDataUrl(v) {
    const icon = svgIconOf(v);
    return icon ? "data:image/svg+xml," + encodeURIComponent(svgIconMarkup(icon)) : null;
}

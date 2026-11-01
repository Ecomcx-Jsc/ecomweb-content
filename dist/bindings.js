const SOURCE = /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,40}$/;
const KEY = /^[a-zA-Z][a-zA-Z0-9]{0,29}$/;
const ARG_KEY = /^[a-zA-Z][\w-]{0,39}$/;
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
/** Chuẩn hoá `attrs.bindings`: tối đa 10 thuộc tính, nguồn đúng dạng, tham số là chữ (≤ 200 ký tự) / số / đúng-sai. */
export function normalizeBindings(v) {
    if (!isObj(v))
        return undefined;
    const out = {};
    for (const [k, b] of Object.entries(v)) {
        if (Object.keys(out).length >= 10)
            break;
        if (!KEY.test(k) || !isObj(b) || typeof b.source !== "string" || !SOURCE.test(b.source))
            continue;
        const args = {};
        if (isObj(b.args)) {
            for (const [ak, av] of Object.entries(b.args)) {
                if (Object.keys(args).length >= 10)
                    break;
                if (!ARG_KEY.test(ak))
                    continue;
                if ((typeof av === "string" && av.length <= 200) || (typeof av === "number" && Number.isFinite(av)) || typeof av === "boolean")
                    args[ak] = av;
            }
        }
        out[k] = Object.keys(args).length ? { source: b.source, args } : { source: b.source };
    }
    return Object.keys(out).length ? out : undefined;
}
/** `attrs.lock`: chỉ giữ cờ bật. */
export function normalizeLock(v) {
    if (!isObj(v))
        return undefined;
    const out = {};
    if (v.move === true)
        out.move = true;
    if (v.remove === true)
        out.remove = true;
    return Object.keys(out).length ? out : undefined;
}
/** `attrs.templateLock` của khối chứa: all | insert | contentOnly | none (khối con thoát khoá của khối ngoài). */
export function normalizeTemplateLock(v) {
    return v === "all" || v === "insert" || v === "contentOnly" || v === "none" ? v : undefined;
}

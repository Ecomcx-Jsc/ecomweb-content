const TRIGGERS = ["auto", "hover", "click", "scroll"];
const ALIGNS = ["left", "center", "right"];
export function lottieKind(src) {
    const path = src.split(/[?#]/)[0].toLowerCase();
    return path.endsWith(".lottie") ? "dotlottie" : path.endsWith(".json") ? "json" : "";
}
const clamp = (v, lo, hi, d) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
export function lottieConfig(a) {
    const src = typeof a.src === "string" ? a.src : "";
    return {
        src, poster: typeof a.poster === "string" ? a.poster : "", label: typeof a.label === "string" ? a.label : "",
        loop: a.loop !== false, autoplay: a.autoplay !== false, speed: clamp(a.speed, 0.1, 5, 1),
        trigger: TRIGGERS.includes(a.trigger) ? a.trigger : "auto",
        height: clamp(a.height, 40, 1200), maxWidth: clamp(a.maxWidth, 40, 2000),
        align: ALIGNS.includes(a.align) ? a.align : "center",
        kind: lottieKind(src),
    };
}

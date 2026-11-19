import { spacingValue } from "./style.js";
const RATIOS = ["16/9", "4/3", "3/2", "1/1", "21/9", "3/1"];
const pick = (v, list, d) => (list.includes(v) ? v : d);
const int = (v, min, max, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
const bool = (v, d) => (typeof v === "boolean" ? v : d);
export function carouselConfig(a) {
    const effect = pick(a.effect, ["slide", "fade"], "slide");
    const per = effect === "fade" ? 1 : int(a.slidesPerView, 1, 4, 1);
    return {
        per,
        effect,
        speed: int(a.speed, 150, 1500, 400),
        height: pick(a.heightMode, ["auto", "ratio", "min"], "auto"),
        ratio: pick(a.ratio, RATIOS, "16/9"),
        minHeight: spacingValue(a.minHeight) ?? "24rem",
        arrowStyle: pick(a.arrowStyle, ["circle", "square", "plain", "light"], "circle"),
        dotStyle: pick(a.dotStyle, ["dot", "line", "light"], "dot"),
        arrowPos: pick(a.arrowPos, ["center", "bottom"], "center"),
        hoverPause: bool(a.hoverPause, true),
        // Mặc định tablet thấy tối đa 2, điện thoại 1 slide — nhiều cột trên màn hình hẹp làm chữ vỡ
        perTablet: effect === "fade" ? 1 : int(a.slidesTablet, 1, 4, Math.min(per, 2)),
        perMobile: effect === "fade" ? 1 : int(a.slidesMobile, 1, 4, 1),
        gap: spacingValue(a.gap) ?? "1rem",
        arrows: bool(a.arrows, true),
        dots: bool(a.dots, true),
        autoplay: bool(a.autoplay, false),
        interval: int(a.interval, 2, 30, 5),
        loop: bool(a.loop, true),
    };
}
/** Biến CSS cho `.ecx-carousel` (style.css đọc --ecx-per / --ecx-per-t / --ecx-per-m / --ecx-gap). */
export function carouselVars(c) {
    return { "--ecx-per": String(c.per), "--ecx-per-t": String(c.perTablet), "--ecx-per-m": String(c.perMobile), "--ecx-gap": c.gap, "--ecx-speed": `${c.speed}ms`, ...(c.height === "ratio" ? { "--ecx-ratio": c.ratio } : {}), ...(c.height === "min" ? { "--ecx-min-h": c.minHeight } : {}) };
}
/** Thuộc tính data-* của `.ecx-carousel` (CSS đọc để chọn hiệu ứng, chiều cao, kiểu nút) — dùng chung website và trình soạn. */
export function carouselData(c) {
    return { "data-effect": c.effect, "data-height": c.height, "data-arrows": c.arrowStyle, "data-dots": c.dotStyle, "data-arrow-pos": c.arrowPos, ...(c.per > 1 ? { "data-multi": "1" } : {}) };
}

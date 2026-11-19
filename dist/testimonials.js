import { carouselConfig } from "./carousel.js";
import { spacingValue } from "./style.js";
const int = (v, min, max, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
export function testimonialsConfig(a) {
    const columns = int(a.columns, 1, 4, 3);
    const columnsTablet = int(a.columnsTablet, 1, 4, Math.min(columns, 2));
    const columnsMobile = int(a.columnsMobile, 1, 2, 1);
    const gap = spacingValue(a.gap) ?? "1.5rem";
    return {
        layout: a.layout === "carousel" ? "carousel" : "grid",
        columns, columnsTablet, columnsMobile, gap,
        carousel: carouselConfig({ slidesPerView: columns, slidesTablet: columnsTablet, slidesMobile: columnsMobile, gap, arrows: a.arrows, dots: a.dots, autoplay: a.autoplay, interval: a.interval, loop: a.loop, hoverPause: true }),
    };
}
/** Biến CSS của lưới (`--ecx-per` / `-t` / `-m` / `--ecx-gap`, cùng tên với Slider). */
export const testimonialsVars = (c) => ({ "--ecx-per": String(c.columns), "--ecx-per-t": String(c.columnsTablet), "--ecx-per-m": String(c.columnsMobile), "--ecx-gap": c.gap });

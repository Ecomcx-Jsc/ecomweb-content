import { spacingValue } from "./style.js";

/**
 * Cấu hình Carousel (khối "carousel"): một nơi đọc thuộc tính cho cả website (theme-sdk) và trình soạn, để hai bên hiển thị y hệt nhau.
 * Số slide thấy cùng lúc theo khổ máy (máy tính / tablet / điện thoại), khoảng cách, nút trước-sau, chấm, tự chạy.
 */
export interface CarouselConfig {
  per: number; perTablet: number; perMobile: number;
  /** Khoảng cách giữa các slide (độ dài CSS hợp lệ hoặc preset khoảng cách của theme). */
  gap: string;
  arrows: boolean; dots: boolean; autoplay: boolean;
  /** Giây giữa hai lần tự chuyển (2–30). */
  interval: number;
  /** Hết slide cuối thì quay lại slide đầu (khi tự chạy / bấm Sau). */
  loop: boolean;
  /** Cách chuyển slide: trượt ngang hoặc mờ dần (mờ dần luôn 1 slide / lần). */
  effect: "slide" | "fade";
  /** Thời gian chuyển (ms, 150–1500). */
  speed: number;
  /** Chiều cao slide: theo nội dung / theo tỉ lệ khung / tối thiểu cố định. */
  height: "auto" | "ratio" | "min";
  ratio: string;
  minHeight: string;
  arrowStyle: "circle" | "square" | "plain" | "light";
  dotStyle: "dot" | "line" | "light";
  arrowPos: "center" | "bottom";
  /** Dừng tự chạy khi rê chuột / lấy nét vào slider. */
  hoverPause: boolean;
}

const RATIOS = ["16/9", "4/3", "3/2", "1/1", "21/9", "3/1"];
const pick = <T extends string>(v: unknown, list: readonly T[], d: T): T => (list.includes(v as T) ? (v as T) : d);

const int = (v: unknown, min: number, max: number, d: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);

export function carouselConfig(a: Record<string, unknown>): CarouselConfig {
  const effect = pick(a.effect, ["slide", "fade"] as const, "slide");
  const per = effect === "fade" ? 1 : int(a.slidesPerView, 1, 4, 1);
  return {
    per,
    effect,
    speed: int(a.speed, 150, 1500, 400),
    height: pick(a.heightMode, ["auto", "ratio", "min"] as const, "auto"),
    ratio: pick(a.ratio, RATIOS, "16/9"),
    minHeight: spacingValue(a.minHeight) ?? "24rem",
    arrowStyle: pick(a.arrowStyle, ["circle", "square", "plain", "light"] as const, "circle"),
    dotStyle: pick(a.dotStyle, ["dot", "line", "light"] as const, "dot"),
    arrowPos: pick(a.arrowPos, ["center", "bottom"] as const, "center"),
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
export function carouselVars(c: CarouselConfig): Record<string, string> {
  return { "--ecx-per": String(c.per), "--ecx-per-t": String(c.perTablet), "--ecx-per-m": String(c.perMobile), "--ecx-gap": c.gap, "--ecx-speed": `${c.speed}ms`, ...(c.height === "ratio" ? { "--ecx-ratio": c.ratio } : {}), ...(c.height === "min" ? { "--ecx-min-h": c.minHeight } : {}) };
}

/** Thuộc tính data-* của `.ecx-carousel` (CSS đọc để chọn hiệu ứng, chiều cao, kiểu nút) — dùng chung website và trình soạn. */
export function carouselData(c: CarouselConfig): Record<string, string> {
  return { "data-effect": c.effect, "data-height": c.height, "data-arrows": c.arrowStyle, "data-dots": c.dotStyle, "data-arrow-pos": c.arrowPos, ...(c.per > 1 ? { "data-multi": "1" } : {}) };
}

/**
 * Cấu hình Carousel (khối "carousel"): một nơi đọc thuộc tính cho cả website (theme-sdk) và trình soạn, để hai bên hiển thị y hệt nhau.
 * Số slide thấy cùng lúc theo khổ máy (máy tính / tablet / điện thoại), khoảng cách, nút trước-sau, chấm, tự chạy.
 */
export interface CarouselConfig {
    per: number;
    perTablet: number;
    perMobile: number;
    /** Khoảng cách giữa các slide (độ dài CSS hợp lệ hoặc preset khoảng cách của theme). */
    gap: string;
    arrows: boolean;
    dots: boolean;
    autoplay: boolean;
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
export declare function carouselConfig(a: Record<string, unknown>): CarouselConfig;
/** Biến CSS cho `.ecx-carousel` (style.css đọc --ecx-per / --ecx-per-t / --ecx-per-m / --ecx-gap). */
export declare function carouselVars(c: CarouselConfig): Record<string, string>;
/** Thuộc tính data-* của `.ecx-carousel` (CSS đọc để chọn hiệu ứng, chiều cao, kiểu nút) — dùng chung website và trình soạn. */
export declare function carouselData(c: CarouselConfig): Record<string, string>;

import { type CarouselConfig } from "./carousel.js";
/**
 * Lời chứng thực nhiều mục (khối "testimonials"): các khối `testimonial` con xếp thành lưới hoặc chạy như slider.
 * Dạng slider dùng chung bộ máy của Slider (carousel) — một nơi đọc thuộc tính cho website và trình soạn.
 */
export interface TestimonialsConfig {
    layout: "grid" | "carousel";
    columns: number;
    columnsTablet: number;
    columnsMobile: number;
    gap: string;
    /** Cấu hình slider khi layout = carousel (số slide thấy cùng lúc = số cột). */
    carousel: CarouselConfig;
}
export declare function testimonialsConfig(a: Record<string, unknown>): TestimonialsConfig;
/** Biến CSS của lưới (`--ecx-per` / `-t` / `-m` / `--ecx-gap`, cùng tên với Slider). */
export declare const testimonialsVars: (c: TestimonialsConfig) => Record<string, string>;

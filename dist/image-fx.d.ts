/**
 * Tỉ lệ khung của khối Ảnh (cắt ảnh vừa khung, ví dụ 16/9): class + biến CSS đặt lên chính thẻ <img>, dùng chung website (theme-sdk) và trình soạn.
 * Bộ lọc, hiệu ứng khi rê, object-fit nằm ở tab Kiểu dáng (core-controls "core/image"). Giá trị lạ bị bỏ.
 */
export declare const IMAGE_RATIOS: readonly string[];
export interface ImageFx {
    className: string;
    style?: Record<string, string>;
}
export declare function imageFx(a: Record<string, unknown>): ImageFx;

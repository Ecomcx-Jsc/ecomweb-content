/**
 * Tỉ lệ khung của khối Ảnh (cắt ảnh vừa khung, ví dụ 16/9): class + biến CSS đặt lên chính thẻ <img>, dùng chung website (theme-sdk) và trình soạn.
 * Bộ lọc, hiệu ứng khi rê, object-fit nằm ở tab Kiểu dáng (core-controls "core/image"). Giá trị lạ bị bỏ.
 */
export const IMAGE_RATIOS = ["auto", "1/1", "4/3", "3/2", "16/9", "21/9", "3/4", "2/3"];
export function imageFx(a) {
    const ratio = typeof a.ratio === "string" && IMAGE_RATIOS.includes(a.ratio) && a.ratio !== "auto" ? a.ratio : null;
    return ratio ? { className: "has-ratio", style: { "--ecx-img-ratio": ratio } } : { className: "" };
}

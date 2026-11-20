export type SizedImage = {
    src: string;
    width: number;
    height?: number;
};
/**
 * Ảnh thư viện mang srcset (`url 150w, url 300w, …`). `size` = thumbnail / medium chọn bản lớn nhất không vượt cỡ đó
 * (giống WordPress: cỡ Vừa hiện ~300px, không phóng bản gốc lên cho vừa khung).
 * Trả null (giữ nguyên ảnh gốc) khi: không có srcset, chọn "large" / "full" / không chọn, người dùng đã kéo tay bề rộng (`width` ≠ bề rộng ảnh gốc),
 * hoặc bản gốc vốn đã nhỏ hơn cỡ được chọn.
 */
export declare function sizedImage(a: {
    src?: unknown;
    srcset?: unknown;
    size?: unknown;
    width?: unknown;
    height?: unknown;
    userWidth?: unknown;
}): SizedImage | null;

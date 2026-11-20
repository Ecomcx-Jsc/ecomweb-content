/** Cỡ ảnh người viết chọn (Nhỏ / Vừa / Lớn) → bản thu nhỏ trong srcset + kích thước hiển thị. Dùng chung cho website và trình soạn. */
// "large" / "full" = ảnh gốc theo khung (srcset lo phần responsive): giữ nguyên để bài cũ (mặc định large) không đổi hình
const TARGET = { thumbnail: 150, medium: 300 };
/**
 * Ảnh thư viện mang srcset (`url 150w, url 300w, …`). `size` = thumbnail / medium chọn bản lớn nhất không vượt cỡ đó
 * (giống WordPress: cỡ Vừa hiện ~300px, không phóng bản gốc lên cho vừa khung).
 * Trả null (giữ nguyên ảnh gốc) khi: không có srcset, chọn "large" / "full" / không chọn, người dùng đã kéo tay bề rộng (`width` ≠ bề rộng ảnh gốc),
 * hoặc bản gốc vốn đã nhỏ hơn cỡ được chọn.
 */
export function sizedImage(a) {
    const target = typeof a.size === "string" ? TARGET[a.size] : undefined;
    if (!target || typeof a.srcset !== "string" || !a.srcset.trim())
        return null;
    const cands = a.srcset.split(",").map((p) => p.trim().split(/\s+/)).map(([url, w]) => ({ url: url ?? "", w: parseInt(w ?? "", 10) })).filter((c) => c.url && Number.isFinite(c.w) && c.w > 0);
    if (cands.length < 2)
        return null;
    const original = cands.reduce((m, c) => (c.w > m.w ? c : m));
    if (original.w <= target)
        return null;
    // `width` khác bề rộng thật của ảnh gốc = người viết đã kéo tay → tôn trọng cỡ đó
    const set = Number(a.width);
    if (set > 0 && set !== original.w)
        return null;
    const fit = cands.filter((c) => c.w <= target).reduce((m, c) => (!m || c.w > m.w ? c : m), null);
    if (!fit)
        return null;
    const crop = /-(\d+)x(\d+)\.[a-z0-9]+(?:\?.*)?$/i.exec(fit.url);
    const ow = Number(a.width), oh = Number(a.height);
    const height = crop ? Number(crop[2]) : ow > 0 && oh > 0 ? Math.round((fit.w * oh) / ow) : undefined;
    return { src: fit.url, width: fit.w, ...(height ? { height } : {}) };
}

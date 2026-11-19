/**
 * Icon SVG riêng (người dùng dán mã hoặc chọn file .svg): lọc theo danh sách cho phép rồi lưu dạng giá trị `svg:<mã đã lọc>` ở thuộc tính icon.
 * Không dùng DOM (chạy ở máy chủ, trình duyệt, kiểm thử). Giá trị lưu LUÔN được lọc lại lúc vẽ (parseSvgIcon) — kẻ sửa nội dung bằng tay
 * cũng không đưa được script / sự kiện / liên kết ngoài vào trang.
 *
 * Cho phép: svg g path circle ellipse rect line polyline polygon; thuộc tính hình học + fill / stroke (màu bất kỳ → currentColor để ăn theo màu chữ,
 * "none" giữ nguyên), transform đơn giản. Cấm: script, style, use, image, foreignObject, mọi on*, href, url(…), id / class.
 */
export declare const SVG_ICON_PREFIX = "svg:";
export declare const SVG_ICON_MAX = 8000;
export interface SvgIconNode {
    tag: string;
    props: Record<string, string>;
    children: SvgIconNode[];
}
export interface SvgIcon {
    viewBox: string;
    root: Record<string, string>;
    children: SvgIconNode[];
}
/** Lọc một đoạn mã SVG → cây an toàn; null nếu không phải SVG dùng được. */
export declare function parseSvgIcon(source: string): SvgIcon | null;
/** Mã SVG gọn đã lọc (dùng làm giá trị lưu và làm ảnh mặt nạ). */
export declare function svgIconMarkup(icon: SvgIcon): string;
/** Từ mã người dùng dán → giá trị lưu `svg:…`, hoặc null (không phải SVG dùng được / quá lớn). */
export declare function toSvgIconValue(source: string): string | null;
export declare const isSvgIconValue: (v: unknown) => v is string;
/** Giá trị lưu → icon đã lọc lại (an toàn lúc vẽ). */
export declare const svgIconOf: (v: unknown) => SvgIcon | null;
/** Ảnh `data:` của icon (làm mặt nạ cho icon cạnh chữ). */
export declare function svgIconDataUrl(v: unknown): string | null;

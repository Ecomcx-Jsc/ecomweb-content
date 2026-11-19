/**
 * Định dạng nội dung 2 (v3): bỏ 10 khối cũ, đổi sang khối thay thế. Chạy trên cây thô TRƯỚC khi chuẩn hoá (khối cũ không còn trong schema),
 * chỉ khi nội dung là bản 1. Bản C# (ContentLegacy.cs) làm y hệt — so bằng fixture `legacy-v3.json`.
 *
 * horizontalRule → spacer có đường kẻ · youtube → video · mediaText → columns (ảnh | chữ) · callout → group có nền
 * pullquote → blockquote căn giữa · preformatted → codeBlock · taskList → bulletList (☐ / ☑ ở đầu mục)
 * rating → đoạn văn ★★★★☆ · footnotes → danh sách số các chú thích · pageBreak → bỏ
 * details lẻ (không nằm trong accordion) → accordion bọc ngoài · testimonial lẻ → testimonials bọc ngoài
 */
type Raw = Record<string, unknown>;
/** Nâng cây thô bản 1 → bản 2. Đầu vào là `{ version, blocks }` chưa chuẩn hoá; trả bản mới (không sửa đầu vào). */
export declare function upgradeLegacyContent(raw: Raw): Raw;
/** Loại khối cũ đã bỏ ở định dạng 2 (báo cáo của công cụ chuyển đổi dùng). */
export declare const LEGACY_TYPES: readonly ["horizontalRule", "youtube", "mediaText", "callout", "pullquote", "preformatted", "taskList", "taskItem", "rating", "footnotes", "pageBreak"];
export {};

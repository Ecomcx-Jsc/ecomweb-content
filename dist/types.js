/**
 * Định dạng nội dung của CMS (phiên bản 1). Đây là chuẩn của CMS — trình soạn (hiện là TipTap/ProseMirror) phải
 * chuyển sang chuẩn này, website và máy chủ chỉ đọc chuẩn này. Đổi trình soạn không đổi dữ liệu đã lưu.
 */
/** Phiên bản định dạng hiện tại. Tăng khi đổi cấu trúc — kèm hàm nâng cấp trong migrate.ts. */
/** 2 (v3): bỏ 10 khối cũ — bản 1 tự nâng khi đọc (legacy.ts). */
export const CONTENT_VERSION = 2;

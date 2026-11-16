/**
 * URL an toàn cho href/src: http(s), mailto, tel, tương đối (/, #, ?, ./), ảnh data:image/* (không SVG).
 * Cùng quy tắc với ContentSanitizer.IsSafeUrl của máy chủ.
 */
export declare function isSafeUrl(url: unknown): boolean;
/** URL an toàn hoặc chuỗi thay thế. */
export declare const safeUrl: (url: unknown, fallback?: string) => string;
/** Thay ký tự thay thế (surrogate) đơn lẻ bằng U+FFFD: cắt chuỗi giữa cặp emoji để lại ký tự lẻ, `encodeURIComponent` ném URIError ("URI malformed") và làm sập trang. */
export declare const wellFormed: (s: string) => string;
/** `encodeURIComponent` không bao giờ ném lỗi. */
export declare const encodeSafe: (s: string) => string;

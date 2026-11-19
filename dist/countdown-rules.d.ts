/**
 * Luật của Đếm ngược (khối "countdown"): hành động khi hết giờ, lặp lại theo chu kỳ, evergreen (đếm theo từng người xem) và nút tạm dừng.
 * Hàm thuần — website (theme-sdk) và trình soạn dùng chung để cho cùng kết quả; không đụng DOM / localStorage ở đây.
 */
export type ExpireAction = "zero" | "message" | "hide" | "redirect";
export type CountdownRepeat = "none" | "daily" | "weekly" | "monthly" | "yearly";
export interface CountdownRules {
    /** Khi hết giờ: giữ 0 | hiện chữ thay thế | ẩn khối | chuyển trang. Cũ: không đặt → có expiredText thì "message", không thì "zero". */
    action: ExpireAction;
    /** Địa chỉ chuyển trang (đã lọc an toàn, chỉ khi action = redirect). */
    redirectUrl: string | null;
    repeat: CountdownRepeat;
    /** Evergreen: tổng thời gian đếm cho mỗi người xem (ms) — null = đếm tới ngày cố định. */
    evergreenMs: number | null;
    /** Evergreen: sau bao nhiêu ngày thì người xem đếm lại từ đầu (0 = không bao giờ). */
    evergreenResetDays: number;
    pause: boolean;
}
export declare function countdownRules(a: Record<string, unknown>): CountdownRules;
/**
 * Mốc kế tiếp khi lặp lại: dời mốc gốc đúng một chu kỳ cho tới khi còn ở tương lai (ngày / tuần cố định; tháng / năm theo lịch,
 * ngày 31 của tháng ngắn lùi về ngày cuối tháng). Không lặp, hoặc mốc chưa tới → giữ nguyên.
 */
export declare function nextTarget(target: number, repeat: CountdownRepeat, now: number): number;
/** Evergreen: mốc kết thúc của người xem từ thời điểm bắt đầu đã lưu; quá hạn đặt lại thì bắt đầu lại từ `now`. Trả [mốc bắt đầu để lưu, mốc kết thúc]. */
export declare function evergreenWindow(startedAt: number | null, now: number, durationMs: number, resetDays: number): [start: number, end: number];

import { safeUrl } from "./url.js";
const num = (v, min, max, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
export function countdownRules(a) {
    const hasText = typeof a.expiredText === "string" && a.expiredText !== "";
    const action = a.expireAction === "hide" || a.expireAction === "redirect" || a.expireAction === "zero" || a.expireAction === "message" ? a.expireAction : hasText ? "message" : "zero";
    const url = action === "redirect" && typeof a.redirectUrl === "string" ? safeUrl(a.redirectUrl, "") : "";
    const mins = num(a.evergreenHours, 0, 24 * 90, 0) * 60 + num(a.evergreenMinutes, 0, 59, 0);
    return {
        action: action === "redirect" && !url ? (hasText ? "message" : "zero") : action,
        redirectUrl: url || null,
        repeat: a.repeat === "daily" || a.repeat === "weekly" || a.repeat === "monthly" || a.repeat === "yearly" ? a.repeat : "none",
        evergreenMs: a.mode === "evergreen" && mins > 0 ? mins * 60_000 : null,
        evergreenResetDays: num(a.evergreenReset, 0, 365, 30),
        pause: a.pauseButton === true,
    };
}
/**
 * Mốc kế tiếp khi lặp lại: dời mốc gốc đúng một chu kỳ cho tới khi còn ở tương lai (ngày / tuần cố định; tháng / năm theo lịch,
 * ngày 31 của tháng ngắn lùi về ngày cuối tháng). Không lặp, hoặc mốc chưa tới → giữ nguyên.
 */
export function nextTarget(target, repeat, now) {
    if (repeat === "none" || !Number.isFinite(target) || target > now)
        return target;
    if (repeat === "daily" || repeat === "weekly") {
        const step = (repeat === "daily" ? 1 : 7) * 86_400_000;
        return target + Math.ceil((now - target + 1) / step) * step;
    }
    const base = new Date(target);
    const day = base.getUTCDate();
    for (let k = 1; k < 2400; k++) {
        const months = repeat === "monthly" ? k : k * 12;
        const y = base.getUTCFullYear() + Math.floor((base.getUTCMonth() + months) / 12);
        const m = (base.getUTCMonth() + months) % 12;
        const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
        const t = Date.UTC(y, m, Math.min(day, last), base.getUTCHours(), base.getUTCMinutes(), base.getUTCSeconds());
        if (t > now)
            return t;
    }
    return target;
}
/** Evergreen: mốc kết thúc của người xem từ thời điểm bắt đầu đã lưu; quá hạn đặt lại thì bắt đầu lại từ `now`. Trả [mốc bắt đầu để lưu, mốc kết thúc]. */
export function evergreenWindow(startedAt, now, durationMs, resetDays) {
    let start = startedAt != null && Number.isFinite(startedAt) && startedAt <= now ? startedAt : now;
    if (resetDays > 0 && now - start >= resetDays * 86_400_000)
        start = now;
    return [start, start + durationMs];
}

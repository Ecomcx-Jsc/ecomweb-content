import { safeUrl } from "./url.js";

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
const num = (v: unknown, min: number, max: number, d: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };

export function countdownRules(a: Record<string, unknown>): CountdownRules {
  const hasText = typeof a.expiredText === "string" && a.expiredText !== "";
  const action: ExpireAction = a.expireAction === "hide" || a.expireAction === "redirect" || a.expireAction === "zero" || a.expireAction === "message" ? a.expireAction : hasText ? "message" : "zero";
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
export function nextTarget(target: number, repeat: CountdownRepeat, now: number): number {
  if (repeat === "none" || !Number.isFinite(target) || target > now) return target;
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
    if (t > now) return t;
  }
  return target;
}

/** Evergreen: mốc kết thúc của người xem từ thời điểm bắt đầu đã lưu; quá hạn đặt lại thì bắt đầu lại từ `now`. Trả [mốc bắt đầu để lưu, mốc kết thúc]. */
export function evergreenWindow(startedAt: number | null, now: number, durationMs: number, resetDays: number): [start: number, end: number] {
  let start = startedAt != null && Number.isFinite(startedAt) && startedAt <= now ? startedAt : now;
  if (resetDays > 0 && now - start >= resetDays * 86_400_000) start = now;
  return [start, start + durationMs];
}

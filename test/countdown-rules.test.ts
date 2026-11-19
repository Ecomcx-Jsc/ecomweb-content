import assert from "node:assert/strict";
import { test } from "node:test";
import { countdownRules, evergreenWindow, nextTarget } from "../src/countdown-rules.js";

const D = 86_400_000;
test("hành động khi hết giờ: cũ có chữ thay thế → message, không → zero; redirect cần địa chỉ an toàn", () => {
  assert.equal(countdownRules({}).action, "zero");
  assert.equal(countdownRules({ expiredText: "Hết rồi" }).action, "message");
  assert.equal(countdownRules({ expireAction: "hide" }).action, "hide");
  const r = countdownRules({ expireAction: "redirect", redirectUrl: "/cam-on" });
  assert.deepEqual([r.action, r.redirectUrl], ["redirect", "/cam-on"]);
  assert.equal(countdownRules({ expireAction: "redirect", redirectUrl: "javascript:alert(1)" }).action, "zero");
  assert.equal(countdownRules({ expireAction: "redirect", redirectUrl: "javascript:alert(1)", expiredText: "x" }).action, "message");
  assert.equal(countdownRules({ expireAction: "boom" }).action, "zero");
});
test("evergreen: giờ + phút → ms; thiếu thời gian thì tắt; mode lạ là date", () => {
  assert.equal(countdownRules({ mode: "evergreen", evergreenHours: 2, evergreenMinutes: 30 }).evergreenMs, 150 * 60_000);
  assert.equal(countdownRules({ mode: "evergreen" }).evergreenMs, null);
  assert.equal(countdownRules({ mode: "date", evergreenHours: 5 }).evergreenMs, null);
  assert.equal(countdownRules({ mode: "evergreen", evergreenHours: 1, evergreenReset: 0 }).evergreenResetDays, 0);
  assert.equal(countdownRules({ mode: "evergreen", evergreenHours: 1 }).evergreenResetDays, 30);
});
test("lặp ngày / tuần: dời đúng bội của chu kỳ, kể cả khi vừa đúng mốc", () => {
  const t = Date.UTC(2026, 0, 1, 12);
  assert.equal(nextTarget(t, "daily", t - 5), t); // chưa tới
  assert.equal(nextTarget(t, "daily", t), t + D); // vừa đúng mốc → sang ngày kế
  assert.equal(nextTarget(t, "daily", t + 3 * D + 1), t + 4 * D);
  assert.equal(nextTarget(t, "weekly", t + 8 * D), t + 14 * D);
  assert.equal(nextTarget(t, "none", t + 99 * D), t);
});
test("lặp tháng / năm: theo lịch, ngày 31 lùi về cuối tháng ngắn, 29/2 về 28/2 năm thường", () => {
  const jan31 = Date.UTC(2026, 0, 31, 8);
  assert.equal(nextTarget(jan31, "monthly", jan31 + 1), Date.UTC(2026, 1, 28, 8));
  assert.equal(nextTarget(jan31, "monthly", Date.UTC(2026, 1, 28, 9)), Date.UTC(2026, 2, 31, 8));
  const leap = Date.UTC(2024, 1, 29, 0);
  assert.equal(nextTarget(leap, "yearly", leap + 1), Date.UTC(2025, 1, 28, 0));
  assert.equal(nextTarget(leap, "yearly", Date.UTC(2025, 2, 1)), Date.UTC(2026, 1, 28, 0));
  assert.ok(nextTarget(Date.UTC(2000, 0, 1), "yearly", Date.UTC(2026, 5, 1)) > Date.UTC(2026, 5, 1));
});
test("evergreen: lần đầu bắt đầu từ bây giờ; lần sau giữ mốc đã lưu; quá hạn đặt lại thì bắt đầu lại; mốc lưu hỏng bị bỏ", () => {
  const now = Date.UTC(2026, 5, 1), dur = 3 * 3600_000;
  assert.deepEqual(evergreenWindow(null, now, dur, 30), [now, now + dur]);
  assert.deepEqual(evergreenWindow(now - 3600_000, now, dur, 30), [now - 3600_000, now - 3600_000 + dur]);
  assert.deepEqual(evergreenWindow(now - 31 * D, now, dur, 30), [now, now + dur]);
  assert.deepEqual(evergreenWindow(now - 400 * D, now, dur, 0), [now - 400 * D, now - 400 * D + dur]); // 0 = không bao giờ đặt lại
  assert.deepEqual(evergreenWindow(now + 5000, now, dur, 30), [now, now + dur]); // mốc ở tương lai (đồng hồ chỉnh) bị bỏ
  assert.deepEqual(evergreenWindow(Number.NaN, now, dur, 30), [now, now + dur]);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { scopeCustomCss } from "../src/custom-css.js";

const S = ".b.b";
const css = (raw: string) => scopeCustomCss(raw, S);

test("quy tắc với selector: được gắn phạm vi khối, giữ pseudo / hậu duệ / danh sách", () => {
  const r = css("selector { color: red } selector:hover { opacity: .8 } selector img, selector > p { border-radius: 8px }");
  assert.equal(r.css, ".b.b{color:red}.b.b:hover{opacity:.8}.b.b img,.b.b > p{border-radius:8px}");
  assert.deepEqual(r.dropped, []);
});
test("khai báo trần được bọc vào selector; bình luận bị bỏ", () => {
  assert.equal(css("/* ghi chú */ color: blue; margin: 0").css, ".b.b{color:blue;margin:0}");
});
test("bộ chọn không bắt đầu bằng selector bị bỏ (không tác động ngoài khối)", () => {
  const r = css("body { display:none } .x { color:red } selectorx { color:red } selector { color: green }");
  assert.equal(r.css, ".b.b{color:green}"); assert.ok(r.dropped.length >= 1);
});
test("@media được giữ và gắn phạm vi; @import / @font-face / @keyframes bị bỏ cả khối", () => {
  assert.equal(css("@media (max-width: 640px) { selector { padding: 4px } }").css, "@media (max-width: 640px){.b.b{padding:4px}}");
  const r = css("@import url(https://evil.test/x.css); @font-face { font-family: x; src: url(https://a.test/f.woff) } selector { color: red }");
  assert.ok(r.css.includes(".b.b{color:red}") && !r.css.includes("evil") && !r.css.includes("font-face"), r.css);
  assert.ok(r.dropped.length >= 1);
});
test("mã chạy được / thoát style / ký tự thoát bị bỏ", () => {
  for (const bad of ["selector { width: expression(alert(1)) }", "selector { background: url(javascript:alert(1)) }", "selector { behavior: url(x.htc) }", "selector { -moz-binding: url(x) }",
    "selector { color: red } </style><script>alert(1)</script>", "selector { content: '\\\\003c' }", "selector { background: url(data:text/html;base64,AAA) }"]) {
    const r = css(bad);
    assert.ok(!/expression|javascript|behavior|binding|<script|data:text/i.test(r.css), `${bad} → ${r.css}`);
  }
  assert.equal(css("selector { color: red } </style><script>alert(1)</script>").css, ""); // có "<": bỏ cả đoạn
});
test("url(): chỉ nhận /đường-dẫn-trong-site, https:// và ảnh nhúng; http:, //host bị bỏ", () => {
  assert.equal(css("selector { background-image: url(/uploads/a.png) }").css, ".b.b{background-image:url(/uploads/a.png)}");
  assert.equal(css("selector { background-image: url('https://cdn.test/a.png') }").css, ".b.b{background-image:url('https://cdn.test/a.png')}");
  assert.ok(css("selector { background-image: url(data:image/png;base64,iVBORw0KGgo=) }").css.includes("base64"));
  for (const bad of ["url(http://a.test/a.png)", "url(//a.test/a.png)", "url(ftp://a/b)"]) assert.equal(css(`selector { background-image: ${bad} }`).css, "", bad);
});
test("position: fixed bị bỏ (phủ kín trang) nhưng sticky / relative / absolute giữ", () => {
  assert.equal(css("selector { position: fixed; top: 0; left: 0 }").css, ".b.b{top:0;left:0}");
  assert.equal(css("selector { position: sticky; top: 0 }").css, ".b.b{position:sticky;top:0}");
});
test("giá trị chứa ngoặc nhọn / quá dài / thuộc tính lạ bị bỏ từng cái, cái hợp lệ còn lại", () => {
  const r = css(`selector { color: red; width: ${"a".repeat(600)}; 9bad: 1; ok-prop: 2px }`);
  assert.equal(r.css, ".b.b{color:red;ok-prop:2px}"); assert.ok(r.dropped.length >= 2);
});
test("rỗng / không phải chuỗi / quá dài: an toàn", () => {
  assert.deepEqual(scopeCustomCss(undefined, S), { css: "", dropped: [] });
  assert.deepEqual(scopeCustomCss("   ", S), { css: "", dropped: [] });
  assert.doesNotThrow(() => scopeCustomCss("{".repeat(5000) + "}".repeat(5000), S));
  assert.doesNotThrow(() => scopeCustomCss("@media (x) {".repeat(300), S));
  assert.doesNotThrow(() => scopeCustomCss("selector { color: red", S));
});

import { normalizeStyle, styleCss } from "../src/style.js";
test("tích hợp kiểu dáng: customCss được giữ qua normalizeStyle, ra CSS cùng class của khối; không có thì không ra", () => {
  const st = normalizeStyle({ color: { text: "primary" }, customCss: "selector:hover { opacity: .8 }" })!;
  assert.equal(st.customCss, "selector:hover { opacity: .8 }");
  const out = styleCss(st); assert.match(out, /\.ecx-s-[a-z0-9]+\.ecx-s-[a-z0-9]+:hover\{opacity:\.8\}/);
  assert.equal(normalizeStyle({ customCss: "   " }), undefined);
  assert.ok(!styleCss(normalizeStyle({ color: { text: "primary" } })!).includes("hover"));
  const evil = normalizeStyle({ customCss: "body{display:none} selector{color:red}" })!; assert.ok(!styleCss(evil).includes("body"));
});

import { scheduleVisible } from "../src/style.js";
test("lịch hiển thị: chuẩn hoá ISO UTC, bỏ giá trị hỏng, hiện đúng trong [from, until)", () => {
  const st = normalizeStyle({ schedule: { from: "2026-12-01T00:00:00+07:00", until: "2026-12-31T00:00:00Z" } })!;
  assert.deepEqual(st.schedule, { from: "2026-11-30T17:00:00.000Z", until: "2026-12-31T00:00:00.000Z" });
  assert.equal(normalizeStyle({ schedule: { from: "không phải ngày", until: "<x>" } }), undefined);
  assert.deepEqual(normalizeStyle({ schedule: { until: "2026-12-31T00:00:00Z", from: 5 } })!.schedule, { until: "2026-12-31T00:00:00.000Z" });
  const t = (iso: string) => Date.parse(iso);
  assert.equal(scheduleVisible(undefined), true); assert.equal(scheduleVisible({}), true);
  assert.equal(scheduleVisible(st, t("2026-11-30T16:59:59Z")), false); // chưa tới
  assert.equal(scheduleVisible(st, t("2026-11-30T17:00:00Z")), true);  // đúng from
  assert.equal(scheduleVisible(st, t("2026-12-30T23:59:59Z")), true);
  assert.equal(scheduleVisible(st, t("2026-12-31T00:00:00Z")), false); // đúng until = hết
  assert.equal(scheduleVisible({ schedule: { from: "2026-01-01T00:00:00.000Z" } }, t("2099-01-01T00:00:00Z")), true); // chỉ có from: hiện mãi sau đó
});

test("audience: chỉ nhận guest / user, giá trị khác bị bỏ", () => {
  assert.equal(normalizeStyle({ audience: "guest" })?.audience, "guest");
  assert.equal(normalizeStyle({ audience: "user" })?.audience, "user");
  assert.equal(normalizeStyle({ audience: "admin" }), undefined);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { testimonialsConfig, testimonialsVars } from "../src/testimonials.js";
import { CORE_NODES, normalizeAttrs } from "../src/schema.js";

test("testimonials: mặc định — lưới 3 cột (tablet 2, điện thoại 1)", () => {
  const c = testimonialsConfig({});
  assert.deepEqual([c.layout, c.columns, c.columnsTablet, c.columnsMobile, c.gap], ["grid", 3, 2, 1, "1.5rem"]);
  assert.deepEqual(testimonialsVars(c), { "--ecx-per": "3", "--ecx-per-t": "2", "--ecx-per-m": "1", "--ecx-gap": "1.5rem" });
});
test("testimonials: dạng slider dùng chung cấu hình Slider — số cột = số slide thấy cùng lúc", () => {
  const c = testimonialsConfig({ layout: "carousel", columns: 2, autoplay: true, interval: 8, dots: false });
  assert.equal(c.layout, "carousel");
  assert.deepEqual([c.carousel.per, c.carousel.perTablet, c.carousel.perMobile, c.carousel.autoplay, c.carousel.interval, c.carousel.dots], [2, 2, 1, true, 8, false]);
});
test("testimonials: giá trị lạ bị kẹp / bỏ", () => {
  const c = testimonialsConfig({ layout: "evil", columns: 99, columnsMobile: 9, gap: "1px;x" });
  assert.deepEqual([c.layout, c.columns, c.columnsMobile], ["grid", 4, 2]);
  assert.equal(c.gap, "1.5rem");
  const a = normalizeAttrs({ columns: 0, layout: "bad" }, CORE_NODES.testimonials.attrs)!;
  assert.equal(a.columns, 1); assert.equal(a.layout, undefined);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { carouselConfig, carouselVars } from "../src/carousel.js";
import { CORE_NODES, normalizeAttrs } from "../src/schema.js";

test("carousel: mặc định — 1 slide, tablet / điện thoại không nhiều hơn, có nút + chấm, không tự chạy", () => {
  const c = carouselConfig({});
  assert.deepEqual({ per: c.per, perTablet: c.perTablet, perMobile: c.perMobile, gap: c.gap, arrows: c.arrows, dots: c.dots, autoplay: c.autoplay, interval: c.interval, loop: c.loop }, { per: 1, perTablet: 1, perMobile: 1, gap: "1rem", arrows: true, dots: true, autoplay: false, interval: 5, loop: true });
});

test("carousel: 3 slide máy tính → tablet 2, điện thoại 1; đặt riêng thì theo; giá trị sai bị kẹp", () => {
  assert.deepEqual([3, 2, 1], [carouselConfig({ slidesPerView: 3 }).per, carouselConfig({ slidesPerView: 3 }).perTablet, carouselConfig({ slidesPerView: 3 }).perMobile]);
  const c = carouselConfig({ slidesPerView: 4, slidesTablet: 3, slidesMobile: 2, interval: 999, autoplay: true, loop: false, arrows: false, dots: false, gap: "24px" });
  assert.deepEqual([c.per, c.perTablet, c.perMobile, c.interval, c.autoplay, c.loop, c.arrows, c.dots, c.gap], [4, 3, 2, 30, true, false, false, false, "24px"]);
  assert.equal(carouselConfig({ slidesPerView: "abc", interval: 0 }).interval, 2);
  assert.equal(carouselConfig({ gap: "url(javascript:alert(1))" }).gap, "1rem");
});

test("carousel: biến CSS cho style.css", () => {
  assert.deepEqual(carouselVars(carouselConfig({ slidesPerView: 3 })), { "--ecx-per": "3", "--ecx-per-t": "2", "--ecx-per-m": "1", "--ecx-gap": "1rem", "--ecx-speed": "400ms" });
});

test("carousel: schema giữ thuộc tính mới, bỏ giá trị ngoài khoảng", () => {
  const r = normalizeAttrs({ slidesPerView: 3, slidesTablet: 2, arrows: false, autoplay: true, interval: 8, loop: false, gap: "lg", slidesMobile: 9 }, CORE_NODES.carousel.attrs) as Record<string, unknown>;
  assert.equal(r.slidesTablet, 2); assert.equal(r.arrows, false); assert.equal(r.autoplay, true); assert.equal(r.interval, 8); assert.equal(r.slidesMobile, 4);
});

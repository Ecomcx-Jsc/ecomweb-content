import assert from "node:assert/strict";
import { test } from "node:test";
import { carouselConfig, carouselData, carouselVars } from "../src/carousel.js";

test("slider: mặc định như cũ — trượt, 400ms, chiều cao theo nội dung", () => {
  const c = carouselConfig({});
  assert.equal(c.effect, "slide"); assert.equal(c.speed, 400); assert.equal(c.height, "auto");
  assert.equal(c.arrowStyle, "circle"); assert.equal(c.dotStyle, "dot"); assert.equal(c.arrowPos, "center"); assert.equal(c.hoverPause, true);
  assert.equal(carouselVars(c)["--ecx-ratio"], undefined);
});
test("slider: mờ dần luôn 1 slide / lần dù đặt nhiều", () => {
  const c = carouselConfig({ effect: "fade", slidesPerView: 3, slidesTablet: 2 });
  assert.deepEqual([c.per, c.perTablet, c.perMobile], [1, 1, 1]);
});
test("slider: tỉ lệ / chiều cao tối thiểu đi vào biến CSS; giá trị lạ bị bỏ", () => {
  assert.equal(carouselVars(carouselConfig({ heightMode: "ratio", ratio: "21/9" }))["--ecx-ratio"], "21/9");
  assert.equal(carouselVars(carouselConfig({ heightMode: "ratio", ratio: "x;y" }))["--ecx-ratio"], "16/9");
  assert.equal(carouselVars(carouselConfig({ heightMode: "min", minHeight: "30rem" }))["--ecx-min-h"], "30rem");
  const d = carouselData(carouselConfig({ effect: "bad", arrowStyle: "x" }));
  assert.equal(d["data-effect"], "slide"); assert.equal(d["data-arrows"], "circle");
});
test("slider: tốc độ bị kẹp 150–1500ms", () => {
  assert.equal(carouselConfig({ speed: 5 }).speed, 150);
  assert.equal(carouselConfig({ speed: 99999 }).speed, 1500);
});

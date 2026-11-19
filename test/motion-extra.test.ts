import assert from "node:assert/strict";
import { test } from "node:test";
import { motionCss, normalizeStyle } from "../src/style.js";

test("chuyển động mở rộng: easing / lặp / thị sai / hover mới được giữ, giá trị lạ bị bỏ", () => {
  const m = normalizeStyle({ motion: { in: "flip-x", ease: "bounce", loop: "float", hover: "tilt" } })?.motion;
  assert.deepEqual(m, { in: "flip-x", ease: "bounce", loop: "float", hover: "tilt" });
  assert.equal(normalizeStyle({ motion: { in: "fade", ease: "zzz" } })?.motion?.ease, undefined);
  assert.equal(normalizeStyle({ motion: { loop: "spin", parallax: "fast" } })?.motion?.parallax, undefined); // thị sai bỏ khi có lặp
  assert.equal(normalizeStyle({ motion: { parallax: "fast" } })?.motion?.parallax, "fast");
});
test("CSS chuyển động: easing đổi đường cong, lặp gộp chung animation với hiệu ứng vào, thị sai nằm trong @supports", () => {
  const css = (m: object) => motionCss(normalizeStyle({ motion: m })!, "c");
  assert.match(css({ in: "fade", ease: "bounce" }), /cubic-bezier\(\.34, 1\.56/);
  const both = css({ in: "fade", loop: "pulse" });
  assert.match(both, /\.is-in\{animation:ecx-in-fade[^;}]*,ecx-loop-pulse/, both);
  assert.match(css({ parallax: "slow" }), /@supports \(animation-timeline:view\(\)\)\{[^}]*ecx-parallax/);
  assert.match(css({ loop: "spin" }), /animation:ecx-loop-spin 12s linear infinite/);
  assert.match(css({ hover: "gray" }), /grayscale\(1\)/);
});

test("gallery: layout mosaic hợp lệ, vỏ lưới dày đặc ≥ 2 cột", async () => {
  const { blockShell } = await import("../src/markup.js");
  const sh = blockShell("gallery", { layout: "mosaic", columns: 3 })!;
  assert.match(sh.className ?? "", /is-mosaic/);
  assert.equal((sh.style as Record<string, string>).gridAutoFlow, "dense");
  assert.match(blockShell("gallery", { layout: "mosaic", columns: 1 })!.className ?? "", /columns-2/);
});

test("gallery: tiles có lưới dày đặc + hàng cao cố định; captionStyle thêm class; thumbs rơi về lưới ở vỏ chung", async () => {
  const { blockShell } = await import("../src/markup.js");
  const t = blockShell("gallery", { layout: "tiles", columns: 4, captionStyle: "hover" })!;
  assert.match(t.className ?? "", /is-tiles/);
  assert.match(t.className ?? "", /is-cap-hover/);
  assert.equal((t.style as Record<string, string>).gridAutoFlow, "dense");
  assert.match(blockShell("gallery", { captionStyle: "overlay" })!.className ?? "", /is-cap-overlay/);
  assert.doesNotMatch(blockShell("gallery", { captionStyle: "bogus" })!.className ?? "", /is-cap/);
});

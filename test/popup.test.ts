import assert from "node:assert/strict";
import { test } from "node:test";
import { popupClass, popupConfig, popupVars } from "../src/popup.js";
import { CORE_NODES, normalizeAttrs } from "../src/schema.js";

test("popup: mặc định — nút chính căn trái, vừa 40rem, mờ dần, có nút đóng, bấm nền để đóng", () => {
  const c = popupConfig({});
  assert.deepEqual(c, { triggerStyle: "primary", triggerAlign: "left", size: "md", anim: "fade", overlay: 60, vAlign: "center", closeButton: true, closeOnOverlay: true, id: "", auto: "none", autoDelay: 5, autoScroll: 50, onceDays: 0 });
  assert.equal(popupClass(c), "ecx-popup is-size-md is-anim-fade is-valign-center is-align-left");
  assert.equal(popupVars(c)["--ecx-popup-dim"], "0.6");
});
test("popup: giá trị lạ về mặc định, độ tối bị kẹp 0–100", () => {
  const c = popupConfig({ size: "huge;x", anim: "spin", triggerStyle: "red", overlayOpacity: 400, closeButton: "no" });
  assert.equal(c.size, "md"); assert.equal(c.anim, "fade"); assert.equal(c.triggerStyle, "primary"); assert.equal(c.overlay, 100); assert.equal(c.closeButton, true);
  assert.equal(popupConfig({ overlayOpacity: -5 }).overlay, 0);
});
test("popup: schema kẹp thuộc tính", () => {
  const a = normalizeAttrs({ size: "xl", anim: "bad", overlayOpacity: 150 }, CORE_NODES.popup.attrs)!;
  assert.equal(a.size, "xl"); assert.equal(a.anim, undefined); assert.equal(a.overlayOpacity, 100);
});

test("popup: id mở từ nơi khác + tự mở — giá trị lạ về mặc định, số được kẹp", () => {
  const c = popupConfig({ popupId: "khuyen-mai", autoOpen: "scroll", autoScroll: 500, onceDays: 999, autoDelay: -3 });
  assert.deepEqual([c.id, c.auto, c.autoScroll, c.onceDays, c.autoDelay], ["khuyen-mai", "scroll", 100, 365, 0]);
  const bad = popupConfig({ popupId: "Bad Id!", autoOpen: "bogus" });
  assert.deepEqual([bad.id, bad.auto], ["", "none"]);
});

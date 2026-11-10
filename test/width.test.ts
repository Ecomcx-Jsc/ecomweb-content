import { test } from "node:test";
import assert from "node:assert/strict";
import { WIDE_BLOCKS, blockShell, normalizeContent, normalizePresets, presetCss, widthClass } from "../src/index.js";

test("WIDE_BLOCKS: khối bố cục / media có align wide|full, khối chữ và nút thì không", () => {
  for (const t of ["group", "columns", "cover", "mediaText", "gallery", "image", "video", "embed", "table", "query"]) assert.ok(WIDE_BLOCKS.includes(t), t);
  for (const t of ["paragraph", "heading", "button", "buttons", "socialLinks"]) assert.ok(!WIDE_BLOCKS.includes(t), t);
});

test("widthClass: chỉ wide/full trên khối hỗ trợ; ảnh để vỏ tự gắn", () => {
  assert.equal(widthClass("group", { align: "full" }), "ecx-align-full alignfull");
  assert.equal(widthClass("columns", { align: "wide" }), "ecx-align-wide alignwide");
  assert.equal(widthClass("group", { align: "evil x" }), undefined);
  assert.equal(widthClass("button", { align: "full" }), undefined);
  assert.equal(widthClass("image", { align: "full" }), undefined);
  assert.match(blockShell("image", { align: "full" })!.className!, /ecx-align-full/);
});

test("constrained: nhóm / bìa giữ chữ bên trong ở bề rộng cột chữ", () => {
  assert.match(blockShell("group", { constrained: true })!.className!, /ecx-is-constrained/);
  assert.match(blockShell("cover", { constrained: true })!.className!, /ecx-is-constrained/);
  assert.doesNotMatch(blockShell("group", {})!.className!, /constrained/);
});

test("normalizeContent: align lạ bị bỏ, wide/full giữ", () => {
  const doc = (align: string) => ({ version: 1, blocks: [{ type: "richtext", data: { type: "doc", content: [{ type: "group", attrs: { align }, content: [{ type: "paragraph" }] }] } }] });
  const attrs = (align: string) => (normalizeContent(doc(align)).doc.blocks[0].data as any).content[0].attrs ?? {};
  assert.equal(attrs("full").align, "full");
  assert.equal(attrs("left").align, undefined);
});

test("preset layout: bề rộng hợp lệ → biến CSS, giá trị độc bị bỏ", () => {
  assert.deepEqual(normalizePresets({ layout: { contentWidth: "720px", wideWidth: "1200px" } }).layout, { contentWidth: "720px", wideWidth: "1200px" });
  assert.equal(normalizePresets({ layout: { contentWidth: "1px;}body{x:y", wideWidth: "-5px" } }).layout, undefined);
  const css = presetCss({ layout: { contentWidth: "45rem" } });
  assert.match(css, /--ecx-content-width:45rem/);
});

test("nhóm toàn trang có nền: không bo góc (tràn sát mép màn hình)", () => {
  assert.equal(blockShell("group", { background: "#fff", align: "full" })!.style!.borderRadius, undefined);
  assert.equal(blockShell("group", { background: "#fff", align: "wide" })!.style!.borderRadius, 12);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeContent } from "../src/index.js";

// next: thuộc tính hành vi của video / audio / query được ép kiểu; giá trị sai bị bỏ
const run = (node: unknown) => {
  const doc = normalizeContent({ version: 1, blocks: [{ id: "main", type: "richtext", data: { type: "doc", content: [node] } }] } as never).doc as unknown as { blocks: { data: { content: { attrs?: Record<string, unknown> }[] } }[] };
  return doc.blocks[0].data.content[0].attrs ?? {};
};

test("video: boolean ép kiểu, preload ngoài danh sách bị bỏ", () => {
  const a = run({ type: "video", attrs: { src: "/v.mp4", autoplay: "true", loop: 1, muted: true, preload: "bogus" } });
  assert.equal(a.autoplay, true);
  assert.equal(a.muted, true);
  assert.equal(a.preload, undefined);
});

test("query: authorId là số nguyên dương, sticky chỉ nhận any|only|exclude, orderBy mới hợp lệ", () => {
  const a = run({ type: "query", attrs: { inherit: false, authorId: "7", sticky: "only", orderBy: "rand", exclude: "1,2" } });
  assert.equal(a.authorId, 7);
  assert.equal(a.sticky, "only");
  assert.equal(a.orderBy, "rand");
  assert.equal(a.exclude, "1,2");
  const bad = run({ type: "query", attrs: { authorId: -3, sticky: "all", orderBy: "id; drop" } });
  assert.equal(bad.authorId, 1); // số kẹp vào [min, max], không bỏ
  assert.equal(bad.sticky, undefined);
  assert.equal(bad.orderBy, undefined);
});

test("image.href / linkTarget, blockquote.citation, orderedList.reversed, postDate.displayType", () => {
  const img = run({ type: "image", attrs: { src: "/a.jpg", href: "javascript:alert(1)", linkTarget: "_top" } });
  // URL độc không bị bỏ ở bước chuẩn hoá: renderer (safeUrl) và ContentSanitizer phía core chặn
  assert.equal(img.linkTarget, undefined);
  assert.equal(run({ type: "image", attrs: { src: "/a.jpg", href: "/x", linkTarget: "_blank" } }).linkTarget, "_blank");
  assert.equal(run({ type: "blockquote", attrs: { citation: "An" } }).citation, "An");
  assert.equal(run({ type: "orderedList", attrs: { reversed: "true" } }).reversed, true);
  assert.equal(run({ type: "postDate", attrs: { displayType: "modified" } }).displayType, "modified");
  assert.equal(run({ type: "postDate", attrs: { displayType: "x" } }).displayType, undefined);
});

test("block mới: rating kẹp giá trị, countdown/accordion giữ thuộc tính, gallery/navigation enum sai bị bỏ", () => {
  const r = run({ type: "rating", attrs: { value: 99, max: 3, label: "x" } });
  assert.equal(r.value, 10);
  assert.equal(r.max, 3);
  assert.equal(run({ type: "countdown", attrs: { target: "2030-01-01T00:00:00Z", label: "Sale" } }).target, "2030-01-01T00:00:00Z");
  assert.equal(run({ type: "accordion", attrs: { multiple: "true" } }).multiple, true);
  assert.equal(run({ type: "gallery", attrs: { images: [], linkTo: "bogus", imageCrop: false } }).linkTo, undefined);
  assert.equal(run({ type: "navigation", attrs: { overlayMenu: "always" } }).overlayMenu, "always");
  assert.equal(run({ type: "languageSwitcher", attrs: { display: "dropdown" } }).display, "dropdown");
  assert.equal(run({ type: "postAuthor", attrs: { avatarSize: 9999, showName: false } }).avatarSize, 128);
});

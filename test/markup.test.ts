import assert from "node:assert/strict";
import { test } from "node:test";
import { blockCitation, blockShell, buttonWrapShell, coverParts, linkRel } from "../src/index.js";

test("paragraph: căn trái không in style, căn khác thì có", () => {
  assert.equal(blockShell("paragraph", { textAlign: "left" })!.style, undefined);
  assert.deepEqual(blockShell("paragraph", { textAlign: "center" })!.style, { textAlign: "center" });
});
test("columns: class theo căn dọc, flex-wrap theo stack; column đọc stack của cha", () => {
  const c = blockShell("columns", { verticalAlign: "center", stack: false })!;
  assert.equal(c.className, "ecx-columns cms-columns ecx-columns-center cms-columns-center");
  assert.equal(c.style!.flexWrap, "nowrap");
  assert.equal(blockShell("column", { width: 30 }, { type: "columns", attrs: { stack: false } })!.style!.minWidth, 0);
  assert.equal(blockShell("column", {}, { type: "columns" })!.style!.minWidth, "min(100%, 14rem)");
});
test("blockquote: trích dẫn; khối lạ → null", () => {
  assert.equal(blockCitation({ citation: "A" }), "A");
  assert.equal(blockCitation({}), undefined);
  assert.equal(blockShell("nope"), null);
});

test("group/callout/button/spacer/cover/mediaText/pullquote có vỏ; nút đứng riêng có vỏ bọc", () => {
  assert.equal(blockShell("group", { padding: "small" })!.style!.padding, "0.75rem");
  assert.equal(blockShell("group", { background: "#fff" })!.style!.padding, "1.5rem");
  assert.equal(blockShell("callout", { tone: "x" })!.className, "ecx-callout cms-callout ecx-callout-info cms-callout-info");
  assert.equal(blockShell("button", { variant: "outline" })!.tag, "a");
  assert.equal(blockShell("spacer", {})!.style!.height !== undefined, true);
  assert.equal(blockShell("mediaText", { position: "right" })!.className, "ecx-media-text is-right is-stack");
  assert.equal(blockShell("pullquote")!.tag, "figure");
  assert.equal(buttonWrapShell({ align: "center" }).style!.textAlign, "center");
  assert.equal(coverParts({ src: "/a.jpg", fixed: true }).fixed, true);
});

test("customHtml / embed", () => {
  assert.equal(blockShell("customHtml", {})!.className, "ecx-html");
  assert.equal(blockShell("embed", { url: "https://example.com/x" }), null);
  assert.match(blockShell("embed", { url: "https://vimeo.com/76979871" })!.className!, /ecx-embed-vimeo cms-embed-vimeo/);
});

test("linkRel + gallery", () => {
  assert.equal(linkRel("nofollow", "_blank"), "nofollow noopener noreferrer");
  assert.equal(linkRel(null, null), undefined);
  assert.equal(blockShell("gallery", { columns: 2 })!.className, "ecx-gallery cms-gallery ecx-gallery-columns-2 columns-2");
});

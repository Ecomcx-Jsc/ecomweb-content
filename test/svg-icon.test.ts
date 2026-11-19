import assert from "node:assert/strict";
import { test } from "node:test";
import { ICON_CORE_COUNT, ICON_NAMES, ICON_PATHS, blockShell, iconEl, normalizeContent, parseSvgIcon, registerIconLibrary, resolveIcon, svgIconDataUrl, toSvgIconValue } from "../src/index.js";

const GOOD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#ff0000" d="M256 8 504 256 256 504 8 256z"/><circle cx="256" cy="256" r="40" fill="none" stroke="blue" stroke-width="4"/></svg>';

test("svg riêng: lọc giữ hình, đổi màu thành currentColor (none giữ nguyên), giữ viewBox", () => {
  const icon = parseSvgIcon(GOOD)!;
  assert.equal(icon.viewBox, "0 0 512 512");
  assert.equal(icon.children[0].props.fill, "currentColor");
  assert.equal(icon.children[1].props.fill, "none");
  assert.equal(icon.children[1].props.stroke, "currentColor");
  assert.equal(icon.children.length, 2);
});

test("svg riêng: script, sự kiện, liên kết ngoài, style, use, foreignObject, url() đều bị bỏ", () => {
  const evil = '<svg viewBox="0 0 24 24" onload="alert(1)"><script>alert(1)</script><style>*{}</style><use href="x.svg#a"/><foreignObject><div/></foreignObject><image href="https://x/y.png"/><a href="javascript:alert(1)"><path d="M0 0L10 10" onclick="x()" fill="url(#g)" id="a" class="b"/></a><path d="M1 1h4" fill="red"/></svg>';
  const icon = parseSvgIcon(evil)!;
  const out = JSON.stringify(icon);
  for (const bad of ["script", "onload", "onclick", "href", "foreignObject", "image", "style", "url(", "alert", "class"]) assert.ok(!out.includes(bad), bad + " " + out);
  assert.ok(!Object.keys(icon.children[0].props).some((k) => k === "id" || k === "class" || k.startsWith("on")));
  assert.equal(icon.children.length, 1); // chỉ path hợp lệ (cái nằm trong <a> bị bỏ cả thẻ lạ)
  assert.equal(icon.children[0].props.d, "M1 1h4");
});

test("svg riêng: không phải svg / không có hình / quá lớn → null; không viewBox thì lấy từ width / height", () => {
  assert.equal(toSvgIconValue("<div>x</div>"), null);
  assert.equal(toSvgIconValue("<svg viewBox='0 0 24 24'></svg>"), null);
  assert.equal(toSvgIconValue('<svg viewBox="0 0 24 24"><path d="' + "M0 0L1 1".repeat(2000) + '"/></svg>'), null);
  assert.equal(parseSvgIcon('<svg width="40" height="20"><rect x="0" y="0" width="40" height="20"/></svg>')!.viewBox, "0 0 40 20");
});

test("svg riêng: giá trị lưu `svg:…` được vẽ lại qua bộ lọc (sửa tay cũng không chèn được mã), iconEl ra <svg> nội dòng", () => {
  const v = toSvgIconValue(GOOD)!;
  assert.ok(v.startsWith("svg:"));
  const el = iconEl(v);
  assert.equal(el.tag, "svg");
  assert.equal(el.props!.viewBox, "0 0 512 512");
  assert.equal(el.children!.length, 2);
  const forged = iconEl('svg:<svg viewBox="0 0 24 24"><script>x</script><path d="M0 0L5 5" onclick="x"/></svg>');
  assert.ok(!JSON.stringify(forged).includes("script") && !JSON.stringify(forged).includes("onclick"));
  assert.equal(resolveIcon("svg:<b>x</b>"), undefined);
});

test("icon cạnh chữ dùng svg riêng làm mặt nạ (data URL đã lọc)", () => {
  const v = toSvgIconValue(GOOD)!;
  const sh = blockShell("heading", { level: 2, icon: v })!;
  assert.match(String((sh.style as Record<string, string>)["--ecx-text-icon"]), /^url\("data:image\/svg\+xml,%3Csvg/);
  assert.ok(svgIconDataUrl(v)!.length > 50);
});

test("thư viện icon: nạp thêm tên mới, không đè tên lõi; icon nhiều hình vẫn là MỘT chuỗi d", async () => {
  const before = ICON_NAMES.length;
  assert.equal(before, ICON_CORE_COUNT);
  const { ICON_LIBRARY } = await import("../src/icon-library.js");
  registerIconLibrary(ICON_LIBRARY);
  registerIconLibrary(ICON_LIBRARY); // lần hai vô hại
  assert.ok(ICON_NAMES.length > 1500, String(ICON_NAMES.length));
  assert.equal(ICON_PATHS.check, "M20 6 9 17l-5-5"); // lõi giữ nguyên
  assert.ok(ICON_PATHS["shopping-cart"], "có icon thư viện");
  assert.equal(((iconEl("shopping-cart").children![0] as unknown) as { props: { d: string } }).props.d, ICON_PATHS["shopping-cart"]);
  assert.ok(Object.values(ICON_LIBRARY).every((d) => /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/.test(d)));
});

test("schema: icon nhận tên hợp lệ hoặc svg:…, bỏ tên lạ ký tự", () => {
  const run = (icon: unknown) => (normalizeContent({ version: 1, blocks: [{ id: "m", type: "richtext", data: { type: "doc", content: [{ type: "iconBox", attrs: { icon } }] } }] } as never).doc.blocks[0].data as { content: Array<{ attrs?: { icon?: string } }> }).content[0].attrs?.icon;
  assert.equal(run("shopping-cart"), "shopping-cart");
  assert.equal(run("arrowRight"), "arrowRight");
  assert.equal(run("<script>"), undefined);
  const v = toSvgIconValue(GOOD)!;
  assert.equal(run(v), v);
});

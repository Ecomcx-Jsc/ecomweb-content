import assert from "node:assert/strict";
import { test } from "node:test";
import { CORE_CONTROLS, controlsCss, coreControlsFor, normalizeParts, partsFor } from "../src/index.js";

const css = (type: string, attrs: Record<string, unknown>) => {
  const r = controlsCss(CORE_CONTROLS, type, attrs);
  return r ? r.css.replaceAll(r.cls, "X") : "";
};

test("ô Kiểu dáng lõi: danh sách (kiểu dấu, màu dấu, khoảng cách theo khổ, đường kẻ)", () => {
  assert.equal(css("bulletList", { listMarker: "check", listMarkerColor: "primary", listGap: { base: "md", mobile: "8px" }, listDivider: "#eee" }),
    ".X.X{list-style-type: var(--ecx-list-check, check)}.X.X > li::marker{color: var(--ecx-color-primary, primary)}"
    + ".X.X > li + li{margin-top: calc(var(--ecx-spacing-md) / 2);border-top: 1px solid #eee}.X.X > li:not(:first-child){padding-top: calc(var(--ecx-spacing-md) / 2)}"
    + "@media (max-width:640px){.X.X > li + li{margin-top: calc(8px / 2)}.X.X > li:not(:first-child){padding-top: calc(8px / 2)}}");
});

test("nút: màu Thường / Rê chuột qua biến của vỏ nút; ảnh: cả <img> trần lẫn <figure>", () => {
  assert.equal(css("button", { buttonBg: "#111", buttonHoverBg: "#222", buttonSize: "lg" }),
    ".X.X{--ecx-btn-bg: #111;--ecx-button-padding: var(--ecx-button-padding-lg)}.X.X:is(a):hover{--ecx-btn-bg: #222}.X.X a:hover{--ecx-btn-bg: #222}");
  assert.equal(css("image", { imageRadius: "12px", imageHoverEffect: "zoom" }),
    ".X.X img{border-radius: 12px}.X.X:is(img){border-radius: 12px}.X.X:hover img{transform: var(--ecx-hover-zoom)}.X.X:is(img):hover{transform: var(--ecx-hover-zoom)}");
});

test("bảng, tabs, đường kẻ, widget: bộ chọn theo markup chung", () => {
  assert.equal(css("table", { tableHeaderBg: "#000", tableStripe: "#fafafa" }), ".X.X th{background: #000}.X.X tbody tr:nth-child(even) > td{background: #fafafa}");
  assert.equal(css("tabs", { tabsActiveColor: "#f00" }), ".X.X [role=tab][aria-selected=true]{color: #f00}");
  assert.equal(css("progressBar", { progressBarColor: "accent" }), ".X.X .ecx-progress-bar{background: var(--ecx-color-accent, accent)}");
  assert.equal(css("columns", { columnsDirection: { mobile: "column-reverse" } }), "@media (max-width:640px){.X.X{flex-direction: column-reverse}}");
});

test("giá trị sai bị bỏ; ô chỉ áp cho đúng loại khối; nội dung cũ (không có ô) không sinh CSS", () => {
  assert.equal(css("bulletList", { listMarker: "url(x)", listMarkerColor: "red;}" }), "");
  assert.equal(css("paragraph", { listMarker: "disc" }), "");
  assert.equal(controlsCss(CORE_CONTROLS, "group", { background: "#fff", padding: "large" }), null);
  assert.deepEqual(Object.keys(coreControlsFor("heading")), ["textShadow", "textIconColor", "textIconSize", "textIconGap", "textStrokeWidth", "textStrokeColor", "textBlend", "textColumns", "textColumnGap", "dropCap", "textMaxWidth"]);
  assert.ok(Object.keys(coreControlsFor("iconList")).includes("iconListIconColor"));
});

test("phần của khối (1.26): kiểu riêng theo bộ chọn của phần, rê chuột theo cả khối, công tắc ẩn", () => {
  const r = controlsCss(CORE_CONTROLS, "iconBox", { parts: {
    title: { style: { fontSize: { base: "28px" }, color: { text: "primary" } } },
    icon: { hover: { color: { text: "#ff0000" } } },
    text: { hidden: true },
    bogus: { style: { color: { text: "red" } } },
  } })!;
  assert.ok(r.cls.startsWith("ecx-c-"));
  assert.match(r.css, new RegExp(`\\.${r.cls}\\.${r.cls} \\.ecx-icon-box-title\\{[^}]*font-size:28px`));
  assert.match(r.css, new RegExp(`\\.${r.cls}\\.${r.cls}:hover \\.ecx-icon-box-icon\\{color:#ff0000`));
  assert.match(r.css, new RegExp(`\\.${r.cls}\\.${r.cls} \\.ecx-icon-box-text\\{display:none!important\\}`));
  assert.ok(!r.css.includes("bogus"));
});

test("phần: giá trị sai bị bỏ; nhóm chỉ hợp cả khối (chuyển động, bố cục) không vào phần; không có phần → class cũ giữ nguyên", () => {
  assert.equal(normalizeParts({ title: { style: { fontSize: "x;}body{" , motion: { in: "fade" } } }, "Bad-Name": { hidden: true } }), undefined);
  const old = controlsCss(CORE_CONTROLS, "iconBox", { iconBoxTitleColor: "primary" })!;
  const same = controlsCss(CORE_CONTROLS, "iconBox", { iconBoxTitleColor: "primary", parts: { nothing: { hidden: true } } })!;
  assert.equal(old.cls, same.cls);
  assert.equal(controlsCss(CORE_CONTROLS, "iconBox", { parts: { text: { hidden: true } } }) !== null, true);
  assert.deepEqual(partsFor(CORE_CONTROLS, "iconBox").map(([n]) => n), ["box", "icon", "title", "text", "more"]);
});

test("phần (1.26): rê chuột lên chính phần, trạng thái đang mở, bộ chọn nhiều nhánh", () => {
  const r = controlsCss(CORE_CONTROLS, "accordion", { parts: { title: { hover: { color: { text: "#111111" } }, active: { color: { background: "#eeeeee" } } } } })!;
  const c = r.cls;
  assert.ok(r.css.includes(`.${c}.${c} details > summary:hover,.${c}.${c}:is(details) > summary:hover{color:#111111`), r.css);
  assert.ok(r.css.includes(`.${c}.${c} details[open] > summary,.${c}.${c}:is([open]) > summary{background:#eeeeee`), r.css);
  const img = controlsCss(CORE_CONTROLS, "image", { parts: { image: { style: { radius: "12px" } } } })!;
  assert.ok(img.css.includes(`.${img.cls}.${img.cls} img,.${img.cls}.${img.cls}:is(img){border-radius:12px`), img.css);
});

test("khối Icon: màu, nền, viền, bo, đệm, bóng, xoay, hiệu ứng rê sinh CSS đúng bộ chọn; giá trị sai bị bỏ", () => {
  const out = css("icon", { iconColor: "#ff0000", iconHoverColor: "#00ff00", iconBg: "#111111", iconRadius: "12px", iconPad: "20px", iconRotate: "90", iconHoverEffect: "spin", iconBorderWidth: "2px", iconBorderColor: "#333333" })!;
  for (const need of ["color:#ff0000", "color:#00ff00", "background:#111111", "border-radius:12px", "--ecx-icon-pad:20px", "rotate:90deg", "var(--ecx-icon-fx-spin)", "border:2px solid", "border-color:#333333"]) assert.ok(out.replace(/ /g, "").includes(need.replace(/ /g, "")), need + "\n" + out);
  assert.equal(css("icon", { iconRotate: "99", iconHoverEffect: "bogus", iconColor: "red;}" }), "");
  assert.equal(css("paragraph", { iconColor: "#fff" }), "");
});

test("1.32 ô ở tab Cài đặt: danh sách chia cột / xếp ngang, nhóm nút, đường kẻ, trích dẫn, mạng xã hội — CSS thật, chỉ khai báo tab cho giao diện", () => {
  const css = (type: string, attrs: Record<string, unknown>) => controlsCss(CORE_CONTROLS, type, attrs)?.css ?? "";
  assert.match(css("bulletList", { listColumns: { base: "2", mobile: "1" }, listLayout: "flex" }), /columns: 2.*--ecx-list-display: flex.*@media \(max-width:640px\)\{[^}]*columns: 1/);
  assert.match(css("buttons", { buttonsDirection: { mobile: "column" }, buttonsFill: { mobile: "1" } }), /@media \(max-width:640px\)\{[^}]*flex-direction: column[^]*flex-grow: 1/);
  assert.match(css("socialLinks", { socialShape: "none" }), /--ecx-social-radius: var\(--ecx-radius-none, 0\)/);
  assert.match(css("paragraph", { dropCap: "3" }), /::first-letter\{initial-letter: 3\}/);
  assert.equal(css("paragraph", { dropCap: "9" }), ""); // ngoài danh sách → bỏ
  // tab chỉ là thông tin giao diện
  assert.equal(coreControlsFor("bulletList").listMarker.tab, "settings");
  assert.equal(coreControlsFor("bulletList").listGap.tab, undefined);
});

test("phần của nút: màu chữ / nền khi rê chuột thắng màu nội tuyến (!important)", () => {
  const out = css("button", { parts: { button: { hover: { color: { text: "#111111", background: "#eeeeee" } } } } });
  assert.match(out, /:hover\{[^}]*color:#111111!important/);
  assert.match(out, /:hover\{[^}]*background:#eeeeee!important/);
  // trạng thái thường không bị ép
  assert.doesNotMatch(css("button", { parts: { button: { style: { color: { text: "#111111" } } } } }), /!important/);
});

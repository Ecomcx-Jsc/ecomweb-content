import assert from "node:assert/strict";
import { test } from "node:test";
import { controlValue, controlsCss, defineBlockControls, type ControlSpec } from "../src/index.js";

const tilt = defineBlockControls({ id: "acme/tilt", blocks: "*", attributes: {
  acmeRotate: { type: "number", min: -45, max: 45, css: { "{{WRAPPER}}": "rotate: {{VALUE}}deg" } },
  acmeGlow: { type: "color", css: { "{{WRAPPER}} img": "filter: drop-shadow(0 4px 12px {{VALUE}})" } },
  acmeGap: { type: "length", css: { "{{WRAPPER}}": "gap: {{VALUE}}" } },
  acmeFit: { type: "enum", options: ["cover", "contain"], css: { "{{WRAPPER}} img": "object-fit: {{VALUE}}" } },
} });

test("ô điều khiển khai CSS: giá trị hợp lệ → class băm + CSS; cùng giá trị cùng class", () => {
  const r = controlsCss([tilt], "image", { acmeRotate: 12, acmeGlow: "#ff0000", acmeGap: "lg", acmeFit: "cover" })!;
  assert.match(r.cls, /^ecx-c-[0-9a-z]+$/);
  assert.equal(r.css, `.${r.cls}.${r.cls}{rotate: 12deg;gap: var(--ecx-spacing-lg)}.${r.cls}.${r.cls} img{filter: drop-shadow(0 4px 12px #ff0000);object-fit: cover}`);
  assert.equal(controlsCss([tilt], "group", { acmeRotate: 12, acmeGlow: "#ff0000", acmeGap: "lg", acmeFit: "cover" })!.cls, r.cls);
});

test("giá trị xấu bị bỏ, không chèn được CSS", () => {
  assert.equal(controlsCss([tilt], "image", {
    acmeRotate: 90, acmeGlow: "red;}body{display:none", acmeGap: "url(x)", acmeFit: "fill",
  }), null);
  assert.equal(controlsCss([tilt], "image", { acmeRotate: "1;}" }), null);
  const only = defineBlockControls({ id: "acme/only", blocks: ["button"], attributes: { acmeRotate: tilt.attributes.acmeRotate } });
  assert.equal(controlsCss([only], "image", { acmeRotate: 5 }), null);
});

test("khai báo nguy hiểm của plugin bị từ chối lúc đăng ký", () => {
  for (const css of [{ "{{WRAPPER}}": "background: url({{VALUE}})" } as Record<string, string>, { "{{WRAPPER}}": "color: {{VALUE}}; x: y" }, { "{{WRAPPER}} }": "color: {{VALUE}}" }, { "body": "color: {{VALUE}}" }])
    assert.throws(() => defineBlockControls({ id: "x/y", blocks: "*", attributes: { a: { type: "color", css } } }));
});

test("kiểu chỉ có ô (1.23): kiểm giá trị, không sinh CSS", () => {
  const s = (type: ControlSpec["type"], extra: Partial<ControlSpec> = {}) => ({ type, ...extra }) as ControlSpec;
  assert.equal(controlValue(s("boolean"), true), "true");
  assert.equal(controlValue(s("boolean"), false), undefined);
  assert.equal(controlValue(s("boolean"), "yes"), undefined);
  assert.equal(controlValue(s("string"), "Xin chào"), "Xin chào");
  assert.equal(controlValue(s("string"), "a\nb"), undefined);
  assert.equal(controlValue(s("string", { maxLength: 3 }), "abcd"), undefined);
  assert.equal(controlValue(s("textarea"), "a\nb\tc"), "a\nb\tc");
  assert.equal(controlValue(s("textarea"), "a\u0000"), undefined);
  assert.equal(controlValue(s("url"), "https://x.vn/a?b=1"), "https://x.vn/a?b=1");
  assert.equal(controlValue(s("url"), "/uploads/a.mp4"), "/uploads/a.mp4");
  for (const bad of ["javascript:alert(1)", "java\tscript:x", "https://x.vn/\"><script>", "a b", 5])
    assert.equal(controlValue(s("url"), bad), undefined, String(bad));
  assert.equal(controlValue(s("datetime"), "2026-11-20T09:00"), "2026-11-20T09:00");
  assert.equal(controlValue(s("datetime"), "2026-11-20T09:00:00+07:00"), "2026-11-20T09:00:00+07:00");
  for (const bad of ["2026-11-20", "hôm nay", "2026-13-40T99:00"]) assert.equal(controlValue(s("datetime"), bad), undefined, bad);
  // css trên kiểu không sinh CSS → lỗi lập trình
  assert.throws(() => defineBlockControls({ id: "x/y", blocks: "*", attributes: { a: { type: "string", css: { "{{WRAPPER}}": "content: {{VALUE}}" } } } }));
  assert.equal(controlsCss([{ id: "x/y", blocks: "*", attributes: { a: { type: "url", css: { "{{WRAPPER}}": "color: {{VALUE}}" } } } }], "image", { a: "/x" }), null);
});

test("enum có nhãn + biến CSS tuỳ biến (1.23)", () => {
  const c = defineBlockControls({ id: "acme/v", blocks: "*", attributes: {
    acmeSpeed: { type: "enum", options: [{ value: "slow", label: "%speed.slow%" }, "fast"], css: { "{{WRAPPER}}": "--acme-speed: {{VALUE}}" } },
    acmeSize: { type: "number", min: 0, max: 10, css: { "{{WRAPPER}} > .x": "--acme-size: {{VALUE}}px" } },
  } });
  const r = controlsCss([c], "group", { acmeSpeed: "slow", acmeSize: 4 })!;
  assert.equal(r.css, `.${r.cls}.${r.cls}{--acme-speed: slow}.${r.cls}.${r.cls} > .x{--acme-size: 4px}`);
  assert.equal(controlsCss([c], "group", { acmeSpeed: "medium" }), null);
  for (const decl of ["--: {{VALUE}}", "--x: {{VALUE}}; color: red", "--X: {{VALUE}}", "---x: {{VALUE}}"])
    assert.throws(() => defineBlockControls({ id: "x/y", blocks: "*", attributes: { a: { type: "number", css: { "{{WRAPPER}}": decl } } } }), decl);
});

test("1.24: giá trị theo khổ → media query; pseudo gắn liền; class của giá trị base không đổi", () => {
  const c = defineBlockControls({ id: "acme/r", blocks: "*", attributes: {
    acmeGap: { type: "length", responsive: true, css: { "{{WRAPPER}}": "gap: {{VALUE}}" } },
    acmeHover: { type: "color", css: { "{{WRAPPER}}:hover img": "color: {{VALUE}}" } },
  } });
  const r = controlsCss([c], "group", { acmeGap: { base: "24px", mobile: "8px", tablet: "bad;" }, acmeHover: "#fff" })!;
  assert.equal(r.css, `.${r.cls}.${r.cls}{gap: 24px}.${r.cls}.${r.cls}:hover img{color: #fff}@media (max-width:640px){.${r.cls}.${r.cls}{gap: 8px}}`);
  // Giá trị trần = base, cùng class với dạng { base }
  assert.equal(controlsCss([c], "group", { acmeGap: "24px" })!.cls, controlsCss([c], "group", { acmeGap: { base: "24px" } })!.cls);
  // Ô không responsive nhận object → bỏ
  assert.equal(controlsCss([c], "group", { acmeHover: { base: "#fff" } }), null);
  for (const sel of ["{{WRAPPER}}:hover{x", "{{WRAPPER}}x", "{{WRAPPER}}:url(x)"])
    assert.throws(() => defineBlockControls({ id: "x/y", blocks: "*", attributes: { a: { type: "color", css: { [sel]: "color: {{VALUE}}" } } } }), sel);
});

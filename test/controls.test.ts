import assert from "node:assert/strict";
import { test } from "node:test";
import { controlsCss, defineBlockControls } from "../src/index.js";

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

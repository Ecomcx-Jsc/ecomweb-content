import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../../style.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Bỏ mọi :where(...) (kể cả lồng) → phần còn lại chỉ được là dấu nối/khoảng trắng. */
function outsideWhere(sel: string) {
  let out = "", i = 0;
  while (i < sel.length) {
    if (sel.startsWith(":where(", i)) {
      let depth = 0, j = i + 6;
      for (; j < sel.length; j++) { if (sel[j] === "(") depth++; else if (sel[j] === ")" && --depth === 0) break; }
      i = j + 1;
    } else out += sel[i++];
  }
  return out;
}

test("style.css: mọi selector có độ ưu tiên 0 (theme luôn ghi đè được)", () => {
  const selectors = [...css.matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim()).filter((s) => s && !s.startsWith("@") && !/^(from|to|\d+%)$/.test(s)); // bước của @keyframes không phải selector
  assert.ok(selectors.length > 20);
  for (const s of selectors) assert.match(outsideWhere(s), /^[\s>+~]*(::(before|after))?$/, `selector có độ ưu tiên: ${s}`);
});

test("style.css: nằm trọn trong @layer ecx-content", () => {
  assert.match(css.trim(), /^@layer ecx-content \{[\s\S]*\}$/);
});

test("style.css: bảng có viền và ô trống không co về 0", () => {
  assert.match(css, /:where\(th, td\) \{[^}]*border: 1px solid/);
  assert.match(css, /:where\(th, td\) \{[^}]*height:/);
});

// Token v1 (docs/tokens.md): màu cố định chỉ nằm trong khối :root mặc định; mọi var() đều có định nghĩa hoặc giá trị dự phòng; tên cũ vẫn được đọc.
const rootBlock = css.match(/:where\(:root\) \{([\s\S]*?)\n {2}\}/)?.[1] ?? "";
const rules = css.replace(rootBlock, "");

test("token: không còn màu hex cố định ngoài khối :root mặc định", () => {
  assert.ok(rootBlock.includes("--ecx-color-primary"));
  assert.deepEqual(rules.match(/#[0-9a-f]{3,8}\b/gi) ?? [], []);
});

test("token: mọi var() đều có định nghĩa trong style.css hoặc giá trị dự phòng", () => {
  const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const missing: string[] = [];
  for (let i = css.indexOf("var(--"); i >= 0; i = css.indexOf("var(--", i + 1)) {
    let depth = 0, j = i + 3, comma = false;
    for (; j < css.length; j++) { const c = css[j]; if (c === "(") depth++; else if (c === ")" && --depth === 0) break; else if (c === "," && depth === 1) comma = true; }
    const name = /^var\((--[\w-]+)/.exec(css.slice(i))![1];
    if (!comma && !defined.has(name)) missing.push(name);
  }
  assert.deepEqual([...new Set(missing)], []);
});

test("token: tên biến cũ của theme vẫn được đọc", () => {
  for (const legacy of ["--primary", "--ecx-accent", "--ecx-muted", "--ecx-surface", "--ecx-border", "--ecx-code-bg", "--ecx-code-fg", "--ecx-button-bg", "--ecx-button-fg", "--ecx-input-bg"])
    assert.ok(css.includes(`var(${legacy},`), `thiếu alias ${legacy}`);
});

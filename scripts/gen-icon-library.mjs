// Sinh src/icon-library.ts từ bộ icon Lucide (giấy phép ISC): mỗi icon gộp mọi hình (path / circle / rect / line / polyline…) thành MỘT chuỗi `d`
// (24×24, vẽ nét) để dùng chung với ICON_PATHS. Chạy:  node scripts/gen-icon-library.mjs <thư mục lucide-react>   (vd ../TextEditor/node_modules/lucide-react)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.argv[2];
if (!root) { console.error("Thiếu đường dẫn lucide-react"); process.exit(1); }
const dir = path.join(root, "dist/esm/icons");
const num = (v) => Number(v);
const r2 = (n) => Math.round(n * 100) / 100;
const shape = (tag, a) => {
  switch (tag) {
    case "path": return a.d;
    case "circle": { const cx = num(a.cx), cy = num(a.cy), r = num(a.r); return `M${r2(cx - r)} ${r2(cy)}a${r2(r)} ${r2(r)} 0 1 0 ${r2(2 * r)} 0a${r2(r)} ${r2(r)} 0 1 0 ${r2(-2 * r)} 0`; }
    case "ellipse": { const cx = num(a.cx), cy = num(a.cy), rx = num(a.rx), ry = num(a.ry); return `M${r2(cx - rx)} ${r2(cy)}a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(2 * rx)} 0a${r2(rx)} ${r2(ry)} 0 1 0 ${r2(-2 * rx)} 0`; }
    case "line": return `M${a.x1} ${a.y1}L${a.x2} ${a.y2}`;
    case "polyline": case "polygon": { const p = String(a.points).trim().split(/[\s,]+/).map(Number); let d = `M${p[0]} ${p[1]}`; for (let i = 2; i < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`; return d + (tag === "polygon" ? "Z" : ""); }
    case "rect": { const x = num(a.x ?? 0), y = num(a.y ?? 0), w = num(a.width), h = num(a.height), rx = Math.min(num(a.rx ?? a.ry ?? 0), w / 2, h / 2); return rx ? `M${r2(x + rx)} ${y}h${r2(w - 2 * rx)}a${rx} ${rx} 0 0 1 ${rx} ${rx}v${r2(h - 2 * rx)}a${rx} ${rx} 0 0 1 ${-rx} ${rx}h${r2(-(w - 2 * rx))}a${rx} ${rx} 0 0 1 ${-rx} ${-rx}v${r2(-(h - 2 * rx))}a${rx} ${rx} 0 0 1 ${rx} ${-rx}Z` : `M${x} ${y}h${w}v${h}h${-w}Z`; }
    default: return "";
  }
};
const out = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith(".mjs"))) {
  const src = readFileSync(path.join(dir, f), "utf8");
  const m = /const __iconData = (\{[\s\S]*?\n\});/.exec(src);
  if (!m) continue; // bí danh (re-export)
  let data; try { data = (0, eval)("(" + m[1] + ")"); } catch { continue; }
  // path bắt đầu bằng `m` (tương đối) nối sau path khác sẽ lệch → đặt lại điểm hiện tại về gốc trước mỗi đoạn
  const d = data.node.map(([tag, a]) => shape(tag, a)).filter(Boolean).map((x) => (/^m/.test(x) ? "M0 0" + x : x)).join("");
  if (d) out[data.name] = d;
}
const names = Object.keys(out).sort();
const body = names.map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(out[n])},`).join("\n");
writeFileSync(new URL("../src/icon-library.ts", import.meta.url), `// SINH TỰ ĐỘNG bởi scripts/gen-icon-library.mjs từ Lucide (ISC License, © Lucide Contributors) — đừng sửa tay.\n// Mỗi icon là một chuỗi \`d\` duy nhất (24×24, vẽ nét). Nạp bằng registerIconLibrary() (website: máy chủ; trình soạn: lúc khởi động).\nexport const ICON_LIBRARY: Record<string, string> = {\n${body}\n};\n`);
console.log(names.length, "icon");

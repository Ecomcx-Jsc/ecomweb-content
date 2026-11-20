/** Cắt tóm tắt theo số ký tự (0 / không đặt = giữ nguyên): cắt ở ranh giới từ, thêm "…". Dùng chung cho website và trình soạn. */
export function clipExcerpt(text: string, length: unknown): string {
  const n = typeof length === "number" && Number.isFinite(length) ? Math.floor(length) : 0;
  if (n <= 0 || text.length <= n) return text;
  const cut = text.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:!?-]+$/, "") + "…";
}

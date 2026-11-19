/**
 * Chữ gõ của Tiêu đề (heading.typedWords): một nhóm từ được "gõ" lần lượt ở cuối tiêu đề — ví dụ "Chúng tôi làm [website | ứng dụng | thương hiệu]".
 * HTML dựng sẵn có từ đầu tiên (đọc được khi không có JS, máy tìm kiếm thấy); trình duyệt gõ / xoá lần lượt các từ, dừng khi người xem bật giảm chuyển động.
 */
export interface TypedConfig { words: string[]; speed: number; pause: number; loop: boolean }
export const TYPED_MAX_WORDS = 8, TYPED_MAX_LEN = 40;

export function typedConfig(a: Record<string, unknown>): TypedConfig | null {
  const raw = Array.isArray(a.typedWords) ? a.typedWords : typeof a.typedWords === "string" ? a.typedWords.split("|") : [];
  const words = raw.filter((w): w is string => typeof w === "string").map((w) => w.replace(/\s+/g, " ").trim().slice(0, TYPED_MAX_LEN)).filter(Boolean).slice(0, TYPED_MAX_WORDS);
  if (!words.length) return null;
  const int = (v: unknown, min: number, max: number, d: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
  return { words, speed: int(a.typedSpeed, 30, 200, 80), pause: int(a.typedPause, 600, 6000, 1800), loop: a.typedLoop !== false };
}

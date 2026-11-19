export const TYPED_MAX_WORDS = 8, TYPED_MAX_LEN = 40;
export function typedConfig(a) {
    const raw = Array.isArray(a.typedWords) ? a.typedWords : typeof a.typedWords === "string" ? a.typedWords.split("|") : [];
    const words = raw.filter((w) => typeof w === "string").map((w) => w.replace(/\s+/g, " ").trim().slice(0, TYPED_MAX_LEN)).filter(Boolean).slice(0, TYPED_MAX_WORDS);
    if (!words.length)
        return null;
    const int = (v, min, max, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
    return { words, speed: int(a.typedSpeed, 30, 200, 80), pause: int(a.typedPause, 600, 6000, 1800), loop: a.typedLoop !== false };
}

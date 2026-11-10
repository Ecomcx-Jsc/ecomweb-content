/**
 * Kiểu dáng của khối (`attrs.style`, mọi khối): khoảng cách, cỡ chữ, màu, viền, ẩn theo khổ màn hình.
 * Giá trị theo khổ: `{ base, tablet, mobile }` (tablet ≤ 1024px, mobile ≤ 640px). Giá trị là preset của theme
 * (`lg`, `primary` → biến CSS `--ecx-spacing-lg`, `--ecx-color-primary`) hoặc giá trị CSS đã kiểm (độ dài, màu).
 * Chỉ nhận giá trị trong danh sách → không chèn được CSS tuỳ ý. Máy chủ chạy cùng quy tắc (ContentFormat.cs).
 */
export declare const BREAKPOINTS: {
    readonly tablet: 1024;
    readonly mobile: 640;
};
export declare const DEVICES: readonly ["base", "tablet", "mobile"];
export type Device = (typeof DEVICES)[number];
export type Responsive<T> = Partial<Record<Device, T>>;
export type Box = string | Partial<Record<"top" | "right" | "bottom" | "left", string>>;
export interface BlockStyle {
    padding?: Responsive<Box>;
    margin?: Responsive<Box>;
    gap?: Responsive<string>;
    width?: Responsive<string>;
    maxWidth?: Responsive<string>;
    minHeight?: Responsive<string>;
    fontFamily?: string;
    fontSize?: Responsive<string>;
    lineHeight?: Responsive<number>;
    letterSpacing?: Responsive<string>;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textTransform?: string;
    textAlign?: Responsive<string>;
    color?: {
        text?: string;
        background?: string;
    };
    border?: {
        width?: string;
        style?: string;
        color?: string;
    };
    radius?: string;
    hide?: Array<"desktop" | "tablet" | "mobile">;
    /** Bố cục khối chứa (1.15): xếp ngang/dọc (flex) hoặc lưới — khối con xếp theo đây. */
    layout?: BlockLayout;
    /** Nền chuyển màu (1.15): preset của theme (`brand` → --ecx-gradient-brand) hoặc linear/radial-gradient đã kiểm. */
    gradient?: string;
    /** Đổ bóng (1.15): preset (`sm` `md` `lg` `xl` có sẵn, theme thêm) hoặc `none`. */
    shadow?: string;
    /** Tỉ lệ khung (1.15). */
    aspectRatio?: string;
    /** Ghim khi cuộn (1.15): `{ type: "sticky", top }`. */
    position?: {
        type: "sticky";
        top?: string;
    };
    /** Khi rê chuột (1.15): màu chữ / nền / viền, bóng, nhấc lên. */
    hover?: {
        color?: {
            text?: string;
            background?: string;
        };
        border?: {
            color?: string;
        };
        shadow?: string;
        lift?: boolean;
    };
    /** Chuyển động (1.16): hiệu ứng khi cuộn tới (`in`) và khi rê chuột (`hover`). */
    motion?: BlockMotion;
}
/**
 * Chuyển động của khối (1.16). `in` là mã hiệu ứng: hiệu ứng lõi (`MOTION_IN`) hoặc của plugin (CSS `@keyframes ecx-in-<mã>`);
 * mã lạ vẫn được giữ — khối hiện bình thường nếu website không có keyframes đó. `stagger`: hiệu ứng áp cho từng khối con, lần lượt.
 */
export interface BlockMotion {
    in?: string;
    duration?: "fast" | "normal" | "slow";
    /** Độ trễ (ms), 0–3000. */
    delay?: number;
    /** Chạy lại mỗi lần cuộn tới (mặc định: một lần). */
    repeat?: true;
    stagger?: true;
    hover?: "lift" | "grow" | "brighten" | "glow";
}
/** Bố cục của khối chứa. Không có `type` = luồng thường (khối con xếp dọc như văn bản). */
export interface BlockLayout {
    type: "flex" | "grid";
    /** flex: hàng ngang (row) hoặc xếp dọc (column). */
    direction?: Responsive<"row" | "column">;
    justify?: Responsive<"start" | "center" | "end" | "between">;
    align?: Responsive<"start" | "center" | "end" | "stretch">;
    /** flex: cho xuống dòng khi hết chỗ (mặc định có). */
    wrap?: boolean;
    /** grid: số cột (1–12) theo khổ. */
    columns?: Responsive<number>;
    /** grid: không đặt số cột → tự chia cột, mỗi cột tối thiểu bằng này. */
    minColumnWidth?: string;
}
/** Hiệu ứng khi cuộn tới có sẵn ở lõi (keyframes `ecx-in-<mã>` trong style.css). Plugin thêm mã khác. */
export declare const MOTION_IN: readonly ["fade", "slide-up", "slide-down", "slide-left", "slide-right", "zoom-in", "zoom-out", "blur-in"];
/** Hiệu ứng khi rê chuột có sẵn ở lõi. */
export declare const MOTION_HOVER: readonly ["lift", "grow", "brighten", "glow"];
/** Gradient: preset hoặc linear/radial-gradient(hướng?, 2–6 điểm màu hex/rgb/hsl kèm %) — dạng chuẩn hoá khoảng trắng. */
export declare function normalizeGradient(v: unknown): string | undefined;
/** Chuẩn hoá `attrs.style`: giữ đúng thứ tự khoá, bỏ giá trị không hợp lệ. Rỗng → undefined. */
export declare function normalizeStyle(v: unknown): BlockStyle | undefined;
/** Độ dài / preset khoảng cách hợp lệ → giá trị CSS (preset thành biến); không hợp lệ → undefined. Dùng cho thuộc tính khối như chiều cao khoảng trống. */
export declare function spacingValue(v: unknown): string | undefined;
/** Màu hợp lệ (hex/rgb/hsl hoặc preset) → giá trị CSS; không hợp lệ → undefined. */
export declare function colorCss(v: unknown): string | undefined;
/**
 * CSS chuyển động của một khối (chỉ cho class riêng của khối — Global Styles không dùng, vì trạng thái ẩn cần class `ecx-in` + `is-in`).
 * Hiệu ứng cuộn: trạng thái ẩn chỉ áp khi `html.ecx-js` (script observer đã chạy) VÀ phần tử có class `ecx-in` → không có JS
 * hoặc renderer cũ không gắn class thì nội dung vẫn hiện;
 * `is-in` do script đặt khi khối vào màn hình. `animation-fill-mode: backwards` để sau khi chạy xong khối trả về trạng thái tự nhiên.
 */
export declare function motionCss(style: BlockStyle, cls: string): string;
/** Class thêm vào phần tử của khối để script observer tìm thấy (`ecx-in`, `ecx-in-repeat`); không có hiệu ứng cuộn → "". */
export declare function motionClasses(style: BlockStyle | null | undefined): string;
/** Tên class ổn định theo nội dung style (cùng kiểu dáng → cùng class). */
export declare function styleClass(style: BlockStyle): string;
/** CSS của một kiểu dáng: `.cls.cls{…}` + media query cho tablet / mobile + ẩn theo khổ + :hover. Rỗng → "". */
export declare function styleCss(style: BlockStyle, cls?: string): string;
/**
 * CSS của một kiểu dáng cho bộ chọn bất kỳ (danh sách cách nhau dấu phẩy) — dùng cho kiểu của từng khối và Global Styles
 * (kiểu mặc định theo loại khối / phần tử). Bộ chọn do mã gọi đưa vào, không lấy từ dữ liệu người dùng.
 */
export declare function ruleCss(selector: string, style: BlockStyle): string;
/** Gom CSS cho cả một cây nội dung: trả về css (mỗi class một lần) — website và trình soạn dùng chung. */
export declare function collectStyles(styles: Iterable<BlockStyle>): string;
/** Biến thể kiểu (`blockStyle`): tên preset → class `ecx-is-<tên>`. */
export declare function normalizeBlockStyleName(v: unknown): string | undefined;
/** Neo (`anchor`) → id của phần tử. */
export declare function normalizeAnchor(v: unknown): string | undefined;
/** Class CSS riêng (`className`): tối đa 5 class hợp lệ, cách nhau bởi dấu cách. */
export declare function normalizeClassName(v: unknown): string | undefined;
/** Biến thể có sẵn của lõi (CSS trong style.css); theme thêm bằng theme.json › blockStyles. */
export declare const CORE_BLOCK_STYLES: Record<string, string[]>;
export interface StylePresets {
    colors?: Record<string, string>;
    fontSizes?: Record<string, string>;
    spacing?: Record<string, string>;
    fonts?: Record<string, string>;
    /** 1.15: nền chuyển màu (linear/radial-gradient đã kiểm) → --ecx-gradient-*. */
    gradients?: Record<string, string>;
    /** 1.15: đổ bóng (tối đa 3 lớp "x y blur spread? màu") → --ecx-shadow-*. */
    shadows?: Record<string, string>;
    /** 1.15 Global Styles: kiểu mặc định theo loại khối (paragraph, heading, button, group…). */
    blocks?: Record<string, BlockStyle>;
    /** 1.15 Global Styles: kiểu mặc định theo phần tử (link, button, heading, h1–h6, caption). */
    elements?: Record<string, BlockStyle>;
    /** 1.20: bề rộng cột chữ và khối "rộng" → --ecx-content-width / --ecx-wide-width (khối align wide/full dùng). */
    layout?: {
        contentWidth?: string;
        wideWidth?: string;
    };
}
/** Bộ chọn của khối lõi trên website (markup của renderer) — Global Styles theo loại khối. */
export declare const BLOCK_SELECTORS: Record<string, string>;
/** Bộ chọn của phần tử — Global Styles theo phần tử. */
export declare const ELEMENT_SELECTORS: Record<string, string>;
/** Chuẩn hoá preset: tên preset hợp lệ, giá trị đã kiểm (màu hex/rgb/hsl, độ dài hoặc clamp(), danh sách phông không có ; { }). */
export declare function normalizePresets(v: unknown): StylePresets;
/** Gộp preset theo thứ tự (sau đè trước): theme → bản sửa của quản trị viên. */
export declare function mergePresets(...list: unknown[]): StylePresets;
/** Biến CSS của preset: `--ecx-color-*`, `--ecx-font-size-*`, `--ecx-spacing-*`, `--ecx-font-family-*`. */
export declare function presetCss(presets: unknown, selector?: string): string;

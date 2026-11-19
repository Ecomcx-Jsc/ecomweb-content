/** Khối Lottie (1.29): cấu hình dùng chung cho website và trình soạn. Thuộc tính đã qua normalizeAttrs; hàm này chỉ chốt mặc định và loại tệp. */
export interface LottieConfig {
    src: string;
    poster: string;
    label: string;
    loop: boolean;
    autoplay: boolean;
    speed: number;
    trigger: "auto" | "hover" | "click" | "scroll";
    height?: number;
    maxWidth?: number;
    align: "left" | "center" | "right";
    /** ".lottie" (dotLottie) hoặc ".json" (Lottie JSON); không nhận ra → "" (website chỉ hiện poster). */
    kind: "dotlottie" | "json" | "";
}
export declare function lottieKind(src: string): LottieConfig["kind"];
export declare function lottieConfig(a: Record<string, unknown>): LottieConfig;

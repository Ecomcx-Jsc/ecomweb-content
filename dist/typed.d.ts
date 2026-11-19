/**
 * Chữ gõ của Tiêu đề (heading.typedWords): một nhóm từ được "gõ" lần lượt ở cuối tiêu đề — ví dụ "Chúng tôi làm [website | ứng dụng | thương hiệu]".
 * HTML dựng sẵn có từ đầu tiên (đọc được khi không có JS, máy tìm kiếm thấy); trình duyệt gõ / xoá lần lượt các từ, dừng khi người xem bật giảm chuyển động.
 */
export interface TypedConfig {
    words: string[];
    speed: number;
    pause: number;
    loop: boolean;
}
export declare const TYPED_MAX_WORDS = 8, TYPED_MAX_LEN = 40;
export declare function typedConfig(a: Record<string, unknown>): TypedConfig | null;

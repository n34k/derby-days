declare module "canvas-confetti" {
    export interface Options {
        particleCount?: number;
        spread?: number;
        origin?: { x?: number; y?: number };
        angle?: number;
        [key: string]: any;
    }

    export default function confetti(options?: Options): void;
}

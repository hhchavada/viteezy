declare module "aos" {
  export interface AOSOptions {
    duration?: number;
    easing?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: string;
    offset?: number;
    delay?: number | string;
  }

  export interface AOS {
    init(options?: AOSOptions): void;
    refresh(): void;
    refreshHard(): void;
  }

  const AOS: AOS;
  export default AOS;
}


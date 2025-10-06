declare module 'cookie' {
  export function serialize(name: string, val: string, options?: Record<string, unknown>): string;
  export function parse(str: string, options?: Record<string, unknown>): { [key: string]: string };
} 
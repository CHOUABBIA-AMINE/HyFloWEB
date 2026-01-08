/**
 * Type declarations for stylis package
 * Provides type safety for stylis RTL support
 * 
 * @author CHOUABBIA Amine
 * @created 01-08-2026
 */

declare module 'stylis' {
  export interface Prefixer {
    (element: any, index: number, children: any[], callback: (element: any) => any): any;
  }

  export const prefixer: Prefixer;

  export interface Middleware {
    (element: any, index: number, children: any[], callback: (element: any) => any): any;
  }

  export function middleware(collection: Middleware[]): Middleware;
  export function compile(value: string): any[];
  export function serialize(children: any[], callback: (element: any) => any): string;
  export function stringify(element: any, index: number, children: any[], callback?: (element: any) => any): string;
}

declare module 'stylis-plugin-rtl' {
  import { Middleware } from 'stylis';
  const rtlPlugin: Middleware;
  export default rtlPlugin;
}

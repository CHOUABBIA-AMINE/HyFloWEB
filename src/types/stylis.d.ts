/**
 * Type declarations for stylis package
 * Provides type safety for stylis RTL support with Emotion
 * 
 * @author CHOUABBIA Amine
 * @created 01-08-2026
 * @updated 01-08-2026 - Define StylisElement independently to avoid import issues
 */

declare module 'stylis' {
  /**
   * Stylis element type matching @emotion/cache expectations
   */
  export interface StylisElement {
    type: string;
    value: string;
    props: string | string[];
    children: string | StylisElement[];
    line?: number;
    column?: number;
    [key: string]: any;
  }

  /**
   * Stylis plugin callback function
   * Matches the signature expected by @emotion/cache
   */
  export type StylisPluginCallback = (
    element: StylisElement,
    index: number,
    children: StylisElement[],
    callback: StylisPluginCallback
  ) => string | void;

  /**
   * Stylis plugin function signature
   * Compatible with @emotion/cache StylisPlugin
   */
  export interface StylisPlugin {
    (
      element: StylisElement,
      index: number,
      children: StylisElement[],
      callback: StylisPluginCallback
    ): string | void;
  }

  /**
   * Prefixer plugin - adds vendor prefixes to CSS properties
   */
  export const prefixer: StylisPlugin;

  /**
   * Middleware function type (alias for StylisPlugin)
   */
  export interface Middleware extends StylisPlugin {}

  export function middleware(collection: Middleware[]): Middleware;
  export function compile(value: string): StylisElement[];
  export function serialize(children: StylisElement[], callback: StylisPluginCallback): string;
  export function stringify(element: StylisElement, index: number, children: StylisElement[], callback?: StylisPluginCallback): string;
}

declare module 'stylis-plugin-rtl' {
  import { StylisPlugin } from 'stylis';
  
  /**
   * RTL (Right-to-Left) plugin for Stylis
   * Converts LTR CSS properties to RTL equivalents
   */
  const rtlPlugin: StylisPlugin;
  export default rtlPlugin;
}

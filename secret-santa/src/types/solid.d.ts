// Declaration file to properly handle Solid.js JSX in TypeScript

import type { JSX as SolidJSX } from 'solid-js';

declare global {
  namespace JSX {
    interface Element extends SolidJSX.Element {}
    interface IntrinsicElements extends SolidJSX.IntrinsicElements {}
    interface ElementChildrenAttribute { children: {} }
  }
}

export {};
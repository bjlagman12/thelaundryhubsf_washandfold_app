/* eslint-disable @typescript-eslint/ban-ts-comment */
import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder (Node 16+)
import { TextEncoder, TextDecoder } from "util";
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  // @ts-expect-error
  global.TextDecoder = TextDecoder;
}

/**
 * Development logging utility
 */

const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]): void => {
    if (isDev) console.info("[GenSlides]", ...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn("[GenSlides]", ...args);
  },
  error: (...args: unknown[]): void => {
    // Always log errors
    console.error("[GenSlides]", ...args);
  },
  debug: (...args: unknown[]): void => {
    if (isDev) console.debug("[GenSlides]", ...args);
  },
};

import type express from "express";

/**
 * Wraps an async route handler so that it can be used as an express route handler.
 * The only thing we're doing here is catching errors and passing them to the
 * Express next() function.
 */
export function wrapAsyncRoute(
  fn: (...args: Parameters<express.RequestHandler>) => Promise<void>
): express.RequestHandler {
  return (...args) => fn(...args).catch(args[2]);
}

export async function wrappedDbRoute(fn: (...args: Parameters<express.RequestHandler>) => Promise<void>
): Promise<express.RequestHandler> {
  return (...args) => fn(...args).catch(args[2]);
}

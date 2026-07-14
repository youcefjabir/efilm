/**
 * Server startup hook (Next.js instrumentation).
 *
 * Last-resort guard: a broken client connection can surface as an async
 * stream error outside any request handler (uncaughtException). The Node
 * default is to kill the process, taking every in-flight render job's API
 * with it. Known connection-teardown errors are logged and survived; anything
 * else keeps the default fatal behavior.
 */
const SURVIVABLE = new Set([
  "ERR_INVALID_STATE",
  "ECONNRESET",
  "EPIPE",
  "ERR_STREAM_PREMATURE_CLOSE",
]);

export function register() {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") return;

  process.on("uncaughtException", (err: NodeJS.ErrnoException) => {
    if (err?.code && SURVIVABLE.has(err.code)) {
      console.warn(`[guard] survived connection error: ${err.code} ${err.message}`);
      return;
    }
    console.error("[guard] fatal uncaughtException:", err);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    const code = (reason as NodeJS.ErrnoException | null)?.code;
    if (code && SURVIVABLE.has(code)) {
      console.warn(`[guard] survived connection error (rejection): ${code}`);
      return;
    }
    console.error("[guard] unhandledRejection:", reason);
  });
}

/**
 * Child process for the "log stream breaks" test: wires the logger and the error
 * handlers like main.ts, prints one line, then keeps logging after the parent has
 * closed the read end of our stdout. Reports on stderr how many uncaught exceptions
 * that caused (EPIPE feeding back through the uncaughtException handler's own log
 * line is the bug this guards against), then exits.
 */
import { createLogger } from "../../src/log";

const logger = createLogger({ level: "debug" });
let uncaught = 0;
process.on("uncaughtException", (e) => {
  uncaught++;
  logger.error("uncaught exception", { error: e.name });
});

logger.info("ready");
process.stdin.once("data", () => {
  // The parent has destroyed its end of our stdout by now.
  const tick = setInterval(() => logger.info("still logging", { count: 1 }), 5);
  setTimeout(() => {
    clearInterval(tick);
    process.stderr.write(`done uncaught=${uncaught}\n`);
    process.exit(0);
  }, 300);
});

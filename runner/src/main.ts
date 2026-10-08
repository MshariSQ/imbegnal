/**
 * Runner entry point: `node dist/runner/src/main.js`. Configuration comes from the environment
 * (see config.ts); the process refuses to start without a strong RUNNER_SECRET.
 */
import { ConfigError, loadConfig } from "./config";
import { createLogger } from "./log";
import { RunnerService } from "./server";

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    process.stderr.write(`runner: ${e instanceof ConfigError ? e.message : "invalid configuration"}\n`);
    process.exit(1);
  }
  const logger = createLogger({ level: config.logLevel });
  const service = new RunnerService({ config, logger });

  let stopping = false;
  const stop = (signal: string) => {
    if (stopping) return;
    stopping = true;
    logger.info("shutting down", { reason: signal });
    // Backstop: whatever close() waits on, the process is gone shortly after the grace period.
    setTimeout(() => process.exit(0), config.shutdownGraceMs + 15_000).unref();
    service
      .close()
      .catch((e: unknown) => logger.error("shutdown failed", { error: e instanceof Error ? e.name : "error" }))
      .finally(() => process.exit(0));
  };
  process.on("SIGTERM", () => stop("SIGTERM"));
  process.on("SIGINT", () => stop("SIGINT"));
  process.on("unhandledRejection", (e) => logger.error("unhandled rejection", { error: e instanceof Error ? e.name : "error" }));
  process.on("uncaughtException", (e) => {
    logger.error("uncaught exception", { error: e.name });
    stop("uncaughtException");
  });

  await service.start();
}

main().catch((e: unknown) => {
  process.stderr.write(`runner: failed to start (${e instanceof Error ? e.name : "error"})\n`);
  process.exit(1);
});

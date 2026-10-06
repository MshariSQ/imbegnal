/**
 * Structured JSON logging.
 *
 * The logger only accepts a closed set of scalar fields (ids, language, status,
 * durations, byte counts, error classes). Free-form strings from clients (code,
 * stdin, program output) have no way in: every field is checked against an allow
 * list and string values are length-capped and stripped of control characters.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/** Fields that may appear in a log record. Anything else is dropped. */
const ALLOWED_FIELDS = new Set([
  "jobId",
  "lang",
  "status",
  "exitCode",
  "signal",
  "compileMs",
  "runMs",
  "queueMs",
  "totalMs",
  "stdoutBytes",
  "stderrBytes",
  "codeBytes",
  "stdinBytes",
  "httpStatus",
  "method",
  "path",
  "code",
  "reason",
  "error",
  "running",
  "queued",
  "available",
  "unavailable",
  "version",
  "image",
  "host",
  "port",
  "concurrency",
  "queueMax",
  "runtime",
  "removed",
  "containers",
  "count",
  "ageMs",
  "signalName",
  "driver",
  "pid",
  "node",
  "instance",
]);

export type LogFields = Record<string, string | number | boolean | null | undefined>;

export interface LogRecord extends Record<string, unknown> {
  ts: string;
  level: LogLevel;
  msg: string;
}

export interface Logger {
  debug(msg: string, fields?: LogFields): void;
  info(msg: string, fields?: LogFields): void;
  warn(msg: string, fields?: LogFields): void;
  error(msg: string, fields?: LogFields): void;
}

/** Remove control characters (log injection) and cap length. */
export function sanitizeLogString(v: string, max = 200): string {
  // eslint-disable-next-line no-control-regex
  const clean = v.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, " ");
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

export function buildRecord(level: LogLevel, msg: string, fields?: LogFields, now: Date = new Date()): LogRecord {
  const rec: LogRecord = { ts: now.toISOString(), level, msg: sanitizeLogString(msg, 120) };
  if (fields) {
    for (const [k, v] of Object.entries(fields)) {
      if (!ALLOWED_FIELDS.has(k) || v === undefined) continue;
      rec[k] = typeof v === "string" ? sanitizeLogString(v) : v;
    }
  }
  return rec;
}

export type LogSink = (line: string) => void;

export function createLogger(opts: { level?: LogLevel; sink?: LogSink } = {}): Logger {
  const min = LEVEL_RANK[opts.level ?? "info"];
  const sink: LogSink = opts.sink ?? ((line) => process.stdout.write(`${line}\n`));
  const emit = (level: LogLevel, msg: string, fields?: LogFields) => {
    if (LEVEL_RANK[level] < min) return;
    sink(JSON.stringify(buildRecord(level, msg, fields)));
  };
  return {
    debug: (m, f) => emit("debug", m, f),
    info: (m, f) => emit("info", m, f),
    warn: (m, f) => emit("warn", m, f),
    error: (m, f) => emit("error", m, f),
  };
}

export const silentLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

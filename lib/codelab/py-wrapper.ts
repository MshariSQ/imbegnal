/**
 * Wraps a learner's Python program so the existing Pyodide worker
 * (public/pyodide-worker.js) can give us what Code Lab needs and that worker
 * does not provide by itself: stdin, a stdout/stderr split, an exit code and
 * tracebacks that name `main.py` with the learner's own line numbers.
 *
 * The worker runs one source string with sys.stdout = sys.stderr = one buffer
 * and returns that buffer. We therefore run the learner's code from inside a
 * wrapper that swaps stderr to a private buffer and, at the end, appends it to
 * the shared buffer behind a per-run marker that `parsePythonOutput` splits off.
 *
 * The program and stdin are embedded as JSON string literals (valid Python
 * string syntax) and compiled with `compile(src, "main.py", "exec")`, never
 * spliced into the wrapper's code, so nothing in them can alter the wrapper.
 */

export interface PythonRunOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/** A marker that cannot appear by accident; derived from a per-run random token. */
export function outputMarker(token: string): string {
  return `\u0000IMB:${token}:`;
}

export function buildPythonProgram(code: string, stdin: string, token: string): string {
  const marker = outputMarker(token);
  return [
    "import sys as _imb_sys, io as _imb_io, traceback as _imb_tb",
    "_imb_out = _imb_sys.stdout",
    "_imb_err = _imb_io.StringIO()",
    "_imb_sys.stderr = _imb_err",
    `_imb_sys.stdin = _imb_io.StringIO(${JSON.stringify(stdin)})`,
    `_imb_src = ${JSON.stringify(code)}`,
    "_imb_exit = 0",
    "try:",
    '    exec(compile(_imb_src, "main.py", "exec"), {"__name__": "__main__"})',
    "except SystemExit as _imb_e:",
    "    _imb_c = _imb_e.code",
    "    if isinstance(_imb_c, int):",
    "        _imb_exit = _imb_c",
    "    elif _imb_c is not None:",
    "        _imb_exit = 1",
    "        print(_imb_c, file=_imb_err)",
    "except BaseException as _imb_e:",
    "    _imb_exit = 1",
    "    _imb_tb.print_exception(type(_imb_e), _imb_e, _imb_e.__traceback__.tb_next if _imb_e.__traceback__ else None)",
    `_imb_out.write(${JSON.stringify(marker)} + str(_imb_exit) + ":" + _imb_err.getvalue())`,
    "",
  ].join("\n");
}

/** Splits the buffer the worker returned into stdout / stderr / exit code. */
export function parsePythonOutput(raw: string, token: string): PythonRunOutput {
  const marker = outputMarker(token);
  const at = raw.lastIndexOf(marker);
  if (at < 0) return { stdout: raw, stderr: "", exitCode: 1 };
  const tail = raw.slice(at + marker.length);
  const colon = tail.indexOf(":");
  const code = Number(tail.slice(0, colon));
  return {
    stdout: raw.slice(0, at),
    stderr: tail.slice(colon + 1),
    exitCode: Number.isFinite(code) ? code : 1,
  };
}

/** Python's own message for a syntax error / traceback line, kept short for the status line. */
export function lastErrorLine(stderr: string): string {
  const lines = stderr.trim().split("\n");
  return lines[lines.length - 1] ?? "";
}

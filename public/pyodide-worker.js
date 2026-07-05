/* Pyodide runner — executes Python lessons in an isolated Web Worker.
   Loaded lazily; the ~10 MB runtime comes from jsDelivr and is browser-cached. */
/* global loadPyodide, importScripts */

var pyodideReady = null;

function ensurePyodide() {
  if (!pyodideReady) {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
    pyodideReady = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    });
  }
  return pyodideReady;
}

self.onmessage = async function (e) {
  var msg = e.data;
  if (!msg || msg.cmd !== "run") return;
  try {
    self.postMessage({ t: "loading" });
    var pyodide = await ensurePyodide();
    self.postMessage({ t: "ready" });

    // Fresh scope per run; capture stdout/stderr.
    var setup =
      "import sys, io\n" +
      "_sf_out = io.StringIO()\n" +
      "sys.stdout = _sf_out\n" +
      "sys.stderr = _sf_out\n";
    var globalsDict = pyodide.globals.get("dict")();
    await pyodide.runPythonAsync(setup, { globals: globalsDict });

    var stdout = "";
    var runError = null;
    try {
      await pyodide.runPythonAsync(msg.code, { globals: globalsDict });
    } catch (err) {
      runError = String(err && err.message ? err.message : err);
    }
    try {
      stdout = await pyodide.runPythonAsync("_sf_out.getvalue()", { globals: globalsDict });
    } catch { /* ignore */ }

    var testResults = [];
    if (msg.tests && msg.tests.length && !runError) {
      // expose captured stdout to test snippets as _stdout
      await pyodide.runPythonAsync("_stdout = _sf_out.getvalue()", { globals: globalsDict });
      for (var i = 0; i < msg.tests.length; i++) {
        try {
          await pyodide.runPythonAsync(msg.tests[i], { globals: globalsDict });
          testResults.push({ i: i, pass: true });
        } catch (err) {
          testResults.push({ i: i, pass: false, error: String(err && err.message ? err.message : err).split("\n").slice(-2).join(" ") });
        }
      }
    } else if (msg.tests && msg.tests.length && runError) {
      for (var j = 0; j < msg.tests.length; j++) {
        testResults.push({ i: j, pass: false, error: "code did not run" });
      }
    }

    globalsDict.destroy();
    self.postMessage({ t: "result", stdout: stdout, error: runError, testResults: testResults });
  } catch (err) {
    self.postMessage({ t: "fatal", message: String(err && err.message ? err.message : err) });
  }
};

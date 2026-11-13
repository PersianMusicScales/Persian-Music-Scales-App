#!/usr/bin/env python3
"""Temporary localhost-only report collector for Persian Music Scales PR #37.

Start from the extracted repository root:
    py tools\local_diagnostics_server.py

No pip installations, DevTools console, online service, or GitHub credentials
are needed. No audio is uploaded: only a small JSON analysis report is saved.
Remove this file and tools/local_diagnostics_client.js after the experiment.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import secrets
import threading
from urllib.parse import urlsplit
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "local-diagnostic-reports"
MAX_BYTES = 256 * 1024
ALLOWED_FIELDS = frozenset((
    "diagnosticVersion", "status", "reason", "updatedAt",
    "fileName", "knownMode", "inputOrigin", "durationSeconds",
    "noteEvents", "structuralPhrases", "unmodifiedDastgahRanking",
    "avazDecision", "displayedCandidates"
))


def safe_name(value: object) -> str:
    """Create a filename segment, never a path."""
    part = re.sub(r"[^A-Za-z0-9_-]+", "-", str(value or "unlabeled"))
    return part.strip("-_")[:55] or "unlabeled"


def store_report(payload: dict, directory: Path = OUTPUT_DIR) -> str:
    """Save an allowlisted report, atomically, without raw audio."""
    directory.mkdir(exist_ok=True, parents=True)
    allowed = {key: payload[key] for key in ALLOWED_FIELDS if key in payload}
    if not isinstance(allowed.get("status"), str):
        raise ValueError("Missing report status")
    if not isinstance(allowed.get("avazDecision", {}), dict):
        raise ValueError("Invalid modal diagnostic")
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    name = (f"{stamp}_{safe_name(allowed.get('knownMode'))}_"
            f"{safe_name(allowed.get('fileName'))}_"
            f"{secrets.token_hex(4)}.json")
    destination = directory / name
    tmp = directory / ("." + name + ".tmp")
    tmp.write_text(json.dumps(allowed, indent=2, ensure_ascii=False) + "\n",
                   encoding="utf-8")
    tmp.replace(destination)
    return name


class Handler(SimpleHTTPRequestHandler):
    server_version = "PersianAvazLocalDiagnostics/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def _json(self, status: int, value: dict):
        body = json.dumps(value).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        route = urlsplit(self.path).path
        if route == "/__avaz_health":
            self._json(200, {"ready": True, "reportsFolder": OUTPUT_DIR.name})
            return
        # Don't serve locally saved diagnostic data back to webpages.
        if route.startswith("/local-diagnostic-reports"):
            self.send_error(403, "Local reports are private files")
            return
        # There is no PWA caching in the local diagnostic session. Otherwise
        # previously registered service workers can silently serve stale JS.
        if route == "/service-worker.js":
            self.send_error(404, "PWA disabled in this local diagnostic session")
            return
        if route in ("/", "/index.html"):
            html = (ROOT / "index.html").read_text(encoding="utf-8")
            injection = '\n<script src="/tools/local_diagnostics_client.js?v=pr37"></script>\n'
            if "</body>" not in html:
                self.send_error(500, "Missing closing body")
                return
            html = html.replace("</body>", injection + "</body>", 1)
            body = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def do_POST(self):
        if urlsplit(self.path).path != "/__avaz_diagnostics":
            self.send_error(404)
            return
        host_port = self.server.server_port
        permitted = {f"http://localhost:{host_port}",
                     f"http://127.0.0.1:{host_port}"}
        if self.headers.get("Origin") not in permitted:
            self._json(403, {"saved": False, "error": "Nonlocal origin refused"})
            return
        if not self.headers.get("Content-Type", "").lower().startswith("application/json"):
            self._json(415, {"saved": False, "error": "JSON required"})
            return
        try:
            n = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            n = 0
        if not 0 < n <= MAX_BYTES:
            self._json(413, {"saved": False, "error": "Invalid report size"})
            return
        try:
            payload = json.loads(self.rfile.read(n))
            if not isinstance(payload, dict):
                raise ValueError("Report must be an object")
            name = store_report(payload)
        except (ValueError, UnicodeError, OSError) as exc:
            self._json(400, {"saved": False, "error": str(exc)[:160]})
            return
        print(f"Saved local diagnostic: {name}", flush=True)
        self._json(201, {"saved": True, "file": name,
                         "folder": OUTPUT_DIR.name})


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Launch local Avaz analyzer and save diagnostic JSON reports.")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true",
                        help="Start server without opening Chrome automatically")
    args = parser.parse_args(argv)
    if not 1024 <= args.port <= 65535:
        parser.error("Port must be between 1024 and 65535")
    OUTPUT_DIR.mkdir(exist_ok=True)
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    except OSError as exc:
        parser.error(f"Port {args.port} unavailable: {exc}. Try --port 8766")
    address = f"http://localhost:{args.port}/?avazDebug=1&autoSave=1"
    print("\nPersian Music Scales — PRIVATE LOCAL DIAGNOSTICS", flush=True)
    print("No audio or diagnostic data is sent to GitHub or outside localhost.")
    print(f"Open: {address}", flush=True)
    print(f"Reports saved automatically: {OUTPUT_DIR}", flush=True)
    print("Select a known mode and one or more audio files in the page.")
    print("Press Ctrl+C here to stop the server.\n", flush=True)
    if not args.no_browser:
        threading.Timer(0.5, lambda: webbrowser.open(address)).start()
    try:
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print("\nLocal diagnostic server stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

"""Serve the V4 listening comparison on this computer."""

import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path, PureWindowsPath
import shutil
import sys
import tempfile
import threading
from urllib.parse import unquote
import webbrowser

from passages import compare
from radif_release import EXTENSIONS, MAX_UPLOAD
from reference import load_reference


class ComparisonHandler(BaseHTTPRequestHandler):
    def respond(self, status, content_type, data):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def json_response(self, status, data):
        self.respond(status, "application/json", json.dumps(data, allow_nan=False).encode("utf-8"))

    def local_request(self):
        hosts = {f"127.0.0.1:{self.server.server_port}", f"localhost:{self.server.server_port}"}
        origin = self.headers.get("Origin")
        return self.headers.get("Host") in hosts and (origin is None or origin in {"http://" + h for h in hosts})

    def do_GET(self):
        if not self.local_request():
            return self.send_error(403)
        if self.path == "/":
            self.respond(200, "text/html; charset=utf-8", self.server.page)
        else:
            self.send_error(404)

    def do_POST(self):
        if not self.local_request():
            return self.send_error(403)
        if self.path != "/compare":
            return self.send_error(404)
        if not self.server.busy.acquire(blocking=False):
            return self.json_response(409, {"error": "Another comparison is still running."})
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= MAX_UPLOAD:
                raise ValueError("Choose an audio file up to 80 MiB.")
            name = PureWindowsPath(unquote(self.headers.get("X-Filename", ""))).name
            if name.casefold() in self.server.reference.blocked_names:
                raise ValueError("This filename belongs to the reserved KDC final test.")
            suffix = Path(name).suffix.lower()
            if suffix not in EXTENSIONS:
                raise ValueError("Choose a supported audio file.")
            with tempfile.TemporaryDirectory(prefix="v4-listening-") as directory:
                scratch = Path(directory)
                source = scratch / ("input" + suffix)
                with source.open("wb") as file:
                    remaining = size
                    while remaining:
                        chunk = self.rfile.read(min(1024 * 1024, remaining))
                        if not chunk:
                            raise ValueError("The audio upload was interrupted.")
                        file.write(chunk)
                        remaining -= len(chunk)
                result = compare(source, scratch, self.server.reference)
            self.json_response(200, result)
        except (BrokenPipeError, ConnectionResetError):
            pass  # The listener closed the page.
        except ValueError as error:
            self.json_response(400, {"error": str(error)})
        except Exception as error:
            print(f"Comparison failed: {error}", file=sys.stderr, flush=True)
            self.json_response(500, {"error": "Comparison failed. The launcher window has the details."})
        finally:
            self.server.busy.release()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.home() / "Desktop" / "Scale detection")
    parser.add_argument("--from-cache", action="store_true", help="Build the V4 reference in memory if no release exists")
    parser.add_argument("--release-script", type=Path, help="Original trusted source used for an existing frozen release")
    parser.add_argument("--port", type=int, default=0, help="Local port (default: choose an available port)")
    parser.add_argument("--open", action="store_true", help="Open the listening page in your browser")
    args = parser.parse_args()
    if not shutil.which("ffmpeg"):
        raise RuntimeError("FFmpeg was not found on PATH.")
    reference = load_reference(args.root.resolve(), args.from_cache, args.release_script)
    with ThreadingHTTPServer(("127.0.0.1", args.port), ComparisonHandler) as server:
        server.reference = reference
        server.busy = threading.Lock()
        server.page = Path(__file__).with_name("compare.html").read_bytes()
        url = f"http://127.0.0.1:{server.server_port}/"
        print(f"Open {url} for the V4 comparison. Ctrl+C closes the server.", flush=True)
        if args.open:
            webbrowser.open(url)
        server.serve_forever()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
    except (OSError, RuntimeError, ValueError) as error:
        sys.exit(str(error))

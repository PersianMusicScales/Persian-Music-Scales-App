"""First-run setup for a PC with the original KDC ZIP and system Python."""

from contextlib import contextmanager
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import venv


@contextmanager
def setup_lock(home):
    # An OS lock is released even when the Windows console is closed mid-install.
    import msvcrt
    with (home / "setup.lock").open("a+b") as lock:
        if lock.tell() == 0:
            lock.write(b"0")
            lock.flush()
        lock.seek(0)
        try:
            msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
        except OSError:
            raise SystemExit("Another V4 setup is already running. Keep that window open.")
        try:
            yield
        finally:
            lock.seek(0)
            msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)


def install(python, *requirements):
    subprocess.run([python, "-m", "pip", "install", "--disable-pip-version-check",
                    "--only-binary=:all:", *requirements], check=True)


def run(zip_path=None):
    home = Path(os.environ["LOCALAPPDATA"]) / "PersianMusicScales" / "V4Comparison"
    home.mkdir(parents=True, exist_ok=True)
    envdir = home / f"python-{sys.version_info.major}.{sys.version_info.minor}"
    scripts = envdir / "Scripts"
    python = scripts / "python.exe"
    env = dict(os.environ, PATH=str(scripts) + os.pathsep + os.environ.get("PATH", ""), PYTHONUTF8="1")
    with setup_lock(home):
        if not python.is_file():
            print("Creating the local V4 Python environment…", flush=True)
            venv.EnvBuilder(with_pip=True).create(envdir)
        if subprocess.run([python, "-m", "pip", "--version"], capture_output=True).returncode:
            subprocess.run([python, "-m", "ensurepip", "--upgrade"], check=True)
        check = subprocess.run([python, "-c", "import numpy, sklearn, joblib"], capture_output=True)
        if check.returncode:
            print("Installing the V4 numerical libraries…", flush=True)
            install(python, "numpy>=1.26,<3", "scikit-learn>=1.4,<2", "joblib>=1.2,<2")
        if not shutil.which("ffmpeg", path=env["PATH"]):
            print("Setting up FFmpeg inside the V4 environment…", flush=True)
            install(python, "imageio-ffmpeg>=0.5,<1")
            binary = subprocess.check_output([python, "-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"],
                                             env=env, encoding="utf-8").strip()
            with tempfile.TemporaryDirectory(dir=envdir) as temporary:
                stage = Path(temporary) / "ffmpeg.exe"
                shutil.copy2(binary, stage)
                stage.replace(scripts / "ffmpeg.exe")
    server = Path(__file__).with_name("compare_server.py")
    command = [python, server, "--archive-cache", home, "--open"]
    if zip_path:
        command.extend(["--kdc-zip", zip_path])
    return subprocess.call(command, env=env)


if __name__ == "__main__":
    try:
        sys.exit(run(sys.argv[1] if len(sys.argv) > 1 else None))
    except (OSError, subprocess.CalledProcessError) as error:
        sys.exit(f"Windows setup could not finish: {error}")

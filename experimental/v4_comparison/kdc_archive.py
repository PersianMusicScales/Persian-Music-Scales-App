"""Reconstruct the V4 reference from the user's original KDC v1.0 ZIP."""

import csv
import hashlib
import io
from pathlib import Path, PurePosixPath
import shutil
import tempfile
import zipfile

import numpy as np
import sklearn
from sklearn.metrics import f1_score

import radif_release
from reference import Reference
import v4_features


MODE = {"Abuata": "abu_ata", "Afshari": "afshari", "Bayat-e Tork": "bayat_tork",
        "Chahargah": "chahargah", "Dashti": "dashti", "Esfahan": "esfahan",
        "Homayun": "homayoun", "Mahur": "mahur", "Nava": "nava",
        "Rast-Panjgah": "rast_panjgah", "Segah": "segah", "Shur": "shur"}
DEVELOPMENT_ARTISTS = {"Farahnaz Sahebghalam", "Mohammad Khodadadi", "Reza Zalpour"}
# Ordered (MBID, artist, label) from KDC-v1.0-Metadata.csv, then (MBID, prediction)
# from the archived 49 out-of-performer predictions in original manifest order.
ROSTER_HASH = "c4861f953926ca0e983b7dea578e4ab1186b2022486de59250909e32975a9b60"
PREDICTION_HASH = "6c42d70b8e328f93b432d614c8e3d64dc337aea2d65ccfdc6a02e2efb7b9fcd5"
CACHE_NAME = "verified-v4-v1.npz"


def row_hash(rows):
    return hashlib.sha256("".join("\t".join(row) + "\n" for row in rows).encode()).hexdigest()


def check_roster(roster):
    if len(roster) != 65 or row_hash(roster) != ROSTER_HASH:
        raise ValueError("The recording roster differs from the original KDC v1.0 research roster.")
    return [row for row in roster if row[1] in DEVELOPMENT_ARTISTS]


def archive_roster(archive):
    members = [(PurePosixPath(info.filename.replace("\\", "/")), info) for info in archive.infolist()]
    metadata = [(path, info) for path, info in members if path.name.casefold() == "kdc-v1.0-metadata.csv"
                and "__MACOSX" not in path.parts]
    if len(metadata) != 1:
        raise ValueError("Select KDC-v1.0.zip containing KDC-v1.0-Metadata.csv and recordings/*.flac.")
    path, entry = metadata[0]
    with archive.open(entry) as raw, io.TextIOWrapper(raw, encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        if not {"Type", "Gushe", "Artist", "MBID", "Dastgah"} <= set(reader.fieldnames or []):
            raise ValueError("The KDC metadata is missing required columns.")
        roster = [(r["MBID"].strip().lower(), r["Artist"].strip(), MODE.get(r["Dastgah"].strip(), ""))
                  for r in reader if r["Type"].strip().casefold() == "performance"
                  and r["Gushe"].strip().casefold() == "daramad"]
    development = check_roster(roster)
    # Construct exact member paths only after checking the canonical roster.
    allowed = {path.parent / "recordings" / (mbid + ".flac"): mbid for mbid, _, _ in development}
    audio = {}
    for member, info in members:
        if member in allowed:
            mbid = allowed[member]
            if mbid in audio:
                raise ValueError("The KDC archive contains a duplicate development recording.")
            audio[mbid] = info
    if len(audio) != len(development):
        raise ValueError(f"Found {len(audio)} of 49 development FLAC files. Choose the original KDC ZIP.")
    return roster, audio


def atomic_npz(path, **arrays):
    with tempfile.NamedTemporaryFile(dir=path.parent, suffix=".tmp", delete=False) as file:
        stage = Path(file.name)
    try:
        with stage.open("wb") as file:
            np.savez_compressed(file, **arrays)
        stage.replace(path)
    finally:
        stage.unlink(missing_ok=True)


def matrix_hash(values):
    return hashlib.sha256(np.asarray(values, dtype="<f8").tobytes()).hexdigest()


def recipe_hash():
    return hashlib.sha256(Path(v4_features.__file__).read_text(encoding="utf-8").encode()).hexdigest()


def development_vector(archive, info, cache, audio_file):
    # The member CRC and uncompressed size survive a ZIP move or recompression.
    mbid = PurePosixPath(info.filename.replace("\\", "/")).stem
    dest = cache / f"{mbid}-{info.CRC:08x}-{info.file_size}.npz"
    if dest.exists():
        try:
            with np.load(dest, allow_pickle=False) as data:
                vector = data["features"]
                if vector.shape == (225,) and np.isfinite(vector).all() and matrix_hash(vector) == data["digest"].item():
                    return vector
        except (OSError, EOFError, ValueError, KeyError, zipfile.BadZipFile):
            pass  # A fresh extraction replaces a damaged partial checkpoint.
    with archive.open(info) as src, audio_file.open("wb") as out:
        shutil.copyfileobj(src, out)
    vector = v4_features.extract(audio_file, training=True)
    atomic_npz(dest, features=vector, digest=matrix_hash(vector))
    return vector


def verified_reference(roster, x):
    development = check_roster(roster)
    if x.shape != (49, 225) or not np.isfinite(x).all():
        raise ValueError("The V4 development feature matrix is incomplete.")
    ids, artists, modes = map(np.asarray, zip(*development))
    predictions = np.empty(len(modes), dtype=object)
    for artist in sorted(DEVELOPMENT_ARTISTS):
        held = artists == artist
        model = radif_release.new_model().fit(x[~held], modes[~held])
        predictions[held] = model.predict(x[held])
    correct = int(np.sum(predictions == modes))
    macro = f1_score(modes.tolist(), predictions.tolist(), labels=radif_release.MODES, average="macro")
    if (row_hash(zip(ids, predictions)) != PREDICTION_HASH or correct != radif_release.BASELINE_CORRECT
            or abs(macro - radif_release.BASELINE_F1) > .0001):
        raise ValueError(f"V4 reproduction failed ({correct}/49, macro-F1 {macro:.5f}, "
                         f"NumPy {np.__version__}, scikit-learn {sklearn.__version__}). "
                         "The local setup must reproduce all 49 original predictions before comparison.")
    model = radif_release.new_model().fit(x, modes)
    blocked = frozenset(mbid for mbid, artist, _ in roster if artist not in DEVELOPMENT_ARTISTS)
    identity = {"version": radif_release.VERSION, "sklearn": sklearn.__version__,
                "feature_matrix_sha256": matrix_hash(x), "out_of_performer_sha256": PREDICTION_HASH}
    print("Verified all 49 historical V4 predictions.", flush=True)
    return Reference(model, v4_features.extract, blocked, identity)


def choose_zip():
    try:
        import tkinter as tk
        from tkinter import filedialog
    except ImportError:
        tk = None
    value = None
    if tk is not None:
        try:
            root = tk.Tk()
            try:
                root.withdraw()
                root.attributes("-topmost", True)
                value = filedialog.askopenfilename(parent=root, title="Select KDC-v1.0.zip",
                                                   filetypes=[("ZIP archive", "*.zip")])
            finally:
                root.destroy()
        except tk.TclError:
            pass  # A system Python without a working GUI can still accept a path.
    if value is None:
        value = input("Path to KDC-v1.0.zip: ").strip().strip('"')
    if not value:
        raise SystemExit("No archive selected. You can reopen the launcher at any time.")
    return Path(value).expanduser()


def load_from_zip(home, archive_path=None):
    home.mkdir(parents=True, exist_ok=True)
    bundle = home / CACHE_NAME
    recipe = recipe_hash()
    if archive_path is None and bundle.is_file():
        try:
            with np.load(bundle, allow_pickle=False) as data:
                roster, x = data["roster"].tolist(), data["features"]
                if data["recipe"].item() != recipe or data["digest"].item() != matrix_hash(x):
                    raise ValueError("The stored feature matrix needs rebuilding.")
            return verified_reference(roster, x)
        except (OSError, EOFError, ValueError, KeyError, zipfile.BadZipFile) as error:
            print(f"Saved reference could not be reused: {error}", flush=True)
    if archive_path is None:
        archive_path = choose_zip()
    if not zipfile.is_zipfile(archive_path):
        raise ValueError("Select the original KDC-v1.0.zip archive.")
    cache = home / "development-features" / recipe
    cache.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive_path) as archive, tempfile.TemporaryDirectory(prefix="kdc-v4-") as temp:
        roster, members = archive_roster(archive)
        vectors = []
        for i, (mbid, _, _) in enumerate(check_roster(roster), 1):
            print(f"Preparing development recording {i}/49…", flush=True)
            vectors.append(development_vector(archive, members[mbid], cache, Path(temp) / "input.flac"))
    x = np.stack(vectors)
    reference = verified_reference(roster, x)
    atomic_npz(bundle, roster=np.asarray(roster), features=x, recipe=recipe, digest=matrix_hash(x))
    return reference

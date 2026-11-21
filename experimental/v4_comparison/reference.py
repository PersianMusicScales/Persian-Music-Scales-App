"""Use an existing frozen V4 release, or reconstruct its reference in memory."""

from __future__ import annotations

import csv
from dataclasses import dataclass
from functools import partial
import hashlib
import importlib.util
from pathlib import Path
from typing import Callable

import numpy as np
import sklearn
from sklearn.pipeline import Pipeline

import radif_release


FEATURE_SET = "full_147_plus_contour"


@dataclass(frozen=True)
class Reference:
    model: Pipeline
    extract: Callable[[Path], np.ndarray]
    blocked_names: frozenset[str]
    identity: dict[str, str]


def release_module(script):
    if script is None:
        return radif_release
    # Some earlier releases fingerprinted a differently named local source file.
    spec = importlib.util.spec_from_file_location("original_local_v4_release", script)
    if spec is None or spec.loader is None:
        raise ValueError("Choose the original Python release script used to freeze V4.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def cached_reference(root, release):
    pre, v4, core, champion, state, rows, cache, _ = release.setup(root)
    dev_rows = [row for row in rows if row["split"] in {"train", "val"}]
    development, dimensions = pre.load_dev_features(dev_rows, state, cache)
    if len(development) != 49 or dimensions != 147:
        raise ValueError("Expected 49 cached development vectors with 147 features each.")
    cache_dirs = [base / "v4_contour_evidence" / "pitch_cache"
                  for base in (root / "KDC_study", root)]
    cache_dirs = [folder for folder in cache_dirs if folder.is_dir()]
    if not cache_dirs:
        raise FileNotFoundError("Could not locate the existing V4 development pitch_cache.")
    for row in development:
        paths = (v4.track_cache_path(row, 60, folder) for folder in cache_dirs)
        path = next((p for p in paths if p.is_file()), None)
        if path is None:
            raise FileNotFoundError("A V4 development pitch cache is missing. Restore the original cache.")
        with np.load(path, allow_pickle=False) as track:
            contour = v4.contour_features(track["f0"], track["rms"])
        row["versions"] = {FEATURE_SET: v4.assemble(FEATURE_SET, row["features"], contour)}

    print("Verifying the frozen V4 development reference…", flush=True)
    parity, predictions = v4.cross_validate(development, champion.predict, FEATURE_SET)
    if parity["correct"] != release.BASELINE_CORRECT or abs(parity["macro_f1"] - release.BASELINE_F1) > .0001:
        raise ValueError("The local development caches did not reproduce the frozen V4 benchmark.")
    historical = next((p for folder in cache_dirs
                       if (p := folder.parent / "model_predictions_LOCAL.csv").is_file()), None)
    if historical:
        def prediction_map(records):
            return {(row["performer"], row["source"]): (row["mode"], row["prediction"])
                    for row in records if row["experiment"] == FEATURE_SET}
        with historical.open(encoding="utf-8-sig", newline="") as file:
            saved = prediction_map(csv.DictReader(file))
        if len(saved) != 49 or saved != prediction_map(predictions):
            raise ValueError("Local predictions differ from the saved V4 reference.")

    x = np.stack([row["versions"][FEATURE_SET] for row in development])
    if x.shape != (49, 225) or not np.isfinite(x).all():
        raise ValueError("The V4 development feature matrix is incomplete.")
    y = [row["mode"] for row in development]
    model = release.new_model().fit(x, y)
    identity = hashlib.sha256()
    identity.update(sklearn.__version__.encode())
    identity.update(release.VERSION.encode())
    identity.update(x.astype("<f8").tobytes())
    identity.update(",".join(y).encode())
    return model, core, v4, rows, {"training_input_sha256": identity.hexdigest()}


def load_reference(root: Path, from_cache=False, script=None):
    release = release_module(script)
    folder = root / "radif_release_v1"
    if (folder / "frozen.json").exists() or (folder / "model.joblib").exists():
        meta, model, setup = release.load_frozen(root, folder)
        _, v4, core, _, _, rows, _, _ = setup
        identity = {"model_sha256": meta["model_sha256"]}
    elif from_cache:
        model, core, v4, rows, identity = cached_reference(root, release)
    else:
        raise FileNotFoundError("No local frozen release. Use the Windows launcher or pass --from-cache.")
    if set(model.classes_) != set(radif_release.MODES):
        raise ValueError("The reference must include all twelve V4 mode labels.")
    blocked = frozenset(Path(row["source"]).name.casefold() for row in rows if row["split"] == "test")
    identity.update(version=release.VERSION, sklearn=sklearn.__version__)
    return Reference(model, partial(release.features_for_audio, core=core, v4=v4), blocked, identity)

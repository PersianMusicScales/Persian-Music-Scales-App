"""Export the verified forest for the static analyzer. Train only on the 49 development rows."""

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np

from kdc_archive import matrix_hash, recipe_hash, verified_reference


def export(bundle, output):
    with np.load(bundle, allow_pickle=False) as data:
        x, roster = data["features"], data["roster"].tolist()
        if data["digest"].item() != matrix_hash(x) or data["recipe"].item() != recipe_hash():
            raise ValueError("The cache does not match this V4 feature recipe.")
    reference = verified_reference(roster, x)
    forest = reference.model.steps[-1][1]
    trees = []
    for estimator in forest.estimators_:
        tree = estimator.tree_
        nodes = []
        for i in range(tree.node_count):
            left, right = int(tree.children_left[i]), int(tree.children_right[i])
            if left != right:
                nodes.append([int(tree.feature[i]), float(tree.threshold[i]), left, right])
            else:
                weights = tree.value[i, 0]
                leaf = [-1]
                for label in np.flatnonzero(weights):
                    leaf.extend([int(label), float(weights[label] / weights.sum())])
                nodes.append(leaf)
        trees.append(nodes)
    model = {"format": "kdc-v4-tree-1", "labels": list(forest.classes_), "trees": trees,
             "reserved": sorted(hashlib.sha256(s.encode()).hexdigest() for s in reference.blocked_stems)}
    output.write_text(json.dumps(model, separators=(",", ":"), allow_nan=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bundle", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    export(args.bundle, args.output)

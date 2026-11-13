import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import numpy as np
from sklearn.metrics import f1_score

spec=importlib.util.spec_from_file_location('rel',Path(__file__).with_name('radif_release.py'))
rel=importlib.util.module_from_spec(spec);spec.loader.exec_module(rel)

class ReleaseTests(unittest.TestCase):
    def test_model_12_labels_and_225(self):
        rng=np.random.default_rng(42)
        X=rng.normal(size=(49,225))
        labels=list(rel.MODES)*4+[rel.MODES[0]]
        m=rel.new_model().fit(X,labels)
        self.assertEqual(set(m.classes_),set(rel.MODES))
        self.assertAlmostEqual(float(m.predict_proba(X[:1]).sum()),1,places=7)
    def test_features_225(self):
        class Core:
            @staticmethod
            def extract_one(path,seconds,algorithm):return np.ones(147)
        class V4:
            @staticmethod
            def decode_pitch_track(path, seconds):return np.ones(512),np.ones(512)
            @staticmethod
            def contour_features(f0,rms):return {'x':1}
            @staticmethod
            def assemble(name, old, detail):return np.concatenate((old,np.ones(78)))
        r=rel.features_for_audio(Path('fake.flac'),Core,V4)
        self.assertEqual(r.shape,(225,))
    def test_unexpected_feature_shape_rejected(self):
        class Core:
            @staticmethod
            def extract_one(*args):return np.ones(146)
        class V4:
            @staticmethod
            def decode_pitch_track(*args):return np.ones(100),np.ones(100)
            @staticmethod
            def contour_features(*args):return None
            @staticmethod
            def assemble(*args):return np.ones(224)
        with self.assertRaises(ValueError):rel.features_for_audio(Path('fake.flac'),Core,V4)
    def test_pages_and_bound(self):
        self.assertIn('127.0.0.1',rel.serve.__code__.co_consts.__str__())
        self.assertIn('not calibrated probabilities',rel.PAGE)
        self.assertEqual(len(rel.MODES),12)
        self.assertIn('final-test',rel.main.__code__.co_consts.__str__())
    def test_no_auto_test_on_freeze(self):
        names=rel.freeze.__code__.co_names
        self.assertNotIn('final_test',names)
        self.assertIn('load_dev_features', names)
    def test_release_metadata(self):
        self.assertEqual(rel.BASELINE_CORRECT,29)
        self.assertAlmostEqual(rel.BASELINE_F1,0.58902,places=5)

if __name__=='__main__':unittest.main()
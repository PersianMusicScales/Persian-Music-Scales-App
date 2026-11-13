"""Local-only collector regression tests (standard-library unittest)."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from local_diagnostics_server import ALLOWED_FIELDS, safe_name, store_report


class LocalCollectorTests(unittest.TestCase):
    def test_save_only_allowlisted_diagnostics(self):
        with TemporaryDirectory() as scratch:
            directory = Path(scratch)
            report = {
                "status": "complete",
                "fileName": "actual recording.flac",
                "knownMode": "dashti",
                "diagnosticVersion": 2,
                "avazDecision": {"avazKey": "dashti", "evidence": 0.81},
                "displayedCandidates": [{"scaleName": "Shur"}],
                "rawAudio": [0.2, 0.1],
                "noteSequences": ["not for export"],
            }
            name = store_report(report, directory)
            obj = json.loads((directory / name).read_text(encoding="utf-8"))
            self.assertEqual(obj["status"], "complete")
            self.assertEqual(obj["knownMode"], "dashti")
            self.assertNotIn("rawAudio", obj)
            self.assertNotIn("noteSequences", obj)
            self.assertTrue(set(obj).issubset(ALLOWED_FIELDS))
            self.assertEqual(len(list(directory.glob("*.json"))), 1)

    def test_reject_invalid_status(self):
        with TemporaryDirectory() as scratch:
            with self.assertRaises(ValueError):
                store_report({"status": 22}, Path(scratch))

    def test_reject_invalid_decision(self):
        with TemporaryDirectory() as scratch:
            with self.assertRaises(ValueError):
                store_report({"status": "complete", "avazDecision": []}, Path(scratch))

    def test_filename_cannot_escape_report_directory(self):
        self.assertNotIn("/", safe_name("../../Windows/System32"))
        self.assertNotIn("\\", safe_name("C:\\Users\\Example"))
        with TemporaryDirectory() as scratch:
            directory = Path(scratch)
            name = store_report({
                "status": "failed", "fileName": "../../secrets.txt",
                "knownMode": "../homayoun", "reason": "No voiced notes",
            }, directory)
            self.assertEqual((directory / name).parent, directory)

    def test_unique_report_names(self):
        with TemporaryDirectory() as scratch:
            directory = Path(scratch)
            a = store_report({"status": "complete"}, directory)
            b = store_report({"status": "complete"}, directory)
            self.assertNotEqual(a, b)


if __name__ == "__main__":
    unittest.main()

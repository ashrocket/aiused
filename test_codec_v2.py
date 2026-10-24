import json
import random
import unittest
from pathlib import Path

from codec_v2 import encode, decode


class SparseCodecTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        catalog = json.loads(Path(__file__).with_name("categories-v2.json").read_text())
        context = json.loads(Path(__file__).with_name("context-v2.json").read_text())
        cls.defined = [item["id"] for item in catalog["categories"]]
        cls.context = [item["id"] for item in context["categories"]]
        assert len(cls.defined) == 99 and len(cls.context) == 11
        assert all(item["kind"] == "assist" for item in catalog["categories"])

    def test_fixed_vectors(self):
        self.assertEqual(encode([]), "0")
        self.assertEqual(encode([1]), "1")
        self.assertEqual(encode([10]), "A")
        self.assertEqual(encode([1, 10]), "GC")
        self.assertEqual(decode("GC"), [1, 10])

    def test_sparse_round_trips(self):
        rng = random.Random(2042)
        for count in [0, 1, 2, 3, 5, 10, 30, 60, 99]:
            for _ in range(20):
                ids = sorted(rng.sample(self.defined, count))
                self.assertEqual(decode(encode(ids)), ids)
                self.assertEqual(encode(ids[::-1] + ids), encode(ids))
        all_ids = self.defined + self.context
        self.assertEqual(decode(encode(all_ids)), sorted(all_ids))

    def test_bad_inputs(self):
        for value in ["", "00", "01", "!", "z" * 168, "_" * 167]:
            with self.assertRaises(ValueError):
                decode(value)
        for ids in [[0], [1000], [True], list(range(1, 112))]:
            with self.assertRaises(ValueError):
                encode(ids)


if __name__ == "__main__":
    unittest.main()

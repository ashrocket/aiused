"""Independent finite-universe coverage, edge cases, and randomized v1 checks."""
import itertools
from math import comb
import random
import unittest
from unittest.mock import patch
import codec


class CodecTests(unittest.TestCase):
    def test_exhaustive_small_universe(self):
        # Every subset and every integer must appear once; covers cardinality boundaries.
        with patch.object(codec, "SIZE", 12):
            seen = set()
            for k in range(13):
                for ids in itertools.combinations(range(1, 13), k):
                    code = codec.encode(ids)
                    self.assertNotIn(code, seen)
                    seen.add(code)
                    self.assertEqual(codec.decode(code), list(ids))
            self.assertEqual(len(seen), 4096)

    def test_every_single_and_pair(self):
        for k in (1, 2):
            for ids in itertools.combinations(range(1, 100), k):
                self.assertEqual(codec.decode(codec.encode(ids)), list(ids))

    def test_every_cardinality_and_random_sets(self):
        rng = random.Random(20261023)
        for k in range(100):
            for _ in range(25):
                ids = sorted(rng.sample(range(1, 100), k))
                code = codec.encode(ids)
                self.assertLessEqual(len(code), 18)
                self.assertEqual(codec.decode(code), ids)

    def test_fixed_vectors_and_canonicalization(self):
        self.assertEqual(codec.encode([]), "10")
        self.assertEqual(codec.encode([1]), "11")
        self.assertEqual(codec.encode([99]), "11Z")
        self.assertEqual(codec.encode([2, 1, 2]), "11a")
        self.assertEqual(codec.decode("11a"), [1, 2])
        self.assertEqual(codec.decode(codec.encode(range(1, 100))), list(range(1, 100)))

    def test_short_code_guarantees(self):
        for k, maximum in [(1, 3), (2, 4), (3, 4), (4, 5), (5, 6), (6, 7)]:
            self.assertLessEqual(len(codec.encode(range(100-k, 100))), maximum)

    def test_invalid_input_rejected(self):
        for ids in ([0], [100], [-1], [True], [1.0], ["1"]):
            with self.assertRaises(ValueError):
                codec.encode(ids)
        for code in ("", "1", "20", "100", "1=", "1/", "1 ", "1" + "_" * 17):
            with self.assertRaises(ValueError):
                codec.decode(code)


if __name__ == "__main__":
    unittest.main()

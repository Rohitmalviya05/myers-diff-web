import unittest
from app.algorithms.myers import myers_operations
from app.routes.diff import _line_diff

class MyersTests(unittest.TestCase):
    def test_reconstruction(self):
        cases = [('', ''), ('abc', 'abc'), ('abc', 'axc'), ('abc', 'abXYc'), ('kitten', 'sitting'), ('a\nb', 'a\nc\nb')]
        for old, new in cases:
            ops = myers_operations(old, new)
            self.assertEqual(''.join(v for t, v in ops if t != 'insert'), old)
            self.assertEqual(''.join(v for t, v in ops if t != 'delete'), new)

    def test_identical(self):
        result = _line_diff('a\nb', 'a\nb', True)
        self.assertTrue(result['identical'])
        self.assertEqual(result['stats']['unchanged'], 2)

    def test_changed(self):
        result = _line_diff('port = 8000', 'port = 8080', True)
        self.assertFalse(result['identical'])
        self.assertEqual(result['stats']['added'], 1)
        self.assertEqual(result['stats']['deleted'], 1)
        self.assertIn('paired_changes', result['blocks'][0])

if __name__ == '__main__':
    unittest.main()

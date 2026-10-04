"""Myers O(ND) shortest edit script for arbitrary sequences."""
from typing import Any, Iterable


def myers_operations(a: Iterable[Any], b: Iterable[Any]) -> list[tuple[str, Any]]:
    """Return minimal ('equal'|'delete'|'insert', item) operations transforming a into b."""
    a, b = list(a), list(b)
    n, m = len(a), len(b)
    if not n:
        return [('insert', item) for item in b]
    if not m:
        return [('delete', item) for item in a]

    v = {1: 0}
    trace = []
    end_d = 0
    found = False
    for d in range(n + m + 1):
        trace.append(v.copy())
        for k in range(-d, d + 1, 2):
            if k == -d or (k != d and v.get(k - 1, -1) < v.get(k + 1, -1)):
                x = v.get(k + 1, 0)
            else:
                x = v.get(k - 1, 0) + 1
            y = x - k
            while x < n and y < m and a[x] == b[y]:
                x += 1
                y += 1
            v[k] = x
            if x >= n and y >= m:
                end_d = d
                found = True
                break
        if found:
            break

    x, y = n, m
    reversed_ops = []
    for d in range(end_d, -1, -1):
        previous_v = trace[d]
        k = x - y
        if d == 0:
            while x > 0 and y > 0:
                reversed_ops.append(('equal', a[x - 1]))
                x -= 1; y -= 1
            while x > 0:
                reversed_ops.append(('delete', a[x - 1])); x -= 1
            while y > 0:
                reversed_ops.append(('insert', b[y - 1])); y -= 1
            break
        if k == -d or (k != d and previous_v.get(k - 1, -1) < previous_v.get(k + 1, -1)):
            prev_k = k + 1
        else:
            prev_k = k - 1
        prev_x = previous_v.get(prev_k, 0)
        prev_y = prev_x - prev_k
        while x > prev_x and y > prev_y:
            reversed_ops.append(('equal', a[x - 1]))
            x -= 1; y -= 1
        if x == prev_x:
            if y > 0:
                reversed_ops.append(('insert', b[y - 1])); y -= 1
        else:
            if x > 0:
                reversed_ops.append(('delete', a[x - 1])); x -= 1
    reversed_ops.reverse()
    return reversed_ops


def grouped_diff(a: Iterable[Any], b: Iterable[Any]) -> list[dict]:
    """Group sequence operations into equal/insert/delete blocks."""
    groups: list[dict] = []
    for tag, item in myers_operations(a, b):
        if not groups or groups[-1]['type'] != tag:
            groups.append({'type': tag, 'items': []})
        groups[-1]['items'].append(item)
    return groups

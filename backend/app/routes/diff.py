from fastapi import APIRouter, File, HTTPException, UploadFile
from app.algorithms.myers import grouped_diff
from app.schemas.diff_schema import DiffRequest

router = APIRouter(prefix='/api', tags=['diff'])
MAX_BYTES = 1_000_000


def _line_diff(original: str, modified: str, character_diff: bool):
    old_lines = original.splitlines()
    new_lines = modified.splitlines()
    groups = grouped_diff(old_lines, new_lines)
    blocks = []
    old_line = new_line = 1
    added = deleted = unchanged = 0
    for group in groups:
        kind = group['type']
        items = group['items']
        block = {'type': kind, 'lines': items, 'old_start': None, 'new_start': None}
        if kind in ('equal', 'delete'):
            block['old_start'] = old_line
        if kind in ('equal', 'insert'):
            block['new_start'] = new_line
        if kind == 'equal':
            old_line += len(items); new_line += len(items); unchanged += len(items)
        elif kind == 'delete':
            old_line += len(items); deleted += len(items)
        else:
            new_line += len(items); added += len(items)
        blocks.append(block)

    # Pair adjacent delete/insert blocks as changed-line character spans.
    if character_diff:
        for i in range(len(blocks) - 1):
            left, right = blocks[i], blocks[i + 1]
            if left['type'] == 'delete' and right['type'] == 'insert':
                pairs = []
                for old, new in zip(left['lines'], right['lines']):
                    char_ops = grouped_diff(old, new)
                    old_spans, new_spans = [], []
                    oi = ni = 0
                    for op in char_ops:
                        text = ''.join(op['items'])
                        if op['type'] == 'equal':
                            oi += len(text); ni += len(text)
                        elif op['type'] == 'delete':
                            old_spans.append({'start': oi, 'end': oi + len(text)}); oi += len(text)
                        else:
                            new_spans.append({'start': ni, 'end': ni + len(text)}); ni += len(text)
                    pairs.append({'old': old, 'new': new, 'old_spans': old_spans, 'new_spans': new_spans})
                left['paired_changes'] = pairs
                right['paired_changes'] = pairs
    return {'blocks': blocks, 'stats': {'added': added, 'deleted': deleted, 'unchanged': unchanged}, 'identical': original == modified}


@router.post('/diff')
def compare_text(request: DiffRequest):
    return _line_diff(request.original, request.modified, request.character_diff)


@router.post('/diff/files')
async def compare_files(original: UploadFile = File(...), modified: UploadFile = File(...), character_diff: bool = True):
    old = await original.read(MAX_BYTES + 1)
    new = await modified.read(MAX_BYTES + 1)
    if len(old) > MAX_BYTES or len(new) > MAX_BYTES:
        raise HTTPException(status_code=413, detail='Each file must be at most 1 MB.')
    try:
        old_text, new_text = old.decode('utf-8'), new.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail='Only UTF-8 text files are supported.')
    return _line_diff(old_text, new_text, character_diff)

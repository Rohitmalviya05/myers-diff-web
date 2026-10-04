import { Download, FileCode2 } from 'lucide-react'

function Line({ number, text, type, spans = [] }) {
  const ordered = [...spans].sort((a,b) => a.start - b.start)
  const parts = []; let cursor = 0
  ordered.forEach((span, i) => {
    if (span.start > cursor) parts.push(<span key={`plain-${i}`}>{text.slice(cursor, span.start)}</span>)
    parts.push(<mark className={type === 'delete' ? 'char-delete' : 'char-insert'} key={`mark-${i}`}>{text.slice(span.start, span.end)}</mark>)
    cursor = span.end
  })
  if (cursor < text.length || parts.length === 0) parts.push(<span key="tail">{text.slice(cursor)}</span>)
  return <div className={`code-line ${type}`}><span className="line-number">{number ?? ''}</span><span className="line-sign">{type === 'insert' ? '+' : type === 'delete' ? '−' : ' '}</span><code>{parts}</code></div>
}

export default function DiffViewer({ result, original, modified }) {
  if (!result) return <div className="empty-state"><FileCode2 size={34}/><h3>Your diff will appear here</h3><p>Paste two versions above and select Compare files.</p></div>
  const oldLines = original.split('\n'), newLines = modified.split('\n')
  const oldRows = [], newRows = []
  let oldIndex = 1, newIndex = 1
  result.blocks.forEach((block, idx) => {
    if (block.type === 'equal') {
      block.lines.forEach(line => { oldRows.push({ number: oldIndex++, text: line, type: 'equal' }); newRows.push({ number: newIndex++, text: line, type: 'equal' }) })
    } else if (block.type === 'delete') {
      block.lines.forEach(line => oldRows.push({ number: oldIndex++, text: line, type: 'delete' }))
      const next = result.blocks[idx + 1]
      if (next?.type === 'insert') {
        const pairs = block.paired_changes || []
        next.lines.forEach((line, j) => newRows.push({ number: newIndex++, text: line, type: 'insert', spans: pairs[j]?.new_spans || [] }))
      }
    } else if (block.type === 'insert') {
      const prev = result.blocks[idx - 1]
      if (prev?.type !== 'delete') block.lines.forEach(line => newRows.push({ number: newIndex++, text: line, type: 'insert' }))
    }
  })
  // When edit blocks differ in length, keep the panes independently aligned without losing lines.
  const maxRows = Math.max(oldRows.length, newRows.length)
  while (oldRows.length < maxRows) oldRows.push({ text: '', type: 'blank' })
  while (newRows.length < maxRows) newRows.push({ text: '', type: 'blank' })
  const patch = [
    `--- original`, `+++ modified`,
    ...result.blocks.flatMap(b => b.type === 'equal' ? b.lines.map(l => ` ${l}`) : b.type === 'delete' ? b.lines.map(l => `-${l}`) : b.lines.map(l => `+${l}`))
  ].join('\n')
  const download = () => { const blob = new Blob([patch], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'changes.diff'; a.click(); URL.revokeObjectURL(url) }
  return <section className="diff-card"><div className="diff-card-head"><div><span className="eyebrow">RESULT</span><h2>Comparison</h2></div><button className="button secondary small" onClick={download}><Download size={15}/> Export patch</button></div><div className="pane-heads"><div>Original <span>{original.split('\n').length} lines</span></div><div>Modified <span>{modified.split('\n').length} lines</span></div></div><div className="diff-panes"><div className="code-pane">{oldRows.map((r,i)=><Line key={i} {...r}/>)}</div><div className="code-pane">{newRows.map((r,i)=><Line key={i} {...r}/>)}</div></div></section>
}

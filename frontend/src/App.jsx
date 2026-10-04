import { useState } from 'react'
import { ArrowDownUp, Braces, Check, ChevronRight, CircleHelp, Code2, GitCompare, Github, LoaderCircle, RotateCcw, Upload, Zap } from 'lucide-react'
import { compareText, compareFiles } from './services/diffApi'
import Stats from './components/Stats'
import DiffViewer from './components/DiffViewer'

const sampleOld = `function greet(name) {\n  const port = 8000;\n  const message = "Hello " + name;\n  console.log(message);\n  return port;\n}`
const sampleNew = `function greet(name) {\n  const port = 8080;\n  const message = "Hi " + name;\n  console.log(message);\n  return port;\n}`

export default function App() {
  const [original, setOriginal] = useState(sampleOld)
  const [modified, setModified] = useState(sampleNew)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [characterDiff, setCharacterDiff] = useState(true)
  const [fileNames, setFileNames] = useState({ old: '', new: '' })

  async function runDiff() {
    setLoading(true); setError('')
    try { setResult(await compareText(original, modified, characterDiff)) }
    catch (e) { setError(`${e.message}. Is the backend running? Check VITE_API_URL.`) }
    finally { setLoading(false) }
  }
  async function handleFiles(event, side) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1_000_000) { setError('Each file must be 1 MB or smaller.'); return }
    try {
      const text = await file.text()
      if (side === 'old') { setOriginal(text); setFileNames(p => ({ ...p, old: file.name })) }
      else { setModified(text); setFileNames(p => ({ ...p, new: file.name })) }
      setError('')
    } catch { setError('Unable to read that file as text.') }
  }
  async function compareUploaded() {
    // Use backend file endpoint when both files have been selected; otherwise compare the editor content.
    const oldInput = document.getElementById('old-file')
    const newInput = document.getElementById('new-file')
    if (oldInput.files?.[0] && newInput.files?.[0]) {
      setLoading(true); setError('')
      try { setResult(await compareFiles(oldInput.files[0], newInput.files[0], characterDiff)) }
      catch (e) { setError(e.message) }
      finally { setLoading(false) }
    } else await runDiff()
  }
  function reset() { setOriginal(''); setModified(''); setResult(null); setError(''); setFileNames({old:'',new:''}); document.getElementById('old-file').value = ''; document.getElementById('new-file').value = '' }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-icon"><GitCompare size={21}/></span><span>Diff<span className="brand-accent">Lab</span></span><span className="version">BETA</span></a><nav><a href="#workspace">Workspace</a><a href="#how-it-works">How it works</a><a className="github-link" href="https://github.com" target="_blank" rel="noreferrer"><Github size={16}/> GitHub <ChevronRight size={14}/></a></nav></header>
    <main id="top" className="main-content"><section className="hero"><div className="hero-badge"><span className="live-dot"/> POWERED BY MYERS O(ND)</div><h1>Every change.<br/><span>Precisely compared.</span></h1><p className="hero-copy">A clean, minimal diff tool for code and text. Compare versions, inspect changes, and export a patch — all in one place.</p><div className="hero-features"><span><Zap size={15}/> Minimal edit script</span><span><Braces size={15}/> Character-level changes</span><span><Check size={15}/> Open source friendly</span></div></section>
    <section id="workspace" className="workspace"><div className="workspace-title"><div><span className="eyebrow">COMPARE WORKSPACE</span><h2>Put your changes side by side</h2></div><button className="button ghost" onClick={reset}><RotateCcw size={15}/> Clear all</button></div>
    <div className="editors"><div className="editor-card"><div className="editor-head"><div className="file-label"><span className="file-dot old-dot"/><div><strong>Original</strong><small>{fileNames.old || 'Original version'}</small></div></div><label className="upload-button" htmlFor="old-file"><Upload size={14}/> Upload<input id="old-file" type="file" accept=".txt,.py,.java,.js,.jsx,.ts,.tsx,.json,.html,.css,.md,.csv,.xml,.yml,.yaml,.sh,.sql" onChange={e=>handleFiles(e,'old')}/></label></div><textarea spellCheck="false" aria-label="Original text" value={original} onChange={e=>setOriginal(e.target.value)} placeholder="Paste your original text here..."/><div className="editor-foot"><span>{original.split('\n').length} lines</span><span>{original.length.toLocaleString()} characters</span></div></div>
    <div className="swap-icon"><ArrowDownUp size={17}/></div>
    <div className="editor-card"><div className="editor-head"><div className="file-label"><span className="file-dot new-dot"/><div><strong>Modified</strong><small>{fileNames.new || 'Updated version'}</small></div></div><label className="upload-button" htmlFor="new-file"><Upload size={14}/> Upload<input id="new-file" type="file" accept=".txt,.py,.java,.js,.jsx,.ts,.tsx,.json,.html,.css,.md,.csv,.xml,.yml,.yaml,.sh,.sql" onChange={e=>handleFiles(e,'new')}/></label></div><textarea spellCheck="false" aria-label="Modified text" value={modified} onChange={e=>setModified(e.target.value)} placeholder="Paste your modified text here..."/><div className="editor-foot"><span>{modified.split('\n').length} lines</span><span>{modified.length.toLocaleString()} characters</span></div></div></div>
    <div className="compare-controls"><label className="toggle-label"><input type="checkbox" checked={characterDiff} onChange={e=>setCharacterDiff(e.target.checked)}/><span className="toggle-track"/><span>Character-level highlighting</span><span className="hint" title="Highlights changed characters within changed lines"><CircleHelp size={14}/></span></label><button className="button primary" onClick={compareUploaded} disabled={loading}>{loading ? <LoaderCircle className="spin" size={17}/> : <GitCompare size={17}/>} {loading ? 'Comparing…' : 'Compare files'}</button></div>
    {error && <div className="error-message">{error}</div>}
    {result && <Stats stats={result.stats} identical={result.identical}/>}
    <DiffViewer result={result} original={original} modified={modified}/>
    </section>
    <section id="how-it-works" className="how-section"><div><span className="eyebrow">UNDER THE HOOD</span><h2>Simple interface. Serious algorithm.</h2><p>DiffLab uses the Myers shortest edit script algorithm to find a minimal sequence of insertions and deletions, then displays the changes in a readable, side-by-side view.</p></div><div className="how-cards"><article><span className="how-icon"><Code2 size={19}/></span><h3>Minimal changes</h3><p>Finds a shortest edit script rather than relying on line-by-line guessing.</p></article><article><span className="how-icon"><Braces size={19}/></span><h3>Fine-grained view</h3><p>Inspect changed lines and character spans to spot small differences.</p></article><article><span className="how-icon"><Upload size={19}/></span><h3>Local-first workflow</h3><p>Compare pasted text or upload UTF-8 source files up to 1 MB each.</p></article></div></section>
    </main><footer><a className="brand footer-brand" href="#top"><span className="brand-icon"><GitCompare size={18}/></span><span>Diff<span className="brand-accent">Lab</span></span></a><span>Built for clarity, powered by Myers O(ND).</span><a href="#how-it-works">How it works ↑</a></footer>
  </div>
}

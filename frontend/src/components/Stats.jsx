import { Check, FileMinus, FilePlus, GitCompare } from 'lucide-react'
export default function Stats({ stats, identical }) {
  const items = [
    { label: 'Added', value: stats.added, icon: FilePlus, cls: 'green' },
    { label: 'Deleted', value: stats.deleted, icon: FileMinus, cls: 'red' },
    { label: 'Unchanged', value: stats.unchanged, icon: Check, cls: 'muted' },
  ]
  return <div className="stats-row">{items.map(item => <div className="stat" key={item.label}><item.icon size={17} className={item.cls}/><span className="stat-value">{item.value}</span><span className="stat-label">{item.label}</span></div>)}<div className="status-pill"><GitCompare size={15}/>{identical ? 'Files are identical' : 'Changes detected'}</div></div>
}

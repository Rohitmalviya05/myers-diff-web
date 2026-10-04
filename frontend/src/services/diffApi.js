const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export async function compareText(original, modified, characterDiff = true) {
  const response = await fetch(`${API_URL}/api/diff`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ original, modified, character_diff: characterDiff })
  })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try { message = (await response.json()).detail || message } catch {}
    throw new Error(message)
  }
  return response.json()
}

export async function compareFiles(originalFile, modifiedFile, characterDiff = true) {
  const form = new FormData()
  form.append('original', originalFile); form.append('modified', modifiedFile)
  form.append('character_diff', String(characterDiff))
  const response = await fetch(`${API_URL}/api/diff/files`, { method: 'POST', body: form })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try { message = (await response.json()).detail || message } catch {}
    throw new Error(message)
  }
  return response.json()
}

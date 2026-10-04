# DiffLab — Myers Diff Web App

A full-stack text/source-code comparison application. The Python FastAPI backend computes a minimal edit script using the Myers O(ND) algorithm. The React/Vite frontend provides two editors, text file upload, change statistics, character-span highlighting, and patch export.

## Requirements
- Python 3.10+
- Node.js 18+

## Run locally

### 1. Start the backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Health check: http://localhost:8000/health

### 2. Start the frontend in a second terminal

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173). By default, the frontend calls `http://localhost:8000`. To use a different API URL, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:8000
```

Restart Vite after changing environment variables.

## API

### `POST /api/diff`

```json
{
  "original": "port = 8000\n",
  "modified": "port = 8080\n",
  "character_diff": true
}
```

Returns grouped line operations (`equal`, `delete`, `insert`), added/deleted/unchanged line counts, and character change spans for adjacent delete/insert blocks. API text fields are limited to 500,000 characters each.

### `POST /api/diff/files`

Multipart fields: `original`, `modified` (UTF-8 text files, max 1 MB each), and optional `character_diff`.

## Deploy to Render

This repository includes `render.yaml` as a Blueprint starting point.

1. Push the project to a GitHub repository.
2. In Render, create a **Blueprint** and select the repository. Render will read `render.yaml` and create the API and frontend services.
3. After the backend deploys, copy its public URL, such as `https://myers-diff-api.onrender.com`.
4. Open the frontend Static Site settings and set `VITE_API_URL` to the backend public URL (no trailing slash), then trigger a new deploy.
5. Test the API's `/health` endpoint and the frontend comparison workspace.

If you create services manually instead, configure the backend root directory as `backend`, build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, and health check `/health`. Configure the frontend root directory as `frontend`, build command `npm install && npm run build`, publish directory `dist`, and environment variable `VITE_API_URL` with the backend URL.

**CORS note:** The starter backend allows cross-origin requests so the frontend works immediately. Before production use, consider restricting `allow_origins` in `backend/app/main.py` to the exact deployed frontend domain.

## Tests

From `backend/`:

```bash
python -m unittest discover -s tests -v
```

## Limitations / notes
- Supports text files encoded as UTF-8; binary files are not supported.
- File upload endpoint limits each file to 1 MB; text API inputs are capped at 500,000 characters each.
- Myers computes a shortest edit script. When multiple equally minimal scripts exist, the chosen alignment may differ from other diff tools.
- This is a starter project; review and harden rate limits, file handling, and CORS before production use.

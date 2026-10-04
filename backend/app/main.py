from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.diff import router

app = FastAPI(title='Myers Diff API', version='1.0.0', description='Minimal line diff and character-level change spans using Myers O(ND).')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # Restrict to your deployed frontend domain for production.
    allow_credentials=False,
    allow_methods=['GET', 'POST', 'OPTIONS'],
    allow_headers=['*'],
)
app.include_router(router)

@app.get('/')
def root():
    return {'name': 'Myers Diff API', 'docs': '/docs', 'health': '/health'}

@app.get('/health')
def health():
    return {'status': 'ok'}
